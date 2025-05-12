
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { otpService } from '@/services/otpService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useOTP = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Get all OTPs
  const getOTPs = (page = currentPage) => {
    return useQuery({
      queryKey: ['otps', page],
      queryFn: () => accessToken ? otpService.getOTPs(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };

  // Get specific OTP
  const getOTP = (id: string) => {
    return useQuery({
      queryKey: ['otp', id],
      queryFn: () => accessToken ? otpService.getOTP(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Delete OTP
  const deleteOTP = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return otpService.deleteOTP(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "OTP deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['otps'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete OTP",
        variant: "destructive",
      });
    }
  });

  // Send OTP
  const sendOTP = useMutation({
    mutationFn: (type: 'email' | 'phone' | 'two_factor') => {
      if (!accessToken) return Promise.reject('No access token');
      return otpService.sendOTP(accessToken, type);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "OTP sent successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['otps'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
  });

  // Verify OTP
  const verifyOTP = useMutation({
    mutationFn: (params: { otp: string; type: 'email' | 'phone' | 'two_factor' }) => {
      if (!accessToken) return Promise.reject('No access token');
      return otpService.verifyOTP(accessToken, params.otp, params.type);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "OTP verified successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['otps'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to verify OTP",
        variant: "destructive",
      });
    }
  });

  return {
    getOTPs,
    getOTP,
    deleteOTP: deleteOTP.mutate,
    sendOTP: sendOTP.mutate,
    verifyOTP: verifyOTP.mutate,
    isDeletingOTP: deleteOTP.isPending,
    isSendingOTP: sendOTP.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    currentPage,
    setCurrentPage
  };
};
