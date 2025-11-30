# Use Case: Process Client Invoices

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-FIN-002 |
| Actor | Finance/CFO |
| Goal | Create and send client invoices for approved timesheets |
| Frequency | Weekly (typically Friday) |
| Estimated Time | 30-45 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Finance/CFO
2. User has invoice creation and approval permissions
3. Timesheets for billing period have been approved
4. Client billing information is current and accurate
5. Bill rates are configured in system
6. QuickBooks integration is active

---

## Trigger

One of the following:
- End of billing cycle (weekly, bi-weekly, or monthly)
- Scheduled task reminder: "Weekly invoicing due"
- Manager request for expedited billing
- Client request for invoice
- Automated workflow: "15 timesheets approved - ready for billing"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Invoices Section

**User Action:** Click "Invoices & Billing" in sidebar navigation

**System Response:**
- Sidebar item highlights
- URL changes to: `/employee/finance/invoices`
- Invoices list screen loads
- Shows all recent invoices by default

**Screen State:**
```
+----------------------------------------------------------+
| Invoices                           [+ New] [Batch] [Export]|
+----------------------------------------------------------+
| [Search invoices...]                [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| [Draft] [Pending] [Sent] [Paid] [Overdue] [All]         |
+----------------------------------------------------------+
| Status  Invoice       Client      Amount    Due    Actions|
| ─────────────────────────────────────────────────────────|
| 🟢 PAID INV-2025-890 Google      $120,000  Nov 1  [View]  |
| 🟡 SENT INV-2025-891 Meta         $85,000  Nov 15 [View]  |
| 🔵 DRFT INV-2025-892 Amazon       $0        -     [Edit]  |
+----------------------------------------------------------+
| 📊 Summary (Nov 2025)                                     |
| Total Invoiced: $2,450,000  |  Paid: $1,980,000  (81%)   |
| Outstanding: $470,000       |  Overdue: $60,000   (3%)   |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Click "Batch" to Generate Multiple Invoices

**User Action:** Click "Batch" button in top-right

**System Response:**
- Batch invoice generation modal opens
- System queries for approved timesheets not yet invoiced
- Loading indicator shows while data loads
- List populates with billable items grouped by client

**Screen State:**
```
+----------------------------------------------------------+
| Generate Batch Invoices                              [×] |
+----------------------------------------------------------+
| Billing Period: Nov 15 - Nov 29, 2025                    |
| [Custom Date Range ▼]                                    |
+----------------------------------------------------------+
| Approved Timesheets Ready for Billing: 28                |
| Total Billable: $365,000                                 |
+----------------------------------------------------------+
| ☑️  Select All  |  ☐ Google  ☐ Meta  ☐ Amazon  ☐ Apple  |
+----------------------------------------------------------+
| Client Details                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️ Google                               Status: ✓   │  |
| │    Consultants: 5                                   │  |
| │    Total Hours: 800                                 │  |
| │    Estimated Amount: $100,000                       │  |
| │    Payment Terms: Net 30                            │  |
| │    Billing Contact: billing@google.com              │  |
| │    [Preview Line Items ▼]                           │  |
| └────────────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️ Meta                                 Status: ✓   │  |
| │    Consultants: 3                                   │  |
| │    Total Hours: 480                                 │  |
| │    Estimated Amount: $60,000                        │  |
| │    Payment Terms: Net 45                            │  |
| │    Billing Contact: ap@meta.com                     │  |
| │    [Preview Line Items ▼]                           │  |
| └────────────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️ Amazon                               Status: ✓   │  |
| │    Consultants: 4                                   │  |
| │    Total Hours: 640                                 │  |
| │    Estimated Amount: $80,000                        │  |
| │    Payment Terms: Net 30                            │  |
| │    Billing Contact: vendor-invoices@amazon.com      │  |
| │    [Preview Line Items ▼]                           │  |
| └────────────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️ Apple                                Status: ✓   │  |
| │    Consultants: 2                                   │  |
| │    Total Hours: 320                                 │  |
| │    Estimated Amount: $44,000                        │  |
| │    Payment Terms: Net 60                            │  |
| │    Billing Contact: invoices@apple.com              │  |
| │    [Preview Line Items ▼]                           │  |
| └────────────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠️ Netflix                              Status: ⚠️   │  |
| │    Consultants: 2                                   │  |
| │    Total Hours: 280 (40 hours not approved)        │  |
| │    Estimated Amount: $30,000                        │  |
| │    Issue: 1 timesheet pending approval             │  |
| │    [View Pending Timesheets]                        │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
| Total Selected: 4 clients, $284,000                      |
+----------------------------------------------------------+
|                          [Cancel] [Review & Generate →]   |
+----------------------------------------------------------+
```

**Time:** ~3 seconds

---

### Step 3: Preview Line Items for Each Client

**User Action:** Click "Preview Line Items ▼" on Google entry

**System Response:**
- Section expands to show detailed breakdown
- Each consultant listed with hours and rates

**Screen State (Expanded):**
```
+----------------------------------------------------------+
| │ ☑️ Google                               Status: ✓   │  |
| │    [Preview Line Items ▲]                           │  |
| │                                                      │  |
| │    Line Item Details:                               │  |
| │    ┌──────────────────────────────────────────────┐│  |
| │    │ Consultant      Role           Hours  Rate   ││  |
| │    │ ───────────────────────────────────────────────│  |
| │    │ Jane Developer  Sr. Developer   160  $125/hr ││  |
| │    │   Nov 15-21: 80h                             ││  |
| │    │   Nov 22-29: 80h                             ││  |
| │    │   Subtotal: $20,000                          ││  |
| │    │                                               ││  |
| │    │ Bob Engineer    Sr. Engineer    160  $120/hr ││  |
| │    │   Nov 15-21: 80h                             ││  |
| │    │   Nov 22-29: 80h                             ││  |
| │    │   Subtotal: $19,200                          ││  |
| │    │                                               ││  |
| │    │ Alice Cloud     Cloud Architect 160  $140/hr ││  |
| │    │   Nov 15-21: 80h                             ││  |
| │    │   Nov 22-29: 80h                             ││  |
| │    │   Subtotal: $22,400                          ││  |
| │    │                                               ││  |
| │    │ Tom DevOps      DevOps Lead     160  $130/hr ││  |
| │    │   Nov 15-21: 80h                             ││  |
| │    │   Nov 22-29: 80h                             ││  |
| │    │   Subtotal: $20,800                          ││  |
| │    │                                               ││  |
| │    │ Sarah QA        QA Engineer     160  $110/hr ││  |
| │    │   Nov 15-21: 80h                             ││  |
| │    │   Nov 22-29: 80h                             ││  |
| │    │   Subtotal: $17,600                          ││  |
| │    │ ───────────────────────────────────────────────│  |
| │    │ Total Hours: 800                             ││  |
| │    │ Total Amount: $100,000.00                    ││  |
| │    └──────────────────────────────────────────────┘│  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**User Action:** Review line items, verify hours and rates are correct

