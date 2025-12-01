# Use Case: Update Job

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-014 |
| Actor | Technical Recruiter, Recruiting Manager |
| Goal | Update job requisition details while preserving integrity and tracking changes |
| Frequency | 5-10 times per week |
| Estimated Time | 2-10 minutes |
| Priority | High (Core workflow) |

---

## Preconditions

1. User is logged in as Technical Recruiter or Recruiting Manager
2. Job exists in the system
3. User is the owner (R), accountable (A), or has Manager+ permissions
4. User has "job.update" permission
5. Job is not in "cancelled" or "closed" status

---

## Trigger

One of the following:
- Client requested changes to job requirements
- Rate range adjusted based on market feedback
- Job location or remote policy changed
- Additional skills or requirements identified
- Client contact information updated
- Priority escalation needed
- Typo or error correction

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Job Detail

**User Action:** Click on job from Jobs list

**System Response:**
- Job detail view opens
- Current job information displayed
- "Edit" button visible in header (if user has permissions)

**Screen State:**
```
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                   [⋮]  |
| [ACTIVE] 🟢                          Updated 2 days ago  |
+----------------------------------------------------------+
| RACI: R: John Smith  A: Sarah Jones (Manager)             |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Submissions] [Activity] [Files]   |
+----------------------------------------------------------+
| [Add Candidate] [Share Job] [Edit] [Put On Hold] [⋮]    |
+----------------------------------------------------------+
| Job Details                                               |
| 📍 New York, NY (Hybrid - 3 days/week)                   |
| 💰 $85-95/hr  📅 Target Fill: Jan 15, 2025               |
| 👤 Positions: 1  🔥 Priority: High                       |
|                                                           |
| Skills: Java, Spring Boot, AWS, Microservices            |
| Experience: 5-10 years                                    |
| Visa: US Citizen, Green Card, H1B                        |
|                                                           |
| Pipeline: 12 sourced, 5 submitted, 2 interview           |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Open Edit Mode

**User Action:** Click "Edit" button

**System Response:**
- Edit modal opens OR page switches to edit mode (based on implementation)
- All editable fields become active
- Current values pre-filled
- Save/Cancel buttons appear

**Screen State:**
```
+----------------------------------------------------------+
|                          Edit Job                     [×] |
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                         |
| Status: Active  |  Created: Nov 15, 2025                  |
| ⚠️ 5 candidates submitted - changes may impact pipeline  |
+----------------------------------------------------------+
| [Basic Info] [Requirements] [Compensation] [Details]     |
+----------------------------------------------------------+
| Job Title *                                               |
| [Senior Java Developer                              ]    |
|                                                   25/200  |
|                                                           |
| Client Account *                                          |
| [Acme Corp (Technology)                            ▼]    |
|                                                           |
| Location                                                  |
| [New York, NY                                       ]    |
| ☑ Remote  ☑ Hybrid ([3] days/week in office)            |
|                                                           |
| Priority *                                                |
| [High                                              ▼]    |
|                                                           |
+----------------------------------------------------------+
| ℹ️ Changes will be logged and stakeholders notified      |
|                                                           |
|                    [Cancel]  [Save Changes]              |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Review What Can Be Changed

**Editable Fields (Always):**
- Job title
- Location / Remote status
- Description
- Required skills / Nice-to-have skills
- Experience range
- Visa requirements
- Target fill date / Target start date
- Internal notes
- Priority / Urgency

**Editable Fields (With Warnings):**
- Bill rate range (if submissions exist)
- Positions count (if submissions exist)
- Job type (if submissions exist)

**Non-Editable Fields:**
- Client account (use Transfer instead)
- Job ID
- Creation date / Created by
- Status (use separate status actions)

**Restricted Fields (Require Approval):**
- Bill rate range (if > 10% change and submissions exist)
- Positions count (if decreasing and submissions exist)

---

### Step 4: Make Changes

**Scenario: Update Rate Range**

**User Action:** Navigate to "Compensation" tab

