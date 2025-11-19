# Epic 1: Foundation & Core Platform - User Stories

**Epic Duration:** 4 weeks (Week 1-4)
**Total Stories:** 18 stories
**Total Story Points:** 67 points
**Sprint Breakdown:** 3 sprints (2 weeks each for first 2, final cleanup)

---

## Sprint 1: Core Infrastructure (Week 1-2, 34 points)

### Database & Schema
- [FOUND-001](./FOUND-001-database-schema.md) - Create unified user_profiles table (5 points)
- [FOUND-002](./FOUND-002-role-system.md) - Implement role-based access control (8 points)
- [FOUND-003](./FOUND-003-audit-tables.md) - Create audit logging tables (3 points)
- [FOUND-004](./FOUND-004-rls-policies.md) - Implement Row Level Security policies (8 points)

### Authentication
- [FOUND-005](./FOUND-005-supabase-auth.md) - Configure Supabase Auth with email/password (5 points)
- [FOUND-006](./FOUND-006-role-assignment.md) - Create role assignment during signup (5 points)

**Sprint 1 Total:** 34 points

---

## Sprint 2: Event Bus & API Foundation (Week 3-4, 26 points)

### Event System
- [FOUND-007](./FOUND-007-event-bus.md) - Build event bus using PostgreSQL LISTEN/NOTIFY (8 points)
- [FOUND-008](./FOUND-008-event-subscriptions.md) - Create event subscription system (5 points)
- [FOUND-009](./FOUND-009-event-replay.md) - Implement event history and replay (3 points)

### API Infrastructure
- [FOUND-010](./FOUND-010-trpc-setup.md) - Set up tRPC routers and middleware (5 points)
- [FOUND-011](./FOUND-011-error-handling.md) - Create unified error handling (3 points)
- [FOUND-012](./FOUND-012-zod-validation.md) - Implement Zod validation schemas (2 points)

**Sprint 2 Total:** 26 points

---

## Sprint 3: Testing & Polish (Week 5-6, 7 points)

### Testing Infrastructure
- [FOUND-013](./FOUND-013-test-setup.md) - Configure Vitest and Playwright (2 points)
- [FOUND-014](./FOUND-014-integration-tests.md) - Write integration tests for auth + RLS (3 points)
- [FOUND-015](./FOUND-015-e2e-tests.md) - Create E2E test for signup flow (2 points)

### DevOps
- [FOUND-016](./FOUND-016-ci-pipeline.md) - Set up GitHub Actions CI pipeline (3 points)
- [FOUND-017](./FOUND-017-vercel-deployment.md) - Configure Vercel deployment (2 points)
- [FOUND-018](./FOUND-018-monitoring.md) - Set up Sentry error tracking (2 points)

**Sprint 3 Total:** 7 points (lighter sprint for polish & docs)

---

## Story Point Reference

- **1-2 points:** Simple task, < 4 hours
- **3-5 points:** Moderate complexity, 4-12 hours
- **8 points:** Complex, requires research, 12-20 hours
- **13+ points:** Too large, needs breakdown

---

## Dependencies

All stories in Sprint 1 must complete before Sprint 2 begins (database foundation required).

Stories FOUND-007 through FOUND-009 (Event Bus) can proceed in parallel with FOUND-010 through FOUND-012 (API) in Sprint 2.

---

## Definition of Done (All Stories)

- [ ] Code written and reviewed
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests pass
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no errors
- [ ] Documentation updated
- [ ] Merged to main branch

---

## Related Documentation

- [Epic 1 Canvas](../../epics/epic-01-foundation.md)
- [Database Schema](../../../architecture/DATABASE-SCHEMA.md)
- [Event-Driven Integration](../../../architecture/EVENT-DRIVEN-INTEGRATION.md)
