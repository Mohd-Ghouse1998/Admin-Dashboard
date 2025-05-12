import axios from '@/api/axios';

export const chargerApi = {
  // Chargers
  getChargers: async (token: string, search = '') => {
    const response = await axios.get('/api/ocpp/chargers/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getCharger: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createCharger: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/chargers/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateCharger: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/api/ocpp/chargers/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteCharger: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Charger Configurations
  getChargerConfigs: async (token: string, chargerId?: string) => {
    const url = chargerId ? `/api/ocpp/charger-configs/?charger=${chargerId}` : '/api/ocpp/charger-configs/';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getConfig: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/charger-configs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createChargerConfig: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/charger-configs/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateChargerConfig: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/api/ocpp/charger-configs/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteChargerConfig: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/charger-configs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Connectors
  getConnectors: async (token: string, chargerId?: string) => {
    const url = chargerId ? `/api/ocpp/connectors/?charger=${chargerId}` : '/api/ocpp/connectors/';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getConnector: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/connectors/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createConnector: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/connectors/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateConnector: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/api/ocpp/connectors/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteConnector: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/connectors/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Charging Sessions
  getChargingSessions: async (token: string, params = {}) => {
    const response = await axios.get('/api/ocpp/charging-sessions/', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },
  
  getChargingSession: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/charging-sessions/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createChargingSession: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/charging-sessions/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateChargingSession: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/api/ocpp/charging-sessions/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteChargingSession: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/charging-sessions/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // ID Tags
  getIdTags: async (token: string, search = '') => {
    const response = await axios.get('/api/ocpp/id-tags/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getIdTag: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/id-tags/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createIdTag: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/id-tags/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateIdTag: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/api/ocpp/id-tags/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteIdTag: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/id-tags/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Meter Values
  getMeterValues: async (token: string, params = {}) => {
    const response = await axios.get('/api/ocpp/meter-values/', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },
  
  getMeterValue: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/meter-values/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createMeterValue: async (token: string, data: any) => {
    const response = await axios.post('/api/ocpp/meter-values/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Favorite Chargers
  getFavoriteChargers: async (token: string) => {
    const response = await axios.get('/api/ocpp/favorite_chargers/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getFavoriteCharger: async (token: string, id: string | number) => {
    const response = await axios.get(`/api/ocpp/favorite_chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createFavoriteCharger: async (token: string, chargerId: string | number) => {
    const response = await axios.post('/api/ocpp/favorite_chargers/', { charger_id: chargerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteFavoriteCharger: async (token: string, id: string | number) => {
    const response = await axios.delete(`/api/ocpp/favorite_chargers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Special OCPP Actions
  remoteStartTransaction: async (token: string, params: { chargerId: string; connectorId: number; idTag: string; userLimit?: string; limitType?: string }) => {
    const response = await axios.post('/api/ocpp/remote_start_transaction/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  remoteStopTransaction: async (token: string, params: { chargerId: string; transactionId: number }) => {
    const response = await axios.post('/api/ocpp/remote_stop_transaction/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  resetCharger: async (token: string, params: { chargerId: string; resetType: 'Hard' | 'Soft' }) => {
    const response = await axios.post('/api/ocpp/reset_charger/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  clearCache: async (token: string, chargerId: string) => {
    const response = await axios.post('/api/ocpp/clear_cache/', { chargerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  setConfiguration: async (token: string, params: { chargerId: string; key: string; value: string }) => {
    const response = await axios.post('/api/ocpp/set_configuration/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  changeAvailability: async (token: string, params: { chargerId: string; connectorId: number; type: 'Inoperative' | 'Operative' }) => {
    const response = await axios.post('/api/ocpp/change-availability/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  triggerMessage: async (token: string, params: { chargerId: string; messageType: string }) => {
    const response = await axios.post('/api/ocpp/trigger-message/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateFirmware: async (token: string, params: { chargerId: string; location: string }) => {
    const response = await axios.post('/api/ocpp/update-firmware/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getLocalListVersion: async (token: string, chargerId: string) => {
    const response = await axios.post('/api/ocpp/get-local-list-version/', { chargerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  sendLocalList: async (token: string, params: { chargerId: string; listVersion: number; localAuthorizationList: any[] }) => {
    const response = await axios.post('/api/ocpp/send-local-list/', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default chargerApi;
