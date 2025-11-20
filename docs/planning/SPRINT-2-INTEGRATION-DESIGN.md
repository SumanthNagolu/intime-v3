# Sprint 2: Integration Design - Event Bus ↔ tRPC API

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document defines how the Event Bus and tRPC API integrate to enable cross-module workflows with guaranteed delivery, type safety, and proper error handling.

---

## Integration Patterns

### Pattern 1: tRPC Mutation → Event Publishing

**Use Case:** Client triggers action via tRPC, which publishes event for async processing

```
Client                    tRPC API                  Event Bus                 Handler
  │                          │                         │                        │
  │ mutation:                │                         │                        │
  │ createJob()              │                         │                        │
  ├─────────────────────────►│                         │                        │
  │                          │ 1. Validate with Zod    │                        │
  │                          │ 2. Insert into DB       │                        │
  │                          │ 3. Publish event        │                        │
  │                          ├────────────────────────►│                        │
  │                          │                         │ 4. NOTIFY listeners    │
  │                          │                         ├───────────────────────►│
  │                          │                         │                        │ 5. Execute
  │ ◄─────────────────────── │                         │                        │    handler
  │ { success: true }        │                         │                        │
  │                          │                         │ 6. Mark processed      │
  │                          │                         │◄───────────────────────┤
```

**Example: Create Job → Notify Candidates**

```typescript
// tRPC mutation
export const jobsRouter = router({
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Insert job
      const { data: job } = await ctx.supabase
        .from('jobs')
        .insert(input)
        .select()
        .single();

      // 2. Publish event
      await eventBus.publish('job.created', {
        jobId: job.id,
        title: job.title,
        requiredSkills: job.required_skills
      }, {
        userId: ctx.userId
      });

      return job;
    })
});

// Event handler
@EventHandler('job.created', 'notify_matching_candidates')
export async function handleJobCreated(event: Event<JobCreatedPayload>) {
  const { jobId, requiredSkills } = event.payload;

  // Find matching candidates
  const candidates = await findMatchingCandidates(requiredSkills);

  // Send notifications (async, doesn't block mutation)
  for (const candidate of candidates) {
    await sendEmail(candidate.email, `New job matching your skills: ${jobId}`);
  }
}
```

---

### Pattern 2: Database Trigger → Event Publishing

**Use Case:** Database change automatically triggers event (no application code needed)

```
Database                Event Bus                  Handler
  │                        │                          │
  │ INSERT INTO jobs       │                          │
  ├───────────────────────►│                          │
  │                        │ TRIGGER:                 │
  │                        │ publish_event()          │
  │                        ├─────────────────────────►│
  │                        │                          │ Execute handler
  │                        │                          │
  │                        │ Mark processed           │
  │                        │◄─────────────────────────┤
```

**Implementation:**

```sql
-- Add trigger to jobs table
CREATE OR REPLACE FUNCTION trigger_job_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM publish_event(
    'job.created',
    NEW.id,
    jsonb_build_object(
      'jobId', NEW.id,
      'title', NEW.title,
      'requiredSkills', NEW.required_skills
    ),
    NEW.created_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_created_event
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_job_created();
```

**Trade-off:**
- ✅ **Pro:** Guaranteed event publishing (atomic with DB insert)
- ✅ **Pro:** No application code needed
- ❌ **Con:** Less visibility (event publishing hidden in DB)
- ❌ **Con:** Harder to debug

**Recommendation:** Use for critical workflows where guarantee is essential (e.g., audit logging)

---

### Pattern 3: Event Handler → tRPC Mutation (Internal)

**Use Case:** Event handler needs to call tRPC procedure internally

```
Event Bus              tRPC Caller               Database
  │                       │                         │
  │ Event: user.created   │                         │
  ├──────────────────────►│                         │
  │                       │ createCaller()          │
  │                       │ .candidates.create()    │
  │                       ├────────────────────────►│
  │                       │                         │ INSERT
  │                       │◄────────────────────────┤
  │◄──────────────────────┤                         │
  │ Mark processed        │                         │
```

**Implementation:**

