import React from 'react';
import { OCPIRoleProvider } from './contexts/OCPIRoleContext';
import { OCPIThemeProvider } from './styles/OCPITheme';
import { OCPIRoleGuard } from './components/OCPIRoleGuard';

/**
 * Main OCPI wrapper component that provides role context and theme to its children
 * without any automatic navigation side effects.
 */
export const OCPIWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OCPIRoleProvider>
      <OCPIThemeProvider>
        <OCPIRoleGuard>
          {children}
        </OCPIRoleGuard>
      </OCPIThemeProvider>
    </OCPIRoleProvider>
  );
};
