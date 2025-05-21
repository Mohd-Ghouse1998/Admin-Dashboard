import React, { useState } from 'react';
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
import { AlertCircle, StopCircle } from 'lucide-react';
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

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  transactionId: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RemoteStopPage = () => {
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
      console.log('Chargers API response (RemoteStopPage):', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Fetch active transactions for the selected charger
  const {
    data: transactions,
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ['active-transactions', selectedChargerId],
    queryFn: async () => {
      if (!selectedChargerId) return { active_transactions: [] };
      
      try {
        // This would be the actual API call to get active transactions
        return { active_transactions: [{ connector_id: '1', transaction_id: '12345' }] };
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return { active_transactions: [] };
      }
    },
    enabled: !!selectedChargerId && !!accessToken,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      transactionId: undefined,
    },
  });
  
  // Stop transaction mutation
  const stopTransactionMutation = useMutation({
    mutationFn: (values: FormValues) => {
      console.log('Stopping transaction with values:', values);
      return remoteOperationsApi.remoteStopTransaction(accessToken, {
        chargerId: values.chargerId,
        transactionId: values.transactionId,
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
        description: error?.message || "Failed to stop transaction. Please try again.",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    stopTransactionMutation.mutate(values);
  };
  
  // Process any errors
  const errorMessage = chargersError ? 
    (chargersError instanceof Error ? chargersError.message : 'Failed to load chargers') : null;
  
  return (
    <CreateTemplate
      title="Stop Transaction"
      description="Remotely stop a charging transaction"
      icon={<StopCircle className="h-5 w-5" />}
      entityName="Transaction"
      backPath="/chargers/remote-operations"
      error={errorMessage}
      isSubmitting={stopTransactionMutation.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <CreateSectionHeader 
              title="Transaction Details" 
              description="Select the charger and transaction to stop"
              icon={<StopCircle className="h-4 w-4" />}
            />
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="chargerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          setSelectedChargerId(value);
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
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter transaction ID" 
                            className="h-10 border-border hover:border-primary/20 focus:ring-1 focus:ring-primary/30 focus:border-primary/30"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {selectedChargerId && (
                  <div className="mt-4 p-4 bg-muted/20 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Active Transactions</h4>
                    {transactionsLoading ? (
                      <div className="p-2 text-center">Loading transactions...</div>
                    ) : transactions?.active_transactions?.length ? (
                      <div className="space-y-2">
                        {transactions.active_transactions.map((tx, idx) => (
                          <div key={idx} className="p-2 border border-border rounded-md text-sm">
                            <div>Connector: {tx.connector_id}</div>
                            <div>Transaction: {tx.transaction_id}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No active transactions for this charger</div>
                    )}
                  </div>
                )}
                
            </div>
          </div>
        </div>
      </Form>
    </CreateTemplate>
  );
};

export default RemoteStopPage;
