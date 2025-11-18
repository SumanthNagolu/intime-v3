# Event-Driven Integration Architecture

**Last Updated:** 2025-11-17
**Status:** Foundation for v3
**Purpose:** Enable cross-module communication without tight coupling

---

## Why Event-Driven?

### Legacy Project Problem

**What Happened:**
- Event bus implemented but **never used**
- Modules built in isolation
- All cross-module workflows were **manual**
- No automation between modules

**Example Failure:**

```typescript
// Student graduates from Academy (manual process)
await markStudentGraduated(userId);

// ❌ MANUAL step: Admin creates candidate profile in ATS
// ❌ MANUAL step: Admin generates resume PDF
// ❌ MANUAL step: Recruiter assigns to sales pod
// ❌ MANUAL step: Recruiter sends intro email to team

// Result: 30-60 minutes of manual work per graduate
// Result: Human error (forgot to create candidate, wrong pod assignment)
// Result: Slow time-to-market for new graduates
```

### v3 Solution (Automated via Events)

```typescript
// Student graduates from Academy
await eventBus.publish({
  type: 'course.graduated',
  payload: { userId, courseId, finalScore: 95 }
});

// ✅ Automatically handled by subscribers:

// Subscriber 1: ATS Module
eventBus.subscribe('course.graduated', async (event) => {
  await grantRole(event.payload.userId, 'candidate');
  await updateCandidateStatus(event.payload.userId, 'bench');
});

// Subscriber 2: Companions Module
eventBus.subscribe('course.graduated', async (event) => {
  await generateResume(event.payload.userId);
});

// Subscriber 3: Trikala Module
eventBus.subscribe('course.graduated', async (event) => {
  const pod = await findAvailablePod();
  await assignToPod(event.payload.userId, pod.id);
});

// Subscriber 4: Notifications Module
eventBus.subscribe('course.graduated', async (event) => {
  await notifyRecruitmentTeam(event.payload.userId);
});

// Result: All 4 steps happen automatically in <5 seconds
// Result: Zero human error
// Result: Complete audit trail in system_events table
```

---

## Event Bus Implementation

### Core Interface

```typescript
// lib/events/types.ts
export type SystemEvent =
  // Academy Events
  | { type: 'topic.completed'; payload: { userId: string; topicId: string; score: number } }
  | { type: 'quiz.passed'; payload: { userId: string; quizId: string; score: number } }
  | { type: 'course.graduated'; payload: { userId: string; courseId: string; finalScore: number } }

  // HR Events
  | { type: 'employee.hired'; payload: { userId: string; departmentId: string; startDate: string } }
  | { type: 'timesheet.submitted'; payload: { timesheetId: string; userId: string; hours: number } }
  | { type: 'leave.approved'; payload: { leaveId: string; userId: string; days: number } }
  | { type: 'expense.approved'; payload: { expenseId: string; userId: string; amount: number } }

  // Recruiting/ATS Events
  | { type: 'candidate.created'; payload: { userId: string } }
  | { type: 'job.posted'; payload: { jobId: string; clientId: string } }
  | { type: 'application.submitted'; payload: { applicationId: string; candidateId: string; jobId: string } }
  | { type: 'interview.scheduled'; payload: { interviewId: string; candidateId: string; datetime: string } }
  | { type: 'candidate.placed'; payload: { candidateId: string; jobId: string; salary: number } }

  // Trikala/Productivity Events
  | { type: 'workflow.completed'; payload: { workflowId: string; userId: string } }
  | { type: 'goal.achieved'; payload: { goalId: string; podId: string; value: number } }
  | { type: 'cross_pollination.opportunity'; payload: { userId: string; leadType: string; source: string } }

  // Notifications
  | { type: 'notification.send'; payload: { userId: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } };

// lib/events/event-bus.ts
export class EventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends SystemEvent>(event: T): Promise<void> {
    console.log(`[EventBus] Publishing: ${event.type}`, event.payload);

    // 1. Persist to database (audit trail)
    const eventRecord = await db.insert(system_events).values({
      type: event.type,
      payload: event.payload,
      created_at: new Date(),
    }).returning();

    // 2. Trigger all registered handlers
    const handlers = this.handlers.get(event.type) || [];

    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);

          // Mark as processed
          await db.update(system_events)
            .set({ processed_at: new Date() })
            .where(eq(system_events.id, eventRecord.id));

        } catch (error) {
          console.error(`[EventBus] Handler error for ${event.type}:`, error);

          // Record error
          await db.update(system_events)
            .set({
              processed_at: new Date(),
              error: error.message
            })
            .where(eq(system_events.id, eventRecord.id));

          // Don't throw - other handlers should still run
        }
      })
    );
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T extends SystemEvent>(
    eventType: T['type'],
    handler: (event: Extract<SystemEvent, { type: T['type'] }>) => Promise<void>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);

    console.log(`[EventBus] Subscribed to: ${eventType} (${this.handlers.get(eventType)!.length} handlers)`);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Get all handlers for an event type (for debugging)
   */
  getHandlerCount(eventType: string): number {
    return (this.handlers.get(eventType) || []).length;
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

### Database Schema

```sql
-- Event audit trail
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ,
  error TEXT,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for querying
