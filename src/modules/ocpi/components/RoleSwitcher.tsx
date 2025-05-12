import React, { useState, useEffect } from 'react';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { OCPIApiService } from '../services';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const RoleSwitcher: React.FC = () => {
  const { role, syncRoleWithBackend, isLoading } = useOCPIRole();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For development purposes, we'll start with just CPO as the default role
  // since the backend indicates the user doesn't have EMSP role access
  const [availableRoles, setAvailableRoles] = useState<string[]>(['CPO']);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get the available roles from the backend when the component mounts - only once
  useEffect(() => {
    // Use a ref to prevent multiple API calls
    let isMounted = true;
    
    const fetchAvailableRoles = async () => {
      // Don't fetch if already loading
      if (isLoadingRoles) return;
      
      setIsLoadingRoles(true);
      setError(null);
      
      try {
        console.log('Fetching available roles from API');
        const response = await OCPIApiService.roles.getCurrent();
        
        // Only update state if the component is still mounted
        if (!isMounted) return;
        
        console.log('Role API response:', response);
        
        // Handle various response formats
        if (response?.available_roles && Array.isArray(response.available_roles)) {
          // Standard format with available_roles array
          console.log('Available roles:', response.available_roles);
          setAvailableRoles(response.available_roles.length > 0 ? 
                          response.available_roles : ['CPO']);
        } else if (response?.roles && Array.isArray(response.roles)) {
          // Alternative format with roles array
          console.log('Available roles (from roles array):', response.roles);
          setAvailableRoles(response.roles.length > 0 ? response.roles : ['CPO']);
        } else if (response && Array.isArray(response)) {
          // Handle case where the API returns an array directly
          console.log('Available roles (direct array):', response);
          setAvailableRoles(response.length > 0 ? response : ['CPO']);
        } else {
          // If we have an active_role but no available roles, use that as the only available role
          if (response?.active_role) {
            console.log('Using active role as the only available role:', response.active_role);
            setAvailableRoles([response.active_role]);
          } else {
            console.warn('No available roles found in response, using default');
            setAvailableRoles(['CPO']);
          }
        }
      } catch (error) {
        console.error('Error fetching available roles:', error);
        // Log detailed error information
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        // If error occurs, ensure we at least have CPO
        if (isMounted) {
          setAvailableRoles(['CPO']);
          setError('Failed to fetch available roles. Using default CPO role.');
        }
      } finally {
        if (isMounted) setIsLoadingRoles(false);
      }
    };
    
    fetchAvailableRoles();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this only runs once

  // Validate role to ensure it meets database constraints
  const validateRole = (roleValue: string): string => {
    // Only allow specific role values
    const validRoles = ['CPO', 'EMSP'];
    
    // Map full names to short codes if necessary
    if (roleValue === 'Charge Point Operator') return 'CPO';
    if (roleValue === 'E-Mobility Service Provider') return 'EMSP';
    
    // Ensure role is one of the allowed values
    if (!validRoles.includes(roleValue)) {
      console.warn(`Invalid role value: "${roleValue}". Defaulting to "CPO"`);
      return 'CPO';
    }
    
    // Ensure role meets length constraint (database limit)
    if (roleValue.length > 10) {
      console.warn(`Role value exceeds database limit: "${roleValue}". Truncating.`);
      return roleValue.substring(0, 10);
    }
    
    return roleValue;
  };

  const handleRoleSwitch = (newRole: string) => {
    if (newRole === role || isLoading || isChangingRole) return;
    
    // Validate the role before proceeding
    const validatedRole = validateRole(newRole);
    if (validatedRole !== newRole) {
      console.log(`Role "${newRole}" was validated to "${validatedRole}"`); 
    }
    
    setPendingRole(validatedRole);
    setIsConfirmOpen(true);
  };

  // Implement proper role switching flow according to the recommended pattern
  const confirmRoleSwitch = async () => {
    if (!pendingRole) {
      console.error('No pending role to switch to');
      setIsConfirmOpen(false);
      return;
    }
    
    // Only proceed if we have a valid role that differs from the current one
    if (pendingRole === role) {
      setIsConfirmOpen(false);
      return;
    }
    
    // Prevent multiple role change attempts
    if (isChangingRole) {
      console.warn('Already in the process of changing roles');
      return;
    }
    
    setIsChangingRole(true);
    setError(null);
    setIsConfirmOpen(false); // Close the dialog
    
    try {
      console.log(`Switching to ${pendingRole} role...`);
      
      // Validate the role to ensure it's in the correct format
      const validatedRole = validateRole(pendingRole);
      if (validatedRole !== pendingRole) {
        console.log(`Role "${pendingRole}" was validated to "${validatedRole}"`);
      }
      
      const targetRole = validatedRole; // Either 'CPO' or 'EMSP'
      
      // Step 1: First check if we need to create a party
      try {
        // Try a GET to see if party info exists
        await OCPIApiService.common.resources.parties.getAll();
      } catch (partyErr: any) {
        // If 404 or other error, try to create a default party
        if (partyErr.response?.status === 404 || 
            (partyErr.response?.data?.message && partyErr.response?.data?.message.includes('too long for type'))) {
          try {
            console.log('Creating default OCPI party before switching role...');
            await OCPIApiService.common.resources.parties.create({
              name: 'My Organization',
              country_code: 'IN',
              party_id: 'TEST',
              roles: ['CPO', 'EMSP'].filter(r => availableRoles.includes(r))
            });
          } catch (createErr) {
            console.warn('Could not create default party:', createErr);
            // Continue anyway - the backend might handle this automatically
          }
        }
      }
      
      // Step 2: Call the backend to set the role using PUT method
      // Ensure targetRole is properly typed
      const validRole = targetRole as 'CPO' | 'EMSP';
      const response = await OCPIApiService.roles.switchRole(validRole);
      
      // Step 3: Verify the response to ensure role was set
      if (!response?.active_role && !response?.role) {
        console.warn('Role may not have been set properly in the response', response);
        // Continue anyway as we'll update the local context below
      }
      
      // Step 4: Invalidate any related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['ocpi'] });
      
      // Step 5: Update local context to ensure consistency
      await syncRoleWithBackend(targetRole);
      
      toast({
        title: 'OCPI Role Switched',
        description: `You are now operating as ${targetRole === 'CPO' ? 'a Charge Point Operator' : 'an E-Mobility Service Provider'}`,
      });
      
      // Step 6: Navigate to the appropriate dashboard based on role
      const dashboardPath = targetRole === 'CPO' ? '/ocpi/cpo/dashboard' : '/ocpi/emsp/dashboard';
      console.log(`Role switched to ${targetRole}, navigating to ${dashboardPath}...`);
      
      // Use window.location for a full page reload to reset any problematic state
      // This is more reliable than trying to update the navigation in-place
      window.location.href = dashboardPath;
      
      // Keep the loading state active since we're about to navigate away
      return;
    } catch (err: any) {
      console.error('Error switching roles:', err);
      
      // Show more specific error messages from the API when available
      if (err.response?.data?.message) {
        setError(`Failed to switch role: ${err.response.data.message}`);
        toast({
          title: 'Role Switch Failed',
          description: err.response.data.message,
          variant: 'destructive'
        });
      } else {
        setError('Failed to switch role. Please try again.');
        toast({
          title: 'Role Switch Failed',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
      }
      
      setIsChangingRole(false);
      setPendingRole(null);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2 p-2 bg-secondary/10 rounded-lg">
        {availableRoles.map((availableRole) => (
          <Button
            key={availableRole}
            variant={role === availableRole ? 'default' : 'ghost'}
            className={`${role === availableRole ? 
              (availableRole === 'CPO' ? 'bg-blue-600' : 'bg-green-600') : ''}
              ${isLoading || isChangingRole ? 'opacity-70 cursor-not-allowed' : ''}`
            }
            onClick={() => handleRoleSwitch(availableRole)}
            disabled={isLoading || isChangingRole}
            size="sm"
          >
            {availableRole === 'CPO' ? 
              <Building2 className="mr-2 h-4 w-4" /> : 
              <User className="mr-2 h-4 w-4" />
            }
            {availableRole} Mode
            {isChangingRole && pendingRole === availableRole && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        ))}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to {pendingRole} mode? Any unsaved changes may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleSwitch}>
              Switch to {pendingRole} Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
