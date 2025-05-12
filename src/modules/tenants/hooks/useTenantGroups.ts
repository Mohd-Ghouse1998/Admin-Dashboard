
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { tenantApi } from '@/modules/tenants/services/tenantService';

interface TenantGroup {
  id: number | string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface TenantGroupsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantGroup[];
}

export const useTenantGroups = (searchQuery = '') => {
  const { accessToken } = useAuth();
  
  // Fetch tenant groups
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenantGroups', searchQuery],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual API
        // return await tenantApi.getGroups(accessToken, searchQuery);
        
        // For now, return mock data
        return {
          count: 4,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              name: 'Administrators',
              description: 'Tenant administrators with full access',
              member_count: 3,
              created_at: '2023-01-15T10:30:00Z',
              updated_at: '2023-05-20T14:45:00Z'
            },
            {
              id: 2,
              name: 'Operators',
              description: 'Charger network operators',
              member_count: 8,
              created_at: '2023-01-16T11:20:00Z',
              updated_at: '2023-05-18T09:30:00Z'
            },
            {
              id: 3,
              name: 'Support Staff',
              description: 'Customer support team members',
              member_count: 5,
              created_at: '2023-02-05T14:15:00Z',
              updated_at: '2023-04-12T16:40:00Z'
            },
            {
              id: 4,
              name: 'Finance',
              description: 'Finance and billing department',
              member_count: 2,
              created_at: '2023-03-10T09:45:00Z',
              updated_at: '2023-05-15T11:20:00Z'
            }
          ]
        } as TenantGroupsResponse;
      } catch (err) {
        console.error('Error fetching tenant groups:', err);
        throw err;
      }
    }
  });

  return {
    groups: data,
    isLoading,
    error,
    refetch
  };
};