```typescript
import { appRouter } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const { studentId } = event.payload;

  // Create tRPC caller with service role context
  const ctx = await createContext();
  const caller = appRouter.createCaller(ctx);

  // Call tRPC procedure internally
  await caller.candidates.create({
    userId: studentId,
    skills: ['Java', 'Spring Boot'], // From course completion data
    experienceYears: 0
  });
}
```

**Trade-off:**
- ✅ **Pro:** Reuses business logic (DRY)
- ✅ **Pro:** Type safety maintained
- ❌ **Con:** Circular dependency risk (Event Bus ↔ tRPC)
- ❌ **Con:** Overhead of tRPC context creation

**Alternative:** Call Supabase directly from handler
```typescript
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const supabase = createClient();

  await supabase.from('user_profiles').update({
    candidate_status: 'bench'
  }).eq('id', event.payload.studentId);
}
```

**Recommendation:** Use direct database access for simple updates, tRPC for complex business logic

---

## Cross-Cutting Concerns

### 1. Error Handling

**Problem:** Errors can occur in:
1. tRPC validation (Zod)
2. Database operations
3. Event publishing
4. Event handlers

**Strategy:**

```typescript
// tRPC Error Hierarchy
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
  }
}

// Validation errors → 400
if (zodError) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Validation failed',
    cause: zodError
  });
}

// Auth errors → 401
if (!ctx.session) {
  throw new TRPCError({ code: 'UNAUTHORIZED' });
}

// Permission errors → 403
if (!hasPermission) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}

// Database errors → 500
if (dbError) {
  await logToSentry(dbError);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Database operation failed'
  });
}

// Event Bus errors → Retry
try {
  await handler(event);
} catch (error) {
  await markEventFailed(event.id, error.message);
  // Automatic retry via exponential backoff
}
```

**Error Boundary:**
- tRPC errors: Caught by React Query, shown in UI
- Event handler errors: Logged to database, retried automatically
- Critical errors: Sent to Sentry

---

### 2. Authentication & Authorization

**Challenge:** Event handlers run asynchronously (no user session)

**Solution 1:** Store `userId` in event, use service role for handler

```typescript
// Publish event with user context
await eventBus.publish('job.created', payload, {
  userId: ctx.userId // From tRPC context
});

// Handler uses service role (no RLS enforcement)
@EventHandler('job.created', 'notify_candidates')
export async function handler(event: Event<JobCreatedPayload>) {
  const supabase = createClient(); // Service role

  // Can access all data (RLS bypassed)
  const candidates = await supabase.from('candidates').select('*');
}
```

**Solution 2:** Create user-scoped Supabase client in handler

```typescript
@EventHandler('job.created', 'audit_job_creation')
export async function handler(event: Event<JobCreatedPayload>) {
  // Create client with user's session (RLS enforced)
  const supabase = createClient({
    accessToken: await getAccessToken(event.userId)
  });

  // Only sees data in user's org (RLS applied)
  await supabase.from('audit_logs').insert({
    action: 'job.created',
    user_id: event.userId,
    org_id: event.orgId
  });
}
```

**Recommendation:**
- Use **Service Role** for cross-org operations (e.g., analytics, notifications)
- Use **User Session** for org-scoped operations (e.g., audit logs, user notifications)

---

### 3. Transaction Management

**Problem:** tRPC mutation + Event publishing must be atomic

**Bad Example (Not Atomic):**
```typescript
// ❌ If event publishing fails, job is still inserted
await supabase.from('jobs').insert(input);
await eventBus.publish('job.created', payload); // Could fail!
```

**Good Example (Atomic):**
```typescript
// ✅ Event publishing done in database trigger (same transaction)
await supabase.from('jobs').insert(input);
// Trigger automatically publishes event
```

**Alternative (Application-Level Transaction):**
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  // 1. Insert job
  const result = await client.query('INSERT INTO jobs ... RETURNING id');
  const jobId = result.rows[0].id;

  // 2. Publish event (via publish_event function)
  await client.query('SELECT publish_event($1, $2, $3)', [
    'job.created',
    jobId,
    JSON.stringify(payload)
  ]);

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**Recommendation:** Use database triggers for critical events (audit, cross-module state changes)

---

### 4. Multi-Tenancy

**Enforcement Points:**

1. **tRPC Context:** Inject `orgId` from session
```typescript
const ctx = await createContext();
ctx.orgId = await getOrgId(ctx.userId);
```

