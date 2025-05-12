
import { User } from "./user";
import { Permission } from "./permission";
export type { Permission } from "./permission";

export interface Group {
  id: number;
  name: string;
  permissions?: Permission[] | number[];
  users?: User[];
  description?: string;
}

export interface GroupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Group[];
}

export interface GroupCreatePayload {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface GroupUpdatePayload {
  id: number;
  name: string;
  description?: string;
  permissions?: number[];
}

export interface GroupUsersUpdatePayload {
  users: number[];
  action: 'add' | 'remove';
}

export interface GroupUsersResponse {
  status: string;
  message: string;
  processed_users: number[];
}
