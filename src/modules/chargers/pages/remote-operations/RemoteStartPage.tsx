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
import { AlertCircle, PlayCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { remoteOperationsApi } from '@/modules/chargers/services/remoteOperationsService';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { idTagApi } from '@/modules/chargers/services/idTagService';

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  connectorId: z.string({ required_error: "Connector ID is required" }),
  idTag: z.string({ required_error: "ID Tag is required" }),
  userLimit: z.string().optional(),
  limitType: z.enum(['KWH', 'AMOUNT']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RemoteStartPage = () => {
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
      console.log('Chargers API response:', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Fetch connectors based on selected charger's numeric ID
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
      
      console.log(`Fetching connectors for charger numeric ID: ${selectedChargerId}`);
      
      try {
        // Create the params object with charger_id
        const params = { charger_id: selectedChargerId };
        console.log(`Fetching connectors with params:`, params);
        
        // Make a direct API call to get connectors filtered by the charger_id
        // This should generate: /api/ocpp/connectors?charger_id=jpcharger
        const result = await connectorApi.getConnectors(accessToken, params);
        console.log(`Raw connectors API response for charger_id ${selectedChargerId}:`, result);
        
        // Just in case the API doesn't filter correctly, do an additional filter here
        if (result && result.results && result.results.length > 0) {
          console.log(`Found ${result.results.length} connectors for charger ID ${selectedChargerId}`);
          
          // The API should have already filtered by charger_id, but we'll double-check
          if (result.results.length > 0) {
            console.log(`Found ${result.results.length} connectors for charger_id ${selectedChargerId}:`, 
              result.results.map(c => `ID: ${c.id}, Connector #${c.connector_id}, Status: ${c.status}`));
          }
          
          console.log(`Filtered to ${result.results.length} connectors that match charger ID ${selectedChargerId}`);
        } else {
          console.log(`No connectors found for charger ID ${selectedChargerId}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching connectors:', error);
        throw error;
      }
    },
    enabled: !!accessToken && !!selectedChargerId,
  });
  
  // Fetch ID Tags
  const {
    data: idTags,
    isLoading: idTagsLoading,
    error: idTagsError,
  } = useQuery({
    queryKey: ['idTags'],
    queryFn: async () => {
      const result = await idTagApi.getIdTags(accessToken);
      console.log('ID Tags API response:', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      connectorId: '',
      idTag: '',
      userLimit: '',
      limitType: 'KWH',
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
    form.setValue('connectorId', ''); // Reset connector selection
    
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
    form.setValue('connectorId', connectorId);
  };
  
  // Start transaction mutation
  const startTransactionMutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Make sure connectorId is converted to a number before sending to API
      let connectorIdNumber: number;
      try {
        connectorIdNumber = parseInt(values.connectorId);
        if (isNaN(connectorIdNumber)) {
          throw new Error('Invalid connector ID: must be a number');
        }
      } catch (error) {
        console.error('Error converting connectorId to number:', values.connectorId);
        throw new Error('Connector ID must be a valid number');
      }
      
      // Build API parameters with correct types
      const apiParams = {
        chargerId: values.chargerId,
        connectorId: connectorIdNumber, // Now guaranteed to be a number
        idTag: values.idTag,
        userLimit: values.userLimit,
        limitType: values.limitType,
      };
      
      console.log('Starting transaction with values:', apiParams);
      return remoteOperationsApi.remoteStartTransaction(accessToken, apiParams);
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
        description: error?.message || "Failed to start transaction. Please try again.",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    startTransactionMutation.mutate(values);
  };
  
  return (
    <PageLayout
      title="Remote Start Transaction"
      description="Start a charging transaction remotely"
    >
      <Helmet>
        <title>Remote Start Transaction | Electric Flow Admin</title>
      </Helmet>
      
      {(chargersError || connectorsError || idTagsError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {chargersError instanceof Error ? chargersError.message : ''}
            {connectorsError instanceof Error ? connectorsError.message : ''}
            {idTagsError instanceof Error ? idTagsError.message : ''}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Remote Start Transaction</CardTitle>
          <CardDescription>
            Fill in the required information to start a charging transaction remotely
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                                  {charger.properties?.name || chargerId}
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
                        onValueChange={handleConnectorChange} 
                        value={field.value}
                        disabled={!selectedChargerId || connectorsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a connector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                
                <FormField
                  control={form.control}
                  name="idTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Tag</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an ID Tag" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {idTagsLoading ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : (
                            // Handle idTags data
                            idTags?.results ? 
                              idTags.results.map((idTag, index) => {
                                const tagId = idTag.idtag || `tag-${index}`;
                                const status = idTag.is_blocked ? 'Blocked' : idTag.is_expired ? 'Expired' : 'Active';
                                
                                return (
                                  <SelectItem 
                                    key={`tag-${idTag.id || index}-${tagId}`} 
                                    value={tagId}
                                  >
                                    {`${tagId} (${status})`}
                                  </SelectItem>
                                );
                              })
                            : []
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="userLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter limit value" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="limitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit Type (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select limit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="KWH">KWH</SelectItem>
                          <SelectItem value="AMOUNT">AMOUNT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={startTransactionMutation.isPending}
                  className="ml-auto"
                >
                  {startTransactionMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Transaction
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

export default RemoteStartPage;
