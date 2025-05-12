import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Charger } from '@/modules/chargers/hooks/useChargers';
import { formatCurrency } from '@/utils/formatters';

interface ChargerFormProps {
  initialData?: Partial<Charger>;
  onSubmit: (data: Partial<Charger>) => Promise<void>;
  isLoading?: boolean;
}

// Define the form validation schema
const chargerFormSchema = z.object({
  charger_id: z.string().min(1, 'Charger ID is required'),
  name: z.string().min(1, 'Charger name is required'),
  vendor: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  firmware_version: z.string().optional(),
  type: z.enum(['AC', 'DC'], { errorMap: () => ({ message: 'Charger type must be AC or DC' }) }),
  status: z.enum(['Available', 'Charging', 'Offline', 'Faulted', 'Unavailable', 'Reserved'], { 
    errorMap: () => ({ message: 'Invalid charger status' }) 
  }).optional(),
  address: z.string().optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
  connectors: z.number().int().min(1).optional(),
  ocpp_version: z.string().optional(),
  enabled: z.boolean().default(true),
  last_heartbeat: z.string().datetime().optional(),
});

const ChargerForm: React.FC<ChargerFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  // Initialize form with default values or initial data
  const form = useForm<Partial<Charger>>({
    resolver: zodResolver(chargerFormSchema),
    defaultValues: {
      ...initialData,
      type: initialData?.type ?? 'AC',
      enabled: initialData?.enabled ?? true,
      status: initialData?.status ?? 'Available',
      connectors: initialData?.connectors ?? 1,
    },
  });

  // Prepare form submission handler
  const handleSubmit = async (data: Partial<Charger>) => {
    try {
      await onSubmit(data);
      // Optional: Reset form after successful submission
      form.reset();
    } catch (error) {
      // Handle submission error
      console.error('Charger submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Charger ID */}
          <FormField
            control={form.control}
            name="charger_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charger ID <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="OCPP-001" {...field} />
                </FormControl>
                <FormDescription>
                  A unique identifier for the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Charger Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charger Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Main Street Charger" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vendor */}
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input placeholder="ChargePoint" {...field} />
                </FormControl>
                <FormDescription>
                  Manufacturer of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="CT4020-HD" {...field} />
                </FormControl>
                <FormDescription>
                  Specific model of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serial Number */}
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="SN-12345" {...field} />
                </FormControl>
                <FormDescription>
                  Unique serial number of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Firmware Version */}
          <FormField
            control={form.control}
            name="firmware_version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firmware Version</FormLabel>
                <FormControl>
                  <Input placeholder="v1.2.3" {...field} />
                </FormControl>
                <FormDescription>
                  Current firmware version of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Charger Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charger Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select charger type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="DC">DC</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of charging station (AC or DC)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select charger status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Charging">Charging</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Faulted">Faulted</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Current operational status of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="123 Main St, City, State, ZIP" {...field} />
                </FormControl>
                <FormDescription>
                  Physical location of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Latitude */}
          <FormField
            control={form.control}
            name="location.latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Latitude coordinate" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Geographical latitude of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Longitude */}
          <FormField
            control={form.control}
            name="location.longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Longitude coordinate" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Geographical longitude of the charging station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number of Connectors */}
          <FormField
            control={form.control}
            name="connectors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Connectors</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormDescription>
                  Total number of charging connectors at this station
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* OCPP Version */}
          <FormField
            control={form.control}
            name="ocpp_version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OCPP Version</FormLabel>
                <FormControl>
                  <Input placeholder="1.6" {...field} />
                </FormControl>
                <FormDescription>
                  Open Charge Point Protocol version
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Enabled Toggle */}
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enabled</FormLabel>
                  <FormDescription>
                    Whether the charging station is currently operational
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Charger' : 'Create Charger'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChargerForm;