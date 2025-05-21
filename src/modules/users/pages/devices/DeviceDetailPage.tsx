import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailTemplate, DetailSection } from '@/components/templates/detail/DetailTemplate';
import { 
  Smartphone, 
  Tablet, 
  Calendar,
  Copy,
  Wifi,
  Activity,
  Settings,
  Power,
  InfoIcon,
  ShieldAlert,
  User as UserIcon,
  ClipboardCheck,
  Check,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { deviceService } from '@/modules/users/services/deviceService';

// Extend Device type with any missing properties that we're using
interface Device {
  id?: string;
  device_id?: string;
  device_type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // Query to fetch device details
  const { data: device, isLoading, error } = useQuery<Device>({
    queryKey: ['device', id],
    queryFn: async () => {
      if (!id || !accessToken) return null;
      return deviceService.getDevice(accessToken, id);
    },
    enabled: !!id && !!accessToken,
  });
  
  // Mutation to update device active status
  const deactivateDeviceMutation = useMutation<void, Error>({
    mutationFn: async () => {
      if (!id || !accessToken) return;
      // Use updateDevice method to toggle is_active state
      return deviceService.updateDevice(accessToken, id, { 
        is_active: !device?.is_active 
      });
    },
    onSuccess: () => {
      toast({
        title: device?.is_active ? "Device deactivated" : "Device activated",
        description: `The device has been ${device?.is_active ? 'deactivated' : 'activated'} successfully.`,
      });
      // Refresh the device data
      window.location.reload();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update device status",
      });
    },
  });
  
  // Handler to copy device ID to clipboard
  const handleCopyDeviceId = () => {
    if (device?.device_id) {
      navigator.clipboard.writeText(device.device_id);
      toast({
        title: "Copied to clipboard",
        description: "Device ID has been copied to your clipboard.",
      });
    }
  };
  
  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5"><Power className="h-3.5 w-3.5" />Active</Badge>
    } else if (status === 'Inactive') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1.5"><Power className="h-3.5 w-3.5" />Inactive</Badge>
    } else if (status === 'ANDROID') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" />Android</Badge>
    } else if (status === 'IOS') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1.5"><Tablet className="h-3.5 w-3.5" />iOS</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1.5">{status}</Badge>
    }
  };

  // Define tabs for the device detail page
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: <InfoIcon className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Basic Device Information Section */}
          <DetailSection 
            title="Device Information"
            icon={<Smartphone className="h-5 w-5" />}
            description="Basic information about this device"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Device ID</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    {device?.device_id}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleCopyDeviceId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Associated User</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {device?.user?.username || 'Unknown'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{device?.user?.email || ''}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Device Type</span>
                <span className="font-medium flex items-center gap-2">
                  {device?.device_type === 'ANDROID' ? (
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Tablet className="h-4 w-4 text-muted-foreground" />
                  )}
                  {device?.device_type}
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                {getStatusBadge(device?.is_active ? 'Active' : 'Inactive')}
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Created Date</span>
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(device?.created_at || '')}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(device?.updated_at || '')}
                </span>
              </div>
            </div>
          </DetailSection>
          
          {/* Registration Information Section */}
          <DetailSection 
            title="Registration Information"
            icon={<ClipboardCheck className="h-5 w-5" />}
            description="Device registration details"
          >
            <div className="grid grid-cols-1 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Registration ID</span>
                <div className="relative">
                  <div className="p-3 rounded bg-gray-50 border border-gray-100 font-mono text-sm overflow-x-auto">
                    {device?.device_id}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={handleCopyDeviceId}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Verification Status</span>
                <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              </div>
            </div>
          </DetailSection>
        </div>
      )
    },
    {
      value: "sessions",
      label: "Sessions",
      icon: <Activity className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <DetailSection 
            title="Recent Sessions" 
            icon={<Activity className="h-5 w-5" />}
            description="Recent device activity"
          >
            <div className="p-6">
              <div className="rounded-lg border border-border p-6 flex items-center justify-center text-muted-foreground">
                No recent sessions found
              </div>
            </div>
          </DetailSection>
        </div>
      )
    },
    {
      value: "diagnostics",
      label: "Diagnostics",
      icon: <Wifi className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <DetailSection 
            title="Connection Status" 
            icon={<Wifi className="h-5 w-5" />}
            description="Network and connectivity information"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Last Connected</span>
                <span className="font-medium">2 days ago</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Signal Strength</span>
                <span className="font-medium">Strong</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Battery Level</span>
                <span className="font-medium">78%</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">App Version</span>
                <span className="font-medium">2.1.4</span>
              </div>
            </div>
          </DetailSection>
          
          <DetailSection 
            title="System Information" 
            icon={<Settings className="h-5 w-5" />}
            description="Device system details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Operating System</span>
                <span className="font-medium">{device?.device_type === 'ANDROID' ? 'Android 13' : 'iOS 16.5'}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Device Model</span>
                <span className="font-medium">{device?.device_type === 'ANDROID' ? 'Samsung Galaxy S22' : 'iPhone 14'}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Network Type</span>
                <span className="font-medium">WiFi</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Last Update Check</span>
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  May 12, 2025
                </span>
              </div>
            </div>
          </DetailSection>
        </div>
      )
    }
  ];

  return (
    <DetailTemplate
      title={device?.device_id || `Device ${id}`}
      subtitle={device?.device_type || 'Unknown'}
      description={`Mobile device registered to ${device?.user?.username || 'unknown user'}`}
      icon={device?.device_type === 'ANDROID' ? 
        <Smartphone className="h-5 w-5" /> : 
        <Tablet className="h-5 w-5" />}
      backPath="/users/devices"
      isLoading={isLoading}
      error={error}
      editPath={`/users/devices/${id}/edit`}
      tabs={tabs}
      defaultTab="overview"
      actions={[
        {
          label: device?.is_active ? 'Deactivate' : 'Activate',
          onClick: () => deactivateDeviceMutation.mutate(),
          variant: device?.is_active ? 'destructive' : 'default',
          icon: <Power className="h-4 w-4" />
        }
      ]}
    />
  );
};

export default DeviceDetailPage;
