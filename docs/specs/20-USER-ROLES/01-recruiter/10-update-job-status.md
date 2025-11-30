# Use Case: Update Job Status

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-010 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Update job status through its lifecycle based on recruitment progress and business events |
| Frequency | 2-3 times per job (typical lifecycle: Draft → Open → Active → Filled) |
| Estimated Time | 2-5 minutes per status update |
| Priority | High (Critical for accurate pipeline reporting) |
| Business Impact | Pipeline visibility, manager approvals, client notifications, team coordination |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "job.update" permission (default for Recruiter role)
3. Job record exists in system
4. User is either job owner or has access via pod/team assignment
5. Job is not in a terminal state (or has reopen permission if terminal)

---

## Trigger

One of the following:
- Job is ready to open after client approval (Draft → Open)
- First candidate submitted to client (Open → Active)
- Client requests temporary hold (Active → On Hold)
- Placement made and all positions filled (Active → Filled)
- Client cancels requisition (Any status → Cancelled)
- Manager requests job reactivation (On Hold/Cancelled → Open)
- Auto-trigger based on submission pipeline events

---

## Job Status Lifecycle

### Status Flow Diagram

```
                        ┌──────────────────────────────────────┐
                        │         Job Lifecycle                │
                        └──────────────────────────────────────┘

    NEW JOB
       ↓
   ┌────────┐
   │ DRAFT  │ ← Initial creation, internal review
   └────┬───┘
        │ (1) Manager approves
        │     OR Auto-approve after 24hrs
        ↓
   ┌────────┐
   │  OPEN  │ ← Ready to source, no submissions yet
   └────┬───┘
        │ (2) First candidate submitted to client
        │
        ↓
   ┌─────────┐
   │ ACTIVE  │ ← Active pipeline, submissions in flight
   └──┬──┬───┘
      │  │
      │  │ (3a) Client requests hold
      │  └────────────┐
      │               ↓
      │          ┌──────────┐
      │          │ ON HOLD  │ ← Temporary pause
      │          └─────┬────┘
      │                │ (4a) Reactivate
      │                └──────────────┐
      │                               │
      │ (3b) All positions filled     │
      ↓                               │
   ┌────────┐                         │
   │ FILLED │ ← Terminal state        │
   └────┬───┘                         │
        │                             │
        │ (5) Reopen (manager approval) │
        └─────────────────┬───────────┘
                          ↓
                    ┌─────────────┐
                    │   OPEN      │
                    └─────────────┘

   ANY STATUS
        │
        │ (6) Client cancels
        ↓
   ┌───────────┐
   │ CANCELLED │ ← Terminal state
   └───────────┘
        │
        │ (7) Reopen (manager approval + reason)
        └────────────────→ OPEN
```

### Valid Status Transitions

| From Status | To Status | Trigger | Requires Approval | Auto-Trigger Available |
|-------------|-----------|---------|-------------------|----------------------|
| Draft | Open | Manager approval or timeout | Yes (Manager) | Yes (24hrs) |
| Open | Active | First submission to client | No | Yes |
| Active | On Hold | Client/Manager request | No | No |
| Active | Filled | All positions filled | No | Yes |
| Active | Cancelled | Client cancellation | No | No |
| On Hold | Open | Reactivation request | No | No |
| On Hold | Cancelled | Client cancellation | No | No |
| Filled | Open | Reopen request | Yes (Manager) | No |
| Cancelled | Open | Reopen request | Yes (Manager) | No |
| Any | Cancelled | Override/Force cancel | Yes (Manager) | No |

### Status Definitions

| Status | Definition | Icon | Color | Typical Duration |
|--------|------------|------|-------|------------------|
| **Draft** | Job created but not yet approved for sourcing | 📝 | Gray | 1-2 days |
| **Open** | Approved, ready to source, no submissions yet | 🟢 | Green | 3-7 days |
| **Active** | Actively recruiting, submissions in pipeline | 🔵 | Blue | 2-4 weeks |
| **On Hold** | Temporarily paused by client/manager | 🟡 | Yellow | 1-2 weeks |
| **Filled** | All positions filled, placements made | ✅ | Forest Green | Terminal |
| **Cancelled** | Requisition cancelled by client | 🔴 | Red | Terminal |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Job Detail

**User Action:** Click on job in jobs list OR search for job by title/ID

**System Response:**
- URL changes to: `/employee/workspace/jobs/{job-id}`
- Job detail view loads (300ms)
- Shows job header with current status badge
- Action menu in top-right shows "Update Status" option

