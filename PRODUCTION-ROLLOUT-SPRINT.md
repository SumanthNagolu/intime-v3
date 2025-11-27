# 🚀 InTime v3 Production Rollout Sprint

## Overview

This document outlines the systematic approach to roll out features to production, testing each component with real users performing real work.

## Sprint Order

| # | Component | Duration | Dependencies |
|---|-----------|----------|--------------|
| 1 | **Authentication & Access Control** | ~3.5 hours | None (Foundation) |
| 2 | **Admin Console** | ~4 hours | Auth complete |
| 3 | **HR Module** | ~4 hours | Admin complete |
| 4 | **Talent Acquisition / Sales** | ~4 hours | Auth complete |
| 5 | **Recruiting** | ~5 hours | Auth, CRM tables |
| 6 | **Bench Sales** | ~4 hours | Auth, Recruiting |

**Total Estimated Time: ~24-28 hours**

---

## Quick Start

### 1. Setup Roles & Permissions

```bash
# Assign roles and permissions to existing users
pnpm tsx scripts/seed-test-users.ts
```

Your existing users with assigned roles:

| Role | Email | Password |
|------|-------|----------|
| CEO / Super Admin | ceo@intime.com | TestPass123! |
| Admin | admin@intime.com | TestPass123! |
| HR Manager | hr_admin@intime.com | TestPass123! |
| Recruiter | jr_rec@intime.com | TestPass123! |
| Bench Sales | jr_bs@intime.com | TestPass123! |
| Talent Acquisition | jr_ta@intime.com | TestPass123! |
| Trainer | trainer@intime.com | TestPass123! |
| Student | student@intime.com | TestPass123! |

### 2. Start the First Component

Open Claude Code and paste this prompt:

```
@workflow Execute Full Production Rollout for Authentication & Access Control

Read the workflow at: .claude/commands/workflows/01-auth-access-control.md

Then analyze these files and create gap analysis:
1. src/lib/db/schema/user-profiles.ts
2. src/lib/db/schema/rbac.ts
3. src/app/actions/auth.ts
4. src/middleware.ts
5. src/components/admin/UserManagement.tsx
```

### 3. Follow the Workflow

Each component has 6 phases:
1. **Deep Analysis** - Understand current state, identify gaps
2. **Database Alignment** - Fix RLS, indexes, migrations
3. **Server Actions** - Implement/fix CRUD operations
4. **UI Integration** - Wire components to real data
5. **E2E Tests** - Write Playwright tests for workflows
6. **Verification** - Complete checklist, run tests

---

## Files Created for This Sprint

### Workflow Documentation
- `.claude/commands/workflows/production-rollout-sprint.md` - Main workflow guide
- `.claude/commands/workflows/01-auth-access-control.md` - Component 1 specific prompt

### Test Files
- `scripts/seed-test-users.ts` - Creates test users for E2E
- `tests/e2e/auth-workflows.spec.ts` - Auth E2E test suite

---

## Component Details

### 1. Authentication & Access Control

**Scope:**
- User signup/signin
- Role assignment
- Session management
- Route protection
- Multi-tenancy isolation

**Key Files:**
```
src/app/actions/auth.ts
src/lib/db/schema/rbac.ts
src/lib/db/schema/user-profiles.ts
src/middleware.ts
src/components/admin/UserManagement.tsx
```

**Success Criteria:**
- [ ] Users can sign up with role assignment
- [ ] Users can sign in and are redirected by role
- [ ] Sessions persist across navigation
- [ ] Protected routes require auth
- [ ] Admin routes require admin role
- [ ] Org A cannot see Org B data

---

### 2. Admin Console

**Scope:**
- User management (CRUD)
- Role & permission management
- Audit log viewing
- System settings

**Key Files:**
```
src/app/employee/admin/**
src/components/admin/**
```

**Success Criteria:**
- [ ] Admin can create/edit/deactivate users
- [ ] Admin can assign/remove roles
- [ ] Audit logs show all mutations
- [ ] Settings can be updated

---

### 3. HR Module

