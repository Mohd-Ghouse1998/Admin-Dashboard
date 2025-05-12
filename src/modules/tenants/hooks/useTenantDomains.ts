
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { tenantApi } from '@/modules/tenants/services/tenantService';

interface TenantDomain {
  id: number | string;
  domain: string;
  client_id: number | string;
  client_name: string;
  is_verified: boolean;
  verification_method: 'dns' | 'file' | 'admin';
  verification_code?: string;
  created_at: string;
  updated_at: string;
}

interface TenantDomainsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantDomain[];
}

export const useTenantDomains = (searchQuery = '') => {
  const { accessToken } = useAuth();
  
  // Fetch tenant domains
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenantDomains', searchQuery],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual API
        // return await tenantApi.getDomains(accessToken, searchQuery);
        
        // For now, return mock data
        return {
          count: 5,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              domain: 'example.com',
              client_id: 1,
              client_name: 'Example Corp',
              is_verified: true,
              verification_method: 'dns',
              created_at: '2023-01-15T10:30:00Z',
              updated_at: '2023-01-15T11:45:00Z'
            },
            {
              id: 2,
              domain: 'acme-charging.net',
              client_id: 2,
              client_name: 'Acme Charging',
              is_verified: true,
              verification_method: 'file',
              created_at: '2023-02-10T08:15:00Z',
              updated_at: '2023-02-10T09:30:00Z'
            },
            {
              id: 3,
              domain: 'charge-eco.org',
              client_id: 3,
              client_name: 'Charge Eco',
              is_verified: false,
              verification_method: 'dns',
              verification_code: 'ev-verify-123456',
              created_at: '2023-03-05T12:45:00Z',
              updated_at: '2023-03-05T12:45:00Z'
            },
            {
              id: 4,
              domain: 'powercharge.io',
              client_id: 4,
              client_name: 'Power Charge',
              is_verified: true,
              verification_method: 'admin',
              created_at: '2023-04-12T09:15:00Z',
              updated_at: '2023-04-12T10:30:00Z'
            },
            {
              id: 5,
              domain: 'evstation.app',
              client_id: 5,
              client_name: 'EV Station',
              is_verified: false,
              verification_method: 'file',
              verification_code: 'ev-verify-654321',
              created_at: '2023-05-08T14:20:00Z',
              updated_at: '2023-05-08T14:20:00Z'
            }
          ]
        } as TenantDomainsResponse;
      } catch (err) {
        console.error('Error fetching tenant domains:', err);
        throw err;
      }
    }
  });

  return {
    domains: data,
    isLoading,
    error,
    refetch
  };
};
