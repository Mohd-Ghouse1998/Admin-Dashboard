
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useToast } from '@/hooks/use-toast';
import { Charger } from '@/types/charger';
import { useCallback } from 'react';

// We're now using the Charger interface imported from '@/types/charger'
// This is just a local interface for response typing
export interface ChargerResponse extends Charger {
  // Any additional properties can be defined here if needed
}

export interface ChargersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    type: 'FeatureCollection';
    features: Array<{
      id: number;
      type: 'Feature';
      geometry: any | null;
      properties: {
        charger_id: string;
        vendor: string | null;
        model: string | null;
        enabled: boolean;
        price_per_kwh: number;
        type: 'AC' | 'DC' | 'BOTH';
        connectors: Array<{
          id: number;
          connector_id: number;
          status: string;
          type: string;
        }>;
        online: boolean;
        name: string;
        address: string;
        last_heartbeat?: string;
        verified?: boolean;
        ocpi_id?: string;
        publish_to_ocpi?: boolean;
      };
    }>;
  };
}

export const useChargers = (searchQuery = '') => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch chargers
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['chargers', searchQuery],
    queryFn: async () => {
      try {
        // If we have a search query, use the searchChargers method instead
        let response;
        if (searchQuery && searchQuery.trim() !== '') {
          console.log('Executing search with query:', searchQuery);
          response = await chargerApi.searchChargers(accessToken, searchQuery);
        } else {
          console.log('Fetching all chargers (no search query)');
          response = await chargerApi.getChargers(accessToken);
        }
        
        console.log('API response in useChargers:', response);
        return response;
      } catch (err) {
        console.error('Error fetching chargers:', err);
        throw err;
      }
    },
    // These options are important for proper data handling
    refetchOnWindowFocus: false,
    staleTime: 30000  // 30 seconds
  });

  // Get a single charger - memoized to prevent infinite re-renders
  const getCharger = useCallback(async (id: string | number) => {
    try {
      // Convert id to string if it's a number
      const stringId = id.toString();
      return await chargerApi.getCharger(accessToken, stringId);
    } catch (err) {
      console.error(`Error fetching charger ${id}:`, err);
      throw err;
    }
  }, [accessToken]); // Only recreate if accessToken changes

  // Create a new charger
  const createChargerMutation = useMutation({
    mutationFn: (chargerData: Partial<Charger>) => {
      // Cast to Charger as the API requires the full type
      return chargerApi.createCharger(accessToken, chargerData as Charger);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      toast({
        title: 'Success',
        description: 'Charger created successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create charger: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update a charger
  const updateChargerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Charger> }) => {
      // Convert id to string and cast data to Charger
      return chargerApi.updateCharger(accessToken, id.toString(), data as Charger);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      queryClient.invalidateQueries({ queryKey: ['charger', variables.id] });
      toast({
        title: 'Success',
        description: 'Charger updated successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update charger: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete a charger
  const deleteChargerMutation = useMutation({
    mutationFn: (id: string | number) => {
      // Convert id to string
      return chargerApi.deleteCharger(accessToken, id.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      toast({
        title: 'Success',
        description: 'Charger deleted successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete charger: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Transform GeoJSON FeatureCollection to charger array
  const transformChargers = (data: any) => {
    // Check if we have a valid GeoJSON response
    if (!data?.results?.features) {
      // Try to handle both old and new API formats
      return data?.results || [];
    }
    
    // Process GeoJSON features
    return data.results.features.map((feature: any) => ({
      ...feature.properties,
      id: feature.id,
      geometry: feature.geometry,
      // Map connector status to a UI-friendly status
      status: feature.properties.online ? 
        (feature.properties.connectors.length > 0 ? 
          feature.properties.connectors[0].status : 'Available') 
        : 'Offline',
      // Add location from address for compatibility with existing UI
      location: feature.properties.address
    }));
  };

  return {
    data: transformChargers(data),
    count: data?.count || 0,
    isLoading,
    error,
    refetch,
    // Expose the raw functions
    getCharger,
    createCharger: createChargerMutation.mutate,
    updateCharger: updateChargerMutation.mutate,
    deleteCharger: deleteChargerMutation.mutate,
    // Expose the mutation objects for more control
    createChargerMutation,
    updateChargerMutation,
    deleteChargerMutation,
    // Status flags
    isCreating: createChargerMutation.isPending,
    isUpdating: updateChargerMutation.isPending,
    isDeleting: deleteChargerMutation.isPending
  };
};
