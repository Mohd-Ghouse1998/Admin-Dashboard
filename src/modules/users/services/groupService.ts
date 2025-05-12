
import { apiService } from "@/services/api";
import { Group, GroupResponse, GroupCreatePayload, GroupUpdatePayload, GroupUsersUpdatePayload } from "@/types/group";
import { User } from "@/types/user";

export const groupService = {
  // Get all groups with pagination
  getGroups: async (accessToken: string, page?: number): Promise<GroupResponse> => {
    const url = page ? `/api/users/groups/?page=${page}` : '/api/users/groups/';
    return apiService.get(url, accessToken);
  },
  
  // Get a specific group
  getGroup: async (accessToken: string, groupId: number): Promise<Group> => {
    return apiService.get(`/api/users/groups/${groupId}/`, accessToken);
  },
  
  // Create a new group
  createGroup: async (accessToken: string, data: GroupCreatePayload): Promise<Group> => {
    return apiService.post('/api/users/groups/', data, accessToken);
  },
  
  // Update an existing group
  updateGroup: async (accessToken: string, groupId: number, data: GroupUpdatePayload): Promise<Group> => {
    return apiService.put(`/api/users/groups/${groupId}/`, data, accessToken);
  },
  
  // Delete a group
  deleteGroup: async (accessToken: string, groupId: number): Promise<any> => {
    return apiService.delete(`/api/users/groups/${groupId}/`, accessToken);
  },
  
  // Get users in a group
  getGroupUsers: async (accessToken: string, groupId: number): Promise<User[]> => {
    return apiService.get(`/api/users/groups/${groupId}/users`, accessToken);
  },
  
  // Add or remove users from a group
  updateGroupUsers: async (accessToken: string, groupId: number, data: GroupUsersUpdatePayload): Promise<any> => {
    return apiService.post(`/api/users/groups/${groupId}/users/`, data, accessToken);
  }
};
