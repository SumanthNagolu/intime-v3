# Wave 5: Revenue Operations Implementation Plan

## Overview

This plan implements the complete Revenue Operations pipeline for InTime v3: **Time → Invoice → Payment**. It covers three enterprise-grade systems:

- **TIMESHEETS-01**: Enterprise Timesheet System (7 tables)
- **INVOICES-01**: Client Invoicing System (6 tables)
- **PAYROLL-01**: Payroll Processing System (10 tables)

**Total**: 23 new database tables, 3 tRPC routers, 3 PCF entity configs, 3 Zustand stores, and comprehensive UI components.

## Current State Analysis

| System | Current State | Gap |
|--------|---------------|-----|
| Timesheets | 5% - `placement_timesheets` table exists (basic, no entries) | No backend, no UI |
| Invoices | 0% - No tables exist | Complete build |
| Payroll | 5% - `payroll_runs`, `payroll_items` exist (basic) | Major enhancement |

**Foundation (Complete)**:
- ✅ PLACEMENTS-01: Full implementation with rates, vendors, change orders
- ✅ RATES-01: Rate cards, entity rates, rate history
- ✅ CONTRACTS-01: Contract management with terms
- ✅ COMPLIANCE-01: Compliance tracking

## Desired End State

After implementation:

1. **Consultants** can submit weekly timesheets with daily hour breakdowns
2. **Managers** can approve timesheets through multi-level workflow
3. **Finance** can generate invoices from approved timesheets
4. **HR** can process payroll from approved timesheets
5. **System** automatically links timesheets → invoices → payroll with full audit trail
6. **All** operations respect rate changes, overtime rules, and compliance requirements

### Success Metrics
- <100ms query response for list operations
- Zero data loss in timesheet → invoice → payroll flow
- Full audit trail for all financial transactions
- Multi-tenant isolation enforced at database level

## What We're NOT Doing

1. **External Payroll Integration** (ADP, Gusto) - future enhancement
2. **External Accounting Integration** (QuickBooks, Xero) - future enhancement
3. **Tax Calculation Engine** - manual entry for now, external API later
4. **Mobile Time Entry** - desktop web only for v1
5. **Expense Management** - tracking only, no reimbursement workflow
6. **Multi-Currency** - USD only for v1

## Implementation Approach

### Execution Strategy: Parallel + Sequential

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAVE 5 EXECUTION TIMELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: Foundation (Week 1) - ALL PARALLEL                    │
│  ├─ Task 1A: Database migrations (23 tables)                    │
│  ├─ Task 1B: Rate Resolution Service                            │
│  └─ Task 1C: Pay Period Management Service                      │
│                                                                  │
│  PHASE 2: Timesheets (Weeks 2-3) - SEQUENTIAL                   │
│  └─ TIMESHEETS-01: Full implementation                          │
│     (BLOCKING - must complete before Phase 3)                   │
│                                                                  │
│  PHASE 3: Invoices & Payroll (Weeks 4-6) - PARALLEL             │
│  ├─ INVOICES-01: Full implementation                            │
│  └─ PAYROLL-01: Full implementation                             │
│     (Can run in parallel with each other)                       │
│                                                                  │
│  PHASE 4: Integration (Week 7) - SEQUENTIAL                     │
│  ├─ Timesheet → Invoice automation                              │
│  ├─ Timesheet → Payroll automation                              │
│  └─ End-to-end testing                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Order

1. **Phase 1 (Parallel)**: Database and services have no interdependencies
2. **Phase 2 (Sequential)**: Timesheets are the data source for both invoices and payroll
3. **Phase 3 (Parallel)**: Invoices and payroll consume timesheets independently
4. **Phase 4 (Sequential)**: Integration requires all pieces in place

---

## Phase 1: Foundation (Week 1)

### Overview
Create all database tables and foundational services in parallel. No UI changes in this phase.

### Task 1A: Database Migrations

**File**: `supabase/migrations/20251213100000_wave5_revenue_operations.sql`

#### 1A.1: Enums

```sql
-- Timesheet enums
DO $$ BEGIN
  CREATE TYPE timesheet_status AS ENUM (
    'draft', 'submitted', 'pending_client_approval', 'client_approved',
    'client_rejected', 'pending_internal_approval', 'internal_approved',
    'internal_rejected', 'approved', 'processed', 'void'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE timesheet_period_type AS ENUM (
    'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM (
    'pending', 'approved', 'rejected', 'delegated', 'escalated'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Invoice enums
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'draft', 'pending_approval', 'approved', 'sent', 'viewed',
    'partially_paid', 'paid', 'overdue', 'disputed', 'void', 'written_off'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_type AS ENUM (
    'standard', 'fixed_fee', 'retainer', 'milestone', 'credit_note', 'final'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Payroll enums
DO $$ BEGIN
  CREATE TYPE pay_period_status AS ENUM (
    'upcoming', 'active', 'processing', 'completed', 'void'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pay_run_status AS ENUM (
    'draft', 'calculating', 'pending_approval', 'approved',
    'submitted', 'processing', 'completed', 'void'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pay_run_type AS ENUM (
    'regular', 'off_cycle', 'bonus', 'final', 'correction'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE worker_type AS ENUM ('employee', 'consultant', 'contractor');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pay_type AS ENUM ('w2', '1099', 'corp_to_corp');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
```

#### 1A.2: Timesheet Tables (7)

