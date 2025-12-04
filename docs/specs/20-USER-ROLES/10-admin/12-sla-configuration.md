# UC-ADMIN-012: SLA Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-012 |
| Actor | Admin |
| Goal | Configure Service Level Agreements, escalation rules, and time-based alerts |
| Frequency | Monthly (initial setup) + as needed for modifications |
| Estimated Time | 15-45 minutes per SLA rule |
| Priority | MEDIUM |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `sla.create`, `sla.update`, `sla.delete` permissions
3. Organization has SLA feature enabled (feature flag: `sla_management`)
4. Business hours and holiday calendar are configured in Organization Settings
5. At least one entity type exists (Jobs, Candidates, Submissions, etc.)

---

## Trigger

- Admin clicks "SLA Config" in the Admin sidebar under SYSTEM section
- Admin clicks "+ New SLA Rule" button on SLA Dashboard
- Admin navigates directly to `/employee/admin/sla`
- Admin uses keyboard shortcut `g s` from any admin page
- System alert indicates SLA breach requiring attention

---

## SLA Categories

| Category | Code | Description | Typical Targets | Applies To |
|----------|------|-------------|-----------------|------------|
| Response Time | `response_time` | Time to first response after inquiry | 4 business hours | Leads, Candidates |
| Submission Speed | `submission_speed` | Time from job creation to first submission | 48 business hours | Jobs |
| Interview Scheduling | `interview_schedule` | Time to schedule interview after client request | 24 business hours | Submissions |
| Interview Feedback | `interview_feedback` | Time to receive feedback after interview | 48 hours | Interviews |
| Offer Response | `offer_response` | Time to respond to candidate offer | 24 hours | Offers |
| Onboarding Completion | `onboarding` | Time to complete all onboarding tasks | 3 business days | Placements |
| Client Communication | `client_touch` | Maximum time between client touchpoints | 7 calendar days | Accounts |
| Candidate Follow-up | `candidate_followup` | Time to follow up with active candidates | 5 business days | Candidates |
| Document Collection | `document_collection` | Time to collect required documents | 5 business days | Placements |
| Timesheet Approval | `timesheet_approval` | Time to approve submitted timesheets | 24 hours | Timesheets |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to SLA Dashboard

**User Action:** Click "SLA Config" in Admin sidebar under SYSTEM section

**System Response:**
- URL changes to: `/employee/admin/sla`
- Page title displays: "SLA Configuration"
- SLA rules list loads with existing rules
- Summary stats show: Active (8), Warning (2), Breached (1)
- SLA Health meter displays overall compliance percentage

**Screen State:**

