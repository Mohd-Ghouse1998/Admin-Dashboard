
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ChargingSession {
  id: number;
  connector: number;
  transaction_id: number;
  formatted_transaction_id: string;
  start_time: string;
  end_time?: string;
  meter_start: number;
  meter_stop?: number;
  reservation_id?: number | null;
  limit?: number;
  reason?: string;
  limit_type?: 'KWH' | 'AMOUNT';
  id_tag: number;
  stop_id_tag?: number;
  auth_method: string;
  ocpi_session_id?: string;
  ocpi_emsp_id?: string;
  cost?: number;
  charger?: string; // Added for when charger ID is needed for remote operations
}

export const useChargingSession = () => {
  const queryClient = useQueryClient();
  
  // Get all charging sessions with pagination support
  const getChargingSessions = (page = 1, filters = {}) => {
    return useQuery<PaginatedResponse<ChargingSession>>({ 
      queryKey: ['charging-sessions', page, filters],
      queryFn: async () => {
        // Build query params for pagination and filters
        const params = new URLSearchParams({ page: page.toString() });
        
        // Add any additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
        
        const queryString = params.toString();
        const url = `/api/ocpp/charging-sessions/${queryString ? `?${queryString}` : ''}`;
        
        console.log('Fetching charging sessions with URL:', url);
        const response = await axios.get(url);
        return response.data;
      },
      placeholderData: keepPreviousData,
    });
  };
  
  // Get a single charging session by ID
  const getChargingSessionById = (id: string | number) => {
    return useQuery<ChargingSession>({
      queryKey: ['charging-sessions', id],
      queryFn: async () => {
        console.log(`Fetching charging session with ID: ${id}`);
        try {
          const response = await axios.get(`/api/ocpp/charging-sessions/${id}/`);
          console.log('API response for charging session:', response.data);
          return response.data;
        } catch (error) {
          console.error(`Error fetching charging session with ID ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id && id !== '',
      retry: 1,
    });
  };
  
  // Create a new charging session
  const createChargingSession = useMutation({
    mutationFn: async (session: Partial<ChargingSession>) => {
      const response = await axios.post('/api/ocpp/charging-sessions/', session);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
    },
  });
  
  // Update a charging session
  const updateChargingSession = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ChargingSession> & { id: string | number }) => {
      const response = await axios.put(`/api/ocpp/charging-sessions/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
    },
  });
  
  // Delete a charging session
  const deleteChargingSession = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await axios.delete(`/api/ocpp/charging-sessions/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
    },
  });
  
  // Remote start transaction
  const remoteStartTransaction = useMutation({
    mutationFn: async (params: {
      chargerId: string;
      connectorId: number;
      idTag: string;
      userLimit?: string;
      limitType?: 'KWH' | 'AMOUNT';
    }) => {
      const response = await axios.post('/api/ocpp/remote_start_transaction/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  // Remote stop transaction
  const remoteStopTransaction = useMutation({
    mutationFn: async (params: { chargerId: string; transactionId: number }) => {
      const response = await axios.post('/api/ocpp/remote_stop_transaction/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  return {
    getChargingSessions,
    getChargingSessionById,
    createChargingSession,
    updateChargingSession,
    deleteChargingSession,
    remoteStartTransaction,
    remoteStopTransaction,
    isRemoteStarting: remoteStartTransaction.isPending,
    isRemoteStopping: remoteStopTransaction.isPending
  };
};
