/**
 * Handler Registry
 *
 * Manages registration and lookup of event handlers.
 * Handlers are registered at app startup and stored in memory for fast lookup.
 */

import type { EventHandler, EventPayload } from './types';
import type { Pool } from 'pg';

/**
 * Handler information stored in registry
 */
export interface HandlerInfo<T extends EventPayload = EventPayload> {
  name: string;
  handler: EventHandler<T>;
  subscriptionId: string | null; // Set after DB registration
  eventType: string;
  registeredAt: Date;
}

export class HandlerRegistry {
  private handlers: Map<string, HandlerInfo[]> = new Map();

  /**
   * Register an event handler
   *
   * @param eventType - The event type to listen for (e.g., 'user.created')
   * @param handlerName - Unique name for this handler
   * @param handler - The handler function to execute
   */
  register<T extends EventPayload>(
    eventType: string,
    handlerName: string,
    handler: EventHandler<T>
  ): void {
    const handlerInfo: HandlerInfo<T> = {
      name: handlerName,
      handler,
      subscriptionId: null,
      eventType,
      registeredAt: new Date()
    };

    const existing = this.handlers.get(eventType) || [];
    existing.push(handlerInfo as HandlerInfo);
    this.handlers.set(eventType, existing);

    console.log(`[HandlerRegistry] Registered handler: ${handlerName} for event type: ${eventType}`);
  }

  /**
   * Get all handlers for an event type
   *
   * @param eventType - The event type to get handlers for
   * @returns Array of handler info objects
   */
  getHandlers(eventType: string): HandlerInfo[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Get all registered handlers (for admin UI)
   *
   * @returns Array of all handler info objects
   */
  getAllHandlers(): HandlerInfo[] {
    const all: HandlerInfo[] = [];
    for (const handlers of this.handlers.values()) {
      all.push(...handlers);
    }
    return all;
  }

  /**
   * Persist handler registrations to database
   * Called once at app startup
   *
   * @param pool - PostgreSQL connection pool
   * @param orgId - Organization ID for multi-tenancy
   */
  async persistToDatabase(pool: Pool, orgId: string): Promise<void> {
    const client = await pool.connect();

    try {
      for (const [eventType, handlers] of this.handlers.entries()) {
        for (const handlerInfo of handlers) {
          // Insert or update subscription
          const result = await client.query(
            `INSERT INTO event_subscriptions (
              org_id,
              subscriber_name,
              event_pattern,
              handler_function,
              is_active
            ) VALUES ($1, $2, $3, $4, TRUE)
            ON CONFLICT (subscriber_name, event_pattern)
            DO UPDATE SET
              handler_function = EXCLUDED.handler_function,
              updated_at = NOW()
            RETURNING id`,
            [orgId, handlerInfo.name, eventType, handlerInfo.name]
          );

          handlerInfo.subscriptionId = result.rows[0].id;
        }
      }

      console.log('[HandlerRegistry] All handlers persisted to database');
    } catch (error) {
      console.error('[HandlerRegistry] Failed to persist handlers:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clear all handlers (for testing)
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get count of registered handlers
   */
  getHandlerCount(): number {
    return this.getAllHandlers().length;
  }

  /**
   * Check if a handler is registered
   *
   * @param eventType - The event type
   * @param handlerName - The handler name
   * @returns True if handler is registered
   */
  hasHandler(eventType: string, handlerName: string): boolean {
    const handlers = this.getHandlers(eventType);
    return handlers.some(h => h.name === handlerName);
  }
}
