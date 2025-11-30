# Use Case: Manage Active Placement

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CAN-005 |
| Actor | Consultant User (Active Placement) |
| Goal | Manage ongoing work assignment, submit timesheets, and access placement resources |
| Frequency | Daily (timesheets), Weekly (status updates), As-needed (documents, support) |
| Estimated Time | 5-15 minutes per timesheet, 2-5 minutes for other tasks |
| Priority | Critical |

---

## Preconditions

1. User is logged in to Candidate Portal
2. User has accepted job offer and placement is active
3. User has "consultant.placement.manage" permission
4. Placement record exists in system with status "active"
5. Timesheet submission is configured for the placement

---

## Trigger

One of the following:
- Weekly timesheet submission deadline approaching
- Need to view current assignment details
- Need to request time off
- Issue or concern needs to be reported
- Document needs to be accessed (pay stub, contract, etc.)
- Assignment extension or change request
- End of assignment approaching

---

## Main Flow (Click-by-Click)

### Step 1: Access Placement Dashboard

**User Action:** Click "My Assignment" or "Dashboard" in navigation (post-placement users see this instead of "Applications")

**System Response:**
- Navigation highlights active item
- URL changes to: `/portal/placement/dashboard`
- Placement dashboard loads
- Current assignment details display prominently

**Screen State:**
```
+----------------------------------------------------------------+
| InTime Consultant Portal                   [🔔] [👤 John Doe] |
+----------------------------------------------------------------+
| [Dashboard] [Timesheets] [Documents] [Support] [Settings]     |
+----------------------------------------------------------------+
|                                                                 |
| 👔 My Current Assignment                                       |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ Staff Software Engineer                          🟢 ACTIVE │  |
| │ Stripe, Inc.                                              │  |
| │                                                            │  |
| │ Start Date: Dec 16, 2024                                  │  |
| │ Duration: 6 months (Contract-to-Hire)                     │  |
| │ Time on Assignment: 2 weeks 3 days                        │  |
| │ End Date: Jun 16, 2025 (5 months remaining)               │  |
| │                                                            │  |
| │ 📍 Location: Remote (US-based)                            │  |
| │ 💰 Rate: $125/hour                                        │  |
| │ 📅 Schedule: Monday-Friday, 40 hrs/week                   │  |
| │                                                            │  |
| │ [View Contract] [Contact Recruiter] [Request Change]     │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ ⚡ QUICK ACTIONS                                          │  |
| │                                                            │  |
| │ [📝 Submit Timesheet]  [💰 View Pay Stubs]                │  |
| │ [🏖️ Request Time Off]   [⚙️ Report Issue]                 │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌────────────────────┬──────────────────────────────────────┐ |
| │ PENDING ACTIONS    │ ASSIGNMENT INFO                      │ |
| │                    │                                      │ |
| │ ⚠️ Action Required │ Manager: Lisa Chen                   │ |
| │ Submit Timesheet   │ Email: lisa.chen@stripe.com          │ |
| │ for Week ending    │ Phone: (555) 987-6543                │ |
| │ Dec 31, 2024       │                                      │ |
| │ Due: Jan 2, 9 AM   │ Your Recruiter: Sarah Johnson        │ |
| │                    │ Email: sarah@intime.com              │ |
| │ [Submit Now →]     │ Phone: (555) 123-4567                │ |
| │                    │                                      │ |
| │ No other pending   │ Office Location (if visiting):       │ |
| │ items              │ Stripe SF Office                     │ |
| │                    │ 510 Townsend St, San Francisco, CA   │ |
| └────────────────────┴──────────────────────────────────────┘ |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📊 THIS WEEK'S SUMMARY                                    │  |
| │                                                            │  |
| │ Hours Logged: 32.5 / 40 hours                             │  |
| │ [████████████████░░░░░░░░] 81%                           │  |
| │                                                            │  |
| │ Mon: 8.0 hrs | Tue: 8.0 hrs | Wed: 8.5 hrs | Thu: 8.0 hrs │  |
| │ Fri: 0.0 hrs (today)                                      │  |
| │                                                            │  |
| │ Status: ✓ On track                                        │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📋 RECENT ACTIVITY                            [View All →]│  |
| │                                                            │  |
| │ Today, 9:30 AM                                            │  |
| │ ✓ Timesheet for week ending Dec 24 approved              │  |
| │                                                            │  |
| │ Yesterday, 2:15 PM                                        │  |
| │ 📄 December pay stub available                            │  |
| │                                                            │  |
| │ Dec 28, 10:00 AM                                          │  |
| │ 💬 Message from Sarah: "Great work this month!"           │  |
| └──────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Submit Weekly Timesheet

**User Action:** Click "Submit Timesheet" button or "Submit Now →" in pending actions

**System Response:**
- Timesheet entry form loads
- Current week pre-selected
- Previous week's hours shown for reference

**Screen State:**
```
+----------------------------------------------------------------+
| 📝 Submit Timesheet - Week Ending Dec 31, 2024        [Close] |
+----------------------------------------------------------------+
|                                                                 |
| Assignment: Staff Software Engineer at Stripe                  |
| Pay Rate: $125/hour (Regular) | $187.50/hour (Overtime)        |
| Week: Dec 25, 2024 - Dec 31, 2024                              |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ DAILY HOURS                                               │  |
| │                                                            │  |
| │ Monday, Dec 25 (Holiday - Christmas)                      │  |
| │ Regular Hours: [0.0] PTO/Holiday: [8.0] Total: 8.0       │  |
| │                                                            │  |
| │ Tuesday, Dec 26                                           │  |
| │ Regular Hours: [8.0] Overtime: [0.0] Total: 8.0          │  |
| │ Notes: [Sprint planning and feature development        ]  │  |
| │                                                            │  |
| │ Wednesday, Dec 27                                         │  |
| │ Regular Hours: [8.5] Overtime: [0.0] Total: 8.5          │  |
| │ Notes: [Code reviews and deployment                    ]  │  |
| │                                                            │  |
| │ Thursday, Dec 28                                          │  |
| │ Regular Hours: [8.0] Overtime: [0.0] Total: 8.0          │  |
| │ Notes: [Team standup, bug fixes                        ]  │  |
| │                                                            │  |
| │ Friday, Dec 29                                            │  |
| │ Regular Hours: [7.5] Overtime: [0.0] Total: 7.5          │  |
| │ Notes: [Documentation updates                          ]  │  |
| │                                                            │  |
| │ Saturday, Dec 30 (Weekend)                                │  |
| │ Regular Hours: [0.0] Overtime: [0.0] Total: 0.0          │  |
| │                                                            │  |
| │ Sunday, Dec 31 (Weekend)                                  │  |
| │ Regular Hours: [0.0] Overtime: [0.0] Total: 0.0          │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ WEEK SUMMARY                                              │  |
| │                                                            │  |
| │ Regular Hours:      32.0 hours                            │  |
| │ Overtime Hours:      0.0 hours                            │  |
| │ PTO/Holiday Hours:   8.0 hours                            │  |
| │ ───────────────────────────────────                       │  |
| │ Total Hours:        40.0 hours                            │  |
| │                                                            │  |
| │ Estimated Pay:                                             │  |
| │ Regular: $4,000.00 (32 hrs × $125)                        │  |
| │ Holiday: $1,000.00 (8 hrs × $125)                         │  |
| │ Overtime: $0.00                                           │  |
| │ ───────────────────────────────                           │  |
| │ Total: $5,000.00 (before taxes)                           │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ ADDITIONAL INFORMATION                                     │  |
| │                                                            │  |
| │ Project/Task Codes (if applicable):                       │  |
| │ [Select project...                                    ▼]  │  |
| │                                                            │  |
| │ Overall Week Notes (optional):                            │  |
| │ ┌────────────────────────────────────────────────────┐   │  |
| │ │ Completed payment gateway integration sprint.      │   │  |
| │ │ All features deployed to production successfully.  │   │  |
| │ │                                              0/500  │   │  |
| │ └────────────────────────────────────────────────────┘   │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ⚠️ Important Reminders:                                        |
| • Timesheets must be submitted by Tuesday 9 AM                 |
| • Manager approval required before payment processing          |
| • Overtime must be pre-approved by client manager              |
| • Holiday pay follows client holiday schedule                  |
|                                                                 |
| ☐ I certify that the hours reported are accurate and complete |
|                                                                 |
|                        [Save Draft]  [Submit Timesheet ✓]     |
+----------------------------------------------------------------+
```

**User Action:** Enter hours for each day, add notes

**Field Specification: Daily Hours**
| Property | Value |
|----------|-------|
| Field Name | `dailyHours[date].regularHours` |
| Type | Number Input |
| Label | "Regular Hours" |
| Min | 0 |
| Max | 24 |
| Step | 0.25 (15-minute increments) |
| Required | No (can be 0) |
| Validation | Total daily hours ≤ 24 |

**Field Specification: Daily Notes**
| Property | Value |
|----------|-------|
| Field Name | `dailyHours[date].notes` |
| Type | Text Input |
| Label | "Notes" |
| Required | No |
| Max Length | 200 characters per day |
| Placeholder | "Brief description of work performed" |

**Time:** ~5-10 minutes

---

### Step 3: Submit Timesheet

**User Action:** Check certification checkbox, click "Submit Timesheet ✓"

**System Response:**
1. Validates all fields
2. Confirms total hours calculation
3. Shows confirmation modal

**Screen State (Confirmation):**
```
+----------------------------------------------------------------+
|                  Confirm Timesheet Submission              [×] |
+----------------------------------------------------------------+
|                                                                 |
| Please review your timesheet before submitting:                |
|                                                                 |
| Week Ending: Dec 31, 2024                                      |
| Total Hours: 40.0 hours                                        |
| Estimated Pay: $5,000.00                                       |
|                                                                 |
| Breakdown:                                                      |
| • Regular: 32.0 hrs @ $125/hr = $4,000.00                      |
| • Holiday: 8.0 hrs @ $125/hr = $1,000.00                       |
| • Overtime: 0.0 hrs                                            |
|                                                                 |
| This timesheet will be sent to:                                |
| • Manager: Lisa Chen (for approval)                            |
| • InTime Payroll: Sarah Johnson                                |
|                                                                 |
| Once submitted, you can track approval status in your          |
| dashboard. You'll receive email notification when approved.    |
|                                                                 |
| ⚠️ Timesheet cannot be edited after submission. Make sure      |
| all hours and notes are accurate.                              |
|                                                                 |
|                                    [Go Back]  [Submit ✓]       |
+----------------------------------------------------------------+
```

**User Action:** Click "Submit ✓"

**System Response:**
1. API call `POST /api/trpc/timesheets.submit`
2. Timesheet record created with status "pending_approval"
3. Email sent to manager for approval
4. Email confirmation sent to candidate
5. Modal closes
6. Dashboard updates

**Success State:**
```
+----------------------------------------------------------------+
| ✅ Timesheet Submitted Successfully!                           |
+----------------------------------------------------------------+
|                                                                 |
| Your timesheet for the week ending Dec 31, 2024 has been      |
| submitted for approval.                                        |
|                                                                 |
| Reference #: TS-2024-12-31-001                                 |
| Submitted: Today at 3:45 PM                                    |
| Status: Pending Manager Approval                               |
|                                                                 |
| Next Steps:                                                     |
| 1. Lisa Chen will review and approve (usually within 24 hrs)   |
| 2. You'll receive email notification when approved             |
| 3. Payment will be processed on next pay date (Jan 5, 2025)    |
|                                                                 |
| [View Timesheet] [Track Status] [Back to Dashboard]           |
+----------------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 4: View Timesheet History

