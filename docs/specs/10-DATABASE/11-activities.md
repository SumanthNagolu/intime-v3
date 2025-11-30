# Activities Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activities` |
| Schema | `public` |
| Purpose | Unified tracking of ALL work (past activities + future tasks) |
| Replaces | `activity_log` (historical) + `lead_tasks` (future) |
| Primary Owner | User assigned to activity |
| RLS Enabled | Yes |
| Soft Delete | No (use `cancelled` status) |

**Key Concept:** This is a **UNIFIED** table that tracks both:
- **Past Activities**: Completed communications (emails, calls, meetings, notes)
- **Future Tasks**: Scheduled work items (tasks, follow-ups, reminders)

---

## Table Definition

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic Association (link to any entity)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Activity Type & Status
  activity_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',

  -- Content
  subject TEXT,
  body TEXT,
  direction TEXT,

  -- Timing (REQUIRED: every activity must have due_date)
  scheduled_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  escalation_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Outcome (for completed activities)
  outcome TEXT,

  -- Assignment (REQUIRED: every activity must have owner)
  assigned_to UUID NOT NULL REFERENCES user_profiles(id),
  performed_by UUID REFERENCES user_profiles(id),
  poc_id UUID REFERENCES point_of_contacts(id),

  -- Follow-up Chain (self-referential)
  parent_activity_id UUID,

  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);
```

---

## Field Specifications

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the activity |
| UI Display | Hidden (used in URLs, references) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this activity belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |
| Index | Yes (`idx_activities_org_id`) |

---

### entity_type
| Property | Value |
|----------|-------|
| Column Name | `entity_type` |
| Type | `TEXT` |
| Required | Yes |
| Allowed Values | `lead`, `deal`, `account`, `candidate`, `submission`, `job`, `poc` |
| Description | Type of entity this activity is associated with |
| UI Label | "Related To" |
| UI Type | Hidden/Auto-detected |
| Polymorphic | Yes (paired with entity_id) |
| Index | Yes (composite with entity_id) |

**Enum Values:**
| Value | Display Label | Entity Table | Description |
|-------|---------------|--------------|-------------|
| `lead` | Lead | `leads` | Activity on a sales lead |
| `deal` | Deal | `deals` | Activity on an opportunity |
| `account` | Account | `accounts` | Activity on client account |
| `candidate` | Candidate | `candidates` | Activity on talent profile |
| `submission` | Submission | `submissions` | Activity on job submission |
| `job` | Job Order | `jobs` | Activity on job requisition |
| `poc` | Contact | `point_of_contacts` | Activity on point of contact |

---

### entity_id
| Property | Value |
|----------|-------|
| Column Name | `entity_id` |
| Type | `UUID` |
| Required | Yes |
| Description | ID of the entity this activity is associated with |
| UI Display | Hidden (used for lookups) |
| Validation | Must exist in corresponding entity_type table |
| Index | Yes (composite with entity_type) |
| Polymorphic | Yes (paired with entity_type) |

**Usage Pattern:**
```typescript
// Example: Activity on a Lead
{
  entity_type: 'lead',
  entity_id: '123e4567-e89b-12d3-a456-426614174000'
}

// Query pattern (TypeScript)
const leadActivities = await db.query.activities.findMany({
  where: and(
    eq(activities.entityType, 'lead'),
    eq(activities.entityId, leadId)
  )
});
```

---

### activity_type
| Property | Value |
|----------|-------|
| Column Name | `activity_type` |
| Type | `TEXT` |
| Required | Yes |
| Allowed Values | `email`, `call`, `meeting`, `note`, `linkedin_message`, `task`, `follow_up`, `reminder` |
| Description | Type of activity/task |
| UI Label | "Type" |
| UI Type | Dropdown / Icon Selector |
| Default | `task` (for manually created items) |

**Enum Values with Icons:**
| Value | Display Label | Icon | Color | Use Case |
|-------|---------------|------|-------|----------|
| `email` | Email | 📧 | Blue | Email communication |
| `call` | Call | 📞 | Green | Phone call (inbound/outbound) |
| `meeting` | Meeting | 🗓️ | Purple | In-person or virtual meeting |
| `note` | Note | 📝 | Gray | Internal note/memo |
| `linkedin_message` | LinkedIn | 💼 | LinkedIn Blue | LinkedIn InMail/message |
| `task` | Task | ✓ | Orange | Generic to-do item |
| `follow_up` | Follow-up | 🔄 | Amber | Follow-up action |
| `reminder` | Reminder | 🔔 | Yellow | Reminder/alert |

**TypeScript Constants:**
```typescript
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
  linkedin_message: 'LinkedIn',
  task: 'Task',
  follow_up: 'Follow-up',
  reminder: 'Reminder',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  email: '📧',
  call: '📞',
  meeting: '🗓️',
  note: '📝',
  linkedin_message: '💼',
  task: '✓',
  follow_up: '🔄',
  reminder: '🔔',
};
```

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'open'` |
| Allowed Values | `scheduled`, `open`, `in_progress`, `completed`, `skipped`, `cancelled` |
| Description | Current activity status (lifecycle state) |
| UI Label | "Status" |
| UI Type | Status Badge / Dropdown |
| Index | Yes (`idx_activities_status`) |

