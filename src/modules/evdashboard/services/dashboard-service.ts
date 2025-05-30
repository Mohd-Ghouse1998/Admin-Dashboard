import axios from 'axios';
import {
  DashboardOverview,
  StatusDistribution,
  MapData,
  MonthlyChartData,
  YearlyChartData,
  TopSessionsData,
  TopRevenueData,
  SessionsResponse,
  ChargerUtilizationData
} from '../types/api-types';

const API_BASE = '/api/dashboard';

export const dashboardService = {
  // Get overview data
  getOverview: async (accessToken: string): Promise<DashboardOverview> => {
    try {
      const response = await axios.get<DashboardOverview>(`${API_BASE}/overview/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Get status distribution
  getStatusDistribution: async (accessToken: string): Promise<StatusDistribution> => {
    try {
      const response = await axios.get<StatusDistribution>(`${API_BASE}/charts/status-distribution/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      throw error;
    }
  },

  // Get map data
  getMapData: async (accessToken: string): Promise<MapData> => {
    try {
      const response = await axios.get<MapData>(`${API_BASE}/map/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching map data:', error);
      throw error;
    }
  },

  // Get monthly chart data
  getMonthlyChartData: async (accessToken: string, months: number = 12): Promise<MonthlyChartData> => {
    try {
      const response = await axios.get<MonthlyChartData>(`${API_BASE}/charts/monthly/?months=${months}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly chart data:', error);
      throw error;
    }
  },

  // Get yearly chart data
  getYearlyChartData: async (accessToken: string, years: number = 5): Promise<YearlyChartData> => {
    try {
      const response = await axios.get<YearlyChartData>(`${API_BASE}/charts/yearly/?years=${years}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching yearly chart data:', error);
      throw error;
    }
  },

  // Get top sessions data
  getTopSessionsData: async (accessToken: string, limit: number = 5): Promise<TopSessionsData> => {
    try {
      const response = await axios.get<TopSessionsData>(`${API_BASE}/charts/top-sessions/?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top sessions data:', error);
      throw error;
    }
  },

  // Get top revenue data
  getTopRevenueData: async (accessToken: string, limit: number = 5): Promise<TopRevenueData> => {
    try {
      const response = await axios.get<TopRevenueData>(`${API_BASE}/charts/top-revenue/?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top revenue data:', error);
      throw error;
    }
  },

  // Get sessions data with pagination and filters
  getSessions: async (
    accessToken: string,
    page: number = 1, 
    limit: number = 10, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<SessionsResponse> => {
    try {
      let url = `${API_BASE}/sessions/?page=${page}&limit=${limit}`;
      
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      
      const response = await axios.get<SessionsResponse>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions data:', error);
      throw error;
    }
  },

  // Get charger utilization data with all possible filters
  getChargerUtilization: async (
    accessToken: string,
    options?: {
      timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      dateFrom?: string; // Format: 'YYYY-MM-DD'
      dateTo?: string;   // Format: 'YYYY-MM-DD'
      limit?: number;
      sortBy?: 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions' | 'hours_active' | 'availability_rate';
      reverse?: boolean;
    }
  ): Promise<ChargerUtilizationData> => {
    try {
      const {
        timePeriod = 'monthly',
        dateFrom,
        dateTo,
        limit = 15,
        sortBy = 'utilization_rate',
        reverse = true
      } = options || {};

      // Build URL with all possible parameters
      let url = `${API_BASE}/charts/chargers/utilization/?period=${timePeriod}&limit=${limit}&sort_by=${sortBy}&reverse=${reverse}`;
      
      // Add optional date range filters
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      
      const response = await axios.get<ChargerUtilizationData>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching charger utilization data:', error);
      throw error;
    }
  },

  // Get charger distribution data with grouping options
  getChargerDistribution: async (
    accessToken: string,
    options?: {
      timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      dateFrom?: string; // Format: 'YYYY-MM-DD'
      dateTo?: string;   // Format: 'YYYY-MM-DD'
      groupBy?: 'location' | 'is_online' | 'connector_count';
      sortBy?: 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions';
      reverse?: boolean;
    }
  ): Promise<ChargerUtilizationData> => {
    try {
      const {
        timePeriod = 'monthly',
        dateFrom,
        dateTo,
        groupBy = 'location',
        sortBy = 'utilization_rate',
        reverse = true
      } = options || {};

      // Build URL with all possible parameters
      let url = `${API_BASE}/charts/chargers/utilization/?period=${timePeriod}&group_by=${groupBy}&limit=100&sort_by=${sortBy}&reverse=${reverse}`;
      
      // Add optional date range filters
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      
      const response = await axios.get<ChargerUtilizationData>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching charger distribution data:', error);
      throw error;
    }
  }
};
