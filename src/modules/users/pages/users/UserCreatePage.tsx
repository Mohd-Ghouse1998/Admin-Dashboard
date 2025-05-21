import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, Mail, Phone, Building, MapPin, Globe, Lock, 
  ArrowLeft, Save, X, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { UserCreatePayload } from '@/types/user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreateTemplate } from '@/components/templates/create/CreateTemplate';

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
  const [formError, setFormError] = React.useState<string | null>(null);
  
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
      setFormError(null);
      
      // Ensure data conforms to the UserCreatePayload type
      const userPayload: UserCreatePayload = {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile
      };
      
      // Use the createUser mutation
      await createUser.mutateAsync(userPayload as any);
      
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      
      setFormError(error instanceof Error ? error.message : 'Failed to create user');
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  return (
    <CreateTemplate
      title="Create New User"
      description="Create a new user with associated account details"
      icon={<User className="h-5 w-5" />}
      entityName="User"
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={form.formState.isSubmitting}
      error={formError}
      backPath="/users"
      className="max-w-full container-fluid px-6" // Override container class to use full width
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* Account Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Account Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Create the user's login credentials and basic account details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <User className="h-4 w-4" />
                          </span>
                          <Input className="pl-9" placeholder="johndoe" {...field} />
                        </div>
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
                      <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </span>
                          <Input className="pl-9" placeholder="john.doe@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </span>
                          <Input 
                            className="pl-9" 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Address and contact details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="profile.phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                          </span>
                          <Input className="pl-9" placeholder="+1 (555) 123-4567" {...field} />
                        </div>
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
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <Input className="pl-9" placeholder="123 Main Street" {...field} />
                        </div>
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
                      <FormLabel>PIN / ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* OCPI Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                OCPI Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Open Charge Point Interface (OCPI) settings</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select OCPI role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CPO">Charge Point Operator (CPO)</SelectItem>
                          <SelectItem value="eMSP">eMobility Service Provider (eMSP)</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormItem className="col-span-2">
                      <FormLabel>OCPI Token</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </span>
                          <Input className="pl-9 font-mono text-sm" placeholder="OCPI Token" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        This token will be used for API authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </CreateTemplate>
  );
};

export default UserCreatePage;
