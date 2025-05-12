import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { ArrowLeft, FileText, Edit, Download } from 'lucide-react';
import { getOrder, Order, OrderItem } from '@/services/api/ordersApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await getOrder(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'PPP');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Error';
    }
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return format(date, 'p');
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Error';
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'completed':
        variant = 'success';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'cancelled':
      case 'failed':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'paid':
        variant = 'success';
        break;
      case 'unpaid':
        variant = 'secondary';
        break;
      case 'refunded':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Order Details"
        description="Loading order information"
        backButton
        backTo="/payment/orders"
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout
        title="Order Not Found"
        description="The requested order could not be found"
        backButton
        backTo="/payment/orders"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/payment/orders')}>Return to Orders</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Order ${order.id}`}
      description={`Order for ${order.username}`}
      backButton
      backTo="/payment/orders"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/payment/orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Order details and status information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p className="text-lg font-medium">{order.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-base">{order.username}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-medium">{formatCurrency(order.amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tax</p>
                <p className="text-base">{formatCurrency(order.tax)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                <p className="text-base">{order.type || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment details and gateway information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                <p className="text-base">{order.payment_info.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <p className="text-base">{order.payment_info.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="text-base">{order.payment_info.transaction_id || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-base">{formatDate(order.payment_info.created)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-base">{order.payment_info.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Captured Amount</p>
                <p className="text-base">{order.payment_info.captured_amount}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold mb-3">Razorpay Details</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Razorpay Status</p>
                    <p className="text-base">{order.payment_info.razorpay_status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Razorpay Order ID</p>
                    <p className="text-base">{order.payment_info.razorpay_order_id || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Razorpay Payment ID</p>
                    <p className="text-base">{order.payment_info.razorpay_payment_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-3">Paytm Details</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Paytm Status</p>
                    <p className="text-base">{order.payment_info.paytm_status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Paytm Order ID</p>
                    <p className="text-base">{order.payment_info.paytm_order_id || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Paytm Transaction ID</p>
                    <p className="text-base">{order.payment_info.paytm_transaction_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Customer billing details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                  <p className="text-base">
                    {order.payment_info.billing_first_name || ''} {order.payment_info.billing_last_name || ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{order.payment_info.billing_email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{order.payment_info.billing_phone || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Billing Address</p>
                  <p className="text-base">
                    {order.payment_info.billing_address_1 ? (
                      <>
                        {order.payment_info.billing_address_1}
                        <br />
                        {order.payment_info.billing_address_2 && (
                          <>
                            {order.payment_info.billing_address_2}
                            <br />
                          </>
                        )}
                        {order.payment_info.billing_city && (
                          <>
                            {order.payment_info.billing_city},{' '}
                          </>
                        )}
                        {order.payment_info.billing_country_area && (
                          <>
                            {order.payment_info.billing_country_area}{' '}
                          </>
                        )}
                        {order.payment_info.billing_postcode && (
                          <>
                            {order.payment_info.billing_postcode}
                            <br />
                          </>
                        )}
                        {order.payment_info.billing_country_code}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Products included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: OrderItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No items available for this order</p>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-end pt-6">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.amount - order.tax)}</span>
              </div>
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.amount)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Customer Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{order.shipping_address || 'No shipping address provided'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{order.billing_address || 'Same as shipping address'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderDetailPage;
