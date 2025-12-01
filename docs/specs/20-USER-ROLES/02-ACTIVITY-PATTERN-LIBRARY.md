# Activity Pattern Library

**Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Canonical Reference
**Related:** [01-ACTIVITIES-EVENTS-FRAMEWORK.md](./01-ACTIVITIES-EVENTS-FRAMEWORK.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pattern Structure](#2-pattern-structure)
3. [Candidate Lifecycle Patterns](#3-candidate-lifecycle-patterns)
4. [Job Lifecycle Patterns](#4-job-lifecycle-patterns)
5. [Submission Workflow Patterns](#5-submission-workflow-patterns)
6. [Interview Workflow Patterns](#6-interview-workflow-patterns)
7. [Placement Lifecycle Patterns](#7-placement-lifecycle-patterns)
8. [Account Management Patterns](#8-account-management-patterns)
9. [Lead & Deal Pipeline Patterns](#9-lead--deal-pipeline-patterns)
10. [Bench Sales Patterns](#10-bench-sales-patterns)
11. [HR & Talent Acquisition Patterns](#11-hr--talent-acquisition-patterns)
12. [Creating Custom Patterns](#12-creating-custom-patterns)

---

## 1. Overview

### 1.1 What is an Activity Pattern?

An **Activity Pattern** is a template that automatically creates activities based on triggering events. Patterns ensure consistent follow-up, SLA compliance, and complete audit trails.

### 1.2 Pattern Benefits

| Benefit | Description |
|---------|-------------|
| **Consistency** | Same activities created every time, no steps missed |
| **Automation** | Reduces manual task creation by 70-80% |
| **Compliance** | Ensures SOPs are followed |
| **SLA Management** | Auto-sets due dates based on business rules |
| **Accountability** | Clear ownership via assignment rules |
| **Scalability** | New recruiters follow proven workflows |

### 1.3 How Patterns Work

```
Event Occurs                Activity Pattern Triggered              Activity Created
━━━━━━━━━━━                ━━━━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━

candidate.created    ──▶    CAND_NEW_INTRO_CALL         ──▶       📞 Call: Introduction
   ↓                        - Checks conditions                      with John Smith
   │                        - Resolves assignee (owner)              Due: +4 hours
   │                        - Calculates due date                    Assigned: Sarah Chen
   │                        - Interpolates template                  Priority: High
   │
   └─────────────────────────────────────────────────────────────────────────────────▶
                          Activity automatically appears in recruiter's queue
```

### 1.4 Pattern Catalog Summary

| Domain | Pattern Count | Coverage |
|--------|---------------|----------|
| Candidate Lifecycle | 12 patterns | New candidate → Placement |
| Job Lifecycle | 8 patterns | Job creation → Close/Fill |
| Submission Workflow | 6 patterns | Sourced → Offer |
| Interview Workflow | 7 patterns | Schedule → Feedback |
| Placement Lifecycle | 9 patterns | Pre-start → Offboarding |
| Account Management | 7 patterns | New account → Retention |
| Lead & Deal Pipeline | 8 patterns | New lead → Close/Lost |
| Bench Sales | 6 patterns | Bench → Marketing → Placement |
| HR & TA | 8 patterns | Hiring → Onboarding → Training |
| **TOTAL** | **71 patterns** | All major workflows |

---

## 2. Pattern Structure

### 2.1 Pattern Fields

Every pattern contains these fields:

```typescript
interface ActivityPattern {
  // Identity
  pattern_code: string;                 // Unique code (e.g., CAND_NEW_INTRO_CALL)
  name: string;                         // Display name
  description: string;                  // Purpose/context

  // Trigger
  trigger_event: string;                // Event type (e.g., candidate.created)
  trigger_conditions?: Condition[];     // Optional conditions

  // Activity Template
  activity_type: ActivityType;          // call, email, task, etc.
  subject_template: string;             // Supports {{variables}}
  description_template?: string;
  priority: Priority;                   // critical, high, medium, low

  // Assignment
  assign_to: AssignmentRule;            // Who gets the activity

  // Timing
  due_offset_hours?: number;            // Due in X hours
  due_offset_business_days?: number;    // Due in X business days
  specific_time?: string;               // HH:MM for specific time

  // Configuration
  is_active: boolean;                   // Enabled/disabled
  is_system: boolean;                   // System-managed (can't delete)
  can_be_skipped: boolean;              // User can skip/dismiss
  requires_outcome: boolean;            // Must record outcome

  // SLA
  sla_warning_hours?: number;           // Warning before breach
  sla_breach_hours?: number;            // Breach threshold
}
```

### 2.2 Assignment Rules

| Rule Type | Description | Example |
|-----------|-------------|---------|
| `owner` | Entity owner | Candidate owner gets activity |
| `creator` | Event creator | User who created the event |
| `raci_role` | RACI matrix role | Assigned to Accountable (A) person |
| `specific_user` | Specific user ID | Always assigned to Manager X |
| `specific_role` | Role-based | Any user with role "Recruiter" |
| `round_robin` | Distribute evenly | Next available recruiter |
| `least_busy` | Least loaded user | User with fewest open activities |
| `manager` | Entity owner's manager | Owner's pod manager |

### 2.3 Template Variables

Variables available for subject/description interpolation:

```typescript
// Candidate context
{{candidate.id}}
{{candidate.name}}
{{candidate.email}}
{{candidate.phone}}
{{candidate.status}}
{{candidate.skills}}
{{candidate.location}}
{{candidate.visa_status}}
{{candidate.availability}}
{{candidate.owner.name}}

// Job context
{{job.id}}
{{job.title}}
{{job.account.name}}
{{job.location}}
{{job.type}}
{{job.rate_min}}
{{job.rate_max}}
{{job.owner.name}}

// Submission context
{{submission.id}}
{{submission.status}}
{{submission.bill_rate}}
{{submission.pay_rate}}
{{submission.candidate.name}}
{{submission.job.title}}
{{submission.job.account.name}}

// Interview context
{{interview.id}}
{{interview.round_number}}
{{interview.type}}
{{interview.scheduled_at}}
{{interview.interviewers}}

// Placement context
{{placement.id}}
{{placement.start_date}}
{{placement.end_date}}
{{placement.client.name}}
{{placement.consultant.name}}

// Account context
{{account.id}}
{{account.name}}
{{account.industry}}
{{account.tier}}
{{account.owner.name}}

// Lead/Deal context
{{lead.id}}
{{lead.company}}
{{lead.contact_name}}
{{deal.id}}
{{deal.value}}
{{deal.stage}}

// Event context
{{event.type}}
{{event.actor.name}}
{{event.occurred_at}}

// System context
{{today}}
{{now}}
{{user.name}}
{{org.name}}
```

### 2.4 Conditional Triggers

Patterns can have optional trigger conditions:

```typescript
interface TriggerCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'exists';
  value: any;
}

// Example: Only trigger for H1B candidates
{
  trigger_event: 'candidate.created',
  trigger_conditions: [
    { field: 'candidate.visa_status', operator: 'eq', value: 'H1B' }
  ]
}

// Example: Only trigger for high-value deals
{
  trigger_event: 'deal.created',
  trigger_conditions: [
    { field: 'deal.value', operator: 'gte', value: 100000 }
  ]
}
```

---

## 3. Candidate Lifecycle Patterns

### CAND_NEW_INTRO_CALL

**Name:** Introduction call with new candidate
**Description:** First contact to assess candidate interest and availability

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_NEW_INTRO_CALL` |
| **Trigger Event** | `candidate.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Introduction call with {{candidate.name}}` |
| **Description Template** | `First contact call to discuss background, skills, and job interests. Confirm availability and visa status.` |
| **Assign To** | `{ type: 'owner' }` (Candidate owner) |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **SLA Warning** | 3 hours |
| **SLA Breach** | 6 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_RESUME_REVIEW

**Name:** Review candidate resume
**Description:** Detailed resume review before submission

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_RESUME_REVIEW` |
| **Trigger Event** | `resume.uploaded` |
| **Trigger Conditions** | None |
| **Activity Type** | `review` |
| **Subject Template** | `Review resume for {{candidate.name}}` |
| **Description Template** | `Assess skills match, experience level, employment gaps, education credentials.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_SUBMITTED_FOLLOWUP

**Name:** Follow up after candidate submission
**Description:** Check submission status with client

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_SUBMITTED_FOLLOWUP` |
| **Trigger Event** | `candidate.submitted` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Follow up on {{candidate.name}} submission to {{job.title}}` |
| **Description Template** | `Contact {{job.account.name}} to check on submission status and next steps.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` (2 business days) |
| **Priority** | `high` |
| **SLA Warning** | 40 hours |
| **SLA Breach** | 56 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_INTERVIEW_PREP

**Name:** Prepare candidate for interview
**Description:** Pre-interview prep call with candidate

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_INTERVIEW_PREP` |
| **Trigger Event** | `interview.scheduled` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Prep call for {{candidate.name}} - {{job.title}} interview` |
| **Description Template** | `Review company background, interview format, key talking points. Confirm candidate readiness.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `-24 hours` (24 hours before interview) |
| **Priority** | `high` |
| **SLA Warning** | -28 hours |
| **SLA Breach** | -20 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_INTERVIEW_DEBRIEF

**Name:** Debrief with candidate post-interview
**Description:** Get candidate feedback after interview

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_INTERVIEW_DEBRIEF` |
| **Trigger Event** | `interview.completed` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Debrief with {{candidate.name}} after {{job.account.name}} interview` |
| **Description Template** | `Get candidate impressions, assess interest level, address concerns.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+2 hours` |
| **Priority** | `high` |
| **SLA Warning** | 90 minutes |
| **SLA Breach** | 4 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_OFFER_FOLLOWUP

**Name:** Follow up on offer decision
**Description:** Check on candidate's offer acceptance decision

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_OFFER_FOLLOWUP` |
| **Trigger Event** | `offer.sent` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Follow up on offer with {{candidate.name}}` |
| **Description Template** | `Check if candidate has questions, timeline for decision, competing offers.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **SLA Warning** | 40 hours |
| **SLA Breach** | 56 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_PLACEMENT_DAY1

**Name:** Day 1 check-in with placed candidate
**Description:** Ensure smooth first day

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_PLACEMENT_DAY1` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Day 1 check-in: {{candidate.name}} at {{placement.client.name}}` |
| **Description Template** | `Confirm successful start, address first-day issues, verify timekeeping setup.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+1 business day` |
| **Specific Time** | `17:00` (5 PM) |
| **Priority** | `high` |
| **SLA Warning** | None (same day) |
| **SLA Breach** | Next business day 10 AM |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_PLACEMENT_WEEK1

**Name:** Week 1 check-in with placed candidate
**Description:** First week progress check

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_PLACEMENT_WEEK1` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Week 1 check-in: {{candidate.name}} at {{placement.client.name}}` |
| **Description Template** | `Review first week experience, address concerns, confirm client satisfaction.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+7 business days` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### CAND_PLACEMENT_30DAY

**Name:** 30-day placement review
**Description:** First milestone check-in

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_PLACEMENT_30DAY` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `30-day review: {{candidate.name}} at {{placement.client.name}}` |
| **Description Template** | `Performance review, satisfaction check, extension discussion.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+30 calendar days` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_STALE_FOLLOWUP

**Name:** Re-engage stale candidate
**Description:** Follow up on candidates with no activity for 7+ days

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_STALE_FOLLOWUP` |
| **Trigger Event** | `candidate.stale` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_since_activity', operator: 'gte', value: 7 }` |
| **Activity Type** | `call` |
| **Subject Template** | `Re-engage candidate: {{candidate.name}}` |
| **Description Template** | `Check availability, interest level, update on new opportunities.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` (immediate) |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### CAND_VISA_EXPIRY_WARNING

**Name:** Visa expiry warning
**Description:** Alert on upcoming visa expiration

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_VISA_EXPIRY_WARNING` |
| **Trigger Event** | `candidate.visa_expiring_soon` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_until_expiry', operator: 'lte', value: 90 }` |
| **Activity Type** | `task` |
| **Subject Template** | `Visa expiry alert: {{candidate.name}} - {{candidate.visa_status}}` |
| **Description Template** | `Visa expires on {{candidate.visa_expiry_date}}. Verify renewal status, update records.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### CAND_REJECTED_FEEDBACK

**Name:** Collect rejection feedback
**Description:** Understand why candidate was rejected

| Field | Value |
|-------|-------|
| **Pattern Code** | `CAND_REJECTED_FEEDBACK` |
| **Trigger Event** | `submission.rejected` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Get rejection feedback for {{candidate.name}}` |
| **Description Template** | `Contact {{job.account.name}} to understand rejection reasons. Document for future improvements.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

## 4. Job Lifecycle Patterns

### JOB_NEW_KICKOFF

**Name:** Job kickoff meeting
**Description:** Initial strategy meeting for new job

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_NEW_KICKOFF` |
| **Trigger Event** | `job.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `Kickoff meeting: {{job.title}} at {{job.account.name}}` |
| **Description Template** | `Review job requirements, ideal candidate profile, sourcing strategy, timeline.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **SLA Warning** | 20 hours |
| **SLA Breach** | 30 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### JOB_SOURCING_START

**Name:** Begin candidate sourcing
**Description:** Start actively sourcing candidates

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_SOURCING_START` |
| **Trigger Event** | `job.published` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Start sourcing for {{job.title}}` |
| **Description Template** | `Search LinkedIn, job boards, internal database. Target: 5-10 qualified candidates.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` (immediate) |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### JOB_WEEKLY_UPDATE

**Name:** Weekly client update
**Description:** Send weekly status update to client

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_WEEKLY_UPDATE` |
| **Trigger Event** | `job.week_passed` (system-generated every 7 days) |
| **Trigger Conditions** | `{ field: 'job.status', operator: 'in', value: ['open', 'urgent'] }` |
| **Activity Type** | `email` |
| **Subject Template** | `Weekly update: {{job.title}} at {{job.account.name}}` |
| **Description Template** | `Send status email: candidates sourced, submitted, interviewed. Next steps.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Specific Time** | `09:00` (Monday 9 AM) |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### JOB_NO_SUBMITS_REVIEW

**Name:** Review job with no submissions
**Description:** Assess job viability if no candidates submitted

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_NO_SUBMITS_REVIEW` |
| **Trigger Event** | `job.no_submissions` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_since_published', operator: 'gte', value: 5 }` |
| **Activity Type** | `review` |
| **Subject Template** | `Review sourcing strategy: {{job.title}}` |
| **Description Template** | `No submissions after 5 days. Review requirements, adjust sourcing approach, discuss with client.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### JOB_STALE_REVIEW

**Name:** Stale job review
**Description:** Review jobs with no activity for 14+ days

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_STALE_REVIEW` |
| **Trigger Event** | `job.stale` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_since_activity', operator: 'gte', value: 14 }` |
| **Activity Type** | `review` |
| **Subject Template** | `Stale job review: {{job.title}}` |
| **Description Template** | `No activity for 14+ days. Assess job viability, client engagement, consider closing.` |
| **Assign To** | `{ type: 'manager' }` (Escalate to manager) |
| **Due Offset** | `+24 hours` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### JOB_FIRST_SUBMISSION

**Name:** Celebrate first submission
**Description:** Track time to first submission

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_FIRST_SUBMISSION` |
| **Trigger Event** | `submission.created` |
| **Trigger Conditions** | `{ field: 'job.submission_count', operator: 'eq', value: 1 }` |
| **Activity Type** | `note` |
| **Subject Template** | `First submission: {{candidate.name}} to {{job.title}}` |
| **Description Template** | `First candidate submitted. Time to first submission: {{days_since_published}} days.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `low` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

### JOB_FILL_CONFIRMATION

**Name:** Confirm job fill
**Description:** Verify all positions filled

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_FILL_CONFIRMATION` |
| **Trigger Event** | `job.all_positions_filled` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Confirm job filled: {{job.title}}` |
| **Description Template** | `All {{job.positions_count}} positions filled. Close job, notify team, update metrics.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### JOB_CLOSING_NOTICE

**Name:** Job closing notification
**Description:** Notify stakeholders before job auto-closes

| Field | Value |
|-------|-------|
| **Pattern Code** | `JOB_CLOSING_NOTICE` |
| **Trigger Event** | `job.end_date_approaching` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_until_end_date', operator: 'lte', value: 7 }` |
| **Activity Type** | `email` |
| **Subject Template** | `Job closing soon: {{job.title}}` |
| **Description Template** | `Job ends on {{job.end_date}}. Finalize submissions, notify client, archive if needed.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

## 5. Submission Workflow Patterns

### SUB_CLIENT_INITIAL_FOLLOWUP

**Name:** Initial client follow-up after submission
**Description:** First check-in with client on submitted candidate

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_CLIENT_INITIAL_FOLLOWUP` |
| **Trigger Event** | `submission.sent_to_client` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Follow up: {{candidate.name}} submission to {{job.account.name}}` |
| **Description Template** | `Confirm receipt, check if resume was reviewed, gauge interest level.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **SLA Warning** | 40 hours |
| **SLA Breach** | 56 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### SUB_CLIENT_SECOND_FOLLOWUP

**Name:** Second client follow-up
**Description:** Second touch if no response after first follow-up

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_CLIENT_SECOND_FOLLOWUP` |
| **Trigger Event** | `submission.no_client_response` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_since_submitted', operator: 'gte', value: 5 }` |
| **Activity Type** | `email` |
| **Subject Template** | `Second follow-up: {{candidate.name}} submission` |
| **Description Template** | `Client has not responded. Send reminder email, copy manager if needed.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### SUB_REJECTED_ANALYSIS

**Name:** Analyze rejection
**Description:** Document and analyze why submission was rejected

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_REJECTED_ANALYSIS` |
| **Trigger Event** | `submission.rejected` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Analyze rejection: {{candidate.name}} for {{job.title}}` |
| **Description Template** | `Get detailed feedback, update candidate profile, inform candidate, document learnings.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### SUB_APPROVED_NEXT_STEPS

**Name:** Schedule interview after approval
**Description:** Move forward with approved submission

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_APPROVED_NEXT_STEPS` |
| **Trigger Event** | `submission.approved` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Schedule interview: {{candidate.name}} at {{job.account.name}}` |
| **Description Template** | `Client approved! Coordinate with client and candidate to schedule interview.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **SLA Warning** | 20 hours |
| **SLA Breach** | 30 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### SUB_RATE_NEGOTIATION

**Name:** Negotiate submission rates
**Description:** Discuss bill/pay rates with client

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_RATE_NEGOTIATION` |
| **Trigger Event** | `submission.rate_objection` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Negotiate rates for {{candidate.name}}` |
| **Description Template** | `Client objected to ${{submission.bill_rate}}/hr rate. Justify value or adjust.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### SUB_WITHDRAWAL_NOTICE

**Name:** Handle submission withdrawal
**Description:** Process candidate withdrawal from submission

| Field | Value |
|-------|-------|
| **Pattern Code** | `SUB_WITHDRAWAL_NOTICE` |
| **Trigger Event** | `submission.withdrawn` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Process withdrawal: {{candidate.name}} from {{job.title}}` |
| **Description Template** | `Notify client, update records, document reason, find replacement if needed.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+2 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

## 6. Interview Workflow Patterns

### INT_SCHEDULE_CONFIRMATION

**Name:** Confirm interview scheduled
**Description:** Verify all parties confirmed interview time

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_SCHEDULE_CONFIRMATION` |
| **Trigger Event** | `interview.scheduled` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Confirm interview: {{candidate.name}} - Round {{interview.round_number}}` |
| **Description Template** | `Verify candidate and client confirmed. Send calendar invites and prep materials.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### INT_CANDIDATE_REMINDER

**Name:** Remind candidate about interview
**Description:** 24-hour interview reminder

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_CANDIDATE_REMINDER` |
| **Trigger Event** | `interview.reminder_24h` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `email` |
| **Subject Template** | `Interview reminder: {{candidate.name}} - Tomorrow at {{interview.time}}` |
| **Description Template** | `Send interview reminder with details, meeting link, interviewer names, tips.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `-24 hours` (24 hours before) |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

### INT_COLLECT_FEEDBACK

**Name:** Collect interview feedback
**Description:** Get feedback from client interviewers

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_COLLECT_FEEDBACK` |
| **Trigger Event** | `interview.completed` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Collect feedback: {{candidate.name}} Round {{interview.round_number}}` |
| **Description Template** | `Contact {{interview.interviewers}} to get detailed feedback, rating, next steps.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **SLA Warning** | 3 hours |
| **SLA Breach** | 6 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### INT_RESCHEDULE_NOTICE

**Name:** Process interview reschedule
**Description:** Handle rescheduled interview

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_RESCHEDULE_NOTICE` |
| **Trigger Event** | `interview.rescheduled` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Reschedule interview: {{candidate.name}}` |
| **Description Template** | `Update calendars, send new invites, notify all parties, document reason.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+2 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### INT_NO_SHOW_FOLLOWUP

**Name:** Handle interview no-show
**Description:** Process candidate or client no-show

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_NO_SHOW_FOLLOWUP` |
| **Trigger Event** | `interview.no_show` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `No-show follow-up: {{candidate.name}}` |
| **Description Template** | `Contact no-show party, understand reason, decide on next steps, reschedule or withdraw.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+1 hour` |
| **Priority** | `critical` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### INT_SCHEDULE_NEXT_ROUND

**Name:** Schedule next interview round
**Description:** Positive feedback - schedule next round

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_SCHEDULE_NEXT_ROUND` |
| **Trigger Event** | `interview.feedback_positive` |
| **Trigger Conditions** | `{ field: 'interview.recommendation', operator: 'in', value: ['strong_yes', 'yes'] }` |
| **Activity Type** | `task` |
| **Subject Template** | `Schedule Round {{interview.round_number + 1}}: {{candidate.name}}` |
| **Description Template** | `Positive feedback! Schedule next interview round with {{job.account.name}}.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### INT_FINAL_ROUND_DECISION

**Name:** Final round decision follow-up
**Description:** Get hiring decision after final round

| Field | Value |
|-------|-------|
| **Pattern Code** | `INT_FINAL_ROUND_DECISION` |
| **Trigger Event** | `interview.completed` |
| **Trigger Conditions** | `{ field: 'interview.type', operator: 'eq', value: 'final_round' }` |
| **Activity Type** | `call` |
| **Subject Template** | `Final decision: {{candidate.name}} at {{job.account.name}}` |
| **Description Template** | `Get hiring decision from client. Extend offer or provide feedback.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `critical` |
| **SLA Warning** | 40 hours |
| **SLA Breach** | 56 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

## 7. Placement Lifecycle Patterns

### PLACE_PRE_START_CONFIRMATION

**Name:** Pre-start confirmation call
**Description:** Confirm start date and logistics 3 days before

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_PRE_START_CONFIRMATION` |
| **Trigger Event** | `placement.start_approaching` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_until_start', operator: 'eq', value: 3 }` |
| **Activity Type** | `call` |
| **Subject Template** | `Pre-start confirmation: {{placement.consultant.name}} at {{placement.client.name}}` |
| **Description Template** | `Confirm start date, time, location/remote setup, first-day contact, documentation needed.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_DAY1_CONSULTANT

**Name:** Day 1 consultant check-in
**Description:** End-of-day check-in with consultant

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_DAY1_CONSULTANT` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Day 1 check-in: {{placement.consultant.name}}` |
| **Description Template** | `How was first day? Any issues? Confirm timesheet submission process.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+1 business day` |
| **Specific Time** | `17:00` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_DAY1_CLIENT

**Name:** Day 1 client check-in
**Description:** Confirm successful consultant start with client

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_DAY1_CLIENT` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Day 1 client check: {{placement.consultant.name}} at {{placement.client.name}}` |
| **Description Template** | `Verify consultant started successfully, no issues, client satisfied.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+1 business day` |
| **Specific Time** | `16:00` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_30DAY_REVIEW

**Name:** 30-day performance review
**Description:** First milestone review meeting

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_30DAY_REVIEW` |
| **Trigger Event** | `placement.milestone_30days` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `30-day review: {{placement.consultant.name}} at {{placement.client.name}}` |
| **Description Template** | `Formal review with client and consultant. Performance, satisfaction, extension discussion.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 days` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_60DAY_REVIEW

**Name:** 60-day performance review
**Description:** Second milestone review

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_60DAY_REVIEW` |
| **Trigger Event** | `placement.milestone_60days` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `60-day review: {{placement.consultant.name}}` |
| **Description Template** | `Mid-assignment review. Performance trends, extension likelihood, address concerns.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 days` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### PLACE_END_APPROACHING

**Name:** Placement end approaching
**Description:** Discuss extension 30 days before end

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_END_APPROACHING` |
| **Trigger Event** | `placement.end_approaching` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_until_end', operator: 'eq', value: 30 }` |
| **Activity Type** | `call` |
| **Subject Template** | `Extension discussion: {{placement.consultant.name}}` |
| **Description Template** | `Placement ends {{placement.end_date}}. Discuss extension with client and consultant.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_TIMESHEET_MISSING

**Name:** Missing timesheet reminder
**Description:** Consultant did not submit timesheet

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_TIMESHEET_MISSING` |
| **Trigger Event** | `placement.timesheet_missing` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Missing timesheet: {{placement.consultant.name}} - Week of {{week_start}}` |
| **Description Template** | `Timesheet not submitted. Contact consultant immediately. Deadline: {{timesheet_deadline}}.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `critical` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_EXTENSION_CONFIRMED

**Name:** Process placement extension
**Description:** Handle confirmed extension

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_EXTENSION_CONFIRMED` |
| **Trigger Event** | `placement.extended` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Process extension: {{placement.consultant.name}}` |
| **Description Template** | `Update end date to {{placement.new_end_date}}, notify payroll, update systems.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### PLACE_OFFBOARDING

**Name:** Placement offboarding
**Description:** Process placement end

| Field | Value |
|-------|-------|
| **Pattern Code** | `PLACE_OFFBOARDING` |
| **Trigger Event** | `placement.ended` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Offboard: {{placement.consultant.name}} from {{placement.client.name}}` |
| **Description Template** | `Final timesheet approval, collect equipment, exit interview, update availability.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

## 8. Account Management Patterns

### ACCT_NEW_WELCOME

**Name:** Welcome new account
**Description:** Initial outreach to new client account

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_NEW_WELCOME` |
| **Trigger Event** | `account.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `email` |
| **Subject Template** | `Welcome to {{org.name}}: {{account.name}}` |
| **Description Template** | `Send welcome email with onboarding materials, team introduction, next steps.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### ACCT_FIRST_JOB_MEETING

**Name:** First job kickoff meeting
**Description:** Relationship building for first job

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_FIRST_JOB_MEETING` |
| **Trigger Event** | `job.created` |
| **Trigger Conditions** | `{ field: 'account.job_count', operator: 'eq', value: 1 }` (first job) |
| **Activity Type** | `meeting` |
| **Subject Template** | `Partnership kickoff: {{account.name}}` |
| **Description Template** | `First job with new client. Build relationship, set expectations, review process.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### ACCT_QUARTERLY_REVIEW

**Name:** Quarterly business review
**Description:** QBR with account stakeholders

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_QUARTERLY_REVIEW` |
| **Trigger Event** | `account.quarter_ended` (system-generated) |
| **Trigger Conditions** | `{ field: 'account.tier', operator: 'in', value: ['tier_1', 'tier_2'] }` |
| **Activity Type** | `meeting` |
| **Subject Template** | `Q{{quarter}} Business Review: {{account.name}}` |
| **Description Template** | `Quarterly review: placements, performance, satisfaction, upcoming needs, expansion.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+5 business days` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### ACCT_NO_ACTIVITY_ALERT

**Name:** Re-engage inactive account
**Description:** No activity for 30+ days

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_NO_ACTIVITY_ALERT` |
| **Trigger Event** | `account.no_activity` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_since_activity', operator: 'gte', value: 30 }` |
| **Activity Type** | `call` |
| **Subject Template** | `Re-engage account: {{account.name}}` |
| **Description Template** | `No activity for 30+ days. Check in, assess current needs, share market insights.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### ACCT_AT_RISK

**Name:** At-risk account review
**Description:** Health score dropped significantly

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_AT_RISK` |
| **Trigger Event** | `account.health_score_dropped` |
| **Trigger Conditions** | `{ field: 'account.health_score', operator: 'lt', value: 50 }` |
| **Activity Type** | `escalation` |
| **Subject Template** | `At-risk account: {{account.name}} (Health: {{account.health_score}})` |
| **Description Template** | `Health score dropped to {{account.health_score}}. Investigate issues, create recovery plan.` |
| **Assign To** | `{ type: 'manager' }` (Escalate) |
| **Due Offset** | `+4 hours` |
| **Priority** | `critical` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### ACCT_CONTRACT_EXPIRING

**Name:** Contract expiring notice
**Description:** Client contract approaching expiration

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_CONTRACT_EXPIRING` |
| **Trigger Event** | `account.contract_expiring` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_until_contract_expiry', operator: 'lte', value: 60 }` |
| **Activity Type** | `meeting` |
| **Subject Template** | `Contract renewal: {{account.name}}` |
| **Description Template** | `Contract expires {{account.contract_expiry_date}}. Schedule renewal discussion.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### ACCT_FIRST_PLACEMENT

**Name:** Celebrate first placement
**Description:** First successful placement with account

| Field | Value |
|-------|-------|
| **Pattern Code** | `ACCT_FIRST_PLACEMENT` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | `{ field: 'account.placement_count', operator: 'eq', value: 1 }` |
| **Activity Type** | `task` |
| **Subject Template** | `First placement success: {{placement.consultant.name}} at {{account.name}}` |
| **Description Template** | `First placement! Send thank you, request testimonial, discuss future needs.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+7 business days` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

## 9. Lead & Deal Pipeline Patterns

### LEAD_NEW_QUALIFY

**Name:** Qualify new lead
**Description:** Initial qualification call

| Field | Value |
|-------|-------|
| **Pattern Code** | `LEAD_NEW_QUALIFY` |
| **Trigger Event** | `lead.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Qualification call: {{lead.company}} - {{lead.contact_name}}` |
| **Description Template** | `Assess fit: budget, authority, need, timeline. Qualify or disqualify.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **SLA Warning** | 20 hours |
| **SLA Breach** | 30 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### LEAD_WARM_FOLLOWUP

**Name:** Follow up on warm lead
**Description:** Send materials to warm lead

| Field | Value |
|-------|-------|
| **Pattern Code** | `LEAD_WARM_FOLLOWUP` |
| **Trigger Event** | `lead.marked_warm` |
| **Trigger Conditions** | None |
| **Activity Type** | `email` |
| **Subject Template** | `Send capability deck: {{lead.company}}` |
| **Description Template** | `Lead is warm. Send company overview, case studies, testimonials.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### LEAD_COLD_NURTURE

**Name:** Nurture cold lead
**Description:** Add to nurture campaign

| Field | Value |
|-------|-------|
| **Pattern Code** | `LEAD_COLD_NURTURE` |
| **Trigger Event** | `lead.marked_cold` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Add to nurture: {{lead.company}}` |
| **Description Template** | `Not ready now. Add to email nurture campaign, follow up in 90 days.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `low` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

### DEAL_CREATED_PROPOSAL

**Name:** Prepare proposal
**Description:** Create proposal for new deal

| Field | Value |
|-------|-------|
| **Pattern Code** | `DEAL_CREATED_PROPOSAL` |
| **Trigger Event** | `deal.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Prepare proposal: {{deal.name}}` |
| **Description Template** | `Create custom proposal: scope, pricing, terms. Target value: ${{deal.value}}.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### DEAL_PROPOSAL_SENT_FOLLOWUP

**Name:** Follow up on proposal
**Description:** Check on sent proposal

| Field | Value |
|-------|-------|
| **Pattern Code** | `DEAL_PROPOSAL_SENT_FOLLOWUP` |
| **Trigger Event** | `deal.proposal_sent` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `Proposal follow-up: {{deal.name}}` |
| **Description Template** | `Confirm receipt, answer questions, gauge interest, push for decision timeline.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+72 hours` (3 business days) |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### DEAL_STALE_REVIEW

**Name:** Review stale deal
**Description:** Deal stuck in stage for 7+ days

| Field | Value |
|-------|-------|
| **Pattern Code** | `DEAL_STALE_REVIEW` |
| **Trigger Event** | `deal.stale` (system-generated) |
| **Trigger Conditions** | `{ field: 'days_in_stage', operator: 'gte', value: 7 }` |
| **Activity Type** | `review` |
| **Subject Template** | `Stale deal review: {{deal.name}}` |
| **Description Template** | `Deal stuck in {{deal.stage}} for {{days_in_stage}} days. Re-engage or mark lost.` |
| **Assign To** | `{ type: 'manager' }` (Escalate) |
| **Due Offset** | `+24 hours` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### DEAL_WON_ONBOARDING

**Name:** Onboard won deal
**Description:** Start client onboarding process

| Field | Value |
|-------|-------|
| **Pattern Code** | `DEAL_WON_ONBOARDING` |
| **Trigger Event** | `deal.won` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Onboard new client: {{deal.name}}` |
| **Description Template** | `Deal won! Create account, send welcome pack, schedule kickoff, assign AM.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### DEAL_LOST_ANALYSIS

**Name:** Analyze lost deal
**Description:** Understand why deal was lost

| Field | Value |
|-------|-------|
| **Pattern Code** | `DEAL_LOST_ANALYSIS` |
| **Trigger Event** | `deal.lost` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Lost deal analysis: {{deal.name}}` |
| **Description Template** | `Document loss reason, competitor, learnings. Add to nurture for future.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+4 hours` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

## 10. Bench Sales Patterns

### BENCH_NEW_ONBOARDING

**Name:** Onboard bench consultant
**Description:** Complete bench consultant onboarding

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_NEW_ONBOARDING` |
| **Trigger Event** | `bench_consultant.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Onboard bench consultant: {{consultant.name}}` |
| **Description Template** | `Complete I-9, W-4, direct deposit, benefits enrollment, training schedule.` |
| **Assign To** | `{ type: 'specific_role', role: 'hr_manager' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### BENCH_MARKETING_START

**Name:** Begin marketing bench consultant
**Description:** Start actively marketing consultant

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_MARKETING_START` |
| **Trigger Event** | `bench_consultant.onboarded` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Market consultant: {{consultant.name}}` |
| **Description Template** | `Create hotlist entry, send to vendors, post on job boards, reach out to clients.` |
| **Assign To** | `{ type: 'specific_role', role: 'bench_sales' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### BENCH_WEEKLY_UPDATE

**Name:** Weekly bench consultant check-in
**Description:** Check on consultant well-being and job search

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_WEEKLY_UPDATE` |
| **Trigger Event** | `bench_consultant.week_passed` (system-generated) |
| **Trigger Conditions** | `{ field: 'consultant.status', operator: 'eq', value: 'bench' }` |
| **Activity Type** | `call` |
| **Subject Template** | `Weekly check-in: {{consultant.name}}` |
| **Description Template** | `Status update, morale check, training progress, interview updates.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Specific Time** | `10:00` (Monday 10 AM) |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | Yes |

---

### BENCH_TRAINING_ASSIGN

**Name:** Assign training to bench consultant
**Description:** Upskill consultant while on bench

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_TRAINING_ASSIGN` |
| **Trigger Event** | `bench_consultant.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Assign training: {{consultant.name}}` |
| **Description Template** | `Identify skill gaps, assign relevant courses, set completion deadlines.` |
| **Assign To** | `{ type: 'specific_role', role: 'ta_specialist' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `medium` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### BENCH_30DAY_WARNING

**Name:** 30-day bench alert
**Description:** Escalate if consultant on bench for 30+ days

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_30DAY_WARNING` |
| **Trigger Event** | `bench_consultant.milestone_30days` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `escalation` |
| **Subject Template** | `30-day bench alert: {{consultant.name}}` |
| **Description Template** | `Consultant on bench for 30 days. Review marketing strategy, consider alternatives.` |
| **Assign To** | `{ type: 'manager' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### BENCH_PLACEMENT_SUCCESS

**Name:** Bench placement celebration
**Description:** Consultant placed from bench

| Field | Value |
|-------|-------|
| **Pattern Code** | `BENCH_PLACEMENT_SUCCESS` |
| **Trigger Event** | `placement.started` |
| **Trigger Conditions** | `{ field: 'consultant.previous_status', operator: 'eq', value: 'bench' }` |
| **Activity Type** | `note` |
| **Subject Template** | `Bench placement: {{consultant.name}} at {{placement.client.name}}` |
| **Description Template** | `Placed from bench! Time on bench: {{days_on_bench}} days. Marketing success.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `low` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

## 11. HR & Talent Acquisition Patterns

### HR_NEW_HIRE_ONBOARDING

**Name:** New hire onboarding
**Description:** Complete new employee onboarding

| Field | Value |
|-------|-------|
| **Pattern Code** | `HR_NEW_HIRE_ONBOARDING` |
| **Trigger Event** | `employee.hired` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Onboard new hire: {{employee.name}}` |
| **Description Template** | `I-9, W-4, benefits enrollment, equipment setup, training schedule, buddy assignment.` |
| **Assign To** | `{ type: 'specific_role', role: 'hr_manager' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### HR_90DAY_REVIEW

**Name:** 90-day performance review
**Description:** First performance review for new employee

| Field | Value |
|-------|-------|
| **Pattern Code** | `HR_90DAY_REVIEW` |
| **Trigger Event** | `employee.milestone_90days` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `90-day review: {{employee.name}}` |
| **Description Template** | `Formal 90-day review: performance, fit, goals, feedback.` |
| **Assign To** | `{ type: 'manager' }` (Employee's manager) |
| **Due Offset** | `+0 days` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### HR_ANNUAL_REVIEW

**Name:** Annual performance review
**Description:** Yearly performance review

| Field | Value |
|-------|-------|
| **Pattern Code** | `HR_ANNUAL_REVIEW` |
| **Trigger Event** | `employee.anniversary` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `meeting` |
| **Subject Template** | `Annual review: {{employee.name}}` |
| **Description Template** | `Comprehensive annual review: performance, goals, compensation, career development.` |
| **Assign To** | `{ type: 'manager' }` |
| **Due Offset** | `+7 business days` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### HR_BENEFITS_ENROLLMENT

**Name:** Benefits enrollment reminder
**Description:** Remind employee of open enrollment

| Field | Value |
|-------|-------|
| **Pattern Code** | `HR_BENEFITS_ENROLLMENT` |
| **Trigger Event** | `hr.benefits_enrollment_opens` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `email` |
| **Subject Template** | `Benefits enrollment: {{employee.name}}` |
| **Description Template** | `Open enrollment active. Review options, make selections, deadline: {{enrollment_deadline}}.` |
| **Assign To** | `{ type: 'specific_role', role: 'hr_manager' }` |
| **Due Offset** | `+0 hours` |
| **Priority** | `medium` |
| **Can Skip** | Yes |
| **Requires Outcome** | No |

---

### HR_TRAINING_COMPLIANCE

**Name:** Compliance training reminder
**Description:** Annual compliance training due

| Field | Value |
|-------|-------|
| **Pattern Code** | `HR_TRAINING_COMPLIANCE` |
| **Trigger Event** | `hr.compliance_training_due` (system-generated) |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Compliance training: {{employee.name}}` |
| **Description Template** | `Annual compliance training due: Sexual Harassment, Data Security, Ethics.` |
| **Assign To** | `{ type: 'owner' }` (Employee) |
| **Due Offset** | `+30 calendar days` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### TA_CAMPAIGN_LAUNCH

**Name:** Launch recruiting campaign
**Description:** Start new talent acquisition campaign

| Field | Value |
|-------|-------|
| **Pattern Code** | `TA_CAMPAIGN_LAUNCH` |
| **Trigger Event** | `ta_campaign.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Launch campaign: {{campaign.name}}` |
| **Description Template** | `Activate campaign channels, post ads, send outreach, track responses.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### TA_LEAD_FOLLOWUP

**Name:** Follow up on talent acquisition lead
**Description:** Contact inbound lead from campaign

| Field | Value |
|-------|-------|
| **Pattern Code** | `TA_LEAD_FOLLOWUP` |
| **Trigger Event** | `ta_lead.created` |
| **Trigger Conditions** | None |
| **Activity Type** | `call` |
| **Subject Template** | `TA lead follow-up: {{lead.name}}` |
| **Description Template** | `Inbound lead from {{lead.source}}. Qualify interest, assess fit, schedule screening.` |
| **Assign To** | `{ type: 'owner' }` |
| **Due Offset** | `+24 hours` |
| **Priority** | `high` |
| **SLA Warning** | 20 hours |
| **SLA Breach** | 30 hours |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

### TA_INTERNAL_HIRE

**Name:** Process internal hire
**Description:** Handle internal employee hire

| Field | Value |
|-------|-------|
| **Pattern Code** | `TA_INTERNAL_HIRE` |
| **Trigger Event** | `internal_hire.approved` |
| **Trigger Conditions** | None |
| **Activity Type** | `task` |
| **Subject Template** | `Process internal hire: {{employee.name}} to {{new_role}}` |
| **Description Template** | `Update role, compensation, manager, notify teams, transition plan.` |
| **Assign To** | `{ type: 'specific_role', role: 'hr_manager' }` |
| **Due Offset** | `+48 hours` |
| **Priority** | `high` |
| **Can Skip** | No |
| **Requires Outcome** | Yes |

---

## 12. Creating Custom Patterns

### 12.1 When to Create a Custom Pattern

Create a custom pattern when:

1. **Repetitive Manual Tasks:** You find yourself creating the same activity repeatedly
2. **SLA Requirements:** You need to enforce specific response times
3. **Compliance Needs:** Regulatory or internal compliance requires specific actions
4. **Process Standardization:** You want all team members to follow the same workflow
5. **New Workflow:** You're introducing a new process to the organization

### 12.2 Pattern Design Checklist

Before creating a pattern, answer these questions:

| Question | Purpose |
|----------|---------|
| What event triggers this activity? | Identify the trigger event |
| Who should own this activity? | Determine assignment rule |
| How soon should it be done? | Set due date offset |
| Is this critical to the business? | Set priority level |
| Can users skip this? | Set can_be_skipped flag |
| What outcome is expected? | Determine requires_outcome |
| What are the SLA thresholds? | Set warning and breach times |
| What information should the activity show? | Design subject/description templates |

### 12.3 Step-by-Step Pattern Creation

#### Step 1: Define the Pattern

```typescript
{
  pattern_code: 'CUSTOM_MY_PATTERN',
  name: 'My Custom Pattern',
  description: 'What this pattern does and why it exists',
  is_active: true,
  is_system: false,
  can_be_skipped: false,
  requires_outcome: true
}
```

#### Step 2: Set the Trigger

```typescript
{
  trigger_event: 'entity.event_name',
  trigger_conditions: [
    {
      field: 'entity.field_name',
      operator: 'eq',
      value: 'expected_value'
    }
  ]
}
```

**Common Trigger Events:**
- `candidate.created`, `candidate.updated`, `candidate.submitted`, `candidate.stale`
- `job.created`, `job.published`, `job.filled`, `job.stale`
- `submission.sent_to_client`, `submission.approved`, `submission.rejected`
- `interview.scheduled`, `interview.completed`, `interview.no_show`
- `placement.started`, `placement.extended`, `placement.ended`
- `account.created`, `account.health_score_dropped`
- `lead.created`, `deal.won`, `deal.lost`

#### Step 3: Design the Activity Template

```typescript
{
  activity_type: 'call', // or email, task, meeting, etc.
  subject_template: 'Action needed: {{entity.name}}',
  description_template: 'Detailed instructions with {{dynamic.variables}}',
  priority: 'high' // critical, high, medium, low
}
```

#### Step 4: Set Assignment Rule

```typescript
// Option 1: Assign to entity owner
{
  assign_to: { type: 'owner' }
}

// Option 2: Assign to RACI role
{
  assign_to: { type: 'raci_role', role: 'A' } // Accountable person
}

// Option 3: Assign to specific role
{
  assign_to: { type: 'specific_role', role: 'recruiter' }
}

// Option 4: Assign to specific user
{
  assign_to: { type: 'specific_user', user_id: 'user-uuid' }
}

// Option 5: Round robin
{
  assign_to: { type: 'round_robin', group_id: 'recruiting-team' }
}

// Option 6: Least busy
{
  assign_to: { type: 'least_busy' }
}
```

#### Step 5: Set Timing

```typescript
// Hours from trigger
{
  due_offset_hours: 24 // Due in 24 hours
}

// Business days from trigger
{
  due_offset_business_days: 2 // Due in 2 business days
}

// Specific time of day
{
  due_offset_hours: 24,
  specific_time: '09:00' // Due tomorrow at 9 AM
}

// Before event (negative offset)
{
  due_offset_hours: -24 // Due 24 hours BEFORE trigger event
}
```

#### Step 6: Set SLA Thresholds

```typescript
{
  sla_warning_hours: 20,  // Warning at 20 hours
  sla_breach_hours: 28    // Breach at 28 hours
}
```

### 12.4 Testing Your Pattern

Before activating in production:

1. **Create Test Event:** Trigger the event manually in test environment
2. **Verify Activity Created:** Check that activity is created with correct fields
3. **Check Assignment:** Verify correct user receives the activity
4. **Validate Due Date:** Confirm due date calculation is correct
5. **Test Template Variables:** Ensure all {{variables}} are populated
6. **Review Notifications:** Check that assignee is notified
7. **Test SLA Alerts:** Verify warning and breach notifications work

### 12.5 Pattern Performance Metrics

Track these metrics for each pattern:

| Metric | Description | Goal |
|--------|-------------|------|
| **Creation Count** | How many activities created | Measure usage |
| **Completion Rate** | % of activities completed | > 85% |
| **On-Time Rate** | % completed before due date | > 75% |
| **Average Duration** | Time from creation to completion | Benchmark |
| **SLA Compliance** | % completed within SLA | > 90% |
| **Skip Rate** | % of activities skipped | < 10% |
| **Outcome Distribution** | Distribution of outcome types | Identify trends |

### 12.6 Pattern Maintenance

Regularly review patterns:

- **Quarterly Review:** Assess pattern effectiveness
- **Update Templates:** Refresh language as processes evolve
- **Adjust Timing:** Optimize due date offsets based on actual completion times
- **Refine Conditions:** Add/remove trigger conditions as needed
- **Deactivate Unused:** Turn off patterns with low usage

### 12.7 Common Pattern Mistakes to Avoid

| Mistake | Impact | Solution |
|---------|--------|----------|
| Too many patterns | Activity overload | Consolidate similar patterns |
| Due dates too aggressive | High breach rate | Extend offsets |
| Vague subject lines | Low engagement | Use specific, actionable language |
| No conditions | Creates noise | Add conditions to filter |
| Wrong assignee | Activities ignored | Review assignment rules |
| Missing SLA | No urgency | Add warning/breach thresholds |
| Can't skip mandatory | User frustration | Allow skip if not critical |

---

## Appendix A: Quick Reference Tables

### Activity Types

| Type | Icon | When to Use | Typical Duration |
|------|------|-------------|------------------|
| `call` | 📞 | Phone conversation needed | 15-30 min |
| `email` | 📧 | Send or reply to email | 5-15 min |
| `meeting` | 📅 | Scheduled meeting | 30-60 min |
| `task` | ✅ | General task to complete | Varies |
| `note` | 📝 | Add note or comment | 2-5 min |
| `review` | 👁️ | Review document/submission | 10-20 min |
| `sms` | 💬 | Text message | 2 min |
| `linkedin` | 💼 | LinkedIn outreach | 5 min |
| `interview` | 🎤 | Conduct interview | 60 min |
| `escalation` | ⚠️ | Escalate issue | 10 min |
| `follow_up` | ↩️ | Follow-up action | Varies |

### Priority Levels

| Priority | Use When | SLA Example | Color |
|----------|----------|-------------|-------|
| `critical` | Immediate action required | 2-4 hours | Red |
| `high` | Important, do today | 24 hours | Orange |
| `medium` | Standard priority | 48 hours | Yellow |
| `low` | Can wait | 7 days | Green |

### Due Date Offsets

| Offset | Example | Use Case |
|--------|---------|----------|
| `+0 hours` | Immediate | Urgent actions |
| `+4 hours` | Same day | Quick follow-ups |
| `+24 hours` | Next day | Standard follow-ups |
| `+48 hours` | 2 days | Client responses |
| `+7 business days` | 1 week | Non-urgent tasks |
| `-24 hours` | Day before | Pre-event preparation |

### Common Trigger Conditions

```typescript
// Numeric comparisons
{ field: 'deal.value', operator: 'gte', value: 100000 }
{ field: 'days_since_activity', operator: 'gte', value: 7 }

// String matches
{ field: 'candidate.visa_status', operator: 'eq', value: 'H1B' }
{ field: 'job.status', operator: 'in', value: ['open', 'urgent'] }

// Boolean checks
{ field: 'account.is_tier_1', operator: 'eq', value: true }

// Existence checks
{ field: 'placement.end_date', operator: 'exists', value: true }
```

---

## Appendix B: Pattern Examples by Industry

### Staffing Industry Patterns

See sections 3-11 above.

### Professional Services Patterns

```typescript
// Project kickoff
{
  pattern_code: 'PROJ_KICKOFF',
  trigger_event: 'project.created',
  activity_type: 'meeting',
  subject_template: 'Project kickoff: {{project.name}}',
  assign_to: { type: 'owner' },
  due_offset_hours: 48,
  priority: 'high'
}

// Weekly status update
{
  pattern_code: 'PROJ_WEEKLY_STATUS',
  trigger_event: 'project.week_passed',
  activity_type: 'email',
  subject_template: 'Weekly status: {{project.name}}',
  assign_to: { type: 'owner' },
  due_offset_hours: 0,
  specific_time: '09:00',
  priority: 'medium'
}
```

### SaaS Business Patterns

```typescript
// New trial signup
{
  pattern_code: 'TRIAL_WELCOME',
  trigger_event: 'trial.started',
  activity_type: 'email',
  subject_template: 'Welcome trial user: {{user.name}}',
  assign_to: { type: 'specific_role', role: 'csr' },
  due_offset_hours: 1,
  priority: 'high'
}

// Trial expiring
{
  pattern_code: 'TRIAL_EXPIRING',
  trigger_event: 'trial.expiring_soon',
  trigger_conditions: [
    { field: 'days_until_expiry', operator: 'eq', value: 3 }
  ],
  activity_type: 'call',
  subject_template: 'Trial expiring: {{user.name}}',
  assign_to: { type: 'owner' },
  due_offset_hours: 0,
  priority: 'critical'
}
```

---

## Appendix C: Pattern Naming Conventions

### Pattern Code Format

```
{ENTITY}_{TRIGGER}_{ACTION}

Examples:
CAND_NEW_INTRO_CALL
JOB_STALE_REVIEW
SUB_REJECTED_ANALYSIS
PLACE_30DAY_REVIEW
ACCT_AT_RISK
```

### Entity Prefixes

| Prefix | Entity |
|--------|--------|
| `CAND_` | Candidate |
| `JOB_` | Job |
| `SUB_` | Submission |
| `INT_` | Interview |
| `PLACE_` | Placement |
| `ACCT_` | Account |
| `LEAD_` | Lead |
| `DEAL_` | Deal |
| `BENCH_` | Bench Consultant |
| `HR_` | HR/Employee |
| `TA_` | Talent Acquisition |

### Action Suffixes

| Suffix | Meaning |
|--------|---------|
| `_CALL` | Phone call activity |
| `_EMAIL` | Email activity |
| `_REVIEW` | Review/assess activity |
| `_FOLLOWUP` | Follow-up activity |
| `_ALERT` | Warning/alert activity |
| `_CONFIRM` | Confirmation activity |
| `_NOTICE` | Notification activity |
| `_PREP` | Preparation activity |

---

**End of Activity Pattern Library**

*This library defines all standard activity patterns for InTime v3. Patterns ensure consistent workflow execution, SLA compliance, and complete audit trails. Review and update patterns quarterly to optimize performance.*

---

**Related Documents:**
- [01-ACTIVITIES-EVENTS-FRAMEWORK.md](./01-ACTIVITIES-EVENTS-FRAMEWORK.md) - Core framework
- [00-MASTER-FRAMEWORK.md](./00-MASTER-FRAMEWORK.md) - Overall system architecture
