import React, { useState, useEffect } from 'react';
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
import { AlertCircle, Power } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { remoteOperationsApi } from '@/modules/chargers/services/remoteOperationsService';

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  connectorId: z.coerce.number().optional(),
  type: z.enum(['Operative', 'Inoperative'], { required_error: "Availability type is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const ChangeAvailabilityPage = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
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
      console.log('Chargers API response (ChangeAvailabilityPage):', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Fetch connectors based on selected charger
  const {
    data: connectors,
    isLoading: connectorsLoading,
    error: connectorsError,
    refetch: refetchConnectors,
  } = useQuery({
    queryKey: ['connectors', selectedChargerId],
    queryFn: async () => {
      if (!selectedChargerId) {
        console.log('No charger selected, returning empty connectors list');
        return { results: [] };
      }
      
      console.log(`Fetching connectors for charger ID: ${selectedChargerId}`);
      
      try {
        // Create the params object with charger_id
        const params = { charger_id: selectedChargerId };
        console.log(`Fetching connectors with params:`, params);
        
        // Make a direct API call to get connectors filtered by the charger_id
        const result = await connectorApi.getConnectors(accessToken, params);
        console.log(`Raw connectors API response for charger_id ${selectedChargerId}:`, result);
        
        return result;
      } catch (error) {
        console.error('Error fetching connectors:', error);
        throw error;
      }
    },
    enabled: !!accessToken && !!selectedChargerId,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      connectorId: undefined,
      type: 'Operative',
    },
  });
  
  // Watch for charger ID changes to update connector options
  const watchChargerId = form.watch('chargerId');
  
  // Handle charger selection
  const handleChargerChange = (id: string) => {
    console.log('Charger selected:', id);
    
    // Find the selected charger
    const selectedCharger = chargers?.results?.features?.find(c => c.properties?.charger_id === id);
    
    if (!selectedCharger) {
      console.error(`Could not find charger with ID ${id}`);
      return;
    }
    
    console.log(`Selected charger: ${id} (${selectedCharger.properties.name})`);
    
    // Update the state with the string charger_id for connector filtering
    setSelectedChargerId(id); // Use the string charger_id
    
    // Update form values
    form.setValue('chargerId', id);
    form.setValue('connectorId', undefined); // Reset connector selection
    
    // Force refetch connectors for this charger
    setTimeout(() => {
      refetchConnectors();
    }, 100); // Small delay to ensure state is updated
  };
  
  // When the charger ID changes in the form, update the selected charger
  useEffect(() => {
    if (watchChargerId && watchChargerId !== selectedChargerId) {
      handleChargerChange(watchChargerId);
    }
  }, [watchChargerId]);
  
  // When a connector is selected in the dropdown
  const handleConnectorChange = (connectorId: string) => {
    console.log(`Selected connector ID: ${connectorId}`);
    form.setValue('connectorId', parseInt(connectorId));
  };
  
  // Change availability mutation
  const changeAvailabilityMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return remoteOperationsApi.changeAvailability(
        accessToken, 
        {
          charger_id: values.chargerId,
          connector_id: values.connectorId,
          type: values.type,
        }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Availability changed successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to change availability: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    changeAvailabilityMutation.mutate(values);
  };

  return (
    <PageLayout
      title="Change Availability"
      description="Change the availability of a charger or connector remotely"
    >
      <Helmet>
        <title>Change Availability | Electric Flow</title>
      </Helmet>
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Change Availability</CardTitle>
          <CardDescription>
            Change the availability of a charger or connector remotely.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="chargerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger</FormLabel>
                      <Select onValueChange={handleChargerChange} value={field.value}>
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
                  name="connectorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connector (Optional)</FormLabel>
                      <Select 
                        onValueChange={handleConnectorChange} 
                        value={field.value?.toString()} 
                        disabled={!selectedChargerId || connectorsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connector or entire charger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Entire charger (all connectors)</SelectItem>
                          {connectorsLoading ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : connectors?.results?.length ? (
                            // Map through the API response connectors
                            connectors.results.map((connector, index) => {
                              // Ensure connector_id is a string
                              const connectorId = connector.connector_id.toString();
                              return (
                                <SelectItem 
                                  key={`connector-${connector.id}-${connectorId}`} 
                                  value={connectorId}
                                >
                                  {`Connector #${connectorId} (${connector.type || 'Unknown'}) - ${connector.status}`}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <div className="p-2 text-center">No connectors found for this charger</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Operative" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Operative (Available)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Inoperative" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Inoperative (Unavailable)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="p-4 border rounded-md bg-blue-50 border-blue-200 text-blue-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Information</h4>
                    <p className="text-sm">Changing availability affects whether users can start charging sessions. If you make a charger inoperative, all its connectors will become unavailable.</p>
                  </div>
                </div>
              </div>
            </div>
              
            <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={changeAvailabilityMutation.isPending}
                  className="ml-auto"
                >
                  {changeAvailabilityMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Change Availability
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

export default ChangeAvailabilityPage;
