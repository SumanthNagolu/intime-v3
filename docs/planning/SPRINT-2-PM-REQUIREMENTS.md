# Sprint 2 PM Requirements: Event Bus & API Foundation

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Total Story Points:** 26
**Status:** Ready for Architect Review
**Author:** PM Agent
**Date:** 2025-11-19

---

## Executive Summary

Sprint 2 establishes the **communication backbone** and **API infrastructure** for InTime v3, enabling modules to interact without tight coupling and providing type-safe client-server communication. This sprint is critical to avoiding the architectural mistakes of the legacy project where modules were built in isolation and integration was attempted afterward.

### Sprint Goals

1. **Event-Driven Architecture**: Implement PostgreSQL-based event bus for asynchronous cross-module communication
2. **Type-Safe APIs**: Establish tRPC infrastructure for all client-server interactions
3. **Robust Error Handling**: Create unified error handling and validation patterns
4. **Developer Experience**: Provide declarative patterns that reduce boilerplate and prevent bugs

### Success Criteria

- Event bus publishes and processes events with < 50ms latency
- Failed events retry automatically and move to dead letter queue after 3 attempts
- tRPC provides end-to-end type safety from client to database
- All API inputs validated with Zod schemas
- Errors logged to Sentry (production) with sensitive data scrubbed
- Admin UI available for monitoring event handlers and dead letter queue

---

## Sprint 1 Foundation Review

### Completed Infrastructure (Validated by Database Architect)

**Database Schema:**
- Unified `user_profiles` table with role-based columns
- RBAC system (`roles`, `permissions`, `user_roles`, `role_permissions`)
- Audit logging with monthly partitioning (`audit_logs`, `audit_log_retention_policy`)
- Multi-tenancy support (`organizations` table with `org_id` enforcement)
- Row Level Security (RLS) enabled on ALL tables

**Authentication:**
- Supabase Auth configured and working
- Login/signup flows implemented
- Session management via cookies

**Key Constraints from Sprint 1:**
1. All new tables MUST include `org_id UUID NOT NULL REFERENCES organizations(id)`
2. All tables MUST have RLS policies enabled
3. All mutable tables SHOULD include `deleted_at TIMESTAMPTZ` for soft deletes
4. All critical operations MUST be audit logged via triggers
5. Use `UUID` for IDs, `TIMESTAMPTZ` for timestamps, `JSONB` for structured data

### Technical Debt to Address

**Missing Dependencies (NOT in scope for Sprint 1):**
- No tRPC installed (`@trpc/server`, `@trpc/client`, `@trpc/react-query`)
- No event bus tables (`events`, `event_subscriptions`)
- No error tracking (Sentry not configured)
- No unified validation schemas (Zod schemas scattered)

---

## Story Breakdown & Priorities

### Track 1: Event Bus (16 Story Points)

#### FOUND-007: Build Event Bus Using PostgreSQL LISTEN/NOTIFY (8 SP)
**Priority:** CRITICAL
**Status:** Ready for Development

**Business Value:**
Enables cross-pollination workflows where 1 conversation creates 5+ business opportunities across Training, Recruiting, Bench Sales, and Placement modules.

**Acceptance Criteria (Refined):**
1. Database tables created (`events`, `event_subscriptions`)
2. PostgreSQL functions implemented:
   - `publish_event()` - Persists event + sends NOTIFY
   - `mark_event_processed()` - Updates event status
   - `mark_event_failed()` - Increments retry count, moves to dead letter after 3 failures
   - `replay_failed_events()` - Resets failed events to pending
3. TypeScript EventBus class:
   - `publish()` - Publish event with metadata
   - `subscribe()` - Register handler for event type
   - `startListening()` - Listen to PostgreSQL NOTIFY channel
   - `handleEvent()` - Execute registered handlers
4. Event types defined for core workflows:
   - `user.created`
   - `user.onboarding_completed`
   - `course.graduated`
   - `candidate.placed`
   - `job.created`
5. Performance: Publish → Handler execution < 50ms (95th percentile)
6. Reliability: 3 automatic retries before dead letter queue
7. Multi-tenancy: `org_id` enforced on all events

