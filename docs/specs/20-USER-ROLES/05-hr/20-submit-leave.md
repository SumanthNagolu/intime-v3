# Use Case: Submit Leave Request

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EMP-001 |
| Actor | Any Employee (All internal staff) |
| Goal | Submit a leave request for PTO, sick time, or other leave types |
| Frequency | 2-5 times per month per employee |
| Estimated Time | 3-8 minutes |
| Priority | High (Employee self-service) |

---

## Preconditions

1. User is logged in as any internal employee (Recruiter, Bench Sales, Manager, HR, etc.)
2. User has an active employment record in the system
3. User's leave balance is initialized (PTO accruals calculated)
4. User has access to their employee profile

---

## Trigger

One of the following:
- Employee plans vacation or personal time off
- Employee needs sick leave
- Family emergency or bereavement
- Parental leave (maternity/paternity)
- Jury duty or other legal obligation
- Medical appointment requiring time off
- Extended leave for personal reasons

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Leave Management

**User Action:** Click profile icon → "My Leaves" in header dropdown

OR

**User Action:** Click "HR" in sidebar → "My Leaves" tab

OR

**User Action:** Press `Cmd+K` and type "request leave"

**System Response:**
- URL changes to: `/employee/workspace/hr/leaves`
- Leave management dashboard loads
- Shows leave balance summary
- Shows recent leave requests (pending, approved, denied)

**Screen State:**
```
+----------------------------------------------------------+
| My Leaves                              [+ Request Leave] |
+----------------------------------------------------------+
| Leave Balances                                            |
| ┌────────────────────────────────────────────────────────┐
| │ PTO:          80 hrs available (120 total, 40 used)   │
| │ Sick:         40 hrs available (40 total, 0 used)     │
| │ Personal:     16 hrs available (16 total, 0 used)     │
| │ Next Accrual: 8 hrs on Dec 1, 2024                    │
| └────────────────────────────────────────────────────────┘
|                                                           |
| [Upcoming] [History] [All]                                |
+----------------------------------------------------------+
| Status    Type    Dates              Days/Hrs   Approver  |
| ──────────────────────────────────────────────────────────|
| Pending   PTO     Dec 20-22, 2024    24 hrs    Manager   |
| Approved  Sick    Nov 15, 2024       8 hrs     Auto      |
| Approved  PTO     Oct 10-14, 2024    40 hrs    Manager   |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Click "Request Leave" Button

**User Action:** Click "+ Request Leave" button in top-right corner

**System Response:**
- Modal slides in from right (300ms animation)
- Modal title: "Submit Leave Request"
- First field (Leave Type) is focused
- Form displays with current date pre-selected

**Screen State:**
```
+----------------------------------------------------------+
|                                    Submit Leave Request   |
|                                                      [×]  |
+----------------------------------------------------------+
| Leave Type *                                              |
| [Select type...                                     ▼]    |
|                                                           |
| Date Range *                                              |
| Start: [MM/DD/YYYY                            📅]         |
| End:   [MM/DD/YYYY                            📅]         |
|                                                           |
| Duration *                                                |
| ○ Full Day(s)  ○ Half Day  ○ Custom Hours                |
|                                                           |
| Total: 0 hours                                            |
|                                                           |
| Reason *                                                  |
| [                                                      ]  |
| [                                                      ]  |
| [                                               ] 0/500   |
|                                                           |
| Coverage Plan (required if >2 days)                       |
| Backup: [Select team member...                     ▼]     |
| [                                                      ]  |
| [                                               ] 0/500   |
|                                                           |
| Attachments (optional)                                    |
| [+ Upload]                                                |
|                                                           |
+----------------------------------------------------------+
|     [Cancel]  [Check Availability]  [Submit Request →]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Select Leave Type

**User Action:** Click "Leave Type" dropdown

**System Response:**
- Dropdown opens showing all available leave types
- Types are color-coded by category
- Shows available balance next to each type (if applicable)

**Leave Type Options:**
```
+------------------------------------------+
| 🟦 PTO (80 hrs available)               |
| 🟩 Sick Leave (40 hrs available)        |
| 🟨 Personal Day (16 hrs available)      |
| 🟪 Bereavement (As needed)              |
| 🟧 Jury Duty (As needed)                |
| 🟥 Parental Leave (As needed)           |
| ⬜ Unpaid Leave (As needed)             |
+------------------------------------------+
```

**User Action:** Click "PTO"

**System Response:**
- Dropdown closes
- Field shows: "PTO (80 hrs available)"
- Balance reminder appears below field
- If balance is low, warning icon shows

**Field Specification: Leave Type**
| Property | Value |
|----------|-------|
| Field Name | `leaveType` |
| Type | Dropdown (Select) |
| Label | "Leave Type" |
| Required | Yes |
| Options | |
| - `pto` | "PTO" (Paid Time Off) |
| - `sick` | "Sick Leave" |
| - `personal` | "Personal Day" |
| - `bereavement` | "Bereavement" |
| - `jury_duty` | "Jury Duty" |
| - `parental` | "Parental Leave" |
| - `unpaid` | "Unpaid Leave" |
| Display | Shows available balance |
| Error Messages | |
| - Not selected | "Please select a leave type" |

