
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { idTagApi } from '@/services/idTagService';
import { useAuth } from '@/hooks/useAuth';
import { IdTag } from '@/types/charger';

export const useIdTag = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get all ID tags with improved error handling
  const getIdTags = () => {
    return useQuery({
      queryKey: ['idTags'],
      queryFn: async () => {
        try {
          const response = await idTagApi.getIdTags(accessToken);
          console.log("ID tags API response:", response);
          return response;
        } catch (error) {
          console.error("Error fetching ID tags:", error);
          throw error;
        }
      }
    });
  };

  // Get a specific ID tag with improved error handling
  const getIdTag = (id: string) => {
    return useQuery({
      queryKey: ['idTag', id],
      queryFn: async () => {
        try {
          const response = await idTagApi.getIdTag(accessToken, id);
          console.log(`ID tag ${id} API response:`, response);
          return response;
        } catch (error) {
          console.error(`Error fetching ID tag ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id
    });
  };

  // Search ID tags with improved error handling
  const searchIdTags = (query: string) => {
    return useQuery({
      queryKey: ['idTags', 'search', query],
      queryFn: async () => {
        try {
          const response = await idTagApi.searchIdTags(accessToken, query);
          console.log(`Search ID tags (${query}) API response:`, response);
          return response;
        } catch (error) {
          console.error(`Error searching ID tags (${query}):`, error);
          throw error;
        }
      },
      enabled: !!query
    });
  };

  // Create ID tag
  const createIdTagMutation = useMutation({
    mutationFn: async (idTagData: IdTag) => {
      try {
        const response = await idTagApi.createIdTag(accessToken, idTagData);
        console.log("Create ID tag response:", response);
        return response;
      } catch (error) {
        console.error("Error creating ID tag:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idTags'] });
    }
  });

  // Update ID tag
  const updateIdTagMutation = useMutation({
    mutationFn: async ({ id, idTagData }: { id: string, idTagData: IdTag }) => {
      try {
        const response = await idTagApi.updateIdTag(accessToken, id, idTagData);
        console.log(`Update ID tag ${id} response:`, response);
        return response;
      } catch (error) {
        console.error(`Error updating ID tag ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['idTags'] });
      queryClient.invalidateQueries({ queryKey: ['idTag', variables.id] });
    }
  });

  // Delete ID tag
  const deleteIdTagMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await idTagApi.deleteIdTag(accessToken, id);
        console.log(`Delete ID tag ${id} response:`, response);
        return response;
      } catch (error) {
        console.error(`Error deleting ID tag ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idTags'] });
    }
  });

  return {
    // Queries
    getIdTags,
    getIdTag,
    searchIdTags,
    
    // Mutations
    createIdTag: createIdTagMutation.mutateAsync,
    updateIdTag: updateIdTagMutation.mutateAsync,
    deleteIdTag: deleteIdTagMutation.mutateAsync,
    
    // Loading states
    isCreatingIdTag: createIdTagMutation.isPending,
    isUpdatingIdTag: updateIdTagMutation.isPending,
    isDeletingIdTag: deleteIdTagMutation.isPending,
  };
};
