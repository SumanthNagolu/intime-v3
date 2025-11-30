# Use Case: Employee Onboarding

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-HR-001 |
| Actor | HR Manager |
| Goal | Onboard new employee (internal or placed consultant) from offer acceptance to first day |
| Frequency | 5-15 per month |
| Estimated Time | 2-4 hours per employee |
| Priority | CRITICAL (Legal Compliance) |

---

## Preconditions

1. User is logged in as HR Manager
2. New hire has accepted offer (internal staff or placed consultant)
3. Start date is confirmed
4. User has "onboarding.manage" permission
5. Offer record exists with status = "accepted"

---

## Trigger

One of the following:
- Placement is created (consultant placed at client) - Auto-triggers onboarding
- Internal offer accepted (recruiter, salesperson, operations) - Manual trigger
- HR Manager creates new hire record manually
- Notification: "New hire requires onboarding"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Onboarding Queue

**User Action:** Click "Onboarding" in sidebar

**System Response:**
- Sidebar highlights "Onboarding"
- URL changes to: `/employee/hr/onboarding`
- Onboarding queue loads with all active onboarding cases

**Screen State:**
```
+----------------------------------------------------------+
| Onboarding Queue                    [+ New Hire] [⌘K]    |
+----------------------------------------------------------+
| [Search employees...]              [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| View: [All] [Starting This Week] [Overdue] [Completed]   |
+----------------------------------------------------------+
| Employee        Start Date   Type        Status   Progress|
| ─────────────────────────────────────────────────────── |
| Michael Johnson 12/15/24     Placement   Active   [███░] |
|   Next: I-9 Verification                                 |
|   [Continue Onboarding]                                  |
| ─────────────────────────────────────────────────────── |
| Sarah Chen      12/18/24     Internal    Pending  [░░░░] |
|   Next: Send welcome email                               |
|   [Start Onboarding]                                     |
| ─────────────────────────────────────────────────────── |
| David Park      12/20/24     Placement   Pending  [░░░░] |
|   [Start Onboarding]                                     |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Select New Hire to Onboard

**User Action:** Click "Start Onboarding" for Sarah Chen (Internal Recruiter)

**System Response:**
- Onboarding wizard opens
- Step 1 of 8 appears
- First field is focused

**Screen State:**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [1] Info  [2] Welcome  [3] I-9  [4] Tax  [5] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 1 of 8: Basic Information                           |
|                                                          |
| Employee Information                                     |
|                                                          |
| Full Legal Name *                                        |
| First: [Sarah                 ] MI: [M ] Last: [Chen    ]|
|                                                          |
| Email Address *                                          |
| [sarah.chen@intime.com                             ]     |
|                                                          |
| Phone Number *                                           |
| [(555) 123-4567                                    ]     |
|                                                          |
| Date of Birth *                                          |
| [MM/DD/YYYY                                       📅]    |
|                                                          |
| Social Security Number *                                 |
| [•••-••-••••                                       ] 🔒  |
|                                                          |
| Home Address *                                           |
| Street: [123 Main Street, Apt 4B                   ]     |
| City: [New York              ] State: [NY ▼] ZIP: [10001]|
|                                                          |
| Emergency Contact                                        |
| Name: [John Chen                                   ]     |
| Relationship: [Spouse                              ▼]    |
| Phone: [(555) 987-6543                             ]     |
|                                                          |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Welcome →]   |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Enter Basic Information

**User Action:** Enter all required employee details

**Field Specification: Full Legal Name**
| Property | Value |
|----------|-------|
| Field Name | `firstName`, `middleInitial`, `lastName` |
| Type | Text Input (3 fields) |
| Label | "Full Legal Name" |
| Required | Yes |
| Max Length | 50 chars each |
| Validation | Letters, spaces, hyphens only |
| Note | "Must match government-issued ID" |

**Field Specification: Email**
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | Email Input |
| Label | "Email Address" |
| Required | Yes |
| Format | Valid email format |
| Unique | Must not exist in system |
| Domain | @intime.com for internal, any for consultants |

**Field Specification: SSN**
| Property | Value |
|----------|-------|
| Field Name | `ssn` |
| Type | Encrypted Text Input |
| Label | "Social Security Number" |
| Required | Yes |
| Format | XXX-XX-XXXX |
| Encryption | AES-256 at rest |
| Visibility | Masked (•••-••-••••) |
| Access | HR Manager, Payroll only |

**User Action:** Click "Next: Welcome"

**System Response:**
- Validates all fields
- Encrypts SSN
- Saves to database
- Advances to Step 2

**Time:** ~3 minutes

---

### Step 4: Send Welcome Email

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [2] Welcome  [3] I-9  [4] Tax  [5] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 2 of 8: Send Welcome Email                          |
|                                                          |
| Employment Details                                       |
|                                                          |
| Position/Job Title *                                     |
| [Senior Recruiter                                  ▼]    |
|                                                          |
| Department *                                             |
| [Recruiting                                        ▼]    |
|                                                          |
| Manager *                                                |
| [Mike Rodriguez                                    ▼]    |
|                                                          |
| Start Date *                                             |
| [12/18/2024                                       📅]    |
|                                                          |
| Employment Type *                                        |
| ● Full-Time  ○ Part-Time  ○ Contract                   |
|                                                          |
| Work Location                                            |
| ● Remote  ○ Office  ○ Hybrid                           |
| Office: [New York Office                           ▼]    |
|                                                          |
| Welcome Email Preview                                    |
| ┌────────────────────────────────────────────────────┐ |
| │ To: sarah.chen@intime.com                          │ |
| │ From: hr@intime.com                                │ |
| │ Subject: Welcome to InTime! Your First Day Info    │ |
| │                                                    │ |
| │ Hi Sarah,                                          │ |
| │                                                    │ |
| │ Welcome to InTime! We're thrilled to have you     │ |
| │ joining our team as Senior Recruiter.             │ |
| │                                                    │ |
| │ Start Date: Monday, December 18, 2024             │ |
| │ Manager: Mike Rodriguez                            │ |
| │ Department: Recruiting                             │ |
| │                                                    │ |
| │ Before your first day, please:                    │ |
| │ • Complete I-9 form (link below)                  │ |
| │ • Submit W-4 and state tax forms                  │ |
| │ • Set up direct deposit                           │ |
| │                                                    │ |
| │ [Complete Onboarding Tasks]                       │ |
| │                                                    │ |
| │ Looking forward to seeing you!                    │ |
| │ HR Team                                            │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| [Edit Template] [Preview] [Send Now] [Schedule Send]    |
+----------------------------------------------------------+
|                [← Back]  [Cancel]  [Send & Next: I-9 →] |
+----------------------------------------------------------+
```