**Business Rules by Type:**
| Type | Auto-Approve | Requires Manager | Requires HR | Max Without Approval |
|------|--------------|------------------|-------------|----------------------|
| Sick (1-3 days) | ✓ | - | - | 3 days |
| Sick (>3 days) | - | ✓ | - | - |
| PTO | - | ✓ | - | - |
| Personal | - | ✓ | - | - |
| Bereavement | - | ✓ | - | - |
| Jury Duty | - | ✓ | ✓ | - |
| Parental | - | - | ✓ | - |
| Unpaid | - | ✓ | ✓ | - |

**Time:** ~3 seconds

---

### Step 4: Select Date Range

**User Action:** Click "Start Date" field

**System Response:**
- Calendar picker opens
- Today's date highlighted
- Blackout dates shown in red (if any)
- Weekends shown in gray
- Existing leave dates shown in yellow

**User Action:** Navigate to December, click Dec 20, 2024

**System Response:**
- Start date field shows: "12/20/2024"
- End date field auto-opens
- Calendar highlights Dec 20 as selected

**User Action:** Click Dec 22, 2024 for end date

**System Response:**
- End date field shows: "12/22/2024"
- Calendar shows range: Dec 20-22 highlighted
- System calculates: 3 days (Dec 20, 21, 22 - Fri, Sat, Sun)
- If weekends excluded: Shows 1 day (Dec 20 only)

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Start" |
| Required | Yes |
| Format | MM/DD/YYYY |
| Min Date | Today (or past for sick leave) |
| Max Date | +365 days |
| Validation | Cannot overlap existing approved leave |
| Blackout Dates | System-defined blackout periods |
| Error Messages | |
| - Empty | "Start date is required" |
| - Past date (non-sick) | "Start date cannot be in the past" |
| - Blackout | "This date is during a blackout period" |
| - Overlap | "You have existing leave during this period" |

**Field Specification: End Date**
| Property | Value |
|----------|-------|
| Field Name | `endDate` |
| Type | Date Picker |
| Label | "End" |
| Required | Yes |
| Format | MM/DD/YYYY |
| Validation | Must be ≥ Start Date |
| Error Messages | |
| - Before start | "End date must be after or equal to start date" |

**Time:** ~10 seconds

---

### Step 5: Select Duration Type

**User Action:** Select duration option

**Options:**
- **Full Day(s):** Default, counts entire days (8 hrs/day)
- **Half Day:** 4 hours, only for single day
- **Custom Hours:** Specify exact hours (e.g., 2-4 hrs for appointment)

**User Action:** Select "Full Day(s)"

**System Response:**
- Radio button selected
- System calculates total hours
- Shows: "Total: 24 hours (3 days)"
- Balance check runs

**Field Specification: Duration Type**
| Property | Value |
|----------|-------|
| Field Name | `durationType` |
| Type | Radio Button Group |
| Label | "Duration" |
| Required | Yes |
| Default | "full_day" |
| Options | |
| - `full_day` | "Full Day(s)" |
| - `half_day` | "Half Day" (4 hours, single day only) |
| - `custom_hours` | "Custom Hours" (shows hour input) |

**Total Hours Calculation:**
```typescript
if (durationType === 'full_day') {
  // Count business days only (Mon-Fri)
  totalHours = businessDaysBetween(startDate, endDate) * 8;
} else if (durationType === 'half_day') {
  totalHours = 4;
} else if (durationType === 'custom_hours') {
  totalHours = customHoursInput; // User enters
}
```

**Balance Validation:**
```typescript
if (leaveType === 'pto' || leaveType === 'sick' || leaveType === 'personal') {
  const available = balances[leaveType];
  if (totalHours > available) {
    showWarning(`Insufficient balance. Available: ${available} hrs, Requested: ${totalHours} hrs`);
    allowOverride = true; // HR can approve over balance
  }
}
```

**Time:** ~5 seconds

---

### Step 6: Enter Reason

**User Action:** Type reason for leave

**Examples by Type:**
- **PTO:** "Family vacation to Hawaii"
- **Sick:** "Flu symptoms, need rest"
- **Personal:** "Moving to new apartment"
- **Bereavement:** "Grandfather passed away"
- **Jury Duty:** "Jury duty summons for District Court"
- **Parental:** "Birth of child"

**User Action:** Type "Family vacation to Hawaii"

**System Response:**
- Text appears in textarea
- Character count updates: "27/500"

**Field Specification: Reason**
| Property | Value |
|----------|-------|
| Field Name | `reason` |
| Type | Textarea |
| Label | "Reason" |
| Placeholder | "Briefly describe the reason for your leave request..." |
| Required | Yes |
| Min Length | 10 characters |
| Max Length | 500 characters |
| Validation | Not empty, minimum length |
| Error Messages | |
| - Empty | "Please provide a reason for your leave" |
| - Too short | "Reason must be at least 10 characters" |

**Time:** ~30 seconds

