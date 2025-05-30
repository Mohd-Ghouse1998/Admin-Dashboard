import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard-service';
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

// Helper function to get access token from localStorage
const getAccessToken = (): string => {
  const token = localStorage.getItem('accessToken');
  return token || '';
};

// Hook for fetching overview data
export const useOverview = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getOverview(accessToken);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Hook for fetching status distribution
export const useStatusDistribution = () => {
  const [data, setData] = useState<StatusDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getStatusDistribution(accessToken);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Hook for fetching map data
export const useMapData = () => {
  const [data, setData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getMapData(accessToken);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Hook for fetching monthly chart data
export const useMonthlyChartData = (months: number = 12) => {
  const [data, setData] = useState<MonthlyChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getMonthlyChartData(accessToken, months);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [months]);

  return { data, isLoading, error };
};

// Hook for fetching yearly chart data
export const useYearlyChartData = (years: number = 5) => {
  const [data, setData] = useState<YearlyChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getYearlyChartData(accessToken, years);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [years]);

  return { data, isLoading, error };
};

// Hook for fetching top sessions data
export const useTopSessionsData = (limit: number = 5) => {
  const [data, setData] = useState<TopSessionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getTopSessionsData(accessToken, limit);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, isLoading, error };
};

// Hook for fetching top revenue data
export const useTopRevenueData = (limit: number = 5) => {
  const [data, setData] = useState<TopRevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getTopRevenueData(accessToken, limit);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, isLoading, error };
};

// Hook for fetching sessions data with pagination and filters
export const useSessions = (
  page: number = 1,
  limit: number = 10,
  dateFrom?: string,
  dateTo?: string
) => {
  const [data, setData] = useState<SessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getSessions(accessToken, page, limit, dateFrom, dateTo);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, limit, dateFrom, dateTo]);

  return { data, isLoading, error };
};

// Hook for fetching charger utilization data
export const useChargerUtilization = (
  options?: {
    timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    sortBy?: 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions' | 'hours_active' | 'availability_rate';
    reverse?: boolean;
  }
) => {
  const { 
    timePeriod = 'monthly',
    dateFrom,
    dateTo,
    limit = 15,
    sortBy = 'utilization_rate',
    reverse = true
  } = options || {};
  
  const [data, setData] = useState<ChargerUtilizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getChargerUtilization(
          accessToken,
          {
            timePeriod,
            dateFrom,
            dateTo,
            limit,
            sortBy,
            reverse
          }
        );
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, dateFrom, dateTo, limit, sortBy, reverse]);

  return { data, isLoading, error };
};

// Hook for fetching charger distribution data
export const useChargerDistribution = (
  options?: {
    timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'location' | 'is_online' | 'connector_count';
    sortBy?: 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions';
    reverse?: boolean;
  }
) => {
  const { 
    timePeriod = 'monthly',
    dateFrom,
    dateTo,
    groupBy = 'location',
    sortBy = 'utilization_rate',
    reverse = true
  } = options || {};
  
  const [data, setData] = useState<ChargerUtilizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        const response = await dashboardService.getChargerDistribution(
          accessToken,
          {
            timePeriod,
            dateFrom,
            dateTo,
            groupBy,
            sortBy,
            reverse
          }
        );
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, dateFrom, dateTo, groupBy, sortBy, reverse]);

  return { data, isLoading, error };
};
