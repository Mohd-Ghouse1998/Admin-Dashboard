import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { remoteOperationsApi } from '@/modules/chargers/services/remoteOperationsService';
import { chargerApi } from '@/modules/chargers/services/chargerService';

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  messageType: z.enum([
    'BootNotification', 
    'StatusNotification', 
    'Heartbeat', 
    'MeterValues', 
    'FirmwareStatusNotification'
  ], { required_error: "Message type is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const TriggerMessagePage = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // State for selected charger
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);

  // Fetch chargers
  const {
    data: chargers,
    isLoading: chargersLoading,
    error: chargersError,
  } = useQuery({
    queryKey: ['chargers'],
    queryFn: async () => {
      const result = await chargerApi.getChargers(accessToken);
      console.log('Chargers API response (TriggerMessagePage):', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      messageType: undefined,
    },
  });
  
  // Trigger message mutation
  const triggerMessageMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return remoteOperationsApi.triggerMessage(accessToken, {
        chargerId: values.chargerId,
        messageType: values.messageType,
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.status === 'Accepted' ? "Success" : "Operation Rejected",
        description: data.message,
        variant: data.status === 'Accepted' ? "default" : "destructive",
      });
      
      if (data.status === 'Accepted') {
        form.reset();
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to trigger message. Please try again.",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    triggerMessageMutation.mutate(values);
  };
  
  return (
    <PageLayout
      title="Trigger Diagnostic Message"
      description="Trigger a diagnostic message from a charger"
    >
      <Helmet>
        <title>Trigger Diagnostic Message | Electric Flow Admin</title>
      </Helmet>
      
      {chargersError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {chargersError instanceof Error ? chargersError.message : 'Failed to load chargers'}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Trigger Diagnostic Message</CardTitle>
          <CardDescription>
            Request the charger to send a specific diagnostic message to the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="chargerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          console.log('Charger selected:', value);
                          setSelectedChargerId(value);
                          field.onChange(value);
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a charger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chargersLoading ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : (
                            // Handle nested GeoJSON format in results
                            chargers?.results?.features?.map((charger, index) => {
                              const chargerId = charger.properties?.charger_id || `charger-${index}`;
                              return (
                                <SelectItem 
                                  key={`charger-${index}-${chargerId}`} 
                                  value={chargerId}
                                >
                                  {`${charger.properties?.name || chargerId}`}
                                </SelectItem>
                              );
                            }) || []
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select message type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BootNotification">Boot Notification</SelectItem>
                          <SelectItem value="StatusNotification">Status Notification</SelectItem>
                          <SelectItem value="Heartbeat">Heartbeat</SelectItem>
                          <SelectItem value="MeterValues">Meter Values</SelectItem>
                          <SelectItem value="FirmwareStatusNotification">Firmware Status</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 p-4 border rounded-md bg-blue-50 border-blue-200 text-blue-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Message Types</h4>
                    <p className="text-sm mt-1"><strong>Boot Notification:</strong> Simulates a charger restart</p>
                    <p className="text-sm mt-1"><strong>Status Notification:</strong> Gets the current connector status</p>
                    <p className="text-sm mt-1"><strong>Heartbeat:</strong> Tests the connectivity</p>
                    <p className="text-sm mt-1"><strong>Meter Values:</strong> Gets the latest meter readings</p>
                    <p className="text-sm mt-1"><strong>Firmware Status:</strong> Gets firmware update status</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={triggerMessageMutation.isPending}
                  className="ml-auto"
                >
                  {triggerMessageMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Trigger Message
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

export default TriggerMessagePage;
