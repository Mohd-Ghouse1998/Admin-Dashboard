/**
 * OCPI Module - Electric Flow Admin Portal
 * 
 * This module provides components, services, and utilities for Open Charge Point Interface (OCPI)
 * integration. The module has been refactored to use a unified OCPIApiService for all API calls,
 * improving code organization and maintainability.
 *
 * Major components:
 * - OCPIApiService: Unified service for all OCPI API calls
 * - OCPIRoleContext: Context for managing OCPI roles (CPO/EMSP)
 * - Core components: RoleSwitcher, OCPILayout, etc.
 * - Page components: Dashboards, Location management, Session management, etc.
 */

// ===== Core Services =====
export { OCPIApiService } from './services';

// ===== Contexts =====
export { 
  OCPIRoleProvider, 
  useOCPIRole
} from './contexts/OCPIRoleContext';

// Type definition for OCPI roles
export type OCPIRole = 'CPO' | 'EMSP';

// ===== UI Components =====
export { OCPILayout } from './components/OCPILayout';
export { OCPIRoleGuard } from './components/OCPIRoleGuard';
export { OCPIRoleHeader } from './components/OCPIRoleHeader';
export { OCPIHeaderActions } from './components/OCPIHeaderActions';
export { RoleSwitcher } from './components/RoleSwitcher';
export { ConnectionStatusIndicator } from './components/ConnectionStatusIndicator';
export { SessionStatusBadge } from './components/SessionStatusBadge';

// ===== Pages =====
export { RoleSwitcherPage } from './pages/RoleSwitcherPage';

// Dashboard pages
export { CPODashboard } from './pages/dashboards/CPODashboard';
export { EMSPDashboard } from './pages/dashboards/EMSPDashboard';

// Location management
export { LocationManager } from './pages/locations/LocationManager';
export { LocationFinder } from './pages/emsp/LocationFinder';

// Session management
export { EMSPSessionsPage } from './pages/emsp/sessions/EMSPSessionsPage';
export { CPOSessionsPage } from './pages/cpo/sessions/CPOSessionsPage';

// ===== Theming =====
export { OCPIThemeProvider, useOCPITheme } from './styles/OCPITheme';

// ===== Main Application Wrapper =====
export { OCPIWrapper } from './OCPIWrapper';
