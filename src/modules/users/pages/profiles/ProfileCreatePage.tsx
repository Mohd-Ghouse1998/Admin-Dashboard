
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, User, UsersRound, Mail, KeyRound, PhoneCall, 
  MapPin, Globe, Shield, Building, Home, Info
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import { CreateTemplate } from '@/components/templates/create/CreateTemplate';
import { DetailSection } from '@/components/templates/detail/DetailTemplate';

// Form schema validation
const formSchema = z.object({
  user: z.string({
    required_error: "User is required",
  }),
  // User information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  password_confirm: z.string(),
  
  // Profile information
  phone_number: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  pin: z.string().optional().or(z.literal('')),  // Changed from postal_code to match backend
  
  // OCPI fields
  ocpi_party_id: z.string().optional().or(z.literal('')),
  ocpi_role: z.string().optional().or(z.literal('')),
  ocpi_token: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords do not match",
  path: ["password_confirm"],
});

const ProfileCreatePage = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: usersResponse, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
    enabled: !!accessToken,
  });
  
  // Extract users from the paginated response
  const users = usersResponse?.results; // Access the results array directly
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirm: "",
      phone_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pin: "",
      ocpi_party_id: "",
      ocpi_role: "",
      ocpi_token: "",
    },
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return userService.createProfile(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile created successfully",
        variant: "success",
      });
      navigate("/users/profiles");
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProfileMutation.mutate(values);
  };
  
  // Handle form submission for the CreateTemplate
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <CreateTemplate
      title="Create New Profile"
      description="Create a new user profile with associated account details"
      icon={<User className="h-5 w-5" />}
      entityName="Profile"
      onSubmit={handleFormSubmit}
      isSubmitting={createProfileMutation.isPending}
      error={createProfileMutation.error ? "Error creating profile" : null}
      backPath="/users/profiles"
      className="max-w-full container-fluid px-6" // Override container class to use full width
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* User Account Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <UsersRound className="h-4 w-4 text-primary" />
                User Account
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Associate this profile with a user account</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Account</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!users || !Array.isArray(users) || users.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users && users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Account Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Basic account information</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <Separator className="my-2" />
                  <div className="text-sm font-medium mt-4 mb-2 text-primary flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Security Details
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password_confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Address Information Section */}
          <Card className="overflow-hidden border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Address Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">User location details (optional)</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        Street Address
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="110001" {...field} />
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
              <p className="text-xs text-muted-foreground mt-1">Open Charge Point Interface details (optional)</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ocpi_party_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        OCPI Party ID
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ocpi123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ocpi_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CPO">CPO</SelectItem>
                          <SelectItem value="eMSP">eMSP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ocpi_token"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>OCPI Token</FormLabel>
                      <FormControl>
                        <Input placeholder="token1234567" {...field} />
                      </FormControl>
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

export default ProfileCreatePage;
