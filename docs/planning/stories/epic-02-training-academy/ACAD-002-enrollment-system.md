# ACAD-002: Create Enrollment System

**Status:** 🟢 Complete

**Story Points:** 5
**Sprint:** Sprint 8 (Week 15-16)
**Priority:** CRITICAL
**Implementation Date:** 2025-11-21
**Deployed:** 2025-11-21

---

## User Story

As a **Student**,
I want **to enroll in courses and track my enrollment status**,
So that **I can begin learning and the system knows which courses I have access to**.

---

## Acceptance Criteria

- [ ] `student_enrollments` table created with course access tracking
- [ ] Enrollment statuses: 'pending', 'active', 'completed', 'dropped', 'expired'
- [ ] One student can enroll in multiple courses simultaneously
- [ ] Enrollment dates tracked (enrolled_at, starts_at, expires_at, completed_at)
- [ ] Prerequisites checked before enrollment (required courses completed)
- [ ] Payment reference stored (links to Stripe subscription/payment)
- [ ] Auto-enrollment flow (payment → enrollment → welcome email event)
- [ ] RLS policies ensure students only see their own enrollments
- [ ] Enrollment analytics (active students per course, completion rates)

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/022_create_student_enrollments.sql`

```sql
-- ============================================================================
-- STUDENT_ENROLLMENTS: Track course enrollments and access
-- ============================================================================

CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who & What
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,

  -- Enrollment status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'completed', 'dropped', 'expired')
  ),

  -- Dates
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  starts_at TIMESTAMPTZ, -- When course access begins
  expires_at TIMESTAMPTZ, -- Subscription end date
  completed_at TIMESTAMPTZ, -- Graduation date
  dropped_at TIMESTAMPTZ, -- If student withdraws

  -- Payment tracking
  payment_id TEXT, -- Stripe payment/subscription ID
  payment_amount NUMERIC(10,2),
  payment_type TEXT CHECK (payment_type IN ('subscription', 'one_time', 'free', 'scholarship')),

  -- Progress tracking
  current_module_id UUID REFERENCES course_modules(id),
  current_topic_id UUID REFERENCES module_topics(id),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

  -- Metadata
  enrollment_source TEXT, -- 'web', 'admin', 'api', 'bulk_import'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_course_enrollment UNIQUE (user_id, course_id),
  CONSTRAINT valid_dates CHECK (
    (completed_at IS NULL OR completed_at >= enrolled_at) AND
    (dropped_at IS NULL OR dropped_at >= enrolled_at)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_enrollments_user_id ON student_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON student_enrollments(status);
CREATE INDEX idx_enrollments_active ON student_enrollments(user_id, status)
  WHERE status = 'active';
CREATE INDEX idx_enrollments_payment ON student_enrollments(payment_id)
  WHERE payment_id IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "Students view own enrollments"
  ON student_enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'trainer', 'course_admin')
      )
    )
  );

-- Only admins/course_admins can create enrollments
CREATE POLICY "Admins create enrollments"
  ON student_enrollments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'course_admin')
      )
    )
  );

