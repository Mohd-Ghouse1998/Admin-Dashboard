import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { CreateTemplate, CreateSectionHeader } from '@/components/templates/create/CreateTemplate';
import { cn } from '@/lib/utils';
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

  // Process errors
  const errorMessage = chargersError || connectorsError ? 
    [
      chargersError instanceof Error ? chargersError.message : '',
      connectorsError instanceof Error ? connectorsError.message : ''
    ].filter(Boolean).join('\n') || 'Failed to load resources' : null;
  
  return (
    <CreateTemplate
      title="Change Availability"
      description="Change the operational status of a charger or connector"
      icon={<Power className="h-5 w-5" />}
      entityName="Availability"
      backPath="/chargers/remote-operations"
      error={errorMessage}
      isSubmitting={changeAvailabilityMutation.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <CreateSectionHeader 
              title="Availability Settings" 
              description="Select the charger and specify the new availability"
              icon={<Power className="h-4 w-4" />}
            />
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="chargerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          handleChargerChange(value);
                          field.onChange(value);
                        }} 
                        value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border hover:border-primary/20 focus:ring-1 focus:ring-primary/30 focus:border-primary/30">
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
                    <FormLabel>Connector</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        if (value) handleConnectorChange(value);
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                      value={field.value ? field.value.toString() : undefined}
                      disabled={!form.getValues('chargerId')}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border hover:border-primary/20 focus:ring-1 focus:ring-primary/30 focus:border-primary/30">
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
            </div>
          </div>
        </div>
      </Form>
    </CreateTemplate>
  );
};

export default ChangeAvailabilityPage;
