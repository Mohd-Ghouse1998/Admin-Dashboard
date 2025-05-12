
import { Route } from "react-router-dom";
import Settings from "@/modules/settings/pages";
import OTPManagement from "@/modules/auth/pages/OTPManagementPage";

// Settings routes
export const settingsRoutes = (
  <>
    <Route path="/settings/*" element={<Settings />} />
    <Route path="/otp-management" element={<OTPManagement />} />
    <Route path="/reports/usage" element={<Dashboard />} />
    <Route path="/reports/revenue" element={<Dashboard />} />
    <Route path="/reports/activity" element={<Dashboard />} />
    <Route path="/notifications/email" element={<Dashboard />} />
    <Route path="/notifications/sms" element={<Dashboard />} />
    <Route path="/notifications/history" element={<Dashboard />} />
  </>
);

// Import Dashboard for placeholder routes
import Dashboard from "@/modules/dashboard/pages/DashboardPage";
