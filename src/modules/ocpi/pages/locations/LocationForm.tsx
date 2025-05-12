
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OCPILocation, OCPIParty } from '@/services/ocpiService';
import { useLocations, useParties } from '@/hooks/useOCPI';

const formSchema = z.object({
  party: z.number().int().positive('Party is required'),
  location_id: z.string().min(1, 'Location ID is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').max(2, 'Country code must be 2 characters'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  time_zone: z.string().min(1, 'Timezone is required'),
  publish: z.boolean(),
  status: z.string(),
});

interface LocationFormProps {
  initialData?: OCPILocation;
  onSuccess?: () => void;
}

const LocationForm = ({ initialData, onSuccess }: LocationFormProps) => {
  const isEditMode = !!initialData;
  const { create, update } = useLocations();
  const createLocation = create();
  const updateLocation = update();
  
  const { getAll: getParties } = useParties();
  const { data: parties, isLoading: loadingParties } = getParties();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party: initialData?.party || (parties && parties.length > 0 ? parties[0].id! : 0),
      location_id: initialData?.location_id || '',
      name: initialData?.name || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      postal_code: initialData?.postal_code || '',
      country: initialData?.country || '',
      coordinates: {
        latitude: initialData?.coordinates?.latitude || 0,
        longitude: initialData?.coordinates?.longitude || 0,
      },
      time_zone: initialData?.time_zone || 'UTC',
      publish: initialData?.publish || false,
      status: initialData?.status || 'ACTIVE',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateLocation.mutateAsync({ id: initialData.id, data: data as OCPILocation });
      } else {
        await createLocation.mutateAsync(data as OCPILocation);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="party"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Party</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString() || ''}
                disabled={loadingParties}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select party" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parties?.map((party: OCPIParty) => (
                    <SelectItem key={party.id} value={party.id!.toString()}>
                      {party.name} ({party.party_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Party that owns this location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location ID</FormLabel>
              <FormControl>
                <Input placeholder="Location identifier" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for this location
              </FormDescription>
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
                <Input placeholder="Location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal/ZIP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country code (e.g. US)" maxLength={2} {...field} />
                </FormControl>
                <FormDescription>
                  ISO 3166-1 alpha-2 country code
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coordinates.latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Latitude" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coordinates.longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Longitude" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="time_zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Zone</FormLabel>
              <FormControl>
                <Input placeholder="e.g. UTC, America/New_York" {...field} />
              </FormControl>
              <FormDescription>
                IANA time zone identifier
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="publish"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish</FormLabel>
                  <FormDescription>
                    Make this location visible to the public
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Current status of this location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createLocation.isPending || updateLocation.isPending}
        >
          {createLocation.isPending || updateLocation.isPending
            ? 'Saving...'
            : isEditMode ? 'Update Location' : 'Create Location'
          }
        </Button>
      </form>
    </Form>
  );
};

export default LocationForm;
