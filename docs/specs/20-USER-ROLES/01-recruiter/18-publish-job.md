# Use Case: Publish Job (Draft to Active)

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-013 |
| Actor | Technical Recruiter, Recruiting Manager |
| Goal | Publish a draft job requisition to make it active and visible to the team |
| Frequency | 3-5 times per week |
| Estimated Time | 2-5 minutes |
| Priority | High (Critical workflow transition) |

---

## Preconditions

1. User is logged in as Technical Recruiter or Recruiting Manager
2. Job exists in "draft" status
3. User is the owner (R) or accountable (A) in RACI assignments
4. Job has all required fields completed:
   - Job title
   - Client account
   - Required skills (at least 1)
   - Bill rate range
5. User has "job.publish" permission

---

## Trigger

One of the following:
- Draft job fully reviewed and ready to start recruiting
- Client approved job requisition
- Manager approved draft created by recruiter
- Contract/MSA signed with client

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Job Detail

**User Action:** Click on draft job from Jobs list

**System Response:**
- Job detail view opens
- "Draft" badge displayed prominently in header
- "Publish Job" button visible in header actions

**Screen State:**
```
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                   [⋮]  |
| [DRAFT]  📝                                               |
+----------------------------------------------------------+
| RACI: R: John Smith  A: Sarah Jones (Manager)             |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Submissions] [Activity] [Files]   |
+----------------------------------------------------------+
| ⚠️ This job is in Draft status                           |
| Not visible to team members or sourcing                   |
|                                                           |
| [Publish Job]                           [Edit] [Delete]  |
+----------------------------------------------------------+
| Job Details                                               |
| 📍 New York, NY (Hybrid - 3 days/week)                   |
| 💰 $85-95/hr  📅 Target Fill: Jan 15, 2025               |
| 👤 Positions: 1  🔥 Priority: High                       |
|                                                           |
| Skills: Java, Spring Boot, AWS, Microservices            |
| Experience: 5-10 years                                    |
| Visa: US Citizen, Green Card, H1B                        |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Validate Job Completeness

**User Action:** Click "Publish Job" button

**System Response:**
- System validates job completeness
- If missing required fields: Shows validation modal
- If complete: Shows publishing confirmation modal

**Validation Checklist:**

| Category | Required Fields | Status |
|----------|----------------|--------|
| Basic Info | Title, Account, Job Type, Location | ✓ |
| Requirements | Required Skills (≥1), Description | ✓ |
| Compensation | Rate Min, Rate Type | ✓ |
| RACI | Responsible (R), Accountable (A) | ✓ |
| Client Contact | At least one contact assigned | ⚠️ |

**If Validation Fails:**

**Screen State:**
```
+----------------------------------------------------------+
|                     Cannot Publish Job                [×] |
+----------------------------------------------------------+
| This job is missing required information:                 |
|                                                           |
| ❌ Client Contact                                         |
|    Please add at least one client contact for this job   |
|                                                           |
| ❌ Job Description                                        |
|    Please add a job description (min 50 characters)      |
|                                                           |
| ✓ All other requirements met                             |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Fix Issues →]              |
+----------------------------------------------------------+
```

**User Action:** Click "Fix Issues"

**System Response:**
- Modal closes
- Focus jumps to first missing field
- User completes missing information
- Returns to Step 2

**Time:** ~1-5 minutes (if fixing issues)

---

### Step 3: Review Publishing Checklist

**User Action:** Review publishing checklist

**System Response:** Shows publishing confirmation modal

**Screen State:**
```
+----------------------------------------------------------+
|                      Publish Job?                     [×] |
+----------------------------------------------------------+
| You are about to publish this job:                        |
|                                                           |
| 📋 Senior Java Developer @ Acme Corp                      |
| 💰 $85-95/hr  📍 New York, NY                            |
|                                                           |
| Publishing will:                                          |
| ✓ Make job visible to all team members                   |
| ✓ Enable candidate sourcing and submissions              |
| ✓ Add job to active job boards (if configured)           |
| ✓ Trigger notifications to RACI stakeholders             |
| ✓ Start SLA tracking for time-to-fill                    |
|                                                           |
| Notifications will be sent to:                            |
| 👤 Sarah Jones (Accountable) - Email + Push              |
| 👤 Mike Brown (Consulted) - Email                        |
| 👤 Lisa Chen (COO, Informed) - Email                     |
| 📧 recruiting-team@company.com - Team notification       |
|                                                           |
| Job Board Integrations:                                   |
| ☑ Indeed (auto-post)                                     |
| ☑ LinkedIn (auto-post)                                   |
| ☐ Monster (manual)                                       |
| ☐ Dice (manual)                                          |
|                                                           |
| Optional: Add Publishing Note                             |
| [Any special instructions for the team...              ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Publish Job ✓]             |
+----------------------------------------------------------+
```

**Field Specification: Publishing Note**
| Property | Value |
|----------|-------|
| Field Name | `publishingNote` |
| Type | Textarea |
| Label | "Publishing Note" |
| Placeholder | "Any special instructions for the team..." |
| Required | No |
| Max Length | 500 characters |
| Visibility | Internal only, appears in activity timeline |

**Time:** ~30 seconds

---

### Step 4: Confirm Publication

**User Action:** Click "Publish Job ✓" button

**System Response:**

1. **Button shows loading state** (spinner)
   - Text: "Publishing..."

2. **API Call:** `POST /api/trpc/jobs.publish`

3. **Backend Processing:**
   - Update job status: `draft` → `active`
   - Set `publishedAt` timestamp
   - Set `publishedBy` to current user
   - Update `activatedAt` for tracking
   - Create activity log entry
   - Send notifications to RACI stakeholders
   - Queue job board postings (if enabled)
   - Start SLA timer for time-to-fill

4. **On Success:**
   - Modal closes (300ms animation)
   - Toast notification: "Job published successfully" ✓ (green)
   - Job detail refreshes
   - Status badge changes: "Draft" → "Active" (green)
   - Activity timeline shows: "Job published by John Smith"
   - URL remains same: `/employee/workspace/jobs/{job-id}`

5. **On Error:**
   - Modal stays open
   - Error toast: "Failed to publish job: {error message}"
   - Button returns to normal state
   - User can retry

**Screen State After Success:**
```
+----------------------------------------------------------+
| Senior Java Developer @ Acme Corp                   [⋮]  |
| [ACTIVE] 🟢                                               |
+----------------------------------------------------------+
| RACI: R: John Smith  A: Sarah Jones (Manager)             |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Submissions] [Activity] [Files]   |
+----------------------------------------------------------+
| ✓ Job is now active                                      |
| Published on Nov 30, 2025 at 2:15 PM by John Smith       |
|                                                           |
| [Add Candidate] [Share Job] [Put On Hold] [Edit] [⋮]    |
+----------------------------------------------------------+
| Job Details                                               |
| 📍 New York, NY (Hybrid - 3 days/week)                   |
| 💰 $85-95/hr  📅 Target Fill: Jan 15, 2025               |
| 👤 Positions: 1  🔥 Priority: High                       |
|                                                           |
| Pipeline Summary:                                         |
| Sourced: 0  |  Screening: 0  |  Submitted: 0  |  Active   |
+----------------------------------------------------------+
```

**Time:** ~2-5 seconds

---

## Postconditions

1. ✅ Job status changed from `draft` to `active`
2. ✅ `publishedAt` timestamp set
3. ✅ `publishedBy` = current user ID
4. ✅ `activatedAt` timestamp set for SLA tracking
5. ✅ Activity logged: "job.published"
6. ✅ Notifications sent to RACI stakeholders:
   - R (Responsible): Push + Email
   - A (Accountable): Push + Email
   - C (Consulted): Email
   - I (Informed): Email digest (COO)
7. ✅ Job board integrations queued (if enabled)
8. ✅ Job visible in team job list
9. ✅ Candidate sourcing enabled
10. ✅ SLA timer started for time-to-fill metrics

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job.status_changed` | `{ job_id, old_status: 'draft', new_status: 'active', changed_by, changed_at }` |
| `job.published` | `{ job_id, published_by, published_at, publishing_note }` |
| `notification.sent` | `{ type: 'job_published', recipient_id, channel: 'email', sent_at }` (per recipient) |
| `job_board.queued` | `{ job_id, board: 'indeed', status: 'queued', queued_at }` (per board) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Missing required fields | "Cannot publish: {field} is required" | Complete missing fields |
| Already Published | Job already active | "This job is already published" | Refresh page |
| Permission Denied | User not R or A | "You don't have permission to publish this job" | Request approval from Manager |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Job Board Error | Integration failed | "Job published but board posting failed: {board}" | Manual post to board |
| Rate Limit | Too many publications | "Please wait before publishing another job" | Wait 30 seconds |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+P` | Publish job (from job detail) |
| `Esc` | Close modal |
| `Enter` | Confirm publish (when modal focused) |

---

## Alternative Flows

### A1: Publish and Share Externally

**At Step 4, after publishing:**

1. User clicks "Share Job" button
2. System shows sharing modal:
   - Public job link (shareable URL)
   - Email to candidates
   - Post to LinkedIn
   - Post to company careers page
3. User selects channels and shares
4. Links generated and posted

### A2: Publish with Job Board Selection

**At Step 3:**

1. User customizes job board settings
2. Unchecks boards they don't want
3. For manual boards, selects "I will post manually"
4. Publishes with custom board settings

### A3: Scheduled Publication

**At Step 3:**

1. User clicks "Schedule Publication"
2. Selects future date/time
3. Job queued for auto-publication
4. Status: `draft` → `scheduled`
5. At scheduled time, auto-publishes

**Field Specification: Scheduled Publication**
| Property | Value |
|----------|-------|
| Field Name | `scheduledPublishAt` |
| Type | DateTime Picker |
| Label | "Publish At" |
| Min Date | Now + 15 minutes |
| Max Date | Now + 30 days |
| Required | Yes (if scheduling) |

### A4: Publish Requiring Manager Approval

**If organization setting: `require_manager_approval = true`**

**At Step 4:**

1. Instead of "Publish Job", button says "Request Approval"
2. User clicks "Request Approval"
3. System sends notification to Manager (A)
4. Job status: `draft` → `pending_approval`
5. Manager receives approval request
6. Manager reviews and approves/rejects
7. If approved: Auto-publishes
8. If rejected: Returns to draft with feedback

**Field Specification: Approval Request**
| Property | Value |
|----------|-------|
| Field Name | `approvalRequestNote` |
| Type | Textarea |
| Label | "Note to Approver" |
| Placeholder | "Why this job should be published..." |
| Required | Yes (if approval required) |
| Max Length | 500 characters |

---

## RACI Assignments

| Action | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Initiate Publish | Job Owner (Recruiter) | Pod Manager | Secondary Recruiter | - |
| Validate Job | System | - | - | - |
| Approve (if required) | - | Pod Manager | Regional Director | - |
| Execute Publish | System | Job Owner | - | COO |
| Notify Stakeholders | System | - | - | All RACI + Team |
| Post to Job Boards | System | Job Owner | - | - |

---

## Notifications

### Email: Job Published (to RACI stakeholders)

**Subject Line:**
```
[Active Job] {jobTitle} @ {accountName} - Published by {publisherName}
```

**Template Variables:**
| Variable | Source | Example |
|----------|--------|---------|
| `jobTitle` | job.title | "Senior Java Developer" |
| `accountName` | account.name | "Acme Corp" |
| `publisherName` | user.firstName + lastName | "John Smith" |
| `publishedAt` | job.publishedAt | "Nov 30, 2025 2:15 PM" |
| `jobUrl` | Job detail URL | "https://app.intime.com/jobs/123" |
| `rateRange` | job.rateMin + rateMax | "$85-95/hr" |
| `targetFillDate` | job.targetFillDate | "Jan 15, 2025" |
| `publishingNote` | publishingNote | Optional note |

**Email Body Template:**

```html
Hi {recipientName},