```sql
-- 1. Core timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  placement_id UUID NOT NULL REFERENCES placements(id),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type timesheet_period_type NOT NULL DEFAULT 'weekly',

  -- Totals (calculated from entries)
  total_regular_hours DECIMAL(6,2) DEFAULT 0,
  total_overtime_hours DECIMAL(6,2) DEFAULT 0,
  total_double_time_hours DECIMAL(6,2) DEFAULT 0,
  total_pto_hours DECIMAL(6,2) DEFAULT 0,
  total_holiday_hours DECIMAL(6,2) DEFAULT 0,
  total_billable_amount DECIMAL(12,2) DEFAULT 0,
  total_payable_amount DECIMAL(12,2) DEFAULT 0,

  -- Rate snapshot at submission (audit integrity)
  rate_snapshot JSONB,

  -- Status
  status timesheet_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),

  -- Client approval track
  client_approval_status approval_status DEFAULT 'pending',
  client_approved_at TIMESTAMPTZ,
  client_approved_by UUID,
  client_approval_notes TEXT,

  -- Internal approval track
  internal_approval_status approval_status DEFAULT 'pending',
  internal_approved_at TIMESTAMPTZ,
  internal_approved_by UUID,
  internal_approval_notes TEXT,

  -- Processing links
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  invoice_id UUID,  -- Linked when invoiced
  payroll_run_id UUID,  -- Linked when paid

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT timesheets_period_unique UNIQUE (placement_id, period_start, period_end)
);

-- 2. Timesheet entries (daily breakdown)
CREATE TABLE IF NOT EXISTS timesheet_entries (
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

  -- Project allocation
  project_id UUID,
  task_code TEXT,
  cost_center TEXT,

  -- Billing
  is_billable BOOLEAN DEFAULT true,
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),

  -- Calculated amounts
  billable_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    (regular_hours + overtime_hours * 1.5 + double_time_hours * 2) * COALESCE(bill_rate, 0)
  ) STORED,
  payable_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    (regular_hours + overtime_hours * 1.5 + double_time_hours * 2) * COALESCE(pay_rate, 0)
  ) STORED,

  -- Notes
  description TEXT,
  internal_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT timesheet_entries_date_unique UNIQUE (timesheet_id, work_date)
);

-- 3. Approval workflow configuration
CREATE TABLE IF NOT EXISTS timesheet_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  description TEXT,

  -- Workflow configuration
  approval_levels JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   { "level": 1, "type": "supervisor", "required": true },
  --   { "level": 2, "type": "client_manager", "required": true },
  --   { "level": 3, "type": "finance", "threshold_hours": 40 }
  -- ]

  -- Auto-approval rules
  auto_approve_under_hours DECIMAL(4,2),
  auto_approve_if_matches_schedule BOOLEAN DEFAULT false,

  -- Escalation
  escalation_hours INTEGER DEFAULT 48,
  escalation_to UUID REFERENCES user_profiles(id),

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Individual approval records
CREATE TABLE IF NOT EXISTS timesheet_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,

  approval_level INTEGER NOT NULL,
  approver_type TEXT NOT NULL,
  approver_id UUID REFERENCES user_profiles(id),

  status approval_status NOT NULL DEFAULT 'pending',
  decision_at TIMESTAMPTZ,
  comments TEXT,

  -- Delegation
  delegated_from UUID REFERENCES user_profiles(id),
  delegated_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT timesheet_approvals_level_unique UNIQUE (timesheet_id, approval_level)
);

-- 5. Post-approval adjustments
CREATE TABLE IF NOT EXISTS timesheet_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  original_timesheet_id UUID NOT NULL REFERENCES timesheets(id),
  adjustment_timesheet_id UUID REFERENCES timesheets(id),

  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('correction', 'addition', 'void')),
  reason TEXT NOT NULL,

  -- What changed
  hours_delta DECIMAL(6,2),
  amount_delta DECIMAL(12,2),

  -- Approval
  requested_by UUID NOT NULL REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Expense tracking (within timesheets)
CREATE TABLE IF NOT EXISTS timesheet_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,

  expense_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'travel', 'lodging', 'meals', 'mileage', 'parking',
    'equipment', 'supplies', 'communication', 'other'
  )),
  description TEXT NOT NULL,

  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  is_billable BOOLEAN DEFAULT true,
  is_reimbursable BOOLEAN DEFAULT true,

  -- Receipt
  receipt_url TEXT,
  receipt_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Timesheet templates
CREATE TABLE IF NOT EXISTS timesheet_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  description TEXT,

  -- Template configuration
  period_type timesheet_period_type NOT NULL DEFAULT 'weekly',
  default_hours_per_day DECIMAL(4,2) DEFAULT 8,
  default_days_per_week INTEGER DEFAULT 5,

  -- Default entries (JSONB array)
  default_entries JSONB DEFAULT '[]',

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

#### 1A.3: Invoice Tables (6)

```sql
-- 1. Core invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  invoice_number TEXT NOT NULL,
  reference_number TEXT,

  -- Parties
  account_id UUID REFERENCES accounts(id),
  company_id UUID REFERENCES companies(id),
  billing_contact_id UUID REFERENCES contacts(id),

  -- Invoice details
  invoice_type invoice_type NOT NULL DEFAULT 'standard',
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Currency
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1,

  -- Amounts
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
  sent_to TEXT[],
  viewed_at TIMESTAMPTZ,

  -- Payment terms
  payment_terms_id UUID,
  payment_instructions TEXT,

  -- AR tracking
  aging_bucket TEXT,
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
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT invoices_number_unique UNIQUE (org_id, invoice_number)
);

-- 2. Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Source (polymorphic)
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
  unit_type TEXT DEFAULT 'hours',
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

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Invoice payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),

  -- Payment details
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'check', 'ach', 'wire', 'credit_card', 'other'
  )),

  -- Reference
  reference_number TEXT,
  bank_reference TEXT,

  -- Matching
  matched_to_line_items JSONB,

  -- Deposit tracking
  deposit_date DATE,
  deposit_account TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- 4. Payment terms
CREATE TABLE IF NOT EXISTS payment_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
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

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Invoice batches
CREATE TABLE IF NOT EXISTS invoice_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  batch_number TEXT NOT NULL,
  batch_date DATE NOT NULL,

  -- Totals
  invoice_count INTEGER DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,

  -- Processing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'sent', 'completed')),
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Configuration
  include_accounts UUID[],
  exclude_accounts UUID[],
  cutoff_date DATE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- 6. Invoice templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  description TEXT,

  -- Template content
  header_html TEXT,
  footer_html TEXT,
  line_item_format TEXT,

  -- Styling
  logo_url TEXT,
  primary_color TEXT,
  font_family TEXT,

  -- Default values
  default_payment_terms_id UUID REFERENCES payment_terms(id),
  default_notes TEXT,
  default_terms_and_conditions TEXT,

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

#### 1A.4: Payroll Tables (10)

