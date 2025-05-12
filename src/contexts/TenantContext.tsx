import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api';

// Define tenant information interface
export interface TenantInfo {
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  domain: string;
  [key: string]: any; // For additional tenant properties from the API
}

interface TenantContextType {
  tenant: TenantInfo | null;
  isLoading: boolean;
  error: string | null;
  validateDomain: () => Promise<void>;
}

// Create the context
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Initial tenant state
const defaultTenantState: TenantInfo = {
  name: 'EV Charging',
  logo: '',
  primaryColor: '#4284C0',
  secondaryColor: '#3A75A8',
  isActive: false,
  domain: '',
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to validate domain and get tenant info
  const validateDomain = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the updated validateDomain method in apiService that includes the /api prefix
      const response = await apiService.validateDomain();
      
      if (response && response.name) {
        // Set tenant data
        setTenant({
          name: response.name,
          logo: response.logo || '',
          primaryColor: response.primary_color || '#4284C0',
          secondaryColor: response.secondary_color || '#3A75A8',
          isActive: response.is_active || true,
          domain: response.domain || window.location.hostname,
          ...response, // Include any additional properties
        });
        
        // Update document title with tenant name
        document.title = `${response.name} | EV Charging Management`;
        
        // Apply primary color to meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', response.primary_color || '#4284C0');
        }
      } else {
        setTenant(null);
        setError('Invalid tenant data received');
      }
    } catch (err) {
      console.error('Domain validation failed:', err);
      setTenant(null);
      setError('Unable to validate domain. Please check your connection or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial domain validation on mount
  useEffect(() => {
    validateDomain();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, validateDomain }}>
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook to use the tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
