// Module index for users

// Export services
export { default as userService } from './services/userService';

// Export hooks
export { useUser } from './hooks/useUser';
export { usePermissions } from './hooks/usePermissions';

// This centralized export ensures all components use the same service implementations
