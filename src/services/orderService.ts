/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/payments' instead.
 */

import { orderService } from '@/modules/payments/services/orderService';

// Re-export the main orderService for backward compatibility
export { orderService };
export default orderService;