```sql
-- 1. Pay periods
CREATE TABLE IF NOT EXISTS pay_periods (
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
  period_type timesheet_period_type NOT NULL,

  -- Status
  status pay_period_status NOT NULL DEFAULT 'upcoming',

  -- Timesheet cutoff
  timesheet_cutoff TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT pay_periods_unique UNIQUE (org_id, year, period_number)
);

-- 2. Pay runs
CREATE TABLE IF NOT EXISTS pay_runs (
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
  approved_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,

  -- Integration
  payroll_provider TEXT,
  external_run_id TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),

  CONSTRAINT pay_runs_number_unique UNIQUE (org_id, run_number)
);

-- 3. Pay items (individual payments)
CREATE TABLE IF NOT EXISTS pay_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_run_id UUID NOT NULL REFERENCES pay_runs(id) ON DELETE CASCADE,

  -- Worker reference
  worker_type worker_type NOT NULL,
  worker_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id),

  -- Payment type
  pay_type pay_type NOT NULL,

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

  -- Employee taxes (W2 only)
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

  -- YTD tracking
  ytd_gross DECIMAL(14,2),
  ytd_federal_tax DECIMAL(14,2),
  ytd_state_tax DECIMAL(14,2),
  ytd_social_security DECIMAL(14,2),
  ytd_medicare DECIMAL(14,2),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Pay item earnings breakdown
CREATE TABLE IF NOT EXISTS pay_item_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_item_id UUID NOT NULL REFERENCES pay_items(id) ON DELETE CASCADE,

  earning_type TEXT NOT NULL,
  earning_code TEXT,
  description TEXT,

  hours DECIMAL(6,2),
  rate DECIMAL(10,2),
  amount DECIMAL(12,2) NOT NULL,

  -- Tax treatment
  is_taxable BOOLEAN DEFAULT true,
  is_subject_to_fica BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Pay item deductions breakdown
CREATE TABLE IF NOT EXISTS pay_item_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_item_id UUID NOT NULL REFERENCES pay_items(id) ON DELETE CASCADE,

  deduction_type TEXT NOT NULL,
  deduction_code TEXT,
  description TEXT,

  -- Calculation
  calculation_method TEXT,
  calculation_base TEXT,
  percentage DECIMAL(5,2),
  flat_amount DECIMAL(10,2),

  -- Amounts
  employee_amount DECIMAL(10,2) NOT NULL,
  employer_amount DECIMAL(10,2) DEFAULT 0,

  -- Tax treatment
  is_pre_tax BOOLEAN DEFAULT false,
  reduces_federal_tax BOOLEAN DEFAULT false,
  reduces_state_tax BOOLEAN DEFAULT false,
  reduces_fica BOOLEAN DEFAULT false,

  -- Limits
  annual_limit DECIMAL(12,2),
  ytd_amount DECIMAL(12,2),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Worker tax setup
CREATE TABLE IF NOT EXISTS worker_tax_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),

  -- Federal
  federal_filing_status TEXT,
  federal_allowances INTEGER DEFAULT 0,
  additional_federal_withholding DECIMAL(10,2) DEFAULT 0,
  federal_exempt BOOLEAN DEFAULT false,

  -- State (primary work state)
  work_state TEXT NOT NULL,
  state_filing_status TEXT,
  state_allowances INTEGER DEFAULT 0,
  additional_state_withholding DECIMAL(10,2) DEFAULT 0,
  state_exempt BOOLEAN DEFAULT false,

  -- Resident state
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

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Worker benefits enrollment
CREATE TABLE IF NOT EXISTS worker_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  benefit_plan_id UUID NOT NULL,

  -- Enrollment
  enrollment_date DATE NOT NULL,
  termination_date DATE,
  coverage_level TEXT,

  -- Contributions
  employee_contribution DECIMAL(10,2) NOT NULL,
  employer_contribution DECIMAL(10,2) NOT NULL,
  contribution_frequency TEXT DEFAULT 'per_pay_period',

  -- HSA/FSA
  annual_election DECIMAL(10,2),
  ytd_contribution DECIMAL(10,2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Worker garnishments
CREATE TABLE IF NOT EXISTS worker_garnishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),

  -- Garnishment details
  garnishment_type TEXT NOT NULL CHECK (garnishment_type IN (
    'child_support', 'tax_levy', 'creditor', 'student_loan', 'bankruptcy', 'other'
  )),
  case_number TEXT,
  issuing_agency TEXT,

  -- Calculation
  calculation_type TEXT NOT NULL CHECK (calculation_type IN (
    'flat', 'percentage', 'percentage_after_taxes'
  )),
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),

  -- Limits
  maximum_percentage DECIMAL(5,2),
  total_amount_owed DECIMAL(12,2),
  amount_paid DECIMAL(12,2) DEFAULT 0,

  -- Priority
  priority INTEGER DEFAULT 1,

  -- Status
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Pay stubs
CREATE TABLE IF NOT EXISTS pay_stubs (
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

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. Year-end tax documents
CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Document type
  document_type TEXT NOT NULL CHECK (document_type IN ('w2', '1099_nec', '1099_misc')),
  tax_year INTEGER NOT NULL,

  -- Worker reference
  worker_type worker_type NOT NULL,
  worker_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id),

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

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT tax_documents_unique UNIQUE (org_id, tax_year, document_type, worker_id)
);
```

#### 1A.5: Indexes

```sql
-- Timesheet indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_org ON timesheets(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timesheets_placement ON timesheets(placement_id, period_start DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status, org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timesheets_submitted ON timesheets(submitted_at) WHERE status = 'submitted' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timesheets_invoice ON timesheets(invoice_id) WHERE invoice_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timesheets_payroll ON timesheets(payroll_run_id) WHERE payroll_run_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_timesheet_entries_timesheet ON timesheet_entries(timesheet_id, work_date);
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_timesheet ON timesheet_approvals(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_expenses_timesheet ON timesheet_expenses(timesheet_id);

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status NOT IN ('paid', 'void') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON invoices(due_date, balance_due) WHERE status = 'overdue' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_timesheet ON invoice_line_items(timesheet_id) WHERE timesheet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);

-- Payroll indexes
CREATE INDEX IF NOT EXISTS idx_pay_periods_org ON pay_periods(org_id, year, period_number);
CREATE INDEX IF NOT EXISTS idx_pay_runs_org ON pay_runs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pay_runs_period ON pay_runs(pay_period_id);
CREATE INDEX IF NOT EXISTS idx_pay_runs_status ON pay_runs(status, org_id);

CREATE INDEX IF NOT EXISTS idx_pay_items_run ON pay_items(pay_run_id);
CREATE INDEX IF NOT EXISTS idx_pay_items_worker ON pay_items(worker_id, worker_type);
CREATE INDEX IF NOT EXISTS idx_pay_items_contact ON pay_items(contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_worker_tax_setup_contact ON worker_tax_setup(contact_id);
CREATE INDEX IF NOT EXISTS idx_worker_benefits_contact ON worker_benefits(contact_id);
CREATE INDEX IF NOT EXISTS idx_worker_garnishments_contact ON worker_garnishments(contact_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_tax_documents_worker ON tax_documents(worker_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_year ON tax_documents(tax_year, document_type) WHERE filed_with_irs = false;
```

#### 1A.6: RLS Policies

```sql
-- Timesheet RLS
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timesheets_org_isolation" ON timesheets;
CREATE POLICY "timesheets_org_isolation" ON timesheets
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE timesheet_approval_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timesheet_approval_workflows_org_isolation" ON timesheet_approval_workflows;
CREATE POLICY "timesheet_approval_workflows_org_isolation" ON timesheet_approval_workflows
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE timesheet_adjustments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timesheet_adjustments_org_isolation" ON timesheet_adjustments;
CREATE POLICY "timesheet_adjustments_org_isolation" ON timesheet_adjustments
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE timesheet_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timesheet_templates_org_isolation" ON timesheet_templates;
CREATE POLICY "timesheet_templates_org_isolation" ON timesheet_templates
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- Invoice RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_org_isolation" ON invoices;
CREATE POLICY "invoices_org_isolation" ON invoices
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoice_payments_org_isolation" ON invoice_payments;
CREATE POLICY "invoice_payments_org_isolation" ON invoice_payments
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE payment_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_terms_org_isolation" ON payment_terms;
CREATE POLICY "payment_terms_org_isolation" ON payment_terms
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE invoice_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoice_batches_org_isolation" ON invoice_batches;
CREATE POLICY "invoice_batches_org_isolation" ON invoice_batches
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoice_templates_org_isolation" ON invoice_templates;
CREATE POLICY "invoice_templates_org_isolation" ON invoice_templates
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- Payroll RLS
ALTER TABLE pay_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pay_periods_org_isolation" ON pay_periods;
CREATE POLICY "pay_periods_org_isolation" ON pay_periods
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE pay_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pay_runs_org_isolation" ON pay_runs;
CREATE POLICY "pay_runs_org_isolation" ON pay_runs
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE worker_tax_setup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "worker_tax_setup_org_isolation" ON worker_tax_setup;
CREATE POLICY "worker_tax_setup_org_isolation" ON worker_tax_setup
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE worker_benefits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "worker_benefits_org_isolation" ON worker_benefits;
CREATE POLICY "worker_benefits_org_isolation" ON worker_benefits
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE worker_garnishments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "worker_garnishments_org_isolation" ON worker_garnishments;
CREATE POLICY "worker_garnishments_org_isolation" ON worker_garnishments
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tax_documents_org_isolation" ON tax_documents;
CREATE POLICY "tax_documents_org_isolation" ON tax_documents
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);
```

