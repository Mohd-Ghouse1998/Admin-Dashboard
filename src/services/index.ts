// Global services index
// This file re-exports services from all modules for backwards compatibility

// Re-export from modules
export * from '@/modules/users/services';
export * from '@/modules/chargers/services';
export * from '@/modules/tenants/services';
export * from '@/modules/ocpi/services';
export * from '@/modules/payments/services';
export * from '@/modules/auth/services';

// Keep the original API service if it exists
export * from './api';