2. **Event Publishing:** Include `orgId` in metadata
```typescript
await eventBus.publish('job.created', payload, {
  metadata: { orgId: ctx.orgId }
});
```

3. **RLS Policies:** Database enforces org isolation
```sql
CREATE POLICY "Users can only access jobs in their org"
ON jobs FOR ALL
USING (org_id = auth_user_org_id());
```

4. **Event Handlers:** Filter by `orgId`
```typescript
@EventHandler('job.created', 'notify_candidates')
export async function handler(event: Event<JobCreatedPayload>) {
  // Only notify candidates in same org
  const candidates = await supabase
    .from('candidates')
    .select('*')
    .eq('org_id', event.orgId); // ← Explicit filter
}
```

**Validation Test:**
```typescript
// QA Test: Verify org isolation
const org1User = await login('user1@org1.com');
const org2User = await login('user2@org2.com');

// User 1 creates job
const job = await org1User.trpc.jobs.create({ title: 'Engineer' });

// User 2 should NOT see job
const jobs = await org2User.trpc.jobs.list();
expect(jobs).not.toContainEqual(job);
```

---

## Example Workflows

### Workflow 1: Student Graduates → Create Candidate Profile

```
┌──────────┐       ┌─────────────┐       ┌───────────────┐       ┌─────────────────┐
│  Trainer │       │ tRPC API    │       │  Event Bus    │       │     Handler     │
│  (Client)│       │  (Server)   │       │  (PostgreSQL) │       │  (Recruiting)   │
└────┬─────┘       └──────┬──────┘       └───────┬───────┘       └────────┬────────┘
     │                    │                      │                         │
     │ markGraduated()    │                      │                         │
     ├───────────────────►│                      │                         │
     │                    │ 1. Validate schema   │                         │
     │                    │ 2. UPDATE students   │                         │
     │                    │    SET graduated=true│                         │
     │                    │ 3. Publish event     │                         │
     │                    ├─────────────────────►│                         │
     │                    │                      │ 4. NOTIFY 'academy'     │
     │                    │                      ├────────────────────────►│
     │                    │                      │                         │ 5. Grant role
     │                    │                      │                         │    'candidate'
     │                    │                      │                         │ 6. Update profile
     │                    │                      │                         │    candidate_status
     │                    │                      │ 7. Mark processed       │
     │                    │                      │◄────────────────────────┤
     │ ◄─────────────────┤                      │                         │
     │ { success: true }  │                      │                         │
```

**Implementation:**

```typescript
// tRPC mutation (Academy module)
export const studentsRouter = router({
  markGraduated: protectedProcedure
    .input(z.object({
      studentId: z.string().uuid(),
      courseId: z.string().uuid(),
      grade: z.number().min(0).max(100)
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Update student record
      await ctx.supabase
        .from('students')
        .update({ graduated: true, graduation_date: new Date() })
        .eq('id', input.studentId);

      // 2. Publish event
      await eventBus.publish('course.graduated', {
        studentId: input.studentId,
        courseId: input.courseId,
        courseName: 'Guidewire Bootcamp', // TODO: Fetch from DB
        completedAt: new Date(),
        grade: input.grade
      }, {
        userId: ctx.userId
      });

      return { success: true };
    })
});

// Event handler (Recruiting module)
@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const { studentId, grade } = event.payload;
  const supabase = createClient();

  // 1. Grant candidate role
  await supabase.rpc('grant_role_to_user', {
    p_user_id: studentId,
    p_role_name: 'candidate'
  });

  // 2. Update profile with candidate status
  await supabase
    .from('user_profiles')
    .update({
      candidate_status: 'bench',
      candidate_ready_for_placement: grade >= 80
    })
    .eq('id', studentId);

  console.log(`Student ${studentId} promoted to candidate`);
}

// Event handler (Recruiting module)
@EventHandler('course.graduated', 'notify_recruiting_team')
export async function notifyRecruitingTeam(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;

  // TODO: Send Slack notification
  console.log(`New graduate available: ${studentId} completed ${courseName} with grade ${grade}`);
}
```

---

### Workflow 2: Job Created → Match & Notify Candidates

