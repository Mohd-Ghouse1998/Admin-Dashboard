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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import { useIdTag } from '@/hooks/useIdTag';

// Define the form validation schema
const IdTagFormSchema = z.object({
  idtag: z.string().min(1, 'ID Tag is required'),
  parent_idtag: z.string().optional().nullable(),
  is_blocked: z.boolean().default(false),
  expiry_date: z.string().optional().nullable(),
});

export interface IdTagFormProps {
  initialData?: z.infer<typeof IdTagFormSchema>;
  isEdit?: boolean;
  id?: string | number;
  isLoading?: boolean;
}

export const IdTagForm: React.FC<IdTagFormProps> = ({
  initialData,
  isEdit = false,
  id,
  isLoading = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { createIdTag, updateIdTag } = useIdTag();

  // Initialize form with default values or initial data
  const form = useForm<z.infer<typeof IdTagFormSchema>>({
    resolver: zodResolver(IdTagFormSchema),
    defaultValues: {
      ...initialData,
      idtag: initialData?.idtag ?? '',
      parent_idtag: initialData?.parent_idtag ?? '',
      is_blocked: initialData?.is_blocked ?? false,
      expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof IdTagFormSchema>) => {
    try {
      if (isEdit && id) {
        await updateIdTag.mutateAsync({ id, ...values });
        toast({
          title: 'ID Tag Updated',
          description: 'The ID tag has been successfully updated.',
        });
      } else {
        await createIdTag.mutateAsync(values);
        toast({
          title: 'ID Tag Created',
          description: 'The ID tag has been successfully created.',
        });
      }
      router.push('/chargers/id-tags');
    } catch (error) {
      console.error('Error saving ID tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to save ID tag. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ID Tag */}
        <FormField
          control={form.control}
          name="idtag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Tag</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter ID tag" 
                  {...field} 
                  disabled={isLoading || (isEdit && id !== undefined)}
                />
              </FormControl>
              <FormDescription>
                Unique identifier for the ID tag (e.g., RFID card number)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent ID Tag */}
        <FormField
          control={form.control}
          name="parent_idtag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent ID Tag</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter parent ID tag (optional)" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Optional parent ID tag for hierarchical organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Blocked */}
        <FormField
          control={form.control}
          name="is_blocked"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Block ID Tag</FormLabel>
                <FormDescription>
                  If checked, this ID tag will be blocked from use
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expiry Date */}
        <FormField
          control={form.control}
          name="expiry_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Date when this ID tag will expire (optional)
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
            onClick={() => router.push('/chargers/id-tags')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update ID Tag' : 'Create ID Tag'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IdTagForm;
