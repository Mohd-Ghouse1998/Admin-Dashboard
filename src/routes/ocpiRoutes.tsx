import React from "react";
import { Navigate, Route } from "react-router-dom";
import { CPORoleGuard, EMSPRoleGuard } from "@/modules/ocpi/components/CPORoleGuard";

// Import standard OCPI module pages
import PartiesListPage from "@/modules/ocpi/pages/parties/PartiesListPage";
import PartyDetailPage from "@/modules/ocpi/pages/parties/PartyDetailPage";
import PartyCreatePage from "@/modules/ocpi/pages/parties/PartyCreatePage";
import LocationsListPage from "@/modules/ocpi/pages/locations/LocationsListPage";
import LocationDetailPage from "@/modules/ocpi/pages/locations/LocationDetailPage";
import LocationCreatePage from "@/modules/ocpi/pages/locations/LocationCreatePage";
import { MapChargersPage } from "@/modules/ocpi/pages/locations/MapChargersPage";
import LocationsSetupPage from "@/modules/ocpi/pages/locations/LocationsSetupPage";
import LocationsManualCreatePage from "@/modules/ocpi/pages/locations/LocationsManualCreatePage";
import EnhancedTariffManagementPage from "@/modules/ocpi/pages/tariffs/EnhancedTariffManagementPage";
import EnhancedTariffFormPage from "@/modules/ocpi/pages/tariffs/EnhancedTariffFormPage";
import TariffAssignmentPage from "@/modules/ocpi/pages/tariffs/TariffAssignmentPage";
import SessionDetailPage from "@/modules/ocpi/pages/cpo/sessions/SessionDetailPage";
import EMSPSessionDetailPage from "@/modules/ocpi/pages/emsp/sessions/EMSPSessionDetailPage";
// Import Command Management components
import CommandCenterPage from "@/modules/ocpi/pages/cpo/commands/CommandCenterPage";
import CPOCommandHistoryPage from "@/modules/ocpi/pages/cpo/commands/CPOCommandHistoryPage";
import CPOCommandDetailPage from "@/modules/ocpi/pages/cpo/commands/CPOCommandDetailPage";
import EMSPCommandCenterPage from "@/modules/ocpi/pages/emsp/commands/EMSPCommandCenterPage";
import EMSPCommandHistoryPage from "@/modules/ocpi/pages/emsp/commands/EMSPCommandHistoryPage";
import EMSPCommandDetailPage from "@/modules/ocpi/pages/emsp/commands/EMSPCommandDetailPage";

// Import CDR components
import { 
  EnhancedCPOCDRsPage, 
  EnhancedEMSPCDRsPage, 
  CDRDetailPage, 
  CDRStatisticsPage 
} from "@/modules/ocpi/pages/cdrs";

// Import dual-role OCPI components
import { RoleSwitcherPage } from "@/modules/ocpi/pages/RoleSwitcherPage";
import { CPODashboard } from "@/modules/ocpi/pages/dashboards/CPODashboard";
import { EMSPDashboard } from "@/modules/ocpi/pages/dashboards/EMSPDashboard";
import { LocationManager } from "@/modules/ocpi/pages/locations/LocationManager";
import { LocationFinder } from "@/modules/ocpi/pages/emsp/LocationFinder";
import { EMSPSessionsPage } from "@/modules/ocpi/pages/emsp/sessions/EMSPSessionsPage";
import { CPOSessionsPage } from "@/modules/ocpi/pages/cpo/sessions/CPOSessionsPage";
import { ConnectionsPage } from '@/modules/ocpi/pages';
// Direct import of ConnectionRegistrationPage to avoid any module resolution issues
import ConnectionRegistrationPage from '@/modules/ocpi/pages/shared/connections/ConnectionRegistrationPage';
// TokenValidatorPage removed in cleanup
import EnhancedTokenValidatorPage from '@/modules/ocpi/pages/shared/tokens/EnhancedTokenValidatorPage';
// Test components removed in cleanup
import DiagnosticPage from '@/modules/ocpi/pages/shared/connections/DiagnosticPage';
import SimplifiedConnectionPage from '@/modules/ocpi/pages/shared/connections/SimplifiedConnectionPage';
// Import Token Management Components
import CPOTokensPage from '@/modules/ocpi/pages/cpo/tokens/CPOTokensPage';
import CPOTokenDetailPage from '@/modules/ocpi/pages/cpo/tokens/CPOTokenDetailPage';