**Screen State:**
```
+----------------------------------------------------------+
| Senior Software Developer - Google             [⚙] [×]  |
+----------------------------------------------------------+
| Status: 🔵 ACTIVE  |  Priority: High  |  2 of 3 Positions |
+----------------------------------------------------------+
| Actions: [Update Status] [Edit Job] [Clone] [Archive]   |
+----------------------------------------------------------+
| Pipeline Summary:                                        |
| • 12 Candidates Sourced                                  |
| • 5 Submitted to Client                                  |
| • 2 In Interview                                         |
| • 1 Offer Extended                                       |
|                                                          |
| Timeline:                                                |
| 11/28/24  Offer extended to Sarah Johnson                |
| 11/25/24  Status → Active (first submission)             |
| 11/20/24  Status → Open (manager approved)               |
| 11/18/24  Job created (Draft)                            |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Click "Update Status"

**User Action:** Click "Update Status" button in action menu

**System Response:**
- Modal slides in from right (300ms)
- Title: "Update Job Status"
- Shows current status with visual indicator
- Displays allowed status transitions based on current state
- Pre-selects most common next status

**Screen State:**
```
+----------------------------------------------------------+
|                         Update Job Status           [×]  |
+----------------------------------------------------------+
| Current Status: 🔵 ACTIVE                                |
|                                                          |
| Change To: *                                             |
|                                                          |
| Available Options:                                       |
| ○ 🟡 On Hold - Temporarily pause recruitment             |
| ○ ✅ Filled - All positions have been filled             |
| ○ 🔴 Cancelled - Cancel this requisition                 |
|                                                          |
| ────────────────────────────────────────────────────     |
| Status History (last 5):                                 |
| 11/25/24  Active   (First submission made)               |
| 11/20/24  Open     (Manager approved: John Smith)        |
| 11/18/24  Draft    (Created by: Jane Recruiter)          |
|                                                          |
+----------------------------------------------------------+
|                              [Cancel]  [Next: Details →] |
+----------------------------------------------------------+
```

**Field Specification: New Status**
| Property | Value |
|----------|-------|
| Field Name | `newStatus` |
| Type | Radio Button Group |
| Label | "Change To" |
| Required | Yes |
| Options | Dynamic based on current status (see transition table) |
| Default | Most common next status in workflow |
| Validation | Must be a valid transition from current status |

**Time:** ~300ms

---

### Step 3: Select New Status (Example: On Hold)

**User Action:** Click "On Hold" radio button

**System Response:**
- Radio button selected
- Additional fields appear based on status selection
- For "On Hold": Reason dropdown + Expected reactivation date
- For "Filled": Confirmation of placements count
- For "Cancelled": Reason dropdown + Optional notes

**Screen State (On Hold Selected):**
```
+----------------------------------------------------------+
|                         Update Job Status           [×]  |
+----------------------------------------------------------+
| Current Status: 🔵 ACTIVE                                |
|                                                          |
| Change To: *                                             |
| ● 🟡 On Hold - Temporarily pause recruitment             |
| ○ ✅ Filled - All positions have been filled             |
| ○ 🔴 Cancelled - Cancel this requisition                 |
|                                                          |
| ────────────────────────────────────────────────────     |
|                                                          |
| Reason for Hold: *                                       |
| [Select reason...                                    ▼]  |
|                                                          |
| Expected Reactivation Date:                              |
| [MM/DD/YYYY                                      📅]     |
|                                                          |
| Additional Notes:                                        |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
+----------------------------------------------------------+
|                              [Cancel]  [Next: Review →]  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 4: Select Reason for Status Change

**User Action:** Click reason dropdown, select appropriate reason

**System Response:**
- Dropdown opens with context-specific reasons
- Reasons vary based on target status
- Optional "Other" with text input field

**Field Specification: Reason (On Hold)**
| Property | Value |
|----------|-------|
| Field Name | `statusChangeReason` |
| Type | Dropdown (Select) |
| Label | "Reason for Hold" |
| Required | Yes (for On Hold, Cancelled) |
| Options (On Hold) | |
| - `budget_freeze` | "Budget Freeze" |
| - `client_request` | "Client Request - Temporary Pause" |
| - `internal_review` | "Internal Review/Re-evaluation" |
| - `low_pipeline` | "Insufficient Pipeline - Need Better Candidates" |
| - `hiring_manager_unavailable` | "Hiring Manager Unavailable" |
| - `duplicate_req` | "Duplicate Requisition" |
| - `organizational_change` | "Organizational Change/Restructure" |
| - `seasonal` | "Seasonal/Timing Issue" |
| - `other` | "Other (specify in notes)" |

**Field Specification: Reason (Cancelled)**
| Property | Value |
|----------|-------|
| Field Name | `statusChangeReason` |
| Type | Dropdown (Select) |
| Label | "Reason for Cancellation" |
| Required | Yes |
| Options (Cancelled) | |
| - `position_eliminated` | "Position Eliminated" |
| - `budget_cut` | "Budget Cut/Not Funded" |
| - `hired_internally` | "Hired Internally" |
| - `req_on_hold_indefinitely` | "On Hold Indefinitely" |
| - `duplicate_req` | "Duplicate Requisition" |
| - `client_lost` | "Client Lost/Contract Ended" |
| - `wrong_job_specs` | "Incorrect Job Specifications" |
| - `client_filled_direct` | "Client Filled Position Directly" |
| - `project_cancelled` | "Project Cancelled" |
| - `other` | "Other (specify in notes)" |

