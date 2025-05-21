import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, QrCode, ShieldAlert, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreateTemplate, CreateSectionHeader } from '@/components/templates/create/CreateTemplate';
import { FormSection, FormGroup, FormRow } from '@/components/templates/create/CreateForm';
import { deviceService } from '@/modules/users/services/deviceService';

// Define device type options
const deviceTypeOptions = [
  { value: 'ANDROID', label: 'Android' },
  { value: 'IOS', label: 'iOS' },
];

// Form schema for device creation with conditional validation
const formSchema = z.object({
  device_id: z.string().min(5, 'Device ID must be at least 5 characters'),
  device_type: z.enum(['ANDROID', 'IOS'], {
    required_error: 'Device type is required',
  }),
  registration_id: z.string()
    .min(1, 'Registration ID is required'),
  // We'll handle the conditional validation in the form itself since it's easier to access form values
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
      device_id: '',
      registration_id: '',
      device_type: 'ANDROID',
      is_active: true,
    },
  });

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!accessToken) throw new Error('No access token available');
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

  // Form submission handler with additional client-side validation
  const onSubmit = (values: FormValues) => {
    // For iOS devices, validate that registration_id is a valid hexadecimal string
    if (values.device_type === 'IOS') {
      const isValidHex = /^[0-9a-fA-F]+$/.test(values.registration_id);
      if (!isValidHex) {
        form.setError('registration_id', { 
          type: 'manual', 
          message: 'Registration ID for iOS devices must be a valid hexadecimal string' 
        });
        return;
      }
    }
    
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
    const prefix = 'dev_';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    const length = 10;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('device_id', result);
  };

  return (
    <CreateTemplate
      title="Register Device"
      description="Add a new mobile device to your account"
      entityName="Device"
      icon={<Smartphone className="h-5 w-5" />}
      backPath="/users/devices"
      isSubmitting={createDeviceMutation.isPending}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)(e);
      }}
    >
      <Form {...form}>
        <Card className="overflow-hidden border-primary/10">
          <CreateSectionHeader
            title="Device Information"
            description="Enter the device details for registration"
            icon={<Zap className="h-4 w-4" />}
          />
          <CardContent className="p-5 pt-6">
            <FormField
              control={form.control}
              name="device_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="Device unique identifier" {...field} />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateDeviceId}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>
                    A unique identifier for the device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="registration_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration ID</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="Device registration token" {...field} />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateRegistrationId}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>
                    The device registration token (e.g., Firebase token)
                    {form.getValues('device_type') === 'IOS' && (
                      <span className="block text-xs text-amber-600 mt-1">
                        For iOS devices, this must be a valid hexadecimal string
                      </span>
                    )}
                  </FormDescription>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
          </CardContent>
        </Card>
      </Form>
    </CreateTemplate>
  );
};

export default DeviceCreatePage;
