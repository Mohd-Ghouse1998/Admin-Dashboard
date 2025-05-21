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
import { AlertCircle, RotateCcw } from 'lucide-react';
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
import { remoteOperationsApi } from '@/modules/chargers/services/remoteOperationsService';
import { chargerApi } from '@/modules/chargers/services/chargerService';

// Define form schema using zod
const formSchema = z.object({
  chargerId: z.string({ required_error: "Charger ID is required" }),
  resetType: z.enum(['Soft', 'Hard'], { required_error: "Reset type is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const ResetChargerPage = () => {
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
      console.log('Chargers API response (ResetChargerPage):', result);
      return result;
    },
    enabled: !!accessToken,
  });
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chargerId: '',
      resetType: 'Soft',
    },
  });
  
  // Reset charger mutation
  const resetChargerMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return remoteOperationsApi.resetCharger(accessToken, {
        chargerId: values.chargerId,
        resetType: values.resetType,
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
        description: error?.message || "Failed to reset charger. Please try again.",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    resetChargerMutation.mutate(values);
  };
  
  // Process errors
  const errorMessage = chargersError ? 
    (chargersError instanceof Error ? chargersError.message : 'Failed to load chargers') : null;
    
  return (
    <CreateTemplate
      title="Reset Charger"
      description="Remotely reset a charging station's software or hardware"
      icon={<RotateCcw className="h-5 w-5" />}
      entityName="Reset"
      backPath="/chargers/remote-operations"
      error={errorMessage}
      isSubmitting={resetChargerMutation.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <CreateSectionHeader 
              title="Reset Details" 
              description="Select a charger and reset type"
              icon={<RotateCcw className="h-4 w-4" />}
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
                          console.log('Charger selected:', value);
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
                  name="resetType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Reset Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 p-3 border border-border rounded-md"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 hover:bg-muted/20 p-2 rounded-md cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="Soft" className="text-primary border-primary/30" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Soft Reset (Software restart)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 hover:bg-muted/20 p-2 rounded-md cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="Hard" className="text-primary border-primary/30" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Hard Reset (Device restart)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </CreateTemplate>
  );
};

export default ResetChargerPage;
