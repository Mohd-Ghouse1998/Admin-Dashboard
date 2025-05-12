
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Get base URL based on environment
const getBaseUrl = (): string => {
  // Always use the current hostname to maintain tenant context
  const hostname = window.location.hostname;
  const isLocalDev = hostname === 'localhost' || hostname.endsWith('.localhost');
  
    // Use port 8000 for backend API calls in development
  return isLocalDev ? `http://${hostname}:8000` : `https://${hostname}`;
};

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Debug API URL patterns
    if (config.url) {
      // Log all user-related API requests for debugging
      if (config.url.includes('/users/users/')) {
        console.log('DEBUG: Using API pattern with /users/users/:', config.url);
      }
      
      // Log all profile-related API requests for debugging
      if (config.url.includes('/users/profiles/') || config.url.includes('/users/user_profile/')) {
        console.log('DEBUG: Using profile API endpoint:', config.url);
      }
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





// Import needed for OCPI token handling
import { clearOcpiTokenCache } from '../modules/ocpi/services/ocpiAuthService';

/**
 * Helper function to determine if a URL is an OCPI endpoint
 * @param url The URL to check
 * @returns true if this is an OCPI endpoint that requires token auth
 */
export function isOcpiEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  
  // Check if it's an OCPI endpoint that should use OCPI token auth
  return url.includes('/api/ocpi/') && (
    // Command endpoints
    url.includes('/commands/') ||
    // Other OCPI protocol endpoints requiring token auth
    url.includes('/ocpi/cpo/') ||
    url.includes('/ocpi/emsp/')
  );
}

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || '';
    
    // Handle OCPI token errors (401/403) differently from JWT errors
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        isOcpiEndpoint(requestUrl)) {
      
      console.error(`OCPI authorization error for ${requestUrl}`, error.response?.data);
      
      // Clear OCPI token cache on auth errors for OCPI endpoints
      clearOcpiTokenCache();
      
      // Don't retry OCPI requests - just report the error
      return Promise.reject(error);
    }
    
    // For regular JWT authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, logout user
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Get new access token using refresh token
        const response = await axios.post(`${getBaseUrl()}/api/users/refresh_token/`, {
          refresh: refreshToken,
        });
        
        if (response.data.access) {
          // Update access token in localStorage
          localStorage.setItem('accessToken', response.data.access);
          
          // Update authorization header
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          // Retry original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