**Field Specification: Reason (Filled)**
| Property | Value |
|----------|-------|
| Field Name | `statusChangeReason` |
| Type | Auto-generated (Read-only) |
| Label | "Reason" |
| Value | "All {positions_count} positions filled" |
| Required | No (auto-generated) |

**Time:** ~3 seconds

---

### Step 5: Set Expected Reactivation Date (On Hold only)

**User Action:** Click calendar icon, select expected reactivation date

**System Response:**
- Date picker opens
- Shows calendar with today highlighted
- Suggests dates: 1 week, 2 weeks, 1 month
- User selects date

**Field Specification: Expected Reactivation Date**
| Property | Value |
|----------|-------|
| Field Name | `expectedReactivationDate` |
| Type | Date Picker |
| Label | "Expected Reactivation Date" |
| Format | MM/DD/YYYY |
| Required | No (but recommended for On Hold) |
| Min Date | Tomorrow (must be future) |
| Max Date | None |
| Default | Today + 2 weeks |
| Validation | Must be future date |
| Error Messages | |
| - Past date | "Reactivation date must be in the future" |
| Note | System will send reminder 2 days before this date |

**Time:** ~5 seconds

---

### Step 6: Add Additional Notes (Optional)

**User Action:** Type notes explaining context of status change

**System Response:**
- Text appears in notes field
- Character count updates

**Field Specification: Additional Notes**
| Property | Value |
|----------|-------|
| Field Name | `statusChangeNotes` |
| Type | Textarea |
| Label | "Additional Notes" |
| Placeholder | "Add any relevant context or details..." |
| Required | No |
| Max Length | 500 characters |
| Rows | 3 |
| Visibility | Internal only (not visible to client) |

**Time:** ~30 seconds

---

### Step 7: Click "Next: Review"

**User Action:** Click "Next: Review →" button

**System Response:**
- Validates all required fields
- If valid: Slides to confirmation screen
- If invalid: Shows inline validation errors
- Displays impact summary

**Screen State (Confirmation):**
```
+----------------------------------------------------------+
|                         Update Job Status           [×]  |
+----------------------------------------------------------+
| Review Status Change                                     |
|                                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Job: Senior Software Developer - Google            │  |
| │                                                    │  |
| │ Status Change:                                     │  |
| │ 🔵 ACTIVE  →  🟡 ON HOLD                          │  |
| │                                                    │  |
| │ Reason: Budget Freeze                              │  |
| │ Expected Reactivation: 12/15/2024                  │  |
| │                                                    │  |
| │ Notes: Client requested hold until Q1 2025        │  |
| │        budget is finalized.                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| ⚠️ Impact Assessment:                                    |
|                                                          |
| This change will:                                        |
| ✓ Pause all active sourcing for this job                |
| ✓ Notify 2 candidates currently in pipeline             |
| ✓ Send hold notification to client contact              |
| ✓ Remove job from active recruiting dashboard           |
| ✓ Set reminder for 12/13/2024 (2 days before expected   |
|   reactivation)                                          |
|                                                          |
| □ Notify hiring manager immediately (optional)           |
| □ Notify all recruiters on this job (optional)           |
|                                                          |
+----------------------------------------------------------+
|                       [← Back]  [Cancel]  [Confirm ✓]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 8: Review Impact and Confirm

**User Action:** Review impact summary, optionally check notification boxes

**System Response:**
- Shows real-time impact of status change
- Displays who will be notified
- Shows downstream effects on pipeline

**Impact Calculations by Status Change:**

#### Active → On Hold
- Count candidates in active pipeline (sourced, screening, submitted stages)
- Identify pending interviews (will need rescheduling)
- List team members assigned to job
- Calculate days until expected reactivation

#### Active → Filled
- Verify `positions_filled >= positions_count`
- List all placements for this job
- Calculate time-to-fill metrics
- Show revenue generated

#### Active → Cancelled
- Count active submissions (not yet rejected/withdrawn)
- List candidates who need notification
- Identify dependent activities (scheduled interviews, pending offers)
- Show potential clawback/lost revenue

#### On Hold → Open (Reactivation)
- Days job was on hold
- Original hold reason
- Pipeline status before hold

#### Filled/Cancelled → Open (Reopen)
- **Requires manager approval** (shows approval request form)
- Reason for reopening
- New positions count (if different)
- Updated job specifications (if any changes)

**Time:** ~15 seconds

---

### Step 9: Click "Confirm"

**User Action:** Click "Confirm ✓" button

**System Response:**
1. Button shows loading spinner (500ms)
2. API call: `PUT /api/trpc/jobs.updateStatus`
3. **Backend Processing** (see details below)
4. On success:
   - Modal closes (300ms)
   - Job detail refreshes with new status
   - Toast notification: "Job status updated to On Hold"
   - Status badge updates to new color/icon
   - Timeline entry added
   - Notifications sent (async)
5. On error:
   - Error toast with specific message
   - Modal stays open
   - Problematic fields highlighted

**Time:** ~2 seconds

---

## Backend Processing (Sequential)

### For All Status Changes:

1. **Validate Transition:**
   ```typescript
   const isValidTransition = validateStatusTransition(
     currentStatus: 'active',
     newStatus: 'on_hold',
     userId: currentUserId,
     jobData: job
   );

   if (!isValidTransition.allowed) {
     throw new Error(isValidTransition.reason);
   }
   ```

2. **Update Job Status:**
   ```sql
   UPDATE jobs
   SET
     status = 'on_hold',
     updated_at = NOW(),
     updated_by = current_user_id
   WHERE id = job_id
     AND org_id = current_org_id;
   ```

3. **Log Status History:**
   ```sql
   INSERT INTO job_status_history (
     id, org_id, job_id, previous_status, new_status,
     changed_by, changed_at, reason, notes,
     expected_reactivation_date
   ) VALUES (
     uuid_generate_v4(),
     current_org_id,
     job_id,
     'active',
     'on_hold',
     current_user_id,
     NOW(),
     'budget_freeze',
     'Client requested hold until Q1 2025 budget is finalized.',
     '2024-12-15'
   );
   ```

4. **Create Activity Log:**
   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, title, description,
     created_by, created_at
   ) VALUES (
     uuid_generate_v4(),
     current_org_id,
     'job',
     job_id,
     'status_change',
     'Job Status Changed: Active → On Hold',
     'Reason: Budget Freeze. Expected reactivation: 12/15/2024',
     current_user_id,
     NOW()
   );
   ```

