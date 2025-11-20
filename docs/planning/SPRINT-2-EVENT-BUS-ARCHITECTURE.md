# Sprint 2: Event Bus Architecture

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document defines the Event Bus architecture for InTime v3, enabling event-driven communication between modules. The Event Bus uses **PostgreSQL LISTEN/NOTIFY** for real-time event propagation with guaranteed delivery via persistent storage.

### Key Features

1. **Publish-Subscribe Pattern** - Modules publish events, subscribers react asynchronously
2. **Guaranteed Delivery** - Events persisted to database before NOTIFY
3. **Automatic Retries** - Failed handlers retry with exponential backoff (3 attempts)
4. **Dead Letter Queue** - Failed events moved to DLQ after exhausting retries
5. **Health Monitoring** - Auto-disable handlers after 5 consecutive failures
6. **Multi-Tenancy** - Org isolation enforced at database level
7. **Replay Capability** - Admin can replay failed events for debugging/recovery

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EVENT BUS ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                      ┌──────────────┐
│   Module A   │                                      │   Module B   │
│ (Publisher)  │                                      │ (Subscriber) │
└──────┬───────┘                                      └───────▲──────┘
       │                                                      │
       │ 1. publish()                              5. Handler executes
       │                                                      │
       ▼                                                      │
┌─────────────────────────────────────────────────────────────────────┐
│                        EVENT BUS (TypeScript)                       │
│  ┌────────────────────┐                  ┌────────────────────┐    │
│  │  EventBus class    │                  │  HandlerRegistry   │    │
│  │  - publish()       │◄────────────────►│  - register()      │    │
│  │  - subscribe()     │                  │  - executeHandler()│    │
│  │  - listen()        │                  │  - healthCheck()   │    │
│  └────────┬───────────┘                  └────────▲───────────┘    │
│           │                                       │                 │
│           │ 2. Persist event                      │ 4. Invoke       │
│           ▼                                       │    handler      │
└───────────┼───────────────────────────────────────┼─────────────────┘
            │                                       │
            │                                       │
┌───────────▼───────────────────────────────────────┼─────────────────┐
│                  PostgreSQL DATABASE               │                 │
│  ┌──────────────────────────────────────────┐     │                 │
│  │         publish_event() function          │     │                 │
│  │  1. INSERT INTO events                    │     │                 │
│  │  2. PERFORM pg_notify('category', json)   │     │                 │
│  └────────────────┬─────────────────────────┘     │                 │
│                   │                                │                 │
│                   │ 3. NOTIFY 'user'               │                 │
│                   │    payload: {event_id, type}   │                 │
│                   │                                │                 │
│                   └───────────────────────────────►│                 │
│                     PostgreSQL LISTEN/NOTIFY       │                 │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │   events   │  │ event_sub-   │  │  event_delivery_log       │  │
│  │   table    │  │ scriptions   │  │  (delivery attempts)      │  │
│  └────────────┘  └──────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Event Flow

### 1. Event Publishing

```typescript
// Module A publishes event
await eventBus.publish('user.created', {
  userId: '123',
  email: 'john@example.com',
  orgId: 'org-456'
});
```

**Database Flow:**
```sql
-- Step 1: Insert event into events table
INSERT INTO events (
  event_type,
  event_category,  -- 'user'
  payload,
  org_id,
  user_id
) VALUES (...);

-- Step 2: Send NOTIFY to listeners
PERFORM pg_notify('user', json_build_object(
  'event_id', <uuid>,
  'event_type', 'user.created',
  'timestamp', NOW()
));

-- Also notify global channel
PERFORM pg_notify('events', <same_payload>);
```

---

### 2. Event Subscription

```typescript
// Module B registers handler
@EventHandler('user.created', 'send_welcome_email')
export async function handleUserCreated(event: Event<UserCreatedPayload>) {
  // Handler logic
  await sendWelcomeEmail(event.payload.email);

  // Event automatically marked as processed on success
}
```

**Registration at App Startup:**
```typescript
// src/lib/events/handlers/index.ts
export function registerAllHandlers(eventBus: EventBus) {
  // Import all handler modules (auto-discovery)
  import('./user-handlers');
  import('./course-handlers');
  import('./placement-handlers');

  // Handlers auto-register via @EventHandler decorator
}
```

---

### 3. Event Processing

