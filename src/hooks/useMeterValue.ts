
import { useQuery } from '@tanstack/react-query';
import { meterValueApi } from '@/services/meterValueService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useMeterValue = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get all meter values
  const getMeterValues = (filters?: { chargerId?: string; connectorId?: number; sessionId?: number; startDate?: string; endDate?: string }) => {
    return useQuery({
      queryKey: ['meterValues', filters],
      queryFn: async () => {
        try {
          const response = await meterValueApi.getMeterValues(accessToken, filters);
          console.log("Meter values API response:", response);
          return response;
        } catch (error) {
          console.error("Error fetching meter values:", error);
          toast({
            title: "Error",
            description: "Failed to fetch meter values. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      }
    });
  };

  // Get a specific meter value
  const getMeterValue = (id: string) => {
    return useQuery({
      queryKey: ['meterValue', id],
      queryFn: async () => {
        try {
          const response = await meterValueApi.getMeterValue(accessToken, id);
          console.log(`Meter value ${id} API response:`, response);
          return response;
        } catch (error) {
          console.error(`Error fetching meter value ${id}:`, error);
          toast({
            title: "Error",
            description: `Failed to fetch meter value ${id}. Please try again.`,
            variant: "destructive",
          });
          throw error;
        }
      },
      enabled: !!id && id !== 'all'
    });
  };

  // Get meter values by date range
  const getMeterValuesByDateRange = (startDate: string, endDate: string) => {
    const filters = { startDate, endDate };
    return getMeterValues(filters);
  };

  return {
    getMeterValues,
    getMeterValue,
    getMeterValuesByDateRange,
  };
};
