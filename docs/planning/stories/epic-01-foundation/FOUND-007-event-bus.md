# FOUND-007: Build Event Bus Using PostgreSQL LISTEN/NOTIFY

**Story Points:** 8
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** CRITICAL

---

## User Story

As a **System Architect**,
I want **an event-driven integration system using PostgreSQL LISTEN/NOTIFY**,
So that **modules can communicate asynchronously without tight coupling**.

---

## Acceptance Criteria

- [ ] Event bus implemented using PostgreSQL LISTEN/NOTIFY
- [ ] Events persisted in `events` table before publishing
- [ ] Guaranteed delivery (events retried if handler fails)
- [ ] Event types defined for all cross-module interactions
- [ ] Publisher function publishes events to database + notifies listeners
- [ ] Subscriber registration system tracks active listeners
- [ ] Dead letter queue for failed events (after 3 retries)
- [ ] Performance: < 50ms from publish to handler execution

---

## Technical Implementation

### Database Schema

Create file: `supabase/migrations/007_create_event_bus.sql`

```sql
-- Events table (persistent event log)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'dead_letter'
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES user_profiles(id),

  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'processed', 'failed', 'dead_letter')
  )
);

-- Indexes
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_published_at ON events(published_at DESC);
CREATE INDEX idx_events_pending ON events(status) WHERE status = 'pending';

-- Event subscriptions registry
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  handler_name TEXT NOT NULL,
  handler_function TEXT NOT NULL, -- PostgreSQL function name
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_subscription UNIQUE (event_type, handler_name)
);

-- Function: Publish event
CREATE OR REPLACE FUNCTION publish_event(
  p_event_type TEXT,
  p_payload JSONB,
  p_metadata JSONB DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Insert event into events table
  INSERT INTO events (type, payload, metadata, created_by)
  VALUES (p_event_type, p_payload, p_metadata, p_created_by)
  RETURNING id INTO v_event_id;

  -- Notify listeners via PostgreSQL NOTIFY
  PERFORM pg_notify(
    'events',
    json_build_object(
      'id', v_event_id,
      'type', p_event_type,
      'payload', p_payload,
      'metadata', p_metadata,
      'published_at', NOW()
    )::text
  );

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark event as processed
CREATE OR REPLACE FUNCTION mark_event_processed(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark event as failed
CREATE OR REPLACE FUNCTION mark_event_failed(
  p_event_id UUID,
  p_error_message TEXT
)
RETURNS VOID AS $$
DECLARE
  v_retry_count INTEGER;
BEGIN
  -- Get current retry count
  SELECT retry_count INTO v_retry_count
  FROM events
  WHERE id = p_event_id;

  -- Move to dead letter queue after 3 failures
  IF v_retry_count >= 2 THEN
    UPDATE events
    SET status = 'dead_letter',
        error_message = p_error_message,
        retry_count = v_retry_count + 1
    WHERE id = p_event_id;
  ELSE
    -- Increment retry count and mark as failed
    UPDATE events
    SET status = 'failed',
        error_message = p_error_message,
        retry_count = v_retry_count + 1
    WHERE id = p_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Replay failed events
CREATE OR REPLACE FUNCTION replay_failed_events()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Reset failed events to pending for retry
  UPDATE events
  SET status = 'pending',
      error_message = NULL
  WHERE status = 'failed'
    AND retry_count < 3;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Republish via NOTIFY
  PERFORM pg_notify(
    'events',
    json_build_object(
      'id', id,
      'type', type,
      'payload', payload,
      'published_at', NOW()
    )::text
  )
  FROM events
  WHERE status = 'pending' AND retry_count > 0;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed: Register core event types
INSERT INTO event_subscriptions (event_type, handler_name, handler_function) VALUES
  ('user.created', 'send_welcome_email', 'handle_user_created'),
  ('user.onboarding_completed', 'notify_team', 'handle_onboarding_completed'),
  ('course.graduated', 'create_candidate_profile', 'handle_course_graduated'),
  ('candidate.placed', 'update_pod_metrics', 'handle_candidate_placed'),
  ('job.created', 'notify_matching_candidates', 'handle_job_created');
```

