import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import { useConnector } from '@/modules/chargers/hooks/useConnector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form validation schema
const ConnectorFormSchema = z.object({
  connector_id: z.number().int().min(1, 'Connector ID must be at least 1'),
  status: z.enum(['Available', 'Charging', 'Faulted', 'Finishing', 'Preparing', 'Reserved', 'Unavailable']),
  type: z.enum(['CCS1', 'CCS2', 'CHAdeMO', 'Type1', 'Type2', 'GBT', 'Other']),
  charger: z.number().optional(),
});

export interface ConnectorFormProps {
  initialData?: z.infer<typeof ConnectorFormSchema>;
  isEdit?: boolean;
  id?: string | number;
  isLoading?: boolean;
}

export const ConnectorForm: React.FC<ConnectorFormProps> = ({
  initialData,
  isEdit = false,
  id,
  isLoading = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { createConnector, updateConnector } = useConnector();

  // Initialize form with default values or initial data
  const form = useForm<z.infer<typeof ConnectorFormSchema>>({
    resolver: zodResolver(ConnectorFormSchema),
    defaultValues: {
      ...initialData,
      connector_id: initialData?.connector_id ?? 1,
      status: initialData?.status ?? 'Available',
      type: initialData?.type ?? 'Type2',
      charger: initialData?.charger,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof ConnectorFormSchema>) => {
    try {
      if (isEdit && id) {
        await updateConnector.mutateAsync({ id, ...values });
        toast({
          title: 'Connector Updated',
          description: 'The connector has been successfully updated.',
        });
      } else {
        await createConnector.mutateAsync(values);
        toast({
          title: 'Connector Created',
          description: 'The connector has been successfully created.',
        });
      }
      router.push('/chargers/connectors');
    } catch (error) {
      console.error('Error saving connector:', error);
      toast({
        title: 'Error',
        description: 'Failed to save connector. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Connector ID */}
        <FormField
          control={form.control}
          name="connector_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || '')}
                  disabled={isLoading || (isEdit && id !== undefined)}
                />
              </FormControl>
              <FormDescription>
                Numeric identifier for the connector (usually starts from 1)
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Charging">Charging</SelectItem>
                  <SelectItem value="Faulted">Faulted</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current status of the connector
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
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
                  <SelectItem value="GBT">GBT</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Physical connector type
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Charger */}
        <FormField
          control={form.control}
          name="charger"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charger ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || '')}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The ID of the charger this connector belongs to (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/chargers/connectors')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || createConnector.isPending || updateConnector.isPending}
          >
            {isLoading || createConnector.isPending || updateConnector.isPending ? 
              'Saving...' : isEdit ? 'Update Connector' : 'Create Connector'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConnectorForm;
