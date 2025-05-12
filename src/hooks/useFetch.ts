
import { useState, useCallback } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  cache?: RequestCache;
}

interface UseFetchOptions {
  showErrorToast?: boolean;
  logErrors?: boolean;
  errorTitle?: string; // Changed from title to errorTitle for clarity
}

/**
 * Custom hook for fetching data with standardized error handling
 */
export function useFetch(defaultOptions: UseFetchOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  /**
   * Performs a fetch request with standardized error handling
   */
  const fetchData = useCallback(async <T>(
    url: string, 
    options: FetchOptions = {}, 
    fetchOptions: UseFetchOptions = {}
  ): Promise<T | null> => {
    const {
      showErrorToast = defaultOptions.showErrorToast ?? true,
      logErrors = defaultOptions.logErrors ?? true,
      errorTitle = defaultOptions.errorTitle ?? 'Error'
    } = fetchOptions;

    const { method = 'GET', headers = {}, body } = options;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: options.credentials || 'include',
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.detail || 
          `Request failed with status ${response.status}`
        );
      }

      // Check if the response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIsLoading(false);
        return data as T;
      } else {
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      setIsLoading(false);
      
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      handleError(err, "Failed to fetch data", {
        showToast: showErrorToast,
        logToConsole: logErrors,
        title: errorTitle
      });
      
      return null;
    }
  }, [handleError, defaultOptions]);

  /**
   * Fetch data from a paginated API endpoint
   */
  const fetchPaginated = useCallback(async <T>(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    options: FetchOptions = {},
    fetchOptions: UseFetchOptions = {}
  ): Promise<PaginatedResponse<T> | null> => {
    const separator = url.includes('?') ? '&' : '?';
    const paginatedUrl = `${url}${separator}page=${page}&page_size=${pageSize}`;
    
    return fetchData<PaginatedResponse<T>>(paginatedUrl, options, fetchOptions);
  }, [fetchData]);

  return {
    fetchData,
    fetchPaginated,
    isLoading,
    error,
  };
}
