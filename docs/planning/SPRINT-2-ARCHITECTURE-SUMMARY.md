# Sprint 2: Architecture Summary

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

Sprint 2 establishes the communication backbone (Event Bus) and API infrastructure (tRPC) for InTime v3. All architecture documents are complete and ready for Developer Agent implementation.

**Total Story Points:** 26 SP
**Estimated Implementation Time:** 10-12 working days
**Completion Criteria:** All 6 stories (FOUND-007 through FOUND-012) implemented and tested

---

## Key Architecture Decisions

### 1. Event Bus: PostgreSQL LISTEN/NOTIFY (Not External Queue)

**Decision:** Use PostgreSQL's built-in LISTEN/NOTIFY for event propagation
**Rationale:**
- No additional infrastructure (no RabbitMQ, Kafka, Redis)
- Atomic with database transactions
- Sufficient for 100 events/second (current scale)
- Migration path to external queue exists if needed (> 10K events/day)

**Trade-off:** Limited to single PostgreSQL instance (not distributed)
**Mitigation:** Performance monitoring, migration plan ready

---

### 2. Event Persistence Strategy: Store-First, Then Notify

**Decision:** Events persisted to database BEFORE sending NOTIFY
**Rationale:**
- Guaranteed delivery (event survives app crash)
- Replay capability for debugging
- Audit trail for compliance

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION publish_event(...) RETURNS UUID AS $$
BEGIN
  INSERT INTO events (...) VALUES (...) RETURNING id INTO v_event_id;
  PERFORM pg_notify('channel', payload);
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. tRPC Context: New Supabase Client Per Request

**Decision:** Create new Supabase client for each request (not reused)
**Rationale:**
- Correct user context (cookies, session)
- No session leakage risk
- Simple implementation
- Performance acceptable (~1-2ms overhead)

**Future Optimization:** Connection pooling if profiling shows bottleneck

---

### 4. Zod Schemas: Generated from Drizzle (Not Hand-Written)

**Decision:** Use `drizzle-zod` to generate schemas from Drizzle ORM
**Rationale:**
- Single source of truth (database schema)
- Auto-sync validation with DB
- Less boilerplate (100+ lines saved)

**Trade-off:** Less flexibility for custom validation
**Mitigation:** Use `.refine()` and `.extend()` for custom rules

---

### 5. Admin UI: Client-Rendered with tRPC Hooks

**Decision:** Admin UI uses client components with React Query
**Rationale:**
- Real-time updates (event metrics, handler health)
- Optimistic UI (enable/disable handlers)
- Type safety with tRPC hooks
- Better UX for internal tools

**Trade-off:** Larger client bundle
**Acceptable:** Admin UI is internal, not public-facing

---

### 6. Error Handling: tRPC + Sentry + Error Boundary

**Decision:** Multi-layer error handling
1. tRPC validates input (Zod)
2. Sentry logs errors (production)
3. Error Boundary catches React errors
4. Event handlers retry automatically

**PII Scrubbing:** Passwords, tokens, cookies removed before Sentry
**User-Facing:** Friendly error messages (no stack traces in production)

---

### 7. Multi-Tenancy: RLS Enforced at Database Level

**Decision:** PostgreSQL RLS policies enforce org isolation
**Rationale:**
- Cannot bypass with application bugs
- Enforced for all queries (tRPC, Event handlers)
- Performance acceptable with proper indexes

**Validation:** QA tests cross-org access blocked

---

### 8. Handler Health Monitoring: Auto-Disable After 5 Failures

**Decision:** Handlers auto-disabled after 5 consecutive failures
**Rationale:**
- Prevents cascade failures
- Manual re-enable requires admin review
- Threshold balances transient errors vs. systemic issues

**Failure Schedule:**
- 1st: Might be transient
- 2nd-4th: Exponential backoff gives time to recover
- 5th: Likely systemic, disable to prevent resource waste

---

## Architecture Documents Created

