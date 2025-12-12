-- ============================================
-- WAVE 5: Revenue Operations
-- Enterprise Time → Invoice → Payment Pipeline
--
-- Tables: 23 new tables
-- - Timesheets: 7 tables
-- - Invoices: 6 tables
-- - Payroll: 10 tables
-- ============================================

-- ====================
-- SECTION 1: ENUMS
-- ====================

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

-- ====================
-- SECTION 2: TIMESHEET TABLES (7)
-- ====================

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

  -- Calculated amounts (computed on insert/update via trigger)
  billable_amount DECIMAL(10,2) DEFAULT 0,
  payable_amount DECIMAL(10,2) DEFAULT 0,

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

-- ====================
-- SECTION 3: INVOICE TABLES (6)
-- ====================

-- 1. Core invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  invoice_number TEXT NOT NULL,
  reference_number TEXT,

  -- Parties (companies - unified from legacy accounts)
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
  balance_due DECIMAL(12,2) DEFAULT 0,

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

  -- Amounts (subtotal computed on insert/update)
  subtotal DECIMAL(12,2) DEFAULT 0,
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

-- ====================
-- SECTION 4: PAYROLL TABLES (10)
-- ====================

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

-- 2. Pay runs (enhanced from basic payroll_runs)
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
  deleted_at TIMESTAMPTZ,

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
  total_hours DECIMAL(6,2) DEFAULT 0,

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

