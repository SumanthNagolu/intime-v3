---
name: recruiting
description: ATS (Applicant Tracking System) domain expertise for InTime v3
---

# Recruiting Skill - ATS Domain

## Workflow Overview
```
Sourcing → Screening → Interview → Offer → Placement
```

## Key Tables (src/lib/db/schema/ats.ts)

| Table | Purpose |
|-------|---------|
| `skills` | Global skill taxonomy |
| `candidate_skills` | Candidate-skill mappings with proficiency |
| `jobs` | Job requisitions |
| `submissions` | Candidate-job applications |
| `interviews` | Scheduled interviews |
| `offers` | Job offers |
| `placements` | Active placements |

## Status Workflows

### Job Status
```
draft → open → [on_hold] → filled | cancelled
```

### Submission Status
```
sourced → screening → submission_ready →
submitted_to_client → client_review → client_interview →
offer_stage → placed | rejected
```

### Interview Status
```
scheduled → confirmed → completed → [no_show | cancelled]
```

### Offer Status
```
draft → sent → [countered] → accepted | declined | expired
```

### Placement Status
```
active → [extended] → completed | terminated
```

## Components (src/components/recruiting/)

| Component | Purpose |
|-----------|---------|
| RecruiterDashboard.tsx | Main dashboard with KPIs |
| PipelineView.tsx | Kanban pipeline view |
| JobDetail.tsx | Job requisition details |
| CandidateDetail.tsx | Candidate profile |
| SubmissionBuilder.tsx | Create/edit submission |
| InterviewScheduler.tsx | Schedule interviews |
| OfferBuilder.tsx | Create job offers |
| PlacementWorkflow.tsx | Placement management |
| SourcingRoom.tsx | Candidate sourcing |
| ScreeningRoom.tsx | Candidate screening |

## API Endpoints (tRPC)

```typescript
// Jobs
trpc.ats.jobs.list({ status?, accountId? })
trpc.ats.jobs.getById({ id })
trpc.ats.jobs.create({ title, description, accountId, ... })
trpc.ats.jobs.update({ id, data })
trpc.ats.jobs.updateStatus({ id, status })

// Submissions
trpc.ats.submissions.list({ jobId?, status? })
trpc.ats.submissions.create({ jobId, candidateId, ... })
trpc.ats.submissions.updateStatus({ id, status, notes? })
trpc.ats.submissions.getByCandidate({ candidateId })

// Interviews
trpc.ats.interviews.create({ submissionId, scheduledAt, type })
trpc.ats.interviews.complete({ id, feedback, rating })
trpc.ats.interviews.cancel({ id, reason })

// Offers
trpc.ats.offers.create({ submissionId, salary, startDate, ... })
trpc.ats.offers.send({ id })
trpc.ats.offers.respond({ id, accepted, counterOffer? })

// Placements
trpc.ats.placements.create({ offerId })
trpc.ats.placements.extend({ id, newEndDate })
trpc.ats.placements.terminate({ id, reason })
```

## Key Schema Fields

### Jobs Table
```typescript
{
  id, orgId,
  title, description, jobType,
  location, isRemote,
  salaryMin, salaryMax, currency,
  requiredSkills,  // text[]
  status,          // draft | open | on_hold | filled | cancelled
  accountId,       // CRM account
  dealId,          // CRM deal
  priority,
  openings, filledCount,
  createdBy, createdAt, updatedAt, deletedAt
}
```

### Submissions Table
```typescript
{
  id, orgId,
  jobId, candidateId,
  status,              // submission workflow status
  recruiterNotes,
  clientFeedback,
  billRate, payRate,
  submittedAt, placedAt,
  createdBy, createdAt, updatedAt
}
```

## Integration Points

### With CRM
- Jobs linked to Accounts (clients) and Deals
- Activity logging on submissions

### With AI Twins
- Recruiter Twin provides:
  - Morning briefings with pipeline status
  - Candidate-job matching suggestions
  - Follow-up reminders for stale submissions
  - Interview preparation summaries

### With Academy
- Candidates can have academy enrollments
- Certificate completion shows on candidate profile

## Common Queries

### Open Jobs with Submission Counts
```typescript
const jobs = await db.select({
  job: jobs,
  submissionCount: count(submissions.id),
})
  .from(jobs)
  .leftJoin(submissions, eq(jobs.id, submissions.jobId))
  .where(eq(jobs.status, 'open'))
  .groupBy(jobs.id);
```

### Pipeline Status for Recruiter
```typescript
const pipeline = await db.select({
  status: submissions.status,
  count: count(submissions.id),
})
  .from(submissions)
  .where(eq(submissions.recruiterId, recruiterId))
  .groupBy(submissions.status);
```