---

### Step 7: Specify Coverage Plan (if >2 days)

**User Action:** If leave is >2 days (16 hours), coverage plan is required

**User Action:** Click "Backup" dropdown

**System Response:**
- Shows team members from user's pod
- Shows other employees in same role/department
- Sorted by: Same pod first, then same role

**User Action:** Select "Sarah Johnson (Recruiter)"

**System Response:**
- Field shows: "Sarah Johnson"
- Coverage notes field becomes visible

**User Action:** Type coverage notes: "Sarah will handle my active jobs. I'll brief her on Dec 19."

**Field Specification: Backup Person**
| Property | Value |
|----------|-------|
| Field Name | `backupUserId` |
| Type | Searchable Dropdown |
| Label | "Backup" |
| Required | Yes (if totalHours > 16) |
| Data Source | `user_profiles` WHERE `org_id = current_org` AND `status = 'active'` AND `id != current_user` |
| Display Format | `{firstName} {lastName} ({role})` |
| Search Fields | `firstName`, `lastName`, `role` |
| Sorting | Same pod first, then same role, then alphabetical |
| Error Messages | |
| - Not selected (when required) | "Backup person required for leave >2 days" |

**Field Specification: Coverage Notes**
| Property | Value |
|----------|-------|
| Field Name | `coverageNotes` |
| Type | Textarea |
| Label | "Coverage Plan" |
| Placeholder | "Describe how your responsibilities will be covered..." |
| Required | Yes (if totalHours > 16) |
| Max Length | 500 characters |
| Error Messages | |
| - Empty (when required) | "Coverage plan required for leave >2 days" |

**Time:** ~45 seconds

---

### Step 8: Upload Attachments (Optional)

**User Action:** For certain leave types (Jury Duty, Bereavement, Medical), attachments may be required

**User Action:** Click "+ Upload"

**System Response:**
- File picker opens
- User selects file (e.g., jury summons PDF)
- Upload progress shows
- File appears in list with preview icon

**Field Specification: Attachments**
| Property | Value |
|----------|-------|
| Field Name | `attachments` |
| Type | File Upload (multiple) |
| Label | "Attachments" |
| Required | Conditional (see rules below) |
| Allowed Types | PDF, DOC, DOCX, PNG, JPG, JPEG |
| Max Size | 5MB per file |
| Max Files | 3 |
| Required For | |
| - Jury Duty | Jury summons document |
| - Bereavement | Death certificate (optional but recommended) |
| - Parental | Birth certificate or adoption papers |
| - Medical (>3 days sick) | Doctor's note |

**Time:** ~30 seconds per file

---

### Step 9: Check Availability (Optional)

**User Action:** Click "Check Availability" button

**System Response:**
- Modal shows team availability during requested dates
- Highlights potential conflicts (too many people out)
- Shows blackout dates with reasons

**Availability Check Screen:**
```
+----------------------------------------------------------+
|                       Team Availability                   |
|                       Dec 20-22, 2024                     |
+----------------------------------------------------------+
| Your Pod (Recruiting Pod 1)                               |
| ┌────────────────────────────────────────────────────────┐
| │ You             - Requesting Leave (3 days)           │
| │ Sarah Johnson   - Working                             │
| │ Mike Chen       - Working                             │
| │ Lisa Park (Mgr) - Working                             │
| └────────────────────────────────────────────────────────┘
|                                                           |
| Same Role (All Recruiters)                                |
| ┌────────────────────────────────────────────────────────┐
| │ 2 out of 8 recruiters on leave                        │
| │ ⚠ Warning: 25% of recruiters will be out             │
| └────────────────────────────────────────────────────────┘
|                                                           |
| Blackout Dates: None                                      |
|                                                           |
| ✓ No conflicts detected                                  |
+----------------------------------------------------------+
|                                               [Close]    |
+----------------------------------------------------------+
```

**Conflict Scenarios:**
```
⚠ Warning: >50% of team will be out
🔴 Blocked: Blackout period (End of Quarter)
🔴 Blocked: Manager also on leave
```

**Time:** ~10 seconds

---

### Step 10: Submit Leave Request

**User Action:** Click "Submit Request →" button

**System Response:**

1. **Button shows loading state** (spinner)

2. **Form validates all fields**
   - If errors: Highlight fields, show error messages, focus first error
   - If valid: Proceed

3. **Balance Check**
   ```typescript
   if (totalHours > availableBalance) {
     showWarning('Insufficient balance. Request will require additional approval.');
     allowProceed = true; // Can still submit, flagged for HR
   }
   ```

4. **API call:** `POST /api/trpc/leaves.submit`

5. **Determine Approval Workflow**
   ```typescript
   if (leaveType === 'sick' && totalHours <= 24) {
     approvalWorkflow = 'auto_approve';
   } else if (leaveType === 'parental' || (leaveType === 'sick' && totalHours > 40)) {
     approvalWorkflow = 'hr_approval';
   } else if (totalHours > 40) { // >5 days
     approvalWorkflow = 'hr_approval';
   } else {
     approvalWorkflow = 'manager_approval';
   }
   ```

