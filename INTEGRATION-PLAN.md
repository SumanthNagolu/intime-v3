# InTime v3 - Production Integration Master Plan

## Executive Summary

**Current State:** 90% complete - Backend routers exist, need to wire frontend
**Target State:** Production-ready multi-tenant SaaS platform
**Estimated Effort:** 15-25 developer days (accelerated with Claude Opus)

---

## ✅ GOOD NEWS: Backend is MORE Complete Than Expected!

After thorough analysis, the tRPC routers **already exist**:

| Module | Router File | Status | Procedures |
|--------|-------------|--------|------------|
| **CRM** | `src/server/routers/crm.ts` | ✅ Complete | accounts (list, getById, create, update, delete), leads, deals, pocs, activities |
| **ATS** | `src/server/routers/ats.ts` | ✅ Complete | jobs, submissions, interviews, offers, placements, skills |
| **Bench** | `src/server/routers/bench.ts` | ✅ Complete | consultants, externalJobs, sources, submissions, hotlist, immigration |
| **TA-HR** | `src/server/routers/ta-hr.ts` | ✅ Exists | Need to verify coverage |
| **Academy** | `src/server/trpc/routers/*.ts` | ✅ Complete | 20+ routers for courses, enrollment, progress, etc. |

---

## Real Gaps (Smaller Than Expected)

### 1. Frontend Wiring (MAIN TASK)
| Component | Current State | Action Needed |
|-----------|---------------|---------------|
| AccountsList | Uses `useAppStore()` mock | ✅ DONE - Wired to `trpc.crm.accounts.list` |
| LeadsList | Uses mock data | Wire to `trpc.crm.leads.list` |
| DealsPipeline | Uses mock data | Wire to `trpc.crm.deals.list` |
| BenchTalentList | Uses mock data | Wire to `trpc.bench.consultants.list` |
| RecruiterDashboard | Uses mock data | Wire to multiple tRPC calls |
| ClientDashboard | Uses mock data | Wire to client-specific procedures |

### 2. Missing Database Tables (HR Module Only)
| Table | Purpose | Priority |
|-------|---------|----------|
| `employee_assets` | Laptops, phones, equipment | P2 |
| `employee_documents` | Contracts, I-9s | P2 |
| `timesheets` | Daily hours tracking | P2 |
| `time_off_requests` | PTO management | P2 |
| `performance_reviews` | Evaluations | P3 |
| `employee_goals` | OKRs | P3 |

### 3. Client Portal Router (Missing)
Need to create `src/server/routers/client.ts` with procedures for:
- Dashboard stats for clients
- Client's own job requisitions
- View submissions for their jobs
- Schedule interviews

---

## ✅ Completed Integration Pattern (Use This Template)

The AccountsList component has been converted. Use this as a template:

### Before (Mock Data with Zustand)
```typescript
// ❌ OLD PATTERN - Don't use this
import { useAppStore } from '../../lib/store';

export const AccountsList: React.FC = () => {
  const { accounts, jobs } = useAppStore(); // Mock data!

  const filtered = accounts.filter(a => ...);

  return <div>{filtered.map(...)}</div>;
};
```

### After (Real Data with tRPC)
```typescript
// ✅ NEW PATTERN - Use this
import { trpc } from '@/lib/trpc/client';

export const AccountsList: React.FC = () => {
  // Real database query with React Query
  const {
    data: accounts,
    isLoading,
    error,
    refetch
  } = trpc.crm.accounts.list.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    search: searchTerm || undefined,
  });

  // LOADING STATE - Show skeleton
  if (isLoading) return <AccountsListSkeleton />;

  // ERROR STATE - Show retry button
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // EMPTY STATE - Show helpful message
  if (!accounts?.length) return <EmptyState />;

  // SUCCESS STATE - Render data
  return <div>{accounts.map(...)}</div>;
};
```

---

## Revised Execution Plan

### Week 1: Wire Recruiting Module (5 components)

| Day | Component | tRPC Calls Needed |
|-----|-----------|-------------------|
| Day 1 | ✅ AccountsList | `trpc.crm.accounts.list`, `trpc.ats.jobs.list` |
| Day 1 | AccountDetail | `trpc.crm.accounts.getById`, `trpc.crm.pocs.list` |
| Day 2 | LeadsList | `trpc.crm.leads.list` |
| Day 2 | LeadDetail | `trpc.crm.leads.getById`, `trpc.crm.activities.list` |
| Day 3 | DealsPipeline | `trpc.crm.deals.list`, `trpc.crm.deals.pipelineSummary` |
| Day 3 | DealDetail | `trpc.crm.deals.getById`, `trpc.crm.deals.update` |
| Day 4 | RecruiterDashboard | Multiple queries for stats |
| Day 5 | CandidateDetail | `trpc.ats.submissions.list`, `trpc.ats.skills.getCandidateSkills` |

