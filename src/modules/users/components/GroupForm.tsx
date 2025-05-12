
import React from 'react';
import { useForm } from 'react-hook-form';
import { Group } from '@/types/group'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';

interface GroupFormProps {
  group?: Group;
  onSubmit: (data: { name: string; description?: string }) => void;
  isSubmitting?: boolean;
}

export const GroupForm: React.FC<GroupFormProps> = ({ 
  group,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm({
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter group description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GroupForm;
