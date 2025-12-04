/**
 * Event Bus
 *
 * In-memory event bus for publishing and subscribing to events.
 * Supports middleware pattern for processing pipeline.
 * In production, this would be backed by Redis or a message queue.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import type { Event, EventHandler, EventSubscription } from './event.types';
import { coreHandlers } from './handlers';

/**
 * Middleware function type
 * Receives the event and a next function to call the next middleware
 */
export type EventMiddleware = (
  event: Event,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Event Bus
 *
 * Manages event subscriptions and dispatches events to handlers.
 * Supports:
 * - Middleware pipeline for processing
 * - Global and type-specific subscriptions
 * - Wildcard patterns (e.g., "submission.*")
 * - Priority-based execution
 */
export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private globalSubscriptions: EventSubscription[] = [];
  private middlewares: EventMiddleware[] = [];
  private isProcessing = false;
  private eventQueue: Event[] = [];

  constructor() {
    // Register built-in handlers
    this.registerBuiltInHandlers();
  }

  /**
   * Add middleware to the processing pipeline
   * Middlewares run in order before handlers
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(
    eventType: string,
    handler: EventHandler,
    options?: { priority?: number }
  ): string {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      eventType,
      handler,
      priority: options?.priority ?? 0,
    };

    if (eventType === '*') {
      this.globalSubscriptions.push(subscription);
      this.globalSubscriptions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    } else {
      const subs = this.subscriptions.get(eventType) ?? [];
      subs.push(subscription);
      subs.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      this.subscriptions.set(eventType, subs);
    }

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    // Check global subscriptions
    const globalIndex = this.globalSubscriptions.findIndex(s => s.id === subscriptionId);
    if (globalIndex !== -1) {
      this.globalSubscriptions.splice(globalIndex, 1);
      return true;
    }

    // Check type-specific subscriptions
    for (const [eventType, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * Publish an event to all subscribers
   */
  async publish(event: Event): Promise<void> {
    // Add to queue
    this.eventQueue.push(event);

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.dispatch(event);
    }

    this.isProcessing = false;
  }

  /**
   * Dispatch an event through middleware and to handlers
   */
  private async dispatch(event: Event): Promise<void> {
    // Run through middleware chain first
    await this.runMiddleware(event);

    // Then dispatch to handlers
    await this.dispatchToHandlers(event);
  }

  /**
   * Run event through middleware chain
   */
  private async runMiddleware(event: Event): Promise<void> {
    if (this.middlewares.length === 0) return;

    let index = 0;
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(event, next);
      }
    };

    await next();
  }

  /**
   * Dispatch an event to subscription handlers
   */
  private async dispatchToHandlers(event: Event): Promise<void> {
    const handlers: EventSubscription[] = [];

    // Add global handlers
    handlers.push(...this.globalSubscriptions);

    // Add type-specific handlers
    const typeHandlers = this.subscriptions.get(event.eventType);
    if (typeHandlers) {
      handlers.push(...typeHandlers);
    }

    // Also check for wildcard patterns (e.g., "candidate.*")
    const [entity] = event.eventType.split('.');
    const wildcardHandlers = this.subscriptions.get(`${entity}.*`);
    if (wildcardHandlers) {
      handlers.push(...wildcardHandlers);
    }

    // Sort by priority (already sorted, but merge may have changed order)
    handlers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // Execute handlers
    for (const subscription of handlers) {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(
          `Event handler failed for ${event.eventType}:`,
          error
        );
        // Continue with other handlers
      }
    }
  }

  /**
   * Register built-in handlers
   *
   * Core handlers run as middleware (before subscriptions):
   * 1. Audit - Record everything first
   * 2. Activity Creation - Create activities from events
   * 3. Notification - Send notifications
   * 4. Webhook - Trigger webhooks
   */
  private registerBuiltInHandlers(): void {
    // Register core handlers as middleware
    for (const handler of coreHandlers) {
      this.use(async (event, next) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Core handler failed for ${event.eventType}:`, error);
        }
        await next();
      });
    }

    // Dev logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      this.subscribe(
        '*',
        async (event) => {
          console.log(`[EVENT] ${event.eventType}`, {
            entityType: event.entityType,
            entityId: event.entityId,
            actorId: event.actorId,
          });
        },
        { priority: -100 }  // Low priority - run last
      );
    }
  }

  /**
   * Get subscription count for debugging
   */
  getSubscriptionCount(): { global: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    for (const [eventType, subs] of this.subscriptions) {
      byType[eventType] = subs.length;
    }

    return {
      global: this.globalSubscriptions.length,
      byType,
    };
  }

  /**
   * Clear all subscriptions (for testing)
   */
  clear(): void {
    this.subscriptions.clear();
    this.globalSubscriptions = [];
    this.eventQueue = [];
    
    // Re-register built-in handlers
    this.registerBuiltInHandlers();
  }
}

// Export singleton
export const eventBus = new EventBus();

