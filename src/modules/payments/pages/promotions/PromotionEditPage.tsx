import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getPromotion, updatePromotion, Promotion } from '@/services/api/promotionsApi';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

// Form validation schema
const promotionFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  code: z.string().min(3, { message: 'Code must be at least 3 characters' }),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive({ message: 'Discount value must be positive' }),
  start_date: z.date(),
  end_date: z.date().optional().nullable(),
  is_active: z.boolean().default(true),
  max_uses: z.number().int().nonnegative().optional().nullable()
});

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

const PromotionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      start_date: new Date(),
      end_date: null,
      is_active: true,
      max_uses: null
    }
  });

  useEffect(() => {
    if (id) {
      fetchPromotion(parseInt(id));
    }
  }, [id]);

  const fetchPromotion = async (promotionId: number) => {
    setIsLoading(true);
    try {
      const response = await getPromotion(promotionId);
      const promotionData = response.data;
      setPromotion(promotionData);
      
      // Convert string dates to Date objects
      const startDate = promotionData.start_date ? new Date(promotionData.start_date) : new Date();
      const endDate = promotionData.end_date ? new Date(promotionData.end_date) : null;
      
      // Set form values
      form.reset({
        name: promotionData.name,
        description: promotionData.description || '',
        code: promotionData.code,
        discount_type: promotionData.discount_type,
        discount_value: promotionData.discount_value,
        start_date: startDate,
        end_date: endDate,
        is_active: promotionData.is_active,
        max_uses: promotionData.max_uses
      });
    } catch (error) {
      console.error('Failed to fetch promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotion details. Please try again.',
        variant: 'destructive',
      });
      navigate('/payment/promotions');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      setIsSubmitting(true);
      if (!id) return;

      await updatePromotion(parseInt(id), {
        name: data.name,
        description: data.description,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        start_date: data.start_date instanceof Date ? data.start_date.toISOString() : data.start_date,
        end_date: data.end_date instanceof Date ? data.end_date.toISOString() : data.end_date,
        is_active: data.is_active,
        max_uses: Number(data.max_uses),
      });

      toast({
        title: 'Promotion updated',
        description: 'The promotion has been updated successfully.',
        variant: 'success',
      });

      navigate('/payment/promotions');
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promotion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/payment/promotions/${id}`);
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Edit Promotion"
        description="Loading promotion details"
        breadcrumbs={[
          { label: 'Payment & Billing', url: '/payment' },
          { label: 'Promotions', url: '/payment/promotions' },
          { label: 'Edit', url: `/payment/promotions/${id}/edit` }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/payment/promotions')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading promotion details...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Edit Promotion: ${promotion?.name}`}
      description="Modify promotion details"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Promotions', url: '/payment/promotions' },
        { label: promotion?.name || 'Promotion', url: `/payment/promotions/${id}` },
        { label: 'Edit', url: `/payment/promotions/${id}/edit` }
      ]}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Promotion Details</CardTitle>
                <CardDescription>Update basic information about the promotion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the promotion
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
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional explanation of the promotion's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Promotion Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Code that users will enter to apply the discount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <FormLabel>Status</FormLabel>
                            <FormDescription>
                              Activate or deactivate this promotion
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Settings</CardTitle>
                <CardDescription>Configure the discount type and value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the discount will be calculated
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
                      <FormLabel>
                        {form.watch('discount_type') === 'percentage' ? 'Percentage' : 'Amount'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={form.watch('discount_type') === 'percentage' ? 1 : 0.01}
                          {...field}
                          onChange={event => field.onChange(parseFloat(event.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch('discount_type') === 'percentage'
                          ? 'Percentage discount to apply'
                          : 'Fixed amount to discount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validity & Usage</CardTitle>
                <CardDescription>Set validity period and usage limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>No end date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < form.watch('start_date')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the promotion expires (leave empty for no expiration)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_uses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Unlimited"
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={event => {
                            const value = event.target.value === '' ? null : parseInt(event.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Limit how many times this promotion can be used (leave empty for unlimited)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {promotion && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Current Uses: <span className="font-medium">{promotion.current_uses}</span></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default PromotionEditPage;
