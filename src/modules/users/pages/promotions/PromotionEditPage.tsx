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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import FormSection from '@/components/common/FormSection';

// Mock service for promotions - replace with actual service when available
const promotionService = {
  getPromotionById: async (accessToken: string, id: string) => {
    // This would be replaced with an actual API call
    return {
      id,
      name: 'Summer Discount',
      code: 'SUMMER25',
      description: 'Get 25% off on all charging sessions during summer. Limited time offer for all customers.',
      discount_type: 'percentage',
      discount_value: 25,
      start_date: '2025-06-01T00:00:00Z',
      end_date: '2025-08-31T23:59:59Z',
      active: true,
      created_at: '2025-05-01T10:00:00Z',
      updated_at: '2025-05-01T10:00:00Z'
    };
  },
  updatePromotion: async (accessToken: string, id: string, data: any) => {
    // This would be replaced with an actual API call
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }
};

// Define discount type options
const discountTypeOptions = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

// Form schema for promotion editing
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().min(3, 'Code must be at least 3 characters')
    .refine(val => /^[A-Z0-9_-]+$/.test(val), {
      message: 'Code can only contain uppercase letters, numbers, hyphens, and underscores',
    }),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed'], {
    required_error: 'Discount type is required',
  }),
  discount_value: z.coerce.number().min(0, 'Value must be a positive number')
    .refine(
      (val) => {
        // This will be updated when we know the discount type
        return true;
      },
      { message: 'Invalid discount value' }
    ),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date({
    required_error: 'End date is required',
  }).refine(
    (date) => date > new Date(0), 
    { message: 'End date is required' }
  ),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const PromotionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      start_date: new Date(),
      end_date: new Date(),
      active: true,
    },
  });

  // Fetch promotion data
  const {
    data: promotion,
    isLoading: isLoadingPromotion,
    error: promotionError
  } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error('No access token or promotion ID available');
      }
      return promotionService.getPromotionById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });

  // Update form when promotion data is loaded
  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        code: promotion.code,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
        active: promotion.active,
      });
    }
  }, [promotion, form]);

  // Dynamically validate discount value based on discount type
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'discount_type' || name === 'discount_value') {
        const discountType = form.getValues('discount_type');
        const discountValue = form.getValues('discount_value');
        
        if (discountType === 'percentage' && discountValue > 100) {
          form.setError('discount_value', {
            type: 'max',
            message: 'Percentage cannot exceed 100%',
          });
        } else {
          form.clearErrors('discount_value');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Update promotion mutation
  const updatePromotionMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!id) throw new Error('No promotion ID available');
      
      // Prepare payload with properly formatted dates
      const payload = {
        name: data.name,
        code: data.code,
        description: data.description || '',
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        active: data.active,
      };
      
      return promotionService.updatePromotion(accessToken, id, payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Promotion updated successfully',
        variant: 'success',
      });
      navigate(`/users/promotions/${id}`);
    },
    onError: (error) => {
      console.error('Error updating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promotion',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    updatePromotionMutation.mutate(values);
  };

  // Make sure end date is always after start date
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'start_date') {
        const startDate = value.start_date as Date;
        const endDate = value.end_date as Date;
        
        if (startDate && endDate && startDate > endDate) {
          form.setValue('end_date', new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)); // Add 30 days
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  if (isLoadingPromotion) {
    return (
      <PageLayout title="Edit Promotion" description="Loading promotion information...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (promotionError || !promotion) {
    return (
      <PageLayout title="Error" description="Failed to load promotion details">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {promotionError instanceof Error ? promotionError.message : 'Failed to load promotion details'}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Promotion"
      description={`Edit details for ${promotion.name}`}
      breadcrumbs={[
        { label: 'Users', url: '/users' },
        { label: 'Promotions', url: '/users/promotions' },
        { label: promotion.name, url: `/users/promotions/${id}` },
        { label: 'Edit' }
      ]}
    >
      <Helmet>
        <title>Edit Promotion | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Promotion</CardTitle>
          <CardDescription>Update promotion details and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection title="Basic Information" description="Promotion details and code">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Discount" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this promotion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SUMMER25" 
                          {...field}
                          value={field.value.toUpperCase()}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Code that users enter to apply the discount (uppercase letters, numbers, hyphens, and underscores only)
                      </FormDescription>
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
                          placeholder="Get 25% off on all charging sessions during summer" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description of the promotion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Discount Details" description="Configure the discount amount and type">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {discountTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {form.watch('discount_type') === 'percentage'
                          ? 'Percentage discount off the total amount'
                          : 'Fixed amount discount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step={form.watch('discount_type') === 'percentage' ? '1' : '0.01'}
                            min="0"
                            max={form.watch('discount_type') === 'percentage' ? '100' : undefined}
                            placeholder={form.watch('discount_type') === 'percentage' ? '25' : '10.00'}
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            {form.watch('discount_type') === 'percentage' ? '%' : '$'}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {form.watch('discount_type') === 'percentage'
                          ? 'Enter the percentage discount (0-100)'
                          : 'Enter the fixed discount amount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              
              <FormSection title="Validity Period" description="Set when the promotion is active">
                <div className="grid grid-cols-2 gap-4">
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the promotion becomes active
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
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
                              disabled={(date) => {
                                const startDate = form.getValues('start_date');
                                return date < startDate;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the promotion expires
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this promotion
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
                  onClick={() => navigate(`/users/promotions/${id}`)}
                  disabled={updatePromotionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePromotionMutation.isPending}
                >
                  {updatePromotionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Promotion
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

export default PromotionEditPage;
