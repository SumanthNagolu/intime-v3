# User Story: Workflow Configuration

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-009
**Priority:** Medium
**Estimated Context:** ~40K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/09-workflow-configuration.md`

---

## User Story

**As an** Admin user,
**I want** to create and manage automated workflows including approval chains, status automation, and notifications,
**So that** I can automate business processes and ensure consistent execution.

---

## Acceptance Criteria

### AC-1: Workflow List
- [ ] Display all workflows with status
- [ ] Filter by type, entity, status
- [ ] Search by workflow name
- [ ] Show execution stats (runs, success rate)

### AC-2: Create Workflow
- [ ] Select workflow type (approval, automation, notification, etc.)
- [ ] Select trigger entity type (job, submission, etc.)
- [ ] Configure trigger conditions
- [ ] Define workflow steps
- [ ] Configure actions per step
- [ ] Set timeouts and escalations

### AC-3: Workflow Builder UI
- [ ] Visual workflow builder
- [ ] Drag-and-drop step arrangement
- [ ] Condition builder with operators
- [ ] Action configuration panels
- [ ] Preview workflow logic

### AC-4: Approval Workflows
- [ ] Configure approval chain
- [ ] Set approvers (by role, user, or dynamic)
- [ ] Configure parallel vs sequential approval
- [ ] Set timeout with escalation
- [ ] Define approval/rejection actions

### AC-5: Test & Activate
- [ ] Dry run/test workflow
- [ ] View test results
- [ ] Activate workflow
- [ ] Option to apply to existing records

### AC-6: Execution Monitoring
- [ ] View workflow execution history
- [ ] View step-by-step progress
- [ ] Debug failed executions
- [ ] Retry failed steps
- [ ] Cancel running workflows

---

## UI/UX Requirements

### Workflow List
```
┌────────────────────────────────────────────────────────────────┐
│ Workflows                                      [+ New Workflow] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Type: All ▼] [Entity: All ▼] [Status: All ▼] [🔍 Search...]  │
│                                                                │
│ ┌──────────────────┬────────────┬──────────┬─────────┬───────┐│
│ │ Workflow         │ Type       │ Entity   │ Runs    │Status ││
│ ├──────────────────┼────────────┼──────────┼─────────┼───────┤│
│ │ Job Approval     │ Approval   │ Job      │ 156     │🟢 Act.││
│ │ High Rate Alert  │ Notif.     │ Job      │ 23      │🟢 Act.││
│ │ Auto-Close Stale │ Automation │ Submis.  │ 89      │🟢 Act.││
│ │ Offer Approval   │ Approval   │ Offer    │ 45      │🟡 Test││
│ │ Interview Remind │ Scheduled  │ Interview│ 234     │🟢 Act.││
│ └──────────────────┴────────────┴──────────┴─────────┴───────┘│
│                                                                │
│ Showing 5 of 12 workflows                                      │
└────────────────────────────────────────────────────────────────┘
```

### Workflow Builder
```
┌────────────────────────────────────────────────────────────────┐
│ Workflow Builder - Job Approval                           [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ BASIC INFO                                                     │
│ Name: [Job Approval Workflow                              ]   │
│ Description: [Requires manager approval for new jobs      ]   │
│                                                                │
│ TRIGGER                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ When:   [Job                                           ▼]  ││
│ │ Event:  [Created                                       ▼]  ││
│ │                                                            ││
│ │ Conditions:                                                ││
│ │ ┌────────────────────────────────────────────────────────┐││
│ │ │ [bill_rate       ▼] [>           ▼] [100            ] │││
│ │ │ [+ Add Condition]                                      │││
│ │ └────────────────────────────────────────────────────────┘││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ WORKFLOW STEPS                                                 │
│ ┌────────────────────────────────────────────────────────────┐│
│ │     ┌───────────────┐                                      ││
│ │     │   TRIGGER     │                                      ││
│ │     │ Job Created   │                                      ││
│ │     └───────┬───────┘                                      ││
│ │             │                                              ││
│ │             ▼                                              ││
│ │     ┌───────────────┐                                      ││
│ │     │   APPROVAL    │  [Edit] [×]                         ││
│ │     │ Manager       │                                      ││
│ │     │ Timeout: 48h  │                                      ││
│ │     └───────┬───────┘                                      ││
│ │         ┌───┴───┐                                          ││
│ │         │       │                                          ││
│ │         ▼       ▼                                          ││
│ │   ┌─────────┐ ┌─────────┐                                  ││
│ │   │APPROVED │ │REJECTED │                                  ││
│ │   │Set Active│ │Set Draft│                                  ││
│ │   │Notify    │ │Notify   │                                  ││
│ │   └─────────┘ └─────────┘                                  ││
│ │                                                            ││
│ │ [+ Add Step]                                               ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Cancel]               [Test Workflow] [Save] [Save & Activate]│
└────────────────────────────────────────────────────────────────┘
```

### Approval Step Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Configure Approval Step                                   [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ APPROVERS                                                      │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Approval Type:                                             ││
│ │ ○ Specific User(s)                                        ││
│ │ ● By Role (Pod Manager)                                   ││
│ │ ○ Dynamic (Field value: manager_id)                       ││
│ │                                                            ││
│ │ Role: [Pod Manager                                    ▼]   ││
│ │                                                            ││
│ │ Approval Mode:                                             ││
│ │ ● Any one approver (first approval completes)             ││
│ │ ○ All approvers must approve                              ││
│ │ ○ Majority (50%+1)                                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ TIMEOUT & ESCALATION                                           │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Timeout: [48] hours                                        ││
│ │                                                            ││
│ │ On Timeout:                                                ││
│ │ ○ Auto-approve                                            ││
│ │ ○ Auto-reject                                             ││
│ │ ● Escalate to: [Regional Director                     ▼]  ││
│ │ ○ Cancel workflow                                         ││
│ │                                                            ││
│ │ ☑ Send reminder after [24] hours                          ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ACTIONS ON APPROVAL                                            │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ [+ Add Action]                                             ││
│ │                                                            ││
│ │ ☑ Update field: status = "active"                         ││
│ │ ☑ Send notification to: creator                           ││
│ │ ☐ Trigger webhook                                         ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ACTIONS ON REJECTION                                           │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ [+ Add Action]                                             ││
│ │                                                            ││
│ │ ☑ Update field: status = "rejected"                       ││
│ │ ☑ Send notification to: creator                           ││
│ │ ☐ Require rejection reason                                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Cancel]                                          [Save Step]  │
└────────────────────────────────────────────────────────────────┘
```