**User Action:** Click "Timesheets" in main navigation

**System Response:**
- Navigates to timesheets list page
- Shows all submitted timesheets with status

**Screen State:**
```
+----------------------------------------------------------------+
| My Timesheets                                      [Export ⬇]  |
+----------------------------------------------------------------+
| [Search timesheets...]                      [Filter ▼] [Date ▼]|
+----------------------------------------------------------------+
| Status: ● All (8) │ ○ Pending (1) │ ○ Approved (6) │ ○ Paid (5)|
+----------------------------------------------------------------+
|                                                                 |
| Week Ending    Hours    Amount      Status        Actions      |
| ──────────────────────────────────────────────────────────────|
| Dec 31, 2024   40.0    $5,000.00   🟡 Pending      [View]      |
| Dec 24, 2024   40.0    $5,000.00   ✅ Approved     [View] [PDF]|
| Dec 17, 2024   38.5    $4,812.50   💰 Paid        [View] [PDF]|
| Dec 10, 2024   40.0    $5,000.00   💰 Paid        [View] [PDF]|
| Dec 3, 2024    35.0    $4,375.00   💰 Paid        [View] [PDF]|
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ PAYMENT SUMMARY                                           │  |
| │                                                            │  |
| │ Total Hours (All Time): 193.5 hours                       │  |
| │ Total Earnings: $24,187.50                                │  |
| │                                                            │  |
| │ December Totals:                                           │  |
| │ Hours: 158.5 | Gross: $19,812.50 | Net: $14,234.18        │  |
| │                                                            │  |
| │ Average Weekly Hours: 39.6 hours                          │  |
| │ YTD Earnings: $24,187.50                                  │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| [Export to CSV] [Download All PDFs] [Tax Summary]             |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 5: View Individual Timesheet Details

**User Action:** Click "View" on Dec 24, 2024 timesheet (approved)

**System Response:**
- Detailed timesheet view opens
- Shows approval information

**Screen State:**
```
+----------------------------------------------------------------+
| Timesheet - Week Ending Dec 24, 2024            [← Back] [PDF] |
+----------------------------------------------------------------+
|                                                                 |
| Reference: TS-2024-12-24-001                                   |
| Status: ✅ APPROVED                                            |
|                                                                 |
| Assignment: Staff Software Engineer at Stripe                  |
| Submitted: Dec 26, 2024 at 10:15 AM                            |
| Approved by: Lisa Chen on Dec 26, 2024 at 2:30 PM              |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ HOURS BREAKDOWN                                           │  |
| │                                                            │  |
| │ Date       Regular  OT    PTO   Total   Notes             │  |
| │ ──────────────────────────────────────────────────────────│  |
| │ Mon 12/18  8.0      0.0   0.0   8.0    Sprint planning    │  |
| │ Tue 12/19  8.5      0.0   0.0   8.5    Feature dev        │  |
| │ Wed 12/20  8.0      0.0   0.0   8.0    Code reviews       │  |
| │ Thu 12/21  8.0      0.0   0.0   8.0    Testing            │  |
| │ Fri 12/22  7.5      0.0   0.0   7.5    Documentation      │  |
| │ Sat 12/23  0.0      0.0   0.0   0.0    -                  │  |
| │ Sun 12/24  0.0      0.0   0.0   0.0    -                  │  |
| │                                                            │  |
| │ Total:     40.0     0.0   0.0   40.0                      │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ PAYMENT CALCULATION                                       │  |
| │                                                            │  |
| │ Regular Hours: 40.0 × $125.00 = $5,000.00                 │  |
| │ Overtime Hours: 0.0 × $187.50 = $0.00                     │  |
| │ ────────────────────────────────────────                  │  |
| │ Gross Pay: $5,000.00                                      │  |
| │                                                            │  |
| │ Deductions:                                                │  |
| │ - Federal Tax: -$750.00                                   │  |
| │ - State Tax: -$300.00                                     │  |
| │ - FICA: -$382.50                                          │  |
| │ - Medicare: -$72.50                                       │  |
| │ ────────────────────────────────────────                  │  |
| │ Net Pay: $3,495.00                                        │  |
| │                                                            │  |
| │ Payment Date: Dec 29, 2024                                │  |
| │ Payment Method: Direct Deposit - Bank ****1234            │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ APPROVAL CHAIN                                            │  |
| │                                                            │  |
| │ ✓ Submitted by You on Dec 26, 2024 at 10:15 AM           │  |
| │ ✓ Approved by Lisa Chen on Dec 26, 2024 at 2:30 PM       │  |
| │   Comment: "Looks good, thanks for your great work!"      │  |
| │ ✓ Processed by Payroll on Dec 27, 2024 at 9:00 AM        │  |
| │ ✓ Payment Issued on Dec 29, 2024                          │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| [Download PDF] [Print] [Report Issue] [Back to List]          |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 6: View Pay Stubs