**Enum Values:**
| Value | Display Label | Color | Description | Next States |
|-------|---------------|-------|-------------|-------------|
| `scheduled` | Scheduled | Blue | Future activity, not yet due | `open`, `cancelled` |
| `open` | Open | Amber | Due/actionable now | `in_progress`, `completed`, `skipped`, `cancelled` |
| `in_progress` | In Progress | Purple | Currently being worked on | `completed`, `open` |
| `completed` | Completed | Green | Done successfully | - (terminal) |
| `skipped` | Skipped | Gray | Intentionally skipped | - (terminal) |
| `cancelled` | Cancelled | Red | No longer needed | - (terminal) |

**Status Lifecycle Diagram:**
```
┌─────────────┐
│  scheduled  │  (future activity)
└──────┬──────┘
       │ auto-transition when due_date passes
       ↓
┌─────────────┐
│    open     │  (actionable now)
└──────┬──────┘
       │ user starts work
       ↓
┌─────────────┐
│ in_progress │  (actively working)
└──────┬──────┘
       │
       ├──→ completed (success)
       ├──→ skipped (intentional skip)
       └──→ cancelled (no longer needed)

Terminal states: completed, skipped, cancelled
```

**Business Rules:**
- Activities auto-transition from `scheduled` → `open` when `due_date` passes
- Only `open` and `in_progress` appear in "My Tasks" list
- `scheduled` activities appear in calendar/timeline view
- `completed` activities become part of activity history
- `skipped` activities require reason in `body` field
- `cancelled` activities are hidden from default views

**TypeScript Constants:**
```typescript
export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  scheduled: 'Scheduled',
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
};

export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-red-100 text-red-700',
};
```

---

### priority
| Property | Value |
|----------|-------|
| Column Name | `priority` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'medium'` |
| Allowed Values | `low`, `medium`, `high`, `urgent` |
| Description | Activity priority level |
| UI Label | "Priority" |
| UI Type | Dropdown / Priority Indicator |

**Enum Values:**
| Value | Display Label | Color | Auto-Escalation | Description |
|-------|---------------|-------|-----------------|-------------|
| `low` | Low | Gray | +7 days | Nice to have, no rush |
| `medium` | Medium | Blue | +3 days | Standard priority |
| `high` | High | Amber | +1 day | Important, timely action needed |
| `urgent` | Urgent | Red | Same day | Critical, immediate attention |

**Priority Escalation Rules:**
- Activities automatically escalate if not completed by `escalation_date`
- `escalation_date` = `due_date` + auto-escalation buffer (see table above)
- When escalated, priority increases one level (e.g., `medium` → `high`)
- `urgent` priority does not escalate further (already max)
- Escalation triggers notification to assignee + manager

**TypeScript Constants:**
```typescript
export const ACTIVITY_PRIORITY_LABELS: Record<ActivityPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const ACTIVITY_PRIORITY_COLORS: Record<ActivityPriority, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};
```

---

### subject
| Property | Value |
|----------|-------|
| Column Name | `subject` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 200 characters |
| Description | Activity subject/title (like email subject) |
| UI Label | "Subject" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Follow up on resume submission" |
| Searchable | Yes |

**Usage Patterns:**
- **Email**: Email subject line
- **Call**: "Screening call with John Doe"
- **Meeting**: "Client discovery meeting"
- **Task**: "Send revised proposal to client"
- **Note**: Brief note summary
- **Follow-up**: "Follow up on interview feedback"

---

### body
| Property | Value |
|----------|-------|
| Column Name | `body` |
| Type | `TEXT` |
| Required | No |
| Max Length | Unlimited |
| Description | Activity details/description/notes |
| UI Label | "Details" / "Notes" |
| UI Type | Textarea / Rich Text Editor |
| UI Placeholder | "Add details, notes, or context..." |
| Searchable | Yes |

**Usage Patterns:**
- **Email**: Full email body content
- **Call**: Call notes, discussion points
- **Meeting**: Meeting notes, action items
- **Task**: Task description, instructions
- **Note**: Full note content
- **Skipped**: Reason for skipping (REQUIRED when status = skipped)

---

### direction
| Property | Value |
|----------|-------|
| Column Name | `direction` |
| Type | `TEXT` |
| Required | No (only for email/call/meeting) |
| Allowed Values | `inbound`, `outbound` |
| Description | Communication direction |
| UI Label | "Direction" |
| UI Type | Radio Buttons / Icon |

**Enum Values:**
| Value | Display Label | Icon | Description |
|-------|---------------|------|-------------|
| `inbound` | Inbound | ↓ | Incoming communication |
| `outbound` | Outbound | ↑ | Outgoing communication |

**Usage:**
- **Email**: Was it sent by us (outbound) or received (inbound)?
- **Call**: Did we call them (outbound) or did they call us (inbound)?
- **Meeting**: Not typically used (meetings are bilateral)
- **Task/Note**: Not applicable (internal)

---

### scheduled_at
| Property | Value |
|----------|-------|
| Column Name | `scheduled_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When the activity is scheduled to happen |
| UI Label | "Scheduled For" |
| UI Type | Date/Time Picker |
| Use Case | Future scheduled activities |