**User Action:** Collapse section by clicking "Preview Line Items ▲"

**Time:** ~30 seconds per client (~2 minutes for 4 clients)

---

### Step 4: Handle Netflix Issue (Pending Timesheet)

**User Action:** Click "View Pending Timesheets" on Netflix entry

**System Response:**
- Modal opens showing pending timesheet details

**Screen State (Pending Timesheet Modal):**
```
+----------------------------------------------------------+
| Pending Timesheets - Netflix                         [×] |
+----------------------------------------------------------+
| ⚠️  Cannot generate invoice until all timesheets approved |
+----------------------------------------------------------+
| Consultant: Mike Contractor                              |
| Period: Nov 22-29, 2025                                  |
| Hours Submitted: 40                                      |
| Status: Pending Approval                                 |
|                                                           |
| Submitted: Nov 29, 2025 5:45 PM                          |
| Pending With: Sarah Chen (Account Manager)               |
|                                                           |
| Options:                                                  |
| ○ Wait for approval (exclude from this batch)           |
| ○ Contact approver to expedite                          |
| ○ Generate partial invoice (exclude these hours)        |
|                                                           |
|                     [Contact Approver] [Exclude] [Close] |
+----------------------------------------------------------+
```

**User Action:** Click "Exclude" to generate invoice without pending hours