A new job has been published and is ready for candidate sourcing:

**Job Details:**
- Title: {jobTitle}
- Client: {accountName}
- Location: {location}
- Rate: {rateRange}
- Target Fill Date: {targetFillDate}
- Priority: {priority}

**RACI Ownership:**
- Responsible: {responsibleName}
- Accountable: {accountableName}

{if publishingNote}
**Publisher's Note:**
{publishingNote}
{/if}

[View Job Details]({jobUrl})

Let's find the best candidates for this role!

---
Automated notification from InTime OS
```

### Push Notification (to R and A)

**Title:** "Job Published: {jobTitle}"
**Body:** "Published by {publisherName} - Start sourcing candidates"
**Action:** Open job detail page

---

## Job Board Integration

### Supported Job Boards

| Job Board | Integration Type | Auto-Post | Status |
|-----------|------------------|-----------|--------|
| Indeed | API | Yes | Active |
| LinkedIn Jobs | API | Yes | Active |
| Monster | API | No (manual) | Active |
| Dice | API | No (manual) | Active |
| Glassdoor | API | Yes | Planned |
| ZipRecruiter | API | Yes | Planned |
| Company Careers Page | Widget | Yes | Active |

### Job Board Posting Flow

**Automatic Posting (Indeed, LinkedIn):**

1. Job published in InTime
2. System queues job board posting
3. Background job processes queue (within 5 minutes)
4. POST to job board API with mapped data
5. Receive job board post ID
6. Store in `job_board_postings` table
7. If success: Log activity "Posted to {board}"
8. If failure: Create task "Manual post to {board}"

**Manual Posting (Monster, Dice):**

1. Job published in InTime
2. System creates task: "Post job to {board}"
3. Assigned to: Job Owner (R)
4. Task includes:
   - Pre-filled job description
   - Job board login link
   - Instructions for posting
5. User completes manual posting
6. User marks task complete
7. User enters job board post ID (optional)

### Job Board Posting Schema

**Table: job_board_postings**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `job_id` | UUID | FK → jobs.id |
| `board` | ENUM | 'indeed', 'linkedin', 'monster', 'dice', etc. |
| `external_post_id` | VARCHAR(255) | Job board's ID |
| `post_url` | TEXT | Public URL on job board |
| `status` | ENUM | 'queued', 'posted', 'failed', 'expired' |
| `posted_at` | TIMESTAMP | When posted |
| `expires_at` | TIMESTAMP | When posting expires |
| `auto_renew` | BOOLEAN | Auto-renew before expiry |
| `views` | INT | View count (if available from API) |
| `applies` | INT | Application count |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Job Board Data Mapping

**InTime → Indeed:**

| InTime Field | Indeed Field | Transform |
|--------------|--------------|-----------|
| job.title | jobTitle | Direct |
| job.description | jobDescription | HTML → Plain text |
| job.location | jobLocation | Parse to city, state |
| job.rateMin | salaryMin | Convert hourly → annual if needed |
| job.rateMax | salaryMax | Convert hourly → annual if needed |
| job.jobType | employmentType | Map: contract → CONTRACTOR |
| account.name | companyName | Direct |

---

## Metrics & Analytics

### Publishing Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Time in Draft** | How long job stayed in draft | `publishedAt - createdAt` |
| **Time to First Candidate** | Time from publish to first sourced candidate | `first_submission.createdAt - publishedAt` |
| **Publishing Success Rate** | % of drafts that get published | `(published_jobs / total_drafts) * 100` |
| **Average Draft-to-Publish Time** | Avg time across all jobs | `AVG(publishedAt - createdAt)` |

### SLA Tracking (Starts at Publication)

| SLA | Target | Escalation |
|-----|--------|------------|
| **Time to First Candidate** | 48 hours | Email to R + A |
| **Time to 3 Candidates** | 5 business days | Email to R + A + C |
| **Time to First Submission** | 7 business days | Escalate to Manager |
| **Time to Fill** | 30 calendar days | Escalate to Regional Director |

**SLA Start Time:** `publishedAt` timestamp

---

## Business Rules

### BR-01: Publication Requirements

- Job MUST have all required fields completed
- Job MUST have at least one required skill
- Job MUST have RACI assignments (R and A)
- Job MUST have at least one client contact
- Job MUST be in "draft" status

### BR-02: Permission Requirements

- User MUST be Responsible (R) OR Accountable (A) in RACI
- OR User MUST have "job.publish.any" permission (Manager+)
- User MUST have "job.publish" base permission

### BR-03: Status Transition Rules

- Draft → Active: Always allowed (if validation passes)
- Draft → Scheduled: Allowed if future date selected
- Scheduled → Active: Auto-transition at scheduled time
- Cannot publish if status = Cancelled or Filled

### BR-04: Notification Rules

- R (Responsible) receives: Push + Email (immediate)
- A (Accountable) receives: Push + Email (immediate)
- C (Consulted) receives: Email (within 15 minutes)
- I (Informed) receives: Email digest (end of day)
- Team channel receives: Slack/Teams notification (if integrated)

### BR-05: Job Board Posting Rules

- Auto-post ONLY if account.allowJobBoardPosting = true
- Respect client confidentiality settings
- If confidential: Do not include client name
- If blind posting: Use generic company description
- Expire postings when job status = Filled or Cancelled

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Publish job with all required fields | Job published successfully, status = active |
| TC-002 | Attempt publish with missing title | Error: "Job title is required" |
| TC-003 | Attempt publish with missing client contact | Error: "Client contact is required" |
| TC-004 | Publish as non-RACI user | Error: "Permission denied" |
| TC-005 | Publish already published job | Error: "Job already published" |
| TC-006 | Publish with job board integration | Job posted to Indeed + LinkedIn |
| TC-007 | Publish with publishing note | Note appears in activity timeline |
| TC-008 | Publish with scheduled date | Status = scheduled, auto-publishes at time |
| TC-009 | Network error during publish | Error toast, can retry |
| TC-010 | Cancel publish confirmation | Modal closes, job stays draft |
| TC-011 | Publish triggers notifications | All RACI stakeholders receive notifications |
| TC-012 | Publish starts SLA timer | activatedAt timestamp set |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/jobs.ts`
**Procedure:** `jobs.publish`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const publishJobInput = z.object({
  jobId: z.string().uuid(),
  publishingNote: z.string().max(500).optional(),
  jobBoardSettings: z.object({
    indeed: z.boolean().default(true),
    linkedin: z.boolean().default(true),
    monster: z.boolean().default(false),
    dice: z.boolean().default(false),
  }).optional(),
  scheduledPublishAt: z.date().min(new Date(Date.now() + 15 * 60 * 1000)).optional(), // Min 15 min future
});

