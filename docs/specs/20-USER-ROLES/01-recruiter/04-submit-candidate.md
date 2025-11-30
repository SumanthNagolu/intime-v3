# Use Case: Submit Candidate to Job

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-003 |
| Actor | Recruiter |
| Goal | Submit a qualified candidate to a job for client consideration |
| Frequency | 10-15 times per week |
| Estimated Time | 5-15 minutes |
| Priority | High (Core workflow) |

---

## Preconditions

1. User is logged in as Recruiter
2. Job exists and is in "open" or "urgent" status
3. Candidate exists in the system
4. Candidate is not already submitted to this job
5. User has access to the job (owner or assigned)

---

## Trigger

One of the following:
- Recruiter found matching candidate during sourcing
- Candidate expressed interest in specific job
- AI matching suggested candidate for job
- Candidate became available (previously placed, now on bench)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Job Detail

**Option A: From Jobs List**
- User clicks "Jobs" in sidebar
- User clicks on target job row
- Job detail opens in split pane

**Option B: From Candidate Detail**
- User viewing candidate profile
- Clicks "Submit to Job" button
- Selects job from dropdown

**Option C: From Command Bar**
- User presses `Cmd+K`
- Types: "submit [candidate name] to [job title]"
- Selects from autocomplete

**URL after navigation:** `/employee/workspace/jobs/{job-id}`

**Time:** ~3 seconds

---

### Step 2: Open Job Pipeline Tab

**User Action:** Click "Pipeline" tab in job detail

**System Response:**
- Pipeline view loads
- Shows Kanban board with columns:
  - Sourced (leads, initial matches)
  - Screening (being evaluated)
  - Submitted (sent to client)
  - Interview (scheduled/completed)
  - Offer (pending/extended)
  - Placed (hired)
- Each column shows candidate cards

**Screen State:**
```
+----------------------------------------------------------+
| Senior Developer @ Google                    [⋮] Actions |
+----------------------------------------------------------+
| RCAI: R: You  A: Manager  C: -  I: -                     |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Submissions] [Activity] [Files]   |
+----------------------------------------------------------+
| Sourced    │ Screening  │ Submitted  │ Interview │ Offer |
| (3)        │ (2)        │ (4)        │ (1)       │ (0)   |
+─────────────────────────────────────────────────────────+
| ┌────────┐ │ ┌────────┐ │ ┌────────┐ │            │      |
| │John D. │ │ │Sarah K.│ │ │Mike R. │ │            │      |
| │95%     │ │ │89%     │ │ │Pending │ │            │      |
| └────────┘ │ └────────┘ │ └────────┘ │            │      |
| ┌────────┐ │            │            │            │      |
| │[+ Add] │ │            │            │            │      |
| └────────┘ │            │            │            │      |
+─────────────────────────────────────────────────────────+
```

**Time:** ~1 second

---

### Step 3: Add Candidate to Pipeline (if not already)

**User Action:** Click "+ Add" card in Sourced column OR drag candidate from search

**System Response:**
- "Add Candidate" modal opens
- Search field focused

**User Action:** Type candidate name, e.g., "John Smith"

**System Response:**
- Real-time search shows matching candidates
- Shows: Name, Current Status, Skills, Match Score

**User Action:** Click on "John Smith" from results

**System Response:**
- Candidate selected
- Preview shows candidate summary
- "Add to Pipeline" button enabled

**User Action:** Click "Add to Pipeline"

**System Response:**
- Modal closes
- Candidate card appears in "Sourced" column
- Toast: "John Smith added to pipeline"
- Submission record created with status: "sourced"

**Time:** ~15 seconds

---

### Step 4: Screen Candidate (Internal Review)

**User Action:** Drag candidate card from "Sourced" to "Screening"

**System Response:**
- Card moves to Screening column
- Status updates to "screening"
- Activity logged: "Moved to screening"

OR

**User Action:** Click on candidate card, then click "Start Screening"

**System Response:**
- Screening modal opens with checklist

**Screening Checklist (in modal):**
```
+----------------------------------------------------------+
| Screening: John Smith for Senior Developer                |
+----------------------------------------------------------+
| ☑ Skills Match                                            |
|   React: ✓ Expert (5+ years)                             |
|   Node.js: ✓ Intermediate (3 years)                      |
|   AWS: ✓ Beginner (1 year)                               |
|                                                           |
| ☑ Experience Level                                        |
|   Required: 5-10 years | Candidate: 7 years ✓            |
|                                                           |
| ☑ Availability                                            |
|   Status: On Bench | Available: Immediately ✓            |
|                                                           |
| ☑ Rate Expectations                                       |
|   Job Range: $95-110/hr | Candidate: $100/hr ✓           |
|                                                           |
| ☑ Work Authorization                                      |
|   Required: US Citizen, GC, H1B | Candidate: H1B ✓       |
|                                                           |
| ☐ Location Match                                          |
|   Job: Remote | Candidate: Prefers Remote ✓              |
|                                                           |
| Screening Notes:                                          |
| [Strong React background, good communication...       ]   |
|                                                           |
| Recommendation:                                           |
| ○ Proceed to Submit  ○ Need More Info  ○ Not a Fit       |
+----------------------------------------------------------+
|                              [Cancel]  [Complete Screen] |
+----------------------------------------------------------+
```

