# Use Case: Submit Weekly Timesheet

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EMP-002 |
| Actor | Any Employee (All Internal Staff) |
| Goal | Submit weekly timesheet for manager approval |
| Frequency | Weekly (every Friday by 5pm) |
| Estimated Time | 5-10 minutes per week |
| Priority | Critical |

---

## Preconditions

1. User is logged in as any employee (Recruiter, Bench Sales, Manager, HR, etc.)
2. Current week is active (Monday-Sunday period)
3. User has active employment record in system
4. Projects/clients exist for billable allocations (for recruiters/bench sales)

---

## Trigger

One of the following:
- Friday 9am automated reminder: "Your timesheet for week ending [date] is due today at 5pm"
- Thursday 3pm early reminder: "Don't forget to submit your timesheet tomorrow"
- Manager request: "Please submit your timesheet"
- Payroll cutoff approaching
- User proactively logs hours throughout the week

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Timesheets

**User Action:** Click "Timesheets" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/timesheets`
- Timesheets dashboard loads
- Loading skeleton shows for 200-500ms
- Current week timesheet shows at top

**Screen State:**
```
+----------------------------------------------------------+
| Timesheets                            [My Profile] [Cmd+K] |
+----------------------------------------------------------+
| Week Ending: Dec 8, 2024                    Status: Draft  |
|                                                            |
| ⚠️  Timesheet due today at 5:00 PM                        |
|                                                            |
| [Current Week] [Previous Weeks ▼]                         |
+----------------------------------------------------------+
| Recent Timesheets                                          |
| Week Ending    Hours    Status      Submitted   Approved   |
| ──────────────────────────────────────────────────────────|
| Dec 8, 2024    0/40     🟡 Draft    -           -         |
| Dec 1, 2024    40.0     🟢 Approved Nov 29      Dec 2     |
| Nov 24, 2024   32.0     🟢 Approved Nov 22      Nov 26    |
| Nov 17, 2024   40.0     🟢 Approved Nov 15      Nov 18    |
+----------------------------------------------------------+
| [Fill Current Week Timesheet →]                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Open Current Week Timesheet

**User Action:** Click "Fill Current Week Timesheet" button or click on current week row

**System Response:**
- Timesheet entry form loads
- Shows Monday-Sunday grid (current week)
- Pre-fills any previously saved draft entries
- Shows total hours (0/40 standard)
- Focus on Monday's first entry

