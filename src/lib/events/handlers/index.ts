/**
 * Event Handlers Index
 *
 * Auto-discovers and registers all event handlers.
 * Exports core handlers and provides registration utilities.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { EventBus } from '../EventBus';
import type { Event } from '../event.types';

// Import all handler files (auto-discovery)
import './user-handlers';
import './course-handlers';

// Core handlers
import { activityCreationHandler } from './ActivityCreationHandler';
import { notificationHandler } from './NotificationHandler';
import { auditHandler } from './AuditHandler';
import { webhookHandler } from './WebhookHandler';

// Export handlers
export {
  activityCreationHandler,
  notificationHandler,
  auditHandler,
  webhookHandler,
};

// Export handler modules
export * from './user-handlers';
export * from './course-handlers';

/**
 * Core event handlers that run on all events (in order)
 *
 * Order matters:
 * 1. Audit - Record everything first
 * 2. Activity Creation - Create activities from events
 * 3. Notification - Send notifications
 * 4. Webhook - Trigger external webhooks
 */
export const coreHandlers = [
  auditHandler,              // 1. Audit (always first - record everything)
  activityCreationHandler,   // 2. Create activities from events
  notificationHandler,       // 3. Send notifications
  webhookHandler,            // 4. Trigger webhooks
];

/**
 * Register all handlers with the Event Bus and persist to database
 *
 * This should be called once at app startup after the EventBus is created.
 *
 * @param eventBus - The EventBus instance
 * @param orgId - The organization ID for multi-tenancy
 */
export async function registerAllHandlers(eventBus: EventBus, orgId: string): Promise<void> {
  console.log('[EventHandlers] Registering all event handlers...');

  // Handlers are already registered via decorators when modules are imported
  // Now persist them to database
  await eventBus.getRegistry().persistToDatabase(
    eventBus.getPool(),
    orgId
  );

  const handlerCount = eventBus.getRegistry().getHandlerCount();
  console.log(`[EventHandlers] Successfully registered ${handlerCount} event handler(s)`);
}

/**
 * Register core handlers with the in-memory event bus
 *
 * This is for the simpler event-bus.ts implementation.
 */
export function registerCoreHandlersWithBus(
  subscribe: (eventType: string, handler: (event: Event) => Promise<void>, options?: { priority?: number }) => string
): void {
  // Register each core handler with '*' pattern (all events)
  // Order by priority - higher runs first
  const priorities = [100, 90, 80, 70]; // audit, activity, notification, webhook

  coreHandlers.forEach((handler, index) => {
    // Wrap handlers to normalize return type to void
    const wrappedHandler = async (event: Event): Promise<void> => {
      await handler(event);
    };
    subscribe('*', wrappedHandler, { priority: priorities[index] });
  });

  console.log(`[EventHandlers] Registered ${coreHandlers.length} core handlers`);
}
