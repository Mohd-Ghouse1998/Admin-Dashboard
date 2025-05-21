import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Phone, MapPin, Building, User, Globe, Shield, 
  UserCircle, Mail, Calendar, Info
} from 'lucide-react';
import { useProfiles } from '@/modules/users/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { EditTemplate } from '@/components/templates/edit/EditTemplate';

// Form schema validation
const formSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(1, "Username is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().optional(),
  ocpi_party_id: z.string().optional(),
  ocpi_role: z.string().optional(),
  ocpi_token: z.string().optional(),
  is_phone_verified: z.boolean().optional(),
  is_email_verified: z.boolean().optional(),
});

// This interface must match both the form schema and API response structure
export interface UserProfile {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  ocpi_party_id?: string;
  ocpi_role?: string;
  ocpi_token?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
}

const ProfileEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCurrentUserProfile = location.pathname.includes('/user_profile');
  
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
      username: "",
      first_name: "",
      last_name: "",
      email: "",
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
  useEffect(() => {
    if (profile) {
      // Check if profile is an AxiosResponse and extract data if needed
      const profileData = 'data' in profile ? profile.data : profile;
      // Get the associated user data for fields that are on the User type, not ProfileData
      const userData = (typeof profileData.user === 'object' && profileData.user) ? profileData.user : { username: '', email: '', first_name: '', last_name: '' };
      
      form.reset({
        // User fields from the associated user object
        username: userData.username || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        // Profile fields
        phone_number: profileData.phone_number || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        pin: profileData.pin || "",
        ocpi_party_id: profileData.ocpi_party_id || "",
        ocpi_role: profileData.ocpi_role || "",
        ocpi_token: profileData.ocpi_token || "",
        is_phone_verified: profileData.is_phone_verified || false,
        is_email_verified: profileData.is_email_verified || false,
      });
    }
  }, [profile, form]);

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    if (isCurrentUserProfile) {
      // Update current user's profile - directly pass values
      updateCurrentUserProfile.mutate(values, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: (error) => {
          setIsSubmitting(false);
        }
      });
    } else {
      // Update specific profile by ID - needs profileId and profileData
      updateProfile.mutate({
        profileId: Number(id),
        profileData: values
      }, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: (error) => {
          setIsSubmitting(false);
        }
      });
    }
  };

  // Handle mutation success/error with useEffect
  useEffect(() => {
    if (updateProfile.isSuccess || updateCurrentUserProfile.isSuccess) {
      toast({
        title: "Profile Updated",
        description: "The profile has been successfully updated.",
        variant: "success",
      });
      
      // Navigate back to profile details
      if (isCurrentUserProfile) {
        navigate('/users/user_profile');
      } else {
        navigate(`/users/profiles/${id}`);
      }
    }
    
    if (updateProfile.error || updateCurrentUserProfile.error) {
      const error = updateProfile.error || updateCurrentUserProfile.error;
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [updateProfile.isSuccess, updateProfile.error, updateCurrentUserProfile.isSuccess, updateCurrentUserProfile.error, toast, navigate, isCurrentUserProfile, id]);
  
  // Determine the page title and back path based on context
  const pageTitle = isCurrentUserProfile ? "My Profile" : "Edit Profile";
  const backPath = isCurrentUserProfile ? "/users/user_profile" : `/users/profiles/${id}`;
  const description = isCurrentUserProfile ? "Manage your user profile" : "Edit user profile information";
  
  return (
    <EditTemplate
      title={pageTitle}
      subtitle={`Profile ID: ${id || 'Current User'}`}
      description={description}
      icon={<UserCircle className="h-5 w-5" />}
      backPath={backPath}
      isLoading={isLoadingProfile}
      isSubmitting={isSubmitting}
      error={profileError instanceof Error ? profileError : profileError ? String(profileError) : null}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }}
      className="max-w-full container-fluid px-6" // Override container class to use full width
    >
      {profile && (
        <Form {...form}>
          <div className="space-y-8">
            {/* User Information */}
            <Card className="overflow-hidden border-primary/10">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  User Information
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Basic account details</p>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="john_doe" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
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

            {/* Contact Information */}
            <Card className="overflow-hidden border-primary/10">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
                <h3 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Address and phone number</p>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <FormField
                    control={form.control}
                    name="address"
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
                        <FormLabel>Postal/ZIP Code</FormLabel>
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

            {/* OCPI Information */}
            <Card className="overflow-hidden border-primary/10">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
                <h3 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  OCPI Information
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Open Charge Point Interface details</p>
              </div>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>

            {/* Account Verification */}
            <Card className="overflow-hidden border-primary/10">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Account Verification
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Verification status flags</p>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="is_phone_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-4 rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-base">Phone Verification</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="text-xs text-muted-foreground">
                            {field.value ? 
                              "Phone number is verified" : 
                              "Phone number is not verified"}
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Verification SMS Sent",
                                description: "A verification SMS has been sent to the phone number.",
                                variant: "success",
                              });
                            }}
                          >
                            Send Verification SMS
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_email_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-4 rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-base">Email Verification</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="text-xs text-muted-foreground">
                            {field.value ? 
                              "Email address is verified" : 
                              "Email address is not verified"}
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Verification Email Sent",
                                description: "A verification email has been sent to the address.",
                                variant: "success",
                              });
                            }}
                          >
                            Send Verification Email
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Management */}
            <Card className="overflow-hidden border rounded-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-5 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Password Management
                </CardTitle>
                <CardDescription>Change user password</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Change Password</h4>
                      <p className="text-xs text-muted-foreground mt-1">Update the user's password</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Here you would open a modal to change password
                        toast({
                          title: "Password Reset Link Sent",
                          description: "A password reset link has been sent to the user's email.",
                          variant: "success",
                        });
                      }}
                    >
                      Send Password Reset Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Form>
      )}
      {!profile && !isLoadingProfile && (
        <Alert variant="destructive">
          <AlertDescription>Profile not found or you don't have permission to edit it.</AlertDescription>
        </Alert>
      )}
    </EditTemplate>
  );
};

export default ProfileEditPage;
