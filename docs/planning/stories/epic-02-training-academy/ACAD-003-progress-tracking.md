# ACAD-003: Create Progress Tracking System

**Story Points:** 6
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** CRITICAL

---

## User Story

As a **Student**,
I want **the system to track my progress through courses automatically**,
So that **I can see what I've completed, earn XP points, and unlock next topics**.

---

## Acceptance Criteria

- [ ] `topic_completions` table tracks completed topics per student
- [ ] `xp_transactions` table records XP awarded for completions
- [ ] Completion triggers XP award (configurable per topic type)
- [ ] Sequential unlocking (must complete Topic 1 before accessing Topic 2)
- [ ] Completion percentage auto-calculated on enrollment record
- [ ] Event published when topic completed (for achievements, leaderboards)
- [ ] Idempotent completion (can't complete same topic twice)
- [ ] Bulk completion query (get all completions for a module/course)
- [ ] Progress analytics (topics completed per day, completion velocity)

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/023_create_progress_tracking.sql`

```sql
-- ============================================================================
-- TOPIC_COMPLETIONS: Track student progress through topics
-- ============================================================================

CREATE TABLE topic_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who & What
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,

  -- Completion details
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER, -- How long student spent on topic
  attempts INTEGER DEFAULT 1, -- For quizzes/labs that can be retried

  -- Quiz/assessment results
  score NUMERIC(5,2), -- For quizzes (0-100)
  passed BOOLEAN, -- Did they pass the topic (quizzes must score 80%+)

  -- Metadata
  completion_method TEXT CHECK (
    completion_method IN ('video_watched', 'reading_completed', 'quiz_passed', 'lab_submitted', 'project_submitted')
  ),
  notes TEXT, -- Optional student notes

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_topic_completion UNIQUE (user_id, topic_id),
  CONSTRAINT valid_score CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

-- ============================================================================
-- XP_TRANSACTIONS: Gamification points ledger
-- ============================================================================

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- What
  xp_amount INTEGER NOT NULL CHECK (xp_amount != 0), -- Can be negative (penalties)
  xp_type TEXT NOT NULL CHECK (
    xp_type IN ('topic_completion', 'quiz_passed', 'lab_submitted', 'project_graded', 'badge_earned', 'bonus', 'penalty')
  ),

  -- Why
  reason TEXT NOT NULL,
  reference_id UUID, -- topic_id, badge_id, etc.
  reference_type TEXT, -- 'topic', 'badge', 'achievement', etc.

  -- When
  awarded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  awarded_by UUID REFERENCES user_profiles(id), -- For manual awards
  metadata JSONB -- Additional context
);

-- ============================================================================
-- USER_XP_TOTALS: Materialized view for leaderboards
-- ============================================================================

CREATE MATERIALIZED VIEW user_xp_totals AS
SELECT
  user_id,
  SUM(xp_amount) AS total_xp,
  COUNT(*) AS transaction_count,
  MAX(awarded_at) AS last_xp_earned
FROM xp_transactions
GROUP BY user_id;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_user_xp_totals_user_id ON user_xp_totals(user_id);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Topic completions
CREATE INDEX idx_completions_user_id ON topic_completions(user_id);
CREATE INDEX idx_completions_enrollment_id ON topic_completions(enrollment_id);
CREATE INDEX idx_completions_topic_id ON topic_completions(topic_id);
CREATE INDEX idx_completions_completed_at ON topic_completions(completed_at DESC);

-- XP transactions
CREATE INDEX idx_xp_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_type ON xp_transactions(xp_type);
CREATE INDEX idx_xp_awarded_at ON xp_transactions(awarded_at DESC);
CREATE INDEX idx_xp_reference ON xp_transactions(reference_type, reference_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Topic completions
ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own completions"
  ON topic_completions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'trainer'))
    )
  );

