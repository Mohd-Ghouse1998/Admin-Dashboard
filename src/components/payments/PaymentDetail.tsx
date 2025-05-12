import React from 'react';
import { format } from 'date-fns';
import { Payment } from '@/types/payment.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentBadge } from './PaymentBadge';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface PaymentDetailProps {
  payment: Payment;
  isLoading?: boolean;
}

export function PaymentDetail({ payment, isLoading = false }: PaymentDetailProps) {
  const navigate = useNavigate();
  
  if (isLoading) {
    return <PaymentDetailSkeleton />;
  }
  
  const handleEditClick = () => {
    navigate(`/payments/${payment.id}/edit`);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Detailed information about this payment</CardDescription>
        </div>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto mt-2 sm:mt-0" 
          onClick={handleEditClick}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Payment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
              <p className="mt-1 text-sm font-semibold">{payment.transaction_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-2">
                <PaymentBadge status={payment.status} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
              <div className="mt-2">
                <PaymentBadge method={payment.payment_method} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">User</h3>
              <p className="mt-1 text-sm">{payment.user.username} ({payment.user.email})</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="mt-1 text-sm">
                {format(new Date(payment.created_at), "PPpp")}
              </p>
            </div>
            
            {payment.order_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                <p className="mt-1 text-sm">{payment.order_id}</p>
              </div>
            )}
            
            {payment.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-sm whitespace-pre-wrap">{payment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentDetailSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 mt-2 sm:mt-0" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