**User Action:** Review email, click "Send & Next: I-9"

**System Response:**
- Email sent to sarah.chen@intime.com
- Activity logged: "welcome_email_sent"
- Advances to Step 3

**Time:** ~2 minutes

---

### Step 5: I-9 Verification (Section 1)

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [3] I-9  [4] Tax  [5] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 3 of 8: I-9 Employment Eligibility Verification     |
|                                                          |
| ℹ️ The employee must complete Section 1. HR will verify |
| documents and complete Section 2 on or before Day 1.     |
|                                                          |
| SECTION 1: Employee Information (Employee Completes)     |
|                                                          |
| Status: ⏳ Waiting for Employee                          |
|                                                          |
| [Send I-9 Form to Employee]                              |
|                                                          |
| OR                                                       |
|                                                          |
| [Complete In-Person with Employee]                       |
|                                                          |
| ─────────────────────────────────────────────────────── |
| SECTION 2: Employer Review (HR Completes)                |
|                                                          |
| ⚠️ Can only be completed after Section 1                |
|                                                          |
| Document Verification                                    |
| List A (Identity + Work Auth) OR List B (Identity) + C  |
|                                                          |
| Selected Documents: [Not yet verified]                   |
|                                                          |
| ☐ I have physically examined original documents          |
| ☐ Documents appear genuine and relate to employee        |
|                                                          |
| Verification Date: [MM/DD/YYYY                     📅]   |
| Verified By: [Auto-filled: Current User]                 |
|                                                          |
| [Upload Document Scan]                                   |
|                                                          |
+----------------------------------------------------------+
|          [← Back]  [Skip for Now]  [Next: Tax Forms →]  |
+----------------------------------------------------------+
```

**User Action:** Click "Send I-9 Form to Employee"

**System Response:**
- Generates unique I-9 form link
- Sends email to employee with link
- Sets reminder: "Complete I-9 by [start date]"
- Toast: "I-9 form sent to Sarah Chen"

**User Action:** Click "Skip for Now" (will complete when employee submits Section 1)

**System Response:**
- Advances to Step 4
- Adds task to HR queue: "Complete I-9 Section 2 for Sarah Chen"

**Time:** ~1 minute

---

### Step 6: Tax Forms (W-4, State)

**Screen State (Step 4):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [⏳] I-9  [4] Tax  [5] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 4 of 8: Tax Forms                                   |
|                                                          |
| Federal Tax Withholding (W-4)                            |
|                                                          |
| Status: ⏳ Waiting for Employee                          |
|                                                          |
| [Send W-4 Form to Employee]                              |
|                                                          |
| OR                                                       |
|                                                          |
| [Complete With Employee] [Upload Completed Form]         |
|                                                          |
| ─────────────────────────────────────────────────────── |
| State Tax Withholding                                    |
|                                                          |
| Work State: [New York                              ▼]    |
|                                                          |
| Forms Required:                                          |
| • NY IT-2104 (New York State Withholding)                |
|                                                          |
| Status: ⏳ Waiting for Employee                          |
|                                                          |
| [Send State Form to Employee]                            |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Local/City Tax (if applicable)                           |
|                                                          |
| NYC residents must complete NYC-202                      |
|                                                          |
| [Send NYC Form]                                          |
|                                                          |
+----------------------------------------------------------+
|        [← Back]  [Skip for Now]  [Next: Payroll →]      |
+----------------------------------------------------------+
```

