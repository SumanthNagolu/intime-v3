# Use Case: Close Job

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-015 |
| Actor | Technical Recruiter, Recruiting Manager |
| Goal | Close a job requisition when no longer needed or all positions filled |
| Frequency | 2-4 times per week |
| Estimated Time | 2-5 minutes |
| Priority | High (Critical lifecycle transition) |

---

## Preconditions

1. User is logged in as Technical Recruiter or Recruiting Manager
2. Job exists in the system
3. User is the owner (R), accountable (A), or has Manager+ permissions
4. User has "job.close" permission
5. Job is in "active", "on_hold", or "filled" status

---

## Trigger

One of the following:
- All positions successfully filled
- Client cancelled the requirement
- Position put on indefinite hold
- Budget cut or headcount freeze
- Requirement no longer valid

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Job Detail

**User Action:** Click on job from Jobs list

**System Response:**
- Job detail view opens
- Current job status displayed
- "Close Job" option visible in actions menu (⋮)

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
|                                                           |
| Dropdown Menu:                                            |
| ┌────────────────────────┐                               |
| │ Transfer Ownership     │                               |
| │ Clone Job              │                               |
| │ Export Details         │                               |
| │ ────────────────────── │                               |
| │ Close Job             │                               |
| └────────────────────────┘                               |
+----------------------------------------------------------+
| Pipeline Summary:                                         |
| Sourced: 12  |  Submitted: 5  |  Interview: 2  |  Placed: 0|
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Initiate Job Closure

**User Action:** Click "Close Job" from actions menu (⋮)

**System Response:**
- Close Job modal opens
- System displays closure wizard
- Active pipeline summary shown

**Screen State:**
```
+----------------------------------------------------------+
|                        Close Job                      [×] |
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                         |
| Status: Active  |  Created: Nov 15, 2025                  |
+----------------------------------------------------------+
| Step 1 of 3: Select Closure Reason                        |
|                                                           |
| Why are you closing this job? *                          |
|                                                           |
| ● Filled - All positions filled                          |
| ○ Cancelled by Client                                    |
| ○ On Hold Indefinitely                                   |
| ○ Budget Cut / Headcount Freeze                          |
| ○ Requirement Changed / Invalid                          |
| ○ Duplicate Requisition                                  |
| ○ Other                                                  |
|                                                           |
| {if "Filled" selected}                                   |
| ┌─────────────────────────────────────────────────────┐  |
| │ ✓ Great! You filled this position                   │  |
| │                                                     │  |
| │ Positions Filled: [1] / 1                           │  |
| │                                                     │  |
| │ Which candidates were placed?                       │  |
| │ ☑ John Smith (Placed on Nov 28, 2025)              │  |
| │ ☐ Sarah Johnson (not yet marked as placed)         │  |
| └─────────────────────────────────────────────────────┘  |
| {/if}                                                    |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Pipeline →]   |
+----------------------------------------------------------+
```

**Field Specification: Closure Reason**
| Property | Value |
|----------|-------|
| Field Name | `closureReason` |
| Type | Radio Button Group |
| Label | "Why are you closing this job?" |
| Required | Yes |
| Options | |
| - `filled` | "Filled - All positions filled" |
| - `cancelled_client` | "Cancelled by Client" |
| - `on_hold_indefinite` | "On Hold Indefinitely" |
| - `budget_cut` | "Budget Cut / Headcount Freeze" |
| - `requirement_changed` | "Requirement Changed / Invalid" |
| - `duplicate` | "Duplicate Requisition" |
| - `other` | "Other" |

**Time:** ~30 seconds

---

### Step 3: Handle Active Pipeline

**User Action:** Click "Next: Pipeline →"

**System Response:**
- Validates closure reason selected
- Advances to Step 2
- Shows impact on active submissions

**Screen State:**
```
+----------------------------------------------------------+
|                        Close Job                      [×] |
+----------------------------------------------------------+
| Step 2 of 3: Handle Active Pipeline                       |
|                                                           |
| You have 5 active submissions that will be affected:      |
|                                                           |
| ┌─────────────────────────────────────────────────────┐  |
| │ Status         | Count | Action Required            │  |
| ├─────────────────────────────────────────────────────┤  |
| │ Sourced        | 12    | Auto-withdraw              │  |
| │ Screening      | 3     | Auto-withdraw              │  |
| │ Submitted      | 3     | Choose action below        │  |
| │ Interview      | 2     | Choose action below        │  |
| │ Offer Pending  | 0     | -                          │  |
| │ Placed         | 1     | Keep (archived)            │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| What should happen to submitted/interview candidates?     |
|                                                           |
| ○ Withdraw All - Job no longer available                 |
| ● Keep Active - Transfer to similar job (if available)   |
| ○ Manual Review - I will handle each individually        |
|                                                           |
| {if "Keep Active" selected}                              |
| Transfer candidates to:                                   |
| [Similar Jobs Matching Skills...                    ▼]   |
| • Senior Java Developer @ TechCo ($90-100/hr)           |
| • Java Developer @ StartupXYZ ($85-95/hr)               |
| • Lead Java Engineer @ BigCorp ($100-120/hr)            |
| {/if}                                                    |
|                                                           |
| Notify affected candidates?                              |
| ☑ Send email notification to all affected candidates    |
|                                                           |
+----------------------------------------------------------+
|                    [← Back]  [Next: Summary →]           |
+----------------------------------------------------------+
```