**Screen State:**
```
+----------------------------------------------------------+
|                          Edit Job                     [×] |
| [Basic Info] [Requirements] [Compensation] [Details]     |
+----------------------------------------------------------+
| Bill Rate Range *                                         |
| Min: [$85     ] /hr    Max: [$95     ] /hr              |
|                                                           |
| ⚠️ Warning: 5 candidates already submitted               |
| Changing rates may require re-negotiation with client    |
|                                                           |
| Rate Change Reason *                                      |
| [Market rate adjustment based on client feedback     ]   |
| [                                               ] 15/200  |
|                                                           |
| ☐ Notify all submitted candidates                        |
| ☐ Require manager approval for this change               |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Change rate from "$85-95" to "$90-100"

**System Response:**
- Validates new rates
- Calculates % change: 5.9% increase
- Shows warning (>5% change)
- Requires change reason

**Field Specification: Rate Change Reason**
| Property | Value |
|----------|-------|
| Field Name | `changeReason` |
| Type | Textarea |
| Label | "Rate Change Reason" |
| Required | Yes (if rate change > 5%) |
| Max Length | 200 characters |
| Visibility | Internal only |

**Time:** ~2 minutes

---

**Scenario: Add/Remove Skills**

**User Action:** Navigate to "Requirements" tab

**Screen State:**
```
+----------------------------------------------------------+
|                          Edit Job                     [×] |
| [Basic Info] [Requirements] [Compensation] [Details]     |
+----------------------------------------------------------+
| Required Skills *                                         |
| [+ Add skill                                           ]  |
| [Java] [×]  [Spring Boot] [×]  [AWS] [×]                |
| [Microservices] [×]                                      |
|                                                           |
| Nice-to-Have Skills                                       |
| [+ Add skill                                           ]  |
| [Kubernetes] [×]  [Docker] [×]                          |
|                                                           |
| Experience Range                                          |
| Min: [5  ] years    Max: [10 ] years                     |
|                                                           |
| Job Description                                           |
| [                                                      ]  |
| [We are seeking a Senior Java Developer...            ]  |
| [                                                      ]  |
| [                                               ] 245/5000|
+----------------------------------------------------------+
```

**User Action:** Add "Kafka" to required skills, add "Python" to nice-to-have

**System Response:**
- Skills added to tag list
- No warning (additive change)
- Character count updates

**Time:** ~1 minute

---

**Scenario: Change Priority**

**User Action:** Change priority from "High" to "Urgent"

**System Response:**
- Priority updated
- Shows notification: "Changing to Urgent will trigger immediate escalation alerts"

**User Action:** Confirm change

**System Response:**
- Priority changed
- Activity logged
- Notifications queued for RACI stakeholders

**Time:** ~30 seconds

---

### Step 5: Review Changes Summary

**User Action:** Click "Save Changes" button

**System Response:** Shows change summary modal before saving

**Screen State:**
```
+----------------------------------------------------------+
|                    Confirm Changes                    [×] |
+----------------------------------------------------------+
| You are about to update this job:                         |
|                                                           |
| Senior Java Developer @ Acme Corp                         |
| Status: Active  |  5 submissions  |  2 in interview      |
+----------------------------------------------------------+
| Changes Summary:                                          |
|                                                           |
| Bill Rate Range                                           |
| ❌ Old: $85-95/hr                                         |
| ✅ New: $90-100/hr                                        |
| Change: +5.9% increase                                    |
| Reason: Market rate adjustment based on client feedback  |
|                                                           |
| Required Skills                                           |
| ✅ Added: Kafka                                           |
|                                                           |
| Nice-to-Have Skills                                       |
| ✅ Added: Python                                          |
|                                                           |
| Priority                                                  |
| ❌ Old: High                                              |
| ✅ New: Urgent                                            |
|                                                           |
+----------------------------------------------------------+
| Impact Assessment:                                        |
| ⚠️ 5 submitted candidates may need rate re-negotiation   |
| ℹ️ Priority change will trigger escalation notifications  |
| ℹ️ All RACI stakeholders will be notified                |
|                                                           |
| Version History:                                          |
| This will be version 4 of this job                       |
| [View Change History]                                    |
|                                                           |
+----------------------------------------------------------+
|                    [Go Back]  [Confirm & Save ✓]         |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 6: Save Changes