**System Response:**
- Modal closes
- Netflix updated to show partial invoice details
- Warning updated

**Screen State (Netflix Updated):**
```
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️ Netflix                              Status: ⚠️   │  |
| │    Consultants: 2 (1 partial)                       │  |
| │    Total Hours: 240 (40 hours excluded)            │  |
| │    Estimated Amount: $30,000                        │  |
| │    Note: Partial invoice - 40h pending approval    │  |
| │    [Preview Line Items ▼]                           │  |
| └────────────────────────────────────────────────────┘  |
```

**Time:** ~2 minutes

---

### Step 5: Click "Review & Generate"

**User Action:** Click "Review & Generate →" button

**System Response:**
- System validates all selected invoices
- Invoice preview screen loads
- Shows combined view of all invoices to be generated

**Screen State:**
```
+----------------------------------------------------------+
| Review Batch Invoices                                [×] |
+----------------------------------------------------------+
| Step 2 of 3: Review Invoice Details                      |
+----------------------------------------------------------+
| You are about to generate 5 invoices totaling $314,000   |
|                                                           |
| Invoice Summary                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Client    Invoice #      Amount     Due Date       │  |
| │ ────────────────────────────────────────────────────│  |
| │ Google    INV-2025-1001  $100,000   Dec 29, 2025  │  |
| │ Meta      INV-2025-1002   $60,000   Jan 13, 2026  │  |
| │ Amazon    INV-2025-1003   $80,000   Dec 29, 2025  │  |
| │ Apple     INV-2025-1004   $44,000   Jan 28, 2026  │  |
| │ Netflix   INV-2025-1005   $30,000   Dec 29, 2025  │  |
| │                                      (Partial ⚠️)   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Invoice Settings                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️  Apply client payment terms                      │  |
| │     (Net 30, Net 45, Net 60 as configured)         │  |
| │                                                     │  |
| │ ☑️  Include detailed line items                     │  |
| │     (Consultant name, hours, rate per consultant)  │  |
| │                                                     │  |
| │ ☑️  Apply markup rates                              │  |
| │     (Rates already include configured markup)      │  |
| │                                                     │  |
| │ Payment Instructions:                               │  |
| │ ● Standard (ACH/Wire/Check instructions)           │  |
| │ ○ Custom per client                                │  |
| │                                                     │  |
| │ Invoice Template:                                   │  |
| │ [Standard InTime Invoice Template ▼]               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Delivery Options                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑️  Email to client billing contacts                │  |
| │ ☑️  CC Account Managers                             │  |
| │ ☑️  BCC finance@intime.com (archive)                │  |
| │ ☑️  Sync to QuickBooks                              │  |
| │ ☑️  Save PDF to shared drive                        │  |
| │ ☐  Mark as Sent immediately                        │  |
| │ ○  Save as Draft (review before sending)           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Email Preview                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ Subject: Invoice [INV-#] from InTime Solutions     │  |
| │                                                     │  |
| │ Dear [Client Name] Accounts Payable,                │  |
| │                                                     │  |
| │ Please find attached invoice [INV-#] for services  │  |
| │ rendered during the period [Date Range].            │  |
| │                                                     │  |
| │ Invoice Details:                                    │  |
| │ - Invoice Number: [INV-#]                          │  |
| │ - Amount Due: $[Amount]                            │  |
| │ - Due Date: [Due Date]                             │  |
| │                                                     │  |
| │ Payment can be made via:                            │  |
| │ - ACH/Wire transfer (details in invoice)           │  |
| │ - Check (mail to address on invoice)               │  |
| │                                                     │  |
| │ If you have any questions, please contact us.      │  |
| │                                                     │  |
| │ [Edit Email Template]                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
|                 [← Back] [Cancel] [Generate Invoices ✓]  |
+----------------------------------------------------------+
```