### Status-Specific Processing:

#### When Status → On Hold:

5. **Pause Active Submissions:**
   ```sql
   UPDATE submissions
   SET
     status = 'on_hold',
     on_hold_reason = 'Job on hold: Budget freeze',
     updated_at = NOW()
   WHERE job_id = job_id
     AND status IN ('sourced', 'screening', 'submitted_to_client')
     AND org_id = current_org_id;
   ```

6. **Schedule Reactivation Reminder:**
   ```typescript
   if (expectedReactivationDate) {
     await scheduleReminder({
       entityType: 'job',
       entityId: jobId,
       reminderDate: subDays(expectedReactivationDate, 2),
       reminderType: 'reactivation',
       message: `Job "${jobTitle}" scheduled for reactivation in 2 days`,
       assignedTo: jobOwnerId
     });
   }
   ```

7. **Notify Stakeholders:**
   ```typescript
   // Notify candidates in active pipeline
   const activeSubmissions = await getActiveSubmissions(jobId);

   for (const submission of activeSubmissions) {
     await sendEmail({
       to: submission.candidate.email,
       subject: `Update: ${jobTitle} - Temporarily On Hold`,
       template: 'job_on_hold_candidate',
       data: {
         candidateName: submission.candidate.firstName,
         jobTitle,
         clientName: job.account.name,
         recruiterName,
         recruiterEmail,
         expectedReactivation: expectedReactivationDate,
         reason: 'temporary budget review'
       }
     });
   }

   // Notify client
   await sendEmail({
     to: clientContactEmail,
     subject: `Confirmed: ${jobTitle} - On Hold`,
     template: 'job_on_hold_client',
     data: {
       jobTitle,
       onHoldDate: new Date(),
       expectedReactivation: expectedReactivationDate,
       recruiterName,
       recruiterContact
     }
   });

   // Notify job owner's manager
   await sendNotification({
     userId: managerId,
     type: 'job_on_hold',
     title: 'Job Placed On Hold',
     message: `${recruiterName} placed "${jobTitle}" on hold. Reason: ${reason}`,
     link: `/employee/workspace/jobs/${jobId}`
   });
   ```

#### When Status → Filled:

5. **Validate All Positions Filled:**
   ```typescript
   if (job.positionsFilled < job.positionsCount) {
     throw new Error(
       `Cannot mark as filled: Only ${job.positionsFilled} of ${job.positionsCount} positions filled`
     );
   }
   ```

6. **Set Fill Date:**
   ```sql
   UPDATE jobs
   SET
     status = 'filled',
     filled_date = CURRENT_DATE,
     updated_at = NOW()
   WHERE id = job_id;
   ```

7. **Calculate Time-to-Fill Metrics:**
   ```typescript
   const postedDate = job.postedDate || job.createdAt;
   const filledDate = new Date();
   const daysToFill = differenceInDays(filledDate, postedDate);

   await db.insert(jobMetrics).values({
     jobId,
     orgId: currentOrgId,
     metric: 'time_to_fill',
     value: daysToFill,
     calculatedAt: new Date()
   });
   ```

