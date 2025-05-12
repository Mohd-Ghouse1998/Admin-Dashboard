
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { chargerApi } from '@/modules/chargers/services/chargerService';

interface ChargerConfig {
  id: number;
  charger: number;
  key: string;
  value: string;
  readonly: boolean;
}

interface ChargerConfigsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChargerConfig[];
}

export const useChargerConfigs = (searchQuery = '', chargerId?: string, key?: string, readonly?: boolean) => {
  const { accessToken } = useAuth();
  
  // Fetch charger configurations
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['chargerConfigs', searchQuery, chargerId, key, readonly],
    queryFn: async () => {
      try {
        // Access token validation complete
        
        // Build filter parameters
        const params: Record<string, any> = {};
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (chargerId) {
          params.charger = chargerId;
        }
        
        if (key) {
          params.key = key;
        }
        
        if (readonly !== undefined) {
          params.readonly = readonly;
        }
        
        // Fetch data from API with configured params
        const result = await chargerApi.getChargerConfigs(accessToken, params);
        
        return result;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!accessToken
  });

  return {
    chargerConfigs: data,
    isLoading,
    error,
    refetch
  };
};
