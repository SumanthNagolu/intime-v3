# Architect Agent Handoff: Sprint 2 Technical Design

**From:** PM Agent
**To:** Architect Agent
**Date:** 2025-11-19
**Sprint:** Sprint 2 - Event Bus & API Foundation
**Status:** Ready for Technical Design

---

## Executive Summary

Sprint 2 establishes the **communication backbone** (Event Bus) and **API infrastructure** (tRPC) for InTime v3. All 6 user stories have been reviewed, refined, and approved by PM Agent. Your task is to create the technical design that Developer Agent will implement.

**Key Documents:**
- **PM Requirements:** `/docs/planning/SPRINT-2-PM-REQUIREMENTS.md` (30 pages, comprehensive)
- **PM Summary:** `/docs/planning/SPRINT-2-PM-SUMMARY.md` (6 pages, executive overview)
- **User Stories:** `/docs/planning/stories/epic-01-foundation/FOUND-00[7-12].md`

---

## What You Need to Design

### 1. Database Schema (Migration 008)

**Tables to Create:**
```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES user_profiles(id),
  -- Add your constraints, indexes, RLS policies
);

-- Event subscriptions registry
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  handler_name TEXT NOT NULL,
  handler_function TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Add your constraints, indexes, RLS policies
);
```

**Design Decisions Needed:**
1. Should `events` table be partitioned monthly (like `audit_logs`)?
2. What indexes are needed for performance (consider `type`, `status`, `org_id`, `published_at`)?
3. RLS policies: How to allow event handlers (service role) vs. users (authenticated)?
4. Should we add foreign key from `events.type` to `event_subscriptions.event_type`?

**PM Constraints:**
- MUST include `org_id UUID NOT NULL REFERENCES organizations(id)`
- MUST enable RLS on all tables
- MUST add indexes on foreign keys
- MUST add audit logging trigger for event publishing

---

### 2. PostgreSQL Functions

**Functions to Implement:**
- `publish_event()` - Persist event + send NOTIFY
- `mark_event_processed()` - Update status to 'processed'
- `mark_event_failed()` - Increment retry, move to dead letter after 3 failures
- `replay_failed_events()` - Reset failed events to pending

**Design Decisions Needed:**
1. Should `publish_event()` use `SECURITY DEFINER` or `SECURITY INVOKER`?
2. How to handle concurrent event processing (prevent duplicate processing)?
3. Should we add a `process_pending_events()` function for background worker?
4. Error handling: What should functions return (void, UUID, status object)?

**PM Constraints:**
- Functions MUST be idempotent (safe to call multiple times)
- MUST respect `org_id` isolation
- MUST handle NULL values gracefully
- MUST log errors to audit log

---

### 3. tRPC Router Structure

**Router Hierarchy:**
```typescript
appRouter
├── users
│   ├── me (query)
│   ├── updateProfile (mutation)
│   ├── list (query, admin)
│   └── getById (query, admin)
├── candidates
│   ├── create (mutation)
│   ├── update (mutation)
│   ├── list (query)
│   └── getById (query)
├── jobs
│   ├── create (mutation)
│   ├── update (mutation)
│   ├── list (query)
│   └── getById (query)
└── students
    ├── create (mutation)
    ├── update (mutation)
    ├── list (query)
    └── getById (query)
```

**Design Decisions Needed:**
1. File structure: Single file per router OR nested directories?
2. Context creation: How to optimize Supabase client creation?
3. Error handling: Custom tRPC error codes beyond built-in ones?
4. Middleware composition: How to combine auth + permission checks?

**PM Constraints:**
- MUST use Supabase RLS (no service role key for user operations)
- MUST validate all inputs with Zod schemas
- MUST return consistent error format
- MUST support batch requests (default in tRPC)

---

### 4. Helper Functions (Missing from Sprint 1)

**Create These:**
```typescript
// src/lib/auth/server.ts
export async function requireAuth(): Promise<Session> {
  // Get session from Supabase
  // Throw AuthenticationError if not authenticated
}

// src/lib/rbac/index.ts
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  // Query role_permissions via user_roles
  // Return true/false
}
```

**Design Decisions Needed:**
1. Should `requireAuth()` cache session in request context?
2. Should `checkPermission()` cache results (e.g., for batch operations)?
3. Error handling: Throw vs. return null/false?