**Field Specification: Submission Action**
| Property | Value |
|----------|-------|
| Field Name | `submissionAction` |
| Type | Radio Button Group |
| Label | "What should happen to submitted/interview candidates?" |
| Required | Yes (if submissions exist) |
| Options | |
| - `withdraw` | "Withdraw All - Job no longer available" |
| - `transfer` | "Keep Active - Transfer to similar job" |
| - `manual` | "Manual Review - I will handle each individually" |

**Field Specification: Transfer Target**
| Property | Value |
|----------|-------|
| Field Name | `transferJobId` |
| Type | Searchable Dropdown |
| Label | "Transfer candidates to" |
| Required | Yes (if "transfer" selected) |
| Data Source | Jobs WHERE status='active' AND similar skills |
| Visible | Only if submissionAction = 'transfer' |

**Time:** ~1-2 minutes

---

### Step 4: Review Closure Summary

**User Action:** Click "Next: Summary →"

**System Response:**
- Shows comprehensive closure summary
- Calculates metrics for this job
- Lists all actions that will be taken

**Screen State:**
```
+----------------------------------------------------------+
|                        Close Job                      [×] |
+----------------------------------------------------------+
| Step 3 of 3: Review & Confirm Closure                     |
|                                                           |
| Senior Java Developer @ Acme Corp                         |
+----------------------------------------------------------+
| Closure Details:                                          |
| • Reason: Filled - All positions filled ✓                |
| • Positions Filled: 1 / 1                                |
| • Placed Candidate: John Smith                           |
| • Closure Date: Nov 30, 2025                             |
+----------------------------------------------------------+
| Pipeline Actions:                                         |
| • 12 Sourced candidates → Withdrawn                      |
| • 3 Screening candidates → Withdrawn                     |
| • 3 Submitted candidates → Transferred to "Senior Java..." |
| • 2 Interview candidates → Transferred to "Senior Java..." |
| • 1 Placed candidate → Archived (kept)                   |
|                                                           |
| ☑ Notify 20 candidates via email                         |
| ☑ Notify RACI stakeholders                               |
| ☑ Remove from active job boards                          |
+----------------------------------------------------------+
| Job Performance Summary:                                  |
|                                                           |
| 📊 Time to Fill: 15 days (Target: 30 days) ✓            |
| 📈 Candidates Sourced: 21                                |
| 📤 Candidates Submitted: 6                               |
| 🎯 Fill Rate: 100% (1/1 positions)                       |
| 💰 Placement Revenue: $8,400/month                       |
|                                                           |
| This data will be archived and included in reports.      |
+----------------------------------------------------------+
| Closure Note (optional)                                   |
| [Great collaboration with client. Quick fill!         ]  |
| [                                               ] 45/500  |
|                                                           |
+----------------------------------------------------------+
|                    [← Back]  [Close Job ✓]               |
+----------------------------------------------------------+
```

**Field Specification: Closure Note**
| Property | Value |
|----------|-------|
| Field Name | `closureNote` |
| Type | Textarea |
| Label | "Closure Note" |
| Placeholder | "Any notes about this job closure..." |
| Required | No |
| Max Length | 500 characters |
| Visibility | Internal only |

**Time:** ~1 minute

---

### Step 5: Execute Closure

**User Action:** Click "Close Job ✓" button

**System Response:**

1. **Button shows loading state** (spinner)
   - Text: "Closing job..."

2. **API Call:** `POST /api/trpc/jobs.close`

3. **Backend Processing:**
   - Update job status to appropriate closed status
   - Set `closedAt` timestamp
   - Set `closedBy` to current user
   - Calculate final metrics (time-to-fill, fill rate, etc.)
   - Process pipeline actions:
     - Withdraw sourced/screening candidates
     - Transfer or withdraw submitted/interview candidates
     - Archive placed candidates
   - Remove from active job boards
   - Send notifications to candidates
   - Send notifications to RACI stakeholders
   - Create activity log entries
   - Archive job data

