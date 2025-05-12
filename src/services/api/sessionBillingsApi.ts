import axiosInstance from '@/api/axios';

// Interface for paginated API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface for a SessionBilling object
export interface SessionBilling {
  id: string;
  amount_added: number | null;
  amount_consumed: number | null;
  amount_refunded: number | null;
  time_added: number | null;
  time_consumed: number | null;
  time_refunded: number | null;
  kwh_added: number | null;
  kwh_consumed: number | null;
  kwh_refunded: number | null;
  cdr_sent: boolean;
  session: number;
}

// Get all session billings
export const getSessionBillings = () => 
  axiosInstance.get<PaginatedResponse<SessionBilling>>('/users/session-billings/');

// Get a specific session billing by ID
export const getSessionBilling = (id: string) => 
  axiosInstance.get<SessionBilling>(`/users/session-billings/${id}/`);

// Create a new session billing
export const createSessionBilling = (data: Partial<SessionBilling>) => 
  axiosInstance.post<SessionBilling>('/users/session-billings/', data);

// Update an existing session billing
export const updateSessionBilling = (id: string, data: Partial<SessionBilling>) => 
  axiosInstance.put<SessionBilling>(`/users/session-billings/${id}/`, data);

// Delete a session billing
export const deleteSessionBilling = (id: string) => 
  axiosInstance.delete(`/users/session-billings/${id}/`);