**Business Logic:**
- Used for activities with status = `scheduled`
- When `scheduled_at` is in the past, auto-transition to `open`
- For calendar/timeline views, shows when activity will happen
- For immediate activities (status = `open`), leave NULL

**Example:**
```typescript
// Schedule a follow-up call for tomorrow at 2pm
{
  activity_type: 'call',
  status: 'scheduled',
  scheduled_at: '2025-12-01T14:00:00Z',
  due_date: '2025-12-01T14:00:00Z',
  subject: 'Follow-up call with client'
}
```

---

### due_date
| Property | Value |
|----------|-------|
| Column Name | `due_date` |
| Type | `TIMESTAMPTZ` |
| Required | **YES (REQUIRED)** |
| Default | `NOW()` |
| Description | Deadline for activity completion |
| UI Label | "Due Date" |
| UI Type | Date/Time Picker |
| Validation | Cannot be in the past (on create) |
| Index | Yes (`idx_activities_due_date`) |

**CRITICAL BUSINESS RULE:**
> **Every activity MUST have a due date.** This is the cornerstone of the unified model.
>
> - Past activities: `due_date` = when it was supposed to happen (defaults to NOW)
> - Future tasks: `due_date` = deadline for completion
> - This allows unified querying of "what's overdue" regardless of type

**Usage Patterns:**
- **Immediate activity** (email sent, call made): `due_date = NOW()`
- **Scheduled task**: `due_date` = deadline to complete by
- **Follow-up**: `due_date` = date to follow up by

**Overdue Detection:**
```sql
-- Find all overdue activities
SELECT * FROM activities
WHERE status IN ('open', 'in_progress')
  AND due_date < NOW();
```

---

### escalation_date
| Property | Value |
|----------|-------|
| Column Name | `escalation_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When to escalate if not completed |
| UI Label | "Escalate On" |
| UI Type | Date/Time Picker (auto-calculated) |
| Auto-Calculate | `due_date` + priority buffer |
| Index | Yes (`idx_activities_escalation`) |

**Auto-Calculation Logic:**
```typescript
// Based on priority
const escalationBuffers = {
  low: 7,      // days
  medium: 3,
  high: 1,
  urgent: 0    // same day
};

escalation_date = due_date + escalationBuffers[priority] * 1 day;
```

**Escalation Actions:**
When `escalation_date` passes and status is still `open` or `in_progress`:
1. Send notification to assignee
2. Send notification to assignee's manager
3. Increase priority one level (if not already `urgent`)
4. Add "ESCALATED" tag to activity
5. Log escalation event

---

### completed_at
| Property | Value |
|----------|-------|
| Column Name | `completed_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Timestamp when activity was completed |
| UI Label | "Completed On" |
| UI Display | Display only (auto-set) |
| Auto-Set | When status changes to `completed` |

**Business Logic:**
- Automatically set when status → `completed`
- Used to calculate metrics (time to complete, overdue duration)
- Cannot be manually edited (system-controlled)

---

