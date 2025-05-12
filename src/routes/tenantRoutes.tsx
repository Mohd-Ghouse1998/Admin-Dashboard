
import { Route } from "react-router-dom";
import { TenantListPage, CreateTenantPage, EditTenantPage } from "@/modules/tenants/pages";

// Tenant management routes
export const tenantRoutes = (
  <>
    <Route path="/tenants" element={<TenantListPage />} />
    <Route path="/tenants/create" element={<CreateTenantPage />} />
    <Route path="/tenants/:id/edit" element={<EditTenantPage />} />
  </>
);
