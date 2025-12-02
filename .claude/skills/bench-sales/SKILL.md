---
name: bench-sales
description: Bench Sales domain expertise for InTime v3
---

# Bench Sales Skill

## Domain Overview
Manage bench consultants (employees between projects) and market them to clients for placement.

## Key Tables (src/lib/db/schema/bench.ts)

| Table | Purpose |
|-------|---------|
| `bench_consultants` | Consultants on bench |
| `hotlists` | Marketing hotlists |
| `hotlist_entries` | Consultants in hotlists |
| `external_jobs` | Job postings from job boards |
| `job_applications` | Applications to external jobs |

## Workflow
```
On Bench → Build Hotlist → Collect Jobs → Apply → Interview → Placement
```

## Components (src/components/bench/)

| Component | Purpose |
|-----------|---------|
| BenchDashboard.tsx | Main bench sales dashboard |
| BenchTalentList.tsx | List of bench consultants |
| BenchTalentDetail.tsx | Consultant details |
| HotlistBuilder.tsx | Create marketing hotlists |
| JobCollector.tsx | Collect external jobs |
| JobHuntRoom.tsx | Job hunting workflow |

## Key Metrics
- Days on Bench (DOB) - critical metric
- Submissions per consultant
- Response rate
- Placement rate
- Revenue per placement

## API Endpoints

```typescript
// Bench Consultants
trpc.bench.consultants.list({ daysOnBench?, skills? })
trpc.bench.consultants.getById({ id })
trpc.bench.consultants.addToBench({ userId, availableFrom })
trpc.bench.consultants.removeFromBench({ id })

// Hotlists
trpc.bench.hotlists.list()
trpc.bench.hotlists.create({ name, description })
trpc.bench.hotlists.addConsultant({ hotlistId, consultantId })
trpc.bench.hotlists.export({ hotlistId, format })  // PDF, Excel

// External Jobs
trpc.bench.jobs.list({ source?, skills? })
trpc.bench.jobs.create({ title, client, source, url })
trpc.bench.jobs.apply({ jobId, consultantId })
```

## Integration Points
- Links to ATS for placement tracking
- Immigration case awareness (visa status)
- AI Twin for matching suggestions

## Entity Categories

| Category | Entities | Workplan | Activity Logging |
|----------|----------|----------|------------------|
| **Root** | job_application, placement | Yes - auto-created | Yes - all operations |
| **Supporting** | bench_consultant, hotlist, external_job | No | Optional |

## Activity-Centric Integration

### Golden Rule
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

### Events Emitted

| Event | Trigger | Auto-Activities |
|-------|---------|-----------------|
| `consultant.added_to_bench` | New on bench | BENCH_NEW_PROFILE_REVIEW |
| `consultant.dob_milestone` | Days on bench threshold | BENCH_DOB_REVIEW |
| `hotlist.created` | New hotlist | HOTLIST_DISTRIBUTION |
| `application.submitted` | Applied to job | APP_SUBMITTED_FOLLOWUP |
| `application.interview_scheduled` | Interview set | APP_INTERVIEW_PREP |
| `application.rejected` | Application rejected | APP_REJECTION_REVIEW |
| `application.stale` | 5 days no response | APP_STALE_FOLLOWUP |

### Activity Patterns (Bench Sales)

| Pattern Code | Trigger | Activity | Due |
|--------------|---------|----------|-----|
| `BENCH_NEW_PROFILE_REVIEW` | consultant.added_to_bench | Task: Review and update profile | +4 hours |
| `BENCH_MARKETING_START` | consultant.added_to_bench | Task: Begin marketing | +1 day |
| `BENCH_DOB_7_REVIEW` | consultant.dob_milestone (7d) | Review: 7-day bench review | +0 hours |
| `BENCH_DOB_14_ESCALATE` | consultant.dob_milestone (14d) | Escalation: 14-day escalation | +0 hours |
| `HOTLIST_DISTRIBUTION` | hotlist.created | Email: Distribute hotlist | +2 hours |
| `APP_SUBMITTED_FOLLOWUP` | application.submitted | Call: Follow up on application | +48 hours |
| `APP_INTERVIEW_PREP` | application.interview_scheduled | Task: Prep consultant | -24 hours |
| `APP_STALE_FOLLOWUP` | application.stale | Call: Check application status | +0 hours |

### Key Metrics with Activity Tracking

| Metric | Activity-Based Calculation |
|--------|---------------------------|
| Days on Bench | Days since `consultant.added_to_bench` |
| Marketing Activity | Count of outreach activities |
| Follow-up Rate | Completed follow-ups / Total applications |
| Response Time | Avg time to first activity after application |

### Transition Guards

```typescript
// Consultant cannot be placed without marketing activities
{
  entity: 'consultant',
  from: 'on_bench',
  to: 'placed',
  requires: [{ type: 'submission', count: 1, status: 'completed' }],
  error: 'Must have at least one submission before placement'
}
```

### SLA Rules

| Metric | Warning | Breach |
|--------|---------|--------|
| New consultant profile review | 2 hours | 4 hours |
| Application follow-up | 24 hours | 48 hours |
| DOB > 7 days review | 7 days | 10 days |

### UI Requirements
- Activity queue on BenchDashboard
- DOB-based alerts with activity prompts
- Timeline on consultant profiles
- Quick log: Call, Email, Submission, Note
- Marketing activity counts on hotlists