4. **On Success:**
   - Modal closes (300ms animation)
   - Toast notification: "Job closed successfully" ✓ (green)
   - Redirect to Jobs list OR show closed job view
   - Status badge changes to "Closed" or "Filled" (gray or blue)
   - Job removed from active jobs list

5. **On Error:**
   - Modal stays open
   - Error toast: "Failed to close job: {error message}"
   - User can retry or cancel

**Screen State After Success (Closed Job View):**
```
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                   [⋮]  |
| [FILLED] 🔵                          Closed Nov 30, 2025 |
+----------------------------------------------------------+
| RACI: R: John Smith  A: Sarah Jones (Manager)             |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Submissions] [Activity] [Files]   |
+----------------------------------------------------------+
| ✓ Job closed successfully                                |
| Closed on Nov 30, 2025 by John Smith                     |
| Reason: Filled - All positions filled                    |
+----------------------------------------------------------+
| Final Performance:                                        |
| ┌─────────────────────────────────────────────────────┐  |
| │ 📊 Time to Fill: 15 days (50% faster than target)   │  |
| │ 📈 Candidates Sourced: 21                            │  |
| │ 📤 Candidates Submitted: 6 (29% conversion)          │  |
| │ 🎯 Placement Success: 1/1 (100%)                     │  |
| │ 💰 Placement Revenue: $8,400/month                   │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Placed Candidate:                                         |
| 👤 John Smith - Start Date: Dec 5, 2025                  |
|                                                           |
| [Reopen Job]  [Clone Job]  [View Report]  [Export]      |
+----------------------------------------------------------+
```

**Time:** ~3-5 seconds

---

## Postconditions

1. ✅ Job status updated to closed state:
   - `filled` if reason = filled
   - `cancelled` if reason = cancelled_client, budget_cut, etc.
   - `closed` for other reasons
2. ✅ `closedAt` timestamp set
3. ✅ `closedBy` = current user ID
4. ✅ `closureReason` stored
5. ✅ Final metrics calculated and stored
6. ✅ Active submissions processed:
   - Withdrawn OR
   - Transferred to another job OR
   - Flagged for manual review
7. ✅ Notifications sent to:
   - Affected candidates (if enabled)
   - RACI stakeholders
   - Team members
