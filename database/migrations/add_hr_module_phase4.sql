-- =============================================================================
-- HR Module Phase 4: Expenses & Analytics
-- Expense Management System, HR Analytics Materialized Views
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE expense_report_status AS ENUM (
    'draft', 'submitted', 'pending_approval', 'approved',
    'rejected', 'processing', 'paid', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'travel', 'meals', 'lodging', 'transportation', 'office_supplies',
    'software', 'equipment', 'training', 'professional_services',
    'client_entertainment', 'phone_internet', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_item_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- EXPENSE POLICIES
-- Organization expense rules and limits
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expense_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Limits per category (JSONB: { "meals": 75, "lodging": 200, ... })
  category_daily_limits JSONB DEFAULT '{}',
  category_per_item_limits JSONB DEFAULT '{}',

  -- Global settings
  auto_approval_limit NUMERIC(10,2) DEFAULT 0,
  receipt_required_above NUMERIC(10,2) DEFAULT 25,
  max_days_to_submit INTEGER DEFAULT 60,

  -- Multi-level approval thresholds
  approval_levels JSONB DEFAULT '[]',
  -- Example: [{"threshold": 500, "approver_role": "manager"}, {"threshold": 5000, "approver_role": "director"}]

  -- Mileage rates
  mileage_rate_per_mile NUMERIC(5,3) DEFAULT 0.67,

  -- Per diem rates (JSONB by location)
  per_diem_rates JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS expense_policies_org_id_idx
  ON public.expense_policies(org_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.expense_policies IS 'Organization expense rules, limits, and approval thresholds';

-- -----------------------------------------------------------------------------
-- EXPENSE REPORTS
-- Header records for expense submissions
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  report_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES expense_policies(id) ON DELETE SET NULL,

  -- Report period
  period_start DATE,
  period_end DATE,

  -- Totals
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  approved_amount NUMERIC(12,2),
  rejected_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',

  -- Status tracking
  status expense_report_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Approval chain
  current_approver_id UUID REFERENCES user_profiles(id),
  current_approval_level INTEGER DEFAULT 0,

  -- Payment info
  payment_method TEXT,
  payment_reference TEXT,

  -- Business purpose
  business_purpose TEXT,
  project_code TEXT,
  cost_center_code TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS expense_reports_org_id_idx
  ON public.expense_reports(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS expense_reports_employee_id_idx
  ON public.expense_reports(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS expense_reports_status_idx
  ON public.expense_reports(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS expense_reports_report_number_idx
  ON public.expense_reports(org_id, report_number) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.expense_reports IS 'Header records for expense submissions';

-- Sequence for report numbers
CREATE SEQUENCE IF NOT EXISTS expense_report_number_seq START 1000;

-- -----------------------------------------------------------------------------
-- EXPENSE ITEMS
-- Individual expense line items
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,

  expense_date DATE NOT NULL,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  vendor_name TEXT,

  -- Amounts
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,6),
  amount_in_reporting_currency NUMERIC(10,2),

  -- Receipt
  receipt_url TEXT,
  receipt_verified BOOLEAN DEFAULT false,
  receipt_required BOOLEAN DEFAULT true,

  -- For mileage
  is_mileage BOOLEAN DEFAULT false,
  miles NUMERIC(8,2),
  mileage_rate NUMERIC(5,3),
  origin_location TEXT,
  destination_location TEXT,

  -- Per diem
  is_per_diem BOOLEAN DEFAULT false,
  per_diem_days NUMERIC(4,2),
  per_diem_rate NUMERIC(10,2),

  -- Status
  status expense_item_status DEFAULT 'pending',
  rejection_reason TEXT,

  -- Flags
  is_personal BOOLEAN DEFAULT false,
  is_reimbursable BOOLEAN DEFAULT true,
  tax_deductible BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expense_items_report_id_idx
  ON public.expense_items(expense_report_id);
CREATE INDEX IF NOT EXISTS expense_items_category_idx
  ON public.expense_items(expense_report_id, category);
CREATE INDEX IF NOT EXISTS expense_items_date_idx
  ON public.expense_items(expense_date);

COMMENT ON TABLE public.expense_items IS 'Individual expense line items within a report';

-- -----------------------------------------------------------------------------
-- EXPENSE APPROVALS
-- Multi-level approval tracking
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,

  approval_level INTEGER NOT NULL,
  approver_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  status approval_status NOT NULL DEFAULT 'pending',
  decision_at TIMESTAMPTZ,
  comments TEXT,

  -- Delegation
  delegated_from_id UUID REFERENCES user_profiles(id),
  delegated_at TIMESTAMPTZ,
  delegation_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expense_approvals_report_id_idx
  ON public.expense_approvals(expense_report_id);
CREATE INDEX IF NOT EXISTS expense_approvals_approver_id_idx
  ON public.expense_approvals(approver_id) WHERE status = 'pending';

COMMENT ON TABLE public.expense_approvals IS 'Multi-level approval tracking for expense reports';

-- -----------------------------------------------------------------------------
-- EXPENSE AUDIT LOG
-- Track all changes to expense reports
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expense_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,

  action TEXT NOT NULL, -- created, updated, submitted, approved, rejected, paid
  previous_status expense_report_status,
  new_status expense_report_status,
  changes JSONB,
  notes TEXT,

  performed_by UUID REFERENCES user_profiles(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expense_audit_log_report_id_idx
  ON public.expense_audit_log(expense_report_id);

COMMENT ON TABLE public.expense_audit_log IS 'Audit trail for expense report changes';

-- -----------------------------------------------------------------------------
-- HR ANALYTICS: HEADCOUNT MATERIALIZED VIEW
-- Daily headcount snapshot by department
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS hr_headcount_by_dept AS
SELECT
  e.org_id,
  COALESCE(e.department, 'Unassigned') as department,
  e.department_id,
  DATE_TRUNC('month', e.hire_date) as hire_month,
  e.employment_type,
  e.status,
  COUNT(*) as headcount,
  COUNT(*) FILTER (WHERE e.hire_date >= CURRENT_DATE - INTERVAL '30 days') as new_hires_30d,
  COUNT(*) FILTER (WHERE e.hire_date >= CURRENT_DATE - INTERVAL '90 days') as new_hires_90d,
  COUNT(*) FILTER (WHERE e.termination_date >= CURRENT_DATE - INTERVAL '30 days') as terminations_30d,
  AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date))) as avg_tenure_years
FROM employees e
WHERE e.deleted_at IS NULL
GROUP BY e.org_id, e.department, e.department_id, DATE_TRUNC('month', e.hire_date), e.employment_type, e.status;

CREATE UNIQUE INDEX IF NOT EXISTS hr_headcount_by_dept_idx
  ON hr_headcount_by_dept(org_id, department, department_id, hire_month, employment_type, status);

-- -----------------------------------------------------------------------------
-- HR ANALYTICS: TURNOVER METRICS MATERIALIZED VIEW
-- Monthly turnover calculations
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS hr_turnover_metrics AS
WITH monthly_data AS (
  SELECT
    e.org_id,
    COALESCE(e.department, 'Unassigned') as department,
    e.department_id,
    DATE_TRUNC('month', d.date) as month,
    COUNT(DISTINCT e.id) FILTER (WHERE e.hire_date <= d.date AND (e.termination_date IS NULL OR e.termination_date > d.date)) as active_count,
    COUNT(DISTINCT e.id) FILTER (WHERE e.hire_date BETWEEN DATE_TRUNC('month', d.date) AND d.date) as hires,
    COUNT(DISTINCT e.id) FILTER (WHERE e.termination_date BETWEEN DATE_TRUNC('month', d.date) AND d.date) as terminations,
    COUNT(DISTINCT e.id) FILTER (WHERE e.termination_date BETWEEN DATE_TRUNC('month', d.date) AND d.date AND e.termination_reason = 'voluntary') as voluntary_terminations,
    COUNT(DISTINCT e.id) FILTER (WHERE e.termination_date BETWEEN DATE_TRUNC('month', d.date) AND d.date AND e.termination_reason != 'voluntary') as involuntary_terminations
  FROM employees e
  CROSS JOIN (
    SELECT generate_series(
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '24 months'),
      DATE_TRUNC('month', CURRENT_DATE),
      INTERVAL '1 month'
    )::date as date
  ) d
  WHERE e.deleted_at IS NULL
  GROUP BY e.org_id, e.department, e.department_id, DATE_TRUNC('month', d.date)
)
SELECT
  org_id,
  department,
  department_id,
  month,
  active_count,
  hires,
  terminations,
  voluntary_terminations,
  involuntary_terminations,
  CASE WHEN active_count > 0
    THEN ROUND((terminations::NUMERIC / active_count) * 100, 2)
    ELSE 0
  END as turnover_rate,
  CASE WHEN active_count > 0
    THEN ROUND((voluntary_terminations::NUMERIC / active_count) * 100, 2)
    ELSE 0
  END as voluntary_turnover_rate
FROM monthly_data;

CREATE UNIQUE INDEX IF NOT EXISTS hr_turnover_metrics_idx
  ON hr_turnover_metrics(org_id, department, department_id, month);

-- -----------------------------------------------------------------------------
-- HR ANALYTICS: TENURE DISTRIBUTION MATERIALIZED VIEW
-- Employee tenure buckets
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS hr_tenure_distribution AS
SELECT
  e.org_id,
  COALESCE(e.department, 'Unassigned') as department,
  e.department_id,
  CASE
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '3 months' THEN '0-3 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '6 months' THEN '3-6 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '1 year' THEN '6-12 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '2 years' THEN '1-2 years'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '5 years' THEN '2-5 years'
    ELSE '5+ years'
  END as tenure_bucket,
  COUNT(*) as employee_count,
  AVG(e.salary_amount) as avg_salary,
  MIN(e.hire_date) as earliest_hire,
  MAX(e.hire_date) as latest_hire
FROM employees e
WHERE e.deleted_at IS NULL
  AND e.status = 'active'
GROUP BY e.org_id, e.department, e.department_id,
  CASE
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '3 months' THEN '0-3 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '6 months' THEN '3-6 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '1 year' THEN '6-12 months'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '2 years' THEN '1-2 years'
    WHEN AGE(CURRENT_DATE, e.hire_date) < INTERVAL '5 years' THEN '2-5 years'
    ELSE '5+ years'
  END;

CREATE UNIQUE INDEX IF NOT EXISTS hr_tenure_distribution_idx
  ON hr_tenure_distribution(org_id, department, department_id, tenure_bucket);

-- -----------------------------------------------------------------------------
-- HR ANALYTICS: COMPENSATION ANALYSIS MATERIALIZED VIEW
-- Salary distribution and compa-ratios
-- -----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS hr_compensation_analysis AS
SELECT
  e.org_id,
  COALESCE(e.department, 'Unassigned') as department,
  e.department_id,
  e.job_title,
  p.id as position_id,
  COUNT(*) as employee_count,
  AVG(e.salary_amount) as avg_salary,
  MIN(e.salary_amount) as min_salary,
  MAX(e.salary_amount) as max_salary,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.salary_amount) as median_salary,
  STDDEV(e.salary_amount) as salary_stddev,
  AVG(p.salary_band_mid) as band_mid,
  CASE WHEN AVG(p.salary_band_mid) > 0
    THEN ROUND(AVG(e.salary_amount) / AVG(p.salary_band_mid), 3)
    ELSE NULL
  END as compa_ratio
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
WHERE e.deleted_at IS NULL
  AND e.status = 'active'
  AND e.salary_amount > 0
GROUP BY e.org_id, e.department, e.department_id, e.job_title, p.id;

CREATE UNIQUE INDEX IF NOT EXISTS hr_compensation_analysis_idx
  ON hr_compensation_analysis(org_id, department, department_id, job_title, position_id);

-- -----------------------------------------------------------------------------
-- FUNCTION TO REFRESH HR MATERIALIZED VIEWS
-- Call this periodically (e.g., nightly cron job)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_hr_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY hr_headcount_by_dept;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hr_turnover_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hr_tenure_distribution;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hr_compensation_analysis;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_hr_analytics_views() IS 'Refreshes all HR analytics materialized views';

-- =============================================================================
-- END OF PHASE 4 MIGRATION
-- =============================================================================
