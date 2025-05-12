
import { apiService } from '@/services/api';

export interface Promotion {
  id: string;
  name: string;
  code: string;
  amount: number;
  is_percentage: boolean;
  max_uses: number;
  uses_count: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface PromotionCreateUpdatePayload {
  name: string;
  code: string;
  amount: number;
  is_percentage: boolean;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  status?: 'active' | 'inactive';
}

export const promotionService = {
  // Get all promotions with optional pagination
  getPromotions: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/users/promotions/?page=${page}` : '/users/promotions/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  // Get a specific promotion by ID
  getPromotion: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/users/promotions/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching promotion ${id}:`, error);
      throw error;
    }
  },

  // Create a new promotion
  createPromotion: async (accessToken: string, data: PromotionCreateUpdatePayload) => {
    try {
      return await apiService.post('/users/promotions/', data, accessToken);
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  // Update an existing promotion
  updatePromotion: async (accessToken: string, id: string, data: PromotionCreateUpdatePayload) => {
    try {
      return await apiService.put(`/users/promotions/${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating promotion ${id}:`, error);
      throw error;
    }
  },

  // Delete a promotion
  deletePromotion: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/users/promotions/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting promotion ${id}:`, error);
      throw error;
    }
  }
};
