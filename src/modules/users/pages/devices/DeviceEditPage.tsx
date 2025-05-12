import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import FormSection from '@/components/common/FormSection';

// Mock service for devices - replace with actual service when available
const deviceService = {
  getDeviceById: async (accessToken: string, id: string) => {
    // This would be replaced with an actual API call
    return {
      id,
      user: { id: '1', username: 'user1', email: 'user1@example.com' },
      user_id: '1',
      device_id: 'device_id_123456789',
      registration_id: 'reg_token_abcdefghijklmnopqrstuvwxyz0123456789',
      device_type: 'ANDROID',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      is_active: true,
      device_model: 'Google Pixel 6',
      os_version: 'Android 14',
      app_version: '1.5.2'
    };
  },
  updateDevice: async (accessToken: string, id: string, data: any) => {
    // This would be replaced with an actual API call
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }
};

// Define device type options
const deviceTypeOptions = [
  { value: 'ANDROID', label: 'Android' },
  { value: 'IOS', label: 'iOS' },
];

// Form schema for device editing
const formSchema = z.object({
  user_id: z.string({
    required_error: 'User is required',
  }),
  device_id: z.string().min(5, 'Device ID must be at least 5 characters'),
  registration_id: z.string().min(5, 'Registration ID must be at least 5 characters'),
  device_type: z.enum(['ANDROID', 'IOS'], {
    required_error: 'Device type is required',
  }),
  device_model: z.string().optional(),
  os_version: z.string().optional(),
  app_version: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const DeviceEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      device_id: '',
      registration_id: '',
      device_type: 'ANDROID',
      device_model: '',
      os_version: '',
      app_version: '',
      is_active: true,
    },
  });

  // Fetch device data
  const {
    data: device,
    isLoading: isLoadingDevice,
    error: deviceError
  } = useQuery({
    queryKey: ['device', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or device ID available');
      }
      return deviceService.getDeviceById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  // Fetch users for dropdown
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return userService.getUsers(accessToken);
    },
    enabled: !!accessToken,
  });

  // Update form when device data is loaded
  useEffect(() => {
    if (device) {
      form.reset({
        user_id: device.user_id,
        device_id: device.device_id,
        registration_id: device.registration_id,
        device_type: device.device_type,
        device_model: device.device_model || '',
        os_version: device.os_version || '',
        app_version: device.app_version || '',
        is_active: device.is_active,
      });
    }
  }, [device, form]);

  // Update device mutation
  const updateDeviceMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!id) throw new Error('No device ID available');
      return deviceService.updateDevice(accessToken, id, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Device updated successfully',
        variant: 'success',
      });
      navigate(`/users/devices/${id}`);
    },
    onError: (error) => {
      console.error('Error updating device:', error);
      toast({
        title: 'Error',
        description: 'Failed to update device',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    updateDeviceMutation.mutate(values);
  };

  // Generate random registration ID
  const generateRegistrationId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 64; // Typical Firebase token length
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('registration_id', result);
  };

  if (isLoadingDevice) {
    return (
      <PageLayout title="Edit Device" description="Loading device information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (deviceError || !device) {
    return (
      <PageLayout title="Error" description="Failed to load device details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {deviceError instanceof Error ? deviceError.message : 'Failed to load device details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Device"
      description={`Edit device registration for ${device.device_id.substring(0, 12)}...`}
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Devices', url: '/users/devices' },
        { label: `Device ${id}`, url: `/users/devices/${id}` },
        { label: 'Edit' }
      ]}
    >
      <Helmet>
        <title>Edit Device | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Device</CardTitle>
          <CardDescription>Update device registration details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="User Information" description="Device owner">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select
                        disabled={isLoadingUsers}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingUsers ? (
                            <SelectItem value="loading" disabled>Loading users...</SelectItem>
                          ) : users?.results ? (
                            users.results.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.username || user.email}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No users available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Device Information" description="Details about the device">
                <FormField
                  control={form.control}
                  name="device_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device ID</FormLabel>
                      <FormControl>
                        <Input placeholder="device_id_123456" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the device
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-2 items-end">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="registration_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Firebase registration token" {...field} />
                          </FormControl>
                          <FormDescription>
                            Push notification registration token
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateRegistrationId}
                    className="mb-[2px]"
                  >
                    Generate New
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="device_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deviceTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Additional Information" description="Optional device details">
                <FormField
                  control={form.control}
                  name="device_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Google Pixel 6" {...field} />
                      </FormControl>
                      <FormDescription>
                        The model of the device (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="os_version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OS Version</FormLabel>
                        <FormControl>
                          <Input placeholder="Android 14" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="app_version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.5.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this device
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/users/devices/${id}`)}
                  disabled={updateDeviceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateDeviceMutation.isPending}
                >
                  {updateDeviceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Device
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default DeviceEditPage;
