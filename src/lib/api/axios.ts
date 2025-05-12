
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
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
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

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and not already retrying
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
