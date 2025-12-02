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

// SLA utilities
export {
  calculateSLAStatus,
  getTimeRemaining,
  isOverdue,
  getAtRiskThreshold,
  calculateDefaultDueDate,
  getSLALabel,
  getSLAColors,
  willBreachSoon,
  sortBySLAPriority,
  DEFAULT_SLA_THRESHOLDS,
  DEFAULT_SLA_DURATIONS,
  type SLAStatus,
  type Priority,
  type TimeRemaining,
  type SLAConfig,
} from './sla';

// Pattern utilities
export {
  ACTIVITY_PATTERNS,
  getPattern,
  getPatternsByCategory,
  getPatternsForEntity,
  getPatternDueDate,
  getPatternFields,
  getPatternChecklist,
  getPatternOutcomes,
  searchPatterns,
  getQuickLogPatterns,
  getCategoryLabel,
  getCategoryColor,
  type PatternCategory,
  type FieldType,
  type PatternField,
  type ChecklistItem,
  type PatternOutcome,
  type ActivityPattern,
} from './patterns';

// Transition utilities
export {
  canTransition,
  getAvailableTransitions,
  validateTransition,
  getTransitionConfig,
  getTransitionLabel,
  isTerminalStatus,
  isOpenStatus,
  isActionableStatus,
  STATUS_CONFIG,
  getStatusConfig,
  getStatusLabel,
  getTransitionActions,
  type ActivityStatus,
  type TransitionValidation,
  type StatusConfig,
  type TransitionAction,
} from './transitions';