**Field Specifications:**

**Payment Terms Application**
| Property | Value |
|----------|-------|
| Field Name | `applyPaymentTerms` |
| Type | Checkbox |
| Default | Checked |
| Effect | Uses client-configured payment terms (Net 30/45/60) |

**Include Line Items**
| Property | Value |
|----------|-------|
| Field Name | `includeLineItems` |
| Type | Checkbox |
| Default | Checked |
| Effect | Shows detailed breakdown per consultant |

**Apply Markup**
| Property | Value |
|----------|-------|
| Field Name | `applyMarkup` |
| Type | Checkbox |
| Default | Checked |
| Effect | Bill rates already include markup configured in system |

**Email to Billing Contacts**
| Property | Value |
|----------|-------|
| Field Name | `emailBillingContacts` |
| Type | Checkbox |
| Default | Checked |
| Effect | Sends invoice email to all billing contacts on file |

**User Action:** Review settings, verify all checkboxes appropriate

**Time:** ~3 minutes

---

### Step 6: Preview Individual Invoice

**User Action:** Click on "Google INV-2025-1001" to preview

**System Response:**
- PDF preview modal opens
- Shows formatted invoice as it will appear to client

**Screen State (Invoice Preview):**
```
+----------------------------------------------------------+
| Invoice Preview - INV-2025-1001                      [×] |
+----------------------------------------------------------+
┌──────────────────────────────────────────────────────────┐
│                    INVOICE                               │
│                                                          │
│ InTime Solutions                     Invoice #: INV-2025-1001
│ 123 Business Ave                     Date: Nov 29, 2025  │
│ San Francisco, CA 94105              Due Date: Dec 29, 2025
│ Phone: (555) 123-4567                                    │
│ Email: billing@intime.com                                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ BILL TO:                                                 │
│ Google LLC                                               │
│ Attn: Accounts Payable                                  │
│ 1600 Amphitheatre Parkway                               │
│ Mountain View, CA 94043                                 │
│ Email: billing@google.com                                │
├──────────────────────────────────────────────────────────┤
│ SERVICE PERIOD: November 15 - November 29, 2025         │
│ PAYMENT TERMS: Net 30                                   │
│ PO NUMBER: PO-GOOG-2025-456 (if applicable)            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ DESCRIPTION                        QTY    RATE   AMOUNT │
│ ─────────────────────────────────────────────────────────│
│ Jane Developer - Sr. Developer                          │
│   Services Nov 15-21, 2025         80   $125   $10,000 │
│   Services Nov 22-29, 2025         80   $125   $10,000 │
│                                                          │
│ Bob Engineer - Sr. Engineer                             │
│   Services Nov 15-21, 2025         80   $120    $9,600 │
│   Services Nov 22-29, 2025         80   $120    $9,600 │
│                                                          │
│ Alice Cloud - Cloud Architect                           │
│   Services Nov 15-21, 2025         80   $140   $11,200 │
│   Services Nov 22-29, 2025         80   $140   $11,200 │
│                                                          │
│ Tom DevOps - DevOps Lead                                │
│   Services Nov 15-21, 2025         80   $130   $10,400 │
│   Services Nov 22-29, 2025         80   $130   $10,400 │
│                                                          │
│ Sarah QA - QA Engineer                                  │
│   Services Nov 15-21, 2025         80   $110    $8,800 │
│   Services Nov 22-29, 2025         80   $110    $8,800 │
│                                                          │
│                                          ──────────────  │
│                              SUBTOTAL:      $100,000.00 │
│                                  TAX:             $0.00 │
│                                          ──────────────  │
│                         TOTAL AMOUNT DUE:   $100,000.00 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ PAYMENT INSTRUCTIONS                                     │
│                                                          │
│ ACH/Wire Transfer:                                       │
│   Bank: Wells Fargo Bank                                │
│   Account Name: InTime Solutions LLC                    │
│   Routing Number: 121000248                             │
│   Account Number: ****5678                              │
│                                                          │
│ Check Payment:                                           │
│   Make payable to: InTime Solutions LLC                 │
│   Mail to: 123 Business Ave, San Francisco, CA 94105   │
│                                                          │
│ Reference: INV-2025-1001                                │
├──────────────────────────────────────────────────────────┤
│ Thank you for your business!                             │
│                                                          │
│ Questions? Contact: finance@intime.com or (555)123-4567 │
└──────────────────────────────────────────────────────────┘
                                                   Page 1 of 1

|                                                           |
|              [Download PDF] [Print] [Edit] [Close]       |
+----------------------------------------------------------+
```