### skipped_at
| Property | Value |
|----------|-------|
| Column Name | `skipped_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Timestamp when activity was skipped |
| UI Label | "Skipped On" |
| UI Display | Display only (auto-set) |
| Auto-Set | When status changes to `skipped` |

**Business Logic:**
- Automatically set when status → `skipped`
- When skipping, `body` field MUST contain reason for skip
- Skipped activities count separately in metrics

---

### duration_minutes
| Property | Value |
|----------|-------|
| Column Name | `duration_minutes` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 1440 (24 hours) |
| Description | Duration of activity (for calls, meetings) |
| UI Label | "Duration" |
| UI Type | Number Input |
| UI Suffix | "minutes" |

**Usage:**
- **Call**: Length of phone call
- **Meeting**: Meeting duration
- **Email**: Not typically used
- **Task**: Time spent on task (optional)

**Metrics Usage:**
```sql
-- Calculate total time spent on calls this week
SELECT SUM(duration_minutes) as total_call_minutes
FROM activities
WHERE activity_type = 'call'
  AND status = 'completed'
  AND completed_at >= NOW() - INTERVAL '7 days';
```

---

### outcome
| Property | Value |
|----------|-------|
| Column Name | `outcome` |
| Type | `TEXT` |
| Required | No (only for completed activities) |
| Allowed Values | `positive`, `neutral`, `negative` |
| Description | Outcome/result of completed activity |
| UI Label | "Outcome" |
| UI Type | Radio Buttons |
| Required When | `status = 'completed'` |

**Enum Values:**
| Value | Display Label | Icon | Color | Description |
|-------|---------------|------|-------|-------------|
| `positive` | Positive | ✅ | Green | Good outcome, progress made |
| `neutral` | Neutral | ➖ | Gray | No clear outcome |
| `negative` | Negative | ❌ | Red | Negative outcome, setback |

**Usage Examples:**
- **Call Outcome:**
  - `positive`: Candidate interested, next steps scheduled
  - `neutral`: Left voicemail, awaiting callback
  - `negative`: Candidate declined, not interested

- **Email Outcome:**
  - `positive`: Received positive response
  - `neutral`: Email delivered, no response yet
  - `negative`: Rejection, not interested

**Metrics Usage:**
```sql
-- Success rate of outreach activities
SELECT
  outcome,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM activities
WHERE activity_type IN ('email', 'call')
  AND status = 'completed'
GROUP BY outcome;
```

---

### assigned_to
| Property | Value |
|----------|-------|
| Column Name | `assigned_to` |
| Type | `UUID` |
| Required | **YES (REQUIRED)** |
| Foreign Key | `user_profiles(id)` |
| Description | User responsible for this activity |
| UI Label | "Assigned To" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_activities_assigned_to`) |

**CRITICAL BUSINESS RULE:**
> **Every activity MUST have an owner.** No orphaned activities allowed.

**Usage:**
- Determines who sees this in "My Tasks"
- Used for workload balancing
- Cannot be NULL (database constraint)
- Can be reassigned to different user

**Query Pattern:**
```sql
-- Get my tasks
SELECT * FROM activities
WHERE assigned_to = current_user_id
  AND status IN ('open', 'in_progress')
ORDER BY due_date ASC;
```

---

### performed_by
| Property | Value |
|----------|-------|
| Column Name | `performed_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who actually performed the activity |
| UI Label | "Performed By" |
| UI Display | Display only (auto-set on completion) |
| Auto-Set | Set to current user when status → `completed` |

**Usage:**
- May differ from `assigned_to` (delegation scenarios)
- Used for individual performance metrics
- Automatically set when completing activity

**Example Scenario:**
```typescript
// Manager assigns task to recruiter
{
  assigned_to: recruiter_id,  // Recruiter is responsible
  performed_by: null           // Not yet performed
}

// Recruiter completes task
// System auto-sets:
{
  assigned_to: recruiter_id,
  performed_by: recruiter_id,  // Recruiter did the work
  completed_at: NOW()
}

// Delegation scenario: Manager completes it instead
{
  assigned_to: recruiter_id,   // Still recruiter's responsibility
  performed_by: manager_id,     // But manager did the work
  completed_at: NOW()
}
```

---

### poc_id
| Property | Value |
|----------|-------|
| Column Name | `poc_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `point_of_contacts(id)` |
| Description | External point of contact involved in activity |
| UI Label | "Contact" |
| UI Type | Contact Picker |
| UI Display | Shown for email/call/meeting types |

