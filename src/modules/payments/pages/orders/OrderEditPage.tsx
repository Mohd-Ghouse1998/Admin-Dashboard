import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getOrder, updateOrder, Order, OrderItem } from '@/services/api/ordersApi';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

// Define the form schema with validation
const OrderItemSchema = z.object({
  id: z.number().optional(),
  order: z.number().optional(),
  product_name: z.string().min(1, { message: 'Product name is required' }),
  product_id: z.number().optional(),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  unit_price: z.number().min(0.01, { message: 'Unit price must be greater than 0' }),
  total_price: z.number().optional(),
});

const OrderFormSchema = z.object({
  user: z.number().min(1, { message: 'User ID is required' }),
  order_number: z.string().min(1, { message: 'Order number is required' }),
  payment_method: z.string().min(1, { message: 'Payment method is required' }),
  status: z.enum(['pending', 'completed', 'cancelled', 'failed']),
  payment_status: z.enum(['paid', 'unpaid', 'refunded']),
  shipping_address: z.string().optional(),
  billing_address: z.string().optional(),
  tax_amount: z.number().min(0, { message: 'Tax amount cannot be negative' }),
  discount_amount: z.number().min(0, { message: 'Discount amount cannot be negative' }),
  items: z.array(OrderItemSchema).min(1, { message: 'At least one item is required' }),
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

const OrderEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);

  // Initialize the form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      user: 0,
      order_number: '',
      payment_method: '',
      status: 'pending',
      payment_status: 'unpaid',
      shipping_address: '',
      billing_address: '',
      tax_amount: 0,
      discount_amount: 0,
      items: [],
    },
  });

  // Fetch order data on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await getOrder(parseInt(id));
        const order = response.data;
        setOriginalOrder(order);
        
        // Set form values
        form.reset({
          user: order.user,
          order_number: order.order_number,
          payment_method: order.payment_method,
          status: order.status as any,
          payment_status: order.payment_status as any,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          tax_amount: order.tax_amount,
          discount_amount: order.discount_amount,
          items: order.items.map(item => ({
            id: item.id,
            order: item.order,
            product_name: item.product_name,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details. Please try again.',
          variant: 'destructive',
        });
        navigate('/payment/orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, toast, navigate, form]);

  const onSubmit = async (values: OrderFormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    // Calculate total amount
    const itemsTotal = values.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    
    const total_amount = itemsTotal + values.tax_amount - values.discount_amount;
    
    // Prepare items with total price
    const items = values.items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }));
    
    try {
      await updateOrder(parseInt(id), {
        ...values,
        total_amount,
        items
      });
      
      toast({
        title: 'Success',
        description: 'Order updated successfully',
        variant: 'success',
      });
      
      navigate(`/payment/orders/${id}`);
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    const items = form.getValues('items');
    form.setValue('items', [
      ...items,
      {
        product_name: '',
        quantity: 1,
        unit_price: 0,
      },
    ], { shouldValidate: true });
  };

  const removeItem = (index: number) => {
    const items = form.getValues('items');
    if (items.length > 1) {
      form.setValue(
        'items',
        items.filter((_, i) => i !== index),
        { shouldValidate: true }
      );
    }
  };

  // Calculate subtotal and total
  const items = form.watch('items');
  const taxAmount = form.watch('tax_amount');
  const discountAmount = form.watch('discount_amount');
  
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0
  );
  
  const total = subtotal + (taxAmount || 0) - (discountAmount || 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Edit Order"
        description="Loading order details"
        backButton
        backTo="/payment/orders"
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
      title={`Edit Order #${form.getValues('order_number')}`}
      description="Update order details"
      backButton
      backTo={`/payment/orders/${id}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
                <CardDescription>Basic order details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>ID of the user placing the order</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormDescription>Unique order identifier (read-only)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Current status of the order</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="net_banking">Net Banking</SelectItem>
                          <SelectItem value="wallet">Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Method of payment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Payment status</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Customer's shipping details</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="shipping_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          placeholder="Enter shipping address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Customer's billing details</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="billing_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          placeholder="Enter billing address (leave empty if same as shipping)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Items</span>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
                <CardDescription>Products included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {form.watch('items').map((_, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-12 items-center">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.product_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter product name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={form.watch('items').length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amounts */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Order Totals</CardTitle>
                <CardDescription>Order summary and totals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="md:grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tax:</span>
                    <span>{formatCurrency(taxAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Discount:</span>
                    <span>-{formatCurrency(discountAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium">Total:</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/payment/orders/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default OrderEditPage;