---

### 5. Event Handler Architecture

**Pattern:**
```typescript
// Declarative registration
@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(event: Event<CourseGraduatedEvent>) {
  // Handler logic
}
```

**Design Decisions Needed:**
1. Auto-discovery: Use dynamic imports OR static imports?
2. Handler isolation: Run in same process OR spawn workers?
3. Error handling: Retry immediately OR queue for later?
4. Health monitoring: Store metrics in memory OR database?

**PM Constraints:**
- Handlers MUST be idempotent
- Handlers MUST run with user context (not admin)
- Handlers MUST complete in < 500ms (warn if exceeded)
- Handlers MUST respect `org_id` isolation

---

### 6. Component Architecture

**Admin UIs to Design:**
1. Event Handler Health Dashboard (`/admin/event-handlers`)
   - List all handlers with status
   - Enable/disable handlers
   - View failure counts and last failure time
2. Event History & Replay (`/admin/events`)
   - List events with filters
   - View event details
   - Replay failed events
   - Export to JSON/CSV

**Design Decisions Needed:**
1. Server Components vs. Client Components?
2. Real-time updates via Supabase subscriptions?
3. Pagination: Cursor-based or offset-based?
4. UI framework: shadcn/ui components (already in project)

---

## Critical Design Constraints

### 1. Multi-Tenancy (Non-Negotiable)
**Requirement:** ALL new tables MUST include `org_id UUID NOT NULL REFERENCES organizations(id)`