| Document | Purpose | Pages | File |
|----------|---------|-------|------|
| Database Design | Migration 008 SQL | 35 | SPRINT-2-DATABASE-DESIGN.md |
| Event Bus Architecture | TypeScript implementation | 42 | SPRINT-2-EVENT-BUS-ARCHITECTURE.md |
| tRPC API Architecture | API routers & middleware | 38 | SPRINT-2-API-ARCHITECTURE.md |
| Integration Design | Event Bus ↔ tRPC flows | 28 | SPRINT-2-INTEGRATION-DESIGN.md |
| Implementation Guide | Step-by-step for Developer | 45 | SPRINT-2-IMPLEMENTATION-GUIDE.md |
| Architecture Summary | This document | 12 | SPRINT-2-ARCHITECTURE-SUMMARY.md |

**Total:** 200+ pages of detailed specifications

---

## Technical Stack

### New Dependencies

```json
{
  "@trpc/server": "^11.0.0",
  "@trpc/client": "^11.0.0",
  "@trpc/react-query": "^11.0.0",
  "@tanstack/react-query": "^5.0.0",
  "superjson": "^2.0.0",
  "drizzle-zod": "^0.5.0",
  "react-hook-form": "^7.50.0",
  "@hookform/resolvers": "^3.3.0",
  "@sentry/nextjs": "^8.0.0"
}
```

### Database Schema Updates

**New Tables:** None (event tables exist from Migration 005)
**Modified Tables:**
- `event_subscriptions` → Added `org_id`, health monitoring columns
- `events` → Added performance indexes

**New Functions:**
- `get_event_handler_health()`
- `disable_event_handler(uuid)`
- `enable_event_handler(uuid)`
- `get_events_filtered(...)`
- `replay_failed_events_batch(uuid[])`
- `user_has_permission(uuid, text, text)`

**New Views:**
- `v_dead_letter_queue`
- `v_event_metrics_24h`
- `v_handler_health`
- `v_event_bus_validation`

---

## File Structure

```
src/
├── server/
│   └── trpc/
│       ├── context.ts              # tRPC context creation
│       ├── init.ts                 # tRPC initialization
│       ├── middleware.ts           # Auth, permissions middleware
│       ├── root.ts                 # App router
│       └── routers/
│           ├── users.ts            # User procedures
│           ├── candidates.ts       # Candidate procedures
│           ├── jobs.ts             # Job procedures
│           ├── students.ts         # Student procedures
│           └── admin/
│               ├── events.ts       # Event management
│               └── handlers.ts     # Handler management
├── lib/
│   ├── events/
│   │   ├── EventBus.ts            # Main EventBus class
│   │   ├── HandlerRegistry.ts     # Handler registration
│   │   ├── decorators.ts          # @EventHandler decorator
│   │   ├── types.ts               # Event type definitions
│   │   ├── init.ts                # Initialize Event Bus
│   │   └── handlers/
│   │       ├── index.ts           # Auto-discovery
│   │       ├── user-handlers.ts   # User event handlers
│   │       └── course-handlers.ts # Course event handlers
│   ├── trpc/
│   │   ├── client.ts              # tRPC client
│   │   └── Provider.tsx           # React Query provider
│   ├── auth/
│   │   └── server.ts              # requireAuth() helper
│   ├── rbac/
│   │   └── index.ts               # checkPermission() helper
│   ├── db/
│   │   └── schema/
│   │       └── validations.ts     # Zod schemas (generated)
│   └── errors/
│       └── index.ts               # Custom error classes
├── app/
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts       # Next.js API handler
│   └── admin/
│       ├── handlers/
│       │   └── page.tsx           # Handler health UI
│       └── events/
│           └── page.tsx           # Event history UI
├── components/
│   ├── ErrorBoundary.tsx          # React error boundary
│   └── admin/
│       └── EventDetailsModal.tsx  # Event details
└── hooks/
    └── useZodForm.ts              # React Hook Form + Zod
```

**Total Files Created:** ~25 new files
**Total Lines of Code:** ~3,500 lines

---

## Performance Specifications

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Event publish | < 50ms | p95 latency |
| Event handler execution | < 500ms | p95 latency |
| tRPC single query | < 100ms | p95 latency |
| tRPC batched queries | < 150ms | 10 queries |
| Event throughput | 100 events/sec | Sustained load |
| Dead letter queue rate | < 1% | After tuning |

**Monitoring:**
- Event metrics tracked in `v_event_metrics_24h`
- Handler health in `v_handler_health`
- Sentry for error tracking

