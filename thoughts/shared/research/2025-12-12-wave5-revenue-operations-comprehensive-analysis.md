# Wave 5: Revenue Operations - Comprehensive Analysis

---
type: research
created: 2025-12-12
git_commit: 6cfa396
branch: main
related_issues:
  - TIMESHEETS-01
  - INVOICES-01
  - PAYROLL-01
dependencies:
  - PLACEMENTS-01
  - RATES-01
  - CONTRACTS-01
  - COMPLIANCE-01
status: complete
---

## Research Question

Comprehensive analysis of Wave 5: Revenue Operations implementation requirements, covering:
- **TIMESHEETS-01**: Enterprise Timesheet System
- **INVOICES-01**: Invoicing System
- **PAYROLL-01**: Payroll Processing System

This research documents the current state, proposed specifications, enterprise patterns from Big 4 consulting and major staffing platforms, and implementation recommendations for production-ready revenue operations.

---

## Executive Summary

Wave 5 represents the **money flow pipeline**: Time → Invoice → Payment. This is the revenue backbone of any staffing operation and requires enterprise-grade implementation with:

| System | Current State | Proposed Tables | Implementation Estimate |
|--------|--------------|-----------------|------------------------|
| Timesheets | ~5% (basic table only) | 7 tables | High complexity |
| Invoices | ~0% (no tables) | 6 tables | High complexity |
| Payroll | ~5% (basic tables) | 10 tables | Very high complexity |

**Critical Dependencies**: All Wave 5 systems depend on Wave 4 implementations (PLACEMENTS-01, RATES-01, CONTRACTS-01, COMPLIANCE-01) which appear to be completed.

---

## Part 1: TIMESHEETS-01 - Enterprise Timesheet System

### 1.1 Current State Analysis

#### Existing Database Schema

**Table: `placement_timesheets`** (`baseline.sql:22601-22615`)
```sql
CREATE TABLE placement_timesheets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_id uuid NOT NULL,
    week_starting date NOT NULL,
    hours_worked numeric(5,2) NOT NULL,
    status text DEFAULT 'pending',  -- Basic status only
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    approved_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid NOT NULL
);
```

**Table: `time_attendance`** (`baseline.sql:24408-24425`)
```sql
CREATE TABLE time_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    check_in timestamp with time zone,
    check_out timestamp with time zone,
    hours_worked numeric(5,2),
    status text DEFAULT 'pending',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid NOT NULL,
    deleted_at timestamp with time zone
);
```

#### Existing UI Components

**File: `src/configs/entities/sections/placements.sections.tsx:244-261`**
```tsx
export function PlacementTimesheetsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timesheets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Calendar className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No timesheets submitted yet</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Assessment**: Placeholder only - no actual timesheet functionality implemented.

#### tRPC Router Status

- **No dedicated timesheet router exists**
- No procedures for timesheet CRUD operations
- No approval workflow procedures

### 1.2 Proposed Schema (from TIMESHEETS-01 spec)

The specification proposes **7 new/enhanced tables**:

#### 1.2.1 Core Timesheet Table
```sql
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    placement_id UUID NOT NULL REFERENCES placements(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type timesheet_period_type NOT NULL, -- weekly, bi_weekly, semi_monthly, monthly

    -- Totals (calculated from entries)
    total_regular_hours DECIMAL(6,2) DEFAULT 0,
    total_overtime_hours DECIMAL(6,2) DEFAULT 0,
    total_double_time_hours DECIMAL(6,2) DEFAULT 0,
    total_pto_hours DECIMAL(6,2) DEFAULT 0,
    total_holiday_hours DECIMAL(6,2) DEFAULT 0,
    total_billable_amount DECIMAL(12,2) DEFAULT 0,
    total_payable_amount DECIMAL(12,2) DEFAULT 0,

    -- Rate snapshot at submission (audit integrity)
    rate_snapshot JSONB NOT NULL,

    -- Status tracking
    status timesheet_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES auth.users(id),

    -- Dual approval tracks
    client_approval_status approval_status DEFAULT 'pending',
    client_approved_at TIMESTAMPTZ,
    client_approved_by UUID,
    client_approval_notes TEXT,

    internal_approval_status approval_status DEFAULT 'pending',
    internal_approved_at TIMESTAMPTZ,
    internal_approved_by UUID,
    internal_approval_notes TEXT,

    -- Final processing
    processed_at TIMESTAMPTZ,
    processed_by UUID,
    invoice_id UUID, -- Link when invoiced
    payroll_id UUID, -- Link when paid

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,

    UNIQUE(placement_id, period_start, period_end)
);

