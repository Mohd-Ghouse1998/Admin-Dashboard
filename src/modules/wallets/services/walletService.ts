/**
 * @deprecated - This wallet service is being consolidated.
 * Please import from '@/modules/users/services/walletService' instead.
 */

import { walletService } from '@/modules/users/services/walletService';

// Re-export the main walletService for backward compatibility
export { walletService };
export default walletService;
