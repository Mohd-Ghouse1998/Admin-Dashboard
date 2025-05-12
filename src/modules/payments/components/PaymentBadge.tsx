
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus, PaymentMethod } from '@/types/payment.types';

interface PaymentBadgeProps {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export function PaymentBadge({ status, method }: PaymentBadgeProps) {
  // Render payment status badge
  if (status) {
    const badgeProps = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      completed: { className: 'bg-green-100 text-green-800 border-green-300' },
      failed: { className: 'bg-red-100 text-red-800 border-red-300' },
      refunded: { className: 'bg-blue-100 text-blue-800 border-blue-300' },
      partially_refunded: { className: 'bg-purple-100 text-purple-800 border-purple-300' },
    }[status] || { className: 'bg-gray-100 text-gray-800 border-gray-300' };
    
    return (
      <Badge variant="outline" {...badgeProps}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  }
  
  // Render payment method badge
  if (method) {
    const badgeProps = {
      credit_card: { className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      debit_card: { className: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
      upi: { className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      net_banking: { className: 'bg-amber-100 text-amber-800 border-amber-300' },
      wallet: { className: 'bg-violet-100 text-violet-800 border-violet-300' },
    }[method] || { className: 'bg-gray-100 text-gray-800 border-gray-300' };
    
    return (
      <Badge variant="outline" {...badgeProps}>
        {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
      </Badge>
    );
  }
  
  return null;
}
