/**
 * Activity Creation Handler
 *
 * Handler that creates activities from events using the ActivityEngine.
 * This connects the Event Bus to the Activity-Centric architecture.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { activityEngine } from '@/lib/activities/activity-engine';
import type { Event } from '../event.types';

export interface ActivityCreationResult {
  success: boolean;
  activitiesCreated?: number;
  activityIds?: string[];
  error?: string;
}

/**
 * Handler that creates activities from events
 *
 * This handler processes every event and uses the ActivityEngine
 * to match against patterns and create auto-activities.
 */
export async function activityCreationHandler(event: Event): Promise<ActivityCreationResult> {
  try {
    const activities = await activityEngine.processEvent(event);

    if (activities.length > 0) {
      console.log(
        `[ActivityCreationHandler] Created ${activities.length} activities for event ${event.eventType}`
      );
    }

    return {
      success: true,
      activitiesCreated: activities.length,
      activityIds: activities.map((a) => a.id),
    };
  } catch (error) {
    console.error('[ActivityCreationHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

export default activityCreationHandler;
