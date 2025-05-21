import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, Mail, Phone, Building, MapPin, Globe, Lock, Check,
  ArrowLeft, Save, X, CheckCircle, AlertTriangle, Loader2, Shield
} from 'lucide-react';
import { UserUpdatePayload, User as UserInterface } from '@/types/user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditTemplate } from '@/components/templates/edit/EditTemplate';

// Define schema based on the field mappings for Edit Form
const userEditSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_active: z.boolean().optional(),
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
  const [formError, setFormError] = useState<string | null>(null);
  
  // Fetch user data
  const { data: userData, isLoading, error } = getUser(id as string);

  // Initialize form with empty values
  const form = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      is_active: true,
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
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      // Ensure we're working with the right types
      const userDataTyped = userData as any;
      form.reset({
        email: userDataTyped.email || '',
        first_name: userDataTyped.first_name || '',
        last_name: userDataTyped.last_name || '',
        is_active: userDataTyped.is_active || false,
        profile: {
          phone_number: userDataTyped.profile?.phone_number || '',
          city: userDataTyped.profile?.city || '',
          state: userDataTyped.profile?.state || '',
          pin: userDataTyped.profile?.pin || '',
          address: userDataTyped.profile?.address || '',
          ocpi_party_id: userDataTyped.profile?.ocpi_party_id || '',
          ocpi_role: userDataTyped.profile?.ocpi_role as 'CPO' | 'eMSP' || undefined,
          ocpi_token: userDataTyped.profile?.ocpi_token || '',
        },
      });
    }
  }, [userData, form]);

  // Submit handler
  const onSubmit = async (data: UserEditForm) => {
    try {
      setFormError(null);
      
      if (!id) {
        throw new Error('User ID is missing');
      }
      
      // Prepare update payload
      const userPayload: UserUpdatePayload = {
        id: id, // Include the ID as required by the UserUpdatePayload type
        email: data.email,
        is_active: data.is_active,
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile,
      };
      
      // Call the update API - convert string ID to number as required by the API
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error(`Invalid user ID: ${id}`);
      }
      
      // Pass the userData as a partial User object matching the User interface from userService
      const result = await updateUser.mutateAsync({ 
        userId: numericId, 
        userData: {
          email: data.email,
          // is_active is not in the User type but is included in UserCreatePayload/UserUpdatePayload
          // first_name and last_name are from the form
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          // Ensure profile matches the UserProfile interface
          profile: data.profile ? {
            phone_number: data.profile.phone_number,
            city: data.profile.city,
            state: data.profile.state,
            pin: data.profile.pin,
            address: data.profile.address,
            ocpi_party_id: data.profile.ocpi_party_id,
            ocpi_role: data.profile.ocpi_role,
            ocpi_token: data.profile.ocpi_token,
            // Required fields
            is_phone_verified: userData?.profile?.is_phone_verified || false,
            is_email_verified: userData?.profile?.is_email_verified || false,
          } : null
        } 
      });
      
      if (result) {
        toast({
          title: "User Updated",
          description: "User account has been updated successfully",
        });
        
        // Navigate back to the user detail page
        navigate(`/users/${id}`);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setFormError(err instanceof Error ? err.message : String(err));
      
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "An error occurred while updating the user",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <EditTemplate
        title="Loading User..."
        subtitle={`User ID: ${id}`}
        description="Loading user information"
        icon={<User className="h-5 w-5" />}
        backPath="/users"
        isLoading={true}
        className="max-w-full container-fluid px-6"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </EditTemplate>
    );
  }

  // Render error state
  if (error) {
    return (
      <EditTemplate
        title="Error Loading User"
        subtitle={`User ID: ${id}`}
        description="There was a problem loading the user"
        icon={<User className="h-5 w-5" />}
        backPath="/users"
        error={error instanceof Error ? error.message : String(error)}
        className="max-w-full container-fluid px-6"
      >
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load user information"}
          </AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/users')}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
            <Button 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </Alert>
      </EditTemplate>
    );
  }

  return (
    <EditTemplate
      title={userData?.username || `User ${id}`}
      subtitle={`User ID: ${id}`}
      description="Edit user account information"
      icon={<User className="h-5 w-5" />}
      backPath="/users"
      isLoading={isLoading}
      isSubmitting={form.formState.isSubmitting}
      error={error instanceof Error ? error.message : error ? String(error) : formError}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }}
      className="max-w-full container-fluid px-6"
    >
      <Form {...form}>
        <div className="grid grid-cols-1 gap-6">
          {/* Basic Information Card */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Basic Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Primary account details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </span>
                          <Input placeholder="user@example.com" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Account Status */}
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Account Status</FormLabel>
                        <FormDescription>
                          Activate or deactivate this user account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* First Name */}
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
                
                {/* Last Name */}
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
          
          {/* Contact Information */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">User contact and address details</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Phone Number */}
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
                          <Input placeholder="+1 (555) 123-4567" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Address */}
                <div className="sm:col-span-2">
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
                            <Input placeholder="123 Main St" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* City */}
                <FormField
                  control={form.control}
                  name="profile.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* State */}
                <FormField
                  control={form.control}
                  name="profile.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* PIN/ZIP Code */}
                <FormField
                  control={form.control}
                  name="profile.pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN/ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94105" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* OCPI Information */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                OCPI Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Open Charge Point Interface settings</p>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
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
                  
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="profile.ocpi_token"
                    render={({ field }) => (
                      <FormItem>
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
              </div>
            </CardContent>
          </Card>
            

        </div>
      </Form>
    </EditTemplate>
  );
};

export default UserEditPage;
