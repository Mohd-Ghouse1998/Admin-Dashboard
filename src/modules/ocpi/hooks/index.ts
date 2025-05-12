/**
 * OCPI Hooks
 * 
 * This directory previously contained custom hooks for OCPI operations.
 * Most functionality has been migrated to use the unified OCPIApiService.
 * 
 * For OCPI data access, please use the OCPIApiService from '../services' instead.
 */

// We keep this hook for backward compatibility
export { useNavigationReplacer } from './useNavigationReplacer';
