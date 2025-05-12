import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import FormSection from '@/components/common/FormSection';

// Mock service for session billings - replace with actual service when available
const sessionBillingService = {
  getSessionBillingById: async (accessToken: string, id: string) => {
    // This would be replaced with an actual API call
    return {
      id,
      user: { id: '1', username: 'user1', email: 'user1@example.com' },
      user_id: '1',
      session_id: 'SESSION123',
      amount: 125.50,
      start_time: '2025-04-25T10:00:00Z',
      end_time: '2025-04-25T11:30:00Z',
      status: 'paid',
      created_at: '2025-04-25T11:35:00Z',
      updated_at: '2025-04-25T11:40:00Z'
    };
  },
  updateSessionBilling: async (accessToken: string, id: string, data: any) => {
    // This would be replaced with an actual API call
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }
};

// Define status options
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];

// Form schema for session billing editing
const formSchema = z.object({
  user_id: z.string({
    required_error: 'User is required',
  }),
  session_id: z.string({
    required_error: 'Session ID is required',
  }),
  amount: z.coerce.number().min(0, 'Amount must be a positive number'),
  start_time: z.date({
    required_error: 'Start time is required',
  }),
  end_time: z.date({
    required_error: 'End time is required',
  }).refine(
    (date) => date > new Date(0), 
    { message: 'End time is required' }
  ),
  status: z.string({
    required_error: 'Status is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SessionBillingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      session_id: '',
      amount: 0,
      start_time: new Date(),
      end_time: new Date(),
      status: 'pending',
    },
  });

  // Fetch session billing data
  const {
    data: billing,
    isLoading: isLoadingBilling,
    error: billingError
  } = useQuery({
    queryKey: ['session-billing', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or billing ID available');
      }
      return sessionBillingService.getSessionBillingById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  // Fetch users for dropdown
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return userService.getUsers(accessToken);
    },
    enabled: !!accessToken,
  });

  // Update form when billing data is loaded
  useEffect(() => {
    if (billing) {
      form.reset({
        user_id: billing.user_id,
        session_id: billing.session_id,
        amount: billing.amount,
        start_time: new Date(billing.start_time),
        end_time: new Date(billing.end_time),
        status: billing.status,
      });
    }
  }, [billing, form]);

  // Update session billing mutation
  const updateSessionBillingMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!id) throw new Error('No billing ID available');
      
      // Prepare payload with properly formatted dates
      const payload = {
        user_id: data.user_id,
        session_id: data.session_id,
        amount: data.amount,
        start_time: data.start_time.toISOString(),
        end_time: data.end_time.toISOString(),
        status: data.status,
      };
      
      return sessionBillingService.updateSessionBilling(accessToken, id, payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Session billing updated successfully',
        variant: 'success',
      });
      navigate(`/users/session-billings/${id}`);
    },
    onError: (error) => {
      console.error('Error updating session billing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session billing',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    updateSessionBillingMutation.mutate(values);
  };

  // Make sure end time is always after start time
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'start_time') {
        const startTime = value.start_time as Date;
        const endTime = value.end_time as Date;
        
        if (startTime && endTime && startTime > endTime) {
          form.setValue('end_time', new Date(startTime.getTime() + 60 * 60 * 1000)); // Add 1 hour
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  if (isLoadingBilling) {
    return (
      <PageLayout title="Edit Session Billing" description="Loading billing information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (billingError || !billing) {
    return (
      <PageLayout title="Error" description="Failed to load billing details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {billingError instanceof Error ? billingError.message : 'Failed to load billing details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Session Billing"
      description={`Edit billing record #${id}`}
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Session Billings', url: '/users/session-billings' },
        { label: `Billing ${id}`, url: `/users/session-billings/${id}` },
        { label: 'Edit' }
      ]}
    >
      <Helmet>
        <title>Edit Session Billing | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Session Billing</CardTitle>
          <CardDescription>Update session billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="Basic Information" description="User and session details">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
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
                  name="session_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session ID</FormLabel>
                      <FormControl>
                        <Input placeholder="SESSION123" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the charging session identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Billing Details" description="Financial information">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Session Timing" description="Start and end time of the charging session">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startTime = form.getValues('start_time');
                                return date < startTime;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/users/session-billings/${id}`)}
                  disabled={updateSessionBillingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSessionBillingMutation.isPending}
                >
                  {updateSessionBillingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Billing
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default SessionBillingEditPage;