**User Action:** Click "Documents" tab, then "Pay Stubs" section

**System Response:**
- Documents page loads
- Pay stubs section displays

**Screen State:**
```
+----------------------------------------------------------------+
| My Documents                                                    |
+----------------------------------------------------------------+
| [Pay Stubs] [Tax Forms] [Contracts] [Policies] [Other]        |
+----------------------------------------------------------------+
|                                                                 |
| 💰 Pay Stubs                                      [Download All]|
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 Pay Stub - Dec 29, 2024                                │  |
| │ Pay Period: Dec 18-24, 2024                               │  |
| │ Gross: $5,000.00 | Net: $3,495.00                         │  |
| │ Payment Method: Direct Deposit                            │  |
| │                                                            │  |
| │ [View] [Download PDF] [Print]                             │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 Pay Stub - Dec 22, 2024                                │  |
| │ Pay Period: Dec 11-17, 2024                               │  |
| │ Gross: $4,812.50 | Net: $3,364.75                         │  |
| │ Payment Method: Direct Deposit                            │  |
| │                                                            │  |
| │ [View] [Download PDF] [Print]                             │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| YTD Summary (2024):                                            |
| Gross Earnings: $24,187.50                                     |
| Net Earnings: $16,903.38                                       |
| Total Deductions: $7,284.12                                    |
|                                                                 |
| [Export YTD Summary] [Tax Documents →]                        |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 7: Request Time Off

**User Action:** Click "Request Time Off" from dashboard quick actions

**System Response:**
- Time off request form opens

**Screen State:**
```
+----------------------------------------------------------------+
|                Request Time Off                            [×] |
+----------------------------------------------------------------+
|                                                                 |
| Assignment: Staff Software Engineer at Stripe                  |
| Available PTO Balance: 5 days (40 hours)                       |
|                                                                 |
| Time Off Type *                                                 |
| ● Paid Time Off (PTO)                                          |
| ○ Sick Leave                                                   |
| ○ Unpaid Leave                                                 |
| ○ Holiday (if additional needed)                               |
|                                                                 |
| Date Range *                                                    |
| From: [01/15/2025 📅]    To: [01/17/2025 📅]                   |
|                                                                 |
| Total Days: 3 days (24 hours)                                  |
| Remaining Balance After: 2 days (16 hours)                     |
|                                                                 |
| Return to Work Date: Monday, Jan 20, 2025                      |
|                                                                 |
| Reason (Optional)                                               |
| ┌────────────────────────────────────────────────────────┐    |
| │ Family vacation                                         │    |
| │                                                         │    |
| │                                              0/500      │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| ⚠️ Important Notes:                                            |
| • Time off requests require manager approval                   |
| • Submit requests at least 2 weeks in advance when possible    |
| • Approved time off will appear on your timesheet              |
| • You'll receive email notification when approved/denied       |
|                                                                 |
| Approvers:                                                      |
| 1. Lisa Chen (Client Manager)                                  |
| 2. Sarah Johnson (InTime Recruiter)                            |
|                                                                 |
|                                    [Cancel]  [Submit Request]  |
+----------------------------------------------------------------+
```

**User Action:** Select dates, fill reason, click "Submit Request"

**System Response:**
- Request submitted
- Notifications sent to approvers
- Confirmation displayed

**Success State:**
```
+----------------------------------------------------------------+
| ✅ Time Off Request Submitted                                  |
+----------------------------------------------------------------+
|                                                                 |
| Request ID: PTO-2025-001                                       |
| Dates: Jan 15-17, 2025 (3 days)                                |
| Status: Pending Approval                                       |
|                                                                 |
| Your request has been sent to:                                 |
| • Lisa Chen (Client Manager)                                   |
| • Sarah Johnson (InTime Recruiter)                             |
|                                                                 |
| You'll receive email notification when your request is         |
| approved or if more information is needed.                     |
|                                                                 |
| Expected Response: Within 2-3 business days                    |
|                                                                 |
| [View Request] [Track Status] [Back to Dashboard]             |
+----------------------------------------------------------------+
```

**Time:** ~3-5 minutes

---

### Step 8: Report Issue or Concern

**User Action:** Click "Report Issue" from dashboard quick actions

**System Response:**
- Issue reporting form opens

**Screen State:**
```
+----------------------------------------------------------------+
|                  Report Issue or Concern                   [×] |
+----------------------------------------------------------------+
|                                                                 |
| We're here to help! Report any issues or concerns about your   |
| assignment.                                                     |
|                                                                 |
| Issue Type *                                                    |
| [Select type...                                            ▼]  |
|                                                                 |
| Options:                                                        |
| • Payment/Timesheet Issue                                      |
| • Assignment/Job Duties Concern                                |
| • Work Environment Issue                                       |
| • Equipment/Technology Problem                                 |
| • Schedule/Hours Concern                                       |
| • Harassment or Discrimination                                 |
| • Safety Concern                                               |
| • Other                                                        |
|                                                                 |
| Priority *                                                      |
| ○ Low - General question or minor issue                        |
| ● Medium - Issue affecting work but not urgent                 |
| ○ High - Urgent issue requiring immediate attention            |
| ○ Critical - Safety or legal concern                           |
|                                                                 |
| Description *                                                   |
| ┌────────────────────────────────────────────────────────┐    |
| │ My timesheet for last week shows incorrect hours.      │    |
| │ I submitted 40 hours but it only shows 38. Can you     │    |
| │ please help correct this?                              │    |
| │                                             125/2000    │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| When did this occur?                                            |
| [12/29/2024 📅]                                                |
|                                                                 |
| Attach Supporting Documents (Optional)                          |
| [📎 Choose Files]                                              |
| • timesheet_screenshot.png (245 KB) [×]                        |
|                                                                 |
| Preferred Contact Method                                        |
| ● Email: john@email.com                                        |
| ○ Phone: (555) 123-4567                                        |
|                                                                 |
| ⚠️ For urgent safety or harassment concerns, you may also      |
| call our 24/7 hotline: 1-800-INTIME-HELP                       |
|                                                                 |
| Your issue will be reviewed by:                                 |
| Sarah Johnson (Your Recruiter)                                 |
| Expected Response: Within 24 hours                             |
|                                                                 |
|                                    [Cancel]  [Submit Report]   |
+----------------------------------------------------------------+
```

**User Action:** Fill form and click "Submit Report"

**System Response:**
- Support ticket created
- Notification sent to recruiter
- Auto-response email to candidate

**Success State:**
```
+----------------------------------------------------------------+
| ✅ Issue Reported Successfully                                 |
+----------------------------------------------------------------+
|                                                                 |
| Ticket #: SUPP-2024-12-456                                     |
| Status: Open - Under Review                                    |
| Priority: Medium                                               |
| Assigned To: Sarah Johnson                                     |
|                                                                 |
| We've received your report about:                              |
| "Payment/Timesheet Issue"                                      |
|                                                                 |
| What happens next:                                              |
| 1. Sarah Johnson will review your issue within 24 hours        |
| 2. You'll receive email updates on progress                    |
| 3. Issue will be resolved as quickly as possible               |
|                                                                 |
| Average Resolution Time: 1-2 business days                     |
|                                                                 |
| You can track progress anytime:                                 |
| [Track Ticket] [Add More Info] [Back to Dashboard]            |
+----------------------------------------------------------------+
```

**Time:** ~5-10 minutes

---

### Step 9: View Contract and Assignment Documents

**User Action:** Click "Documents" → "Contracts" tab

**System Response:**
- Contract documents display

**Screen State:**
```
+----------------------------------------------------------------+
| My Documents - Contracts                                        |
+----------------------------------------------------------------+
| [Pay Stubs] [Tax Forms] [●Contracts] [Policies] [Other]       |
+----------------------------------------------------------------+
|                                                                 |
| 📋 Active Contracts                                            |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 Employment Agreement - Stripe                          │  |
| │                                                            │  |
| │ Position: Staff Software Engineer                         │  |
| │ Contract Type: Contract-to-Hire                           │  |
| │ Start Date: Dec 16, 2024                                  │  |
| │ End Date: Jun 16, 2025                                    │  |
| │ Status: 🟢 Active                                         │  |
| │                                                            │  |
| │ Documents:                                                 │  |
| │ • Main Contract Agreement (PDF, 12 pages)                 │  |
| │ • Addendum: Benefits Summary (PDF, 3 pages)               │  |
| │ • Addendum: Non-Disclosure Agreement (PDF, 5 pages)       │  |
| │ • Signed Offer Letter (PDF, 2 pages)                      │  |
| │                                                            │  |
| │ [View All Docs] [Download ZIP] [Request Change]          │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| 📚 Company Policies & Handbooks                                |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📘 Stripe Employee Handbook                               │  |
| │ Last Updated: Nov 2024                                    │  |
| │ [View Online] [Download PDF]                              │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📘 Code of Conduct                                        │  |
| │ [View] [Download]                                         │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📘 IT Security Policy                                     │  |
| │ [View] [Download]                                         │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| 🔒 Tax & Compliance Documents                                  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 W-9 Form (Completed)                                   │  |
| │ Submitted: Dec 15, 2024                                   │  |
| │ [View] [Download]                                         │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 I-9 Employment Verification                            │  |
| │ Status: ✓ Verified                                        │  |
| │ [View] [Download]                                         │  |
| └──────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 10: Request Assignment Extension

