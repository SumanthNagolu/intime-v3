# Epic 1: Foundation & Core Platform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Foundation & Core Platform

**🎯 Goal:** Establish unified technical foundation for all business pillars

**💰 Business Value:** Enables all other epics; prevents technical debt from legacy mistakes; ensures scalability to 10× growth

**👥 User Personas:** All users (students, employees, recruiters, admins, candidates, clients)

**🎁 Key Features:**

- Unified authentication system (Supabase Auth + RLS policies)
- Single user management system (user_profiles table with multi-role support)
- Event bus infrastructure (cross-module communication without tight coupling)
- Core UI component library (shadcn/ui, Tailwind, consistent design system)
- Database schema with audit trails (created_by, updated_by, soft deletes)
- Role-based access control (RBAC with permissions)
- API infrastructure (tRPC for type-safe APIs, Server Actions for mutations)

**📊 Success Metrics:**

- Zero duplicate user systems (1 table vs legacy's 3 tables)
- 100% RLS coverage on all tables
- 80%+ test coverage on critical paths
- Sub-2s page load times (Lighthouse Performance 90+)
- Event bus handling 1000+ events/day by Week 4

**🔗 Dependencies:**

- **Requires:** None (foundation)
- **Enables:** ALL other epics (Academy, Recruiting, HR, etc.)
- **Blocks:** Nothing (can be built in parallel with planning for other epics)

**⏱️ Effort Estimate:** 4 weeks, ~15 stories

**📅 Tentative Timeline:** Week 1-4 (Foundation Phase)

**Key Stories:**

1. Set up Next.js 15 project with TypeScript strict mode
2. Configure Supabase (PostgreSQL, Auth, Storage)
3. Create unified database schema migration (user_profiles, roles, user_roles)
4. Implement RLS policies for all core tables
5. Build authentication flow (signup, login, logout, password reset)
6. Create event bus infrastructure (publish/subscribe pattern)
7. Set up shadcn/ui component library
8. Implement RBAC middleware (role checks on routes/actions)
9. Create audit trail utilities (auto-populate created_by, updated_by)
10. Set up testing infrastructure (Vitest, Playwright)
11. Configure CI/CD pipeline (GitHub Actions, Vercel deployment)
12. Build error tracking (Sentry integration)
13. Create admin dashboard skeleton (user management, system health)
14. Implement soft delete helpers (deleted_at filtering)
15. Documentation (architecture diagrams, API docs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Technical Details

### Database Schema

**Core Tables:**
- `user_profiles` - Single user table with role-based columns
- `roles` - System roles (student, trainer, recruiter, admin, etc.)
- `user_roles` - Junction table for multi-role support
- `permissions` - Granular permissions
- `role_permissions` - Role-permission mapping

### Event Bus

**Implementation:** Custom event bus using PostgreSQL LISTEN/NOTIFY

**Event Categories:**
- `user.*` - User lifecycle events (signup, role_granted, etc.)
- `academy.*` - Training events (enrolled, graduated, etc.)
- `recruiting.*` - Placement events (submitted, hired, etc.)
- `hr.*` - Employee events (timesheet_submitted, etc.)

### Authentication

**Provider:** Supabase Auth

**Flows:**
- Email/password signup and login
- Magic link authentication
- Password reset
- Email verification

**RLS Policies:** Applied to ALL tables, enforced at database level

### UI Component Library

**Framework:** shadcn/ui + Tailwind CSS

**Components:**
- Forms (input, textarea, select, checkbox, etc.)
- Navigation (sidebar, navbar, breadcrumbs)
- Data display (table, card, list)
- Feedback (alert, toast, modal)
- Layout (container, grid, flex)

---

## Success Criteria

**Definition of Done:**

1. ✅ Developer can create new Next.js page in <5 minutes
2. ✅ All API calls are type-safe (TypeScript end-to-end)
3. ✅ New user can sign up, login, and see dashboard
4. ✅ Events can be published and subscribed across modules
5. ✅ RLS policies prevent unauthorized data access
6. ✅ Tests run automatically on every PR
7. ✅ Deployment to Vercel happens on merge to main
8. ✅ Error tracking captures exceptions in production

**Quality Gates:**

- TypeScript compilation: 0 errors
- ESLint: 0 errors (warnings OK with justification)
- Test coverage: 80%+ on critical paths
- Lighthouse Performance: 90+
- Build time: <2 minutes

---

## Risks & Mitigation

**Risk:** Foundation takes longer than 4 weeks

**Mitigation:**
- Lock scope to MVP features only
- Time-box to 4 weeks max
- Defer nice-to-haves to Epic 2+

**Risk:** RLS policies too complex, performance issues

**Mitigation:**
- Start with simple policies
- Benchmark query performance early
- Use database indexes strategically

**Risk:** Event bus doesn't scale

**Mitigation:**
- PostgreSQL LISTEN/NOTIFY handles 1000s/sec
- If scaling issues: migrate to Redis Pub/Sub
- Monitor event bus performance from Week 1

---

**Related Epics:** ALL (Foundation enables everything)

**Next Epic:** [Epic 2: Training Academy](./epic-02-training-academy.md)
