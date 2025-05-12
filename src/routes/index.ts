
// Central routing file
import { chargerRoutes } from './chargerRoutes';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { ocpiRoutes } from './ocpiRoutes';
import { paymentRoutes } from './paymentRoutes';
import { tenantRoutes } from './tenantRoutes';
import { deviceRoutes } from './deviceRoutes';
import { settingsRoutes } from './settingsRoutes';

// Re-export from index.tsx to ensure appRoutes is available
export * from './index.tsx';

// Export all route configurations
export const routes = {
  chargerRoutes,
  authRoutes,
  userRoutes,
  ocpiRoutes,
  paymentRoutes,
  tenantRoutes,
  deviceRoutes,
  settingsRoutes
};

export * from './chargerRoutes';
export * from './authRoutes';
export * from './userRoutes';
export * from './ocpiRoutes';
export * from './paymentRoutes';
export * from './tenantRoutes';
export * from './deviceRoutes';
export * from './settingsRoutes';
