/**
 * Activities Module
 * 
 * Core philosophy: "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
 * 
 * This module implements the Guidewire-inspired activity-centric architecture
 * where every action generates either an Activity (human work) or Event (system record).
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

// Types
export * from './activity.types';

// Services
export { ActivityService, activityService } from './activity-service';
export { ActivityEngine, activityEngine } from './activity-engine';
export { PatternMatcher, patternMatcher } from './pattern-matcher';

// Queries
export * from './activity-queries';

// Utils
export { interpolateTemplate } from './template-utils';
export { calculateDueDate } from './due-date-utils';

