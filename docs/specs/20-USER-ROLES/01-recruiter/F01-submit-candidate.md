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

- [D01-create-job.md](./D01-create-job.md) - Job must exist first
- [E01-source-candidates.md](./E01-source-candidates.md) - Finding candidates
- [F03-schedule-interview.md](./F03-schedule-interview.md) - After client accepts
- [G08-make-placement.md](./G08-make-placement.md) - After offer accepted

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

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/submissions.ts`
**Procedure:** `submissions.submitToClient`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const submitToClientInput = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  resumeVersionId: z.string().uuid(),
  payRate: z.number().positive().multipleOf(0.01),
  billRate: z.number().positive().multipleOf(0.01),
  submissionNotes: z.string().min(50).max(1000),
  internalNotes: z.string().max(500).optional(),
  additionalDocumentIds: z.array(z.string().uuid()).max(5).optional(),
  submissionMethod: z.enum(['email', 'vms', 'manual']),
  overrideBillRate: z.boolean().optional().default(false),
});

export type SubmitToClientInput = z.infer<typeof submitToClientInput>;
```

### Output Schema

```typescript
export const submitToClientOutput = z.object({
  submissionId: z.string().uuid(),
  status: z.literal('submitted_to_client'),
  submittedAt: z.string().datetime(),
  method: z.enum(['email', 'vms', 'manual']),
  emailSent: z.boolean().optional(),
  vmsSubmissionId: z.string().optional(),
});

export type SubmitToClientOutput = z.infer<typeof submitToClientOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)
   ```typescript
   // Check permissions
   const canSubmit = await checkJobAccess(ctx.userId, input.jobId);
   if (!canSubmit) throw new TRPCError({ code: 'FORBIDDEN' });

   // Check duplicate submission
   const existing = await db.query.submissions.findFirst({
     where: and(
       eq(submissions.jobId, input.jobId),
       eq(submissions.candidateId, input.candidateId),
       ne(submissions.status, 'withdrawn')
     )
   });
   if (existing) throw new TRPCError({
     code: 'CONFLICT',
     message: 'Candidate already submitted to this job'
   });
   ```

2. **Create Submission Record** (~100ms)
   ```sql
   INSERT INTO submissions (
     id, org_id, job_id, candidate_id,
     resume_version_id, pay_rate, bill_rate,
     submission_notes, internal_notes,
     submission_method, status,
     submitted_to_client_at, submitted_to_client_by,
     created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3,
     $4, $5, $6,
     $7, $8,
     $9, 'submitted_to_client',
     NOW(), $10,
     NOW(), NOW()
   ) RETURNING id;
   ```

3. **Link Additional Documents** (~50ms)
   ```sql
   INSERT INTO submission_documents (submission_id, document_id, created_at)
   SELECT $1, unnest($2::uuid[]), NOW();
   ```

4. **Send Email (if method = 'email')** (~500ms)
   - Generate email using template
   - Send via email service (SendGrid/SES)
   - Record in `email_logs` table

5. **Create Follow-up Task (if method = 'manual')** (~50ms)
   ```sql
   INSERT INTO tasks (
     id, org_id, title, description,
     entity_type, entity_id,
     assigned_to, due_at, priority, status, created_at
   ) VALUES (
     gen_random_uuid(), $1,
     'Confirm external submission: ' || $2 || ' to ' || $3,
     'Please confirm you have submitted externally',
     'submission', $4,
     $5, NOW() + INTERVAL '4 hours', 'high', 'pending', NOW()
   );
   ```

6. **Log Activity** (~50ms)
   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description,
     created_by, created_at, metadata
   ) VALUES (
     gen_random_uuid(), $1, 'submission', $2,
     'submitted_to_client', 'Candidate submitted to client',
     $3, NOW(), $4::jsonb
   );
   ```

7. **Notify Manager** (~100ms)
   - If manager notifications enabled, queue notification
   - Push notification + email

8. **Update Pipeline Count** (~50ms)
   ```sql
   UPDATE jobs
   SET submitted_count = submitted_count + 1,
       updated_at = NOW()
   WHERE id = $1;
   ```

---

## Database Schema References

### Table: submissions

