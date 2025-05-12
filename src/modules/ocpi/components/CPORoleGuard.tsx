import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Loader2 } from 'lucide-react';

/**
 * CPORoleGuard - A specialized role guard for CPO-specific routes
 * 
 * This guard ensures that only users with the CPO role can access the wrapped routes.
 * If no role is selected, it will redirect to the role selection page.
 * If a role other than CPO is selected, it will redirect to the dashboard for that role.
 */
export const CPORoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, isLoading } = useOCPIRole();
  
  // Show loading state while role context is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Checking OCPI role...</p>
      </div>
    );
  }
  
  // If no role is set, redirect to role selection
  if (!role) {
    return <Navigate to="/ocpi/role-selection" replace />;
  }
  
  // If role is not CPO, redirect to appropriate dashboard
  if (role !== 'CPO') {
    return <Navigate to={`/ocpi/dashboard/${role.toLowerCase()}`} replace />;
  }
  
  // Role is CPO, render the children
  return <>{children}</>;
};

/**
 * EMSPRoleGuard - A specialized role guard for EMSP-specific routes
 * 
 * Similar to CPORoleGuard, but for EMSP-specific routes.
 */
export const EMSPRoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, isLoading } = useOCPIRole();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Checking OCPI role...</p>
      </div>
    );
  }
  
  if (!role) {
    return <Navigate to="/ocpi/role-selection" replace />;
  }
  
  if (role !== 'EMSP') {
    return <Navigate to={`/ocpi/dashboard/${role.toLowerCase()}`} replace />;
  }
  
  return <>{children}</>;
};
