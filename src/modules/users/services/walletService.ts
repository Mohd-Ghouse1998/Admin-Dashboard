
import { apiService } from '@/services/api';
import { WalletBalance, WalletTransactionsResponse, Wallet, RazorpayOrderResponse } from '@/types/wallet.types';

export const walletService = {
  // Get all wallets/transactions with optional pagination
  getWallets: async (accessToken: string, page?: number): Promise<WalletTransactionsResponse> => {
    try {
      const url = page ? `/api/users/wallets/?page=${page}` : '/api/users/wallets/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  },

  // Get a specific wallet by ID
  getWallet: async (accessToken: string, id: string): Promise<Wallet> => {
    try {
      return await apiService.get(`/api/users/wallets/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching wallet ${id}:`, error);
      throw error;
    }
  },

  // Get wallet transactions for a specific wallet
  getWalletTransactions: async (accessToken: string, walletId: string): Promise<WalletTransactionsResponse> => {
    try {
      return await apiService.get(`/api/users/wallets/${walletId}/transactions/`, accessToken);
    } catch (error) {
      console.error(`Error fetching wallet transactions for ${walletId}:`, error);
      throw error;
    }
  },

  // Get wallet balance
  getWalletBalance: async (accessToken: string): Promise<WalletBalance> => {
    try {
      return await apiService.get('/api/users/wallets/balance/', accessToken);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  // Create a wallet deposit order (Razorpay)
  createWalletDepositOrder: async (accessToken: string, data: { amount: number; currency: string }): Promise<RazorpayOrderResponse> => {
    try {
      return await apiService.post('/api/users/razorpay/create_wallet_deposit_order/', data, accessToken);
    } catch (error) {
      console.error('Error creating wallet deposit order:', error);
      throw error;
    }
  },

  // Handle payment success
  handlePaymentSuccess: async (
    accessToken: string,
    data: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ) => {
    try {
      return await apiService.post('/api/users/razorpay/handle_payment_success/', data, accessToken);
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  },

  // Deposit funds to a wallet
  depositFunds: async (accessToken: string, walletId: string, amount: number): Promise<Wallet> => {
    try {
      return await apiService.post(`/api/users/wallets/${walletId}/deposit/`, { amount }, accessToken);
    } catch (error) {
      console.error(`Error depositing funds to wallet ${walletId}:`, error);
      throw error;
    }
  },

  // Withdraw funds from a wallet
  withdrawFunds: async (accessToken: string, walletId: string, amount: number): Promise<Wallet> => {
    try {
      return await apiService.post(`/api/users/wallets/${walletId}/withdraw/`, { amount }, accessToken);
    } catch (error) {
      console.error(`Error withdrawing funds from wallet ${walletId}:`, error);
      throw error;
    }
  },

  // Update wallet (for admin purposes)
  updateWallet: async (accessToken: string, id: string, data: any) => {
    try {
      return await apiService.put(`/api/users/wallets/${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating wallet ${id}:`, error);
      throw error;
    }
  }
};
