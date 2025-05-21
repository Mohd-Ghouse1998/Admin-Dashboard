
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChargers } from '@/modules/chargers/hooks/useChargers';
import { EditTemplate } from '@/components/templates/edit/EditTemplate';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Zap,
  MapPin,
  Settings,
  Shield,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

const chargerSchema = z.object({
  charger_id: z.string().min(1, 'Charger ID is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  vendor: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
  price_per_kwh: z.coerce.number().min(0, 'Price must be positive').default(0),
  type: z.enum(['AC', 'DC', 'BOTH']).default('AC'),
  meter_value_interval: z.coerce.number().int().min(0).default(300),
  verified: z.boolean().default(false),
  ocpi_id: z.string().optional().nullable(),
  publish_to_ocpi: z.boolean().default(false),
  coordinates: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([
      z.coerce.number().min(-180).max(180), // longitude
      z.coerce.number().min(-90).max(90),   // latitude
    ])
  }).default({ type: 'Point', coordinates: [0, 0] }),
});

type ChargerFormValues = z.infer<typeof chargerSchema>;

const ChargerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCharger, updateCharger, isLoading, error } = useChargers();

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
      ocpi_id: '',
      publish_to_ocpi: false,
      coordinates: { type: 'Point', coordinates: [0, 0] },
    },
  });

  useEffect(() => {
    if (id) {
      getCharger(id).then((charger) => {
        if (charger) {
          form.reset({
            ...charger,
            coordinates: charger.coordinates || { type: 'Point', coordinates: [0, 0] },
          });
        }
      });
    }
  }, [id]);

  const onSubmit = async (values: ChargerFormValues) => {
    if (!id) return;
    const updated = await updateCharger(id, values);
    if (updated) {
      navigate('/chargers');
    }
  };

  return (
    <EditTemplate
      title="Edit Charger"
      subtitle={id ? `Charger ID: ${id}` : undefined}
      description="Edit charger details and configuration"
      icon={<Zap className="h-5 w-5" />}
      entityName="Charger"
      backPath="/chargers"
      isLoading={isLoading}
      isSubmitting={form.formState.isSubmitting}
      error={error}
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-full container-fluid px-6"
    >
      <Form {...form}>
        <div className="grid grid-cols-1 gap-6">
          {/* Basic Information Card */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Basic Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">General charger details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="charger_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger ID</FormLabel>
                      <FormControl>
                        <Input placeholder="CP001" {...field} />
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Street Charger" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Geographic coordinates</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="coordinates.coordinates.0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" placeholder="77.5946" {...field} />
                      </FormControl>
                      <FormDescription>East-west position (decimal degrees)</FormDescription>
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
                        <Input type="number" step="0.000001" placeholder="12.9716" {...field} />
                      </FormControl>
                      <FormDescription>North-south position (decimal degrees)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vendor & Model */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Vendor & Model
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Manufacturer and model details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <FormControl>
                        <Input placeholder="Tata Power" {...field} />
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
                        <Input placeholder="EVSE-2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Verification */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Status & Verification
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Operational status and verification</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Enabled</FormLabel>
                        <FormDescription>Allow the charger to accept charging sessions</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Verified</FormLabel>
                        <FormDescription>Mark the charger as verified</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Charger Type & Pricing */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Charger Type & Pricing
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Type and price per kWh</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charger Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select charger type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="DC">DC</SelectItem>
                          <SelectItem value="BOTH">Both</SelectItem>
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
                        <Input type="number" step="0.01" placeholder="10.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* OCPI Information */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                OCPI Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Open Charge Point Interface settings</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ocpi_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., IND*CP001" {...field} />
                      </FormControl>
                      <FormDescription>Identifier for Open Charge Point Interface</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publish_to_ocpi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Publish to OCPI</FormLabel>
                        <FormDescription>Make this charger visible in roaming networks</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Advanced Settings
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Metering and advanced configuration</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="meter_value_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meter Value Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 300" {...field} />
                      </FormControl>
                      <FormDescription>Time between meter value updates in seconds</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </EditTemplate>
  );
};

export default ChargerEditPage;
