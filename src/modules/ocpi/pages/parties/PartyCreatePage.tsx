
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOCPIRole } from '../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../services';
import * as z from 'zod';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const partyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country_code: z.string().min(2, "Country code must be 2 characters").max(2).toUpperCase(),
  party_id: z.string().min(1, "Party ID is required").max(3, "Party ID must be max 3 characters").toUpperCase(),
  roles: z.array(z.string()).min(1, "At least one role must be selected"),
});

type PartyFormValues = z.infer<typeof partyFormSchema>;

const PartyCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestBackendSync } = useOCPIRole(); // Use requestBackendSync to update the role context after creating a party
  
  // State for tracking API interaction
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: '',
      country_code: '',
      party_id: '',
      roles: ['CPO'],
    },
  });

  const availableRoles = [
    { id: 'CPO', label: 'Charge Point Operator (CPO)' },
    { id: 'EMSP', label: 'E-Mobility Service Provider (EMSP)' },
  ];

  const onSubmit = async (data: PartyFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format the data as expected by the API
      // Using the 'parties' endpoint which is mapped to '/api/ocpi/api/parties/' in the service
      const response = await OCPIApiService.common.resources.parties.create({ 
        party_id: data.party_id,
        country_code: data.country_code,
        name: data.name,
        roles: data.roles
      });
      
      toast({
        title: "Party created successfully",
        description: `Your OCPI party ${data.name} has been created.`,
      });
      
      // Refresh the OCPI context to pick up the new party
      requestBackendSync();
      
      // Navigate to the appropriate next step
      if (data.roles.length === 1) {
        // If only one role, set it and go to the dashboard
        navigate(`/ocpi/${data.roles[0].toLowerCase()}/dashboard`);
      } else {
        // If multiple roles, go to the role selection page
        navigate('/ocpi/select-role');
      }
    } catch (err: any) {
      console.error('Failed to create party:', err);
      setError(err?.response?.data?.message || err?.message || 'An error occurred while creating the party');
      toast({
        variant: "destructive",
        title: "Failed to create party",
        description: err?.response?.data?.message || err?.message || 'An error occurred while creating the party',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Create OCPI Party"
      description="Register a new OCPI party connection"
      backButton
      backTo="/ocpi/cpo/parties"
    >
      <Card>
        <CardHeader>
          <CardTitle>New OCPI Party</CardTitle>
          <CardDescription>
            Fill in the details to create a new OCPI party connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter party name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} maxLength={2} />
                      </FormControl>
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
                        <Input placeholder="Enter party ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-3">
                <FormLabel>Roles</FormLabel>
                <FormDescription>Select at least one role for your party</FormDescription>
                
                {availableRoles.map((role) => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name="roles"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={role.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role.id)}
                              onCheckedChange={(checked) => {
                                const updatedRoles = checked
                                  ? [...field.value, role.id]
                                  : field.value?.filter((value: string) => value !== role.id);
                                field.onChange(updatedRoles);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              {role.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/ocpi/cpo/parties')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Party'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PartyCreatePage;
