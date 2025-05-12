import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useParties } from '@/hooks/useOCPI';
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
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  FormLayout,
  FormSection,
  FormRow,
  FormActions
} from '@/components/ui/form-layout';
import { useAuth } from '@/hooks/useAuth';

interface PartyFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

const partyFormSchema = z.object({
  party_id: z.string().min(1, "Party ID is required"),
  name: z.string().min(1, "Name is required"),
  country_code: z.string().min(1, "Country code is required").max(2, "Country code must be 2 characters"),
  website: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
  logo_url: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
  roles: z.string().optional(),
});

type FormValues = z.infer<typeof partyFormSchema>;

const PartyForm = ({ initialData, onSuccess }: PartyFormProps) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { create, update } = useParties();
  const { user } = useAuth();
  
  const createParty = create();
  const updateParty = update();
  
  const isEditing = !!initialData;
  
  const defaultValues = initialData || {
    party_id: '',
    name: '',
    country_code: '',
    website: '',
    logo_url: '',
    roles: '',
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await updateParty.mutateAsync({ 
          id: initialData.id, 
          data: {
            ...values,
            party_id: values.party_id,
            name: values.name,
            country_code: values.country_code,
            website: values.website || '',
            roles: values.roles || '', // Ensure roles is not undefined
            user: initialData.user
          }
        });
        toast({
          title: "Party updated",
          description: "The party has been updated successfully.",
        });
      } else {
        // Add the current user's ID to the party data on creation
        // Ensure user.id is converted to a number
        const userId = typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id;
        
        await createParty.mutateAsync({
          ...values,
          party_id: values.party_id,
          name: values.name,
          country_code: values.country_code,
          website: values.website || '',
          roles: values.roles || '', // Ensure roles is not undefined
          user: userId as number
        });
        form.reset();
        toast({
          title: "Party created",
          description: "The party has been created successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error, "Failed to save party");
    }
  };
  
  return (
    <Form {...form}>
      <FormLayout onSubmit={form.handleSubmit(onSubmit)}>
        <FormSection title="Basic Information" description="Enter the party's basic details">
          <FormField
            control={form.control}
            name="party_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Unique identifier for this party</FormDescription>
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
                  <Input {...field} />
                </FormControl>
                <FormDescription>Display name for this party</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} />
                </FormControl>
                <FormDescription>ISO 3166-1 alpha-2 country code (e.g. US, GB)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
        
        <FormSection title="Additional Information">
          <FormRow>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>
          
          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roles</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="EMSP, CPO (comma-separated)"
                  />
                </FormControl>
                <FormDescription>Enter roles as comma-separated values</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
        
        <FormActions>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            disabled={isEditing ? updateParty.isPending : createParty.isPending}
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isEditing ? updateParty.isPending : createParty.isPending}
          >
            {isEditing ? (
              updateParty.isPending ? "Updating..." : "Update Party"
            ) : (
              createParty.isPending ? "Creating..." : "Create Party"
            )}
          </Button>
        </FormActions>
      </FormLayout>
    </Form>
  );
};

export default PartyForm;