#### 1A.7: Entity Type Registry

```sql
INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES
  ('timesheet', 'timesheets', NULL, 'Timesheet', '/employee/recruiting/timesheets/{id}'),
  ('timesheet_entry', 'timesheet_entries', NULL, 'Timesheet Entry', NULL),
  ('invoice', 'invoices', 'invoice_number', 'Invoice', '/employee/finance/invoices/{id}'),
  ('payment', 'invoice_payments', NULL, 'Payment', NULL),
  ('pay_run', 'pay_runs', 'run_number', 'Pay Run', '/employee/hr/payroll/{id}'),
  ('pay_item', 'pay_items', NULL, 'Pay Item', NULL),
  ('expense', 'timesheet_expenses', NULL, 'Expense', NULL)
ON CONFLICT (entity_type) DO UPDATE SET
  table_name = EXCLUDED.table_name,
  display_name = EXCLUDED.display_name;
```

#### 1A.8: Comments

```sql
-- Timesheet comments
COMMENT ON TABLE timesheets IS 'Consultant timesheet headers with approval tracking (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_entries IS 'Daily time entries for timesheets (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_approval_workflows IS 'Configurable approval workflow definitions (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_approvals IS 'Individual approval records per timesheet (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_adjustments IS 'Post-approval corrections and adjustments (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_expenses IS 'Billable and reimbursable expenses (TIMESHEETS-01)';
COMMENT ON TABLE timesheet_templates IS 'Reusable timesheet templates (TIMESHEETS-01)';

-- Invoice comments
COMMENT ON TABLE invoices IS 'Client invoice headers with AR tracking (INVOICES-01)';
COMMENT ON TABLE invoice_line_items IS 'Invoice line items linked to timesheets (INVOICES-01)';
COMMENT ON TABLE invoice_payments IS 'Payment records against invoices (INVOICES-01)';
COMMENT ON TABLE payment_terms IS 'Configurable payment terms (INVOICES-01)';
COMMENT ON TABLE invoice_batches IS 'Batch invoice generation records (INVOICES-01)';
COMMENT ON TABLE invoice_templates IS 'Invoice PDF/email templates (INVOICES-01)';

-- Payroll comments
COMMENT ON TABLE pay_periods IS 'Pay period definitions (PAYROLL-01)';
COMMENT ON TABLE pay_runs IS 'Payroll run headers (PAYROLL-01)';
COMMENT ON TABLE pay_items IS 'Individual worker pay calculations (PAYROLL-01)';
COMMENT ON TABLE pay_item_earnings IS 'Earnings breakdown per pay item (PAYROLL-01)';
COMMENT ON TABLE pay_item_deductions IS 'Deductions breakdown per pay item (PAYROLL-01)';
COMMENT ON TABLE worker_tax_setup IS 'Worker tax withholding configuration (PAYROLL-01)';
COMMENT ON TABLE worker_benefits IS 'Worker benefits enrollment (PAYROLL-01)';
COMMENT ON TABLE worker_garnishments IS 'Court-ordered garnishments (PAYROLL-01)';
COMMENT ON TABLE pay_stubs IS 'Generated pay stub documents (PAYROLL-01)';
COMMENT ON TABLE tax_documents IS 'Year-end tax documents W2/1099 (PAYROLL-01)';
```

### Task 1B: Rate Resolution Service

**File**: `src/lib/services/rate-resolver.ts`

```typescript
import { getAdminClient } from '@/lib/supabase/admin'

export interface RateSnapshot {
  billRate: number
  payRate: number
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'
  effectiveDate: string
  source: 'placement' | 'placement_rates' | 'rate_card' | 'contract'
  sourceId: string
}

export interface OvertimeRules {
  overtimeMultiplier: number
  doubleTimeMultiplier: number
  dailyOvertimeThreshold: number | null  // CA: 8 hours
  weeklyOvertimeThreshold: number        // Federal: 40 hours
  seventhDayRule: boolean
}

export class RateResolver {
  private adminClient = getAdminClient()

  /**
   * Get the effective bill rate for a placement on a specific date
   * Resolution order:
   * 1. placement_rates (date-specific)
   * 2. placement.bill_rate (current)
   * 3. rate_card (if linked)
   * 4. contract rate (if linked)
   */
  async getBillRate(placementId: string, workDate: Date): Promise<RateSnapshot> {
    // 1. Check placement_rates for date-specific rate
    const { data: dateRate } = await this.adminClient
      .from('placement_rates')
      .select('id, bill_rate, pay_rate, rate_type, effective_from')
      .eq('placement_id', placementId)
      .lte('effective_from', workDate.toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${workDate.toISOString().split('T')[0]}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()

    if (dateRate) {
      return {
        billRate: Number(dateRate.bill_rate),
        payRate: Number(dateRate.pay_rate),
        rateType: dateRate.rate_type || 'hourly',
        effectiveDate: dateRate.effective_from,
        source: 'placement_rates',
        sourceId: dateRate.id,
      }
    }

    // 2. Fall back to placement.bill_rate
    const { data: placement } = await this.adminClient
      .from('placements')
      .select('id, bill_rate, pay_rate, rate_type, rate_card_id, contract_id')
      .eq('id', placementId)
      .single()

    if (!placement) {
      throw new Error(`Placement ${placementId} not found`)
    }

    if (placement.bill_rate) {
      return {
        billRate: Number(placement.bill_rate),
        payRate: Number(placement.pay_rate),
        rateType: placement.rate_type || 'hourly',
        effectiveDate: workDate.toISOString().split('T')[0],
        source: 'placement',
        sourceId: placement.id,
      }
    }

    // 3. Try rate card if linked
    if (placement.rate_card_id) {
      const { data: rateCard } = await this.adminClient
        .from('rate_cards')
        .select('id, standard_bill_rate, target_pay_rate')
        .eq('id', placement.rate_card_id)
        .single()

      if (rateCard?.standard_bill_rate) {
        return {
          billRate: Number(rateCard.standard_bill_rate),
          payRate: Number(rateCard.target_pay_rate || 0),
          rateType: 'hourly',
          effectiveDate: workDate.toISOString().split('T')[0],
          source: 'rate_card',
          sourceId: rateCard.id,
        }
      }
    }

    throw new Error(`No rate found for placement ${placementId} on ${workDate}`)
  }

  /**
   * Get overtime rules for a placement based on work location
   */
  async getOvertimeRules(placementId: string): Promise<OvertimeRules> {
    const { data: placement } = await this.adminClient
      .from('placements')
      .select('id, work_state, overtime_eligible')
      .eq('id', placementId)
      .single()

    if (!placement) {
      throw new Error(`Placement ${placementId} not found`)
    }

    if (!placement.overtime_eligible) {
      return {
        overtimeMultiplier: 1,
        doubleTimeMultiplier: 1,
        dailyOvertimeThreshold: null,
        weeklyOvertimeThreshold: 999,
        seventhDayRule: false,
      }
    }

    // State-specific rules
    const workState = placement.work_state?.toUpperCase()

    // California rules
    if (workState === 'CA') {
      return {
        overtimeMultiplier: 1.5,
        doubleTimeMultiplier: 2,
        dailyOvertimeThreshold: 8,
        weeklyOvertimeThreshold: 40,
        seventhDayRule: true,
      }
    }

    // Federal default
    return {
      overtimeMultiplier: 1.5,
      doubleTimeMultiplier: 2,
      dailyOvertimeThreshold: null,
      weeklyOvertimeThreshold: 40,
      seventhDayRule: false,
    }
  }

  /**
   * Calculate amounts for timesheet entries
   */
  calculateTimesheetAmounts(
    entries: Array<{
      regularHours: number
      overtimeHours: number
      doubleTimeHours: number
    }>,
    rateSnapshot: RateSnapshot,
    overtimeRules: OvertimeRules
  ) {
    let totalBillable = 0
    let totalPayable = 0

    for (const entry of entries) {
      const regularAmount = entry.regularHours * rateSnapshot.billRate
      const overtimeAmount = entry.overtimeHours * rateSnapshot.billRate * overtimeRules.overtimeMultiplier
      const doubleTimeAmount = entry.doubleTimeHours * rateSnapshot.billRate * overtimeRules.doubleTimeMultiplier

      totalBillable += regularAmount + overtimeAmount + doubleTimeAmount

      const payRegular = entry.regularHours * rateSnapshot.payRate
      const payOvertime = entry.overtimeHours * rateSnapshot.payRate * overtimeRules.overtimeMultiplier
      const payDoubleTime = entry.doubleTimeHours * rateSnapshot.payRate * overtimeRules.doubleTimeMultiplier

      totalPayable += payRegular + payOvertime + payDoubleTime
    }

    return {
      totalBillable: Math.round(totalBillable * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      margin: Math.round((totalBillable - totalPayable) * 100) / 100,
      marginPercent: totalBillable > 0
        ? Math.round(((totalBillable - totalPayable) / totalBillable) * 10000) / 100
        : 0,
    }
  }
}

export const rateResolver = new RateResolver()
```

