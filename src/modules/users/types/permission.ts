
export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
  user_count?: number;
  group_count?: number;
}

export interface PermissionFilters {
  app_label?: string;
  model?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PermissionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Permission[];
}

export interface UserPermissionResponse {
  permissions: string[];
}

export interface PermissionUpdatePayload {
  permissions: number[];
}