**User Action:** Click "Confirm & Save ✓" button

**System Response:**

1. **Button shows loading state** (spinner)
   - Text: "Saving..."

2. **API Call:** `POST /api/trpc/jobs.update`

3. **Backend Processing:**
   - Create version snapshot of current job
   - Update job record with new values
   - Log changes in job_change_history table
   - Create activity entries for each change
   - Send notifications to RACI stakeholders
   - Update related submissions if needed

4. **On Success:**
   - Modal closes (300ms animation)
   - Toast notification: "Job updated successfully" ✓ (green)
   - Job detail refreshes with new values
   - "Updated just now" timestamp shown
   - Change history updated

5. **On Error:**
   - Modal stays open
   - Error toast: "Failed to update job: {error message}"
   - User can retry or cancel

**Screen State After Success:**
```
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                   [⋮]  |
| [ACTIVE] 🟢                           Updated just now   |
+----------------------------------------------------------+
| ✓ Job updated successfully                               |
| Changes: Rate +5.9%, Added skills, Priority escalated    |
+----------------------------------------------------------+
| Job Details                                               |
| 📍 New York, NY (Hybrid - 3 days/week)                   |
| 💰 $90-100/hr ⬆️  📅 Target Fill: Jan 15, 2025          |
| 👤 Positions: 1  🔥 Priority: Urgent ⬆️                 |
|                                                           |
| Skills: Java, Spring Boot, AWS, Microservices, Kafka     |
| Nice-to-have: Kubernetes, Docker, Python                 |
| Experience: 5-10 years                                    |
| Visa: US Citizen, Green Card, H1B                        |
+----------------------------------------------------------+
```

**Time:** ~2-3 seconds

---

## Postconditions

1. ✅ Job record updated with new values
2. ✅ `updatedAt` timestamp set
3. ✅ `updatedBy` = current user ID
4. ✅ Version snapshot created in `job_versions` table
5. ✅ Changes logged in `job_change_history` table
6. ✅ Activity entries created for each field changed
7. ✅ Notifications sent to RACI stakeholders
8. ✅ If rate changed: Related submissions flagged for review
9. ✅ If priority changed: Escalation alerts triggered
10. ✅ Search index updated (if applicable)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job.updated` | `{ job_id, updated_by, updated_at, fields_changed: [...] }` |
| `job.field_changed` | `{ job_id, field: 'rateMin', old_value, new_value, reason }` (per field) |
| `job.version_created` | `{ job_id, version: 4, snapshot_id }` |
| `notification.sent` | `{ type: 'job_updated', recipient_id, channel, sent_at }` (per recipient) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Invalid field value | "{Field} is invalid: {reason}" | Correct field value |
| Permission Denied | User not R or A | "You don't have permission to edit this job" | Request approval |
| Job Closed | Job status = closed/cancelled | "Cannot edit a closed job" | Reopen job first |
| Concurrent Edit | Another user editing | "This job was updated by {user}. Please refresh." | Refresh and retry |
| Rate Limit | Too many updates | "Please wait before making more changes" | Wait 30 seconds |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Approval Required | Major change without approval | "This change requires manager approval" | Submit for approval |

---

## Validation Rules

### Field-Level Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Title | Min 3, Max 200 characters | "Job title must be 3-200 characters" |
| Rate Min | > 0, <= Rate Max | "Min rate must be positive and <= max rate" |
| Rate Max | >= Rate Min | "Max rate must be >= min rate" |
| Required Skills | Min 1 skill | "At least one required skill is needed" |
| Experience Range | Min <= Max | "Min experience must be <= max experience" |
| Positions Count | >= 1 | "At least 1 position required" |

### Change-Level Validation

| Change Type | Rule | Warning/Error |
|-------------|------|---------------|
| Rate Decrease > 10% | With submissions | Warning: "Large rate decrease may impact submitted candidates" |
| Rate Increase > 20% | With submissions | Warning: "Large rate increase requires client approval" |
| Reduce Positions | With submissions >= new count | Error: "Cannot reduce positions below submitted count" |
| Change Account | Always | Error: "Use Transfer Job to change client" |
| Remove Required Skill | With submissions | Warning: "Removing skill may invalidate submitted candidates" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+E` | Edit job (from detail view) |
| `Cmd+S` | Save changes (in edit mode) |
| `Esc` | Cancel edit (with confirmation) |
| `Tab` | Navigate fields |