```
+------------------------------------------------------------------+
| SLA Configuration                              [+ New SLA Rule]   |
+------------------------------------------------------------------+
| OVERALL SLA HEALTH                                                |
| ┌──────────────────────────────────────────────────────────────┐ |
| │  [████████████████████░░░░] 87% Compliance This Month        │ |
| │                                                               │ |
| │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │ |
| │  │   8    │  │   2    │  │   1    │  │  156   │             │ |
| │  │ Active │  │Warning │  │Breached│  │ Events │             │ |
| │  │ Rules  │  │ Today  │  │ Today  │  │This Wk │             │ |
| │  └────────┘  └────────┘  └────────┘  └────────┘             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [Search SLA rules...]              [Category ▼] [Status ▼]       |
+------------------------------------------------------------------+
| ACTIVE SLA RULES                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟢 First Submission within 48 Hours                          │ |
| │    Category: Submission Speed | Entity: Jobs                  │ |
| │    Target: 48 business hours | Compliance: 94%                │ |
| │    Last 7 days: ✓ 47 met | ⚠ 2 warning | ✗ 1 breach         │ |
| │    [Edit]  [View Report]  [Disable]                          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟢 Interview Scheduling within 24 Hours                      │ |
| │    Category: Interview Scheduling | Entity: Submissions       │ |
| │    Target: 24 business hours | Compliance: 98%                │ |
| │    Last 7 days: ✓ 28 met | ⚠ 0 warning | ✗ 0 breach         │ |
| │    [Edit]  [View Report]  [Disable]                          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟡 Client Touchpoint Every 7 Days                            │ |
| │    Category: Client Communication | Entity: Accounts          │ |
| │    Target: 7 calendar days | Compliance: 82%                  │ |
| │    Last 7 days: ✓ 41 met | ⚠ 8 warning | ✗ 3 breach         │ |
| │    [Edit]  [View Report]  [Disable]                          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🔴 Lead Response within 4 Hours                              │ |
| │    Category: Response Time | Entity: Leads                    │ |
| │    Target: 4 business hours | Compliance: 71%                 │ |
| │    Last 7 days: ✓ 12 met | ⚠ 3 warning | ✗ 5 breach         │ |
| │    [Edit]  [View Report]  [Disable]                          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
| [View Breach Report]  [Export SLA Data]  [SLA Analytics →]       |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds (page load)

---

### Step 2: Click New SLA Rule

**User Action:** Click "+ New SLA Rule" button

**System Response:**
- Modal opens with SLA Rule Builder form
- First section "Rule Definition" is active
- Category dropdown is focused
- Form is in "Create" mode

**Screen State:**

```
+------------------------------------------------------------------+
| Create SLA Rule                                         [× Close] |
+------------------------------------------------------------------+
| RULE DEFINITION                                                   |
|                                                                   |
| Rule Name *                                                       |
| [                                                            ]    |
| ℹ Give your SLA rule a descriptive name                          |
|                                                                   |
| Category *                                                        |
| [Select category...                                          ▼]  |
| Options: Response Time, Submission Speed, Interview Scheduling,  |
|          Offer Response, Onboarding, Client Communication...     |
|                                                                   |
| Description                                                       |
| [                                                            ]    |
| [                                                            ]    |
| ℹ Describe when and why this SLA applies                         |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| APPLIES TO                                                        |
|                                                                   |
| Entity Type *                                                     |
| [Select entity...                                            ▼]  |
| Options: Jobs, Candidates, Submissions, Leads, Accounts,         |
|          Placements, Interviews, Offers                          |
|                                                                   |
| Apply When (Optional Conditions)                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ No conditions - applies to all [Entity Type] records         │ |
| │                                                               │ |
| │ [+ Add Condition]                                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
|                                              [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Time:** ~1 second (modal open)

---

### Step 3: Define Rule Details

**User Action:** Enter rule name, select category, select entity type

**System Response:**
- Field validation runs on blur
- Category selection shows relevant time unit options
- Entity selection updates condition field options
- Progress indicator shows Step 1 of 4

**Field Specification: Rule Name**

| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | Text Input |
| Label | "Rule Name" |
| Placeholder | "e.g., First Submission within 48 Hours" |
| Required | Yes |
| Min Length | 5 characters |
| Max Length | 100 characters |
| Validation | Alphanumeric with spaces, hyphens, parentheses |
| Error Messages | |
| - Empty | "Rule name is required" |
| - Too short | "Rule name must be at least 5 characters" |
| - Invalid chars | "Rule name contains invalid characters" |
| - Duplicate | "A rule with this name already exists" |

**Field Specification: Category**

| Property | Value |
|----------|-------|
| Field Name | `category` |
| Type | Select (searchable) |
| Label | "Category" |
| Required | Yes |
| Options | See SLA Categories table above |
| Default | None |
| Error Messages | |
| - Empty | "Please select an SLA category" |

**Field Specification: Entity Type**

| Property | Value |
|----------|-------|
| Field Name | `entity_type` |
| Type | Select |
| Label | "Entity Type" |
| Required | Yes |
| Options | jobs, candidates, submissions, leads, accounts, placements, interviews, offers |
| Default | None |
| Dependencies | Updates available condition fields |
| Error Messages | |
| - Empty | "Please select an entity type" |

**Time:** ~15 seconds

---

### Step 4: Configure Time Calculation

**User Action:** Click "Next" to proceed to Time Calculation section

**System Response:**
- Form advances to Time Calculation section
- Start/End event dropdowns populate based on entity type
- Business hours toggle defaults to organization settings
- Preview section shows sample calculation

**Screen State:**

```
+------------------------------------------------------------------+
| Create SLA Rule                                         [× Close] |
+------------------------------------------------------------------+
| Step 2 of 4: Time Calculation                                     |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| MEASUREMENT PERIOD                                                |
|                                                                   |
| Start Time: When does the clock start? *                         |
| [Job Created                                                 ▼]  |
| Options: Job Created, Job Activated, Job Assigned,               |
|          First Candidate Added, Status Changed To...             |
|                                                                   |
| End Time: When is the SLA considered met? *                      |
| [First Submission Created                                    ▼]  |
| Options: First Submission Created, Submission Sent to Client,    |
|          Interview Scheduled, Offer Extended...                  |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| TARGET DURATION                                                   |
|                                                                   |
| Target Time *                                                     |
| [48        ] [Business Hours                                 ▼]  |
|              Options: Minutes, Hours, Business Hours,            |
|                       Days, Business Days, Weeks                 |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| BUSINESS HOURS SETTINGS                                           |
|                                                                   |
| ● Use organization business hours (9:00 AM - 5:00 PM EST)        |
| ○ Use custom business hours for this rule                        |
|                                                                   |
| When using business hours:                                        |
| ☑ Exclude weekends                                               |
| ☑ Exclude holidays (from Holiday Calendar)                       |
| ☐ Pause timer when entity is in "On Hold" status                 |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| PREVIEW                                                           |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Example: Job created Monday 4:00 PM                          │ |
| │                                                               │ |
| │ Mon 4:00 PM → Tue 5:00 PM = 9 business hours                 │ |
| │ Tue 9:00 AM → Wed 5:00 PM = 16 business hours (25 total)     │ |
| │ Wed 9:00 AM → Thu 5:00 PM = 16 business hours (41 total)     │ |
| │ Thu 9:00 AM → Thu 4:00 PM = 7 business hours (48 total)      │ |
| │                                                               │ |
| │ ✓ SLA Deadline: Thursday 4:00 PM                             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
|                                    [← Back]  [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Field Specification: Target Time Value**

| Property | Value |
|----------|-------|
| Field Name | `target_value` |
| Type | Number Input |
| Label | "Target Time" |
| Required | Yes |
| Min Value | 1 |
| Max Value | 9999 |
| Default | 48 |
| Validation | Positive integer |
| Error Messages | |
| - Empty | "Target time is required" |
| - Invalid | "Please enter a valid number" |
| - Out of range | "Target must be between 1 and 9999" |

**Field Specification: Target Time Unit**

| Property | Value |
|----------|-------|
| Field Name | `target_unit` |
| Type | Select |
| Label | "Time Unit" |
| Required | Yes |
| Options | minutes, hours, business_hours, days, business_days, weeks |
| Default | business_hours |
| Dependencies | Affects calculation preview |

**Time:** ~20 seconds

---

### Step 5: Configure Escalation Levels

**User Action:** Click "Next" to proceed to Escalation Levels section

**System Response:**
- Form advances to Escalation Levels section
- Three default escalation levels are shown
- Each level has percentage, notification, and action settings
- Add/remove level buttons are available

**Screen State:**

```
+------------------------------------------------------------------+
| Create SLA Rule                                         [× Close] |
+------------------------------------------------------------------+
| Step 3 of 4: Escalation Levels                                    |
|                                                                   |
| Configure alerts and actions at different stages of the SLA      |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| LEVEL 1: WARNING (approaching deadline)                           |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Trigger at: [75   ] % of target time ([36] business hours)   │ |
| │                                                               │ |
| │ Notifications:                                                │ |
| │ ☑ Send email to: [Record Owner                          ▼]  │ |
| │ ☑ Show warning badge on record (yellow)                      │ |
| │ ☐ Send Slack notification to: [#recruiting              ▼]  │ |
| │ ☐ Send SMS alert to: [Record Owner                      ▼]  │ |
| │                                                               │ |
| │ Actions:                                                      │ |
| │ ☐ Add to "At Risk" dashboard widget                          │ |
| │ ☐ Create follow-up task for owner                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| LEVEL 2: BREACH (deadline passed)                                 |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Trigger at: [100  ] % of target time ([48] business hours)   │ |
| │                                                               │ |
| │ Notifications:                                                │ |
| │ ☑ Send email to: [Record Owner + Manager                ▼]  │ |
| │ ☑ Show breach badge on record (red)                          │ |
| │ ☑ Add to SLA Breach Report                                   │ |
| │ ☐ Send Slack notification to: [#management              ▼]  │ |
| │                                                               │ |
| │ Actions:                                                      │ |
| │ ☑ Add to "Breached" dashboard widget                         │ |
| │ ☐ Escalate ownership to: [Pod Manager                   ▼]  │ |
| │ ☐ Block further actions until resolved                       │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| LEVEL 3: CRITICAL (severely overdue)                              |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Trigger at: [150  ] % of target time ([72] business hours)   │ |
| │                                                               │ |
| │ Notifications:                                                │ |
| │ ☑ Send email to: [Regional Director                     ▼]  │ |
| │ ☑ Add to Executive Dashboard                                 │ |
| │ ☑ Send Slack notification to: [#leadership              ▼]  │ |
| │                                                               │ |
| │ Actions:                                                      │ |
| │ ☑ Require resolution notes before closing                    │ |
| │ ☑ Flag for performance review                                │ |
| │ ☐ Auto-reassign to: [Senior Team Member                ▼]   │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [+ Add Escalation Level]                                         |
|                                                                   |
+------------------------------------------------------------------+
|                                    [← Back]  [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Field Specification: Escalation Trigger Percentage**

| Property | Value |
|----------|-------|
| Field Name | `escalation_levels[n].trigger_percentage` |
| Type | Number Input |
| Label | "Trigger at" |
| Required | Yes (for each level) |
| Min Value | 1 |
| Max Value | 500 |
| Default | Level 1: 75, Level 2: 100, Level 3: 150 |
| Validation | Must be greater than previous level |
| Error Messages | |
| - Empty | "Trigger percentage is required" |
| - Invalid | "Trigger must be greater than previous level" |
| - Out of range | "Trigger must be between 1% and 500%" |

**Field Specification: Notification Recipients**

| Property | Value |
|----------|-------|
| Field Name | `escalation_levels[n].notify_recipients` |
| Type | Multi-select |
| Label | "Send email to" |
| Required | At least one per level |
| Options | Record Owner, Record Owner's Manager, Pod Manager, Regional Director, Specific User(s), Distribution List |
| Default | Level 1: Owner, Level 2: Owner + Manager, Level 3: Director |

**Time:** ~45 seconds

---

### Step 6: Review and Activate

**User Action:** Click "Next" to proceed to Review section

**System Response:**
- Form advances to Review section
- Complete summary of SLA rule is displayed
- Test Rule button is available
- Save options: Save as Draft or Activate

**Screen State:**

```
+------------------------------------------------------------------+
| Create SLA Rule                                         [× Close] |
+------------------------------------------------------------------+
| Step 4 of 4: Review & Activate                                    |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| RULE SUMMARY                                                      |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Rule Name: First Submission within 48 Hours                  │ |
| │ Category: Submission Speed                                   │ |
| │ Entity: Jobs                                                 │ |
| │                                                               │ |
| │ Measurement:                                                 │ |
| │   Start: Job Created                                         │ |
| │   End: First Submission Created                              │ |
| │   Target: 48 Business Hours                                  │ |
| │                                                               │ |
| │ Business Hours: 9:00 AM - 5:00 PM (Organization Default)     │ |
| │   Excludes: Weekends, Holidays                               │ |
| │                                                               │ |
| │ Escalation Levels:                                           │ |
| │   ⚠ Warning at 75% (36 hrs): Email owner, show badge        │ |
| │   🔴 Breach at 100% (48 hrs): Email owner+mgr, add report   │ |
| │   🚨 Critical at 150% (72 hrs): Email director, exec dash   │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| TEST RULE                                                         |
|                                                                   |
| Test this rule against existing records to preview behavior:     |
|                                                                   |
| [Test Against Last 7 Days]  [Test Against Sample Record]         |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| ACTIVATION                                                        |
|                                                                   |
| ○ Save as Draft (rule will not run until activated)              |
| ● Activate Immediately (rule will start monitoring new records)  |
|                                                                   |
| ☐ Apply to existing records (retroactively check open records)   |
|   ⚠ This may generate immediate breach notifications             |
|                                                                   |
+------------------------------------------------------------------+
|                         [← Back]  [Cancel]  [Save Draft]  [Save]  |
+------------------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 7: Test Rule (Optional)

**User Action:** Click "Test Against Last 7 Days" button

**System Response:**
- System queries last 7 days of entity records
- Calculates SLA status for each record
- Displays test results summary
- Shows example records that would be flagged

**Screen State:**

```
+------------------------------------------------------------------+
| Test Results: First Submission within 48 Hours                    |
+------------------------------------------------------------------+
| Testing against Jobs created in last 7 days (50 records)         |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ RESULTS SUMMARY                                              │ |
| │                                                               │ |
| │ ✓ Met SLA: 47 jobs (94%)                                     │ |
| │ ⚠ Would trigger Warning: 2 jobs (4%)                         │ |
| │ 🔴 Would trigger Breach: 1 job (2%)                          │ |
| │ 🚨 Would trigger Critical: 0 jobs (0%)                       │ |
| │                                                               │ |
| │ Projected Compliance Rate: 94%                               │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| SAMPLE RECORDS                                                    |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Job #1234 - Senior Java Developer                            │ |
| │   Created: Mon Dec 2, 2:00 PM                                │ |
| │   First Submission: Wed Dec 4, 10:30 AM                      │ |
| │   Elapsed: 34.5 business hours                               │ |
| │   Status: ✓ Met SLA                                          │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Job #1235 - DevOps Engineer                                  │ |
| │   Created: Tue Dec 3, 9:00 AM                                │ |
| │   First Submission: (none yet)                               │ |
| │   Elapsed: 52 business hours                                 │ |
| │   Status: 🔴 Would Breach (4 hours overdue)                  │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Job #1236 - React Developer                                  │ |
| │   Created: Wed Dec 4, 3:00 PM                                │ |
| │   First Submission: (none yet)                               │ |
| │   Elapsed: 38 business hours                                 │ |
| │   Status: ⚠ Would trigger Warning                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
|                                              [Close]  [Activate]  |
+------------------------------------------------------------------+
```

**Time:** ~5 seconds (query execution)

---

### Step 8: Save and Activate Rule

**User Action:** Click "Save" button with "Activate Immediately" selected

**System Response:**
- Rule is validated
- Rule is saved to database
- Rule status set to "active"
- Background job starts monitoring
- Success toast notification appears
- Modal closes
- SLA list refreshes with new rule

**Backend Processing:**

```typescript
// SLA Rule Creation
async function createSLARule(input: CreateSLARuleInput): Promise<SLARule> {
  // 1. Validate rule configuration
  validateSLARule(input);

  // 2. Check for duplicate rule names
  const existing = await db.sla_rules.findFirst({
    where: { org_id: input.org_id, name: input.name }
  });
  if (existing) throw new Error('Rule name already exists');

  // 3. Create rule record
  const rule = await db.sla_rules.create({
    data: {
      id: generateUUID(),
      org_id: input.org_id,
      name: input.name,
      category: input.category,
      description: input.description,
      entity_type: input.entity_type,
      start_event: input.start_event,
      end_event: input.end_event,
      target_value: input.target_value,
      target_unit: input.target_unit,
      use_business_hours: input.use_business_hours,
      exclude_weekends: input.exclude_weekends,
      exclude_holidays: input.exclude_holidays,
      conditions: input.conditions,
      status: input.activate ? 'active' : 'draft',
      created_by: input.user_id,
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  // 4. Create escalation levels
  for (const level of input.escalation_levels) {
    await db.sla_escalation_levels.create({
      data: {
        id: generateUUID(),
        sla_rule_id: rule.id,
        level_number: level.level_number,
        trigger_percentage: level.trigger_percentage,
        notify_recipients: level.notify_recipients,
        notify_slack_channel: level.notify_slack_channel,
        actions: level.actions,
        created_at: new Date()
      }
    });
  }

  // 5. If activated, start monitoring
  if (input.activate) {
    await eventBus.publish('sla.rule.activated', {
      rule_id: rule.id,
      apply_retroactive: input.apply_retroactive
    });
  }

  // 6. Create audit log
  await auditLog.create({
    action: 'sla_rule.created',
    entity_type: 'sla_rules',
    entity_id: rule.id,
    user_id: input.user_id,
    new_values: rule
  });

  return rule;
}
```

```sql
-- Insert SLA Rule
INSERT INTO sla_rules (
  id, org_id, name, category, description, entity_type,
  start_event, end_event, target_value, target_unit,
  use_business_hours, exclude_weekends, exclude_holidays,
  conditions, status, created_by, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8, $9, $10,
  $11, $12, $13,
  $14, $15, $16, NOW(), NOW()
);

-- Insert Escalation Levels
INSERT INTO sla_escalation_levels (
  id, sla_rule_id, level_number, trigger_percentage,
  notify_recipients, notify_slack_channel, actions, created_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, NOW()
);
```

**Success Message:**
- Toast: "SLA Rule Created" (green, 4 seconds)
- Subtitle: "First Submission within 48 Hours is now active"

**Time:** ~2 seconds

---

## Alternative Flows

### Alternative A: Edit Existing SLA Rule

1. Admin clicks "Edit" on existing rule card
2. System loads rule configuration into editor
3. Admin modifies settings (same flow as create)
4. System validates changes
5. If rule is active, system shows impact preview
6. Admin confirms changes
7. System updates rule and restarts monitoring

### Alternative B: Duplicate Rule

1. Admin clicks "More" → "Duplicate" on rule card
2. System creates copy with "(Copy)" suffix
3. Editor opens with duplicated settings
4. Admin modifies as needed
5. Saves as new rule

### Alternative C: Import SLA Rules

1. Admin clicks "Import Rules" from overflow menu
2. System shows file upload dialog
3. Admin uploads JSON/CSV file
4. System validates and previews rules
5. Admin confirms import
6. Rules are created (inactive by default)

### Alternative D: Bulk Enable/Disable

1. Admin selects multiple rules via checkboxes
2. Admin clicks "Bulk Actions" → "Disable Selected"
3. Confirmation dialog shows impact
4. Admin confirms
5. Selected rules are disabled

---

## Postconditions

1. SLA rule is saved to database with all configuration
2. Escalation levels are linked to rule
3. If activated, background monitoring job is running
4. Rule appears in SLA Dashboard list
5. Audit log entry is created
6. New records matching rule will be tracked
7. If retroactive, existing records are evaluated

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Name | Rule name already exists | "A rule with this name already exists. Please choose a different name." | Edit name field |
| Invalid Percentage | Escalation level percentage <= previous | "Escalation level 2 must be greater than level 1 (75%)" | Fix percentage values |
| Missing Required | Required field empty | "[Field] is required" | Fill in required field |
| Invalid Time Range | End event before start event | "End event cannot occur before start event" | Swap start/end events |
| No Recipients | Escalation level has no notification recipients | "At least one notification recipient is required for each level" | Add recipient |
| Business Hours Conflict | Custom hours overlap or invalid | "Business hours end time must be after start time" | Fix time range |
| Permission Denied | User lacks sla.create permission | "You don't have permission to create SLA rules" | Contact admin |
| Feature Disabled | SLA feature flag is off | "SLA Management is not enabled for your organization" | Enable feature flag |
| Database Error | Connection or constraint failure | "Unable to save SLA rule. Please try again." | Retry or contact support |

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `g s` | Any admin page | Go to SLA Configuration |
| `n` | SLA list | New SLA Rule |
| `e` | Rule focused | Edit selected rule |
| `d` | Rule focused | Disable/Enable toggle |
| `t` | Rule editor | Test rule |
| `Ctrl+S` / `Cmd+S` | Rule editor | Save rule |
| `Escape` | Rule editor | Close modal (with confirmation if dirty) |
| `/` | SLA list | Focus search field |
| `?` | Any | Show keyboard shortcuts |

---

## SLA Monitoring Background Job

```typescript
// Runs every 15 minutes
async function checkSLACompliance(): Promise<void> {
  // 1. Get all active SLA rules
  const rules = await db.sla_rules.findMany({
    where: { status: 'active' },
    include: { escalation_levels: true }
  });

  for (const rule of rules) {
    // 2. Find records that haven't met SLA yet
    const pendingRecords = await findPendingRecords(rule);

    for (const record of pendingRecords) {
      // 3. Calculate elapsed time
      const elapsed = calculateBusinessTime(
        record[rule.start_event],
        new Date(),
        rule
      );

      // 4. Check escalation levels
      const targetMinutes = convertToMinutes(rule.target_value, rule.target_unit);
      const percentage = (elapsed / targetMinutes) * 100;

      for (const level of rule.escalation_levels) {
        if (percentage >= level.trigger_percentage) {
          // Check if already notified for this level
          const alreadyNotified = await checkNotificationSent(
            record.id,
            rule.id,
            level.level_number
          );

          if (!alreadyNotified) {
            await triggerEscalation(record, rule, level);
          }
        }
      }

      // 5. Update SLA status on record
      await updateSLAStatus(record.id, rule.id, {
        elapsed_time: elapsed,
        target_time: targetMinutes,
        percentage: percentage,
        current_level: getCurrentLevel(percentage, rule.escalation_levels)
      });
    }
  }
}
```

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-SLA-001 | Create SLA rule - happy path | Admin logged in | 1. Click + New SLA 2. Fill all required fields 3. Add escalation levels 4. Save | Rule created, appears in list |
| ADMIN-SLA-002 | Create SLA rule - duplicate name | Rule "Test SLA" exists | 1. Create new rule 2. Name it "Test SLA" 3. Save | Error: "Rule name already exists" |
| ADMIN-SLA-003 | Create SLA rule - test mode | Admin logged in | 1. Create rule 2. Click Test Against Last 7 Days | Test results show projected compliance |
| ADMIN-SLA-004 | Edit active SLA rule | Active rule exists | 1. Click Edit 2. Change target from 48 to 72 hours 3. Save | Rule updated, monitoring continues |
| ADMIN-SLA-005 | Disable SLA rule | Active rule with pending records | 1. Click Disable 2. Confirm | Rule disabled, badges removed from records |
| ADMIN-SLA-006 | SLA warning triggered | Job at 76% of target | Background job runs | Owner receives warning email, yellow badge appears |
| ADMIN-SLA-007 | SLA breach triggered | Job at 101% of target | Background job runs | Owner+Manager receive email, red badge, added to report |
| ADMIN-SLA-008 | SLA met before deadline | Submission created at 40 hours | Background job runs | Record marked as "Met SLA", no notifications |
| ADMIN-SLA-009 | Delete SLA rule | Draft rule exists | 1. Click Delete 2. Confirm | Rule deleted, removed from list |
| ADMIN-SLA-010 | Business hours calculation | Job created Friday 4 PM | Wait until Monday | Only 1 hour counted (4-5 PM Friday) |
| ADMIN-SLA-011 | Holiday exclusion | Holiday calendar configured | Job created day before holiday | Holiday hours not counted toward SLA |
| ADMIN-SLA-012 | Retroactive activation | 10 jobs open without SLA | 1. Create rule 2. Check "Apply retroactive" 3. Activate | All 10 jobs evaluated, notifications sent if breached |
| ADMIN-SLA-013 | Escalation level validation | Creating rule | 1. Set Level 1 to 100% 2. Set Level 2 to 75% 3. Save | Error: "Level 2 must be greater than Level 1" |
| ADMIN-SLA-014 | View SLA report | Active rules with breaches | 1. Click View Breach Report | Report shows all breached records grouped by rule |
| ADMIN-SLA-015 | Export SLA data | Active rules exist | 1. Click Export SLA Data 2. Select date range 3. Download | CSV file with all SLA events and statuses |

---

## Database Schema Reference

```sql
-- SLA Rules Table
CREATE TABLE sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  start_event TEXT NOT NULL,
  end_event TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  target_unit TEXT NOT NULL CHECK (target_unit IN (
    'minutes', 'hours', 'business_hours', 'days', 'business_days', 'weeks'
  )),
  use_business_hours BOOLEAN DEFAULT true,
  exclude_weekends BOOLEAN DEFAULT true,
  exclude_holidays BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'disabled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name)
);

-- SLA Escalation Levels
CREATE TABLE sla_escalation_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_rule_id UUID NOT NULL REFERENCES sla_rules(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  trigger_percentage INTEGER NOT NULL,
  notify_recipients TEXT[] DEFAULT '{}',
  notify_slack_channel TEXT,
  notify_sms BOOLEAN DEFAULT false,
  actions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sla_rule_id, level_number)
);

-- SLA Events (tracking individual record SLA status)
CREATE TABLE sla_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sla_rule_id UUID NOT NULL REFERENCES sla_rules(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_deadline TIMESTAMPTZ NOT NULL,
  elapsed_minutes INTEGER,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'warning', 'breach', 'critical', 'met', 'cancelled'
  )),
  current_level INTEGER DEFAULT 0,
  met_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA Notifications (audit of sent notifications)
CREATE TABLE sla_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_event_id UUID NOT NULL REFERENCES sla_events(id),
  escalation_level INTEGER NOT NULL,
  notification_type TEXT NOT NULL, -- email, slack, sms
  recipients TEXT[] NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  message_id TEXT -- external message ID for tracking
);

-- Indexes for performance
CREATE INDEX idx_sla_rules_org_status ON sla_rules(org_id, status);
CREATE INDEX idx_sla_events_entity ON sla_events(entity_type, entity_id);
CREATE INDEX idx_sla_events_status ON sla_events(org_id, status) WHERE status IN ('pending', 'warning', 'breach');
CREATE INDEX idx_sla_events_deadline ON sla_events(target_deadline) WHERE status = 'pending';
```

---

## Related Use Cases

- [UC-ADMIN-009: Workflow Configuration](./09-workflow-configuration.md) - Workflows can trigger SLA rules
- [UC-ADMIN-010: Email Templates](./10-email-templates.md) - SLA notifications use email templates
- [UC-ADMIN-015: Organization Settings](./15-organization-settings.md) - Business hours and holidays
- [UC-ADMIN-008: Audit Logs](./08-audit-logs.md) - SLA events are logged
- [UC-ADMIN-007: Integration Management](./07-integration-management.md) - Slack notifications

---

## UI Design System Reference

### Colors
- Warning badge: `--mantine-color-gold-6` (#FFD700)
- Breach badge: `--mantine-color-rust-6` (#E07A5F)
- Critical badge: `--mantine-color-red-7`
- Met SLA: `--mantine-color-green-6`
- Primary actions: `--mantine-color-brand-6` (#2D5016)

### Components
- Rule cards: `<Paper p="md" withBorder>`
- Stats grid: `<SimpleGrid cols={4}>`
- Progress bar: `<Progress>` with segments
- Escalation levels: `<Accordion>` with `<Stepper>` visual
- Form: `<Modal size="lg">` with `<Stepper>` navigation

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-04 | Initial documentation |