### Event Bus Service (TypeScript)

Create file: `src/lib/events/event-bus.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface Event<T = any> {
  id: string;
  type: string;
  payload: T;
  metadata?: Record<string, any>;
  published_at: string;
}

export type EventHandler<T = any> = (event: Event<T>) => Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private isListening: boolean = false;

  /**
   * Publish event to database + notify listeners
   */
  async publish<T = any>(
    eventType: string,
    payload: T,
    metadata?: Record<string, any>,
    createdBy?: string
  ): Promise<string> {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc('publish_event', {
      p_event_type: eventType,
      p_payload: payload as any,
      p_metadata: metadata,
      p_created_by: createdBy
    });

    if (error) {
      throw new Error(`Failed to publish event: ${error.message}`);
    }

    return data as string;
  }

  /**
   * Subscribe to event type with handler function
   */
  subscribe<T = any>(eventType: string, handler: EventHandler<T>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler as EventHandler);

    // Start listening if not already
    if (!this.isListening) {
      this.startListening();
    }
  }

  /**
   * Start listening to PostgreSQL NOTIFY channel
   */
  private async startListening() {
    this.isListening = true;
    const supabase = createAdminClient();

    // Subscribe to 'events' channel
    const channel = supabase
      .channel('events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        async (payload) => {
          await this.handleEvent(payload.new as Event);
        }
      )
      .subscribe();

    console.log('Event bus listening...');
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(event: Event) {
    const handlers = this.handlers.get(event.type) || [];

    if (handlers.length === 0) {
      console.warn(`No handlers registered for event type: ${event.type}`);
      return;
    }

    // Execute all handlers for this event type
    for (const handler of handlers) {
      try {
        await handler(event);

        // Mark event as processed
        await this.markEventProcessed(event.id);
      } catch (error) {
        console.error(`Handler failed for event ${event.id}:`, error);

        // Mark event as failed
        await this.markEventFailed(
          event.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * Mark event as processed
   */
  private async markEventProcessed(eventId: string) {
    const supabase = createAdminClient();

    await supabase.rpc('mark_event_processed', {
      p_event_id: eventId
    });
  }

  /**
   * Mark event as failed
   */
  private async markEventFailed(eventId: string, errorMessage: string) {
    const supabase = createAdminClient();

    await supabase.rpc('mark_event_failed', {
      p_event_id: eventId,
      p_error_message: errorMessage
    });
  }

  /**
   * Replay failed events (manual retry)
   */
  async replayFailedEvents(): Promise<number> {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc('replay_failed_events');

    if (error) {
      throw new Error(`Failed to replay events: ${error.message}`);
    }

    return data as number;
  }

  /**
   * Get events by type
   */
  async getEvents(
    eventType?: string,
    status?: string,
    limit: number = 100
  ): Promise<Event[]> {
    const supabase = createAdminClient();

    let query = supabase
      .from('events')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('type', eventType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data as Event[];
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

### Event Type Definitions

Create file: `src/lib/events/event-types.ts`

```typescript
// User events
export interface UserCreatedEvent {
  user_id: string;
  email: string;
  created_at: string;
}

export interface UserOnboardingCompletedEvent {
  user_id: string;
  role: string;
  timestamp: string;
}

// Course events
export interface CourseGraduatedEvent {
  user_id: string;
  course_id: string;
  completion_date: string;
  final_score: number;
}

// Candidate events
export interface CandidatePlacedEvent {
  candidate_id: string;
  job_id: string;
  client_id: string;
  placement_date: string;
  placement_fee: number;
}

// Job events
export interface JobCreatedEvent {
  job_id: string;
  client_id: string;
  title: string;
  required_skills: string[];
}

