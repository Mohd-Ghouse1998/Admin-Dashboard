// Central API service for making HTTP requests
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiService = {
  // GET request
  get: async (endpoint: string, token: string, params: any = {}) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    };
    const response = await axios.get(url, config);
    return response.data;
  },

  // POST request
  post: async (endpoint: string, data: any, token: string) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async (endpoint: string, data: any, token: string) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async (endpoint: string, data: any, token: string) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async (endpoint: string, token: string) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.delete(url, config);
    return response.data;
  },
};

export default apiService;