**User Action:** Review invoice for accuracy, close preview

**Time:** ~1 minute

---

### Step 7: Generate Invoices

**User Action:** Click "Generate Invoices ✓" button

**System Response:**
- Button shows loading spinner
- Progress bar appears: "Generating invoices... 1/5"
- System creates each invoice sequentially
- For each invoice:
  - Database record created
  - PDF generated
  - QuickBooks entry synced
  - Email prepared
- Progress updates: 2/5... 3/5... 4/5... 5/5
- Toast notification: "5 invoices generated successfully"

**Screen State (Progress):**
```
+----------------------------------------------------------+
| Generating Invoices...                               [×] |
+----------------------------------------------------------+
| ████████████████████████░░░░░░░░░  80% (4/5)             |
|                                                           |
| ✓ INV-2025-1001 - Google    - Generated & Synced        |
| ✓ INV-2025-1002 - Meta      - Generated & Synced        |
| ✓ INV-2025-1003 - Amazon    - Generated & Synced        |
| ⏳ INV-2025-1004 - Apple     - Generating PDF...         |
| ⏱️  INV-2025-1005 - Netflix  - Pending                   |
|                                                           |
| Please wait, do not close this window...                 |
+----------------------------------------------------------+
```

**Screen State (Complete):**
```
+----------------------------------------------------------+
| Invoices Generated Successfully!                     [×] |
+----------------------------------------------------------+
| ✓ 5 invoices created totaling $314,000                   |
|                                                           |
| Results:                                                  |
| ✓ INV-2025-1001 - Google    - $100,000  Email sent ✓   |
| ✓ INV-2025-1002 - Meta      - $60,000   Email sent ✓   |
| ✓ INV-2025-1003 - Amazon    - $80,000   Email sent ✓   |
| ✓ INV-2025-1004 - Apple     - $44,000   Email sent ✓   |
| ✓ INV-2025-1005 - Netflix   - $30,000   Email sent ✓   |
|                                                           |
| All invoices:                                             |
| ✓ Saved to database                                      |
| ✓ Synced to QuickBooks                                   |
| ✓ Emailed to clients                                     |
| ✓ PDFs saved to shared drive                             |
| ✓ Account Managers notified                              |
|                                                           |
| Next Steps:                                               |
| • Track payments in AR Aging report                      |
| • Follow up with clients in 15 days if not paid         |
| • Update revenue recognition                             |
|                                                           |
|                                        [View Invoices] [Done]|
+----------------------------------------------------------+
```

**System Actions (Backend):**
1. Create invoice records in `invoices` table
2. Generate PDF for each invoice
3. Create QuickBooks journal entries:
   - Debit: Accounts Receivable
   - Credit: Revenue
4. Send email to billing contacts
5. Save PDFs to shared drive
6. Log activity for each invoice
7. Update AR aging report
8. Notify Account Managers

**Time:** ~30 seconds (system processing)

---

### Step 8: Verify Invoice Creation

**User Action:** Click "View Invoices"

**System Response:**
- Modal closes
- Returns to Invoices list screen
- Newly created invoices appear at top
- Status shows "Sent"