### Task 1C: Pay Period Service

**File**: `src/lib/services/pay-period-service.ts`

```typescript
import { getAdminClient } from '@/lib/supabase/admin'
import { addDays, addWeeks, startOfWeek, endOfWeek, format } from 'date-fns'

export type PeriodType = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'

export interface PayPeriodConfig {
  periodType: PeriodType
  weekStartDay: number  // 0 = Sunday, 1 = Monday
  payDayOffset: number  // Days after period end to pay
}

export class PayPeriodService {
  private adminClient = getAdminClient()

  /**
   * Generate pay periods for a year
   */
  async generatePayPeriods(
    orgId: string,
    year: number,
    config: PayPeriodConfig
  ): Promise<void> {
    const periods: Array<{
      org_id: string
      period_number: number
      year: number
      period_start: string
      period_end: string
      pay_date: string
      period_type: PeriodType
      status: string
    }> = []

    let periodNumber = 1
    let currentDate = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)

    switch (config.periodType) {
      case 'weekly':
        // Start from first Monday of year
        currentDate = startOfWeek(currentDate, { weekStartsOn: config.weekStartDay as 0 | 1 })
        while (currentDate < yearEnd) {
          const periodEnd = endOfWeek(currentDate, { weekStartsOn: config.weekStartDay as 0 | 1 })
          const payDate = addDays(periodEnd, config.payDayOffset)

          periods.push({
            org_id: orgId,
            period_number: periodNumber++,
            year,
            period_start: format(currentDate, 'yyyy-MM-dd'),
            period_end: format(periodEnd, 'yyyy-MM-dd'),
            pay_date: format(payDate, 'yyyy-MM-dd'),
            period_type: 'weekly',
            status: 'upcoming',
          })

          currentDate = addWeeks(currentDate, 1)
        }
        break

      case 'bi_weekly':
        currentDate = startOfWeek(currentDate, { weekStartsOn: config.weekStartDay as 0 | 1 })
        while (currentDate < yearEnd) {
          const periodEnd = addDays(currentDate, 13)
          const payDate = addDays(periodEnd, config.payDayOffset)

          periods.push({
            org_id: orgId,
            period_number: periodNumber++,
            year,
            period_start: format(currentDate, 'yyyy-MM-dd'),
            period_end: format(periodEnd, 'yyyy-MM-dd'),
            pay_date: format(payDate, 'yyyy-MM-dd'),
            period_type: 'bi_weekly',
            status: 'upcoming',
          })

          currentDate = addWeeks(currentDate, 2)
        }
        break

      case 'semi_monthly':
        for (let month = 0; month < 12; month++) {
          // First period: 1st - 15th
          periods.push({
            org_id: orgId,
            period_number: periodNumber++,
            year,
            period_start: format(new Date(year, month, 1), 'yyyy-MM-dd'),
            period_end: format(new Date(year, month, 15), 'yyyy-MM-dd'),
            pay_date: format(addDays(new Date(year, month, 15), config.payDayOffset), 'yyyy-MM-dd'),
            period_type: 'semi_monthly',
            status: 'upcoming',
          })

          // Second period: 16th - end of month
          const lastDay = new Date(year, month + 1, 0).getDate()
          periods.push({
            org_id: orgId,
            period_number: periodNumber++,
            year,
            period_start: format(new Date(year, month, 16), 'yyyy-MM-dd'),
            period_end: format(new Date(year, month, lastDay), 'yyyy-MM-dd'),
            pay_date: format(addDays(new Date(year, month, lastDay), config.payDayOffset), 'yyyy-MM-dd'),
            period_type: 'semi_monthly',
            status: 'upcoming',
          })
        }
        break

      case 'monthly':
        for (let month = 0; month < 12; month++) {
          const lastDay = new Date(year, month + 1, 0).getDate()
          periods.push({
            org_id: orgId,
            period_number: periodNumber++,
            year,
            period_start: format(new Date(year, month, 1), 'yyyy-MM-dd'),
            period_end: format(new Date(year, month, lastDay), 'yyyy-MM-dd'),
            pay_date: format(addDays(new Date(year, month, lastDay), config.payDayOffset), 'yyyy-MM-dd'),
            period_type: 'monthly',
            status: 'upcoming',
          })
        }
        break
    }

    // Insert all periods
    const { error } = await this.adminClient
      .from('pay_periods')
      .upsert(periods, {
        onConflict: 'org_id,year,period_number',
        ignoreDuplicates: true
      })

    if (error) {
      throw new Error(`Failed to generate pay periods: ${error.message}`)
    }
  }

  /**
   * Get current pay period
   */
  async getCurrentPeriod(orgId: string): Promise<{
    id: string
    periodNumber: number
    periodStart: string
    periodEnd: string
    payDate: string
  } | null> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data } = await this.adminClient
      .from('pay_periods')
      .select('*')
      .eq('org_id', orgId)
      .lte('period_start', today)
      .gte('period_end', today)
      .single()

    if (!data) return null

    return {
      id: data.id,
      periodNumber: data.period_number,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      payDate: data.pay_date,
    }
  }

  /**
   * Get timesheet submission deadline for a period
   */
  getSubmissionDeadline(periodEnd: string, deadlineHours: number = 48): Date {
    const endDate = new Date(periodEnd)
    endDate.setHours(23, 59, 59)
    return addDays(endDate, Math.floor(deadlineHours / 24))
  }
}

export const payPeriodService = new PayPeriodService()
```

