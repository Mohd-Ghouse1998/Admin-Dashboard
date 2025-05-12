
import { apiService } from '@/lib/api';
import { Tenant, TenantDomain, TenantApp, TenantCreatePayload, TenantUpdatePayload } from '@/modules/tenants/types';

// API endpoints - updated according to the requirements
const TENANT_CLIENTS = '/tenant/clients/';
const TENANT_DOMAINS = '/tenant/domains/';
const TENANT_APPS = '/tenant/apps/';
const TENANT_USERS = '/tenant/users/';
const TENANT_GROUPS = '/tenant/groups/';

export const tenantService = {
  // Tenant CRUD operations
  getTenants: async (accessToken: string, page?: number, searchQuery?: string) => {
    try {
      let url = TENANT_CLIENTS;
      const params = [];
      
      if (page) params.push(`page=${page}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      
      if (params.length > 0) {
        url = `${url}?${params.join('&')}`;
      }
      
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  getTenant: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.get(`${TENANT_CLIENTS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching tenant ${id}:`, error);
      throw error;
    }
  },

  createTenant: async (accessToken: string, tenantData: TenantCreatePayload) => {
    try {
      return await apiService.post(TENANT_CLIENTS, tenantData, accessToken);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  updateTenant: async (accessToken: string, id: string | number, tenantData: TenantUpdatePayload) => {
    try {
      return await apiService.put(`${TENANT_CLIENTS}${id}/`, tenantData, accessToken);
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  },

  deleteTenant: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.delete(`${TENANT_CLIENTS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
      throw error;
    }
  },

  // Tenant status management
  activateTenant: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.post(`${TENANT_CLIENTS}${id}/activate/`, {}, accessToken);
    } catch (error) {
      console.error(`Error activating tenant ${id}:`, error);
      throw error;
    }
  },

  deactivateTenant: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.post(`${TENANT_CLIENTS}${id}/deactivate/`, {}, accessToken);
    } catch (error) {
      console.error(`Error deactivating tenant ${id}:`, error);
      throw error;
    }
  },

  // Domain management
  getDomains: async (accessToken: string, tenantId?: string | number) => {
    try {
      let url = TENANT_DOMAINS;
      if (tenantId) {
        url = `${url}?tenant=${tenantId}`;
      }
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  },

  getDomain: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.get(`${TENANT_DOMAINS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching domain ${id}:`, error);
      throw error;
    }
  },

  createDomain: async (accessToken: string, domain: string, tenantId: string | number, isPrimary: boolean = false) => {
    try {
      return await apiService.post(TENANT_DOMAINS, {
        domain,
        tenant: tenantId,
        is_primary: isPrimary
      }, accessToken);
    } catch (error) {
      console.error('Error creating domain:', error);
      throw error;
    }
  },

  updateDomain: async (accessToken: string, id: string | number, data: any) => {
    try {
      return await apiService.put(`${TENANT_DOMAINS}${id}/`, data, accessToken);
    } catch (error) {
      console.error(`Error updating domain ${id}:`, error);
      throw error;
    }
  },

  deleteDomain: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.delete(`${TENANT_DOMAINS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting domain ${id}:`, error);
      throw error;
    }
  },

  // App management
  getApps: async (accessToken: string) => {
    try {
      return await apiService.get(TENANT_APPS, accessToken);
    } catch (error) {
      console.error('Error fetching apps:', error);
      throw error;
    }
  },

  getApp: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.get(`${TENANT_APPS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching app ${id}:`, error);
      throw error;
    }
  },

  // User management in tenant context
  getTenantUsers: async (accessToken: string, page?: number) => {
    try {
      let url = TENANT_USERS;
      if (page) {
        url = `${url}?page=${page}`;
      }
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching tenant users:', error);
      throw error;
    }
  },

  getTenantUser: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.get(`${TENANT_USERS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching tenant user ${id}:`, error);
      throw error;
    }
  },

  createTenantUser: async (accessToken: string, userData: any) => {
    try {
      return await apiService.post(TENANT_USERS, userData, accessToken);
    } catch (error) {
      console.error('Error creating tenant user:', error);
      throw error;
    }
  },

  updateTenantUser: async (accessToken: string, id: string | number, userData: any) => {
    try {
      return await apiService.put(`${TENANT_USERS}${id}/`, userData, accessToken);
    } catch (error) {
      console.error(`Error updating tenant user ${id}:`, error);
      throw error;
    }
  },

  deleteTenantUser: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.delete(`${TENANT_USERS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting tenant user ${id}:`, error);
      throw error;
    }
  },

  // Group management in tenant context
  getTenantGroups: async (accessToken: string, page?: number) => {
    try {
      let url = TENANT_GROUPS;
      if (page) {
        url = `${url}?page=${page}`;
      }
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching tenant groups:', error);
      throw error;
    }
  },

  getTenantGroup: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.get(`${TENANT_GROUPS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching tenant group ${id}:`, error);
      throw error;
    }
  },

  createTenantGroup: async (accessToken: string, groupData: any) => {
    try {
      return await apiService.post(TENANT_GROUPS, groupData, accessToken);
    } catch (error) {
      console.error('Error creating tenant group:', error);
      throw error;
    }
  },

  updateTenantGroup: async (accessToken: string, id: string | number, groupData: any) => {
    try {
      return await apiService.put(`${TENANT_GROUPS}${id}/`, groupData, accessToken);
    } catch (error) {
      console.error(`Error updating tenant group ${id}:`, error);
      throw error;
    }
  },

  deleteTenantGroup: async (accessToken: string, id: string | number) => {
    try {
      return await apiService.delete(`${TENANT_GROUPS}${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting tenant group ${id}:`, error);
      throw error;
    }
  },

  // Domain validation
  validateDomain: async (accessToken: string) => {
    try {
      return await apiService.get('/tenant/validate-domain/', accessToken);
    } catch (error) {
      console.error('Error validating domain:', error);
      throw error;
    }
  },

  // Authentication
  logout: async (accessToken: string) => {
    try {
      return await apiService.post('/tenant/logout/', {}, accessToken);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  logoutView: async (accessToken: string) => {
    try {
      return await apiService.get('/tenant/logout_view/', accessToken);
    } catch (error) {
      console.error('Error logging out (view):', error);
      throw error;
    }
  }
};
