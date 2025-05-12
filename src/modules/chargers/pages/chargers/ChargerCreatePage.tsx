
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChargers } from '@/modules/chargers/hooks/useChargers';

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
  
  // Initialize form with react-hook-form and zod validation
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ChargerFormValues>({
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
      if (error.response?.data) {
        // Map backend validation errors to form fields
        const { data } = error.response;
        Object.keys(data).forEach(key => {
          if (key in data && data[key]) {
            setError(key as any, {
              type: 'manual',
              message: Array.isArray(data[key]) ? data[key][0] : data[key]
            });
          }
        });
      }
    }
  };
  
  return (
    <PageLayout
      title="Create Charger"
      description="Register a new charging station"
      backButton
      backTo="/chargers"
    >
      <Helmet>
        <title>Create Charger | Electric Flow Admin Portal</title>
      </Helmet>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the required details for the new charger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="charger_id">Charger ID <span className="text-destructive">*</span></Label>
                <Input
                  id="charger_id"
                  placeholder="e.g., CP001"
                  {...register('charger_id')}
                  className={errors.charger_id ? 'border-destructive' : ''}
                />
                {errors.charger_id && (
                  <p className="text-sm text-destructive">{errors.charger_id.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Street Charger"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main St, City, State"
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
                            
              <div className="space-y-2">
                <Label htmlFor="type">Charger Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select charger type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="DC">DC</SelectItem>
                        <SelectItem value="BOTH">Both (AC/DC)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price_per_kwh">Price per kWh (₹)</Label>
                <Input
                  id="price_per_kwh"
                  type="number"
                  placeholder="e.g., 12.50"
                  {...register('price_per_kwh')}
                  className={errors.price_per_kwh ? 'border-destructive' : ''}
                />
                {errors.price_per_kwh && (
                  <p className="text-sm text-destructive">{errors.price_per_kwh.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>Manufacturer and model details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Manufacturer</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., ABB, Schneider, etc."
                  {...register('vendor')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., Terra AC, EVlink, etc."
                  {...register('model')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>Geographic coordinates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Controller
                  control={control}
                  name="coordinates.coordinates.0"
                  render={({ field }) => (
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 77.5946"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Controller
                  control={control}
                  name="coordinates.coordinates.1"
                  render={({ field }) => (
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 12.9716"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Configuration options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled" className="block">Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow the charger to accept charging sessions</p>
                </div>
                <Controller
                  control={control}
                  name="enabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="enabled"
                    />
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verified" className="block">Verified</Label>
                  <p className="text-sm text-muted-foreground">Mark the charger as verified</p>
                </div>
                <Controller
                  control={control}
                  name="verified"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="verified"
                    />
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="meter_value_interval">Meter Value Interval (seconds)</Label>
                <Input
                  id="meter_value_interval"
                  type="number"
                  placeholder="e.g., 300"
                  {...register('meter_value_interval')}
                />
                {errors.meter_value_interval && (
                  <p className="text-sm text-destructive">{errors.meter_value_interval.message}</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="ocpi_id">OCPI ID</Label>
                <Input
                  id="ocpi_id"
                  placeholder="e.g., IND*CP001"
                  {...register('ocpi_id')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="publish_to_ocpi" className="block">Publish to OCPI</Label>
                  <p className="text-sm text-muted-foreground">Make this charger visible in roaming networks</p>
                </div>
                <Controller
                  control={control}
                  name="publish_to_ocpi"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="publish_to_ocpi"
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => navigate('/chargers')}>Cancel</Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Charger'
            )}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default ChargerCreatePage;
