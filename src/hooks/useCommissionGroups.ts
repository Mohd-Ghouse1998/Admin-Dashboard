
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { chargerApi } from '@/services/chargerService';

export interface CommissionGroup {
  id: string | number;
  name: string;
  rate?: number;
  description?: string;
}

export interface CommissionGroupsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommissionGroup[];
}

export const useCommissionGroups = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['commissionGroups'],
    queryFn: async () => {
      try {
        const response = await chargerApi.getCommissionGroups(accessToken);
        return response as CommissionGroupsResponse;
      } catch (error) {
        console.error('Error fetching commission groups:', error);
        // Return empty results instead of throwing error to prevent form breakage
        return { count: 0, next: null, previous: null, results: [] };
      }
    },
  });

  return {
    commissionGroups: data?.results || [],
    isLoading,
    error,
  };
};