**User Action:** Check all items, add notes, select "Proceed to Submit"

**User Action:** Click "Complete Screening"

**System Response:**
- Modal closes
- Candidate moves to "Ready to Submit" state (still in Screening visually, but flagged)
- Activity logged: "Screening completed - Recommend for submission"

**Time:** ~5 minutes

---

### Step 5: Initiate Submission

**User Action:** Click "Submit to Client" button on candidate card

OR

**User Action:** Right-click candidate card → "Submit to Client"

**System Response:**
- Submission modal opens
- Pre-filled with job and candidate info

**Screen State:**
```
+----------------------------------------------------------+
|                          Submit Candidate to Client       |
|                                                      [×]  |
+----------------------------------------------------------+
| Candidate: John Smith                                     |
| Job: Senior Developer @ Google                            |
| Client Contact: Jane Doe (jane@google.com)                |
+----------------------------------------------------------+
|                                                           |
| Resume Version *                                          |
| ○ Master Resume (uploaded 2024-11-15)                    |
| ○ Formatted Resume - Google (uploaded 2024-11-28)        |
| ● Create New Formatted Version                           |
|                                                           |
| [Preview Resume]  [Upload New]                           |
|                                                           |
+----------------------------------------------------------+
| Submission Rate *                                         |
| Pay Rate: $[85    ] /hr                                  |
| Bill Rate: $[105   ] /hr (auto-calculated at 23% margin) |
| ☐ Override Bill Rate: $[      ] /hr                      |
|                                                           |
+----------------------------------------------------------+
| Candidate Highlights * (sent to client)                   |
| [                                                      ]  |
| [• 7 years React experience                            ]  |
| [• Built scalable apps at Meta                         ]  |
| [• Strong communication, team lead experience          ]  |
| [                                               ] 0/1000  |
|                                                           |
| ☐ Use AI to generate highlights                          |
|                                                           |
+----------------------------------------------------------+
| Internal Notes (not sent to client)                       |
| [Candidate prefers remote. Available 2 weeks notice.   ]  |
|                                               ] 0/500     |
|                                                           |
+----------------------------------------------------------+
| Additional Documents                                      |
| [+ Upload]  No additional documents                       |
|                                                           |
+----------------------------------------------------------+
| Submission Method                                         |
| ○ Email to Client Contact                                |
| ○ VMS Portal Upload                                      |
| ● Manual (I will submit externally)                      |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Submit to Client →] |
+----------------------------------------------------------+
```

---

### Step 6: Select Resume Version

**User Action:** Select "Master Resume" or "Create New Formatted Version"

**If "Create New Formatted Version":**
- Opens resume formatter
- User customizes formatting for client
- Removes personal info if required
- Saves as new version

**Field Specification: Resume Version**
| Property | Value |
|----------|-------|
| Field Name | `resumeVersionId` |
| Type | Radio Button List |
| Required | Yes |
| Data Source | `candidate_resumes` WHERE `candidate_id` AND `is_archived = false` |
| Display | "Resume Name (uploaded DATE)" |

**Time:** ~30 seconds (or 5 min if formatting new)

---

### Step 7: Set Submission Rate

**User Action:** Enter pay rate, e.g., "85"

**System Response:**
- Bill rate auto-calculates based on margin settings
- Shows: "$105/hr (23% margin)"

**User Action:** Optionally override bill rate

**Field Specification: Pay Rate**
| Property | Value |
|----------|-------|
| Field Name | `payRate` |
| Type | Currency Input |
| Label | "Pay Rate" |
| Required | Yes |
| Min | 0 |
| Precision | 2 decimals |
| Validation | Must be within candidate's rate expectations |
| Warning | If outside range, show warning (not error) |

**Field Specification: Bill Rate**
| Property | Value |
|----------|-------|
| Field Name | `submittedRate` |
| Type | Currency Input (calculated) |
| Label | "Bill Rate" |
| Auto-Calculate | `payRate * (1 + marginPercent)` |
| Override | Yes (checkbox to enable manual entry) |
| Validation | Must be within job's rate range |
| Warning | If outside range, show warning |

