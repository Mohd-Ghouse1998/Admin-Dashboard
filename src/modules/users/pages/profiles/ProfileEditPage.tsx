
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Save } from 'lucide-react';
import { useProfiles } from '@/modules/users/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';
import FormSection from '@/components/common/FormSection';

// Form schema validation
const formSchema = z.object({
  phone_number: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pin: z.string().optional().or(z.literal('')),
  ocpi_party_id: z.string().optional().or(z.literal('')),
  ocpi_role: z.string().optional().or(z.literal('')),
  ocpi_token: z.string().optional().or(z.literal('')),
  is_phone_verified: z.boolean().optional(),
  is_email_verified: z.boolean().optional(),
});

const ProfileEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're editing the current user profile or a specific profile
  const isCurrentUserProfile = location.pathname.includes('/user_profile');
  
  console.log('ProfileEditPage - isCurrentUserProfile:', isCurrentUserProfile);
  console.log('ProfileEditPage - pathname:', location.pathname);
  
  // Use our profiles hook
  const { getProfile, updateProfile, getCurrentUserProfile, updateCurrentUserProfile } = useProfiles();
  
  // Fetch profile details - either current user's profile or a specific profile by ID
  const { 
    data: profile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = isCurrentUserProfile ? getCurrentUserProfile() : getProfile(id || '');
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      address: "",
      city: "",
      state: "",
      pin: "",
      ocpi_party_id: "",
      ocpi_role: "",
      ocpi_token: "",
      is_phone_verified: false,
      is_email_verified: false,
    },
  });

  // Update form with profile data when loaded
  React.useEffect(() => {
    if (profile) {
      form.reset({
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pin: profile.pin || "",
        ocpi_party_id: profile.ocpi_party_id || "",
        ocpi_role: profile.ocpi_role || "",
        ocpi_token: profile.ocpi_token || "",
        is_phone_verified: profile.is_phone_verified || false,
        is_email_verified: profile.is_email_verified || false,
      });
    }
  }, [profile, form]);

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isCurrentUserProfile) {
      // Update current user's profile
      console.log('Updating current user profile with:', values);
      updateCurrentUserProfile.mutate(values);
    } else if (id) {
      // Update specific profile by ID
      console.log('Updating profile', id, 'with:', values);
      updateProfile.mutate({
        profileId: Number(id),
        profileData: values
      });
    }
  };
  
  // Handle mutation success/error with useEffect
  React.useEffect(() => {
    if (updateProfile.isSuccess || updateCurrentUserProfile.isSuccess) {
      const redirectPath = isCurrentUserProfile ? '/users/user_profile' : `/users/profiles/${id}`;
      navigate(redirectPath);
      toast({
        title: 'Profile Updated',
        description: 'Profile information has been updated successfully.',
      });
    }
  }, [updateProfile.isSuccess, updateCurrentUserProfile.isSuccess, navigate, id, isCurrentUserProfile, toast]);

  return (
    <PageLayout
      title={isCurrentUserProfile ? "Edit My Profile" : "Edit Profile"}
      description={isCurrentUserProfile ? "Update your profile information" : profile ? `Editing profile for user ID: ${profile.user}` : "Edit profile details"}
      backButton
      backTo={isCurrentUserProfile ? "/users/user_profile" : `/users/profiles/${id}`}
    >
      <Helmet>
        <title>Edit Profile | Admin Dashboard</title>
      </Helmet>
      
      {profileError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {profileError instanceof Error ? profileError.message : 'Failed to load profile data'}
          </AlertDescription>
        </Alert>
      )}

      {isLoadingProfile ? (
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Contact Information" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+911234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_phone_verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value as boolean}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Phone Verified</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_email_verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value as boolean}
                          onChange={field.onChange}
                          className="h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Email Verified</FormLabel>
                      </div>
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
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN</FormLabel>
                      <FormControl>
                        <Input placeholder="110001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>
            
            <FormSection title="OCPI Information" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ocpi_party_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Party ID</FormLabel>
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
                      <FormControl>
                        <Input placeholder="CPO" {...field} />
                      </FormControl>
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
            </FormSection>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfile.isPending}
                className="min-w-32"
              >
                {updateProfile.isPending ? (
                  <>Updating profile...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </PageLayout>
  );
};

export default ProfileEditPage;