-- ====================
-- SECTION 5: INDEXES
-- ====================

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
CREATE INDEX IF NOT EXISTS idx_timesheet_adjustments_org ON timesheet_adjustments(org_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_approval_workflows_org ON timesheet_approval_workflows(org_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_timesheet_templates_org ON timesheet_templates(org_id) WHERE is_active = true;

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status NOT IN ('paid', 'void') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON invoices(due_date, balance_due) WHERE status = 'overdue' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_timesheet ON invoice_line_items(timesheet_id) WHERE timesheet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_org ON invoice_payments(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_terms_org ON payment_terms(org_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_invoice_batches_org ON invoice_batches(org_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_org ON invoice_templates(org_id) WHERE is_active = true;

-- Payroll indexes
CREATE INDEX IF NOT EXISTS idx_pay_periods_org ON pay_periods(org_id, year, period_number);
CREATE INDEX IF NOT EXISTS idx_pay_periods_dates ON pay_periods(org_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_pay_runs_org ON pay_runs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pay_runs_period ON pay_runs(pay_period_id);
CREATE INDEX IF NOT EXISTS idx_pay_runs_status ON pay_runs(status, org_id);

CREATE INDEX IF NOT EXISTS idx_pay_items_run ON pay_items(pay_run_id);
CREATE INDEX IF NOT EXISTS idx_pay_items_worker ON pay_items(worker_id, worker_type);
CREATE INDEX IF NOT EXISTS idx_pay_items_contact ON pay_items(contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pay_item_earnings_item ON pay_item_earnings(pay_item_id);
CREATE INDEX IF NOT EXISTS idx_pay_item_deductions_item ON pay_item_deductions(pay_item_id);

CREATE INDEX IF NOT EXISTS idx_worker_tax_setup_org ON worker_tax_setup(org_id);
CREATE INDEX IF NOT EXISTS idx_worker_tax_setup_contact ON worker_tax_setup(contact_id);
CREATE INDEX IF NOT EXISTS idx_worker_benefits_org ON worker_benefits(org_id);
CREATE INDEX IF NOT EXISTS idx_worker_benefits_contact ON worker_benefits(contact_id);
CREATE INDEX IF NOT EXISTS idx_worker_garnishments_org ON worker_garnishments(org_id);
CREATE INDEX IF NOT EXISTS idx_worker_garnishments_contact ON worker_garnishments(contact_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pay_stubs_item ON pay_stubs(pay_item_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_token ON pay_stubs(access_token) WHERE access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tax_documents_org ON tax_documents(org_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_worker ON tax_documents(worker_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_year ON tax_documents(tax_year, document_type) WHERE filed_with_irs = false;

-- ====================
-- SECTION 6: RLS POLICIES
-- ====================

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

-- ====================
-- SECTION 7: ENTITY TYPE REGISTRY
-- ====================

INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES
  ('timesheet_entry', 'timesheet_entries', NULL, 'Timesheet Entry', NULL),
  ('payment', 'invoice_payments', NULL, 'Payment', NULL),
  ('pay_run', 'pay_runs', 'run_number', 'Pay Run', '/employee/hr/payroll/{id}'),
  ('pay_item', 'pay_items', NULL, 'Pay Item', NULL),
  ('expense', 'timesheet_expenses', NULL, 'Expense', NULL)
ON CONFLICT (entity_type) DO UPDATE SET
  table_name = EXCLUDED.table_name,
  display_name = EXCLUDED.display_name,
  url_pattern = EXCLUDED.url_pattern;

-- Update existing timesheet and invoice entries if they exist
UPDATE entity_type_registry SET
  url_pattern = '/employee/recruiting/timesheets/{id}'
WHERE entity_type = 'timesheet';

UPDATE entity_type_registry SET
  url_pattern = '/employee/finance/invoices/{id}'
WHERE entity_type = 'invoice';

-- ====================
-- SECTION 8: TRIGGERS
-- ====================

-- Trigger to calculate timesheet entry amounts
CREATE OR REPLACE FUNCTION calculate_timesheet_entry_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate billable amount (regular + OT*1.5 + DT*2) * bill_rate
  NEW.billable_amount := (
    COALESCE(NEW.regular_hours, 0) +
    COALESCE(NEW.overtime_hours, 0) * 1.5 +
    COALESCE(NEW.double_time_hours, 0) * 2
  ) * COALESCE(NEW.bill_rate, 0);

  -- Calculate payable amount (regular + OT*1.5 + DT*2) * pay_rate
  NEW.payable_amount := (
    COALESCE(NEW.regular_hours, 0) +
    COALESCE(NEW.overtime_hours, 0) * 1.5 +
    COALESCE(NEW.double_time_hours, 0) * 2
  ) * COALESCE(NEW.pay_rate, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_timesheet_entry_amounts ON timesheet_entries;
CREATE TRIGGER trg_calculate_timesheet_entry_amounts
  BEFORE INSERT OR UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_timesheet_entry_amounts();

-- Trigger to update timesheet totals when entries change
CREATE OR REPLACE FUNCTION update_timesheet_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_timesheet_id UUID;
BEGIN
  -- Get the timesheet_id (works for INSERT, UPDATE, DELETE)
  v_timesheet_id := COALESCE(NEW.timesheet_id, OLD.timesheet_id);

  -- Update totals
  UPDATE timesheets SET
    total_regular_hours = (SELECT COALESCE(SUM(regular_hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_overtime_hours = (SELECT COALESCE(SUM(overtime_hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_double_time_hours = (SELECT COALESCE(SUM(double_time_hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_pto_hours = (SELECT COALESCE(SUM(pto_hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_holiday_hours = (SELECT COALESCE(SUM(holiday_hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_billable_amount = (SELECT COALESCE(SUM(billable_amount), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    total_payable_amount = (SELECT COALESCE(SUM(payable_amount), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id),
    updated_at = now()
  WHERE id = v_timesheet_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timesheet_totals ON timesheet_entries;
CREATE TRIGGER trg_update_timesheet_totals
  AFTER INSERT OR UPDATE OR DELETE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_timesheet_totals();

-- Trigger to update pay_items total_hours
CREATE OR REPLACE FUNCTION calculate_pay_item_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_hours := COALESCE(NEW.regular_hours, 0) +
                     COALESCE(NEW.overtime_hours, 0) +
                     COALESCE(NEW.double_time_hours, 0) +
                     COALESCE(NEW.pto_hours, 0) +
                     COALESCE(NEW.holiday_hours, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_pay_item_total_hours ON pay_items;
CREATE TRIGGER trg_calculate_pay_item_total_hours
  BEFORE INSERT OR UPDATE ON pay_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_pay_item_total_hours();

-- Trigger to calculate invoice line item subtotal
CREATE OR REPLACE FUNCTION calculate_invoice_line_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal := COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_rate, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_invoice_line_item_subtotal ON invoice_line_items;
CREATE TRIGGER trg_calculate_invoice_line_item_subtotal
  BEFORE INSERT OR UPDATE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_line_item_subtotal();

-- Trigger to update invoice balance_due
CREATE OR REPLACE FUNCTION calculate_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.balance_due := COALESCE(NEW.total_amount, 0) - COALESCE(NEW.amount_paid, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_invoice_balance ON invoices;
CREATE TRIGGER trg_calculate_invoice_balance
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_balance();

-- Trigger to update invoice amount_paid when payments change
CREATE OR REPLACE FUNCTION update_invoice_amount_paid()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id UUID;
  v_total_paid DECIMAL(12,2);
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM invoice_payments
  WHERE invoice_id = v_invoice_id;

  UPDATE invoices SET
    amount_paid = v_total_paid,
    status = CASE
      WHEN v_total_paid >= total_amount THEN 'paid'::invoice_status
      WHEN v_total_paid > 0 THEN 'partially_paid'::invoice_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = v_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_amount_paid ON invoice_payments;
CREATE TRIGGER trg_update_invoice_amount_paid
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_amount_paid();

-- ====================
-- SECTION 9: COMMENTS
-- ====================

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

-- ====================
-- END OF MIGRATION
-- ====================
