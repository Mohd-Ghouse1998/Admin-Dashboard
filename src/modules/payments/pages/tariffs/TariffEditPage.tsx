import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getTariff, updateTariff, Tariff, TimeRestriction, UserRestriction } from '@/services/api/tariffsApi';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Plus, Trash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Create schema for form validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters long"
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long"
  }),
  base_price: z.coerce.number().min(0, {
    message: "Base price must be greater than or equal to 0"
  }),
  price_per_kwh: z.coerce.number().min(0, {
    message: "Price per kWh must be greater than or equal to 0"
  }),
  price_per_minute: z.coerce.number().min(0, {
    message: "Price per minute must be greater than or equal to 0"
  }),
  price_per_session: z.coerce.number().min(0, {
    message: "Price per session must be greater than or equal to 0"
  }),
  currency: z.string().min(1, {
    message: "Please select a currency"
  }),
  tax_percentage: z.coerce.number().min(0).max(100, {
    message: "Tax percentage must be between 0 and 100"
  }),
  status: z.enum(['active', 'inactive', 'draft'], {
    required_error: "Please select a status"
  }),
  time_restrictions: z.array(
    z.object({
      id: z.number().optional(),
      day_of_week: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      multiplier: z.coerce.number().min(0.1).max(10),
    })
  ).optional(),
  user_restrictions: z.array(
    z.object({
      id: z.number().optional(),
      user_type: z.enum(['regular', 'premium', 'business']),
      multiplier: z.coerce.number().min(0.1).max(10),
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TariffEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [timeRestrictions, setTimeRestrictions] = useState<
    Array<{ id?: number; day_of_week: string; start_time: string; end_time: string; multiplier: number }>
  >([]);
  const [userRestrictions, setUserRestrictions] = useState<
    Array<{ id?: number; user_type: 'regular' | 'premium' | 'business'; multiplier: number }>
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      base_price: 0,
      price_per_kwh: 0,
      price_per_minute: 0,
      price_per_session: 0,
      currency: 'USD',
      tax_percentage: 0,
      status: 'draft',
      time_restrictions: [],
      user_restrictions: [],
    },
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchTariff = async () => {
      setIsLoading(true);
      try {
        const response = await getTariff(parseInt(id));
        const tariffData = response.data;
        setTariff(tariffData);
        
        // Set form default values
        form.reset({
          name: tariffData.name,
          description: tariffData.description,
          base_price: tariffData.base_price,
          price_per_kwh: tariffData.price_per_kwh,
          price_per_minute: tariffData.price_per_minute,
          price_per_session: tariffData.price_per_session,
          currency: tariffData.currency,
          tax_percentage: tariffData.tax_percentage,
          status: tariffData.status,
        });
        
        // Set time and user restrictions
        setTimeRestrictions(tariffData.time_restrictions || []);
        setUserRestrictions(tariffData.user_restrictions || []);
      } catch (error) {
        console.error('Error fetching tariff:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tariff details. Please try again.',
          variant: 'destructive',
        });
        navigate('/payment/tariffs');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTariff();
  }, [id, toast, navigate, form]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      values.time_restrictions = timeRestrictions;
      values.user_restrictions = userRestrictions;

      // Use direct type assertion on the entire values object for the API call
      await updateTariff(parseInt(id), values as any);
      toast({
        title: 'Success',
        description: 'Tariff updated successfully',
        variant: 'success',
      });
      navigate(`/payment/tariffs/${id}`);
    } catch (error) {
      console.error('Error updating tariff:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tariff. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTimeRestriction = () => {
    setTimeRestrictions([
      ...timeRestrictions,
      { day_of_week: 'monday', start_time: '09:00:00', end_time: '18:00:00', multiplier: 1 }
    ]);
  };

  const updateTimeRestriction = (index: number, field: string, value: any) => {
    const updatedRestrictions = [...timeRestrictions];
    updatedRestrictions[index] = {
      ...updatedRestrictions[index],
      [field]: value
    };
    setTimeRestrictions(updatedRestrictions);
  };

  const removeTimeRestriction = (index: number) => {
    setTimeRestrictions(timeRestrictions.filter((_, i) => i !== index));
  };

  const addUserRestriction = () => {
    setUserRestrictions([
      ...userRestrictions,
      { user_type: 'regular', multiplier: 1 }
    ]);
  };

  const updateUserRestriction = (index: number, field: string, value: any) => {
    const updatedRestrictions = [...userRestrictions];
    updatedRestrictions[index] = {
      ...updatedRestrictions[index],
      [field]: value
    };
    setUserRestrictions(updatedRestrictions);
  };

  const removeUserRestriction = (index: number) => {
    setUserRestrictions(userRestrictions.filter((_, i) => i !== index));
  };

  const weekdays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const userTypes = [
    { value: 'regular', label: 'Regular' },
    { value: 'premium', label: 'Premium' },
    { value: 'business', label: 'Business' }
  ];

  if (isLoading) {
    return (
      <PageLayout
        title="Edit Tariff"
        description="Loading tariff details"
        backButton
        backTo="/payment/tariffs"
      >
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Edit ${tariff?.name}`}
      description="Update tariff plan details"
      backButton
      backTo={`/payment/tariffs/${id}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details of the tariff plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Standard Rate Plan" {...field} />
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder="Describe the tariff plan"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
              <CardDescription>
                Update the pricing structure for this tariff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Fixed price charged for every session
                      </FormDescription>
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
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price_per_kwh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per kWh</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Price per kilowatt-hour of energy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_per_minute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Minute</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Price per minute of charging time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_per_session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Session</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional flat fee per charging session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tax_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tax percentage applied to the total amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Time Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>Time Restrictions</CardTitle>
              <CardDescription>
                Update time-based pricing multipliers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeRestrictions.map((restriction, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-2 border-b border-border">
                  <div>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      value={restriction.day_of_week}
                      onValueChange={(value) => updateTimeRestriction(index, 'day_of_week', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekdays.map((day) => (
                          <SelectItem key={day} value={day} className="capitalize">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      type="time"
                      value={restriction.start_time.substring(0, 5)}
                      onChange={(e) => updateTimeRestriction(index, 'start_time', e.target.value + ':00')}
                    />
                  </div>
                  <div>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      type="time"
                      value={restriction.end_time.substring(0, 5)}
                      onChange={(e) => updateTimeRestriction(index, 'end_time', e.target.value + ':00')}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel>Multiplier</FormLabel>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={restriction.multiplier}
                        onChange={(e) => updateTimeRestriction(index, 'multiplier', parseFloat(e.target.value))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeTimeRestriction(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addTimeRestriction}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Time Restriction
              </Button>
            </CardContent>
          </Card>

          {/* User Type Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>User Type Restrictions</CardTitle>
              <CardDescription>
                Update user type-based pricing multipliers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRestrictions.map((restriction, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pb-2 border-b border-border">
                  <div>
                    <FormLabel>User Type</FormLabel>
                    <Select
                      value={restriction.user_type}
                      onValueChange={(value: any) => updateUserRestriction(index, 'user_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel>Multiplier</FormLabel>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={restriction.multiplier}
                        onChange={(e) => updateUserRestriction(index, 'multiplier', parseFloat(e.target.value))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeUserRestriction(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addUserRestriction}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User Type Restriction
              </Button>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/payment/tariffs/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default TariffEditPage;
