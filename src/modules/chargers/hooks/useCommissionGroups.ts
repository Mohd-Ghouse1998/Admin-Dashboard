
import { useQuery } from '@tanstack/react-query';
import { chargerApi } from '@/api/services/chargerService';
import { useAuth } from '@/hooks/useAuth';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['commissionGroups'],
    queryFn: async () => {
      const response = await chargerApi.getCommissionGroups(accessToken);
      return response as CommissionGroupsResponse;
    },
  });

  return { 
    commissionGroups: data?.results || [], 
    isLoading, 
    error 
  };
};
