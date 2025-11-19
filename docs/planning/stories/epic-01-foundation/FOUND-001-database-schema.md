# FOUND-001: Create Unified user_profiles Table

**Story Points:** 5
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** CRITICAL (Blocks all other work)

---

## User Story

As a **Platform Architect**,
I want **a unified user_profiles table that supports all role types**,
So that **we avoid data silos and can easily support multi-role users**.

---

## Acceptance Criteria

- [ ] `user_profiles` table created in Supabase with all required fields
- [ ] Supports nullable role-specific columns (student_*, employee_*, candidate_*, client_*)
- [ ] UUID primary key, email unique constraint enforced
- [ ] Created/updated timestamps with automatic updates
- [ ] Soft delete support via `deleted_at` column
- [ ] Migration script tested in development environment
- [ ] Rollback script prepared in case of issues
- [ ] Database indexes created for email, role, deleted_at

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/001_create_user_profiles.sql`

```sql
-- Drop existing table if exists (dev only)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create unified user table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields (required for all users)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,

  -- Role-specific fields (nullable)

  -- Student fields
  student_enrollment_date TIMESTAMPTZ,
  student_course_progress JSONB, -- {module_1: 75, module_2: 30, ...}
  student_current_module TEXT,

  -- Employee fields
  employee_hire_date TIMESTAMPTZ,
  employee_department TEXT,
  employee_position TEXT,
  employee_salary NUMERIC(10,2),

  -- Candidate fields
  candidate_status TEXT, -- 'active', 'placed', 'bench', 'inactive'
  candidate_resume_url TEXT,
  candidate_skills TEXT[], -- Array of skills
  candidate_experience_years INTEGER,

  -- Client fields
  client_company_name TEXT,
  client_industry TEXT,
  client_tier TEXT, -- 'preferred', 'strategic', 'exclusive'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_candidate_status CHECK (
    candidate_status IS NULL OR
    candidate_status IN ('active', 'placed', 'bench', 'inactive')
  ),
  CONSTRAINT valid_client_tier CHECK (
    client_tier IS NULL OR
    client_tier IN ('preferred', 'strategic', 'exclusive')
  )
);

-- Indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_candidate_status ON user_profiles(candidate_status);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE user_profiles IS 'Unified user table supporting all role types (student, employee, candidate, client)';
COMMENT ON COLUMN user_profiles.student_course_progress IS 'JSONB storing module completion percentages';
COMMENT ON COLUMN user_profiles.candidate_skills IS 'Array of skill tags (e.g., [''PolicyCenter'', ''Gosu'', ''Java''])';
```

### Rollback Migration

Create file: `supabase/migrations/001_create_user_profiles_rollback.sql`

```sql
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP INDEX IF EXISTS idx_user_profiles_candidate_status;
DROP INDEX IF EXISTS idx_user_profiles_deleted_at;
DROP INDEX IF EXISTS idx_user_profiles_email;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

### Verification Queries

```sql
-- Test insert student
INSERT INTO user_profiles (email, full_name, student_enrollment_date, student_current_module)
VALUES ('test@student.com', 'Test Student', NOW(), 'module_1');

-- Test insert employee
INSERT INTO user_profiles (email, full_name, employee_hire_date, employee_department)
VALUES ('test@employee.com', 'Test Employee', NOW(), 'Recruiting');

-- Test multi-role (student who becomes employee)
UPDATE user_profiles
SET employee_hire_date = NOW(), employee_department = 'Training Academy'
WHERE email = 'test@student.com';

-- Verify constraints
SELECT * FROM user_profiles WHERE deleted_at IS NULL;
```

---

## Dependencies

- **Requires:** Supabase project configured
- **Blocks:** FOUND-002 (role system), FOUND-004 (RLS policies), all other epics

---

## Testing Checklist

- [ ] Migration runs successfully on fresh database
- [ ] Rollback migration successfully reverts changes
- [ ] All indexes created correctly
- [ ] Constraints prevent invalid data
- [ ] Updated_at timestamp updates automatically
- [ ] Soft delete works (deleted_at set, not removed)
- [ ] Can query active users (WHERE deleted_at IS NULL)

---

## Documentation Updates

- [ ] Update `/docs/architecture/DATABASE-SCHEMA.md` with final schema
- [ ] Add migration guide to `/docs/implementation/DATABASE-MIGRATIONS.md`
- [ ] Document role-specific field usage patterns

---

## Related Stories

- **Leads to:** FOUND-002 (Role system depends on this table)
- **Leads to:** FOUND-004 (RLS policies secure this table)

---

## Notes

- JSONB used for `student_course_progress` to avoid separate table for simple progress tracking
- Array type used for `candidate_skills` for flexibility (can add full-text search later)
- All role-specific columns nullable to support multi-role users
- Soft delete allows data retention and potential user reactivation

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
