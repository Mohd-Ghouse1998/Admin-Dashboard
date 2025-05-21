import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Smartphone, 
  Tablet, 
  Save,
  RefreshCw,
  AlertTriangle,
  User as UserIcon,
  Settings,
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditTemplate } from '@/components/templates/edit/EditTemplate';
import { userService } from '@/modules/users/services/userService';
import { deviceService } from '@/modules/users/services/deviceService';

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

const DeviceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'changed' | 'saving' | 'saved'>('idle');
  
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
    isLoading,
    error
  } = useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      if (!accessToken || !id) {
        throw new Error('No access token or device ID available');
      }
      return deviceService.getDevice(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  // Fetch users for dropdown
  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const response = await userService.getUsers(accessToken);
      return response.data || [];
    },
    enabled: !!accessToken,
  });

  // Set form defaults when device data loads
  useEffect(() => {
    if (device) {
      form.reset({
        user_id: device.user?.id || '',
        device_id: device.device_id || '',
        registration_id: device.registration_id || '',
        device_type: (device.device_type as 'ANDROID' | 'IOS') || 'ANDROID',
        device_model: device.device_model || '',
        os_version: device.os_version || '',
        app_version: device.app_version || '',
        is_active: typeof device.is_active === 'boolean' ? device.is_active : true,
      });
    }
  }, [device, form]);
  
  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormStatus('changed');
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Generate random registration ID
  const generateRegistrationId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Mutation for updating device
  // Import Device type from deviceService.ts
  type DeviceUpdatePayload = {
    user_id: string;
    device_id: string;
    registration_id: string;
    device_type: 'ANDROID' | 'IOS';
    device_model?: string;
    os_version?: string;
    app_version?: string;
    is_active: boolean;
  };

  const updateDeviceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!accessToken || !id) return null;
      setFormStatus('saving');
      // Convert form data to the API expected format
      const deviceData: DeviceUpdatePayload = {
        user_id: data.user_id,
        device_id: data.device_id,
        registration_id: data.registration_id,
        device_type: data.device_type,
        device_model: data.device_model,
        os_version: data.os_version,
        app_version: data.app_version,
        is_active: data.is_active
      };
      return deviceService.updateDevice(accessToken, id, deviceData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Device updated successfully',
      });
      setFormStatus('saved');
      setTimeout(() => setFormStatus('idle'), 2000);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update device',
      });
      setFormStatus('idle');
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    updateDeviceMutation.mutate(values);
  };
  
  // Function to reset registration ID
  const handleResetRegistrationId = () => {
    const newRegistrationId = generateRegistrationId();
    form.setValue('registration_id', newRegistrationId);
    setIsResetDialogOpen(false);
    toast({
      title: 'Registration ID reset',
      description: 'A new registration ID has been generated',
    });
    setFormStatus('changed');
  };
  
  // Get form status indicator
  const getFormStatusIndicator = () => {
    switch (formStatus) {
      case 'idle':
        return null;
      case 'changed':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Unsaved Changes
          </Badge>
        );
      case 'saving':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </Badge>
        );
      case 'saved':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            All changes saved
          </Badge>
        );
    }
  };

  return (
    <>
      <EditTemplate
        title="Edit Device"
        description="Update device information"
        icon={device?.device_type === 'ANDROID' ? 
          <Smartphone className="h-5 w-5" /> : 
          <Tablet className="h-5 w-5" />}
        backPath={`/users/devices/${id}`}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        isSubmitting={updateDeviceMutation.isPending}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Associated User Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Associated User
                </CardTitle>
                <CardDescription>User who owns this device</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingUsers}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!isLoadingUsers && usersData && Array.isArray(usersData) && usersData.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>The user who owns this device</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Device Information Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Information
                </CardTitle>
                <CardDescription>Basic device information and identifiers</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="device_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Unique identifier for this device</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registration_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Token</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <Input className="rounded-r-none font-mono text-sm" {...field} />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="secondary"
                            className="rounded-l-none"
                            onClick={() => setIsResetDialogOpen(true)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>Device registration token used for authentication</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="device_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>
              </CardContent>
            </Card>

            {/* Additional Details Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>Optional device details and specifications</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="device_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Google Pixel 6, iPhone 14, etc." {...field} />
                      </FormControl>
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
                          <Input placeholder="Android 14, iOS 16, etc." {...field} />
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          {field.value ? 'Device is active and allowed to connect' : 'Device is disabled and cannot connect'}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            

            

          </form>
        </Form>
      </EditTemplate>
      
      {/* Reset Registration Token Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Registration Token?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new registration token for this device. The old token will no longer work and the device will need to be re-authenticated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetRegistrationId} className="bg-destructive text-destructive-foreground">
              Reset Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeviceEditPage;