**Screen State:**
```
+----------------------------------------------------------+
| Timesheet: Week Ending Dec 8, 2024          Status: Draft |
|                                                      [×]   |
+----------------------------------------------------------+
| Employee: John Smith (Recruiter)                          |
| Period: Monday, Dec 2 - Sunday, Dec 8, 2024               |
|                                                            |
+----------------------------------------------------------+
| Day       | Project/Client      | Category    | Hours      |
|-----------|---------------------|-------------|------------|
| Mon 12/2  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Tue 12/3  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Wed 12/4  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Thu 12/5  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Fri 12/6  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Sat 12/7  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Sun 12/8  | [+ Add entry]       |             |            |
|           |                     |             |            |
+----------------------------------------------------------+
| Daily Total:   0    0    0    0    0    0    0            |
| Weekly Total: 0 hours                                      |
| Standard: 40 hours | Overtime: 0 hours | PTO: 0 hours      |
+----------------------------------------------------------+
| [Save as Draft]  [Cancel]  [Submit for Approval →]       |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Add Monday Entry

**User Action:** Click "+ Add entry" for Monday

**System Response:**
- Inline entry row appears
- Shows dropdowns for Project/Client and Category
- Hours input field focused
- Notes field optional

**Screen State (Entry Row Expanded):**
```
+----------------------------------------------------------+
| Mon 12/2  | [Select project/client...           ▼] [×]   |
|           | [Select category...                 ▼]       |
|           | Hours: [____] (0.25-24.0)                     |
|           | Notes: [Optional description...           ]   |
|           | [Cancel]  [Add Entry ✓]                       |
+----------------------------------------------------------+
```

**User Action:**
1. Click "Select project/client" dropdown
2. Type "Google" to search
3. Select "Google - ATS Jobs" from list

**System Response:**
- Dropdown closes
- Selected project shows: "Google - ATS Jobs"
- Category dropdown enabled (filtered based on project type)

**Field Specification: Project/Client**
| Property | Value |
|----------|-------|
| Field Name | `projectId` or `accountId` |
| Type | Searchable Dropdown |
| Label | "Project/Client" |
| Required | Yes |
| Data Source | For Recruiters/Bench Sales: Active `accounts` and `jobs` user is assigned to |
| | For Support roles: Internal projects + "Admin", "Training" |
| Search Fields | `name`, `accountName`, `jobTitle` |
| Recent Items | Yes (last 5 used this week) |
| Display Format | Recruiters: `{account.name} - {job.title}` (if specific job) |
| | Support: `{project.name}` |
| Error Messages | |
| - Not selected | "Please select a project or client" |

**Time:** ~5 seconds

---

### Step 4: Select Category

**User Action:** Click "Select category" dropdown

**System Response:**
- Shows category options based on project type
- For billable clients: "Billable" auto-selected
- For internal: Shows all categories

**User Action:** Select "Billable"

**Field Specification: Category**
| Property | Value |
|----------|-------|
| Field Name | `category` |
| Type | Dropdown (Select) |
| Label | "Category" |
| Required | Yes |
| Options | |
| - `billable` | "Billable" (client work) 💰 |
| - `non_billable` | "Non-Billable" (internal projects) |
| - `admin` | "Administrative" (emails, meetings) |
| - `training` | "Training" (Academy courses, learning) 📚 |
| - `pto` | "PTO - Paid Time Off" 🏖️ |
| - `sick` | "Sick Leave" 🏥 |
| - `holiday` | "Holiday" 🎉 |
| Default | Based on project: Client = billable, Internal = non_billable |
| Validation | PTO/Sick/Holiday = 8 hours only (full day) |

**Time:** ~2 seconds

---

### Step 5: Enter Hours

**User Action:** Type "8" in hours field (8 hours = full day)

**System Response:**
- Number appears in field
- Real-time validation: 0.25 minimum (15 min increments)
- Shows decimal if typed: "8.0"
- Daily total updates at bottom

**Field Specification: Hours**
| Property | Value |
|----------|-------|
| Field Name | `hours` |
| Type | Number Input (Decimal) |
| Label | "Hours" |
| Required | Yes |
| Min | 0.25 (15 minute increment) |
| Max | 24.0 (single day) |
| Step | 0.25 |
| Precision | 2 decimal places |
| Validation | |
| - Empty | "Hours required" |
| - Below min | "Minimum 0.25 hours (15 minutes)" |
| - Above max | "Maximum 24 hours per day" |
| - Invalid increment | "Hours must be in 15-minute increments (0.25)" |
| - Daily > 24 | "Total hours for a day cannot exceed 24" |
| Auto-calculate | Overtime flag if weekly total > 40 |

**Time:** ~2 seconds

---

### Step 6: Add Notes (Optional)

**User Action:** Type "Sourcing candidates for Senior Engineer role"

**System Response:**
- Text appears in notes field
- Character counter updates

**Field Specification: Notes**
| Property | Value |
|----------|-------|
| Field Name | `notes` |
| Type | Text Input |
| Label | "Notes" |
| Placeholder | "Optional description..." |
| Required | No |
| Max Length | 500 characters |
| Visibility | Visible to manager and HR during review |

**Time:** ~5 seconds

---

### Step 7: Save Entry

**User Action:** Click "Add Entry ✓" button

**System Response:**
- Entry saves inline
- Row collapses to show summary
- Daily total updates: Mon = 8 hours
- Weekly total updates: 8/40 hours
- "+ Add entry" button reappears for additional Monday entries
- Focus moves to Tuesday

**Screen State (After First Entry):**
```
+----------------------------------------------------------+
| Day       | Project/Client      | Category    | Hours      |
|-----------|---------------------|-------------|------------|
| Mon 12/2  | Google - ATS Jobs   | Billable    | 8.0   [✏️][🗑]|
|           | Notes: Sourcing candidates for Senior Engineer role |
|           | [+ Add another entry]                             |
|           |                                                   |
| Tue 12/3  | [+ Add entry]       |             |            |
|           |                     |             |            |
+----------------------------------------------------------+
| Daily Total:   8    0    0    0    0    0    0            |
| Weekly Total: 8 hours                                      |
| Standard: 40 hours | Overtime: 0 hours | PTO: 0 hours      |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 8: Quick Add Pattern for Full Week