8. **Update Related Submissions:**
   ```sql
   -- Close all non-placed submissions
   UPDATE submissions
   SET
     status = 'rejected',
     rejection_reason = 'Position filled',
     rejected_at = NOW(),
     updated_at = NOW()
   WHERE job_id = job_id
     AND status NOT IN ('placed', 'withdrawn')
     AND org_id = current_org_id;
   ```

9. **Send Filled Notifications:**
   ```typescript
   // Notify team
   await sendNotification({
     userId: managerId,
     type: 'job_filled',
     title: '🎉 Job Filled!',
     message: `"${jobTitle}" at ${clientName} is now fully filled (${positionsCount} placements)`,
     link: `/employee/workspace/jobs/${jobId}`
   });

   // Notify unsuccessful candidates
   const unsuccessfulSubmissions = await getUnsuccessfulSubmissions(jobId);

   for (const submission of unsuccessfulSubmissions) {
     await sendEmail({
       to: submission.candidate.email,
       subject: `Update: ${jobTitle} Position`,
       template: 'position_filled',
       data: {
         candidateName: submission.candidate.firstName,
         jobTitle,
         clientName: job.account.name,
         recruiterName,
         recruiterEmail
       }
     });
   }
   ```

#### When Status → Cancelled:

5. **Update All Active Submissions:**
   ```sql
   UPDATE submissions
   SET
     status = 'withdrawn',
     rejection_reason = 'Job cancelled: ' || cancellation_reason,
     rejected_at = NOW(),
     updated_at = NOW()
   WHERE job_id = job_id
     AND status NOT IN ('placed', 'withdrawn', 'rejected')
     AND org_id = current_org_id;
   ```

6. **Cancel Scheduled Interviews:**
   ```sql
   UPDATE interviews
   SET
     status = 'cancelled',
     cancellation_reason = 'Job requisition cancelled',
     updated_at = NOW()
   WHERE job_id = job_id
     AND status = 'scheduled'
     AND scheduled_at > NOW()
     AND org_id = current_org_id;
   ```

7. **Withdraw Pending Offers:**
   ```sql
   UPDATE offers
   SET
     status = 'withdrawn',
     updated_at = NOW()
   WHERE job_id = job_id
     AND status IN ('draft', 'sent', 'negotiating')
     AND org_id = current_org_id;
   ```

8. **Check for Active Placements:**
   ```typescript
   const activePlacements = await db.query.placements.findMany({
     where: and(
       eq(placements.jobId, jobId),
       eq(placements.status, 'active')
     )
   });

   if (activePlacements.length > 0) {
     // Warn user - cannot cancel job with active placements
     throw new Error(
       `Cannot cancel job: ${activePlacements.length} active placements exist. ` +
       `Please end placements first or choose "Filled" status.`
     );
   }
   ```

9. **Send Cancellation Notifications:**
   ```typescript
   // Notify all candidates in pipeline
   const pipelineCandidates = await getCandidatesInPipeline(jobId);

   for (const candidate of pipelineCandidates) {
     await sendEmail({
       to: candidate.email,
       subject: `Important Update: ${jobTitle}`,
       template: 'job_cancelled_candidate',
       data: {
         candidateName: candidate.firstName,
         jobTitle,
         clientName: job.account.name,
         cancellationReason: getCandidateFriendlyReason(reason),
         recruiterName,
         recruiterEmail
       }
     });
   }

   // Notify client
   await sendEmail({
     to: clientContactEmail,
     subject: `Confirmed: ${jobTitle} - Requisition Cancelled`,
     template: 'job_cancelled_client',
     data: {
       jobTitle,
       cancellationDate: new Date(),
       reason: statusChangeNotes,
       recruiterName
     }
   });

   // Notify hiring manager
   await sendEmail({
     to: hiringManagerEmail,
     subject: `Job Cancelled: ${jobTitle}`,
     template: 'job_cancelled_manager',
     data: {
       jobTitle,
       reason: statusChangeReason,
       notes: statusChangeNotes,
       candidatesAffected: pipelineCandidates.length
     }
   });
   ```

#### When Status → Open (Reactivation from On Hold):

5. **Clear Hold Reason:**
   ```sql
   UPDATE jobs
   SET
     status = 'open',
     expected_reactivation_date = NULL,
     updated_at = NOW()
   WHERE id = job_id;
   ```

6. **Reactivate Submissions:**
   ```sql
   UPDATE submissions
   SET
     status = CASE
       WHEN on_hold_previous_status IS NOT NULL
       THEN on_hold_previous_status
       ELSE 'sourced'
     END,
     on_hold_reason = NULL,
     updated_at = NOW()
   WHERE job_id = job_id
     AND status = 'on_hold'
     AND org_id = current_org_id;
   ```

7. **Notify Reactivation:**
   ```typescript
   await sendNotification({
     userId: jobOwnerId,
     type: 'job_reactivated',
     title: 'Job Reactivated',
     message: `"${jobTitle}" is now active again. Pipeline restored.`,
     link: `/employee/workspace/jobs/${jobId}`
   });
   ```