**Usage:**
- **Email**: Who was the email sent to/from?
- **Call**: Who was on the call?
- **Meeting**: Primary external participant
- **Task**: Related contact (if applicable)

**Example:**
```typescript
// Email activity
{
  activity_type: 'email',
  subject: 'Follow up on job submission',
  poc_id: client_hiring_manager_id,  // Email sent to this contact
  direction: 'outbound'
}
```

---

### parent_activity_id
| Property | Value |
|----------|-------|
| Column Name | `parent_activity_id` |
| Type | `UUID` |
| Required | No |
| Self-Reference | `activities(id)` |
| Description | Links this activity to parent activity (follow-up chain) |
| UI Label | "In Response To" |
| UI Type | Activity Picker (read-only) |
| Index | Yes (`idx_activities_parent`) |

**Follow-up Chain Concept:**
Activities can be linked together to form a chain of follow-ups:

```
Initial Email (activity_id: A)
  └─→ Follow-up Email (parent_activity_id: A)
       └─→ Second Follow-up (parent_activity_id: B)
            └─→ Phone Call (parent_activity_id: C)
```

**Usage Patterns:**
1. **Email thread tracking**: Link follow-up emails to original
2. **Task dependencies**: Link follow-up tasks to parent
3. **Outcome tracking**: See entire communication thread

**Query Examples:**

```sql
-- Get all follow-ups for an activity
SELECT * FROM activities
WHERE parent_activity_id = 'parent-activity-id'
ORDER BY created_at ASC;

-- Get entire follow-up chain
WITH RECURSIVE activity_chain AS (
  -- Start with root activity
  SELECT * FROM activities WHERE id = 'root-activity-id'
  UNION ALL
  -- Recursively get all children
  SELECT a.* FROM activities a
  INNER JOIN activity_chain ac ON a.parent_activity_id = ac.id
)
SELECT * FROM activity_chain ORDER BY created_at ASC;

-- Get root activity for a follow-up
WITH RECURSIVE activity_chain AS (
  -- Start with current activity
  SELECT * FROM activities WHERE id = 'current-activity-id'
  UNION ALL
  -- Recursively get parent
  SELECT a.* FROM activities a
  INNER JOIN activity_chain ac ON a.id = ac.parent_activity_id
)
SELECT * FROM activity_chain WHERE parent_activity_id IS NULL;
```

**TypeScript Usage:**
```typescript
// Create follow-up activity
const followUp = await db.insert(activities).values({
  activity_type: 'follow_up',
  subject: 'Second follow-up on proposal',
  parent_activity_id: originalActivityId,  // Link to parent
  entity_type: 'lead',
  entity_id: leadId,
  assigned_to: userId,
  due_date: new Date('2025-12-05'),
  status: 'open',
});
```

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp when activity was created |
| UI Display | Display only, formatted |
| Index | Yes (composite indexes for sorting) |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Timestamp of last update |
| UI Display | Display only, formatted |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the activity |
| UI Display | Display only |
| Auto-Set | Set to current user on create |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `activities_pkey` | `id` | BTREE | Primary key |
| `idx_activities_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_activities_entity` | `entity_type, entity_id` | BTREE | Entity lookup (polymorphic) |
| `idx_activities_assigned_to` | `assigned_to, status` | BTREE | My tasks query |
| `idx_activities_status` | `status` | BTREE | Status filtering |
| `idx_activities_due_date` | `due_date` | BTREE | Due date sorting, overdue detection |
| `idx_activities_escalation` | `escalation_date` | BTREE | Escalation job |
| `idx_activities_parent` | `parent_activity_id` | BTREE | Follow-up chain queries |
| `idx_activities_poc` | `poc_id` | BTREE | Contact activity history |
| `idx_activities_type_status` | `activity_type, status` | BTREE | Type-specific queries |