CREATE TYPE timesheet_status AS ENUM (
    'draft',
    'submitted',
    'pending_client_approval',
    'client_approved',
    'client_rejected',
    'pending_internal_approval',
    'internal_approved',
    'internal_rejected',
    'approved',          -- Fully approved (both tracks)
    'processed',         -- Invoiced/paid
    'void'
);
```

#### 1.2.2 Timesheet Entries Table
```sql
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,

    -- Hours by type
    regular_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    double_time_hours DECIMAL(4,2) DEFAULT 0,
    pto_hours DECIMAL(4,2) DEFAULT 0,
    holiday_hours DECIMAL(4,2) DEFAULT 0,

    -- Time tracking
    start_time TIME,
    end_time TIME,
    break_minutes INTEGER DEFAULT 0,

    -- Project/task allocation
    project_id UUID REFERENCES projects(id),
    task_code TEXT,
    cost_center TEXT,

    -- Billing
    is_billable BOOLEAN DEFAULT true,
    bill_rate DECIMAL(10,2),
    pay_rate DECIMAL(10,2),
    billable_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        (regular_hours + overtime_hours * 1.5 + double_time_hours * 2) * COALESCE(bill_rate, 0)
    ) STORED,

    -- Notes
    description TEXT,
    internal_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(timesheet_id, work_date)
);
```

#### 1.2.3 Multi-Level Approval Workflows
```sql
CREATE TABLE timesheet_approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,

    -- Workflow configuration
    approval_levels JSONB NOT NULL, -- Array of approval level configs
    -- Example: [
    --   { "level": 1, "type": "supervisor", "required": true },
    --   { "level": 2, "type": "client_manager", "required": true },
    --   { "level": 3, "type": "finance", "required": false, "threshold_hours": 40 }
    -- ]

    -- Auto-approval rules
    auto_approve_under_hours DECIMAL(4,2),
    auto_approve_if_matches_schedule BOOLEAN DEFAULT false,

    -- Escalation
    escalation_hours INTEGER DEFAULT 48,
    escalation_to UUID REFERENCES auth.users(id),

    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timesheet_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id),

    approval_level INTEGER NOT NULL,
    approver_type TEXT NOT NULL, -- 'supervisor', 'client_manager', 'finance', etc.
    approver_id UUID REFERENCES auth.users(id),

    status approval_status NOT NULL DEFAULT 'pending',
    decision_at TIMESTAMPTZ,
    comments TEXT,

    -- Delegation
    delegated_from UUID REFERENCES auth.users(id),
    delegated_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(timesheet_id, approval_level)
);
```

#### 1.2.4 Timesheet Adjustments (Post-Approval Corrections)
```sql
CREATE TABLE timesheet_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_timesheet_id UUID NOT NULL REFERENCES timesheets(id),
    adjustment_timesheet_id UUID REFERENCES timesheets(id), -- New corrective timesheet

    adjustment_type TEXT NOT NULL, -- 'correction', 'addition', 'void'
    reason TEXT NOT NULL,

    -- What changed
    hours_delta DECIMAL(6,2),
    amount_delta DECIMAL(12,2),

    -- Approval
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Enterprise Patterns Analysis

#### SAP Fieldglass (VMS Leader) Patterns
- **Dual approval tracks**: Client manager + internal approver
- **Rate card versioning**: Snapshot at timesheet creation
- **Project/task allocation**: Billable vs non-billable tracking
- **Mobile-first entry**: GPS/geofence for on-site validation
- **Auto-approval rules**: Threshold-based automation

#### Big 4 Consulting Patterns
- **WBS/Project codes**: Every hour allocated to billing code
- **Matter management**: Legal-style time tracking
- **6-minute increments**: Granular billing (0.1 hour)
- **Utilization tracking**: Billable % by consultant
- **Multi-currency support**: Global operations

#### Staffing Industry Standards (Bullhorn, JobDiva)
- **Weekly submission cycles**: Monday-Sunday standard
- **Client-specific rules**: Different OT rules per client
- **Batch approval**: Approve all for a period
- **Variance detection**: Flag hours outside normal range
- **Integration-ready**: Export to payroll systems

### 1.4 Gap Analysis

| Feature | Current State | Required | Gap |
|---------|--------------|----------|-----|
| Basic timesheet | Exists (basic) | Enhanced | Medium |
| Daily entries | Not exists | Required | High |
| Multi-level approval | Not exists | Required | High |
| Client vs Internal approval | Not exists | Required | High |
| Rate snapshots | Not exists | Required | Medium |
| Overtime calculation | Not exists | Required | Medium |
| Adjustments/corrections | Not exists | Required | High |
| Expense tracking | Not exists | Optional | Medium |
| Mobile entry | Not exists | Nice-to-have | Low priority |

---

## Part 2: INVOICES-01 - Invoicing System

### 2.1 Current State Analysis

#### Existing Database Schema

**NO INVOICE TABLES EXIST** in the current baseline.

The database has:
- `placement_timesheets` - source data for invoicing
- `placements` - with `bill_rate`, `pay_rate`, `markup_percentage`
- No invoice, invoice_line_items, or payment tables

#### Existing UI Components

**NO invoice UI components exist** - this is a completely new system.

#### tRPC Router Status

- **No invoice router exists**
- No billing/AR procedures

### 2.2 Proposed Schema (from INVOICES-01 spec)

The specification proposes **6 new tables**:

#### 2.2.1 Core Invoice Table
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),

    -- Invoice identification
    invoice_number TEXT NOT NULL UNIQUE,
    reference_number TEXT, -- Client PO/reference

    -- Parties
    account_id UUID NOT NULL REFERENCES accounts(id),
    billing_contact_id UUID REFERENCES contacts(id),

    -- Invoice details
    invoice_type invoice_type NOT NULL DEFAULT 'standard',
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Currency
    currency TEXT NOT NULL DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,

    -- Amounts (base currency)
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

    -- Status
    status invoice_status NOT NULL DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    sent_to TEXT[], -- Email addresses
    viewed_at TIMESTAMPTZ, -- Client opened

    -- Payment terms
    payment_terms_id UUID REFERENCES payment_terms(id),
    payment_instructions TEXT,

    -- AR tracking
    aging_bucket TEXT, -- '0-30', '31-60', '61-90', '90+'
    last_reminder_sent TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0,

    -- Dispute handling
    is_disputed BOOLEAN DEFAULT false,
    dispute_reason TEXT,
    dispute_opened_at TIMESTAMPTZ,
    dispute_resolved_at TIMESTAMPTZ,

    -- Write-off
    written_off_amount DECIMAL(12,2) DEFAULT 0,
    written_off_at TIMESTAMPTZ,
    written_off_reason TEXT,

    -- Notes
    internal_notes TEXT,
    client_notes TEXT,
    terms_and_conditions TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ
);

CREATE TYPE invoice_type AS ENUM (
    'standard',        -- Time & materials
    'fixed_fee',       -- Project-based
    'retainer',        -- Monthly retainer
    'milestone',       -- Milestone billing
    'credit_note',     -- Credit/adjustment
    'final'            -- Final invoice for placement
);

CREATE TYPE invoice_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'sent',
    'viewed',
    'partially_paid',
    'paid',
    'overdue',
    'disputed',
    'void',
    'written_off'
);
```

#### 2.2.2 Invoice Line Items
```sql
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Source
    timesheet_id UUID REFERENCES timesheets(id),
    timesheet_entry_id UUID REFERENCES timesheet_entries(id),
    placement_id UUID REFERENCES placements(id),

    -- Line item details
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,

    -- Service period
    service_start_date DATE,
    service_end_date DATE,

    -- Quantity and rate
    quantity DECIMAL(10,2) NOT NULL,
    unit_type TEXT DEFAULT 'hours', -- 'hours', 'days', 'units', 'fixed'
    unit_rate DECIMAL(10,2) NOT NULL,

    -- Amounts
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_rate) STORED,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,

    -- Classification
    gl_code TEXT,
    cost_center TEXT,
    project_code TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.3 Payment Recording
```sql
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),

    -- Payment details
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'check', 'ach', 'wire', 'credit_card', 'other'

    -- Reference
    reference_number TEXT, -- Check number, transaction ID
    bank_reference TEXT,

    -- Matching
    matched_to_line_items JSONB, -- Which line items this pays

    -- Deposit tracking
    deposit_date DATE,
    deposit_account TEXT,

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

#### 2.2.4 Payment Terms Management
```sql
CREATE TABLE payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),

    name TEXT NOT NULL, -- 'Net 30', 'Net 45', '2/10 Net 30'
    description TEXT,

    -- Terms configuration
    days_until_due INTEGER NOT NULL DEFAULT 30,
    early_payment_discount_percent DECIMAL(5,2),
    early_payment_discount_days INTEGER,

    -- Late fees
    late_fee_percent DECIMAL(5,2),
    late_fee_flat DECIMAL(10,2),
    late_fee_grace_days INTEGER DEFAULT 0,

    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.5 Invoice Batching
```sql
CREATE TABLE invoice_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),

    batch_number TEXT NOT NULL,
    batch_date DATE NOT NULL,

    -- Totals
    invoice_count INTEGER DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,

    -- Processing
    status TEXT DEFAULT 'draft', -- 'draft', 'processing', 'sent', 'completed'
    generated_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- Configuration
    include_accounts UUID[],
    exclude_accounts UUID[],
    cutoff_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### 2.3 Enterprise Patterns Analysis

#### SAP/Oracle Financials Patterns
- **Invoice workflow approval**: Multi-level before sending
- **Credit management**: Credit limits and holds
- **Revenue recognition**: ASC 606 compliance
- **Intercompany billing**: Multi-entity support
- **Dunning management**: Automated collection letters

#### Staffing Industry Patterns (Bullhorn, Avionté)
- **Timesheet-to-invoice automation**: Auto-generate from approved time
- **Client-specific formatting**: Custom invoice templates per client
- **Consolidated billing**: Multiple placements per invoice
- **Rate reconciliation**: Verify rates match contracts
- **AR aging dashboards**: 0-30, 31-60, 61-90, 90+ views

#### Big 4 Consulting Patterns
- **Matter-based billing**: Project/engagement codes
- **WIP management**: Work-in-progress tracking
- **Realization reporting**: Billed vs. standard rates
- **Invoice factoring**: Sell receivables for cash flow
- **Global billing**: Multi-currency, multi-entity

### 2.4 Gap Analysis

| Feature | Current State | Required | Gap |
|---------|--------------|----------|-----|
| Invoice table | Not exists | Required | Critical |
| Line items | Not exists | Required | Critical |
| Payment recording | Not exists | Required | Critical |
| Payment terms | Not exists | Required | High |
| Invoice templates | Not exists | Required | Medium |
| Batch invoicing | Not exists | Required | Medium |
| AR aging | Not exists | Required | High |
| Credit notes | Not exists | Required | Medium |
| Dunning/reminders | Not exists | Nice-to-have | Low |

---

## Part 3: PAYROLL-01 - Payroll Processing System

### 3.1 Current State Analysis

#### Existing Database Schema

**Table: `payroll_runs`** (`baseline.sql:22085-22104`)
```sql
CREATE TABLE payroll_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    pay_period_start date NOT NULL,
    pay_period_end date NOT NULL,
    run_date date NOT NULL,
    status text DEFAULT 'pending',  -- Basic status only
    total_gross numeric(12,2),
    total_deductions numeric(12,2),
    total_net numeric(12,2),
    employee_count integer,
    notes text,
    processed_at timestamp with time zone,
    processed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

