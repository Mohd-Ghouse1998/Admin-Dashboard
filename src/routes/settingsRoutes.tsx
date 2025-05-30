
import { Route } from "react-router-dom";
import Settings from "@/modules/settings/pages";
import OTPManagement from "@/modules/auth/pages/OTPManagementPage";

// Settings routes
export const settingsRoutes = (
  <>
    <Route path="/settings/*" element={<Settings />} />
    <Route path="/otp-management" element={<OTPManagement />} />
    <Route path="/reports/usage" element={<EVDashboardPage />} />
    <Route path="/reports/revenue" element={<EVDashboardPage />} />
    <Route path="/reports/activity" element={<EVDashboardPage />} />
    <Route path="/notifications/email" element={<EVDashboardPage />} />
    <Route path="/notifications/sms" element={<EVDashboardPage />} />
    <Route path="/notifications/history" element={<EVDashboardPage />} />
  </>
);

// Import EVDashboardPage for placeholder routes
import { EVDashboardPage } from "@/modules/evdashboard";
