import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import OCPIApiService from '../services/ocpiApiService';
import { OCPIParty } from '../types/ocpiTypes';
import { clearOcpiTokenCache } from '../services/ocpiAuthService';

// Define the type for the context data
type OCPIRoleContextType = {
  role: string;
  availableRoles: string[];
  party: OCPIParty | null;
  isLoading: boolean;
  syncRoleWithBackend: (newRole?: string) => Promise<boolean | void>;
  requestBackendSync: () => void; // Method to manually trigger sync
  ensureRoleIsSet: () => Promise<boolean>; // Method to ensure a role is set
};

// Create the context with a default value
const OCPIRoleContext = createContext<OCPIRoleContextType>({
  role: 'CPO', // Default role
  availableRoles: ['CPO'], // Default available roles
  party: null,
  isLoading: false,
  syncRoleWithBackend: async () => {},
  requestBackendSync: () => {}, // Default implementation for manual sync
  ensureRoleIsSet: async () => false // Default implementation for role verification
});

// Create the provider component
export const OCPIRoleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Local storage keys
  const STORAGE_KEY_ROLE = 'ocpiRole';
  const STORAGE_KEY_AVAILABLE_ROLES = 'ocpiAvailableRoles';
  
  // Get initial role from localStorage or default to CPO, with validation
  const [role, setRoleState] = useState<string>(() => {
    const storedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    // Only accept valid roles, otherwise reset to CPO
    if (storedRole === 'CPO' || storedRole === 'EMSP') {
      return storedRole;
    } else {
      // If invalid or corrupted, reset to CPO and fix localStorage
      console.warn(`Found invalid role in localStorage: "${storedRole}", resetting to "CPO"`);
      localStorage.setItem(STORAGE_KEY_ROLE, 'CPO');
      return 'CPO';
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get available roles from localStorage or default to just CPO (since we know EMSP isn't available)
  const [availableRoles, setAvailableRoles] = useState<string[]>(() => {
    try {
      const storedRoles = localStorage.getItem(STORAGE_KEY_AVAILABLE_ROLES);
      return storedRoles ? JSON.parse(storedRoles) : ['CPO'];
    } catch (e) {
      return ['CPO'];
    }
  });
  
  const [party, setParty] = useState<OCPIParty | null>(null);
  
  const { toast } = useToast();

  // Function to update role both in state and localStorage
  const setRole = (newRole: string) => {
    // Clear OCPI token cache when role changes
    clearOcpiTokenCache();
    // Validate the role to ensure it's one of the allowed values
    if (newRole !== 'CPO' && newRole !== 'EMSP') {
      console.error(`Invalid role value: "${newRole}". Must be either "CPO" or "EMSP"`);
      return; // Don't update with invalid values
    }
    
    // Validate role length to match database constraint (max 10 chars)
    if (newRole.length > 10) {
      console.error(`Role value "${newRole}" exceeds maximum length of 10 characters`);
      return; // Don't update with invalid values
    }
    
    console.log(`Setting role to ${newRole}`);
    // Update state with the validated role
    setRoleState(newRole);
    // Save the complete role to localStorage
    localStorage.setItem(STORAGE_KEY_ROLE, newRole);
  };
  
  // Function to update available roles both in state and localStorage
  const updateAvailableRoles = (roles: string[]) => {
    if (Array.isArray(roles) && roles.length > 0) {
      setAvailableRoles(roles);
      localStorage.setItem(STORAGE_KEY_AVAILABLE_ROLES, JSON.stringify(roles));
    }
  };

  // Function to validate role - ensure it meets database constraints
  const validateRole = (role: string | null): string | null => {
    if (!role) return null;
    
    // Validate against VARCHAR(10) constraint
    if (typeof role !== 'string' || role.length > 10) {
      console.error(`Invalid role: ${role}. Role must be a string of 10 characters or less.`);
      return null;
    }
    
    // Only allow 'CPO' or 'EMSP' roles
    const validRoles = ['CPO', 'EMSP'];
    if (!validRoles.includes(role)) {
      console.error(`Invalid role: ${role}. Role must be either 'CPO' or 'EMSP'.`);
      return null;
    }
    
    // Ensure role is correctly capitalized (CPO or EMSP, not cpo or emsp)
    // This prevents issues with database constraints and backend validation
    return validRoles.find(validRole => validRole.toUpperCase() === role.toUpperCase()) || null;
  };

  // Function to check authentication
  const checkAuthentication = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('No access token found, user may need to log in');
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      return false;
    }
    return true;
  };

  // Using the new unified API service instead of the role-based service
  
  // Utility function to ensure a role is set before accessing protected pages
  const ensureRoleIsSet = async (): Promise<boolean> => {
    try {
      // If we already have a valid role, we're good
      if (role && (role === 'CPO' || role === 'EMSP')) {
        return true;
      }
      
      // If we don't have a role or it's invalid, check with the backend
      setIsLoading(true);
      
      // Use the new unified API service to check current role
      const response = await OCPIApiService.roles.getCurrent();
      
      if (!response) {
        console.error('Failed to get role information from backend');
        setIsLoading(false);
        return false;
      }
      
      // If we already have an active role according to the backend, sync it locally
      if (response.active_role) {
        await syncRoleWithBackend(response.active_role);
        setIsLoading(false);
        return true;
      }
      
      // If no active role but we have available roles, set the first available one
      if (response.available_roles && 
          Array.isArray(response.available_roles) && 
          response.available_roles.length > 0) {
        
        const roleToSet = response.available_roles[0];
        console.log(`Auto-selecting role: ${roleToSet}`);
        
        // Use the new unified API service to set the role
        const setResponse = await OCPIApiService.roles.switchRole(roleToSet as 'CPO' | 'EMSP');
        
        if (setResponse && (setResponse.active_role || setResponse.role)) {
          // Successfully set the role on the backend, now sync locally
          await syncRoleWithBackend(roleToSet);
          
          toast({
            title: 'OCPI Role Activated',
            description: `You are now operating as ${roleToSet === 'CPO' ? 'a Charge Point Operator' : 'an E-Mobility Service Provider'}`,
          });
          
          setIsLoading(false);
          return true;
        }
      }
      
      // If we get here, we couldn't set a role
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error ensuring role is set:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  // Function to sync role with backend using the updated API endpoints
  const syncRoleWithBackend = async (newRole?: string): Promise<boolean | void> => {
    // Clear OCPI token cache whenever we sync with backend
    // This ensures we don't use a cached token after role switch
    clearOcpiTokenCache();
    // If a new role is provided, use that. Otherwise use the current role from state
    let roleToSet = newRole || role;
    
    // Fixed the case: avoid sending undefined to the backend
    if (!roleToSet) {
      console.warn('No role to sync with backend');
      return;
    }
    
    // Validate against the 10-character database constraint
    if (roleToSet.length > 10) {
      console.error(`Role value "${roleToSet}" exceeds maximum length of 10 characters`);
      toast({
        title: 'Role Update Failed',
        description: 'Role value must be 10 characters or less.',
        variant: 'destructive'
      });
      return false;
    }
    
    // Trim any whitespace to avoid issues
    roleToSet = roleToSet.trim();
    
    // Prevent the function from running if already loading
    if (syncInProgressRef.current) {
      console.log('Role sync already in progress, ignoring duplicate request');
      return;
    }
    
    syncInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      // Use the already validated and trimmed roleToSet instead of creating a new variable
      
      // Validate the role before sending it to the backend
      const validatedRole = validateRole(roleToSet);
      if (!validatedRole) {
        throw new Error(`Invalid role: ${roleToSet}`);
      }

      console.debug(`Syncing role with backend: ${validatedRole}`);
      
      // Use the new unified API service for consistent API access
      // Handle response structure accordingly
      const result = await OCPIApiService.roles.switchRole(validatedRole as 'CPO' | 'EMSP');
      const response = result.data ? result : { data: result };
      console.log(`Successfully updated backend with role: ${validatedRole}`);
      
      // Update state with response data if available
      if (response?.data) {
        if (response.data.active_role) {
          setRoleState(response.data.active_role);
          localStorage.setItem(STORAGE_KEY_ROLE, response.data.active_role);
        }
        
        if (response.data.available_roles && Array.isArray(response.data.available_roles)) {
          setAvailableRoles(response.data.available_roles);
        }
        
        if (response.data.party) {
          setParty(response.data.party);
        }
        
        toast({
          title: 'Role Updated',
          description: `Successfully switched to ${response.data.active_role} role`,
        });
        
        return true; // Success status for consumers
      } else {
        // If no data in response, just update with the validated role
        setRoleState(validatedRole);
        localStorage.setItem(STORAGE_KEY_ROLE, validatedRole);
        return true; // Success status for consumers
      }
    } catch (error) {
      console.error('Error syncing role with backend:', error);
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        console.warn(`Backend rejected role update with status ${status}:`, errorData);
        
        // If the backend rejects the role (400) or the user is not authenticated (401/403)
        if (status === 400 || status === 401 || status === 403) {
          // Clear the role from localStorage
          localStorage.removeItem(STORAGE_KEY_ROLE);
          setRoleState('CPO'); // Default to CPO as fallback
          
          toast({
            title: 'Role Update Failed',
            description: `Failed to update role: ${errorData?.detail || error.message || 'Unknown error'}`,
            variant: 'destructive',
          });
        }
      }
      return false; // Error status for consumers
    } finally {
      setIsLoading(false);
      // Clear sync lock
      syncInProgressRef.current = false;
    }
  };

  // Function to clean up corrupted localStorage values
  const cleanLocalStorage = () => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEY_ROLE);
      
      // Skip if no stored role
      if (!storedRole) {
        return;
      }
      
      // Validate the stored role
      const validatedRole = validateRole(storedRole);
      
      // If validation failed, reset to default
      if (!validatedRole) {
        console.warn(`Found invalid role in localStorage: "${storedRole}", resetting to "CPO"`);
        localStorage.removeItem(STORAGE_KEY_ROLE);
        localStorage.setItem(STORAGE_KEY_ROLE, 'CPO');
        setRoleState('CPO');
      } else if (validatedRole !== storedRole) {
        // If the role needed normalization (e.g., case correction)
        localStorage.setItem(STORAGE_KEY_ROLE, validatedRole);
        console.debug(`Normalized OCPI role in localStorage from ${storedRole} to ${validatedRole}`);
        setRoleState(validatedRole);
      }
    } catch (error) {
      // If there's any error accessing localStorage, clean it up
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.setItem(STORAGE_KEY_ROLE, 'CPO');
      setRoleState('CPO');
      console.error('Error cleaning localStorage:', error);
    }
  };
  
  // Immediate cleanup for local storage on component mount
  useEffect(() => {    
    // Clean up any corrupted localStorage values first
    cleanLocalStorage();
    
    // Only after cleanup, proceed with normal initialization
    let isMounted = true;
    console.log(`Using role: ${role} (from localStorage only - API sync disabled)`);
    
    // IMPORTANT: No API calls here - just use localStorage
    // This prevents the flood of tenant validation API calls
    setIsLoading(false);
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Add a second useEffect to handle backend sync separately after cleanup
  const [syncAttempts, setSyncAttempts] = useState(0);
  const MAX_SYNC_ATTEMPTS = 3;
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false); // Disable auto-sync to prevent API floods
  
  // A flag to control whether we should sync with backend or just use localStorage
  const [shouldSyncWithBackend, setShouldSyncWithBackend] = useState<boolean>(false);
  const syncInProgressRef = useRef<boolean>(false);
  
  // This useEffect controls background synchronization with the backend
  useEffect(() => {
    // Prevent concurrent sync operations
    if (syncInProgressRef.current) {
      return;
    }
    
    // IMPORTANT: To prevent excessive API calls that were freezing the application,
    // we now only sync with the backend when explicitly requested, not on every render
    if (!shouldSyncWithBackend) {
      return;
    }
    
    // Only if shouldSyncWithBackend is true, proceed with sync logic
    console.log('Performing manual OCPI backend sync...');
    
    // Make sure we don't exceed retry attempts
    if (syncAttempts >= MAX_SYNC_ATTEMPTS) {
      console.log(`Max sync attempts (${MAX_SYNC_ATTEMPTS}) reached. Using local role: ${role}`);
      setShouldSyncWithBackend(false); // Disable future auto-sync
      return;
    }
    
    // Sync with backend
    const doSync = async () => {
      // Set flag to prevent concurrent syncs
      syncInProgressRef.current = true;
      try {
        await syncRoleWithBackend();
        // If successful, disable future auto-syncs to prevent API floods
        setShouldSyncWithBackend(false);
      } catch (error: any) {
        console.error('Error in backend sync attempt:', error);
        setSyncAttempts(prev => prev + 1);
        
        // Special handling for auth errors
        if (error?.response?.status === 401) {
          console.log('Authentication error during sync');
          setShouldSyncWithBackend(false); // Disable future auto-sync
        }
      } finally {
        // Clear flag when done
        syncInProgressRef.current = false;
      }
    };
    
    doSync();
  }, [syncAttempts, shouldSyncWithBackend]); // Removed role dependency to prevent cascading updates
  
  // Public method to explicitly request a sync with backend
  const requestBackendSync = () => {
    console.log('Manual backend sync requested');
    setShouldSyncWithBackend(true);
  };

  return (
    <OCPIRoleContext.Provider value={{ 
      role, 
      availableRoles,
      party, 
      isLoading, 
      syncRoleWithBackend,
      requestBackendSync, // Method to manually trigger backend sync
      ensureRoleIsSet  // Method to ensure a role is set before accessing protected resources
    }}>
      {children}
    </OCPIRoleContext.Provider>
  );
};

// Custom hook to use the context
// Using function declaration for consistent exports (for Fast Refresh compatibility)
export function useOCPIRole() {
  return useContext(OCPIRoleContext);
}
