/**
 * Events Module
 *
 * Immutable event logging and event bus for the activity-centric architecture.
 * Events are system records of what happened - they trigger auto-activities.
 *
 * Core Components:
 * - EventEmitter: Creates and persists events
 * - EventBus: Dispatches events to handlers with middleware support
 * - EventHandlerRegistry: Manages event subscriptions
 * - SubscriptionService: User event subscriptions
 * - DeliveryService: Notification and webhook delivery
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

// Types
export * from './event.types';

// Emitter
export { EventEmitter, eventEmitter } from './event-emitter';

// Handlers
export { EventHandlerRegistry, eventHandlerRegistry } from './event-handlers';

// Bus
export { EventBus, eventBus } from './event-bus';
export type { EventMiddleware } from './event-bus';

// Services
export { SubscriptionService, subscriptionService } from './SubscriptionService';
export type { Subscription, SubscriptionInput, NotificationChannel, NotificationPreferences } from './SubscriptionService';

export { DeliveryService, deliveryService } from './DeliveryService';
export type { EventData, NotificationPayload, WebhookConfig, QueuedNotification } from './DeliveryService';

// Handlers (individual exports)
export {
  activityCreationHandler,
  notificationHandler,
  auditHandler,
  webhookHandler,
  coreHandlers,
  registerAllHandlers,
  registerCoreHandlersWithBus,
} from './handlers';