**Table: `payroll_items`** (`baseline.sql:22054-22071`)
```sql
CREATE TABLE payroll_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_run_id uuid,
    employee_id uuid,
    gross_pay numeric(10,2),
    deductions numeric(10,2),
    net_pay numeric(10,2),
    hours_worked numeric(6,2),
    pay_rate numeric(8,2),
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid NOT NULL
);
```

**Assessment**: Basic structure exists but lacks:
- Tax calculation tables
- Benefits/deductions breakdown
- Multi-state tax support
- W2/1099 distinction
- Year-end tax documents
- Pay stub generation

#### Archived UI Specs

**File: `.archive/ui-reference/screens/hr/payroll-dashboard.screen.ts`**
- Design specs for payroll dashboard
- Metrics: Total payroll, average pay, pay distribution
- Not implemented in actual codebase

**File: `.archive/ui-reference/screens/hr/payroll-detail.screen.ts`**
- Design specs for payroll run details
- Employee breakdown, deductions, tax withholdings
- Not implemented

#### tRPC Router Status

- **No dedicated payroll router exists**
- No tax calculation procedures
- No pay stub generation

### 3.2 Proposed Schema (from PAYROLL-01 spec)

The specification proposes **10 new/enhanced tables**:

#### 3.2.1 Pay Periods
```sql
CREATE TABLE pay_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),

    -- Period identification
    period_number INTEGER NOT NULL,
    year INTEGER NOT NULL,

    -- Dates
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE NOT NULL,

    -- Period type
    period_type pay_period_type NOT NULL, -- weekly, bi_weekly, semi_monthly, monthly

    -- Status
    status pay_period_status NOT NULL DEFAULT 'upcoming',

    -- Timesheet cutoff
    timesheet_cutoff TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(org_id, year, period_number)
);

CREATE TYPE pay_period_type AS ENUM (
    'weekly',
    'bi_weekly',
    'semi_monthly',
    'monthly'
);

CREATE TYPE pay_period_status AS ENUM (
    'upcoming',
    'active',
    'processing',
    'completed',
    'void'
);
```

#### 3.2.2 Pay Runs (Enhanced)
```sql
CREATE TABLE pay_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    pay_period_id UUID NOT NULL REFERENCES pay_periods(id),

    -- Run identification
    run_number TEXT NOT NULL,
    run_type pay_run_type NOT NULL DEFAULT 'regular',

    -- Dates
    check_date DATE NOT NULL,
    direct_deposit_date DATE,

    -- Totals
    total_gross DECIMAL(14,2) DEFAULT 0,
    total_employer_taxes DECIMAL(14,2) DEFAULT 0,
    total_employee_taxes DECIMAL(14,2) DEFAULT 0,
    total_deductions DECIMAL(14,2) DEFAULT 0,
    total_net DECIMAL(14,2) DEFAULT 0,
    total_employer_cost DECIMAL(14,2) DEFAULT 0,

    -- Counts
    employee_count INTEGER DEFAULT 0,
    consultant_count INTEGER DEFAULT 0,
    contractor_count INTEGER DEFAULT 0,

    -- Status
    status pay_run_status NOT NULL DEFAULT 'draft',

    -- Processing
    calculated_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,

    -- Integration
    payroll_provider TEXT, -- 'internal', 'adp', 'gusto', 'paychex'
    external_run_id TEXT,

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE TYPE pay_run_type AS ENUM (
    'regular',
    'off_cycle',
    'bonus',
    'final',
    'correction'
);

CREATE TYPE pay_run_status AS ENUM (
    'draft',
    'calculating',
    'pending_approval',
    'approved',
    'submitted',
    'processing',
    'completed',
    'void'
);
```

