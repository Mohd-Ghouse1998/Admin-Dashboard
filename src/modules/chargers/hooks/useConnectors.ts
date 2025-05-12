import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { connectorApi } from '@/modules/chargers/services/connectorService';

export type ConnectorFilters = {
  charger?: string;
  status?: string;
  type?: string;
  page?: number;
}

export const useConnectors = (filters: ConnectorFilters = {}, initialPage: number = 1) => {
  const { accessToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Add page to filters
  const queryFilters = {
    ...filters,
    page: currentPage
  };
  
  const {
    data: connectors,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['connectors', queryFilters],
    queryFn: () => connectorApi.getConnectors(accessToken, queryFilters),
    enabled: !!accessToken,
  });
  
  // Compute pagination values from the API response
  const pageSize = 10; // Items per page
  const totalItems = connectors?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    connectors,
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
