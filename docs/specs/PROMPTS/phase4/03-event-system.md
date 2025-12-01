# PROMPT: EVENT-SYSTEM (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill.

Implement the Event System for InTime v3 (complementary to Activity System).

## Read First:
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md
- src/lib/db/schema/workplan.ts (events table)

## Core Concept:
Events = System-recorded actions. Every significant action in the system generates an event.
Events trigger auto-activities and notifications.

## Create Event System (src/lib/events/):

### 1. Event Bus (src/lib/events/EventBus.ts)

```typescript
class EventBus {
  private handlers: Map<string, EventHandler[]>;
  private middlewares: EventMiddleware[];

  // Emit an event
  async emit<T extends EventType>(
    type: T,
    data: EventDataMap[T],
    context: EventContext
  ): Promise<Event>;

  // Register event handler
  on<T extends EventType>(
    type: T | RegExp,
    handler: EventHandler<T>
  ): () => void;

  // Register middleware (runs on all events)
  use(middleware: EventMiddleware): void;

  // Get event history for entity
  getHistory(entityType: string, entityId: string): Promise<Event[]>;

  // Replay events (for debugging/recovery)
  replay(eventIds: string[]): Promise<void>;
}
```

### 2. Event Emitter (src/lib/events/EventEmitter.ts)

Helper for emitting events with proper context:

```typescript
class EventEmitter {
  constructor(private bus: EventBus, private ctx: Context) {}

  // Emit entity lifecycle events
  async entityCreated<T>(entityType: string, entity: T): Promise<Event>;
  async entityUpdated<T>(entityType: string, entity: T, changes: Partial<T>): Promise<Event>;
  async entityDeleted(entityType: string, entityId: string): Promise<Event>;

  // Emit workflow events
  async statusChanged(entityType: string, entityId: string, from: string, to: string): Promise<Event>;
  async stageChanged(entityType: string, entityId: string, from: string, to: string): Promise<Event>;

  // Emit user action events
  async userAction(action: string, entityType: string, entityId: string, details?: any): Promise<Event>;

  // Emit with correlation (for related events)
  async withCorrelation(correlationId: string): EventEmitter;
}
```

### 3. Event Handlers (src/lib/events/handlers/):

#### ActivityCreationHandler.ts
```typescript
// Listens for events and creates activities via AutoActivityEngine
export const activityCreationHandler: EventHandler = async (event) => {
  const activities = await autoActivityEngine.processEvent(event);
  return { activitiesCreated: activities.length };
};
```

#### NotificationHandler.ts
```typescript
// Sends notifications based on event subscriptions
export const notificationHandler: EventHandler = async (event) => {
  const subscriptions = await getMatchingSubscriptions(event.type);
  for (const sub of subscriptions) {
    await queueNotification(sub, event);
  }
};
```

#### AuditHandler.ts
```typescript
// Creates audit log entries for events
export const auditHandler: EventHandler = async (event) => {
  if (event.category === 'entity_lifecycle') {
    await createAuditLog(event);
  }
};
```

#### WebhookHandler.ts
```typescript
// Triggers external webhooks for events
export const webhookHandler: EventHandler = async (event) => {
  const webhooks = await getActiveWebhooks(event.type);
  for (const webhook of webhooks) {
    await queueWebhookDelivery(webhook, event);
  }
};
```

### 4. Event Types (src/lib/events/types.ts)

```typescript
// Event categories
type EventCategory =
  | 'entity_lifecycle'
  | 'workflow'
  | 'user_action'
  | 'system'
  | 'integration'
  | 'communication';

// Severity levels
type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

// Base event structure
interface Event {
  id: string;
  type: string;
  category: EventCategory;
  severity: EventSeverity;
  entityType: string;
  entityId: string;
  actorType: 'user' | 'system' | 'integration';
  actorId: string;
  eventData: Record<string, any>;
  relatedEntities: RelatedEntity[];
  correlationId: string | null;
  parentEventId: string | null;
  occurredAt: Date;
  orgId: string;
}

interface RelatedEntity {
  type: string;
  id: string;
  role: string; // e.g., 'target', 'source', 'reference'
}

interface EventContext {
  userId?: string;
  orgId: string;
  correlationId?: string;
  source?: string;
}

// Event data map (type-safe event payloads)
interface EventDataMap {
  'submission.created': { submissionId: string; candidateId: string; jobId: string };
  'submission.status_changed': { from: string; to: string; reason?: string };
  'interview.scheduled': { interviewId: string; scheduledAt: Date; type: string };
  'offer.sent': { offerId: string; expiresAt: Date };
  'placement.started': { placementId: string; startDate: Date };
  // ... all 268 event types from catalog
}
```

