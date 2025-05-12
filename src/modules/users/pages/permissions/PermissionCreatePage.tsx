import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Define form schema for permission creation
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  codename: z.string().min(3, 'Codename must be at least 3 characters'),
  content_type_app: z.string().min(1, 'App label is required'),
  content_type_model: z.string().min(1, 'Model is required'),
});

type FormValues = z.infer<typeof formSchema>;

// Mock function for content types - in a real implementation, this would fetch from the API
const contentTypes = [
  { app: 'auth', model: 'user', display: 'User' },
  { app: 'auth', model: 'group', display: 'Group' },
  { app: 'wallet', model: 'wallet', display: 'Wallet' },
  { app: 'payment', model: 'payment', display: 'Payment' },
  { app: 'charger', model: 'charger', display: 'Charger' },
];

const PermissionCreatePage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      codename: '',
      content_type_app: '',
      content_type_model: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      // In a real implementation, you would call the API service here
      // await permissionService.createPermission(accessToken, data);
      
      toast.success('Permission created successfully');
      navigate('/users/permissions');
    } catch (error) {
      toast.error('Failed to create permission');
      console.error('Error creating permission:', error);
    }
  };

  return (
    <PageLayout
      title="Create Permission"
      description="Create a new system permission"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Permissions', url: '/users/permissions' },
        { label: 'Create Permission' }
      ]}
    >
      <Helmet>
        <title>Create Permission | Admin Dashboard</title>
      </Helmet>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Permission</CardTitle>
          <CardDescription>
            Create a new permission for controlling access to system resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Can view users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codename</FormLabel>
                    <FormControl>
                      <Input placeholder="view_users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content_type_app"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Label</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select app label" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...new Set(contentTypes.map(ct => ct.app))].map(app => (
                            <SelectItem key={app} value={app}>
                              {app.charAt(0).toUpperCase() + app.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content_type_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting || !form.watch('content_type_app')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contentTypes
                            .filter(ct => ct.app === form.watch('content_type_app'))
                            .map(ct => (
                              <SelectItem key={ct.model} value={ct.model}>
                                {ct.display}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users/permissions')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Permission
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PermissionCreatePage;