**Performance Optimization:**
```sql
-- Composite index for "My Tasks" query
CREATE INDEX idx_activities_my_tasks
ON activities(assigned_to, status, due_date)
WHERE status IN ('open', 'in_progress');

-- Composite index for entity timeline
CREATE INDEX idx_activities_entity_timeline
ON activities(entity_type, entity_id, created_at DESC);
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "activities_org_isolation" ON activities
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Users can see activities assigned to them
CREATE POLICY "activities_assigned_read" ON activities
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND assigned_to = (auth.jwt() ->> 'user_id')::uuid
  );

-- Users can see activities on entities they have access to
-- (Requires entity-specific RCAI checks - implement per entity type)
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-Transition Scheduled Activities
```sql
-- Trigger to auto-transition scheduled → open when due
CREATE OR REPLACE FUNCTION auto_transition_scheduled_activities()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'scheduled' AND NEW.due_date <= NOW() THEN
    NEW.status = 'open';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_auto_transition
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION auto_transition_scheduled_activities();
```

### Auto-Set Timestamps on Completion
```sql
CREATE OR REPLACE FUNCTION set_activity_completion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    IF NEW.performed_by IS NULL THEN
      NEW.performed_by = NEW.assigned_to;
    END IF;
  END IF;

  -- Set skipped_at when status changes to skipped
  IF NEW.status = 'skipped' AND OLD.status != 'skipped' THEN
    NEW.skipped_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_set_completion
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION set_activity_completion_timestamp();
```

---

## Related Tables

| Table | Relationship | FK Column |
|-------|--------------|-----------|
| organizations | Parent | `org_id` |
| user_profiles | Assignee | `assigned_to` |
| user_profiles | Performer | `performed_by` |
| user_profiles | Creator | `created_by` |
| point_of_contacts | Contact | `poc_id` |
| activities | Parent Activity | `parent_activity_id` |
| leads | Polymorphic | `entity_id` (when entity_type = 'lead') |
| deals | Polymorphic | `entity_id` (when entity_type = 'deal') |
| accounts | Polymorphic | `entity_id` (when entity_type = 'account') |
| candidates | Polymorphic | `entity_id` (when entity_type = 'candidate') |
| submissions | Polymorphic | `entity_id` (when entity_type = 'submission') |
| jobs | Polymorphic | `entity_id` (when entity_type = 'job') |

---

## Business Logic & Usage Patterns

### 1. Task vs Activity Distinction

**IMPORTANT:** This table unifies both concepts, but they have different UX patterns:

| Aspect | Past Activity | Future Task |
|--------|--------------|-------------|
| **Status** | Usually `completed` | `scheduled`, `open`, or `in_progress` |
| **due_date** | Defaults to NOW (when it happened) | Future date (when to do it) |
| **Use Case** | Logging work that was done | Planning work to be done |
| **UI Location** | Entity timeline/history | My Tasks list, Calendar |
| **User Action** | Record/log activity | Complete/skip task |

**Example - Past Activity:**
```typescript
// Log a call that just happened
await createActivity({
  activity_type: 'call',
  status: 'completed',
  subject: 'Screening call with John Doe',
  body: 'Great conversation. Candidate is interested...',
  due_date: new Date(), // NOW - when it happened
  completed_at: new Date(),
  outcome: 'positive',
  entity_type: 'candidate',
  entity_id: candidateId,
  assigned_to: currentUserId,
  performed_by: currentUserId,
});
```

**Example - Future Task:**
```typescript
// Create a follow-up task for tomorrow
await createActivity({
  activity_type: 'follow_up',
  status: 'open',
  subject: 'Follow up with client on proposal',
  due_date: new Date('2025-12-01'), // Tomorrow
  priority: 'high',
  entity_type: 'lead',
  entity_id: leadId,
  assigned_to: currentUserId,
});
```

---

### 2. Polymorphic Querying Examples

**Get all activities for a Lead:**
```typescript
const leadActivities = await db.query.activities.findMany({
  where: and(
    eq(activities.orgId, orgId),
    eq(activities.entityType, 'lead'),
    eq(activities.entityId, leadId)
  ),
  orderBy: [desc(activities.createdAt)],
});
```

**Get activities across multiple entity types:**
```typescript
// Get all activities related to a deal (deal + account + POCs)
const dealActivityIds = await db.query.activities.findMany({
  where: and(
    eq(activities.orgId, orgId),
    or(
      and(eq(activities.entityType, 'deal'), eq(activities.entityId, dealId)),
      and(eq(activities.entityType, 'account'), eq(activities.entityId, accountId)),
      and(eq(activities.entityType, 'poc'), inArray(activities.entityId, pocIds))
    )
  ),
  orderBy: [desc(activities.createdAt)],
});
```

---

### 3. My Tasks Query

**Get user's open tasks:**
```sql
SELECT * FROM activities
WHERE org_id = $1
  AND assigned_to = $2
  AND status IN ('open', 'in_progress')
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  due_date ASC;
```

**Get user's overdue tasks:**
```sql
SELECT * FROM activities
WHERE org_id = $1
  AND assigned_to = $2
  AND status IN ('open', 'in_progress')
  AND due_date < NOW()
