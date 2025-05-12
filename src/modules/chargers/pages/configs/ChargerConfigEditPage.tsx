
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
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

const ChargerConfigEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      charger: undefined,
      key: '',
      value: '',
      readonly: false,
    },
  });
  
  // Fetch the config to edit
  const { data: configData, isLoading: isLoadingConfig, error: configError } = useQuery({
    queryKey: ['chargerConfig', id],
    queryFn: () => {
      if (!id) throw new Error('Config ID is required');
      return chargerApi.getChargerConfig(accessToken, id);
    },
    enabled: !!accessToken && !!id
  });
  
  // When data is loaded, populate the form
  useEffect(() => {
    if (configData) {
      form.reset({
        charger: configData.charger,
        key: configData.key,
        value: configData.value,
        readonly: configData.readonly
      });
    }
  }, [configData, form]);
  
  // Update mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!id) throw new Error('Config ID is required');
      
      const configData = {
        charger: data.charger,
        key: data.key,
        value: data.value,
        readonly: data.readonly
      };
      return chargerApi.updateChargerConfig(accessToken, id, configData);
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "The charger configuration was updated successfully.",
        variant: "default",
      });
      navigate('/chargers/configs');
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Failed to update configuration");
      toast({
        title: "Error",
        description: error?.message || "Failed to update configuration",
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
    updateConfigMutation.mutate(data);
  };

  // If loading, show a loading state
  if (isLoadingConfig) {
    return (
      <PageLayout
        title="Edit Charger Configuration"
        description="Loading configuration details..."
        backButton
        backTo="/chargers/configs"
      >
        <Helmet>
          <title>Edit Charger Configuration | Electric Flow Admin</title>
        </Helmet>
        
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading configuration...</span>
        </div>
      </PageLayout>
    );
  }

  // If error fetching the config
  if (configError) {
    return (
      <PageLayout
        title="Edit Charger Configuration"
        description="Error loading configuration"
        backButton
        backTo="/chargers/configs"
      >
        <Helmet>
          <title>Edit Charger Configuration | Electric Flow Admin</title>
        </Helmet>
        
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {configError instanceof Error ? configError.message : 'Failed to load configuration details'}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-4">
          <Button onClick={() => navigate('/chargers/configs')}>
            Return to Configurations
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Edit Configuration: ${configData?.key || ''}`}
      description="Update charger configuration parameter"
      backButton
      backTo="/chargers/configs"
    >
      <Helmet>
        <title>Edit Charger Configuration | Electric Flow Admin</title>
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
          <CardTitle>Edit Configuration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="charger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charger ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Charger ID" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      The charger this configuration is applied to (cannot be changed)
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
                    <FormControl>
                      <Input 
                        placeholder="Configuration key" 
                        {...field} 
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      The OCPP configuration key parameter name (cannot be changed)
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
                  {isSubmitting ? "Updating..." : "Update Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargerConfigEditPage;
