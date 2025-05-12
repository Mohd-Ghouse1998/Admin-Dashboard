/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/payments' instead.
 */

import { paymentService } from '@/modules/payments/services/paymentService';

// Re-export the main paymentService for backward compatibility
export { paymentService };
export default paymentService;