**File:** `src/lib/db/schema/ats.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | Auto-generated |
| `org_id` | UUID | FK → organizations.id, NOT NULL | Multi-tenant |
| `job_id` | UUID | FK → jobs.id, NOT NULL | Target job |
| `candidate_id` | UUID | FK → user_profiles.id, NOT NULL | Submitted candidate |
| `resume_version_id` | UUID | FK → candidate_resumes.id | Selected resume |
| `pay_rate` | DECIMAL(10,2) | NOT NULL | Pay rate to candidate |
| `bill_rate` | DECIMAL(10,2) | NOT NULL | Bill rate to client |
| `margin_percent` | DECIMAL(5,2) | | Calculated margin |
| `submission_notes` | TEXT | NOT NULL | Candidate highlights (max 1000) |
| `internal_notes` | TEXT | | Internal only (max 500) |
| `submission_method` | ENUM | NOT NULL | 'email', 'vms', 'manual' |
| `vms_submission_id` | VARCHAR(100) | | VMS reference ID |
| `status` | ENUM | NOT NULL | See status enum below |
| `submitted_to_client_at` | TIMESTAMP | | When submitted |
| `submitted_to_client_by` | UUID | FK → user_profiles.id | Who submitted |
| `client_responded_at` | TIMESTAMP | | When client responded |
| `client_response` | ENUM | | 'accepted', 'rejected', 'hold' |
| `rejection_reason` | TEXT | | If rejected |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |
| `created_by` | UUID | FK → user_profiles.id | |

**Status Enum Values:**
- `sourced` - Initial add to pipeline
- `screening` - Internal review
- `submitted_to_client` - Sent to client
- `client_review` - Client reviewing
- `client_accepted` - Client interested
- `client_rejected` - Client passed
- `interview_scheduled` - Interview set
- `interview_completed` - Interview done
- `offer_pending` - Offer in progress
- `offer_extended` - Offer sent
- `offer_accepted` - Candidate accepted
- `offer_declined` - Candidate declined
- `placed` - Successfully placed
- `withdrawn` - Removed from consideration

**Indexes:**
```sql
CREATE INDEX idx_submissions_org_job ON submissions(org_id, job_id);
CREATE INDEX idx_submissions_org_candidate ON submissions(org_id, candidate_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE UNIQUE INDEX idx_submissions_job_candidate ON submissions(job_id, candidate_id)
  WHERE status != 'withdrawn';
```

### Table: submission_documents

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `submission_id` | UUID | FK → submissions.id, NOT NULL | |
| `document_id` | UUID | FK → documents.id, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |

### Table: candidate_resumes

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `candidate_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `version` | INT | NOT NULL | Auto-increment per candidate |
| `file_name` | VARCHAR(255) | NOT NULL | |
| `storage_path` | VARCHAR(500) | NOT NULL | Supabase storage path |
| `resume_type` | ENUM | NOT NULL | 'master', 'formatted', 'client_specific' |
| `file_size` | INT | | Bytes |
| `is_archived` | BOOLEAN | DEFAULT false | |
| `uploaded_at` | TIMESTAMP | NOT NULL | |
| `uploaded_by` | UUID | FK → user_profiles.id | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

## Email Template: Submission to Client

### Template ID: `submission_to_client`

### Subject Line
```
Candidate Submission: {candidateName} for {jobTitle}
```

### Template Variables
| Variable | Source | Example |
|----------|--------|---------|
| `candidateName` | candidate.firstName + lastName | "John Smith" |
| `jobTitle` | job.title | "Senior Developer" |
| `companyName` | account.name | "Google" |
| `clientContactName` | contact.firstName | "Jane" |
| `billRate` | submission.billRate | "$105" |
| `availability` | candidate.availability | "Immediately" |
| `submissionNotes` | submission.submissionNotes | Bullet points |
| `resumeDownloadUrl` | signed URL | "https://..." |
| `recruiterName` | user.firstName + lastName | "Sarah Johnson" |
| `recruiterEmail` | user.email | "sarah@company.com" |
| `recruiterPhone` | user.phone | "(555) 123-4567" |

### Email Body Template

```html
Dear {clientContactName},

We have identified a strong candidate for your {jobTitle} position at {companyName}.

**Candidate Profile:**
- Name: {candidateName}
- Bill Rate: {billRate}/hr
- Availability: {availability}

**Key Qualifications:**
{submissionNotes}

**Resume:** [Download Resume]({resumeDownloadUrl})

Please let us know if you would like to proceed with this candidate for an interview.

Best regards,

{recruiterName}
{recruiterEmail}
{recruiterPhone}
```

---

## Resume Formatter Specification

### Feature: Create Formatted Resume Version

**Trigger:** User clicks "Create New Formatted Version" in Step 6

### Screen Mockup
```
+----------------------------------------------------------+
|                    Resume Formatter                   [×] |
+----------------------------------------------------------+
| Original Resume                 │ Formatted Preview       |
| ┌─────────────────────────────┐ │ ┌─────────────────────┐ |
| │ John Smith                  │ │ │ [Company Logo]      │ |
| │ john@email.com              │ │ │                     │ |
| │ (555) 123-4567              │ │ │ CANDIDATE PROFILE   │ |
| │ 123 Main St, City           │ │ │                     │ |
| │                             │ │ │ Professional with   │ |
| │ EXPERIENCE                  │ │ │ 7 years experience  │ |
| │ Meta - Senior Engineer      │ │ │                     │ |
| │ 2019 - Present              │ │ │ SKILLS              │ |
| └─────────────────────────────┘ │ │ • React             │ |
|                                 │ │ • Node.js           │ |
+----------------------------------------------------------+
| Formatting Options                                        |
| ☑ Remove personal phone number                           |
| ☑ Remove personal address                                |
| ☐ Remove LinkedIn/social profiles                        |
| ☑ Add company header/branding                            |
| ☐ Convert to ATS-friendly format                         |
|                                                           |
| Version Name: [Google - Formatted              ]         |
+----------------------------------------------------------+
|                    [Cancel]  [Save Formatted Version →]  |
+----------------------------------------------------------+
```

### Formatting Options

| Option | Default | Description |
|--------|---------|-------------|
| Remove personal phone | ✓ | Hides candidate's phone |
| Remove personal address | ✓ | Hides home address |
| Remove social profiles | ☐ | Hides LinkedIn, GitHub, etc. |
| Add company branding | ✓ | Adds staffing company header |
| ATS-friendly format | ☐ | Converts to plain text structure |

### Field Specification: Version Name
| Property | Value |
|----------|-------|
| Field Name | `versionName` |
| Type | Text Input |
| Required | Yes |
| Max Length | 100 characters |
| Suggestion | "{Client Name} - Formatted" |

---

## VMS Integration Specification

### Supported VMS Systems

| VMS | Integration Type | Status |
|-----|------------------|--------|
| Fieldglass | API + Portal | Active |
| Beeline | Portal Only | Active |
| Coupa | API | Planned |
| Vendor Neutral | Portal | Active |

### Configuration (Account Level)

```typescript
interface VMSConfig {
  vmsType: 'fieldglass' | 'beeline' | 'coupa' | 'vendor_neutral' | 'other';
  portalUrl: string;
  apiKey?: string; // For API integrations
  clientId?: string;
  mappings: {
    jobIdField: string;
    candidateFields: Record<string, string>;
  };
}
```

### VMS Submission Flow

1. User selects "VMS Portal Upload" in Step 11
2. System retrieves VMS config from account settings
3. **If API Integration:**
   - Auto-submit via API
   - Store VMS submission ID
   - Show success/failure
4. **If Portal Only:**
   - Open VMS portal in new tab
   - Pre-fill form data where possible
   - User completes submission manually
   - Returns to InTime, clicks "Confirm Submitted"

---

## AI Highlight Generation Specification

### Feature: Auto-Generate Candidate Highlights

**Trigger:** User clicks "Use AI to generate highlights" checkbox in Step 8

### Implementation

**Service:** OpenAI GPT-4 or Claude 3.5 Sonnet

**Prompt Template:**
```
You are an expert recruiter writing compelling candidate highlights for a client submission.

Generate 3-5 bullet points highlighting why this candidate is perfect for this role.

**Job Requirements:**
- Title: {jobTitle}
- Required Skills: {requiredSkills}
- Experience: {experienceYears} years
- Key Requirements: {jobDescription}

**Candidate Profile:**
- Name: {candidateName}
- Experience: {candidateExperience} years
- Skills: {candidateSkills}
- Recent Role: {currentTitle} at {currentCompany}
- Resume Summary: {resumeSummary}

**Instructions:**
- Write in third person
- Focus on matching skills and experience
- Highlight achievements with metrics if available
- Keep each bullet under 100 characters
- Be specific, not generic

**Output Format:**
Return as bullet points, one per line, starting with •
```

### Response Handling

```typescript
interface AIHighlightResponse {
  highlights: string[];
  confidence: number; // 0-1
  tokensUsed: number;
}
```

### UI Behavior

1. Show loading spinner: "Generating highlights..."
2. On success: Populate textarea with generated bullets
3. On failure: Show toast "AI generation failed. Please write manually."
4. User can edit before submitting
5. Track: `ai_highlights_used: boolean` on submission

### Cost & Limits

- ~500-1000 tokens per generation
- Rate limit: 10 AI generations per user per hour
- Fallback: Manual entry always available

---

## Enterprise & Multi-National Features

### Multi-Currency Submissions

Submission rates support multiple currencies:

| Field | Behavior |
|-------|----------|
| `payRateCurrency` | Candidate's preferred currency |
| `billRateCurrency` | Client's contract currency |
| `displayCurrency` | User's preferred view currency |

**Auto-Conversion:**
```
Pay Rate: C$120/hr (CAD)
Bill Rate: $150/hr (USD)
Margin: $38.50/hr USD (calculated at current exchange rate)
Exchange Rate: 1 CAD = 0.74 USD (as of submission date)
```

### Regional Submission Rules

| Region | VMS Integration | Default Method | Approval Workflow |
|--------|-----------------|----------------|-------------------|
| NA (US/Canada) | Fieldglass, Beeline | VMS Portal | Standard |
| EMEA | SAP Fieldglass | Email + Portal | Manager + Regional |
| APAC | Manual | Email | Regional Director |
| India | Direct | Email | Branch Manager |

### Compliance Checklist (Auto-Enforced)

Before submission, system validates:

| Region | Required Checks |
|--------|-----------------|
| **US** | Work authorization verified, EEOC data collected (optional) |
| **EU** | GDPR consent, right-to-work documented |
| **Canada** | SIN eligibility, provincial requirements |
| **UK** | Right-to-work share code verified |

### Multi-Language Support

Submission notes can be entered in multiple languages:

| Language | Auto-Translation |
|----------|------------------|
| English (EN) | Base language |
| French (FR-CA) | For Quebec clients |
| Spanish (ES) | For LATAM |

**Note:** Client-facing highlights auto-translated if client language differs from recruiter's language.

### Timezone-Aware Scheduling

All submission follow-ups scheduled in appropriate timezone:
- Recruiter tasks: Recruiter's timezone
- Client notifications: Client contact's timezone
- Candidate notifications: Candidate's timezone

### Audit & Compliance Trail

```json
{
  "submission_id": "uuid",
  "audit_events": [
    {
      "action": "submission.created",
      "timestamp": "2025-12-01T14:30:00Z",
      "user_id": "uuid",
      "ip": "192.168.1.1",
      "region": "NA-EAST",
      "compliance_checks_passed": ["work_auth", "rate_approval"]
    },
    {
      "action": "submission.sent_to_client",
      "timestamp": "2025-12-01T14:35:00Z",
      "delivery_method": "email",
      "recipient": "client@company.com"
    }
  ]
}
```

### Enterprise Rate Approval Matrix

| Margin % | NA | EMEA | APAC |
|----------|-----|------|------|
| < 15% | Pod Manager + CFO | Regional Director | Branch Manager + CFO |
| 15-20% | Pod Manager | Pod Manager | Branch Manager |
| 20-35% | Auto-approved | Auto-approved | Auto-approved |
| > 35% | Review (competitive) | Review | Review |

---

*Last Updated: 2024-12-01*