6. **Create Leave Record**
   - Insert into `leave_requests` table
   - Status set based on workflow:
     - Auto-approve: `approved`
     - Manager approval: `pending_manager`
     - HR approval: `pending_hr`

7. **Deduct Balance (if auto-approved)**
   ```sql
   UPDATE leave_balances
   SET used_hours = used_hours + 24,
       available_hours = available_hours - 24
   WHERE user_id = $1 AND leave_type = 'sick';
   ```

8. **Send Notifications**
   - If auto-approved:
     - Email to employee: "Your sick leave request has been approved"
     - Notification to manager (FYI)
   - If pending manager:
     - Email to manager: "Leave request awaiting your approval"
     - Push notification to manager
   - If pending HR:
     - Email to HR Manager: "Leave request requires HR approval"
     - Email to manager (CC)

9. **Add to Calendar**
   - If auto-approved or approved: Add to employee's calendar
   - Block time on company calendar
   - Notify backup person (if specified)

10. **On Success:**
    - Modal closes
    - Toast notification:
      - Auto-approved: "Leave request approved! 24 hours deducted from Sick balance."
      - Pending: "Leave request submitted! Awaiting manager approval."
    - Leave list refreshes
    - New request appears at top
    - If auto-approved, confetti animation (optional)

11. **On Error:**
    - Modal stays open
    - Error toast with message
    - User can retry

**Time:** ~2-3 seconds

---

## Postconditions

1. ✅ Leave request record created in `leave_requests` table
2. ✅ Status set: `approved` (auto) or `pending_manager` or `pending_hr`
3. ✅ Balance deducted (if auto-approved) or reserved (if pending)
4. ✅ Activity logged: "leave_request.submitted"
5. ✅ Approver notified via email + push (if not auto-approved)
6. ✅ Employee receives confirmation email
7. ✅ Backup person notified (if specified)
8. ✅ Calendar events created (if approved)
9. ✅ Team availability updated

---

## Approval Workflows

### Auto-Approve Workflow (Sick Leave 1-3 days)

```
┌────────────────┐
│ Employee       │
│ Submits        │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ System Auto-   │
│ Approves       │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Balance        │
│ Deducted       │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Calendar       │
│ Updated        │
└────────────────┘
```

**Timeline:** Instant (< 1 second)

---

### Manager Approval Workflow (PTO, Personal, Sick >3 days)

```
┌────────────────┐
│ Employee       │
│ Submits        │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Manager        │
│ Notified       │
└────────┬───────┘
         │
         ▼
┌────────────────┐     No      ┌────────────────┐
│ Manager        │─────────────▶│ Request        │
│ Reviews        │              │ Denied         │
└────────┬───────┘              └────────────────┘
         │ Yes
         ▼
┌────────────────┐
│ Approved       │
│ Balance        │
│ Deducted       │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Calendar       │
│ Updated        │
└────────────────┘
```

**Timeline:**
- Target: 24 hours
- SLA: 48 hours
- Escalation: If >48 hours, escalate to HR

---

### HR Approval Workflow (Parental, Extended Leave >5 days)

```
┌────────────────┐
│ Employee       │
│ Submits        │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Manager        │
│ Notified (CC)  │
└────────────────┘
         │
         ▼
┌────────────────┐
│ HR Manager     │
│ Notified       │
└────────┬───────┘
         │
         ▼
┌────────────────┐     No      ┌────────────────┐
│ HR Reviews     │─────────────▶│ Request        │
│                │              │ Denied         │
└────────┬───────┘              └────────────────┘
         │ Yes
         ▼
┌────────────────┐
│ Approved       │
│ Balance        │
│ Updated        │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Calendar       │
│ Updated        │
└────────────────┘
```

**Timeline:**
- Target: 3 business days
- SLA: 5 business days

---

## Events Logged