// Placeholder component for routes that don't have specific components yet
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 border-2 border-dashed border-blue-400 rounded-lg">
    <div className="bg-blue-50 p-6 rounded-md shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">{title}</h1>
      <p className="text-gray-700 mb-4">This page is currently under development and will be implemented soon.</p>
      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
        <p className="text-sm text-yellow-700">
          <strong>Implementation Note:</strong> This is a placeholder for the {title} feature. The UI and functionality will be implemented according to the OCPI specification.
        </p>
      </div>
    </div>
  </div>
);

// OCPI routes configuration
export const ocpiRoutes = (
  <Route path="/ocpi">
    {/* Root level redirect to role-selection */}
    <Route index element={<Navigate to="/ocpi/role-selection" replace />} />

    {/* Legacy routes redirects with more specific paths */}
    <Route path="select-role" element={<Navigate to="/ocpi/role-selection" replace />} />
    <Route path="cpo/dashboard" element={<Navigate to="/ocpi/dashboard/cpo" replace />} />
    <Route path="emsp/dashboard" element={<Navigate to="/ocpi/dashboard/emsp" replace />} />
    
    {/* Important: Do not add generic catch-all redirects here as they may intercept specific routes */}
    
    {/*
      ROLE-INDEPENDENT ROUTES
      These routes are always accessible regardless of the selected OCPI role
    */}
    
    {/* Role Selection - Always visible */}
    <Route path="role-selection" element={<RoleSwitcherPage />} />
    
    {/* Dashboard - Adapts based on current role */}
    <Route path="dashboard" element={<Navigate to="/ocpi/dashboard/cpo" replace />} />
    <Route path="dashboard/cpo" element={<CPODashboard />} />
    <Route path="dashboard/emsp" element={<EMSPDashboard />} />
    
    {/* Parties Management - Modified for direct access to detail page */}
    <Route path="parties">
      <Route index element={<PartiesListPage />} />
      <Route path=":id" element={<PartyDetailPage />} />
      <Route path=":id/edit" element={<PartyCreatePage />} />
      <Route path="create" element={<PartyCreatePage />} />
    </Route>
    
    {/* Connections Management - Always visible */}
    <Route path="connections">
      <Route index element={<ConnectionsPage />} />
      <Route path="register" element={<ConnectionRegistrationPage />} />
      <Route path="simplified" element={<SimplifiedConnectionPage />} />
      {/* Test routes removed in cleanup */}
      <Route path="diagnostic" element={<DiagnosticPage />} />
      <Route path="sync" element={<PlaceholderPage title="Synchronization Status" />} />
    </Route>
    
    {/*
      ROLE-SPECIFIC ROUTES
      These routes are accessible based on the active OCPI role (CPO or EMSP)
    */}
    
    {/* === CPO SPECIFIC ROUTES === */}
    {/* Locations Management (CPO) */}
    <Route path="locations">
      <Route index element={<CPORoleGuard><LocationManager /></CPORoleGuard>} />
      <Route path="list" element={<CPORoleGuard><LocationsListPage /></CPORoleGuard>} />
      <Route path="create" element={<CPORoleGuard><LocationCreatePage /></CPORoleGuard>} />
      <Route path=":id" element={<LocationDetailPage />} />
      <Route path="map-chargers" element={<CPORoleGuard><MapChargersPage /></CPORoleGuard>} />
      <Route path="setup" element={<CPORoleGuard><LocationsSetupPage /></CPORoleGuard>} />
      <Route path="manual-create" element={<CPORoleGuard><LocationsManualCreatePage /></CPORoleGuard>} />
    </Route>
    
    {/* Sessions (CPO) */}
    <Route path="sessions">
      <Route index element={<CPORoleGuard><CPOSessionsPage /></CPORoleGuard>} />
      <Route path=":id" element={<CPORoleGuard><SessionDetailPage /></CPORoleGuard>} />
      <Route path="active" element={<CPORoleGuard><CPOSessionsPage /></CPORoleGuard>} />
      <Route path="completed" element={<CPORoleGuard><CPOSessionsPage /></CPORoleGuard>} />
    </Route>
    
    {/* Command Management (CPO) */}
    <Route path="cpo/commands">
      <Route index element={<CPORoleGuard><CPOCommandHistoryPage /></CPORoleGuard>} />
      <Route path=":id" element={<CPORoleGuard><CPOCommandDetailPage /></CPORoleGuard>} />
    </Route>
    
    {/* Legacy Command Center Path (redirects to CPO commands) */}
    <Route path="commands">
      <Route index element={<Navigate to="/ocpi/cpo/commands" replace />} />
    </Route>
    
    {/* CDRs (CPO) */}
    <Route path="cdrs">
      <Route index element={<CPORoleGuard><EnhancedCPOCDRsPage /></CPORoleGuard>} />
      <Route path=":id" element={<CPORoleGuard><CDRDetailPage /></CPORoleGuard>} />
      <Route path="statistics" element={<CPORoleGuard><CDRStatisticsPage /></CPORoleGuard>} />
    </Route>
    
    {/* Tariffs (CPO) */}
    <Route path="tariffs">
      <Route index element={<EnhancedTariffManagementPage />} />
      <Route path="create" element={<EnhancedTariffFormPage />} />
      <Route path=":id" element={<EnhancedTariffFormPage />} />
      <Route path="assignments/:id" element={<TariffAssignmentPage />} />
      <Route path="rates" element={<PlaceholderPage title="Charging Rates" />} />
    </Route>
    
    {/* === SHARED ROUTES === */}
    {/* Token Validation - shared between roles */}
    <Route path="tokens/validate" element={<EnhancedTokenValidatorPage />} />
    
    {/* === CPO SPECIFIC ROUTES === */}
    {/* Token Management (CPO) */}
    <Route path="cpo/tokens">
      <Route index element={<CPORoleGuard><CPOTokensPage /></CPORoleGuard>} />
      <Route path=":uid" element={<CPORoleGuard><CPOTokenDetailPage /></CPORoleGuard>} />
    </Route>
    
    {/* === EMSP SPECIFIC ROUTES === */}
    {/* Tokens (EMSP) - Path maintained for backward compatibility */}
    <Route path="tokens">
      <Route index element={<Navigate to="/ocpi/cpo/tokens" replace />} />
      <Route path="create" element={<PlaceholderPage title="Create Token" />} />
      <Route path="assignment" element={<PlaceholderPage title="Token Assignment" />} />
    </Route>
    
    {/* Charge Map (EMSP) */}
    <Route path="charge-map">
      <Route index element={<LocationFinder />} />
      <Route path="map" element={<PlaceholderPage title="Interactive Map" />} />
      <Route path="search" element={<PlaceholderPage title="Location Search" />} />
      <Route path="favorites" element={<PlaceholderPage title="Favorite Locations" />} />
    </Route>
    
    {/* Active Sessions (EMSP) */}
    <Route path="active-sessions">
      <Route index element={<EMSPSessionsPage />} />
      <Route path=":id" element={<EMSPRoleGuard><EMSPSessionDetailPage /></EMSPRoleGuard>} />
      <Route path="start" element={<PlaceholderPage title="Start New Session" />} />
      <Route path="stop" element={<PlaceholderPage title="Stop Session" />} />
    </Route>
    
    {/* CDRs (EMSP) */}
    <Route path="emsp/cdrs">
      <Route index element={<EMSPRoleGuard><EnhancedEMSPCDRsPage /></EMSPRoleGuard>} />
      <Route path=":id" element={<EMSPRoleGuard><CDRDetailPage /></EMSPRoleGuard>} />
      <Route path="statistics" element={<EMSPRoleGuard><CDRStatisticsPage /></EMSPRoleGuard>} />
      <Route path="billing" element={<EMSPRoleGuard><CDRStatisticsPage /></EMSPRoleGuard>} />
    </Route>
    
    {/* Tariffs (EMSP) */}
    <Route path="tariffs">
      <Route index element={<EnhancedTariffManagementPage />} />
      <Route path="create" element={<EnhancedTariffFormPage />} />
      <Route path=":id" element={<EnhancedTariffFormPage />} />
      <Route path="rates" element={<PlaceholderPage title="Charging Rates" />} />
    </Route>
    
    {/* EMSP Command Management */}
    <Route path="emsp/commands">
      <Route index element={<EMSPRoleGuard><EMSPCommandHistoryPage /></EMSPRoleGuard>} />
      <Route path=":id" element={<EMSPRoleGuard><EMSPCommandDetailPage /></EMSPRoleGuard>} />
    </Route>
    
    {/* EMSP Command Center */}
    <Route path="emsp/command-center" element={<EMSPRoleGuard><EMSPCommandCenterPage /></EMSPRoleGuard>} />
    
    {/* Note: Legacy redirects moved to prevent conflict with specific routes */}
  </Route>
);