ORDER BY due_date ASC;
```

**Get user's tasks due today:**
```sql
SELECT * FROM activities
WHERE org_id = $1
  AND assigned_to = $2
  AND status IN ('open', 'in_progress')
  AND due_date::date = CURRENT_DATE
ORDER BY due_date ASC;
```

---

### 4. Activity Timeline Query

**Get entity activity timeline (chronological):**
```sql
SELECT
  a.*,
  u.full_name as assigned_to_name,
  p.full_name as performed_by_name,
  poc.first_name || ' ' || poc.last_name as contact_name
FROM activities a
LEFT JOIN user_profiles u ON u.id = a.assigned_to
LEFT JOIN user_profiles p ON p.id = a.performed_by
LEFT JOIN point_of_contacts poc ON poc.id = a.poc_id
WHERE a.org_id = $1
  AND a.entity_type = $2
  AND a.entity_id = $3
ORDER BY a.created_at DESC;
```

---

### 5. Follow-up Chain Queries

**Get all follow-ups for an activity:**
```sql
SELECT * FROM activities
WHERE parent_activity_id = $1
ORDER BY created_at ASC;
```

**Get full follow-up chain (recursive):**
```sql
WITH RECURSIVE activity_chain AS (
  -- Start with root activity
  SELECT
    id,
    parent_activity_id,
    activity_type,
    subject,
    status,
    created_at,
    1 as level
  FROM activities
  WHERE id = $1

  UNION ALL

  -- Recursively get all children
  SELECT
    a.id,
    a.parent_activity_id,
    a.activity_type,
    a.subject,
    a.status,
    a.created_at,
    ac.level + 1
  FROM activities a
  INNER JOIN activity_chain ac ON a.parent_activity_id = ac.id
)
SELECT * FROM activity_chain
ORDER BY created_at ASC;
```

---

### 6. Escalation Detection

**Find activities needing escalation:**
```sql
SELECT
  a.*,
  u.full_name as assignee_name,
  u.manager_id
FROM activities a
JOIN user_profiles u ON u.id = a.assigned_to
WHERE a.status IN ('open', 'in_progress')
  AND a.escalation_date IS NOT NULL
  AND a.escalation_date <= NOW()
  AND a.org_id = $1;
```

---

### 7. Activity Metrics

**Completion rate by user:**
```sql
SELECT
  assigned_to,
  u.full_name,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open,
  COUNT(*) as total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*),
    1
  ) as completion_rate
FROM activities a
JOIN user_profiles u ON u.id = a.assigned_to
WHERE a.org_id = $1
  AND a.created_at >= $2  -- date range
GROUP BY assigned_to, u.full_name
ORDER BY completion_rate DESC;
```

**Outcome distribution:**
```sql
SELECT
  activity_type,
  outcome,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY activity_type), 1) as percentage
FROM activities
WHERE org_id = $1
  AND status = 'completed'
  AND outcome IS NOT NULL
GROUP BY activity_type, outcome
ORDER BY activity_type, count DESC;
```

**Average time to complete by type:**
```sql
SELECT
  activity_type,
  COUNT(*) as total,
  ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600), 1) as avg_hours
FROM activities
WHERE org_id = $1
  AND status = 'completed'
  AND completed_at IS NOT NULL
GROUP BY activity_type
ORDER BY avg_hours DESC;
```

---

## Migration from Legacy Tables

This table **replaces** two legacy tables:

### 1. From `activity_log` (historical activities)
```sql
-- Migrate existing activity logs
INSERT INTO activities (
  org_id,
  entity_type,
  entity_id,
  activity_type,
  status,
  subject,
  body,
  direction,
  due_date,
  completed_at,
  outcome,
  assigned_to,
  performed_by,
  poc_id,
  created_at,
  updated_at,
  created_by
)
SELECT
  org_id,
  'lead' as entity_type,  -- or map from activity_log.entity_type
  lead_id as entity_id,
  activity_type,
  'completed' as status,  -- All historical logs are completed
  subject,
  notes as body,
  direction,
  created_at as due_date,  -- When it happened
  created_at as completed_at,
  outcome,
  user_id as assigned_to,
  user_id as performed_by,
  poc_id,
  created_at,
  updated_at,
  created_by
