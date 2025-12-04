# UC-ADMIN-009: Workflow Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-009 |
| Actor | Admin |
| Goal | Configure automated workflows, approval chains, and business rules |
| Frequency | Monthly (initial setup) + as needed for modifications |
| Estimated Time | 30 min - 2 hours per workflow |
| Priority | HIGH |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `workflows.create`, `workflows.update`, `workflows.delete` permissions
3. Organization has workflow feature enabled (feature flag: `workflow_automation`)
4. At least one entity type exists in the system (Jobs, Candidates, etc.)

---

## Trigger

- Admin clicks "Workflows" in the Admin sidebar navigation
- Admin clicks "+ New Workflow" button on Workflows Hub
- Admin navigates directly to `/employee/admin/workflows`
- Admin uses keyboard shortcut `g w` from any admin page

---

## Workflow Types

| Type | Code | Description | Example Use Case |
|------|------|-------------|------------------|
| Approval Chain | `approval` | Multi-level approvals with escalation | Job approval: Recruiter → Manager → Director |
| Status Automation | `status_auto` | Auto-update statuses based on conditions | Candidate → Submitted when email sent to client |
| Notification Trigger | `notification` | Send alerts on specific events | Email manager when placement is made |
| SLA Escalation | `sla_escalation` | Time-based escalation alerts | Alert if submission pending > 48 hours |
| Field Automation | `field_auto` | Auto-populate or calculate fields | Set priority based on job bill rate |
| Assignment Rules | `assignment` | Auto-assign ownership to users | Round-robin new leads to team members |
| Webhook Trigger | `webhook` | Call external APIs on events | Sync placement to HRIS system |
| Scheduled Task | `scheduled` | Run workflows on a schedule | Weekly digest of overdue tasks |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Workflows Hub

**User Action:** Click "Workflows" in Admin sidebar under SYSTEM section

**System Response:**
- URL changes to: `/employee/admin/workflows`
- Page title displays: "Workflow Configuration"
- Workflow list loads with existing workflows
- Stats bar shows: Active (12), Draft (3), Disabled (2)

**Screen State:**

```
+----------------------------------------------------------+
| Workflows                                [+ New Workflow]  |
+----------------------------------------------------------+
| [Search workflows...]        [Type ▼] [Status ▼] [Entity ▼]|
+----------------------------------------------------------+
| ACTIVE WORKFLOWS (12)                                      |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Job Approval - High Value                         │   |
| │   Type: Approval Chain | Entity: Jobs               │   |
| │   Trigger: Job Created where Bill Rate > $100/hr    │   |
| │   Last Run: 2 hours ago | Runs: 156                 │   |
| │   [Edit]  [Disable]  [View History]                 │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Auto-Submit Notification                          │   |
| │   Type: Notification | Entity: Submissions          │   |
| │   Trigger: Submission Created                       │   |
| │   Last Run: 15 min ago | Runs: 2,341                │   |
| │   [Edit]  [Disable]  [View History]                 │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Lead Assignment - Round Robin                     │   |
| │   Type: Assignment | Entity: Leads                  │   |
| │   Trigger: Lead Created from Website                │   |
| │   Last Run: 1 hour ago | Runs: 89                   │   |
| │   [Edit]  [Disable]  [View History]                 │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| DRAFT WORKFLOWS (3)                        [Show/Hide]     |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Placement Celebration                             │   |
| │   Type: Notification | Entity: Placements           │   |
| │   Status: Draft - Not validated                     │   |
| │   [Edit]  [Validate]  [Delete]                      │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| DISABLED WORKFLOWS (2)                     [Show/Hide]     |
+----------------------------------------------------------+
| Showing 17 workflows                      [← Prev] [Next →]|
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "+ New Workflow"

**User Action:** Click "+ New Workflow" button (top right)

**System Response:**
- Modal opens with workflow type selection
- Focus moves to first option
- Keyboard navigation enabled

**Screen State:**

```
+----------------------------------------------------------+
| Create New Workflow                              [× Close] |
+----------------------------------------------------------+
| What type of workflow do you want to create?              |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ● Approval Chain                                    │   |
| │   Multi-level approvals with timeout and escalation │   |
| │   Best for: Job approvals, expense approvals        │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Status Automation                                 │   |
| │   Automatically update statuses based on events     │   |
| │   Best for: Pipeline progression, task completion   │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Notification Trigger                              │   |
| │   Send emails, Slack, or in-app notifications       │   |
| │   Best for: Alerts, reminders, celebrations         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ SLA Escalation                                    │   |
| │   Time-based alerts and escalation paths            │   |
| │   Best for: Response time SLAs, overdue tasks       │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Field Automation                                  │   |
| │   Auto-populate or calculate field values           │   |
| │   Best for: Default values, calculated fields       │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Assignment Rules                                  │   |
| │   Auto-assign records to users or teams             │   |
| │   Best for: Lead routing, workload balancing        │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
+----------------------------------------------------------+
|                                    [Cancel]  [Continue →]  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 3: Select Workflow Type and Continue

