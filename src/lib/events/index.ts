/**
 * Events Module
 * 
 * Immutable event logging and event bus for the activity-centric architecture.
 * Events are system records of what happened - they trigger auto-activities.
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

