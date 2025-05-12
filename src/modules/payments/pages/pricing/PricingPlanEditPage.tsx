import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Mock plan data fetch function (would be replaced with actual API call)
const getMockPlan = (id: string) => ({
  id,
  name: id === '1' ? 'Basic' : id === '2' ? 'Professional' : id === '3' ? 'Enterprise' : 'Custom',
  description: 'Comprehensive plan for EV charging infrastructure management',
  price: id === '1' ? '49' : id === '2' ? '99' : id === '3' ? '249' : '',
  billingCycle: 'monthly',
  status: 'active',
  isPopular: id === '2', // Only Professional plan is marked as popular
  features: [
    id === '1' ? 'Up to 5 charging stations' : id === '2' ? 'Up to 20 charging stations' : 'Unlimited charging stations',
    id === '1' ? 'Basic analytics' : id === '2' ? 'Advanced analytics' : 'Real-time analytics & reporting',
    id === '1' ? 'Standard support' : id === '2' ? 'Priority support' : '24/7 premium support',
    'Automated billing',
    'Multiple admin users',
    'API access',
    id === '3' || id === '4' ? 'Custom integration options' : '',
    id === '3' || id === '4' ? 'Dedicated account manager' : '',
  ].filter(Boolean)
});

const PricingPlanEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      billingCycle: 'monthly',
      isPopular: false,
      features: [''],
      status: 'active'
    }
  });

  // Load plan data
  useEffect(() => {
    if (id) {
      const plan = getMockPlan(id);
      
      // Populate form with plan data
      form.reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        isPopular: plan.isPopular,
        features: plan.features.length ? plan.features : [''],
        status: plan.status
      });
    }
  }, [id, form]);

  const handleBack = () => {
    navigate(`/payments/plans/${id}`);
  };

  const handleSubmit = (data: any) => {
    console.log('Updated plan data:', data);
    // In a real implementation, this would send updated data to the backend
    navigate(`/payments/plans/${id}`);
  };

  const addFeature = () => {
    const features = form.getValues('features');
    form.setValue('features', [...features, '']);
  };

  const removeFeature = (index: number) => {
    const features = form.getValues('features');
    const newFeatures = [...features.slice(0, index), ...features.slice(index + 1)];
    form.setValue('features', newFeatures.length ? newFeatures : ['']);
  };

  return (
    <PageLayout
      title="Edit Pricing Plan"
      description="Modify an existing pricing plan"
      breadcrumb={[
        { label: 'Payment & Billing', href: '/payments' },
        { label: 'Pricing Plans', href: '/payments/plans' },
        { label: form.getValues('name'), href: `/payments/plans/${id}` },
        { label: 'Edit', href: `/payments/plans/${id}/edit` }
      ]}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
          <CardDescription>
            Update the pricing plan details
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Basic, Professional, Enterprise" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a clear and concise name for this plan
                      </FormDescription>
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
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set the status of this plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <Input 
                            type="text" 
                            placeholder="0.00" 
                            className="pl-8" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave blank for 'Contact Sales' plans
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Cycle</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a billing cycle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often customers will be billed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the plan's purpose and target audience" 
                        className="min-h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what this plan offers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as Popular</FormLabel>
                      <FormDescription>
                        This will display a "Popular" badge on the plan
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </PageLayout>
  );
};

export default PricingPlanEditPage;
