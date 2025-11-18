# Database Schema Design

**Last Updated:** 2025-11-17
**Status:** Foundation for v3
**Purpose:** Complete documentation of unified schema design

---

## Design Principles

### 1. Single Source of Truth

**Principle:** One table per entity type, no duplicates

❌ **Legacy Mistake:**

```sql
-- Three separate user systems
CREATE TABLE user_profiles (...);  -- Students
CREATE TABLE employees (...);      -- HR module
CREATE TABLE candidates (...);     -- ATS module
```

**Result:**
- Data silos (can't query across modules)
- Duplicate user data
- 65+ SQL files with conflicting schemas
- 25+ "FIX-*.sql" patches

✅ **v3 Solution:**

```sql
-- ONE user table with role-based columns
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,

  -- Universal fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,  -- Soft delete

  -- Role-specific fields (nullable)
  student_enrollment_date TIMESTAMPTZ,
  student_cohort TEXT,
  employee_hire_date TIMESTAMPTZ,
  employee_job_title TEXT,
  candidate_status TEXT,
  candidate_available_from DATE,
  client_company_name TEXT,
  client_industry TEXT
);
```

**Why:**
- Query across modules (e.g., "all employees who were students")
- Single security model (one set of RLS policies)
- Easier data migration
- Supports multi-role users naturally

### 2. Multi-Role Support

**Principle:** Users can have multiple roles simultaneously

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,  -- 'student', 'employee', 'candidate', 'admin'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles via junction table
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES user_profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- Example: User is both student AND employee
INSERT INTO user_roles VALUES
  ('user-123', 'role-student', NOW(), 'admin-456'),
  ('user-123', 'role-employee', NOW(), 'admin-456');
```

**Real-World Scenario:**

```
Day 1: John is a student
  → user_roles: [student]

Day 56: John graduates from Academy
  → eventBus.publish('course.graduated', { userId: 'john' })
  → user_roles: [student, candidate]

Day 90: John gets placed at a client
  → user_roles: [student, candidate, placed-consultant]

Day 180: John joins IntimeESolutions full-time
  → user_roles: [student, employee]
```

**Why:** Graduate students become candidates, candidates become employees. Cross-pollination requires multi-role support.

### 3. RLS-First Security

**Principle:** Enforce permissions at database level, not application level

❌ **Legacy Mistake:**

```typescript
// Application-level check (can be bypassed)
export async function getTopics(userId: string) {
  // Check if user is admin
  if (!isAdmin(userId)) {
    throw new Error('Unauthorized');
  }
  return db.select().from(topics);
}
```

**Problem:** If someone calls `db.select().from(topics)` directly, they bypass the auth check.

✅ **v3 Solution (RLS Policies):**

```sql
-- Students can only see their own topic completions
CREATE POLICY "Students view own topics"
ON topic_completions FOR SELECT
USING (
  user_id = auth.uid()
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'student')
  )
);

-- Admins can view all topic completions
CREATE POLICY "Admins view all topics"
ON topic_completions FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);
```

**Result:**
- **Impossible to bypass** (enforced at PostgreSQL level)
- **Consistent across all clients** (web, mobile, API)
- **Audit trail built-in** (Supabase logs all RLS checks)
- **Single source of truth** (don't duplicate auth logic)

### 4. Soft Deletes

**Principle:** Never hard delete critical data

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  deleted_at TIMESTAMPTZ,  -- NULL = active, NOT NULL = deleted
  deleted_by UUID REFERENCES user_profiles(id),
  -- ...
);

-- Helper function
CREATE FUNCTION not_deleted()
RETURNS boolean AS $$
  SELECT deleted_at IS NULL
$$ LANGUAGE SQL IMMUTABLE;

-- Exclude deleted records in RLS policies
CREATE POLICY "Active users only"
ON user_profiles FOR SELECT
USING (not_deleted());

-- Application queries
SELECT * FROM user_profiles WHERE not_deleted();
```

**Why:**
- **Data recovery:** Accidental deletes can be undone
- **Audit trail:** Know who deleted what and when
- **Referential integrity:** Foreign keys don't break
- **Compliance:** Some industries require data retention

