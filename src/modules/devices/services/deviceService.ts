
import { apiService } from './api';

export interface Device {
  id: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  device_type: 'mobile' | 'tablet' | 'desktop' | 'other';
  device_name: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  last_login: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const deviceService = {
  // Get all devices with optional pagination
  getDevices: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/api/users/devices/?page=${page}` : '/api/users/devices/';
      return await apiService.get(url, accessToken);
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  },

  // Get a specific device by ID
  getDevice: async (accessToken: string, id: string) => {
    try {
      return await apiService.get(`/api/users/devices/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error fetching device ${id}:`, error);
      throw error;
    }
  },

  // Create a new device
  createDevice: async (accessToken: string, deviceData: Partial<Device>) => {
    try {
      return await apiService.post('/api/users/devices/', deviceData, accessToken);
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  },

  // Update a device
  updateDevice: async (accessToken: string, id: string, deviceData: Partial<Device>) => {
    try {
      return await apiService.put(`/api/users/devices/${id}/`, deviceData, accessToken);
    } catch (error) {
      console.error(`Error updating device ${id}:`, error);
      throw error;
    }
  },

  // Delete a device
  deleteDevice: async (accessToken: string, id: string) => {
    try {
      return await apiService.delete(`/api/users/devices/${id}/`, accessToken);
    } catch (error) {
      console.error(`Error deleting device ${id}:`, error);
      throw error;
    }
  },

  // Register a new device
  registerDevice: async (accessToken: string, deviceData: any) => {
    try {
      return await apiService.post('/api/users/register_device/', deviceData, accessToken);
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }
};
