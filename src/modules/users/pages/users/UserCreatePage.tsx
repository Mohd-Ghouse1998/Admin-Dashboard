
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { UserCreatePayload } from '@/types/user';

// Define schema based on the field mappings for Create Form
const userCreateSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

type UserCreateForm = z.infer<typeof userCreateSchema>;

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createUser } = useUser();

  // Initialize form with default values
  const form = useForm<UserCreateForm>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
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

  // Submit handler
  const onSubmit = async (data: UserCreateForm) => {
    try {
      // Ensure data conforms to the UserCreatePayload type
      const userPayload: UserCreatePayload = {
        username: data.username, // Required
        email: data.email, // Required
        password: data.password, // Required
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile
      };
      
      await createUser(userPayload);
      
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout
      title="Create User"
      description="Add a new user to the system"
      backButton
      backTo="/users"
    >
      <Helmet>
        <title>Create User | Admin Dashboard</title>
      </Helmet>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
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
                  onClick={() => navigate('/users')}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default UserCreatePage;
