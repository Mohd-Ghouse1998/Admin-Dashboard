import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertCircle, 
  Edit, 
  User, 
  Smartphone, 
  Tablet, 
  Calendar,
  Copy
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Real device service using API
import { userApi, apiService } from '@/services/api';

// Define device interface
interface Device {
  id: number;
  device_id: string;
  registration_id: string;
  device_type: string;
}

const deviceService = {
  getDeviceById: async (accessToken: string, id: number) => {
    try {
      console.log(`Fetching device with ID: ${id}`);
      // Convert the numeric id to string as required by the API
      const deviceId = id.toString();
      const response = await userApi.getDevice(deviceId, accessToken);
      console.log('Device details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching device ${id}:`, error);
      throw error;
    }
  },
  deactivateDevice: async (accessToken: string, id: number) => {
    try {
      // In a real implementation, this would be a PUT or PATCH request
      // Since there's no actual deactivate endpoint in the API sample, we're simulating it
      const deviceId = id.toString();
      const response = await apiService.put(`/users/devices/${deviceId}/`, {
        is_active: false
      }, accessToken);
      return response;
    } catch (error) {
      console.error(`Error deactivating device ${id}:`, error);
      throw error;
    }
  }
};

const DeviceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  
  // Fetch device data
  const {
    data: device,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['device', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or device ID available');
      }
      // Convert string id to number
      const numericId = parseInt(id, 10);
      return deviceService.getDeviceById(accessToken, numericId);
    },
    enabled: !!accessToken && !!id,
  });

  // Deactivate device mutation
  const deactivateDeviceMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or device ID available');
      }
      // Convert string id to number
      const numericId = parseInt(id, 10);
      return deviceService.deactivateDevice(accessToken, numericId);
    },
    onSuccess: () => {
      toast({
        title: 'Device Deactivated',
        description: 'Device has been successfully deactivated',
        variant: 'success',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to deactivate device: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Handle copying registration ID to clipboard
  const handleCopyRegistrationId = () => {
    if (device?.registration_id) {
      navigator.clipboard.writeText(device.registration_id);
      toast({
        title: 'Copied',
        description: 'Registration ID copied to clipboard',
        variant: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Device Details" description="Loading device information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !device) {
    return (
      <PageLayout title="Error" description="Failed to load device details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load device details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Device Details"
      description="View device information and manage registration"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/users/devices/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Device
            </Link>
          </Button>
          <Button 
            variant="destructive"
            onClick={() => deactivateDeviceMutation.mutate()}
            disabled={deactivateDeviceMutation.isPending}
          >
            {deactivateDeviceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deactivating...
              </>
            ) : (
              'Deactivate Device'
            )}
          </Button>
        </div>
      }
    >
      <Helmet>
        <title>Device Details | Admin Dashboard</title>
      </Helmet>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Details about the device and registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              {device.device_type === 'ANDROID' ? (
                <Smartphone className="h-8 w-8 text-primary" />
              ) : (
                <Tablet className="h-8 w-8 text-primary" />
              )}
              <div>
                <h3 className="text-lg font-medium">{device.device_type} Device</h3>
                <p className="text-sm text-muted-foreground">
                  Registered via Mobile App
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Device ID</h3>
              <p className="mt-1 font-mono text-sm break-all">{device.device_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Registration ID</h3>
              <div className="mt-1 flex items-center">
                <div className="font-mono text-sm break-all pr-2 relative">
                  {device.registration_id}
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopyRegistrationId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Device Type</h3>
              <div className="mt-1 flex items-center">
                {device.device_type === 'ANDROID' ? (
                  <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Tablet className="h-4 w-4 mr-2 text-blue-500" />
                )}
                {device.device_type}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DeviceDetailPage;
