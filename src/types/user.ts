
// User types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string;
  date_joined: string;
  created_at?: string;
  updated_at?: string;
  profile?: UserProfile;
  groups?: import('@/types/group').Group[]; // Use the Group type from @/types/group
  permissions?: import('@/types/permission').Permission[]; // Use the Permission type from @/types/permission
  wallet_balance?: number;
}

export interface UserProfile {
  id: string;
  user: string | User;
  phone?: string;
  phone_number?: string; // Added for compatibility
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  pin?: string; // Added for compatibility
  avatar?: string;
  bio?: string;
  company?: string;
  position?: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  ocpi_party_id?: string; // Added for OCPI
  ocpi_role?: string; // Added for OCPI
  ocpi_token?: string; // Added for OCPI
}

// Using import type from the group.ts file to avoid circular dependencies
// Remove this re-export to avoid the Permission conflict
import type { Group } from '@/types/group';
export { Group };

export interface UserFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  role?: 'all' | 'superuser' | 'staff' | 'user';
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  profile?: {
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    pin?: string;
    bio?: string;
    company?: string;
    position?: string;
    ocpi_party_id?: string;
    ocpi_role?: string;
    ocpi_token?: string;
  };
  groups?: number[];
}

export interface UserUpdatePayload extends Partial<Omit<UserCreatePayload, 'id'>> {
  id: string | number;
  profile?: {
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    pin?: string;
    bio?: string;
    company?: string;
    position?: string;
    ocpi_party_id?: string;
    ocpi_role?: string;
    ocpi_token?: string;
  };
}

export interface ProfileUpdatePayload {
  phone?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  pin?: string;
  bio?: string;
  company?: string;
  position?: string;
  ocpi_party_id?: string;
  ocpi_role?: string;
  ocpi_token?: string;
}

// We no longer define Group and GroupCreatePayload types here as they should be imported from @/types/group
