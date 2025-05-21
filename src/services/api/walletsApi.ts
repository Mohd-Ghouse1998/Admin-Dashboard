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
export const getWallets = async (): Promise<Wallet[]> => {
  const response = await axiosInstance.get('/api/payment/wallets/');
  return response.data;
};

// Get a specific wallet by ID
export const getWallet = async (id: number): Promise<Wallet> => {
  const response = await axiosInstance.get(`/api/payment/wallets/${id}/`);
  return response.data;
};

// Create a new wallet
export const createWallet = async (data: { user: number; amount: number; reason?: string }): Promise<Wallet> => {
  const response = await axiosInstance.post('/api/payment/wallets/', data);
  return response.data;
};

// Update an existing wallet
export const updateWallet = async (id: number, data: Partial<Wallet>): Promise<Wallet> => {
  const response = await axiosInstance.patch(`/api/payment/wallets/${id}/`, data);
  return response.data;
};

// Delete a wallet
export const deleteWallet = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/payment/wallets/${id}/`);
};

// Get current user's wallet balance
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await axiosInstance.get('/api/payment/wallets/balance/');
  return response.data;
};

// Create a wallet deposit order
export const createWalletDepositOrder = async (amount: number): Promise<WalletDepositOrder> => {
  const response = await axiosInstance.post('/api/payment/wallets/deposit/order/', { amount });
  return response.data;
};

// Handle payment success
export const handlePaymentSuccess = async (data: PaymentSuccessRequest): Promise<{ success: boolean }> => {
  const response = await axiosInstance.post('/api/payment/wallets/deposit/success/', data);
  return response.data;
};

// Process refund
export const processRefund = async (data: RefundRequest): Promise<{ success: boolean }> => {
  const response = await axiosInstance.post('/api/payment/wallets/refund/', data);
  return response.data;
};
