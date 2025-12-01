# UC-FIN-009: Accounts Payable - Vendor Payments & 1099/W2 Processing

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** CFO (Chief Financial Officer)
**Status:** Active

---

## 1. Overview

The Accounts Payable (AP) workflow manages all outgoing payments including consultant payroll (W2 employees and 1099 contractors), vendor invoices, third-party services, and international payments. The CFO oversees AP operations, approves large payments, ensures tax compliance (1099/W2 reporting), and maintains vendor relationships.

**Purpose:**
- Process consultant payroll (W2 and 1099)
- Manage vendor invoice payments
- Ensure tax compliance (1099-NEC, 1099-MISC, W2)
- Track payment terms and cash flow
- Vendor onboarding and management
- International payment processing (USD/CAD)

---

## 2. AP Categories

### 2.1 Payment Types

| Category | Description | Volume | Tax Form | Approval Level |
|----------|-------------|--------|----------|----------------|
| **W2 Payroll** | Employees on InTime payroll | Weekly/Biweekly | W2 (annual) | Automatic (HR approved) |
| **1099 Contractors** | Independent contractors | Net 30 | 1099-NEC (annual) | Manager >$5K, CFO >$10K |
| **C2C Vendors** | Corp-to-corp consultants | Net 30 | None (corp entity) | Manager >$10K, CFO >$25K |
| **Service Vendors** | Software, services, rent | Net 30-60 | 1099-MISC if >$600 | CFO >$5K |
| **Expense Reimbursements** | Employee expenses | Net 15 | None | Manager >$500, CFO >$2K |

### 2.2 Consultant Classification Matrix

```
Decision Tree: W2 vs 1099 vs C2C

Is consultant a US person?
  ├─ No → International payment (wire transfer, currency conversion)
  └─ Yes ↓

Does InTime control work schedule, location, methods?
  ├─ Yes → W2 Employee (payroll tax, benefits)
  └─ No ↓

Does consultant have own corporation (LLC, Inc.)?
  ├─ Yes → C2C (Corp-to-Corp, no 1099)
  └─ No → 1099 Contractor (1099-NEC reporting)

Critical: IRS misclassification penalties are severe
Consult legal/HR for borderline cases
```

---

## 3. AP Workflow

### 3.1 W2 Payroll Processing

```
Step 1: Timesheet Approval (Weekly)
├─ Consultant submits timesheet in ATS/Timekeeping system
├─ Recruiter/Manager reviews and approves
├─ HR validates hours and rates
└─ System calculates gross pay

Step 2: Payroll Calculation (Automated)
├─ Gross Pay = Hours × Hourly Rate
├─ Federal Tax Withholding (IRS tables)
├─ State/Local Tax Withholding
├─ FICA (Social Security + Medicare): 7.65%
├─ Benefits Deductions (if applicable)
└─ Net Pay = Gross - Taxes - Deductions

Step 3: CFO Review (If exceptions)
├─ Large payments (>$10K weekly)
├─ Rate changes
├─ Bonus payments
└─ Retroactive adjustments

Step 4: Payment Processing
├─ ACH Direct Deposit (preferred)
├─ Paper Check (if requested)
└─ Payment Date: Every Friday (for prior week)

Step 5: Tax Remittance
├─ Quarterly: IRS Form 941 (payroll taxes)
├─ Annual: W2 forms to employees + SSA
└─ State/Local: Varies by jurisdiction
```

### 3.2 1099 Contractor Payments

```
Step 1: Invoice Receipt
├─ Contractor submits invoice (email, portal)
├─ Invoice includes: Name, SSN/EIN, Amount, Services, Dates
└─ System validates against placement record

Step 2: Approval Workflow
├─ Recruiter/Manager: Approve services rendered
├─ Finance: Validate invoice details, check for duplicate
├─ CFO: Approve if >$10K or flagged
└─ Rejection: Return to contractor with reason

Step 3: Tax Compliance Check
├─ Validate W-9 on file (required)
├─ Check year-to-date payments (1099 threshold: $600)
├─ Verify contractor classification (1099 vs W2)
└─ Flag if approaching $600 threshold

Step 4: Payment Processing
├─ Payment Method: ACH, Check, Wire
├─ Payment Terms: Net 30 (default)
├─ Currency: USD or CAD
└─ Payment Batch: Weekly or Biweekly

Step 5: Year-End 1099 Reporting
├─ Generate 1099-NEC for contractors ≥$600
├─ Deadline: January 31 (to contractor + IRS)
├─ E-filing required if >250 forms
└─ State filing (varies by state)
```