**Screen State:**
```
+----------------------------------------------------------+
| Invoices                           [+ New] [Batch] [Export]|
+----------------------------------------------------------+
| [Search invoices...]                [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| [Draft] [Pending] [Sent] [Paid] [Overdue] [All]         |
+----------------------------------------------------------+
| Status  Invoice       Client      Amount    Due    Actions|
| ─────────────────────────────────────────────────────────|
| 🟢 SENT INV-2025-1001 Google     $100,000  Dec 29 [View]  |
|        📧 Sent Nov 29, 4:15 PM   ☑️ QB Synced             |
| ─────────────────────────────────────────────────────────|
| 🟢 SENT INV-2025-1002 Meta        $60,000  Jan 13 [View]  |
|        📧 Sent Nov 29, 4:15 PM   ☑️ QB Synced             |
| ─────────────────────────────────────────────────────────|
| 🟢 SENT INV-2025-1003 Amazon      $80,000  Dec 29 [View]  |
|        📧 Sent Nov 29, 4:15 PM   ☑️ QB Synced             |
| ─────────────────────────────────────────────────────────|
| 🟢 SENT INV-2025-1004 Apple       $44,000  Jan 28 [View]  |
|        📧 Sent Nov 29, 4:15 PM   ☑️ QB Synced             |
| ─────────────────────────────────────────────────────────|
| 🟡 SENT INV-2025-1005 Netflix     $30,000  Dec 29 [View]  |
|        📧 Sent Nov 29, 4:15 PM   ☑️ QB Synced   ⚠️ Partial |
| ─────────────────────────────────────────────────────────|
| 🟢 PAID INV-2025-890  Google     $120,000  Nov 1  [View]  |
+----------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 9: Review QuickBooks Sync

**User Action:** Click on "Google INV-2025-1001" to view details

**System Response:**
- Invoice detail page opens in workspace view

**Screen State (Invoice Detail):**
```
+----------------------------------------------------------+
| Invoice INV-2025-1001                     [Email] [Print] |
+----------------------------------------------------------+
| Client: Google                      Status: 🟢 SENT       |
| Issue Date: Nov 29, 2025            Due Date: Dec 29      |
| Amount: $100,000.00                 Balance: $100,000.00  |
+----------------------------------------------------------+
| [Overview] [Line Items] [Payments] [Activity] [QuickBooks]|
+----------------------------------------------------------+
|
| QuickBooks Sync Status: ✓ Synced                         |
| ┌────────────────────────────────────────────────────┐  |
| │ QuickBooks Invoice ID: QB-INV-456789               │  |
| │ Sync Date: Nov 29, 2025 4:15 PM                    │  |
| │ Sync Status: Success                                │  |
| │                                                     │  |
| │ Journal Entry:                                      │  |
| │   Debit:  Accounts Receivable   $100,000.00       │  |
| │   Credit: Service Revenue        $100,000.00       │  |
| │                                                     │  |
| │ QuickBooks Customer: Google LLC                    │  |
| │ QuickBooks Invoice #: 1001                         │  |
| │                                                     │  |
| │ [View in QuickBooks] [Force Resync]                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Email Delivery Status: ✓ Delivered                       |
| ┌────────────────────────────────────────────────────┐  |
| │ To: billing@google.com                             │  |
| │ CC: sarah.johnson@google.com (Account Manager)     │  |
| │ BCC: finance@intime.com                            │  |
| │                                                     │  |
| │ Sent: Nov 29, 2025 4:15 PM                         │  |
| │ Delivered: Nov 29, 2025 4:16 PM ✓                  │  |
| │ Opened: Nov 29, 2025 4:32 PM ✓                     │  |
| │                                                     │  |
| │ [View Email] [Resend]                              │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

### Step 10: Apply Billing Rates and Markup (Review Configuration)

**User Action:** Navigate to Settings > Billing Configuration (periodic review)

**System Response:**
- Billing configuration screen loads