**User Action:** Select "Approval Chain" and click "Continue"

**System Response:**
- Modal expands to full workflow builder
- URL changes to: `/employee/admin/workflows/new?type=approval`
- Workflow builder form loads with empty fields
- Entity type selector appears

**Screen State:**

```
+----------------------------------------------------------+
| Workflow Builder: New Approval Workflow            [Save]  |
+----------------------------------------------------------+
| WORKFLOW DETAILS                                           |
|                                                            |
| Workflow Name *                                            |
| [                                                      ]   |
| ℹ️ Use a descriptive name (e.g., "Job Approval - High Value")|
|                                                            |
| Description                                                |
| [                                                      ]   |
| [                                                      ]   |
|                                                            |
| Entity Type *                                              |
| [Select entity type...                                 ▼]  |
| Options: Jobs, Candidates, Submissions, Placements,        |
|          Accounts, Contacts, Leads, Deals, Activities      |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 4: Enter Workflow Name and Select Entity

**User Action:**
1. Enter "Job Approval - High Value" in Workflow Name field
2. Select "Jobs" from Entity Type dropdown

**System Response:**
- Name field validates (green checkmark appears)
- Entity selection triggers trigger condition builder to load
- Job-specific fields populate in condition dropdowns

**Field Specification: Workflow Name**

| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | TextInput |
| Label | "Workflow Name" |
| Placeholder | "e.g., Job Approval - High Value" |
| Required | Yes |
| Min Length | 5 characters |
| Max Length | 100 characters |
| Validation | Alphanumeric, spaces, hyphens allowed |
| Unique Check | Yes (per organization) |
| Error Messages | |
| - Empty | "Workflow name is required" |
| - Too Short | "Name must be at least 5 characters" |
| - Duplicate | "A workflow with this name already exists" |
| Accessibility | aria-label="Workflow name", aria-required="true" |

**Field Specification: Entity Type**

| Property | Value |
|----------|-------|
| Field Name | `entity_type` |
| Type | Select (searchable) |
| Label | "Entity Type" |
| Required | Yes |
| Options | Jobs, Candidates, Submissions, Placements, Accounts, Contacts, Leads, Deals, Activities |
| Error Messages | |
| - Empty | "Please select an entity type" |
| On Change | Load entity-specific fields for conditions |

**Time:** ~3 seconds

---

### Step 5: Configure Trigger Conditions

**User Action:** Configure when the workflow should trigger

**System Response:**
- Trigger section expands
- Condition builder appears with entity fields
- AND/OR logic operators available

**Screen State:**

```
+----------------------------------------------------------+
| Workflow Builder: Job Approval - High Value        [Save]  |
+----------------------------------------------------------+
| WORKFLOW DETAILS                                           |
| Workflow Name *: [Job Approval - High Value            ] ✓ |
| Entity Type *:   [Jobs                                 ▼]  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| TRIGGER CONDITIONS                                         |
|                                                            |
| When should this workflow run?                             |
|                                                            |
| Trigger Event *                                            |
| [Record Created                                        ▼]  |
| Options: Record Created, Record Updated, Field Changed,    |
|          Status Changed, Time-Based, Manual Trigger        |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| FILTER CONDITIONS (Optional)                               |
|                                                            |
| Only run when ALL of these conditions are met:             |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ [Bill Rate       ▼] [is greater than ▼] [$100     ] │   |
| │                                              [× Remove]│   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| [+ Add Condition]   [+ Add Condition Group (OR)]           |
|                                                            |
| Preview: This workflow will run when a Job is created      |
|          AND Bill Rate is greater than $100                |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 6: Configure Approval Steps