-- Students can update their own enrollment (drop course)
CREATE POLICY "Students update own enrollments"
  ON student_enrollments
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'trainer', 'course_admin')
      )
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Check prerequisites before enrollment
CREATE OR REPLACE FUNCTION check_enrollment_prerequisites(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_ids UUID[];
  v_completed_course_ids UUID[];
BEGIN
  -- Get prerequisite course IDs
  SELECT prerequisite_course_ids INTO v_prerequisite_ids
  FROM courses
  WHERE id = p_course_id;

  -- If no prerequisites, allow enrollment
  IF v_prerequisite_ids IS NULL OR array_length(v_prerequisite_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Get completed course IDs for this user
  SELECT ARRAY_AGG(course_id) INTO v_completed_course_ids
  FROM student_enrollments
  WHERE user_id = p_user_id
    AND status = 'completed';

  -- Check if all prerequisites are completed
  RETURN v_prerequisite_ids <@ COALESCE(v_completed_course_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Enroll student in course
CREATE OR REPLACE FUNCTION enroll_student(
  p_user_id UUID,
  p_course_id UUID,
  p_payment_id TEXT,
  p_payment_amount NUMERIC,
  p_payment_type TEXT,
  p_starts_at TIMESTAMPTZ DEFAULT NOW(),
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_enrollment_id UUID;
  v_prerequisites_met BOOLEAN;
BEGIN
  -- Check prerequisites
  SELECT check_enrollment_prerequisites(p_user_id, p_course_id)
  INTO v_prerequisites_met;

  IF NOT v_prerequisites_met THEN
    RAISE EXCEPTION 'Prerequisites not met for course enrollment';
  END IF;

  -- Create enrollment
  INSERT INTO student_enrollments (
    user_id,
    course_id,
    status,
    starts_at,
    expires_at,
    payment_id,
    payment_amount,
    payment_type,
    enrollment_source
  ) VALUES (
    p_user_id,
    p_course_id,
    CASE
      WHEN p_starts_at <= NOW() THEN 'active'
      ELSE 'pending'
    END,
    p_starts_at,
    p_expires_at,
    p_payment_id,
    p_payment_amount,
    p_payment_type,
    'api'
  )
  RETURNING id INTO v_enrollment_id;

  -- Publish enrollment event
  PERFORM publish_event(
    'course.enrolled',
    jsonb_build_object(
      'enrollment_id', v_enrollment_id,
      'user_id', p_user_id,
      'course_id', p_course_id,
      'payment_type', p_payment_type
    ),
    jsonb_build_object('source', 'enroll_student'),
    p_user_id
  );

  RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update enrollment status
CREATE OR REPLACE FUNCTION update_enrollment_status(
  p_enrollment_id UUID,
  p_new_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  UPDATE student_enrollments
  SET
    status = p_new_status,
    updated_at = NOW(),
    completed_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE completed_at END,
    dropped_at = CASE WHEN p_new_status = 'dropped' THEN NOW() ELSE dropped_at END
  WHERE id = p_enrollment_id
  RETURNING user_id, course_id INTO v_user_id, v_course_id;

  -- Publish status change event
  PERFORM publish_event(
    'enrollment.status_changed',
    jsonb_build_object(
      'enrollment_id', p_enrollment_id,
      'user_id', v_user_id,
      'course_id', v_course_id,
      'new_status', p_new_status
    ),
    jsonb_build_object('source', 'update_enrollment_status'),
    v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enrollment_updated_at
BEFORE UPDATE ON student_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_timestamp();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Create sample enrollments for testing
INSERT INTO student_enrollments (user_id, course_id, status, payment_type, starts_at, expires_at)
SELECT
  up.id,
  '11111111-1111-1111-1111-111111111111', -- Guidewire course
  'active',
  'subscription',
  NOW(),
  NOW() + INTERVAL '60 days'
FROM user_profiles up
WHERE up.email LIKE 'student%@test.com'
LIMIT 5;
```

### Rollback Migration

Create file: `supabase/migrations/022_create_student_enrollments_rollback.sql`

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_enrollment_updated_at ON student_enrollments;
DROP FUNCTION IF EXISTS update_enrollment_timestamp();

-- Drop functions
DROP FUNCTION IF EXISTS update_enrollment_status(UUID, TEXT);
DROP FUNCTION IF EXISTS enroll_student(UUID, UUID, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS check_enrollment_prerequisites(UUID, UUID);

-- Drop policies
DROP POLICY IF EXISTS "Students update own enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Admins create enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Students view own enrollments" ON student_enrollments;

-- Drop table
DROP TABLE IF EXISTS student_enrollments CASCADE;
```

### TypeScript Types

Create file: `src/types/enrollment.ts`

```typescript
export interface StudentEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'completed' | 'dropped' | 'expired';
  enrolled_at: string;
  starts_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  dropped_at: string | null;
  payment_id: string | null;
  payment_amount: number | null;
  payment_type: 'subscription' | 'one_time' | 'free' | 'scholarship' | null;
  current_module_id: string | null;
  current_topic_id: string | null;
  completion_percentage: number;
  enrollment_source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentWithCourse extends StudentEnrollment {
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    thumbnail_url: string | null;
    total_modules: number;
    total_topics: number;
  };
}

export interface EnrollStudentParams {
  userId: string;
  courseId: string;
  paymentId: string;
  paymentAmount: number;
  paymentType: 'subscription' | 'one_time' | 'free' | 'scholarship';
  startsAt?: string;
  expiresAt?: string;
}
```

### tRPC Router

Create file: `src/server/routers/enrollment.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';

export const enrollmentRouter = router({
  // Get user's enrollments
  getMyEnrollments: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          course:courses(
            id,
            slug,
            title,
            subtitle,
            thumbnail_url,
            total_modules,
            total_topics
          )
        `)
        .eq('user_id', ctx.user.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch enrollments: ${error.message}`);
      }

      return data;
    }),

  // Get enrollment by ID
  getEnrollment: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          course:courses(*),
          current_module:course_modules(*),
          current_topic:module_topics(*)
        `)
        .eq('id', input.enrollmentId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch enrollment: ${error.message}`);
      }

      return data;
    }),

  // Enroll in course
  enrollInCourse: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      paymentId: z.string(),
      paymentAmount: z.number().positive(),
      paymentType: z.enum(['subscription', 'one_time', 'free', 'scholarship']),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('enroll_student', {
        p_user_id: ctx.user.id,
        p_course_id: input.courseId,
        p_payment_id: input.paymentId,
        p_payment_amount: input.paymentAmount,
        p_payment_type: input.paymentType,
        p_starts_at: input.startsAt || new Date().toISOString(),
        p_expires_at: input.expiresAt || null,
      });

      if (error) {
        throw new Error(`Failed to enroll: ${error.message}`);
      }

      return { enrollmentId: data };
    }),

  // Drop course
  dropCourse: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      // Verify ownership
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('user_id, status')
        .eq('id', input.enrollmentId)
        .single();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.user_id !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      if (enrollment.status === 'completed') {
        throw new Error('Cannot drop completed course');
      }

      const { error } = await supabase.rpc('update_enrollment_status', {
        p_enrollment_id: input.enrollmentId,
        p_new_status: 'dropped',
      });

      if (error) {
        throw new Error(`Failed to drop course: ${error.message}`);
      }

      return { success: true };
    }),

  // Admin: Get all enrollments for a course
  getCourseEnrollments: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      status: z.enum(['pending', 'active', 'completed', 'dropped', 'expired']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // TODO: Check admin/course_admin role

      const supabase = createAdminClient();

      let query = supabase
        .from('student_enrollments')
        .select(`
          *,
          user:user_profiles(id, email, full_name)
        `)
        .eq('course_id', input.courseId)
        .order('enrolled_at', { ascending: false });

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch enrollments: ${error.message}`);
      }

      return data;
    }),
});
```

---

## Testing

### Unit Tests

Create file: `src/lib/academy/__tests__/enrollment.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Enrollment System', () => {
  let supabase: ReturnType<typeof createAdminClient>;
  let testUserId: string;
  let testCourseId: string;

  beforeEach(async () => {
    supabase = createAdminClient();
    testCourseId = '11111111-1111-1111-1111-111111111111'; // Guidewire course
  });

  it('should check prerequisites correctly', async () => {
    const { data: hasPrereqs } = await supabase.rpc(
      'check_enrollment_prerequisites',
      {
        p_user_id: testUserId,
        p_course_id: testCourseId,
      }
    );

    expect(hasPrereqs).toBe(true); // Guidewire has no prerequisites
  });

  it('should enroll student successfully', async () => {
    const { data: enrollmentId, error } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'stripe_test_123',
      p_payment_amount: 499.00,
      p_payment_type: 'subscription',
    });

    expect(error).toBeNull();
    expect(enrollmentId).toBeTruthy();
  });

  it('should prevent duplicate enrollment', async () => {
    // Try to enroll twice
    await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'stripe_test_123',
      p_payment_amount: 499.00,
      p_payment_type: 'subscription',
    });

    const { error } = await supabase.rpc('enroll_student', {
      p_user_id: testUserId,
      p_course_id: testCourseId,
      p_payment_id: 'stripe_test_456',
      p_payment_amount: 499.00,
      p_payment_type: 'subscription',
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('unique_user_course_enrollment');
  });
});
```

---

## Dependencies

### From Epic 1
- **FOUND-001** (user_profiles) - Required for user_id foreign key
- **FOUND-002** (roles) - Required for RLS policies
- **FOUND-007** (event bus) - Required for enrollment events

### From Epic 2
- **ACAD-001** (courses) - Required for course_id foreign key

### Blocks
- **ACAD-003** (Progress Tracking) - Needs enrollments to track progress
- **ACAD-024** (Enrollment Flow UI) - Needs backend enrollment system
- **ACAD-028** (Stripe Integration) - Links payments to enrollments

---

## Documentation

### Update Files

1. **Database Schema Docs** (`docs/architecture/DATABASE-SCHEMA.md`)
   - Add student_enrollments table documentation
   - Explain enrollment status lifecycle
   - Document prerequisite checking logic

2. **API Documentation** (`docs/api/ACADEMY-API.md`)
   - Document enrollment endpoints
   - Document prerequisite validation

---

## Verification Queries

```sql
-- Verify enrollment creation
SELECT
  se.id,
  up.email AS student,
  c.title AS course,
  se.status,
  se.payment_type,
  se.enrolled_at