### 3.3 C2C Vendor Payments

```
Step 1: Vendor Invoice
├─ Corp entity submits invoice
├─ Invoice includes: Corp name, EIN, Amount, Services
└─ No tax withholding (paid to corporation)

Step 2: Approval
├─ Recruiting Manager approves
├─ CFO approves if >$25K
└─ Payment terms: Net 30-60

Step 3: Payment
├─ ACH to vendor's business bank account
├─ No 1099 required (corp-to-corp)
└─ Track for expense deduction only

Step 4: International C2C (Canada)
├─ Invoice in CAD
├─ Convert to USD for payment
├─ Wire transfer or international ACH
└─ Withholding tax: 0% (treaty)
```

---

## 4. AP Dashboard

### Screen: SCR-FIN-009 - Accounts Payable Console

**Route:** `/employee/finance/accounts-payable`
**Access:** CFO, Controller, AP Manager
**Refresh:** Daily

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ACCOUNTS PAYABLE                                     Week of Dec 1, 2025   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ AP SUMMARY ─────────────────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │  │
│ │ │ Payroll (W2) │  │ 1099         │  │ C2C Vendors  │  │ Services  │ │  │
│ │ │              │  │ Contractors  │  │              │  │           │ │  │
│ │ │ $125,000     │  │ $68,000      │  │ $45,000      │  │ $12,000   │ │  │
│ │ │ Due: Friday  │  │ Due: Various │  │ Due: Net 30  │  │ Due: Net30│ │  │
│ │ │ 45 employees │  │ 28 invoices  │  │ 15 vendors   │  │ 8 vendors │ │  │
│ │ │ [Process]    │  │ [Review]     │  │ [Review]     │  │ [Review]  │ │  │
│ │ └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │  │
│ │                                                                       │  │
│ │ Total AP This Week: $250,000                                         │  │
│ │ Cash Available: $850,000 ✅ (sufficient)                             │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ PENDING APPROVALS (CFO Action Required) ────────────────────────────┐  │
│ │                                                                       │  │
│ │ 🟡 HIGH PRIORITY (3 items, $47K total)                               │  │
│ │                                                                       │  │
│ │ 1. C2C Invoice - TechVendor Inc. - $25,000                           │  │
│ │    Consultant: John Smith (Sr Developer)                             │  │
│ │    Period: Nov 1-30, 2025 (160 hours × $156.25/hr)                  │  │
│ │    Approved by: Mike Torres (Recruiting Manager)                     │  │
│ │    Payment Terms: Net 30 (Due: Dec 15)                               │  │
│ │    [View Invoice] [Approve] [Reject] [Request Info]                  │  │
│ │                                                                       │  │
│ │ 2. 1099 Contractor - Jane Doe (Freelance Recruiter) - $12,000        │  │
│ │    Services: Sourcing services for Google job                        │  │
│ │    Period: November 2025                                             │  │
│ │    YTD Payments: $48,000 (will be $60K after this payment)          │  │
│ │    W-9 on file: ✅ Yes                                                │  │
│ │    [View Invoice] [Approve] [Reject]                                 │  │
│ │                                                                       │  │
│ │ 3. Service Vendor - AWS (Cloud Hosting) - $10,200                    │  │
│ │    Invoice: November 2025 usage                                      │  │
│ │    Budget: $10,000/month (2% over budget)                           │  │
│ │    Justification: Increased traffic from Academy platform            │  │
│ │    1099-MISC Required: No (corporation)                              │  │
│ │    [View Invoice] [Approve] [Reject] [Budget Override]               │  │
│ │                                                                       │  │
│ │                                      [Approve All] [Review Later]    │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ W2 PAYROLL (This Week) ─────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Pay Period: Nov 25 - Dec 1, 2025                                     │  │
│ │ Pay Date: Friday, December 6, 2025                                   │  │
│ │                                                                       │  │
│ │ Gross Payroll:        $125,000                                       │  │
│ │ Employer Taxes (7.65%): $9,563                                       │  │
│ │ Net Payroll:          $95,437                                        │  │
│ │ Total Cost:           $134,563                                       │  │
│ │                                                                       │  │
│ │ Breakdown:                                                            │  │
│ │ ├─ W2 Consultants on placement: 38 people, $115,000                  │  │
│ │ ├─ Internal staff (recruiters, ops): 7 people, $10,000               │  │
│ │ └─ Exceptions/Adjustments: 0                                          │  │
│ │                                                                       │  │
│ │ Status: ✅ Approved by HR, Ready for Payment                         │  │
│ │                                                                       │  │
│ │ [View Payroll Detail] [Process Payment] [Export for ADP]             │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ 1099 CONTRACTOR TRACKER ────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Year-to-Date 1099 Payments (2025):                                   │  │
│ │                                                                       │  │
│ │ Total Contractors: 87                                                │  │
│ │ └─ Above $600 threshold (will receive 1099): 62                      │  │
│ │ └─ Below $600 threshold (no 1099): 25                                │  │
│ │                                                                       │  │
│ │ Total 1099 Payments YTD: $2,450,000                                  │  │
│ │                                                                       │  │
│ │ Approaching Threshold (within $100 of $600):                         │  │
│ │ 🟡 Alex Johnson - $520 YTD (next payment: $150) → Will trigger 1099  │  │
│ │ 🟡 Sarah Lee - $580 YTD (next payment: $200) → Will trigger 1099     │  │
│ │                                                                       │  │
│ │ Missing W-9 Forms (Action Required): 3 contractors                   │  │
│ │ 🔴 Tom Wilson - $2,500 YTD - W-9 MISSING                             │  │
│ │    Action: Cannot pay until W-9 received                             │  │
│ │    [Send W-9 Request] [Hold Payment]                                 │  │
│ │                                                                       │  │
│ │ [View All 1099 Contractors] [Export YTD Report] [1099 Preview]       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ VENDOR MANAGEMENT ──────────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Active Vendors: 245                                                  │  │
│ │ ├─ C2C Vendors (consultants): 180                                    │  │
│ │ ├─ Service Vendors (SaaS, etc.): 45                                  │  │
│ │ └─ Other (office, supplies): 20                                      │  │
│ │                                                                       │  │
│ │ Top 10 Vendors by YTD Spend:                                         │  │
│ │ 1. TechVendor Inc. (C2C) - $450,000                                  │  │
│ │ 2. ConsultCorp LLC (C2C) - $380,000                                  │  │
│ │ 3. AWS (Cloud) - $120,000                                            │  │
│ │ 4. Salesforce (CRM) - $85,000                                        │  │
│ │ 5. ... (view more)                                                   │  │
│ │                                                                       │  │
│ │ Vendor Compliance:                                                    │  │
│ │ ✅ W-9 on file: 240/245 (98%)                                        │  │
│ │ 🔴 Missing W-9: 5 vendors (payment on hold)                          │  │
│ │ ✅ Payment terms documented: 245/245 (100%)                          │  │
│ │                                                                       │  │
│ │ [Vendor Directory] [Add New Vendor] [Compliance Report]              │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ PAYMENT SCHEDULE (Next 30 Days) ────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Week of Dec 1:  $250,000 (W2 payroll + 1099 + vendors)              │  │
│ │ Week of Dec 8:  $135,000 (W2 payroll)                               │  │
│ │ Week of Dec 15: $280,000 (W2 + large vendor payments)               │  │
│ │ Week of Dec 22: $140,000 (W2 + holiday bonuses)                     │  │
│ │                                                                       │  │
│ │ Total 30-Day AP: $805,000                                            │  │
│ │ Cash Available: $850,000 ✅                                          │  │
│ │ Safety Margin: $45,000 (5.6%)                                        │  │
│ │                                                                       │  │
│ │ [Cash Flow Forecast] [Payment Calendar] [Export]                     │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Year-End Tax Reporting

