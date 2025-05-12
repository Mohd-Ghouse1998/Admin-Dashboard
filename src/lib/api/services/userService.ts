/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/users' instead.
 */

import { userService } from '@/modules/users/services/userService';

// Re-export the main userService for backward compatibility
export { userService };
export default userService;