---

## Postconditions

1. ✅ Job status updated in `jobs` table
2. ✅ Status history entry created in `job_status_history` table
3. ✅ Activity log entry created
4. ✅ Related submissions updated (if status affects pipeline)
5. ✅ Scheduled interviews updated (if cancelled)
6. ✅ Pending offers updated (if cancelled)
7. ✅ Notifications sent to affected parties
8. ✅ Reminders scheduled (if On Hold with reactivation date)
9. ✅ Metrics calculated (if Filled)
10. ✅ Job appears in correct filtered views based on new status

---

## Auto-Status Changes (System Triggers)

### Auto-Change: Draft → Open (After 24 Hours)

**Trigger:** Job created 24+ hours ago, still in Draft status, no manager rejection

**Logic:**
```typescript
// Runs daily via cron job
const draftJobs = await db.query.jobs.findMany({
  where: and(
    eq(jobs.status, 'draft'),
    lt(jobs.createdAt, subHours(new Date(), 24)),
    isNull(jobs.deletedAt)
  )
});

for (const job of draftJobs) {
  await updateJobStatus({
    jobId: job.id,
    newStatus: 'open',
    reason: 'auto_approved_timeout',
    notes: 'Auto-approved after 24 hours with no manager action',
    systemTriggered: true
  });
}
```

### Auto-Change: Open → Active (First Submission)

**Trigger:** First candidate submitted to client

**Logic:**
```typescript
// In submission creation flow
if (job.status === 'open' && submissionStage === 'submitted_to_client') {
  await updateJobStatus({
    jobId: job.id,
    newStatus: 'active',
    reason: 'first_submission',
    notes: `First submission: ${candidateName}`,
    systemTriggered: true
  });
}
```

### Auto-Change: Active → Filled (Last Position Filled)

**Trigger:** Placement created, all positions now filled

**Logic:**
```typescript
// In placement creation flow
const positionsFilled = await db.query.placements.count({
  where: and(
    eq(placements.jobId, jobId),
    eq(placements.status, 'active')
  )
});

if (positionsFilled >= job.positionsCount) {
  await updateJobStatus({
    jobId: job.id,
    newStatus: 'filled',
    reason: 'all_positions_filled',
    notes: `All ${job.positionsCount} positions filled`,
    systemTriggered: true
  });
}
```

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `job.status_changed` | `{ job_id, previous_status, new_status, reason, changed_by, changed_at, notes }` | System |
| `job.on_hold` | `{ job_id, reason, expected_reactivation_date, candidates_affected_count }` | Owner, Manager |
| `job.reactivated` | `{ job_id, days_on_hold, previous_status }` | Owner, Team |
| `job.filled` | `{ job_id, placements_count, days_to_fill, revenue_generated }` | Owner, Manager, Team |
| `job.cancelled` | `{ job_id, reason, candidates_affected_count, interviews_cancelled_count }` | Owner, Manager, Client |
| `job.reopened` | `{ job_id, previous_status, reopen_reason, approved_by }` | Owner, Manager, Team |
| `submissions.paused` | `{ job_id, submission_ids[], reason }` | Candidates (via email) |
| `submissions.withdrawn` | `{ job_id, submission_ids[], reason }` | Candidates (via email) |
| `interviews.cancelled` | `{ interview_ids[], reason }` | Candidates, Interviewers |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Invalid Transition | Trying to move from status A to status B (not allowed) | "Cannot change status from {current} to {new}. Invalid transition." | Select valid status |
| Missing Required Field | Reason not provided for On Hold/Cancelled | "Reason is required when placing job on hold" | Provide reason |
| Positions Not Filled | Trying to mark as Filled when positions_filled < positions_count | "Cannot mark as filled: Only 1 of 3 positions filled" | Make more placements first |
| Active Placements Exist | Trying to cancel job with active placements | "Cannot cancel job: 2 active placements exist" | End placements or use Filled status |
| Permission Denied | User lacks update permission | "You don't have permission to update job status" | Contact manager |
| Manager Approval Required | Trying to reopen Filled/Cancelled without approval | "Reopening this job requires manager approval" | Request manager approval |
| Past Reactivation Date | Expected reactivation date is in the past | "Reactivation date must be in the future" | Select future date |
| Job Already Updated | Concurrent update by another user | "Job status was updated by another user. Please refresh." | Refresh and retry |
| Network Error | API call failed | "Network error. Status not updated. Please try again." | Retry |
| Database Error | Update query failed | "Database error. Please contact support." | Contact support |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit/Next step (when on button) |
| `Cmd+Enter` | Skip to confirmation |
| `↑` / `↓` | Navigate radio options |
| `Space` | Select focused radio/checkbox |

---

## Alternative Flows

### A1: Manager Approval Required (Reopen Filled Job)