#### 3.2.3 Pay Items (Enhanced)
```sql
CREATE TABLE pay_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_run_id UUID NOT NULL REFERENCES pay_runs(id),

    -- Worker reference (polymorphic)
    worker_type worker_type NOT NULL, -- 'employee', 'consultant', 'contractor'
    worker_id UUID NOT NULL, -- Reference to employees, consultants, or contractors

    -- Payment type
    pay_type pay_type NOT NULL, -- 'w2', '1099', 'corp_to_corp'

    -- Source timesheets
    timesheet_ids UUID[],

    -- Hours
    regular_hours DECIMAL(6,2) DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    double_time_hours DECIMAL(6,2) DEFAULT 0,
    pto_hours DECIMAL(6,2) DEFAULT 0,
    holiday_hours DECIMAL(6,2) DEFAULT 0,
    total_hours DECIMAL(6,2) GENERATED ALWAYS AS (
        regular_hours + overtime_hours + double_time_hours + pto_hours + holiday_hours
    ) STORED,

    -- Rates
    regular_rate DECIMAL(10,2),
    overtime_rate DECIMAL(10,2),
    double_time_rate DECIMAL(10,2),

    -- Gross calculation
    regular_earnings DECIMAL(12,2) DEFAULT 0,
    overtime_earnings DECIMAL(12,2) DEFAULT 0,
    double_time_earnings DECIMAL(12,2) DEFAULT 0,
    pto_earnings DECIMAL(12,2) DEFAULT 0,
    holiday_earnings DECIMAL(12,2) DEFAULT 0,
    bonus_earnings DECIMAL(12,2) DEFAULT 0,
    other_earnings DECIMAL(12,2) DEFAULT 0,
    gross_pay DECIMAL(12,2) NOT NULL,

    -- Taxes (W2 only)
    federal_income_tax DECIMAL(10,2) DEFAULT 0,
    state_income_tax DECIMAL(10,2) DEFAULT 0,
    local_income_tax DECIMAL(10,2) DEFAULT 0,
    social_security_tax DECIMAL(10,2) DEFAULT 0,
    medicare_tax DECIMAL(10,2) DEFAULT 0,
    total_employee_taxes DECIMAL(10,2) DEFAULT 0,

    -- Employer taxes (W2 only)
    employer_social_security DECIMAL(10,2) DEFAULT 0,
    employer_medicare DECIMAL(10,2) DEFAULT 0,
    employer_futa DECIMAL(10,2) DEFAULT 0,
    employer_suta DECIMAL(10,2) DEFAULT 0,
    total_employer_taxes DECIMAL(10,2) DEFAULT 0,

    -- Deductions
    pre_tax_deductions DECIMAL(10,2) DEFAULT 0,
    post_tax_deductions DECIMAL(10,2) DEFAULT 0,
    garnishments DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,

    -- Net pay
    net_pay DECIMAL(12,2) NOT NULL,

    -- Payment method
    payment_method TEXT DEFAULT 'direct_deposit',
    bank_account_last4 TEXT,
    check_number TEXT,

    -- Status
    status TEXT DEFAULT 'pending',

    -- YTD tracking (for tax calculations)
    ytd_gross DECIMAL(14,2),
    ytd_federal_tax DECIMAL(14,2),
    ytd_state_tax DECIMAL(14,2),
    ytd_social_security DECIMAL(14,2),
    ytd_medicare DECIMAL(14,2),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE worker_type AS ENUM ('employee', 'consultant', 'contractor');
CREATE TYPE pay_type AS ENUM ('w2', '1099', 'corp_to_corp');
```

