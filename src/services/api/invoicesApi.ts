import apiClient from './apiClient';

// Interface for an Invoice object
export interface Invoice {
  id: number;
  invoice_number: string;
  order_id?: number;
  user_id: number;
  user_name: string;
  user_email?: string;
  billing_address: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

// Interface for an Invoice Item
export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Interface for pagination
export interface InvoiceListResponse {
  results: Invoice[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Interface for invoice filters
export interface InvoiceFilters {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Get all invoices with optional filters
export const getInvoices = (filters?: InvoiceFilters) => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('page_size', filters.pageSize.toString());
  }
  
  return apiClient.get<InvoiceListResponse>('/api/users/invoices/', { params });
};

// Get a specific invoice by ID
export const getInvoice = (id: number) => 
  apiClient.get<Invoice>(`/api/users/invoices/${id}/`);

// Create a new invoice
export const createInvoice = (data: Partial<Invoice>) => 
  apiClient.post<Invoice>('/api/users/invoices/', data);

// Update an existing invoice
export const updateInvoice = (id: number, data: Partial<Invoice>) => 
  apiClient.put<Invoice>(`/api/users/invoices/${id}/`, data);

// Delete an invoice
export const deleteInvoice = (id: number) => 
  apiClient.delete(`/api/users/invoices/${id}/`);

// Mark invoice as sent
export const markInvoiceAsSent = (id: number) => 
  apiClient.post(`/api/users/invoices/${id}/mark-as-sent/`, {});

// Mark invoice as paid
export const markInvoiceAsPaid = (id: number, paymentDate: string, paymentMethod: string) => 
  apiClient.post(`/api/users/invoices/${id}/mark-as-paid/`, { payment_date: paymentDate, payment_method: paymentMethod });

// Generate PDF for an invoice
export const generateInvoicePdf = (id: number) => 
  apiClient.get(`/api/users/invoices/${id}/pdf/`, { responseType: 'blob' });

// Send invoice via email
export const sendInvoiceEmail = (id: number, email: string) => 
  apiClient.post(`/api/users/invoices/${id}/send-email/`, { email });