**Technical Constraints:**
- MUST use PostgreSQL LISTEN/NOTIFY (no external message brokers in Sprint 2)
- Events table MUST include `org_id UUID NOT NULL REFERENCES organizations(id)`
- Event handlers MUST be idempotent (replay-safe)
- MUST enable RLS on `events` and `event_subscriptions` tables
- MUST add audit logging trigger for event publishing

**Dependencies:**
- Sprint 1 database schema (COMPLETED)
- `organizations` table (COMPLETED)

**Testing Requirements:**
- Unit tests for `publish_event()`, `mark_event_processed()`, `mark_event_failed()`
- Integration test: Publish event → Handler executes → Event marked processed
- Error test: Handler throws error → Event retried → Moved to dead letter after 3 failures
- Performance test: 100 events/second throughput
- Multi-tenancy test: User in Org A cannot see events from Org B

---

#### FOUND-008: Create Event Subscription System (5 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Allows module developers to subscribe to events without knowing implementation details of other modules, enabling true decoupling.

**Acceptance Criteria (Refined):**
1. Handler registry service:
   - `register()` - Register event handler with metadata
   - `executeHandler()` - Execute handler with health monitoring
   - `setHandlerStatus()` - Enable/disable handler
   - `getHandlerHealth()` - Return health metrics for all handlers
2. Decorator pattern:
   - `@EventHandler(eventType, handlerName)` - Declarative handler registration
3. Auto-discovery mechanism:
   - Handlers imported via `src/lib/events/handlers/index.ts`
   - Registration happens at module load time
4. Health monitoring:
   - Track failure count per handler
   - Auto-disable handler after 5 consecutive failures
   - Last failure timestamp tracked
5. Admin API endpoints:
   - `GET /api/admin/event-handlers` - List all handlers with health status
   - `PATCH /api/admin/event-handlers` - Enable/disable handler
6. Admin UI:
   - View all registered handlers
   - See failure counts and last failure time
   - Enable/disable handlers manually
   - Filter by event type or status

**Technical Constraints:**
- Handler registry MUST be singleton
- Handlers MUST be registered before app starts listening
- Admin API MUST require `system:admin` permission
- Disabled handlers SHOULD skip events (not retry)
- Handler failures MUST be logged to audit log

**Dependencies:**
- FOUND-007 (Event Bus) - MUST be completed first

**Testing Requirements:**
- Unit test: Handler registered via decorator
- Integration test: Handler executes when event published
- Health test: Handler auto-disabled after 5 failures
- Admin test: Enable/disable handler via API
- Permission test: Non-admin cannot access admin API

---

#### FOUND-009: Implement Event History and Replay (3 SP)
**Priority:** MEDIUM
**Status:** Ready for Development

**Business Value:**
Enables debugging of cross-module workflows and recovery from temporary failures (e.g., external API down, database timeout).

**Acceptance Criteria (Refined):**
1. Event history API:
   - `GET /api/admin/events` - List events with pagination, filters (type, status, date range)
   - `POST /api/admin/events/replay` - Replay selected events
   - `GET /api/admin/events/export` - Export events to JSON/CSV
2. Dead letter queue viewer:
   - Show events that failed after 3 retries
   - Display error messages and retry history
3. Replay functionality:
   - Bulk replay (all failed events)
   - Selective replay (specific event IDs)
   - Confirmation dialog before replay
4. Event details modal:
   - Full payload and metadata
   - Error message and stack trace (if failed)
   - Processing timeline (published → retry attempts → final status)
5. Admin UI features:
   - Filters: Event type, status, date range
   - Checkbox selection for bulk operations
   - Export to JSON/CSV for analysis
   - Real-time updates (optional: use Supabase real-time subscriptions)

**Technical Constraints:**
- Replay MUST reset `retry_count` to 0 and `status` to 'pending'
- Replayed events MUST include `metadata.replayed = true`
- Export MUST limit to 1000 events per request
- CSV export MUST escape special characters
- Admin API MUST require `system:admin` permission

