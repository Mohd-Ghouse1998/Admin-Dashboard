import apiClient from './apiClient';

// Interface for a Plan object
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for a PlanUser object (subscription)
export interface PlanUser {
  id: number;
  user: number;
  plan: number;
  expiry: string;
  active: boolean;
  validity: number;
  created_at: string;
  updated_at: string;
}

// Get all plans
export const getPlans = () => 
  apiClient.get<Plan[]>('/api/users/plans/');

// Get a specific plan by ID
export const getPlan = (id: number) => 
  apiClient.get<Plan>(`/api/users/plans/${id}/`);

// Create a new plan
export const createPlan = (data: Partial<Plan>) => 
  apiClient.post<Plan>('/api/users/plans/', data);

// Update an existing plan
export const updatePlan = (id: number, data: Partial<Plan>) => 
  apiClient.put<Plan>(`/api/users/plans/${id}/`, data);

// Delete a plan
export const deletePlan = (id: number) => 
  apiClient.delete(`/api/users/plans/${id}/`);

// Get all plan users (subscriptions)
export const getPlanUsers = () => 
  apiClient.get<PlanUser[]>('/api/users/plan-users/');

// Get a specific plan user by ID
export const getPlanUser = (id: number) => 
  apiClient.get<PlanUser>(`/api/users/plan-users/${id}/`);

// Create a new plan user (subscription)
export const createPlanUser = (data: { user: number; plan: number; expiry?: string; active?: boolean; validity?: number }) => 
  apiClient.post<PlanUser>('/api/users/plan-users/', data);

// Delete a plan user (subscription)
export const deletePlanUser = (id: number) => 
  apiClient.delete(`/api/users/plan-users/${id}/`);

// Subscribe a user to a plan
export const subscribeUserToPlan = (data: { user: number; plan: number }) => 
  apiClient.post<PlanUser>('/api/users/subscribe_to_plan/', data);

// Process a subscription payment
export const paySubscription = (data: { user: number; plan: number }) => 
  apiClient.post('/api/users/pay_subscription/', data);
