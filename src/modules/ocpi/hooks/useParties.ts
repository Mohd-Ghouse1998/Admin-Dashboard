
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ocpiApi } from '@/api/ocpi.api';
import { OCPIParty } from '@/types/ocpi.types';
import { PaginatedResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useParties = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all parties with pagination
  const getAll = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['ocpi', 'parties', page, limit],
      queryFn: async () => {
        const response = await ocpiApi.parties.getAll(page, limit);
        return response.data as PaginatedResponse<OCPIParty>;
      }
    });
  };

  // Fetch a party by ID
  const getById = (id: string | number) => {
    return useQuery({
      queryKey: ['ocpi', 'party', id],
      queryFn: async () => {
        const response = await ocpiApi.parties.getById(id);
        return response.data as OCPIParty;
      },
      enabled: !!id // Only run if ID is provided
    });
  };

  // Create a new party
  const create = () => {
    return useMutation({
      mutationFn: async (data: OCPIParty) => {
        const response = await ocpiApi.parties.create(data);
        return response.data;
      },
      onSuccess: () => {
        // Invalidate parties query to refetch the list
        queryClient.invalidateQueries({
          queryKey: ['ocpi', 'parties']
        });
        
        toast({
          title: 'Success',
          description: 'Party created successfully.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create party.',
          variant: 'destructive'
        });
      }
    });
  };

  // Update an existing party
  const update = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string | number; data: OCPIParty }) => {
        const response = await ocpiApi.parties.update(id, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        // Invalidate specific party query and parties list
        queryClient.invalidateQueries({
          queryKey: ['ocpi', 'party', variables.id]
        });
        
        queryClient.invalidateQueries({
          queryKey: ['ocpi', 'parties']
        });
        
        toast({
          title: 'Success',
          description: 'Party updated successfully.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update party.',
          variant: 'destructive'
        });
      }
    });
  };

  // Delete a party
  const remove = () => {
    return useMutation({
      mutationFn: async (id: string | number) => {
        await ocpiApi.parties.delete(id);
        return id;
      },
      onSuccess: (id) => {
        // Remove party from cache and invalidate parties list
        queryClient.removeQueries({
          queryKey: ['ocpi', 'party', id]
        });
        
        queryClient.invalidateQueries({
          queryKey: ['ocpi', 'parties']
        });
        
        toast({
          title: 'Success',
          description: 'Party deleted successfully.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete party.',
          variant: 'destructive'
        });
      }
    });
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove
  };
};

export default useParties;
