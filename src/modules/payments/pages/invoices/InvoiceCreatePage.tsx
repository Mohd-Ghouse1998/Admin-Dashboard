import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Trash2 } from 'lucide-react';
import { createInvoice } from '@/services/api/invoicesApi';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

// Define the form schema with validation
const InvoiceItemSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  unit_price: z.number().min(0.01, { message: 'Unit price must be greater than 0' }),
});

const InvoiceFormSchema = z.object({
  invoice_number: z.string().min(1, { message: 'Invoice number is required' }),
  order_id: z.number().optional(),
  user_id: z.number().min(1, { message: 'User ID is required' }),
  user_name: z.string().min(1, { message: 'User name is required' }),
  user_email: z.string().email().optional().or(z.literal('')),
  billing_address: z.string().min(1, { message: 'Billing address is required' }),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  issue_date: z.string().min(1, { message: 'Issue date is required' }),
  due_date: z.string().min(1, { message: 'Due date is required' }),
  payment_date: z.string().optional(),
  tax_amount: z.number().min(0, { message: 'Tax amount cannot be negative' }),
  discount_amount: z.number().min(0, { message: 'Discount amount cannot be negative' }),
  notes: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, { message: 'At least one item is required' }),
});

type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get current date and due date (+30 days)
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  // Initialize the form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: {
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      user_id: 0,
      user_name: '',
      user_email: '',
      billing_address: '',
      status: 'draft',
      issue_date: format(today, 'yyyy-MM-dd'),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      payment_date: '',
      tax_amount: 0,
      discount_amount: 0,
      notes: '',
      items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
        },
      ],
    },
  });

  const onSubmit = async (values: InvoiceFormValues) => {
    setIsSubmitting(true);
    
    // Calculate subtotal
    const subtotal = values.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    
    // Calculate total amount
    const total_amount = subtotal + values.tax_amount - values.discount_amount;
    
    // Prepare items with total
    const items = values.items.map(item => ({
      id: 0, // This will be set by the backend
      invoice_id: 0, // This will be set by the backend
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price
    }));
    
    try {
      const response = await createInvoice({
        ...values,
        subtotal,
        total_amount,
        items,
      });
      
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
        variant: 'success',
      });
      
      navigate(`/payment/invoices/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
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
        description: '',
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

  return (
    <PageLayout
      title="Create Invoice"
      description="Create a new invoice for a customer"
      backButton
      backTo="/payment/invoices"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Invoice Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>Basic invoice details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Unique invoice identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="order_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave empty if not related to an order"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Related order if any</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Current status of the invoice</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('status') === 'paid' && (
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Customer details for this invoice</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user_id"
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
                      <FormDescription>ID of the customer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="user_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="user_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="billing_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Address</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Enter billing address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Invoice Items</span>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
                <CardDescription>Products or services included in this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {form.watch('items').map((_, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-12 items-center">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter item description" />
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
                      <div className="md:col-span-1 flex items-end pt-5">
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
                      <div className="md:col-span-1 flex items-end pt-5">
                        <span className="text-sm font-medium">
                          {formatCurrency((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unit_price`) || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Info and Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional information for the customer</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          placeholder="Enter any additional notes or payment instructions..."
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
                <CardTitle>Invoice Totals</CardTitle>
                <CardDescription>Invoice summary and totals</CardDescription>
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
                  onClick={() => navigate('/payment/invoices')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default InvoiceCreatePage;
