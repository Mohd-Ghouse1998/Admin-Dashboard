import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DetailTemplate } from '@/components/templates/detail/DetailTemplate';
import { DetailSection } from '@/components/templates/detail/DetailSection';
import { ChevronLeft, CreditCard, Download, Printer, ArrowLeft, Send } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/modules/payments/services/paymentService';

// Define interfaces based on our API response structure
interface PaymentDetail {
  // Basic Info
  id: string;
  order_id: string;
  username: string;
  user_id: string;
  user_email: string;
  created: string;
  modified: string;
  status: string;
  
  // Payment Details
  total: number;
  tax: number;
  fee: number;
  currency: string;
  variant: string;
  transaction_id: string;
  captured: boolean;
  international: boolean;
  
  // Razorpay Details
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_status: string;
  razorpay_signature: string;
  
  // Refund Details
  refund: number;
  refund_to_wallet: number;
  
  // Billing Details
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address_1: string;
  billing_address_2: string;
  billing_city: string;
  billing_postcode: string;
  billing_country_code: string;
  billing_country_area: string;
  
  // Additional Info
  notes: string;
  description: string;
  error_code: string;
  error_description: string;
  customer_ip_address: string;
  fraud_status: string;
  fraud_message: string;
}

interface RefundFormData {
  refund_amount: number;
  refund_type: 'bank' | 'wallet';
  reason: string;
  razorpay_order_id?: string; // Only needed for standalone API
}
import { Skeleton } from '@/components/ui/skeleton';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  
  // Refund form
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundType, setRefundType] = useState<'bank' | 'wallet'>('bank');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);

  // Fetch payment details
  const fetchPaymentDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Mock payment data for now
      const mockData: PaymentDetail = {
        id: id,
        order_id: 'order-' + id.substring(0, 8),
        username: 'testuser',
        user_id: 'user-123',
        user_email: 'user@example.com',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        status: 'paid',
        
        total: 500.00,
        tax: 50.00,
        fee: 10.00,
        currency: 'INR',
        variant: 'razorpay',
        transaction_id: 'tx-' + id.substring(0, 8),
        captured: true,
        international: false,
        
        razorpay_order_id: 'rzp_order_' + id.substring(0, 8),
        razorpay_payment_id: 'rzp_payment_' + id.substring(0, 8),
        razorpay_status: 'authorized',
        razorpay_signature: 'sig-' + id.substring(0, 8),
        
        refund: 0,
        refund_to_wallet: 0,
        
        billing_first_name: 'John',
        billing_last_name: 'Doe',
        billing_email: 'john.doe@example.com',
        billing_phone: '+91 98765 43210',
        billing_address_1: '123 Main St',
        billing_address_2: '',
        billing_city: 'Bangalore',
        billing_postcode: '560001',
        billing_country_code: 'IN',
        billing_country_area: 'Karnataka',
        
        notes: 'Test payment',
        description: 'Payment for order',
        error_code: '',
        error_description: '',
        customer_ip_address: '192.168.1.1',
        fraud_status: '',
        fraud_message: ''
      };
      
      setPayment(mockData);
      
      // Initialize refund amount to total - refund (if payment is refundable)
      if (mockData.status === 'paid' || mockData.status === 'partially_refunded') {
        setRefundAmount(mockData.total - mockData.refund);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process refund
  const handleProcessRefund = async () => {
    if (!id || !payment) return;
    
    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > (payment.total - payment.refund)) {
      toast({
        title: 'Invalid Refund Amount',
        description: `Refund amount must be between 0 and ${formatCurrency(payment.total - payment.refund)}.`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsRefunding(true);
    try {
      const refundData: RefundFormData = {
        refund_amount: refundAmount,
        refund_type: refundType,
        reason: refundReason,
      };
      
      // Mock refund process for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Refund Processed',
        description: `Successfully processed refund of ${formatCurrency(refundAmount)}.`,
      });
      
      // Refresh payment details with updated refund amount
      if (payment) {
        setPayment({
          ...payment,
          refund: payment.refund + refundAmount,
          status: payment.refund + refundAmount >= payment.total ? 'refunded' : 'partially_refunded'
        });
      }
      setShowRefundForm(false);
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Refund Failed',
        description: 'There was an error processing the refund. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefunding(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'outline';
    
    switch (status.toLowerCase()) {
      case 'paid':
        variant = 'default';
        break;
      case 'refunded':
        variant = 'secondary';
        break;
      case 'partially_refunded':
        variant = 'secondary';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'failed':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };

  // Check if payment is refundable
  const isRefundable = () => {
    if (!payment) return false;
    
    return (
      (payment.status === 'paid' || payment.status === 'partially_refunded') &&
      payment.total > payment.refund
    );
  };

  // Initialize component
  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentDetails();
    }
  }, [id, isAuthenticated]);

  // Handle back button
  const handleBack = () => {
    navigate('/payments');
  };

  // Actions buttons
  const renderActionButtons = () => {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
        {isRefundable() && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setShowRefundForm(!showRefundForm)}
          >
            Process Refund
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Payments
          </Button>
        </div>
        {!isLoading && renderActionButtons()}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : payment ? (
        <div className="space-y-6">
          {/* Payment Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Payment ID</div>
                <div className="text-lg font-semibold">{payment.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Order ID</div>
                <div className="text-lg font-semibold">
                  <Link to={`/orders/${payment.order_id}`} className="text-blue-600 hover:underline">
                    {payment.order_id}
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">User</div>
                <div className="text-lg font-semibold">
                  <Link to={`/users/${payment.user_id}`} className="text-blue-600 hover:underline">
                    {payment.username}
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Date</div>
                <div className="text-lg font-semibold">{formatDate(payment.created)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="text-lg font-semibold">{renderStatusBadge(payment.status)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total Amount</div>
                <div className="text-lg font-semibold">{formatCurrency(payment.total)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Subtotal</div>
                    <div className="text-base font-medium">{formatCurrency(payment.total - payment.tax)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Tax</div>
                    <div className="text-base font-medium">{formatCurrency(payment.tax)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Fee</div>
                    <div className="text-base font-medium">{formatCurrency(payment.fee)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total</div>
                    <div className="text-base font-semibold">{formatCurrency(payment.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Currency</div>
                    <div className="text-base font-medium">{payment.currency}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Payment Method</div>
                    <div className="text-base font-medium">{payment.variant}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Razorpay Details</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Razorpay Order ID:</span> {payment.razorpay_order_id || 'N/A'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Razorpay Payment ID:</span> {payment.razorpay_payment_id || 'N/A'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Razorpay Status:</span> {payment.razorpay_status || 'N/A'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Captured:</span> {payment.captured ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">International:</span> {payment.international ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Information */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Refunded Amount</div>
                    <div className="text-base font-medium">{formatCurrency(payment.refund)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Refunded to Wallet</div>
                    <div className="text-base font-medium">{formatCurrency(payment.refund_to_wallet)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Refundable Balance</div>
                    <div className="text-base font-medium">{formatCurrency(payment.total - payment.refund)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Refund Status</div>
                    <div className="text-base font-medium">
                      {payment.refund === 0
                        ? 'Not Refunded'
                        : payment.refund === payment.total
                        ? 'Fully Refunded'
                        : 'Partially Refunded'}
                    </div>
                  </div>
                </div>

                {showRefundForm && isRefundable() && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Process New Refund</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="refund-amount">Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">₹</span>
                            <Input 
                              id="refund-amount"
                              type="number"
                              className="pl-7"
                              value={refundAmount || ''}
                              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                              min={0}
                              max={payment.total - payment.refund}
                              step={0.01}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Max: {formatCurrency(payment.total - payment.refund)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="refund-type">Type</Label>
                          <Select
                            value={refundType}
                            onValueChange={(value) => setRefundType(value as 'bank' | 'wallet')}
                          >
                            <SelectTrigger id="refund-type">
                              <SelectValue placeholder="Select refund type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank">Bank</SelectItem>
                              <SelectItem value="wallet">Wallet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="refund-reason">Reason</Label>
                          <Textarea
                            id="refund-reason"
                            placeholder="Reason for refund"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleProcessRefund} 
                          disabled={isRefunding || refundAmount <= 0 || refundAmount > (payment.total - payment.refund)}
                        >
                          {isRefunding ? 'Processing...' : 'Process Refund'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-base font-medium">
                    {payment.billing_first_name} {payment.billing_last_name}
                  </div>
                  <div className="text-sm">{payment.billing_email}</div>
                  <div className="text-sm">{payment.billing_phone}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm">{payment.billing_address_1}</div>
                  {payment.billing_address_2 && (
                    <div className="text-sm">{payment.billing_address_2}</div>
                  )}
                  <div className="text-sm">
                    {payment.billing_city}, {payment.billing_postcode}
                  </div>
                  <div className="text-sm">
                    {payment.billing_country_area}, {payment.billing_country_code}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Notes</div>
                  <div className="text-sm">{payment.notes || 'No notes added'}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-sm">{payment.description || 'No description available'}</div>
                </div>
                
                {payment.error_code && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Error Information</div>
                    <div className="text-sm">
                      <span className="font-medium">Error Code:</span> {payment.error_code}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Error Description:</span> {payment.error_description || 'No details available'}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Created</div>
                    <div className="text-sm">{formatDate(payment.created)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Last Modified</div>
                    <div className="text-sm">{formatDate(payment.modified)}</div>
                  </div>
                  
                  {payment.customer_ip_address && (
                    <>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Customer IP</div>
                        <div className="text-sm">{payment.customer_ip_address}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Fraud Status</div>
                        <div className="text-sm">{payment.fraud_status || 'N/A'}</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">Payment Not Found</h3>
              <p className="text-sm text-gray-500">
                The payment you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentDetailPage;
