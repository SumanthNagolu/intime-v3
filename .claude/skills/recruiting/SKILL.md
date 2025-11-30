---
name: recruiting
description: ATS (Applicant Tracking System) domain expertise for InTime v3
---

# Recruiting Skill - ATS Domain

## Workflow Overview
```
Sourcing → Screening → Interview → Offer → Placement
```

## Entity Categories

| Category | Entities | Workplan | Activity Logging |
|----------|----------|----------|------------------|
| **Root** | job, submission, placement | Yes - auto-created | Yes - all operations |
| **Supporting** | candidate, interview, offer | No | Optional |

**Root entities** get automatic workplan creation and activity logging.

## Key Tables (src/lib/db/schema/ats.ts)

| Table | Purpose | Category |
|-------|---------|----------|
| `skills` | Global skill taxonomy | Platform |
| `candidate_skills` | Candidate-skill mappings with proficiency | Supporting |
| `jobs` | Job requisitions | **Root** |
| `submissions` | Candidate-job applications | **Root** |
| `interviews` | Scheduled interviews | Supporting |
| `offers` | Job offers | Supporting |
| `placements` | Active placements | **Root** |

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

## Workplan Templates (Root Entities)

### Job Workflow (`job_workflow`)
```
job_created
  → job_requirements_review (Day 0)
  → job_sourcing_kickoff (Day 1)
  → job_first_submission_check (Day 3)
  → job_weekly_review (Day 7, recurring)
```

### Submission Workflow (`submission_workflow`)
```
submission_created
  → candidate_prep_call (Day 0)
  → client_submission (Day 1)
  → client_follow_up (Day 3)
  → interview_scheduling (on client_review)
  → post_interview_debrief (on interview_complete)
```

### Placement Workflow (`placement_workflow`)
```
placement_started
  → onboarding_check (Day 1)
  → first_week_check (Day 7)
  → monthly_check (Day 30, recurring)
  → extension_review (30 days before end)
```

## Integration Points

### With CRM
- Jobs linked to Accounts (clients) and Deals
- Activity logging on submissions

### With Workplan System
- Job creation → triggers `job_workflow`
- Submission creation → triggers `submission_workflow`
- Placement start → triggers `placement_workflow`
- Status changes → trigger successor activities

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