| Event | Payload |
|-------|---------|
| `leave_request.submitted` | `{ leave_id, user_id, leave_type, start_date, end_date, total_hours, status }` |
| `leave_request.auto_approved` | `{ leave_id, user_id, approved_at, balance_deducted }` |
| `leave_request.pending_approval` | `{ leave_id, user_id, approver_id, approver_type, notified_at }` |
| `leave_balance.deducted` | `{ user_id, leave_type, hours_deducted, new_balance }` |
| `notification.sent` | `{ type: 'leave_approval_request', to: approver_email, leave_id }` |
| `calendar.event_created` | `{ leave_id, user_id, start_date, end_date }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Insufficient Balance | Request exceeds available balance | "Insufficient PTO balance. Available: 16 hrs, Requested: 24 hrs. Request will require additional approval." | Submit anyway (requires HR approval) or reduce days |
| Overlapping Leave | User has existing approved leave | "You have existing leave from Dec 15-17. Please adjust dates." | Change dates |
| Blackout Period | Dates fall in blackout | "Dec 31 is a blackout date (Year-end close). Please select different dates." | Choose different dates or request exception |
| Manager on Leave | Manager unavailable during request period | "Your manager is on leave during this period. Request will be routed to HR." | Auto-escalate to HR |
| Past Date (non-sick) | Start date in past for PTO | "PTO requests cannot be backdated. For past sick leave, contact HR." | Select future date or contact HR |
| Missing Attachment | Required document not uploaded | "Jury duty requires summons attachment" | Upload document |
| Team Capacity | Too many team members out | "⚠ Warning: 60% of your team will be out during this period. Request may be denied." | Proceed or choose different dates |
| Duplicate Request | Request already exists for dates | "You already have a pending request for Dec 20-22" | View existing request |

---

## Blackout Dates

### System Blackout Configuration

**Managed by:** HR Manager
**Location:** `/admin/settings/blackout-dates`

**Common Blackout Periods:**
| Period | Reason | Applies To |
|--------|--------|------------|
| Dec 31 - Jan 2 | Year-end close | All employees |
| Last week of each quarter | Quarter-end reporting | Finance, HR |
| Black Friday week | Peak recruiting season | Recruiters |
| Client-specific dates | Major client events | Account-assigned staff |

**Blackout Enforcement:**
```typescript
enum BlackoutEnforcement {
  HARD_BLOCK = 'hard_block',      // Cannot submit at all
  REQUIRE_APPROVAL = 'approval',  // Can submit, requires HR approval
  WARNING = 'warning'             // Shows warning but allows
}
```

**Example:**
```typescript
{
  startDate: '2024-12-31',
  endDate: '2025-01-02',
  reason: 'Year-end close',
  enforcement: 'hard_block',
  appliesToRoles: ['all'],
  exceptions: ['hr_manager', 'admin']
}
```

---

## Balance Tracking

### Leave Balance Table

**Table:** `leave_balances`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → user_profiles.id |
| `leave_type` | ENUM | 'pto', 'sick', 'personal' |
| `total_hours` | DECIMAL(6,2) | Annual allotment |
| `used_hours` | DECIMAL(6,2) | Hours used YTD |
| `available_hours` | DECIMAL(6,2) | Computed: total - used |
| `accrual_rate` | DECIMAL(6,2) | Hours per pay period |
| `accrual_frequency` | ENUM | 'monthly', 'biweekly', 'annual' |
| `year` | INT | Calendar year |
| `carry_over_hours` | DECIMAL(6,2) | Rolled from previous year |
| `max_carry_over` | DECIMAL(6,2) | Policy limit |

### Accrual Rules

**PTO Accrual by Tenure:**
| Years of Service | Annual Hours | Accrual Rate (Monthly) |
|------------------|--------------|------------------------|
| 0-2 years | 80 hours (10 days) | 6.67 hrs/month |
| 3-5 years | 120 hours (15 days) | 10 hrs/month |
| 6-10 years | 160 hours (20 days) | 13.33 hrs/month |
| 10+ years | 200 hours (25 days) | 16.67 hrs/month |

**Sick Leave:**
- Allotment: 40 hours/year (5 days)
- Accrual: None (front-loaded on Jan 1)
- Carry Over: Unlimited (accumulates)

**Personal Days:**
- Allotment: 16 hours/year (2 days)
- Accrual: None (front-loaded on Jan 1)
- Carry Over: None (use it or lose it)

### Balance Calculation

```typescript
function calculateAvailableBalance(userId: string, leaveType: string): number {
  const balance = getLeaveBalance(userId, leaveType);
  const pendingRequests = getPendingRequests(userId, leaveType);

  const reserved = pendingRequests.reduce((sum, req) => sum + req.totalHours, 0);

  return balance.totalHours - balance.usedHours - reserved;
}
```

**Example:**
- Total PTO: 120 hours
- Used YTD: 40 hours
- Pending requests: 16 hours
- **Available:** 120 - 40 - 16 = 64 hours

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Leave Type | Required | "Please select a leave type" |
| Start Date | Required | "Start date is required" |
| Start Date (PTO) | Cannot be past | "PTO cannot be backdated" |
| End Date | Required | "End date is required" |
| End Date | Must be ≥ Start | "End date must be after or equal to start date" |
| Dates | No overlap | "Overlaps with existing leave" |
| Dates | Not in blackout | "Date falls in blackout period" |
| Balance | Sufficient (warning) | "Insufficient balance (requires approval)" |
| Reason | Min 10 chars | "Reason must be at least 10 characters" |
| Backup | Required if >2 days | "Backup person required for leave >2 days" |
| Coverage Notes | Required if >2 days | "Coverage plan required for leave >2 days" |
| Attachment | Required for certain types | "Attachment required for jury duty" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open command bar → "request leave" |
| `Esc` | Close modal (with confirmation) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+Enter` | Submit request |

---

## Alternative Flows

### A1: Emergency Sick Leave (Backdated)

1. Employee was sick yesterday, forgot to log
2. Opens leave request form
3. Selects "Sick Leave"
4. System allows past date (up to 7 days back) for sick leave
5. Employee enters yesterday's date
6. Adds reason: "Flu, stayed home"
7. Auto-approved immediately
8. Balance deducted retroactively

### A2: Manager Out During Approval Period

