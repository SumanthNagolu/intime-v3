# InTime v3 Database Architecture

Guidewire-inspired database architecture for enterprise staffing operations.

---

## Architecture Overview

Following [Guidewire's proven data model patterns](https://cloudfoundation.com/blog/guidewire-policy-center-training-tutorial-on-data-model-entities/), InTime's database is organized into three layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER (Shared)                          │
│  Organizations, Users, Groups, Roles, Permissions, Activities, Notes    │
│  Documents, Notifications, Audit Logs, System Config                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   CRM MODULE      │   │   ATS MODULE      │   │  BENCH MODULE     │
│                   │   │                   │   │                   │
│ ROOT ENTITIES:    │   │ ROOT ENTITIES:    │   │ ROOT ENTITIES:    │
│ • Account         │   │ • Job Order       │   │ • Hotlist         │
│ • Lead            │   │ • Candidate       │   │ • Marketing       │
│ • Deal            │   │ • Submission      │   │   Campaign        │
│                   │   │ • Placement       │   │                   │
│ SUPPORTING:       │   │                   │   │ SUPPORTING:       │
│ • Contact (POC)   │   │ SUPPORTING:       │   │ • Vendor Contact  │
│ • Activity        │   │ • Interview       │   │ • Submission      │
│                   │   │ • Offer           │   │                   │
└───────────────────┘   │ • Timesheet       │   └───────────────────┘
                        │ • Invoice         │
                        └───────────────────┘
```

---

## Entity Classification

### Root Entities (Core Business Objects)

Root entities are the primary business objects that:
- Have their own lifecycle (Open → In Progress → Closed)
- Own a **Workplan** (set of activities to track progress)
- Can be independently queried and reported on
- Have unique identifiers visible to users

| Module | Root Entity | Description | Workplan |
|--------|-------------|-------------|----------|
| CRM | **Account** | Client company | Account Onboarding |
| CRM | **Lead** | Sales prospect | Lead Qualification |
| CRM | **Deal** | Sales opportunity | Deal Pipeline |
| ATS | **Job Order** | Open position to fill | Job Fulfillment |
| ATS | **Candidate** | Talent profile | Candidate Lifecycle |
| ATS | **Submission** | Candidate→Job match | Submission Process |
| ATS | **Placement** | Confirmed hire | Placement Onboarding |
| Bench | **Hotlist** | Active bench talent | Marketing Process |
| Academy | **Enrollment** | Student in course | Learning Path |

### Supporting Entities (Dependent Objects)

Supporting entities:
- Depend on root entities (can't exist independently)
- Don't have their own workplan
- Support the processing of root entities

| Entity | Depends On | Purpose |
|--------|------------|---------|
| **Contact (POC)** | Account | Client contact person |
| **Interview** | Submission | Interview scheduled for submission |
| **Offer** | Submission | Offer extended for submission |
| **Timesheet** | Placement | Weekly hours for placement |
| **Invoice** | Placement | Billing for placement |
| **Resume** | Candidate | Candidate resume document |
| **Certificate** | Candidate | Professional certification |

### Platform Entities (Shared Infrastructure)

Platform entities are shared across all modules:

| Entity | Purpose |
|--------|---------|
| **Organization** | Multi-tenant container |
| **User Profile** | System user |
| **Group** | Team/department |
| **Role** | Permission role |
| **Activity** | Work item/task |
| **Activity Pattern** | Activity template |
| **Workplan** | Set of activities for process |
| **Note** | Freeform note on any entity |
| **Document** | File attachment |
| **Notification** | System notification |
| **Audit Log** | Change tracking |

---

## Workplan & Activity Pattern

Following [Guidewire's activity pattern](https://docs.guidewire.com/cloud/cc/202111/cloudapibf/cloudAPI/topics/S06_BusinessFramework/01_activities/c_creating-activities.html), we implement process tracking through workplans.

### Concept

```
WORKPLAN (Template)                    WORKPLAN INSTANCE (Runtime)
┌─────────────────────────┐           ┌─────────────────────────────────┐
│ Job Fulfillment         │           │ Job #1234 - Senior Developer    │
│                         │           │                                 │
│ Activity Patterns:      │  ──────▶  │ Activities:                     │
│ 1. Review Requirements  │           │ ✓ Review Requirements (Done)    │
│ 2. Source Candidates    │           │ ● Source Candidates (In Prog)   │
│ 3. Screen Candidates    │           │ ○ Screen Candidates (Pending)   │
│ 4. Submit to Client     │           │ ○ Submit to Client (Pending)    │
│ 5. Schedule Interviews  │           │ ○ Schedule Interviews (Pending) │
│ 6. Collect Feedback     │           │                                 │
│ 7. Extend Offer         │           │                                 │
│ 8. Close Position       │           │                                 │
└─────────────────────────┘           └─────────────────────────────────┘
```

### Activity Pattern Fields

```typescript
interface ActivityPattern {
  id: string;
  code: string;                    // Unique code: 'review_job_requirements'
  name: string;                    // Display: 'Review Job Requirements'
  description: string;

  // Timing
  targetDays: number;              // Due in X days from trigger
  escalationDays: number;          // Escalate after X days overdue

  // Assignment
  defaultAssignee: 'owner' | 'group' | 'specific_user';
  assigneeGroupCode?: string;      // If group assignment
  assigneeUserId?: string;         // If specific user

  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Automation
  autoComplete: boolean;           // Can system auto-complete?
  autoCompleteCondition?: string;  // Condition for auto-complete

  // Successors (activities triggered on completion)
  successors: {
    patternCode: string;
    condition?: string;            // Optional condition
    delayDays?: number;            // Days to wait before creating
  }[];

  // Predecessors required
  predecessorRequired: boolean;    // Must predecessor complete first?

  // Category
  category: string;                // 'sourcing', 'screening', 'closing'

  // Entity type this applies to
  entityType: string;              // 'job', 'submission', 'lead'
}
```

### Workplan Template Fields

```typescript
interface WorkplanTemplate {
  id: string;
  code: string;                    // 'job_fulfillment'
  name: string;                    // 'Job Fulfillment Process'
  description: string;

  // What entity type uses this workplan
  entityType: string;              // 'job', 'submission', 'lead'

  // When to auto-create this workplan
  triggerCondition?: {
    event: 'create' | 'status_change' | 'manual';
    statusValue?: string;          // If status_change, which status
  };

  // Activity patterns in this workplan (ordered)
  activities: {
    patternCode: string;
    order: number;
    required: boolean;             // Must complete to close entity?
    skipCondition?: string;        // Condition to skip this activity
  }[];

  // Completion
  completionCriteria: 'all_required' | 'any_path' | 'manual';
}
```

### Activity Instance Fields

```typescript
interface Activity {
  id: string;
  orgId: string;

  // Link to template
  patternCode: string;
  workplanInstanceId?: string;

  // Link to entity (polymorphic)
  entityType: string;              // 'job', 'submission', 'lead'
  entityId: string;

  // Activity details (copied from pattern, can override)
  subject: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Assignment
  assignedTo: string;              // User ID
  assignedGroup?: string;          // Group ID

  // Dates
  dueDate: Date;
  escalationDate?: Date;
  completedAt?: Date;

  // Status
  status: 'open' | 'in_progress' | 'completed' | 'skipped' | 'canceled';

  // Outcome (when completed)
  outcome?: string;
  outcomeNotes?: string;

  // Automation
  autoCompleted: boolean;          // Was this auto-completed?

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}
```

---

## Entity Lifecycle Pattern

Every root entity follows a standard lifecycle:

```
                    ┌──────────────────────────────────────────────┐
                    │           ENTITY LIFECYCLE                    │
                    │                                              │
  CREATE ──────────▶│  NEW ──▶ ACTIVE ──▶ IN_PROGRESS ──▶ CLOSED  │
                    │   │         │              │            │    │
                    │   │         ▼              ▼            ▼    │
                    │   │      QUALIFIED     PENDING      COMPLETED│
                    │   │                    ON_HOLD      CANCELED │
                    │   │                                  LOST    │
                    │   │                                          │
                    │   └──────────────────────────────────────────│
                    │                                              │
                    │  Workplan tracks activities through lifecycle│
                    └──────────────────────────────────────────────┘
```

### Status Transitions Trigger Activities

```typescript
// Example: Lead status change triggers activities
const leadStatusTriggers = {
  'new': ['qualify_lead'],                    // Auto-create qualify activity
  'contacted': ['schedule_discovery'],        // After first contact
  'qualified': ['create_proposal'],           // Ready for proposal
  'proposal': ['follow_up_proposal'],         // Proposal sent
  'negotiation': ['negotiate_terms'],         // In negotiation
  'converted': ['setup_account'],             // Won - create account
  'lost': ['record_loss_reason'],             // Lost - document why
};
```

---

## Entity Relationships Diagram

### CRM Module

```
                         ┌─────────────────┐
                         │  ORGANIZATION   │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌──────────┐        ┌──────────┐        ┌──────────┐
       │  LEAD    │───────▶│ ACCOUNT  │◀───────│  DEAL    │
       └──────────┘        └──────────┘        └──────────┘
              │                   │                   │
              │                   │                   │
              ▼                   ▼                   ▼
       ┌──────────┐        ┌──────────┐        ┌──────────┐
       │ACTIVITIES│        │ CONTACTS │        │ACTIVITIES│
       └──────────┘        │  (POC)   │        └──────────┘
                           └──────────┘
                                  │
                                  ▼
                           ┌──────────┐
                           │ACTIVITIES│
                           └──────────┘
```

### ATS Module

```
                         ┌─────────────────┐
                         │    ACCOUNT      │ (Client)
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
       ┌────────────────▶│   JOB ORDER     │◀────────────────┐
       │                 └────────┬────────┘                 │
       │                          │                          │
       │                          ▼                          │
       │                 ┌─────────────────┐                 │
       │                 │   SUBMISSION    │                 │
       │                 └────────┬────────┘                 │
       │                          │                          │
       │        ┌─────────────────┼─────────────────┐        │
       │        │                 │                 │        │
       │        ▼                 ▼                 ▼        │
       │  ┌───────────┐    ┌───────────┐    ┌───────────┐   │
       │  │ INTERVIEW │    │   OFFER   │    │ PLACEMENT │   │
       │  └───────────┘    └───────────┘    └─────┬─────┘   │
       │                                          │          │
       │                          ┌───────────────┼──────────┤
       │                          │               │          │
       │                          ▼               ▼          │
       │                   ┌───────────┐   ┌───────────┐     │
       │                   │ TIMESHEET │   │  INVOICE  │     │
       │                   └───────────┘   └───────────┘     │
       │                                                     │
       │                 ┌─────────────────┐                 │
       └─────────────────│   CANDIDATE     │─────────────────┘
                         └─────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │  RESUME  │  │  SKILLS  │  │EXPERIENCE│
             └──────────┘  └──────────┘  └──────────┘
```

---

## Workplan Examples

### 1. Job Fulfillment Workplan

```yaml
workplan:
  code: job_fulfillment
  name: Job Fulfillment Process
  entityType: job
  trigger:
    event: create

  activities:
    - pattern: review_requirements
      order: 1
      required: true
      targetDays: 1
      successors:
        - source_candidates

    - pattern: source_candidates
      order: 2
      required: true
      targetDays: 5
      successors:
        - screen_candidates

    - pattern: screen_candidates
      order: 3
      required: true
      targetDays: 3
      successors:
        - submit_to_client

    - pattern: submit_to_client
      order: 4
      required: true
      targetDays: 1
      # Branches based on outcome
      successors:
        - pattern: schedule_interview
          condition: "submission.status == 'client_review'"
        - pattern: source_more_candidates
          condition: "submission.status == 'rejected'"

    - pattern: schedule_interview
      order: 5
      required: false
      targetDays: 2
      successors:
        - collect_feedback

    - pattern: collect_feedback
      order: 6
      required: false
      targetDays: 1
      successors:
        - pattern: extend_offer
          condition: "interview.outcome == 'pass'"
        - pattern: submit_more_candidates
          condition: "interview.outcome == 'fail'"

    - pattern: extend_offer
      order: 7
      required: false
      targetDays: 2
      successors:
        - pattern: close_position
          condition: "offer.status == 'accepted'"
        - pattern: negotiate_offer
          condition: "offer.status == 'countered'"

    - pattern: close_position
      order: 8
      required: true
      targetDays: 1
```

### 2. Lead Qualification Workplan

```yaml
workplan:
  code: lead_qualification
  name: Lead Qualification (BANT)
  entityType: lead
  trigger:
    event: create

  activities:
    - pattern: initial_research
      order: 1
      required: true
      targetDays: 1
      successors:
        - initial_outreach

    - pattern: initial_outreach
      order: 2
      required: true
      targetDays: 2
      successors:
        - pattern: discovery_call
          condition: "lead.status == 'contacted'"
        - pattern: follow_up_outreach
          condition: "lead.status == 'new'"

    - pattern: discovery_call
      order: 3
      required: true
      targetDays: 5
      successors:
        - assess_bant

    - pattern: assess_bant
      order: 4
      required: true
      targetDays: 1
      successors:
        - pattern: create_proposal
          condition: "lead.bantTotalScore >= 70"
        - pattern: nurture_lead
          condition: "lead.bantTotalScore < 70"

    - pattern: create_proposal
      order: 5
      required: false
      targetDays: 3
      successors:
        - present_proposal

    - pattern: present_proposal
      order: 6
      required: false
      targetDays: 5
      successors:
        - pattern: negotiate_deal
          condition: "lead.status == 'negotiation'"
        - pattern: handle_objections
          condition: "lead.status == 'proposal'"

    - pattern: convert_to_deal
      order: 7
      required: false
      targetDays: 1
```

### 3. Submission Processing Workplan

```yaml
workplan:
  code: submission_processing
  name: Submission to Placement
  entityType: submission
  trigger:
    event: create

  activities:
    - pattern: prepare_submission
      order: 1
      required: true
      targetDays: 1
      successors:
        - send_to_client

    - pattern: send_to_client
      order: 2
      required: true
      targetDays: 1
      successors:
        - await_client_response

    - pattern: await_client_response
      order: 3
      required: true
      targetDays: 3
      escalationDays: 2
      successors:
        - pattern: schedule_interview
          condition: "submission.clientDecision == 'interview'"
        - pattern: handle_rejection
          condition: "submission.clientDecision == 'reject'"

    - pattern: schedule_interview
      order: 4
      required: false
      targetDays: 2
      # Creates Interview entity
      autoAction: create_interview
      successors:
        - prepare_candidate

    - pattern: prepare_candidate
      order: 5
      required: false
      targetDays: 1
      successors:
        - conduct_interview

    - pattern: conduct_interview
      order: 6
      required: false
      targetDays: 1
      successors:
        - collect_interview_feedback

    - pattern: collect_interview_feedback
      order: 7
      required: false
      targetDays: 1
      successors:
        - pattern: extend_offer
          condition: "interview.outcome == 'hire'"
        - pattern: schedule_next_round
          condition: "interview.outcome == 'next_round'"
        - pattern: close_submission
          condition: "interview.outcome == 'reject'"

    - pattern: extend_offer
      order: 8
      required: false
      targetDays: 2
      # Creates Offer entity
      autoAction: create_offer
      successors:
        - negotiate_offer

    - pattern: negotiate_offer
      order: 9
      required: false
      targetDays: 5
      successors:
        - pattern: create_placement
          condition: "offer.status == 'accepted'"
        - pattern: close_submission
          condition: "offer.status == 'declined'"

    - pattern: create_placement
      order: 10
      required: false
      targetDays: 1
      # Creates Placement entity
      autoAction: create_placement
```

---

## Database Tables

### Platform Layer Tables

```sql
-- Activity Patterns (Templates)
CREATE TABLE activity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),

  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  -- Timing
  target_days INTEGER DEFAULT 1,
  escalation_days INTEGER,

  -- Assignment
  default_assignee TEXT DEFAULT 'owner', -- 'owner', 'group', 'user'
  assignee_group_id UUID REFERENCES groups(id),
  assignee_user_id UUID REFERENCES user_profiles(id),

  -- Priority
  priority TEXT DEFAULT 'normal',

  -- Automation
  auto_complete BOOLEAN DEFAULT FALSE,
  auto_complete_condition JSONB,
  auto_action TEXT, -- 'create_interview', 'create_offer', etc.

  -- Category
  category TEXT,
  entity_type TEXT NOT NULL,

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE, -- System-defined vs custom
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Pattern Successors
CREATE TABLE activity_pattern_successors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES activity_patterns(id) ON DELETE CASCADE,
  successor_pattern_id UUID REFERENCES activity_patterns(id),

  condition JSONB, -- Condition expression
  delay_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workplan Templates
