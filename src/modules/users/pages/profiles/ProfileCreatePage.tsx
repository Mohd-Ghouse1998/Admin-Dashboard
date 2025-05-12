
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Save } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import FormSection from '@/components/common/FormSection';

// Form schema validation
const formSchema = z.object({
  user: z.string({
    required_error: "User is required",
  }),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone_number: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});

const ProfileCreatePage = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch users for the user dropdown
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(accessToken),
    enabled: !!accessToken,
  });
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: "",
      email: "",
      phone_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      bio: "",
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

  return (
    <PageLayout
      title="Create Profile"
      description="Create a new user profile"
      backButton
      backTo="/users/profiles"
    >
      <Helmet>
        <title>Create Profile | Admin Dashboard</title>
      </Helmet>
      
      {usersError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {usersError instanceof Error ? usersError.message : 'Failed to load users data'}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="User Information" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      disabled={isLoadingUsers} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <SelectItem value="loading" disabled>Loading users...</SelectItem>
                        ) : users?.results ? (
                          users.results.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username || user.email}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No users available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
          
          <FormSection title="Address Information" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal/Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
          
          <FormSection title="Additional Information" className="mb-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={createProfileMutation.isPending}
              className="min-w-32"
            >
              {createProfileMutation.isPending ? (
                <>Creating profile...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default ProfileCreatePage;
