import axiosInstance from '@/api/axios';
import { AxiosError } from 'axios';
import { 
  Charger, 
  ChargerConfig, 
  Connector, 
  RemoteStartParams,
  RemoteStopParams,
  ResetParams,
  ChangeAvailabilityParams,
  SetConfigParams,
  TriggerMessageParams,
  UpdateFirmwareParams
} from '@/types/charger';

// Base endpoint for OCPP APIs
const OCPP_BASE = '/api/ocpp';

// Helper function to handle errors consistently
const handleApiError = (error: any, prefix: string) => {
  console.error(`${prefix}:`, error);
  throw error;
};

// ID Tag Service Functions
const getIdTags = async (params?: Record<string, any>) => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `${OCPP_BASE}/id-tags/?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching ID tags");
  }
};

const getIdTag = async (id: string | number) => {
  try {
    if (!id) {
      throw new Error("ID Tag ID is required");
    }
    
    const response = await axiosInstance.get(`${OCPP_BASE}/id-tags/${id}/`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching ID tag details");
  }
};

const createIdTag = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${OCPP_BASE}/id-tags/`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error creating ID tag");
  }
};

const updateIdTag = async (id: string | number, data: any) => {
  try {
    if (!id) {
      throw new Error("ID Tag ID is required");
    }
    
    const response = await axiosInstance.put(`${OCPP_BASE}/id-tags/${id}/`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error updating ID tag");
  }
};

const deleteIdTag = async (id: string | number) => {
  try {
    if (!id) {
      throw new Error("ID Tag ID is required");
    }
    
    const response = await axiosInstance.delete(`${OCPP_BASE}/id-tags/${id}/`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error deleting ID tag");
  }
};

const getLocalListVersion = async (chargerId: string) => {
  try {
    if (!chargerId) {
      throw new Error("Charger ID is required");
    }
    
    const response = await axiosInstance.post(`${OCPP_BASE}/get-local-list-version/`, {
      chargerId
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error getting local list version");
  }
};

const sendLocalList = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${OCPP_BASE}/send-local-list/`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error sending local list");
  }
};

export const chargerApi = {
  // Charger management with better error handling
  getChargers: async (accessToken: string) => {
    try {
      // Note: axiosInstance automatically adds /api prefix and auth headers
      const response = await axiosInstance.get(`${OCPP_BASE}/chargers/`);
      console.log("Raw chargers API response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error in chargerApi.getChargers");
    }
  },
  
  getCharger: async (accessToken: string, id: string | number) => {
    // Ensure id is not undefined before making the API call
    if (!id) {
      console.error("Charger ID is undefined or null");
      throw new Error("Charger ID is required");
    }
    
    console.log(`Fetching charger with ID: ${id}`);
    
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/chargers/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching charger details");
    }
  },
  
  searchChargers: async (accessToken: string, query: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/chargers/search/?query=${query}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error searching chargers");
    }
  },
  
  getFavoriteChargers: async (accessToken: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/favorite_chargers/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching favorite chargers");
    }
  },
  
  addFavoriteCharger: async (accessToken: string, chargerId: string) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/favorite_chargers/`, { charger_id: chargerId });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error adding favorite charger");
    }
  },
  
  removeFavoriteCharger: async (accessToken: string, favoriteId: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/favorite_chargers/${favoriteId}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error removing favorite charger");
    }
  },
  
  createCharger: async (accessToken: string, chargerData: Charger) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/chargers/`, chargerData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating charger");
    }
  },
  
  updateCharger: async (accessToken: string, id: string, chargerData: Charger) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/chargers/${id}/`, chargerData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating charger");
    }
  },
  
  deleteCharger: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/chargers/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting charger");
    }
  },
  
  // Get commission groups
  getCommissionGroups: async (accessToken: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/commission-groups/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching commission groups");
    }
  },
  
  // Configurations
  getChargerConfigs: async (accessToken: string, params?: Record<string, any>) => {
    try {
      let url = `${OCPP_BASE}/charger-configs/`;
      const queryParams = [];
      
      if (params) {
        if (params.charger) queryParams.push(`charger=${params.charger}`);
        if (params.key) queryParams.push(`key=${params.key}`);
        if (params.readonly !== undefined) queryParams.push(`readonly=${params.readonly}`);
        if (params.search) queryParams.push(`search=${params.search}`);
        if (params.page) queryParams.push(`page=${params.page}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      console.log(`Making API call to: ${url}`);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching charger configs");
    }
  },
  
  getChargerConfig: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/charger-configs/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching charger config");
    }
  },
  
  createChargerConfig: async (accessToken: string, configData: ChargerConfig) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/charger-configs/`, configData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating charger config");
    }
  },
  
  updateChargerConfig: async (accessToken: string, id: string, configData: ChargerConfig) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/charger-configs/${id}/`, configData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating charger config");
    }
  },
  
  deleteChargerConfig: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/charger-configs/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting charger config");
    }
  },
  
  // Connectors
  getConnectors: async (accessToken: string, chargerId?: string) => {
    try {
      const url = chargerId ? `${OCPP_BASE}/connectors/?charger_id=${chargerId}` : `${OCPP_BASE}/connectors/`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching connectors");
    }
  },
  
  getConnector: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/connectors/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching connector");
    }
  },
  
  createConnector: async (accessToken: string, connectorData: Connector) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/connectors/`, connectorData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating connector");
    }
  },
  
  updateConnector: async (accessToken: string, id: string, connectorData: Connector) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/connectors/${id}/`, connectorData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating connector");
    }
  },
  
  deleteConnector: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/connectors/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting connector");
    }
  },
  
  // Connector actions
  remoteStartConnector: async (accessToken: string, id: string, idTag: string) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/connectors/${id}/remote_start/`, { id_tag: idTag });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error starting remote connector");
    }
  },
  
  remoteStopConnector: async (accessToken: string, id: string, transactionId: number) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/connectors/${id}/remote_stop/`, { transaction_id: transactionId });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error stopping remote connector");
    }
  },
  
  changeConnectorAvailability: async (accessToken: string, id: string, params: ChangeAvailabilityParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/connectors/${id}/change_availability/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error changing connector availability");
    }
  },
  
  // Remote commands
  remoteStartTransaction: async (accessToken: string, params: RemoteStartParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/remote_start_transaction/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error starting remote transaction");
    }
  },
  
  remoteStopTransaction: async (accessToken: string, params: RemoteStopParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/remote_stop_transaction/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error stopping remote transaction");
    }
  },
  
  resetCharger: async (accessToken: string, params: ResetParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/reset/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error resetting charger");
    }
  },
  
  clearCache: async (accessToken: string, chargerId: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/clear_cache/?charger_id=${chargerId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error clearing cache");
    }
  },
  
  getConfiguration: async (accessToken: string, chargerId: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/get_configuration/?charger_id=${chargerId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching configuration");
    }
  },
  
  setConfiguration: async (accessToken: string, params: SetConfigParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/set_configuration/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error setting configuration");
    }
  },
  
  changeAvailability: async (accessToken: string, params: ChangeAvailabilityParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/change_availability/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error changing availability");
    }
  },
  
  triggerMessage: async (accessToken: string, params: TriggerMessageParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/trigger_message/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error triggering message");
    }
  },
  
  updateFirmware: async (accessToken: string, params: UpdateFirmwareParams) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/update_firmware/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating firmware");
    }
  },
  
  getLocalListVersion: async (accessToken: string, chargerId: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/get-local-list-version/?charger_id=${chargerId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching local list version");
    }
  },
  
  sendLocalList: async (accessToken: string, chargerId: string, localList: any) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/send-local-list/`, { charger_id: chargerId, local_list: localList });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error sending local list");
    }
  },
  
  // API routes for retrieving OCPP historical data
  getTransactions: async (accessToken: string, chargerId?: string) => {
    try {
      const url = chargerId ? `${OCPP_BASE}/transactions/?charger_id=${chargerId}` : `${OCPP_BASE}/transactions/`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching transactions");
    }
  },
  
  // Charging sessions
  getChargingSessions: async (accessToken: string, filters?: any) => {
    try {
      let url = `${OCPP_BASE}/charging-sessions/`;
      const queryParams = [];
      
      if (filters) {
        if (filters.chargerId) queryParams.push(`charger_id=${filters.chargerId}`);
        if (filters.connectorId) queryParams.push(`connector_id=${filters.connectorId}`);
        if (filters.idTag) queryParams.push(`id_tag=${filters.idTag}`);
        if (filters.activeOnly) queryParams.push('active_only=true');
        if (filters.startDate) queryParams.push(`start_date=${filters.startDate}`);
        if (filters.endDate) queryParams.push(`end_date=${filters.endDate}`);
        if (filters.page) queryParams.push(`page=${filters.page}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching charging sessions");
    }
  },
  
  getChargingSession: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/charging-sessions/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching charging session");
    }
  },
  
  createChargingSession: async (accessToken: string, sessionData: any) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/charging-sessions/`, sessionData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating charging session");
    }
  },
  
  updateChargingSession: async (accessToken: string, id: string, sessionData: any) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/charging-sessions/${id}/`, sessionData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating charging session");
    }
  },
  
  deleteChargingSession: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/charging-sessions/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting charging session");
    }
  },
  
  // IdTag management
  getIdTags: async (accessToken: string, filters?: { user?: string, is_blocked?: boolean, is_expired?: boolean }) => {
    try {
      let url = `${OCPP_BASE}/id-tags/`;
      const queryParams = [];
      
      if (filters) {
        if (filters.user) queryParams.push(`user=${filters.user}`);
        if (filters.is_blocked !== undefined) queryParams.push(`is_blocked=${filters.is_blocked}`);
        if (filters.is_expired !== undefined) queryParams.push(`is_expired=${filters.is_expired}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching ID tags");
    }
  },
  
  getIdTag: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/id-tags/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching ID tag");
    }
  },
  
  createIdTag: async (accessToken: string, idTagData: any) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/id-tags/`, idTagData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating ID tag");
    }
  },
  
  updateIdTag: async (accessToken: string, id: string, idTagData: any) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/id-tags/${id}/`, idTagData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating ID tag");
    }
  },
  
  deleteIdTag: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/id-tags/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting ID tag");
    }
  },
  
  // Meter values
  getMeterValues: async (accessToken: string, filters?: any) => {
    try {
      let url = `${OCPP_BASE}/meter-values/`;
      const queryParams = [];
      
      if (filters) {
        if (filters.chargerId) queryParams.push(`charger_id=${filters.chargerId}`);
        if (filters.connectorId) queryParams.push(`connector_id=${filters.connectorId}`);
        if (filters.sessionId) queryParams.push(`session_id=${filters.sessionId}`);
        if (filters.startDate) queryParams.push(`start_date=${filters.startDate}`);
        if (filters.endDate) queryParams.push(`end_date=${filters.endDate}`);
        if (filters.page) queryParams.push(`page=${filters.page}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching meter values");
    }
  },
  
  getMeterValue: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.get(`${OCPP_BASE}/meter-values/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error fetching meter value");
    }
  },
  
  createMeterValue: async (accessToken: string, meterValueData: any) => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/meter-values/`, meterValueData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error creating meter value");
    }
  },
  
  updateMeterValue: async (accessToken: string, id: string, meterValueData: any) => {
    try {
      const response = await axiosInstance.put(`${OCPP_BASE}/meter-values/${id}/`, meterValueData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating meter value");
    }
  },
  
  deleteMeterValue: async (accessToken: string, id: string) => {
    try {
      const response = await axiosInstance.delete(`${OCPP_BASE}/meter-values/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error deleting meter value");
    }
  }
};
