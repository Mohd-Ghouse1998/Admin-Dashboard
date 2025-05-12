/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/payments' instead.
 */

import { taxService } from '@/modules/payments/services/taxService';

// Re-export the main taxService for backward compatibility
export { taxService };
export default taxService;
