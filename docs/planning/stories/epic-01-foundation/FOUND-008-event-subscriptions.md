# FOUND-008: Create Event Subscription System

**Story Points:** 5
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** HIGH

---

## User Story

As a **Module Developer**,
I want **a declarative way to subscribe to events from other modules**,
So that **I can integrate without knowing implementation details of other modules**.

---

## Acceptance Criteria

- [ ] Decorator-based subscription registration (`@EventHandler` decorator)
- [ ] Auto-discovery of event handlers at application startup
- [ ] Subscription registry tracks active handlers and their status
- [ ] Handler health monitoring (failures tracked, auto-disable after threshold)
- [ ] Admin UI to view/enable/disable subscriptions
- [ ] TypeScript types ensure type-safe event payloads
- [ ] Dead letter queue viewer for failed events

---

## Technical Implementation

### Handler Registry Service

Create file: `src/lib/events/handler-registry.ts`

```typescript
import { eventBus, type EventHandler, type Event } from './event-bus';
import { createAdminClient } from '@/lib/supabase/admin';

interface HandlerMetadata {
  eventType: string;
  handlerName: string;
  handler: EventHandler;
  isActive: boolean;
  failureCount: number;
  lastFailure?: Date;
}

class HandlerRegistry {
  private handlers: Map<string, HandlerMetadata> = new Map();
  private readonly MAX_FAILURES = 5;
  private readonly FAILURE_WINDOW_MS = 60000; // 1 minute

  /**
   * Register event handler
   */
  register(
    eventType: string,
    handlerName: string,
    handler: EventHandler,
    isActive: boolean = true
  ) {
    const key = `${eventType}:${handlerName}`;

    // Check if handler already registered
    if (this.handlers.has(key)) {
      console.warn(`Handler ${key} already registered, skipping`);
      return;
    }

    // Create metadata
    const metadata: HandlerMetadata = {
      eventType,
      handlerName,
      handler,
      isActive,
      failureCount: 0
    };

    this.handlers.set(key, metadata);

    // Subscribe to event bus with wrapper that tracks health
    eventBus.subscribe(eventType, async (event: Event) => {
      await this.executeHandler(key, event);
    });

    console.log(`Registered handler: ${key}`);
  }

  /**
   * Execute handler with health monitoring
   */
  private async executeHandler(key: string, event: Event) {
    const metadata = this.handlers.get(key);

    if (!metadata) {
      console.error(`Handler ${key} not found in registry`);
      return;
    }

    // Skip if handler disabled
    if (!metadata.isActive) {
      console.log(`Handler ${key} is disabled, skipping event ${event.id}`);
      return;
    }

    try {
      await metadata.handler(event);

      // Reset failure count on success
      metadata.failureCount = 0;
      metadata.lastFailure = undefined;

      console.log(`Handler ${key} executed successfully for event ${event.id}`);
    } catch (error) {
      console.error(`Handler ${key} failed for event ${event.id}:`, error);

      // Increment failure count
      metadata.failureCount++;
      metadata.lastFailure = new Date();

      // Auto-disable handler if too many failures
      if (metadata.failureCount >= this.MAX_FAILURES) {
        metadata.isActive = false;
        console.error(
          `Handler ${key} auto-disabled after ${this.MAX_FAILURES} failures`
        );

        // Persist to database
        await this.updateHandlerStatus(
          metadata.eventType,
          metadata.handlerName,
          false
        );
      }

      // Re-throw to trigger event bus retry logic
      throw error;
    }
  }

  /**
   * Enable/disable handler
   */
  async setHandlerStatus(
    eventType: string,
    handlerName: string,
    isActive: boolean
  ) {
    const key = `${eventType}:${handlerName}`;
    const metadata = this.handlers.get(key);

    if (!metadata) {
      throw new Error(`Handler ${key} not found`);
    }

    metadata.isActive = isActive;
    metadata.failureCount = 0;
    metadata.lastFailure = undefined;

    // Persist to database
    await this.updateHandlerStatus(eventType, handlerName, isActive);

    console.log(`Handler ${key} ${isActive ? 'enabled' : 'disabled'}`);
  }

  /**
   * Update handler status in database
   */
  private async updateHandlerStatus(
    eventType: string,
    handlerName: string,
    isActive: boolean
  ) {
    const supabase = createAdminClient();

    await supabase
      .from('event_subscriptions')
      .update({ is_active: isActive })
      .eq('event_type', eventType)
      .eq('handler_name', handlerName);
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): HandlerMetadata[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get handlers for specific event type
   */
  getHandlersByEventType(eventType: string): HandlerMetadata[] {
    return this.getHandlers().filter(h => h.eventType === eventType);
  }

  /**
   * Get handler health status
   */
  getHandlerHealth() {
    return this.getHandlers().map(h => ({
      eventType: h.eventType,
      handlerName: h.handlerName,
      isActive: h.isActive,
      failureCount: h.failureCount,
      lastFailure: h.lastFailure,
      status: h.isActive
        ? h.failureCount === 0
          ? 'healthy'
          : 'degraded'
        : 'disabled'
    }));
  }
}

// Singleton instance
export const handlerRegistry = new HandlerRegistry();
```

### Decorator for Handler Registration

Create file: `src/lib/events/decorators.ts`