### Success Criteria - Phase 1

#### Automated Verification:
- [x] Migration applies cleanly: `pnpm db:migrate`
- [x] All 23 tables created with correct schema
- [x] All indexes created
- [x] All RLS policies enabled
- [x] TypeScript compiles: `pnpm tsc --noEmit`

#### Manual Verification:
- [ ] Tables visible in Supabase Studio
- [ ] Sample data can be inserted
- [ ] RLS policies block cross-org access

**Implementation Note**: Phase 1 tasks can be executed in parallel. After completion, pause for manual verification before proceeding to Phase 2.

---

## Phase 2: TIMESHEETS-01 (Weeks 2-3)

### Overview
Build the complete timesheet system. This phase MUST complete before Phase 3 because invoices and payroll depend on approved timesheets.

### Task 2A: tRPC Router

**File**: `src/server/routers/timesheets.ts`

Create a new router following patterns from `src/server/routers/contracts.ts:214-1796`:

**Procedures to implement**:

| Procedure | Type | Input | Returns |
|-----------|------|-------|---------|
| `list` | query | filters + pagination | `{ items, total }` |
| `getById` | query | `{ id }` | Single timesheet with entries |
| `create` | mutation | timesheet + entries | `{ id }` |
| `update` | mutation | `{ id, ...fields }` | `{ success }` |
| `delete` | mutation | `{ id }` (soft) | `{ success }` |
| `submit` | mutation | `{ id }` | `{ success }` |
| `approve` | mutation | `{ id, notes }` | `{ success }` |
| `reject` | mutation | `{ id, reason }` | `{ success }` |
| `stats` | query | optional filters | Stats object |
| `getByPlacement` | query | `{ placementId }` | Timesheets for placement |
| `getUninvoiced` | query | filters | Approved, uninvoiced timesheets |
| `getUnpaid` | query | filters | Approved, unpaid timesheets |

**Nested routers**:
- `timesheets.entries.*` - Entry CRUD
- `timesheets.expenses.*` - Expense CRUD
- `timesheets.approvals.*` - Approval workflow
- `timesheets.adjustments.*` - Post-approval corrections

### Task 2B: PCF Entity Config

**File**: `src/configs/entities/timesheets.config.ts`

Follow patterns from `src/configs/entities/campaigns.config.ts:178-191`:

```typescript
export const timesheetsListConfig: ListViewConfig<Timesheet> = {
  entityType: 'timesheet',
  entityName: { singular: 'Timesheet', plural: 'Timesheets' },
  baseRoute: '/employee/recruiting/timesheets',

  title: 'Timesheets',
  description: 'Manage consultant timesheets and approvals',
  icon: Calendar,

  primaryAction: {
    label: 'New Timesheet',
    icon: Plus,
    href: '/employee/recruiting/timesheets/new',
  },

  statsCards: [
    { key: 'total', label: 'Total', icon: Calendar },
    { key: 'pending', label: 'Pending Approval', color: 'bg-amber-100 text-amber-800' },
    { key: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { key: 'totalHours', label: 'Total Hours', format: (v) => `${v}h` },
  ],

  filters: [
    { key: 'search', type: 'search', placeholder: 'Search...' },
    { key: 'status', type: 'select', options: TIMESHEET_STATUS_OPTIONS },
    { key: 'placementId', type: 'select', dynamic: true },
    { key: 'periodStart', type: 'date-range' },
  ],

  columns: [
    { key: 'consultant', header: 'Consultant', sortable: true },
    { key: 'periodEnd', header: 'Week Ending', sortable: true, format: 'date' },
    { key: 'totalRegularHours', header: 'Regular', align: 'right' },
    { key: 'totalOvertimeHours', header: 'OT', align: 'right' },
    { key: 'totalBillableAmount', header: 'Billable', format: 'currency' },
    { key: 'status', header: 'Status', format: 'status' },
    { key: 'submittedAt', header: 'Submitted', format: 'relative-date' },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: TIMESHEET_STATUS_CONFIG,
  pageSize: 50,

  useListQuery: (filters) => trpc.timesheets.list.useQuery({...}),
  useStatsQuery: () => trpc.timesheets.stats.useQuery(),
}
```

### Task 2C: Zustand Store

**File**: `src/stores/timesheet-entry-store.ts`

Follow patterns from `src/stores/extend-offer-store.ts:41-59`:

```typescript
export interface TimesheetEntryFormData {
  // Context
  placementId: string
  consultantName: string
  periodStart: string
  periodEnd: string

  // Entries (7 days)
  entries: Array<{
    date: string
    regularHours: number
    overtimeHours: number
    description: string
  }>

  // Rates (snapshot)
  billRate: number
  payRate: number

  // Expenses
  expenses: Array<{
    date: string
    category: string
    amount: number
    description: string
    receiptUrl?: string
  }>

  // Submission
  notes: string
}

export const useTimesheetEntryStore = create<TimesheetEntryStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        isDirty: true,
        lastSaved: new Date(),
      })),

      initializeFromPlacement: (placement) => set((state) => ({
        formData: {
          ...state.formData,
          placementId: placement.id,
          consultantName: placement.consultantName,
          billRate: placement.billRate,
          payRate: placement.payRate,
        },
      })),

      resetForm: () => set({
        formData: defaultFormData,
        currentStep: 1,
        isDirty: false,
        lastSaved: null,
      }),
    }),
    {
      name: 'timesheet-entry-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)
```

### Task 2D: UI Components

**Files to create**:

1. **List Page**: `src/app/employee/recruiting/timesheets/page.tsx`
   - Uses `EntityListView<Timesheet> config={timesheetsListConfig}`

2. **Detail Page**: `src/app/employee/recruiting/timesheets/[id]/page.tsx`
   - Uses `EntityDetailView<Timesheet> config={timesheetsDetailConfig}`

3. **Create Wizard**: `src/app/employee/recruiting/timesheets/new/page.tsx`
   - Multi-step: Select Placement → Enter Hours → Add Expenses → Review → Submit

