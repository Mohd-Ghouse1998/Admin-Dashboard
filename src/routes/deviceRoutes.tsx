
import { Route } from "react-router-dom";
import { 
  DevicesListPage, 
  DeviceDetailPage, 
  DeviceCreatePage,
  DeviceEditPage 
} from "@/modules/users/pages/devices";

// Device management routes
export const deviceRoutes = (
  <>
    <Route path="/users/devices" element={<DevicesListPage />} />
    <Route path="/users/devices/create" element={<DeviceCreatePage />} />
    <Route path="/users/devices/:id" element={<DeviceDetailPage />} />
    <Route path="/users/devices/:id/edit" element={<DeviceEditPage />} />
  </>
);