### 5.1 1099 Form Types

| Form | Use Case | Threshold | Deadline | E-File Required |
|------|----------|-----------|----------|-----------------|
| **1099-NEC** | Nonemployee compensation (contractors) | $600+ | Jan 31 | If 250+ forms |
| **1099-MISC** | Miscellaneous income (rent, legal, etc.) | $600+ | Jan 31 | If 250+ forms |
| **1099-K** | Payment card transactions | $5,000+ | Jan 31 | Payment processors issue |
| **W-2** | Employee wages | All employees | Jan 31 | If 250+ forms |

### 5.2 1099-NEC Workflow

```
November (Preparation):
├─ Run YTD report for all 1099 contractors
├─ Identify contractors ≥$600
├─ Verify W-9 on file for each
├─ Request missing W-9 forms
└─ Notify contractors of upcoming 1099

December (Finalization):
├─ Close books for year
├─ Final payment runs
├─ Update YTD totals
└─ Prepare draft 1099 forms

January 1-15 (Generation):
├─ Generate 1099-NEC forms
├─ Review for accuracy (CFO approval)
├─ Prepare transmittal forms (1096)
└─ Submit to IRS e-file system

January 16-31 (Distribution):
├─ Email 1099-NEC to contractors (Copy B)
├─ Mail paper copies if requested
├─ File Copy A with IRS
└─ File state copies (varies by state)
```