8. ✅ Job board postings removed
9. ✅ Activity logged: "job.closed"
10. ✅ Job archived (moved to closed jobs view)
11. ✅ SLA tracking ended
12. ✅ Final reports generated

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job.status_changed` | `{ job_id, old_status: 'active', new_status: 'filled', changed_by, changed_at }` |
| `job.closed` | `{ job_id, closure_reason, closed_by, closed_at, closure_note }` |
| `job.metrics_finalized` | `{ job_id, time_to_fill, fill_rate, sourced_count, submitted_count, placement_revenue }` |
| `submission.status_changed` | `{ submission_id, old_status, new_status: 'withdrawn', reason: 'job_closed' }` (per submission) |
| `submission.transferred` | `{ submission_id, from_job_id, to_job_id }` (if transferred) |
| `notification.sent` | `{ type: 'job_closed', recipient_id, channel, sent_at }` (per recipient) |
| `job_board.removed` | `{ job_id, board, removed_at }` (per board) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Permission Denied | User not R or A | "You don't have permission to close this job" | Request approval |
| Already Closed | Job already closed | "This job is already closed" | Refresh page |
| Active Placements | Placements not yet marked | "Please mark placements before closing" | Update placements |
| Pending Approvals | Submissions awaiting approval | "Cannot close with pending approvals" | Resolve approvals first |
| Transfer Job Not Found | Selected transfer job deleted | "Transfer job no longer available" | Select different job |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Job Board Removal Failed | Integration error | "Job closed but board removal failed: {board}" | Manual removal needed |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modal |
| `Enter` | Next step / Confirm (when focused) |
| `Tab` | Navigate fields |
| `Shift+Tab` | Navigate backwards |

---

## Alternative Flows

### A1: Close Due to "Filled" with Multiple Positions

**If job has `positionsCount > 1`:**

**At Step 1:**

1. System checks placements vs. positions
2. If placements < positions:
   - Shows warning: "Not all positions filled ({placed}/{total})"
   - Offers options:
     - "Close anyway (partial fill)"
     - "Keep open for remaining positions"
     - "Update positions count to match placements"
3. User selects option
4. Continues closure or updates positions

**Screen State:**
```
+----------------------------------------------------------+
| ⚠️ Not All Positions Filled                              |
+----------------------------------------------------------+
| This job has 3 open positions but only 1 placement:      |
| • Placed: 1                                              |
| • Remaining: 2                                           |
|                                                           |
| What would you like to do?                               |
|                                                           |
| ○ Close job anyway (partial fill)                        |
|   Mark as "Partially Filled"                             |
|                                                           |
| ● Keep job open for remaining 2 positions                |
|   Update to "Active" with 2 positions remaining          |
|                                                           |
| ○ Update positions to 1 (match placements)               |
|   Mark as "Filled" with corrected count                  |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Continue]                  |
+----------------------------------------------------------+
```

### A2: Close with Replacement Guarantee Active

**If placements have active replacement guarantees:**

**At Step 3:**

1. System checks for active guarantees
2. Shows warning: "Replacement guarantee active for {N} days"
3. Requires acknowledgment:
   - Job stays "Filled" but not archived
   - Auto-reopens if replacement needed
   - Guarantee period countdown shown

**Screen State:**
```
+----------------------------------------------------------+
| ⚠️ Replacement Guarantee Active                          |
+----------------------------------------------------------+
| Placed candidate: John Smith                             |
| Start Date: Nov 28, 2025                                 |
| Guarantee Period: 90 days (ending Feb 26, 2026)         |
|                                                           |
| Job will be marked as "Filled" but:                      |
| • Will remain accessible for 90 days                     |
| • Will auto-reopen if candidate doesn't work out        |
| • Cannot be permanently archived until Feb 26, 2026     |
|                                                           |
| ☑ I understand the replacement guarantee terms           |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Continue]                  |
+----------------------------------------------------------+
```

### A3: Reopen Closed Job

**From Closed Job View:**

**User Action:** Click "Reopen Job" button

**System Response:**

1. Shows reopen confirmation modal
2. Requires reopen reason
3. Optionally reset pipeline
4. Restores to "active" status
5. Re-posts to job boards (if enabled)
6. Notifies RACI stakeholders

**Field Specification: Reopen Reason**
| Property | Value |
|----------|-------|
| Field Name | `reopenReason` |
| Type | Textarea |
| Label | "Why are you reopening this job?" |
| Required | Yes |
| Max Length | 300 characters |

**Reopen Options:**
- Keep existing pipeline (restore withdrawn candidates)
- Start fresh (clear all submissions)
- Reactivate selected submissions only

**Screen State:**
```
+----------------------------------------------------------+
|                      Reopen Job?                      [×] |
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                         |
| Closed: Nov 30, 2025 (Filled)                            |
+----------------------------------------------------------+
| Why are you reopening this job? *                        |
| [Candidate didn't start - need replacement            ]  |
| [                                               ] 42/300  |
|                                                           |
| Pipeline Options:                                         |
| ○ Start fresh - Clear all previous submissions           |
| ● Restore pipeline - Reactivate withdrawn candidates     |
| ○ Custom - Select which submissions to restore           |
|                                                           |
| {if "Restore pipeline"}                                  |
| Candidates to reactivate:                                |
| ☑ Sarah Johnson (was at Interview stage)                |
| ☑ Mike Brown (was Submitted)                            |
| ☐ Jane Doe (was Screening)                              |
| {/if}                                                    |
|                                                           |
| ☑ Notify reactivated candidates                          |
| ☑ Re-post to job boards                                  |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Reopen Job ✓]              |
+----------------------------------------------------------+
```

### A4: Close with Transfer to Similar Jobs

**At Step 2, if "Transfer" selected:**

1. System suggests similar jobs based on:
   - Same skills
   - Similar rate range
   - Same location/remote policy
   - Active status
2. Shows candidate-job match scores
3. Allows selection of different target jobs per candidate
4. Auto-creates submissions in target jobs

---

## Closure Reasons & Status Mapping

| Closure Reason | Final Status | Archived | Can Reopen | Notes |
|----------------|--------------|----------|------------|-------|
| **Filled** | `filled` | After guarantee period | Yes | Success case |
| **Cancelled by Client** | `cancelled` | Immediately | Yes | Client decision |
| **On Hold Indefinite** | `on_hold_indefinite` | After 90 days | Yes | May resume later |
| **Budget Cut** | `cancelled` | Immediately | Yes | Budget reasons |
| **Requirement Changed** | `cancelled` | Immediately | Yes | Scope changed |
| **Duplicate** | `closed` | Immediately | No | Merged with other job |
| **Other** | `closed` | Immediately | Yes | Custom reason |

---

## Metrics Calculation

### Time-to-Fill Calculation

```typescript
const timeToFill = {
  startDate: job.publishedAt || job.activatedAt,
  endDate: firstPlacement.placedAt,
  durationDays: calculateBusinessDays(startDate, endDate),
  targetDays: job.targetFillDate ? calculateBusinessDays(startDate, job.targetFillDate) : 30,
  performanceVsTarget: (durationDays / targetDays) * 100,
  status: durationDays <= targetDays ? 'met' : 'missed',
};
```

### Fill Rate Calculation

```typescript
const fillRate = {
  positionsTotal: job.positionsCount,
  positionsFilled: placements.length,
  fillPercentage: (positionsFilled / positionsTotal) * 100,
  status: fillPercentage === 100 ? 'fully_filled' : 'partially_filled',
};
```

### Conversion Rates

```typescript
const conversionRates = {
  sourcedToSubmitted: (submittedCount / sourcedCount) * 100,
  submittedToInterview: (interviewCount / submittedCount) * 100,
  interviewToOffer: (offerCount / interviewCount) * 100,
  offerToPlaced: (placedCount / offerCount) * 100,
  overallConversion: (placedCount / sourcedCount) * 100,
};
```

### Revenue Calculation

```typescript
const revenue = {
  monthlyRevenue: placements.reduce((sum, p) =>
    sum + (p.billRate - p.payRate) * 160, 0), // 160 hrs/month
  annualRevenue: monthlyRevenue * 12,
  marginDollars: monthlyRevenue,
  marginPercent: ((billRate - payRate) / billRate) * 100,
};
```

---

## Submission Pipeline Actions

### Automatic Withdrawal (Sourced, Screening)

**For submissions in early stages:**

```sql
UPDATE submissions
SET
  status = 'withdrawn',
  withdrawal_reason = 'job_closed',
  withdrawn_at = NOW(),
  withdrawn_by = $1,
  updated_at = NOW()
