import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, AlertTriangle } from 'lucide-react';
import { 
  getPaymentMethod, 
  PaymentMethod, 
  deletePaymentMethod,
  setDefaultPaymentMethod 
} from '@/services/api/paymentMethodsApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PaymentMethodDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchPaymentMethod = async () => {
      setIsLoading(true);
      try {
        const response = await getPaymentMethod(parseInt(id));
        setPaymentMethod(response.data);
      } catch (error) {
        console.error('Error fetching payment method:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment method details. Please try again.',
          variant: 'destructive',
        });
        navigate('/payment/methods');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethod();
  }, [id, toast, navigate]);

  const handleSetDefault = async () => {
    if (!id || !paymentMethod || paymentMethod.is_default) return;
    
    setIsSettingDefault(true);
    try {
      await setDefaultPaymentMethod(parseInt(id));
      setPaymentMethod({
        ...paymentMethod,
        is_default: true
      });
      toast({
        title: 'Success',
        description: 'Payment method set as default',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to set payment method as default. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deletePaymentMethod(parseInt(id));
      toast({
        title: 'Success',
        description: 'Payment method deleted successfully',
        variant: 'success',
      });
      navigate('/payment/methods');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment method. Please try again.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getCardIcon = () => {
    return <CreditCard className="h-10 w-10 text-primary" />;
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Payment Method Details"
        description="Loading payment method information"
        backButton
        backTo="/payment/methods"
      >
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </PageLayout>
    );
  }

  if (!paymentMethod) {
    return (
      <PageLayout
        title="Payment Method Not Found"
        description="The requested payment method does not exist"
        backButton
        backTo="/payment/methods"
      >
        <Card>
          <CardContent className="pt-6">
            <p>The payment method you're looking for could not be found.</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Payment Method Details"
      description="View payment method information"
      backButton
      backTo="/payment/methods"
      actions={
        <div className="flex space-x-2">
          {!paymentMethod.is_default && (
            <Button 
              variant="outline" 
              onClick={handleSetDefault}
              disabled={isSettingDefault}
            >
              <Check className="mr-2 h-4 w-4" />
              Set as Default
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Method'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this payment method from the system.
                  {paymentMethod.is_default && (
                    <p className="mt-2 text-red-500 font-semibold">
                      Warning: This is your default payment method. Deleting it will affect future payments.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {formatType(paymentMethod.type)}
              {paymentMethod.is_default && (
                <Badge className="ml-2" variant="default">Default</Badge>
              )}
              {!paymentMethod.is_active && (
                <Badge className="ml-2" variant="secondary">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription>Added on {new Date(paymentMethod.created_at).toLocaleDateString()}</CardDescription>
          </div>
          <div className="bg-muted rounded-full p-3">
            {getCardIcon()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Information */}
            {(paymentMethod.type === 'credit_card' || paymentMethod.type === 'debit_card') && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Card Number</p>
                  <p className="text-lg font-medium">
                    {paymentMethod.brand ? `${paymentMethod.brand} ` : ''}
                    **** **** **** {paymentMethod.last4 || '****'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Card Holder</p>
                  <p className="text-lg font-medium">{paymentMethod.card_holder_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                  <p className="text-lg font-medium">
                    {paymentMethod.expiry_month ? `${paymentMethod.expiry_month}/${paymentMethod.expiry_year}` : 'N/A'}
                  </p>
                </div>
              </>
            )}

            {/* UPI Information */}
            {paymentMethod.type === 'upi' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">UPI ID</p>
                <p className="text-lg font-medium">{paymentMethod.upi_id || 'N/A'}</p>
              </div>
            )}

            {/* Generic Information for all types */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Provider</p>
              <p className="text-lg font-medium">{paymentMethod.provider || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          {/* Additional Details */}
          {paymentMethod.details && Object.keys(paymentMethod.details).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(paymentMethod.details).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p>{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PaymentMethodDetailPage;