**Trigger:** Recruiter tries to reopen a Filled job

**Flow:**
1. Recruiter selects "Reopen" from job actions menu
2. System shows: "⚠️ Reopening a filled job requires manager approval"
3. Modal shows approval request form:
   - Reason for reopening (required)
   - New positions count (if adding more positions)
   - Updated job specifications (optional)
   - Manager to notify (auto-selected from hierarchy)
4. Recruiter fills form, clicks "Request Approval"
5. System:
   - Creates approval request record
   - Sends notification to manager
   - Shows toast: "Approval request sent to [Manager Name]"
6. Manager receives notification:
   - Email + in-app notification
   - "Approve" / "Reject" buttons
7. If Manager approves:
   - Job status → Open
   - Recruiter notified
   - Job appears in active recruiting dashboard
8. If Manager rejects:
   - Recruiter notified with rejection reason
   - Job remains Filled

### A2: Bulk Status Update (Multiple Jobs)

**Trigger:** User needs to update status for multiple jobs at once

**Flow:**
1. User navigates to Jobs list
2. Selects multiple jobs using checkboxes
3. Clicks "Bulk Actions" → "Update Status"
4. Modal shows:
   - List of selected jobs (max 20)
   - Status transition options (only shows if all selected jobs have same current status)
   - Reason field (applies to all)
5. User selects new status, provides reason
6. Clicks "Update All"
7. System:
   - Updates jobs in parallel
   - Shows progress bar
   - Displays success/failure summary
8. Results:
   - "15 of 15 jobs updated successfully"
   - OR "12 of 15 updated. 3 failed (see details)"

### A3: Auto-Reactivation (Scheduled)

**Trigger:** Expected reactivation date arrives

**Flow:**
1. System cron job runs daily at 9am (org timezone)
2. Finds jobs with `status = 'on_hold'` AND `expected_reactivation_date = TODAY`
3. For each job:
   - Sends reminder to job owner: "Job ready for reactivation"
   - Shows notification in app: "Review job for reactivation"
   - **Does NOT auto-reactivate** (requires manual confirmation)
4. Owner clicks notification
5. Modal opens: "Reactivate Job?"
   - Shows hold reason and duration
   - Shows current pipeline state
   - Options: "Reactivate Now" / "Keep On Hold" / "Cancel Job"
6. Owner makes selection
7. If "Reactivate Now": Job status → Open (follows normal flow)

### A4: Force Cancel (Override)

**Trigger:** Manager needs to cancel job despite active submissions/placements

**Flow:**
1. Manager navigates to job detail
2. Clicks "Force Cancel" (only visible to managers)
3. System shows warning:
   - "⚠️ This job has active submissions/placements"
   - Lists affected records
   - "Are you sure you want to force cancel?"
4. Manager must provide:
   - Cancellation reason (required)
   - Action for active placements: "End Early" / "Transfer to Another Job"
   - Notification message to candidates
5. Manager clicks "Confirm Force Cancel"
6. System:
   - Ends/transfers placements as specified
   - Withdraws all submissions
   - Cancels interviews
   - Sends notifications
   - Updates job status → Cancelled

### A5: Status Change Fails Validation

**Trigger:** User tries invalid status change

**Flow:**
1. User selects "Filled" status
2. System validates: `positions_filled < positions_count`
3. Validation fails
4. Modal shows error:
   - "❌ Cannot mark as filled"
   - "Only 1 of 3 positions have been filled"
   - Suggestions:
     - "Make 2 more placements to fill this job"
     - OR "Change positions count to 1"
     - OR "Choose a different status"
5. User corrects issue:
   - Option A: Clicks "Update Positions Count" → Changes to 1 → Retries
   - Option B: Cancels status change → Makes more placements first

---

## Compliance & Regional Considerations

### International Status Change Rules

#### European Union (GDPR):
- When cancelling job: Must provide option to delete all candidate data
- On Hold period: Max 6 months (after that, must reopen or cancel)
- Candidate notifications: Include data retention policy

#### United States:
- Filled jobs: Maintain records for 1 year (OFCCP compliance)
- Cancelled jobs: Keep hiring records if any candidates were interviewed
- EEOC: Track applicant flow data even for cancelled jobs

#### India:
- Status changes during notice period: 90 days notice for bulk cancellations
- Regional approvals: Some status changes require regional manager approval

### Timezone Handling

```typescript
// When scheduling reactivation reminder
const reactivationDateInOrgTimezone = zonedTimeToUtc(
  expectedReactivationDate,
  organizationTimezone
);

// When sending notifications
const localTime = utcToZonedTime(
  statusChangeTimestamp,
  userTimezone
);
```

---

## Database Schema: Job Status History

