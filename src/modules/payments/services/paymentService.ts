
import axios from 'axios';
import { 
  Payment, 
  PaymentListResponse, 
  PaymentUpdateRequest, 
  SessionBilling, 
  SessionBillingListResponse,
  PaymentFilters,
  SessionBillingFilters
} from '@/types/payment.types';
import { apiService } from '@/services/api';

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
      return await apiService.get(`/api/users/payments/${queryString}`, accessToken);
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },
  
  // Get payment by ID - Fixed endpoint to use /users/payments/{id}/
  getPaymentById: async (accessToken: string, id: string): Promise<Payment> => {
    try {
      return await apiService.get(`/api/users/payments/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },
  
  // Get payment transactions - Fixing the endpoint URL format
  getPaymentTransactions: async (accessToken: string, paymentId: string): Promise<any> => {
    try {
      // Changed endpoint to ensure it aligns with backend API structure
      return await apiService.get(`/api/users/payments/${paymentId}/transaction/`, accessToken);
    } catch (error) {
      console.error(`Error fetching payment transactions: ${error}`);
      throw error;
    }
  },
  
  // Update payment information
  updatePayment: async (accessToken: string, id: string, data: PaymentUpdateRequest): Promise<Payment> => {
    try {
      return await apiService.put(`/api/users/payments/${id}/`, data, accessToken);
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
      return await apiService.get(`/api/users/session-billings/${queryString}`, accessToken);
    } catch (error) {
      console.error('Error fetching session billings:', error);
      throw error;
    }
  },
  
  // Get session billing by ID
  getSessionBillingById: async (accessToken: string, id: string): Promise<SessionBilling> => {
    try {
      return await apiService.get(`/api/users/session-billings/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching session billing ${id}:`, error);
      throw error;
    }
  }
};