**User Action:** For Tuesday through Friday, add similar entries:
- Tue: Google - ATS Jobs, Billable, 8 hours
- Wed: Meta - Product Manager, Billable, 6 hours + Admin, 2 hours
- Thu: Google - ATS Jobs, Billable, 7 hours + Training (Academy), 1 hour
- Fri: Google - ATS Jobs, Billable, 8 hours

**System Response:**
- Each entry saved
- Running totals update
- Progress bar shows: 40/40 hours (100%)

**Screen State (Week Filled):**
```
+----------------------------------------------------------+
| Timesheet: Week Ending Dec 8, 2024          Status: Draft |
+----------------------------------------------------------+
| Employee: John Smith (Recruiter)                          |
| Period: Monday, Dec 2 - Sunday, Dec 8, 2024               |
|                                                            |
| Progress: [████████████████████████] 40/40 hours (100%)   |
+----------------------------------------------------------+
| Day       | Project/Client      | Category    | Hours      |
|-----------|---------------------|-------------|------------|
| Mon 12/2  | Google - ATS Jobs   | Billable    | 8.0   [✏️][🗑]|
|           | [+ Add another entry]                             |
|           |                                                   |
| Tue 12/3  | Google - ATS Jobs   | Billable    | 8.0   [✏️][🗑]|
|           | [+ Add another entry]                             |
|           |                                                   |
| Wed 12/4  | Meta - Product Mgr  | Billable    | 6.0   [✏️][🗑]|
|           | Administrative      | Admin       | 2.0   [✏️][🗑]|
|           | [+ Add another entry]                             |
|           |                                                   |
| Thu 12/5  | Google - ATS Jobs   | Billable    | 7.0   [✏️][🗑]|
|           | Academy Training    | Training    | 1.0   [✏️][🗑]|
|           | [+ Add another entry]                             |
|           |                                                   |
| Fri 12/6  | Google - ATS Jobs   | Billable    | 8.0   [✏️][🗑]|
|           | [+ Add another entry]                             |
|           |                                                   |
| Sat 12/7  | [+ Add entry]       |             |            |
|           |                     |             |            |
| Sun 12/8  | [+ Add entry]       |             |            |
|           |                     |             |            |
+----------------------------------------------------------+
| Daily Total:   8    8    8    8    8    0    0            |
|                                                            |
| Summary                                                    |
| ├─ Billable:         37.0 hours (92.5%)                   |
| ├─ Administrative:    2.0 hours (5.0%)                    |
| ├─ Training:          1.0 hours (2.5%)                    |
| ├─ Non-Billable:      0.0 hours                           |
| └─ PTO/Leave:         0.0 hours                           |
|                                                            |
| Weekly Total: 40.0 hours                                   |
| Standard: 40.0 hours | Overtime: 0.0 hours                 |
|                                                            |
| ✅ Ready to submit (meets 40-hour requirement)            |
+----------------------------------------------------------+
| [Save as Draft]  [Cancel]  [Submit for Approval →]       |
+----------------------------------------------------------+
```

**Time:** ~3 minutes (for full week entry)

---

### Step 9: Review Timesheet Summary

