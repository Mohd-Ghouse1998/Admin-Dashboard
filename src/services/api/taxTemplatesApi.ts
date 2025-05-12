import apiClient from './apiClient';

// Interface for a Tax Template object
export interface TaxTemplate {
  id: number;
  name: string;
  description: string;
  tax_type: string;
  tax_rate: number;
  is_active: boolean;
  country: string;
  state: string;
  is_compound: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Get all tax templates
export const getTaxTemplates = () => 
  apiClient.get<TaxTemplate[]>('/api/users/tax-templates/');

// Get a specific tax template by ID
export const getTaxTemplate = (id: number) => 
  apiClient.get<TaxTemplate>(`/api/users/tax-templates/${id}/`);

// Create a new tax template
export const createTaxTemplate = (data: Partial<TaxTemplate>) => 
  apiClient.post<TaxTemplate>('/api/users/tax-templates/', data);

// Update an existing tax template
export const updateTaxTemplate = (id: number, data: Partial<TaxTemplate>) => 
  apiClient.put<TaxTemplate>(`/api/users/tax-templates/${id}/`, data);

// Delete a tax template
export const deleteTaxTemplate = (id: number) => 
  apiClient.delete(`/api/users/tax-templates/${id}/`);
