
import { apiService } from '@/services/api';
import { IdTag } from '@/types/charger';

// Updated base endpoint for OCPP APIs
const OCPP_BASE = '/api/ocpp';

export const idTagApi = {
  // Get all ID tags
  getIdTags: (accessToken: string, filters?: { user?: string, is_blocked?: boolean, is_expired?: boolean }) => {
    let url = `${OCPP_BASE}/id-tags/`;
    const queryParams = [];
    
    if (filters) {
      if (filters.user) queryParams.push(`user=${filters.user}`);
      if (filters.is_blocked !== undefined) queryParams.push(`is_blocked=${filters.is_blocked}`);
      if (filters.is_expired !== undefined) queryParams.push(`is_expired=${filters.is_expired}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return apiService.get(url, accessToken);
  },
    
  // Get a specific ID tag
  getIdTag: (accessToken: string, id: string) => 
    apiService.get(`${OCPP_BASE}/id-tags/${id}/`, accessToken),
    
  // Create a new ID tag
  createIdTag: (accessToken: string, idTagData: IdTag) => 
    apiService.post(`${OCPP_BASE}/id-tags/`, idTagData, accessToken),
    
  // Update an ID tag
  updateIdTag: (accessToken: string, id: string, idTagData: IdTag) => 
    apiService.put(`${OCPP_BASE}/id-tags/${id}/`, idTagData, accessToken),
    
  // Delete an ID tag
  deleteIdTag: (accessToken: string, id: string) => 
    apiService.delete(`${OCPP_BASE}/id-tags/${id}/`, accessToken),
    
  // Search ID tags
  searchIdTags: (accessToken: string, query: string) => 
    apiService.get(`${OCPP_BASE}/id-tags/search/?query=${query}`, accessToken),
};