CREATE INDEX idx_system_events_type ON system_events(type);
CREATE INDEX idx_system_events_created_at ON system_events(created_at DESC);
CREATE INDEX idx_system_events_processed_at ON system_events(processed_at);
CREATE INDEX idx_system_events_type_created ON system_events(type, created_at DESC);

-- Index for finding errors
CREATE INDEX idx_system_events_errors ON system_events(type) WHERE error IS NOT NULL;

-- RLS Policy (admins only)
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all events"
ON system_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);
```

---

## Integration Examples

### Example 1: Student Graduation Workflow

**Scenario:** When a student completes all topics, automatically convert them to a candidate and prepare for job placement.

```typescript
// modules/academy/graduation.ts

async function checkGraduationStatus(userId: string, courseId: string) {
  const completedTopics = await getCompletedTopics(userId, courseId);
  const requiredTopics = await getRequiredTopics(courseId);

  if (completedTopics.length >= requiredTopics.length) {
    // Mark as graduated
    await db.update(user_profiles)
      .set({ student_graduation_date: new Date() })
      .where(eq(user_profiles.id, userId));

    // Publish graduation event
    await eventBus.publish({
      type: 'course.graduated',
      payload: { userId, courseId, finalScore: 95 }
    });
  }
}

// modules/ats/handlers.ts (Subscriber 1)
eventBus.subscribe('course.graduated', async (event) => {
  const { userId, courseId } = event.payload;

  // 1. Grant candidate role
  await db.insert(user_roles).values({
    user_id: userId,
    role_id: await getRoleId('candidate'),
    granted_at: new Date(),
  });

  // 2. Update candidate status
  await db.update(user_profiles)
    .set({
      candidate_status: 'bench',
      candidate_available_from: new Date(),
    })
    .where(eq(user_profiles.id, userId));

  console.log(`✅ Converted graduate ${userId} to candidate`);
});

// modules/companions/handlers.ts (Subscriber 2)
eventBus.subscribe('course.graduated', async (event) => {
  const { userId } = event.payload;

  // Generate resume using AI
  const resumeData = await extractResumeData(userId);
  const resumePDF = await generateResumePDF(resumeData);

  await db.insert(generated_documents).values({
    user_id: userId,
    template: 'resume',
    file_url: resumePDF.url,
    created_at: new Date(),
  });

  console.log(`✅ Generated resume for ${userId}`);
});

// modules/trikala/handlers.ts (Subscriber 3)
eventBus.subscribe('course.graduated', async (event) => {
  const { userId } = event.payload;

  // Find pod with capacity
  const availablePod = await findPodWithCapacity();

  await db.insert(pod_members).values({
    pod_id: availablePod.id,
    user_id: userId,
    role: 'junior',
    joined_at: new Date(),
  });

  // Update pod goal
  await eventBus.publish({
    type: 'notification.send',
    payload: {
      userId: availablePod.senior_id,
      title: 'New Pod Member',
      message: `${await getUserName(userId)} joined your pod`,
      type: 'info',
    },
  });

  console.log(`✅ Assigned ${userId} to pod ${availablePod.id}`);
});
```

**Result:**
- 1 publish → 3 subscribers execute automatically
- All steps complete in <5 seconds
- Complete audit trail in `system_events` table
- Zero manual intervention required

### Example 2: Candidate Placement Workflow

**Scenario:** When a candidate gets placed, update multiple systems and trigger onboarding.

```typescript
// modules/ats/placement.ts
async function recordPlacement(candidateId: string, jobId: string, salary: number) {
  await db.insert(placements).values({
    candidate_id: candidateId,
    job_id: jobId,
    salary: salary,
    start_date: addDays(new Date(), 14),
    created_at: new Date(),
  });

  // Publish placement event
  await eventBus.publish({
    type: 'candidate.placed',
    payload: { candidateId, jobId, salary }
  });
}