**User Action:** Add approval steps with approvers and timeouts

**System Response:**
- Approval steps section appears
- Visual flow diagram updates in real-time
- Each step can be configured independently

**Screen State:**

```
+----------------------------------------------------------+
| Workflow Builder: Job Approval - High Value        [Save]  |
+----------------------------------------------------------+
| ─────────────────────────────────────────────────────────  |
| APPROVAL STEPS                                             |
|                                                            |
| Configure the approval chain:                              |
|                                                            |
| Step 1: Pod Manager                                        |
| ┌─────────────────────────────────────────────────────┐   |
| │ Step Name *                                          │   |
| │ [Pod Manager Approval                            ]   │   |
| │                                                      │   |
| │ Approver *                                           │   |
| │ [Record Owner's Manager                          ▼]  │   |
| │ Options: Specific User, Record Owner, Owner's Manager│   |
| │          Role-based, Pod Manager, Custom Formula     │   |
| │                                                      │   |
| │ Timeout                                              │   |
| │ [24        ] [Hours                              ▼]  │   |
| │                                                      │   |
| │ On Timeout                                           │   |
| │ [Escalate to next step                           ▼]  │   |
| │ Options: Escalate to next step, Auto-approve,        │   |
| │          Auto-reject, Send reminder, Do nothing      │   |
| │                                                      │   |
| │ Reminder                                             │   |
| │ ☑ Send reminder at [50   ]% of timeout (12 hours)   │   |
| │                                                      │   |
| │ [× Remove Step]                                      │   |
| └─────────────────────────────────────────────────────┘   |
|                        ↓                                   |
| Step 2: Regional Director                                  |
| ┌─────────────────────────────────────────────────────┐   |
| │ Step Name *                                          │   |
| │ [Regional Director Approval                      ]   │   |
| │                                                      │   |
| │ Approver *                                           │   |
| │ [Users with Role: Regional Director              ▼]  │   |
| │                                                      │   |
| │ Timeout                                              │   |
| │ [24        ] [Hours                              ▼]  │   |
| │                                                      │   |
| │ On Timeout                                           │   |
| │ [Auto-approve                                    ▼]  │   |
| │                                                      │   |
| │ [× Remove Step]                                      │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| [+ Add Approval Step]                                      |
|                                                            |
+----------------------------------------------------------+
```

**Field Specification: Approver Selection**

| Property | Value |
|----------|-------|
| Field Name | `approver_type` |
| Type | Select |
| Options | |
| - `specific_user` | Select a specific user |
| - `record_owner` | The record's owner |
| - `owners_manager` | The record owner's manager |
| - `role_based` | Any user with specific role |
| - `pod_manager` | The record owner's pod manager |
| - `custom_formula` | JavaScript expression |
| Required | Yes |
| Error Messages | |
| - Empty | "Please select an approver" |

**Field Specification: Timeout Duration**

| Property | Value |
|----------|-------|
| Field Name | `timeout_value` |
| Type | NumberInput |
| Min | 1 |
| Max | 720 (30 days in hours) |
| Default | 24 |
| Required | Yes |

