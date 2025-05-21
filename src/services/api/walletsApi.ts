import axiosInstance from '@/api/axios';

// Use main axios instance that has proper interceptors for URL prefixes

// Interface for a Wallet object
export interface Wallet {
  id: number;
  user: number;
  username: string;
  amount: number;
  start_balance: number;
  end_balance: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

// Interface for wallet balance response
export interface WalletBalance {
  balance: number;
  last_transaction_date: string;
}

// Interface for wallet latest by user response - updated to match actual API format
export interface WalletUserTransaction {
  id: string;
  user: number;
  username: string;
  amount: number;
  start_balance: number;
  end_balance: number;
  reason: string;
  created_at: string;
  updated_at: string;
  user_details: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}

// Interface for wallet stats response
export interface WalletStats {
  current_balance: number;
  total_deposits: number;
  total_withdrawals: number;
}

// Interface for wallet deposit order
export interface WalletDepositOrder {
  order_id: string;
  [key: string]: any; // Additional Razorpay order details
}

// Interface for payment success request
export interface PaymentSuccessRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Interface for add funds request
export interface AddFundsRequest {
  user: number;
  amount: number;
  reason: string;
}

// Interface for refund request
export interface RefundRequest {
  razorpay_order_id: string;
  refund_amount: number;
  reason?: string;
  refund_type: 'bank' | 'wallet';
}

// Interface for paginated responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Wallet API Functions
 */

// Get all wallets with pagination and filtering
export const getWallets = (params?: Record<string, any>) => 
  axiosInstance.get<PaginatedResponse<Wallet>>('/api/users/wallets/', { params });

// Get wallet transactions by user ID
export const getWalletsByUser = (userId: number, params?: Record<string, any>) => 
  axiosInstance.get<PaginatedResponse<Wallet>>('/api/users/wallets/', { 
    params: { ...params, user: userId } 
  });

// Get the latest transaction for each user
export const getLatestTransactionsByUser = () => 
  axiosInstance.get<WalletUserTransaction[]>('/api/users/wallets/latest-by-user/');

// Get a specific wallet transaction by ID
export const getWallet = (id: number) => 
  axiosInstance.get<Wallet>(`/api/users/wallets/${id}/`);

// Get wallet statistics for a user
export const getWalletStats = (userId: number) => {
  return axiosInstance.get<WalletStats>(`/api/users/wallets/stats/`, {
    params: { user: userId }
  });
};

// Create a new wallet transaction
export const createWalletTransaction = (data: AddFundsRequest) => 
  axiosInstance.post<Wallet>('/api/users/wallets/', data);

// Get current user's wallet balance
export const getWalletBalance = () => 
  axiosInstance.get<WalletBalance>('/api/users/wallets/balance/');

// Create a wallet deposit order (Razorpay)
export const createWalletDepositOrder = (amount: number) => 
  axiosInstance.post<WalletDepositOrder>('/api/users/razorpay/create_wallet_deposit_order/', { amount });

// Handle payment success (Razorpay)
export const handlePaymentSuccess = (data: PaymentSuccessRequest) => 
  axiosInstance.post('/api/users/razorpay/handle_payment_success/', data);

// Process refund (Razorpay)
export const processRefund = (data: RefundRequest) => 
  axiosInstance.post('/api/users/razorpay-refund/', data);
