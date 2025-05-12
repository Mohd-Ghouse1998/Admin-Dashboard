
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useWallets } from '@/hooks/useWallets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Form schema with validation
const formSchema = z.object({
  amount: z.coerce.number()
    .min(1, 'Amount must be at least 1')
    .max(100000, 'Amount cannot exceed 100,000'),
  currency: z.string().min(1, 'Please select a currency'),
});

type AddFundsFormValues = z.infer<typeof formSchema>;

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export function AddFundsForm() {
  const { createWalletDepositOrder, handlePaymentSuccess } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<AddFundsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      currency: 'INR',
    },
  });

  // Handle form submission
  const onSubmit = async (values: AddFundsFormValues) => {
    setIsLoading(true);
    
    try {
      // Make sure amount is a number and values match the required WalletDepositOrderPayload type
      const orderData = {
        amount: Number(values.amount),
        currency: values.currency
      };
      
      // 1. Create deposit order
      const orderResponse = await createWalletDepositOrder.mutateAsync(orderData);
      
      // 2. Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway script');
      }

      // 3. Initialize Razorpay checkout
      const razorpayOptions = {
        key: orderResponse.key,
        amount: orderResponse.amount.toString(),
        currency: orderResponse.currency,
        name: 'EV Charging Platform',
        description: 'Wallet Fund Deposit',
        order_id: orderResponse.id,
        handler: async (response: any) => {
          // 4. Handle successful payment
          await handlePaymentSuccess.mutateAsync({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#3399cc',
        },
      };
      
      // Open Razorpay checkout
      // @ts-ignore - Razorpay is loaded dynamically
      const paymentObject = new window.Razorpay(razorpayOptions);
      paymentObject.open();
    } catch (error) {
      console.error('Payment process error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Funds to Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
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
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add Funds'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
