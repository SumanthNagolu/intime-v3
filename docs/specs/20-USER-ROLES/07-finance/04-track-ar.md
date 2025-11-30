# Use Case: Track Accounts Receivable

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-FIN-004 |
| Actor | Finance/CFO |
| Goal | Monitor and manage accounts receivable to ensure timely payment collection |
| Frequency | Daily (quick check), Weekly (detailed review), Monthly (aging analysis) |
| Estimated Time | 15-30 minutes daily, 1-2 hours weekly |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Finance/CFO
2. User has AR management permissions
3. Invoices have been generated and sent to clients
4. Payment tracking system is active
5. Email integration configured for reminders
6. Banking integration active for payment application

---

## Trigger

One of the following:
- Daily routine: Morning AR check (8:30 AM)
- Alert: "Invoice 90+ days overdue - Acme Corp $45,000"
- Payment received notification: "Payment received - Google $100,000"
- Weekly task: "AR aging review due - Tuesday"
- Client inquiry: "Checking payment status for invoice"
- Month-end close: "AR reconciliation required"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to AR Aging Report

**User Action:** Click "AR/AP Management" in sidebar, then "AR Aging" tab

**System Response:**
- Sidebar highlights
- URL changes to: `/employee/finance/ar-aging`
- AR Aging dashboard loads
- Data updates from latest transactions