#### 3.2.4 Earnings Breakdown
```sql
CREATE TABLE pay_item_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_item_id UUID NOT NULL REFERENCES pay_items(id) ON DELETE CASCADE,

    earning_type TEXT NOT NULL, -- 'regular', 'overtime', 'bonus', 'commission', 'pto', etc.
    earning_code TEXT,
    description TEXT,

    hours DECIMAL(6,2),
    rate DECIMAL(10,2),
    amount DECIMAL(12,2) NOT NULL,

    -- Tax treatment
    is_taxable BOOLEAN DEFAULT true,
    is_subject_to_fica BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.5 Deductions Breakdown
```sql
CREATE TABLE pay_item_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_item_id UUID NOT NULL REFERENCES pay_items(id) ON DELETE CASCADE,

    deduction_type TEXT NOT NULL, -- 'health_insurance', '401k', 'garnishment', etc.
    deduction_code TEXT,
    description TEXT,

    -- Calculation
    calculation_method TEXT, -- 'flat', 'percentage', 'tiered'
    calculation_base TEXT, -- 'gross', 'net', 'specific_earnings'
    percentage DECIMAL(5,2),
    flat_amount DECIMAL(10,2),

    -- Amounts
    employee_amount DECIMAL(10,2) NOT NULL,
    employer_amount DECIMAL(10,2) DEFAULT 0, -- Employer contribution (benefits)

    -- Tax treatment
    is_pre_tax BOOLEAN DEFAULT false,
    reduces_federal_tax BOOLEAN DEFAULT false,
    reduces_state_tax BOOLEAN DEFAULT false,
    reduces_fica BOOLEAN DEFAULT false,

    -- Limits
    annual_limit DECIMAL(12,2),
    ytd_amount DECIMAL(12,2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.6 Tax Setup (Multi-State)
```sql
CREATE TABLE consultant_tax_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id),

    -- Federal
    federal_filing_status TEXT, -- 'single', 'married', 'married_separate', 'head_of_household'
    federal_allowances INTEGER DEFAULT 0,
    additional_federal_withholding DECIMAL(10,2) DEFAULT 0,
    federal_exempt BOOLEAN DEFAULT false,

    -- State (primary work state)
    work_state TEXT NOT NULL,
    state_filing_status TEXT,
    state_allowances INTEGER DEFAULT 0,
    additional_state_withholding DECIMAL(10,2) DEFAULT 0,
    state_exempt BOOLEAN DEFAULT false,

    -- Resident state (if different)
    resident_state TEXT,
    resident_state_filing_status TEXT,

    -- Local
    local_tax_jurisdiction TEXT,
    local_tax_rate DECIMAL(5,4),

    -- FICA
    fica_exempt BOOLEAN DEFAULT false,

    -- W-4 info
    w4_form_date DATE,
    w4_multiple_jobs BOOLEAN DEFAULT false,
    w4_dependents_credit DECIMAL(10,2) DEFAULT 0,
    w4_other_income DECIMAL(10,2) DEFAULT 0,
    w4_deductions DECIMAL(10,2) DEFAULT 0,

    -- Effective dates
    effective_date DATE NOT NULL,
    end_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.7 Benefits Management
```sql
CREATE TABLE consultant_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id),
    benefit_plan_id UUID NOT NULL REFERENCES benefit_plans(id),

    -- Enrollment
    enrollment_date DATE NOT NULL,
    termination_date DATE,
    coverage_level TEXT, -- 'employee', 'employee_spouse', 'family'

    -- Contributions
    employee_contribution DECIMAL(10,2) NOT NULL,
    employer_contribution DECIMAL(10,2) NOT NULL,
    contribution_frequency TEXT DEFAULT 'per_pay_period',

    -- HSA/FSA
    annual_election DECIMAL(10,2),
    ytd_contribution DECIMAL(10,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.8 Garnishments
```sql
CREATE TABLE consultant_garnishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id),

    -- Garnishment details
    garnishment_type TEXT NOT NULL, -- 'child_support', 'tax_levy', 'creditor', 'student_loan'
    case_number TEXT,
    issuing_agency TEXT,

    -- Calculation
    calculation_type TEXT NOT NULL, -- 'flat', 'percentage', 'percentage_after_taxes'
    amount DECIMAL(10,2),
    percentage DECIMAL(5,2),

    -- Limits
    maximum_percentage DECIMAL(5,2), -- Legal max (e.g., 50% for child support)
    total_amount_owed DECIMAL(12,2),
    amount_paid DECIMAL(12,2) DEFAULT 0,

    -- Priority
    priority INTEGER DEFAULT 1, -- For multiple garnishments

    -- Status
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.9 Pay Stubs
```sql
CREATE TABLE pay_stubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pay_item_id UUID NOT NULL REFERENCES pay_items(id),

    -- PDF storage
    pdf_url TEXT,
    generated_at TIMESTAMPTZ,

    -- Email delivery
    emailed_to TEXT,
    emailed_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,

    -- Direct access
    access_token TEXT UNIQUE,
    access_expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.10 Year-End Tax Documents
```sql
CREATE TABLE tax_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),

    -- Document type
    document_type TEXT NOT NULL, -- 'w2', '1099_nec', '1099_misc'
    tax_year INTEGER NOT NULL,

    -- Worker reference
    worker_type worker_type NOT NULL,
    worker_id UUID NOT NULL,

    -- Document data (IRS format)
    document_data JSONB NOT NULL,

    -- PDF storage
    pdf_url TEXT,
    generated_at TIMESTAMPTZ,

    -- Filing status
    filed_with_irs BOOLEAN DEFAULT false,
    filed_at TIMESTAMPTZ,
    irs_confirmation TEXT,

    -- Corrections
    is_corrected BOOLEAN DEFAULT false,
    corrects_document_id UUID REFERENCES tax_documents(id),
    correction_reason TEXT,

    -- Delivery
    mailed_at TIMESTAMPTZ,
    mailing_address JSONB,
    emailed_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Enterprise Patterns Analysis

#### ADP Workforce Now Patterns
- **Multi-state tax engine**: Automatic state tax calculation
- **Wage base tracking**: Annual limits (Social Security, FUTA, SUTA)
- **Benefits administration**: Integrated deduction management
- **Time-to-payroll sync**: Direct integration with time systems
- **Year-end processing**: W-2/1099 generation and filing

#### Gusto Patterns
- **Contractor payments**: 1099 and Corp-to-Corp support
- **Tax filing automation**: Federal, state, local filing
- **New hire reporting**: Automated state filings
- **Garnishment processing**: Priority-based deduction
- **Benefits marketplace**: Health, 401(k), etc.

#### Paychex Patterns
- **Enterprise compliance**: SOC 2, multi-state compliance
- **GL integration**: Journal entry export
- **Custom earnings/deductions**: Configurable pay codes
- **Retroactive calculations**: Prior period adjustments
- **Audit trail**: Complete change history

#### Big 4 Consulting Patterns
- **Global payroll**: Multi-currency, multi-country
- **Expatriate processing**: Tax equalization
- **Gross-up calculations**: For taxable benefits
- **Equity compensation**: RSU/stock option processing
- **Executive compensation**: Deferred comp, perks

### 3.4 Gap Analysis

| Feature | Current State | Required | Gap |
|---------|--------------|----------|-----|
| Pay runs table | Exists (basic) | Enhanced | Medium |
| Pay items table | Exists (basic) | Enhanced | Medium |
| Pay periods | Not exists | Required | High |
| Tax calculations | Not exists | Required | Critical |
| Multi-state taxes | Not exists | Required | Critical |
| Benefits deductions | Not exists | Required | High |
| Garnishments | Not exists | Required | High |
| 1099 processing | Not exists | Required | High |
| Pay stubs | Not exists | Required | Medium |
| Year-end docs | Not exists | Required | High |

---

## Part 4: Dependency Systems Analysis

### 4.1 PLACEMENTS-01 (Completed)

**Location**: `baseline.sql:22294-22384`

The placements table includes critical fields for Wave 5:
```sql
CREATE TABLE placements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    -- ... other fields ...

    -- Rate information (used by timesheets/invoices/payroll)
    bill_rate numeric(10,2),
    pay_rate numeric(10,2),
    markup_percentage numeric(5,2),

    -- Status (determines active placements)
    status text DEFAULT 'draft',

    -- Dates (used for pay period calculations)
    start_date date,
    end_date date,

    -- Classification (determines W2 vs 1099 vs C2C)
    employment_type text, -- Not in baseline, may need addition

    -- ... other fields ...
);
```

**Status**: Complete - provides foundation for Wave 5

### 4.2 RATES-01 (Partially Complete)

The rate system is **fragmented** across multiple tables:

| Table | Location | Purpose |
|-------|----------|---------|
| `placement_rates` | baseline.sql:22496 | Rate changes over placement lifecycle |
| `company_rate_cards` | baseline.sql:7455 | Account-level rate cards |
| `contact_rate_cards` | baseline.sql:7539 | Contact-level rates |
| `job_rates` | baseline.sql:15506 | Job-specific rates |
| `submission_rates` | baseline.sql:23907 | Submission-specific rates |

**Issue**: No unified rate resolution logic for billing/payroll calculations.

**Recommendation**: Create rate resolution service before Wave 5 implementation:
```typescript
// Proposed: src/lib/services/rate-resolver.ts
export class RateResolver {
  async getBillRate(placementId: string, date: Date): Promise<RateSnapshot> {
    // 1. Check placement_rates for date-specific rate
    // 2. Fall back to placement.bill_rate
    // 3. Fall back to submission_rates
    // 4. Fall back to job_rates
    // 5. Fall back to company_rate_cards
    // Return snapshot with effective date and source
  }
}
```

### 4.3 CONTRACTS-01 (Complete)

**Router**: `src/server/routers/contracts.ts` (200+ lines)

Fully implemented with:
- Polymorphic contract associations (any entity type)
- Contract templates
- Version tracking
- Signature workflow
- Document attachments

**Wave 5 Integration**: Contracts define payment terms, billing rules, rate agreements that invoices must respect.

### 4.4 COMPLIANCE-01 (Complete)

**Router**: `src/server/routers/compliance.ts` (150+ lines)

Fully implemented with:
- Compliance requirements by entity type
- Compliance items tracking
- Expiration alerts
- Audit history

**Wave 5 Integration**:
- Work authorization affects payroll eligibility
- Insurance/certifications may be required for billing
- Background checks affect placement start dates

---

## Part 5: Implementation Recommendations

### 5.1 Implementation Order

Based on dependencies and complexity:

```
Phase 1: Foundation (Week 1-2)
├── Rate Resolution Service (needed by all Wave 5)
├── Pay Period Management (needed by timesheets and payroll)
└── Database migrations for all 23 tables

