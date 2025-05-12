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
  transactionId: z.coerce.number({ required_error: "Transaction ID is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const RemoteStopPage = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
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
  
  return (
    <PageLayout
      title="Remote Stop Transaction"
      description="Stop a charging transaction remotely"
    >
      <Helmet>
        <title>Remote Stop Transaction | Electric Flow Admin</title>
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
          <CardTitle>Remote Stop Transaction</CardTitle>
          <CardDescription>
            Fill in the required information to stop a charging transaction remotely
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
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                          placeholder="Enter transaction ID"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={stopTransactionMutation.isPending}
                  className="ml-auto"
                  variant="destructive"
                >
                  {stopTransactionMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Stopping...
                    </>
                  ) : (
                    <>
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop Transaction
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

export default RemoteStopPage;
