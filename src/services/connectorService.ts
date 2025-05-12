/**
 * @deprecated - This file is kept for backward compatibility.
 * Please import from '@/modules/chargers' instead.
 */

import { connectorService } from '@/modules/chargers/services/connectorService';

// Re-export the main connectorService for backward compatibility
export { connectorService };
export default connectorService;
