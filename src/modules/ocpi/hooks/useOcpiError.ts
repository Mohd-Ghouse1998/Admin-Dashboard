import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OcpiTokenError, OcpiTokenErrorType } from '../services/ocpiAuthService';
import { useNavigate } from 'react-router-dom';

interface OcpiErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: OcpiTokenErrorType | null;
  isLoading: boolean;
}

/**
 * Custom hook to handle OCPI-related errors with consistent UI feedback
 * @param initialLoading Initial loading state
 * @returns Error handling utilities for OCPI components
 */
export function useOcpiError(initialLoading = false) {
  const [errorState, setErrorState] = useState<OcpiErrorState>({
    hasError: false,
    errorMessage: '',
    errorType: null,
    isLoading: initialLoading
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Handle error from OCPI API calls
   * @param error Error from API call
   * @param showToast Whether to show a toast notification
   */
  const handleOcpiError = (error: unknown, showToast = true) => {
    // Check if it's an OCPI token error
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      const ocpiError = error as OcpiTokenError;
      
      setErrorState({
        hasError: true,
        errorMessage: ocpiError.message,
        errorType: ocpiError.type,
        isLoading: false
      });
      
      if (showToast) {
        toast({
          title: 'OCPI Authentication Error',
          description: ocpiError.message,
          variant: 'destructive'
        });
      }
      
      // For NOT_CONFIGURED errors, we could navigate to setup page
      if (ocpiError.type === OcpiTokenErrorType.NOT_CONFIGURED) {
        console.warn('OCPI party not configured. User should set up OCPI party first.');
      }
    } else {
      // Generic error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setErrorState({
        hasError: true,
        errorMessage,
        errorType: OcpiTokenErrorType.UNKNOWN_ERROR,
        isLoading: false
      });
      
      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  /**
   * Reset error state
   */
  const resetError = () => {
    setErrorState({
      hasError: false,
      errorMessage: '',
      errorType: null,
      isLoading: false
    });
  };

  /**
   * Set loading state
   */
  const setLoading = (isLoading: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isLoading
    }));
  };

  /**
   * Navigate to OCPI party setup page
   */
  const navigateToPartySetup = () => {
    navigate('/ocpi/party');
  };

  /**
   * Generate appropriate error UI component based on error type
   */
  const ErrorComponent = () => {
    if (!errorState.hasError) return null;

    return (
      <div className="rounded-md bg-destructive/15 p-4 my-4 text-destructive">
        <div className="flex items-center">
          <svg 
            className="h-5 w-5 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium">OCPI Error</h3>
        </div>
        <div className="mt-2 text-sm">
          <p>{errorState.errorMessage}</p>
          
          {errorState.errorType === OcpiTokenErrorType.NOT_CONFIGURED && (
            <button
              onClick={navigateToPartySetup}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-destructive hover:bg-destructive/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
            >
              Set Up OCPI Party
            </button>
          )}
        </div>
      </div>
    );
  };

  return {
    ...errorState,
    handleOcpiError,
    resetError,
    setLoading,
    ErrorComponent
  };
}