**User Action:** Scroll to review summary section

**System Response:**
- Shows breakdown by category
- Highlights any issues:
  - ⚠️ Warning if < 40 hours (unless PTO)
  - ⚠️ Warning if > 40 hours (overtime requires approval note)
  - ✅ Green checkmark if exactly 40 hours or 40 + approved PTO
- Shows billable utilization % (important for recruiters)

**Validation Rules:**
| Condition | Validation | Message |
|-----------|-----------|---------|
| Total < 40 hours | Warning | "⚠️ Week is under 40 hours. Add PTO or explain in notes." |
| Total > 40 hours | Requires explanation | "⚠️ Overtime detected (X hours). Manager approval required." |
| Total = 40 hours | Valid | "✅ Ready to submit" |
| PTO/Sick full day | Must be 8 hours | "PTO/Sick leave must be full day (8 hours)" |
| No entries | Error | "Cannot submit empty timesheet" |
| Billable < 30 hours | Warning for recruiters | "⚠️ Billable utilization low (X%). Expected: 75%+" |

**Time:** ~30 seconds

---

### Step 10: Add Overtime Explanation (If Applicable)

**Screen State (If Overtime Detected):**
```
+----------------------------------------------------------+
| ⚠️  Overtime Hours Detected                              |
+----------------------------------------------------------+
| You have logged 42.0 hours (2.0 hours overtime).         |
| Please provide an explanation for manager review:        |
|                                                           |
| Overtime Notes *                                          |
| [Working on urgent Google requisition with tight       ] |
| [deadline. Client requested 2 extra hours Wed/Thu.    ] |
| [                                               ] 32/500  |
|                                                           |
| Manager approval required before timesheet is finalized.  |
+----------------------------------------------------------+
```

**Field Specification: Overtime Notes**
| Property | Value |
|----------|-------|
| Field Name | `overtimeNotes` |
| Type | Textarea |
| Label | "Overtime Notes" |
| Required | Yes (if overtime hours > 0) |
| Max Length | 500 characters |
| Validation | Cannot submit with overtime without notes |

**Time:** ~20 seconds (if overtime)

---

### Step 11: Submit for Approval

**User Action:** Click "Submit for Approval →" button

**System Response:**
1. Final validation check:
   - All entries have project/category
   - Hours are valid (0.25 increments)
   - Overtime has explanation if applicable
   - Total hours reasonable (0-60 range)
2. Confirmation dialog appears

**Screen State (Confirmation):**
```
+----------------------------------------------------------+
| Submit Timesheet for Approval?                            |
+----------------------------------------------------------+
| Week Ending: Dec 8, 2024                                  |
| Total Hours: 40.0                                         |
|                                                            |
| Breakdown:                                                 |
| • Billable: 37.0 hours                                    |
| • Administrative: 2.0 hours                               |
| • Training: 1.0 hours                                     |
|                                                            |
| Your manager (Sarah Johnson) will be notified for approval.|
|                                                            |
| ⚠️  Once submitted, you cannot edit until returned.      |
|                                                            |
| Proceed with submission?                                   |
|                                                            |
+----------------------------------------------------------+
|                           [Cancel]  [Yes, Submit →]       |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 12: Confirm Submission

**User Action:** Click "Yes, Submit →" button

**System Response:**
1. Button shows loading spinner
2. API call: `POST /api/trpc/timesheets.submit`
3. Updates timesheet status: `draft` → `pending_approval`
4. Sets `submittedAt = now()`
5. Sets `submittedBy = current_user`
6. Sends notification to manager
7. Locks timesheet from editing
8. On success:
   - Modal/form closes
   - Toast notification: "Timesheet submitted successfully" (green)
   - Email sent to manager: "Timesheet pending approval from [Employee Name]"
   - Email confirmation to employee: "Your timesheet was submitted"
   - Status updates to "Pending Approval" 🟡
   - Returns to timesheets list

**Screen State (After Submission):**
```
+----------------------------------------------------------+
| Timesheets                            [My Profile] [Cmd+K] |
+----------------------------------------------------------+
| ✅ Timesheet submitted for week ending Dec 8, 2024       |
|                                                            |
| [Current Week] [Previous Weeks ▼]                         |
+----------------------------------------------------------+
| Recent Timesheets                                          |
| Week Ending    Hours    Status           Submitted  Appr   |
| ──────────────────────────────────────────────────────────|
| Dec 8, 2024    40.0     🟡 Pending      Dec 6, 2pm  -     |
| Dec 1, 2024    40.0     🟢 Approved     Nov 29      Dec 2 |
| Nov 24, 2024   32.0     🟢 Approved     Nov 22      Nov 26|
| Nov 17, 2024   40.0     🟢 Approved     Nov 15      Nov 18|
+----------------------------------------------------------+
| Next timesheet opens Monday, Dec 9, 2024                  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