---

## Security Specifications

### Authentication

- All tRPC protected procedures validate session
- Admin procedures require `system:admin` permission
- Event handlers execute with user context (not service role, unless explicitly needed)

### Authorization

- RLS policies enforce org isolation
- `auth_user_org_id()` function checks user's org
- Permission checks via `user_has_permission()` function

### Data Protection

- Sentry scrubs passwords, tokens, cookies
- Error messages user-friendly (no technical jargon)
- Stack traces hidden in production
- Audit logging for all critical operations

---

## Testing Requirements

### Unit Tests

- EventBus publish, subscribe, handleEvent
- HandlerRegistry register, getHandlers
- tRPC middleware (auth, permissions)
- Zod schemas validation

**Target:** 80%+ code coverage

### Integration Tests

- Event published → Handler executes → Event marked processed
- tRPC mutation → Event published → Handler executes
- Failed handler → Retry → Dead letter queue
- Admin API → Enable/disable handler

**Target:** All critical paths covered

### Security Tests

- Non-admin cannot access admin APIs
- User in Org A cannot see events from Org B
- Sentry does NOT receive passwords/tokens
- Production errors do NOT include stack traces

**Target:** Zero vulnerabilities

---

## Acceptance Criteria Mapping

### FOUND-007: Event Bus (8 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| PostgreSQL functions created | ✅ Ready | Migration 008 |
| TypeScript EventBus class | ✅ Ready | EventBus.ts |
| Handlers registered | ✅ Ready | @EventHandler decorator |
| Performance < 50ms | ⏳ Verify | After implementation |
| Dead letter queue | ✅ Ready | mark_event_failed() |

### FOUND-008: Event Subscriptions (5 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| Handler registry | ✅ Ready | HandlerRegistry.ts |
| Decorator pattern | ✅ Ready | decorators.ts |
| Admin API | ✅ Ready | admin/handlers router |
| Admin UI | ✅ Ready | handlers/page.tsx |
| Auto-disable | ✅ Ready | Trigger in Migration 008 |

### FOUND-009: Event History (3 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| Event history API | ✅ Ready | admin/events router |
| Dead letter viewer | ✅ Ready | v_dead_letter_queue view |
| Replay functionality | ✅ Ready | replay_failed_events_batch() |
| Event details modal | ✅ Ready | EventDetailsModal.tsx |
| CSV export | ⏳ Optional | Future enhancement |

