
import axios from 'axios';
import { 
  Payment, 
  PaymentListResponse, 
  PaymentUpdateRequest, 
  SessionBilling, 
  SessionBillingListResponse,
  PaymentFilters,
  SessionBillingFilters,
  PaymentStatus,
  PaymentMethod
} from '@/types/payment.types';
import { apiService } from '@/services/api';

// Define the PaymentStats interface
export interface PaymentStats {
  total_revenue: number;
  total_refunds: number;
  pending_amount: number;
  total_count: number;
  completed_count: number;
  pending_count: number;
  failed_count: number;
  trends?: {
    revenue: number;
    refunds: number;
    pending: number;
  };
}

// Payment Management service
// This service handles all API calls related to payments and session billings
export const paymentService = {
  // Get all payments with optional filtering and pagination
  getPayments: async (accessToken: string, filters?: PaymentFilters): Promise<PaymentListResponse> => {
    try {
      // Construct query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.payment_method) queryParams.append('payment_method', filters.payment_method);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        if (filters.min_amount) queryParams.append('min_amount', filters.min_amount.toString());
        if (filters.max_amount) queryParams.append('max_amount', filters.max_amount.toString());
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.user_id) queryParams.append('user_id', filters.user_id);
        if (filters.page) queryParams.append('page', filters.page.toString());
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // Important: Don't include '/api' in the endpoint as apiService already handles that
      const endpoint = `/users/payments${queryString}`;
      
      console.log('======= PAYMENT API REQUEST =======');
      console.log('Endpoint:', endpoint);
      console.log('Token (first 10 chars):', accessToken ? (accessToken.substring(0, 10) + '...') : 'No token');
      console.log('Filters:', filters);
      
      // Use apiService instead of direct fetch - this ensures consistent error handling
      // and proper base URL construction
      const result = await apiService.get(endpoint, accessToken);
      
      console.log('======= PAYMENT API RESPONSE =======');
      console.log('Success:', true);
      console.log('Response type:', typeof result);
      console.log('Has results array:', Array.isArray(result?.results));
      console.log('Results count:', result?.results?.length || 0);
      console.log('First result (if any):', result?.results?.[0] || 'No results');
      
      return result;
    } catch (error: any) {
      console.error('======= PAYMENT API ERROR =======');
      console.error('Error type:', error.constructor?.name || typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Is network error:', error.message?.includes('NetworkError') || 
                           error.message?.includes('Failed to fetch') || 
                           error.message?.includes('Network request failed'));
      throw error;
    }
  },
  
  // Get payment by ID - Fixed endpoint to use /users/payments/{id}/
  getPaymentById: async (accessToken: string, id: string): Promise<Payment> => {
    try {
      return await apiService.get(`/users/payments/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },
  
  // Get payment transactions - Fixing the endpoint URL format
  getPaymentTransactions: async (accessToken: string, paymentId: string): Promise<any> => {
    try {
      // Changed endpoint to ensure it aligns with backend API structure
      return await apiService.get(`/users/payments/${paymentId}/transaction/`, accessToken);
    } catch (error) {
      console.error(`Error fetching payment transactions: ${error}`);
      throw error;
    }
  },
  
  // Update payment information
  updatePayment: async (accessToken: string, id: string, data: PaymentUpdateRequest): Promise<Payment> => {
    try {
      return await apiService.put(`/users/payments/${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },
  
  // Get session billings with optional filtering and pagination
  getSessionBillings: async (accessToken: string, filters?: SessionBillingFilters): Promise<SessionBillingListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.charger_id) queryParams.append('charger_id', filters.charger_id);
        if (filters.connector_id) queryParams.append('connector_id', filters.connector_id.toString());
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        if (filters.min_amount) queryParams.append('min_amount', filters.min_amount.toString());
        if (filters.max_amount) queryParams.append('max_amount', filters.max_amount.toString());
        if (filters.payment_id) queryParams.append('payment_id', filters.payment_id);
        if (filters.id_tag) queryParams.append('id_tag', filters.id_tag);
        if (filters.page) queryParams.append('page', filters.page.toString());
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await apiService.get(`/users/session-billings/${queryString}`, accessToken);
    } catch (error) {
      console.error('Error fetching session billings:', error);
      throw error;
    }
  },
  
  // Get session billing by ID
  getSessionBillingById: async (accessToken: string, id: string): Promise<SessionBilling> => {
    try {
      return await apiService.get(`/users/session-billings/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching session billing ${id}:`, error);
      throw error;
    }
  },
  
  // Get payment statistics for KPI cards
  getPaymentStats: async (accessToken: string): Promise<PaymentStats> => {
    try {
      console.log('Fetching payment stats from API...');
      
      // Important: Don't include '/api' in the endpoint as apiService already handles that
      const endpoint = '/users/payments/stats/';
      
      console.log('Using apiService to fetch stats from:', endpoint);
      
      // Use apiService for consistent error handling and URL construction
      const result = await apiService.get(endpoint, accessToken);
      
      console.log('Stats API response:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },
};
