import axiosInstance from '@/api/axios';
import { AxiosError } from 'axios';

// Base endpoint for OCPP APIs
const OCPP_BASE = '/api/ocpp';

// Handle API errors
const handleApiError = (error: any, defaultMessage: string) => {
  if (error instanceof AxiosError && error.response?.data?.detail) {
    return Promise.reject(new Error(error.response.data.detail));
  }
  return Promise.reject(new Error(defaultMessage));
};

// Remote Start Transaction
interface RemoteStartParams {
  chargerId: string;
  connectorId: number;
  idTag: string;
  userLimit?: string;
  limitType?: 'KWH' | 'AMOUNT';
}

interface RemoteStartResponse {
  status: 'Accepted' | 'Rejected';
  transactionId?: number;
  message: string;
}

// Remote Stop Transaction
interface RemoteStopParams {
  chargerId: string;
  transactionId: number;
}

interface RemoteStopResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

// Clear Cache
interface ClearCacheParams {
  chargerId: string;
}

interface ClearCacheResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

// Reset Charger
interface ResetChargerParams {
  chargerId: string;
  resetType: 'Soft' | 'Hard';
}

interface ResetChargerResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

// Trigger Message
interface TriggerMessageParams {
  chargerId: string;
  messageType: 'BootNotification' | 'StatusNotification' | 'Heartbeat' | 'MeterValues' | 'FirmwareStatusNotification';
}

// Change Availability
interface ChangeAvailabilityParams {
  charger_id: string;
  connector_id?: number;
  type: 'Operative' | 'Inoperative';
}

interface TriggerMessageResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

interface ChangeAvailabilityResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

// Update Firmware
interface UpdateFirmwareParams {
  chargerId: string;
  location: string;
  retrieveDate: string;
}

interface UpdateFirmwareResponse {
  status: 'Accepted' | 'Rejected';
  message: string;
}

export const remoteOperationsApi = {
  // Remote Start Transaction
  remoteStartTransaction: async (accessToken: string, params: RemoteStartParams): Promise<RemoteStartResponse> => {
    try {
      // Use query parameters instead of POST body
      const queryParams = new URLSearchParams();
      queryParams.append('chargerId', params.chargerId);
      queryParams.append('connectorId', params.connectorId.toString());
      queryParams.append('idTag', params.idTag);
      
      if (params.userLimit) {
        queryParams.append('userLimit', params.userLimit);
      }
      
      if (params.limitType) {
        queryParams.append('limitType', params.limitType);
      }
      
      const response = await axiosInstance.get(`${OCPP_BASE}/remote_start_transaction?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error starting transaction");
    }
  },

  // Remote Stop Transaction
  remoteStopTransaction: async (accessToken: string, params: RemoteStopParams): Promise<RemoteStopResponse> => {
    try {
      // Use query parameters instead of POST body
      const queryParams = new URLSearchParams();
      queryParams.append('chargerId', params.chargerId);
      queryParams.append('transactionId', params.transactionId.toString());
      
      const response = await axiosInstance.get(`${OCPP_BASE}/remote_stop_transaction?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error stopping transaction");
    }
  },

  // Clear Cache
  clearCache: async (accessToken: string, params: ClearCacheParams): Promise<ClearCacheResponse> => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/clear_cache/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error clearing cache");
    }
  },

  // Reset Charger
  resetCharger: async (accessToken: string, params: ResetChargerParams): Promise<ResetChargerResponse> => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/reset_charger/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error resetting charger");
    }
  },

  // Trigger Message
  triggerMessage: async (accessToken: string, params: TriggerMessageParams): Promise<TriggerMessageResponse> => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/trigger-message/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error triggering message");
    }
  },

  // Update Firmware
  updateFirmware: async (accessToken: string, params: UpdateFirmwareParams): Promise<UpdateFirmwareResponse> => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/update-firmware/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error updating firmware");
    }
  },

  // Change Availability
  changeAvailability: async (accessToken: string, params: ChangeAvailabilityParams): Promise<ChangeAvailabilityResponse> => {
    try {
      const response = await axiosInstance.post(`${OCPP_BASE}/change-availability/`, params);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Error changing availability");
    }
  },
};

export type {
  RemoteStartParams,
  RemoteStartResponse,
  RemoteStopParams,
  RemoteStopResponse,
  ClearCacheParams,
  ClearCacheResponse,
  ResetChargerParams,
  ResetChargerResponse,
  TriggerMessageParams,
  TriggerMessageResponse,
  UpdateFirmwareParams,
  UpdateFirmwareResponse,
  ChangeAvailabilityParams,
  ChangeAvailabilityResponse
};