---

## 6. Business Rules

### BR-FIN-009-001: Payment Approval Thresholds

```
W2 Payroll:
- < $10K/week: Automatic (HR approved)
- ≥ $10K/week: CFO review (if exceptions)

1099 Contractors:
- < $5K: Manager approval
- $5K - $10K: Finance Manager approval
- > $10K: CFO approval required

C2C Vendors:
- < $10K: Manager approval
- $10K - $25K: Finance Manager approval
- > $25K: CFO approval required

Service Vendors:
- < $5K: Department manager approval
- ≥ $5K: CFO approval required

International Payments:
- All: CFO approval (currency conversion + wire fee)
```

### BR-FIN-009-002: W-9 Requirement

```
Before FIRST Payment to Contractor/Vendor:
✓ W-9 form must be on file
✓ Validate Name and TIN (SSN or EIN)
✓ Confirm US person status
✓ Document in vendor record

If W-9 Not Received:
- Hold payment
- Send automated reminder every 3 days
- Escalate to recruiter/manager after 14 days
- CFO approval required to pay without W-9 (rare exception)

Backup Withholding (if invalid TIN):
- Withhold 24% of payment
- Remit to IRS
- Issue 1099 with withholding noted
```

### BR-FIN-009-003: Payment Methods

```
Preferred Method: ACH Direct Deposit
- Faster, cheaper, more secure
- Requires bank account + routing number
- 1-2 business days processing

Secondary Method: Paper Check
- Higher cost ($3/check printing + mailing)
- 5-7 business days delivery
- Only if contractor requests

International Method: Wire Transfer
- For Canadian vendors (CAD)
- Wire fee: $25-45 per transaction
- Currency conversion at bank rate
- 1-3 business days

Prohibited Methods:
❌ Cash payments (no audit trail)
❌ Personal checks (must be company account)
❌ Cryptocurrency (tax reporting nightmare)
❌ Venmo/PayPal (personal accounts, no 1099 tracking)
```

---

## 7. Integration Points

### Payroll Provider (ADP, Gusto, Paychex)

**Purpose:** Process W2 payroll

**Endpoints:**
- `POST /api/payroll/submit` - Submit timesheet data
- `GET /api/payroll/status/{batchId}` - Check processing status
- `GET /api/payroll/tax-forms` - Retrieve W2 forms

---

### Payment Processing (Bill.com, Tipalti)

**Purpose:** Automate AP payments

**Endpoints:**
- `POST /api/payments/invoice` - Submit invoice for payment
- `POST /api/payments/approve` - Approve payment
- `GET /api/payments/status/{paymentId}` - Track payment status

---

## 8. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Product Team | Initial comprehensive specification |

---

**End of UC-FIN-009: Accounts Payable**

*This document provides complete specification for vendor payments, W2/1099 processing, tax compliance, and international payment management.*
