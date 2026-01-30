-- =============================================================================
-- HR Module Phase 3: Performance Management
-- Review Cycles, Enhanced Reviews, Goals/OKRs, Calibration, 1:1 Meetings
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE review_cycle_status AS ENUM (
    'draft', 'self_review', 'manager_review',
    'calibration', 'acknowledged', 'completed', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE review_cycle_frequency AS ENUM ('annual', 'semi_annual', 'quarterly', 'monthly');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM (
    'pending', 'self_review', 'self_submitted',
    'manager_review', 'manager_submitted',
    'calibration', 'calibrated',
    'acknowledged', 'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_scope AS ENUM ('company', 'department', 'team', 'individual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_type AS ENUM ('objective', 'key_result', 'goal', 'initiative');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- REVIEW CYCLES
-- Organization-wide performance review cycles
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  frequency review_cycle_frequency NOT NULL DEFAULT 'annual',

  -- Review period
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,

  -- Deadlines
  self_review_start_date DATE,
  self_review_deadline DATE NOT NULL,
  manager_review_start_date DATE,
  manager_review_deadline DATE NOT NULL,
  calibration_start_date DATE,
  calibration_deadline DATE,
  acknowledgement_deadline DATE,

  status review_cycle_status NOT NULL DEFAULT 'draft',
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Settings
  include_self_assessment BOOLEAN DEFAULT true,
  include_peer_feedback BOOLEAN DEFAULT false,
  include_upward_feedback BOOLEAN DEFAULT false,
  include_goals BOOLEAN DEFAULT true,
  include_competencies BOOLEAN DEFAULT true,
  require_calibration BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS review_cycles_org_id_idx
  ON public.review_cycles(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS review_cycles_status_idx
  ON public.review_cycles(org_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.review_cycles IS 'Organization-wide performance review cycles';

-- -----------------------------------------------------------------------------
-- ENHANCE PERFORMANCE_REVIEWS TABLE
-- Add cycle reference, enhanced status, calibration fields
-- -----------------------------------------------------------------------------

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS review_status review_status DEFAULT 'pending';

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS potential_rating INTEGER;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS nine_box_position TEXT;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS calibrated_rating INTEGER;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS calibration_notes TEXT;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS calibrated_by UUID REFERENCES user_profiles(id);

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS calibrated_at TIMESTAMPTZ;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS self_review_submitted_at TIMESTAMPTZ;

ALTER TABLE performance_reviews
ADD COLUMN IF NOT EXISTS manager_review_submitted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS performance_reviews_cycle_id_idx
  ON performance_reviews(cycle_id);
CREATE INDEX IF NOT EXISTS performance_reviews_review_status_idx
  ON performance_reviews(org_id, review_status);

-- Add constraints for new rating columns
ALTER TABLE performance_reviews
ADD CONSTRAINT performance_reviews_potential_rating_check
CHECK (potential_rating IS NULL OR (potential_rating >= 1 AND potential_rating <= 5));

ALTER TABLE performance_reviews
ADD CONSTRAINT performance_reviews_calibrated_rating_check
CHECK (calibrated_rating IS NULL OR (calibrated_rating >= 1 AND calibrated_rating <= 5));

-- -----------------------------------------------------------------------------
-- ENHANCE PERFORMANCE_GOALS TABLE
-- Add OKR cascade, scope, progress tracking
-- -----------------------------------------------------------------------------

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS scope goal_scope DEFAULT 'individual';

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS goal_type_enum goal_type DEFAULT 'goal';

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES performance_goals(id) ON DELETE SET NULL;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS team_id UUID;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL;

ALTER TABLE performance_goals
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS performance_goals_org_id_idx
  ON performance_goals(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS performance_goals_parent_id_idx
  ON performance_goals(parent_goal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS performance_goals_scope_idx
  ON performance_goals(org_id, scope) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS performance_goals_cycle_idx
  ON performance_goals(cycle_id) WHERE deleted_at IS NULL;

-- Add constraint
ALTER TABLE performance_goals
ADD CONSTRAINT performance_goals_progress_check
CHECK (progress_percent >= 0 AND progress_percent <= 100);

-- -----------------------------------------------------------------------------
-- COMPETENCY FRAMEWORKS
-- Organization-defined competency models
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.competency_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS competency_frameworks_org_id_idx
  ON public.competency_frameworks(org_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.competency_frameworks IS 'Organization-defined competency models';

-- -----------------------------------------------------------------------------
-- COMPETENCIES
-- Individual competency definitions with level descriptions
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- core, functional, leadership, technical

  -- Level descriptions (1-5 scale)
  level_1_name TEXT DEFAULT 'Developing',
  level_1_description TEXT,
  level_2_name TEXT DEFAULT 'Proficient',
  level_2_description TEXT,
  level_3_name TEXT DEFAULT 'Advanced',
  level_3_description TEXT,
  level_4_name TEXT DEFAULT 'Expert',
  level_4_description TEXT,
  level_5_name TEXT DEFAULT 'Master',
  level_5_description TEXT,

  sort_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competencies_framework_id_idx
  ON public.competencies(framework_id);
CREATE INDEX IF NOT EXISTS competencies_category_idx
  ON public.competencies(framework_id, category);

COMMENT ON TABLE public.competencies IS 'Individual competency definitions with level descriptions';

-- -----------------------------------------------------------------------------
-- REVIEW COMPETENCY ASSESSMENTS
-- Competency ratings within a review
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_competency_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,

  self_rating INTEGER,
  self_comments TEXT,
  manager_rating INTEGER,
  manager_comments TEXT,
  calibrated_rating INTEGER,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT competency_self_rating_check CHECK (self_rating IS NULL OR (self_rating >= 1 AND self_rating <= 5)),
  CONSTRAINT competency_manager_rating_check CHECK (manager_rating IS NULL OR (manager_rating >= 1 AND manager_rating <= 5)),
  CONSTRAINT competency_calibrated_rating_check CHECK (calibrated_rating IS NULL OR (calibrated_rating >= 1 AND calibrated_rating <= 5)),
  CONSTRAINT review_competency_unique UNIQUE(review_id, competency_id)
);

CREATE INDEX IF NOT EXISTS review_competency_assessments_review_id_idx
  ON public.review_competency_assessments(review_id);

COMMENT ON TABLE public.review_competency_assessments IS 'Competency ratings within a performance review';

-- -----------------------------------------------------------------------------
-- CALIBRATION SESSIONS
-- Group calibration sessions for review cycles
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.calibration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status meeting_status DEFAULT 'scheduled',

  facilitator_id UUID REFERENCES user_profiles(id),
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS calibration_sessions_org_id_idx
  ON public.calibration_sessions(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS calibration_sessions_cycle_id_idx
  ON public.calibration_sessions(cycle_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.calibration_sessions IS 'Group calibration sessions for review cycles';

-- -----------------------------------------------------------------------------
-- ONE ON ONE MEETINGS
-- Manager-employee recurring meetings
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.one_on_one_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status meeting_status DEFAULT 'scheduled',

  -- Agendas
  employee_agenda TEXT,
  manager_agenda TEXT,

  -- Notes and outcomes
  shared_notes TEXT,
  private_manager_notes TEXT,
  action_items JSONB DEFAULT '[]',

  -- Follow-up
  next_meeting_at TIMESTAMPTZ,
  follow_up_items JSONB DEFAULT '[]',

  completed_at TIMESTAMPTZ,
  cancelled_reason TEXT,

  -- Recurring settings
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS one_on_one_meetings_org_id_idx
  ON public.one_on_one_meetings(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS one_on_one_meetings_employee_id_idx
  ON public.one_on_one_meetings(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS one_on_one_meetings_manager_id_idx
  ON public.one_on_one_meetings(manager_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS one_on_one_meetings_scheduled_idx
  ON public.one_on_one_meetings(org_id, scheduled_at) WHERE deleted_at IS NULL AND status = 'scheduled';

COMMENT ON TABLE public.one_on_one_meetings IS 'Manager-employee recurring one-on-one meetings';

-- -----------------------------------------------------------------------------
-- PEER FEEDBACK REQUESTS
-- 360-degree feedback collection
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.peer_feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  requested_from_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'pending', -- pending, submitted, declined
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  submitted_at TIMESTAMPTZ,

  -- Feedback content
  strengths TEXT,
  areas_for_improvement TEXT,
  overall_feedback TEXT,
  rating INTEGER,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT peer_feedback_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT peer_feedback_unique UNIQUE(review_id, requested_from_id)
);

CREATE INDEX IF NOT EXISTS peer_feedback_requests_review_id_idx
  ON public.peer_feedback_requests(review_id);
CREATE INDEX IF NOT EXISTS peer_feedback_requests_from_id_idx
  ON public.peer_feedback_requests(requested_from_id) WHERE status = 'pending';

COMMENT ON TABLE public.peer_feedback_requests IS '360-degree peer feedback collection';

-- =============================================================================
-- END OF PHASE 3 MIGRATION
-- =============================================================================
