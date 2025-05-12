export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface PlanUser {
  id: string;
  user_id: string;
  plan_id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface PlanResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plan[];
}

export interface PlanUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PlanUser[];
}

export interface PlanCreatePayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_active: boolean;
}

export interface PlanUpdatePayload extends PlanCreatePayload {
  id: string;
}

export interface PlanUserCreatePayload {
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export interface PlanUserUpdatePayload {
  id: string;
  end_date?: string | null;
  is_active: boolean;
}
