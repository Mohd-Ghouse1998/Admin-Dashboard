
import axios from 'axios';

// Get host information for API requests
const getApiHost = () => {
  // Always use the current hostname to maintain tenant context
  const hostname = window.location.hostname;
  // Use port 8000 for API calls in development
  const isLocalDev = hostname === 'localhost' || hostname.endsWith('.localhost');
  return isLocalDev ? `http://${hostname}:8000` : `https://${hostname}`;
};

// Create a base API client with default configuration
export const apiClient = axios.create({
  baseURL: getApiHost(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach authentication headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to check if we're in a local development environment
export const isLocalDevelopment = () => {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.localhost')
  );
};

export default apiClient;