## Postconditions

1. ✅ Timesheet record updated with `status = 'pending_approval'`
2. ✅ `submittedAt` timestamp set
3. ✅ Timesheet locked from employee editing
4. ✅ Manager notified via email and in-app notification
5. ✅ Activity logged: "timesheet.submitted"
6. ✅ Billable hours tracked for revenue calculations
7. ✅ Hours allocated to projects/accounts for utilization reports
8. ✅ Employee cannot create new timesheet for same week

---

## Events Logged

| Event | Payload |
|-------|---------|
| `timesheet.submitted` | `{ timesheet_id, employee_id, week_ending, total_hours, billable_hours, status, submitted_at }` |
| `notification.sent` | `{ recipient: manager_id, type: 'timesheet_approval_needed', timesheet_id }` |
| `timesheet.locked` | `{ timesheet_id, locked_at, locked_by }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Empty Timesheet | No entries added | "Cannot submit empty timesheet. Please add at least one entry." | Add entries |
| Under 40 Hours (No PTO) | Total < 40, no PTO | "Week is under 40 hours. Please add PTO or provide explanation." | Add PTO or note |
| Missing Overtime Notes | OT > 0, no explanation | "Overtime requires manager approval. Please add explanation." | Add notes |
| Invalid Hours | Hours not in 0.25 increments | "Hours must be in 15-minute increments (0.25)" | Adjust hours |
| Duplicate Submission | Already submitted for week | "Timesheet for this week already submitted" | View existing |
| Past Week Locked | Trying to submit old week | "This week's deadline has passed. Contact HR." | Contact HR |
| Network Error | API failure | "Submission failed. Please try again." | Retry |
| Project Not Found | Deleted project/account | "One or more projects are no longer active" | Update entries |

---

## Alternative Flows

### A1: Save as Draft (Partial Completion)

At any step, if user clicks "Save as Draft":

1. System validates entered data (no submission validation)
2. Saves timesheet with `status = 'draft'`
3. User can close and return later
4. Toast: "Draft saved. You can complete and submit by Friday 5pm."
5. Reminder sent Thursday if still draft

**Time:** ~1 second

---

### A2: Manager Rejects Timesheet

After submission, if manager rejects:

1. Employee receives email: "Timesheet returned for corrections"
2. Status changes: `pending_approval` → `returned`
3. Timesheet unlocks for editing
4. Shows manager's rejection notes
5. Employee makes corrections
6. Re-submits (goes through Step 11-12 again)

**Screen State (Returned Timesheet):**
```
+----------------------------------------------------------+
| ⚠️  Timesheet Returned for Corrections                   |
+----------------------------------------------------------+
| Week Ending: Dec 8, 2024                                  |
| Returned by: Sarah Johnson (Manager)                      |
| Date: Dec 7, 2024 10:23 AM                                |
|                                                            |
| Manager's Notes:                                           |
| "Please split the 8 hours on Wednesday between Google     |
| and Meta accounts. You worked on both that day."          |
|                                                            |
| [Edit Timesheet] [Contact Manager]                        |
+----------------------------------------------------------+
```

---

### A3: PTO Day Entry

For full PTO day:

**User Action:** Click "+ Add entry" for a day, select "PTO - Paid Time Off"

**System Response:**
- Hours auto-fills to "8.0" (locked)
- Project/Client dropdown disabled (not applicable)
- PTO reason field appears (optional)

**Screen State (PTO Entry):**
```
+----------------------------------------------------------+
| Mon 12/2  | Category: [PTO - Paid Time Off  ▼]            |
|           | Hours: [8.0] (auto-filled, full day)          |
|           | PTO Type: [Vacation ▼]                         |
|           | Notes: [Optional reason...              ]     |
|           | [Cancel]  [Add Entry ✓]                       |
+----------------------------------------------------------+
```

**Field Specification: PTO Type**
| Property | Value |
|----------|-------|
| Field Name | `ptoType` |
| Type | Dropdown |
| Required | Yes (if category = PTO) |
| Options | |
| - `vacation` | "Vacation" |
| - `personal` | "Personal Day" |
| - `bereavement` | "Bereavement" |
| - `jury_duty` | "Jury Duty" |
| - `other` | "Other" |

---

### A4: Copy Previous Week

**User Action:** Click "Copy from Last Week" button (if available)

**System Response:**
1. Loads previous week's entries
2. Copies all project/category/hours to current week
3. Adjusts dates to current week
4. Sets status to "draft"
5. User reviews and adjusts as needed

**Time:** ~5 seconds (saves ~2 minutes of data entry)

---

## Manager Approval Flow (Separate Use Case)

After employee submits:

1. Manager receives notification
2. Manager opens "Timesheets Pending Approval" screen
3. Reviews entries, hours, notes
4. Checks billable utilization
5. Either:
   - **Approves:** Status → `approved`, locks permanently
   - **Rejects:** Status → `returned`, adds notes, unlocks for employee
6. Employee notified of decision

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+S` | Save as draft |
| `Cmd+Enter` | Submit for approval |
| `Esc` | Cancel/close |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+D` | Duplicate previous day's entry |
| `Cmd+C` | Copy week |

---

## Related Use Cases

- [UC-MGR-005](../05-manager/05-approve-timesheet.md) - Manager Approves Timesheets
- [UC-HR-008](./08-payroll-processing.md) - Payroll Processing from Timesheets
- [UC-EMP-003](./22-view-timesheet-history.md) - View Timesheet History

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit 40-hour week (no overtime) | Submits successfully |
| TC-002 | Submit with 42 hours (no OT notes) | Error: "Overtime requires explanation" |
| TC-003 | Submit with 38 hours (no PTO) | Warning: "Under 40 hours" |
| TC-004 | Add full PTO day (8 hours) | Auto-fills 8 hours, validates |
| TC-005 | Submit empty timesheet | Error: "Cannot submit empty timesheet" |
| TC-006 | Save draft, return later | Draft preserved, can edit |
| TC-007 | Manager rejects, employee edits | Status → returned, unlocks |
| TC-008 | Submit on Friday at 4:59pm | Success (before deadline) |
| TC-009 | Submit on Friday at 5:01pm | Warning: "Past deadline, notify manager" |
| TC-010 | Edit after submission | Error: "Timesheet locked" |
| TC-011 | Add 0.5 hour increment | Validates (15-min increments) |
| TC-012 | Add 0.3 hour increment | Error: "Must be 0.25 increments" |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/timesheets.ts`
**Procedure:** `timesheets.submit`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const timesheetEntryInput = z.object({
  date: z.date(),
  projectId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  category: z.enum([
    'billable', 'non_billable', 'admin', 'training',
    'pto', 'sick', 'holiday'
  ]),
  hours: z.number().multipleOf(0.25).min(0.25).max(24),
  notes: z.string().max(500).optional(),
  ptoType: z.enum(['vacation', 'personal', 'bereavement', 'jury_duty', 'other']).optional(),
});