Phase 2: Timesheets (Week 3-4)
├── Timesheet CRUD operations
├── Entry management
├── Approval workflows
└── UI components

Phase 3: Invoices (Week 5-6)
├── Invoice generation from timesheets
├── Payment recording
├── AR aging
└── UI components

Phase 4: Payroll (Week 7-9)
├── Pay run processing
├── Tax calculations (integrate with external API)
├── Deductions management
├── Pay stub generation
└── UI components

Phase 5: Integration & Polish (Week 10)
├── Timesheet → Invoice automation
├── Invoice → Payment reconciliation
├── Payroll → GL integration
└── Year-end tax document generation
```

### 5.2 External Integration Requirements

#### Payroll Tax Calculation
Recommend integrating with tax API rather than building in-house:

| Provider | Coverage | Cost |
|----------|----------|------|
| Symmetry Tax Engine | All US jurisdictions | $0.10-0.50/calc |
| PaycheckCity API | Federal + 50 states | $0.05-0.20/calc |
| Thomson Reuters ONESOURCE | Global | Enterprise pricing |

#### Payment Processing
| Provider | Use Case |
|----------|----------|
| Stripe | Credit card payments for invoices |
| Plaid | ACH verification for direct deposit |
| Dwolla | ACH batch payments for payroll |

### 5.3 Compliance Considerations

#### FLSA Compliance
- Overtime calculation must respect state-specific rules
- California: Daily overtime after 8 hours
- Federal: Weekly overtime after 40 hours
- Some states: 7th day overtime rules

#### Multi-State Taxation
- Withhold in work state AND resident state (if reciprocity doesn't exist)
- Track wage bases per state (varies significantly)
- Handle "nexus" for remote workers

#### Year-End Filings
- W-2 deadline: January 31
- 1099-NEC deadline: January 31
- State filings may vary
- Electronic filing required above thresholds

### 5.4 Risk Areas

| Risk | Mitigation |
|------|------------|
| Tax calculation errors | Use certified tax engine, not custom code |
| Overtime miscalculation | Document rules per client/state |
| Missing rate snapshots | Always capture rates at timesheet submission |
| Orphaned adjustments | Require approval workflow for all corrections |
| Year-end filing delays | Automated deadline reminders |

---

## Part 6: Code References

### Existing Files to Modify

| File | Lines | Changes Needed |
|------|-------|----------------|
| `baseline.sql` | 22601-22615 | Replace `placement_timesheets` with new schema |
| `baseline.sql` | 22054-22104 | Enhance `payroll_runs` and `payroll_items` |
| `placements.sections.tsx` | 244-261 | Implement actual timesheet functionality |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/server/routers/timesheets.ts` | Timesheet CRUD, approvals, entries |
| `src/server/routers/invoices.ts` | Invoice CRUD, payments, aging |
| `src/server/routers/payroll.ts` | Pay runs, pay items, tax docs |
| `src/lib/services/rate-resolver.ts` | Unified rate resolution |
| `src/lib/services/tax-calculator.ts` | Tax calculation integration |
| `src/lib/services/timesheet-invoicer.ts` | Auto-generate invoices |
| `src/configs/entities/timesheets.config.ts` | PCF list config |
| `src/configs/entities/invoices.config.ts` | PCF list config |
| `src/configs/entities/payroll.config.ts` | PCF list config |
| `src/stores/timesheet-entry-store.ts` | Timesheet entry wizard state |
| `src/stores/invoice-create-store.ts` | Invoice creation wizard state |
| `src/stores/pay-run-store.ts` | Pay run processing state |