**User Action:** (As end date approaches) Click "Request Change" from dashboard

**System Response:**
- Assignment change request form opens

**Screen State:**
```
+----------------------------------------------------------------+
|               Assignment Change Request                    [×] |
+----------------------------------------------------------------+
|                                                                 |
| Current Assignment: Staff Software Engineer at Stripe          |
| Current End Date: Jun 16, 2025 (4 months remaining)            |
|                                                                 |
| Request Type *                                                  |
| ● Extension                                                    |
| ○ Rate Change                                                  |
| ○ Schedule Change                                              |
| ○ Early Termination                                            |
| ○ Conversion to Full-Time                                      |
|                                                                 |
| ┌─ EXTENSION REQUEST ──────────────────────────────────────┐  |
| │                                                            │  |
| │ Requested New End Date                                    │  |
| │ [09/16/2025 📅] (3 months extension)                      │  |
| │                                                            │  |
| │ Reason for Extension *                                     │  |
| │ ┌──────────────────────────────────────────────────────┐ │  |
| │ │ Project timeline extended. Client requested I stay   │ │  |
| │ │ on to complete the payment platform redesign.        │ │  |
| │ │                                             72/500    │ │  |
| │ └──────────────────────────────────────────────────────┘ │  |
| │                                                            │  |
| │ Has client manager approved?                              │  |
| │ ● Yes - Manager: Lisa Chen                                │  |
| │ ○ No - Pending discussion                                 │  |
| │                                                            │  |
| │ Same rate and terms?                                       │  |
| │ ● Yes - Keep current rate ($125/hr)                       │  |
| │ ○ No - Requesting rate adjustment                         │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                 |
| 💡 What happens next:                                          |
| 1. Your recruiter (Sarah Johnson) will review                  |
| 2. Client will receive formal extension request                |
| 3. New contract will be prepared if approved                   |
| 4. You'll receive updated agreement to sign                    |
|                                                                 |
| Typical Processing Time: 5-7 business days                     |
|                                                                 |
|                                    [Cancel]  [Submit Request]  |
+----------------------------------------------------------------+
```

