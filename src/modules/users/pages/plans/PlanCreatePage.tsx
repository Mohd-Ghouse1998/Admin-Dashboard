import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService, PlanCreateUpdatePayload } from '@/services/planService';
import { useToast } from '@/hooks/use-toast';
import FormSection from '@/components/common/FormSection';

// Form schema for plan creation
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  billing_cycle: z.enum(["monthly", "quarterly", "yearly", "one_time"], {
    required_error: "Billing cycle is required",
  }),
  features: z.string().optional(), // Keep as string for the form, transform when submitting
  trial_days: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Currency options
const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
];

// Billing cycle options
const billingCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One-time' },
];

const PlanCreatePage = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      billing_cycle: "monthly",
      features: "",
      trial_days: 0,
      is_active: true,
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Transform features from newline-separated string to array
      const featuresArray = data.features ? 
        data.features.split('\n').filter(item => item.trim().length > 0) : 
        [];
        
      const payload: PlanCreateUpdatePayload = {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        billing_cycle: data.billing_cycle,
        features: featuresArray,
        is_active: data.is_active,
        trial_days: data.trial_days
      };
      return planService.createPlan(accessToken, payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan created successfully",
        variant: "success",
      });
      navigate("/users/plans");
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    createPlanMutation.mutate(values);
  };

  return (
    <PageLayout
      title="Create Plan"
      description="Create a new subscription plan"
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Plans', url: '/users/plans' },
        { label: 'Create Plan' }
      ]}
    >
      <Helmet>
        <title>Create Plan | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Plan</CardTitle>
          <CardDescription>Create a new subscription plan for your users</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="Plan Information" description="Basic details about the plan">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the plan benefits and features" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Pricing" description="Plan pricing and billing details">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billing_cycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Cycle</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select billing cycle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {billingCycles.map((cycle) => (
                              <SelectItem key={cycle.value} value={cycle.value}>
                                {cycle.label}
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
                    name="trial_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trial Days</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days for the free trial (0 for no trial)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
              
              <FormSection title="Features" description="Plan features and capabilities">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter features, one per line" 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each feature on a new line
                      </FormDescription>
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
                        <FormDescription>
                          Enable or disable this plan
                        </FormDescription>
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
              </FormSection>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users/plans')}
                  disabled={createPlanMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Plan
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

export default PlanCreatePage;
