
import axiosInstance from './axios';
import { OCPIParty, OCPILocation, OCPIEVSE, OCPIConnector, OCPICDR, OCPISession, OCPIToken } from '../types/ocpi.types';

// Base endpoint for OCPI API
const OCPI_BASE = '/api/ocpi/api';

// OCPI Parties API
export const partiesApi = {
  getAll: (page = 1, limit = 10) => {
    return axiosInstance.get(`${OCPI_BASE}/parties/?page=${page}&limit=${limit}`);
  },
  
  getById: (id: string | number) => {
    return axiosInstance.get(`${OCPI_BASE}/parties/${id}/`);
  },
  
  create: (data: OCPIParty) => {
    return axiosInstance.post(`${OCPI_BASE}/parties/`, data);
  },
  
  update: (id: string | number, data: Partial<OCPIParty>) => {
    return axiosInstance.put(`${OCPI_BASE}/parties/${id}/`, data);
  },
  
  delete: (id: string | number) => {
    return axiosInstance.delete(`${OCPI_BASE}/parties/${id}/`);
  },
};

// OCPI Locations API
export const locationsApi = {
  getAll: (page = 1, limit = 10) => {
    return axiosInstance.get(`${OCPI_BASE}/locations/?page=${page}&limit=${limit}`);
  },
  
  getById: (id: string | number) => {
    return axiosInstance.get(`${OCPI_BASE}/locations/${id}/`);
  },
  
  create: (data: OCPILocation) => {
    return axiosInstance.post(`${OCPI_BASE}/locations/`, data);
  },
  
  update: (id: string | number, data: Partial<OCPILocation>) => {
    return axiosInstance.put(`${OCPI_BASE}/locations/${id}/`, data);
  },
  
  delete: (id: string | number) => {
    return axiosInstance.delete(`${OCPI_BASE}/locations/${id}/`);
  },
};

// OCPI EVSEs API
export const evsesApi = {
  getAll: (page = 1, limit = 10) => {
    return axiosInstance.get(`${OCPI_BASE}/evses/?page=${page}&limit=${limit}`);
  },
  
  getById: (id: string | number) => {
    return axiosInstance.get(`${OCPI_BASE}/evses/${id}/`);
  },
  
  create: (data: OCPIEVSE) => {
    return axiosInstance.post(`${OCPI_BASE}/evses/`, data);
  },
  
  update: (id: string | number, data: Partial<OCPIEVSE>) => {
    return axiosInstance.put(`${OCPI_BASE}/evses/${id}/`, data);
  },
  
  delete: (id: string | number) => {
    return axiosInstance.delete(`${OCPI_BASE}/evses/${id}/`);
  },
};

// Export all OCPI APIs
export const ocpiApi = {
  parties: partiesApi,
  locations: locationsApi,
  evses: evsesApi,
  // Add additional OCPI modules as needed
};

export default ocpiApi;
