import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from './TenantContext';

// Define the shape of our Auth context
interface AuthContextType {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant } = useTenant();
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken') || null
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refreshToken') || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if the user is authenticated
  const isAuthenticated = !!accessToken;
  
  // Handle login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the current domain to ensure tenant schema context is preserved
      const response = await fetch('/api/users/login_with_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
      setIsLoading(false);
      
      return data;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'An error occurred during login');
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Handle forgot password
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users/forgot_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Forgot password failed: ${response.statusText}`);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'An error occurred while processing your request');
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  // Handle logout
  const logout = () => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    
    // Display success message
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default"
    });
  };
  
  // Refresh the access token
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch('/api/users/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      setAccessToken(data.access);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };
  
  // Fetch user data on mount if authenticated and tenant is loaded
  useEffect(() => {
    const fetchUser = async () => {
      if (accessToken && tenant) { // Only fetch user data if tenant is loaded
        try {
          const userData = await apiService.get('/api/users/users/me/', accessToken);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Try to refresh token if fetching fails
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [accessToken, tenant]); // Add tenant as dependency
  
  const contextValue: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshAccessToken,
    forgotPassword,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