// modules/hr/handlers.ts (Subscriber 1)
eventBus.subscribe('candidate.placed', async (event) => {
  const { candidateId, jobId } = event.payload;

  // 1. Grant employee role
  await db.insert(user_roles).values({
    user_id: candidateId,
    role_id: await getRoleId('employee'),
  });

  // 2. Update employee fields
  await db.update(user_profiles)
    .set({
      employee_hire_date: addDays(new Date(), 14),
      employee_job_title: await getJobTitle(jobId),
      employee_department_id: await getDepartmentForJob(jobId),
    })
    .where(eq(user_profiles.id, candidateId));

  // 3. Initialize leave balances
  await initializeLeaveBalances(candidateId);

  console.log(`✅ Created HR record for ${candidateId}`);
});

// modules/trikala/handlers.ts (Subscriber 2)
eventBus.subscribe('candidate.placed', async (event) => {
  const { candidateId, jobId } = event.payload;

  // Add to productivity tracking
  const client = await getClientForJob(jobId);

  await db.insert(consultant_assignments).values({
    consultant_id: candidateId,
    client_id: client.id,
    start_date: addDays(new Date(), 14),
    created_at: new Date(),
  });

  // Close recruitment workflow
  await db.update(workflow_instances)
    .set({ status: 'completed', completed_at: new Date() })
    .where(eq(workflow_instances.object_id, candidateId));

  console.log(`✅ Added ${candidateId} to productivity tracking`);
});

// modules/achievements/handlers.ts (Subscriber 3)
eventBus.subscribe('candidate.placed', async (event) => {
  const { candidateId, salary } = event.payload;

  // Award points to recruiter who placed candidate
  const recruiter = await getRecruiterForCandidate(candidateId);

  await db.insert(xp_transactions).values({
    user_id: recruiter.id,
    amount: calculateCommission(salary),
    reason: `Placement bonus for ${await getUserName(candidateId)}`,
    created_at: new Date(),
  });

  // Check if achievement unlocked
  const placements = await getRecruiterPlacements(recruiter.id);
  if (placements.length === 10) {
    await eventBus.publish({
      type: 'achievement.earned',
      payload: {
        userId: recruiter.id,
        achievementId: '10_placements',
      },
    });
  }

  console.log(`✅ Awarded commission to recruiter ${recruiter.id}`);
});
```

### Example 3: Cross-Pollination Detection

**Scenario:** Automatically detect cross-pollination opportunities during conversations.

```typescript
// modules/ai/conversation.ts
async function analyzeConversation(conversationId: string) {
  const messages = await getConversationMessages(conversationId);
  const analysis = await aiAnalyze(messages);

  // Detect opportunities
  for (const opportunity of analysis.opportunities) {
    await eventBus.publish({
      type: 'cross_pollination.opportunity',
      payload: {
        userId: messages[0].user_id,
        leadType: opportunity.type, // 'recruiting', 'bench', 'training', etc.
        source: 'ai_conversation',
        confidence: opportunity.confidence,
      },
    });
  }
}

// modules/crm/handlers.ts
eventBus.subscribe('cross_pollination.opportunity', async (event) => {
  const { userId, leadType, source } = event.payload;

  // Create opportunity in CRM
  await db.insert(opportunity_pipeline).values({
    user_id: userId,
    type: leadType,
    source: source,
    status: 'new',
    created_at: new Date(),
  });

  // Notify appropriate sales rep
  const salesRep = await getSalesRepForType(leadType);
  await eventBus.publish({
    type: 'notification.send',
    payload: {
      userId: salesRep.id,
      title: 'New Lead Detected',
      message: `AI detected ${leadType} opportunity from ${await getUserName(userId)}`,
      type: 'success',
    },
  });

  console.log(`✅ Created opportunity: ${leadType} from ${userId}`);
});
```

---

## Benefits

### 1. **Decoupling**
- Modules don't import each other directly
- Can add/remove modules without breaking others
- Each module focuses on its domain

### 2. **Audit Trail**
- All events logged to `system_events` table
- Can replay events for debugging
- Complete history of system actions

```sql
-- Query: Who graduated last month?
SELECT *
FROM system_events
WHERE type = 'course.graduated'
  AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Query: Any failed event handlers?
SELECT *
FROM system_events
WHERE error IS NOT NULL
ORDER BY created_at DESC;
```

### 3. **Easy Integration**
- Add new subscribers without touching publishers
- Publishers don't know about subscribers
- Subscribers can be added/removed dynamically

### 4. **Testing**
- Mock event bus for unit tests
- Test each subscriber in isolation
- Verify events published correctly

```typescript
// Test example
describe('Graduation Handler', () => {
  it('should grant candidate role when student graduates', async () => {
    const mockEventBus = new MockEventBus();

    await mockEventBus.publish({
      type: 'course.graduated',
      payload: { userId: 'user-123', courseId: 'course-456', finalScore: 95 }
    });

    const userRoles = await getUserRoles('user-123');
    expect(userRoles).toContain('candidate');
  });
});
```

### 5. **Retry Logic**
- Failed handlers can retry with exponential backoff
- Idempotent handlers prevent duplicate work
- Circuit breakers prevent cascading failures

### 6. **Monitoring & Analytics**
- Query `system_events` for business metrics
- Track event volume and processing times
- Identify bottlenecks and failures

---

## Best Practices

### 1. **Event Naming Convention**

```typescript
// ✅ Good: module.action_past_tense
'course.graduated'
'candidate.placed'
'timesheet.submitted'
'leave.approved'

