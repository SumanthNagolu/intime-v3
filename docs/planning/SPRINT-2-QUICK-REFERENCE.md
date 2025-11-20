# Sprint 2 Quick Reference Card

**Sprint:** Sprint 2 - Event Bus & API Foundation
**Duration:** 2 weeks (14 days)
**Total Story Points:** 26
**Status:** ✅ PM Review Complete - Ready for Architect

---

## Stories at a Glance

| Story | Title | SP | Priority | Track |
|-------|-------|----|---------:|-------|
| FOUND-007 | Event Bus (PostgreSQL LISTEN/NOTIFY) | 8 | CRITICAL | Event Bus |
| FOUND-008 | Event Subscription System | 5 | HIGH | Event Bus |
| FOUND-009 | Event History & Replay | 3 | MEDIUM | Event Bus |
| FOUND-010 | tRPC Routers & Middleware | 5 | CRITICAL | API |
| FOUND-011 | Unified Error Handling | 3 | HIGH | API |
| FOUND-012 | Zod Validation Schemas | 2 | MEDIUM | API |

**Total:** 26 SP

---

## Critical Requirements (Must-Have)

### 1. Multi-Tenancy
```sql
-- ALL new tables MUST include:
org_id UUID NOT NULL REFERENCES organizations(id)
```

### 2. Row Level Security
```sql
-- ALL tables MUST have RLS enabled:
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ALL tables MUST have org isolation policy:
CREATE POLICY "Org isolation" ON events
USING (org_id = auth_user_org_id());
```

### 3. Type Safety
```typescript
// ALL API inputs MUST be validated with Zod:
.input(createCandidateSchema)

// ALL tRPC calls MUST have full type inference:
const { data } = trpc.users.me.useQuery(); // data is typed!
```

### 4. Error Handling
```typescript
// ALL errors MUST use custom error classes:
throw new AuthenticationError('Invalid credentials');

// ALL errors MUST be logged to Sentry (production):
logError(error, { context: 'user-signup' });
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Event Publish Latency | < 50ms | 95th percentile |
| Event Handler Execution | < 500ms | Per handler |
| Event Throughput | 100/sec | Sustained load |
| tRPC Response Time | < 100ms | 95th percentile |
| Dead Letter Queue | < 1% | After tuning |

---

## Security Checklist

**Authentication:**
- [ ] All tRPC protected procedures check `ctx.session`
- [ ] Admin procedures verify `system:admin` permission
- [ ] Sessions validated on every request

**Authorization:**
- [ ] RLS policies enforce org isolation
- [ ] Event handlers run with user context
- [ ] Admin APIs check permissions before execution

**Data Protection:**
- [ ] Sentry scrubs passwords, tokens, cookies
- [ ] Error messages don't leak sensitive data
- [ ] Stack traces hidden in production

**Audit Logging:**
- [ ] Event publishing audit logged
- [ ] Handler failures audit logged
- [ ] Admin actions audit logged

---

## Implementation Sequence

### Week 3

**Days 1-2:** Event Bus Foundation
- Migration 008 (events, event_subscriptions)
- PostgreSQL functions (publish_event, mark_event_*)
- EventBus TypeScript class

**Days 3-4:** tRPC Infrastructure
- Install packages
- Base configuration and context
- Middleware (auth, permissions)
- Users router

**Days 5-6:** Event Subscriptions
- Handler registry service
- Decorator pattern
- Admin API and UI

**Day 7:** Validation & Errors
- Install Sentry
- Custom error classes
- Core Zod schemas

### Week 4

**Days 8-9:** Complete API Track
- Remaining routers (candidates, jobs, students)
- Client provider and hooks
- Form helpers

**Days 10-11:** Event History & Polish
- Event history API
- Replay functionality
- Admin UI

**Days 12-14:** Integration & Testing
- End-to-end tests
- Performance testing
- Security testing
- Documentation

---

## Package Dependencies

**Need to Install:**
```bash
# tRPC
pnpm add @trpc/server @trpc/client @trpc/react-query@next
pnpm add @tanstack/react-query superjson

# Error Tracking
pnpm add @sentry/nextjs

# Forms
pnpm add react-hook-form @hookform/resolvers

# Optional: Zod schema generation
pnpm add drizzle-zod
```

**Already Installed:**
- Next.js 15.1.3 ✅
- Drizzle ORM ✅
- Zod ✅
- Zustand ✅

---

## Missing Helpers (Create First)

```typescript
// src/lib/auth/server.ts
export async function requireAuth(): Promise<Session> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new AuthenticationError();
  return session;
}