**PostgreSQL LISTEN:**
```typescript
// EventBus listens to PostgreSQL notifications
class EventBus {
  async startListening() {
    await this.client.query('LISTEN user');
    await this.client.query('LISTEN academy');
    await this.client.query('LISTEN recruiting');
    await this.client.query('LISTEN events'); // Global channel

    this.client.on('notification', (msg) => {
      const payload = JSON.parse(msg.payload);
      this.handleEvent(payload.event_id);
    });
  }

  async handleEvent(eventId: string) {
    // 1. Fetch event from database
    const event = await this.getEvent(eventId);

    // 2. Find matching handlers
    const handlers = this.registry.getHandlers(event.event_type);

    // 3. Execute each handler
    for (const handler of handlers) {
      try {
        await handler.execute(event);
        await this.markEventProcessed(eventId, handler.id);
      } catch (error) {
        await this.markEventFailed(eventId, error.message, handler.id);
      }
    }
  }
}
```

---

### 4. Error Handling & Retries

**Automatic Retry Logic:**
```sql
-- mark_event_failed() function
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER := 3;
BEGIN
  SELECT retry_count INTO v_retry_count FROM events WHERE id = p_event_id;

  IF v_retry_count < v_max_retries THEN
    -- Exponential backoff: 2^retry_count minutes
    UPDATE events
    SET
      status = 'failed',
      retry_count = retry_count + 1,
      next_retry_at = NOW() + POWER(2, v_retry_count + 1) * INTERVAL '1 minute'
    WHERE id = p_event_id;
  ELSE
    -- Move to dead letter queue
    UPDATE events
    SET
      status = 'dead_letter',
      failed_at = NOW()
    WHERE id = p_event_id;
  END IF;
END;
```

**Retry Schedule:**
- 1st failure: Retry in 2 minutes
- 2nd failure: Retry in 4 minutes
- 3rd failure: Retry in 8 minutes
- 4th failure: Move to dead letter queue (no more retries)

---

### 5. Health Monitoring

**Auto-Disable Failing Handlers:**
```sql
-- Trigger on event_subscriptions
CREATE TRIGGER trigger_auto_disable_handler
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW
  WHEN (NEW.consecutive_failures >= 5)
  EXECUTE FUNCTION auto_disable_failing_handler();
```

**Handler Health Status:**
- `healthy` - No failures, working normally
- `healthy_with_errors` - Some failures, but < 3 consecutive
- `warning` - 3-4 consecutive failures
- `critical` - 5+ consecutive failures (auto-disabled)
- `disabled` - Manually disabled by admin

---

## TypeScript Implementation

### File Structure

```
src/lib/events/
├── EventBus.ts              # Main EventBus class
├── HandlerRegistry.ts       # Handler registration and execution
├── decorators.ts            # @EventHandler decorator
├── types.ts                 # Event type definitions
├── handlers/
│   ├── index.ts             # Auto-discover and register all handlers
│   ├── user-handlers.ts     # User-related event handlers
│   ├── course-handlers.ts   # Course-related event handlers
│   └── placement-handlers.ts # Placement-related event handlers
└── __tests__/
    ├── EventBus.test.ts
    └── HandlerRegistry.test.ts
```

---