**Scope:**
- People directory
- Pod management
- Payroll runs
- Performance reviews
- Time & attendance

**Key Files:**
```
src/app/employee/hr/**
src/lib/db/schema/ta-hr.ts
```

**Success Criteria:**
- [ ] HR can manage employee records
- [ ] Pods can be created and assigned
- [ ] Payroll runs can be processed
- [ ] Reviews can be created and completed
- [ ] Time can be logged and approved

---

### 4. Talent Acquisition / Sales

**Scope:**
- Lead management
- Campaign management
- Deal pipeline
- Engagement tracking

**Key Files:**
```
src/app/employee/ta/**
src/lib/db/schema/ta-hr.ts
src/lib/db/schema/crm.ts
```

**Success Criteria:**
- [ ] Leads can be created and qualified
- [ ] Campaigns can be launched
- [ ] Deals can move through pipeline
- [ ] Engagement is tracked

---

### 5. Recruiting

**Scope:**
- Job management
- Candidate pipeline
- Submissions workflow
- Interviews & offers
- Placements

**Key Files:**
```
src/app/employee/recruiting/**
src/lib/db/schema/ats.ts
```

**Success Criteria:**
- [ ] Jobs can be posted and managed
- [ ] Candidates flow through pipeline
- [ ] Submissions can be tracked
- [ ] Interviews can be scheduled
- [ ] Offers can be created and sent
- [ ] Placements are recorded

---

### 6. Bench Sales

**Scope:**
- Bench talent tracking
- External job scraping
- Vendor submissions
- Hotlist management
- Immigration cases

**Key Files:**
```
src/app/employee/bench/**
src/lib/db/schema/bench.ts
```

**Success Criteria:**
- [ ] Bench consultants are tracked
- [ ] External jobs can be viewed
- [ ] Submissions can be made to vendors
- [ ] Hotlists can be created and sent
- [ ] Immigration cases are managed

---

## Running Tests

```bash
# Run specific component tests
pnpm playwright test tests/e2e/auth-workflows.spec.ts

# Run all E2E tests
pnpm playwright test

# Run with visible browser
pnpm playwright test --headed

# Run with UI mode for debugging
pnpm playwright test --ui

# View test report
pnpm playwright show-report
```

---

## Critical Reminders

### Non-Negotiables

1. **RLS on EVERY table** - Multi-tenancy isolation is critical
2. **Soft deletes ONLY** - Never hard delete user/candidate/client data
3. **Audit logging** - All mutations must be logged
4. **Zod validation** - All inputs validated on server
5. **org_id from context** - Never trust client-provided org_id

### Quality Checks

Before marking any component complete:

- [ ] All E2E tests passing
- [ ] No mock data in production paths
- [ ] RLS policies verified
- [ ] Audit logs recording
- [ ] Error handling with user-friendly messages
- [ ] Loading states implemented
- [ ] Multi-tenancy isolation tested

---

## Progress Tracking

Use this to track completion:

| Component | Analysis | DB | Actions | UI | Tests | Verified |
|-----------|:--------:|:--:|:-------:|:--:|:-----:|:--------:|
| Auth & Access | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Admin | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| HR | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| TA/Sales | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Recruiting | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bench Sales | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Legend: ⬜ Not Started | 🔄 In Progress | ✅ Complete

---

## After Sprint Complete

1. **Production Checklist**
   - [ ] All E2E tests passing
   - [ ] Performance testing done
   - [ ] Security review complete
   - [ ] Documentation updated

2. **Deploy to Production**
   ```bash
   # Run production build
   pnpm build
   
   # Deploy
   vercel --prod
   ```

3. **Monitor**
   - Watch Sentry for errors
   - Monitor Supabase for performance
   - Check audit logs for anomalies

---

## Support

If you encounter issues:

1. Check the workflow documentation in `.claude/commands/workflows/`
2. Review the agent documentation in `.claude/agents/`
3. Reference the project rules in `.cursorrules`

**Remember:** Quality over speed. "Best, only the best, nothing but the best."

