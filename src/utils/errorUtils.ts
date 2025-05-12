
import { AxiosError } from 'axios';

/**
 * Extracts a readable error message from various error types
 * @param error The error object from API call or other source
 * @param fallbackMessage Default message to show if error doesn't have a specific message
 * @returns A string error message for display
 */
export const extractErrorMessage = (
  error: unknown, 
  fallbackMessage = "An unexpected error occurred"
): string => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Axios errors
  if (isAxiosError(error)) {
    // Try to get the error message from the response data
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object' && 'error' in responseData) {
      const responseError = responseData.error;
      return typeof responseError === 'string' ? responseError : JSON.stringify(responseError);
    }
    
    // Try to get the error message from the response status text
    if (error.response?.statusText) {
      return `${error.response.statusText} (${error.response.status})`;
    }
    
    // If it's a network error
    if (error.message) {
      return error.message;
    }
  }
  
  // For unknown error types
  return fallbackMessage;
};

/**
 * Type guard for Axios errors
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}
