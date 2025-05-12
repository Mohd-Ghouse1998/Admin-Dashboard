
import { useQuery } from '@tanstack/react-query';
import { chargingSessionApi } from '@/services/chargingSessionService';
import { useAuth } from '@/hooks/useAuth';

export const useChargingSession = () => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get all sessions
  const getSessions = (chargerId?: string) => {
    return useQuery({
      queryKey: ['chargingSessions', chargerId],
      queryFn: async () => {
        return await chargingSessionApi.getSessions(accessToken, chargerId);
      }
    });
  };

  // Get a specific session
  const getSession = (id: string) => {
    return useQuery({
      queryKey: ['chargingSession', id],
      queryFn: async () => {
        return await chargingSessionApi.getSession(accessToken, id);
      },
      enabled: !!id && id !== 'all'
    });
  };

  // Search sessions
  const searchSessions = (query: string) => {
    return useQuery({
      queryKey: ['chargingSessions', 'search', query],
      queryFn: async () => {
        return await chargingSessionApi.searchSessions(accessToken, query);
      },
      enabled: !!query && query !== 'all'
    });
  };

  // Get sessions by status
  const getSessionsByStatus = (status: string) => {
    return useQuery({
      queryKey: ['chargingSessions', 'status', status],
      queryFn: async () => {
        return await chargingSessionApi.getSessionsByStatus(accessToken, status);
      },
      enabled: !!status && status !== 'all'
    });
  };

  // Get sessions by date range
  const getSessionsByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['chargingSessions', 'dateRange', startDate, endDate],
      queryFn: async () => {
        return await chargingSessionApi.getSessionsByDateRange(accessToken, startDate, endDate);
      },
      enabled: !!(startDate && endDate)
    });
  };

  return {
    getSessions,
    getSession,
    searchSessions,
    getSessionsByStatus,
    getSessionsByDateRange,
  };
};
