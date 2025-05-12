
import axiosInstance from '@/api/axios';
import { AxiosError } from 'axios';

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

export const meterValueApi = {
  // Get all meter values with flexible filtering
  getMeterValues: async (accessToken: string, filters?: any) => {
    try {
      // Build query parameters based on the API documentation
      const params: Record<string, any> = {};
      
      if (filters) {
        if (filters.charger) params.charger = filters.charger;
        if (filters.connector) params.connector = filters.connector;
        if (filters.chargingSession) params.charging_session = filters.chargingSession;
        if (filters.timestampAfter) params.timestamp_after = filters.timestampAfter;
        if (filters.timestampBefore) params.timestamp_before = filters.timestampBefore;
        if (filters.page) params.page = filters.page;
      }
      
      const response = await axiosInstance.get(`${OCPP_BASE}/meter-values/`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching meter values");
    }
  },
  
  // Get a specific meter value
  getMeterValue: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/meter-values/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching meter value");
    }
  },
    
  // Create a meter value
  createMeterValue: async (accessToken: string, meterValueData: any) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/meter-values/`, meterValueData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating meter value");
    }
  },
    
  // Update a meter value
  updateMeterValue: async (accessToken: string, id: string, meterValueData: any) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/meter-values/${id}/`, meterValueData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating meter value");
    }
  },
    
  // Delete a meter value
  deleteMeterValue: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/meter-values/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting meter value");
    }
  },
};