---

## Alternative Flows

### A1: Edit Requiring Manager Approval

**If change > threshold (e.g., >10% rate change):**

**At Step 6:**

1. Instead of immediate save, shows approval modal
2. User submits change for approval
3. Job status: Active → Active (Pending Changes)
4. Manager receives approval request
5. Manager reviews changes
6. If approved: Changes applied, notifications sent
7. If rejected: Job reverts, user notified

**Screen State:**
```
+----------------------------------------------------------+
|                 Approval Required                     [×] |
+----------------------------------------------------------+
| These changes require manager approval:                   |
|                                                           |
| Bill Rate Range: $85-95/hr → $90-100/hr (+5.9%)         |
|                                                           |
| Reason: Market rate adjustment based on client feedback  |
|                                                           |
| Approver: Sarah Jones (Pod Manager)                      |
|                                                           |
| Note to Approver (optional):                             |
| [Client requested this rate increase after initial    ]  |
| [market feedback. Competitors offering higher rates.  ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Submit for Approval]           |
+----------------------------------------------------------+
```

### A2: Bulk Edit Multiple Jobs

**From Jobs List:**

1. User selects multiple jobs (checkboxes)
2. Clicks "Bulk Edit" action
3. Modal shows common editable fields
4. User makes changes (e.g., update priority for all)
5. Confirms bulk update
6. System updates all selected jobs
7. Individual change logs for each job

**Supported Bulk Edit Fields:**
- Priority
- Urgency
- Target fill date
- Add skill (to all)
- Change RACI assignment

### A3: Edit via Quick Actions

**From Job Card (List View):**

1. User hovers over job card
2. Quick edit icons appear:
   - 🔥 Change priority
   - 📅 Change dates
   - 💰 Update rates
3. Clicks icon, inline editor opens
4. Makes change directly in list
5. Auto-saves on blur/enter

### A4: Edit with AI Assistance

**For Description Field:**

1. User clicks "AI Improve" button
2. AI analyzes current description
3. Suggests improvements:
   - Grammar/spelling fixes
   - Better formatting
   - Add missing details
   - Make more compelling
4. User reviews suggestions
5. Accepts/rejects changes
6. Saves updated description

---

## Version History & Change Tracking

### Version Snapshot

Every time job is updated, create version snapshot:

**Table: job_versions**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `job_id` | UUID | FK → jobs.id |
| `version` | INT | Auto-increment per job |
| `snapshot` | JSONB | Complete job data at this version |
| `created_at` | TIMESTAMP | When version created |
| `created_by` | UUID | Who made changes |

**Example Snapshot:**
```json
{
  "version": 4,
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Java Developer",
  "rateMin": "85.00",
  "rateMax": "95.00",
  "requiredSkills": ["Java", "Spring Boot", "AWS", "Microservices"],
  "priority": "high",
  "status": "active",
  "snapshotAt": "2025-11-30T14:23:45Z"
}
```

### Change History

Track individual field changes:

**Table: job_change_history**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `job_id` | UUID | FK → jobs.id |
| `version` | INT | Version number |
| `field` | VARCHAR(100) | Field name changed |
| `old_value` | TEXT | Previous value (JSON if complex) |
| `new_value` | TEXT | New value (JSON if complex) |
| `change_reason` | TEXT | Why changed |
| `changed_at` | TIMESTAMP | When changed |
| `changed_by` | UUID | FK → user_profiles.id |

**Example Change Record:**
```json
{
  "field": "rateMin",
  "old_value": "85.00",
  "new_value": "90.00",
  "change_reason": "Market rate adjustment based on client feedback",
  "changed_at": "2025-11-30T14:23:45Z",
  "changed_by": "user-123"
}
```

