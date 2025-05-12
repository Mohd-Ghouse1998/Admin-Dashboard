import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';
import { 
  Payment, 
  PaymentUpdateRequest, 
  PaymentFilters, 
  SessionBillingFilters 
} from '@/types/payment.types';
import { useToast } from '@/hooks/use-toast';

// Custom hook for Payment Management operations
export const usePayments = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for filtering and pagination
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>({
    page: 1
  });
  
  const [sessionBillingFilters, setSessionBillingFilters] = useState<SessionBillingFilters>({
    page: 1
  });

  // Get all payments with current filters
  const getPayments = () => {
    return useQuery({
      queryKey: ['payments', paymentFilters],
      queryFn: () => paymentService.getPayments(accessToken!, paymentFilters),
      enabled: !!accessToken,
      // Changed keepPreviousData to placeholderData with previous data
      placeholderData: (previousData) => previousData,
    });
  };

  // Get a single payment by id
  const getPayment = (id: string) => {
    return useQuery({
      queryKey: ['payment', id],
      queryFn: () => paymentService.getPaymentById(accessToken!, id),
      enabled: !!accessToken && !!id,
    });
  };

  // Update payment information
  const updatePayment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentUpdateRequest }) => {
      return paymentService.updatePayment(accessToken!, id, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the payment query to update the UI
      queryClient.invalidateQueries({ queryKey: ['payment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      toast({
        title: 'Payment updated',
        description: 'The payment information has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: `Failed to update payment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Get all session billings with current filters
  const getSessionBillings = () => {
    return useQuery({
      queryKey: ['sessionBillings', sessionBillingFilters],
      queryFn: () => paymentService.getSessionBillings(accessToken!, sessionBillingFilters),
      enabled: !!accessToken,
      // Changed keepPreviousData to placeholderData with previous data
      placeholderData: (previousData) => previousData,
    });
  };

  // Get a single session billing by id
  const getSessionBilling = (id: string) => {
    return useQuery({
      queryKey: ['sessionBilling', id],
      queryFn: () => paymentService.getSessionBillingById(accessToken!, id),
      enabled: !!accessToken && !!id,
    });
  };

  return {
    // Queries
    getPayments,
    getPayment,
    getSessionBillings,
    getSessionBilling,
    
    // Mutations
    updatePayment,
    
    // Filters and pagination state
    paymentFilters,
    setPaymentFilters,
    sessionBillingFilters,
    setSessionBillingFilters,
  };
};