```
┌──────────┐       ┌─────────────┐       ┌───────────────┐       ┌─────────────────┐
│Recruiter │       │ tRPC API    │       │  Event Bus    │       │     Handler     │
│ (Client) │       │  (Server)   │       │  (PostgreSQL) │       │   (Matching)    │
└────┬─────┘       └──────┬──────┘       └───────┬───────┘       └────────┬────────┘
     │                    │                      │                         │
     │ createJob()        │                      │                         │
     ├───────────────────►│                      │                         │
     │                    │ 1. Validate schema   │                         │
     │                    │ 2. INSERT INTO jobs  │                         │
     │                    │ 3. Publish event     │                         │
     │                    ├─────────────────────►│                         │
     │                    │                      │ 4. NOTIFY 'recruiting'  │
     │                    │                      ├────────────────────────►│
     │                    │                      │                         │ 5. Find matching
     │                    │                      │                         │    candidates
     │                    │                      │                         │ 6. Send emails
     │                    │                      │ 7. Mark processed       │
     │                    │                      │◄────────────────────────┤
     │ ◄─────────────────┤                      │                         │
     │ { job }            │                      │                         │
```

**Implementation:**

```typescript
// tRPC mutation
export const jobsRouter = router({
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: job } = await ctx.supabase
        .from('jobs')
        .insert({
          ...input,
          org_id: ctx.orgId,
          created_by: ctx.userId
        })
        .select()
        .single();

      await eventBus.publish('job.created', {
        jobId: job.id,
        title: job.title,
        clientId: job.client_id,
        requiredSkills: job.required_skills,
        experienceYears: {
          min: job.experience_years_min,
          max: job.experience_years_max
        }
      }, {
        userId: ctx.userId
      });

      return job;
    })
});

// Event handler
@EventHandler('job.created', 'notify_matching_candidates')
export async function handleJobCreated(event: Event<JobCreatedPayload>) {
  const { jobId, requiredSkills, experienceYears } = event.payload;
  const supabase = createClient();

  // 1. Find matching candidates
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, user:user_profiles(email, full_name)')
    .eq('org_id', event.orgId)
    .overlaps('skills', requiredSkills) // Array overlap
    .gte('experience_years', experienceYears.min)
    .lte('experience_years', experienceYears.max);

  // 2. Send notification emails
  for (const candidate of candidates || []) {
    await sendEmail({
      to: candidate.user.email,
      subject: `New job matching your skills`,
      body: `Hi ${candidate.user.full_name}, a new job (${jobId}) matches your profile!`
    });
  }

  console.log(`Notified ${candidates?.length || 0} matching candidates for job ${jobId}`);
}
```

---

## Testing Integration

### Integration Test Example

```typescript
describe('Student Graduation Workflow', () => {
  it('creates candidate profile when student graduates', async () => {
    // Setup: Create student
    const student = await createStudent({ userId: 'user-123' });

    // Act: Mark student as graduated (via tRPC)
    await trpc.students.markGraduated({
      studentId: student.id,
      courseId: 'course-456',
      grade: 85
    });

    // Wait for event processing
    await waitForEvents();

    // Assert: Student has candidate role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', 'user-123');

    expect(roles).toContainEqual({ role: { name: 'candidate' } });

    // Assert: Profile updated
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('candidate_status')
      .eq('id', 'user-123')
      .single();

    expect(profile.candidate_status).toBe('bench');

    // Assert: Event logged
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'course.graduated');

    expect(events).toHaveLength(1);
    expect(events[0].status).toBe('completed');
  });
});
```

---

## Deployment Checklist

1. **Database:** Run Migration 008 (event bus refinements)
2. **Event Bus:** Deploy EventBus code, start listener
3. **tRPC:** Deploy tRPC routers and client
4. **Handlers:** Register all event handlers
5. **Testing:** Run integration tests
6. **Monitoring:** Set up Sentry error tracking
7. **Validation:** Verify org isolation, RLS policies

---

## Next Steps

1. **Developer Agent:** Implement integration patterns
2. **Developer Agent:** Write integration tests
3. **QA Agent:** Test cross-module workflows
4. **Deployment Agent:** Deploy and validate

---

**Status:** ✅ READY FOR IMPLEMENTATION

---

**End of Integration Design Document**
