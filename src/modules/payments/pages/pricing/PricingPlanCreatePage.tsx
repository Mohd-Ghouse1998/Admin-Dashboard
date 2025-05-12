import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPlan } from '@/services/api/plansApi';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  price: z.string().min(1, { message: 'Price is required' }),
  currency: z.string().default('USD'),
  duration_days: z.number().min(1, { message: 'Duration must be at least 1 day' }),
  features: z.array(z.string().min(1, { message: 'Feature cannot be empty' })),
  is_active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

const PricingPlanCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      duration_days: 30, // Default to monthly (30 days)
      features: [''],
      is_active: true
    }
  });

  const handleBack = () => {
    navigate('/payment/plans');
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert price from string to number for API
      const formattedValues = {
        ...values,
        price: parseFloat(values.price)
      };
      
      await createPlan(formattedValues);
      
      toast({
        title: 'Success',
        description: 'Pricing plan created successfully',
        variant: 'success'
      });
      
      navigate('/payment/plans');
    } catch (error) {
      console.error('Failed to create pricing plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pricing plan. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    const { features } = form.getValues();
    form.setValue('features', [...features, ''], { shouldValidate: true });
  };

  const removeFeature = (index: number) => {
    const { features } = form.getValues();
    if (features.length > 1) {
      form.setValue('features', features.filter((_, i) => i !== index), { shouldValidate: true });
    }
  };

  return (
    <PageLayout
      title="Create Pricing Plan"
      description="Add a new pricing plan to your offerings"
      backButton
      backTo="/payment/plans"
    >
      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
          <CardDescription>
            Create a new pricing plan for your charging services
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter plan name" />
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
                        <Textarea {...field} placeholder="Enter plan description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-500">$</span>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Duration (days)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">Monthly (30 days)</SelectItem>
                          <SelectItem value="90">Quarterly (90 days)</SelectItem>
                          <SelectItem value="180">Semi-Annual (180 days)</SelectItem>
                          <SelectItem value="365">Annual (365 days)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        <FormLabel>
                          Active Plan
                        </FormLabel>
                        <FormDescription>
                          Make this plan available to users
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <Label>Features</Label>
                <div className="space-y-2">
                  {form.watch('features').map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="e.g. 24/7 support"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...form.getValues('features')];
                          newFeatures[index] = e.target.value;
                          form.setValue('features', newFeatures);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        disabled={form.getValues('features').length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleBack} variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </PageLayout>
  );
};

export default PricingPlanCreatePage;
