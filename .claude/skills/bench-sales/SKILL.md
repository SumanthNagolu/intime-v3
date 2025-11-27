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
