/**
 * @deprecated This component is deprecated. Please import ActivityCard directly.
 */

import { ActivityCard, ActivityItem } from './activity-card';

// Re-export ActivityCard as ActivityCardModern for backward compatibility
export type { ActivityItem };
export const ActivityCardModern = ActivityCard;
export default ActivityCardModern;