**Time:** ~30 seconds

---

### Step 8: Write Candidate Highlights

**User Action:** Type bullet points highlighting candidate strengths

**System Response:**
- Text appears in textarea
- Character count updates

**User Action (Optional):** Click "Use AI to generate highlights"

**System Response:**
- AI analyzes candidate resume vs job requirements
- Generates 3-5 bullet points
- User can edit before saving

**Field Specification: Candidate Highlights**
| Property | Value |
|----------|-------|
| Field Name | `submissionNotes` |
| Type | Textarea |
| Label | "Candidate Highlights" |
| Placeholder | "• Highlight 1\n• Highlight 2\n• Highlight 3" |
| Required | Yes |
| Min Length | 50 characters |
| Max Length | 1000 characters |
| Formatting | Bullet points encouraged |
| AI Assist | Yes (optional) |

**Time:** ~2-5 minutes

---

### Step 9: Add Internal Notes (Optional)

**User Action:** Type internal notes

**Field Specification: Internal Notes**
| Property | Value |
|----------|-------|
| Field Name | `internalNotes` |
| Type | Textarea |
| Label | "Internal Notes" |
| Placeholder | "Notes for internal team only..." |
| Required | No |
| Max Length | 500 characters |
| Visibility | Internal only |

**Time:** ~30 seconds

---

### Step 10: Upload Additional Documents (Optional)

**User Action:** Click "+ Upload" to attach documents

**System Response:**
- File picker opens
- User selects files (cover letter, work samples, etc.)
- Files upload with progress indicator

**Field Specification: Additional Documents**
| Property | Value |
|----------|-------|
| Field Name | `additionalDocuments` |
| Type | File Upload (multiple) |
| Allowed Types | PDF, DOC, DOCX, PNG, JPG |
| Max Size | 10MB per file |
| Max Files | 5 |

**Time:** ~30 seconds per file

---

### Step 11: Select Submission Method

**User Action:** Select how submission will be sent

**Options:**
1. **Email to Client Contact** - System sends formatted email
2. **VMS Portal Upload** - Opens VMS integration (if configured)
3. **Manual** - User will submit externally, system just tracks

**Field Specification: Submission Method**
| Property | Value |
|----------|-------|
| Field Name | `submissionMethod` |
| Type | Radio Buttons |
| Default | Based on account settings |
| Options | |
| - `email` | "Email to Client Contact" |
| - `vms` | "VMS Portal Upload" |
| - `manual` | "Manual (I will submit externally)" |

**Time:** ~2 seconds

---

### Step 12: Submit to Client

**User Action:** Click "Submit to Client →" button

**System Response:**

1. **Button shows loading state** (spinner)

2. **Form validates all fields**
   - If errors: Highlight fields, show error messages
   - If valid: Proceed

3. **API call:** `POST /api/trpc/submissions.submitToClient`

4. **If Submission Method = Email:**
   - System generates formatted email
   - Preview modal shows email content
   - User confirms or edits
   - Email sent to client contact
   - Copy sent to recruiter

5. **If Submission Method = VMS:**
   - Opens VMS portal in new tab/modal
   - User completes VMS submission
   - Returns to InTime
   - Marks as submitted

6. **If Submission Method = Manual:**
   - Submission record created
   - Status set to "submitted_to_client"
   - Reminder task created to confirm submission

7. **On Success:**
   - Modal closes
   - Toast: "John Smith submitted to Google" ✓
   - Candidate card moves to "Submitted" column
   - Activity logged
   - Email notification sent to Manager (if configured)

8. **On Error:**
   - Modal stays open
   - Error toast with message
   - User can retry

**Time:** ~5 seconds

---

### Step 13: Confirm Submission (if Manual)

**If submission method was "Manual":**

**System Response:** Creates a follow-up task

- Task: "Confirm external submission: John Smith to Google"
- Due: 4 hours from now
- Assigned to: Current user

**User Action:** After submitting externally, user:
1. Opens submission record
2. Clicks "Confirm Submitted"
3. Enters confirmation details (VMS ID, email thread, etc.)
4. Status updates to "submitted_to_client"
5. `submittedToClientAt` timestamp set

---

## Postconditions

