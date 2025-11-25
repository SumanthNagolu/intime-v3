-- =====================================================
-- Migration: Session Context Switching
-- Date: 2024-11-24
-- Description: Support for multi-role context switching in UI
-- =====================================================

-- =====================================================
-- Helper Function: Get Active User Role from Session
-- =====================================================

-- This function reads the 'active_role' from the JWT claims
-- which the frontend sets when user switches context
CREATE OR REPLACE FUNCTION auth_active_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'active_role',
    (
      -- Default to first role if no active_role in JWT
      SELECT r.name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      LIMIT 1
    )
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- Enhanced RLS Helper: Check Active Role
-- =====================================================

-- Check if current active role matches
CREATE OR REPLACE FUNCTION auth_has_active_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT auth_active_role() = role_name;
$$ LANGUAGE sql STABLE;

-- Check if user has role (any of their roles, not just active)
CREATE OR REPLACE FUNCTION auth_has_any_role(role_names TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = ANY(role_names)
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- Enhanced RLS Policies for Context Switching
-- =====================================================

-- Jobs: Different access based on active role
DROP POLICY IF EXISTS "jobs_employee_read" ON jobs;
CREATE POLICY "jobs_employee_read"
  ON jobs
  FOR SELECT
  USING (
    -- Recruiters: See all jobs they own or are assigned to
    (auth_has_active_role('recruiter') AND (
      owner_id = auth.uid() OR
      auth.uid() = ANY(recruiter_ids)
    )) OR

    -- Bench Sales: See jobs that match bench consultants
    (auth_has_active_role('bench_sales')) OR

    -- TA Specialist: See jobs for sourcing
    (auth_has_active_role('ta_specialist')) OR

    -- Admin: See everything
    (auth_has_active_role('admin'))
  );

-- Submissions: Context-aware access
DROP POLICY IF EXISTS "submissions_employee_read" ON submissions;
CREATE POLICY "submissions_employee_read"
  ON submissions
  FOR SELECT
  USING (
    -- Recruiters: Own submissions
    (auth_has_active_role('recruiter') AND owner_id = auth.uid()) OR

    -- Bench Sales: Submissions for bench consultants
    (auth_has_active_role('bench_sales') AND candidate_id IN (
      SELECT user_id FROM bench_metadata
    )) OR

    -- Admin: Everything
    (auth_has_active_role('admin'))
  );

-- Candidates: Context-aware read
CREATE POLICY "candidates_context_read"
  ON user_profiles
  FOR SELECT
  USING (
    -- Own profile always visible
    id = auth.uid() OR

    -- Recruiter context: All candidates
    (auth_has_active_role('recruiter') AND candidate_status IS NOT NULL) OR

    -- Bench Sales context: Only bench consultants
    (auth_has_active_role('bench_sales') AND candidate_status = 'bench') OR

    -- TA Specialist: Sourced candidates
    (auth_has_active_role('ta_specialist') AND candidate_status IN ('active', 'sourced')) OR

    -- Student context: Only own student data
    (auth_has_active_role('student') AND id = auth.uid()) OR

    -- Admin: Everything
    (auth_has_active_role('admin'))
  );

-- =====================================================
-- Session Metadata Table (Optional)
-- =====================================================

-- Track user's selected context for analytics
CREATE TABLE IF NOT EXISTS user_session_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  active_role TEXT NOT NULL,
  session_started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_ended_at TIMESTAMPTZ,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN session_ended_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM session_ended_at - session_started_at)::INTEGER
      ELSE NULL
    END
  ) STORED
);

CREATE INDEX idx_session_context_user ON user_session_context(user_id);
CREATE INDEX idx_session_context_role ON user_session_context(active_role);
CREATE INDEX idx_session_context_started ON user_session_context(session_started_at DESC);

-- RLS for session context
ALTER TABLE user_session_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_context_own"
  ON user_session_context
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- Frontend Integration Helper
-- =====================================================

-- Function to get available roles for current user
CREATE OR REPLACE FUNCTION get_user_available_roles()
RETURNS TABLE (
  role_name TEXT,
  role_display_name TEXT,
  role_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.name,
    COALESCE(r.display_name, r.name) as role_display_name,
    r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  ORDER BY r.display_order;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user can switch to role
CREATE OR REPLACE FUNCTION can_switch_to_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- Add display_name and display_order to roles table
-- =====================================================

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set friendly names for context switcher
UPDATE roles SET
  display_name = 'Student',
  display_order = 1
WHERE name = 'student';

UPDATE roles SET
  display_name = 'Client',
  display_order = 2
WHERE name = 'client';

UPDATE roles SET
  display_name = 'Talent',
  display_order = 3
WHERE name = 'candidate';

UPDATE roles SET
  display_name = 'Recruiter',
  display_order = 4
WHERE name = 'recruiter';

UPDATE roles SET
  display_name = 'Bench Sales',
  display_order = 5
WHERE name = 'bench_sales';

UPDATE roles SET
  display_name = 'TA Specialist',
  display_order = 6
WHERE name = 'ta_specialist';

UPDATE roles SET
  display_name = 'HR',
  display_order = 7
WHERE name = 'hr';

UPDATE roles SET
  display_name = 'Admin',
  display_order = 99
WHERE name = 'admin';

-- =====================================================
-- Usage Example for Frontend
-- =====================================================

/*
Frontend Usage:

1. Get available roles for current user:
   const { data: roles } = await supabase.rpc('get_user_available_roles');

2. Switch context (update JWT claim):
   // In middleware or context provider
   await supabase.auth.updateUser({
     data: { active_role: 'recruiter' }
   });

3. Check if user can switch:
   const canSwitch = await supabase.rpc('can_switch_to_role', {
     p_role_name: 'bench_sales'
   });

4. Track session analytics:
   INSERT INTO user_session_context (user_id, active_role)
   VALUES (auth.uid(), 'recruiter');

5. RLS automatically filters data based on active_role in JWT!
*/

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION auth_active_role IS 'Gets the currently active role from JWT claims for context switching';
COMMENT ON FUNCTION auth_has_active_role IS 'Checks if the active role matches the specified role';
COMMENT ON FUNCTION get_user_available_roles IS 'Returns all roles available to current user for context switcher UI';
COMMENT ON FUNCTION can_switch_to_role IS 'Validates if user has permission to switch to specified role';
COMMENT ON TABLE user_session_context IS 'Tracks user context switching for analytics';
