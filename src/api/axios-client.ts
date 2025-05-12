
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Check if running in local development
const isLocalDevelopment = () => {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.localhost')
  );
};

// Get host information for API requests
const getApiHost = () => {
  // Always use the current hostname to maintain tenant context
  const hostname = window.location.hostname;
  // Use port 8000 for API calls in development
  return isLocalDevelopment() ? `http://${hostname}:8000` : `https://${hostname}`;
};

// Create a centralized axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: getApiHost(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle authentication headers
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Create a new headers object if it doesn't exist
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      // Set Authorization header properly
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure all API requests go to the /api path
    if (config.url && !config.url.startsWith('/api/')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error scenarios
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token as needed
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utility function to make API requests
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    // For domain validation endpoints in development, append domain as query param
    if (
      config.url?.includes('/validate-domain') && 
      isLocalDevelopment() && 
      !config.url.includes('?domain=')
    ) {
      // Make sure the URL has the correct format with api prefix
      if (!config.url.startsWith('/api/')) {
        config.url = `/api${config.url}`;
      }
      config.url += `?domain=${window.location.hostname}`;
    }
    
    const response = await axiosClient(config);
    return response.data as T;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default axiosClient;
