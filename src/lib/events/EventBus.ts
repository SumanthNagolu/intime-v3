/**
 * Event Bus
 *
 * Main Event Bus implementation using PostgreSQL LISTEN/NOTIFY for real-time event propagation.
 * Features:
 * - Guaranteed delivery via persistent storage
 * - Automatic retries with exponential backoff
 * - Dead letter queue for failed events
 * - Health monitoring and auto-disable failing handlers
 */

import { Pool, Client } from 'pg';
import { HandlerRegistry } from './HandlerRegistry';
import type { Event, EventPayload, EventMetadata } from './types';

export class EventBus {
  private pool: Pool;
  private listenClient: Client | null = null;
  private registry: HandlerRegistry;
  private isListening = false;

  constructor(pool: Pool) {
    this.pool = pool;
    this.registry = new HandlerRegistry();
  }

  /**
   * Publish an event to the event bus
   *
   * Events are persisted to the database and then broadcast via PostgreSQL NOTIFY.
   * This guarantees delivery even if a handler is temporarily down.
   *
   * @param eventType - The event type (e.g., 'user.created', 'job.posted')
   * @param payload - The event payload (type-safe based on event type)
   * @param options - Optional metadata and user context
   * @returns The event ID (UUID)
   *
   * @example
   * await eventBus.publish('user.created', {
   *   userId: '123',
   *   email: 'john@example.com'
   * });
   */
  async publish<T extends EventPayload>(
    eventType: string,
    payload: T,
    options?: {
      userId?: string;
      metadata?: EventMetadata;
    }
  ): Promise<string> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        'SELECT publish_event($1, $2, $3, $4, $5) AS event_id',
        [
          eventType,
          null, // aggregate_id (optional, not used in Sprint 2)
          JSON.stringify(payload),
          options?.userId || null,
          JSON.stringify(options?.metadata || {})
        ]
      );

      const eventId = result.rows[0].event_id;
      console.log(`[EventBus] Published event: ${eventType} (ID: ${eventId})`);
      return eventId;
    } catch (error) {
      console.error(`[EventBus] Failed to publish event ${eventType}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Subscribe to event type with a handler
   *
   * Registers a handler function to be called when an event of the specified type is published.
   *
   * @param eventType - The event type to subscribe to
   * @param handlerName - Unique name for this handler
   * @param handler - The handler function to execute
   *
   * @example
   * eventBus.subscribe('user.created', 'send_welcome_email', async (event) => {
   *   await sendWelcomeEmail(event.payload.email);
   * });
   */
  subscribe<T extends EventPayload>(
    eventType: string,
    handlerName: string,
    handler: (event: Event<T>) => Promise<void>
  ): void {
    this.registry.register(eventType, handlerName, handler);
  }

  /**
   * Start listening to PostgreSQL NOTIFY
   * Should be called once at app startup
   *
   * Creates a dedicated PostgreSQL connection for LISTEN and processes incoming events.
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.warn('[EventBus] Already listening');
      return;
    }

    this.listenClient = new Client({
      connectionString: process.env.SUPABASE_DB_URL
    });

    await this.listenClient.connect();

    // Listen to all event categories
    const categories = ['user', 'academy', 'recruiting', 'hr', 'system', 'events'];
    for (const category of categories) {
      await this.listenClient.query(`LISTEN ${category}`);
    }

    this.listenClient.on('notification', async (msg) => {
      try {
        const payload = JSON.parse(msg.payload || '{}');
        await this.handleEvent(payload.event_id);
      } catch (error) {
        console.error('[EventBus] Error handling notification:', error);
      }
    });

    this.isListening = true;
    console.log('[EventBus] Started listening to PostgreSQL NOTIFY');
  }

  /**
   * Stop listening and cleanup
   * Should be called during graceful shutdown
   */
  async stopListening(): Promise<void> {
    if (this.listenClient) {
      await this.listenClient.end();
      this.listenClient = null;
      this.isListening = false;
      console.log('[EventBus] Stopped listening');
    }
  }

  /**
   * Handle an event by executing all registered handlers
   *
   * @param eventId - The UUID of the event to process
   * @private
   */
  private async handleEvent(eventId: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Fetch event from database
      const result = await client.query(
        'SELECT * FROM events WHERE id = $1',
        [eventId]
      );

      if (result.rows.length === 0) {
        console.warn(`[EventBus] Event ${eventId} not found`);
        return;
      }

      const eventRow = result.rows[0];
      const event: Event<EventPayload> = {
        id: eventRow.id,
        type: eventRow.event_type,
        category: eventRow.event_category,
        payload: eventRow.payload,
        metadata: eventRow.metadata,
        userId: eventRow.user_id,
        orgId: eventRow.org_id,
        createdAt: eventRow.created_at
      };

      // Get handlers for this event type
      const handlers = this.registry.getHandlers(event.type);

      if (handlers.length === 0) {
        console.log(`[EventBus] No handlers registered for event type: ${event.type}`);
        return;
      }

      console.log(`[EventBus] Processing event ${eventId} (${event.type}) with ${handlers.length} handler(s)`);

      // Execute each handler
      for (const handlerInfo of handlers) {
        // Check if handler is active
        const subResult = await client.query(
          'SELECT is_active FROM event_subscriptions WHERE id = $1',
          [handlerInfo.subscriptionId]
        );

        if (subResult.rows.length === 0 || !subResult.rows[0].is_active) {
          console.log(`[EventBus] Handler ${handlerInfo.name} is disabled, skipping`);
          continue;
        }

        try {
          // Execute handler with timeout (30 seconds)
          await Promise.race([
            handlerInfo.handler(event),
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error('Handler timeout')), 30000)
            )
          ]);

          // Mark event as processed for this handler
          await client.query(
            'SELECT mark_event_processed($1, $2)',
            [eventId, handlerInfo.subscriptionId]
          );

          console.log(`[EventBus] Handler ${handlerInfo.name} processed event ${eventId} successfully`);
        } catch (error: unknown) {
          console.error(`[EventBus] Handler ${handlerInfo.name} failed for event ${eventId}:`, error);

          // Mark event as failed for this handler
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await client.query(
            'SELECT mark_event_failed($1, $2, $3)',
            [eventId, errorMessage, handlerInfo.subscriptionId]
          );
        }
      }
    } catch (error) {
      console.error(`[EventBus] Error handling event ${eventId}:`, error);
    } finally {
      client.release();
    }
  }

  /**
   * Get the handler registry (for testing and introspection)
   */
  getRegistry(): HandlerRegistry {
    return this.registry;
  }

  /**
   * Get the connection pool (for handler registration)
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Check if Event Bus is currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

/**
 * Get or create the EventBus singleton instance
 *
 * @returns The global EventBus instance
 */
export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    const pool = new Pool({
      connectionString: process.env.SUPABASE_DB_URL,
      max: 20
    });
    eventBusInstance = new EventBus(pool);
  }
  return eventBusInstance;
}