// Export type map for type safety
export type EventTypeMap = {
  'user.created': UserCreatedEvent;
  'user.onboarding_completed': UserOnboardingCompletedEvent;
  'course.graduated': CourseGraduatedEvent;
  'candidate.placed': CandidatePlacedEvent;
  'job.created': JobCreatedEvent;
};
```

### Event Handlers Example

Create file: `src/lib/events/handlers/user-handlers.ts`

```typescript
import { eventBus, type Event } from '../event-bus';
import type { UserCreatedEvent, UserOnboardingCompletedEvent } from '../event-types';
import { sendWelcomeEmail } from '@/lib/email';

// Handler: Send welcome email when user created
eventBus.subscribe<UserCreatedEvent>('user.created', async (event) => {
  console.log('Handling user.created event:', event.id);

  await sendWelcomeEmail({
    to: event.payload.email,
    userId: event.payload.user_id
  });

  console.log('Welcome email sent to:', event.payload.email);
});

// Handler: Notify team when onboarding completed
eventBus.subscribe<UserOnboardingCompletedEvent>(
  'user.onboarding_completed',
  async (event) => {
    console.log('Handling user.onboarding_completed event:', event.id);

    // Logic to notify appropriate team based on role
    const role = event.payload.role;

    if (role === 'student') {
      // Notify Training Academy team
      console.log('New student onboarded:', event.payload.user_id);
    } else if (role === 'candidate') {
      // Notify Recruiting team
      console.log('New candidate onboarded:', event.payload.user_id);
    }
  }
);
```

---

## Dependencies

- **Requires:** FOUND-001 (database), FOUND-002 (roles for created_by tracking)
- **Blocks:** All cross-module integrations

---

## Testing Checklist

### Happy Path
- [ ] Event published successfully via `publish_event()`
- [ ] Event persisted in `events` table
- [ ] PostgreSQL NOTIFY triggers
- [ ] Registered handlers execute
- [ ] Event marked as 'processed' after successful handling

### Error Handling
- [ ] Failed handler marks event as 'failed'
- [ ] Event retried after failure (up to 3 times)
- [ ] Event moved to dead letter queue after 3 failures
- [ ] Dead letter events queryable for manual review

### Performance
- [ ] Publish + notify completes in < 50ms
- [ ] Handler execution measured and logged
- [ ] No memory leaks with long-running listeners

### Replay
- [ ] Failed events can be replayed manually
- [ ] Replay skips dead letter events
- [ ] Replay republishes via NOTIFY

---

## Verification Commands

```sql
-- Test: Publish an event
SELECT publish_event(
  'user.created',
  '{"user_id": "test-123", "email": "test@example.com"}'::jsonb,
  '{"source": "test"}'::jsonb
);

-- Verify event persisted
SELECT * FROM events ORDER BY published_at DESC LIMIT 5;

-- Test: Mark event as processed
SELECT mark_event_processed('event-id-here');

-- Verify status updated
SELECT status, processed_at FROM events WHERE id = 'event-id-here';

-- Test: Mark event as failed (3 times)
SELECT mark_event_failed('event-id-here', 'Test error');
SELECT mark_event_failed('event-id-here', 'Test error');
SELECT mark_event_failed('event-id-here', 'Test error');

-- Verify moved to dead letter queue
SELECT status, retry_count FROM events WHERE id = 'event-id-here';
-- Expected: status = 'dead_letter', retry_count = 3

-- Test: Replay failed events
SELECT replay_failed_events();
```

---

## Documentation Updates

- [ ] Create `/docs/architecture/EVENT-BUS-DESIGN.md`
- [ ] Document event naming conventions (noun.verb format)
- [ ] Add guide for creating new event handlers
- [ ] Document dead letter queue monitoring process

---

## Related Stories

- **Depends on:** FOUND-001 (database)
- **Leads to:** FOUND-008 (event subscriptions), all cross-module features

---

## Notes

- PostgreSQL LISTEN/NOTIFY chosen for simplicity (no external message broker)
- Events persisted before publishing (guaranteed delivery)
- Dead letter queue prevents infinite retry loops
- Consider migration to RabbitMQ/Kafka if event volume > 10K/day

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