### Change History UI

**Screen State:**
```
+----------------------------------------------------------+
|                    Change History                         |
| Senior Java Developer @ Acme Corp                         |
+----------------------------------------------------------+
| Version 4 - Nov 30, 2025 2:23 PM by John Smith           |
| ┌─────────────────────────────────────────────────────┐  |
| │ 💰 Rate Min: $85/hr → $90/hr (+5.9%)                │  |
| │    Reason: Market rate adjustment                   │  |
| │                                                     │  |
| │ 💰 Rate Max: $95/hr → $100/hr (+5.3%)              │  |
| │    Reason: Market rate adjustment                   │  |
| │                                                     │  |
| │ 🔧 Required Skills: Added Kafka                     │  |
| │                                                     │  |
| │ 🔥 Priority: High → Urgent                          │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Version 3 - Nov 28, 2025 10:15 AM by Sarah Jones         |
| ┌─────────────────────────────────────────────────────┐  |
| │ 📍 Location: New York, NY → New York, NY (Hybrid)   │  |
| │ 🏠 Hybrid Days: N/A → 3 days/week                   │  |
| │    Reason: Client updated remote policy             │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Version 2 - Nov 25, 2025 3:45 PM by John Smith           |
| ┌─────────────────────────────────────────────────────┐  |
| │ 📝 Description: Updated with detailed requirements  │  |
| │ 🔧 Required Skills: Added Microservices             │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Version 1 - Nov 15, 2025 9:00 AM by John Smith           |
| ┌─────────────────────────────────────────────────────┐  |
| │ 🆕 Job Created                                       │  |
| └─────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
| [Export History]  [Restore Version]  [Compare Versions]  |
+----------------------------------------------------------+
```

**Actions:**
- **Export History:** Download CSV/PDF of all changes
- **Restore Version:** Revert to previous version (with confirmation)
- **Compare Versions:** Side-by-side diff view

---

## Impact on Active Submissions

### When Job Changes Affect Submissions

| Change Type | Impact | System Action |
|-------------|--------|---------------|
| **Rate Increased** | Positive, may allow higher candidate pay | Flag submissions for optional rate re-negotiation |
| **Rate Decreased** | Negative, may need lower candidate pay | Flag submissions as "Requires Review", notify R + A |
| **Required Skill Added** | May disqualify candidates | Flag submissions that don't have new skill |
| **Required Skill Removed** | Positive, opens pool | No action needed |
| **Positions Increased** | Positive, more openings | Notify team, reactivate sourcing |
| **Positions Decreased** | May close pipeline early | Flag submissions beyond new count |
| **Location Changed** | May affect candidate willingness | Flag submissions, notify candidates |
| **Remote Policy Changed** | May affect candidate fit | Flag submissions, notify candidates |

### Submission Flag UI

**When submission flagged for review:**

```
+----------------------------------------------------------+
| John Smith → Senior Java Developer @ Acme Corp           |
+----------------------------------------------------------+
| ⚠️ Job Updated - Review Required                         |
|                                                           |
| Changes that may affect this submission:                  |
| • Bill rate decreased from $85-95/hr to $80-90/hr        |
|   Current submission: $90/hr bill rate                   |
|   Action needed: Re-negotiate with client or candidate   |
|                                                           |
| • Required skill added: Kafka                            |
|   Candidate skills: Java, Spring Boot, AWS (no Kafka)   |
|   Action needed: Verify if candidate has Kafka exp      |
|                                                           |
| [Dismiss]  [Review Now]  [Contact Candidate]            |
+----------------------------------------------------------+
```

---

## RACI Assignments

| Action | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Initiate Edit | Job Owner (Recruiter) | - | - | - |
| Make Changes | Job Owner | - | - | - |
| Review Impact | Job Owner | - | Pod Manager | - |
| Approve (if required) | - | Pod Manager | Regional Director | - |
| Save Changes | System | Job Owner | - | - |
| Notify Stakeholders | System | - | - | All RACI |
| Update Submissions | System | Job Owner | - | Affected Candidates |