export const submitTimesheetInput = z.object({
  weekEnding: z.date(), // Sunday of the week
  entries: z.array(timesheetEntryInput).min(1, "At least one entry required"),
  overtimeNotes: z.string().max(500).optional(),
});

export type SubmitTimesheetInput = z.infer<typeof submitTimesheetInput>;
```

### Output Schema

```typescript
export const submitTimesheetOutput = z.object({
  timesheetId: z.string().uuid(),
  status: z.literal('pending_approval'),
  totalHours: z.number(),
  billableHours: z.number(),
  overtimeHours: z.number(),
  submittedAt: z.string().datetime(),
});

export type SubmitTimesheetOutput = z.infer<typeof submitTimesheetOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Check permissions
   const hasPermission = ctx.user.role === 'employee';
   if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate week not already submitted
   const existing = await db.query.timesheets.findFirst({
     where: and(
       eq(timesheets.employeeId, ctx.user.id),
       eq(timesheets.weekEnding, input.weekEnding),
       inArray(timesheets.status, ['pending_approval', 'approved'])
     )
   });

   if (existing) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Timesheet already submitted for this week'
     });
   }

   // Validate hours
   const totalHours = input.entries.reduce((sum, e) => sum + e.hours, 0);
   if (totalHours > 40 && !input.overtimeNotes) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Overtime requires explanation'
     });
   }

   // Validate PTO is full day
   const ptoEntries = input.entries.filter(e =>
     ['pto', 'sick', 'holiday'].includes(e.category)
   );
   const invalidPto = ptoEntries.find(e => e.hours !== 8);
   if (invalidPto) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'PTO/Sick/Holiday must be full day (8 hours)'
     });
   }
   ```

2. **Create Timesheet Record** (~100ms)

   ```sql
   INSERT INTO timesheets (
     id, org_id, employee_id, week_ending,
     status, total_hours, billable_hours, overtime_hours,
     overtime_notes, submitted_at, submitted_by,
     created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3,
     'pending_approval', $4, $5, $6,
     $7, NOW(), $2,
     NOW(), NOW()
   ) RETURNING id;
   ```

3. **Create Timesheet Entries** (~100ms)

   ```sql
   INSERT INTO timesheet_entries (
     id, timesheet_id, entry_date,
     project_id, account_id, job_id,
     category, hours, notes, pto_type,
     created_at
   )
   SELECT
     gen_random_uuid(), $1, unnest($2::date[]),
     unnest($3::uuid[]), unnest($4::uuid[]), unnest($5::uuid[]),
     unnest($6::text[]), unnest($7::numeric[]), unnest($8::text[]), unnest($9::text[]),
     NOW();
   ```

4. **Get Manager** (~50ms)

   ```sql
   SELECT manager_id
   FROM user_profiles
   WHERE id = $1 AND org_id = $2;
   ```

5. **Send Notification** (~100ms)

   ```sql
   INSERT INTO notifications (
     id, org_id, user_id, type,
     title, message, entity_type, entity_id,
     created_at, read_at
   ) VALUES (
     gen_random_uuid(), $1, $2, 'timesheet_approval_needed',
     'Timesheet Pending Approval',
     $3 || ' submitted timesheet for week ending ' || $4,
     'timesheet', $5,
     NOW(), NULL
   );
   ```

6. **Send Email** (~200ms)

   ```typescript
   await sendEmail({
     to: manager.email,
     subject: `Timesheet Pending Approval - ${employee.fullName}`,
     template: 'timesheet-approval-needed',
     data: {
       employeeName: employee.fullName,
       weekEnding: input.weekEnding,
       totalHours,
       billableHours,
       timesheetUrl: `${baseUrl}/manager/timesheets/${timesheetId}`
     }
   });
   ```

7. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, created_by, created_at, metadata
   ) VALUES (
     gen_random_uuid(), $1, 'timesheet', $2,
     'submitted', 'Timesheet submitted for approval', $3, NOW(), $4::jsonb
   );
   ```