export type PublishJobInput = z.infer<typeof publishJobInput>;
```

### Output Schema

```typescript
export const publishJobOutput = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['active', 'scheduled']),
  publishedAt: z.string().datetime().optional(),
  scheduledPublishAt: z.string().datetime().optional(),
  publishedBy: z.string().uuid(),
  jobBoardsQueued: z.array(z.string()).optional(),
  notificationsSent: z.number(),
});

export type PublishJobOutput = z.infer<typeof publishJobOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Check permissions
   const job = await db.query.jobs.findFirst({
     where: eq(jobs.id, input.jobId),
     with: {
       raciAssignments: true,
       account: true,
     },
   });

   if (!job) throw new TRPCError({ code: 'NOT_FOUND' });

   // Check user is R or A
   const isResponsible = job.raciAssignments.find(
     a => a.userId === ctx.userId && a.role === 'responsible'
   );
   const isAccountable = job.raciAssignments.find(
     a => a.userId === ctx.userId && a.role === 'accountable'
   );

   if (!isResponsible && !isAccountable && !ctx.user.permissions.includes('job.publish.any')) {
     throw new TRPCError({ code: 'FORBIDDEN' });
   }

   // Validate status
   if (job.status !== 'draft' && job.status !== 'scheduled') {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Job must be in draft status to publish'
     });
   }
   ```

2. **Validate Job Completeness** (~50ms)

   ```typescript
   const validationErrors = [];

   if (!job.title || job.title.length < 3) {
     validationErrors.push('Job title is required');
   }
   if (!job.requiredSkills || job.requiredSkills.length === 0) {
     validationErrors.push('At least one required skill is needed');
   }
   if (!job.rateMin) {
     validationErrors.push('Bill rate is required');
   }
   // Check client contact
   const hasContact = await db.query.accountContacts.findFirst({
     where: and(
       eq(accountContacts.accountId, job.accountId),
       eq(accountContacts.isActive, true)
     ),
   });
   if (!hasContact) {
     validationErrors.push('At least one client contact is required');
   }

   if (validationErrors.length > 0) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Validation failed',
       cause: validationErrors,
     });
   }
   ```

3. **Update Job Status** (~100ms)

   ```typescript
   const newStatus = input.scheduledPublishAt ? 'scheduled' : 'active';
   const publishedAt = input.scheduledPublishAt ? null : new Date();

   await db.update(jobs)
     .set({
       status: newStatus,
       publishedAt: publishedAt,
       publishedBy: ctx.userId,
       activatedAt: publishedAt, // For SLA tracking
       scheduledPublishAt: input.scheduledPublishAt,
       updatedAt: new Date(),
     })
     .where(eq(jobs.id, input.jobId));
   ```

4. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, metadata,
     created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'job', $2,
     'published', 'Job published',
     jsonb_build_object(
       'publishing_note', $3,
       'scheduled', $4
     ),
     $5, NOW()
   );
   ```

