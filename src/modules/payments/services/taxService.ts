
import { apiService } from '@/services/api';

export interface TaxTemplate {
  id: string;
  name: string;
  rate: number; // Percentage rate
  description?: string;
  jurisdiction?: string; // e.g., country, state, city
  tax_type: 'VAT' | 'GST' | 'Sales' | 'Other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxTemplateCreateUpdatePayload {
  name: string;
  rate: number;
  description?: string;
  jurisdiction?: string;
  tax_type: 'VAT' | 'GST' | 'Sales' | 'Other';
  is_active?: boolean;
}

export const taxService = {
  // Get all tax templates with optional pagination
  getTaxTemplates: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/users/tax-templates/?page=${page}` : '/users/tax-templates/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching tax templates:', error);
      throw error;
    }
  },

  // Get a specific tax template by ID
  getTaxTemplate: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/users/tax-templates/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching tax template ${id}:`, error);
      throw error;
    }
  },

  // Create a new tax template
  createTaxTemplate: async (accessToken: string, data: TaxTemplateCreateUpdatePayload) => {
    try {
      return await apiService.post('/users/tax-templates/', data, accessToken);
    } catch (error) {
      console.error('Error creating tax template:', error);
      throw error;
    }
  },

  // Update an existing tax template
  updateTaxTemplate: async (accessToken: string, id: string, data: TaxTemplateCreateUpdatePayload) => {
    try {
      return await apiService.put(`/users/tax-templates/${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating tax template ${id}:`, error);
      throw error;
    }
  },

  // Delete a tax template
  deleteTaxTemplate: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/users/tax-templates/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting tax template ${id}:`, error);
      throw error;
    }
  }
};