---

## Database Schema Reference

### Table: timesheets

**File:** `src/lib/db/schema/hr.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `employee_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `week_ending` | DATE | NOT NULL | Sunday of the week |
| `status` | ENUM | NOT NULL | 'draft', 'pending_approval', 'approved', 'returned' |
| `total_hours` | DECIMAL(5,2) | NOT NULL | Sum of all entries |
| `billable_hours` | DECIMAL(5,2) | DEFAULT 0 | Sum of billable entries |
| `non_billable_hours` | DECIMAL(5,2) | DEFAULT 0 | |
| `pto_hours` | DECIMAL(5,2) | DEFAULT 0 | |
| `overtime_hours` | DECIMAL(5,2) | DEFAULT 0 | Hours over 40 |
| `overtime_notes` | TEXT | | Required if overtime > 0 |
| `submitted_at` | TIMESTAMP | | When submitted for approval |
| `submitted_by` | UUID | FK → user_profiles.id | Usually = employee_id |
| `approved_at` | TIMESTAMP | | When manager approved |
| `approved_by` | UUID | FK → user_profiles.id | Manager who approved |
| `returned_at` | TIMESTAMP | | If rejected |
| `returned_by` | UUID | FK → user_profiles.id | Manager who rejected |
| `return_notes` | TEXT | | Manager's rejection reason |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