FROM activity_log
WHERE deleted_at IS NULL;
```

### 2. From `lead_tasks` (future tasks)
```sql
-- Migrate existing tasks
INSERT INTO activities (
  org_id,
  entity_type,
  entity_id,
  activity_type,
  status,
  subject,
  body,
  priority,
  due_date,
  escalation_date,
  assigned_to,
  created_at,
  updated_at,
  created_by
)
SELECT
  org_id,
  'lead' as entity_type,
  lead_id as entity_id,
  'task' as activity_type,  -- Generic task type
  CASE
    WHEN completed_at IS NOT NULL THEN 'completed'
    WHEN skipped_at IS NOT NULL THEN 'skipped'
    WHEN due_date > NOW() THEN 'scheduled'
    ELSE 'open'
  END as status,
  title as subject,
  description as body,
  priority,
  due_date,
  escalation_date,
  assigned_to,
  created_at,
  updated_at,
  created_by
FROM lead_tasks
WHERE deleted_at IS NULL;
```

---

## Helper Functions

### Create Activity with Auto-Escalation
```sql
CREATE OR REPLACE FUNCTION create_activity_with_escalation(
  p_org_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_activity_type TEXT,
  p_subject TEXT,
  p_due_date TIMESTAMPTZ,
  p_priority TEXT,
  p_assigned_to UUID
)
RETURNS UUID AS $$
DECLARE
  v_escalation_date TIMESTAMPTZ;
  v_activity_id UUID;
BEGIN
  -- Calculate escalation date based on priority
  v_escalation_date := p_due_date + CASE p_priority
    WHEN 'urgent' THEN INTERVAL '0 days'
    WHEN 'high' THEN INTERVAL '1 day'
    WHEN 'medium' THEN INTERVAL '3 days'
    WHEN 'low' THEN INTERVAL '7 days'
    ELSE INTERVAL '3 days'
  END;

  -- Create activity
  INSERT INTO activities (
    org_id, entity_type, entity_id, activity_type,
    subject, due_date, escalation_date, priority, assigned_to, status
  ) VALUES (
    p_org_id, p_entity_type, p_entity_id, p_activity_type,
    p_subject, p_due_date, v_escalation_date, p_priority, p_assigned_to,
    CASE WHEN p_due_date > NOW() THEN 'scheduled' ELSE 'open' END
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;
```

### Complete Activity with Follow-up
```sql
CREATE OR REPLACE FUNCTION complete_activity_with_followup(
  p_activity_id UUID,
  p_outcome TEXT,
  p_outcome_notes TEXT,
  p_create_followup BOOLEAN DEFAULT FALSE,
  p_followup_days INTEGER DEFAULT 7
)
RETURNS UUID AS $$
DECLARE
  v_activity activities%ROWTYPE;
  v_followup_id UUID;
BEGIN
  -- Complete activity
  UPDATE activities
  SET
    status = 'completed',
    outcome = p_outcome,
    body = COALESCE(body, '') || E'\n\nOutcome: ' || p_outcome_notes,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_activity_id
  RETURNING * INTO v_activity;

  -- Create follow-up if requested
  IF p_create_followup THEN
    INSERT INTO activities (
      org_id, entity_type, entity_id, activity_type,
      subject, parent_activity_id, due_date, priority, assigned_to, status
    ) VALUES (
      v_activity.org_id,
      v_activity.entity_type,
      v_activity.entity_id,
      'follow_up',
      'Follow-up: ' || v_activity.subject,
      p_activity_id,
      NOW() + (p_followup_days || ' days')::INTERVAL,
      v_activity.priority,
      v_activity.assigned_to,
      'open'
    )
    RETURNING id INTO v_followup_id;
  END IF;

  RETURN COALESCE(v_followup_id, p_activity_id);
END;
$$ LANGUAGE plpgsql;
```

---

## Best Practices

### 1. Always Set Due Date
Every activity must have a `due_date`, even if it's NOW for immediate activities.

### 2. Use Appropriate Types
- Use `email`, `call`, `meeting` for communications
- Use `task` for generic to-dos
- Use `follow_up` for chained activities
- Use `note` for internal documentation

### 3. Polymorphic Indexing
Always query with both `entity_type` and `entity_id` together for best index performance.

### 4. Status Lifecycle
Respect the status lifecycle. Don't skip states arbitrarily.

### 5. Follow-up Chains
When creating follow-ups, always set `parent_activity_id` to maintain context.

### 6. Outcome on Completion
When marking activities as `completed`, always set the `outcome` field for metrics.

### 7. Escalation Handling
Set `escalation_date` for important tasks to ensure timely completion.

---

*Last Updated: 2025-11-30*
