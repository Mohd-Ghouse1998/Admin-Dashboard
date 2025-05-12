import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCreatePayload, UserUpdatePayload, User, Group } from "@/types/user";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface UserFormProps {
  user?: User;
  groups?: Group[];
  onSubmit: (data: UserCreatePayload | UserUpdatePayload) => Promise<void>;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export function UserForm({
  user,
  groups = [],
  onSubmit,
  isSubmitting,
  isEdit = false,
}: UserFormProps) {
  const form = useForm<UserCreatePayload | UserUpdatePayload>({
    defaultValues: {
      id: user?.id,
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      is_active: user?.is_active ?? true,
      is_staff: user?.is_staff ?? false,
      is_superuser: user?.is_superuser ?? false,
      profile: {
        phone_number: user?.profile?.phone_number || "",
        city: user?.profile?.city || "",
        state: user?.profile?.state || "",
        pin: user?.profile?.pin || "",
        address: user?.profile?.address || "",
        ocpi_party_id: user?.profile?.ocpi_party_id || "",
        ocpi_role: user?.profile?.ocpi_role || undefined,
        ocpi_token: user?.profile?.ocpi_token || "",
      },
      groups: user?.groups?.map(g => g.id) || [],
    },
  });

  const handleSubmit = async (data: UserCreatePayload | UserUpdatePayload) => {
    console.log("Form submitted with data:", data);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting user form:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
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
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
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
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Profile Information Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="profile.phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
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
                        <Input placeholder="Enter address" {...field} value={field.value || ""} />
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
                        <Input placeholder="Enter city" {...field} value={field.value || ""} />
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
                        <Input placeholder="Enter state" {...field} value={field.value || ""} />
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
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PIN code" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* OCPI Settings Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">OCPI Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="profile.ocpi_party_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Party ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter party ID" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.ocpi_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OCPI Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
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
                        <Input placeholder="Enter OCPI token" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Roles & Permissions Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Roles & Permissions</h2>
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <FormField
                    control={form.control}
                    name="is_staff"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Staff Status</FormLabel>
                          <p className="text-sm text-gray-500">
                            Designates whether the user can log into the admin site.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_superuser"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Superuser Status</FormLabel>
                          <p className="text-sm text-gray-500">
                            Designates that this user has all permissions without explicitly assigning them.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormLabel className="text-base mb-4 block">Groups</FormLabel>
                  <div className="space-y-2">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <FormField
                          key={group.id}
                          control={form.control}
                          name="groups"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(group.id)}
                                    onCheckedChange={(checked) => {
                                      const currentGroups = field.value || [];
                                      return checked
                                        ? field.onChange([...currentGroups, group.id])
                                        : field.onChange(
                                            currentGroups.filter((id) => id !== group.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{group.name}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No groups available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Always Visible */}
            <div className="flex justify-end pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
