import apiClient from './apiClient';

// Interface for a PaymentInfo object
export interface PaymentInfo {
  id: number;
  user: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string;
  gateway_response: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Get all payments
export const getPayments = () => 
  apiClient.get<PaymentInfo[]>('/api/users/payments/');

// Get a specific payment by ID
export const getPayment = (id: number) => 
  apiClient.get<PaymentInfo>(`/api/users/payments/${id}/`);

// Create a new payment
export const createPayment = (data: Partial<PaymentInfo>) => 
  apiClient.post<PaymentInfo>('/api/users/payments/', data);

// Update an existing payment
export const updatePayment = (id: number, data: Partial<PaymentInfo>) => 
  apiClient.put<PaymentInfo>(`/api/users/payments/${id}/`, data);

// Delete a payment
export const deletePayment = (id: number) => 
  apiClient.delete(`/api/users/payments/${id}/`);
