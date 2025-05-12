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

// Get all wallets
export const getWallets = () => 
  axiosInstance.get<PaginatedResponse<Wallet>>('/users/wallets/');

// Get a specific wallet by ID
export const getWallet = (id: number) => 
  axiosInstance.get<Wallet>(`/users/wallets/${id}/`);

// Create a new wallet
export const createWallet = (data: { user: number; amount: number; reason?: string }) => 
  axiosInstance.post<Wallet>('/users/wallets/', data);

// Update an existing wallet
export const updateWallet = (id: number, data: Partial<Wallet>) => 
  axiosInstance.put<Wallet>(`/users/wallets/${id}/`, data);

// Delete a wallet
export const deleteWallet = (id: number) => 
  axiosInstance.delete(`/users/wallets/${id}/`);

// Get current user's wallet balance
export const getWalletBalance = () => 
  axiosInstance.get<WalletBalance>('/users/wallets/balance/');

// Create a wallet deposit order
export const createWalletDepositOrder = (amount: number) => 
  axiosInstance.post<WalletDepositOrder>('/users/razorpay/create_wallet_deposit_order/', { amount });

// Handle payment success
export const handlePaymentSuccess = (data: PaymentSuccessRequest) => 
  axiosInstance.post('/users/razorpay/handle_payment_success/', data);

// Process refund
export const processRefund = (data: RefundRequest) => 
  axiosInstance.post('/users/razorpay-refund/', data);
