
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/ui/theme-provider';
import OCPIAppWrapper from './OCPIAppWrapper';
import './index.css';
import './styles/material-icons.css';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <AuthProvider>
              <GoogleMapsProvider>
                <ThemeProvider defaultTheme="light" storageKey="ui-theme">
                  <TooltipProvider>
                    <OCPIAppWrapper />
                  </TooltipProvider>
                </ThemeProvider>
              </GoogleMapsProvider>
            </AuthProvider>
          </TenantProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
