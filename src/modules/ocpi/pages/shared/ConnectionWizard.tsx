import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { OCPIApiService } from '../../services';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';

// Define form schema
const connectionFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  url: z.string().url('Please enter a valid URL'),
  country_code: z.string().length(2, 'Country code must be exactly 2 characters'),
  party_id: z.string().min(3, 'Party ID must be at least 3 characters'),
  token: z.string().min(8, 'Token must be at least 8 characters'),
  ocpi_version: z.enum(['2.1.1', '2.2', '2.2.1']),
});

type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

interface ConnectionWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ConnectionWizard: React.FC<ConnectionWizardProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const [isRegistering, setIsRegistering] = useState(false);

  // Form with default values
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: '',
      url: 'https://',
      country_code: '',
      party_id: '',
      token: '',
      ocpi_version: '2.2',
    },
  });

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (data: ConnectionFormValues) => {
      setIsRegistering(true);
      
      try {
        // Add the current role to the request
        const requestData = {
          ...data,
          role_type: role, // Current user's role
        };
        
        const response = await OCPIApiService.common.connections.create(requestData);
        return response;
      } finally {
        setIsRegistering(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Connection Created',
        description: 'The OCPI connection was successfully created.',
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create connection: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: ConnectionFormValues) => {
    createConnectionMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="My OCPI Connection" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name to identify this connection
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Versions URL</FormLabel>
              <FormControl>
                <Input placeholder="https://ocpi-endpoint.example.com/ocpi/versions" {...field} />
              </FormControl>
              <FormDescription>
                The OCPI versions endpoint URL of the other party
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input placeholder="NL" maxLength={2} {...field} />
                </FormControl>
                <FormDescription>
                  ISO-3166 alpha-2 country code
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="party_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party ID</FormLabel>
                <FormControl>
                  <Input placeholder="EXA" {...field} />
                </FormControl>
                <FormDescription>
                  ID of the other party (max 3 chars)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Token</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Token for authorization with the external party
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ocpi_version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OCPI Version</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select OCPI version" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="2.1.1">2.1.1</SelectItem>
                  <SelectItem value="2.2">2.2</SelectItem>
                  <SelectItem value="2.2.1">2.2.1</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The OCPI protocol version to use
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createConnectionMutation.isPending || isRegistering}>
            {(createConnectionMutation.isPending || isRegistering) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Connection
          </Button>
        </div>
      </form>
    </Form>
  );
};