WHERE
  job_id = $2
  AND status IN ('sourced', 'screening');
```

### Transfer to Another Job

**For submissions being transferred:**

1. Create new submission in target job
2. Copy candidate data, resume, notes
3. Link original submission (for history)
4. Update original: `status = 'transferred'`
5. Notify candidate of transfer

```sql
-- Create new submission
INSERT INTO submissions (
  id, org_id, job_id, candidate_id,
  resume_version_id, pay_rate, bill_rate,
  submission_notes, status,
  transferred_from_job_id,
  created_at, created_by
)
SELECT
  gen_random_uuid(), org_id, $1, candidate_id,
  resume_version_id, pay_rate, bill_rate,
  'Transferred from: ' || $2, 'submitted',
  job_id,
  NOW(), $3
FROM submissions
WHERE id = $4;

-- Update original
UPDATE submissions
SET
  status = 'transferred',
  transferred_to_job_id = $1,
  updated_at = NOW()
WHERE id = $4;
```

### Archive Placed Candidates

**For successful placements:**

- Keep submission record intact
- Link to placement record
- Mark as archived
- Include in metrics/reports

---

## RACI Assignments

| Action | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Initiate Closure | Job Owner (Recruiter) | - | - | - |
| Select Reason | Job Owner | - | - | - |
| Handle Pipeline | Job Owner | Pod Manager | - | - |
| Review Summary | Job Owner | - | Pod Manager | - |
| Execute Closure | System | Job Owner | - | - |
| Notify Stakeholders | System | - | - | All RACI + Team |
| Remove Job Boards | System | Job Owner | - | - |
| Archive Job | System | - | - | COO |
| Calculate Metrics | System | - | Finance (if revenue) | - |

---

## Notifications

### Email: Job Closed (to RACI stakeholders)

**Subject Line:**
```
[Job Closed] {jobTitle} @ {accountName} - {closureReason}
```

**Template Variables:**
| Variable | Source | Example |
|----------|--------|---------|
| `jobTitle` | job.title | "Senior Java Developer" |
| `accountName` | account.name | "Acme Corp" |
| `closureReason` | closureReason | "Filled" |
| `closerName` | user.firstName + lastName | "John Smith" |
| `closedAt` | job.closedAt | "Nov 30, 2025 3:45 PM" |
| `timeToFill` | Calculated | "15 days" |
| `placedCandidate` | candidate.name | "John Smith" (if filled) |
| `closureNote` | closureNote | Optional note |

**Email Body Template:**

```html
Hi {recipientName},

A job you were tracking has been closed:

**Job:** {jobTitle} @ {accountName}
**Closed by:** {closerName}
**Closed on:** {closedAt}
**Reason:** {closureReason}

{if closureReason === 'filled'}
**Congratulations!** 🎉
This position was successfully filled.

**Performance:**
- Time to Fill: {timeToFill} days
- Placed Candidate: {placedCandidate}
- Target Met: {metTarget ? 'Yes ✓' : 'No'}
{/if}

{if closureNote}
**Note:**
{closureNote}
{/if}

**Final Metrics:**
- Candidates Sourced: {sourcedCount}
- Candidates Submitted: {submittedCount}
- Fill Rate: {fillRate}%

{if closureReason === 'filled'}
Great work on this placement!
{else}
This job has been archived and removed from active job boards.
{/if}

