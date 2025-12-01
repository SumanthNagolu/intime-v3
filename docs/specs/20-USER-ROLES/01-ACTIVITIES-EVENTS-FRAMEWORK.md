# Activities & Events Framework

**Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Canonical Reference
**Inspiration:** Guidewire Activity-Centric Architecture

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Activities vs Events](#2-activities-vs-events)
3. [Activity Data Model](#3-activity-data-model)
4. [Event Data Model](#4-event-data-model)
5. [Activity Patterns](#5-activity-patterns)
6. [Auto-Activity Rules](#6-auto-activity-rules)
7. [Event Taxonomy](#7-event-taxonomy)
8. [Entity Integration](#8-entity-integration)
9. [Activity Lifecycle](#9-activity-lifecycle)
10. [UI Components](#10-ui-components)
11. [Activity Timeline](#11-activity-timeline)
12. [Business Rules](#12-business-rules)
13. [Notifications & Alerts](#13-notifications--alerts)
14. [Reporting & Analytics](#14-reporting--analytics)
15. [Implementation Patterns](#15-implementation-patterns)

---

## 1. Core Philosophy

### 1.1 The Golden Rule

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"              ║
║                                                                            ║
║   Every action in InTime v3 generates either:                              ║
║   • ACTIVITY (manual work by humans)                                       ║
║   • EVENT (automated work by system)                                       ║
║                                                                            ║
║   Nothing happens outside of Activities and Events.                        ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### 1.2 Why Activity-Centric?

| Benefit | Description |
|---------|-------------|
| **Complete Audit Trail** | Every action is traceable to a person and timestamp |
| **Work Verification** | Managers can verify work completion objectively |
| **Process Compliance** | Ensures SOPs are followed via required activities |
| **Performance Metrics** | Activity counts and times enable productivity analysis |
| **Accountability** | Clear ownership of every action |
| **Handoff Clarity** | When entities change hands, activity history transfers |
| **Client Transparency** | Can show clients exactly what work was done |
| **AI Training Data** | Activities become training data for AI Twins |

### 1.3 Activity-Centric Workflow Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ACTIVITY-CENTRIC WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Action                                                                 │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────┐                                                        │
│  │ Action Handler  │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ├──────────────────────────────────────────┐                      │
│           │                                          │                      │
│           ▼                                          ▼                      │
│  ┌─────────────────┐                      ┌─────────────────┐              │
│  │ Execute Action  │                      │ Create Activity │              │
│  │ (Business Logic)│                      │ (Always)        │              │
│  └────────┬────────┘                      └────────┬────────┘              │
│           │                                        │                        │
│           ▼                                        │                        │
│  ┌─────────────────┐                              │                        │
│  │ Emit Event(s)   │                              │                        │
│  │ (System Record) │                              │                        │
│  └────────┬────────┘                              │                        │
│           │                                        │                        │
│           ▼                                        │                        │
│  ┌─────────────────┐                              │                        │
│  │ Check Rules:    │◄─────────────────────────────┘                        │
│  │ Auto-Activities │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ├─── Yes ──▶ Create Follow-up Activity                            │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ Notify via RACI │                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Activities vs Events

### 2.1 Definition Matrix

| Aspect | ACTIVITY | EVENT |
|--------|----------|-------|
| **Creator** | Human (user action) | System (automated) |
| **Purpose** | Track work done | Record what happened |
| **Ownership** | Assigned to a user | No owner (system record) |
| **Status** | Open → In Progress → Completed | Immutable (no status) |
| **Editable** | Yes (notes, due date) | No (immutable log) |
| **Due Date** | Yes (can be scheduled) | No (instant record) |
| **Completion** | Requires explicit close | Auto-created, done |
| **Priority** | Yes (High/Medium/Low) | No |
| **Examples** | Call candidate, Review resume | Candidate submitted, Job created |

### 2.2 Visual Distinction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ACTIVITY (Human Work)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📞 Call Candidate - John Smith                           [High Priority]   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Status: ○ Open  ◉ In Progress  ○ Completed                                 │
│                                                                              │
│  Assigned To: Sarah Chen (Technical Recruiter)                              │
│  Due Date: Dec 2, 2024 at 2:00 PM                                           │
│  Related To: Candidate #4523 (John Smith)                                   │
│                                                                              │
│  Notes:                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Need to discuss availability and salary expectations.               │    │
│  │ Client is in a hurry - try to reach today.                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  [Mark Complete]  [Reschedule]  [Reassign]  [Add Note]                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVENT (System Record)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ⚡ candidate.submitted                              Dec 1, 2024 10:23 AM   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Actor: Sarah Chen (Technical Recruiter)                                    │
│  Entity: Submission #8923                                                   │
│  Related: Candidate #4523 → Job #2341                                       │
│                                                                              │
│  Event Data:                                                                 │
│  {                                                                           │
│    "submission_id": "sub_8923",                                             │
│    "candidate_id": "cand_4523",                                             │
│    "job_id": "job_2341",                                                    │
│    "bill_rate": 95.00,                                                      │
│    "pay_rate": 72.00                                                        │
│  }                                                                           │
│                                                                              │
│  [View Submission]  [View Timeline]                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Relationship

```
                    USER ACTION
                         │
                         ▼
              ┌─────────────────────┐
              │   ACTIVITY          │
              │   (What user did)   │
              └──────────┬──────────┘
                         │
                         │ triggers
                         ▼
              ┌─────────────────────┐
              │   EVENT(S)          │
              │   (What happened)   │
              └──────────┬──────────┘
                         │
                         │ may trigger
                         ▼
              ┌─────────────────────┐
              │   AUTO-ACTIVITY     │
              │   (Next step)       │
              └─────────────────────┘
```

---

## 3. Activity Data Model

### 3.1 Activity Schema

```typescript
interface Activity {
  // Identity
  id: string;                          // UUID
  org_id: string;                      // Organization
  activity_number: string;             // Human-readable: ACT-2024-00001

  // Type & Pattern
  activity_type: ActivityType;         // call, email, meeting, task, note, etc.
  activity_pattern_id?: string;        // Reference to pattern (if auto-created)
  is_auto_created: boolean;            // true if system-created from pattern

  // Subject & Description
  subject: string;                     // Short title: "Call candidate about availability"
  description?: string;                // Detailed notes

  // Related Entity (Polymorphic)
  related_entity_type: EntityType;     // candidate, job, submission, account, etc.
  related_entity_id: string;           // ID of related entity

  // Secondary Relations (optional)
  secondary_entity_type?: EntityType;  // e.g., job when activity is on candidate
  secondary_entity_id?: string;

  // Assignment & Ownership
  assigned_to: string;                 // User ID who owns this activity
  created_by: string;                  // User ID who created it

  // Status & Priority
  status: ActivityStatus;              // open, in_progress, completed, cancelled
  priority: ActivityPriority;          // high, medium, low

  // Timing
  due_date?: Date;                     // When it should be done
  due_time?: string;                   // Specific time (HH:MM)
  completed_at?: Date;                 // When it was completed
  duration_minutes?: number;           // How long it took

  // Outcome
  outcome?: ActivityOutcome;           // successful, unsuccessful, no_answer, etc.
  outcome_notes?: string;              // Details about outcome

  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_activity_id?: string;      // Link to next activity

  // Metadata
  tags?: string[];                     // Custom tags
  custom_fields?: Record<string, any>; // Extensible fields

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// Enums
type ActivityType =
  | 'call'              // Phone call
  | 'email'             // Email sent/received
  | 'meeting'           // In-person or video meeting
  | 'task'              // General task
  | 'note'              // Note/comment added
  | 'sms'               // Text message
  | 'linkedin'          // LinkedIn message
  | 'review'            // Review/approval
  | 'document'          // Document action
  | 'interview'         // Interview conducted
  | 'submission'        // Submission action
  | 'status_change'     // Status update
  | 'assignment'        // Assignment/reassignment
  | 'escalation'        // Escalation
  | 'follow_up'         // Follow-up action
  | 'custom';           // Custom type

type ActivityStatus =
  | 'open'              // Not started
  | 'in_progress'       // Being worked on
  | 'completed'         // Done
  | 'cancelled'         // Cancelled/not needed
  | 'deferred';         // Postponed

type ActivityPriority =
  | 'critical'          // Must do immediately
  | 'high'              // Important, do today
  | 'medium'            // Standard priority
  | 'low';              // Can wait

type ActivityOutcome =
  | 'successful'        // Goal achieved
  | 'unsuccessful'      // Did not achieve goal
  | 'no_answer'         // Could not reach
  | 'left_voicemail'    // Left message
  | 'rescheduled'       // Moved to later
  | 'no_show'           // Other party didn't show
  | 'partial'           // Partially completed
  | 'pending_response'; // Waiting for response
```

### 3.2 Activity Types Detail

| Type | Icon | Description | Auto-Creates | Typical Duration |
|------|------|-------------|--------------|------------------|
| `call` | 📞 | Phone call with candidate/client | Follow-up call | 15-30 min |
| `email` | 📧 | Email sent or replied | Follow-up email | 5-15 min |
| `meeting` | 📅 | Scheduled meeting | Meeting notes, follow-up | 30-60 min |
| `task` | ✅ | General task to complete | None | Varies |
| `note` | 📝 | Note or comment | None | 2-5 min |
| `sms` | 💬 | Text message sent | None | 2 min |
| `linkedin` | 💼 | LinkedIn InMail/message | Follow-up | 5 min |
| `review` | 👁️ | Review resume/submission | Submission activity | 10-20 min |
| `document` | 📄 | Document uploaded/sent | None | 5 min |
| `interview` | 🎤 | Interview conducted | Feedback, next interview | 60 min |
| `submission` | 📤 | Candidate submitted to job | Client follow-up | 15 min |
| `status_change` | 🔄 | Status updated | Depends on new status | 2 min |
| `assignment` | 👤 | Entity assigned/reassigned | Introduction activity | 5 min |
| `escalation` | ⚠️ | Issue escalated | Resolution activity | 10 min |
| `follow_up` | ↩️ | Follow-up to prior activity | Next follow-up | Varies |

---

## 4. Event Data Model

### 4.1 Event Schema

```typescript
interface Event {
  // Identity
  id: string;                          // UUID
  org_id: string;                      // Organization
  event_id: string;                    // Human-readable: EVT-2024-00001

  // Event Classification
  event_type: string;                  // e.g., "candidate.submitted"
  event_category: EventCategory;       // entity, workflow, system, integration
  event_severity: EventSeverity;       // info, warning, error, critical

  // Actor (who/what triggered)
  actor_type: ActorType;               // user, system, integration, scheduler
  actor_id?: string;                   // User ID if user-triggered
  actor_name?: string;                 // Display name

  // Entity Affected
  entity_type: EntityType;             // candidate, job, submission, etc.
  entity_id: string;                   // ID of affected entity
  entity_name?: string;                // Display name for quick reference

  // Related Entities
  related_entities?: {
    type: EntityType;
    id: string;
    name?: string;
    relationship: string;              // e.g., "job", "account", "recruiter"
  }[];

  // Event Data
  event_data: Record<string, any>;     // Full event payload
  changes?: {                          // For update events
    field: string;
    old_value: any;
    new_value: any;
  }[];

  // Context
  source: EventSource;                 // ui, api, integration, scheduler, webhook
  ip_address?: string;                 // For audit
  user_agent?: string;                 // For audit
  session_id?: string;                 // Session tracking

  // Correlation
  correlation_id?: string;             // Links related events
  parent_event_id?: string;            // For event chains
  triggered_activity_ids?: string[];   // Activities created by this event

  // Timestamps (immutable)
  occurred_at: Date;                   // When event happened
  recorded_at: Date;                   // When recorded (usually same)
}

// Enums
type EventCategory =
  | 'entity'            // CRUD on entities
  | 'workflow'          // Workflow state changes
  | 'system'            // System events
  | 'integration'       // External integrations
  | 'security'          // Auth/security events
  | 'notification';     // Notification events

type EventSeverity =
  | 'info'              // Normal operation
  | 'warning'           // Potential issue
  | 'error'             // Error occurred
  | 'critical';         // Critical issue

type ActorType =
  | 'user'              // Human user
  | 'system'            // System process
  | 'integration'       // External system
  | 'scheduler'         // Scheduled job
  | 'webhook';          // Incoming webhook

type EventSource =
  | 'ui'                // User interface
  | 'api'               // API call
  | 'integration'       // External integration
  | 'scheduler'         // Scheduled task
  | 'webhook'           // Incoming webhook
  | 'migration';        // Data migration
```

### 4.2 Event Naming Convention

Events follow a `{entity}.{action}` naming pattern:

```
Format: {entity}.{action}[.{qualifier}]

Examples:
- candidate.created
- candidate.updated
- candidate.status_changed
- candidate.submitted
- candidate.submitted.to_client

- job.created
- job.published
- job.closed
- job.filled

- submission.created
- submission.approved
- submission.rejected
- submission.withdrawn

- interview.scheduled
- interview.completed
- interview.feedback_submitted

- placement.started
- placement.extended
- placement.ended
```

---

## 5. Activity Patterns

### 5.1 What are Activity Patterns?

Activity Patterns are templates that define automatic activity creation. When a triggering event occurs, the system creates an activity based on the pattern.

```typescript
interface ActivityPattern {
  // Identity
  id: string;
  org_id: string;
  pattern_code: string;                // e.g., "CANDIDATE_SUBMITTED_FOLLOWUP"

  // Display
  name: string;                        // "Follow up after submission"
  description?: string;

  // Trigger
  trigger_event: string;               // Event type that triggers this
  trigger_conditions?: {               // Optional conditions
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
    value: any;
  }[];

  // Activity Template
  activity_type: ActivityType;
  subject_template: string;            // Supports {{variables}}
  description_template?: string;
  priority: ActivityPriority;

  // Assignment
  assign_to: AssignmentRule;           // How to determine assignee

  // Timing
  due_offset_hours?: number;           // Due date = trigger_time + offset
  due_offset_business_days?: number;   // Business days offset
  specific_time?: string;              // HH:MM for specific time

  // Configuration
  is_active: boolean;
  is_system: boolean;                  // System patterns can't be deleted
  can_be_skipped: boolean;             // User can skip this activity
  requires_outcome: boolean;           // Must record outcome

  // SLA
  sla_warning_hours?: number;          // Warning before due
  sla_breach_hours?: number;           // Breach after due

  // Metadata
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

type AssignmentRule =
  | { type: 'owner' }                  // Entity owner
  | { type: 'raci_role'; role: 'R' | 'A' | 'C' | 'I' }
  | { type: 'specific_user'; user_id: string }
  | { type: 'specific_role'; role: string }
  | { type: 'round_robin'; group_id: string }
  | { type: 'least_busy' }
  | { type: 'creator' };               // Event creator
```

### 5.2 Standard Activity Patterns

#### Candidate Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `CAND_NEW_INTRO_CALL` | `candidate.created` | Call: Introduction call with new candidate | Owner | +4 hours |
| `CAND_SUBMITTED_FOLLOWUP` | `candidate.submitted` | Call: Follow up on submission status | Owner | +24 hours |
| `CAND_INTERVIEW_PREP` | `interview.scheduled` | Task: Prepare candidate for interview | Owner | -24 hours |
| `CAND_INTERVIEW_DEBRIEF` | `interview.completed` | Call: Debrief with candidate post-interview | Owner | +2 hours |
| `CAND_OFFER_FOLLOWUP` | `offer.sent` | Call: Follow up on offer decision | Owner | +48 hours |
| `CAND_PLACEMENT_CHECKIN` | `placement.started` | Call: Day 1 check-in with placed candidate | Owner | +1 day |
| `CAND_PLACEMENT_WEEK1` | `placement.started` | Call: Week 1 check-in | Owner | +7 days |
| `CAND_STALE_FOLLOWUP` | `candidate.stale` (7 days no activity) | Call: Re-engage stale candidate | Owner | +0 hours |

#### Job Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `JOB_NEW_KICKOFF` | `job.created` | Meeting: Job kickoff with hiring manager | Owner | +24 hours |
| `JOB_SOURCING_START` | `job.published` | Task: Begin candidate sourcing | Owner | +0 hours |
| `JOB_WEEKLY_UPDATE` | `job.week_passed` | Email: Weekly status update to client | Owner | +0 hours |
| `JOB_NO_SUBMITS` | `job.no_submissions` (5 days) | Task: Review job requirements, adjust sourcing | Owner | +0 hours |
| `JOB_STALE_REVIEW` | `job.stale` (14 days no activity) | Review: Assess job viability | Manager | +24 hours |

#### Submission Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `SUB_CLIENT_FOLLOWUP` | `submission.sent_to_client` | Call: Follow up with client on submission | Owner | +48 hours |
| `SUB_REJECTED_FEEDBACK` | `submission.rejected` | Task: Get rejection feedback, update candidate | Owner | +4 hours |
| `SUB_INTERVIEW_SCHEDULE` | `submission.approved` | Task: Schedule interview with client | Owner | +24 hours |

#### Placement Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `PLACE_START_CONFIRM` | `placement.start_approaching` (3 days before) | Call: Confirm start date with candidate | Owner | +0 hours |
| `PLACE_DAY1_CLIENT` | `placement.started` | Call: Day 1 check-in with client | Owner | +1 day |
| `PLACE_30DAY_REVIEW` | `placement.started` | Meeting: 30-day performance review | Owner | +30 days |
| `PLACE_END_APPROACHING` | `placement.end_approaching` (30 days before) | Task: Discuss extension with client | Owner | +0 hours |
| `PLACE_TIMESHEET_REMIND` | `placement.timesheet_missing` | Task: Remind consultant to submit timesheet | Owner | +0 hours |

#### Account Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `ACCT_NEW_WELCOME` | `account.created` | Email: Send welcome email to new client | Owner | +4 hours |
| `ACCT_FIRST_JOB` | `job.created` (first for account) | Meeting: Relationship building meeting | Owner | +48 hours |
| `ACCT_QUARTERLY_REVIEW` | `account.quarter_ended` | Meeting: Quarterly business review | Owner | +5 days |
| `ACCT_NO_ACTIVITY` | `account.no_activity` (30 days) | Call: Re-engagement call | Owner | +0 hours |
| `ACCT_AT_RISK` | `account.health_score_dropped` | Escalation: Review at-risk account | Manager | +4 hours |

#### Lead & Deal Patterns

| Pattern Code | Trigger Event | Activity Created | Assign To | Due |
|--------------|---------------|------------------|-----------|-----|
| `LEAD_NEW_QUALIFY` | `lead.created` | Call: Qualification call | Owner | +24 hours |
| `LEAD_WARM_FOLLOWUP` | `lead.marked_warm` | Task: Send capability deck | Owner | +4 hours |
| `DEAL_CREATED_PROPOSAL` | `deal.created` | Task: Prepare proposal | Owner | +48 hours |
| `DEAL_PROPOSAL_SENT` | `deal.proposal_sent` | Call: Follow up on proposal | Owner | +72 hours |
| `DEAL_STALE` | `deal.stale` (7 days in stage) | Review: Assess deal progress | Manager | +24 hours |

### 5.3 Pattern Configuration UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Activity Patterns                                        [+ New Pattern]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Filter: [All Entities ▼] [Active Only ☑]               Search: [________]  │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 CAND_SUBMITTED_FOLLOWUP                              [Active] [Edit] │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Trigger: candidate.submitted                                            │ │
│ │ Creates: Call - "Follow up on {{candidate.name}} submission"            │ │
│ │ Assign To: Entity Owner                                                 │ │
│ │ Due: +24 hours (business hours)                                         │ │
│ │ Priority: High                                                          │ │
│ │                                                                          │ │
│ │ SLA: Warning at 20 hours, Breach at 28 hours                           │ │
│ │ Last 30 Days: 234 activities created, 89% completed on time            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📅 CAND_INTERVIEW_PREP                                  [Active] [Edit] │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Trigger: interview.scheduled                                            │ │
│ │ Creates: Task - "Prepare {{candidate.name}} for interview"              │ │
│ │ Assign To: Entity Owner                                                 │ │
│ │ Due: -24 hours before interview (must complete before)                  │ │
│ │ Priority: High                                                          │ │
│ │                                                                          │ │
│ │ SLA: Warning at -28 hours, Breach at -20 hours                         │ │
│ │ Last 30 Days: 156 activities created, 94% completed on time            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ ACCT_AT_RISK                                        [Active] [Edit] │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Trigger: account.health_score_dropped (below 50)                        │ │
│ │ Creates: Escalation - "Review at-risk account: {{account.name}}"        │ │
│ │ Assign To: Pod Manager                                                  │ │
│ │ Due: +4 hours                                                           │ │
│ │ Priority: Critical                                                      │ │
│ │                                                                          │ │
│ │ SLA: Warning at 2 hours, Breach at 6 hours                             │ │
│ │ Last 30 Days: 12 activities created, 100% completed on time            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ [1] [2] [3] ... [12]                                        Showing 1-10   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Auto-Activity Rules

### 6.1 Rule Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTO-ACTIVITY RULE ENGINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Event Occurs                                                                │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 1. Event Published to Event Bus                             │            │
│  └─────────────────────────────────────────────────────────────┘            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 2. Activity Pattern Matcher                                 │            │
│  │    - Find patterns where trigger_event = event_type         │            │
│  │    - Evaluate trigger_conditions against event_data         │            │
│  └─────────────────────────────────────────────────────────────┘            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 3. For each matching pattern:                               │            │
│  │    a. Check if activity already exists (dedup)              │            │
│  │    b. Resolve assignee using AssignmentRule                 │            │
│  │    c. Calculate due_date from offset                        │            │
│  │    d. Interpolate subject/description templates             │            │
│  │    e. Create Activity record                                │            │
│  └─────────────────────────────────────────────────────────────┘            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 4. Link Activity to triggering Event                        │            │
│  │    - event.triggered_activity_ids.push(activity.id)         │            │
│  │    - activity.activity_pattern_id = pattern.id              │            │
│  └─────────────────────────────────────────────────────────────┘            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ 5. Send Notification to Assignee                            │            │
│  │    - In-app notification                                    │            │
│  │    - Email (if configured)                                  │            │
│  │    - Mobile push (if urgent)                                │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Template Variables

Available variables for subject and description templates:

```typescript
// Candidate context
{{candidate.id}}
{{candidate.name}}
{{candidate.email}}
{{candidate.phone}}
{{candidate.status}}
{{candidate.owner.name}}

// Job context
{{job.id}}
{{job.title}}
{{job.account.name}}
{{job.location}}
{{job.rate_range}}
{{job.owner.name}}

// Submission context
{{submission.id}}
{{submission.status}}
{{submission.bill_rate}}
{{submission.candidate.name}}
{{submission.job.title}}

// Account context
{{account.id}}
{{account.name}}
{{account.industry}}
{{account.owner.name}}

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

### 6.3 Example Template Interpolation

**Pattern:** `CAND_SUBMITTED_FOLLOWUP`
**Subject Template:** `Follow up on {{candidate.name}} submission to {{job.title}}`
**Event Data:**
```json
{
  "candidate": { "name": "John Smith" },
  "job": { "title": "Senior Java Developer @ Google" }
}
```
**Resulting Subject:** `Follow up on John Smith submission to Senior Java Developer @ Google`

---

## 7. Event Taxonomy

### 7.1 Complete Event Type Catalog

#### Candidate Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `candidate.created` | entity | info | New candidate created |
| `candidate.updated` | entity | info | Candidate profile updated |
| `candidate.deleted` | entity | warning | Candidate deleted |
| `candidate.merged` | entity | info | Candidates merged |
| `candidate.status_changed` | workflow | info | Status changed |
| `candidate.owner_changed` | workflow | info | Owner reassigned |
| `candidate.sourced` | workflow | info | Sourced from platform |
| `candidate.contacted` | workflow | info | First contact made |
| `candidate.qualified` | workflow | info | Marked as qualified |
| `candidate.submitted` | workflow | info | Submitted to job |
| `candidate.interviewed` | workflow | info | Interview completed |
| `candidate.offered` | workflow | info | Offer extended |
| `candidate.placed` | workflow | info | Placement started |
| `candidate.rejected` | workflow | info | Rejected from pipeline |
| `candidate.reactivated` | workflow | info | Reactivated from inactive |
| `candidate.stale` | system | warning | No activity for 7 days |
| `candidate.duplicate_detected` | system | warning | Potential duplicate found |

#### Job Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `job.created` | entity | info | New job created |
| `job.updated` | entity | info | Job details updated |
| `job.deleted` | entity | warning | Job deleted |
| `job.published` | workflow | info | Job published/activated |
| `job.paused` | workflow | info | Job paused |
| `job.closed` | workflow | info | Job closed |
| `job.filled` | workflow | info | All positions filled |
| `job.owner_changed` | workflow | info | Owner reassigned |
| `job.priority_changed` | workflow | info | Priority changed |
| `job.extended` | workflow | info | Job extended |
| `job.no_submissions` | system | warning | No submissions in 5 days |
| `job.stale` | system | warning | No activity in 14 days |
| `job.sla_warning` | system | warning | SLA warning threshold |
| `job.sla_breach` | system | error | SLA breached |

#### Submission Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `submission.created` | entity | info | Submission created |
| `submission.updated` | entity | info | Submission updated |
| `submission.sent_to_client` | workflow | info | Sent to client for review |
| `submission.approved` | workflow | info | Client approved |
| `submission.rejected` | workflow | info | Client rejected |
| `submission.withdrawn` | workflow | info | Withdrawn by recruiter |
| `submission.interview_requested` | workflow | info | Interview requested |
| `submission.offer_pending` | workflow | info | Offer in progress |
| `submission.rate_changed` | workflow | info | Bill/pay rate changed |

#### Interview Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `interview.scheduled` | workflow | info | Interview scheduled |
| `interview.rescheduled` | workflow | info | Interview rescheduled |
| `interview.cancelled` | workflow | warning | Interview cancelled |
| `interview.completed` | workflow | info | Interview completed |
| `interview.no_show` | workflow | warning | Candidate no-show |
| `interview.feedback_submitted` | workflow | info | Feedback submitted |
| `interview.reminder_sent` | system | info | Reminder notification sent |

#### Placement Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `placement.created` | entity | info | Placement record created |
| `placement.started` | workflow | info | Consultant started |
| `placement.extended` | workflow | info | Placement extended |
| `placement.ended` | workflow | info | Placement ended |
| `placement.terminated` | workflow | warning | Early termination |
| `placement.rate_changed` | workflow | info | Rate adjusted |
| `placement.30day_review` | system | info | 30-day milestone |
| `placement.60day_review` | system | info | 60-day milestone |
| `placement.end_approaching` | system | info | End date approaching |
| `placement.timesheet_missing` | system | warning | Timesheet not submitted |
| `placement.timesheet_approved` | workflow | info | Timesheet approved |

#### Account Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `account.created` | entity | info | New account created |
| `account.updated` | entity | info | Account updated |
| `account.owner_changed` | workflow | info | Owner reassigned |
| `account.tier_changed` | workflow | info | Account tier changed |
| `account.health_score_changed` | workflow | info | Health score updated |
| `account.health_score_dropped` | system | warning | Health score dropped significantly |
| `account.no_activity` | system | warning | No activity in 30 days |
| `account.contract_expiring` | system | warning | Contract expiring soon |
| `account.quarter_ended` | system | info | Quarter ended (QBR trigger) |

#### Lead & Deal Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `lead.created` | entity | info | New lead created |
| `lead.qualified` | workflow | info | Lead qualified |
| `lead.converted` | workflow | info | Converted to deal |
| `lead.disqualified` | workflow | info | Lead disqualified |
| `lead.stale` | system | warning | No activity in 7 days |
| `deal.created` | entity | info | New deal created |
| `deal.stage_changed` | workflow | info | Deal stage changed |
| `deal.won` | workflow | info | Deal won |
| `deal.lost` | workflow | info | Deal lost |
| `deal.proposal_sent` | workflow | info | Proposal sent |
| `deal.stale` | system | warning | Stuck in stage 7+ days |

#### System Events

| Event Type | Category | Severity | Description |
|------------|----------|----------|-------------|
| `user.login` | security | info | User logged in |
| `user.logout` | security | info | User logged out |
| `user.password_changed` | security | info | Password changed |
| `user.permission_changed` | security | warning | Permissions modified |
| `integration.synced` | integration | info | External sync completed |
| `integration.failed` | integration | error | Integration error |
| `report.generated` | system | info | Report generated |
| `export.completed` | system | info | Data export completed |

---

## 8. Entity Integration

### 8.1 Activity Association by Entity

Every entity in InTime v3 has an associated activity stream:

```typescript
// Polymorphic activity association
interface EntityWithActivities {
  activities: Activity[];          // All activities for this entity
  open_activities: Activity[];     // Pending activities
  recent_activities: Activity[];   // Last 10 activities
  activity_count: number;          // Total activity count
  last_activity_at: Date;          // Most recent activity
  days_since_activity: number;     // For staleness detection
}

// Available on:
// - Candidate
// - Job
// - Submission
// - Placement
// - Account
// - Contact
// - Lead
// - Deal
```

### 8.2 Activity Stream per Entity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Candidate: John Smith                                    Activity Stream    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ [+ Log Activity]  Filter: [All Types ▼]  [All Users ▼]  [All Statuses ▼]   │
│                                                                              │
│ Open Activities (3)                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ 📞 Follow up on Google submission              Due: Today 2:00 PM   │ │
│ │    Assigned: Sarah Chen | Created: System (Auto)  | Priority: High     │ │
│ │    [Start] [Complete] [Reschedule]                                      │ │
│ │                                                                          │ │
│ │ 📅 Prepare for Meta interview                     Due: Dec 3, 9:00 AM  │ │
│ │    Assigned: Sarah Chen | Created: System (Auto)  | Priority: High     │ │
│ │    [Start] [Complete] [Reschedule]                                      │ │
│ │                                                                          │ │
│ │ ✅ Update resume with latest project              Due: Dec 5, 5:00 PM  │ │
│ │    Assigned: Sarah Chen | Created: Sarah Chen     | Priority: Medium   │ │
│ │    [Start] [Complete] [Reschedule]                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Completed Activities                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ 📞 Introduction call                            Completed: Nov 28     │ │
│ │    By: Sarah Chen | Duration: 25 min | Outcome: Successful             │ │
│ │    Notes: Candidate is interested in Google role. Available Jan 15.    │ │
│ │    [View Details]                                                       │ │
│ │                                                                          │ │
│ │ ✓ 📧 Send job description                         Completed: Nov 28     │ │
│ │    By: Sarah Chen | Duration: 5 min | Outcome: Successful              │ │
│ │    Notes: Sent Google JD. Candidate will review and confirm interest.  │ │
│ │    [View Details]                                                       │ │
│ │                                                                          │ │
│ │ ✓ 📞 Confirm interest                             Completed: Nov 29     │ │
│ │    By: Sarah Chen | Duration: 10 min | Outcome: Successful             │ │
│ │    Notes: Confirmed interest. Proceeding with submission.              │ │
│ │    [View Details]                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ [Load More Activities]                                  Showing 6 of 12     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Entity-Specific Activity Requirements

| Entity | Required Activities | Minimum Before Transition |
|--------|--------------------|-----------------------------|
| **Candidate** | Intro call before submission | 1 call activity |
| **Submission** | Review before send to client | 1 review activity |
| **Interview** | Prep before, debrief after | 2 activities |
| **Placement** | Day 1 check-in, Week 1 check-in | Per schedule |
| **Lead** | Qualification call before convert | 1 call activity |
| **Deal** | Proposal activity before close | 1 document activity |
| **Account** | Welcome activity for new accounts | 1 email activity |

---

## 9. Activity Lifecycle

### 9.1 Status Flow

```
┌─────────┐     Start     ┌─────────────┐    Complete    ┌───────────┐
│  Open   │──────────────▶│ In Progress │───────────────▶│ Completed │
└────┬────┘               └──────┬──────┘                └───────────┘
     │                           │
     │ Defer                     │ Cancel
     ▼                           ▼
┌──────────┐               ┌───────────┐
│ Deferred │               │ Cancelled │
└──────────┘               └───────────┘
```

### 9.2 Activity Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Complete Activity                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Activity: Follow up on John Smith submission                                 │
│ Type: 📞 Call                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│ Outcome *                                                                    │
│ ○ Successful - Goal achieved                                                │
│ ○ Unsuccessful - Did not achieve goal                                       │
│ ○ No Answer - Could not reach                                               │
│ ○ Left Voicemail - Left message                                             │
│ ○ Rescheduled - Moved to later                                              │
│ ○ Pending Response - Waiting for response                                   │
│                                                                              │
│ Duration *                                                                   │
│ [15] minutes                                                                 │
│                                                                              │
│ Notes                                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Spoke with John. Client feedback was positive. Moving to next round.   │ │
│ │ Scheduled technical interview for Dec 5 at 10 AM.                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Follow-up Required?                                                          │
│ ☑ Yes, create follow-up activity                                            │
│                                                                              │
│ Follow-up Type: [Call ▼]                                                    │
│ Follow-up Subject: [Confirm interview attendance               ]            │
│ Follow-up Due: [Dec 4, 2024 ▼] at [2:00 PM ▼]                              │
│                                                                              │
│ [Cancel]                                          [Complete Activity]       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Activity Chaining

Activities can create follow-up activities, forming chains:

```
Activity Chain: Candidate Placement Journey
═══════════════════════════════════════════

[1] Intro Call (Nov 25)
 │  Outcome: Successful
 │  Follow-up: Review resume
 │
 └──▶ [2] Review Resume (Nov 26)
       │  Outcome: Successful
       │  Follow-up: Submit to Google
       │
       └──▶ [3] Submit to Job (Nov 27)
             │  Outcome: Successful
             │  Auto-created: Follow up on submission
             │
             └──▶ [4] Follow Up (Nov 28) ◀── Auto-created by pattern
                   │  Outcome: Pending response
                   │  Follow-up: Check again
                   │
                   └──▶ [5] Follow Up (Nov 30)
                         │  Outcome: Successful - Interview scheduled
                         │  Auto-created: Prep for interview
                         │
                         └──▶ [6] Interview Prep (Dec 4) ◀── Auto-created
                               │  ...continues
```

---

## 10. UI Components

### 10.1 Activity Creation Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Log Activity                                                         [×]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Activity Type *                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 Call  │ 📧 Email │ 📅 Meeting │ ✅ Task │ 📝 Note │ 💼 LinkedIn │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Related To *                                                                 │
│ [🔍 Search candidates, jobs, accounts...                              ▼]   │
│ Selected: John Smith (Candidate)                                            │
│                                                                              │
│ Subject *                                                                    │
│ [Discussed salary expectations and start date                        ]      │
│                                                                              │
│ Description                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Called John to discuss the Google offer details.                       │ │
│ │ - Salary: $150k base + 15% bonus acceptable                            │ │
│ │ - Start date: January 15, 2025 works                                   │ │
│ │ - He's excited about the role                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────────────────────────┐  ┌────────────────────────────┐             │
│ │ Status                      │  │ Priority                   │             │
│ │ ○ Open                      │  │ ○ Critical                 │             │
│ │ ○ In Progress               │  │ ○ High                     │             │
│ │ ● Completed                 │  │ ● Medium                   │             │
│ └────────────────────────────┘  │ ○ Low                      │             │
│                                  └────────────────────────────┘             │
│                                                                              │
│ If Completed:                                                                │
│ ┌────────────────────────────┐  ┌────────────────────────────┐             │
│ │ Outcome                     │  │ Duration                   │             │
│ │ [Successful            ▼]  │  │ [15    ] minutes           │             │
│ └────────────────────────────┘  └────────────────────────────┘             │
│                                                                              │
│ ☐ Create follow-up activity                                                 │
│                                                                              │
│ [Cancel]                                              [Save Activity]       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Activity Queue Widget

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ My Activities                                    [View All] [+ New Activity]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Overdue (2)                                                    🔴           │
│ ├─ 📞 Follow up on Amazon submission        Yesterday 5:00 PM              │
│ │     John Smith → Amazon DevOps            [Complete] [Reschedule]        │
│ │                                                                           │
│ └─ 📧 Send capability deck to Acme Corp     2 days ago                     │
│       Lead: Acme Corp                        [Complete] [Reschedule]        │
│                                                                              │
│ Due Today (4)                                                  🟡           │
│ ├─ 📞 Client check-in with Google           Today 10:00 AM                 │
│ │     Account: Google                        [Start] [Reschedule]          │
│ │                                                                           │
│ ├─ 📅 Interview prep with Sarah             Today 2:00 PM                  │
│ │     Candidate: Sarah Lee                   [Start] [Reschedule]          │
│ │                                                                           │
│ ├─ ✅ Update job description                 Today 5:00 PM                 │
│ │     Job: Senior Java Dev @ Meta            [Start] [Reschedule]          │
│ │                                                                           │
│ └─ 📞 Week 1 check-in with placed consultant Today 5:00 PM                 │
│       Placement: Tom Wilson @ Apple          [Start] [Reschedule]          │
│                                                                              │
│ Upcoming (12)                                                  🟢           │
│ └─ [View 12 upcoming activities →]                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────  │
│ Today's Progress: ████████░░░░░░░░░░░░ 4/10 completed                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Quick Log Buttons

Every entity card/detail page has quick activity buttons:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Quick Log:  [📞 Call] [📧 Email] [📝 Note] [✅ Task] [📅 Meeting]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Activity Badge on Entity Cards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ John Smith                                                                   │
│ Senior Java Developer | 7 years exp                                         │
│ San Francisco, CA | $95/hr                                                  │
│                                                                              │
│ Status: Submitted to Google                                                  │
│ Owner: Sarah Chen                                                           │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────┐            │
│ │ 🔴 2 overdue │ 🟡 3 due today │ 📊 15 total activities     │            │
│ │ Last Activity: Call - 2 hours ago                           │            │
│ └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│ [View Profile]  [📞 Call]  [📧 Email]  [📝 Note]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Activity Timeline

### 11.1 Unified Timeline View

The timeline shows both Activities and Events in chronological order:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Timeline: John Smith                                                         │
│                                                                              │
│ Filter: [All ▼]  [📞 Calls] [📧 Emails] [⚡ Events] [✅ Tasks]             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Today, December 1, 2024                                                      │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 10:23 AM ─ ⚡ candidate.submitted                                           │
│            Submitted to: Senior Java Developer @ Google                     │
│            By: Sarah Chen                                                   │
│            Bill Rate: $95/hr | Pay Rate: $72/hr                            │
│            ↳ Auto-created: 📞 Follow up on submission (due tomorrow)       │
│                                                                              │
│ 10:20 AM ─ ✓ 📞 Confirm interest in Google role                            │
│            Duration: 10 min | Outcome: Successful                          │
│            "Confirmed interest. Proceeding with submission."               │
│            By: Sarah Chen                                                   │
│                                                                              │
│ November 30, 2024                                                            │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 3:45 PM ── ✓ 📧 Send Google job description                                │
│            Duration: 5 min | Outcome: Successful                           │
│            "Sent JD. Candidate will review and confirm interest."          │
│            By: Sarah Chen                                                   │
│                                                                              │
│ 3:30 PM ── ⚡ candidate.status_changed                                      │
│            Status: New → Contacted                                          │
│            By: Sarah Chen                                                   │
│                                                                              │
│ 2:00 PM ── ✓ 📞 Introduction call                                          │
│            Duration: 25 min | Outcome: Successful                          │
│            "Candidate is interested in Google role. Available Jan 15.      │
│             Looking for $90-100/hr. Has 7 years Java experience."          │
│            By: Sarah Chen                                                   │
│                                                                              │
│ November 29, 2024                                                            │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 11:00 AM ─ ⚡ candidate.created                                             │
│            Source: LinkedIn import                                          │
│            By: Sarah Chen                                                   │
│            ↳ Auto-created: 📞 Introduction call (completed Nov 30)         │
│                                                                              │
│ [Load More]                                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Timeline Symbols Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Completed activity |
| ○ | Open activity |
| ◉ | In-progress activity |
| ⚡ | System event |
| ↳ | Auto-created follow-up |
| 🔴 | Overdue |
| 🟡 | Due soon |

---

## 12. Business Rules

### 12.1 Mandatory Activity Rules

```typescript
// Rule: Cannot transition without required activities
interface TransitionRule {
  entity_type: EntityType;
  from_status: string;
  to_status: string;
  required_activities: {
    type: ActivityType;
    count: number;
    status: 'completed';
  }[];
  error_message: string;
}

const transitionRules: TransitionRule[] = [
  {
    entity_type: 'candidate',
    from_status: 'new',
    to_status: 'submitted',
    required_activities: [
      { type: 'call', count: 1, status: 'completed' }
    ],
    error_message: 'Must complete at least 1 call before submitting candidate'
  },
  {
    entity_type: 'submission',
    from_status: 'draft',
    to_status: 'sent_to_client',
    required_activities: [
      { type: 'review', count: 1, status: 'completed' }
    ],
    error_message: 'Must complete resume review before sending to client'
  },
  {
    entity_type: 'lead',
    from_status: 'new',
    to_status: 'qualified',
    required_activities: [
      { type: 'call', count: 1, status: 'completed' }
    ],
    error_message: 'Must complete qualification call before marking as qualified'
  }
];
```

### 12.2 SLA Rules

```typescript
interface SLARule {
  entity_type: EntityType;
  metric: string;
  warning_threshold: number;  // hours
  breach_threshold: number;   // hours
  notification_recipients: ('owner' | 'manager' | 'coo')[];
}

const slaRules: SLARule[] = [
  {
    entity_type: 'candidate',
    metric: 'first_contact',
    warning_threshold: 4,
    breach_threshold: 24,
    notification_recipients: ['owner', 'manager']
  },
  {
    entity_type: 'submission',
    metric: 'client_followup',
    warning_threshold: 24,
    breach_threshold: 48,
    notification_recipients: ['owner', 'manager']
  },
  {
    entity_type: 'job',
    metric: 'first_submission',
    warning_threshold: 72,
    breach_threshold: 120,
    notification_recipients: ['owner', 'manager', 'coo']
  }
];
```

### 12.3 Activity Quality Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Minimum Notes** | Call activities must have notes | Block completion without notes |
| **Duration Required** | Call/meeting must log duration | Block completion without duration |
| **Outcome Required** | All activities must have outcome | Block completion without outcome |
| **Follow-up Check** | System prompts for follow-up | Prompt on completion |
| **Stale Entity Alert** | No activity in 7 days triggers alert | Auto-create activity |

---

## 13. Notifications & Alerts

### 13.1 Activity Notifications

| Trigger | Recipients | Channel | Message |
|---------|------------|---------|---------|
| Activity assigned | Assignee | In-app, Email | "New activity assigned: {subject}" |
| Activity due in 1 hour | Assignee | In-app, Push | "Activity due soon: {subject}" |
| Activity overdue | Assignee, Manager | In-app, Email | "Overdue activity: {subject}" |
| Activity completed | RACI Informed | In-app | "{user} completed: {subject}" |
| SLA warning | Owner, Manager | In-app, Email | "SLA warning on {entity}" |
| SLA breach | Owner, Manager, COO | In-app, Email, SMS | "SLA BREACH: {entity}" |

### 13.2 Daily Activity Digest

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📧 Daily Activity Digest - Sarah Chen                                        │
│ December 1, 2024                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Yesterday's Summary                                                          │
│ ✓ Completed: 8 activities                                                   │
│ ○ Open: 3 activities carried over                                           │
│ ⏱️ Total time logged: 3 hours 45 minutes                                    │
│                                                                              │
│ Today's Agenda                                                               │
│ 🔴 Overdue (2)                                                              │
│    • Follow up on Amazon submission (1 day late)                            │
│    • Send capability deck to Acme Corp (2 days late)                        │
│                                                                              │
│ 🟡 Due Today (5)                                                            │
│    • Client check-in with Google (10:00 AM)                                 │
│    • Interview prep with Sarah Lee (2:00 PM)                                │
│    • Week 1 check-in - Tom Wilson @ Apple (5:00 PM)                        │
│    • Update job description - Meta (EOD)                                    │
│    • Submit timesheet (EOD)                                                 │
│                                                                              │
│ 🟢 Upcoming (7 in next 3 days)                                              │
│                                                                              │
│ [View Full Activity List →]                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Reporting & Analytics

### 14.1 Activity Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Activity Analytics                                    Period: [Last 30 Days]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Overview                                                                     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│ │ Total Activities│ │ Completion Rate │ │ On-Time Rate    │                │
│ │      1,234     │ │      89%       │ │      76%       │                │
│ │    ▲ 12% MoM   │ │    ▲ 5% MoM    │ │    ▼ 3% MoM    │                │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│                                                                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│ │ Avg Duration    │ │ SLA Compliance  │ │ Auto-Created    │                │
│ │    18 min      │ │      92%       │ │      45%       │                │
│ │    ▼ 2 min     │ │    ▲ 3%        │ │    ▲ 8%        │                │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│                                                                              │
│ Activity Volume by Type                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Calls        ████████████████████████████████████  456 (37%)            │ │
│ │ Emails       ██████████████████████████  312 (25%)                      │ │
│ │ Tasks        █████████████████  198 (16%)                               │ │
│ │ Meetings     ██████████████  156 (13%)                                  │ │
│ │ Notes        ██████  78 (6%)                                            │ │
│ │ Other        ███  34 (3%)                                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Team Performance                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Recruiter        │ Activities │ Completed │ On-Time │ Avg Duration     │ │
│ │ Sarah Chen       │    145     │   92%     │   85%   │    15 min        │ │
│ │ Mike Torres      │    132     │   88%     │   78%   │    20 min        │ │
│ │ Emily Rodriguez  │    128     │   91%     │   82%   │    18 min        │ │
│ │ David Kim        │    98      │   85%     │   71%   │    22 min        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14.2 Key Activity Reports

| Report | Description | Audience |
|--------|-------------|----------|
| **Activity Volume** | Activities by type, user, entity | Managers |
| **Completion Rate** | % completed vs total | Managers, COO |
| **On-Time Rate** | % completed before due date | Managers, COO |
| **SLA Compliance** | % within SLA thresholds | COO |
| **Activity Velocity** | Activities per placement/hire | Executive |
| **Touch Points** | Average activities per candidate | Recruiting Ops |
| **Response Time** | Time from event to activity completion | COO |
| **Stale Entities** | Entities with no recent activity | Managers |

---

## 15. Implementation Patterns

### 15.1 Creating Activities Programmatically

```typescript
// After every action, create an activity
async function submitCandidateToJob(
  candidateId: string,
  jobId: string,
  userId: string
): Promise<Submission> {
  // 1. Execute business logic
  const submission = await createSubmission({
    candidateId,
    jobId,
    submittedBy: userId
  });

  // 2. Emit event (always)
  await emitEvent({
    type: 'candidate.submitted',
    entityType: 'submission',
    entityId: submission.id,
    actorId: userId,
    eventData: {
      candidateId,
      jobId,
      submissionId: submission.id,
      billRate: submission.billRate,
      payRate: submission.payRate
    }
  });

  // 3. Create manual activity record
  await createActivity({
    type: 'submission',
    subject: `Submitted ${candidate.name} to ${job.title}`,
    relatedEntityType: 'candidate',
    relatedEntityId: candidateId,
    secondaryEntityType: 'job',
    secondaryEntityId: jobId,
    assignedTo: userId,
    createdBy: userId,
    status: 'completed',
    outcome: 'successful',
    completedAt: new Date()
  });

  // 4. Auto-activities created by event handler (via patterns)
  // - "Follow up on submission" will be auto-created

  return submission;
}
```

### 15.2 Event Handler with Auto-Activities

```typescript
// Event handler that triggers auto-activities
async function handleCandidateSubmittedEvent(event: Event): Promise<void> {
  // Find matching activity patterns
  const patterns = await findMatchingPatterns('candidate.submitted');

  for (const pattern of patterns) {
    // Check conditions
    if (!evaluateConditions(pattern.triggerConditions, event.eventData)) {
      continue;
    }

    // Resolve assignee
    const assigneeId = await resolveAssignee(pattern.assignTo, event);

    // Calculate due date
    const dueDate = calculateDueDate(
      event.occurredAt,
      pattern.dueOffsetHours,
      pattern.dueOffsetBusinessDays
    );

    // Interpolate templates
    const subject = interpolateTemplate(pattern.subjectTemplate, event.eventData);
    const description = interpolateTemplate(pattern.descriptionTemplate, event.eventData);

    // Create activity
    const activity = await createActivity({
      type: pattern.activityType,
      subject,
      description,
      relatedEntityType: event.entityType,
      relatedEntityId: event.entityId,
      assignedTo: assigneeId,
      createdBy: 'system',
      status: 'open',
      priority: pattern.priority,
      dueDate,
      isAutoCreated: true,
      activityPatternId: pattern.id
    });

    // Link to event
    await linkActivityToEvent(activity.id, event.id);

    // Send notification
    await notifyAssignee(assigneeId, activity);
  }
}
```

### 15.3 Activity Completion Trigger

```typescript
// When activity is completed, check for follow-up patterns
async function completeActivity(
  activityId: string,
  outcome: ActivityOutcome,
  notes: string,
  duration: number,
  followUp?: {
    type: ActivityType;
    subject: string;
    dueDate: Date;
  }
): Promise<Activity> {
  // Update activity
  const activity = await updateActivity(activityId, {
    status: 'completed',
    outcome,
    outcomeNotes: notes,
    durationMinutes: duration,
    completedAt: new Date()
  });

  // Emit completion event
  await emitEvent({
    type: 'activity.completed',
    entityType: 'activity',
    entityId: activityId,
    eventData: {
      activityType: activity.type,
      outcome,
      relatedEntityType: activity.relatedEntityType,
      relatedEntityId: activity.relatedEntityId
    }
  });

  // Create follow-up if requested
  if (followUp) {
    const followUpActivity = await createActivity({
      ...followUp,
      relatedEntityType: activity.relatedEntityType,
      relatedEntityId: activity.relatedEntityId,
      assignedTo: activity.assignedTo,
      createdBy: activity.assignedTo,
      status: 'open',
      followUpRequired: false
    });

    // Link to parent
    await updateActivity(activityId, {
      followUpActivityId: followUpActivity.id
    });
  }

  return activity;
}
```

### 15.4 Database Schema (Conceptual)

```sql
-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  activity_number VARCHAR(20) NOT NULL UNIQUE,

  -- Type & Pattern
  activity_type VARCHAR(50) NOT NULL,
  activity_pattern_id UUID REFERENCES activity_patterns(id),
  is_auto_created BOOLEAN DEFAULT false,

  -- Subject & Description
  subject VARCHAR(500) NOT NULL,
  description TEXT,

  -- Related Entity (Polymorphic)
  related_entity_type VARCHAR(50) NOT NULL,
  related_entity_id UUID NOT NULL,
  secondary_entity_type VARCHAR(50),
  secondary_entity_id UUID,

  -- Assignment
  assigned_to UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Status & Priority
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',

  -- Timing
  due_date TIMESTAMPTZ,
  due_time TIME,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Outcome
  outcome VARCHAR(50),
  outcome_notes TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_activity_id UUID REFERENCES activities(id),

  -- Metadata
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (immutable log)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  event_id VARCHAR(30) NOT NULL UNIQUE,

  -- Event Classification
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_severity VARCHAR(20) NOT NULL DEFAULT 'info',

  -- Actor
  actor_type VARCHAR(20) NOT NULL,
  actor_id UUID,
  actor_name VARCHAR(200),

  -- Entity
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(200),

  -- Data
  event_data JSONB NOT NULL DEFAULT '{}',
  changes JSONB,
  related_entities JSONB,

  -- Context
  source VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,

  -- Correlation
  correlation_id UUID,
  parent_event_id UUID REFERENCES events(id),
  triggered_activity_ids UUID[],

  -- Timestamps (immutable)
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Patterns table
CREATE TABLE activity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pattern_code VARCHAR(100) NOT NULL UNIQUE,

  -- Display
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Trigger
  trigger_event VARCHAR(100) NOT NULL,
  trigger_conditions JSONB DEFAULT '[]',

  -- Activity Template
  activity_type VARCHAR(50) NOT NULL,
  subject_template VARCHAR(500) NOT NULL,
  description_template TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',

  -- Assignment
  assign_to JSONB NOT NULL,

  -- Timing
  due_offset_hours INTEGER,
  due_offset_business_days INTEGER,
  specific_time TIME,

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  can_be_skipped BOOLEAN DEFAULT false,
  requires_outcome BOOLEAN DEFAULT true,

  -- SLA
  sla_warning_hours INTEGER,
  sla_breach_hours INTEGER,

  -- Metadata
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_related_entity ON activities(related_entity_type, related_entity_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
```

---

## 16. Integration with Role Workflows

### 16.1 Every Workflow Must Include

1. **Events Logged** section listing all events emitted
2. **Activities Created** section listing manual activities
3. **Auto-Activities** section referencing patterns
4. **Activity Timeline** visualization

### 16.2 Example Workflow Integration

See: `01-recruiter/03-source-candidates.md` - Example of activity integration

```markdown
## Events Logged

| Event | Trigger | Data |
|-------|---------|------|
| `candidate.created` | Save new candidate | candidate_id, source |
| `candidate.status_changed` | Status update | old_status, new_status |
| `candidate.contacted` | First contact logged | contact_method |

## Activities Created

| Activity | Type | When | Required |
|----------|------|------|----------|
| Introduction call | Call | After candidate created | Yes |
| Send job details | Email | After interest confirmed | No |
| Log sourcing notes | Note | During sourcing | No |

## Auto-Activities (via Patterns)

| Pattern | Trigger | Created Activity |
|---------|---------|-----------------|
| CAND_NEW_INTRO_CALL | candidate.created | Call: Introduction call |
| CAND_STALE_FOLLOWUP | candidate.stale | Call: Re-engage candidate |
```

---

## Appendix A: Activity Pattern Library

Complete library of all standard activity patterns is maintained in:
`/docs/specs/20-USER-ROLES/ACTIVITY-PATTERN-LIBRARY.md`

## Appendix B: Event Type Catalog

Complete catalog of all event types is maintained in:
`/docs/specs/20-USER-ROLES/EVENT-TYPE-CATALOG.md`

---

**End of Activities & Events Framework**

*This document defines the foundational architecture for activity-centric operations in InTime v3. Every workflow, screen, and action should integrate with this framework.*