**Field Specification: Timeout Unit**

| Property | Value |
|----------|-------|
| Field Name | `timeout_unit` |
| Type | Select |
| Options | Minutes, Hours, Business Hours, Days, Business Days |
| Default | Hours |
| Required | Yes |

**Time:** ~30 seconds per step

---

### Step 7: Configure Actions on Approval/Rejection

**User Action:** Define what happens when workflow completes

**System Response:**
- Actions section appears
- Separate configs for approval and rejection
- Preview of actions shows

**Screen State:**

```
+----------------------------------------------------------+
| ─────────────────────────────────────────────────────────  |
| ACTIONS ON APPROVAL                                        |
|                                                            |
| When all approvers approve:                                |
|                                                            |
| ☑ Update field: [Status       ▼] to [Approved        ▼]   |
| ☑ Send notification to: [Record Owner              ▼]      |
|   Template: [Job Approved - Notification           ▼]      |
| ☐ Create activity log entry                                |
| ☐ Trigger webhook: [Select webhook...              ▼]      |
| ☐ Run another workflow: [Select workflow...        ▼]      |
|                                                            |
| [+ Add Action]                                             |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| ACTIONS ON REJECTION                                       |
|                                                            |
| When any approver rejects:                                 |
|                                                            |
| ☑ Update field: [Status       ▼] to [Rejected        ▼]   |
| ☑ Send notification to: [Record Owner              ▼]      |
|   Template: [Job Rejected - Notification           ▼]      |
|   ☑ Include rejection reason                              |
| ☐ Reassign to: [Select user...                     ▼]      |
|                                                            |
| [+ Add Action]                                             |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| ACTIONS ON CANCELLATION                                    |
|                                                            |
| When workflow is manually cancelled:                       |
|                                                            |
| ☑ Update field: [Status       ▼] to [Draft           ▼]   |
| ☐ Send notification                                        |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~15 seconds

---

### Step 8: Test Workflow

**User Action:** Click "Test Workflow" button

**System Response:**
- Test modal opens
- User can select a test record
- Dry run executes without making changes
- Results show what would happen

**Screen State:**

```
+----------------------------------------------------------+
| Test Workflow: Job Approval - High Value        [× Close]  |
+----------------------------------------------------------+
| Test this workflow against a real record (no changes made) |
|                                                            |
| Select Test Record                                         |
| [Search for a job...                                   🔍] |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ JOB-2024-1234: Senior Java Developer                │   |
| │ Bill Rate: $125/hr | Status: Draft | Owner: Sarah   │   |
| │ [Select]                                            │   |
| ├─────────────────────────────────────────────────────┤   |
| │ JOB-2024-1235: DevOps Engineer                      │   |
| │ Bill Rate: $85/hr | Status: Draft | Owner: Mike     │   |
| │ [Select]                                            │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| TEST RESULTS                                               |
|                                                            |
| ✓ Trigger Conditions: MATCHED                             |
|   - Bill Rate ($125) > $100 ✓                             |
|                                                            |
| ✓ Approval Chain Would Be:                                |
|   Step 1: Mike Rodriguez (Sarah's Manager)                |
|   Step 2: Jennifer Smith (Regional Director)              |
|                                                            |
| ✓ On Approval Would:                                      |
|   - Set Status to "Approved"                              |
|   - Send email to sarah@company.com                       |
|                                                            |
| ⚠️ Note: This is a dry run. No changes were made.         |
|                                                            |
+----------------------------------------------------------+
|                                          [Run Another Test]|
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 9: Save and Activate Workflow

**User Action:** Click "Save" then "Activate"

**System Response:**
- Workflow validates all required fields
- Workflow saves to database
- Confirmation modal appears for activation
- On confirm, workflow becomes active

**Screen State (Activation Confirmation):**

```
+----------------------------------------------------------+
| Activate Workflow?                              [× Close]  |
+----------------------------------------------------------+
|                                                            |
| You are about to activate:                                 |
|                                                            |
| "Job Approval - High Value"                                |
|                                                            |
| This workflow will run automatically when:                 |
| • A Job is created                                        |
| • Bill Rate is greater than $100/hr                       |
|                                                            |
| ⚠️ Active workflows cannot be edited. You'll need to      |
|    create a new version to make changes.                  |
|                                                            |
| Affected Records (Estimate):                               |
| • ~15 new jobs/month match these conditions               |
| • 3 existing jobs in "Draft" status would qualify         |
|                                                            |
| ☐ Apply to existing matching records in Draft status      |
|                                                            |
+----------------------------------------------------------+
|                              [Cancel]  [Activate Workflow] |
+----------------------------------------------------------+
```

**Backend Processing:**

```typescript
// Workflow activation process
async function activateWorkflow(workflowId: string) {
  // 1. Validate workflow configuration
  const workflow = await db.workflows.findById(workflowId);
  const validation = validateWorkflowConfig(workflow);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }

  // 2. Update workflow status
  await db.workflows.update(workflowId, {
    status: 'active',
    activated_at: new Date(),
    activated_by: currentUser.id,
    version: workflow.version + 1
  });

  // 3. Register workflow triggers
  await workflowEngine.registerTriggers(workflow);

  // 4. Create audit log entry
  await auditLog.create({
    action: 'workflow.activated',
    entity_type: 'workflow',
    entity_id: workflowId,
    user_id: currentUser.id,
    metadata: {
      workflow_name: workflow.name,
      trigger_type: workflow.trigger_type,
      entity_type: workflow.entity_type
    }
  });

  // 5. Optionally process existing records
  if (applyToExisting) {
    await workflowEngine.processExistingRecords(workflow);
  }

  return { success: true, workflow };
}
```

**SQL - Workflow Schema:**

```sql
-- Workflow definition
INSERT INTO workflows (
  id, org_id, name, description, workflow_type, entity_type,
  trigger_event, trigger_conditions, status, created_by
) VALUES (
  gen_random_uuid(),
  'org-uuid',
  'Job Approval - High Value',
  'Requires approval for jobs with bill rate > $100/hr',
  'approval',
  'jobs',
  'record_created',
  '{"conditions": [{"field": "bill_rate", "operator": "gt", "value": 100}]}',
  'active',
  'user-uuid'
);

-- Approval steps
INSERT INTO workflow_steps (
  id, workflow_id, step_order, step_name,
  approver_type, approver_config, timeout_hours, timeout_action
) VALUES
(gen_random_uuid(), 'workflow-uuid', 1, 'Pod Manager Approval',
 'owners_manager', '{}', 24, 'escalate'),
(gen_random_uuid(), 'workflow-uuid', 2, 'Regional Director Approval',
 'role_based', '{"role": "regional_director"}', 24, 'auto_approve');

-- Workflow actions
INSERT INTO workflow_actions (
  id, workflow_id, action_trigger, action_type, action_config
) VALUES
(gen_random_uuid(), 'workflow-uuid', 'on_approval', 'update_field',
 '{"field": "status", "value": "approved"}'),
(gen_random_uuid(), 'workflow-uuid', 'on_approval', 'send_notification',
 '{"recipient": "record_owner", "template": "job_approved"}'),
(gen_random_uuid(), 'workflow-uuid', 'on_rejection', 'update_field',
 '{"field": "status", "value": "rejected"}');
```

**Time:** ~3 seconds

---

### Step 10: Workflow Activated - Success State

**User Action:** None (system confirmation)

**System Response:**
- Success toast notification appears
- User redirected to workflow detail page
- Workflow appears in Active list

**Screen State:**

```
+----------------------------------------------------------+
| ✓ Workflow Activated Successfully                         |
|   "Job Approval - High Value" is now running              |
+----------------------------------------------------------+
| Workflow: Job Approval - High Value              [Active]  |
+----------------------------------------------------------+
| OVERVIEW                                                   |
|                                                            |
| Type: Approval Chain                                       |
| Entity: Jobs                                               |
| Created: Dec 3, 2024 by admin@company.com                 |
| Activated: Dec 3, 2024 at 2:45 PM                         |
| Version: 1                                                 |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| TRIGGER                                                    |
|                                                            |
| When: Job is Created                                       |
| Conditions: Bill Rate > $100/hr                           |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| APPROVAL CHAIN                                             |
|                                                            |
| ┌──────────┐      ┌────────────────────┐                  |
| │ Trigger  │ ───→ │ Step 1:            │                  |
| │ (Create) │      │ Pod Manager        │                  |
| └──────────┘      │ Timeout: 24 hours  │                  |
|                   └─────────┬──────────┘                  |
|                             ↓                              |
|                   ┌────────────────────┐                  |
|                   │ Step 2:            │                  |
|                   │ Regional Director  │                  |
|                   │ Timeout: 24 hours  │                  |
|                   └─────────┬──────────┘                  |
|                             ↓                              |
|              ┌──────────────┴──────────────┐              |
|              ↓                              ↓              |
|        ┌──────────┐                  ┌──────────┐         |
|        │ Approved │                  │ Rejected │         |
|        │ → Status │                  │ → Status │         |
|        │ → Notify │                  │ → Notify │         |
|        └──────────┘                  └──────────┘         |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| EXECUTION HISTORY                               [View All] |
|                                                            |
| No executions yet. Workflow will run on next matching      |
| record creation.                                           |
|                                                            |
+----------------------------------------------------------+
| [Edit (Creates New Version)]  [Disable]  [Delete]         |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Alternative Flows

### Alternative A: Edit Existing Workflow

1. Navigate to Workflows Hub
2. Click "Edit" on existing workflow
3. System creates a new draft version
4. Make changes to draft
5. Test changes
6. Activate new version (deactivates old version)

### Alternative B: Clone Workflow

1. Navigate to Workflows Hub
2. Click "..." menu on workflow → "Clone"
3. System creates copy with name "[Original Name] (Copy)"
4. Edit the cloned workflow
5. Save and activate

### Alternative C: Disable Workflow

1. Navigate to Workflows Hub
2. Click "Disable" on active workflow
3. Confirm in modal
4. Workflow stops processing new triggers
5. In-progress executions continue to completion

### Alternative D: Create Status Automation Workflow

Similar flow but with:
- Single action instead of approval chain
- Field change triggers instead of approvals
- Immediate execution without human intervention

### Alternative E: Create Assignment Rules Workflow

1. Select "Assignment Rules" type
2. Configure trigger (e.g., "Lead Created")
3. Configure assignment strategy:
   - Round Robin (equal distribution)
   - Load Balanced (fewest open records)
   - Territory Based (by geography)
   - Skill Based (by specialization)
4. Configure fallback assignee
5. Test and activate

---

## Postconditions

1. Workflow is saved to database with status 'active' or 'draft'
2. If active, workflow triggers are registered with workflow engine
3. Audit log entry created for workflow creation/activation
4. Workflow appears in Workflows Hub list
5. Users with pending approvals will see tasks in their queue
6. Notifications configured in workflow are ready to send

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Name | Workflow name already exists | "A workflow with this name already exists" | Change workflow name |
| Invalid Conditions | Malformed condition expression | "Invalid condition: [details]" | Fix condition syntax |
| Missing Approver | No valid approver found | "No users match approver criteria" | Select different approver type |
| Circular Reference | Workflow triggers itself | "Workflow cannot trigger itself" | Remove circular trigger |
| Invalid Timeout | Timeout value out of range | "Timeout must be between 1 and 720 hours" | Adjust timeout value |
| No Steps | Approval workflow has no steps | "At least one approval step is required" | Add approval step |
| Template Missing | Email template doesn't exist | "Email template not found" | Select valid template |
| Permission Denied | User lacks workflow permissions | "You don't have permission to create workflows" | Contact admin |
| Feature Disabled | Workflow feature flag is off | "Workflow automation is not enabled" | Enable feature flag |

---

## Workflow Conditions - Operators Reference

| Operator | Code | Description | Applicable Types |
|----------|------|-------------|------------------|
| Equals | `eq` | Exact match | Text, Number, Select |
| Not Equals | `neq` | Not exact match | Text, Number, Select |
| Contains | `contains` | String contains | Text |
| Starts With | `starts_with` | String starts with | Text |
| Ends With | `ends_with` | String ends with | Text |
| Greater Than | `gt` | Number comparison | Number, Currency, Date |
| Less Than | `lt` | Number comparison | Number, Currency, Date |
| Greater Than or Equal | `gte` | Number comparison | Number, Currency, Date |
| Less Than or Equal | `lte` | Number comparison | Number, Currency, Date |
| Between | `between` | Range check | Number, Currency, Date |
| Is Empty | `is_empty` | Field has no value | All types |
| Is Not Empty | `is_not_empty` | Field has value | All types |
| In List | `in` | Value in set | Text, Select |
| Not In List | `not_in` | Value not in set | Text, Select |
| Changed | `changed` | Field value changed | All types |
| Changed To | `changed_to` | Field changed to specific value | All types |
| Changed From | `changed_from` | Field changed from specific value | All types |
| Has Relationship | `has_rel` | Related record exists | Relationship |
| No Relationship | `no_rel` | No related record | Relationship |

---

## Approval Status Tracking

| Status | Code | Description | UI Display |
|--------|------|-------------|------------|
| Pending | `pending` | Awaiting first approval | 🟡 Pending Approval |
| In Review | `in_review` | Currently being reviewed | 🔵 In Review |
| Approved | `approved` | All approvers approved | 🟢 Approved |
| Rejected | `rejected` | Any approver rejected | 🔴 Rejected |
| Escalated | `escalated` | Timeout triggered escalation | 🟠 Escalated |
| Cancelled | `cancelled` | Workflow manually cancelled | ⚫ Cancelled |
| Expired | `expired` | All timeouts expired without action | ⚪ Expired |

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` | Open Command Bar | Any page |
| `g w` | Go to Workflows Hub | Any admin page |
| `n` | New Workflow | Workflows Hub |
| `e` | Edit Selected Workflow | Workflow selected |
| `d` | Duplicate Workflow | Workflow selected |
| `Delete` | Delete Draft Workflow | Draft selected |
| `Cmd+S` | Save Workflow | Workflow Builder |
| `Cmd+Enter` | Save and Activate | Workflow Builder |
| `Cmd+T` | Test Workflow | Workflow Builder |
| `Escape` | Close Modal/Cancel | Any modal |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-WF-001 | Create approval workflow | Admin logged in | Create workflow with 2 approval steps | Workflow created in draft status |
| ADMIN-WF-002 | Activate workflow | Draft workflow exists | Click Activate, confirm | Workflow status changes to active |
| ADMIN-WF-003 | Test workflow dry run | Workflow configured | Click Test, select record | Test results show without changes |
| ADMIN-WF-004 | Workflow triggers on create | Active workflow | Create job with matching conditions | Approval request created |
| ADMIN-WF-005 | Approval timeout escalation | Approval pending | Wait for timeout | Escalates to next approver |
| ADMIN-WF-006 | Duplicate workflow name | Workflow exists | Create with same name | Error: "Name already exists" |
| ADMIN-WF-007 | Disable active workflow | Active workflow | Click Disable, confirm | Workflow stops triggering |
| ADMIN-WF-008 | Clone workflow | Workflow exists | Click Clone | New draft created with "(Copy)" suffix |
| ADMIN-WF-009 | Edit creates new version | Active workflow | Click Edit, modify, save | New version created, old deactivated |
| ADMIN-WF-010 | Delete draft workflow | Draft workflow | Click Delete, confirm | Workflow removed from system |
| ADMIN-WF-011 | Workflow with field automation | - | Create status automation workflow | Status changes automatically on trigger |
| ADMIN-WF-012 | Assignment rules round robin | 3 users in pool | Create 3 leads | Each user gets 1 lead |
| ADMIN-WF-013 | Notification workflow | - | Create notification trigger | Email sent on trigger event |
| ADMIN-WF-014 | SLA escalation workflow | - | Create SLA workflow, let time pass | Escalation notifications sent |
| ADMIN-WF-015 | Invalid condition syntax | - | Enter malformed condition | Validation error shown |

---

## Database Schema Reference

```sql
-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN (
    'approval', 'status_auto', 'notification', 'sla_escalation',
    'field_auto', 'assignment', 'webhook', 'scheduled'
  )),
  entity_type TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'record_created', 'record_updated', 'field_changed',
    'status_changed', 'time_based', 'manual'
  )),
  trigger_conditions JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'disabled', 'archived'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES workflows(id),
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(org_id, name, version)
);

-- Workflow steps (for approval workflows)
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  approver_type TEXT NOT NULL CHECK (approver_type IN (
    'specific_user', 'record_owner', 'owners_manager',
    'role_based', 'pod_manager', 'custom_formula'
  )),
  approver_config JSONB DEFAULT '{}',
  timeout_hours INTEGER,
  timeout_action TEXT CHECK (timeout_action IN (
    'escalate', 'auto_approve', 'auto_reject', 'reminder', 'nothing'
  )),
  reminder_percent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow actions
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  action_trigger TEXT NOT NULL CHECK (action_trigger IN (
    'on_approval', 'on_rejection', 'on_cancellation', 'on_completion'
  )),
  action_order INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'update_field', 'send_notification', 'create_activity',
    'trigger_webhook', 'run_workflow', 'assign_user', 'create_task'
  )),
  action_config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions (runtime tracking)
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_review', 'approved', 'rejected',
    'escalated', 'cancelled', 'expired', 'completed'
  )),
  current_step INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  completion_notes TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Approval records
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES workflow_steps(id),
  approver_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'escalated', 'expired'
  )),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_workflows_org_status ON workflows(org_id, status);
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX idx_workflow_approvals_approver ON workflow_approvals(approver_id, status);
```

---

## UI Component Reference (Mantine v7)

| Context | Component | Props |
|---------|-----------|-------|
| Workflow Card | `<Paper p="md" withBorder>` | shadow="xs", radius="md" |
| Status Badge | `<Badge>` | color varies by status |
| Workflow Builder | `<Stepper>` | orientation="vertical" |
| Condition Builder | `<Group>` + `<Select>` + `<TextInput>` | gap="xs" |
| Approval Step | `<Card withBorder>` | p="md" |
| Test Results | `<Alert>` | color="green" for success |
| Flow Diagram | Custom SVG | In `<Box>` container |
| Add Step Button | `<Button variant="light">` | leftSection={IconPlus} |
| Save Button | `<Button variant="filled">` | color="brand" |
| Disable Button | `<Button variant="outline">` | color="gray" |
| Delete Button | `<Button variant="filled">` | color="red" |

---

## Related Use Cases

- [UC-ADMIN-003](./03-system-settings.md) - System Settings
- [UC-ADMIN-010](./10-email-templates.md) - Email Templates (for notification actions)
- [UC-ADMIN-012](./12-sla-configuration.md) - SLA Configuration (for SLA workflows)
- [UC-ADMIN-013](./13-activity-patterns.md) - Activity Patterns (for activity workflows)
- [UC-ADMIN-008](./08-audit-logs.md) - Audit Logs (workflow execution history)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-03 | Initial documentation - full enterprise spec |

---

*Last Updated: 2025-12-03*
