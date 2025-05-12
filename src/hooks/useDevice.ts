
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { deviceService } from '@/services/deviceService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useDevice = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get all devices with filters
  const getDevices = (page = currentPage) => {
    return useQuery({
      queryKey: ['devices', page, searchQuery, statusFilter, typeFilter],
      queryFn: () => {
        if (!accessToken) return Promise.reject('No access token');
        
        // Create params object for filtering
        const params = {
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined
        };
        
        // Pass only the required arguments to getDevices
        return deviceService.getDevices(accessToken, page);
      },
      enabled: !!accessToken,
    });
  };

  // Get specific device
  const getDevice = (id: string) => {
    return useQuery({
      queryKey: ['device', id],
      queryFn: () => accessToken ? deviceService.getDevice(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Create device
  const createDevice = useMutation({
    mutationFn: (deviceData: any) => {
      if (!accessToken) return Promise.reject('No access token');
      return deviceService.createDevice(accessToken, deviceData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create device",
        variant: "destructive",
      });
    }
  });

  // Update device
  const updateDevice = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => {
      if (!accessToken) return Promise.reject('No access token');
      return deviceService.updateDevice(accessToken, id, data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Device updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', variables.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update device",
        variant: "destructive",
      });
    }
  });

  // Delete device
  const deleteDevice = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return deviceService.deleteDevice(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete device",
        variant: "destructive",
      });
    }
  });

  return {
    getDevices,
    getDevice,
    createDevice: createDevice.mutate,
    updateDevice: updateDevice.mutate,
    deleteDevice: deleteDevice.mutate,
    isCreatingDevice: createDevice.isPending,
    isUpdatingDevice: updateDevice.isPending,
    isDeletingDevice: deleteDevice.isPending,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter
  };
};