### 5. Audit Trail

**Principle:** Track who created/modified every record

```sql
CREATE TABLE {table_name} (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),
  -- ... entity-specific fields
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON {table_name}
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
```

**Why:**
- Compliance (SOC 2, HIPAA, GDPR)
- Debugging ("who changed this?")
- Security audits

---

## Complete Schema

### Core Platform Tables (20 tables)

**User Management:**
- `user_profiles` - Single unified user system
- `roles` - Available roles (student, employee, admin, candidate, etc.)
- `user_roles` - User-to-role mapping (junction table)
- `teams` - Organizational teams/pods
- `permissions` - Granular permissions
- `role_permissions` - Role-to-permission mapping

**Academy/LMS:**
- `products` - Courses/training programs
- `topics` - Curriculum items
- `topic_content_items` - Videos, text, interactive demos
- `topic_completions` - Student progress tracking
- `quizzes` - Assessments
- `quiz_questions` - Question bank
- `quiz_attempts` - Student quiz submissions
- `learning_paths` - Curated learning sequences
- `learning_blocks` - Grouping of topics
- `xp_transactions` - Gamification points
- `achievements` - Badges/achievements
- `user_achievements` - Earned achievements

**AI & Communication:**
- `ai_conversations` - Chat session history
- `ai_messages` - Individual chat messages
- `notifications` - Unified notification system
- `system_events` - Event bus audit trail
- `audit_logs` - Compliance/security tracking

### HR Module Tables (14 tables)

- `departments` - Organizational hierarchy
- `timesheets` - Time tracking
- `attendance` - Clock in/out records
- `work_shifts` - Shift schedules
- `leave_types` - PTO, sick leave, etc.
- `leave_balances` - Accrued leave per employee
- `leave_requests` - Leave applications
- `expense_claims` - Expense reports
- `expense_items` - Individual expenses
- `expense_categories` - Expense types
- `document_templates` - Offer letters, contracts, etc.
- `generated_documents` - Filled templates
- `workflow_instances` - Running workflows
- `workflow_stage_history` - Workflow audit trail

### Recruiting/ATS Module (16 tables)

- `jobs` - Open positions
- `job_applications` - Candidate applications
- `candidates` - *(No separate table - use user_profiles with candidate role)*
- `interviews` - Interview schedules
- `interview_feedback` - Interviewer notes
- `resume_parsing_jobs` - AI resume processing
- `skill_extractions` - Skills from resumes
- `job_matches` - AI-suggested matches
- `client_companies` - Hiring companies
- `vendor_companies` - Staffing partners
- `submissions` - Candidate submissions to clients
- `placements` - Successful hires
- `bench_consultants` - Available consultants
- `marketing_blasts` - Bulk email campaigns
- `email_tracking` - Open/click tracking

### Trikala/Productivity Module (12 tables)

- `pods` - 2-person teams
- `pod_goals` - Sprint goals
- `sprint_metrics` - Performance tracking
- `activity_logs` - Time-tracking events
- `activity_summaries` - AI-generated summaries
- `productivity_insights` - AI analysis
- `focus_sessions` - Deep work blocks
- `meeting_recordings` - Zoom/Teams recordings
- `meeting_transcripts` - AI transcriptions
- `action_items` - Extracted tasks
- `cross_pollination_events` - Lead discovery tracking
- `opportunity_pipeline` - Sales pipeline

---

## Migration Strategy

### Single Migration File Approach

**File:** `supabase/migrations/20251117000000_unified_schema.sql`

**Why single file?**
- ✅ Clear dependency order
- ✅ One source of truth
- ✅ No schema evolution chaos
- ✅ Easy rollback

**Structure:**

```sql
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text search

-- 2. Custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE application_status AS ENUM ('submitted', 'reviewed', 'interview', 'offer', 'hired', 'rejected');

-- 3. Core tables (in dependency order)
CREATE TABLE user_profiles (...);
CREATE TABLE roles (...);
CREATE TABLE user_roles (...);

-- 4. Module tables
-- Academy tables...
-- HR tables...
-- Recruiting tables...
-- Trikala tables...

-- 5. Indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
-- ... all indexes

-- 6. RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
-- ... all RLS policies

-- 7. Triggers
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
-- ... all triggers

-- 8. Seed data
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator'),
  ('student', 'Academy student'),
  ('employee', 'IntimeESolutions employee'),
  ('candidate', 'Job seeker'),
  ('recruiter', 'Recruiter/sales'),
  ('client', 'Hiring company contact');
```

