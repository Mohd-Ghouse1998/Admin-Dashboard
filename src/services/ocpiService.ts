/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/ocpi' instead.
 * 
 * NOTE: This file has been updated to point directly to OCPIApiService
 * during the codebase cleanup to eliminate the redundant wrapper.
 */

import OCPIApiService from '@/modules/ocpi/services/ocpiApiService';

// Create a compatibility layer to maintain the old API shape
export const ocpiService = {
  // API Services
  api: OCPIApiService,
  
  // Re-export methods for backward compatibility
  getRoles: (token: string) => OCPIApiService.roles.getCurrent(),
  setRole: (role: 'CPO' | 'EMSP', token: string) => OCPIApiService.roles.switchRole(role),
};

export default ocpiService;
