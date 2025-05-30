import axios from '@/api/axios';

export interface PaymentFilters {
  status?: string;
  variant?: string; // Payment method type
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
  min_amount?: number;
  max_amount?: number;
}

export interface PaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentListItem[];
}

export interface PaymentListItem {
  id: string;
  order_id: string;
  username: string;
  total: number;
  refund: number;
  status: string;
  variant: string; // Payment method
  created: string;
}

export interface PaymentDetail {
  // Basic Info
  id: string;
  order_id: string;
  username: string;
  user_id: string;
  user_email: string;
  created: string;
  modified: string;
  status: string;
  
  // Payment Details
  total: number;
  tax: number;
  fee: number;
  currency: string;
  variant: string;
  transaction_id: string;
  captured: boolean;
  international: boolean;
  
  // Razorpay Details
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_status: string;
  razorpay_signature: string;
  
  // Refund Details
  refund: number;
  refund_to_wallet: number;
  
  // Billing Details
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address_1: string;
  billing_address_2: string;
  billing_city: string;
  billing_postcode: string;
  billing_country_code: string;
  billing_country_area: string;
  
  // Additional Info
  notes: string;
  description: string;
  error_code: string;
  error_description: string;
  customer_ip_address: string;
  fraud_status: string;
  fraud_message: string;
}

export interface RefundFormData {
  refund_amount: number;
  refund_type: 'bank' | 'wallet';
  reason: string;
  razorpay_order_id?: string; // Only needed for standalone API
}

export const paymentService = {
  // Get all payments with optional filtering and pagination
  getPayments: async (filters?: PaymentFilters): Promise<PaymentListResponse> => {
    try {
      // Construct query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.variant) queryParams.append('variant', filters.variant);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.min_amount) queryParams.append('min_amount', filters.min_amount.toString());
        if (filters.max_amount) queryParams.append('max_amount', filters.max_amount.toString());
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`/users/payments/${queryString}`);  
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },
  
  // Get payment by ID
  getPaymentById: async (id: string): Promise<PaymentDetail> => {
    try {
      const response = await axios.get(`/users/payments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },
  
  // Get payment stats (for dashboard KPIs)
  getPaymentStats: async (): Promise<any> => {
    try {
      const response = await axios.get(`/users/payments/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },
  
  // Process a refund for a payment
  processRefund: async (id: string, refundData: RefundFormData): Promise<any> => {
    try {
      const response = await axios.post(`/users/payments/${id}/refund/`, refundData);
      return response.data;
    } catch (error) {
      console.error(`Error processing refund for payment ${id}:`, error);
      throw error;
    }
  },
  
  // Process a standalone razorpay refund
  processRazorpayRefund: async (refundData: RefundFormData): Promise<any> => {
    try {
      const response = await axios.post('/users/razorpay-refund/', refundData);
      return response.data;
    } catch (error) {
      console.error('Error processing razorpay refund:', error);
      throw error;
    }
  }
};
