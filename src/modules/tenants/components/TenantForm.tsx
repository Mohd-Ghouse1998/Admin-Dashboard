
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tenant, TenantApp, TenantCreatePayload, TenantUpdatePayload } from "@/modules/tenants/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Schema for tenant form
const tenantFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  schema_name: z.string().min(2, "Schema name must be at least 2 characters")
    .regex(/^[a-z0-9_]+$/, "Schema name can only contain lowercase letters, numbers, and underscores"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  currency: z.string().min(3, "Currency must be at least 3 characters"),
  timezone: z.string().optional(),
  is_active: z.boolean().optional(),
  admin_user: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).optional(),
  payment_config: z.object({
    razorpay_key_id: z.string().optional(),
    razorpay_key_secret: z.string().optional(),
    paytm_merchant_id: z.string().optional(),
    paytm_merchant_key: z.string().optional(),
  }).optional(),
  apps: z.array(z.string().or(z.number())).optional(),
});

interface TenantFormProps {
  tenant?: Tenant;
  availableApps?: TenantApp[];
  onSubmit: (data: TenantCreatePayload | TenantUpdatePayload) => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  tenant,
  availableApps = [],
  onSubmit,
  isSubmitting,
  isEdit = false,
}) => {
  const form = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name || "",
      schema_name: tenant?.schema_name || "",
      country: tenant?.country || "",
      currency: tenant?.currency || "",
      timezone: tenant?.timezone || "",
      is_active: tenant?.is_active ?? true,
      admin_user: tenant?.admin_user
        ? {
            username: tenant.admin_user.username || "",
            email: tenant.admin_user.email || "",
            password: "",
            first_name: tenant.admin_user.first_name || "",
            last_name: tenant.admin_user.last_name || "",
          }
        : undefined,
      payment_config: {
        razorpay_key_id: "",
        razorpay_key_secret: "",
        paytm_merchant_id: "",
        paytm_merchant_key: "",
      },
      apps: [],
    },
  });

  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const handleFormSubmit = (data: z.infer<typeof tenantFormSchema>) => {
    const formData = {
      ...data,
      apps: selectedApps
    };
    
    if (isEdit && tenant) {
      onSubmit({
        ...formData,
        id: tenant.id
      } as TenantUpdatePayload);
    } else {
      onSubmit(formData as TenantCreatePayload);
    }
  };

  const toggleApp = (appId: string) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>
              Enter the basic information for this tenant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tenant name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name for this tenant organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schema_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter schema name" 
                        {...field} 
                        disabled={isEdit} // Can't edit schema name after creation
                      />
                    </FormControl>
                    <FormDescription>
                      Used for database schema. Only lowercase letters, numbers, and underscores.
                    </FormDescription>
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
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter currency code (e.g., USD)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter timezone (e.g., UTC)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default is UTC if not specified.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          This tenant is active and can access the platform.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {!isEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Admin User</CardTitle>
              <CardDescription>
                Create the administrator account for this tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="admin_user.username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_user.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_user.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin_user.first_name"
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
                  name="admin_user.last_name"
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
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>
              Configure payment gateway credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="payment_config.razorpay_key_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Key ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Razorpay key ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_config.razorpay_key_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Key Secret</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Razorpay key secret" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_config.paytm_merchant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paytm Merchant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Paytm Merchant ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_config.paytm_merchant_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paytm Merchant Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Paytm Merchant Key" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {availableApps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>App Access</CardTitle>
              <CardDescription>
                Select which applications this tenant can access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableApps.map((app) => (
                  <div key={app.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`app-${app.id}`}
                      checked={selectedApps.includes(app.id.toString())}
                      onCheckedChange={() => toggleApp(app.id.toString())}
                    />
                    <label
                      htmlFor={`app-${app.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {app.label || app.name || `App ${app.id}`}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <CardFooter className="flex justify-end border-t p-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Tenant" : "Create Tenant"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
