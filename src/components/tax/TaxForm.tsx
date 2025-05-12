import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TaxTemplateCreateUpdatePayload } from '@/services/taxService';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rate: z.coerce.number().min(0, "Rate must be greater than or equal to 0").max(100, "Rate cannot exceed 100%"),
  description: z.string().optional(),
  jurisdiction: z.string().optional(),
  tax_type: z.enum(['VAT', 'GST', 'Sales', 'Other']),
  is_active: z.boolean().default(true),
});

interface TaxFormProps {
  initialData?: TaxTemplateCreateUpdatePayload & { id?: string };
  onSubmit: (data: TaxTemplateCreateUpdatePayload) => void;
  isSubmitting: boolean;
}

const TaxForm = ({ initialData, onSubmit, isSubmitting }: TaxFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      rate: initialData?.rate || 0,
      description: initialData?.description || '',
      jurisdiction: initialData?.jurisdiction || '',
      tax_type: initialData?.tax_type || 'VAT',
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure all required fields are present
    const payload: TaxTemplateCreateUpdatePayload = {
      name: values.name,
      rate: values.rate,
      tax_type: values.tax_type,
      description: values.description,
      jurisdiction: values.jurisdiction,
      is_active: values.is_active,
    };
    
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Tax template name" {...field} />
              </FormControl>
              <FormDescription>
                Enter a descriptive name for this tax template
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Tax rate as a percentage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="Sales">Sales Tax</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of tax this template represents
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jurisdiction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jurisdiction (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., USA, New York, EU" {...field} />
              </FormControl>
              <FormDescription>
                The geographical area this tax applies to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this tax template" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Set whether this tax template is currently active
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

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Tax Template" : "Create Tax Template"}
        </Button>
      </form>
    </Form>
  );
};

export default TaxForm;