1. Employee submits PTO request
2. System checks: Manager is on leave during approval window
3. Request auto-escalates to HR Manager
4. HR Manager receives notification
5. HR Manager approves
6. Employee and original manager notified

### A3: Over-Balance Request

1. Employee has 16 hours PTO left
2. Requests 40 hours (5 days)
3. System warns: "Insufficient balance. 24 hours will be unpaid or require additional approval."
4. Employee chooses: "Request as Unpaid" or "Submit for HR Approval"
5. If HR Approval: Request flagged, routed to HR
6. HR reviews, can approve or deny

### A4: Modify Pending Request

1. Employee has pending leave request
2. Realizes dates are wrong
3. Opens leave list, finds pending request
4. Clicks "Edit"
5. System opens edit modal (same as submit, pre-filled)
6. Employee changes dates
7. Clicks "Update Request"
8. If already with approver: Notification sent to approver about change
9. Request re-enters approval queue

### A5: Cancel Approved Leave

1. Employee has approved leave (Dec 20-22)
2. Plans changed, needs to cancel
3. Opens leave detail
4. Clicks "Cancel Leave"
5. System asks: "Are you sure? Balance will be restored."
6. Employee confirms
7. Leave status: `cancelled`
8. Balance restored: +24 hours
9. Calendar event deleted
10. Manager and backup notified

---

## Related Use Cases

