
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { walletService } from '@/services/walletService';
import { Wallet } from '@/types/wallet.types';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get specific wallet
  const getWallet = (walletId: string) => {
    return useQuery({
      queryKey: ['wallet', walletId],
      queryFn: async () => {
        try {
          const response = await walletService.getWallet(accessToken, walletId);
          return response;
        } catch (error) {
          console.error(`Error fetching wallet ${walletId}:`, error);
          throw error;
        }
      },
      enabled: !!walletId
    });
  };

  // Get wallet transactions
  const getWalletTransactions = (walletId: string) => {
    return useQuery({
      queryKey: ['walletTransactions', walletId],
      queryFn: async () => {
        try {
          const response = await walletService.getWalletTransactions(accessToken, walletId);
          return response;
        } catch (error) {
          console.error(`Error fetching wallet transactions for ${walletId}:`, error);
          throw error;
        }
      },
      enabled: !!walletId
    });
  };

  // Add funds to wallet (deposit)
  const depositFunds = useMutation({
    mutationFn: async (data: { walletId: string; amount: number }) => {
      try {
        const response = await walletService.depositFunds(accessToken, data.walletId, data.amount);
        return response;
      } catch (error) {
        console.error('Error depositing funds:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds deposited successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to deposit funds. Please try again.",
        variant: "destructive",
      });
      throw error;
    },
  });

  // Withdraw funds from wallet
  const withdrawFunds = useMutation({
    mutationFn: async (data: { walletId: string; amount: number }) => {
      try {
        const response = await walletService.withdrawFunds(accessToken, data.walletId, data.amount);
        return response;
      } catch (error) {
        console.error('Error withdrawing funds:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds withdrawn successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to withdraw funds. Please try again.",
        variant: "destructive",
      });
      throw error;
    },
  });

  // Refresh data manually
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
    queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
  };

  return {
    getWallet,
    getWalletTransactions,
    depositFunds,
    withdrawFunds,
    refreshData,
    isLoading: false,
    isLoadingTransactions: false,
    isLoadingDeposit: depositFunds.isPending,
    isLoadingWithdraw: withdrawFunds.isPending,
    errorWallet: null,
    errorTransactions: null,
    errorDeposit: depositFunds.error,
    errorWithdraw: withdrawFunds.error,
  };
};
