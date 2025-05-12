/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/users' instead.
 */

import { otpService } from '@/modules/users/services/otpService';

// Re-export the main otpService for backward compatibility
export { otpService };
export default otpService;