### Rollback Plan

```bash
# Before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
psql $DATABASE_URL < supabase/migrations/20251117000000_unified_schema.sql

# If migration fails
psql $DATABASE_URL < backup_20251117_120000.sql
```

---

## Relationships

### Core Relationships

```
user_profiles
  ├─> user_roles (many-to-many with roles)
  ├─> timesheets (one-to-many)
  ├─> topic_completions (one-to-many)
  ├─> job_applications (one-to-many)
  └─> ai_conversations (one-to-many)

roles
  ├─> user_roles (many-to-many with user_profiles)
  └─> role_permissions (many-to-many with permissions)

topics
  ├─> topic_content_items (one-to-many)
  ├─> topic_completions (one-to-many)
  └─> quizzes (one-to-many)

jobs
  ├─> job_applications (one-to-many)
  ├─> job_matches (one-to-many - AI suggestions)
  └─> placements (one-to-many)
```

---

## Anti-Patterns to Avoid

### ❌ Don't Do This

1. **Creating new user tables for each module**
   ```sql
   CREATE TABLE students (...);
   CREATE TABLE employees (...);
   CREATE TABLE candidates (...);
   ```

2. **Duplicate tables across modules**
   ```sql
   CREATE TABLE hr_timesheets (...);
   CREATE TABLE trikala_timesheets (...);  -- BAD!
   ```

3. **Hard deletes for critical data**
   ```sql
   DELETE FROM user_profiles WHERE id = 'user-123';  -- BAD!
   ```

4. **Missing RLS policies**
   ```sql
   CREATE TABLE sensitive_data (...);
   -- Forgot to add RLS policies!
   ```

5. **Schema changes without migrations**
   ```sql
   -- Running raw SQL in production console
   ALTER TABLE users ADD COLUMN salary INTEGER;  -- BAD!
   ```

### ✅ Do This Instead

1. **Add role-specific columns to `user_profiles`**
   ```sql
   ALTER TABLE user_profiles
   ADD COLUMN student_cohort TEXT,
   ADD COLUMN employee_title TEXT;
   ```

2. **Reuse tables across modules via proper relationships**
   ```sql
   -- Single timesheets table, use type column
   CREATE TABLE timesheets (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES user_profiles(id),
     type TEXT,  -- 'hr_payroll', 'productivity_tracking'
     -- ...
   );
   ```

3. **Soft delete with `deleted_at`**
   ```sql
   UPDATE user_profiles SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = 'user-123';
   ```

4. **RLS on ALL tables**
   ```sql
   ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "..." ON sensitive_data FOR SELECT USING (...);
   ```

5. **All changes via migrations**
   ```bash
   # Create migration file
   supabase migration new add_salary_column

   # Edit migration file
   # supabase/migrations/20251117_add_salary_column.sql
   ALTER TABLE user_profiles ADD COLUMN salary INTEGER;

   # Apply migration
   supabase db push
   ```

---

## Validation Checklist

Before deploying schema to production:

- [ ] All tables have RLS policies enabled
- [ ] All tables have audit fields (created_at, created_by, updated_at, updated_by, deleted_at, deleted_by)
- [ ] All foreign keys have proper cascade rules (ON DELETE CASCADE or SET NULL)
- [ ] All indexes created for frequently queried columns
- [ ] All RLS policies tested (can't access other user/org data)
- [ ] Triggers working (updated_at auto-updates)
- [ ] Soft delete tested (deleted records excluded from queries)
- [ ] Migration file runs successfully from scratch
- [ ] Rollback tested (backup restore works)
- [ ] Seed data inserted successfully

---

**Status:** v3 Foundation Architecture
**Last Updated:** 2025-11-17
**Owner:** Architecture Team