5. **Send Notifications** (~200ms)

   ```typescript
   const raciUsers = await getRACIUsers(input.jobId);

   const notifications = [];

   // Responsible: Push + Email
   if (raciUsers.responsible) {
     notifications.push(
       sendPushNotification(raciUsers.responsible.id, {
         title: 'Job Published',
         body: `${job.title} is now active`,
         action: `/jobs/${job.id}`,
       }),
       sendEmail(raciUsers.responsible.email, 'job_published', { job }),
     );
   }

   // Accountable: Push + Email
   if (raciUsers.accountable) {
     notifications.push(
       sendPushNotification(raciUsers.accountable.id, {
         title: 'Job Published',
         body: `${job.title} is now active`,
         action: `/jobs/${job.id}`,
       }),
       sendEmail(raciUsers.accountable.email, 'job_published', { job }),
     );
   }

   // Consulted: Email
   for (const user of raciUsers.consulted) {
     notifications.push(
       sendEmail(user.email, 'job_published', { job }),
     );
   }

   // Informed: Email digest (queued)
   for (const user of raciUsers.informed) {
     notifications.push(
       queueDigestEmail(user.id, 'job_published', { job }),
     );
   }

   await Promise.all(notifications);
   ```

6. **Queue Job Board Postings** (~100ms)

   ```typescript
   const jobBoardsQueued = [];

   if (!input.scheduledPublishAt && job.account.allowJobBoardPosting) {
     const boards = input.jobBoardSettings || {
       indeed: true,
       linkedin: true,
       monster: false,
       dice: false,
     };

     for (const [board, enabled] of Object.entries(boards)) {
       if (enabled && AUTO_POST_BOARDS.includes(board)) {
         await db.insert(jobBoardPostings).values({
           id: randomUUID(),
           jobId: input.jobId,
           board,
           status: 'queued',
           createdAt: new Date(),
         });
         jobBoardsQueued.push(board);
       }
     }
   }
   ```