### Workflow Execution History
```
┌────────────────────────────────────────────────────────────────┐
│ Workflow Executions - Job Approval                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Date: Last 7 days ▼] [Status: All ▼] [🔍 Search...]         │
│                                                                │
│ ┌──────────┬─────────────┬────────────┬──────────┬──────────┐│
│ │ ID       │ Triggered   │ Object     │ Status   │ Duration ││
│ ├──────────┼─────────────┼────────────┼──────────┼──────────┤│
│ │ WF-001   │ Dec 4, 10AM │ JOB-1234   │✓ Complete│ 2h 15m   ││
│ │ WF-002   │ Dec 4, 9AM  │ JOB-1235   │⏳ Pending│ 4h 30m   ││
│ │ WF-003   │ Dec 3, 4PM  │ JOB-1230   │✗ Failed  │ 48h      ││
│ │ WF-004   │ Dec 3, 2PM  │ JOB-1228   │✓ Complete│ 30m      ││
│ └──────────┴─────────────┴────────────┴──────────┴──────────┘│
│                                                                │
│ EXECUTION DETAIL: WF-001                                       │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Trigger: Job JOB-1234 created by Sarah Patel              ││
│ │ Started: Dec 4, 2024 10:00 AM                             ││
│ │ Completed: Dec 4, 2024 12:15 PM                           ││
│ │                                                            ││
│ │ Steps:                                                     ││
│ │ ✓ 10:00 AM - Workflow triggered                           ││
│ │ ✓ 10:00 AM - Approval request sent to Mike Jones          ││
│ │ ✓ 12:15 PM - Approved by Mike Jones                       ││
│ │ ✓ 12:15 PM - Status updated to "active"                   ││
│ │ ✓ 12:15 PM - Notification sent to Sarah Patel             ││
│ └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(50) NOT NULL, -- approval, status_auto, notification, etc.
  entity_type VARCHAR(50) NOT NULL, -- job, submission, candidate, etc.
  trigger_event VARCHAR(50) NOT NULL, -- created, updated, status_changed, etc.
  trigger_conditions JSONB, -- [{field, operator, value}]
  status VARCHAR(20) DEFAULT 'draft', -- draft, testing, active, inactive
  version INTEGER DEFAULT 1,
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES user_profiles(id),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow steps
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL, -- approval, action, condition, wait
  config JSONB NOT NULL, -- Type-specific configuration
  timeout_hours INTEGER,
  timeout_action VARCHAR(50), -- auto_approve, auto_reject, escalate, cancel
  escalate_to_role_id UUID REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow actions
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  trigger_on VARCHAR(50) NOT NULL, -- approved, rejected, timeout, always
  action_type VARCHAR(50) NOT NULL, -- update_field, send_notification, webhook
  config JSONB NOT NULL, -- Action-specific configuration
  action_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'running', -- running, completed, failed, cancelled
  current_step_id UUID REFERENCES workflow_steps(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_log JSONB -- Array of step executions
);

-- Workflow approvals
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES workflow_steps(id),
  approver_id UUID NOT NULL REFERENCES user_profiles(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, escalated
  decision_at TIMESTAMPTZ,
  comments TEXT,
  reminder_sent_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflows_org ON workflows(organization_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_approvals_execution ON workflow_approvals(execution_id);
CREATE INDEX idx_workflow_approvals_approver ON workflow_approvals(approver_id);
CREATE INDEX idx_workflow_approvals_status ON workflow_approvals(status);
```

