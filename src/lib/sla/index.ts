/**
 * SLA Module
 * 
 * Service Level Agreement tracking and alerts.
 * Monitors activities for SLA compliance and triggers escalations.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md#sla-rules
 */

// Types
export * from './sla.types';

// Services
export { SlaService, slaService } from './sla-service';
export { SlaTracker, slaTracker } from './sla-tracker';

