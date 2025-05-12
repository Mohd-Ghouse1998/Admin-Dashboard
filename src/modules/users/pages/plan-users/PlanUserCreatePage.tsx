import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService, PlanUserCreatePayload } from '@/services/planService';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import FormSection from '@/components/common/FormSection';

// Form schema for plan user creation
const formSchema = z.object({
  user_id: z.string({
    required_error: "User is required",
  }),
  plan_id: z.string({
    required_error: "Plan is required",
  }),
  start_date: z.date({
    required_error: "Start date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const PlanUserCreatePage = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      plan_id: "",
      start_date: new Date(),
    },
  });

  // Fetch users for dropdown
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return userService.getUsers(accessToken);
    },
    enabled: !!accessToken,
  });

  // Fetch plans for dropdown
  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return planService.getPlans(accessToken);
    },
    enabled: !!accessToken,
  });

  // Create plan user subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload: PlanUserCreatePayload = {
        user_id: data.user_id,
        plan_id: data.plan_id,
      };
      return planService.subscribeToPlan(accessToken, payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription created successfully",
        variant: "success",
      });
      navigate("/users/plan-users");
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    createSubscriptionMutation.mutate(values);
  };

  const error = usersError || plansError;

  return (
    <PageLayout
      title="Create Plan Subscription"
      description="Subscribe a user to a plan"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Plan Subscriptions', url: '/users/plan-users' },
        { label: 'Create Subscription' }
      ]}
    >
      <Helmet>
        <title>Create Plan Subscription | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load data'}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Create Plan Subscription</CardTitle>
          <CardDescription>
            Subscribe a user to a plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="Subscription Details" description="Select user and plan information">
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
                  name="plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select 
                        disabled={isLoadingPlans} 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingPlans ? (
                            <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                          ) : plans?.results ? (
                            plans.results.filter((plan: any) => plan.is_active).map((plan: any) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name} ({plan.price} {plan.currency}/{plan.billing_cycle})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No plans available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                                format(field.value, "PPP")
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
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when the subscription will start
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users/plan-users')}
                  disabled={createSubscriptionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSubscriptionMutation.isPending}
                >
                  {createSubscriptionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Subscription
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

export default PlanUserCreatePage;