---

## Workflow Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| `approval` | Multi-step approval chain | Job approval, offer approval |
| `status_auto` | Auto-update status on conditions | Auto-close stale submissions |
| `notification` | Send notifications on events | High rate alert, deadline reminders |
| `sla_escalation` | Escalate on SLA breach | Response time violations |
| `field_auto` | Auto-populate/calculate fields | Auto-assign recruiter |
| `assignment` | Auto-assign based on criteria | Round-robin assignment |
| `webhook` | Call external service | Sync with external system |
| `scheduled` | Time-based automation | Daily/weekly tasks |

---

## Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | status = "active" |
| `neq` | Not equals | status != "closed" |
| `contains` | Contains substring | title contains "Senior" |
| `gt` | Greater than | bill_rate > 100 |
| `lt` | Less than | days_open < 30 |
| `between` | In range | salary between 50000 and 100000 |
| `is_empty` | Field is null/empty | manager_id is empty |
| `changed` | Field value changed | status changed |
| `changed_to` | Changed to value | status changed to "active" |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-WF-001 | Create approval workflow | Workflow created in draft status |
| ADMIN-WF-002 | Add approval step | Step added with approvers |
| ADMIN-WF-003 | Configure actions | Actions saved correctly |
| ADMIN-WF-004 | Test workflow (dry run) | Simulation shows expected steps |
| ADMIN-WF-005 | Activate workflow | Status = active, begins triggering |
| ADMIN-WF-006 | Workflow triggers | Execution created when conditions met |
| ADMIN-WF-007 | Approval step executes | Approval request sent to approver |
| ADMIN-WF-008 | Approver approves | Actions execute, workflow continues |
| ADMIN-WF-009 | Approver rejects | Rejection actions execute |
| ADMIN-WF-010 | Approval timeout | Escalation or timeout action executes |
| ADMIN-WF-011 | View execution history | Shows all executions with details |
| ADMIN-WF-012 | Retry failed step | Step re-executes |
| ADMIN-WF-013 | Cancel running workflow | Workflow cancelled |
| ADMIN-WF-014 | Deactivate workflow | No new executions triggered |
| ADMIN-WF-015 | Apply to existing | Workflow runs on matching records |

---

## Dependencies

- Entity event system (create, update triggers)
- Notification system
- Background job processor
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- Visual workflow designer with drag-drop canvas
- Conditional branching (if/else paths)
- Loop steps
- Sub-workflows
