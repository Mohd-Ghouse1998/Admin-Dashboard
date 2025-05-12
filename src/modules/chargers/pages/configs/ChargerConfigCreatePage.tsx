import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';

// Define the form schema based on API requirements
const formSchema = z.object({
  charger: z.number().min(1, "Charger ID is required"),
  key: z.string().min(1, "Configuration key is required"),
  value: z.string().min(1, "Value is required"),
  readonly: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const ChargerConfigCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Fetch chargers for dropdown
  const { data: chargersData, isLoading: isLoadingChargers } = useQuery({
    queryKey: ['chargers'],
    queryFn: () => chargerApi.getChargers(accessToken),
    enabled: !!accessToken
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      charger: undefined,
      key: '',
      value: '',
      readonly: false,
    },
  });

  // Create mutation for config creation
  const createConfigMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const configData = {
        charger: data.charger,
        key: data.key,
        value: data.value,
        readonly: data.readonly
      };
      return chargerApi.createChargerConfig(accessToken, configData);
    },
    onSuccess: () => {
      toast({
        title: "Configuration Created",
        description: "The charger configuration was created successfully.",
        variant: "default",
      });
      navigate('/chargers/configs');
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Failed to create configuration");
      toast({
        title: "Error",
        description: error?.message || "Failed to create configuration",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    createConfigMutation.mutate(data);
  };

  const commonConfigKeys = [
    "HeartbeatInterval",
    "ConnectionTimeOut",
    "ResetRetries",
    "AuthorizationCacheEnabled",
    "AllowOfflineTxForUnknownId",
    "LocalAuthListEnabled",
    "LocalAuthListMaxLength",
    "UnlockConnectorOnEVSideDisconnect",
    "StopTransactionOnEVSideDisconnect"
  ];

  return (
    <PageLayout
      title="Create Charger Configuration"
      description="Add a new configuration parameter for a charger"
      backButton
      backTo="/chargers/configs"
    >
      <Helmet>
        <title>Create Charger Configuration | Electric Flow Admin</title>
      </Helmet>

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Charger Configuration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="charger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charger</FormLabel>
                    <Select
                      disabled={isLoadingChargers}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a charger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chargersData?.features?.map((charger: any) => (
                          <SelectItem 
                            key={charger.properties.id} 
                            value={charger.properties.id.toString()}
                          >
                            {charger.properties.name || charger.properties.charger_id} (ID: {charger.properties.id})
                          </SelectItem>
                        )) || (
                          <SelectItem value="1">Charger 1</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The charger this configuration will be applied to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Key</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      {...field}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a configuration key" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonConfigKeys.map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The OCPP configuration key parameter name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter configuration value" {...field} />
                    </FormControl>
                    <FormDescription>
                      The value for this configuration parameter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="readonly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          id="readonly"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <label htmlFor="readonly" className="font-medium">Read Only</label>
                      </div>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormDescription>
                        If enabled, this configuration can only be read but not modified by the charger
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/chargers/configs')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargerConfigCreatePage;
