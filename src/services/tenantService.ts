/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/tenants' instead.
 */

import { tenantService } from '@/modules/tenants/services/tenantService';

// Re-export the main tenantService for backward compatibility
export { tenantService };
export default tenantService;