```typescript
import { handlerRegistry } from './handler-registry';
import type { EventHandler } from './event-bus';

/**
 * Decorator for event handler registration
 *
 * Usage:
 * @EventHandler('user.created', 'send_welcome_email')
 * async function handleUserCreated(event: Event<UserCreatedEvent>) {
 *   // handler logic
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
    handlerRegistry.register(
      eventType,
      handlerName,
      originalMethod as EventHandler,
      true
    );

    return descriptor;
  };
}
```

### Handler Auto-Discovery

Create file: `src/lib/events/handlers/index.ts`

```typescript
/**
 * Auto-discovery of event handlers
 *
 * Import all handler modules here to register them
 */

// User handlers
import './user-handlers';

// Course handlers
import './course-handlers';

// Candidate handlers
import './candidate-handlers';

// Job handlers
import './job-handlers';

console.log('All event handlers registered');
```

### Example Handler Using Decorator

Create file: `src/lib/events/handlers/course-handlers.ts`

```typescript
import { type Event } from '../event-bus';
import { EventHandler } from '../decorators';
import type { CourseGraduatedEvent } from '../event-types';
import { grantRole } from '@/lib/rbac';

/**
 * Handler: When student graduates, create candidate profile
 */
@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(
  event: Event<CourseGraduatedEvent>
) {
  console.log('Student graduated, creating candidate profile:', event.payload);

  const { user_id, final_score } = event.payload;

  // Grant 'candidate' role
  await grantRole(user_id, 'candidate');

  // Update user profile
  const supabase = createAdminClient();

  await supabase
    .from('user_profiles')
    .update({
      candidate_status: 'active',
      candidate_skills: ['Guidewire PolicyCenter', 'Gosu', 'Java'] // From course
    })
    .eq('id', user_id);

  console.log('Candidate profile created for user:', user_id);
}
```

### Admin API for Handler Management

Create file: `src/app/api/admin/event-handlers/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { handlerRegistry } from '@/lib/events/handler-registry';
import { requireAuth } from '@/lib/auth/server';
import { checkPermission } from '@/lib/rbac';

export async function GET() {
  const session = await requireAuth();

  // Check admin permission
  const isAdmin = await checkPermission(session.user.id, 'system', 'admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const health = handlerRegistry.getHandlerHealth();

  return NextResponse.json({ handlers: health });
}

export async function PATCH(request: Request) {
  const session = await requireAuth();

  // Check admin permission
  const isAdmin = await checkPermission(session.user.id, 'system', 'admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { eventType, handlerName, isActive } = await request.json();

  try {
    await handlerRegistry.setHandlerStatus(eventType, handlerName, isActive);

    return NextResponse.json({
      success: true,
      message: `Handler ${isActive ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Admin UI Component

Create file: `src/app/admin/event-handlers/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HandlerHealth {
  eventType: string;
  handlerName: string;
  isActive: boolean;
  failureCount: number;
  lastFailure?: string;
  status: 'healthy' | 'degraded' | 'disabled';
}

export default function EventHandlersPage() {
  const [handlers, setHandlers] = useState<HandlerHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandlers();
  }, []);

  const fetchHandlers = async () => {
    const res = await fetch('/api/admin/event-handlers');
    const data = await res.json();
    setHandlers(data.handlers);
    setLoading(false);
  };

  const toggleHandler = async (eventType: string, handlerName: string, currentStatus: boolean) => {
    await fetch('/api/admin/event-handlers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        handlerName,
        isActive: !currentStatus
      })
    });

    fetchHandlers(); // Refresh
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Event Handlers</h1>

      <div className="space-y-4">
        {handlers.map((handler) => (
          <div
            key={`${handler.eventType}:${handler.handlerName}`}
            className="border rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{handler.handlerName}</h3>
                  <Badge
                    variant={
                      handler.status === 'healthy'
                        ? 'success'
                        : handler.status === 'degraded'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {handler.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{handler.eventType}</p>
              </div>

              <div className="flex items-center gap-4">
                {handler.failureCount > 0 && (
                  <div className="text-sm text-red-600">
                    {handler.failureCount} failures
                  </div>
                )}

                <Button
                  variant={handler.isActive ? 'destructive' : 'default'}
                  onClick={() =>
                    toggleHandler(handler.eventType, handler.handlerName, handler.isActive)
                  }
                >
                  {handler.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            {handler.lastFailure && (
              <p className="mt-2 text-xs text-gray-500">
                Last failure: {new Date(handler.lastFailure).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Dependencies

- **Requires:** FOUND-007 (event bus)
- **Leads to:** All module integrations

---

## Testing Checklist

- [ ] Handlers registered via decorator
- [ ] Handler auto-discovery works at startup
- [ ] Failed handler tracked in failure count
- [ ] Handler auto-disabled after 5 failures
- [ ] Admin can manually enable/disable handlers
- [ ] Handler health status visible in admin UI
- [ ] Disabled handler skips events

---

## Documentation Updates

- [ ] Document decorator usage pattern
- [ ] Add guide for creating new event handlers
- [ ] Document handler health monitoring
- [ ] Add troubleshooting guide for handler failures

---

## Related Stories

- **Depends on:** FOUND-007 (event bus)
- **Leads to:** Cross-module integration stories

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