---
Automated notification from InTime OS
```

### Email: Job Closed (to affected candidates)

**Subject Line:**
```
Update: {jobTitle} Position at {accountName}
```

**Email Body Template:**

```html
Hi {candidateName},

We wanted to update you on the {jobTitle} position at {accountName}:

{if closureReason === 'filled'}
This position has been filled. We appreciate your interest and the time you invested in this opportunity.

{if transferredTo}
**Good news:** We've identified another similar opportunity that matches your profile:

**{transferJobTitle}** at {transferAccountName}
- Rate: {transferRate}
- Location: {transferLocation}

Your profile has been submitted for this new role. We'll be in touch soon with next steps.
{/if}

{else if closureReason === 'cancelled_client'}
Unfortunately, the client has cancelled this position. This was not a reflection on your candidacy.
{else}
This position is no longer available at this time.
{/if}

We value your interest in working with us and will keep your profile active for future opportunities.

If you have any questions, please don't hesitate to reach out.

Best regards,
{recruiterName}
{recruiterEmail}
{recruiterPhone}

---
{companyName} Staffing
```

---

## Job Board Removal

### Automatic Removal Process

**For each active job board posting:**

1. **Indeed:**
   - API call to close posting
   - Mark as "expired"
   - Store removal timestamp

2. **LinkedIn:**
   - API call to close posting
   - Mark as "closed"
   - Store removal timestamp

3. **Monster, Dice (Manual):**
   - Create task for manual removal
   - Assigned to: Job Owner (R)
   - Due: Within 24 hours
   - Include login link and instructions

### Job Board Removal Schema

```sql
UPDATE job_board_postings
SET
  status = 'removed',
  removed_at = NOW(),
  removed_reason = 'job_closed'
WHERE
  job_id = $1
  AND status IN ('posted', 'active');
```

---

## Business Rules

### BR-01: Closure Permissions

- User MUST be Responsible (R) OR Accountable (A) in RACI
- OR User MUST have "job.close.any" permission (Manager+)
- User MUST have "job.close" base permission
- Cannot close if job status = Already Closed/Cancelled

### BR-02: Closure Validation

- If reason = "filled": At least 1 placement MUST exist
- If reason = "filled": Placements count MUST match positions count
- Cannot close with status = "offer_pending" (resolve offers first)
- Cannot close with pending approvals (resolve approvals first)

### BR-03: Pipeline Handling

- Sourced/Screening: Always auto-withdraw
- Submitted/Interview: User chooses action (withdraw, transfer, manual)
- Offer/Placed: Keep intact, archive only
- If transfer: Target job MUST be active and similar

### BR-04: Metrics & Reporting

- Calculate ALL metrics before closing
- Store metrics in job_metrics table
- Include in recruiter performance reports
- Include in client satisfaction reports
- Archive for compliance (retain 7 years)

### BR-05: Reopen Restrictions

- Can reopen within 90 days without approval
- After 90 days: Requires Manager approval
- Cannot reopen if status = "duplicate"
- Reopening creates new version in history

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Close filled job with 1 placement | Job closed as "filled", metrics calculated |
| TC-002 | Close cancelled job with active submissions | All submissions withdrawn, candidates notified |
| TC-003 | Close job with transfer option | Submissions transferred to target job |
| TC-004 | Attempt close without placement (reason=filled) | Error: "No placements recorded" |
| TC-005 | Attempt close as non-RACI user | Error: "Permission denied" |
| TC-006 | Close with active job board postings | All postings removed automatically |
| TC-007 | Close with replacement guarantee | Job marked filled but not archived |
| TC-008 | Reopen closed job | Job status → active, pipeline restored |
| TC-009 | Close with network error | Error toast, can retry |
| TC-010 | Cancel closure mid-process | Modal closes, no changes saved |
| TC-011 | Close partially filled job (2/3) | Options: close anyway, keep open, update count |
| TC-012 | Close with manual review option | Tasks created for each submission |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/jobs.ts`
**Procedure:** `jobs.close`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const closeJobInput = z.object({
  jobId: z.string().uuid(),
  closureReason: z.enum([
    'filled',
    'cancelled_client',
    'on_hold_indefinite',
    'budget_cut',
    'requirement_changed',
    'duplicate',
    'other',
  ]),
  closureNote: z.string().max(500).optional(),
  submissionAction: z.enum(['withdraw', 'transfer', 'manual']).optional(),
  transferJobId: z.string().uuid().optional(), // Required if submissionAction = 'transfer'
  notifyCandidates: z.boolean().default(true),
  placementIds: z.array(z.string().uuid()).optional(), // If reason = 'filled'
});