7. **Create Manual Post Tasks** (~50ms per board)

   ```typescript
   for (const [board, enabled] of Object.entries(boards)) {
     if (enabled && !AUTO_POST_BOARDS.includes(board)) {
       await db.insert(tasks).values({
         id: randomUUID(),
         orgId: job.orgId,
         title: `Post job to ${board}`,
         description: `Manually post "${job.title}" to ${board}`,
         entityType: 'job',
         entityId: input.jobId,
         assignedTo: raciUsers.responsible.id,
         priority: 'medium',
         status: 'pending',
         dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
         createdAt: new Date(),
       });
     }
   }
   ```

**Total Processing Time:** ~600-900ms

---

## Database Schema Reference

### Table: jobs (Updated Fields)

| Column | Type | Updated | Notes |
|--------|------|---------|-------|
| `status` | ENUM | Yes | Draft → Active or Scheduled |
| `publishedAt` | TIMESTAMP | Yes | When job was published |
| `publishedBy` | UUID | Yes | FK → user_profiles.id |
| `activatedAt` | TIMESTAMP | Yes | For SLA tracking |
| `scheduledPublishAt` | TIMESTAMP | Yes | If scheduled for future |

### Table: job_board_postings (New)

```sql
CREATE TABLE job_board_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  board VARCHAR(50) NOT NULL, -- 'indeed', 'linkedin', 'monster', 'dice'
  external_post_id VARCHAR(255), -- Job board's post ID
  post_url TEXT, -- Public URL on job board
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- 'queued', 'posted', 'failed', 'expired'
  posted_at TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  views INT DEFAULT 0,
  applies INT DEFAULT 0,
  error_message TEXT, -- If posting failed
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_board_postings_job ON job_board_postings(job_id);
CREATE INDEX idx_job_board_postings_status ON job_board_postings(status);
CREATE INDEX idx_job_board_postings_board ON job_board_postings(board);
```

---

## Accessibility

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | All actions accessible via keyboard shortcuts |
| Screen Reader | All buttons have aria-labels, status changes announced |
| Color Contrast | Status badges meet 4.5:1 contrast ratio |
| Focus Indicators | Clear focus states on all interactive elements |
| Error Messages | Error messages associated with fields via aria-describedby |

---

## Mobile Considerations

### Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile (< 640px) | Full-screen modal, stacked fields |
| Tablet (640-1024px) | Modal with side padding |
| Desktop (> 1024px) | Centered modal (max-width: 600px) |

### Touch Targets

- All buttons: Minimum 44x44px
- Checkboxes: 24x24px with 10px padding
- Links: Minimum 44px height

---

*Last Updated: 2025-11-30*