**User Action:** Fill form and submit

**System Response:**
- Extension request created
- Workflow initiated with client and recruiter
- Confirmation email sent

**Time:** ~5 minutes

---

## Postconditions

1. ✅ Timesheets submitted on time and accurately
2. ✅ All hours tracked and payment processed correctly
3. ✅ Assignment details accessible anytime
4. ✅ Time off requests properly managed
5. ✅ Issues and concerns reported and tracked
6. ✅ All employment documents readily available
7. ✅ Assignment changes requested through proper channels
8. ✅ Strong communication with client manager and recruiter
9. ✅ Positive consultant experience maintained

---

## Events Logged

| Event | Payload |
|-------|---------|
| `timesheet.submitted` | `{ consultant_id, timesheet_id, week_ending, total_hours }` |
| `timesheet.approved` | `{ timesheet_id, approver_id, approval_date }` |
| `timesheet.paid` | `{ timesheet_id, payment_amount, payment_date }` |
| `pto.requested` | `{ consultant_id, start_date, end_date, days, type }` |
| `pto.approved` | `{ pto_request_id, approver_id }` |
| `issue.reported` | `{ consultant_id, issue_type, priority, ticket_id }` |
| `document.accessed` | `{ consultant_id, document_type, document_id }` |
| `assignment.extension_requested` | `{ consultant_id, placement_id, new_end_date }` |
| `paystub.viewed` | `{ consultant_id, paystub_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Timesheet Validation Failed | Invalid hours (e.g., negative, > 24/day) | "Please enter valid hours (0-24 per day)" | Correct hours |
| Timesheet Submission Late | Past deadline | "This timesheet is past the deadline. Contact your recruiter." | Contact recruiter |
| Duplicate Timesheet | Already submitted for week | "Timesheet already exists for this week" | View existing timesheet |
| PTO Exceeds Balance | Requesting more than available | "Insufficient PTO balance. You have 5 days available." | Reduce request or use unpaid |
| Document Not Found | File deleted or moved | "Document unavailable. Contact support." | Contact recruiter |
| Payment Processing Error | Bank account issue | "Payment failed. Please verify banking information." | Update bank details |
| Extension Request Duplicate | Already pending | "Extension request already in progress" | View existing request |
| Unauthorized Access | User not consultant | "Access denied. This section is for active consultants only." | Contact admin |

---

## Timesheet Submission Rules

**Submission Windows:**
| Week Ending | Submission Deadline | Approval Deadline | Payment Date |
|-------------|---------------------|-------------------|--------------|
| Sunday | Tuesday 9 AM | Wednesday 5 PM | Friday |

**Hour Validation Rules:**
- Max daily hours: 24
- Max weekly regular hours (before OT): 40
- Overtime requires pre-approval
- Holiday pay follows client holiday calendar
- PTO hours deducted from balance
- Sick time tracked separately

**Approval Workflow:**
```
Consultant Submits → Manager Approves → Payroll Processes → Payment Issued
     (Tuesday)         (Within 24hr)       (Thursday)          (Friday)
