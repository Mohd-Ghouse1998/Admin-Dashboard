
import axios from '@/api/axios';

export const chargerApi = {
  // Chargers
  getChargers: async (token: string, search = '') => {
    const response = await axios.get('/chargers/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getCharger: async (token: string, id: string | number) => {
    const response = await axios.get(`/chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createCharger: async (token: string, data: any) => {
    const response = await axios.post('/chargers/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateCharger: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/chargers/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteCharger: async (token: string, id: string | number) => {
    const response = await axios.delete(`/chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Charger Configurations
  getChargerConfigs: async (token: string, chargerId?: string) => {
    const url = chargerId ? `/chargers/configs/?charger=${chargerId}` : '/chargers/configs/';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getConfig: async (token: string, id: string | number) => {
    const response = await axios.get(`/chargers/configs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createChargerConfig: async (token: string, data: any) => {
    const response = await axios.post('/chargers/configs/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateChargerConfig: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/chargers/configs/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteChargerConfig: async (token: string, id: string | number) => {
    const response = await axios.delete(`/chargers/configs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Remote commands for chargers
  resetCharger: async (token: string, params: { charger_id: string; reset_type: string }) => {
    const response = await axios.post('/chargers/reset/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  clearCache: async (token: string, chargerId: string) => {
    const response = await axios.post('/chargers/clear-cache/', { charger_id: chargerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getConfiguration: async (token: string, chargerId: string) => {
    const response = await axios.get(`/chargers/configuration/?charger_id=${chargerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  setConfiguration: async (token: string, params: { charger_id: string; key: string; value: string }) => {
    const response = await axios.post('/chargers/configuration/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  remoteStartTransaction: async (token: string, params: { charger_id: string; connector_id: number; id_tag: string }) => {
    const response = await axios.post('/chargers/remote-start/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  remoteStopTransaction: async (token: string, params: { charger_id: string; transaction_id: number }) => {
    const response = await axios.post('/chargers/remote-stop/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateFirmware: async (token: string, params: { charger_id: string; location: string; retrieve_date: string }) => {
    const response = await axios.post('/chargers/update-firmware/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Commission Groups
  getCommissionGroups: async (token: string) => {
    const response = await axios.get('/chargers/commission-groups/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Charging Sessions
  getSessions: async (token: string, search = '') => {
    const response = await axios.get('/chargers/sessions/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getSession: async (token: string, id: string | number) => {
    const response = await axios.get(`/chargers/sessions/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
