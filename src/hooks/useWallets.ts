
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { walletService } from '@/services/walletService';
import { orderService } from '@/services/orderService';
import { 
  Wallet, 
  WalletBalance, 
  WalletTransactionsResponse, 
  OrdersResponse, 
  WalletStatistics,
  WalletDepositOrderPayload,
  PaymentVerificationPayload
} from '@/types/wallet.types';

export const useWallets = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  // Get all wallet transactions with pagination
  const getWalletTransactions = (page = 1) => {
    return useQuery({
      queryKey: ['walletTransactions', page],
      queryFn: () => accessToken ? walletService.getWallets(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };
  
  // Get specific wallet transaction
  const getWalletTransaction = (id: string) => {
    return useQuery({
      queryKey: ['walletTransaction', id],
      queryFn: () => accessToken ? walletService.getWallet(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };
  
  // Get wallet balance
  const getWalletBalance = () => {
    const result = useQuery({
      queryKey: ['walletBalance'],
      queryFn: () => accessToken ? walletService.getWalletBalance(accessToken) : Promise.reject('No access token'),
      enabled: !!accessToken,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
      ...result,
      refetch: async () => {
        return queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      },
      isRefetching: result.isRefetching,
    };
  };
  
  // Create a wallet deposit order
  const createWalletDepositOrder = useMutation({
    mutationFn: (data: WalletDepositOrderPayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return walletService.createWalletDepositOrder(accessToken, data);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
    }
  });
  
  // Handle payment success
  const handlePaymentSuccess = useMutation({
    mutationFn: (data: PaymentVerificationPayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return walletService.handlePaymentSuccess(accessToken, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
    }
  });
  
  // Get orders with pagination
  const getOrders = (page = 1) => {
    return useQuery({
      queryKey: ['orders', page],
      queryFn: () => accessToken ? orderService.getOrders(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };
  
  // Get specific order
  const getOrder = (id: string) => {
    return useQuery({
      queryKey: ['order', id],
      queryFn: () => accessToken ? orderService.getOrder(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };
  
  // Process a refund
  const processRefund = useMutation({
    mutationFn: (data: { razorpay_payment_id: string; amount?: number; refund_reason?: string; notes?: Record<string, string> }) => {
      if (!accessToken) return Promise.reject('No access token');
      return orderService.processRefund(accessToken, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  // Get wallet statistics
  const getWalletStatistics = () => {
    // This query uses the wallet transactions and balance to calculate statistics
    const transactionsQuery = useQuery({
      queryKey: ['walletTransactions', 1],
      queryFn: () => accessToken ? walletService.getWallets(accessToken, 1) : Promise.reject('No access token'),
      enabled: !!accessToken,
      select: (data: WalletTransactionsResponse): WalletStatistics => {
        // Calculate statistics from transaction data
        const totalActiveWallets = data.count > 0 ? 1 : 0; // Assuming one active wallet per user
        const totalBalance = data.results[0]?.balance || 0;
        const averageBalance = totalBalance;
        const transactionsCount = data.count;
        
        return {
          totalBalance,
          totalActiveWallets,
          averageBalance,
          transactionsCount
        };
      }
    });
    
    // Get wallet balance in parallel
    const balanceQuery = useQuery({
      queryKey: ['walletBalance'],
      queryFn: () => accessToken ? walletService.getWalletBalance(accessToken) : Promise.reject('No access token'),
      enabled: !!accessToken
    });
    
    // Combine the results
    return {
      data: transactionsQuery.data,
      isLoading: transactionsQuery.isLoading || balanceQuery.isLoading,
      error: transactionsQuery.error || balanceQuery.error,
      isError: transactionsQuery.isError || balanceQuery.isError,
      refetch: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['walletTransactions'] }),
          queryClient.invalidateQueries({ queryKey: ['walletBalance'] })
        ]);
      }
    };
  };

  return {
    getWalletTransactions,
    getWalletTransaction,
    getWalletBalance,
    createWalletDepositOrder,
    handlePaymentSuccess,
    getOrders,
    getOrder,
    processRefund,
    getWalletStatistics
  };
};
