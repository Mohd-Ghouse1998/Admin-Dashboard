
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectorApi } from '@/services/connectorService';
import { useAuth } from '@/hooks/useAuth';
import { Connector, ChangeAvailabilityParams } from '@/types/charger';

export const useConnector = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  // Get all connectors
  const getConnectors = (chargerId?: string) => {
    return useQuery({
      queryKey: ['connectors', chargerId],
      queryFn: async () => {
        return await connectorApi.getConnectors(accessToken, chargerId);
      }
    });
  };

  // Get a specific connector
  const getConnector = (id: string) => {
    return useQuery({
      queryKey: ['connector', id],
      queryFn: async () => {
        return await connectorApi.getConnector(accessToken, id);
      },
      enabled: !!id
    });
  };

  // Update a connector
  const updateConnectorMutation = useMutation({
    mutationFn: async ({ id, connectorData }: { id: string, connectorData: Connector }) => {
      return await connectorApi.updateConnector(accessToken, id, connectorData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector', variables.id] });
    }
  });

  // Remote start transaction on a connector
  const remoteStartMutation = useMutation({
    mutationFn: async ({ id, idTag }: { id: string, idTag: string }) => {
      return await connectorApi.remoteStart(accessToken, id, idTag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    }
  });

  // Remote stop transaction on a connector
  const remoteStopMutation = useMutation({
    mutationFn: async ({ id, transactionId }: { id: string, transactionId: number }) => {
      return await connectorApi.remoteStop(accessToken, id, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['chargingSessions'] });
    }
  });

  // Change connector availability
  const changeAvailabilityMutation = useMutation({
    mutationFn: async ({ id, params }: { id: string, params: ChangeAvailabilityParams }) => {
      return await connectorApi.changeAvailability(accessToken, id, params);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector', variables.id] });
    }
  });

  return {
    // Queries
    getConnectors,
    getConnector,
    
    // Mutations
    updateConnector: updateConnectorMutation.mutateAsync,
    remoteStart: remoteStartMutation.mutateAsync,
    remoteStop: remoteStopMutation.mutateAsync,
    changeAvailability: changeAvailabilityMutation.mutateAsync,
    
    // Loading states
    isUpdatingConnector: updateConnectorMutation.isPending,
    isRemoteStarting: remoteStartMutation.isPending,
    isRemoteStopping: remoteStopMutation.isPending,
    isChangingAvailability: changeAvailabilityMutation.isPending,
  };
};
