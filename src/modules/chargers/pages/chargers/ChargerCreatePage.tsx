
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Loader2, Zap, MapPin, Settings } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChargers } from '@/modules/chargers/hooks/useChargers';
import { CreateTemplate, CreateSectionHeader } from '@/components/templates/create/CreateTemplate';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

// Define schema for form validation
const chargerSchema = z.object({
  charger_id: z.string().min(1, 'Charger ID is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  vendor: z.string().optional(),
  model: z.string().optional(),
  enabled: z.boolean().default(true),
  price_per_kwh: z.coerce.number().min(0, 'Price must be positive').default(0),
  type: z.enum(['AC', 'DC', 'BOTH']).default('AC'),
  meter_value_interval: z.coerce.number().int().min(0).default(300),
  verified: z.boolean().default(false),
  ocpi_id: z.string().optional().nullable(),
  publish_to_ocpi: z.boolean().default(false),
  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.coerce.number().min(-180).max(180), // longitude
      z.coerce.number().min(-90).max(90),   // latitude
    ])
  }).optional().nullable()
});

type ChargerFormValues = z.infer<typeof chargerSchema>;

const ChargerCreatePage = () => {
  const navigate = useNavigate();
  const { createCharger, isCreating } = useChargers('');
  const [formError, setFormError] = React.useState<string | null>(null);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ChargerFormValues>({
    resolver: zodResolver(chargerSchema),
    defaultValues: {
      charger_id: '',
      name: '',
      address: '',
      vendor: '',
      model: '',
      enabled: true,
      price_per_kwh: 0,
      type: 'AC',
      meter_value_interval: 300,
      verified: false,
      publish_to_ocpi: false,
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }
  });

  const onSubmit = async (data: ChargerFormValues) => {
    try {
      setFormError(null);
      
      // Convert the form data to the format expected by the API
      const chargerData = {
        ...data,
        // Transform GeoJSON coordinates to the format expected by the API
        coordinates: data.coordinates?.coordinates ? {
          // The Charger type expects {latitude, longitude} rather than GeoJSON format
          latitude: data.coordinates.coordinates[1],
          longitude: data.coordinates.coordinates[0],
        } : undefined
      };
      
      // Call the API to create the charger
      await createCharger(chargerData);
      
      // Redirect to chargers list on success
      navigate('/chargers');
    } catch (error: any) {
      // Handle API errors
      setFormError(error?.message || 'Failed to create charger');
      
      if (error.response?.data) {
        // Map backend validation errors to form fields
        const { data } = error.response;
        Object.keys(data).forEach(key => {
          if (key in data && data[key]) {
            form.setError(key as any, {
              type: 'manual',
              message: Array.isArray(data[key]) ? data[key][0] : data[key]
            });
          }
        });
      }
    }
  };
  
  return (
    <CreateTemplate
      title="Create Charger"
      description="Register a new charging station"
      icon={<Zap className="h-5 w-5" />}
      entityName="Charger"
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={isCreating}
      error={formError}
      backPath="/chargers"
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* Basic Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <CreateSectionHeader
              title="Basic Information"
              description="Enter the required details for the new charger"
              icon={<Zap className="h-4 w-4" />}
            />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="charger_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger ID <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CP001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Street Charger" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123 Main St, City, State" {...field} />
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
                      <FormLabel>Charger Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select charger type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="DC">DC</SelectItem>
                          <SelectItem value="BOTH">Both (AC/DC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price_per_kwh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per kWh (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 12.50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Vendor Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <CreateSectionHeader
              title="Vendor Information"
              description="Manufacturer and model details"
            />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor/Manufacturer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ABB, Schneider, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Terra AC, EVlink, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Location Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <CreateSectionHeader
              title="Location Information"
              description="Geographic coordinates"
              icon={<MapPin className="h-4 w-4" />}
            />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="coordinates.coordinates.0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="e.g., 77.5946"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Longitude coordinate (-180 to 180)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coordinates.coordinates.1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="e.g., 12.9716"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Latitude coordinate (-90 to 90)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Advanced Settings Section */}
          <Card className="overflow-hidden border-primary/10">
            <CreateSectionHeader
              title="Advanced Settings"
              description="Configuration options"
              icon={<Settings className="h-4 w-4" />}
            />
            <CardContent className="p-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel className="font-medium">Enabled</FormLabel>
                        </div>
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormDescription>
                          Allow the charger to accept charging sessions
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel className="font-medium">Verified</FormLabel>
                        </div>
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormDescription>
                          Mark the charger as verified
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="meter_value_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meter Value Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 300"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How often the charger should report meter values
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="ocpi_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., IND*CP001"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Open Charge Point Interface identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publish_to_ocpi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel className="font-medium">Publish to OCPI</FormLabel>
                        </div>
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormDescription>
                          Make this charger visible in roaming networks
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </CreateTemplate>
  );
};

export default ChargerCreatePage;