**Screen State:**
```
+----------------------------------------------------------+
| Accounts Receivable Aging           [Refresh] [Export]    |
+----------------------------------------------------------+
| As of: Nov 30, 2025 8:35 AM          Total AR: $1,200,000 |
+----------------------------------------------------------+
| DSO: 42 days  Target: ≤45  ✓     |  Collection Rate: 95%  |
+----------------------------------------------------------+
| [Current] [0-30] [31-60] [61-90] [90+] [By Client] [All] |
+----------------------------------------------------------+
| Summary by Aging Bucket                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Bucket      Amount      Count    %      Status     │  |
| │ ────────────────────────────────────────────────────│  |
| │ Current    $420,000      12     35%    ✓ Good      │  |
| │ 0-30 days  $360,000      10     30%    ✓ Good      │  |
| │ 31-60 days $264,000       8     22%    🟡 Monitor   │  |
| │ 61-90 days  $96,000       4      8%    🟠 Concern   │  |
| │ 90+ days    $60,000       3      5%    🔴 Critical  │  |
| │ ────────────────────────────────────────────────────│  |
| │ Total    $1,200,000      37    100%                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Aging Trend (Last 3 Months)                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Sep:  DSO 38 days  |  Oct: DSO 40 days  |  Nov: 42 │  |
| │ Trend: Increasing ↑ (Action needed)                │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 2: Review Current and Recent Invoices (0-30 Days)

**User Action:** Click "0-30" tab to filter

**System Response:**
- List filters to show only 0-30 day invoices
- Sorted by due date (oldest first)

**Screen State:**
```
+----------------------------------------------------------+
| AR Aging: 0-30 Days                    Total: $360,000    |
+----------------------------------------------------------+
| Invoice     Client      Amount    Due Date  Age  Actions  |
| ─────────────────────────────────────────────────────────|
| INV-2025-985 Google    $120,000  Nov 15    15d  [View]   |
|   Status: 🟢 On track for payment                        |
|   Contact: billing@google.com                            |
|   Last Contact: Nov 29 (Confirmation received)           |
| ─────────────────────────────────────────────────────────|
| INV-2025-990 Meta       $85,000  Nov 20    10d  [View]   |
|   Status: 🟢 Payment scheduled for Dec 5                 |
|   Contact: ap@meta.com                                   |
| ─────────────────────────────────────────────────────────|
| INV-2025-1001 Google   $100,000  Nov 29     1d  [View]   |
|   Status: 🟢 Just sent                                   |
|   Contact: billing@google.com                            |
| ─────────────────────────────────────────────────────────|
| INV-2025-1002 Meta      $60,000  Dec 13    -13d [View]   |
|   Status: 🔵 Not yet due                                 |
|   Contact: ap@meta.com                                   |
| ─────────────────────────────────────────────────────────|
| ... (6 more invoices)                                    |
+----------------------------------------------------------+
```

**User Action:** Review invoices, note any requiring follow-up

**Time:** ~2 minutes

---

### Step 3: Review 31-60 Day Invoices (Monitoring Needed)

**User Action:** Click "31-60" tab

**System Response:**
- Filters to 31-60 day range
- Highlights invoices approaching 60 days

**Screen State:**
```
+----------------------------------------------------------+
| AR Aging: 31-60 Days                   Total: $264,000    |
+----------------------------------------------------------+
| Invoice     Client      Amount    Due Date  Age  Actions  |
| ─────────────────────────────────────────────────────────|
| INV-2024-845 Amazon     $62,000  Oct 16    45d  [Follow]  |
|   Status: 🟡 Payment pending (per client)                |
|   Contact: vendor-invoices@amazon.com                    |
|   Last Contact: Nov 25 (Reminder sent)                   |
|   Next Action: Follow up Nov 30                          |
|   [Send Reminder] [Call Client] [Escalate]               |
| ─────────────────────────────────────────────────────────|
| INV-2024-850 Apple      $44,000  Oct 20    41d  [Follow]  |
|   Status: 🟡 In approval process                         |
|   Contact: invoices@apple.com                            |
|   Last Contact: Nov 28 (Approved, payment in progress)   |
|   Next Action: Check status Dec 2                        |
| ─────────────────────────────────────────────────────────|
| INV-2024-860 Netflix    $35,000  Oct 25    36d  [Follow]  |
|   Status: 🟡 Partial payment received ($30k)             |
|   Contact: billing@netflix.com                           |
|   Last Contact: Nov 27 (Dispute on 40 hours)            |
|   Balance Due: $5,000 (after credit memo)                |
|   [View Dispute] [Send Updated Invoice]                  |
| ─────────────────────────────────────────────────────────|
| ... (5 more invoices)                                    |
+----------------------------------------------------------+
```

**User Action:** Click "Send Reminder" on Amazon invoice

**System Response:**
- Email composer opens with pre-filled template

**Screen State (Reminder Email):**
```
+----------------------------------------------------------+
| Send Payment Reminder                                [×] |
+----------------------------------------------------------+
| Invoice: INV-2024-845                                     |
| Client: Amazon                                            |
| Amount: $62,000.00                                        |
| Days Overdue: 45                                          |
+----------------------------------------------------------+
| To: vendor-invoices@amazon.com                           |
| CC: accountmanager@intime.com                            |
| BCC: finance@intime.com                                  |
|                                                           |
| Subject: Payment Reminder - Invoice INV-2024-845         |
|                                                           |
| Template: [45-Day Friendly Reminder ▼]                   |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Dear Amazon Accounts Payable Team,                 │  |
| │                                                     │  |
| │ This is a friendly reminder that invoice           │  |
| │ INV-2024-845 for $62,000 is now 45 days past the  │  |
| │ due date of October 16, 2025.                      │  |
| │                                                     │  |
| │ Invoice Details:                                    │  |
| │ - Invoice Number: INV-2024-845                     │  |
| │ - Amount: $62,000.00                               │  |
| │ - Original Due Date: October 16, 2025             │  |
| │ - Days Overdue: 45                                 │  |
| │                                                     │  |
| │ According to our last communication on Nov 25,     │  |
| │ payment was pending. Could you please provide an   │  |
| │ update on the expected payment date?               │  |
| │                                                     │  |
| │ If payment has been sent, please reply with       │  |
| │ confirmation and payment details.                  │  |
| │                                                     │  |
| │ If there are any issues, please contact us        │  |
| │ immediately so we can resolve them.                │  |
| │                                                     │  |
| │ Thank you,                                          │  |
| │ [Your Name]                                         │  |
| │ CFO, InTime Solutions                              │  |
| │ Phone: (555) 123-4567                              │  |
| │ Email: cfo@intime.com                              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Attachments: 📎 INV-2024-845.pdf                         |
|                                                           |
| Follow-up Task:                                           |
| ☑️  Create task to follow up in 7 days if no response    |
|                                                           |
|                                  [Cancel] [Send Reminder] |
+----------------------------------------------------------+
```

**User Action:** Review email, click "Send Reminder"

**System Response:**
- Email sent
- Activity logged on invoice
- Follow-up task created for Dec 7
- Toast: "Payment reminder sent to Amazon"
- Invoice updated with last contact date

**Time:** ~5 minutes per invoice requiring action

---

### Step 4: Review 61-90 Day Invoices (Escalation Zone)

**User Action:** Click "61-90" tab

**System Response:**
- Filters to 61-90 day range
- Shows warning indicators

**Screen State:**
```
+----------------------------------------------------------+
| AR Aging: 61-90 Days ⚠️                Total: $96,000     |
+----------------------------------------------------------+
| Invoice     Client      Amount    Due Date  Age  Actions  |
| ─────────────────────────────────────────────────────────|
| INV-2024-790 TechCorp   $52,000  Sept 22   69d  [Escalate]|
|   Status: 🟠 Multiple reminders sent, no response        |
|   Contact: ap@techcorp.com                               |
|   Last Contact: Nov 22 (2nd reminder, no response)       |
|   History:                                                |
|     Oct 23: 1st reminder sent                            |
|     Nov 1:  2nd reminder sent                            |
|     Nov 22: Escalation to Account Manager                |
|   Next Action: Escalate to Collections                   |
|   [Escalate] [Call Client] [Credit Hold]                 |
| ─────────────────────────────────────────────────────────|
| INV-2024-810 StartupXYZ $28,000  Oct 1     60d  [Escalate]|
|   Status: 🟠 Payment plan requested                      |
|   Contact: finance@startupxyz.com                        |
|   Last Contact: Nov 28 (Payment plan proposed)           |
|   Proposal: $10k now, $18k in 30 days                    |
|   [Review Plan] [Approve] [Reject]                       |
| ─────────────────────────────────────────────────────────|
| INV-2024-820 ConsultCo  $16,000  Oct 5     56d  [Escalate]|
|   Status: 🟠 Dispute - invoice quantity questioned       |
|   Contact: billing@consultco.com                         |
|   Last Contact: Nov 20 (Dispute raised)                  |
|   Issue: Claims only 100 hours, invoice shows 128       |
|   [Review Dispute] [Provide Documentation]               |
| ─────────────────────────────────────────────────────────|
+----------------------------------------------------------+
```

**User Action:** Click "Escalate" on TechCorp invoice

**System Response:**
- Escalation workflow opens

**Screen State (Escalation Workflow):**
```
+----------------------------------------------------------+
| Escalate Invoice - INV-2024-790                      [×] |
+----------------------------------------------------------+
| Client: TechCorp                    Amount: $52,000       |
| Days Overdue: 69                    Current: Level 1      |
+----------------------------------------------------------+
| Escalation History                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Sept 22: Invoice sent                               │  |
| │ Oct 1:   1st reminder (auto)                        │  |
| │ Oct 23:  2nd reminder (manual) - No response       │  |
| │ Nov 1:   Account Manager contacted                 │  |
| │ Nov 22:  Account Manager escalation - No success   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Escalation Path                                           |
| ○ Level 1: Automated Reminders (0-30 days)              |
| ○ Level 2: Account Manager (31-60 days) - COMPLETED     |
| ● Level 3: CFO Direct Contact (61-90 days) ← CURRENT    |
| ○ Level 4: Collections/Legal (90+ days)                 |
|                                                           |
| Level 3 Actions                                           |
| ☑️  Direct phone call to client CFO                      |
| ☑️  Send formal demand letter                            |
| ☑️  Place account on credit hold (no new work)           |
| ☐  Engage collections agency                            |
| ☐  Refer to legal counsel                               |
|                                                           |
| Phone Contact                                             |
| Client CFO: Sarah Johnson                                |
| Phone: (555) 987-6543                                    |
| Email: cfo@techcorp.com                                  |
|                                                           |
| Demand Letter Template                                    |
| [Formal 60-Day Overdue Demand ▼]                         |
|                                                           |
| Credit Hold                                               |
| ⚠️  This will prevent new jobs/contracts with TechCorp   |
| Account Manager will be notified                         |
|                                                           |
| Notes:                                                    |
| [Client has been non-responsive. Multiple attempts       |
|  to contact via email unsuccessful. Phone call           |
|  scheduled for Nov 30 at 2:00 PM. If no resolution,      |
|  recommend credit hold and collections referral.]        |
|                                                           |
|                  [Cancel] [Call Client] [Send & Hold]     |
+----------------------------------------------------------+
```

**User Action:** Add notes, check actions, click "Send & Hold"

**System Response:**
- Demand letter generated and sent (certified mail)
- Account placed on credit hold
- Account Manager notified
- Activity logged
- Task created for follow-up call
- Toast: "TechCorp escalated to Level 3 - Account on credit hold"

**Time:** ~10 minutes

---

### Step 5: Review 90+ Day Invoices (Critical - Legal Action)

**User Action:** Click "90+" tab

**System Response:**
- Filters to 90+ days
- Shows critical status indicators
- Auto-highlights for immediate action

**Screen State:**
```
+----------------------------------------------------------+
| AR Aging: 90+ Days 🔴 CRITICAL         Total: $60,000     |
+----------------------------------------------------------+
| ⚠️  3 invoices require immediate action                   |
+----------------------------------------------------------+
| Invoice     Client      Amount    Due Date  Age  Actions  |
| ─────────────────────────────────────────────────────────|
| INV-2023-456 Acme Corp  $45,000  Aug 27    95d  [Legal]   |
|   Status: 🔴 CRITICAL - Legal action recommended         |
|   Contact: ap@acmecorp.com                               |
|   Escalation Level: 4 (Legal)                            |
|   History:                                                |
|     Sept 27: 1st reminder                                |
|     Oct 15:  2nd reminder                                |
|     Oct 30:  Account Manager escalation                  |
|     Nov 15:  CFO direct contact - No response            |
|     Nov 22:  Demand letter sent (certified)              |
|     Nov 29:  Collections agency engaged                  |
|   Current Status: With XYZ Collections                   |
|   Collections Contact: John Smith, (555) 111-2222        |
|   [Contact Collections] [Legal Referral] [Write Off]     |
| ─────────────────────────────────────────────────────────|
| INV-2023-489 FailedCo   $10,000  Aug 30    92d  [Legal]   |
|   Status: 🔴 CRITICAL - Company insolvent                |
|   Contact: N/A (company closed)                          |
|   Notes: Company went out of business in October        |
|   Recommendation: Write off as bad debt                  |
|   [Write Off] [View Documentation]                       |
| ─────────────────────────────────────────────────────────|
| INV-2023-501 SlowPay Inc $5,000  Sept 5    86d  [Legal]   |
|   Status: 🔴 Payment plan in progress                    |
|   Contact: cfo@slowpay.com                               |
|   Payment Plan: $1,000/month × 5 months                  |
|   Paid to Date: $2,000 (2 payments received)            |
|   Next Payment Due: Dec 1 ($1,000)                       |
|   [View Plan] [Monitor] [Default Notice]                 |
| ─────────────────────────────────────────────────────────|
+----------------------------------------------------------+
```

**User Action:** Click "Write Off" on FailedCo invoice

**System Response:**
- Write-off confirmation modal opens

**Screen State (Write-Off Confirmation):**
```
+----------------------------------------------------------+
| Write Off Invoice - INV-2023-489                     [×] |
+----------------------------------------------------------+
| ⚠️  PERMANENT ACTION - Cannot be undone                   |
+----------------------------------------------------------+
| Client: FailedCo                    Amount: $10,000       |
| Invoice Date: Aug 30, 2024          Days Overdue: 92      |
+----------------------------------------------------------+
| Write-Off Justification                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Reason: [Company Insolvent/Closed ▼]               │  |
| │                                                     │  |
| │ Options:                                            │  |
| │ • Company insolvent/closed                         │  |
| │ • Uncollectible after legal action                 │  |
| │ • Amount too small for legal action                │  |
| │ • Settlement for less than full amount             │  |
| │ • Other (specify)                                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Documentation                                             |
| ☑️  Company closure notice attached                      |
| ☑️  Collections agency report attached                   |
| ☑️  Legal counsel recommendation obtained                |
|                                                           |
| Accounting Impact                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Journal Entry:                                      │  |
| │   Debit:  Bad Debt Expense      $10,000.00        │  |
| │   Credit: Accounts Receivable   $10,000.00        │  |
| │                                                     │  |
| │ QuickBooks: Auto-sync enabled                      │  |
| │ Tax Impact: Deductible business expense            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Approval Required                                         |
| ☑️  CFO Approval (You)                                   |
| ☑️  CEO Approval (for amounts >$5k)                      |
|                                                           |
| CEO Approval Status: [Request Approval]                  |
|                                                           |
| Notes:                                                    |
| [FailedCo ceased operations in October 2025.             |
|  Collections agency confirmed no assets available.       |
|  Legal counsel recommends write-off. Tax deduction       |
|  will offset loss.]                                      |
|                                                           |
|                            [Cancel] [Request CEO Approval]|
+----------------------------------------------------------+
```

**User Action:** Add notes, click "Request CEO Approval"

**System Response:**
- Approval request sent to CEO
- Notification sent
- Pending approval status
- Toast: "Write-off approval requested from CEO"

**Time:** ~8 minutes per critical invoice

---

### Step 6: Apply Payment Received

**Scenario:** Payment received notification arrives

**System Response:**
- Notification appears: "Payment received: Google $100,000"
- Email from bank showing wire transfer

**User Action:** Click notification to open payment application screen

**Screen State (Payment Application):**
```
+----------------------------------------------------------+
| Apply Payment                                        [×] |
+----------------------------------------------------------+
| Payment Details                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ From: Google LLC                                    │  |
| │ Amount: $100,000.00                                │  |
| │ Date: Nov 30, 2025                                 │  |
| │ Method: Wire Transfer                              │  |
| │ Reference: INV-2025-1001                           │  |
| │ Bank Account: Wells Fargo ****5678                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Apply to Invoices                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Auto-Match Results:                                 │  |
| │                                                     │  |
| │ ☑️ INV-2025-1001 - Google  $100,000  Match: 100%   │  |
| │    Due: Nov 29, 2025                               │  |
| │    Amount Due: $100,000.00                         │  |
| │    Apply: $100,000.00                              │  |
| │                                                     │  |
| │ Total Applied: $100,000.00                         │  |
| │ Unapplied: $0.00                                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Payment Details                                           |
| Apply Amount: [$100,000.00]                              |
|                                                           |
| Notes:                                                    |
| [Wire transfer received from Google for INV-2025-1001.   |
|  Payment on time.]                                       |
|                                                           |
| Accounting                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ Journal Entry:                                      │  |
| │   Debit:  Cash (Operating)      $100,000.00       │  |
| │   Credit: Accounts Receivable   $100,000.00       │  |
| │                                                     │  |
| │ QuickBooks: Auto-sync enabled                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
|                                [Cancel] [✓ Apply Payment] |
+----------------------------------------------------------+
```

**User Action:** Verify match, click "Apply Payment"

**System Response:**
- Payment applied to invoice
- Invoice status updated to "Paid"
- QuickBooks synced
- Account Manager notified
- Client sent payment confirmation email
- AR aging updated
- DSO recalculated
- Toast: "Payment applied - INV-2025-1001 marked as Paid"

**Time:** ~3 minutes

---

### Step 7: Send Payment Reminders (Bulk Action)

**User Action:** Select multiple invoices for bulk reminder

**Screen State (Bulk Selection):**
```
+----------------------------------------------------------+
| AR Aging: 31-60 Days                   Total: $264,000    |
+----------------------------------------------------------+
| ☑️  Select All (8 invoices) | [Send Bulk Reminder]        |
+----------------------------------------------------------+
| ☑️  INV-2024-845 Amazon     $62,000  Oct 16    45d       |
| ☑️  INV-2024-850 Apple      $44,000  Oct 20    41d       |
| ☐  INV-2024-860 Netflix    $35,000  Oct 25    36d       |
|     (Excluded - dispute in progress)                     |
| ☑️  INV-2024-870 Salesforce $28,000  Oct 28    33d       |
| ☑️  INV-2024-880 Oracle     $45,000  Nov 1     29d       |
| ... (3 more selected)                                    |
+----------------------------------------------------------+
```

**User Action:** Select 5 invoices, click "Send Bulk Reminder"

**System Response:**
- Bulk reminder confirmation opens

**Screen State:**
```
+----------------------------------------------------------+
| Send Bulk Payment Reminders                          [×] |
+----------------------------------------------------------+
| You are about to send reminders for 5 invoices           |
| Total Amount: $205,000                                    |
+----------------------------------------------------------+
| Invoice Summary                                           |
| INV-2024-845 - Amazon      $62,000  (45 days)            |
| INV-2024-850 - Apple       $44,000  (41 days)            |
| INV-2024-870 - Salesforce  $28,000  (33 days)            |
| INV-2024-880 - Oracle      $45,000  (29 days)            |
| INV-2024-890 - Adobe       $26,000  (38 days)            |
+----------------------------------------------------------+
| Email Template: [30-60 Day Reminder ▼]                   |
|                                                           |
| Personalization:                                          |
| ☑️  Include specific invoice details                     |
| ☑️  Include payment instructions                         |
| ☑️  CC Account Managers                                  |
| ☑️  BCC finance@intime.com                               |
|                                                           |
| Follow-up:                                                |
| ☑️  Create follow-up tasks (7 days if no response)       |
| ☑️  Track email open/click                               |
|                                                           |
|                      [Cancel] [Preview] [Send All (5)]    |
+----------------------------------------------------------+
```

**User Action:** Click "Send All (5)"

**System Response:**
- Progress bar shows: "Sending 1/5... 2/5... 3/5... 4/5... 5/5"
- Emails sent to all 5 clients
- Activities logged
- Follow-up tasks created
- Toast: "5 payment reminders sent successfully"

**Time:** ~5 minutes

---

### Step 8: Generate AR Aging Report for Management

**User Action:** Click "Export" button on AR Aging screen

**System Response:**
- Export options modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Export AR Aging Report                               [×] |
+----------------------------------------------------------+
| Report Type: [Detailed AR Aging ▼]                       |
|                                                           |
| Options:                                                  |
| • Summary by Aging Bucket                                |
| • Detailed by Client                                     |
| • Detailed by Invoice                                    |
| • Executive Summary                                      |
| • Collections Report                                     |
|                                                           |
| As of Date: [Nov 30, 2025 ▼]                             |
|                                                           |
| Include:                                                  |
| ☑️  Client details                                       |
| ☑️  Invoice details                                      |
| ☑️  Payment history                                      |
| ☑️  Contact information                                  |
| ☑️  Aging analysis                                       |
| ☑️  Action items                                         |
| ☐  Customer credit info (confidential)                  |
|                                                           |
| Format: ● PDF  ○ Excel  ○ CSV                           |
|                                                           |
| Recipients:                                               |
| ☑️  CEO (john.doe@intime.com)                            |
| ☑️  COO (jane.smith@intime.com)                          |
| ☐  Board of Directors                                   |
|                                                           |
|                            [Cancel] [Generate & Send]     |
+----------------------------------------------------------+
```

