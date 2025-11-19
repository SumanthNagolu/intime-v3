# Epic 01: Foundation & Core Platform - Requirements Document

**Epic ID:** EPIC-01-FOUNDATION
**Status:** Ready for Implementation
**Priority:** P0 (CRITICAL - Blocks all other work)
**Effort:** 67 story points across 18 stories
**Duration:** 4 weeks (3 sprints)
**Created:** 2025-11-18
**Last Updated:** 2025-11-19

---

## 📋 Executive Summary

Epic 01 establishes the unified technical foundation for InTime v3, enabling all 5 business pillars (Training Academy, Recruiting Services, Bench Sales, Talent Acquisition, Cross-Border Solutions) to operate on a single, scalable platform.

**Key Deliverables:**
- Unified user management system supporting multi-role users
- Enterprise-grade authentication and authorization (Supabase Auth + RLS)
- Event-driven architecture for cross-module communication
- Type-safe API infrastructure (tRPC + Zod validation)
- Production-ready testing and deployment pipeline

**Business Impact:**
- Eliminates data silos (1 user table vs. legacy's 3 separate systems)
- Enables 10× scalability from day one
- Reduces development time for future features by 40%
- Prevents $200K+ in technical debt remediation costs

---

## 🎯 Business Objectives

### Primary Goals

1. **Unified Data Model**
   - Single source of truth for all user data
   - Multi-role support (students can become employees, candidates, etc.)
   - Cross-pollination tracking (1 conversation = 5+ business opportunities)

2. **Scalability Foundation**
   - Support 100 users (Year 0) → 10,000 users (Year 3)
   - Event bus handling 1,000+ events/day by Week 4
   - Sub-2s page load times (Lighthouse Performance 90+)

3. **Security & Compliance**
   - Row-level security on ALL tables (database-enforced)
   - Complete audit trails (created_by, updated_by, soft deletes)
   - 6-month audit log retention for compliance

4. **Developer Experience**
   - New developer can create a page in <5 minutes
   - Type-safe end-to-end (TypeScript + tRPC + Zod)
   - 80%+ test coverage on critical paths

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User table consolidation | 1 table (vs. 3 in legacy) | Database schema count |
| RLS coverage | 100% of tables | Security audit |
| Page load time | <2s | Lighthouse Performance |
| Test coverage | 80%+ on critical paths | Vitest coverage report |
| Event bus throughput | 1,000+ events/day | Week 4 monitoring |
| Developer onboarding | <5min to create new page | Time tracking |

---

## 👥 User Personas

### All System Users

This epic affects **all user types** in the InTime ecosystem:

1. **Students** - Training Academy enrollees
2. **Trainers** - Academy instructors and mentors
3. **Recruiters** - Recruiting Services team
4. **Bench Sales** - Consultants on bench
5. **Talent Acquisition** - Outreach and pipeline builders
6. **Employees** - Internal staff (all roles)
7. **Admins** - System administrators
8. **Clients** - Companies hiring talent
9. **Candidates** - Job seekers (Academy graduates, external)

**Key Insight:** Users often have multiple roles (e.g., Student → Graduate → Candidate → Employee)

---

## 🔑 Key Features

### 1. Unified User Management

**Problem:** Legacy system had 3 separate user tables causing data silos and sync issues.

**Solution:** Single `user_profiles` table with role-specific nullable columns.

**User Stories:**
- FOUND-001: Create unified user_profiles table (5 pts)
- FOUND-002: Implement role-based access control (8 pts)
- FOUND-006: Create role assignment during signup (5 pts)

**Acceptance Criteria:**
- Single table supports all user types
- Multi-role users supported via junction table
- Zero data duplication across roles
- Email uniqueness enforced at database level

---

### 2. Enterprise Authentication & Authorization

**Problem:** Need secure, scalable auth supporting multiple roles and permissions.

**Solution:** Supabase Auth + Row Level Security (RLS) policies.

**User Stories:**
- FOUND-005: Configure Supabase Auth with email/password (5 pts)
- FOUND-004: Implement Row Level Security policies (8 pts)

**Acceptance Criteria:**
- Users can sign up, log in, reset password
- Session persists across page refreshes
- RLS policies prevent unauthorized data access
- Protected routes redirect to login
- Role-based permissions enforced at database level

---

### 3. Audit Logging & Compliance

**Problem:** Need complete audit trails for compliance and debugging.

**Solution:** Immutable audit_logs table with automatic triggers.

**User Stories:**
- FOUND-003: Create audit logging tables (3 pts)

**Acceptance Criteria:**
- All sensitive operations logged automatically
- Logs are immutable (no updates/deletes)
- 6-month retention with automatic partitioning
- Searchable by user, table, action, timestamp

---

### 4. Event-Driven Architecture

**Problem:** Modules need to communicate without tight coupling.

**Solution:** Event bus using PostgreSQL LISTEN/NOTIFY.

**User Stories:**
- FOUND-007: Build event bus using PostgreSQL LISTEN/NOTIFY (8 pts)
- FOUND-008: Create event subscription system (5 pts)
- FOUND-009: Implement event history and replay (3 pts)

**Acceptance Criteria:**
- Cross-module events (e.g., `course.graduated` → auto-create candidate)
- Guaranteed delivery with retry logic
- Dead letter queue for failed events
- Event replay capability for debugging

**Example Flow:**
```
Student graduates → Event: course.graduated
  ↓
Recruiting module subscribes → Auto-creates candidate profile
  ↓
Email sent to recruiting team
```

---

### 5. Type-Safe API Infrastructure

**Problem:** Runtime errors from API mismatches, poor DX.

**Solution:** tRPC for end-to-end type safety.

**User Stories:**
- FOUND-010: Set up tRPC routers and middleware (5 pts)
- FOUND-011: Create unified error handling (3 pts)
- FOUND-012: Implement Zod validation schemas (2 pts)

**Acceptance Criteria:**
- All API calls type-safe (TypeScript end-to-end)
- Runtime validation with Zod
- Auto-complete in IDE for API calls
- Unified error response format
- Integration with React Query for caching

---

### 6. Testing & Quality Assurance

**Problem:** Need automated testing to catch bugs early.

**Solution:** Vitest (unit/integration) + Playwright (E2E).

**User Stories:**
- FOUND-013: Configure Vitest and Playwright (2 pts)
- FOUND-014: Write integration tests for auth + RLS (3 pts)
- FOUND-015: Create E2E test for signup flow (2 pts)

**Acceptance Criteria:**
- 80%+ test coverage on critical paths
- Tests run automatically on every PR
- E2E tests for complete user flows
- Cross-browser testing (Chrome, Firefox, Safari)

---

### 7. CI/CD & Monitoring

**Problem:** Manual deployments are error-prone and slow.

**Solution:** GitHub Actions + Vercel + Sentry.

**User Stories:**
- FOUND-016: Set up GitHub Actions CI pipeline (3 pts)
- FOUND-017: Configure Vercel deployment (2 pts)
- FOUND-018: Set up Sentry error tracking (2 pts)

**Acceptance Criteria:**
- Automated CI/CD on every PR
- Preview deployments for code review
- Automatic production deployment on merge to main
- Error tracking with Sentry
- Build time <2 minutes

---

## 📊 Sprint Breakdown

### Sprint 1: Core Infrastructure (Week 1-2, 34 points)

**Focus:** Database foundation + Authentication

**Stories:**
1. FOUND-001 - Create unified user_profiles table (5 pts)
2. FOUND-002 - Implement RBAC system (8 pts)
3. FOUND-003 - Create audit logging tables (3 pts)
4. FOUND-004 - Implement RLS policies (8 pts)
5. FOUND-005 - Configure Supabase Auth (5 pts)
6. FOUND-006 - Role assignment during signup (5 pts)

**Deliverables:**
- Database schema migrated to production
- Users can sign up, log in, log out
- RLS policies prevent unauthorized access
- Audit logs capture all critical operations

**Definition of Done:**
- All migrations tested and rolled back successfully
- New user can complete signup → login → dashboard flow
- RLS policies validated with security tests
- Documentation updated with schema diagrams

---

### Sprint 2: Event Bus & API Foundation (Week 3-4, 26 points)

**Focus:** Cross-module communication + Type-safe APIs

**Stories:**
1. FOUND-007 - Build event bus using PostgreSQL LISTEN/NOTIFY (8 pts)
2. FOUND-008 - Create event subscription system (5 pts)
3. FOUND-009 - Implement event history and replay (3 pts)
4. FOUND-010 - Set up tRPC routers and middleware (5 pts)
5. FOUND-011 - Create unified error handling (3 pts)
6. FOUND-012 - Implement Zod validation schemas (2 pts)

**Deliverables:**
- Event bus operational with 5+ event types
- tRPC API routes with type safety
- Error handling with Sentry integration
- Zod validation on all inputs

**Definition of Done:**
- Event published in one module triggers action in another
- API calls have auto-complete in IDE
- Runtime validation catches invalid inputs
- Errors logged to Sentry with context

---

### Sprint 3: Testing & DevOps (Week 5-6, 7 points)

**Focus:** Quality assurance + Deployment automation

**Stories:**
1. FOUND-013 - Configure Vitest and Playwright (2 pts)
2. FOUND-014 - Write integration tests for auth + RLS (3 pts)
3. FOUND-015 - Create E2E test for signup flow (2 pts)
4. FOUND-016 - Set up GitHub Actions CI pipeline (3 pts)
5. FOUND-017 - Configure Vercel deployment (2 pts)
6. FOUND-018 - Set up Sentry error tracking (2 pts)

**Deliverables:**
- 80%+ test coverage achieved
- CI/CD pipeline running on every PR
- Preview deployments working
- Production monitoring active

**Definition of Done:**
- All tests passing in CI
- Coverage report shows 80%+ on critical paths
- PR automatically creates preview deployment
- Sentry captures and alerts on errors

---

## 🔗 Dependencies

### External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Supabase project | Database + Auth | ✅ Configured |
| Vercel account | Deployment | ✅ Configured |
| GitHub repo | Version control + CI | ✅ Configured |
| Sentry project | Error tracking | ⚠️ Needs setup |
| Domain name | Production URL | ⚠️ TBD |

### Internal Dependencies

| Story | Depends On | Blocks |
|-------|------------|--------|
| FOUND-001 | Supabase setup | ALL other stories |
| FOUND-002 | FOUND-001 | FOUND-004, FOUND-006 |
| FOUND-004 | FOUND-001, FOUND-002 | All feature epics |
| FOUND-005 | FOUND-001 | FOUND-006, all features |
| FOUND-007 | FOUND-001 | FOUND-008, FOUND-009 |
| FOUND-010 | FOUND-001 | FOUND-011, FOUND-012 |

**Critical Path:** FOUND-001 → FOUND-002 → FOUND-004 → FOUND-005 (17 days)

---

## ⚠️ Risks & Mitigation

### Risk 1: Foundation Takes Longer Than 4 Weeks

**Probability:** Medium
**Impact:** High (blocks all other work)

**Mitigation:**
- Lock scope to MVP features only
- Time-box to 4 weeks maximum
- Defer nice-to-haves to Epic 2+
- Daily standups to catch delays early

### Risk 2: RLS Policies Too Complex / Performance Issues

**Probability:** Low
**Impact:** Medium

**Mitigation:**
- Start with simple policies
- Benchmark query performance early (Week 1)
- Use database indexes strategically
- Monitor query execution plans

### Risk 3: Event Bus Doesn't Scale

**Probability:** Low
**Impact:** Medium

**Mitigation:**
- PostgreSQL LISTEN/NOTIFY handles 1000s/sec
- Monitor event bus performance from Week 1
- Plan migration path to Redis Pub/Sub if needed
- Current solution good for <10K events/day

### Risk 4: Team Unfamiliar with tRPC

**Probability:** High
**Impact:** Low

**Mitigation:**
- Provide tRPC training session (2 hours)
- Create code examples in FOUND-010 story
- Pair programming for first few implementations
- Document common patterns

---

## 🎯 Acceptance Criteria (Epic Level)

### Functional Requirements

- [ ] User can sign up with email/password
- [ ] User can log in and access dashboard
- [ ] User can reset password via email
- [ ] Users can have multiple roles simultaneously
- [ ] Events published in one module trigger actions in another
- [ ] API calls are type-safe (no runtime type errors)
- [ ] Unauthorized users cannot access protected data (RLS enforced)
- [ ] All critical operations logged to audit_logs table
- [ ] Tests run automatically on every PR
- [ ] Deployments happen automatically on merge to main

### Non-Functional Requirements

- [ ] Page load time <2s (Lighthouse Performance 90+)
- [ ] Test coverage 80%+ on critical paths
- [ ] Build time <2 minutes
- [ ] Zero TypeScript compilation errors
- [ ] Zero ESLint errors (warnings OK with justification)
- [ ] Database queries <100ms (p95)
- [ ] API response time <500ms (p95)
- [ ] Event processing <1s (p95)

### Security Requirements

- [ ] RLS policies on 100% of tables
- [ ] Passwords hashed with bcrypt (handled by Supabase)
- [ ] Session tokens stored in HttpOnly cookies
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints (60 req/hour per IP)
- [ ] Audit logs immutable (no updates/deletes)
- [ ] Soft deletes preserve data for compliance

---

## 📚 Documentation Requirements

### Code Documentation

- [ ] Database schema diagram (ERD)
- [ ] API documentation (tRPC procedure reference)
- [ ] Event bus event catalog (all event types documented)
- [ ] RLS policy documentation (what each policy does)
- [ ] Environment variables guide (.env.example)

### Developer Guides

- [ ] Getting started guide (local development setup)
- [ ] Database migration guide (how to create/run migrations)
- [ ] Testing guide (how to write/run tests)
- [ ] Deployment guide (how to deploy to production)
- [ ] Troubleshooting guide (common issues + solutions)

### Architecture Decision Records (ADRs)

- [ ] ADR-001: Why PostgreSQL LISTEN/NOTIFY for event bus
- [ ] ADR-002: Why tRPC instead of REST
- [ ] ADR-003: Why Row Level Security (RLS)
- [ ] ADR-004: Why unified user table vs. separate tables
- [ ] ADR-005: Why Supabase Auth vs. custom auth

---

## 🚀 Post-Epic Actions

### Immediate Next Steps (After Epic 01)

1. **Sprint Retrospective**
   - What went well?
   - What could improve?
   - Action items for Epic 2

2. **Knowledge Transfer**
   - Document patterns established
   - Share lessons learned
   - Update team wiki

3. **Technical Debt Review**
   - Identify shortcuts taken
   - Prioritize for future sprints
   - Document in backlog

### Enables Future Epics

Epic 01 completion **unblocks**:

- ✅ Epic 02: Training Academy (can start immediately)
- ✅ Epic 02.5: AI Infrastructure (can start immediately)
- ✅ Epic 03: Recruiting Services (can start immediately)
- ✅ Epic 04: Bench Sales (depends on Epic 03)
- ✅ Epic 05: Talent Acquisition (can start immediately)
- ✅ Epic 06: HR & Employee (can start immediately)
- ✅ Epic 07: Productivity & Pods (depends on Epic 06)
- ✅ Epic 08: Cross-Border Solutions (depends on Epic 03, 05)

**Recommended Next:** Epic 02 (Training Academy) - First revenue-generating pillar

---

## 📈 Business Value Realization

### Immediate Value (Week 4)

- Platform operational with core functionality
- Developers can build features without duplicating auth/user logic
- Security enforced at database level (RLS)
- Event-driven architecture prevents tight coupling

### Short-Term Value (Months 1-3)

- 40% faster feature development (type safety + reusable patterns)
- 80% fewer production bugs (test coverage + validation)
- Zero security incidents (RLS + audit logs)
- Onboarding new developers in <1 day (vs. 1 week)

### Long-Term Value (Year 1+)

- Support 10× user growth without architecture changes
- Avoid $200K+ in technical debt remediation
- Enable rapid experimentation (features can be built in days)
- Foundation for B2B SaaS expansion (Year 2)

### ROI Calculation

**Investment:**
- 4 weeks × 2 developers × $100/hr = $32,000
- Infrastructure costs (Supabase, Vercel, Sentry) = $500/month

**Return:**
- Avoided technical debt: $200,000 (based on legacy project audit)
- 40% faster development: $50,000/year savings
- Zero security incidents: $100,000+ risk avoidance

**Net ROI:** ~$300,000 over 2 years

---

## ✅ Definition of Done (Epic)

Epic 01 is considered **DONE** when:

### All Stories Complete

- [ ] All 18 stories merged to main branch
- [ ] All acceptance criteria met for each story
- [ ] All tests passing (unit + integration + E2E)
- [ ] Code reviewed and approved by senior developer

### Quality Gates Passed

- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors
- [ ] Test coverage: 80%+ on critical paths
- [ ] Lighthouse Performance: 90+
- [ ] Build time: <2 minutes
- [ ] No high-severity security vulnerabilities (Dependabot)

### Production Deployment

- [ ] Deployed to production (Vercel)
- [ ] Sentry monitoring active
- [ ] No critical errors in first 24 hours
- [ ] Smoke tests passing in production

### Documentation Complete

- [ ] All code documented with JSDoc comments
- [ ] Database schema diagram created
- [ ] API reference documentation published
- [ ] Developer onboarding guide updated
- [ ] Architecture decision records (ADRs) written

### Stakeholder Acceptance

- [ ] Product owner approves functionality
- [ ] Architecture team approves technical design
- [ ] Security team approves RLS policies
- [ ] Development team confident to build on foundation

---

## 📞 Stakeholders

| Role | Name | Responsibility | Approval Required |
|------|------|----------------|-------------------|
| Product Owner | TBD | Business requirements | ✅ Yes |
| Tech Lead | TBD | Architecture decisions | ✅ Yes |
| Security Lead | TBD | RLS policies, auth flow | ✅ Yes |
| QA Lead | TBD | Test strategy, coverage | ✅ Yes |
| DevOps Lead | TBD | CI/CD, deployment | ✅ Yes |

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-18 | 1.0 | Initial creation of 18 user stories | PM Agent |
| 2025-11-19 | 1.1 | Requirements document created | Claude Code |

---

## 📎 Related Documents

- [Epic 01 Canvas](/docs/planning/epics/epic-01-foundation.md)
- [User Stories Directory](/docs/planning/stories/epic-01-foundation/)
- [Database Schema](/docs/architecture/DATABASE-SCHEMA.md)
- [Event-Driven Architecture](/docs/architecture/EVENT-DRIVEN-INTEGRATION.md)
- [Lessons from Legacy Project](/docs/audit/LESSONS-LEARNED.md)
- [5-Year Vision](/docs/vision/5-YEAR-ROADMAP.md)

---

**Status:** ✅ Ready for Implementation
**Next Action:** Assign Sprint 1 stories to developers
**Target Start Date:** Week 1
**Target Completion Date:** Week 4

---

*This requirements document is based on 18 complete user stories totaling ~12,000 lines of implementation-ready specifications.*
