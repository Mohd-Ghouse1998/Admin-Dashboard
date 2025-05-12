
// Base API service for authenticated requests
export const apiService = {
  // Generic GET request
  get: async (endpoint: string, accessToken: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`GET request error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // GET request with full URL
  getByUrl: async (url: string, accessToken: string) => {
    try {
      // Remove the base URL if it's included in the URL
      const baseUrl = getBaseUrl();
      const cleanUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      const response = await fetch(cleanUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`GET request error for URL ${url}:`, error);
      throw error;
    }
  },
  
  // Generic POST request
  post: async (endpoint: string, data: any, accessToken: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`POST request error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Generic PUT request
  put: async (endpoint: string, data: any, accessToken: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`PUT request error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Generic DELETE request
  delete: async (endpoint: string, accessToken: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error(`DELETE request error for ${endpoint}:`, error);
      throw error;
    }
  },
};

// API URLs
const getBaseUrl = () => {
  // For local development with localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // Extract tenant subdomain for API calls
  const hostname = window.location.hostname;
  const isLocalDev = hostname.includes('localhost');
  
  if (isLocalDev) {
    // Format like tenant.localhost:8000 - make sure to include the backend port
    return `http://${hostname}:8000`;
  }
  
  // Production environment uses https
  return `https://${hostname}/api`;
};

// User module API endpoints
export const userApi = {
  // Get all users
  getUsers: (accessToken: string, page?: number) => {
    const url = page ? `/users/users/?page=${page}` : '/users/users/';
    return apiService.get(url, accessToken);
  },
  
  // Get user by ID
  getUser: (accessToken: string, id: string) => apiService.get(`/users/users/${id}/`, accessToken),
  
  // Get current user
  getCurrentUser: (accessToken: string) => apiService.get('/users/users/me/', accessToken),
  
  // Create a new user
  createUser: (accessToken: string, userData: any) => apiService.post('/users/users/', userData, accessToken),
  
  // Update a user (full update)
  updateUser: (accessToken: string, id: string, userData: any) => apiService.put(`/users/users/${id}/`, userData, accessToken),
  
  // Delete a user
  deleteUser: (accessToken: string, id: string) => apiService.delete(`/users/users/${id}/`, accessToken),
  
  // Profile Management - Updated to use correct endpoints
  getProfiles: (accessToken: string) => apiService.get('/users/profiles/', accessToken),
  getProfile: (id: string, accessToken: string) => apiService.get(`/users/profiles/${id}/`, accessToken),
  getUserProfile: (accessToken: string) => apiService.get('/users/user_profile/', accessToken),
  updateProfile: (accessToken: string, id: string, profileData: any) => apiService.put(`/users/profiles/${id}/`, profileData, accessToken),
  
  // Payment Management
  getPayments: (accessToken: string, page?: number) => {
    const url = page ? `/users/payments/?page=${page}` : '/users/payments/';
    return apiService.get(url, accessToken);
  },
  getPaymentById: (accessToken: string, id: string) => apiService.get(`/users/payments/${id}/`, accessToken),
  getPaymentByUrl: (accessToken: string, url: string) => apiService.getByUrl(url, accessToken),
  getSessionBillings: (accessToken: string, page?: number) => {
    const url = page ? `/users/session-billings/?page=${page}` : '/users/session-billings/';
    return apiService.get(url, accessToken);
  },
  getSessionBillingByUrl: (accessToken: string, url: string) => apiService.getByUrl(url, accessToken),
  
  // Plan Management
  getPlans: (accessToken: string) => apiService.get('/users/plans/', accessToken),
  getPlanUsers: (accessToken: string) => apiService.get('/users/plan-users/', accessToken),
  
  // Wallet Management
  getWallets: async (accessToken: string, page?: number) => {
    try {
      const url = page ? `/users/wallets/?page=${page}` : '/users/wallets/';
      console.log(`Fetching wallets from: ${url}`);
      const response = await apiService.get(url, accessToken);
      console.log(`Received wallet data:`, response);
      return response;
    } catch (error) {
      console.error(`Error fetching wallets: ${error}`);
      // Add error details to help debugging
      if (error.response) {
        console.error(`Status: ${error.response.status}`, error.response.data);
      }
      throw error;
    }
  },
  getOrders: (accessToken: string) => apiService.get('/users/orders/', accessToken),
  
  // Device Management
  getDevices: (accessToken: string) => apiService.get('/users/devices/', accessToken),
  getDevice: (id: string, accessToken: string) => apiService.get(`/users/devices/${id}/`, accessToken),
};
