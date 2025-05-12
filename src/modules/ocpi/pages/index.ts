/**
 * OCPI Pages
 * 
 * This directory contains all the page components for the OCPI module.
 * The module has been reorganized to use the unified OCPIApiService for all API calls.
 * Obsolete and duplicate files have been removed as part of the cleanup process.
 */

// Role-based pages
export { RoleSwitcherPage } from './RoleSwitcherPage';

// Dashboard pages
export { CPODashboard } from './dashboards/CPODashboard';
export { EMSPDashboard } from './dashboards/EMSPDashboard';

// Location management
export { LocationManager } from './locations/LocationManager';
export { LocationFinder } from './emsp/LocationFinder';

// Session management
export { EMSPSessionsPage } from './emsp/sessions/EMSPSessionsPage';
export { CPOSessionsPage } from './cpo/sessions/CPOSessionsPage';

// Connection management
export { default as ConnectionsPage } from './shared/ConnectionsPage';
// Export the ConnectionRegistrationPage directly to fix routing issues
export { default as ConnectionRegistrationPage } from './shared/connections/ConnectionRegistrationPage';
