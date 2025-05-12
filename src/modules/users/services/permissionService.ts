
import { apiService } from "@/services/api";
import { Permission, PermissionResponse, PermissionFilters, UserPermissionResponse, PermissionUpdatePayload } from "@/types/permission";

export const permissionService = {
  // Get all permissions with optional filters
  getPermissions: async (accessToken: string, filters?: PermissionFilters): Promise<PermissionResponse> => {
    let endpoint = '/api/users/permissions/';
    
    // Add query parameters if filters are provided
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.app_label) params.append('app_label', filters.app_label);
      if (filters.model) params.append('model', filters.model);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('page_size', filters.pageSize.toString());
      
      endpoint += `?${params.toString()}`;
    }
    
    return apiService.get(endpoint, accessToken);
  },

  // Get a specific permission by ID
  getPermissionById: async (accessToken: string, id: string): Promise<Permission> => {
    return apiService.get(`/api/users/permissions/${id}/`, accessToken);
  },

  // Get permissions for a specific user
  getUserPermissions: async (accessToken: string, userId: string | number): Promise<Permission[]> => {
    return apiService.get(`/api/users/users/${userId}/permissions/`, accessToken);
  },

  // Update permissions for a specific user
  updateUserPermissions: async (
    accessToken: string, 
    userId: string | number, 
    data: PermissionUpdatePayload
  ): Promise<any> => {
    return apiService.post(`/api/users/users/${userId}/permissions/`, data, accessToken);
  },

  // Get permissions for a specific group
  getGroupPermissions: async (accessToken: string, groupId: number): Promise<Permission[]> => {
    return apiService.get(`/api/users/groups/${groupId}/permissions/`, accessToken);
  },

  // Update permissions for a specific group
  updateGroupPermissions: async (
    accessToken: string, 
    groupId: number, 
    data: PermissionUpdatePayload
  ): Promise<any> => {
    return apiService.post(`/api/users/groups/${groupId}/permissions/`, data, accessToken);
  },

  // Get current user's permissions
  getMyPermissions: async (accessToken: string): Promise<UserPermissionResponse> => {
    return apiService.get('/api/users/my-permissions/', accessToken);
  },

  // Check if user has specific permission
  hasPermission: async (accessToken: string, codename: string): Promise<any> => {
    return apiService.get(`/api/users/has-permission/${codename}/`, accessToken);
  }
};
