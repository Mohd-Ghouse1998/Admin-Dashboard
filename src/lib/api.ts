// API service for handling authentication and other API requests
import axios, { AxiosInstance, AxiosRequestConfig, AxiosHeaders } from 'axios';

// Helper function to get the direct API base URL for a specific tenant domain
const getDirectApiBase = (tenantDomain: string): string => {
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
  
  // If we're running locally but want to use a different tenant domain
  if (isLocalDev && tenantDomain !== window.location.hostname) {
    return `http://${tenantDomain}`;
  }
  
  // For production or when using the same domain
  return window.location.origin;
};

// Get host information for API requests
const getApiHost = () => {
  // Always use the current hostname to maintain tenant context
  const hostname = window.location.hostname;
  // Use port 8000 for API calls in development
  const isLocalDev = hostname === 'localhost' || hostname.endsWith('.localhost');
  return isLocalDev ? `http://${hostname}:8000` : `https://${hostname}`;
};

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiHost(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth') 
      ? JSON.parse(sessionStorage.getItem('auth') || '{}').accessToken
      : null;
    
    if (token) {
      // Using proper typing for headers
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Ensure all API requests go to the /api path
    if (config.url && !config.url.startsWith('/api/')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Could trigger token refresh or logout here
      console.log('Authentication error, redirecting to login...');
      // Clear auth data
      sessionStorage.removeItem('auth');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth methods
  login: async (username: string, password: string) => {
    try {
      // Get tenant domain for consistent API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      console.log(`Authenticating with tenant domain: ${tenantDomain}`);
      
      // Create a direct axios instance to ensure tenant domain is used
      const apiBase = getDirectApiBase(tenantDomain);
      console.log(`Using API base for login: ${apiBase}`);
      
      const response = await axios.post(
        `${apiBase}/api/users/login_with_password/`, 
        { username, password }
      );
      
      return response.data;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  },
  
  logout: async (refreshToken: string) => {
    try {
      // Get tenant domain for consistent API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      
      // Create a direct axios instance to ensure tenant domain is used
      const apiBase = getDirectApiBase(tenantDomain);
      console.log(`Using API base for logout: ${apiBase}`);
      
      const response = await axios.post(
        `${apiBase}/api/users/logout/`, 
        { refresh_token: refreshToken }
      );
      
      return response.data;
    } catch (error) {
      console.error('Logout request failed:', error);
      throw error;
    }
  },
  
  refreshToken: async (refreshToken: string) => {
    try {
      // Get tenant domain for consistent API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      
      // Create a direct axios instance to ensure tenant domain is used
      const apiBase = getDirectApiBase(tenantDomain);
      console.log(`Using API base for token refresh: ${apiBase}`);
      
      const response = await axios.post(
        `${apiBase}/api/users/refresh_token/`, 
        { refresh: refreshToken }
      );
      
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await axiosInstance.post('/api/users/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post('/api/users/forgot_password/', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await axiosInstance.post('/api/users/set_password/', { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password request failed:', error);
      throw error;
    }
  },
  
  // User methods - Update profile endpoints
  getCurrentUser: async () => {
    try {
      // Get tenant domain for consistent API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      
      // Create a direct axios instance to ensure tenant domain is used
      const apiBase = getDirectApiBase(tenantDomain);
      console.log(`Using API base for getCurrentUser: ${apiBase}`);
      
      // Get the token for authorization
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${apiBase}/api/users/users/me/`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },
  
  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await axiosInstance.put(`/api/users/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  },
  
  // Update profile methods - corrected to use right endpoints
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/users/user_profile/');
      return response.data;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  },
  
  updateUserProfile: async (profileData: any) => {
    try {
      const response = await axiosInstance.put('/api/users/user_profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  },
  
  getProfiles: async () => {
    try {
      const response = await axiosInstance.get('/api/users/profiles/');
      return response.data;
    } catch (error) {
      console.error('Get profiles failed:', error);
      throw error;
    }
  },
  
  getProfile: async (profileId: string) => {
    try {
      const response = await axiosInstance.get(`/api/users/profiles/${profileId}/`);
      return response.data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileId: string, profileData: any) => {
    try {
      const response = await axiosInstance.put(`/api/users/profiles/${profileId}/`, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },
  
  // Tenant methods
  getTenantByDomain: async (domain: string) => {
    try {
      const response = await axiosInstance.get(`/api/tenant/domains/domain/${domain}/`);
      return response.data;
    } catch (error) {
      console.error('Get tenant by domain failed:', error);
      throw error;
    }
  },
  
  validateDomain: async () => {
    try {
      // Get tenant domain from URL parameter or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const queryTenantDomain = urlParams.get('tenant_domain');
      const storedTenantDomain = localStorage.getItem('tenant_domain');
      
      // Use tenant domain from parameter, storage, or current hostname
      const domainToValidate = queryTenantDomain || storedTenantDomain || window.location.hostname;
      console.log('Validating tenant domain:', domainToValidate);
      
      // For production tenants, we need to make a direct call to that tenant's API
      const isLocalDevelopment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname.endsWith('.localhost');
      
      const isProductionTenant = 
        domainToValidate !== 'localhost' && 
        !domainToValidate.endsWith('.localhost');
      
      // If we're on localhost but validating a production tenant, make a direct call
      if (isLocalDevelopment && isProductionTenant) {
        // Make a direct call to the tenant's domain
        console.log(`Directly validating production tenant: ${domainToValidate}`);
        const directUrl = `http://${domainToValidate}/api/tenant/validate-domain/?domain=${domainToValidate}`;
        const response = await axios.get(directUrl);
        
        // Store the domain for future API calls
        if (response.data && response.data.is_valid) {
          localStorage.setItem('tenant_domain', domainToValidate);
        }
        
        return response.data;
      }
      
      // Normal validation via axiosInstance
      const url = `/api/tenant/validate-domain/?domain=${domainToValidate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Domain validation failed:', error);
      throw error;
    }
  },
  
  // Authentication request helper
  authenticatedRequest: async (endpoint: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) => {
    try {
      const baseUrl = getBaseUrl();
      const accessToken = sessionStorage.getItem('auth') 
        ? JSON.parse(sessionStorage.getItem('auth') || '{}').accessToken
        : null;
      
      const defaultOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        } as Record<string, string>,
      };
      
      if (accessToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options.headers || {}),
        },
      };
      
      const response = await fetch(`${baseUrl}${endpoint}`, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  // Generic request methods
  get: async (endpoint: string, accessToken?: string, params = {}) => {
    try {
      const config: any = { params };
      if (accessToken) {
        config.headers = { Authorization: `Bearer ${accessToken}` };
      }
      const response = await axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  post: async (endpoint: string, data = {}, accessToken?: string) => {
    try {
      const config: any = {};
      if (accessToken) {
        config.headers = { Authorization: `Bearer ${accessToken}` };
      }
      const response = await axiosInstance.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  put: async (endpoint: string, data = {}, accessToken?: string) => {
    try {
      const config: any = {};
      if (accessToken) {
        config.headers = { Authorization: `Bearer ${accessToken}` };
      }
      const response = await axiosInstance.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint: string, accessToken?: string) => {
    try {
      const config: any = {};
      if (accessToken) {
        config.headers = { Authorization: `Bearer ${accessToken}` };
      }
      const response = await axiosInstance.delete(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
};

// Helper function to get base URL for API calls
const getBaseUrl = () => {
  // For local development with localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000/api';
  }
  
  // Extract tenant subdomain for API calls
  const hostname = window.location.hostname;
  const isLocalDev = hostname.includes('localhost');
  
  if (isLocalDev) {
    // Format like tenant.localhost:8000 - make sure to include the backend port
    return `http://${hostname}:8000/api`;
  }
  
  // Production environment uses https
  return `https://${hostname}/api`;
};

export default axiosInstance;
