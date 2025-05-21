import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import App from './App';
import { OCPIWrapper } from './modules/ocpi/OCPIWrapper';
import { useNavigationReplacer } from './modules/ocpi/hooks/useNavigationReplacer';
import { navigationConfig } from '@/components/layout/navigationConfig';
import { useAuth } from './contexts/AuthContext';

/**
 * Wraps the main App component with OCPI role management functionality.
 * Optimized to prevent dashboard freezing and improve performance.
 */
const OCPIAppWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationInitializedRef = useRef<boolean>(false);
  
  // Use the hook normally at the top level (React Hook rules)
  // But we'll control when it actually applies changes to the navigation
  const { updateNavigation } = useNavigationReplacer();
  
  // Setup OCPI navigation config - only initialize once after authentication
  useEffect(() => {
    if (isAuthenticated && !navigationInitializedRef.current) {
      // Delay navigation setup until after initial render
      const timer = setTimeout(() => {
        try {
          // Call the update function directly instead of trying to use the hook again
          updateNavigation();
          navigationInitializedRef.current = true;
        } catch (error) {
          console.error('Error initializing OCPI navigation:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, updateNavigation]);
  
  // Handle authentication redirection
  useEffect(() => {
    // Don't handle redirects while authentication is being checked
    if (isLoading) return;
    
    // Auth paths that don't require authentication
    const authPaths = ["/login", "/register", "/forgot-password"];
    
    // If not authenticated and not on an auth page, redirect to login
    if (!isAuthenticated && !authPaths.some(path => location.pathname.startsWith(path))) {
      navigate('/login', { replace: true });
      return;
    }
    
    // If authenticated and on an auth page, redirect to dashboard (at root path)
    if (isAuthenticated && authPaths.some(path => location.pathname.startsWith(path))) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-primary-600 border-primary-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Authenticated state - render App inside OCPI wrapper
  if (isAuthenticated) {
    return (
      <OCPIWrapper>
        <App />
      </OCPIWrapper>
    );
  }
  
  // Non-authenticated state - render App without OCPI wrapper
  return <App />;
};

export default OCPIAppWrapper;
