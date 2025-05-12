
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OCPIEVSE } from '@/services/ocpiService';
import { useEVSEs } from '@/hooks/useOCPI';

const formSchema = z.object({
  uid: z.string().optional(),
  evse_id: z.string().min(1, 'EVSE ID is required'),
  status: z.string().min(1, 'Status is required'),
  location: z.number().int().positive('Location is required'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
});

interface EVSEFormProps {
  initialData?: OCPIEVSE;
  locationId?: number;
  onSuccess?: () => void;
}

const EVSEForm = ({ initialData, locationId, onSuccess }: EVSEFormProps) => {
  const isEditMode = !!initialData;
  const { create, update } = useEVSEs();
  const createEVSE = create();
  const updateEVSE = update();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: initialData?.uid || '',
      evse_id: initialData?.evse_id || '',
      status: initialData?.status || 'AVAILABLE',
      location: initialData?.location || locationId || 0,
      coordinates: initialData?.coordinates || undefined,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateEVSE.mutateAsync({ id: initialData.id, data: data as OCPIEVSE });
      } else {
        await createEVSE.mutateAsync(data as OCPIEVSE);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving EVSE:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="evse_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EVSE ID</FormLabel>
              <FormControl>
                <Input placeholder="EVSE identifier" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for this EVSE
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="uid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="UID" {...field} />
              </FormControl>
              <FormDescription>
                Optional unique identifier, if different from EVSE ID
              </FormDescription>
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
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="CHARGING">Charging</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="OUTOFORDER">Out of Order</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="REMOVED">Removed</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current status of this EVSE
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <Input type="hidden" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coordinates.latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Latitude" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Optional specific latitude if different from location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coordinates.longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="Longitude" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Optional specific longitude if different from location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createEVSE.isPending || updateEVSE.isPending}
        >
          {createEVSE.isPending || updateEVSE.isPending
            ? 'Saving...'
            : isEditMode ? 'Update EVSE' : 'Create EVSE'
          }
        </Button>
      </form>
    </Form>
  );
};

export default EVSEForm;
