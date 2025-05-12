import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, LandmarkIcon, WalletIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';

// Mock data for a wallet
const getMockWallet = (id: string) => ({
  id,
  userId: `10${id}`,
  username: id === '1' ? 'johndoe' : id === '2' ? 'janedoe' : id === '3' ? 'bobsmith' : 'alicegreen',
  userEmail: id === '1' ? 'john.doe@example.com' : id === '2' ? 'jane.doe@example.com' : id === '3' ? 'bob.smith@example.com' : 'alice.green@example.com',
  balance: id === '1' ? 249.50 : id === '2' ? 125.75 : id === '3' ? 0.00 : 540.20,
  availableBalance: id === '1' ? 249.50 : id === '2' ? 100.00 : id === '3' ? 0.00 : 540.20,
  pendingBalance: id === '1' ? 0.00 : id === '2' ? 25.75 : id === '3' ? 0.00 : 0.00,
  currency: 'USD',
  status: id === '3' ? 'inactive' : 'active',
  lastTransaction: id === '1' ? '2025-04-30T14:28:30Z' : id === '2' ? '2025-05-01T11:15:45Z' : id === '3' ? '2025-03-15T16:42:10Z' : '2025-04-29T08:54:12Z',
  createdAt: id === '1' ? '2024-12-15T09:00:00Z' : id === '2' ? '2025-01-05T10:30:00Z' : id === '3' ? '2025-02-20T12:00:00Z' : '2025-01-10T14:15:00Z',
  userData: {
    name: id === '1' ? 'John Doe' : id === '2' ? 'Jane Doe' : id === '3' ? 'Bob Smith' : 'Alice Green',
    phone: id === '1' ? '+1 (555) 123-4567' : id === '2' ? '+1 (555) 987-6543' : id === '3' ? '+1 (555) 456-7890' : '+1 (555) 789-0123',
    joinDate: id === '1' ? '2024-12-01T00:00:00Z' : id === '2' ? '2025-01-01T00:00:00Z' : id === '3' ? '2025-02-15T00:00:00Z' : '2025-01-05T00:00:00Z',
    type: id === '1' || id === '2' ? 'personal' : 'business'
  }
});

const WalletTopupPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = getMockWallet(id || '1');
  const [processing, setProcessing] = useState(false);

  const form = useForm({
    defaultValues: {
      amount: '',
      paymentMethod: 'card',
      description: 'Manual wallet top-up',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
      accountNumber: '',
      routingNumber: '',
      accountName: ''
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleBack = () => {
    navigate(`/payment/wallets/${id}`);
  };

  const handleSubmit = (data: any) => {
    console.log('Top-up data:', data);
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      navigate(`/payment/wallets/${id}`);
      // In a real implementation, we would handle success/error states
    }, 1500);
  };

  const paymentMethod = form.watch('paymentMethod');

  return (
    <PageLayout
      title={`Top Up Wallet: ${wallet.username}`}
      description="Add funds to user wallet"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Wallets', url: '/payment/wallets' },
        { label: wallet.username, url: `/payment/wallets/${id}` },
        { label: 'Top Up', url: `/payment/wallets/${id}/topup` }
      ]}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Funds</CardTitle>
              <CardDescription>Top up user wallet with additional funds</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="pl-8" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the amount to add to the wallet
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
                            placeholder="Reason for top-up" 
                            className="min-h-20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will appear in the transaction history
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          >
                            <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4 cursor-pointer hover:bg-gray-50">
                              <FormControl>
                                <RadioGroupItem value="card" className="sr-only" />
                              </FormControl>
                              <CreditCard className="h-6 w-6 text-primary" />
                              <FormLabel className="font-normal">Credit Card</FormLabel>
                            </FormItem>
                            <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4 cursor-pointer hover:bg-gray-50">
                              <FormControl>
                                <RadioGroupItem value="bank" className="sr-only" />
                              </FormControl>
                              <LandmarkIcon className="h-6 w-6 text-primary" />
                              <FormLabel className="font-normal">Bank Transfer</FormLabel>
                            </FormItem>
                            <FormItem className="flex flex-col items-center space-y-3 rounded-md border p-4 cursor-pointer hover:bg-gray-50">
                              <FormControl>
                                <RadioGroupItem value="manual" className="sr-only" />
                              </FormControl>
                              <WalletIcon className="h-6 w-6 text-primary" />
                              <FormLabel className="font-normal">Manual Adjustment</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium">Card Details</h3>
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="4111 1111 1111 1111" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cardCVC"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium">Bank Details</h3>
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="routingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routing Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {paymentMethod === 'manual' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium">Administrative Adjustment</h3>
                      <p className="text-sm text-gray-500">
                        This will record a manual adjustment to the user's wallet balance.
                        All changes will be logged for auditing purposes.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Processing...' : 'Confirm Top-up'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Username</Label>
                <p className="font-medium">{wallet.username}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Current Balance</Label>
                <p className="font-medium text-xl">{formatCurrency(wallet.balance)}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge variant={wallet.status === 'active' ? 'success' : 'secondary'}>
                    {wallet.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">User Email</Label>
                <p className="font-medium">{wallet.userEmail}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" className="w-full" onClick={handleBack}>
                View Wallet Details
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Amounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => form.setValue('amount', '10')}
                >
                  $10
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => form.setValue('amount', '20')}
                >
                  $20
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => form.setValue('amount', '50')}
                >
                  $50
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => form.setValue('amount', '100')}
                >
                  $100
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default WalletTopupPage;
