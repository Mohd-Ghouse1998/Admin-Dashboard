
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Connector {
  id: number;
  connector_id: number;
  status: string;
  type: string;
  charger?: number;
  errorCode?: string;
  info?: string;
}

export const useConnector = () => {
  const queryClient = useQueryClient();
  
  // Get all connectors
  const getConnectors = () => {
    return useQuery<Connector[]>({
      queryKey: ['connectors'],
      queryFn: async () => {
        const response = await axios.get('/api/ocpp/connectors/');
        return response.data;
      },
    });
  };
  
  // Get a single connector by ID
  const getConnectorById = (id: string | number) => {
    return useQuery<Connector>({
      queryKey: ['connectors', id],
      queryFn: async () => {
        const response = await axios.get(`/api/ocpp/connectors/${id}/`);
        return response.data;
      },
      enabled: !!id,
    });
  };
  
  // Create a new connector
  const createConnector = useMutation({
    mutationFn: async (connector: Partial<Connector>) => {
      const response = await axios.post('/api/ocpp/connectors/', connector);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  // Update a connector
  const updateConnector = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Connector> & { id: string | number }) => {
      const response = await axios.put(`/api/ocpp/connectors/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  // Delete a connector
  const deleteConnector = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await axios.delete(`/api/ocpp/connectors/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  // Remote start transaction
  const remoteStartTransaction = useMutation({
    mutationFn: async (params: {
      chargerId: string;
      connectorId: number;
      idTag: string;
      userLimit?: string;
      limitType?: 'KWH' | 'AMOUNT';
    }) => {
      const response = await axios.post('/api/ocpp/remote_start_transaction/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
    },
  });
  
  // Remote stop transaction
  const remoteStopTransaction = useMutation({
    mutationFn: async (params: { chargerId: string; transactionId: number }) => {
      const response = await axios.post('/api/ocpp/remote_stop_transaction/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['charging-sessions'] });
    },
  });
  
  // Change availability
  const changeAvailability = useMutation({
    mutationFn: async (params: { 
      chargerId: string; 
      connectorId: number; 
      type: 'Inoperative' | 'Operative' 
    }) => {
      const response = await axios.post('/api/ocpp/change-availability/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
  
  return {
    getConnectors,
    getConnectorById,
    createConnector,
    updateConnector,
    deleteConnector,
    remoteStartTransaction,
    remoteStopTransaction,
    changeAvailability,
    isRemoteStarting: remoteStartTransaction.isPending,
    isRemoteStopping: remoteStopTransaction.isPending,
    isChangingAvailability: changeAvailability.isPending
  };
};
