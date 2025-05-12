import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, InfoIcon, CheckCircle, XCircle, Settings, ChevronRight, ArrowRight, Edit, Loader2 } from 'lucide-react';
import { OCPIApiService } from '../services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Interface for OCPI Party
interface OCPIParty {
  id?: number;
  party_id: string;
  country_code: string;
  name: string;
  website?: string;
  ocpi_token?: string;
  roles?: string[];
  status?: string;
  user?: number;
}

// Party form validation schema
const partyFormSchema = z.object({
  party_id: z.string().length(3, { message: "Party ID must be exactly 3 characters" }),
  country_code: z.string().length(2, { message: "Country code must be exactly 2 characters" }),
  name: z.string().min(2, { message: "Organization name is required" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, { message: "At least one role must be selected" })
});

type PartyFormValues = z.infer<typeof partyFormSchema>;

export const RoleSwitcherPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, syncRoleWithBackend } = useOCPIRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for party and role management
  const [selectedRole, setSelectedRole] = useState<string | null>(role);
  const [showPartyForm, setShowPartyForm] = useState(false);
  
  // Form for party creation
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      party_id: '',
      country_code: '',
      name: '',
      website: '',
      roles: ['CPO', 'EMSP']
    }
  });
  
  // Query to check if user has an OCPI party and available roles
  const { data: userRoleData, isLoading: isLoadingRoles, error: roleError, refetch: refetchRoles } = useQuery({
    queryKey: ['ocpi', 'user-role'],
    queryFn: async () => {
      try {
        const response = await OCPIApiService.roles.getCurrent();
        return response;
      } catch (error) {
        console.error('Error fetching user role data:', error);
        throw error;
      }
    }
  });
  
  // Mutation for creating a new party
  const createPartyMutation = useMutation({
    mutationFn: async (partyData: PartyFormValues) => {
      const response = await OCPIApiService.common.resources.parties.create({
        party_id: partyData.party_id.toUpperCase(),
        country_code: partyData.country_code.toUpperCase(),
        name: partyData.name,
        website: partyData.website || undefined,
        roles: partyData.roles
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'OCPI Party Created',
        description: 'Your OCPI party has been created successfully.'
      });
      // Refetch roles to update the UI
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'user-role'] });
      refetchRoles();
      setShowPartyForm(false);
    },
    onError: (error: any) => {
      console.error('Error creating party:', error);
      toast({
        title: 'Error Creating Party',
        description: error.response?.data?.message || 'An error occurred while creating your OCPI party.',
        variant: 'destructive'
      });
    }
  });
  
  // Check if the user has a party based on the API response
  const hasParty = userRoleData?.party?.id ? true : false;
  
  // Available roles from the API response
  const availableRoles = userRoleData?.available_roles || [];
  
  // Handle form submission for party creation
  const onSubmitPartyForm = (values: PartyFormValues) => {
    createPartyMutation.mutate(values);
  };
  
  // Handle continuing with selected role
  const handleContinue = async () => {
    if (!selectedRole) {
      toast({
        title: 'Role Required',
        description: 'Please select a role to continue.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Switch role in the backend
      await OCPIApiService.roles.switchRole(selectedRole as 'CPO' | 'EMSP');
      
      // Update local context
      await syncRoleWithBackend(selectedRole);
      
      // Navigate to the appropriate dashboard
      navigate(selectedRole === 'CPO' ? '/ocpi/cpo/dashboard' : '/ocpi/emsp/dashboard');
    } catch (error) {
      console.error('Error switching role:', error);
      toast({
        title: 'Error Switching Role',
        description: 'An error occurred while switching to the selected role.',
        variant: 'destructive'
      });
    }
  };
     
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">OCPI Role Selection</h1>
      
      {isLoadingRoles ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading OCPI Configuration...</span>
        </div>
      ) : roleError ? (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 my-6">
          <h2 className="text-lg font-medium text-red-800 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Error Loading OCPI Configuration
          </h2>
          <p className="mt-2 text-red-700">
            There was a problem loading your OCPI configuration. Please try again later.
          </p>
          <Button onClick={() => refetchRoles()} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Party Information Section */}
          {hasParty ? (
            <Card className="mb-6 mt-4">
              <CardHeader>
                <CardTitle>Party Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-base">
                      <span className="font-medium">Party:</span> {userRoleData?.party?.name} ({userRoleData?.party?.party_id}, {userRoleData?.party?.country_code})
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Party
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 mt-4">
              <CardHeader>
                <CardTitle>Create OCPI Party</CardTitle>
                <CardDescription>You need to create an OCPI party before you can select a role</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitPartyForm)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="party_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Party ID</FormLabel>
                            <FormControl>
                              <Input placeholder="JLP" {...field} maxLength={3} />
                            </FormControl>
                            <FormDescription>3 character code</FormDescription>
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
                              <Input placeholder="IN" {...field} maxLength={2} />
                            </FormControl>
                            <FormDescription>ISO 3166-1 alpha-2</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Joulepoint" {...field} />
                          </FormControl>
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
                            <Input placeholder="https://joulepoint.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={createPartyMutation.isPending}>
                      {createPartyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Party...
                        </>
                      ) : (
                        'Create Party'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Role Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
              <CardDescription>Choose which role you want to operate as</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPO Card */}
                <Card className={`border-2 ${selectedRole === 'CPO' ? 'border-blue-500' : 'border-gray-200'} transition-all`}>
                  <CardHeader className={`${selectedRole === 'CPO' ? 'bg-blue-50/50' : ''} transition-colors`}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle>CPO</CardTitle>
                    </div>
                    {role === 'CPO' && (
                      <Badge variant="outline" className="ml-auto border-blue-500 text-blue-600">Current Role</Badge>
                    )}
                    <CardDescription>
                      Charge Point Operator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Manage stations</li>
                      <li>Set tariffs</li>
                      <li>Process sessions</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={selectedRole === 'CPO' ? "outline" : "default"} 
                      className={`w-full ${selectedRole === 'CPO' ? 'border-blue-500 text-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={!hasParty}
                      onClick={() => setSelectedRole('CPO')}
                    >
                      {!hasParty ? (
                        'Create Party to Enable'
                      ) : selectedRole === 'CPO' ? (
                        'Selected'
                      ) : (
                        'Select CPO'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* EMSP Card */}
                <Card className={`border-2 ${selectedRole === 'EMSP' ? 'border-green-500' : 'border-gray-200'} transition-all`}>
                  <CardHeader className={`${selectedRole === 'EMSP' ? 'bg-green-50/50' : ''} transition-colors`}>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-600" />
                      <CardTitle>EMSP</CardTitle>
                    </div>
                    {role === 'EMSP' && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-600">Current Role</Badge>
                    )}
                    <CardDescription>
                      E-Mobility Service Provider
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Manage tokens</li>
                      <li>Access networks</li>
                      <li>Control sessions</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={selectedRole === 'EMSP' ? "outline" : "default"} 
                      className={`w-full ${selectedRole === 'EMSP' ? 'border-green-500 text-green-600' : 'bg-green-600 hover:bg-green-700'}`}
                      disabled={!hasParty}
                      onClick={() => setSelectedRole('EMSP')}
                    >
                      {!hasParty ? (
                        'Create Party to Enable'
                      ) : selectedRole === 'EMSP' ? (
                        'Selected'
                      ) : (
                        'Select EMSP'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {/* Continue Button - Only show when party exists and role is selected */}
          {hasParty && selectedRole && (
            <div className="mt-6 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleContinue}
                className="px-8"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Make sure we have a default export for the router
export default RoleSwitcherPage;
