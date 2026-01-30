-- =============================================================================
-- HR Module Phase 1: Core Foundation
-- Departments and Positions tables for organizational structure
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE department_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE position_status AS ENUM ('open', 'filled', 'frozen', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- DEPARTMENTS TABLE
-- Organizational hierarchy with cost centers and budgets
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  hierarchy_level INTEGER DEFAULT 0,

  -- Leadership
  head_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Financial
  cost_center_code TEXT,
  budget_amount NUMERIC(15,2),

  -- Status
  status department_status NOT NULL DEFAULT 'active',

  -- Audit (REQUIRED)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Indexes for departments
CREATE INDEX IF NOT EXISTS departments_org_id_idx
  ON public.departments(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS departments_parent_id_idx
  ON public.departments(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS departments_head_id_idx
  ON public.departments(head_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS departments_status_idx
  ON public.departments(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS departments_hierarchy_idx
  ON public.departments(org_id, hierarchy_level) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE public.departments IS 'HR organizational departments with hierarchy and budgets';
COMMENT ON COLUMN public.departments.hierarchy_level IS 'Depth in org tree: 0 = root, 1 = child of root, etc.';
COMMENT ON COLUMN public.departments.head_id IS 'User profile ID of department head';

-- -----------------------------------------------------------------------------
-- POSITIONS TABLE
-- Job slots within departments with salary bands
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,

  -- Position identity
  title TEXT NOT NULL,
  code TEXT,
  description TEXT,
  level TEXT, -- e.g., 'Junior', 'Senior', 'Lead', 'Manager', 'Director'

  -- Salary bands
  salary_band_min NUMERIC(12,2),
  salary_band_mid NUMERIC(12,2),
  salary_band_max NUMERIC(12,2),

  -- Headcount
  headcount_budget INTEGER NOT NULL DEFAULT 1,

  -- Status
  status position_status NOT NULL DEFAULT 'open',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Indexes for positions
CREATE INDEX IF NOT EXISTS positions_org_id_idx
  ON public.positions(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS positions_department_id_idx
  ON public.positions(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS positions_status_idx
  ON public.positions(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS positions_level_idx
  ON public.positions(org_id, level) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE public.positions IS 'Job positions within departments with salary bands and headcount';
COMMENT ON COLUMN public.positions.headcount_budget IS 'Approved number of employees for this position';

-- -----------------------------------------------------------------------------
-- ADD FK COLUMNS TO EMPLOYEES TABLE
-- Link employees to departments and positions
-- -----------------------------------------------------------------------------

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES positions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS employees_department_id_idx
  ON employees(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS employees_position_id_idx
  ON employees(position_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- END OF PHASE 1 MIGRATION
-- =============================================================================
