
import { useToast } from '@/hooks/use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  title?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (
    error: any, 
    defaultMessage = 'An error occurred', 
    options: ErrorHandlerOptions = { showToast: true, logToConsole: true }
  ) => {
    const { showToast = true, logToConsole = true, title = 'Error' } = options;
    
    // Extract error message from different error formats
    let errorMessage = defaultMessage;
    
    if (error?.response?.data?.detail) {
      // Django REST error format
      errorMessage = error.response.data.detail;
    } else if (error?.response?.data?.message) {
      // Common API error format
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      // Standard JS error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // String error
      errorMessage = error;
    }
    
    // Log to console if enabled
    if (logToConsole) {
      console.error('Error details:', error);
    }
    
    // Show toast if enabled
    if (showToast) {
      toast({
        title: title,
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    return errorMessage;
  };

  return { handleError };
};

export default useErrorHandler;