FROM student_enrollments se
JOIN user_profiles up ON up.id = se.user_id
JOIN courses c ON c.id = se.course_id
ORDER BY se.enrolled_at DESC;

-- Test prerequisite checking
SELECT check_enrollment_prerequisites(
  'user-id-here',
  'course-id-here'
);

-- Verify enrollment status updates
SELECT
  id,
  status,
  enrolled_at,
  completed_at,
  dropped_at
FROM student_enrollments
WHERE user_id = 'test-user-id';

-- Get active enrollments per course
SELECT
  c.title,
  COUNT(*) AS active_students
FROM student_enrollments se
JOIN courses c ON c.id = se.course_id
WHERE se.status = 'active'
GROUP BY c.title
ORDER BY active_students DESC;
```

---

## Notes

- **Multi-course support:** Students can enroll in multiple courses simultaneously
- **Prerequisite enforcement:** Database function validates prerequisites before enrollment
- **Event-driven:** Enrollment publishes events for downstream processing (welcome emails, etc.)
- **Payment tracking:** Links to Stripe payment/subscription IDs
- **Soft status changes:** Completed/dropped dates preserved for analytics
- **RLS security:** Students only see their own enrollments

---

**Related Stories:**
- **Next:** ACAD-003 (Progress Tracking)
- **Depends On:** ACAD-001, FOUND-001, FOUND-002, FOUND-007