**RLS Policy Pattern:**
```sql
CREATE POLICY "Users can only access events in their org"
ON events FOR ALL
TO authenticated
USING (org_id = auth_user_org_id());

-- Helper function (already exists from Sprint 1)
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

**Validation:**
- You MUST verify all new tables have `org_id`
- You MUST create RLS policies that enforce org isolation
- You MUST test cross-org access is blocked

---

### 2. Security Requirements

**Authentication:**
- All tRPC protected procedures MUST validate session
- Admin procedures MUST check `system:admin` permission
- Event handlers MUST NOT use service role key for user operations

**Authorization:**
- RLS policies MUST be enabled before any data inserted
- Permissions MUST be checked before admin operations
- Event replay MUST require admin permission

**Data Protection:**
- Sentry MUST scrub PII before logging
- Error messages MUST NOT leak sensitive data
- Stack traces MUST NOT show in production

---

### 3. Performance Requirements

**Event Bus:**
- Publish latency: < 50ms (95th percentile)
- Handler execution: < 500ms per handler
- Throughput: 100 events/second sustained

**tRPC:**
- Request batching: Enabled by default
- Response time: < 100ms (95th percentile)
- Timeout: 30 seconds per request

**Database:**
- Use indexes on: `type`, `status`, `org_id`, `published_at`
- Consider monthly partitions if > 1M events
- Connection pooling via Supabase

---

## Open Questions for You to Answer

### Question 1: Zod Schema Generation
**PM Recommendation:** Use `drizzle-zod` to generate from Drizzle schema

**Your Decision:**
- [ ] Accept PM recommendation
- [ ] Alternative approach: [specify]

**Rationale:**
[Your reasoning here]

---

### Question 2: Event Persistence Strategy
**PM Recommendation:** Add cron job to process `pending` events older than 5 minutes

**Your Decision:**
- [ ] Accept PM recommendation
- [ ] Alternative approach: [specify]

**Rationale:**
[Your reasoning here]

---

### Question 3: tRPC Context Performance
**PM Recommendation:** Create new Supabase client per request, optimize later if needed

**Your Decision:**
- [ ] Accept PM recommendation
- [ ] Alternative approach: [specify]

**Rationale:**
[Your reasoning here]

---

### Question 4: Admin UI Framework
**PM Recommendation:** Client-rendered with tRPC hooks for real-time updates

**Your Decision:**
- [ ] Accept PM recommendation
- [ ] Alternative approach: [specify]

**Rationale:**
[Your reasoning here]

---

## Your Deliverables

### 1. Database Design Document
**File:** `/docs/architecture/sprint-2-database-design.md`

**Contents:**
- Complete DDL for Migration 008
- RLS policies for all new tables
- Index specifications with rationale
- Partitioning strategy (if applicable)
- PostgreSQL function implementations
- Performance considerations

---

### 2. API Architecture Document
**File:** `/docs/architecture/sprint-2-api-design.md`

**Contents:**
- tRPC router structure (file organization)
- Middleware composition pattern
- Error handling strategy
- Zod schema organization
- Type definitions and exports
- Helper function specifications

---

### 3. Event Bus Design Document
**File:** `/docs/architecture/sprint-2-event-bus-design.md`

**Contents:**
- Event flow diagram (publish → notify → handler)
- Handler registration mechanism
- Health monitoring strategy
- Error handling and retry logic
- Dead letter queue processing
- Background worker design (if needed)

---

### 4. Component Architecture Document
**File:** `/docs/architecture/sprint-2-component-design.md`

**Contents:**
- Component hierarchy for admin UIs
- Data fetching strategy (tRPC vs. Server Components)
- Real-time update mechanism
- State management approach
- UI/UX wireframes (text-based is fine)

---

### 5. Integration Design Document
**File:** `/docs/architecture/sprint-2-integration-design.md`

**Contents:**
- Event Bus ↔ tRPC integration points
- Example flows (student graduates, job created)
- Error propagation between systems
- Transaction boundaries
- Testing strategy for integrations

---

## Review Checklist for Your Designs

**Database Design:**
- [ ] All tables include `org_id UUID NOT NULL`
- [ ] RLS policies enforce org isolation
- [ ] Indexes cover common query patterns
- [ ] Audit logging triggers configured
- [ ] Soft deletes implemented (`deleted_at`)
- [ ] PostgreSQL functions are idempotent

**API Design:**
- [ ] tRPC context includes session and Supabase client
- [ ] Middleware validates auth and permissions
- [ ] All inputs validated with Zod schemas
- [ ] Error responses follow consistent format
- [ ] Type safety end-to-end (client to database)

**Event Bus Design:**
- [ ] Event publishing < 50ms latency
- [ ] Handlers are idempotent
- [ ] Retry logic (3 attempts)
- [ ] Dead letter queue for failures
- [ ] Health monitoring for handlers
- [ ] Circuit breaker for cascading events

**Component Design:**
- [ ] Admin UIs use shadcn/ui components
- [ ] Real-time updates (if applicable)
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Responsive design
- [ ] Loading and error states

**Integration Design:**
- [ ] Clear boundaries between Event Bus and tRPC
- [ ] Transaction consistency
- [ ] Error handling across systems
- [ ] Testing strategy covers integrations

---

## Success Criteria for Your Review

**Quality Metrics:**
- All design decisions documented with rationale
- Performance requirements addressed
- Security requirements addressed
- Multi-tenancy enforced in all designs
- All open questions answered

**Completeness:**
- 5 architecture documents created
- ERD diagrams for database schema
- Flow diagrams for event bus and integrations
- Code structure specified for tRPC and components

**Approvals:**
- Database Architect signs off on schema
- Security Architect signs off on RLS policies
- Performance Architect signs off on optimization strategy

---

## Timeline

**Estimated Review Time:** 4-6 hours

**Expected Completion:** Within 1 business day

**Handoff to Developer:** Once all 5 documents created and approved

---

## Questions for PM Agent

If you need clarification on:
- Business requirements
- User story acceptance criteria
- Priority or sequencing
- Trade-offs between options

**Contact:** Reply in this thread or create issue in project tracking

---

## Additional Context

**Sprint 1 Achievements:**
- Database schema with multi-tenancy (Migration 007)
- RBAC system (roles, permissions, user_roles)
- Audit logging with partitioning
- Supabase Auth configured

**Package.json Status:**
- Next.js 15.1.3 ✅
- Drizzle ORM ✅
- Zod ✅
- Zustand ✅
- tRPC ❌ (need to install)
- Sentry ❌ (need to install)
- React Hook Form ❌ (need to install)

**Migration Files:**
- `/supabase/migrations/20251119184000_add_multi_tenancy.sql` (Migration 007)
- Next migration: `008_create_event_bus.sql` (your responsibility)

---

**Status:** ✅ READY FOR ARCHITECT REVIEW

**Next Agent:** Architect Agent (you!)

**Blocked:** Developer Agent, QA Agent (waiting for your designs)

---

**End of Handoff Document**
