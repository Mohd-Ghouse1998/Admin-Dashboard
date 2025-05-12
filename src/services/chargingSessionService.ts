/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/chargers' instead.
 */

import { chargingSessionService } from '@/modules/chargers/services/chargingSessionService';

// Re-export the main chargingSessionService for backward compatibility
export { chargingSessionService };
export default chargingSessionService;