### Table: timesheet_entries

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `timesheet_id` | UUID | FK → timesheets.id, NOT NULL | |
| `entry_date` | DATE | NOT NULL | Specific day (Mon-Sun) |
| `project_id` | UUID | FK → projects.id | Internal project |
| `account_id` | UUID | FK → accounts.id | Client account |
| `job_id` | UUID | FK → jobs.id | Specific job (for recruiters) |
| `category` | ENUM | NOT NULL | 'billable', 'non_billable', etc. |
| `hours` | DECIMAL(4,2) | NOT NULL | 0.25-24.0 |
| `notes` | TEXT | | Max 500 chars |
| `pto_type` | ENUM | | If category = PTO |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_timesheets_employee_week
  ON timesheets(org_id, employee_id, week_ending);

CREATE INDEX idx_timesheets_status
  ON timesheets(org_id, status, week_ending);

CREATE INDEX idx_timesheet_entries_timesheet
  ON timesheet_entries(timesheet_id);

CREATE INDEX idx_timesheet_entries_date
  ON timesheet_entries(entry_date);
```

---

## Business Rules

### Billable Utilization Targets

| Role | Billable Target | Warning Threshold |
|------|----------------|-------------------|
| Recruiter | 75%+ (30/40 hours) | < 70% |
| Bench Sales | 75%+ (30/40 hours) | < 70% |
| Manager | 50%+ (20/40 hours) | < 40% |
| HR/Admin | 0% (all non-billable) | N/A |
| Executive | 0% (all non-billable) | N/A |

### PTO Accrual Rules

- Standard: 15 days/year (120 hours)
- Accrued: 10 hours/month
- Max balance: 240 hours (rollover limit)
- PTO requires manager pre-approval via separate workflow

### Overtime Policy

- Overtime (>40 hours/week) requires manager pre-approval
- Time-and-a-half pay for non-exempt employees
- Comp time for exempt employees (case-by-case)

---

## Notification Schedule

| Event | When | Recipient | Channel |
|-------|------|-----------|---------|
| Draft Reminder | Thursday 3pm | Employee (if no submission) | Email + In-app |
| Due Reminder | Friday 9am | Employee (if no submission) | Email + In-app |
| Submitted | Immediately after submit | Manager | Email + In-app |
| Approved | When manager approves | Employee | Email + In-app |
| Returned | When manager rejects | Employee | Email + In-app |
| Overdue | Monday 9am (if not submitted) | Employee + Manager | Email + In-app |

---

*Last Updated: 2024-11-30*
