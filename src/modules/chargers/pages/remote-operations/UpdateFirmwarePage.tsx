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
import { AlertCircle, UploadCloud } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { remoteOperationsApi } from '@/modules/chargers/services/remoteOperationsService';
import { chargerApi } from '@/modules/chargers/services/chargerService';

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  location: z.string({ required_error: "Firmware URL is required" })
    .url({ message: "Firmware URL must be a valid URL" }),
  retrieveDate: z.string({ required_error: "Update date and time are required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please provide a valid date and time",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const UpdateFirmwarePage = () => {
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
      console.log('Chargers API response (UpdateFirmwarePage):', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      location: '',
      retrieveDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    },
  });
  
  // Update firmware mutation
  const updateFirmwareMutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Convert to ISO date format if needed
      const retrieveDate = new Date(values.retrieveDate).toISOString();
      
      return remoteOperationsApi.updateFirmware(accessToken, {
        chargerId: values.chargerId,
        location: values.location,
        retrieveDate,
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
        description: error?.message || "Failed to schedule firmware update. Please try again.",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    updateFirmwareMutation.mutate(values);
  };
  
  return (
    <PageLayout
      title="Update Charger Firmware"
      description="Schedule a firmware update for a charger"
    >
      <Helmet>
        <title>Update Charger Firmware | Electric Flow Admin</title>
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
          <CardTitle>Update Charger Firmware</CardTitle>
          <CardDescription>
            Schedule a firmware update for a charger. The update will be performed at the specified time.
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firmware URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://firmware-server.com/firmware/v2.1.bin" />
                      </FormControl>
                      <FormDescription>
                        Enter the full URL to the firmware file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="retrieveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Schedule when the firmware update should start
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 p-4 border rounded-md bg-amber-50 border-amber-200 text-amber-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Warning</h4>
                    <p className="text-sm">Firmware updates may temporarily disable the charger. Schedule updates during low-usage periods to minimize disruption. The charger must have access to the firmware URL.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateFirmwareMutation.isPending}
                  className="ml-auto"
                >
                  {updateFirmwareMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Schedule Update
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

export default UpdateFirmwarePage;
