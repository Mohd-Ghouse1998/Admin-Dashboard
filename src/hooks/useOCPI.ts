
import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ocpiService } from '@/services/ocpiService';
import { useAuth } from '@/hooks/useAuth';

// Generic hook for OCPI entities
export function useOCPI<T>(entityType: string) {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  
  // Helper function to get the correct plural form for the entity type
  const getPlural = (type: string): string => {
    // Handle irregular plurals
    const irregularPlurals: Record<string, string> = {
      'Party': 'Parties'
    };
    
    return irregularPlurals[type] || `${type}s`;
  };
  
  // Get all entities
  const getAll = (): UseQueryResult<T[]> => {
    const queryFn = async () => {
      if (!accessToken) {
        throw new Error("Authentication token is required");
      }
      try {
        // Map entity type to the correct function name using proper pluralization
        const functionName = `get${getPlural(entityType)}`;
        
        // Check if the function exists in ocpiService
        if (typeof ocpiService[functionName as keyof typeof ocpiService] !== 'function') {
          console.error(`Function ${functionName} does not exist in ocpiService`);
          return []; // Return empty array instead of undefined
        }
        
        // Call the function with correct arguments
        // All get functions expect just the accessToken
        const response = await (ocpiService[functionName as keyof typeof ocpiService] as (token: string) => Promise<any>)(accessToken);
        
        // Debug what the API is returning
        console.log(`API Response for ${entityType}:`, response);
        
        // First check for results property (Django REST Framework format)
        // Then check for results nested in data property
        // Then fallback to data property or empty array
        return response?.data?.results || response?.results || response?.data || [];
      } catch (error) {
        console.error(`Error fetching ${entityType}s:`, error);
        return []; // Return empty array instead of undefined
      }
    };
    
    return useQuery({
      queryKey: [`${entityType.toLowerCase()}s`],
      queryFn,
      enabled: !!accessToken,
    });
  };

  // Get single entity by ID
  const getById = (id: number): UseQueryResult<T> => {
    const queryFn = async () => {
      if (!accessToken) {
        throw new Error("Authentication token is required");
      }
      if (!id) {
        throw new Error(`${entityType} ID is required`);
      }
      try {
        // Map entity type to the correct function name
        const functionName = `get${entityType}`;
        
        // Check if the function exists in ocpiService
        if (typeof ocpiService[functionName as keyof typeof ocpiService] !== 'function') {
          console.error(`Function ${functionName} does not exist in ocpiService`);
          return {} as T; // Return empty object instead of undefined
        }
        
        // Call the function with correct arguments
        // All get-by-id functions expect id first, then accessToken
        const response = await (ocpiService[functionName as keyof typeof ocpiService] as (id: number, token: string) => Promise<any>)(id, accessToken);
        return response?.data || {} as T; // Return empty object instead of undefined
      } catch (error) {
        console.error(`Error fetching ${entityType} ${id}:`, error);
        return {} as T; // Return empty object cast as T
      }
    };
    
    return useQuery({
      queryKey: [`${entityType.toLowerCase()}`, id],
      queryFn,
      enabled: !!id && !!accessToken,
    });
  };

  // Create entity
  const create = () => {
    return useMutation({
      mutationFn: async (data: T) => {
        if (!accessToken) {
          throw new Error("Authentication token is required");
        }
        
        // Map entity type to the correct function name
        const functionName = `create${entityType}`;
        
        // Check if the function exists in ocpiService
        if (typeof ocpiService[functionName as keyof typeof ocpiService] !== 'function') {
          throw new Error(`Function ${functionName} does not exist in ocpiService`);
        }
        
        // Call the function with correct arguments
        // All create functions expect data first, then accessToken
        const response = await (ocpiService[functionName as keyof typeof ocpiService] as (data: T, token: string) => Promise<any>)(data, accessToken);
        return response.data;
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: `${entityType} created successfully.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: `Failed to create ${entityType}: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  // Update entity
  const update = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: T }) => {
        if (!accessToken) {
          throw new Error("Authentication token is required");
        }
        if (!id) {
          throw new Error(`${entityType} ID is required`);
        }
        
        // Map entity type to the correct function name
        const functionName = `update${entityType}`;
        
        // Check if the function exists in ocpiService
        if (typeof ocpiService[functionName as keyof typeof ocpiService] !== 'function') {
          throw new Error(`Function ${functionName} does not exist in ocpiService`);
        }
        
        // Call the function with correct arguments
        // All update functions expect id first, then data, then accessToken
        const response = await (ocpiService[functionName as keyof typeof ocpiService] as (id: number, data: T, token: string) => Promise<any>)(id, data, accessToken);
        return response.data;
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: `${entityType} updated successfully.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: `Failed to update ${entityType}: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  // Delete entity
  const remove = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        if (!accessToken) {
          throw new Error("Authentication token is required");
        }
        if (!id) {
          throw new Error(`${entityType} ID is required`);
        }
        
        // Map entity type to the correct function name
        const functionName = `delete${entityType}`;
        
        // Check if the function exists in ocpiService
        if (typeof ocpiService[functionName as keyof typeof ocpiService] !== 'function') {
          throw new Error(`Function ${functionName} does not exist in ocpiService`);
        }
        
        // Call the function with correct arguments
        // All delete functions expect id first, then accessToken
        await (ocpiService[functionName as keyof typeof ocpiService] as (id: number, token: string) => Promise<any>)(id, accessToken);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: `${entityType} deleted successfully.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: `Failed to delete ${entityType}: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}

// Specific hooks for each entity type
export function useParties() {
  return useOCPI<import('@/services/ocpiService').OCPIParty>('Party');
}

export function useEndpoints() {
  return useOCPI<import('@/services/ocpiService').OCPIEndpoint>('Endpoint');
}

export function useCredentials() {
  return useOCPI<import('@/services/ocpiService').OCPICredential>('Credential');
}

export function useVersions() {
  return useOCPI<import('@/services/ocpiService').OCPIVersion>('Version');
}

export function useLocations() {
  return useOCPI<import('@/services/ocpiService').OCPILocation>('Location');
}

export function useEVSEs() {
  return useOCPI<import('@/services/ocpiService').OCPIEVSE>('EVSE');
}

export function useConnectors() {
  return useOCPI<import('@/services/ocpiService').OCPIConnector>('Connector');
}

export function useSessions() {
  return useOCPI<import('@/services/ocpiService').OCPISession>('Session');
}

export function useCDRs() {
  return useOCPI<import('@/services/ocpiService').OCPICDR>('CDR');
}

export function useTokens() {
  return useOCPI<import('@/services/ocpiService').OCPIToken>('Token');
}

export function useCommands() {
  return useOCPI<import('@/services/ocpiService').OCPICommand>('Command');
}

export function useChargingProfiles() {
  return useOCPI<import('@/services/ocpiService').OCPIChargingProfile>('ChargingProfile');
}

export function useTariffs() {
  return useOCPI<import('@/services/ocpiService').OCPITariff>('Tariff');
}
