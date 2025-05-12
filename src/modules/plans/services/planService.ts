
import { apiService } from '@/services/api';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  features?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trial_days?: number;
}

export interface PlanCreateUpdatePayload {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  features?: string[];
  is_active?: boolean;
  trial_days?: number;
}

export interface PlanUser {
  id: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  plan: Plan;
  start_date: string;
  end_date?: string;
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface PlanUserCreatePayload {
  user_id: string;
  plan_id: string;
}

export const planService = {
  // Get all plans with optional pagination
  getPlans: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/api/users/plans/?page=${page}` : '/api/users/plans/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  // Get a specific plan by ID
  getPlan: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/api/users/plans/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching plan ${id}:`, error);
      throw error;
    }
  },

  // Create a new plan
  createPlan: async (accessToken: string, data: PlanCreateUpdatePayload) => {
    try {
      return await apiService.post('/api/users/plans/', data, accessToken);
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  // Update an existing plan
  updatePlan: async (accessToken: string, id: string, data: PlanCreateUpdatePayload) => {
    try {
      return await apiService.put(`/api/users/plans/${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating plan ${id}:`, error);
      throw error;
    }
  },

  // Delete a plan
  deletePlan: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/api/users/plans/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting plan ${id}:`, error);
      throw error;
    }
  },

  // Get all plan users with optional pagination
  getPlanUsers: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/api/users/plan-users/?page=${page}` : '/api/users/plan-users/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching plan users:', error);
      throw error;
    }
  },

  // Get a specific plan user by ID
  getPlanUser: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/api/users/plan-users/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching plan user ${id}:`, error);
      throw error;
    }
  },

  // Subscribe a user to a plan
  subscribeToPlan: async (accessToken: string, data: PlanUserCreatePayload) => {
    try {
      return await apiService.post('/api/users/plan-users/', data, accessToken);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  },

  // Cancel a plan subscription
  cancelSubscription: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/api/users/plan-users/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error cancelling subscription ${id}:`, error);
      throw error;
    }
  },

  // Pay for a subscription
  paySubscription: async (accessToken: string, data: any) => {
    try {
      return await apiService.post('/api/users/pay_subscription/', data, accessToken);
    } catch (error) {
      console.error('Error paying for subscription:', error);
      throw error;
    }
  },

  // Subscribe directly to a plan (single step)
  directSubscribe: async (accessToken: string, data: any) => {
    try {
      return await apiService.post('/api/users/subscribe_to_plan/', data, accessToken);
    } catch (error) {
      console.error('Error directly subscribing to plan:', error);
      throw error;
    }
  }
};
