/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/users' instead.
 */

import { walletService } from '@/modules/users/services/walletService';

// Re-export the main walletService for backward compatibility
export { walletService };
export default walletService;
