import apiClient from './apiClient';

// Interface for a Promotion object
export interface Promotion {
  id: number;
  name: string;
  description: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

// Get all promotions
export const getPromotions = () => 
  apiClient.get<Promotion[]>('/api/users/promotions/');

// Get a specific promotion by ID
export const getPromotion = (id: number) => 
  apiClient.get<Promotion>(`/api/users/promotions/${id}/`);

// Create a new promotion
export const createPromotion = (data: Partial<Promotion>) => 
  apiClient.post<Promotion>('/api/users/promotions/', data);

// Update an existing promotion
export const updatePromotion = (id: number, data: Partial<Promotion>) => 
  apiClient.put<Promotion>(`/api/users/promotions/${id}/`, data);

// Delete a promotion
export const deletePromotion = (id: number) => 
  apiClient.delete(`/api/users/promotions/${id}/`);