CREATE TABLE workplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),

  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  entity_type TEXT NOT NULL,

  -- Trigger
  trigger_event TEXT DEFAULT 'manual', -- 'create', 'status_change', 'manual'
  trigger_status TEXT, -- If status_change, which status

  -- Completion
  completion_criteria TEXT DEFAULT 'all_required',

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workplan Template Activities
CREATE TABLE workplan_template_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workplan_templates(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES activity_patterns(id),

  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  skip_condition JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workplan Instances (Runtime)
CREATE TABLE workplan_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  template_id UUID REFERENCES workplan_templates(id),

  -- Link to entity
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'canceled'

  -- Progress
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_activities > 0
    THEN (completed_activities * 100 / total_activities)
    ELSE 0 END
  ) STORED,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (Runtime Instances)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),

  -- Link to pattern/workplan
  pattern_code TEXT,
  workplan_instance_id UUID REFERENCES workplan_instances(id),

  -- Link to entity (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Activity details
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal',
  category TEXT,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_group UUID REFERENCES groups(id),

  -- Dates
  due_date TIMESTAMPTZ,
  escalation_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'skipped', 'canceled'

  -- Outcome
  outcome TEXT,
  outcome_notes TEXT,

  -- Automation
  auto_completed BOOLEAN DEFAULT FALSE,

  -- Predecessor tracking
  predecessor_activity_id UUID REFERENCES activities(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT idx_activities_entity UNIQUE (org_id, entity_type, entity_id, pattern_code, status)
);

CREATE INDEX idx_activities_org_status ON activities(org_id, status);
CREATE INDEX idx_activities_assigned ON activities(assigned_to, status);
CREATE INDEX idx_activities_due ON activities(due_date) WHERE status = 'open';
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
```

---

## Activity Automation Engine

### Trigger Points

```typescript
// Activity triggers throughout the system
const activityTriggers = {
  // On entity creation
  'entity.created': async (entityType, entityId, entity) => {
    const workplan = await findWorkplanTemplate(entityType, 'create');
    if (workplan) {
      await createWorkplanInstance(workplan, entityType, entityId);
    }
  },

  // On status change
  'entity.statusChanged': async (entityType, entityId, oldStatus, newStatus) => {
    // Check for status-triggered workplans
    const workplan = await findWorkplanTemplate(entityType, 'status_change', newStatus);
    if (workplan) {
      await createWorkplanInstance(workplan, entityType, entityId);
    }

    // Check for auto-complete conditions
    await checkAutoCompleteConditions(entityType, entityId);
  },

  // On activity completion
  'activity.completed': async (activity) => {
    // Create successor activities
    await createSuccessorActivities(activity);

    // Update workplan progress
    if (activity.workplanInstanceId) {
      await updateWorkplanProgress(activity.workplanInstanceId);
    }

    // Check if workplan is complete
    await checkWorkplanCompletion(activity.workplanInstanceId);
  },
};
```

### Successor Activity Creation

```typescript
async function createSuccessorActivities(completedActivity: Activity) {
  // Get pattern successors
  const successors = await db.query.activityPatternSuccessors.findMany({
    where: eq(activityPatternSuccessors.patternId, completedActivity.patternId),
    with: { successorPattern: true },
  });

  for (const successor of successors) {
    // Evaluate condition
    if (successor.condition) {
      const conditionMet = await evaluateCondition(
        successor.condition,
        completedActivity.entityType,
        completedActivity.entityId
      );
      if (!conditionMet) continue;
    }

    // Calculate due date
    const dueDate = addDays(
      new Date(),
      successor.delayDays + successor.successorPattern.targetDays
    );

    // Create successor activity
    await createActivity({
      orgId: completedActivity.orgId,
      patternCode: successor.successorPattern.code,
      workplanInstanceId: completedActivity.workplanInstanceId,
      entityType: completedActivity.entityType,
      entityId: completedActivity.entityId,
      subject: successor.successorPattern.name,
      description: successor.successorPattern.description,
      priority: successor.successorPattern.priority,
      dueDate,
      predecessorActivityId: completedActivity.id,
    });
  }
}
```

---

## Summary: Entity Hierarchy

```
PLATFORM LAYER (Shared)
├── organizations
├── user_profiles
├── groups
├── roles
├── permissions
├── activity_patterns      ◄── Templates
├── workplan_templates     ◄── Process definitions
├── workplan_instances     ◄── Runtime tracking
├── activities             ◄── Work items
├── notes
├── documents
├── notifications
└── audit_logs

CRM MODULE
├── accounts              ◄── ROOT (has workplan)
├── leads                 ◄── ROOT (has workplan)
├── deals                 ◄── ROOT (has workplan)
└── point_of_contacts     ◄── Supporting

ATS MODULE
├── job_orders            ◄── ROOT (has workplan)
├── candidates            ◄── ROOT (has workplan)
├── submissions           ◄── ROOT (has workplan)
├── placements            ◄── ROOT (has workplan)
├── interviews            ◄── Supporting
├── offers                ◄── Supporting
├── timesheets            ◄── Supporting
└── invoices              ◄── Supporting

BENCH MODULE
├── hotlists              ◄── ROOT (has workplan)
├── marketing_campaigns   ◄── ROOT (has workplan)
└── vendor_submissions    ◄── Supporting

ACADEMY MODULE
├── courses               ◄── ROOT
├── enrollments           ◄── ROOT (has workplan)
├── certificates          ◄── Supporting
└── assessments           ◄── Supporting
```

---

## Sources

- [Guidewire Policy Center Data Model & Entities](https://cloudfoundation.com/blog/guidewire-policy-center-training-tutorial-on-data-model-entities/)
- [How Guidewire Claim Center Works](https://cloudfoundation.com/blog/how-does-guidewire-claim-center-work/)
- [Guidewire Activity Patterns](https://docs.guidewire.com/cloud/cc/202111/cloudapibf/cloudAPI/topics/S06_BusinessFramework/01_activities/c_creating-activities.html)
- [Guidewire Exposures Overview](https://docs.guidewire.com/cloud/cc/202407/cloudapibf/cloudAPI/topics/111-CCFNOL/05-exposures/c_overview-of-exposures-in-ClaimCenter.html)
- [Guidewire Autopilot Workflow Service](https://www.guidewire.com/developers/developer-tools-and-guides/autopilot-workflow-service)