### Week 2: Wire Bench Module (4 components)

| Day | Component | tRPC Calls Needed |
|-----|-----------|-------------------|
| Day 6 | BenchTalentList | `trpc.bench.consultants.list` |
| Day 6 | BenchTalentDetail | `trpc.bench.consultants.getById`, `trpc.bench.submissions.list` |
| Day 7 | BenchDashboard | `trpc.bench.consultants.agingReport`, stats queries |
| Day 7 | HotlistBuilder | `trpc.bench.hotlist.create` |
| Day 8 | JobCollector | `trpc.bench.externalJobs.list` |
| Day 8 | JobHuntRoom | `trpc.bench.externalJobs.list`, `trpc.bench.submissions.create` |

### Week 3: Wire Client Portal (3 components) + HR Start

| Day | Task |
|-----|------|
| Day 9 | Create `src/server/routers/client.ts` |
| Day 10 | Wire ClientDashboard, ClientJobsList |
| Day 11 | Wire ClientJobDetail, ClientPipeline |
| Day 12-13 | Create HR database migration |
| Day 14 | Wire HR components (EmployeeProfile, TimeAttendance) |

### Week 4: Testing & Production Hardening

- E2E tests with Playwright
- Multi-tenancy isolation tests
- Performance optimization
- Security audit

---

## Claude Opus Prompts for Integration

### Prompt 1: Wire a List Component
```
Wire the LeadsList component to use real tRPC data.

File: src/components/recruiting/LeadsList.tsx
Router: src/server/routers/crm.ts (leads procedures)

Follow the pattern from AccountsList.tsx:
1. Replace useAppStore() with trpc.crm.leads.list.useQuery()
2. Add loading skeleton
3. Add error handling with retry
4. Add empty state
5. Keep the same visual design
```

### Prompt 2: Wire a Detail Component
```
Wire the AccountDetail component to use real tRPC data.

File: src/components/recruiting/AccountDetail.tsx
Routers needed:
- trpc.crm.accounts.getById (main data)
- trpc.crm.pocs.list (point of contacts)
- trpc.crm.activities.list (activity timeline)
- trpc.ats.jobs.list (related jobs)

Add:
- Loading states for each section
- Error handling
- Optimistic updates for mutations
```

### Prompt 3: Wire a Dashboard Component
```
Wire the RecruiterDashboard to use real tRPC data.

File: src/components/recruiting/RecruiterDashboard.tsx

Replace useAppStore() calls with:
- trpc.crm.accounts.list for account stats
- trpc.ats.jobs.list for job stats
- trpc.ats.submissions.list for submission stats
- trpc.ats.placements.activeCount for placement count

Use React Query's parallel queries feature for efficiency.
```

---

## Files Reference

### tRPC Client
```typescript
// src/lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/root';

export const trpc = createTRPCReact<AppRouter>();
```

### Available Routers
```typescript
// Access pattern: trpc.[module].[subrouter].[procedure]

trpc.crm.accounts.list.useQuery({})
trpc.crm.leads.list.useQuery({})
trpc.crm.deals.list.useQuery({})
trpc.crm.pocs.list.useQuery({ accountId })
trpc.crm.activities.list.useQuery({ entityType, entityId })

trpc.ats.jobs.list.useQuery({})
trpc.ats.submissions.list.useQuery({})
trpc.ats.interviews.list.useQuery({})
trpc.ats.offers.list.useQuery({})
trpc.ats.placements.list.useQuery({})

trpc.bench.consultants.list.useQuery({})
trpc.bench.externalJobs.list.useQuery({})
trpc.bench.submissions.list.useQuery({})
trpc.bench.hotlist.list.useQuery({})
trpc.bench.immigration.list.useQuery({})
```

---

## Success Metrics

- [ ] All recruiting components wired to real data
- [ ] All bench components wired to real data
- [ ] Client portal functional
- [ ] Multi-tenancy working (org_id filtering)
- [ ] Loading/error states on all components
- [ ] Build passes with no TypeScript errors
- [ ] E2E tests for critical flows

---

*Updated: 2024-11-26*
*First component wired: AccountsList.tsx*
*Claude Opus Integration Assistant*