1. ✅ Submission record exists in `submissions` table
2. ✅ Status = "submitted_to_client"
3. ✅ `submittedToClientAt` timestamp set
4. ✅ `submittedToClientBy` = current user
5. ✅ Resume version linked to submission
6. ✅ Bill/Pay rates recorded
7. ✅ Activity logged: "submission.created"
8. ✅ Candidate card appears in "Submitted" column
9. ✅ Manager notified (if configured)
10. ✅ Client contact emailed (if email method)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `submission.status_changed` | `{ submission_id, old_status: 'screening', new_status: 'submitted_to_client' }` |
| `submission.submitted_to_client` | `{ submission_id, job_id, candidate_id, submitted_by, submitted_at, method }` |
| `email.sent` | `{ type: 'submission', to: client_email, submission_id }` (if email method) |
| `activity.created` | `{ type: 'submission', entity_type: 'submission', entity_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Already Submitted | Candidate already submitted to this job | "John Smith has already been submitted to this job" | View existing submission |
| Rate Out of Range | Submitted rate outside job's range | "Bill rate $120/hr exceeds job maximum of $110/hr" | Adjust rate or get approval |
| No Resume | Candidate has no resume on file | "Please upload a resume for this candidate first" | Upload resume |
| Client Contact Missing | No contact assigned to job | "No client contact found. Please add a contact first." | Add contact to job |
| VMS Error | VMS integration failed | "Failed to connect to VMS. Please try manual submission." | Use manual method |
| Email Failed | Email delivery failed | "Failed to send email. Please try again or use manual submission." | Retry or use manual |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Resume | Required | "Please select a resume version" |
| Pay Rate | Required, > 0 | "Pay rate is required" |
| Pay Rate | Within candidate expectations | "Pay rate is below candidate's minimum of $X" (warning) |
| Bill Rate | Within job range | "Bill rate exceeds job maximum" (warning, allow override) |
| Highlights | Required, min 50 chars | "Please add candidate highlights (min 50 characters)" |
| Highlights | Max 1000 chars | "Highlights exceed maximum length" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation) |
| `Tab` | Next field |
| `Cmd+Enter` | Submit |
| `Cmd+K` | Open command bar (search candidates) |

---

## Alternative Flows

### A1: Bulk Submit Multiple Candidates

1. User selects multiple candidates (checkbox)
2. Clicks "Submit Selected"
3. Modal shows batch submission form
4. Same rate and highlights applied to all (with edit per candidate option)
5. Submit all at once

### A2: Submit from Candidate Profile

1. User on Candidate Detail page
2. Clicks "Submit to Job"
3. Selects job from dropdown
4. Submission form opens (same as above)

### A3: Re-submit Rejected Candidate

1. Candidate was previously rejected for this job
2. User clicks "Re-submit"
3. System asks for justification
4. New submission created with link to previous

---

## Submission Status Lifecycle

```
┌─────────┐     ┌───────────┐     ┌──────────────────┐
│ Sourced │ ──▶ │ Screening │ ──▶ │ Submitted_Client │
└─────────┘     └───────────┘     └──────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
            ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
            │ Client_Review│ ──▶ │ Client_Accept │ ──▶ │ Interview    │
            └──────────────┘     └───────────────┘     └──────────────┘
                    │                                          │
                    ▼                                          ▼
            ┌──────────────┐                          ┌──────────────┐
            │Client_Reject │                          │ Offer_Stage  │
            └──────────────┘                          └──────────────┘
                                                              │
                                                              ▼
                                                      ┌──────────────┐
                                                      │   Placed     │
                                                      └──────────────┘
```

---

## Related Use Cases

- [02-create-job.md](./02-create-job.md) - Job must exist first
- [03-source-candidates.md](./03-source-candidates.md) - Finding candidates
- [05-schedule-interview.md](./05-schedule-interview.md) - After client accepts
- [06-make-placement.md](./06-make-placement.md) - After offer accepted

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit with all required fields | Submission created, email sent |
| TC-002 | Submit without resume | Error: "Please select a resume" |
| TC-003 | Submit with rate above job max | Warning shown, allow override |
| TC-004 | Submit candidate already submitted | Error: "Already submitted" |
| TC-005 | Submit via VMS integration | VMS portal opens, status tracked |
| TC-006 | Email delivery fails | Error toast, retry option |
| TC-007 | Cancel mid-submission | Confirmation dialog, no submission created |
| TC-008 | AI generate highlights | AI suggestions appear, editable |

---

## Field Summary Table

| Field | Type | Required | Default | Max Length |
|-------|------|----------|---------|------------|
| resumeVersionId | UUID | Yes | Latest master | - |
| payRate | Decimal | Yes | Candidate's rate | - |
| submittedRate | Decimal | Yes | Calculated | - |
| submissionNotes | Text | Yes | - | 1000 |
| internalNotes | Text | No | - | 500 |
| additionalDocuments | File[] | No | - | 5 files |
| submissionMethod | Enum | Yes | Account default | - |

---

*Last Updated: 2024-11-30*


