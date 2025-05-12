/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/users' instead.
 */

import { permissionService } from '@/modules/users/services/permissionService';

// Re-export the main permissionService for backward compatibility
export { permissionService };
export default permissionService;