**User Action:** Select options, click "Generate & Send"

**System Response:**
- PDF generated
- Emailed to recipients
- Saved to shared drive

**Report Preview:**
```
╔══════════════════════════════════════════════════════════╗
║         InTime Solutions - AR Aging Report               ║
║                  As of: Nov 30, 2025                     ║
╚══════════════════════════════════════════════════════════╝

EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────
Total AR:                    $1,200,000
DSO (Days Sales Outstanding):        42 days  (Target: ≤45)
Collection Rate (30 days):              95%   (Target: ≥90%)

AGING ANALYSIS
────────────────────────────────────────────────────────────
Current:          $420,000   35%  ████████████████████
0-30 days:        $360,000   30%  ████████████████
31-60 days:       $264,000   22%  ████████████   🟡
61-90 days:        $96,000    8%  ████   🟠
90+ days:          $60,000    5%  ██   🔴 CRITICAL

COLLECTIONS ACTIVITY (Past 30 Days)
────────────────────────────────────────────────────────────
Invoices Sent:                        45   $2,450,000
Payments Received:                    38   $1,980,000
Reminders Sent:                       28
Escalations:                           5
Collections Referred:                  1   $45,000
Write-offs:                            0

CRITICAL ITEMS REQUIRING ACTION
────────────────────────────────────────────────────────────
1. Acme Corp - $45,000 (95 days) - With collections agency
2. TechCorp - $52,000 (69 days) - Credit hold, demand letter sent
3. FailedCo - $10,000 (92 days) - Write-off pending CEO approval

TOP 10 CLIENTS BY AR BALANCE
────────────────────────────────────────────────────────────
1. Google              $220,000   (Current + 0-30)
2. Meta                $145,000   (Current + 0-30)
3. Amazon              $122,000   (31-60 days)
4. Apple                $88,000   (0-30 days)
5. TechCorp             $52,000   (61-90 days) ⚠️
6. Acme Corp            $45,000   (90+ days) 🔴
7. Oracle               $45,000   (31-60 days)
8. Salesforce           $28,000   (31-60 days)
9. Netflix              $35,000   (31-60 days, dispute)
10. Adobe               $26,000   (31-60 days)

TREND ANALYSIS (Last 6 Months)
────────────────────────────────────────────────────────────
Month     Total AR    DSO    Collection %
Jun 2025  $1,050,000   36      97%
Jul 2025  $1,100,000   37      96%
Aug 2025  $1,125,000   38      96%
Sep 2025  $1,150,000   38      95%
Oct 2025  $1,175,000   40      95%
Nov 2025  $1,200,000   42      95%

Trend: DSO increasing ↑ (Action needed)

RECOMMENDED ACTIONS
────────────────────────────────────────────────────────────
1. Focus collections efforts on 31-60 day bucket ($264k)
2. Resolve TechCorp dispute/escalation (69 days, $52k)
3. Complete Acme Corp collections process
4. Approve FailedCo write-off ($10k)
5. Review and tighten payment terms for slow-paying clients
6. Consider early payment discounts to improve DSO

────────────────────────────────────────────────────────────
Report Generated: Nov 30, 2025 9:15 AM
Generated By: CFO (John Doe)
```

