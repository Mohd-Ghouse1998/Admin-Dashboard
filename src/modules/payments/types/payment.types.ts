
// Types for Payment Management module

// Base response interface for paginated API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page_size?: number;
}

// Payment status options
export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

// Payment method options
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'upi' 
  | 'net_banking'
  | 'wallet';

// Payment model
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id: string;
  notes?: string;
  order_id?: string;
}

// Payment list response
export type PaymentListResponse = PaginatedResponse<Payment>;

// Payment update request
export interface PaymentUpdateRequest {
  status?: PaymentStatus;
  notes?: string;
}

// Session Billing model
export interface SessionBilling {
  id: string;
  session_id: string;
  amount: number;
  kwh_consumed: number;
  time_consumed_seconds: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  charger: {
    id: string;
    name: string;
    location?: string;
  };
  connector_id: string;
  billing_components?: BillingComponent[];
}

// Billing component breakdown
export interface BillingComponent {
  name: string;
  amount: number;
  description?: string;
}

// Session billing list response
export type SessionBillingListResponse = PaginatedResponse<SessionBilling>;

// Filter parameters for payments list
export interface PaymentFilters {
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  user_id?: string;
  page?: number;
}

// Filter parameters for session billings list
export interface SessionBillingFilters {
  session_id?: string;
  user_id?: string;
  charger_id?: string;
  connector_id?: number; // Added missing property
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  payment_id?: string; // Added missing property
  id_tag?: string; // Added missing property
  page?: number;
}