**Screen State:**
```
+----------------------------------------------------------+
| Billing Configuration                        [Save] [⚙]   |
+----------------------------------------------------------+
| [Rate Cards] [Markup Rules] [Payment Terms] [Templates]  |
+----------------------------------------------------------+
|
| Rate Cards by Client                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Client: Google                              [Edit] │  |
| │                                                     │  |
| │ Role               Bill Rate   Markup   Pay Rate   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Sr. Developer       $125/hr    25%      $100/hr    │  |
| │ Sr. Engineer        $120/hr    20%      $100/hr    │  |
| │ Cloud Architect     $140/hr    27%      $110/hr    │  |
| │ DevOps Lead         $130/hr    30%      $100/hr    │  |
| │ QA Engineer         $110/hr    22%       $90/hr    │  |
| │                                                     │  |
| │ Default Markup: 25%                                │  |
| │ Minimum Margin: 20%                                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Markup Rules                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Global Markup Settings                             │  |
| │                                                     │  |
| │ Default Markup:        25%                         │  |
| │ Minimum Markup:        15%                         │  |
| │ Target Markup:         28%                         │  |
| │                                                     │  |
| │ Markup by Contract Type:                           │  |
| │ • W2 Contract:         25%                         │  |
| │ • 1099 Contract:       30%                         │  |
| │ • Corp-to-Corp:        20%                         │  |
| │ • Permanent:       20-25% of annual salary         │  |
| │                                                     │  |
| │ ☑️  Apply markup automatically on invoice generation│  |
| │ ☑️  Warn if margin below minimum                    │  |
| │ ☑️  Require CFO approval for <15% margin           │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Note:** Markup is configured at client/role level and applied automatically during invoice generation. Bill rates shown to clients already include markup.

**Time:** ~3 minutes (periodic review)

---

## Postconditions

1. ✅ Invoices created in database with status "Sent"
2. ✅ PDF invoices generated and saved to shared drive
3. ✅ Emails sent to client billing contacts
4. ✅ Account Managers notified
5. ✅ QuickBooks journal entries created and synced
6. ✅ AR aging report updated with new invoices
7. ✅ Revenue recognition triggered (if applicable)
8. ✅ Activity logged for each invoice
9. ✅ Timesheets marked as "Invoiced"
10. ✅ Follow-up tasks created for payment tracking
11. ✅ Partial invoice flagged for Netflix (pending hours noted)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `invoice.created` | `{ invoice_id, client_id, amount, created_by }` |
| `invoice.generated` | `{ invoice_id, pdf_url, generated_at }` |
| `invoice.sent` | `{ invoice_id, recipients, sent_at }` |
| `invoice.quickbooks_sync` | `{ invoice_id, qb_invoice_id, synced_at }` |
| `invoice.email_delivered` | `{ invoice_id, delivered_at }` |
| `invoice.email_opened` | `{ invoice_id, opened_at }` |
| `timesheet.invoiced` | `{ timesheet_id, invoice_id, invoiced_at }` |
| `revenue.recognized` | `{ invoice_id, amount, recognition_date }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Timesheet Not Approved | Timesheet still pending | "Cannot invoice - 3 timesheets pending approval" | Approve timesheets or exclude from batch |
| Missing Bill Rate | No rate configured | "Bill rate not configured for consultant John Doe" | Configure rate in client rate card |
| QuickBooks Sync Failed | API error | "QuickBooks sync failed. Invoice created but not synced." | Retry sync or manual entry in QB |
| Email Delivery Failed | Invalid email | "Email delivery failed to billing@invalid.com" | Verify email address, resend |
| Duplicate Invoice | Invoice already exists | "Invoice already exists for this period and client" | Review existing invoice or adjust dates |
| Margin Too Low | Rate configuration issue | "Warning: Margin is 12% (minimum: 15%)" | Review rates or request CFO override |
| Missing Client Info | Incomplete setup | "Cannot generate invoice - billing contact missing" | Add billing contact to client record |
| PDF Generation Failed | System error | "PDF generation failed. Please try again." | Retry generation |
| Payment Terms Missing | Client config incomplete | "Payment terms not configured for client" | Set default or client-specific terms |

