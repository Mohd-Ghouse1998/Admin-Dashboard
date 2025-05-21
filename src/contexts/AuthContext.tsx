import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
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
  
  // Use a ref to track if user data is being fetched to prevent infinite loops
  const isFetchingUser = useRef(false);
  const hasAttemptedFetch = useRef(false);

  // Check if the user is authenticated
  const isAuthenticated = !!accessToken;
  
  // Handle login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the current domain to ensure tenant schema context is preserved
      // Get the tenant domain to use for API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
      const apiBase = isLocalDev && tenantDomain !== window.location.hostname ? 
        `http://${tenantDomain}` : 
        window.location.origin;
      
      console.log(`Using tenant domain for login: ${tenantDomain}, API base: ${apiBase}`);
      
      const response = await fetch(`${apiBase}/api/users/login_with_password/`, {
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
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Implement the actual forgot password logic here
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
      const apiBase = isLocalDev && tenantDomain !== window.location.hostname ? 
        `http://${tenantDomain}` : 
        window.location.origin;
        
      const response = await fetch(`${apiBase}/api/users/forgot_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`Password reset request failed: ${response.statusText}`);
      }
      
      toast({
        title: "Password Reset Initiated",
        description: "Check your email for password reset instructions.",
        variant: "default"
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to initiate password reset. Please try again.",
        variant: "destructive"
      });
      console.error('Forgot password error:', error);
      throw error;
    }
  }, [toast]); 
  
  // Handle logout
  const logout = useCallback(() => {
    // Clear tokens from state and localStorage
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Display success message
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default"
    });
  }, [toast]); 
  
  // Refresh the access token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      return false;
    }
    
    try {
      // Get the tenant domain to use for API calls
      const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
      const apiBase = isLocalDev && tenantDomain !== window.location.hostname ? 
        `http://${tenantDomain}` : 
        window.location.origin;
      
      console.log(`Using tenant domain for token refresh: ${tenantDomain}, API base: ${apiBase}`);
      
      const response = await fetch(`${apiBase}/api/users/refresh_token/`, {
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
  }, [refreshToken, logout]);
  
  // Fetch user data on mount if authenticated and tenant is loaded
  useEffect(() => {
    const fetchUser = async () => {
      // Skip if we don't have the required data or already fetching
      if (!accessToken || !tenant || isFetchingUser.current || hasAttemptedFetch.current) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Mark that we're fetching to prevent duplicate calls
        isFetchingUser.current = true;
        hasAttemptedFetch.current = true;
        
        // Get tenant domain for consistent API calls
        const tenantDomain = localStorage.getItem('tenant_domain') || window.location.hostname;
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
        const apiBase = isLocalDev && tenantDomain !== window.location.hostname ? 
          `http://${tenantDomain}` : 
          window.location.origin;
        
        console.log(`Using tenant domain for fetchUser: ${tenantDomain}, API base: ${apiBase}`);
        
        // Use direct fetch with the correct tenant domain
        const response = await fetch(`${apiBase}/api/users/users/me/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
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
        isFetchingUser.current = false;
      }
    };
    
    fetchUser();
    
    // Cleanup function to reset the fetch flag when component unmounts
    return () => {
      isFetchingUser.current = false;
    };
  }, [accessToken, tenant]); // Remove function dependencies
  
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
