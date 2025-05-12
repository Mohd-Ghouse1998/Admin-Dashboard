
import { useToast } from '@/hooks/use-toast';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: any;
}

/**
 * Handles API errors with consistent logging and user feedback
 * @param error The error object from API call
 * @param fallbackMessage Default message to show if error doesn't have a message
 * @param logPrefix Optional prefix for console error logs
 * @returns The processed error message
 */
export const handleApiError = (
  error: any, 
  fallbackMessage = "An error occurred. Please try again.", 
  logPrefix = "API Error"
): string => {
  let errorMessage = fallbackMessage;
  
  console.error(`${logPrefix}:`, error);

  // Extract error message from different possible formats
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || fallbackMessage;
  } else if (error && typeof error === 'object') {
    const errorResponse = error as ApiErrorResponse;
    errorMessage = errorResponse.message || 
                   errorResponse.error || 
                   errorResponse.detail || 
                   fallbackMessage;
  }

  return errorMessage;
};

/**
 * React hook for handling API errors with toast notifications
 */
export const useApiErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (
    error: any, 
    fallbackMessage = "An error occurred. Please try again.", 
    logPrefix = "API Error"
  ) => {
    const errorMessage = handleApiError(error, fallbackMessage, logPrefix);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return errorMessage;
  };

  return { handleError };
};

/**
 * Creates a safe wrapper for API calls with consistent error handling
 * @param apiCall The async API function to call
 * @param options Configuration options for error handling
 * @returns Promise with the API result or throws a handled error
 */
export const createSafeApiCall = <T>(
  apiCall: () => Promise<T>,
  options: {
    logPrefix?: string;
    fallbackErrorMessage?: string;
  } = {}
) => {
  const { logPrefix = "API Error", fallbackErrorMessage = "An error occurred. Please try again." } = options;
  
  return async (): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      const errorMessage = handleApiError(error, fallbackErrorMessage, logPrefix);
      throw new Error(errorMessage);
    }
  };
};
