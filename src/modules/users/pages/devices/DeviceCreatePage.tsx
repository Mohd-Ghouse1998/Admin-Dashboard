import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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
import { Loader2, Save } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import FormSection from '@/components/common/FormSection';

// Mock service for devices - replace with actual service when available
const deviceService = {
  createDevice: async (accessToken: string, data: any) => {
    // This would be replaced with an actual API call
    return {
      id: 'new-id',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

// Define device type options
const deviceTypeOptions = [
  { value: 'ANDROID', label: 'Android' },
  { value: 'IOS', label: 'iOS' },
];

// Form schema for device creation
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

const DeviceCreatePage = () => {
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

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return deviceService.createDevice(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Device registered successfully',
        variant: 'success',
      });
      navigate('/users/devices');
    },
    onError: (error) => {
      console.error('Error creating device:', error);
      toast({
        title: 'Error',
        description: 'Failed to register device',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    createDeviceMutation.mutate(values);
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

  // Generate random device ID
  const generateDeviceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 16; // Typical device ID length
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('device_id', result);
  };

  return (
    <PageLayout
      title="Register Device"
      description="Register a new user device"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Devices', url: '/users/devices' },
        { label: 'Register Device' }
      ]}
    >
      <Helmet>
        <title>Register Device | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Register Device</CardTitle>
          <CardDescription>Create a new device registration for a user</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="User Information" description="Select the user for this device">
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
                <div className="flex space-x-2 items-end">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="device_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="device_id_123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateDeviceId}
                    className="mb-[2px]"
                  >
                    Generate
                  </Button>
                </div>
                
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
                    Generate
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
                  onClick={() => navigate('/users/devices')}
                  disabled={createDeviceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDeviceMutation.isPending}
                >
                  {createDeviceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Register Device
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

export default DeviceCreatePage;
