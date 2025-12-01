/**
 * Event Handlers
 * 
 * Registry of event handlers for specific event types.
 * Handlers can trigger side effects, notifications, integrations, etc.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { eventBus } from './event-bus';
import type { Event, EventHandler } from './event.types';

/**
 * Event Handler Registry
 * 
 * Manages event handlers and provides utilities for common patterns.
 */
export class EventHandlerRegistry {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Register a handler for an event type
   */
  register(eventType: string, handler: EventHandler, priority?: number): void {
    // Register with the event bus
    eventBus.subscribe(eventType, handler, { priority });
    
    // Also track locally for management
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  /**
   * Register handlers for multiple event types
   */
  registerMany(
    eventTypes: string[],
    handler: EventHandler,
    priority?: number
  ): void {
    for (const eventType of eventTypes) {
      this.register(eventType, handler, priority);
    }
  }

  /**
   * Register all candidate event handlers
   */
  registerCandidateHandlers(): void {
    // Candidate submitted - notify account manager
    this.register('candidate.submitted', async (event) => {
      // TODO: Send notification to account manager
      console.log(`Candidate submitted: ${event.entityId}`);
    });

    // Candidate stale - send reminder
    this.register('candidate.stale', async (event) => {
      // TODO: Send reminder to recruiter
      console.log(`Candidate stale: ${event.entityId}`);
    });

    // Candidate placed - celebration!
    this.register('candidate.placed', async (event) => {
      // TODO: Send celebration notification
      console.log(`Candidate placed: ${event.entityId}`);
    });
  }

  /**
   * Register all job event handlers
   */
  registerJobHandlers(): void {
    // Job created - notify team
    this.register('job.created', async (event) => {
      // TODO: Send notification to recruiting team
      console.log(`Job created: ${event.entityId}`);
    });

    // Job SLA breach - escalate
    this.register('job.sla_breach', async (event) => {
      // TODO: Send escalation to manager
      console.log(`Job SLA breach: ${event.entityId}`);
    });

    // Job filled - celebration!
    this.register('job.filled', async (event) => {
      // TODO: Send celebration notification
      console.log(`Job filled: ${event.entityId}`);
    });
  }

  /**
   * Register all submission event handlers
   */
  registerSubmissionHandlers(): void {
    // Submission approved - notify recruiter
    this.register('submission.approved', async (event) => {
      // TODO: Send notification
      console.log(`Submission approved: ${event.entityId}`);
    });

    // Submission rejected - notify and collect feedback
    this.register('submission.rejected', async (event) => {
      // TODO: Send notification
      console.log(`Submission rejected: ${event.entityId}`);
    });
  }

  /**
   * Register all placement event handlers
   */
  registerPlacementHandlers(): void {
    // Placement started - notify all stakeholders
    this.register('placement.started', async (event) => {
      // TODO: Send notifications to:
      // - Recruiter
      // - Account Manager
      // - Consultant
      // - Client
      console.log(`Placement started: ${event.entityId}`);
    });

    // Timesheet missing - urgent reminder
    this.register('placement.timesheet_missing', async (event) => {
      // TODO: Send urgent reminder to consultant and recruiter
      console.log(`Timesheet missing: ${event.entityId}`);
    });

    // Placement ending - notify for extension discussion
    this.register('placement.end_approaching', async (event) => {
      // TODO: Send notification to recruiter
      console.log(`Placement ending soon: ${event.entityId}`);
    });
  }

  /**
   * Register all activity event handlers
   */
  registerActivityHandlers(): void {
    // Activity overdue - escalate
    this.register('activity.overdue', async (event) => {
      // TODO: Send escalation
      console.log(`Activity overdue: ${event.entityId}`);
    });

    // Activity SLA breach - urgent escalation
    this.register('activity.sla_breach', async (event) => {
      // TODO: Send urgent escalation to manager
      console.log(`Activity SLA breach: ${event.entityId}`);
    });
  }

  /**
   * Register all security event handlers
   */
  registerSecurityHandlers(): void {
    // User login from new device
    this.register('user.login', async (event) => {
      // TODO: Check for suspicious activity
      // Log for audit
    });

    // Permission changed - audit log
    this.register('user.permission_changed', async (event) => {
      // TODO: Log to security audit
      console.log(`Permission changed for user: ${event.actorId}`);
    });
  }

  /**
   * Register all default handlers
   */
  registerAllDefaults(): void {
    this.registerCandidateHandlers();
    this.registerJobHandlers();
    this.registerSubmissionHandlers();
    this.registerPlacementHandlers();
    this.registerActivityHandlers();
    this.registerSecurityHandlers();
  }

  /**
   * Get all registered event types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Export singleton
export const eventHandlerRegistry = new EventHandlerRegistry();

// Auto-register default handlers on import
// Comment out if you want to register manually
// eventHandlerRegistry.registerAllDefaults();

