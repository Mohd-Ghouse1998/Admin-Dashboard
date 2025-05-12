
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const usePermissions = (searchQuery = '') => {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const {
    data: permissions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['permissions', searchQuery, currentPage],
    queryFn: async () => {
      if (!accessToken) {
        // Try refreshing token first
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });
          logout();
          throw new Error('No access token available');
        }
      }
      
      try {
        return await permissionService.getPermissions(accessToken || localStorage.getItem('accessToken') || '', {
          search: searchQuery,
          page: currentPage
        });
      } catch (error: any) {
        // Handle 401 errors by attempting token refresh
        if (error.message && error.message.includes('401')) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            return await permissionService.getPermissions(localStorage.getItem('accessToken') || '', {
              search: searchQuery,
              page: currentPage
            });
          } else {
            toast({
              title: 'Authentication Error',
              description: 'Your session has expired. Please log in again.',
              variant: 'destructive'
            });
            logout();
          }
        }
        throw error;
      }
    },
    enabled: !!accessToken || !!localStorage.getItem('accessToken'),
    retry: 1,
    retryDelay: 1000
  });

  return {
    permissions,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage
  };
};
