
export interface Wallet {
  id: string;
  user: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
  transaction_id?: string;
  transaction_type?: string;
  amount?: number;
  description?: string;
  previous_balance?: number;
  new_balance?: number;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  last_transaction_date?: string;
}

export interface WalletDepositOrderPayload {
  amount: number;
  currency: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  key: string;
  order_id: string;
}

export interface PaymentVerificationPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface WalletTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Wallet[];
}

export interface RefundRequestPayload {
  razorpay_payment_id: string;
  amount?: number;
  refund_reason?: string;
  notes?: Record<string, string>;
}

export interface RefundResponse {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

export interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  payment_id?: string;
  created_at: string;
  user: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderDetails[];
}

// Additional interfaces for wallet statistics
export interface WalletStatistics {
  totalBalance: number;
  totalActiveWallets: number;
  averageBalance: number;
  transactionsCount: number;
}