**Time:** ~5 minutes

---

## Postconditions

1. ✅ AR aging report reviewed and current
2. ✅ Payment reminders sent to overdue accounts
3. ✅ Escalations processed for 60+ day invoices
4. ✅ Critical accounts (90+) addressed (collections/legal)
5. ✅ Payments received and applied to invoices
6. ✅ Invoice statuses updated (Sent → Paid)
7. ✅ QuickBooks journal entries synced
8. ✅ Follow-up tasks created
9. ✅ Account Managers notified of issues
10. ✅ Credit holds applied where necessary
11. ✅ Collections agency engaged for critical accounts
12. ✅ Write-offs requested (with CEO approval)
13. ✅ AR aging report generated and distributed
14. ✅ DSO calculated and tracked
15. ✅ Activity logged for all actions

---

## Events Logged

| Event | Payload |
|-------|---------|
| `ar.reviewed` | `{ user_id, date, total_ar, dso }` |
| `ar.reminder_sent` | `{ invoice_id, client_id, days_overdue, sent_by }` |
| `ar.escalated` | `{ invoice_id, level, actions_taken, escalated_by }` |
| `payment.received` | `{ amount, payment_method, received_date }` |
| `payment.applied` | `{ payment_id, invoice_id, amount }` |
| `invoice.paid` | `{ invoice_id, paid_date, paid_amount }` |
| `credit_hold.applied` | `{ client_id, reason, applied_by }` |
| `collections.referred` | `{ invoice_id, agency, referred_date }` |
| `writeoff.requested` | `{ invoice_id, amount, reason, requested_by }` |
| `writeoff.approved` | `{ invoice_id, amount, approved_by }` |
| `ar_report.generated` | `{ report_type, as_of_date, generated_by }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Payment Amount Mismatch | Partial payment | "Payment amount ($50k) does not match invoice ($100k)" | Apply partial, create follow-up for balance |
| Invoice Not Found | Wrong reference | "Invoice INV-2025-9999 not found" | Verify reference, manual search |
| Duplicate Payment | Already applied | "Payment already applied to this invoice" | Check payment history, apply to different invoice |
| QuickBooks Sync Failed | API error | "Payment applied but QuickBooks sync failed" | Retry sync or manual entry |
| Email Delivery Failed | Invalid address | "Reminder email failed - billing@invalid.com" | Verify email, update contact |
| Insufficient Permission | User role | "You don't have permission to write off invoices" | Request approval from authorized user |
| Write-off Limit Exceeded | Amount too high | "Write-off >$10k requires CEO approval" | Request CEO approval |
| Credit Hold Failed | Active contracts | "Cannot place credit hold - active contracts exist" | Review contracts, force override if needed |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Payment Amount | Must be > $0 | "Payment amount must be greater than zero" |
| Payment Date | Cannot be future date | "Payment date cannot be in the future" |
| Invoice Reference | Must exist | "Invoice not found" |
| Write-off Reason | Required | "Write-off reason required" |
| Write-off Amount | Must match invoice balance | "Write-off amount must equal outstanding balance" |
| Escalation Level | Must follow sequence | "Cannot skip escalation levels" |
| Credit Hold | Requires reason | "Reason required for credit hold" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g a` | Go to AR Aging |
| `r` | Refresh AR data |
| `p` | Apply payment |
| `e` | Send reminder |
| `x` | Export report |
| `Cmd+K` | Open Command Bar |
| `/` | Quick search invoices |

---

## Alternative Flows

### A1: Partial Payment Application

If payment received is less than invoice amount:

1. System detects mismatch
2. Prompts: "Apply partial payment or split across multiple invoices?"
3. User selects "Apply partial"
4. Remaining balance stays on invoice
5. Invoice status: "Partially Paid"
6. Follow-up task created for balance

### A2: Payment Applied to Wrong Invoice

If payment applied incorrectly:

1. User navigates to payment record
2. Clicks "Unapply Payment"
3. System reverses journal entry
4. Invoice balance restored
5. Payment available to reapply
6. Correct invoice selected and applied

### A3: Settlement for Less Than Full Amount

If client offers settlement:

1. User clicks "Propose Settlement"
2. Enters settlement amount and terms
3. Requests approval (if >10% discount)
4. Upon approval:
   - Applies payment for settlement amount
   - Writes off remaining balance
   - Updates invoice status to "Settled"

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Includes daily AR review
- [02-process-invoices.md](./02-process-invoices.md) - Invoice generation
- [05-financial-reporting.md](./05-financial-reporting.md) - AR reporting

---

*Last Updated: 2025-11-30*