**User Action:** Click "Send W-4 Form to Employee"

**System Response:**
- Sends email with W-4 link
- Employee can e-sign via DocuSign
- Creates task: "W-4 needed from Sarah Chen"

**User Action:** Click "Send State Form to Employee"

**System Response:**
- Sends NY IT-2104 form
- Creates task: "NY tax form needed from Sarah Chen"

**User Action:** Click "Next: Payroll"

**Time:** ~2 minutes

---

### Step 7: Payroll Setup

**Screen State (Step 5):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [⏳] I-9  [⏳] Tax  [5] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 5 of 8: Payroll Setup                               |
|                                                          |
| Compensation Details                                     |
|                                                          |
| Pay Type *                                               |
| ● Salary  ○ Hourly                                      |
|                                                          |
| Annual Salary *                                          |
| $[75,000.00    ]                                         |
|                                                          |
| Pay Frequency *                                          |
| ○ Weekly  ● Bi-Weekly  ○ Semi-Monthly  ○ Monthly        |
|                                                          |
| Calculated:                                              |
| • Bi-Weekly Gross: $2,884.62                            |
| • Hourly Rate: $36.06/hr (based on 2080 hrs/year)       |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Direct Deposit Information                               |
|                                                          |
| Status: ⏳ Waiting for Employee                          |
|                                                          |
| [Send Direct Deposit Form to Employee]                   |
|                                                          |
| OR                                                       |
|                                                          |
| Bank Name: [                                       ]     |
| Routing Number: [                                  ]     |
| Account Number: [                                  ]     |
| Account Type: [Checking                            ▼]    |
|                                                          |
| [Upload Voided Check]                                    |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Deductions & Benefits                                    |
|                                                          |
| Health Insurance: [Not yet enrolled]                     |
| Dental Insurance: [Not yet enrolled]                     |
| 401(k): [Not yet enrolled]                               |
|                                                          |
| ℹ️ Employee can enroll during benefits orientation      |
|                                                          |
+----------------------------------------------------------+
|     [← Back]  [Send Forms]  [Next: Background Check →]  |
+----------------------------------------------------------+
```

**User Action:** Enter compensation details

**Field Specification: Annual Salary**
| Property | Value |
|----------|-------|
| Field Name | `annualSalary` |
| Type | Currency Input |
| Label | "Annual Salary" |
| Required | Yes (if salary type) |
| Min | $15,000 (minimum wage equivalent) |
| Max | $500,000 |
| Precision | 2 decimal places |
| Auto-calculate | Bi-weekly gross, hourly rate |

**User Action:** Click "Send Direct Deposit Form to Employee"

**System Response:**
- Email sent with secure link
- Employee can enter bank details
- Creates task: "Direct deposit form needed"

**User Action:** Click "Next: Background Check"

**Time:** ~3 minutes

---

### Step 8: Background Check

**Screen State (Step 6):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [⏳] I-9  [⏳] Tax  [✓] Pay  [6] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 6 of 8: Background Check                            |
|                                                          |
| Background Check Provider: Checkr                        |
|                                                          |
| Searches to Include:                                     |
| ☑ County Criminal Search                                |
| ☑ State Criminal Search                                 |
| ☑ Federal Criminal Search                               |
| ☑ Sex Offender Registry                                 |
| ☑ SSN Verification                                      |
| ☐ Employment Verification (optional)                    |
| ☐ Education Verification (optional)                     |
| ☐ Credit Check (for finance roles)                      |
| ☐ Drug Screening                                        |
|                                                          |
| Package: [Standard - $29.99                        ▼]    |
|                                                          |
| Estimated Turnaround: 3-5 business days                  |
|                                                          |
| Consent Form Status: ⏳ Waiting for Employee             |
|                                                          |
| [Send Consent Form to Employee]                          |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Background Check Status                                  |
|                                                          |
| Status: ⏳ Not Ordered                                   |
|                                                          |
| [Order Background Check]                                 |
|                                                          |
| ⚠️ Cannot be ordered until employee signs consent        |
|                                                          |
+----------------------------------------------------------+
|          [← Back]  [Skip for Now]  [Next: IT Setup →]   |
+----------------------------------------------------------+
```

