
import { useState } from 'react';
import { ocpiApi } from '@/api/ocpi.api';
import { OCPIParty } from '@/types/ocpi.types';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useOcpi = () => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch parties
  const fetchParties = async () => {
    setIsLoading(true);
    try {
      const response = await ocpiApi.parties.getAll();
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch parties');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Use react-query to manage parties data
  const useParties = () => {
    return useQuery({
      queryKey: ['ocpi', 'parties'],
      queryFn: fetchParties
    });
  };

  // Create party mutation
  const createParty = useMutation({
    mutationFn: async (party: OCPIParty) => {
      const response = await ocpiApi.parties.create(party);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'parties'] });
      toast({
        title: "Success",
        description: "Party was created successfully",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to create party');
    }
  });

  // Update party mutation
  const updateParty = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: OCPIParty }) => {
      const response = await ocpiApi.parties.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'parties'] });
      toast({
        title: "Success",
        description: "Party was updated successfully",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to update party');
    }
  });

  // Delete party mutation
  const deleteParty = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await ocpiApi.parties.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'parties'] });
      toast({
        title: "Success",
        description: "Party was deleted successfully",
      });
    },
    onError: (error) => {
      handleError(error, 'Failed to delete party');
    }
  });

  return {
    isLoading,
    useParties,
    createParty,
    updateParty,
    deleteParty
  };
};