// ❌ Bad: unclear or present tense
'graduation'
'place_candidate'
'submit_timesheet'
```

### 2. **Payload Design**

```typescript
// ✅ Good: Include IDs and minimal context
{
  type: 'candidate.placed',
  payload: {
    candidateId: 'user-123',
    jobId: 'job-456',
    salary: 85000,  // Critical for commission calculation
  }
}

// ❌ Bad: Too much data (query when needed)
{
  type: 'candidate.placed',
  payload: {
    candidate: { /* entire user object */ },
    job: { /* entire job object */ },
    client: { /* entire client object */ },
  }
}
```

### 3. **Idempotent Handlers**

```typescript
// ✅ Good: Check before creating
eventBus.subscribe('course.graduated', async (event) => {
  const { userId } = event.payload;

  // Check if already has candidate role
  const hasRole = await userHasRole(userId, 'candidate');
  if (hasRole) {
    console.log(`User ${userId} already has candidate role, skipping`);
    return;
  }

  await grantRole(userId, 'candidate');
});

// ❌ Bad: Blindly insert (causes duplicates on retry)
eventBus.subscribe('course.graduated', async (event) => {
  await grantRole(event.payload.userId, 'candidate');
});
```

### 4. **Error Handling**

```typescript
eventBus.subscribe('candidate.placed', async (event) => {
  try {
    await updateHRSystem(event.payload);
  } catch (error) {
    // Log error but don't throw (other handlers should still run)
    console.error('HR update failed:', error);

    // Optionally: Publish error event for monitoring
    await eventBus.publish({
      type: 'system.error',
      payload: {
        source: 'hr.placement_handler',
        error: error.message,
        originalEvent: event,
      },
    });
  }
});
```

---

## Testing the Event Bus

### Week 1 Integration Test

**Goal:** Prove event bus works before building modules.

```typescript
// __tests__/integration/event-bus.test.ts
describe('Event Bus Integration', () => {
  it('should route events to all registered handlers', async () => {
    const handler1Calls: any[] = [];
    const handler2Calls: any[] = [];

    // Register handlers
    eventBus.subscribe('test.event', async (event) => {
      handler1Calls.push(event);
    });

    eventBus.subscribe('test.event', async (event) => {
      handler2Calls.push(event);
    });

    // Publish event
    await eventBus.publish({
      type: 'test.event',
      payload: { foo: 'bar' }
    });

    // Verify both handlers called
    expect(handler1Calls).toHaveLength(1);
    expect(handler2Calls).toHaveLength(1);
    expect(handler1Calls[0].payload.foo).toBe('bar');
  });

  it('should persist events to database', async () => {
    await eventBus.publish({
      type: 'test.event',
      payload: { test: true }
    });

    const events = await db.select()
      .from(system_events)
      .where(eq(system_events.type, 'test.event'));

    expect(events).toHaveLength(1);
    expect(events[0].payload.test).toBe(true);
  });

  it('should handle errors without crashing', async () => {
    eventBus.subscribe('test.event', async () => {
      throw new Error('Handler failed');
    });

    // Should not throw
    await expect(
      eventBus.publish({ type: 'test.event', payload: {} })
    ).resolves.not.toThrow();

    // Error should be recorded
    const events = await db.select()
      .from(system_events)
      .where(eq(system_events.type, 'test.event'));

    expect(events[0].error).toContain('Handler failed');
  });
});
```

---

## Migration from Legacy

**Legacy:** Modules communicate via direct imports

```typescript
// ❌ Old way: Direct coupling
import { createCandidate } from '../ats/candidates';
import { generateResume } from '../companions/resume';

async function graduateStudent(userId: string) {
  await markGraduated(userId);
  await createCandidate(userId);  // Tight coupling
  await generateResume(userId);   // Tight coupling
}
```

**v3:** Modules communicate via events

```typescript
// ✅ New way: Event-driven
async function graduateStudent(userId: string) {
  await markGraduated(userId);
  await eventBus.publish({
    type: 'course.graduated',
    payload: { userId }
  });
  // ATS and Companions modules handle their own logic
}
```

---

**Status:** v3 Foundation Architecture
**Last Updated:** 2025-11-17
**Owner:** Architecture Team