export type CloseJobInput = z.infer<typeof closeJobInput>;
```

### Output Schema

```typescript
export const closeJobOutput = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['filled', 'cancelled', 'closed', 'on_hold_indefinite']),
  closedAt: z.string().datetime(),
  closedBy: z.string().uuid(),
  metrics: z.object({
    timeToFillDays: z.number(),
    sourcedCount: z.number(),
    submittedCount: z.number(),
    fillRate: z.number(),
    placementRevenue: z.number(),
  }),
  submissionsProcessed: z.number(),
  jobBoardsRemoved: z.number(),
  notificationsSent: z.number(),
});

export type CloseJobOutput = z.infer<typeof closeJobOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   const job = await db.query.jobs.findFirst({
     where: eq(jobs.id, input.jobId),
     with: {
       raciAssignments: true,
       submissions: true,
       placements: true,
       jobBoardPostings: true,
     },
   });

   if (!job) throw new TRPCError({ code: 'NOT_FOUND' });

   // Check permissions
   const canClose = checkClosePermission(ctx.userId, job);
   if (!canClose) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate closure reason
   if (input.closureReason === 'filled' && job.placements.length === 0) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'No placements recorded for this job',
     });
   }

   // Validate transfer target
   if (input.submissionAction === 'transfer' && !input.transferJobId) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Transfer job ID required when transferring submissions',
     });
   }
   ```

2. **Calculate Final Metrics** (~100ms)

   ```typescript
   const metrics = {
     timeToFillDays: calculateTimeToFill(job),
     sourcedCount: job.submissions.filter(s => s.status === 'sourced').length,
     submittedCount: job.submissions.filter(s => s.status === 'submitted_to_client').length,
     interviewCount: job.submissions.filter(s => s.status === 'interview_scheduled').length,
     offerCount: job.submissions.filter(s => s.status === 'offer_extended').length,
     placedCount: job.placements.length,
     fillRate: (job.placements.length / job.positionsCount) * 100,
     placementRevenue: job.placements.reduce((sum, p) =>
       sum + ((p.billRate - p.payRate) * 160), 0),
   };

   // Store metrics
   await db.insert(jobMetrics).values({
     id: randomUUID(),
     jobId: input.jobId,
     ...metrics,
     calculatedAt: new Date(),
   });
   ```

3. **Determine Final Status** (~10ms)

   ```typescript
   const finalStatus = input.closureReason === 'filled' ? 'filled' :
                      input.closureReason === 'on_hold_indefinite' ? 'on_hold_indefinite' :
                      input.closureReason.includes('cancelled') ? 'cancelled' :
                      'closed';
   ```

4. **Update Job Record** (~100ms)

   ```typescript
   await db.update(jobs)
     .set({
       status: finalStatus,
       closedAt: new Date(),
       closedBy: ctx.userId,
       closureReason: input.closureReason,
       closureNote: input.closureNote,
       updatedAt: new Date(),
     })
     .where(eq(jobs.id, input.jobId));
   ```

5. **Process Submissions** (~200ms)

   ```typescript
   let submissionsProcessed = 0;

   // Withdraw sourced/screening
   const earlyStageSubmissions = job.submissions.filter(s =>
     ['sourced', 'screening'].includes(s.status)
   );

   for (const submission of earlyStageSubmissions) {
     await db.update(submissions)
       .set({
         status: 'withdrawn',
         withdrawalReason: 'job_closed',
         withdrawnAt: new Date(),
         withdrawnBy: ctx.userId,
         updatedAt: new Date(),
       })
       .where(eq(submissions.id, submission.id));

     submissionsProcessed++;
   }

   // Handle submitted/interview based on action
   const activeSubmissions = job.submissions.filter(s =>
     ['submitted_to_client', 'interview_scheduled', 'interview_completed'].includes(s.status)
   );

   if (input.submissionAction === 'withdraw') {
     for (const submission of activeSubmissions) {
       await db.update(submissions)
         .set({
           status: 'withdrawn',
           withdrawalReason: 'job_closed',
           withdrawnAt: new Date(),
           withdrawnBy: ctx.userId,
         })
         .where(eq(submissions.id, submission.id));

       submissionsProcessed++;
     }
   } else if (input.submissionAction === 'transfer') {
     for (const submission of activeSubmissions) {
       // Create new submission in target job
       await transferSubmission(submission.id, input.transferJobId);
       submissionsProcessed++;
     }
   } else if (input.submissionAction === 'manual') {
     // Create tasks for manual review
     for (const submission of activeSubmissions) {
       await db.insert(tasks).values({
         id: randomUUID(),
         orgId: job.orgId,
         title: `Review submission: ${submission.candidate.name}`,
         description: `Job closed - decide what to do with this submission`,
         entityType: 'submission',
         entityId: submission.id,
         assignedTo: ctx.userId,
         priority: 'high',
         status: 'pending',
         dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
         createdAt: new Date(),
       });
     }
   }
   ```

6. **Remove Job Board Postings** (~100ms per board)

   ```typescript
   let jobBoardsRemoved = 0;

   for (const posting of job.jobBoardPostings) {
     if (posting.status === 'posted') {
       try {
         // Call API to remove posting
         await removeFromJobBoard(posting.board, posting.externalPostId);

         await db.update(jobBoardPostings)
           .set({
             status: 'removed',
             removedAt: new Date(),
             removedReason: 'job_closed',
           })
           .where(eq(jobBoardPostings.id, posting.id));

         jobBoardsRemoved++;
       } catch (error) {
         // Create manual removal task
         await db.insert(tasks).values({
           id: randomUUID(),
           orgId: job.orgId,
           title: `Manually remove job from ${posting.board}`,
           description: `Automatic removal failed. Please remove manually.`,
           entityType: 'job',
           entityId: input.jobId,
           assignedTo: ctx.userId,
           priority: 'medium',
           status: 'pending',
           createdAt: new Date(),
         });
       }
     }
   }
   ```

7. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, metadata,
     created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'job', $2,
     'closed', 'Job closed',
     jsonb_build_object(
       'closure_reason', $3,
       'closure_note', $4,
       'metrics', $5,
       'submissions_processed', $6
     ),
     $7, NOW()
   );
   ```

