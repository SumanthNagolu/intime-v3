-- =====================================================
-- HR MODULE: Employee Management, Benefits, Compliance
-- =====================================================

-- Create ENUMs (defensive - skip if already exist)
DO $$ BEGIN CREATE TYPE employment_status AS ENUM ('onboarding', 'active', 'on_leave', 'terminated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE employment_type AS ENUM ('fte', 'contractor', 'intern', 'part_time'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE salary_type AS ENUM ('hourly', 'annual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE work_mode AS ENUM ('on_site', 'remote', 'hybrid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_type AS ENUM ('offer_letter', 'contract', 'i9', 'w4', 'tax_form', 'nda', 'handbook_ack', 'performance_review', 'termination', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_status AS ENUM ('pending', 'approved', 'expired', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('pending', 'completed', 'skipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE task_category AS ENUM ('paperwork', 'it_setup', 'training', 'orientation', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE time_off_type AS ENUM ('pto', 'sick', 'personal', 'bereavement', 'jury_duty', 'parental', 'unpaid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE time_off_status AS ENUM ('pending', 'approved', 'denied', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE benefit_type AS ENUM ('health', 'dental', 'vision', '401k', 'life', 'disability', 'hsa', 'fsa'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE coverage_level AS ENUM ('employee', 'employee_spouse', 'employee_children', 'family'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE benefit_status AS ENUM ('pending', 'active', 'terminated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE relationship AS ENUM ('spouse', 'child', 'domestic_partner', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE compliance_type AS ENUM ('federal', 'state', 'local'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE compliance_frequency AS ENUM ('once', 'annual', 'quarterly', 'monthly'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE compliance_applies_to AS ENUM ('all', 'fte', 'contractor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE compliance_status AS ENUM ('pending', 'completed', 'overdue', 'exempt'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE i9_status AS ENUM ('pending', 'section1_complete', 'completed', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE performance_goal_category AS ENUM ('business', 'development', 'behavioral'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE feedback_type AS ENUM ('strength', 'improvement', 'comment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- EMPLOYEES
-- =====================================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Link to user profile
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Employee identification
  employee_number TEXT UNIQUE,

  -- Employment status
  status employment_status NOT NULL DEFAULT 'onboarding',
  employment_type employment_type NOT NULL DEFAULT 'fte',

  -- Employment dates
  hire_date DATE NOT NULL,
  termination_date DATE,
  termination_reason TEXT,

  -- Organization structure
  department TEXT,
  job_title TEXT,
  manager_id UUID REFERENCES employees(id),
  location TEXT,
  work_mode work_mode DEFAULT 'on_site',

  -- Compensation
  salary_type salary_type NOT NULL DEFAULT 'annual',
  salary_amount NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_employees_org_id ON employees(org_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_deleted_at ON employees(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- EMPLOYEE_PROFILES
-- =====================================================

CREATE TABLE employee_profiles (
  employee_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,

  -- Personal information
  date_of_birth DATE,
  ssn_encrypted TEXT,

  -- Address
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT DEFAULT 'USA',
  address_postal TEXT,

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEE_DOCUMENTS
-- =====================================================

CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Document details
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,

  -- Dates
  issue_date DATE,
  expiry_date DATE,

  -- Status
  status document_status NOT NULL DEFAULT 'pending',

  -- Verification
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX idx_employee_documents_status ON employee_documents(status);

-- =====================================================
-- EMPLOYEE_ONBOARDING
-- =====================================================

CREATE TABLE employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Checklist template
  checklist_template_id UUID,

  -- Status
  status onboarding_status NOT NULL DEFAULT 'not_started',

  -- Dates
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_employee_onboarding_employee_id ON employee_onboarding(employee_id);
CREATE INDEX idx_employee_onboarding_status ON employee_onboarding(status);

-- =====================================================
-- ONBOARDING_TASKS
-- =====================================================

CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES employee_onboarding(id) ON DELETE CASCADE,

  -- Task details
  task_name TEXT NOT NULL,
  category task_category NOT NULL DEFAULT 'other',
  description TEXT,

  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,
  due_days_from_start INTEGER,

  -- Status
  status task_status NOT NULL DEFAULT 'pending',

  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),
  notes TEXT,

  -- Order
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_tasks_onboarding_id ON onboarding_tasks(onboarding_id);
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status);

-- =====================================================
-- EMPLOYEE_TIME_OFF
-- =====================================================

CREATE TABLE employee_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Time off details
  type time_off_type NOT NULL,
  status time_off_status NOT NULL DEFAULT 'pending',

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours NUMERIC(5, 2) NOT NULL,

  -- Reason
  reason TEXT,

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  denial_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_employee_time_off_employee_id ON employee_time_off(employee_id);
CREATE INDEX idx_employee_time_off_status ON employee_time_off(status);
CREATE INDEX idx_employee_time_off_dates ON employee_time_off(start_date, end_date);

-- =====================================================
-- BENEFIT_PLANS
-- =====================================================

CREATE TABLE benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Plan details
  name TEXT NOT NULL,
  type benefit_type NOT NULL,
  provider TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active',

  -- Dates
  effective_date DATE,
  termination_date DATE,

  -- Description
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_benefit_plans_org_id ON benefit_plans(org_id);
CREATE INDEX idx_benefit_plans_type ON benefit_plans(type);
CREATE INDEX idx_benefit_plans_status ON benefit_plans(status);

-- =====================================================
-- BENEFIT_PLAN_OPTIONS
-- =====================================================

CREATE TABLE benefit_plan_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,

  -- Option details
  option_name TEXT NOT NULL,
  coverage_level coverage_level NOT NULL,

  -- Costs
  employer_contribution NUMERIC(10, 2),
  employee_contribution NUMERIC(10, 2),

  -- Description
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_benefit_plan_options_plan_id ON benefit_plan_options(plan_id);

-- =====================================================
-- EMPLOYEE_BENEFITS
-- =====================================================

CREATE TABLE employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  plan_option_id UUID NOT NULL REFERENCES benefit_plan_options(id),

  -- Status
  status benefit_status NOT NULL DEFAULT 'pending',

  -- Dates
  enrollment_date DATE,
  coverage_start DATE,
  coverage_end DATE,

  -- Dependents
  dependents_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_employee_benefits_employee_id ON employee_benefits(employee_id);
CREATE INDEX idx_employee_benefits_plan_option_id ON employee_benefits(plan_option_id);
CREATE INDEX idx_employee_benefits_status ON employee_benefits(status);

-- =====================================================
-- BENEFIT_DEPENDENTS
-- =====================================================

CREATE TABLE benefit_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_benefit_id UUID NOT NULL REFERENCES employee_benefits(id) ON DELETE CASCADE,

  -- Dependent information
  name TEXT NOT NULL,
  relationship relationship NOT NULL,
  date_of_birth DATE,
  ssn_encrypted TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_benefit_dependents_employee_benefit_id ON benefit_dependents(employee_benefit_id);

-- =====================================================
-- COMPLIANCE_REQUIREMENTS
-- =====================================================

CREATE TABLE compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Requirement details
  name TEXT NOT NULL,
  type compliance_type NOT NULL,
  jurisdiction TEXT,

  -- Applicability
  applies_to compliance_applies_to NOT NULL DEFAULT 'all',
  frequency compliance_frequency NOT NULL,

  -- Details
  description TEXT,
  document_template_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_compliance_requirements_org_id ON compliance_requirements(org_id);
CREATE INDEX idx_compliance_requirements_type ON compliance_requirements(type);
CREATE INDEX idx_compliance_requirements_active ON compliance_requirements(is_active);

-- =====================================================
-- EMPLOYEE_COMPLIANCE
-- =====================================================

CREATE TABLE employee_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),

  -- Status
  status compliance_status NOT NULL DEFAULT 'pending',

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Document
  document_url TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employee_compliance_employee_id ON employee_compliance(employee_id);
CREATE INDEX idx_employee_compliance_requirement_id ON employee_compliance(requirement_id);
CREATE INDEX idx_employee_compliance_status ON employee_compliance(status);

-- =====================================================
-- I9_RECORDS
-- =====================================================

CREATE TABLE i9_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,

  -- Section 1 (Employee)
  section1_completed_at TIMESTAMPTZ,

  -- Section 2 (Employer)
  section2_completed_at TIMESTAMPTZ,

  -- List A (Identity and Employment Authorization)
  list_a_document TEXT,

  -- List B (Identity)
  list_b_document TEXT,

  -- List C (Employment Authorization)
  list_c_document TEXT,

  -- Authorized representative
  authorized_rep_name TEXT,
  authorized_rep_title TEXT,

  -- Reverification
  reverification_date DATE,

  -- Status
  status i9_status NOT NULL DEFAULT 'pending',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_i9_records_employee_id ON i9_records(employee_id);
CREATE INDEX idx_i9_records_status ON i9_records(status);

-- =====================================================
-- PERFORMANCE_GOALS
-- =====================================================

CREATE TABLE performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Review linkage (optional)
  review_id UUID,

  -- Goal details
  goal TEXT NOT NULL,
  category performance_goal_category NOT NULL,
  weight_percent INTEGER,

  -- Status
  status goal_status NOT NULL DEFAULT 'not_started',

  -- Rating (1-5)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Comments
  comments TEXT,

  -- Dates
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_performance_goals_employee_id ON performance_goals(employee_id);
CREATE INDEX idx_performance_goals_review_id ON performance_goals(review_id);
CREATE INDEX idx_performance_goals_status ON performance_goals(status);

-- =====================================================
-- PERFORMANCE_FEEDBACK
-- =====================================================

CREATE TABLE performance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Review linkage
  review_id UUID NOT NULL,

  -- Feedback details
  feedback_type feedback_type NOT NULL,
  content TEXT NOT NULL,
  category TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_performance_feedback_review_id ON performance_feedback(review_id);
CREATE INDEX idx_performance_feedback_type ON performance_feedback(feedback_type);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_documents_updated_at BEFORE UPDATE ON employee_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_onboarding_updated_at BEFORE UPDATE ON employee_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER onboarding_tasks_updated_at BEFORE UPDATE ON onboarding_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_time_off_updated_at BEFORE UPDATE ON employee_time_off FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER benefit_plans_updated_at BEFORE UPDATE ON benefit_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER benefit_plan_options_updated_at BEFORE UPDATE ON benefit_plan_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_benefits_updated_at BEFORE UPDATE ON employee_benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER benefit_dependents_updated_at BEFORE UPDATE ON benefit_dependents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER compliance_requirements_updated_at BEFORE UPDATE ON compliance_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER employee_compliance_updated_at BEFORE UPDATE ON employee_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER i9_records_updated_at BEFORE UPDATE ON i9_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER performance_goals_updated_at BEFORE UPDATE ON performance_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER performance_feedback_updated_at BEFORE UPDATE ON performance_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
