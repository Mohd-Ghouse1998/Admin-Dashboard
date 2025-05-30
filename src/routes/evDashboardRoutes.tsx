import { Route } from "react-router-dom";
import { EVDashboardPage } from "@/modules/evdashboard";

// Routes for EV Dashboard feature
export const evDashboardRoutes = (
  <Route path="ev-dashboard">
    <Route index element={<EVDashboardPage />} />
  </Route>
);
