import React, { useEffect, useState } from 'react';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { OCPIApiService } from '../services';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

type OCPIRoleGuardProps = {
  children: React.ReactNode;
};

export const OCPIRoleGuard: React.FC<OCPIRoleGuardProps> = ({ children }) => {
  // Get role status from context
  const { role, availableRoles, isLoading: roleContextLoading, ensureRoleIsSet, syncRoleWithBackend } = useOCPIRole();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncingRole, setIsSyncingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('CPO');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to check if a role is already set
  // Track if we've already performed role check to avoid repeated API calls
  const [roleCheckAttempted, setRoleCheckAttempted] = useState(false);
  
  useEffect(() => {
    // Skip if we've already performed a role check or if still loading from context
    if (roleCheckAttempted || roleContextLoading) return;
    
    const checkRoleStatus = async () => {
      try {
        setRoleCheckAttempted(true); // Mark that we've attempted a role check
        setIsInitializing(true);
        
        // Use the ensureRoleIsSet function from context
        // This will attempt to auto-select a role if needed
        const hasRole = await ensureRoleIsSet();
        
        if (hasRole) {
          // Role is set, we can proceed
          setIsInitializing(false);
        } else {
          // No role could be set automatically, show the selection interface
          
          // Try to get available roles to show in selection UI
          const response = await OCPIApiService.roles.getCurrent();
          
          if (response?.available_roles && Array.isArray(response.available_roles)) {
            const availableRolesFromAPI = response.available_roles;
            if (availableRolesFromAPI.length > 0) {
              // Use the roles returned by the API
              setSelectedRole(availableRolesFromAPI[0]); // Set first available as default selection
            }
          }
          
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error('Error checking OCPI role status:', err);
        
        // If we get a 404, it means no party exists yet - redirect to party creation
        if (err.response?.status === 404) {
          // Redirect to party creation page
          navigate('/ocpi/parties/create');
          return;
        }
        
        // Handle database constraint error
        if (err.response?.data?.message && err.response?.data?.message.includes('too long for type')) {
          setError('Role value exceeds database limit. Please select a valid role.');
        } else {
          setError('Failed to check OCPI role status. Please try again.');
        }
        
        setIsInitializing(false);
      }
    };

    if (!roleContextLoading) {
      checkRoleStatus();
    }
  }, [roleContextLoading, ensureRoleIsSet, navigate]);

  // Updated role selection flow matching the API response format
  const handleRoleSelect = async () => {
    // Validate role length before submission (database limit is 10 characters)
    if (selectedRole && selectedRole.length > 10) {
      setError('Role value must be 10 characters or less.');
      return;
    }
    
    setIsSyncingRole(true);
    setError(null);

    try {
      // Make sure the role value is trimmed to remove any whitespace
      const trimmedRole = selectedRole.trim();
      
      // First, verify the party exists
      try {
        // Check if the user has a party registered
        const partyResponse = await OCPIApiService.roles.getCurrent();
        
        // If no party info or 404, redirect to party creation
        if (!partyResponse?.party) {
          navigate('/ocpi/parties/create');
          return;
        }
        
        // If user doesn't have the selected role in available_roles, show an error
        if (partyResponse?.available_roles && 
            Array.isArray(partyResponse.available_roles) &&
            !partyResponse.available_roles.includes(trimmedRole)) {
          throw new Error(`You don't have access to the ${trimmedRole} role`); 
        }
      } catch (partyErr: any) {
        if (partyErr.response?.status === 404) {
          // No party found - redirect to party creation
          navigate('/ocpi/parties/create');
          return;
        }
        throw partyErr; // Re-throw to be caught by outer catch block
      }
      
      // Call the backend to set the role using PUT method
      // Ensure trimmedRole is correctly typed
      const validRole = trimmedRole as 'CPO' | 'EMSP';
      const response = await OCPIApiService.roles.switchRole(validRole);
      
      // Verify the response to ensure role was set
      if (!response?.active_role && 
          !(response?.status === 'success' && response?.active_role === trimmedRole)) {
        throw new Error('Role not set properly in the response');
      }
      
      // Update local context to ensure consistency
      await syncRoleWithBackend(trimmedRole);
      
      toast({
        title: 'OCPI Role Activated',
        description: `You are now operating as ${trimmedRole === 'CPO' ? 'a Charge Point Operator' : 'an E-Mobility Service Provider'}`,
      });
      
      // Navigate to the appropriate dashboard based on role
      navigate(trimmedRole === 'CPO' ? '/ocpi/cpo/dashboard' : '/ocpi/emsp/dashboard');
      
    } catch (err: any) {
      console.error('Failed to set OCPI role:', err);
      // Show more specific error messages from the API when available
      if (err.response?.data?.message) {
        setError(`Failed to set OCPI role: ${err.response.data.message}`);
      } else {
        setError('Failed to set OCPI role. Please try again.');
      }
    } finally {
      setIsSyncingRole(false);
    }
  };

  // Show loading state while initializing
  if (isInitializing || roleContextLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-center">Initializing OCPI Module...</p>
      </div>
    );
  }

  // If we have a role and it's valid, render the children
  if (role && (role === 'CPO' || role === 'EMSP')) {
    return <>{children}</>;
  }

  // If we don't have a role, show the role selection interface
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select OCPI Role</CardTitle>
          <CardDescription>
            Please select a role to access OCPI functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all
                ${selectedRole === 'CPO' 
                  ? 'bg-primary/10 border-primary' 
                  : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedRole('CPO')}
            >
              <h3 className="font-medium">CPO</h3>
              <p className="text-sm text-muted-foreground">Charge Point Operator</p>
              <p className="text-xs mt-2">Manage charging stations and expose them to EMSPs</p>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all
                ${selectedRole === 'EMSP' 
                  ? 'bg-primary/10 border-primary' 
                  : 'hover:bg-gray-100'}
                ${!availableRoles.includes('EMSP') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (availableRoles.includes('EMSP')) {
                  setSelectedRole('EMSP');
                } else {
                  toast({
                    title: 'EMSP Role Not Available',
                    description: 'You do not have access to the EMSP role',
                    variant: 'destructive'
                  });
                }
              }}
            >
              <h3 className="font-medium">EMSP</h3>
              <p className="text-sm text-muted-foreground">E-Mobility Service Provider</p>
              <p className="text-xs mt-2">Access charging stations operated by other CPOs</p>
              {!availableRoles.includes('EMSP') && (
                <p className="text-xs text-destructive mt-2">Not available for your account</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleRoleSelect}
            disabled={isSyncingRole}
          >
            {isSyncingRole ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting role...
              </>
            ) : (
              `Continue as ${selectedRole}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
