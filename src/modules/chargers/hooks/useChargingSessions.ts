
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { chargerApi } from '@/api/services/chargerService';

interface ChargingSession {
  id: string;
  charger_id: string;
  connector_id: number;
  transaction_id: number;
  user_id?: string;
  id_tag: string;
  start_time: string;
  end_time?: string;
  energy_wh: number;
  status: 'In Progress' | 'Completed' | 'Error';
  meter_start: number;
  meter_end?: number;
  cost?: number;
  currency?: string;
}

interface ChargingSessionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChargingSession[];
}

export const useChargingSessions = (searchQuery = '') => {
  const { accessToken } = useAuth();
  
  // Fetch charging sessions
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['chargingSessions', searchQuery],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual API
        // return await chargerApi.getSessions(accessToken, searchQuery);
        
        const now = new Date();
        
        // For now, return mock data
        return {
          count: 5,
          next: null,
          previous: null,
          results: [
            {
              id: 'CS001',
              charger_id: 'EVSE001',
              connector_id: 1,
              transaction_id: 5001,
              user_id: 'user123',
              id_tag: 'RFID123456',
              start_time: new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString(),
              end_time: new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString(),
              energy_wh: 12500,
              status: 'Completed',
              meter_start: 100050,
              meter_end: 100075,
              cost: 15.25,
              currency: 'USD'
            },
            {
              id: 'CS002',
              charger_id: 'EVSE002',
              connector_id: 2,
              transaction_id: 5002,
              user_id: 'user456',
              id_tag: 'RFID654321',
              start_time: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString(),
              energy_wh: 5000,
              status: 'In Progress',
              meter_start: 85000
            },
            {
              id: 'CS003',
              charger_id: 'EVSE003',
              connector_id: 1,
              transaction_id: 5003,
              id_tag: 'RFID789012',
              start_time: new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString(),
              end_time: new Date(now.getTime() - (23 * 60 * 60 * 1000)).toISOString(),
              energy_wh: 18000,
              status: 'Completed',
              meter_start: 200100,
              meter_end: 200160,
              cost: 21.60,
              currency: 'USD'
            },
            {
              id: 'CS004',
              charger_id: 'EVSE001',
              connector_id: 2,
              transaction_id: 5004,
              user_id: 'user789',
              id_tag: 'RFID345678',
              start_time: new Date(now.getTime() - (12 * 60 * 60 * 1000)).toISOString(),
              end_time: new Date(now.getTime() - (11 * 60 * 60 * 1000)).toISOString(),
              energy_wh: 9000,
              status: 'Error',
              meter_start: 150200,
              meter_end: 150230
            },
            {
              id: 'CS005',
              charger_id: 'EVSE004',
              connector_id: 1,
              transaction_id: 5005,
              user_id: 'user123',
              id_tag: 'RFID123456',
              start_time: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
              end_time: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000) + (45 * 60 * 1000)).toISOString(),
              energy_wh: 7500,
              status: 'Completed',
              meter_start: 75000,
              meter_end: 75030,
              cost: 9.00,
              currency: 'USD'
            }
          ]
        } as ChargingSessionsResponse;
      } catch (err) {
        console.error('Error fetching charging sessions:', err);
        throw err;
      }
    }
  });

  return {
    sessions: data,
    isLoading,
    error,
    refetch
  };
};