### EventBus Class

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/EventBus.ts`

```typescript
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
      return eventId;
    } finally {
      client.release();
    }
  }

  /**
   * Subscribe to event type with a handler
   *
   * @example
   * eventBus.subscribe('user.created', async (event) => {
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
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.warn('EventBus is already listening');
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
        console.error('Error handling notification:', error);
      }
    });

    this.isListening = true;
    console.log('EventBus started listening to PostgreSQL NOTIFY');
  }

  /**
   * Stop listening and cleanup
   */
  async stopListening(): Promise<void> {
    if (this.listenClient) {
      await this.listenClient.end();
      this.listenClient = null;
      this.isListening = false;
      console.log('EventBus stopped listening');
    }
  }

  /**
   * Handle an event by executing all registered handlers
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
        console.warn(`Event ${eventId} not found`);
        return;
      }

      const eventRow = result.rows[0];
      const event: Event<any> = {
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
        console.log(`No handlers registered for event type: ${event.type}`);
        return;
      }

      // Execute each handler
      for (const handlerInfo of handlers) {
        // Check if handler is active
        const subResult = await client.query(
          'SELECT is_active FROM event_subscriptions WHERE id = $1',
          [handlerInfo.subscriptionId]
        );

        if (subResult.rows.length === 0 || !subResult.rows[0].is_active) {
          console.log(`Handler ${handlerInfo.name} is disabled, skipping`);
          continue;
        }

        try {
          // Execute handler with timeout
          await Promise.race([
            handlerInfo.handler(event),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Handler timeout')), 30000)
            )
          ]);

          // Mark event as processed for this handler
          await client.query(
            'SELECT mark_event_processed($1, $2)',
            [eventId, handlerInfo.subscriptionId]
          );

          console.log(`Handler ${handlerInfo.name} processed event ${eventId} successfully`);
        } catch (error: any) {
          console.error(`Handler ${handlerInfo.name} failed for event ${eventId}:`, error);

          // Mark event as failed for this handler
          await client.query(
            'SELECT mark_event_failed($1, $2, $3)',
            [eventId, error.message, handlerInfo.subscriptionId]
          );
        }
      }
    } finally {
      client.release();
    }
  }

  /**
   * Get the handler registry (for testing)
   */
  getRegistry(): HandlerRegistry {
    return this.registry;
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

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
```

---

### HandlerRegistry Class

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/HandlerRegistry.ts`

```typescript
import type { Event, EventPayload } from './types';

interface HandlerInfo {
  name: string;
  handler: (event: Event<any>) => Promise<void>;
  subscriptionId: string | null; // Set after DB registration
  eventType: string;
  registeredAt: Date;
}

export class HandlerRegistry {
  private handlers: Map<string, HandlerInfo[]> = new Map();

  /**
   * Register an event handler
   */
  register<T extends EventPayload>(
    eventType: string,
    handlerName: string,
    handler: (event: Event<T>) => Promise<void>
  ): void {
    const handlerInfo: HandlerInfo = {
      name: handlerName,
      handler,
      subscriptionId: null,
      eventType,
      registeredAt: new Date()
    };

    const existing = this.handlers.get(eventType) || [];
    existing.push(handlerInfo);
    this.handlers.set(eventType, existing);

    console.log(`Registered handler: ${handlerName} for event type: ${eventType}`);
  }

  /**
   * Get all handlers for an event type
   */
  getHandlers(eventType: string): HandlerInfo[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Get all registered handlers (for admin UI)
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
   */
  async persistToDatabase(pool: any, orgId: string): Promise<void> {
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

      console.log('All handlers persisted to database');
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
}
```

---

### Event Handler Decorator

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/decorators.ts`

```typescript
import { getEventBus } from './EventBus';
import type { Event, EventPayload } from './types';

/**
 * Decorator for registering event handlers
 *
 * @example
 * @EventHandler('user.created', 'send_welcome_email')
 * export async function handleUserCreated(event: Event<UserCreatedPayload>) {
 *   await sendWelcomeEmail(event.payload.email);
 * }
 */
export function EventHandler(eventType: string, handlerName: string) {
  return function (
    target: any,
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
```

---

### Type Definitions

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/types.ts`

```typescript
/**
 * Base event structure
 */
export interface Event<T extends EventPayload> {
  id: string;
  type: string;
  category: string;
  payload: T;
  metadata: EventMetadata;
  userId?: string;
  orgId: string;
  createdAt: Date;
}

/**
 * Event payload (type-safe per event type)
 */
export type EventPayload = Record<string, any>;

/**
 * Event metadata (additional context)
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  source?: string;
  replayed?: boolean;
  replayedAt?: Date;
  [key: string]: any;
}

/**
 * Event types (expand as modules are built)
 */
export interface UserCreatedPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface CourseGraduatedPayload {
  studentId: string;
  courseId: string;
  courseName: string;
  completedAt: Date;
  grade: number;
}

export interface CandidatePlacedPayload {
  candidateId: string;
  jobId: string;
  clientId: string;
  startDate: Date;
  salary: number;
}

export interface JobCreatedPayload {
  jobId: string;
  title: string;
  clientId: string;
  requiredSkills: string[];
  experienceYears: { min: number; max: number };
}
```

---

## Event Handler Examples

### User Handlers

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/handlers/user-handlers.ts`

```typescript
import { EventHandler } from '../decorators';
import type { Event, UserCreatedPayload } from '../types';

/**
 * Send welcome email when user is created
 */
@EventHandler('user.created', 'send_welcome_email')
export async function handleUserCreated(event: Event<UserCreatedPayload>) {
  const { email, fullName } = event.payload;

  // Send email via Resend
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'InTime <noreply@intimeesolutions.com>',
      to: email,
      subject: 'Welcome to InTime!',
      html: `<p>Hi ${fullName},</p><p>Welcome to InTime!</p>`
    })
  });

  console.log(`Welcome email sent to ${email}`);
}

