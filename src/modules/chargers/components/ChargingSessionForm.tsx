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
import { useRouter } from '@/navigation/navigation';
import { useChargingSession } from '@/modules/chargers/hooks/useChargingSession';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form validation schema
const ChargingSessionFormSchema = z.object({
  connector: z.number().int().min(1, 'Connector ID is required'),
  transaction_id: z.number().int().optional(),
  start_time: z.string().min(1, 'Start time is required'),
  meter_start: z.number().min(0, 'Meter start value must be at least 0'),
  id_tag: z.number().int().min(1, 'ID tag is required'),
  auth_method: z.string().min(1, 'Auth method is required'),
  end_time: z.string().optional().nullable(),
  meter_stop: z.number().optional().nullable(),
  reason: z.string().optional().nullable(),
  limit: z.number().optional().nullable(),
  limit_type: z.enum(['KWH', 'AMOUNT']).optional().nullable(),
  reservation_id: z.number().optional().nullable(),
  stop_id_tag: z.number().optional().nullable(),
  ocpi_session_id: z.string().optional().nullable(),
  ocpi_emsp_id: z.string().optional().nullable()
});

export interface ChargingSessionFormProps {
  initialData?: z.infer<typeof ChargingSessionFormSchema>;
  isEdit?: boolean;
  id?: string | number;
  isLoading?: boolean;
}

export const ChargingSessionForm: React.FC<ChargingSessionFormProps> = ({
  initialData,
  isEdit = false,
  id,
  isLoading = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { createChargingSession, updateChargingSession } = useChargingSession();

  // Initialize form with default values or initial data
  const form = useForm<z.infer<typeof ChargingSessionFormSchema>>({
    resolver: zodResolver(ChargingSessionFormSchema),
    defaultValues: {
      ...initialData,
      connector: initialData?.connector ?? undefined,
      transaction_id: initialData?.transaction_id ?? undefined,
      start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().split('T')[0] : '',
      end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().split('T')[0] : null,
      meter_start: initialData?.meter_start ?? 0,
      meter_stop: initialData?.meter_stop ?? null,
      id_tag: initialData?.id_tag ?? undefined,
      auth_method: initialData?.auth_method ?? 'WHITELIST',
      reason: initialData?.reason ?? null,
      limit: initialData?.limit ?? null,
      limit_type: initialData?.limit_type ?? null,
      reservation_id: initialData?.reservation_id ?? null,
      stop_id_tag: initialData?.stop_id_tag ?? null,
      ocpi_session_id: initialData?.ocpi_session_id ?? null,
      ocpi_emsp_id: initialData?.ocpi_emsp_id ?? null,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof ChargingSessionFormSchema>) => {
    try {
      if (isEdit && id) {
        // Ensure id is converted to a number
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await updateChargingSession.mutateAsync({ id: numericId, ...values });
        toast({
          title: 'Charging Session Updated',
          description: 'The charging session has been successfully updated.',
        });
      } else {
        await createChargingSession.mutateAsync(values);
        toast({
          title: 'Charging Session Created',
          description: 'The charging session has been successfully created.',
        });
      }
      router.push('/chargers/charging-sessions');
    } catch (error) {
      console.error('Error saving charging session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save charging session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Connector */}
        <FormField
          control={form.control}
          name="connector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connector ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    field.onChange(value);
                  }}
                  disabled={isLoading || (isEdit && id !== undefined)}
                />
              </FormControl>
              <FormDescription>
                ID of the connector used for this session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction ID */}
        <FormField
          control={form.control}
          name="transaction_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    field.onChange(value);
                  }}
                  disabled={isLoading || isEdit}
                />
              </FormControl>
              <FormDescription>
                Unique transaction identifier (auto-generated if left empty)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Time */}
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                When the charging session started
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Time (optional) */}
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                When the charging session ended (leave blank for active sessions)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meter Start */}
        <FormField
          control={form.control}
          name="meter_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter Start (Wh)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    field.onChange(value);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Meter reading at the start of the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meter Stop (optional) */}
        <FormField
          control={form.control}
          name="meter_stop"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter Stop (Wh) (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined || field.value === null ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    field.onChange(value);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Meter reading at the end of the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ID Tag */}
        <FormField
          control={form.control}
          name="id_tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Tag</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    field.onChange(value);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                ID of the tag used to start the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auth Method */}
        <FormField
          control={form.control}
          name="auth_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Method</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select auth method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="WHITELIST">Whitelist</SelectItem>
                  <SelectItem value="RFID">RFID</SelectItem>
                  <SelectItem value="QR_CODE">QR Code</SelectItem>
                  <SelectItem value="APP">Mobile App</SelectItem>
                  <SelectItem value="OCPI">OCPI</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Method used to authenticate the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason (optional) */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason (optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Reason for starting or stopping the transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Limit (optional) */}
        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limit (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value === undefined || field.value === null ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    field.onChange(value);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Limit for the charging session (kWh or amount)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Limit Type (optional) */}
        <FormField
          control={form.control}
          name="limit_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limit Type (optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || undefined}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select limit type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="KWH">kWh</SelectItem>
                  <SelectItem value="AMOUNT">Amount</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Type of limit applied to the charging session
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
            onClick={() => router.push('/chargers/charging-sessions')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || createChargingSession.isPending || updateChargingSession.isPending}
          >
            {isLoading || createChargingSession.isPending || updateChargingSession.isPending ? 
              'Saving...' : isEdit ? 'Update Session' : 'Create Session'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChargingSessionForm;