**User Action:** Select search types, click "Send Consent Form to Employee"

**System Response:**
- Email sent with Checkr consent link
- Employee signs consent electronically
- Once signed, "Order Background Check" button enables

**User Action:** Click "Skip for Now" (will order once consent received)

**System Response:**
- Creates task: "Order background check after consent"
- Reminder set: "Ensure BG check cleared before start date"

**Time:** ~2 minutes

---

### Step 9: IT Equipment Request

**Screen State (Step 7):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [⏳] I-9  [⏳] Tax  [✓] Pay  [⏳] BG [7] IT [8] Review
+----------------------------------------------------------+
| Step 7 of 8: IT Equipment & Access                       |
|                                                          |
| Equipment Needed                                         |
|                                                          |
| ☑ Laptop                                                |
|   Model: [MacBook Pro 14"                          ▼]    |
|                                                          |
| ☑ Phone                                                 |
|   Model: [iPhone 15                                ▼]    |
|                                                          |
| ☑ Monitor                                               |
|   Model: [27" LG UltraFine                         ▼]    |
|                                                          |
| ☑ Accessories                                           |
|   ☑ Mouse  ☑ Keyboard  ☑ Webcam  ☑ Headset             |
|                                                          |
| Delivery Location                                        |
| ● Ship to Employee's Home                               |
|   Address: 123 Main Street, Apt 4B, New York, NY 10001  |
| ○ Pickup at Office                                      |
|                                                          |
| Ship By Date: 12/16/24 (2 days before start)            |
|                                                          |
| ─────────────────────────────────────────────────────── |
| System Access                                            |
|                                                          |
| Email Account: sarah.chen@intime.com                     |
| Status: ⏳ Will be created                               |
|                                                          |
| Systems/Apps to Provision:                               |
| ☑ Google Workspace (Email, Calendar, Drive)             |
| ☑ Slack                                                 |
| ☑ InTime ATS (Recruiter access)                         |
| ☑ Zoom                                                  |
| ☑ 1Password (Password manager)                          |
| ☐ Salesforce (for sales roles)                          |
| ☐ QuickBooks (for finance roles)                        |
|                                                          |
| Access Level: [Recruiter - Standard                ▼]    |
|                                                          |
| [Create IT Ticket]                                       |
|                                                          |
+----------------------------------------------------------+
|             [← Back]  [Cancel]  [Next: Review →]        |
+----------------------------------------------------------+
```

**User Action:** Select equipment and systems, click "Create IT Ticket"

**System Response:**
- IT ticket created in system
- Assigned to IT Manager
- Email sent to IT team
- Due date: 12/16/24 (2 days before start)
- Toast: "IT equipment request submitted"

**User Action:** Click "Next: Review"

**Time:** ~3 minutes

---

### Step 10: Review & Submit

**Screen State (Step 8):**
```
+----------------------------------------------------------+
|                    Onboard New Hire - Sarah Chen         |
|                                                      [×] |
+----------------------------------------------------------+
| [✓] Info  [✓] Welcome  [⏳] I-9  [⏳] Tax  [✓] Pay  [⏳] BG [✓] IT [8] Review
+----------------------------------------------------------+
| Step 8 of 8: Review Onboarding Plan                      |
|                                                          |
| Employee: Sarah M. Chen                                  |
| Position: Senior Recruiter                               |
| Department: Recruiting                                   |
| Manager: Mike Rodriguez                                  |
| Start Date: Monday, December 18, 2024                    |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ ONBOARDING CHECKLIST (8 Tasks)                     │ |
| │                                                    │ |
| │ ✓ 1. Welcome Email Sent (12/13)                   │ |
| │ ⏳ 2. I-9 Section 1: Waiting for employee          │ |
| │ ⏳ 3. I-9 Section 2: HR to complete by 12/18       │ |
| │ ⏳ 4. W-4 Form: Waiting for employee               │ |
| │ ⏳ 5. NY Tax Form: Waiting for employee            │ |
| │ ⏳ 6. Direct Deposit: Waiting for employee         │ |
| │ ⏳ 7. Background Check: Consent pending            │ |
| │ ✓ 8. IT Equipment: Requested, ship by 12/16       │ |
| │                                                    │ |
| │ Progress: 2 of 8 completed (25%)                   │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ AUTO-TRIGGERED ACTIONS                             │ |
| │                                                    │ |
| │ ✓ Create employee record in system                │ |
| │ ✓ Assign employee ID: EMP-2024-127                │ |
| │ ✓ Add to org chart under Mike Rodriguez           │ |
| │ ✓ Create payroll record (bi-weekly, $75k/year)    │ |
| │ ✓ Send welcome email with task links              │ |
| │ ✓ Create IT equipment request                     │ |
| │ ⏳ Send I-9, W-4, tax forms to employee (sent)     │ |
| │ ⏳ Order background check (waiting for consent)    │ |
| │ ⏳ Schedule first day orientation (will schedule)  │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ℹ️ You can track progress in the Onboarding Queue       |
|                                                          |
+----------------------------------------------------------+
|           [← Back]  [Cancel]  [Complete Onboarding ✓]   |
+----------------------------------------------------------+
```

**User Action:** Review all details, click "Complete Onboarding"

**System Response:**

1. **Create Employee Record:**
   ```sql
   INSERT INTO employees (
     id, org_id, first_name, last_name, email,
     phone, date_of_birth, ssn_encrypted,
     address_street, address_city, address_state, address_zip,
     emergency_contact_name, emergency_contact_phone,
     position_title, department, manager_id,
     start_date, employment_type, work_location,
     annual_salary, pay_frequency,
     status, created_by
   ) VALUES (
     uuid_generate_v4(), current_org_id,
     'Sarah', 'Chen', 'sarah.chen@intime.com',
     '5551234567', '1990-05-15', encrypt_ssn('123-45-6789'),
     '123 Main Street, Apt 4B', 'New York', 'NY', '10001',
     'John Chen', '5559876543',
     'Senior Recruiter', 'Recruiting', mike_rodriguez_id,
     '2024-12-18', 'full_time', 'remote',
     75000.00, 'bi_weekly',
     'pending_start', current_user_id
   );
   ```

2. **Create Onboarding Tasks:**
   ```typescript
   const tasks = [
     { name: 'Complete I-9 Section 1', assignedTo: 'employee', dueDate: '2024-12-17', status: 'sent' },
     { name: 'Verify I-9 Section 2', assignedTo: 'hr', dueDate: '2024-12-18', status: 'pending' },
     { name: 'Submit W-4', assignedTo: 'employee', dueDate: '2024-12-17', status: 'sent' },
     { name: 'Submit NY Tax Form', assignedTo: 'employee', dueDate: '2024-12-17', status: 'sent' },
     { name: 'Submit Direct Deposit Info', assignedTo: 'employee', dueDate: '2024-12-17', status: 'sent' },
     { name: 'Order Background Check', assignedTo: 'hr', dueDate: '2024-12-14', status: 'waiting_consent' },
     { name: 'IT Equipment Delivery', assignedTo: 'it', dueDate: '2024-12-16', status: 'in_progress' },
     { name: 'First Day Orientation', assignedTo: 'hr', dueDate: '2024-12-18', status: 'pending' }
   ];

   for (const task of tasks) {
     await db.insert(onboarding_tasks).values({
       employeeId: newEmployeeId,
       ...task
     });
   }
   ```

3. **Success Response:**
   - Modal closes
   - Confetti animation (2 seconds)
   - Toast: "Sarah Chen onboarding started! 8 tasks created."
   - Redirects to onboarding queue
   - New employee appears with 25% progress

**Time:** ~2 minutes

---

## Postconditions

1. ✅ Employee record created in `employees` table
2. ✅ Employee ID assigned (EMP-2024-127)
3. ✅ Onboarding checklist created (8 tasks)
4. ✅ Welcome email sent to employee
5. ✅ I-9, W-4, tax forms sent to employee via email
6. ✅ IT equipment request created and assigned
7. ✅ Background check consent sent (waiting for signature)
8. ✅ Payroll record created
9. ✅ Employee added to org chart
10. ✅ Manager notified of new team member
11. ✅ HR dashboard updated with new onboarding case
12. ✅ Compliance tracking started (I-9 deadline, etc.)

---

## Alternative Flows

### A1: Onboard Placed Consultant (Auto-Triggered)

**Trigger:** Placement record created by Recruiter

**Flow:**
1. Placement status = "active"
2. System auto-creates onboarding case
3. HR receives notification: "New placement requires onboarding"
4. HR clicks notification → onboarding wizard opens
5. Fields pre-filled from placement record:
   - Name, email, phone from candidate profile
   - Start date from placement
   - Pay rate from placement
   - Client from placement (for reference)
6. HR completes same 8-step wizard
7. Onboarding tasks created
8. Consultant receives welcome email

**Differences from Internal Hire:**
- Employment type: "Placement" (not Internal)
- Client field shown (reference only)
- Billing/pay rates from placement record
- May require client-specific onboarding (e.g., client badge, VPN access)

### A2: Complete I-9 Section 2 (After Employee Submits Section 1)

**Trigger:** Employee completes I-9 Section 1, HR receives notification

**Flow:**
1. HR receives email: "Sarah Chen submitted I-9 Section 1"
2. HR clicks link → I-9 verification screen opens
3. HR reviews Section 1 (employee-completed)
4. HR schedules in-person or video meeting with employee
5. Employee shows original documents (passport, driver's license + SSN card, etc.)
6. HR verifies documents:
   - Selects document types (List A or List B+C)
   - Enters document numbers
   - Enters expiration dates
   - Checks verification boxes
   - Uploads document scans
7. HR clicks "Submit I-9 Section 2"
8. System:
   - Saves I-9 record
   - Marks task as complete
   - Updates compliance tracking
   - Sets re-verification reminder (if needed)
   - Updates onboarding progress: +1 task

### A3: Order Background Check (After Consent)

**Trigger:** Employee signs background check consent form

**Flow:**
1. Checkr webhook notifies system: "Consent signed"
2. HR receives notification: "Sarah Chen signed consent - order BG check"
3. HR navigates to onboarding queue → Sarah Chen
4. Clicks "Background Check" tab
5. "Order Background Check" button is now enabled
6. HR clicks button
7. System:
   - API call to Checkr: `POST /v1/invitations`
   - Sends employee details (name, DOB, SSN, address)
   - Selects package: "Standard"
   - Checkr initiates searches
8. Checkr returns invitation ID and status: "Pending"
9. System creates webhook subscription for status updates
10. HR sees: "Background check ordered - ETA: 3-5 days"
11. When complete, HR receives notification: "BG check cleared" or "BG check - review required"

### A4: Handle Background Check Issue

**Trigger:** Background check returns with criminal record or discrepancy

**Flow:**
1. Checkr webhook: "Report complete - status: Consider"
2. HR receives notification: "Sarah Chen BG check - review required"
3. HR opens Checkr report
4. Reviews findings:
   - Criminal record: Misdemeanor DUI, 5 years ago
   - Employment verification: Previous employer unresponsive
5. HR evaluates:
   - Is it relevant to the position? (Recruiter role - DUI not relevant)
   - Is it within company policy?
6. HR options:
   - **Proceed with hire:** Mark as reviewed and approved
   - **Conditional approval:** Require explanation from candidate
   - **Adverse action:** Begin adverse action process (legally required)
7. HR documents decision in employee notes
8. If proceeding, marks task as complete
9. If adverse action, initiates FCRA-compliant process

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Email already exists | Employee email in system | "Email address already registered" | Use different email or deactivate old account |
| SSN already exists | Duplicate SSN in system | "SSN already on file for another employee" | Verify employee identity, possible duplicate |
| Start date in past | User entered past date | "⚠️ Start date is in the past. Is this a retroactive hire?" | Confirm or adjust date |
| Missing required field | User skipped required field | "Please complete all required fields" | Fill missing fields |
| I-9 document expired | User entered expired document | "Document has expired. Please verify current document." | Request updated document |
| Background check API error | Checkr API down | "Unable to connect to background check provider. Please try again later." | Retry or contact Checkr support |
| Payroll sync error | Integration failure | "Failed to create payroll record. Please contact Payroll." | Manual payroll entry |

---

## Compliance Requirements

### I-9 Compliance

**Legal Requirements:**
- Section 1: Employee completes on or before Day 1
- Section 2: Employer completes within 3 business days of hire date
- Document retention: 3 years after hire OR 1 year after termination (whichever is later)
- Re-verification: When work authorization expires (H1B, EAD)

**InTime Implementation:**
- Section 1: Employee e-signs via DocuSign
- Section 2: HR verifies documents (in-person or video)
- Document scans stored in encrypted S3 bucket
- Compliance dashboard tracks: Pending I-9s, Expiring work auth, Missing I-9s
- Automatic reminders: 30 days before work auth expires

### Tax Form Compliance

**Legal Requirements:**
- W-4: Required for all employees
- State tax forms: Required based on work state
- Submission: On or before first payroll

**InTime Implementation:**
- W-4: E-sign via DocuSign, data syncs to payroll system
- State forms: Auto-detected based on work state
- Compliance tracking: Missing W-4s flagged on HR dashboard

### Background Check Compliance (FCRA)

**Legal Requirements:**
- Disclosure: Employer must disclose BG check to candidate
- Consent: Candidate must sign consent form
- Adverse action: If denied based on BG check, must follow 5-step process
- Record retention: 5 years

**InTime Implementation:**
- Disclosure + Consent: Combined form via Checkr
- Adverse action workflow: Built into system (pre-adverse notice, waiting period, final notice)
- Record retention: Automated (reports stored for 5 years)

---

## Related Use Cases

- [03-payroll-management.md](./03-payroll-management.md) - Processing payroll for new hire
- [04-performance-reviews.md](./04-performance-reviews.md) - First 90-day review
- [05-time-and-attendance.md](./05-time-and-attendance.md) - Timesheet setup

---

*Last Updated: 2024-11-30*
