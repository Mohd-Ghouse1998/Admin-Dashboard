
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/modules/users/hooks/useUser';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UserUpdatePayload } from '@/types/user';

// Define schema based on the field mappings for Edit Form
const userEditSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profile: z.object({
    phone_number: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pin: z.string().optional(),
    address: z.string().optional(),
    ocpi_party_id: z.string().optional(),
    ocpi_role: z.enum(['CPO', 'eMSP']).optional(),
    ocpi_token: z.string().optional(),
  }).optional(),
});

type UserEditForm = z.infer<typeof userEditSchema>;

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUser, updateUser } = useUser();

  const userId = id as string;
  const { data: user, isLoading, error } = getUser(userId);

  // Initialize form with empty values
  const form = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      profile: {
        phone_number: '',
        city: '',
        state: '',
        pin: '',
        address: '',
        ocpi_party_id: '',
        ocpi_role: undefined,
        ocpi_token: '',
      },
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        profile: {
          phone_number: user.profile?.phone_number || '',
          city: user.profile?.city || '',
          state: user.profile?.state || '',
          pin: user.profile?.pin || '',
          address: user.profile?.address || '',
          ocpi_party_id: user.profile?.ocpi_party_id || '',
          ocpi_role: user.profile?.ocpi_role as 'CPO' | 'eMSP' | undefined,
          ocpi_token: user.profile?.ocpi_token || '',
        },
      });
    }
  }, [user, form]);

  // Submit handler
  const onSubmit = async (data: UserEditForm) => {
    try {
      // Create a properly typed update payload with the required id field
      const updatePayload: UserUpdatePayload = {
        id: userId, // Required for updates
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile
      };
      
      await updateUser({
        id: userId,
        userData: updatePayload
      });
      
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      
      navigate(`/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Edit User"
        description="Update user information"
        backButton
        backTo={`/users/${userId}`}
      >
        <Helmet>
          <title>Edit User | Admin Dashboard</title>
        </Helmet>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Edit User"
        description="Update user information"
        backButton
        backTo={`/users/${userId}`}
      >
        <Helmet>
          <title>Edit User | Admin Dashboard</title>
        </Helmet>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load user details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout
        title="Edit User"
        description="Update user information"
        backButton
        backTo="/users"
      >
        <Helmet>
          <title>Edit User | Admin Dashboard</title>
        </Helmet>
        <Alert>
          <AlertTitle>User not found</AlertTitle>
          <AlertDescription>
            The requested user does not exist or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Edit User: ${user?.username}`}
      description="Update user information"
      backButton
      backTo={`/users/${userId}`}
    >
      <Helmet>
        <title>Edit User | Admin Dashboard</title>
      </Helmet>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only username field */}
                <FormItem>
                  <FormLabel>Username (read-only)</FormLabel>
                  <Input value={user.username} disabled />
                  <FormDescription>Username cannot be changed after creation</FormDescription>
                </FormItem>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Profile Details</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="profile.phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">OCPI Configuration</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="profile.ocpi_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select OCPI role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CPO">CPO</SelectItem>
                          <SelectItem value="eMSP">eMSP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Charge Point Operator (CPO) or eMobility Service Provider (eMSP)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.ocpi_party_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Party ID</FormLabel>
                      <FormControl>
                        <Input placeholder="PARTY-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profile.ocpi_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Token</FormLabel>
                      <FormControl>
                        <Input placeholder="OCPI Token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate(`/users/${userId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default UserEditPage;
