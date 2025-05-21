
// Import any required modules and hooks
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorUtils';

// Create an Auth Context
interface AuthContextType {
  user: any;
  accessToken?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: any; 
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(
    localStorage.getItem('accessToken') || undefined
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);  // Added error state
  const navigate = useNavigate();
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Set auth headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get tenant domain for consistent API calls
          const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
          const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
          const apiBase = isLocalDev && tenantDomain !== window.location.hostname ? 
            `http://${tenantDomain}` : 
            window.location.origin;
          
          console.log(`Using tenant domain for checkAuth: ${tenantDomain}, API base: ${apiBase}`);
          
          // Fetch current user with the correct tenant domain
          const response = await axios.get(`${apiBase}/api/users/users/me/`);
          setUser(response.data);
          setAccessToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error verifying authentication:', error);
          // Clear invalid token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      // Changed the parameter name from email to username to match API expectations
      const response = await axios.post('/api/users/login_with_password/', {
        username: username, // Map email to username for the API
        password
      });
      
      const { access, refresh, user } = response.data;
      
      // Save tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      setAccessToken(access);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Blacklist the refresh token
        await axios.post('/api/users/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and state regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setAccessToken(undefined);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };
  
  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/register/', userData);
      
      const { access, refresh, user } = response.data;
      
      // Save tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      setAccessToken(access);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await axios.post('/api/users/forgot_password/', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      await axios.post('/api/users/set_password/', { token, password });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };
  
  const value = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error, // Added error to context value
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context
export default AuthContext;