**Dependencies:**
- FOUND-007 (Event Bus) - MUST be completed first
- FOUND-008 (Event Subscriptions) - For viewing handler status

**Testing Requirements:**
- Query test: Fetch events with filters
- Replay test: Failed event replayed and processed successfully
- Export test: JSON/CSV export contains correct data
- Permission test: Non-admin cannot access event history

---

### Track 2: API Infrastructure (10 Story Points)

#### FOUND-010: Set Up tRPC Routers and Middleware (5 SP)
**Priority:** CRITICAL
**Status:** Ready for Development

**Business Value:**
Provides type-safe API calls with autocomplete, preventing entire classes of bugs (wrong parameter types, missing fields, typos) that plagued the legacy project.

**Acceptance Criteria (Refined):**
1. tRPC packages installed:
   - `@trpc/server`, `@trpc/client`, `@trpc/react-query@next`, `@tanstack/react-query`, `superjson`
2. Base configuration:
   - Context includes `session`, `userId`, `supabase` client
   - SuperJSON transformer for Date/Map/Set serialization
   - Error formatter exposes Zod validation errors
3. Middleware:
   - `isAuthenticated` - Requires valid session
   - `requirePermission(resource, action)` - Checks RBAC permissions
4. Procedure types:
   - `publicProcedure` - No auth required
   - `protectedProcedure` - Requires authentication
   - `adminProcedure` - Requires admin role
5. Example routers:
   - `users` - me, updateProfile, list (admin), getById (admin)
   - `candidates` - create, update, list, getById
   - `jobs` - create, update, list, getById
   - `students` - create, update, list, getById
6. Next.js App Router integration:
   - API handler at `/api/trpc/[trpc]/route.ts`
   - Provider component with React Query
   - Client hooks auto-generated
7. Type safety verification:
   - Client calls infer correct types
   - Input validation runs on server
   - Return types match database schema

