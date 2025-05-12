import React, { createContext, useContext, useEffect } from 'react';
import { useOCPIRole } from '../contexts/OCPIRoleContext';

// Define theme colors
const themes = {
  CPO: {
    primary: '#1E40AF', // blue-700
    secondary: '#3B82F6', // blue-500
    accent: '#93C5FD', // blue-300
    bgLight: '#EFF6FF', // blue-50
  },
  EMSP: {
    primary: '#047857', // green-700
    secondary: '#10B981', // green-500
    accent: '#6EE7B7', // green-300
    bgLight: '#ECFDF5', // green-50
  }
};

const ThemeContext = createContext(themes.CPO);

export const OCPIThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { role } = useOCPIRole();
  const currentTheme = role === 'CPO' ? themes.CPO : themes.EMSP;
  
  useEffect(() => {
    // Update CSS variables based on current theme
    Object.entries(currentTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--ocpi-${key}`, value);
    });
    
    // Add role-specific class to body for global styling
    document.body.classList.remove('ocpi-cpo-mode', 'ocpi-emsp-mode');
    document.body.classList.add(`ocpi-${role.toLowerCase()}-mode`);
  }, [role]);
  
  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useOCPITheme() {
  return useContext(ThemeContext);
}