```sql
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Status Change
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,

  -- Metadata
  changed_by UUID NOT NULL REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  notes TEXT,
  is_system_triggered BOOLEAN DEFAULT FALSE,

  -- On Hold Specific
  expected_reactivation_date DATE,
  actual_reactivation_date DATE,
  hold_duration_days INTEGER,

  -- Filled Specific
  days_to_fill INTEGER,
  positions_filled_count INTEGER,

  -- Cancelled Specific
  candidates_affected_count INTEGER,
  interviews_cancelled_count INTEGER,
  offers_withdrawn_count INTEGER,

  -- Reopen Specific (when reopening Filled/Cancelled)
  reopen_approved_by UUID REFERENCES user_profiles(id),
  reopen_approval_date TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast job history lookup
CREATE INDEX idx_job_status_history_job_id ON job_status_history(job_id);
CREATE INDEX idx_job_status_history_org_changed_at ON job_status_history(org_id, changed_at DESC);
```

---

## Related Use Cases

- [02-create-job.md](./02-create-job.md) - Creating the job initially (Draft status)
- [03-source-candidates.md](./03-source-candidates.md) - Sourcing candidates (Open/Active status)
- [04-submit-candidate.md](./04-submit-candidate.md) - Submitting to client (triggers Active status)
- [06-make-placement.md](./06-make-placement.md) - Placement triggers Filled status
- [11-reopen-job.md](./11-reopen-job.md) - Detailed flow for reopening Filled/Cancelled jobs

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Change Draft → Open (auto-approve) | Status updated, job appears in active list |
| TC-002 | Change Open → Active (first submission) | Auto-triggered, activity logged |
| TC-003 | Change Active → On Hold with reason | Status updated, submissions paused, notifications sent |
| TC-004 | Change Active → On Hold without reason | Error: "Reason is required" |
| TC-005 | Change Active → Filled (not all positions filled) | Error: "Only 1 of 3 positions filled" |
| TC-006 | Change Active → Filled (all positions filled) | Status updated, metrics calculated, unsuccessful candidates notified |
| TC-007 | Change Active → Cancelled with active placements | Error: "Cannot cancel: 2 active placements exist" |
| TC-008 | Change Active → Cancelled with pending interviews | Interviews cancelled, candidates notified |
| TC-009 | Change On Hold → Open (reactivation) | Submissions reactivated, reminder cancelled |
| TC-010 | Reopen Filled job (as recruiter) | Approval request sent to manager |
| TC-011 | Reopen Filled job (as manager) | Job reopened immediately, no approval needed |
| TC-012 | Reopen Cancelled job with reason | Requires manager approval, reason logged |
| TC-013 | Set expected reactivation date (past date) | Error: "Date must be in the future" |
| TC-014 | Set expected reactivation date (2 weeks out) | Reminder scheduled for 2 days before |
| TC-015 | Force cancel with active placements (manager) | Warning shown, placement action required |
| TC-016 | Change status during concurrent update | Error: "Job updated by another user" |
| TC-017 | Bulk update 10 jobs (Draft → Open) | All 10 updated, activity logged for each |
| TC-018 | View status history for job | Shows all status changes with timestamps |
| TC-019 | Auto-reactivation reminder triggers | Owner notified, job still On Hold until manual action |
| TC-020 | Invalid status transition (Filled → On Hold) | Error: "Invalid status transition" |

---

## UI/UX Specifications

### Status Badge Design

```
Status: DRAFT      → 📝 Gray background, #6B7280
Status: OPEN       → 🟢 Green background, #10B981
Status: ACTIVE     → 🔵 Blue background, #3B82F6
Status: ON HOLD    → 🟡 Yellow background, #F59E0B
Status: FILLED     → ✅ Forest Green background, #059669
Status: CANCELLED  → 🔴 Red background, #EF4444
```

### Timeline Visualization

```
┌────────────────────────────────────────────────────┐
│ Status History                                     │
├────────────────────────────────────────────────────┤
│ ✅ FILLED                          11/28/24  (Now) │
│   All 3 positions filled                           │
│   By: System (auto)                                │
│   ↑                                                │
│ 🔵 ACTIVE                               11/25/24   │
│   First submission made                            │
│   By: System (auto)                                │
│   ↑                                                │
│ 🟢 OPEN                                 11/20/24   │
│   Manager approved: John Smith                     │
│   By: Jane Recruiter                               │
│   ↑                                                │
│ 📝 DRAFT                                11/18/24   │
│   Job created                                      │
│   By: Jane Recruiter                               │
└────────────────────────────────────────────────────┘
```

### Impact Assessment Widget

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Impact Assessment                               │
├────────────────────────────────────────────────────┤
│ This status change will affect:                    │
│                                                    │
│ 👥 Candidates:        5 active submissions         │
│ 📅 Interviews:        2 scheduled (will cancel)    │
│ 📧 Notifications:     8 emails will be sent        │
│ 🏢 Client:            Will receive hold notice     │
│ 📊 Metrics:           Job removed from active list │
│                                                    │
│ Estimated impact: Medium                           │
└────────────────────────────────────────────────────┘
```

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