```

---

## Payment Information

**Pay Schedule:**
- Frequency: Weekly
- Pay Period: Sunday - Saturday
- Submission Deadline: Tuesday 9 AM
- Payment Date: Friday (following week)
- Method: Direct deposit

**Deductions:**
- Federal Income Tax
- State Income Tax
- FICA (Social Security): 6.2%
- Medicare: 1.45%
- Any pre-approved deductions

**Overtime Calculation:**
- Hours 0-40: Regular rate
- Hours 41+: 1.5× regular rate (time and a half)
- Overtime requires manager pre-approval

---

## Mobile Experience

**Mobile-Optimized Features:**
- Quick timesheet entry (swipe days, tap hours)
- One-tap timesheet submission
- Push notifications for deadlines
- Mobile paystub viewing
- Easy PTO request
- Click-to-call recruiter/manager
- Document camera upload for receipts

**Mobile Quick Actions:**
```
+--------------------------------+
| My Assignment           [Menu] |
+--------------------------------+
| Staff Engineer @ Stripe        |
| Week 3 of 26                   |
+--------------------------------+
| ⚠️ ACTION: Submit Timesheet    |
| Due: Tomorrow 9 AM             |
| [Submit Now →]                 |
+--------------------------------+
| This Week: 32.5 / 40 hrs       |
| [████████████░░░░] 81%         |
+--------------------------------+
| [💰 Pay Stubs]                 |
| [🏖️ Request PTO]               |
| [📞 Call Recruiter]            |
| [⚙️ Report Issue]              |
+--------------------------------+
```

---

## Related Use Cases

- [01-portal-onboarding.md](./01-portal-onboarding.md) - Initial candidate registration
- [02-manage-profile.md](./02-manage-profile.md) - Update profile information
- [03-view-submissions.md](./03-view-submissions.md) - Track job applications
- [04-prepare-interview.md](./04-prepare-interview.md) - Interview preparation

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit valid weekly timesheet | Timesheet submitted successfully |
| TC-002 | Submit timesheet with hours > 24/day | Validation error displayed |
| TC-003 | Submit duplicate timesheet | Error: already submitted |
| TC-004 | Submit timesheet after deadline | Warning, requires recruiter approval |
| TC-005 | Request PTO within balance | Request submitted for approval |
| TC-006 | Request PTO exceeding balance | Error: insufficient balance |
| TC-007 | View approved timesheet | All details display correctly |
| TC-008 | Download pay stub PDF | PDF downloads successfully |
| TC-009 | Report medium priority issue | Ticket created, recruiter notified |
| TC-010 | Request assignment extension | Request logged, workflow initiated |
| TC-011 | View contract documents | All docs accessible |
| TC-012 | Mobile: swipe to enter hours | Hours saved correctly |

---

*Last Updated: 2024-11-30*