8. **Send Notifications** (~300ms)

   ```typescript
   let notificationsSent = 0;

   // Notify RACI stakeholders
   const raciUsers = await getRACIUsers(input.jobId);

   for (const user of [...raciUsers.responsible, ...raciUsers.accountable,
                        ...raciUsers.consulted, ...raciUsers.informed]) {
     await sendEmail(user.email, 'job_closed', {
       job,
       metrics,
       closureReason: input.closureReason,
       closureNote: input.closureNote,
     });
     notificationsSent++;
   }

   // Notify affected candidates (if enabled)
   if (input.notifyCandidates) {
     for (const submission of job.submissions) {
       if (['submitted_to_client', 'interview_scheduled'].includes(submission.status)) {
         await sendEmail(submission.candidate.email, 'job_closed_candidate', {
           job,
           candidate: submission.candidate,
           closureReason: input.closureReason,
           transferJob: input.transferJobId ? await getJob(input.transferJobId) : null,
         });
         notificationsSent++;
       }
     }
   }
   ```

**Total Processing Time:** ~1000-2000ms (depending on submission count)

---

## Database Schema Reference

### Table: jobs (Updated Fields)

| Column | Type | Updated | Notes |
|--------|------|---------|-------|
| `status` | ENUM | Yes | Active → Filled/Cancelled/Closed |
| `closedAt` | TIMESTAMP | Yes | When job was closed |
| `closedBy` | UUID | Yes | FK → user_profiles.id |
| `closureReason` | ENUM | Yes | Why job was closed |
| `closureNote` | TEXT | Yes | Optional note (max 500) |

### Table: job_metrics (New)

```sql
CREATE TABLE job_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  time_to_fill_days INT, -- Calendar days from publish to fill
  time_to_fill_business_days INT, -- Business days only
  sourced_count INT NOT NULL DEFAULT 0,
  screening_count INT NOT NULL DEFAULT 0,
  submitted_count INT NOT NULL DEFAULT 0,
  interview_count INT NOT NULL DEFAULT 0,
  offer_count INT NOT NULL DEFAULT 0,
  placed_count INT NOT NULL DEFAULT 0,
  fill_rate DECIMAL(5,2), -- Percentage (0-100)
  placement_revenue_monthly DECIMAL(10,2), -- Monthly margin
  placement_revenue_annual DECIMAL(12,2), -- Annual margin
  conversion_sourced_to_submitted DECIMAL(5,2),
  conversion_submitted_to_interview DECIMAL(5,2),
  conversion_interview_to_offer DECIMAL(5,2),
  conversion_offer_to_placed DECIMAL(5,2),
  target_met BOOLEAN, -- Did we meet time-to-fill target?
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(job_id)
);

CREATE INDEX idx_job_metrics_job ON job_metrics(job_id);
```

---

## Accessibility

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Full keyboard support for wizard steps |
| Screen Reader | Step announcements, status changes |
| Color Contrast | Status badges meet 4.5:1 contrast |
| Focus Management | Focus moves to next step automatically |
| Error Announcements | Errors announced to screen readers |

---

## Mobile Considerations

### Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile (< 640px) | Full-screen wizard, one step at a time |
| Tablet (640-1024px) | Modal wizard with side padding |
| Desktop (> 1024px) | Centered modal, max-width 700px |

---

*Last Updated: 2025-11-30*