---

## Notifications

### Email: Job Updated (to RACI stakeholders)

**Subject Line:**
```
[Job Updated] {jobTitle} @ {accountName} - Changes by {updaterName}
```

**Template Variables:**
| Variable | Source | Example |
|----------|--------|---------|
| `jobTitle` | job.title | "Senior Java Developer" |
| `accountName` | account.name | "Acme Corp" |
| `updaterName` | user.firstName + lastName | "John Smith" |
| `updatedAt` | job.updatedAt | "Nov 30, 2025 2:23 PM" |
| `jobUrl` | Job detail URL | "https://app.intime.com/jobs/123" |
| `changesSummary` | Generated from changes | List of changes |
| `impactNote` | If submissions affected | Warning message |

**Email Body Template:**

```html
Hi {recipientName},

A job has been updated that you are tracking:

**Job:** {jobTitle} @ {accountName}
**Updated by:** {updaterName}
**Updated at:** {updatedAt}

**Changes Made:**
{changesSummary}

{if impactNote}
**⚠️ Impact on Active Pipeline:**
{impactNote}
{/if}

[View Job Details]({jobUrl})

---
Automated notification from InTime OS
```

### Push Notification (to R and A if major change)

**Title:** "Job Updated: {jobTitle}"
**Body:** "{changesSummary}"
**Action:** Open job detail page

---

## Metrics & Analytics

### Update Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Update Frequency** | Avg updates per job | `COUNT(updates) / COUNT(jobs)` |
| **Common Changes** | Most frequently changed fields | `COUNT(changes) GROUP BY field` |
| **Change Velocity** | Updates over time | `COUNT(updates) per week/month` |
| **Impact Rate** | % of updates affecting submissions | `(updates with submission impact / total updates) * 100` |

### Field Change Analytics

| Field | Avg Changes per Job | Most Common Reason |
|-------|---------------------|--------------------|
| Priority | 1.2 | Client urgency increased |
| Rate Range | 0.8 | Market adjustment |
| Skills | 2.3 | Requirements clarification |
| Description | 1.5 | More details added |
| Target Date | 1.1 | Timeline adjustment |

---

## Business Rules

### BR-01: Edit Permissions

- User MUST be Responsible (R) OR Accountable (A) in RACI
- OR User MUST have "job.update.any" permission (Manager+)
- User MUST have "job.update" base permission
- Cannot edit if job status = Cancelled or Closed

### BR-02: Approval Requirements

- Rate change > 10%: Requires Manager (A) approval
- Reduce positions (if submissions >= new count): Requires Manager approval
- Change job type: Requires Manager approval
- All other fields: No approval needed

### BR-03: Version Control

- Create version snapshot on EVERY save
- Version number auto-increments per job
- Keep all versions indefinitely (for compliance)
- Allow restore to any previous version (with approval)

### BR-04: Change Tracking

- Log EVERY field change individually
- Require change reason for:
  - Rate changes > 5%
  - Reducing positions
  - Removing required skills
- Changes logged with timestamp + user + reason

### BR-05: Submission Impact