/**
 * Create audit log entry when user is created
 */
@EventHandler('user.created', 'audit_user_creation')
export async function auditUserCreation(event: Event<UserCreatedPayload>) {
  const { userId } = event.payload;

  // Audit log is already created by trigger, but we could add additional logging here
  console.log(`User ${userId} created, audit log recorded`);
}
```

---

### Course Handlers

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/events/handlers/course-handlers.ts`

```typescript
import { EventHandler } from '../decorators';
import type { Event, CourseGraduatedPayload } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * When student graduates, create candidate profile
 */
@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;
  const supabase = createClient();

  // Grant candidate role
  await supabase.rpc('grant_role_to_user', {
    p_user_id: studentId,
    p_role_name: 'candidate'
  });

  // Update user profile with candidate status
  await supabase
    .from('user_profiles')
    .update({
      candidate_status: 'bench',
      candidate_ready_for_placement: grade >= 80 // Only if grade is B or higher
    })
    .eq('id', studentId);

  console.log(`Student ${studentId} promoted to candidate after completing ${courseName}`);
}

/**
 * Notify recruiting team of new graduate
 */
@EventHandler('course.graduated', 'notify_recruiting_team')
export async function notifyRecruitingTeam(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;

  // In Sprint 2, just log. In future sprints, send Slack notification
  console.log(`New graduate available: Student ${studentId} completed ${courseName} with grade ${grade}`);

  // TODO: Send Slack notification to recruiting channel
}
```

---

## Performance Optimization

### Connection Pooling

```typescript
// Use connection pool, NOT new connection per event
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 20, // Maximum 20 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

**Why?**
- Creating new connection per event = 100ms+ latency
- Pool reuses connections = 1-2ms latency
- 20 connections enough for 100 events/second

---

### Batching Events

**Not Implemented in Sprint 2** (future optimization)

```typescript
// Future: Batch multiple events into single NOTIFY
class EventBus {
  private pendingEvents: Event[] = [];

  async publish(eventType: string, payload: any) {
    this.pendingEvents.push({ eventType, payload });

    // Flush every 100ms or 10 events
    if (this.pendingEvents.length >= 10) {
      await this.flush();
    }
  }

  private async flush() {
    // Batch insert all pending events
    await this.pool.query(
      'INSERT INTO events (...) SELECT * FROM unnest($1)',
      [this.pendingEvents]
    );

    this.pendingEvents = [];
  }
}
```

**Trade-off:** 100ms delay for 10x throughput improvement

---

### Caching Handler Registry

```typescript
// Handler registry built once at startup, NOT queried per event
class HandlerRegistry {
  private handlers: Map<string, HandlerInfo[]>;