CREATE POLICY "Users create own completions"
  ON topic_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- XP transactions (read-only for students)
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own XP"
  ON xp_transactions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'trainer'))
    )
  );

CREATE POLICY "System creates XP transactions"
  ON xp_transactions
  FOR INSERT
  WITH CHECK (true); -- System/functions can award XP

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Mark topic as complete
CREATE OR REPLACE FUNCTION complete_topic(
  p_user_id UUID,
  p_enrollment_id UUID,
  p_topic_id UUID,
  p_score NUMERIC DEFAULT NULL,
  p_time_spent_seconds INTEGER DEFAULT NULL,
  p_completion_method TEXT DEFAULT 'video_watched'
)
RETURNS UUID AS $$
DECLARE
  v_completion_id UUID;
  v_xp_amount INTEGER;
  v_topic_type TEXT;
  v_passed BOOLEAN;
  v_course_id UUID;
  v_module_id UUID;
BEGIN
  -- Get topic info
  SELECT mt.content_type, cm.course_id, mt.module_id
  INTO v_topic_type, v_course_id, v_module_id
  FROM module_topics mt
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE mt.id = p_topic_id;

  -- Determine if passed (quizzes require 80%+)
  IF v_topic_type = 'quiz' THEN
    v_passed := (p_score >= 80);
  ELSE
    v_passed := true;
  END IF;

  -- Only record completion if passed
  IF NOT v_passed THEN
    RAISE EXCEPTION 'Quiz score must be 80%% or higher to complete topic';
  END IF;

  -- Insert completion (idempotent - will fail if already completed)
  INSERT INTO topic_completions (
    user_id,
    enrollment_id,
    topic_id,
    score,
    passed,
    time_spent_seconds,
    completion_method
  ) VALUES (
    p_user_id,
    p_enrollment_id,
    p_topic_id,
    p_score,
    v_passed,
    p_time_spent_seconds,
    p_completion_method
  )
  ON CONFLICT (user_id, topic_id) DO NOTHING
  RETURNING id INTO v_completion_id;

  -- If already completed, return existing ID
  IF v_completion_id IS NULL THEN
    SELECT id INTO v_completion_id
    FROM topic_completions
    WHERE user_id = p_user_id AND topic_id = p_topic_id;

    RETURN v_completion_id;
  END IF;

  -- Award XP based on topic type
  v_xp_amount := CASE v_topic_type
    WHEN 'video' THEN 10
    WHEN 'reading' THEN 5
    WHEN 'quiz' THEN 20
    WHEN 'lab' THEN 30
    WHEN 'project' THEN 50
    ELSE 10
  END;

  -- Bonus XP for perfect quiz scores
  IF v_topic_type = 'quiz' AND p_score = 100 THEN
    v_xp_amount := v_xp_amount + 10;
  END IF;

  -- Award XP
  INSERT INTO xp_transactions (
    user_id,
    xp_amount,
    xp_type,
    reason,
    reference_id,
    reference_type
  ) VALUES (
    p_user_id,
    v_xp_amount,
    'topic_completion',
    'Completed: ' || (SELECT title FROM module_topics WHERE id = p_topic_id),
    p_topic_id,
    'topic'
  );

  -- Update enrollment progress
  PERFORM update_enrollment_progress(p_enrollment_id);

  -- Publish completion event
  PERFORM publish_event(
    'topic.completed',
    jsonb_build_object(
      'user_id', p_user_id,
      'enrollment_id', p_enrollment_id,
      'topic_id', p_topic_id,
      'course_id', v_course_id,
      'module_id', v_module_id,
      'score', p_score,
      'xp_awarded', v_xp_amount
    ),
    jsonb_build_object('source', 'complete_topic'),
    p_user_id
  );

  RETURN v_completion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update enrollment completion percentage
