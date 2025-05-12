
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/modules/users/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2 } from "lucide-react";
import { UserCreatePayload, UserUpdatePayload } from "@/types/user";

// Form schema
const userFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_active: z.boolean().default(true),
  is_staff: z.boolean().default(false),
  is_superuser: z.boolean().default(false),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  confirm_password: z
    .string()
    .optional()
    .or(z.literal("")),
  phone_number: z.string().optional(),
  company: z.string().optional(),
});

// Resolve the form type from the schema
type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormPageProps {
  mode: "create" | "edit";
}

const UserFormPage: React.FC<UserFormPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");

  const {
    getUser,
    createUser,
    updateUser,
    isCreatingUser,
    isUpdatingUser,
  } = useUser();

  // If editing, fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = mode === "edit" && id ? getUser(id) : { data: null, isLoading: false, error: null };

  // Set up form with validation
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      is_active: true,
      is_staff: false,
      is_superuser: false,
      password: "",
      confirm_password: "",
      phone_number: "",
      company: "",
    },
  });

  // When user data is loaded, update the form
  useEffect(() => {
    if (mode === "edit" && userData) {
      form.reset({
        username: userData.username,
        email: userData.email || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        is_active: userData.is_active,
        is_staff: userData.is_staff,
        is_superuser: userData.is_superuser,
        password: "",
        confirm_password: "",
        phone_number: userData.profile?.phone_number || "",
        company: userData.company || "",
      });
    }
  }, [userData, form, mode]);

  // Form submission handler
  const onSubmit = async (values: UserFormValues) => {
    // Check if passwords match when password is provided
    if (values.password && values.password !== values.confirm_password) {
      form.setError("confirm_password", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      if (mode === "create") {
        const createPayload: UserCreatePayload = {
          username: values.username, // Required field
          email: values.email, // Required field
          password: values.password || "", // Required field
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active,
          is_staff: values.is_staff,
          is_superuser: values.is_superuser,
          profile: {
            phone_number: values.phone_number,
          }
        };
        
        await createUser(createPayload);
        toast({
          title: "User created",
          description: "User has been successfully created.",
          variant: "success",
        });
        navigate("/users");
      } else if (mode === "edit" && id) {
        // If password is empty, remove it from the payload
        const updatePayload: UserUpdatePayload = {
          id: id, // Required for update
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active,
          is_staff: values.is_staff,
          is_superuser: values.is_superuser,
          profile: {
            phone_number: values.phone_number,
          }
        };
        
        if (values.password) {
          updatePayload.password = values.password;
        }
        
        await updateUser({
          id: id,
          userData: updatePayload
        });
        
        toast({
          title: "User updated",
          description: "User has been successfully updated.",
          variant: "success",
        });
        
        navigate(`/users/${id}`);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "create" ? "create" : "update"} user. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Handle loading state
  if (mode === "edit" && isLoadingUser) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (mode === "edit" && userError) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
        <div className="mt-6">
          <p className="text-center text-destructive">
            Error loading user data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const isSubmitting = isCreatingUser || isUpdatingUser;

  return (
    <>
      <Helmet>
        <title>
          {mode === "create" ? "Create User" : `Edit User: ${userData?.username}`} | Admin Portal
        </title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(mode === "edit" && id ? `/users/${id}` : "/users")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create User" : `Edit User: ${userData?.username}`}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs 
              defaultValue="basic" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="access">Access & Roles</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Enter the user's basic information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormDescription>
                              A unique username for the user.
                            </FormDescription>
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
                              <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormDescription>
                              The user's email address.
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
                              <Input placeholder="First Name" {...field} />
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
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {(mode === "create" || mode === "edit") && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        {mode === "create" 
                          ? "Set an initial password for the user."
                          : "Leave blank to keep the current password."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={mode === "create" ? "Password" : "New Password"} 
                                  {...field}
                                />
                              </FormControl>
                              {mode === "edit" && (
                                <FormDescription>
                                  Leave blank to keep the current password.
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Confirm Password" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="access" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Access & Roles</CardTitle>
                    <CardDescription>
                      Configure the user's access and roles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Users can only login if their account is active.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="is_staff"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Staff</FormLabel>
                            <FormDescription>
                              Staff users have access to the admin interface.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="is_superuser"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Administrator</FormLabel>
                            <FormDescription>
                              Administrators have full access to all features and data.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Additional contact information for the user.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(mode === "edit" && id ? `/users/${id}` : "/users")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create User" : "Update User"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default UserFormPage;