**Technical Constraints:**
- Context creation MUST use Next.js cookies for session
- MUST use Supabase RLS (don't bypass with service role key)
- Error responses MUST NOT leak sensitive data in production
- Batch requests MUST be enabled (default)
- MUST support Next.js 15 App Router (NOT Pages Router)

**Dependencies:**
- Sprint 1 RBAC system (COMPLETED)
- Sprint 1 authentication (COMPLETED)

**Gap Identified:**
The user story assumes `requireAuth()` and `checkPermission()` exist but these are NOT in Sprint 1. Need to create:
- `src/lib/auth/server.ts` - `requireAuth()` helper
- `src/lib/rbac/index.ts` - `checkPermission()` helper

**Testing Requirements:**
- Auth test: Public procedure accessible without auth
- Auth test: Protected procedure blocks unauthenticated requests
- Permission test: Admin procedure blocks non-admin users
- Type test: TypeScript compilation succeeds with correct types
- Batch test: Multiple queries batched into single HTTP request

---

#### FOUND-011: Create Unified Error Handling (3 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Consistent error handling improves debugging efficiency and user experience. Prevents security leaks (stack traces in production).

**Acceptance Criteria (Refined):**
1. Custom error classes:
   - `AppError` - Base error with code, statusCode, metadata
   - `AuthenticationError` - 401 errors
   - `AuthorizationError` - 403 errors
   - `ValidationError` - 400 errors with field-level errors
   - `NotFoundError` - 404 errors
   - `RateLimitError` - 429 errors
   - `DatabaseError` - 500 errors
2. Sentry integration:
   - Initialize Sentry in production
   - Scrub sensitive data (passwords, tokens, cookies)
   - Set context (user ID, org ID, request path)
   - Categorize errors (warning for AppError, error for others)
3. React error boundary:
   - Catch component errors
   - Log to Sentry
   - Display user-friendly message
   - Show stack trace in development only
   - Provide "Reload Page" and "Go Home" buttons
4. Error response formatter:
   - Convert errors to consistent API response format
   - Map database errors to user-friendly messages
   - Hide stack traces in production
5. Toast notifications:
   - `showErrorToast()` - Display error via toast
   - `showSuccessToast()` - Display success message
6. Custom error pages:
   - 404 page with link to home
   - 500 page with retry button

**Technical Constraints:**
- MUST scrub PII before sending to Sentry
- Error messages MUST be user-friendly (no technical jargon)
- Stack traces MUST NOT be shown in production
- Error boundary MUST NOT catch errors in Server Components (Next.js limitation)
- MUST use `sonner` for toast notifications (already in shadcn/ui)

**Dependencies:**
- FOUND-010 (tRPC) - For API error handling

**Gap Identified:**
Sentry is NOT installed. Need to add:
- `@sentry/nextjs` package
- `NEXT_PUBLIC_SENTRY_DSN` environment variable
- Sentry initialization in `app/layout.tsx`

**Testing Requirements:**
- Error test: Custom error thrown and caught
- Boundary test: React error boundary catches component error
- Sentry test: Error logged to Sentry in production mode
- Scrubbing test: Passwords/tokens removed before logging
- Toast test: Error toast displays user-friendly message

---

#### FOUND-012: Implement Zod Validation Schemas (2 SP)
**Priority:** MEDIUM
**Status:** Ready for Development

**Business Value:**
Runtime validation prevents bad data from entering the system, reducing bugs and database corruption. Shared schemas eliminate duplication between client and server.

**Acceptance Criteria (Refined):**
1. Core validation patterns:
   - `emailSchema` - Valid email format
   - `passwordSchema` - 8+ chars, uppercase, lowercase, number
   - `phoneSchema` - E.164 format (optional)
   - `uuidSchema` - Valid UUID v4
2. Entity schemas:
   - `userProfileSchema` - Complete user profile
   - `updateProfileSchema` - Partial update (pick + partial)
   - `studentSchema` - Student-specific fields
   - `candidateSchema` - Candidate-specific fields
   - `jobSchema` - Job posting with salary/experience ranges
3. Auth schemas:
   - `signupSchema` - Email, password, full name, role
   - `loginSchema` - Email, password
   - `resetPasswordSchema` - Email
   - `updatePasswordSchema` - Current + new + confirm (with match validation)
4. Custom validation rules:
   - Job: `experience_years_max >= experience_years_min`
   - Job: `salary_max >= salary_min`
   - Password: Match confirmation
5. Form helpers:
   - `useZodForm()` - React Hook Form integration
   - `formatZodErrors()` - Convert Zod errors to field-level messages
6. tRPC integration:
   - All procedures use Zod schemas for input validation
   - Error responses include field-level validation errors

**Technical Constraints:**
- MUST use Zod for ALL input validation (no manual checks)
- Schemas MUST be co-located with routers
- Type inference MUST replace manual TypeScript types
- Error messages MUST be user-friendly
- React Hook Form integration MUST use `@hookform/resolvers/zod`

**Dependencies:**
- FOUND-010 (tRPC) - Schemas used in tRPC procedures

**Gap Identified:**
React Hook Form is NOT installed. Need to add:
- `react-hook-form` package
- `@hookform/resolvers` package

**Testing Requirements:**
- Validation test: Valid data passes schema
- Validation test: Invalid data rejected with clear messages
- Type test: Type inference works (no manual types needed)
- Form test: React Hook Form validates on submit
- tRPC test: Invalid input returns 400 with field errors

---

## Cross-Cutting Concerns

### Multi-Tenancy Enforcement

**Requirement:** ALL new tables MUST include `org_id` and enforce org isolation via RLS.

**Implementation:**
```sql
-- Event Bus Tables
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  -- ... other fields
);

-- RLS Policy
CREATE POLICY "Users can only access events in their org"
ON events FOR ALL
TO authenticated
USING (org_id = auth_user_org_id());
```

**Context Function (from Sprint 1):**
```sql
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

**Validation:**
- Database Architect will verify all new tables have `org_id`
- QA will test cross-org access is blocked

---

### Security Requirements

**Authentication:**
- All tRPC protected procedures MUST check `ctx.session`
- Admin procedures MUST verify `system:admin` permission
- Session MUST be validated on every request (no client-side caching)

**Authorization:**
- RLS policies MUST enforce org isolation
- Event handlers MUST run with user context (not admin)
- Admin APIs MUST check permissions before execution

**Data Protection:**
- Sentry MUST scrub passwords, tokens, cookies before logging
- Error messages MUST NOT leak sensitive data
- Stack traces MUST NOT be shown in production

**Audit Logging:**
- Event publishing MUST be audit logged (via trigger)
- Handler failures MUST be audit logged
- Admin actions (enable/disable handlers) MUST be audit logged

---

### Performance Requirements

**Event Bus:**
- Publish latency: < 50ms (95th percentile)
- Handler execution: < 500ms per handler (warning if exceeded)
- Throughput: 100 events/second sustained load
- Dead letter queue: Auto-archive after 30 days

**tRPC:**
- Request batching: Enabled by default
- Response caching: Use React Query defaults
- Connection pooling: Use Supabase connection pool
- Timeout: 30 seconds per request

**Database:**
- Event queries: Use indexes on `type`, `status`, `org_id`, `published_at`
- Pagination: Limit to 100 records per request
- Partitioning: Consider monthly partitions if > 1M events

---

### Monitoring & Observability

**Event Bus Metrics:**
- Events published per hour
- Events processed per hour
- Events in dead letter queue
- Handler failure rate by type
- Average processing latency

**tRPC Metrics:**
- Request count by route
- Error rate by route
- Average response time
- Validation error rate

**Error Tracking (Sentry):**
- Error count by type
- Error rate per hour
- Affected users
- Stack traces and context

**Dashboards:**
- Admin event handler health page (FOUND-008)
- Admin event history page (FOUND-009)
- Sentry dashboard (external)

---

## Integration Points

### Event Bus ↔ API Track

**Scenario 1: Student Graduates (Course Module)**
1. Course module publishes `course.graduated` event via tRPC mutation
2. Event bus persists event and notifies listeners
3. Recruiting handler creates candidate profile via database insert
4. Event marked as processed

**Scenario 2: Job Created (Recruiting Module)**
1. tRPC mutation validates job data with Zod schema
2. Job inserted into database
3. Database trigger publishes `job.created` event
4. Event handler notifies matching candidates via email

**Integration Test:**
- End-to-end flow: tRPC mutation → Event published → Handler executes
- Validation: Zod schema rejects invalid job data
- Error handling: Handler failure retries and moves to dead letter queue

---

## Non-Functional Requirements

### Reliability
- Event delivery: At least once (3 retries)
- Handler idempotency: Handlers MUST be safe to run multiple times
- Data integrity: PostgreSQL transactions for publish + notify

### Scalability
- Event volume: Support 10K events/day initially
- Handler concurrency: Support 10 concurrent handlers per event type
- Database: Partition `events` table monthly if > 1M records

### Maintainability
- Code coverage: 80%+ for event bus and tRPC routers
- Documentation: API docs auto-generated from tRPC schemas
- Error messages: Developer-friendly with context

### Developer Experience
- Type safety: End-to-end from client to database
- Auto-complete: Full IntelliSense in VSCode
- Fast feedback: TypeScript errors at compile time
- Declarative patterns: `@EventHandler` decorator, Zod schemas

---

## Recommended Implementation Sequence

### Week 3 (First Half)

**Day 1-2: Event Bus Foundation**
1. FOUND-007 database schema (Migration 008)
2. FOUND-007 PostgreSQL functions
3. FOUND-007 TypeScript EventBus class
4. FOUND-007 example event types

**Day 3-4: tRPC Infrastructure**
1. Install tRPC packages
2. FOUND-010 base configuration and context
3. FOUND-010 middleware (auth, permissions)
4. FOUND-010 example `users` router

### Week 3 (Second Half)

**Day 5-6: Event Subscriptions**
1. FOUND-008 handler registry service
2. FOUND-008 decorator pattern
3. FOUND-008 admin API
4. FOUND-008 admin UI

**Day 7: Validation & Error Handling**
1. Install Sentry
2. FOUND-011 custom error classes
3. FOUND-011 error boundary and pages
4. FOUND-012 core Zod schemas

### Week 4 (First Half)

**Day 8-9: Complete API Track**
1. FOUND-010 remaining routers (candidates, jobs, students)
2. FOUND-010 client provider and hooks
3. FOUND-012 form helpers and integration

**Day 10-11: Event History & Polish**
1. FOUND-009 event history API
2. FOUND-009 replay functionality
3. FOUND-009 admin UI
4. FOUND-011 toast notifications

### Week 4 (Second Half)

**Day 12-14: Integration & Testing**
1. End-to-end integration tests (Event Bus ↔ tRPC)
2. Performance testing (latency, throughput)
3. Security testing (RLS, permissions, data scrubbing)
4. Documentation updates

---

## Testing Strategy

### Unit Tests (Track 1: Event Bus)
- PostgreSQL functions (`publish_event`, `mark_event_processed`, `mark_event_failed`)
- EventBus class methods
- Handler registry methods
- Event type validators

### Unit Tests (Track 2: API)
- tRPC middleware (auth, permissions)
- Custom error classes
- Zod schemas
- Error formatters

### Integration Tests
- Event published → Handler executes → Event marked processed
- tRPC mutation → Database insert → Event published
- Failed handler → Retry → Dead letter queue
- Admin API → Enable/disable handler → Handler skips events

### End-to-End Tests
- User signup → `user.created` event → Welcome email sent
- Job created via tRPC → `job.created` event → Candidates notified
- Event replay → Failed event reprocessed successfully

### Performance Tests
- 100 events/second sustained load
- tRPC batch request latency < 100ms
- Event publish latency < 50ms (95th percentile)

### Security Tests
- Non-admin cannot access admin APIs
- User in Org A cannot see events from Org B
- Sentry does NOT receive passwords/tokens
- Production errors do NOT include stack traces

---

## Success Metrics

### Functional Metrics
- All 6 stories completed (26 story points)
- 100% of acceptance criteria met
- 80%+ code coverage on critical paths
- All integration tests passing

### Quality Metrics
- Zero RLS policy violations in testing
- Zero security vulnerabilities (Sentry data scrubbing verified)
- Zero TypeScript errors in production build
- Zero API endpoints without Zod validation

### Performance Metrics
- Event publish → Handler execution < 50ms (95th percentile)
- tRPC API response time < 100ms (95th percentile)
- Event bus throughput: 100 events/second sustained
- Dead letter queue: < 1% of events after tuning

### Developer Experience Metrics
- Full type inference working (no `any` types)
- VSCode autocomplete working for tRPC calls
- Error messages actionable (no "Unknown error occurred")
- Documentation complete for all new patterns

---

## Risks & Mitigation Strategies

### Risk 1: PostgreSQL LISTEN/NOTIFY Scalability
**Likelihood:** Medium
**Impact:** High (if event volume exceeds 10K/day)

**Mitigation:**
- Monitor event throughput daily
- Set alert threshold at 5K events/day
- Prepare migration plan to RabbitMQ/Kafka if needed
- Document migration criteria (when to switch)

**Fallback Plan:**
- Implement polling-based event processing as backup
- Use database triggers to publish to external queue

---

### Risk 2: tRPC Package Compatibility with Next.js 15
**Likelihood:** Low
**Impact:** High (blocking if incompatible)

**Mitigation:**
- Verify tRPC v11 supports Next.js 15 App Router (check GitHub issues)
- Test basic setup before starting development
- Have fallback to REST API if tRPC fails

**Current Status:**
- `package.json` shows Next.js 15.1.3 installed
- tRPC v11 officially supports Next.js 15 (verified on tRPC docs)

---

### Risk 3: Zod Schema Duplication with Database Schema
**Likelihood:** Medium
**Impact:** Medium (maintenance burden)

**Mitigation:**
- Generate Zod schemas from Drizzle ORM schema (use `drizzle-zod` package)
- Document which is source of truth (answer: Drizzle schema)
- Create migration script to sync Zod schemas from database

**Decision Required:**
- Architect to decide: Hand-write Zod schemas OR generate from Drizzle?

---

### Risk 4: Sentry Cost Overrun
**Likelihood:** Low
**Impact:** Low (cost containable)

**Mitigation:**
- Start with free tier (5K errors/month)
- Set rate limits on error logging (max 100/minute)
- Use sampling (10% in production initially)
- Monitor Sentry quota daily

---

### Risk 5: Event Handler Cascades (Infinite Loops)
**Likelihood:** Medium
**Impact:** High (system freeze)

**Mitigation:**
- Document event naming convention (handlers cannot publish same event type)
- Add circuit breaker (max 100 events published per handler execution)
- Add `metadata.source` to track event origin
- Implement event depth limit (max 3 levels of cascading)

**Prevention:**
- Code review checklist: "Does this handler publish the event it's listening to?"

---

## Open Questions for Architect Agent

### Question 1: Zod Schema Generation Strategy
**Context:** Drizzle ORM already defines database schema. Should we:
- **Option A:** Hand-write Zod schemas (full control, duplication risk)
- **Option B:** Generate Zod from Drizzle using `drizzle-zod` (DRY, less flexibility)

**Recommendation:** Option B with manual overrides where needed

---

### Question 2: Event Bus Persistence Strategy
**Context:** PostgreSQL LISTEN/NOTIFY is not persistent (notifications lost if no listeners).

**Current Approach:** Events persisted in `events` table before NOTIFY.

**Question:** Should we implement a background worker to process missed events (e.g., app restart)?

**Recommendation:** Yes, add cron job to reprocess `pending` events older than 5 minutes

---

### Question 3: tRPC Context Creation Performance
**Context:** Creating Supabase client on every request may impact performance.

**Question:** Should we:
- **Option A:** Create new client per request (current approach, safer)
- **Option B:** Use connection pooling (faster, more complex)

**Recommendation:** Start with Option A, profile in Week 4, optimize if needed

---

### Question 4: Admin UI Framework
**Context:** Stories specify admin UI for event handlers and event history.

**Question:** Should admin UI be:
- **Option A:** Server-rendered (Next.js Server Components)
- **Option B:** Client-rendered (tRPC hooks + React Query)

**Recommendation:** Option B for better UX (real-time updates, optimistic UI)

---

## Documentation Requirements

### For Architect Agent
- Database schema ERD for new tables (`events`, `event_subscriptions`)
- Event bus architecture diagram (publish → notify → handler flow)
- tRPC router structure and naming conventions
- RLS policy specifications for new tables

### For Developer Agent
- Event handler implementation guide
- tRPC router creation guide
- Zod schema pattern examples
- Error handling best practices

### For QA Agent
- Event bus test scenarios
- tRPC integration test plan
- Security test checklist (RLS, permissions, data scrubbing)

### For Deployment Agent
- Sentry configuration steps
- Environment variables required
- Database migration sequence
- Post-deployment verification script

---

## Approval Checklist

**PM Agent (This Document):**
- [x] All acceptance criteria refined and testable
- [x] Dependencies verified against Sprint 1 actuals
- [x] Technical constraints documented
- [x] Gaps identified (missing packages, helpers)
- [x] Risks assessed with mitigation strategies
- [x] Implementation sequence recommended
- [x] Success metrics defined

**Next Steps:**
1. Architect Agent reviews this document
2. Architect creates technical design (database schema, API contracts, component architecture)
3. Developer Agent implements based on Architect's design
4. QA Agent validates against acceptance criteria
5. Deployment Agent deploys to staging/production

---

**Document Status:** ✅ READY FOR ARCHITECT REVIEW

**Estimated Review Time:** 2-3 hours

**Expected Outputs from Architect:**
1. Database migration files (008_create_event_bus.sql)
2. tRPC router structure and type definitions
3. Component architecture diagram
4. RLS policy specifications
5. Performance optimization recommendations

---

**End of Document**
