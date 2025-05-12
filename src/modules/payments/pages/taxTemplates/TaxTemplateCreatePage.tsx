import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { createTaxTemplate } from '@/services/api/taxTemplatesApi';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
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

// Form validation schema
const taxTemplateFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  tax_type: z.string().min(1, { message: 'Tax type is required' }),
  tax_rate: z.number().min(0, { message: 'Tax rate must be a positive number' }),
  country: z.string().optional(),
  state: z.string().optional(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  is_compound: z.boolean().default(false)
});

type TaxTemplateFormValues = z.infer<typeof taxTemplateFormSchema>;

const TaxTemplateCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<TaxTemplateFormValues>({
    resolver: zodResolver(taxTemplateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      tax_type: 'VAT',
      tax_rate: 0,
      country: '',
      state: '',
      is_active: true,
      is_default: false,
      is_compound: false
    }
  });

  const handleSubmit = async (values: TaxTemplateFormValues) => {
    setIsSubmitting(true);
    try {
      await createTaxTemplate(values);
      toast({
        title: 'Success',
        description: 'Tax template created successfully',
        variant: 'success',
      });
      navigate('/payment/tax-templates');
    } catch (error) {
      console.error('Failed to create tax template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tax template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/payment/tax-templates');
  };

  return (
    <PageLayout
      title="Create Tax Template"
      description="Add a new tax template for billing"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Tax Templates', url: '/payment/tax-templates' },
        { label: 'Create', url: '/payment/tax-templates/create' }
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
                <CardTitle>Tax Template Details</CardTitle>
                <CardDescription>Enter the basic information about the tax template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the tax template
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
                        Optional explanation of the tax template's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="tax_type"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Tax Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tax type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VAT">VAT</SelectItem>
                            <SelectItem value="GST">GST</SelectItem>
                            <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                            <SelectItem value="Service Tax">Service Tax</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Type of tax
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={event => field.onChange(parseFloat(event.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage rate for this tax
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Specify which regions this tax applies to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Country where this tax is applicable (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        State or province where this tax is applicable (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>Additional tax template settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Enable or disable this tax template
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

                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Default Template</FormLabel>
                        <FormDescription>
                          Set as the default tax template for new transactions
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

                <FormField
                  control={form.control}
                  name="is_compound"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Compound Tax</FormLabel>
                        <FormDescription>
                          Tax is calculated on top of other taxes
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
              {isSubmitting ? 'Creating...' : 'Create Tax Template'}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default TaxTemplateCreatePage;