  // O(1) lookup, not O(n) database query
  getHandlers(eventType: string): HandlerInfo[] {
    return this.handlers.get(eventType) || [];
  }
}
```

---

## Security Considerations

### Org Isolation

**Problem:** Event from Org A should NOT trigger handlers in Org B

**Solution:** RLS policies on `events` table
```sql
CREATE POLICY "Users can only access events in their org"
ON events FOR ALL
USING (org_id = auth_user_org_id() OR user_is_admin());
```

**Enforcement:**
- Service role (Event Bus) can read all events
- Handlers execute with user context (not service role)
- Supabase client in handlers respects RLS

---

### Handler Timeout

**Problem:** Malicious/buggy handler could block Event Bus

**Solution:** 30-second timeout per handler
```typescript
await Promise.race([
  handler(event),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Handler timeout')), 30000)
  )
]);
```

**After Timeout:**
- Handler marked as failed
- Event retried (exponential backoff)
- After 3 failures, moved to dead letter queue

---

### Idempotency

**Problem:** Event might be processed twice (network retry, crash recovery)

**Solution:** Handlers MUST be idempotent
```typescript
@EventHandler('user.created', 'send_welcome_email')
export async function handleUserCreated(event: Event<UserCreatedPayload>) {
  // Check if email already sent
  const alreadySent = await db.query(
    'SELECT 1 FROM email_log WHERE user_id = $1 AND type = $2',
    [event.payload.userId, 'welcome']
  );

  if (alreadySent.rows.length > 0) {
    console.log('Welcome email already sent, skipping');
    return; // Idempotent: safe to call multiple times
  }

  await sendEmail(...);

  // Record email sent
  await db.query(
    'INSERT INTO email_log (user_id, type) VALUES ($1, $2)',
    [event.payload.userId, 'welcome']
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// EventBus.test.ts
describe('EventBus', () => {
  let eventBus: EventBus;
  let mockPool: Pool;

  beforeEach(() => {
    mockPool = new Pool({ connectionString: 'mock' });
    eventBus = new EventBus(mockPool);
  });

  it('publishes event to database', async () => {
    const eventId = await eventBus.publish('user.created', {
      userId: '123',
      email: 'test@example.com'
    });

    expect(eventId).toBeDefined();
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('publish_event'),
      expect.arrayContaining(['user.created'])
    );
  });

  it('executes handler when event received', async () => {
    const mockHandler = vi.fn().mockResolvedValue(undefined);
    eventBus.subscribe('user.created', 'test_handler', mockHandler);

    await eventBus['handleEvent']('event-123');

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user.created' })
    );
  });
});
```

---

### Integration Tests

```typescript
// event-bus.integration.test.ts
describe('Event Bus Integration', () => {
  it('publishes event and handler executes', async () => {
    const handlerExecuted = vi.fn();

    eventBus.subscribe('test.event', 'test_handler', async (event) => {
      handlerExecuted(event.payload);
    });

    await eventBus.startListening();

    const eventId = await eventBus.publish('test.event', { data: 'test' });

    // Wait for NOTIFY to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handlerExecuted).toHaveBeenCalledWith({ data: 'test' });

    // Verify event marked as completed
    const result = await db.query('SELECT status FROM events WHERE id = $1', [eventId]);
    expect(result.rows[0].status).toBe('completed');
  });

  it('retries failed handler', async () => {
    let attempts = 0;

    eventBus.subscribe('test.event', 'failing_handler', async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Simulated failure');
      }
    });

    await eventBus.publish('test.event', { data: 'test' });

    // Wait for retries (2min + 4min + 8min = 14min in total)
    // In test, reduce retry delays for speed

    expect(attempts).toBe(3);
  });
});
```

---

## Deployment Checklist

**For Deployment Agent:**

1. Run Migration 008 first (creates functions and views)
2. Deploy EventBus code to server
3. Start EventBus listener: `await eventBus.startListening()`
4. Register all handlers: `await registerAllHandlers(eventBus)`
5. Verify handlers registered: `SELECT * FROM event_subscriptions;`
6. Test event publishing: `SELECT publish_event('test.event', NULL, '{}'::jsonb);`
7. Monitor event processing: `SELECT * FROM v_event_metrics_24h;`
8. Check dead letter queue: `SELECT * FROM v_dead_letter_queue;`

---

## Monitoring & Observability

### Metrics to Track

1. **Event Volume**
   - Events published per hour
   - Events processed per hour
   - Events in dead letter queue

2. **Latency**
   - Publish latency (target: < 50ms p95)
   - Handler execution time (target: < 500ms p95)
   - End-to-end latency (publish → processed)

3. **Error Rates**
   - Failed events per hour
   - Handler failure rate by type
   - Auto-disabled handlers count

4. **Health Status**
   - Active handlers count
   - Disabled handlers count
   - Handlers in critical/warning state

---

### Admin Dashboard Queries

```sql
-- Event metrics (last 24 hours)
SELECT * FROM v_event_metrics_24h;

-- Handler health
SELECT * FROM v_handler_health;

-- Dead letter queue
SELECT * FROM v_dead_letter_queue;

-- Recent events
SELECT * FROM v_events_recent LIMIT 50;
```

---

## Next Steps

1. **Developer Agent:** Implement EventBus, HandlerRegistry, decorators
2. **Developer Agent:** Create example handlers (user, course, placement)
3. **Developer Agent:** Write unit + integration tests
4. **QA Agent:** Test event publishing, retry logic, health monitoring
5. **Deployment Agent:** Deploy Event Bus and start listener

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Implementation Time:** 8-12 hours

---

**End of Event Bus Architecture Document**
