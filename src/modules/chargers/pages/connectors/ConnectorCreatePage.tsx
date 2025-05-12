import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
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
import { connectorApi } from '@/modules/chargers/services/connectorService';
import { useAuth } from '@/hooks/useAuth';

// Define form schema using zod
const formSchema = z.object({
  charger: z.coerce.number().positive('Charger must be a positive number'),
  connector_id: z.coerce.number().positive('Connector ID must be a positive number'),
  type: z.string().min(1, 'Connector type is required'),
  status: z.string().min(1, 'Status is required'),
  max_power: z.coerce
    .number()
    .optional()
    .transform(val => val === 0 ? undefined : val)
});

type FormValues = z.infer<typeof formSchema>;

const ConnectorCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // Setup form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      charger: 0,
      connector_id: 1,
      type: 'CCS1',
      status: 'Available',
      max_power: undefined
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Ensure all required fields are present for the Connector type
      const connectorData = {
        ...values,
        charger: values.charger || 0, // Ensure charger is not undefined
        connector_id: values.connector_id || 1, // Ensure connector_id is not undefined
        type: values.type || 'CCS1', // Ensure type is not undefined
        status: values.status || 'Available', // Ensure status is not undefined
        max_power: values.max_power || 0 // Ensure max_power is not undefined
      };
      return connectorApi.createConnector(accessToken, connectorData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Connector created successfully",
      });
      navigate(`/chargers/connectors/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create connector. Please try again.",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };
  
  return (
    <PageLayout
      title="Create Connector"
      description="Add a new connector to a charger"
    >
      <Helmet>
        <title>Create Connector | Electric Flow Admin</title>
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link to="/chargers/connectors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Connectors
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Connector</CardTitle>
          <CardDescription>
            Fill in the details to add a new connector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="charger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="connector_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connector ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connector Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connector type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CCS1">CCS1</SelectItem>
                          <SelectItem value="CCS2">CCS2</SelectItem>
                          <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                          <SelectItem value="Type1">Type1</SelectItem>
                          <SelectItem value="Type2">Type2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Unavailable">Unavailable</SelectItem>
                          <SelectItem value="SuspendedEVSE">Suspended (EVSE)</SelectItem>
                          <SelectItem value="Faulted">Faulted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Charging Power (kW)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
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
                  disabled={createMutation.isPending}
                  className="ml-auto"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Connector
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

export default ConnectorCreatePage;
