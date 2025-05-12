import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlanCreateUpdatePayload } from '@/services/planService';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  currency: z.string().min(1, "Currency is required"),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'one_time']),
  features: z.array(z.string()).optional(),
  trial_days: z.coerce.number().min(0, "Trial days must be greater than or equal to 0").optional(),
  is_active: z.boolean().default(true),
});

interface PlanFormProps {
  initialData?: PlanCreateUpdatePayload & { id?: string };
  onSubmit: (data: PlanCreateUpdatePayload) => void;
  isSubmitting: boolean;
}

const PlanForm = ({ initialData, onSubmit, isSubmitting }: PlanFormProps) => {
  const [featureInput, setFeatureInput] = React.useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      currency: initialData?.currency || 'USD',
      billing_cycle: initialData?.billing_cycle || 'monthly',
      features: initialData?.features || [],
      trial_days: initialData?.trial_days || 0,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  const features = form.watch('features') || [];

  const addFeature = () => {
    if (featureInput.trim() !== '') {
      const currentFeatures = form.getValues('features') || [];
      form.setValue('features', [...currentFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = [...features];
    currentFeatures.splice(index, 1);
    form.setValue('features', currentFeatures);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure required fields are included in the payload
    const payload: PlanCreateUpdatePayload = {
      name: values.name,
      price: values.price,
      currency: values.currency,
      billing_cycle: values.billing_cycle,
      description: values.description,
      features: values.features,
      trial_days: values.trial_days,
      is_active: values.is_active
    };
    
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="Plan name" {...field} />
              </FormControl>
              <FormDescription>
                Enter a descriptive name for this plan
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Plan description" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
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
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="billing_cycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Cycle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one_time">One Time</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often the customer will be charged
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trial_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trial Period (Days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  min="0" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Free trial period in days (0 for no trial)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-2">
          <FormLabel>Plan Features</FormLabel>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={addFeature}
              variant="outline"
              size="icon"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {features.length > 0 ? (
            <div className="space-y-2 mt-2">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No features added yet</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Set whether this plan is currently active
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Plan" : "Create Plan"}
        </Button>
      </form>
    </Form>
  );
};

export default PlanForm;
