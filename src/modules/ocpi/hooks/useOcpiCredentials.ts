
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { ocpiApi } from '@/api/services/ocpiService';

interface OcpiCredential {
  id: number | string;
  party_id: string;
  country_code: string;
  role: 'CPO' | 'EMSP' | 'HUB' | 'NSP' | 'OTHER';
  token: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface OcpiCredentialsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OcpiCredential[];
}

export const useOcpiCredentials = (searchQuery = '') => {
  const { accessToken } = useAuth();
  
  // Fetch OCPI credentials
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ocpiCredentials', searchQuery],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual API
        // return await ocpiApi.getCredentials(accessToken, searchQuery);
        
        // For now, return mock data
        return {
          count: 3,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              party_id: 'EVP',
              country_code: 'US',
              role: 'CPO',
              token: 'a1b2c3d4e5f6g7h8i9j0',
              status: 'active',
              created_at: '2023-01-15T10:30:00Z',
              updated_at: '2023-05-20T14:45:00Z'
            },
            {
              id: 2,
              party_id: 'MSP',
              country_code: 'DE',
              role: 'EMSP',
              token: 'z9y8x7w6v5u4t3s2r1q0',
              status: 'active',
              created_at: '2023-02-10T08:15:00Z',
              updated_at: '2023-04-18T16:20:00Z'
            },
            {
              id: 3,
              party_id: 'HUB',
              country_code: 'NL',
              role: 'HUB',
              token: 'm1n2o3p4q5r6s7t8u9v0',
              status: 'inactive',
              created_at: '2023-03-05T12:45:00Z',
              updated_at: '2023-03-05T12:45:00Z'
            }
          ]
        } as OcpiCredentialsResponse;
      } catch (err) {
        console.error('Error fetching OCPI credentials:', err);
        throw err;
      }
    }
  });

  return {
    credentials: data,
    isLoading,
    error,
    refetch
  };
};
