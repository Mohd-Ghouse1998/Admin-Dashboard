import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { createPromotion } from '@/services/api/promotionsApi';
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

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (values: PromotionFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert Date objects to ISO strings for the API
      await createPromotion({
        ...values,
        start_date: values.start_date instanceof Date ? values.start_date.toISOString() : values.start_date,
        end_date: values.end_date instanceof Date ? values.end_date?.toISOString() : values.end_date
      });
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
        variant: 'success',
      });
      navigate('/payment/promotions');
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to create promotion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/payment/promotions');
  };

  // Generate a random code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('code', code);
  };

  return (
    <PageLayout
      title="Create Promotion"
      description="Add a new promotional offer"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payments' },
        { label: 'Promotions', url: '/payments/promotions' },
        { label: 'Create', url: '/payments/promotions/create' }
      ]}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Promotion Details</CardTitle>
                <CardDescription>Basic information about the promotion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale 2025" {...field} />
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
                          placeholder="Special discount for summer season" 
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="SUMMER25" {...field} />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={generateRandomCode}
                          >
                            Generate
                          </Button>
                        </div>
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
                          placeholder={form.watch('discount_type') === 'percentage' ? '15' : '10.00'}
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
              {isSubmitting ? 'Creating...' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default PromotionCreatePage;
