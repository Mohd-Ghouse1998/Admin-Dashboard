import axiosInstance from '@/api/axios';

// Interface for paginated responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface for payment info object
export interface PaymentInfo {
  id: string;
  fee: number;
  captured: boolean;
  refund: number;
  refund_to_wallet: number;
  notes: string | null;
  international: boolean;
  error_code: string | null;
  error_description: string | null;
  variant: string;
  status: string;
  fraud_status: string;
  fraud_message: string;
  created: string;
  modified: string;
  transaction_id: string;
  currency: string;
  total: string;
  delivery: string;
  tax: string;
  description: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_address_1: string;
  billing_address_2: string;
  billing_city: string;
  billing_postcode: string;
  billing_country_code: string;
  billing_country_area: string;
  billing_email: string;
  billing_phone: string;
  customer_ip_address: string | null;
  extra_data: string;
  message: string;
  token: string;
  captured_amount: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  razorpay_status: string;
  paytm_order_id: string | null;
  paytm_transaction_id: string | null;
  paytm_bank_transaction_id: string | null;
  paytm_checksum: string | null;
  paytm_response: string | null;
  paytm_status: string;
  order: string;
}

// Interface for an Order object
export interface Order {
  id: string;
  user: number;
  username: string;
  amount: number;
  tax: number;
  gateway_id: string | null;
  gateway_name: string | null;
  order_serial: string | null;
  order_number?: string; // For backward compatibility
  total_amount?: number; // For backward compatibility
  type: string;
  limit_type: string | null;
  property: string | null;
  status: string;
  payment_info: PaymentInfo;
  payment_method?: string;
  payment_status?: string;
  shipping_address?: string;
  billing_address?: string;
  discount_amount?: number;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

// Interface for an Order Item
export interface OrderItem {
  id: number;
  order: number;
  product_name: string;
  product_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Get all orders
export const getOrders = () => 
  axiosInstance.get<PaginatedResponse<Order>>('/users/orders/');

// Get a specific order by ID
export const getOrder = (id: string) => 
  axiosInstance.get<Order>(`/users/orders/${id}/`);

// Create a new order
export const createOrder = (data: Partial<Order>) => 
  axiosInstance.post<Order>('/users/orders/', data);

// Update an existing order
export const updateOrder = (id: number, data: Partial<Order>) => 
  axiosInstance.put<Order>(`/users/orders/${id}/`, data);

// Delete an order
export const deleteOrder = (id: number) => 
  axiosInstance.delete(`/users/orders/${id}/`);
