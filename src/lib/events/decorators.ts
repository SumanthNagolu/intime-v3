/**
 * Event Handler Decorators
 *
 * Provides decorators for registering event handlers automatically.
 */

import { getEventBus } from './EventBus';
import type { Event, EventPayload } from './types';

/**
 * Decorator for registering event handlers
 *
 * Automatically registers the decorated function as an event handler
 * when the module is loaded.
 *
 * @param eventType - The event type to listen for (e.g., 'user.created')
 * @param handlerName - Unique name for this handler
 *
 * @example
 * @EventHandler('user.created', 'send_welcome_email')
 * export async function handleUserCreated(event: Event<UserCreatedPayload>) {
 *   await sendWelcomeEmail(event.payload.email);
 * }
 */
export function EventHandler(eventType: string, handlerName: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // Register handler at module load time
    const eventBus = getEventBus();
    eventBus.subscribe(eventType, handlerName, originalMethod);

    return descriptor;
  };
}

/**
 * Alternative: Function-based registration (no decorator)
 *
 * Use this if you prefer explicit registration over decorators.
 *
 * @param eventType - The event type to listen for
 * @param handlerName - Unique name for this handler
 * @param handler - The handler function
 *
 * @example
 * registerEventHandler('user.created', 'send_welcome_email', async (event) => {
 *   await sendWelcomeEmail(event.payload.email);
 * });
 */
export function registerEventHandler<T extends EventPayload>(
  eventType: string,
  handlerName: string,
  handler: (event: Event<T>) => Promise<void>
): void {
  const eventBus = getEventBus();
  eventBus.subscribe(eventType, handlerName, handler);
}