### Component Hierarchy

```
Timesheets Module
├── TimesheetListPage (EntityListView)
├── TimesheetDetailPage (EntityDetailView)
│   ├── TimesheetOverviewSection
│   ├── TimesheetEntriesSection
│   ├── TimesheetApprovalsSection
│   └── TimesheetHistorySection
├── TimesheetEntryDialog
└── TimesheetApprovalWorkflow

Invoices Module
├── InvoiceListPage (EntityListView)
├── InvoiceDetailPage (EntityDetailView)
│   ├── InvoiceOverviewSection
│   ├── InvoiceLineItemsSection
│   ├── InvoicePaymentsSection
│   └── InvoiceHistorySection
├── InvoiceCreateWizard
└── PaymentRecordDialog

Payroll Module
├── PayrollDashboard
├── PayRunListPage (EntityListView)
├── PayRunDetailPage (EntityDetailView)
│   ├── PayRunOverviewSection
│   ├── PayRunEmployeesSection
│   ├── PayRunConsultantsSection
│   └── PayRunContractorsSection
├── PayRunProcessingWizard
└── TaxDocumentGenerator
```

---

## Conclusion

Wave 5: Revenue Operations represents the most complex implementation wave in the InTime v3 roadmap. The "money flow" from Time → Invoice → Payment requires:

1. **23 new database tables** across three systems
2. **Enterprise-grade compliance** with FLSA, multi-state tax, and year-end filings
3. **External integrations** for tax calculation and payment processing
4. **Robust approval workflows** with audit trails
5. **Rate management** with historical snapshots

The proposed specifications in the issue files are comprehensive and align with enterprise patterns from SAP Fieldglass, ADP, and Big 4 consulting firms. The primary gap is the current codebase has ~5% implementation, requiring substantial new development.

**Recommendation**: Implement in phases starting with foundational services (rate resolution, pay periods), then timesheets (highest dependency), then invoices, and finally payroll (highest complexity).

---

## Appendix: Enterprise Pattern Sources

### Web Research Sources
- SAP Fieldglass VMS documentation
- ADP Workforce Now API documentation
- Gusto Partner API documentation
- Paychex Flex API documentation
- SHRM payroll compliance guides
- IRS Publication 15 (Circular E)
- DOL FLSA fact sheets

### Industry Standards Referenced
- AICPA revenue recognition (ASC 606)
- FASB lease accounting (ASC 842)
- IRS W-2/1099 specifications
- ACH file format specifications
- NACHA operating rules
