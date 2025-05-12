import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { meterValueApi } from '@/modules/chargers/services/meterValueService';
import { format } from 'date-fns';

export type MeterValueFilters = {
  charger?: string;
  connector?: string;
  chargingSession?: string;
  timestampAfter?: string;
  timestampBefore?: string;
  page?: number;
}

export const useMeterValues = (filters: MeterValueFilters = {}, initialPage: number = 1) => {
  const { accessToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Add page to filters
  const queryFilters = {
    ...filters,
    page: currentPage
  };
  
  const {
    data: meterValues,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['meterValues', queryFilters],
    queryFn: () => meterValueApi.getMeterValues(accessToken, queryFilters),
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10; // Items per page
  const totalItems = meterValues?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    meterValues,
    isLoading,
    error,
    refetch,
    pagination: {
      currentPage,
      setCurrentPage,
      totalPages,
      totalItems
    }
  };
};