---

## Validation Rules

### Invoice Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Client | Must exist and be active | "Client not found or inactive" |
| Billing Contact | At least one email required | "Billing contact email required" |
| Line Items | At least one item required | "Invoice must have at least one line item" |
| Total Amount | Must be > $0 | "Invoice amount must be greater than zero" |
| Payment Terms | Must be configured | "Payment terms required" |
| Due Date | Must be >= Issue Date | "Due date cannot be before issue date" |
| Bill Rate | Must be > Pay Rate | "Bill rate must exceed pay rate" |
| Markup | Must meet minimum (15%) | "Markup below minimum threshold" |

### Timesheet Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Approval Status | Must be approved | "Timesheet not approved" |
| Hours | Must be > 0 | "Hours must be greater than zero" |
| Period | Must not overlap with existing invoice | "Timesheet already invoiced" |
| Consultant | Must be active | "Consultant inactive or not found" |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `g i` | Go to Invoices |
| `n` | New Invoice |
| `b` | Batch Generate |
| `Cmd+Enter` | Generate/Submit (when on button) |
| `e` | Edit current invoice |
| `/` | Quick search invoices |
| `Cmd+P` | Print current invoice |
| `Cmd+Shift+E` | Export invoices |

---

## Alternative Flows

### A1: Generate Single Invoice (Not Batch)

At Step 2, instead of clicking "Batch":

1. Click "+ New" button
2. Single invoice form opens
3. Select client
4. Add line items manually or import from timesheets
5. Set payment terms and due date
6. Preview and generate
7. Continue from Step 7

**Time:** ~10 minutes per invoice

### A2: Apply Custom Discount

At Step 5, if discount needed:

1. Click "Edit" on invoice line items
2. Add discount line item
3. Enter discount amount or percentage
4. Reason required: "Early payment discount - 2%"
5. CFO approval required if >5%
6. Continue with generation

### A3: Split Invoice Across Multiple Invoices

If client requires separate invoices per consultant:

1. In batch generation, click "Split by Consultant"
2. System generates one invoice per consultant
3. Review each invoice separately
4. Generate all at once or individually

### A4: Handle Credit Hold Client

If client on credit hold:

1. System shows warning: "Client on credit hold"
2. Options:
   - Skip invoice generation
   - Generate but don't send (draft)
   - Override credit hold (requires CFO approval)
3. If override, enter reason and approve
4. Continue with generation

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Full daily routine including invoicing
- [04-track-ar.md](./04-track-ar.md) - Track invoice payments
- [05-financial-reporting.md](./05-financial-reporting.md) - Revenue reporting

---

## Integration Points

| System | Direction | Data |
|--------|-----------|------|
| QuickBooks | Outbound | Invoice data, journal entries |
| Timesheet System | Inbound | Approved timesheets |
| Email Service (SendGrid) | Outbound | Invoice emails, delivery tracking |
| Shared Drive (Box/SharePoint) | Outbound | PDF invoices |
| Rate Card System | Inbound | Bill rates, markup rules |
| Client CRM | Inbound | Billing contacts, payment terms |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-INV-001 | Generate batch with all approved timesheets | All invoices created successfully |
| TC-INV-002 | Attempt to invoice unapproved timesheet | Error shown, invoice excluded |
| TC-INV-003 | Generate invoice with missing bill rate | Error: "Bill rate required" |
| TC-INV-004 | QuickBooks sync fails | Invoice created, retry sync available |
| TC-INV-005 | Email delivery fails | Invoice marked sent, email retry available |
| TC-INV-006 | Generate invoice for credit hold client | Warning shown, draft created |
| TC-INV-007 | Apply custom discount | Discount line item added, approval required |
| TC-INV-008 | Split invoice by consultant | Multiple invoices generated |
| TC-INV-009 | Margin below minimum | Warning shown, CFO approval required |
| TC-INV-010 | Duplicate invoice prevention | Error: "Invoice already exists" |

---

*Last Updated: 2025-11-30*