- If rate decreased AND submissions exist: Flag all submissions
- If required skill added: Flag submissions without that skill
- If positions decreased: Flag submissions beyond new count
- Notify affected candidates (if client allows)

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Edit job with all valid changes | Job updated successfully, version created |
| TC-002 | Edit with missing required field | Error: "{Field} is required" |
| TC-003 | Edit as non-RACI user | Error: "Permission denied" |
| TC-004 | Edit closed job | Error: "Cannot edit closed job" |
| TC-005 | Decrease rate > 10% with submissions | Requires approval, submissions flagged |
| TC-006 | Add required skill | Submissions without skill flagged |
| TC-007 | Concurrent edit by two users | Second user sees conflict warning |
| TC-008 | Edit with network error | Error toast, can retry |
| TC-009 | Cancel edit mid-changes | Confirmation prompt, no changes saved |
| TC-010 | View change history | All versions displayed correctly |
| TC-011 | Restore previous version | Job reverted, new version created |
| TC-012 | Bulk edit multiple jobs | All jobs updated, individual logs |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/jobs.ts`
**Procedure:** `jobs.update`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const updateJobInput = z.object({
  jobId: z.string().uuid(),

  // Fields to update (all optional)
  title: z.string().min(3).max(200).optional(),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().optional(),
  hybridDays: z.number().int().min(1).max(5).optional(),

  requiredSkills: z.array(z.string()).min(1).max(20).optional(),
  niceToHaveSkills: z.array(z.string()).max(20).optional(),

  minExperienceYears: z.number().int().min(0).max(50).optional(),
  maxExperienceYears: z.number().int().min(0).max(50).optional(),

  visaRequirements: z.array(z.enum([
    'us_citizen', 'green_card', 'h1b', 'l1', 'opt', 'tn', 'any'
  ])).optional(),

  description: z.string().max(5000).optional(),

  rateMin: z.number().positive().multipleOf(0.01).optional(),
  rateMax: z.number().positive().multipleOf(0.01).optional(),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),

  positionsCount: z.number().int().min(1).max(100).optional(),

  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  targetFillDate: z.date().optional(),
  targetStartDate: z.date().optional(),

  internalNotes: z.string().max(2000).optional(),

  // Change metadata
  changeReason: z.string().max(200).optional(), // Required for major changes
  requestApproval: z.boolean().optional().default(false),
});

export type UpdateJobInput = z.infer<typeof updateJobInput>;
```

### Output Schema

```typescript
export const updateJobOutput = z.object({
  jobId: z.string().uuid(),
  version: z.number().int(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
  changesCount: z.number().int(),
  requiresApproval: z.boolean(),
  submissionsImpacted: z.number().int().optional(),
});

export type UpdateJobOutput = z.infer<typeof updateJobOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Fetch current job
   const job = await db.query.jobs.findFirst({
     where: eq(jobs.id, input.jobId),
     with: {
       raciAssignments: true,
       submissions: true,
     },
   });

   if (!job) throw new TRPCError({ code: 'NOT_FOUND' });

   // Check permissions
   const canEdit = checkEditPermission(ctx.userId, job);
   if (!canEdit) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate status
   if (job.status === 'cancelled' || job.status === 'closed') {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Cannot edit a closed or cancelled job',
     });
   }
   ```

2. **Detect Changes & Calculate Impact** (~100ms)

   ```typescript
   const changes = [];
   const majorChanges = [];

   // Compare each field
   for (const [field, newValue] of Object.entries(input)) {
     if (field === 'jobId' || field === 'changeReason') continue;

     const oldValue = job[field];
     if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
       changes.push({
         field,
         oldValue,
         newValue,
         changeType: detectChangeType(field, oldValue, newValue),
       });

       // Check if major change
       if (isMajorChange(field, oldValue, newValue, job.submissions.length)) {
         majorChanges.push({ field, oldValue, newValue });
       }
     }
   }

   // Require approval for major changes
   const requiresApproval = majorChanges.length > 0 && !ctx.user.isManager;
   ```

3. **Create Version Snapshot** (~100ms)

   ```typescript
   const currentVersion = await db.query.jobVersions.count({
     where: eq(jobVersions.jobId, input.jobId),
   });

   const newVersion = currentVersion + 1;

   await db.insert(jobVersions).values({
     id: randomUUID(),
     jobId: input.jobId,
     version: newVersion,
     snapshot: job, // JSONB snapshot of current state
     createdAt: new Date(),
     createdBy: ctx.userId,
   });
   ```

4. **Update Job Record** (~100ms)

   ```typescript
   const updateData = {
     ...input,
     updatedAt: new Date(),
     updatedBy: ctx.userId,
   };

   delete updateData.jobId;
   delete updateData.changeReason;
   delete updateData.requestApproval;

   await db.update(jobs)
     .set(updateData)
     .where(eq(jobs.id, input.jobId));
   ```

