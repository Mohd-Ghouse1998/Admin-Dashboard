
import { Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import GuestLayout from "@/components/layout/GuestLayout";
import Dashboard from "@/modules/dashboard/pages/DashboardPage";
import NotFound from "@/modules/common/pages/NotFoundPage";
import { tenantRoutes } from "./tenantRoutes";
import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";
import { chargerRoutes } from "./chargerRoutes";
import { ocpiRoutes } from "./ocpiRoutes";
import { paymentRoutes } from "./paymentRoutes";
import { deviceRoutes } from "./deviceRoutes";
import { settingsRoutes } from "./settingsRoutes";

// Main routes object containing all application routes
export const appRoutes = {
  // Guest routes that don't require authentication
  guestRoutes: (
    <Route element={<GuestLayout />}>
      {authRoutes}
    </Route>
  ),
  
  // Protected routes that require authentication
  protectedRoutes: (
    <Route element={<AppLayout />}>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Feature-specific routes */}
      {tenantRoutes}
      {userRoutes}
      {chargerRoutes}
      {ocpiRoutes}
      {paymentRoutes}
      {deviceRoutes}
      {settingsRoutes}
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
};

// Export for legacy compatibility
export const routes = {
  tenantRoutes,
  authRoutes,
  userRoutes,
  chargerRoutes,
  ocpiRoutes,
  paymentRoutes,
  deviceRoutes,
  settingsRoutes
};

export * from './tenantRoutes';
export * from './authRoutes';
export * from './userRoutes';
export * from './chargerRoutes';
export * from './ocpiRoutes';
export * from './paymentRoutes';
export * from './deviceRoutes';
export * from './settingsRoutes';