### FOUND-010: tRPC Setup (5 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| tRPC packages installed | ⏳ Dev task | pnpm add @trpc/* |
| Context creation | ✅ Ready | context.ts |
| Middleware | ✅ Ready | middleware.ts |
| Example routers | ✅ Ready | users, admin/* |
| Client hooks | ✅ Ready | client.ts, Provider.tsx |

### FOUND-011: Error Handling (3 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| Sentry installed | ⏳ Dev task | pnpm add @sentry/nextjs |
| Custom error classes | ✅ Ready | errors/index.ts |
| Error boundary | ✅ Ready | ErrorBoundary.tsx |
| PII scrubbing | ✅ Ready | Sentry config |
| Error pages | ✅ Ready | 404, 500 pages |

### FOUND-012: Zod Validation (2 SP)

| Criteria | Status | Evidence |
|----------|--------|----------|
| drizzle-zod installed | ⏳ Dev task | pnpm add drizzle-zod |
| Schemas generated | ✅ Ready | validations.ts |
| React Hook Form | ✅ Ready | useZodForm hook |
| tRPC integration | ✅ Ready | All routers use Zod |
| Form helpers | ✅ Ready | useZodForm.ts |

**Legend:**
- ✅ Ready = Specification complete
- ⏳ Dev task = Needs implementation
- ⏳ Verify = Needs testing

---

## Implementation Sequence

### Week 3

**Day 1-2:** Database & Event Bus Foundation (FOUND-007)
- Run Migration 008
- Implement EventBus, HandlerRegistry, decorators
- Create example handlers
- Write unit tests

**Day 3-4:** tRPC Infrastructure (FOUND-010)
- Install packages
- Create context, middleware, routers
- Set up client provider
- Write unit tests

**Day 5-6:** Event Subscriptions (FOUND-008)
- Handler auto-discovery
- Admin API for handlers
- Admin UI for handler health
- Test auto-disable trigger

**Day 7:** Validation & Error Handling (FOUND-011, FOUND-012)
- Install Sentry
- Create error classes and boundary
- Integrate React Hook Form
- Write error handling tests

### Week 4

**Day 8-9:** Event History & Replay (FOUND-009)
- Event history UI
- Event details modal
- Replay functionality
- Dead letter queue viewer

**Day 10-11:** Integration Testing
- End-to-end workflow tests
- Security tests (RLS, permissions)
- Performance benchmarks

**Day 12-14:** Documentation & Deployment
- Update README
- Create API documentation
- Deploy to staging
- Validate production

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Migration 008 tested on staging
- [ ] Environment variables configured
- [ ] Sentry DSN obtained

**Deployment:**
1. Run Migration 008 on production database
2. Deploy application code (Vercel)
3. Start Event Bus listener
4. Register all event handlers
5. Verify tRPC API working
6. Verify admin UI accessible

**Post-Deployment:**
- [ ] Smoke test: Create user → Event published
- [ ] Smoke test: Admin UI shows handlers
- [ ] Smoke test: Event metrics visible
- [ ] Monitor Sentry for errors
- [ ] Check Event Bus logs

---

## Risk Mitigation

### Risk 1: PostgreSQL LISTEN/NOTIFY Scalability

**Likelihood:** Medium (if event volume exceeds 10K/day)
**Impact:** High (event processing delays)

**Mitigation:**
- Monitor event throughput daily
- Alert threshold at 5K events/day
- Migration plan to RabbitMQ documented
- Polling-based fallback implemented

---

### Risk 2: tRPC Package Compatibility

**Likelihood:** Low (tRPC v11 supports Next.js 15)
**Impact:** High (blocking if incompatible)

**Mitigation:**
- Verified tRPC v11 + Next.js 15 compatibility
- Test basic setup before full implementation
- Fallback to REST API if tRPC fails

---

### Risk 3: Zod Schema Drift from Database

**Likelihood:** Medium (manual schema updates)
**Impact:** Medium (validation bugs)

**Mitigation:**
- Use `drizzle-zod` for auto-generation
- Database schema is source of truth
- Migration script to regenerate schemas
- Tests validate schema matches database

---

### Risk 4: Event Handler Cascades (Infinite Loops)

**Likelihood:** Medium (handler publishes same event type)
**Impact:** High (system freeze)

**Mitigation:**
- Code review checklist: "Does handler publish same event?"
- Circuit breaker (max 100 events per handler)
- `metadata.source` tracks event origin
- Event depth limit (max 3 levels of cascading)

---

## Open Questions (Answered)

### Q1: Zod Schema Generation Strategy
**Answer:** Use drizzle-zod (Option B)
**Rationale:** DRY principle, less duplication

### Q2: Event Persistence Strategy
**Answer:** Add cron job for missed events
**Rationale:** Handles app restart, NOTIFY lost

### Q3: tRPC Context Performance
**Answer:** New client per request (Option A)
**Rationale:** Correctness over optimization

### Q4: Admin UI Framework
**Answer:** Client-rendered with tRPC hooks (Option B)
**Rationale:** Better UX, real-time updates

---

## Next Steps

1. **Developer Agent:** Begin implementation following SPRINT-2-IMPLEMENTATION-GUIDE.md
2. **PM Agent:** Track progress, report blockers
3. **QA Agent:** Prepare test plan from acceptance criteria
4. **Deployment Agent:** Prepare staging environment

---

## Success Criteria

**Sprint 2 Complete When:**
- All 6 stories implemented (FOUND-007 through FOUND-012)
- 80%+ code coverage on critical paths
- All integration tests passing
- Admin UI functional (handlers, events)
- Event Bus processing events in < 50ms
- tRPC API responding in < 100ms
- Zero security vulnerabilities
- Deployed to production

**Estimated Completion:** Week 4, Day 14 (2025-12-03)

---

**Status:** ✅ READY FOR DEVELOPER AGENT

**Total Architecture Documents:** 6 documents, 200+ pages

---

**End of Architecture Summary**