// src/lib/rbac/index.ts
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  // Query role_permissions via user_roles
  // Return true if user has permission
}
```

---

## Key Files to Create

### Database
- `/supabase/migrations/008_create_event_bus.sql`

### Event Bus
- `/src/lib/events/event-bus.ts`
- `/src/lib/events/event-types.ts`
- `/src/lib/events/handler-registry.ts`
- `/src/lib/events/decorators.ts`
- `/src/lib/events/handlers/index.ts`

### tRPC
- `/src/lib/trpc/trpc.ts`
- `/src/lib/trpc/routers/_app.ts`
- `/src/lib/trpc/routers/users.ts`
- `/src/lib/trpc/routers/candidates.ts`
- `/src/lib/trpc/routers/jobs.ts`
- `/src/lib/trpc/routers/students.ts`
- `/src/lib/trpc/client.ts`
- `/src/lib/trpc/Provider.tsx`
- `/src/app/api/trpc/[trpc]/route.ts`

### Validation
- `/src/lib/validation/schemas.ts`
- `/src/lib/validation/form-helpers.ts`

### Error Handling
- `/src/lib/errors/custom-errors.ts`
- `/src/lib/errors/error-logger.ts`
- `/src/lib/errors/format-error.ts`
- `/src/lib/errors/toast-error.ts`
- `/src/components/error-boundary.tsx`
- `/src/app/not-found.tsx`
- `/src/app/error.tsx`

### Admin UIs
- `/src/app/admin/event-handlers/page.tsx`
- `/src/app/admin/events/page.tsx`
- `/src/app/api/admin/event-handlers/route.ts`
- `/src/app/api/admin/events/route.ts`
- `/src/app/api/admin/events/replay/route.ts`
- `/src/app/api/admin/events/export/route.ts`

---

## Testing Strategy

**Unit Tests:**
- PostgreSQL functions (publish_event, mark_event_*)
- EventBus class methods
- tRPC middleware
- Custom error classes
- Zod schemas

**Integration Tests:**
- Event published → Handler executes → Marked processed
- tRPC mutation → Database → Event published
- Failed handler → Retry → Dead letter queue

**End-to-End Tests:**
- User signup → user.created → Welcome email
- Job created → job.created → Candidates notified
- Event replay → Failed event reprocessed

**Performance Tests:**
- 100 events/second sustained
- Event latency < 50ms
- tRPC latency < 100ms

**Security Tests:**
- Non-admin blocked from admin APIs
- Cross-org access blocked
- Sentry doesn't receive PII
- Production errors hide stack traces

---

## Open Questions (For Architect)

1. **Zod Schema Generation:** Hand-write OR generate from Drizzle?
2. **Event Persistence:** Add background worker for missed events?
3. **tRPC Context:** New client per request OR connection pooling?
4. **Admin UI:** Server Components OR Client Components with tRPC?

---

## Success Metrics

**Functional:**
- ✅ All 6 stories completed (26 SP)
- ✅ 100% acceptance criteria met
- ✅ 80%+ code coverage

**Quality:**
- ✅ Zero RLS violations
- ✅ Zero security vulnerabilities
- ✅ Zero TypeScript errors
- ✅ Zero unvalidated API endpoints

**Performance:**
- ✅ Event latency < 50ms (p95)
- ✅ tRPC latency < 100ms (p95)
- ✅ 100 events/sec throughput

**Developer Experience:**
- ✅ Full type inference
- ✅ VSCode autocomplete working
- ✅ Actionable error messages

---

## Document References

**Full Requirements:** `/docs/planning/SPRINT-2-PM-REQUIREMENTS.md` (30 pages)
**Executive Summary:** `/docs/planning/SPRINT-2-PM-SUMMARY.md` (6 pages)
**Architect Handoff:** `/docs/planning/ARCHITECT-HANDOFF-SPRINT-2.md` (12 pages)
**User Stories:** `/docs/planning/stories/epic-01-foundation/FOUND-00[7-12].md`

---

## Contact

**PM Agent:** For business requirements, priorities, trade-offs
**Architect Agent:** For technical design, architecture decisions
**Developer Agent:** For implementation questions
**QA Agent:** For testing strategy, acceptance criteria

---

**Status:** ✅ PM REVIEW COMPLETE
**Next:** Architect technical design
**Timeline:** 4-6 hours for Architect review

---

**Last Updated:** 2025-11-19