- **UC-MGR-008:** Approve Leave Request (Manager view)
- **UC-HR-005:** Manage Leave Policies (HR configuration)
- **UC-HR-006:** Override Leave Balance (HR action)
- **UC-EMP-002:** View Leave Balance (Employee self-service)
- **UC-EMP-003:** View Team Calendar (See who's out)

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit sick leave 1 day | Auto-approved, balance deducted |
| TC-002 | Submit PTO 3 days with coverage | Pending manager approval |
| TC-003 | Submit PTO without required coverage | Error: "Coverage required" |
| TC-004 | Submit with insufficient balance | Warning shown, routed to HR |
| TC-005 | Submit during blackout period | Error: "Blackout period" |
| TC-006 | Submit overlapping leave | Error: "Overlap detected" |
| TC-007 | Submit parental leave | Routed to HR approval |
| TC-008 | Submit jury duty without attachment | Error: "Attachment required" |
| TC-009 | Cancel approved leave | Balance restored, calendar updated |
| TC-010 | Edit pending request | Re-enters approval queue |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/leaves.ts`
**Procedure:** `leaves.submit`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const submitLeaveInput = z.object({
  leaveType: z.enum(['pto', 'sick', 'personal', 'bereavement', 'jury_duty', 'parental', 'unpaid']),
  startDate: z.date(),
  endDate: z.date(),
  durationType: z.enum(['full_day', 'half_day', 'custom_hours']),
  customHours: z.number().positive().optional(),
  reason: z.string().min(10).max(500),
  backupUserId: z.string().uuid().optional(),
  coverageNotes: z.string().max(500).optional(),
  attachmentIds: z.array(z.string().uuid()).max(3).optional(),
}).refine(data => {
  // End date must be >= start date
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"]
}).refine(data => {
  // Coverage required if >2 days
  const totalHours = calculateTotalHours(data.startDate, data.endDate, data.durationType, data.customHours);
  if (totalHours > 16) {
    return !!data.backupUserId && !!data.coverageNotes;
  }
  return true;
}, {
  message: "Backup and coverage plan required for leave >2 days",
  path: ["backupUserId"]
});

export type SubmitLeaveInput = z.infer<typeof submitLeaveInput>;
```

### Output Schema

```typescript
export const submitLeaveOutput = z.object({
  leaveId: z.string().uuid(),
  status: z.enum(['approved', 'pending_manager', 'pending_hr']),
  approvalWorkflow: z.enum(['auto_approve', 'manager_approval', 'hr_approval']),
  totalHours: z.number(),
  balanceDeducted: z.boolean(),
  newBalance: z.number().optional(),
  approverName: z.string().optional(),
});

export type SubmitLeaveOutput = z.infer<typeof submitLeaveOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)
   ```typescript
   // Check permissions (all employees can submit)
   const isEmployee = ctx.user.role !== 'client';
   if (!isEmployee) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate date range
   if (input.endDate < input.startDate) {
     throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid date range' });
   }
   ```

2. **Calculate Total Hours** (~10ms)
   ```typescript
   const totalHours = calculateTotalHours(
     input.startDate,
     input.endDate,
     input.durationType,
     input.customHours
   );
   ```

3. **Check for Overlaps** (~50ms)
   ```sql
   SELECT id FROM leave_requests
   WHERE user_id = $1
     AND status IN ('approved', 'pending_manager', 'pending_hr')
     AND (
       (start_date, end_date) OVERLAPS ($2::date, $3::date)
     );
   ```

4. **Check Blackout Dates** (~50ms)
   ```sql
   SELECT reason, enforcement FROM blackout_dates
   WHERE org_id = $1
     AND (
       (start_date, end_date) OVERLAPS ($2::date, $3::date)
     )
     AND (
       applies_to_roles @> ARRAY['all']::text[]
       OR applies_to_roles @> ARRAY[$4]::text[]
     );
   ```

5. **Check Balance** (~50ms)
   ```typescript
   if (['pto', 'sick', 'personal'].includes(input.leaveType)) {
     const balance = await getLeaveBalance(ctx.userId, input.leaveType);
     const available = balance.totalHours - balance.usedHours;

     if (totalHours > available) {
       // Flag for HR approval
       requiresHRApproval = true;
       insufficientBalance = true;
     }
   }
   ```

6. **Determine Approval Workflow** (~10ms)
   ```typescript
   let approvalWorkflow: 'auto_approve' | 'manager_approval' | 'hr_approval';

   if (input.leaveType === 'sick' && totalHours <= 24) {
     approvalWorkflow = 'auto_approve';
   } else if (
     input.leaveType === 'parental' ||
     totalHours > 40 ||
     insufficientBalance
   ) {
     approvalWorkflow = 'hr_approval';
   } else {
     approvalWorkflow = 'manager_approval';
   }
   ```

7. **Create Leave Record** (~100ms)
   ```sql
   INSERT INTO leave_requests (
     id, org_id, user_id,
     leave_type, start_date, end_date,
     duration_type, custom_hours, total_hours,
     reason, backup_user_id, coverage_notes,
     status, approval_workflow,
     created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2,
     $3, $4, $5,
     $6, $7, $8,
     $9, $10, $11,
     $12, $13,
     NOW(), NOW()
   ) RETURNING id;
   ```

8. **Link Attachments** (~50ms)
   ```sql
   INSERT INTO leave_attachments (leave_id, document_id, created_at)
   SELECT $1, unnest($2::uuid[]), NOW();
   ```

9. **Update Balance (if auto-approved)** (~50ms)
   ```sql
   UPDATE leave_balances
   SET used_hours = used_hours + $3,
       available_hours = total_hours - (used_hours + $3),
       updated_at = NOW()
   WHERE user_id = $1
     AND leave_type = $2
     AND year = EXTRACT(YEAR FROM NOW());
   ```

10. **Send Notifications** (~200ms)
    ```typescript
    if (approvalWorkflow === 'auto_approve') {
      await sendEmail({
        to: ctx.user.email,
        template: 'leave_auto_approved',
        data: { leaveId, totalHours, leaveType }
      });

      // Notify manager (FYI)
      await sendNotification({
        userId: ctx.user.managerId,
        type: 'leave_approved_fyi',
        data: { employeeName, leaveId, dates }
      });
    } else if (approvalWorkflow === 'manager_approval') {
      const manager = await getManager(ctx.userId);

      await sendEmail({
        to: manager.email,
        template: 'leave_approval_request',
        data: { employeeName, leaveId, dates, totalHours }
      });

      await sendPushNotification({
        userId: manager.id,
        title: 'Leave Approval Request',
        body: `${employeeName} requested ${totalHours} hours of ${leaveType}`
      });
    } else if (approvalWorkflow === 'hr_approval') {
      const hrManagers = await getHRManagers(ctx.user.orgId);

      for (const hrMgr of hrManagers) {
        await sendEmail({
          to: hrMgr.email,
          template: 'leave_hr_approval_request',
          data: { employeeName, leaveId, dates, totalHours, reason: insufficientBalance ? 'Exceeds balance' : 'Parental leave' }
        });
      }
    }
    ```

11. **Create Calendar Event (if auto-approved)** (~100ms)
    ```sql
    INSERT INTO calendar_events (
      id, org_id, user_id,
      event_type, title, description,
      start_date, end_date, all_day,
      entity_type, entity_id,
      created_at
    ) VALUES (
      gen_random_uuid(), $1, $2,
      'leave', $3 || ' - ' || $4, $5,
      $6, $7, true,
      'leave_request', $8,
      NOW()
    );
    ```

12. **Notify Backup (if specified)** (~100ms)
    ```typescript
    if (input.backupUserId && approvalWorkflow === 'auto_approve') {
      await sendEmail({
        to: backupUser.email,
        template: 'coverage_assignment',
        data: {
          employeeName,
          dates,
          coverageNotes
        }
      });
    }
    ```

13. **Log Activity** (~50ms)
    ```sql
    INSERT INTO activities (
      id, org_id, entity_type, entity_id,
      activity_type, description,
      created_by, created_at, metadata
    ) VALUES (
      gen_random_uuid(), $1, 'leave_request', $2,
      'submitted', 'Leave request submitted',
      $3, NOW(), $4::jsonb
    );
    ```

---

## Database Schema Reference

### Table: leave_requests

**File:** `src/lib/db/schema/hr.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | Auto-generated |
| `org_id` | UUID | FK → organizations.id, NOT NULL | Multi-tenant |
| `user_id` | UUID | FK → user_profiles.id, NOT NULL | Employee requesting |
| `leave_type` | ENUM | NOT NULL | See enum below |
| `start_date` | DATE | NOT NULL | First day of leave |
| `end_date` | DATE | NOT NULL | Last day of leave |
| `duration_type` | ENUM | NOT NULL | 'full_day', 'half_day', 'custom_hours' |
| `custom_hours` | DECIMAL(4,2) | | If duration_type = custom |
| `total_hours` | DECIMAL(6,2) | NOT NULL | Calculated total |
| `reason` | TEXT | NOT NULL | Max 500 characters |
| `backup_user_id` | UUID | FK → user_profiles.id | Coverage backup |
| `coverage_notes` | TEXT | | Max 500 characters |
| `status` | ENUM | NOT NULL | See status enum below |
| `approval_workflow` | ENUM | NOT NULL | 'auto_approve', 'manager_approval', 'hr_approval' |
| `approved_by` | UUID | FK → user_profiles.id | Who approved |
| `approved_at` | TIMESTAMP | | When approved |
| `denied_by` | UUID | FK → user_profiles.id | Who denied |
| `denied_at` | TIMESTAMP | | When denied |
| `denial_reason` | TEXT | | Max 500 characters |
| `cancelled_at` | TIMESTAMP | | When cancelled |
| `cancelled_by` | UUID | FK → user_profiles.id | Who cancelled |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Leave Type Enum Values:**
- `pto` - Paid Time Off
- `sick` - Sick Leave
- `personal` - Personal Day
- `bereavement` - Bereavement Leave
- `jury_duty` - Jury Duty
- `parental` - Parental Leave (maternity/paternity)
- `unpaid` - Unpaid Leave

**Status Enum Values:**
- `pending_manager` - Awaiting manager approval
- `pending_hr` - Awaiting HR approval
- `approved` - Approved and active
- `denied` - Rejected
- `cancelled` - Cancelled by employee or admin

**Indexes:**
```sql
CREATE INDEX idx_leave_requests_org_user ON leave_requests(org_id, user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approver ON leave_requests(approved_by) WHERE approved_by IS NOT NULL;
```

### Table: leave_balances

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `leave_type` | ENUM | NOT NULL | 'pto', 'sick', 'personal' |
| `year` | INT | NOT NULL | Calendar year |
| `total_hours` | DECIMAL(6,2) | NOT NULL | Annual allotment |
| `used_hours` | DECIMAL(6,2) | DEFAULT 0 | Hours used YTD |
| `available_hours` | DECIMAL(6,2) | COMPUTED | total - used |
| `carry_over_hours` | DECIMAL(6,2) | DEFAULT 0 | From previous year |
| `accrual_rate` | DECIMAL(6,2) | | Hours per period |
| `accrual_frequency` | ENUM | | 'monthly', 'biweekly', 'annual' |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Unique Constraint:**
```sql
UNIQUE(user_id, leave_type, year)
```

### Table: leave_attachments

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `leave_id` | UUID | FK → leave_requests.id, NOT NULL | |
| `document_id` | UUID | FK → documents.id, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |

### Table: blackout_dates

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `start_date` | DATE | NOT NULL | |
| `end_date` | DATE | NOT NULL | |
| `reason` | VARCHAR(200) | NOT NULL | |
| `enforcement` | ENUM | NOT NULL | 'hard_block', 'approval', 'warning' |
| `applies_to_roles` | TEXT[] | | Array of role IDs or ['all'] |
| `exceptions` | TEXT[] | | Array of user IDs exempt |
| `created_by` | UUID | FK → user_profiles.id | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

## Email Templates

### Template 1: Auto-Approved Leave

**Template ID:** `leave_auto_approved`

**Subject:** Your Leave Request Has Been Approved

**Body:**
```
Hi {firstName},

Your {leaveType} request has been automatically approved.

Details:
- Dates: {startDate} to {endDate}
- Duration: {totalHours} hours ({totalDays} days)
- Balance Remaining: {remainingBalance} hours

{if backupAssigned}
Your backup: {backupName} has been notified.
{endif}

This time has been added to your calendar.

Enjoy your time off!

InTime HR Team
```

### Template 2: Pending Manager Approval

**Template ID:** `leave_pending_manager`

**Subject:** Leave Request Submitted - Awaiting Approval

**Body:**
```
Hi {firstName},

Your {leaveType} request has been submitted and is awaiting manager approval.

Details:
- Dates: {startDate} to {endDate}
- Duration: {totalHours} hours ({totalDays} days)
- Approver: {managerName}

You will receive an email once your request is reviewed (typically within 24-48 hours).

InTime HR Team
```

### Template 3: Manager Approval Request

**Template ID:** `leave_approval_request_manager`

**Subject:** Leave Request Awaiting Your Approval

**Body:**
```
Hi {managerName},

{employeeName} has submitted a leave request that requires your approval.

Details:
- Employee: {employeeName}
- Type: {leaveType}
- Dates: {startDate} to {endDate}
- Duration: {totalHours} hours ({totalDays} days)
- Reason: {reason}
- Backup: {backupName}

[Approve Request] [Deny Request] [View Details]

Please review within 48 hours.

InTime HR System
```

---

*Last Updated: 2024-11-30*
