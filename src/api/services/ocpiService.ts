
import axios from '@/api/axios';

export const ocpiApi = {
  // OCPI Endpoints
  getEndpoints: async (token: string, search = '') => {
    const response = await axios.get('/ocpi/endpoints/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getEndpoint: async (token: string, id: string | number) => {
    const response = await axios.get(`/ocpi/endpoints/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createEndpoint: async (token: string, data: any) => {
    const response = await axios.post('/ocpi/endpoints/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateEndpoint: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/ocpi/endpoints/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteEndpoint: async (token: string, id: string | number) => {
    const response = await axios.delete(`/ocpi/endpoints/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // OCPI Credentials
  getCredentials: async (token: string, search = '') => {
    const response = await axios.get('/ocpi/credentials/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getCredential: async (token: string, id: string | number) => {
    const response = await axios.get(`/ocpi/credentials/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createCredential: async (token: string, data: any) => {
    const response = await axios.post('/ocpi/credentials/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateCredential: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/ocpi/credentials/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteCredential: async (token: string, id: string | number) => {
    const response = await axios.delete(`/ocpi/credentials/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Charger related methods - adding these to fix the errors
  getChargerConfigs: async (token: string, chargerId?: string) => {
    const url = chargerId ? `/ocpi/charger-configs/?charger_id=${chargerId}` : '/ocpi/charger-configs/';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createChargerConfig: async (token: string, configData: any) => {
    const response = await axios.post('/ocpi/charger-configs/', configData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateChargerConfig: async (token: string, id: string | number, configData: any) => {
    const response = await axios.put(`/ocpi/charger-configs/${id}/`, configData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteChargerConfig: async (token: string, id: string | number) => {
    const response = await axios.delete(`/ocpi/charger-configs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  resetCharger: async (token: string, params: { charger_id: string; reset_type: string }) => {
    const response = await axios.post('/ocpi/reset-charger/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  clearCache: async (token: string, chargerId: string) => {
    const response = await axios.post('/ocpi/clear-cache/', { charger_id: chargerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getConfiguration: async (token: string, chargerId: string) => {
    const response = await axios.get(`/ocpi/get-configuration/?charger_id=${chargerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  setConfiguration: async (token: string, params: { charger_id: string; key: string; value: string }) => {
    const response = await axios.post('/ocpi/set-configuration/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  remoteStartTransaction: async (token: string, params: { charger_id: string; connector_id: number; id_tag: string }) => {
    const response = await axios.post('/ocpi/remote-start-transaction/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  remoteStopTransaction: async (token: string, params: { charger_id: string; transaction_id: number }) => {
    const response = await axios.post('/ocpi/remote-stop-transaction/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateFirmware: async (token: string, params: { charger_id: string; location: string; retrieve_date: string }) => {
    const response = await axios.post('/ocpi/update-firmware/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
