
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Client, ClientResponse, CreateClientData } from '@/types/tenant';

interface UseClientOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useTenantClients(searchQuery: string = '') {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get all clients
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['clients', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await apiClient.get(`/api/tenant/clients/?${params.toString()}`);
      return response.data;
    },
    refetchOnWindowFocus: false
  });

  // Get a single client
  const getClient = useCallback((id: number) => {
    return useQuery({
      queryKey: ['client', id],
      queryFn: async () => {
        const response = await apiClient.get(`/api/tenant/clients/${id}/`);
        return response.data;
      },
      refetchOnWindowFocus: false,
      enabled: !!id
    });
  }, []);

  // Create a new client
  const {
    mutateAsync: createClientAsync,
    isPending: isLoadingCreate
  } = useMutation({
    mutationFn: async (data: CreateClientData) => {
      const formData = new FormData();
      
      // Handle file upload separately
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      
      // Append basic text fields
      Object.entries(data).forEach(([key, value]) => {
        // Skip the logo field as we handled it separately
        if (key === 'logo') return;
        
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays (like apps_access)
            value.forEach(item => {
              formData.append(`${key}`, item.toString());
            });
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            formData.append(key, value ? 'true' : 'false');
          } else {
            // Handle strings and numbers
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await apiClient.post('/api/tenant/clients/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const createClient = async (data: CreateClientData, options?: UseClientOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createClientAsync(data);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing client
  const {
    mutateAsync: updateClientAsync,
    isPending: isLoadingUpdate
  } = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CreateClientData> }) => {
      const formData = new FormData();
      
      // Handle file upload
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      
      // Append other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'logo' && value instanceof File) return; // Skip as we handled it
        
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays (like apps_access)
            value.forEach(item => {
              formData.append(`${key}`, item.toString());
            });
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            formData.append(key, value ? 'true' : 'false');
          } else {
            // Handle strings and numbers
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await apiClient.put(`/api/tenant/clients/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    }
  });

  const updateClient = async (id: number, data: Partial<CreateClientData>, options?: UseClientOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await updateClientAsync({ id, data });
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a client
  const {
    mutateAsync: deleteClientAsync,
    isPending: isLoadingDelete
  } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/tenant/clients/${id}/`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', deletedId] });
    }
  });

  const deleteClient = async (id: number, options?: UseClientOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await deleteClientAsync(id);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    isLoading: isLoading || isLoadingClients,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    error: error || clientsError,
    refetchClients
  };
}