4. **Section Components**: `src/configs/entities/sections/timesheets.sections.tsx`
   - `TimesheetOverviewSectionPCF`
   - `TimesheetEntriesSectionPCF`
   - `TimesheetExpensesSectionPCF`
   - `TimesheetApprovalsSectionPCF`

5. **Update Placement Section**: Replace placeholder in `PlacementTimesheetsSectionPCF`

### Task 2E: Navigation Updates

**Files to modify**:

1. `src/lib/navigation/top-navigation.ts` - Add Timesheets to Pipeline tab
2. `src/lib/navigation/entity-sections.ts` - Add timesheet sections
3. `src/server/trpc/root.ts` - Add timesheets router

### Success Criteria - Phase 2

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Unit tests pass (if added)

#### Manual Verification:
- [ ] Can create timesheet from placement
- [ ] Daily hours entry works
- [ ] Expense entry works
- [ ] Submit workflow works
- [ ] Approval workflow works
- [ ] Rejected timesheets can be edited
- [ ] Rate snapshot captured at submission
- [ ] Hours validation (max 24/day, max expected/week)

**Implementation Note**: Phase 2 is BLOCKING. Must complete and verify manually before starting Phase 3. Phase 3 depends on approved timesheets existing.

---

## Phase 3: INVOICES-01 & PAYROLL-01 (Weeks 4-6)

### Overview
Invoices and Payroll can be developed in **PARALLEL** because they both consume approved timesheets independently.

### Task 3A: Invoices tRPC Router

**File**: `src/server/routers/invoices.ts`

**Procedures**:

| Procedure | Type | Purpose |
|-----------|------|---------|
| `list` | query | List invoices with AR aging |
| `getById` | query | Single invoice with line items |
| `create` | mutation | Create invoice manually |
| `generateFromTimesheets` | mutation | Auto-generate from approved timesheets |
| `update` | mutation | Update draft invoice |
| `send` | mutation | Send invoice to client |
| `recordPayment` | mutation | Record payment |
| `void` | mutation | Void invoice |
| `stats` | query | AR aging, totals |

**Nested routers**:
- `invoices.lineItems.*`
- `invoices.payments.*`
- `invoices.batches.*`

### Task 3B: Invoices PCF Config

**File**: `src/configs/entities/invoices.config.ts`

```typescript
export const invoicesListConfig: ListViewConfig<Invoice> = {
  entityType: 'invoice',
  entityName: { singular: 'Invoice', plural: 'Invoices' },
  baseRoute: '/employee/finance/invoices',

  title: 'Invoices',
  description: 'Manage client invoices and accounts receivable',
  icon: FileText,

  primaryAction: {
    label: 'New Invoice',
    icon: Plus,
    href: '/employee/finance/invoices/new',
  },

  statsCards: [
    { key: 'total', label: 'Total Invoices', icon: FileText },
    { key: 'outstanding', label: 'Outstanding', color: 'bg-amber-100 text-amber-800', format: 'currency' },
    { key: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800', format: 'currency' },
    { key: 'collected', label: 'Collected MTD', color: 'bg-green-100 text-green-800', format: 'currency' },
  ],

  columns: [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true },
    { key: 'company', header: 'Client', sortable: true },
    { key: 'invoiceDate', header: 'Date', format: 'date' },
    { key: 'dueDate', header: 'Due', format: 'date' },
    { key: 'totalAmount', header: 'Amount', format: 'currency', align: 'right' },
    { key: 'balanceDue', header: 'Balance', format: 'currency', align: 'right' },
    { key: 'status', header: 'Status', format: 'status' },
    { key: 'agingBucket', header: 'Aging' },
  ],

  renderMode: 'table',
  statusConfig: INVOICE_STATUS_CONFIG,
}
```

### Task 3C: Invoices Store

**File**: `src/stores/invoice-create-store.ts`

4-step wizard:
1. Select Client & Period
2. Select Timesheets
3. Configure Line Items
4. Review & Send

### Task 3D: Payroll tRPC Router

**File**: `src/server/routers/payroll.ts`

**Procedures**:

| Procedure | Type | Purpose |
|-----------|------|---------|
| `payPeriods.list` | query | List pay periods |
| `payPeriods.generate` | mutation | Generate periods for year |
| `payRuns.list` | query | List pay runs |
| `payRuns.create` | mutation | Create new pay run |
| `payRuns.calculate` | mutation | Calculate pay for all workers |
| `payRuns.approve` | mutation | Approve pay run |
| `payRuns.process` | mutation | Process payments |
| `payItems.list` | query | List items in a run |
| `payItems.update` | mutation | Adjust individual pay |
| `taxSetup.get` | query | Get worker tax setup |
| `taxSetup.update` | mutation | Update tax setup |
| `stats` | query | Payroll metrics |

### Task 3E: Payroll PCF Config

**File**: `src/configs/entities/payroll.config.ts`

```typescript
export const payRunsListConfig: ListViewConfig<PayRun> = {
  entityType: 'pay_run',
  entityName: { singular: 'Pay Run', plural: 'Payroll' },
  baseRoute: '/employee/hr/payroll',

  title: 'Payroll',
  description: 'Manage consultant and employee payroll',
  icon: DollarSign,

  primaryAction: {
    label: 'New Pay Run',
    icon: Plus,
    href: '/employee/hr/payroll/new',
  },

  statsCards: [
    { key: 'thisMonth', label: 'This Month', format: 'currency' },
    { key: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
    { key: 'workerCount', label: 'Workers' },
    { key: 'avgPayment', label: 'Avg Payment', format: 'currency' },
  ],

  columns: [
    { key: 'runNumber', header: 'Run #', sortable: true },
    { key: 'payPeriod', header: 'Period' },
    { key: 'checkDate', header: 'Check Date', format: 'date' },
    { key: 'workerCount', header: 'Workers', align: 'center' },
    { key: 'totalGross', header: 'Gross', format: 'currency', align: 'right' },
    { key: 'totalNet', header: 'Net', format: 'currency', align: 'right' },
    { key: 'status', header: 'Status', format: 'status' },
  ],

  renderMode: 'table',
  statusConfig: PAY_RUN_STATUS_CONFIG,
}
```

### Task 3F: Payroll Store

**File**: `src/stores/pay-run-process-store.ts`

5-step wizard:
1. Select Pay Period
2. Include/Exclude Workers
3. Review Timesheets
4. Calculate Payments
5. Final Approval

### Task 3G: UI Components

**Invoices**:
- `src/app/employee/finance/invoices/page.tsx`
- `src/app/employee/finance/invoices/[id]/page.tsx`
- `src/app/employee/finance/invoices/new/page.tsx`
- `src/configs/entities/sections/invoices.sections.tsx`

**Payroll**:
- `src/app/employee/hr/payroll/page.tsx`
- `src/app/employee/hr/payroll/[id]/page.tsx`
- `src/app/employee/hr/payroll/new/page.tsx`
- `src/configs/entities/sections/payroll.sections.tsx`

