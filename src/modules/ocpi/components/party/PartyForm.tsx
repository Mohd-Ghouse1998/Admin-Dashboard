
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
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ocpiApi } from '@/api/ocpi.api';
import { OCPIParty } from '@/types/ocpi.types';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Define the form schema with Zod
const formSchema = z.object({
  party_id: z.string().min(1, { message: 'Party ID is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  country_code: z.string().min(2, { message: 'Country code is required' }).max(2, { message: 'Country code must be 2 characters' }),
  website: z.string().optional(),
  roles: z.string().optional(),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartyFormProps {
  initialData?: OCPIParty;
  onSuccess: () => void;
}

const PartyForm = ({ initialData, onSuccess }: PartyFormProps) => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const isEditMode = Boolean(initialData);
  
  const defaultValues: FormValues = {
    party_id: initialData?.party_id || '',
    name: initialData?.name || '',
    country_code: initialData?.country_code || '',
    website: initialData?.website || '',
    roles: Array.isArray(initialData?.roles) ? initialData?.roles.join(', ') : (initialData?.roles || ''),
    logo_url: initialData?.logo?.url || '',
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      // Prepare the data for API submission
      const partyData: any = {
        party_id: data.party_id,
        name: data.name,
        country_code: data.country_code,
        website: data.website || '',
        roles: data.roles || '',
        user: user?.id || 1, // Fallback to 1 if user ID is not available
      };
      
      // Add logo if provided
      if (data.logo_url) {
        partyData.logo_url = data.logo_url;
      }
      
      if (isEditMode && initialData?.id) {
        // Update existing party
        await ocpiApi.parties.update(initialData.id, partyData as OCPIParty);
      } else {
        // Create new party
        await ocpiApi.parties.create(partyData as OCPIParty);
      }
      
      onSuccess();
    } catch (error) {
      handleError(error, 'Failed to save the party');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="party_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this party
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
                      <Input placeholder="e.g., Example Energy" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name of this party
                    </FormDescription>
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
                      <Input placeholder="e.g., US" {...field} maxLength={2} />
                    </FormControl>
                    <FormDescription>
                      ISO 3166-1 alpha-2 country code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The party's website URL (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CPO, EMSP" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of roles (optional)
                    </FormDescription>
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
                      <Input placeholder="e.g., https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to the party's logo image (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="submit">
                {isEditMode ? 'Update Party' : 'Create Party'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PartyForm;
