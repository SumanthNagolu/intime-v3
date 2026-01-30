-- =============================================================================
-- HR Module Phase 2: Employee Lifecycle
-- Offboarding, Leave Management, Compensation History
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE termination_type AS ENUM ('voluntary', 'involuntary', 'retirement', 'contract_end', 'layoff', 'mutual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_category AS ENUM ('it', 'hr', 'manager', 'finance', 'facilities', 'legal', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE accrual_type AS ENUM ('annual', 'monthly', 'per_pay_period', 'none');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_change_type AS ENUM ('hire', 'promotion', 'merit_increase', 'market_adjustment', 'transfer', 'demotion', 'correction');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- OFFBOARDING TEMPLATES
-- Reusable checklists for different termination types
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  termination_type termination_type,
  is_default BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS offboarding_templates_org_id_idx
  ON public.offboarding_templates(org_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.offboarding_templates IS 'Reusable offboarding checklist templates';

-- -----------------------------------------------------------------------------
-- OFFBOARDING TEMPLATE TASKS
-- Task definitions within templates
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offboarding_template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES offboarding_templates(id) ON DELETE CASCADE,

  task_name TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL DEFAULT 'other',
  due_offset_days INTEGER DEFAULT 0,
  assignee_role TEXT,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS offboarding_template_tasks_template_id_idx
  ON public.offboarding_template_tasks(template_id);

COMMENT ON TABLE public.offboarding_template_tasks IS 'Task definitions within offboarding templates';

-- -----------------------------------------------------------------------------
-- EMPLOYEE OFFBOARDING
-- Active offboarding processes
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employee_offboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES offboarding_templates(id) ON DELETE SET NULL,

  termination_type termination_type NOT NULL,
  last_working_day DATE NOT NULL,

  status onboarding_status NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  exit_interview_scheduled_at TIMESTAMPTZ,
  exit_interview_completed_at TIMESTAMPTZ,
  exit_interview_notes TEXT,

  rehire_eligible BOOLEAN,
  rehire_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS employee_offboarding_org_id_idx
  ON public.employee_offboarding(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS employee_offboarding_employee_id_idx
  ON public.employee_offboarding(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS employee_offboarding_status_idx
  ON public.employee_offboarding(org_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.employee_offboarding IS 'Active offboarding processes for departing employees';

-- -----------------------------------------------------------------------------
-- OFFBOARDING TASKS
-- Individual tasks for a specific offboarding
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.offboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offboarding_id UUID NOT NULL REFERENCES employee_offboarding(id) ON DELETE CASCADE,

  task_name TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL DEFAULT 'other',
  status task_status NOT NULL DEFAULT 'pending',

  due_date DATE,
  assigned_to UUID REFERENCES user_profiles(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),

  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS offboarding_tasks_offboarding_id_idx
  ON public.offboarding_tasks(offboarding_id);
CREATE INDEX IF NOT EXISTS offboarding_tasks_assigned_to_idx
  ON public.offboarding_tasks(assigned_to) WHERE status = 'pending';

COMMENT ON TABLE public.offboarding_tasks IS 'Individual tasks for a specific offboarding process';

-- -----------------------------------------------------------------------------
-- LEAVE POLICIES
-- Organization-wide leave policy definitions
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  leave_type time_off_type NOT NULL,

  -- Accrual settings
  accrual_type accrual_type NOT NULL DEFAULT 'annual',
  accrual_amount NUMERIC(5,2),
  max_balance NUMERIC(5,2),

  -- Carryover settings
  carryover_enabled BOOLEAN DEFAULT false,
  carryover_max NUMERIC(5,2),
  carryover_expiry_months INTEGER,

  -- Approval settings
  requires_approval BOOLEAN DEFAULT true,
  auto_approve_if_days_le NUMERIC(5,2),
  min_notice_days INTEGER DEFAULT 0,

  -- Employment type restrictions
  applies_to_employment_types TEXT[] DEFAULT ARRAY['fte'],

  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS leave_policies_org_id_idx
  ON public.leave_policies(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leave_policies_leave_type_idx
  ON public.leave_policies(org_id, leave_type) WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON TABLE public.leave_policies IS 'Organization-wide leave policy definitions';

-- -----------------------------------------------------------------------------
-- LEAVE BALANCES
-- Employee leave balances per policy per fiscal year
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES leave_policies(id) ON DELETE CASCADE,

  fiscal_year INTEGER NOT NULL,

  entitled_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  used_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  pending_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  carried_over_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  adjustment_days NUMERIC(5,2) NOT NULL DEFAULT 0,

  available_days NUMERIC(5,2) GENERATED ALWAYS AS (
    entitled_days + carried_over_days + adjustment_days - used_days - pending_days
  ) STORED,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT leave_balances_unique UNIQUE(employee_id, policy_id, fiscal_year)
);

CREATE INDEX IF NOT EXISTS leave_balances_employee_id_idx
  ON public.leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS leave_balances_policy_year_idx
  ON public.leave_balances(policy_id, fiscal_year);

COMMENT ON TABLE public.leave_balances IS 'Employee leave balances per policy per fiscal year';

-- -----------------------------------------------------------------------------
-- ADD POLICY FK TO EMPLOYEE TIME OFF
-- Link time off requests to policies
-- -----------------------------------------------------------------------------

ALTER TABLE employee_time_off
ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES leave_policies(id) ON DELETE SET NULL;

ALTER TABLE employee_time_off
ADD COLUMN IF NOT EXISTS balance_id UUID REFERENCES leave_balances(id) ON DELETE SET NULL;

ALTER TABLE employee_time_off
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS employee_time_off_org_id_idx
  ON employee_time_off(org_id);

-- -----------------------------------------------------------------------------
-- COMPENSATION HISTORY
-- Track all compensation changes over time
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.compensation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  effective_date DATE NOT NULL,
  end_date DATE,

  salary_type salary_type NOT NULL,
  base_salary NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  bonus_target_percent NUMERIC(5,2),
  commission_rate NUMERIC(5,2),
  equity_shares INTEGER,

  change_type compensation_change_type NOT NULL,
  change_reason TEXT,
  change_percentage NUMERIC(5,2),
  previous_salary NUMERIC(12,2),

  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS compensation_history_org_id_idx
  ON public.compensation_history(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS compensation_history_employee_id_idx
  ON public.compensation_history(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS compensation_history_effective_date_idx
  ON public.compensation_history(employee_id, effective_date DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.compensation_history IS 'Track all compensation changes over time';
COMMENT ON COLUMN public.compensation_history.change_percentage IS 'Percentage change from previous salary';

-- =============================================================================
-- END OF PHASE 2 MIGRATION
-- =============================================================================
