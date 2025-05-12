
import { apiService } from '@/services/api';

// Updated base endpoint for OCPP APIs
const OCPP_BASE = '/api/ocpp';

export const chargingSessionApi = {
  // Get all charging sessions
  getSessions: (accessToken: string, chargerId?: string) => {
    const url = chargerId ? `${OCPP_BASE}/charging-sessions/?charger_id=${chargerId}` : `${OCPP_BASE}/charging-sessions/`;
    return apiService.get(url, accessToken);
  },
  
  // Get a specific session
  getSession: (accessToken: string, id: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/${id}/`, accessToken),
    
  // Search sessions
  searchSessions: (accessToken: string, query: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/search/?query=${query}`, accessToken),
    
  // Get sessions by status
  getSessionsByStatus: (accessToken: string, status: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/?status=${status}`, accessToken),
    
  // Get sessions by date range
  getSessionsByDateRange: (accessToken: string, startDate: string, endDate: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/?start_date=${startDate}&end_date=${endDate}`, accessToken),
    
  // Filter sessions by active only
  getActiveOnlySessions: (accessToken: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/?active_only=true`, accessToken),
    
  // Filter sessions by id_tag
  getSessionsByIdTag: (accessToken: string, idTag: string) => 
    apiService.get(`${OCPP_BASE}/charging-sessions/?id_tag=${idTag}`, accessToken),
    
  // Create a new session
  createSession: (accessToken: string, sessionData: any) => 
    apiService.post(`${OCPP_BASE}/charging-sessions/`, sessionData, accessToken),
    
  // Update a session
  updateSession: (accessToken: string, id: string, sessionData: any) => 
    apiService.put(`${OCPP_BASE}/charging-sessions/${id}/`, sessionData, accessToken),
    
  // Delete a session
  deleteSession: (accessToken: string, id: string) => 
    apiService.delete(`${OCPP_BASE}/charging-sessions/${id}/`, accessToken),
};