### 5. Event Subscription Service (src/lib/events/SubscriptionService.ts)

```typescript
class SubscriptionService {
  // Create subscription
  async subscribe(userId: string, pattern: string, channel: NotificationChannel): Promise<Subscription>;

  // Remove subscription
  async unsubscribe(subscriptionId: string): Promise<void>;

  // Get user subscriptions
  async getUserSubscriptions(userId: string): Promise<Subscription[]>;

  // Match event to subscriptions
  async getMatchingSubscriptions(eventType: string): Promise<Subscription[]>;

  // Default subscriptions by role
  async applyDefaultSubscriptions(userId: string, role: string): Promise<void>;
}
```

### 6. Event Delivery Service (src/lib/events/DeliveryService.ts)

```typescript
class DeliveryService {
  // Queue notification for delivery
  async queueNotification(subscription: Subscription, event: Event): Promise<void>;

  // Send email notification
  async sendEmail(to: string, event: Event, template: string): Promise<void>;

  // Send push notification
  async sendPush(userId: string, event: Event): Promise<void>;

  // Send SMS
  async sendSMS(phone: string, event: Event): Promise<void>;

  // Deliver webhook
  async deliverWebhook(url: string, event: Event): Promise<WebhookResponse>;

  // Retry failed deliveries
  async retryFailed(): Promise<void>;
}
```

### 7. Event Query Service (src/lib/events/QueryService.ts)

```typescript
class EventQueryService {
  // Get events for entity
  async getForEntity(entityType: string, entityId: string, filters?: EventFilters): Promise<Event[]>;

  // Get events by type
  async getByType(type: string, filters?: EventFilters): Promise<Event[]>;

  // Get events by correlation
  async getByCorrelation(correlationId: string): Promise<Event[]>;

  // Get timeline (mixed activities + events)
  async getTimeline(entityType: string, entityId: string): Promise<TimelineItem[]>;

  // Search events
  async search(query: string, filters?: EventFilters): Promise<Event[]>;
}
```

### 8. Event Integration Points:

```typescript
// In tRPC router mutations, emit events
export const submissionRouter = router({
  create: protectedProcedure
    .input(createSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const submission = await db.insert(submissions).values(input);

      // Emit event
      await ctx.events.entityCreated('submission', submission);

      return submission;
    }),

  updateStatus: protectedProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status, reason } = input;
      const old = await getSubmission(id);
      const updated = await updateSubmission(id, { status });

      // Emit status change event
      await ctx.events.statusChanged('submission', id, old.status, status);

      return updated;
    }),
});
```

### 9. Event Hooks (src/hooks/events/):

```typescript
// useEvents.ts - Subscribe to real-time events
export function useEvents(entityType: string, entityId: string);

// useEventHistory.ts - Get event history
export function useEventHistory(entityType: string, entityId: string);

// useTimeline.ts - Combined timeline
export function useTimeline(entityType: string, entityId: string);
```

## Event Types to Seed:

Categories from 03-EVENT-TYPE-CATALOG.md:
- Entity Lifecycle (*.created, *.updated, *.deleted)
- Workflow (*.status_changed, *.stage_changed)
- User Actions (*.viewed, *.exported, *.shared)
- System (*.scheduled, *.expired, *.reminder)
- Integration (*.synced, *.import_completed)
- Communication (*.email_sent, *.call_logged)

## Middleware Stack:

```typescript
const eventBus = new EventBus();

// 1. Validation middleware
eventBus.use(validateEventMiddleware);

// 2. Persistence middleware (save to DB)
eventBus.use(persistEventMiddleware);

// 3. Activity creation
eventBus.use(activityCreationMiddleware);

// 4. Notifications
eventBus.use(notificationMiddleware);

// 5. Audit logging
eventBus.use(auditMiddleware);

// 6. Webhooks
eventBus.use(webhookMiddleware);
```

## Requirements:
- Async event processing (non-blocking)
- Event persistence before handlers
- Retry logic for failed handlers
- Dead letter queue for unprocessable events
- Event correlation for tracking related events
- Real-time event streaming (consider WebSockets)

## After Implementation:
- Seed event type definitions
- Configure default subscriptions
- Set up webhook endpoints
- Test event → activity flow
