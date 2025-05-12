
import axios from '@/api/axios';

export const tenantApi = {
  // Tenants
  getTenants: async (token: string, params = {}) => {
    const response = await axios.get('/tenants/', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },
  
  getTenant: async (token: string, id: string | number) => {
    const response = await axios.get(`/tenants/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createTenant: async (token: string, data: any) => {
    const response = await axios.post('/tenants/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateTenant: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/tenants/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteTenant: async (token: string, id: string | number) => {
    const response = await axios.delete(`/tenants/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Tenant Clients
  getClients: async (token: string, search = '') => {
    const response = await axios.get('/tenants/clients/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getClient: async (token: string, id: string | number) => {
    const response = await axios.get(`/tenants/clients/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createClient: async (token: string, data: any) => {
    const response = await axios.post('/tenants/clients/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateClient: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/tenants/clients/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteClient: async (token: string, id: string | number) => {
    const response = await axios.delete(`/tenants/clients/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Tenant Domains
  getDomains: async (token: string, search = '') => {
    const response = await axios.get('/tenants/domains/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getDomain: async (token: string, id: string | number) => {
    const response = await axios.get(`/tenants/domains/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createDomain: async (token: string, data: any) => {
    const response = await axios.post('/tenants/domains/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateDomain: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/tenants/domains/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteDomain: async (token: string, id: string | number) => {
    const response = await axios.delete(`/tenants/domains/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Tenant Groups
  getGroups: async (token: string, search = '') => {
    const response = await axios.get('/tenants/groups/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });
    return response.data;
  },
  
  getGroup: async (token: string, id: string | number) => {
    const response = await axios.get(`/tenants/groups/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createGroup: async (token: string, data: any) => {
    const response = await axios.post('/tenants/groups/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  updateGroup: async (token: string, id: string | number, data: any) => {
    const response = await axios.put(`/tenants/groups/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteGroup: async (token: string, id: string | number) => {
    const response = await axios.delete(`/tenants/groups/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