5. **Log Change History** (~50ms per change)

   ```typescript
   for (const change of changes) {
     await db.insert(jobChangeHistory).values({
       id: randomUUID(),
       jobId: input.jobId,
       version: newVersion,
       field: change.field,
       oldValue: JSON.stringify(change.oldValue),
       newValue: JSON.stringify(change.newValue),
       changeReason: input.changeReason,
       changedAt: new Date(),
       changedBy: ctx.userId,
     });
   }
   ```

6. **Flag Impacted Submissions** (~100ms)

   ```typescript
   let submissionsImpacted = 0;

   for (const submission of job.submissions) {
     const impactReasons = [];

     // Check rate change
     if (changes.find(c => c.field === 'rateMin' || c.field === 'rateMax')) {
       if (submission.billRate > input.rateMax || submission.billRate < input.rateMin) {
         impactReasons.push('Rate out of new range');
       }
     }

     // Check skill additions
     const skillChange = changes.find(c => c.field === 'requiredSkills');
     if (skillChange) {
       const addedSkills = skillChange.newValue.filter(s => !skillChange.oldValue.includes(s));
       for (const skill of addedSkills) {
         if (!submission.candidate.skills.includes(skill)) {
           impactReasons.push(`Missing new required skill: ${skill}`);
         }
       }
     }

     if (impactReasons.length > 0) {
       await db.update(submissions)
         .set({
           requiresReview: true,
           reviewReason: impactReasons.join('; '),
           updatedAt: new Date(),
         })
         .where(eq(submissions.id, submission.id));

       submissionsImpacted++;
     }
   }
   ```

7. **Create Activity Entries** (~50ms)

   ```typescript
   await db.insert(activities).values({
     id: randomUUID(),
     orgId: job.orgId,
     entityType: 'job',
     entityId: input.jobId,
     activityType: 'updated',
     description: `Job updated: ${changes.length} change(s)`,
     metadata: {
       version: newVersion,
       changes: changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`),
       submissionsImpacted,
     },
     createdBy: ctx.userId,
     createdAt: new Date(),
   });
   ```

8. **Send Notifications** (~200ms)

   ```typescript
   const raciUsers = await getRACIUsers(input.jobId);

   const changesSummary = changes.map(c =>
     `${c.field}: ${c.oldValue} → ${c.newValue}`
   ).join('\n');

   // Notify RACI stakeholders
   await sendNotifications({
     type: 'job_updated',
     job,
     changesSummary,
     submissionsImpacted,
     recipients: [
       ...raciUsers.responsible,
       ...raciUsers.accountable,
       ...raciUsers.consulted,
       ...raciUsers.informed,
     ],
   });
   ```

**Total Processing Time:** ~800-1200ms

---

## Database Schema Reference

### Table: job_versions

```sql
CREATE TABLE job_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL, -- Complete job data at this version
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES user_profiles(id),

  UNIQUE(job_id, version)
);

CREATE INDEX idx_job_versions_job ON job_versions(job_id, version DESC);
```

### Table: job_change_history

```sql
CREATE TABLE job_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  version INT NOT NULL,
  field VARCHAR(100) NOT NULL, -- Field name that changed
  old_value TEXT, -- Previous value (JSON if complex)
  new_value TEXT, -- New value (JSON if complex)
  change_reason TEXT, -- Why changed
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  changed_by UUID NOT NULL REFERENCES user_profiles(id)
);

CREATE INDEX idx_job_change_history_job ON job_change_history(job_id, changed_at DESC);
CREATE INDEX idx_job_change_history_field ON job_change_history(field);
```

---

## Accessibility

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Full keyboard support, focus management |
| Screen Reader | Field labels, change announcements |
| Color Contrast | Change indicators meet 4.5:1 ratio |
| Focus Indicators | Clear focus states on all fields |
| Error Messages | Associated with fields via aria-describedby |

---

## Mobile Considerations

### Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile (< 640px) | Full-screen edit mode, vertical tabs |
| Tablet (640-1024px) | Modal with tabbed sections |
| Desktop (> 1024px) | Side panel or modal edit |

---

*Last Updated: 2025-11-30*
