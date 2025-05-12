
import { apiService } from '@/services/api';

export const orderService = {
  // Get all orders with optional pagination
  getOrders: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/api/users/orders/?page=${page}` : '/api/users/orders/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get a specific order by ID
  getOrder: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/api/users/orders/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Process a refund
  processRefund: async (
    accessToken: string, 
    refundData: {
      razorpay_payment_id: string;
      amount?: number;
      refund_reason?: string;
      notes?: Record<string, string>;
    }
  ) => {
    try {
      return await apiService.post('/api/users/razorpay-refund/', refundData, accessToken);
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
};
