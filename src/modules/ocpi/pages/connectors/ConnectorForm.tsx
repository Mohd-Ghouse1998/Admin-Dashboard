
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
import { OCPIConnector } from '@/services/ocpiService';
import { useConnectors } from '@/hooks/useOCPI';

const formSchema = z.object({
  connector_id: z.string().min(1, 'Connector ID is required'),
  standard: z.string().min(1, 'Connector standard is required'),
  format: z.string().min(1, 'Connector format is required'),
  power_type: z.string().min(1, 'Power type is required'),
  max_voltage: z.number().min(1, 'Voltage is required'),
  max_amperage: z.number().min(1, 'Amperage is required'),
  max_electric_power: z.number().min(1, 'Power is required'),
  status: z.string().min(1, 'Status is required'),
  evse: z.number().int().positive('EVSE is required'),
});

interface ConnectorFormProps {
  initialData?: OCPIConnector;
  evseId: number;
  onSuccess?: () => void;
}

const ConnectorForm = ({ initialData, evseId, onSuccess }: ConnectorFormProps) => {
  const isEditMode = !!initialData;
  const { create, update } = useConnectors();
  const createConnector = create();
  const updateConnector = update();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connector_id: initialData?.connector_id || '',
      standard: initialData?.standard || 'IEC_62196_T2',
      format: initialData?.format || 'SOCKET',
      power_type: initialData?.power_type || 'AC_3_PHASE',
      max_voltage: initialData?.max_voltage || 400,
      max_amperage: initialData?.max_amperage || 32,
      max_electric_power: initialData?.max_electric_power || 22000,
      status: initialData?.status || 'AVAILABLE',
      evse: initialData?.evse || evseId,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateConnector.mutateAsync({ id: initialData.id, data: data as OCPIConnector });
      } else {
        await createConnector.mutateAsync(data as OCPIConnector);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving connector:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="connector_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID</FormLabel>
              <FormControl>
                <Input placeholder="Connector identifier" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for this connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector Standard</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IEC_62196_T1">Type 1</SelectItem>
                  <SelectItem value="IEC_62196_T2">Type 2</SelectItem>
                  <SelectItem value="IEC_62196_T3">Type 3</SelectItem>
                  <SelectItem value="IEC_62196_T2_COMBO">CCS (Combo 2)</SelectItem>
                  <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                  <SelectItem value="DOMESTIC_A">Domestic A</SelectItem>
                  <SelectItem value="DOMESTIC_B">Domestic B</SelectItem>
                  <SelectItem value="DOMESTIC_C">Domestic C</SelectItem>
                  <SelectItem value="DOMESTIC_D">Domestic D</SelectItem>
                  <SelectItem value="DOMESTIC_E">Domestic E</SelectItem>
                  <SelectItem value="DOMESTIC_F">Domestic F</SelectItem>
                  <SelectItem value="DOMESTIC_G">Domestic G</SelectItem>
                  <SelectItem value="DOMESTIC_H">Domestic H</SelectItem>
                  <SelectItem value="DOMESTIC_I">Domestic I</SelectItem>
                  <SelectItem value="DOMESTIC_J">Domestic J</SelectItem>
                  <SelectItem value="DOMESTIC_K">Domestic K</SelectItem>
                  <SelectItem value="DOMESTIC_L">Domestic L</SelectItem>
                  <SelectItem value="TESLA_R">Tesla Roadster</SelectItem>
                  <SelectItem value="TESLA_S">Tesla S</SelectItem>
                  <SelectItem value="IEC_60309_2_single_16">IEC 60309 2 single 16</SelectItem>
                  <SelectItem value="IEC_60309_2_three_16">IEC 60309 2 three 16</SelectItem>
                  <SelectItem value="IEC_60309_2_three_32">IEC 60309 2 three 32</SelectItem>
                  <SelectItem value="IEC_60309_2_three_64">IEC 60309 2 three 64</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The technical standard of the connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SOCKET">Socket</SelectItem>
                  <SelectItem value="CABLE">Cable</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The physical format of the connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="power_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Power Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select power type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AC_1_PHASE">AC 1 Phase</SelectItem>
                  <SelectItem value="AC_3_PHASE">AC 3 Phase</SelectItem>
                  <SelectItem value="DC">DC</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of power delivered by the connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="max_voltage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Voltage (V)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="Voltage" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="max_amperage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Amperage (A)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="Amperage" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="max_electric_power"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Power (W)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="Power" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Maximum power in Watts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
                Current status of this connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="evse"
          render={({ field }) => (
            <FormItem>
              <Input type="hidden" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createConnector.isPending || updateConnector.isPending}
        >
          {createConnector.isPending || updateConnector.isPending
            ? 'Saving...'
            : isEditMode ? 'Update Connector' : 'Create Connector'
          }
        </Button>
      </form>
    </Form>
  );
};

export default ConnectorForm;