CREATE OR REPLACE FUNCTION update_enrollment_progress(p_enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_topics INTEGER;
  v_completed_topics INTEGER;
  v_percentage INTEGER;
  v_course_id UUID;
  v_user_id UUID;
BEGIN
  -- Get enrollment details
  SELECT course_id, user_id INTO v_course_id, v_user_id
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  -- Count total required topics in course
  SELECT COUNT(*) INTO v_total_topics
  FROM module_topics mt
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE cm.course_id = v_course_id
    AND mt.is_published = true
    AND mt.is_required = true;

  -- Count completed topics
  SELECT COUNT(*) INTO v_completed_topics
  FROM topic_completions tc
  JOIN module_topics mt ON mt.id = tc.topic_id
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE tc.enrollment_id = p_enrollment_id
    AND cm.course_id = v_course_id
    AND mt.is_required = true;

  -- Calculate percentage
  IF v_total_topics > 0 THEN
    v_percentage := ROUND((v_completed_topics::NUMERIC / v_total_topics) * 100);
  ELSE
    v_percentage := 0;
  END IF;

  -- Update enrollment
  UPDATE student_enrollments
  SET completion_percentage = v_percentage
  WHERE id = p_enrollment_id;

  -- Check for graduation (100% completion)
  IF v_percentage = 100 THEN
    PERFORM update_enrollment_status(p_enrollment_id, 'completed');

    -- Publish graduation event
    PERFORM publish_event(
      'course.graduated',
      jsonb_build_object(
        'user_id', v_user_id,
        'enrollment_id', p_enrollment_id,
        'course_id', v_course_id,
        'completion_date', NOW()
      ),
      jsonb_build_object('source', 'update_enrollment_progress'),
      v_user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if topic is unlocked
CREATE OR REPLACE FUNCTION is_topic_unlocked(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_ids UUID[];
  v_completed_topic_ids UUID[];
BEGIN
  -- Get prerequisite topic IDs
  SELECT prerequisite_topic_ids INTO v_prerequisite_ids
  FROM module_topics
  WHERE id = p_topic_id;

  -- If no prerequisites, topic is unlocked
  IF v_prerequisite_ids IS NULL OR array_length(v_prerequisite_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Get completed topic IDs for this user
  SELECT ARRAY_AGG(topic_id) INTO v_completed_topic_ids
  FROM topic_completions
  WHERE user_id = p_user_id;

  -- Check if all prerequisites are completed
  RETURN v_prerequisite_ids <@ COALESCE(v_completed_topic_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's total XP
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT COALESCE(SUM(xp_amount), 0) INTO v_total_xp
  FROM xp_transactions
  WHERE user_id = p_user_id;

  RETURN v_total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Refresh materialized view when XP awarded
CREATE OR REPLACE FUNCTION refresh_xp_totals()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_xp_totals;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_xp_totals
AFTER INSERT ON xp_transactions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_xp_totals();
```

### Rollback Migration

Create file: `supabase/migrations/023_create_progress_tracking_rollback.sql`

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_refresh_xp_totals ON xp_transactions;
DROP FUNCTION IF EXISTS refresh_xp_totals();

-- Drop functions
DROP FUNCTION IF EXISTS get_user_total_xp(UUID);
DROP FUNCTION IF EXISTS is_topic_unlocked(UUID, UUID);
DROP FUNCTION IF EXISTS update_enrollment_progress(UUID);
DROP FUNCTION IF EXISTS complete_topic(UUID, UUID, UUID, NUMERIC, INTEGER, TEXT);

-- Drop policies
DROP POLICY IF EXISTS "System creates XP transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Users view own XP" ON xp_transactions;
DROP POLICY IF EXISTS "Users create own completions" ON topic_completions;
DROP POLICY IF EXISTS "Users view own completions" ON topic_completions;

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS user_xp_totals;

-- Drop tables
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS topic_completions CASCADE;
```

### TypeScript Types

Create file: `src/types/progress.ts`

```typescript
export interface TopicCompletion {
  id: string;
  user_id: string;
  enrollment_id: string;
  topic_id: string;
  completed_at: string;
  time_spent_seconds: number | null;
  attempts: number;
  score: number | null;
  passed: boolean | null;
  completion_method: 'video_watched' | 'reading_completed' | 'quiz_passed' | 'lab_submitted' | 'project_submitted';
  notes: string | null;
  created_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  xp_type: 'topic_completion' | 'quiz_passed' | 'lab_submitted' | 'project_graded' | 'badge_earned' | 'bonus' | 'penalty';
  reason: string;
  reference_id: string | null;
  reference_type: string | null;
  awarded_at: string;
  awarded_by: string | null;
  metadata: Record<string, any> | null;
}

export interface UserXPTotal {
  user_id: string;
  total_xp: number;
  transaction_count: number;
  last_xp_earned: string;
}

export interface CompleteTopicParams {
  userId: string;
  enrollmentId: string;
  topicId: string;
  score?: number;
  timeSpentSeconds?: number;
  completionMethod?: 'video_watched' | 'reading_completed' | 'quiz_passed' | 'lab_submitted' | 'project_submitted';
}
```

### tRPC Router

Create file: `src/server/routers/progress.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';

export const progressRouter = router({
  // Complete a topic
  completeTopic: protectedProcedure
    .input(z.object({
      enrollmentId: z.string().uuid(),
      topicId: z.string().uuid(),
      score: z.number().min(0).max(100).optional(),
      timeSpentSeconds: z.number().int().positive().optional(),
      completionMethod: z.enum(['video_watched', 'reading_completed', 'quiz_passed', 'lab_submitted', 'project_submitted']).default('video_watched'),
    }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('complete_topic', {
        p_user_id: ctx.user.id,
        p_enrollment_id: input.enrollmentId,
        p_topic_id: input.topicId,
        p_score: input.score || null,
        p_time_spent_seconds: input.timeSpentSeconds || null,
        p_completion_method: input.completionMethod,
      });

      if (error) {
        throw new Error(`Failed to complete topic: ${error.message}`);
      }

      return { completionId: data };
    }),

  // Get completions for enrollment
  getEnrollmentProgress: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('topic_completions')
        .select(`
          *,
          topic:module_topics(
            id,
            slug,
            title,
            content_type,
            module:course_modules(
              id,
              title,
              module_number
            )
          )
        `)
        .eq('enrollment_id', input.enrollmentId)
        .eq('user_id', ctx.user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch progress: ${error.message}`);
      }

      return data;
    }),

  // Check if topic is unlocked
  isTopicUnlocked: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: ctx.user.id,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new Error(`Failed to check unlock status: ${error.message}`);
      }

      return { unlocked: data };
    }),

  // Get user's XP transactions
  getMyXP: protectedProcedure
    .input(z.object({
      limit: z.number().int().positive().default(50),
      xpType: z.enum(['topic_completion', 'quiz_passed', 'lab_submitted', 'project_graded', 'badge_earned', 'bonus', 'penalty']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      let query = supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('awarded_at', { ascending: false })
        .limit(input.limit);

      if (input.xpType) {
        query = query.eq('xp_type', input.xpType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch XP: ${error.message}`);
      }

      return data;
    }),

  // Get user's total XP
  getMyTotalXP: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_user_total_xp', {
        p_user_id: ctx.user.id,
      });

      if (error) {
        throw new Error(`Failed to fetch total XP: ${error.message}`);
      }

      return { totalXP: data };
    }),
});
```

---

## Testing

### Unit Tests

Create file: `src/lib/academy/__tests__/progress.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Progress Tracking', () => {
  let supabase: ReturnType<typeof createAdminClient>;

  beforeEach(() => {
    supabase = createAdminClient();
  });

  it('should complete topic and award XP', async () => {
    const { data: completionId, error } = await supabase.rpc('complete_topic', {
      p_user_id: 'test-user-id',
      p_enrollment_id: 'test-enrollment-id',
      p_topic_id: 'test-topic-id',
      p_completion_method: 'video_watched',
    });

    expect(error).toBeNull();
    expect(completionId).toBeTruthy();

    // Verify XP awarded
    const { data: xp } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', 'test-user-id')
      .eq('reference_id', 'test-topic-id')
      .single();

    expect(xp.xp_amount).toBeGreaterThan(0);
  });

  it('should prevent duplicate completions', async () => {
    // Complete once
    await supabase.rpc('complete_topic', {
      p_user_id: 'test-user-id',
      p_enrollment_id: 'test-enrollment-id',
      p_topic_id: 'test-topic-id',
    });

    // Try to complete again - should return existing completion ID
    const { data: completionId2 } = await supabase.rpc('complete_topic', {
      p_user_id: 'test-user-id',
      p_enrollment_id: 'test-enrollment-id',
      p_topic_id: 'test-topic-id',
    });

    // Should not award XP twice
    const { data: xpTransactions } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', 'test-user-id')
      .eq('reference_id', 'test-topic-id');

    expect(xpTransactions).toHaveLength(1);
  });

  it('should calculate enrollment progress correctly', async () => {
    // Complete 5 out of 10 topics
    // ... (test implementation)

    const { data: enrollment } = await supabase
      .from('student_enrollments')
      .select('completion_percentage')
      .eq('id', 'test-enrollment-id')
      .single();

    expect(enrollment.completion_percentage).toBe(50);
  });
});
```

---

## Dependencies

### From Epic 1
- **FOUND-007** (event bus) - Required for completion events

### From Epic 2
- **ACAD-001** (courses) - Required for topic references
- **ACAD-002** (enrollments) - Required for tracking progress per enrollment

### Blocks
- **ACAD-016** (Achievement System) - Needs XP data
- **ACAD-017** (Leaderboards) - Needs XP totals
- **ACAD-019** (Student Dashboard) - Displays progress

---

## Documentation

### Update Files

1. **Database Schema Docs** (`docs/architecture/DATABASE-SCHEMA.md`)
   - Add progress tracking tables
   - Explain XP award logic
   - Document completion percentage calculation

2. **API Documentation** (`docs/api/ACADEMY-API.md`)
   - Document progress endpoints

---

## Verification Queries

```sql
-- Test topic completion
SELECT complete_topic(
  'user-id',
  'enrollment-id',
  'topic-id',
  85.5,
  600,
  'quiz_passed'
);

-- Verify completion and XP
SELECT
  tc.*,
  xp.xp_amount,
  xp.reason
FROM topic_completions tc
LEFT JOIN xp_transactions xp ON xp.reference_id = tc.topic_id
WHERE tc.user_id = 'user-id';

-- Check enrollment progress
SELECT
  se.completion_percentage,
  COUNT(tc.id) AS completed_topics
FROM student_enrollments se
LEFT JOIN topic_completions tc ON tc.enrollment_id = se.id
WHERE se.id = 'enrollment-id'
GROUP BY se.id, se.completion_percentage;

-- Get leaderboard
SELECT
  up.full_name,
  uxp.total_xp,
  uxp.last_xp_earned
FROM user_xp_totals uxp
JOIN user_profiles up ON up.id = uxp.user_id
ORDER BY uxp.total_xp DESC
LIMIT 10;
```

---

## Notes

- **Idempotent completions:** Can't complete same topic twice (unique constraint)
- **XP awards:** Configurable per content type (video=10, quiz=20, lab=30, project=50)
- **Sequential unlocking:** Prerequisites enforced via `is_topic_unlocked()` function
- **Auto-graduation:** 100% completion triggers course.graduated event
- **Materialized view:** XP totals cached for leaderboard performance

---

**Related Stories:**
- **Next:** ACAD-004 (Content Upload System)
- **Depends On:** ACAD-001, ACAD-002, FOUND-007
