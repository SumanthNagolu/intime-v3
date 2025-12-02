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

## Activity-Centric Integration

### Golden Rule
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

### Events Emitted

| Event | Trigger | Auto-Activities |
|-------|---------|-----------------|
| `candidate.created` | New candidate added | CAND_NEW_INTRO_CALL |
| `candidate.submitted` | Submitted to job | CAND_SUBMITTED_FOLLOWUP |
| `candidate.stale` | 7 days no activity | CAND_STALE_FOLLOWUP |
| `job.created` | New job requisition | JOB_NEW_KICKOFF |
| `job.published` | Job goes live | JOB_SOURCING_START |
| `job.stale` | 14 days no activity | JOB_STALE_REVIEW |
| `submission.sent_to_client` | Sent to client | SUB_CLIENT_FOLLOWUP |
| `submission.rejected` | Client rejects | SUB_REJECTED_FEEDBACK |
| `interview.scheduled` | Interview booked | CAND_INTERVIEW_PREP |
| `interview.completed` | Interview done | CAND_INTERVIEW_DEBRIEF |
| `placement.started` | Consultant starts | PLACE_DAY1_CHECK |

### Activity Patterns (Recruiting)

| Pattern Code | Trigger | Activity | Due |
|--------------|---------|----------|-----|
| `CAND_NEW_INTRO_CALL` | candidate.created | Call: Introduction call | +4 hours |
| `CAND_SUBMITTED_FOLLOWUP` | candidate.submitted | Call: Follow up on submission | +24 hours |
| `CAND_INTERVIEW_PREP` | interview.scheduled | Task: Prepare for interview | -24 hours |
| `CAND_INTERVIEW_DEBRIEF` | interview.completed | Call: Post-interview debrief | +2 hours |
| `CAND_OFFER_FOLLOWUP` | offer.sent | Call: Follow up on offer | +48 hours |
| `CAND_PLACEMENT_CHECKIN` | placement.started | Call: Day 1 check-in | +1 day |
| `CAND_STALE_FOLLOWUP` | candidate.stale | Call: Re-engage candidate | +0 hours |
| `JOB_NEW_KICKOFF` | job.created | Meeting: Kickoff with manager | +24 hours |
| `JOB_SOURCING_START` | job.published | Task: Begin sourcing | +0 hours |
| `JOB_NO_SUBMITS` | job.no_submissions (5d) | Task: Review requirements | +0 hours |
| `SUB_CLIENT_FOLLOWUP` | submission.sent_to_client | Call: Client follow-up | +48 hours |
| `SUB_REJECTED_FEEDBACK` | submission.rejected | Task: Get feedback | +4 hours |

### Transition Guards

```typescript
// Candidate cannot be submitted without a call
{
  entity: 'candidate',
  from: 'new',
  to: 'submitted',
  requires: [{ type: 'call', count: 1, status: 'completed' }],
  error: 'Complete at least 1 call before submitting'
}

// Submission cannot be sent without review
{
  entity: 'submission',
  from: 'draft',
  to: 'sent_to_client',
  requires: [{ type: 'review', count: 1, status: 'completed' }],
  error: 'Complete resume review before sending'
}
```

### UI Requirements
- Activity queue on RecruiterDashboard
- Timeline tab on CandidateDetail
- Quick log buttons on all entity cards
- SLA indicators for overdue activities

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