### Success Criteria - Phase 3

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`

#### Manual Verification (Invoices):
- [ ] Generate invoice from approved timesheets
- [ ] Manual invoice creation works
- [ ] Line items show correct amounts
- [ ] Send invoice (email)
- [ ] Record payment works
- [ ] AR aging updates correctly
- [ ] Invoice PDF preview

#### Manual Verification (Payroll):
- [ ] Generate pay periods for year
- [ ] Create pay run from period
- [ ] Calculate worker payments from timesheets
- [ ] W2 vs 1099 processing works
- [ ] Deductions apply correctly
- [ ] Approve and process workflow
- [ ] Pay stub preview

**Implementation Note**: Invoices and Payroll can be developed in parallel by separate developers. Both depend on Phase 2 (Timesheets) being complete.

---

## Phase 4: Integration & Polish (Week 7)

### Overview
Connect all three systems with automation and end-to-end testing.

### Task 4A: Timesheet → Invoice Automation

**File**: `src/lib/services/timesheet-invoicer.ts`

```typescript
export class TimesheetInvoicer {
  /**
   * Generate invoices from approved timesheets
   */
  async generateInvoices(
    orgId: string,
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    options: {
      accountIds?: string[]
      excludeAccountIds?: string[]
      dryRun?: boolean
    } = {}
  ): Promise<GeneratedInvoice[]> {
    // 1. Get approved, uninvoiced timesheets for period
    // 2. Group by billing company
    // 3. For each company:
    //    - Create invoice header
    //    - Create line items from timesheets
    //    - Handle rate changes (multiple line items)
    //    - Link timesheets to invoice
    // 4. Return generated invoices
  }
}
```

### Task 4B: Timesheet → Payroll Automation

**File**: `src/lib/services/timesheet-payroll.ts`

```typescript
export class TimesheetPayroll {
  /**
   * Generate pay items from approved timesheets
   */
  async generatePayItems(
    payRunId: string,
    options: {
      includeWorkers?: string[]
      excludeWorkers?: string[]
    } = {}
  ): Promise<GeneratedPayItem[]> {
    // 1. Get approved, unpaid timesheets for period
    // 2. Group by worker
    // 3. For each worker:
    //    - Calculate gross pay
    //    - Calculate taxes (W2) or skip (1099)
    //    - Calculate deductions
    //    - Create pay item
    //    - Link timesheets to pay run
    // 4. Return generated pay items
  }
}
```

### Task 4C: Dashboard Widgets

Add revenue operations widgets to dashboard:

- **Timesheets Widget**: Pending approval count, hours this week
- **Invoices Widget**: Outstanding balance, overdue count
- **Payroll Widget**: Next pay date, pending amount

### Task 4D: End-to-End Testing

Test complete flow:

1. Create placement with rates
2. Submit weekly timesheet
3. Approve timesheet
4. Generate invoice from timesheet
5. Record payment
6. Generate payroll
7. Process payment
8. Verify audit trail

### Success Criteria - Phase 4

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] Full build succeeds: `pnpm build`
- [ ] All existing tests pass

#### Manual Verification:
- [ ] Complete flow works end-to-end
- [ ] Timesheets link to invoices
- [ ] Timesheets link to payroll
- [ ] Dashboard widgets show correct data
- [ ] No data loss in flow
- [ ] Audit trail complete
- [ ] Performance acceptable (<100ms list queries)

---

## Testing Strategy

### Unit Tests

**Files to create**:
- `src/lib/services/__tests__/rate-resolver.test.ts`
- `src/lib/services/__tests__/pay-period-service.test.ts`
- `src/lib/services/__tests__/timesheet-invoicer.test.ts`
- `src/lib/services/__tests__/timesheet-payroll.test.ts`

**Key test cases**:
- Rate resolution with date ranges
- Overtime calculation per state
- Pay period generation
- Invoice generation from timesheets
- Payroll calculation with deductions

### Integration Tests

**Test scenarios**:
1. Timesheet CRUD operations
2. Approval workflow state machine
3. Invoice generation from multiple timesheets
4. Payroll processing with taxes
5. Multi-tenant isolation

### Manual Testing Steps

1. **Timesheet Entry**:
   - Create timesheet for active placement
   - Enter hours for each day
   - Add overtime hours
   - Add expenses
   - Submit for approval

2. **Approval Workflow**:
   - Login as manager
   - Review submitted timesheet
   - Approve or reject with notes
   - Verify status updates

3. **Invoice Generation**:
   - Select billing period
   - Select approved timesheets
   - Preview invoice
   - Send to client
   - Record payment

4. **Payroll Processing**:
   - Select pay period
   - Review included workers
   - Calculate payments
   - Approve pay run
   - Process payments

---

## Performance Considerations

### Indexing Strategy

Already covered in Phase 1 migrations. Key indexes:
- `idx_timesheets_placement` - Fast placement lookup
- `idx_timesheets_status` - Status filtering
- `idx_invoices_due_date` - AR aging queries
- `idx_pay_items_worker` - Worker payroll lookup

### Query Optimization

1. **List queries**: Use pagination (limit 50), selective columns
2. **Stats queries**: Pre-aggregate where possible
3. **Detail queries**: Eager load relations with single query

### Caching Strategy

1. **Rate snapshots**: Capture at submission, never recalculate
2. **Pay period dates**: Cache after generation
3. **Tax tables**: Cache yearly, invalidate on Jan 1

---

## Migration Notes

### Data Migration (if existing data)

The current `placement_timesheets` table has minimal data (if any). Migration approach:

1. Keep existing table as `legacy_placement_timesheets`
2. Create new `timesheets` table
3. Migrate any existing data with default values
4. Drop legacy table after validation

### Rollback Plan

Each phase has independent rollback:

**Phase 1 Rollback**:
```sql
DROP TABLE IF EXISTS tax_documents CASCADE;
DROP TABLE IF EXISTS pay_stubs CASCADE;
-- ... (reverse order of creation)
```

**Phase 2-4 Rollback**:
- Remove router from root.ts
- Delete config files
- Delete store files
- Delete page files

---

## References

- Research: `thoughts/shared/research/2025-12-12-wave5-revenue-operations-comprehensive-analysis.md`
- Master Guide: `thoughts/shared/issues/00-MASTER-IMPLEMENTATION-GUIDE.md`
- Router Patterns: `src/server/routers/contracts.ts`
- Config Patterns: `src/configs/entities/campaigns.config.ts`
- Store Patterns: `src/stores/create-campaign-store.ts`
- Migration Patterns: `supabase/migrations/20251212100000_create_compliance_system.sql`

---

## Parallel Execution Summary

| Phase | Duration | Parallelism | Blocking? |
|-------|----------|-------------|-----------|
| Phase 1 | Week 1 | ALL PARALLEL (3 tasks) | No |
| Phase 2 | Weeks 2-3 | SEQUENTIAL | YES - blocks Phase 3 |
| Phase 3 | Weeks 4-6 | PARALLEL (Invoices + Payroll) | No |
| Phase 4 | Week 7 | SEQUENTIAL | No |

**Team Allocation Suggestion**:
- Developer A: Phase 1 (migrations) → Phase 2 (timesheets) → Phase 4 (integration)
- Developer B: Phase 1 (services) → Phase 3 (invoices)
- Developer C: Phase 1 (assist) → Phase 3 (payroll)
