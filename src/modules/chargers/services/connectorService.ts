
import axiosInstance from '@/api/axios';
import { AxiosError } from 'axios';
import { Connector, ChangeAvailabilityParams } from '@/types/charger';

// Base endpoint for OCPP APIs
const OCPP_BASE = '/api/ocpp';

// Helper function to handle errors consistently
const handleApiError = (error: any, prefix: string) => {
  if (error instanceof AxiosError && error.response) {
    // Extract error message from API response if available
    const apiError = error.response.data?.detail || 
                      error.response.data?.error ||
                      error.response.data?.message ||
                      error.message;
    throw new Error(`${prefix}: ${apiError}`);
  }
  throw new Error(`${prefix}: ${error.message}`);
};

export const connectorApi = {
  // Get all connectors
  getConnectors: async (accessToken: string, params?: any) => {
    try {
      const queryParams: Record<string, any> = {};
      
      if (params) {
        // Handle both charger and charger_id parameters
        if (params.charger_id) queryParams.charger_id = params.charger_id;
        else if (params.charger) queryParams.charger = params.charger;
        
        if (params.status) queryParams.status = params.status;
        if (params.type) queryParams.type = params.type;
        if (params.page) queryParams.page = params.page;
      }
      
      const response = await axiosInstance.get(`${OCPP_BASE}/connectors/`, { params: queryParams });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching connectors");
    }
  },
  
  // Get a specific connector
  getConnector: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/connectors/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching connector");
    }
  },
    
  // Create a new connector
  createConnector: async (accessToken: string, connectorData: Connector) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/connectors/`, connectorData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating connector");
    }
  },
    
  // Update a connector
  updateConnector: async (accessToken: string, id: string, connectorData: Connector) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/connectors/${id}/`, connectorData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating connector");
    }
  },
    
  // Delete a connector
  deleteConnector: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/connectors/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting connector");
    }
  },
  
  // Remote start transaction on a specific connector
  remoteStart: async (accessToken: string, id: string, idTag: string) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/remote_start_transaction/`, { 
        id_tag: idTag,
        connector_id: id
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error starting transaction");
    }
  },
    
  // Remote stop transaction on a specific connector
  remoteStop: async (accessToken: string, id: string, transactionId: number) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/remote_stop_transaction/`, { 
        transaction_id: transactionId 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error stopping transaction");
    }
  },
    
  // Change connector availability
  changeAvailability: async (accessToken: string, id: string, params: ChangeAvailabilityParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/change_availability/`, {
        ...params,
        connector_id: id
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error changing availability");
    }
  },
};
