
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RefundRequestPayload } from '@/types/wallet.types';

export const useOrders = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get all orders with optional pagination
  const getOrders = (page?: number) => {
    return useQuery({
      queryKey: ['orders', page],
      queryFn: async () => {
        try {
          const response = await orderService.getOrders(accessToken, page);
          console.log('Orders API response:', response);
          return response;
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: "Error",
            description: "Failed to fetch orders. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      }
    });
  };

  // Get order by ID
  const getOrder = (id: string) => {
    return useQuery({
      queryKey: ['order', id],
      queryFn: async () => {
        try {
          const response = await orderService.getOrder(accessToken, id);
          console.log(`Order ${id} API response:`, response);
          return response;
        } catch (error) {
          console.error(`Error fetching order ${id}:`, error);
          toast({
            title: "Error",
            description: `Failed to fetch order ${id}. Please try again.`,
            variant: "destructive",
          });
          throw error;
        }
      },
      enabled: !!id
    });
  };

  // Process a refund
  const processRefund = useMutation({
    mutationFn: async (refundData: RefundRequestPayload) => {
      try {
        const response = await orderService.processRefund(accessToken, refundData);
        console.log('Refund processed:', response);
        return response;
      } catch (error) {
        console.error('Error processing refund:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Refund processed successfully.",
        variant: "success",
      });
      // Invalidate queries to refetch order and wallet data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
      throw error;
    },
  });

  return {
    getOrders,
    getOrder,
    processRefund,
  };
};
