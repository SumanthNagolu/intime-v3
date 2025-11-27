# Phase 6: Training Academy

## Component Overview

**Priority:** MEDIUM
**Dependencies:** Authentication (Phase 0)
**Blocks:** None

---

## Scope

### Database Tables
- `courses` - Course catalog
- `cohorts` - Course instances/batches
- `enrollments` - Student enrollments
- `course_progress` - Progress tracking
- `assignments` - Course assignments
- `submissions` (academy) - Assignment submissions
- `certificates` - Issued certificates
- `xp_transactions` - Gamification XP

### Server Actions (TO CREATE)
- `src/app/actions/academy-courses.ts` - Course CRUD
- `src/app/actions/academy-cohorts.ts` - Cohort management
- `src/app/actions/academy-enrollments.ts` - Enrollment workflow
- `src/app/actions/academy-progress.ts` - Progress tracking
- `src/app/actions/academy-certificates.ts` - Certificate generation

### UI Components
- `src/components/academy/AcademyPortal.tsx`
- `src/components/academy/CandidateDashboard.tsx`
- `src/components/academy/InstructorDashboard.tsx`
- `src/components/academy/CohortDetail.tsx`
- `src/components/academy/XPProgress.tsx`
- `src/components/academy/StreakFlame.tsx`
- `src/components/academy/CertificateGenerator.tsx`
- `src/components/academy/BiometricBackground.tsx`
- `src/components/PublicAcademy.tsx`

### Pages
- `src/app/academy/dashboard/page.tsx`
- `src/app/training/page.tsx`

---

## Phase 1: Audit

### 1.1 Schema Check

Read and verify:
```
src/lib/db/schema/academy.ts (if exists)
```

Check for:
- `courses` with modules structure
- `cohorts` with schedule
- `enrollments` linking students to cohorts
- `course_progress` tracking completion
- Gamification tables (xp, streaks)

### 1.2 Component Inventory

Key components:
- AcademyPortal.tsx - Main entry
- CandidateDashboard.tsx - Student view
- InstructorDashboard.tsx - Trainer view
- XPProgress.tsx - Gamification display
- CertificateGenerator.tsx - Generate certs

---

## Phase 2: Database Fixes

### 2.1 Academy Tables

```sql
-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Course info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  thumbnail_url TEXT,

  -- Structure
  modules JSONB DEFAULT '[]', -- [{id, title, lessons: [{id, title, content_url, duration}]}]
  total_duration_hours INTEGER,
  total_lessons INTEGER,

  -- Settings
  is_published BOOLEAN DEFAULT false,
  is_self_paced BOOLEAN DEFAULT true,
  max_students INTEGER,

  -- Pricing (if applicable)
  price NUMERIC(10,2) DEFAULT 0,

  -- Prerequisites
  prerequisite_course_ids UUID[],
  skill_requirements TEXT[],

  -- Certification
  certificate_template_id UUID,
  passing_score INTEGER DEFAULT 70,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Cohorts (course instances)
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL, -- "Java Batch 2025-Q1"
  description TEXT,

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  schedule_info JSONB, -- {days: ['Mon', 'Wed'], time: '10:00', timezone: 'EST'}

  -- Status
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
  max_students INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,

  -- Instructor
  instructor_id UUID REFERENCES user_profiles(id),

  -- Settings
  is_enrolling BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id),
  student_id UUID NOT NULL REFERENCES user_profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Status
  status TEXT DEFAULT 'enrolled', -- enrolled, active, completed, dropped, failed
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Progress
  progress_percentage INTEGER DEFAULT 0,
  current_module_id TEXT,
  current_lesson_id TEXT,

  -- Scores
  quiz_average NUMERIC(5,2),
  assignment_average NUMERIC(5,2),
  final_grade NUMERIC(5,2),

  -- Certificate
  certificate_id UUID,
  certificate_issued_at TIMESTAMPTZ,

  -- Attendance
  attendance_percentage NUMERIC(5,2) DEFAULT 100,
  absences INTEGER DEFAULT 0,

  UNIQUE(cohort_id, student_id)
);

-- Course progress (lesson-level tracking)
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  student_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Progress
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,

  -- Quiz results
  quiz_score NUMERIC(5,2),
  quiz_attempts INTEGER DEFAULT 0,

  UNIQUE(enrollment_id, module_id, lesson_id)
);

-- XP Transactions (gamification)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- XP details
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'lesson_complete', 'quiz_pass', 'streak_bonus', 'certificate'
  reference_type TEXT, -- 'lesson', 'quiz', 'assignment', 'certificate'
  reference_id TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  student_id UUID NOT NULL REFERENCES user_profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Certificate details
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),

  -- Content
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completion_date DATE NOT NULL,
  grade NUMERIC(5,2),

  -- Files
  pdf_url TEXT,
  verification_url TEXT,

  -- Validity
  valid_until DATE,
  is_revoked BOOLEAN DEFAULT false
);

-- Learning streaks
CREATE TABLE IF NOT EXISTS learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id),

  -- Streak data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Stats
  total_learning_days INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0
);
```

### 2.2 RLS Policies

```sql
-- Students can see their org's courses
CREATE POLICY "academy_courses" ON courses FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Students can see their cohorts
CREATE POLICY "academy_cohorts" ON cohorts FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Students see only their enrollments
CREATE POLICY "academy_enrollments_own" ON enrollments FOR SELECT USING (
  student_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    AND r.name IN ('trainer', 'admin', 'super_admin')
  )
);

-- Progress: own only
CREATE POLICY "academy_progress_own" ON course_progress FOR ALL USING (
  student_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
);
```

---

## Phase 3: Server Actions

### 3.1 Course Management (Trainer)

Create `src/app/actions/academy-courses.ts`:

```typescript
'use server';

// List courses
export async function listCoursesAction(filters?: {
  isPublished?: boolean;
  search?: string;
}): Promise<ActionResult<Course[]>>

// Get course with modules
export async function getCourseAction(courseId: string): Promise<ActionResult<CourseWithModules>>

// Create course (trainer only)
export async function createCourseAction(input: {
  title: string;
  description?: string;
  modules?: Module[];
  isSelfPaced?: boolean;
}): Promise<ActionResult<Course>>

// Update course
export async function updateCourseAction(
  courseId: string,
  input: Partial<Course>
): Promise<ActionResult<Course>>

// Publish course
export async function publishCourseAction(courseId: string): Promise<ActionResult<Course>>

// Add module to course
export async function addModuleAction(courseId: string, module: Module): Promise<ActionResult<Course>>

// Update module
export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  module: Partial<Module>
): Promise<ActionResult<Course>>
```

### 3.2 Cohort Management

Create `src/app/actions/academy-cohorts.ts`:

```typescript
'use server';

// List cohorts
export async function listCohortsAction(filters?: {
  courseId?: string;
  status?: string;
  instructorId?: string;
}): Promise<ActionResult<Cohort[]>>

// Get cohort with students
export async function getCohortAction(cohortId: string): Promise<ActionResult<CohortWithStudents>>

// Create cohort
export async function createCohortAction(input: {
  courseId: string;
  name: string;
  startDate: string;
  endDate?: string;
  instructorId?: string;
  maxStudents?: number;
}): Promise<ActionResult<Cohort>>

// Update cohort
export async function updateCohortAction(
  cohortId: string,
  input: Partial<Cohort>
): Promise<ActionResult<Cohort>>

// Start cohort
export async function startCohortAction(cohortId: string): Promise<ActionResult<Cohort>>

// Complete cohort
export async function completeCohortAction(cohortId: string): Promise<ActionResult<Cohort>>
```

### 3.3 Enrollment Workflow

Create `src/app/actions/academy-enrollments.ts`:

```typescript
'use server';

// List enrollments (for trainer)
export async function listEnrollmentsAction(filters?: {
  cohortId?: string;
  status?: string;
}): Promise<ActionResult<Enrollment[]>>

// Get my enrollments (for student)
export async function getMyEnrollmentsAction(): Promise<ActionResult<EnrollmentWithCourse[]>>

// Enroll in cohort
export async function enrollInCohortAction(cohortId: string): Promise<ActionResult<Enrollment>>

// Drop enrollment
export async function dropEnrollmentAction(enrollmentId: string): Promise<ActionResult<void>>

// Get enrollment progress
export async function getEnrollmentProgressAction(
  enrollmentId: string
): Promise<ActionResult<EnrollmentProgress>>
```

### 3.4 Progress Tracking

Create `src/app/actions/academy-progress.ts`:

```typescript
'use server';

// Mark lesson started
export async function startLessonAction(
  enrollmentId: string,
  moduleId: string,
  lessonId: string
): Promise<ActionResult<void>>

// Mark lesson completed
export async function completeLessonAction(
  enrollmentId: string,
  moduleId: string,
  lessonId: string
): Promise<ActionResult<{ xpEarned: number }>>

// Update time spent
export async function updateTimeSpentAction(
  enrollmentId: string,
  moduleId: string,
  lessonId: string,
  seconds: number
): Promise<ActionResult<void>>

// Submit quiz
export async function submitQuizAction(
  enrollmentId: string,
  moduleId: string,
  lessonId: string,
  answers: Record<string, string>
): Promise<ActionResult<{ score: number; passed: boolean; xpEarned: number }>>

// Get student dashboard data
export async function getStudentDashboardAction(): Promise<ActionResult<StudentDashboard>>

// Update streak
export async function updateStreakAction(): Promise<ActionResult<StreakInfo>>
```

### 3.5 Certificates

Create `src/app/actions/academy-certificates.ts`:

```typescript
'use server';

// Generate certificate (on course completion)
export async function generateCertificateAction(
  enrollmentId: string
): Promise<ActionResult<Certificate>>

// Get my certificates
export async function getMyCertificatesAction(): Promise<ActionResult<Certificate[]>>

// Verify certificate
export async function verifyCertificateAction(
  certificateNumber: string
): Promise<ActionResult<CertificateVerification>>

// Download certificate PDF
export async function downloadCertificateAction(
  certificateId: string
): Promise<ActionResult<{ url: string }>>
```

---

## Phase 4: UI Integration

### 4.1 CandidateDashboard.tsx

Student view:
- Current enrollments
- Progress bars
- XP and streak display
- Upcoming lessons
- Recent certificates

### 4.2 InstructorDashboard.tsx

Trainer view:
- Active cohorts
- Student progress overview
- Pending quiz reviews
- Attendance tracking

### 4.3 XPProgress.tsx

Gamification display:
```typescript
const { data: dashboard } = await getStudentDashboardAction();

return (
  <div>
    <XPBar current={dashboard.totalXp} level={dashboard.level} />
    <StreakFlame streak={dashboard.streak} />
    <BadgeGrid badges={dashboard.badges} />
  </div>
);
```

### 4.4 CohortDetail.tsx

Cohort management:
- Student roster
- Progress by student
- Module completion rates
- Attendance sheet

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/academy-workflows.spec.ts`

```typescript
test.describe('Academy Module', () => {

  test.describe('Student Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'student@intime.com', 'TestPass123!');
    });

    test('can view available courses');
    test('can enroll in cohort');
    test('can view course content');
    test('can start lesson');
    test('can complete lesson and earn XP');
    test('can submit quiz');
    test('streak updates on daily activity');
    test('can view certificates');
    test('can download certificate PDF');
  });

  test.describe('Trainer Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'trainer@intime.com', 'TestPass123!');
    });

    test('can view trainer dashboard');
    test('can create new course');
    test('can add modules to course');
    test('can publish course');
    test('can create cohort');
    test('can view student progress');
    test('can mark student complete');
  });

  test.describe('Gamification', () => {
    test('XP earned on lesson completion');
    test('streak increases on consecutive days');
    test('streak resets after missed day');
    test('level up notification shown');
  });

  test.describe('Certificates', () => {
    test('certificate generated on course completion');
    test('certificate verification works');
    test('certificate PDF downloads');
  });
});
```

---

## Phase 6: Verification Checklist

### Database
- [ ] courses table exists
- [ ] cohorts table exists
- [ ] enrollments table exists
- [ ] course_progress table exists
- [ ] xp_transactions table exists
- [ ] certificates table exists
- [ ] learning_streaks table exists
- [ ] All RLS policies active

### Server Actions
- [ ] Course CRUD works (trainer)
- [ ] Cohort management works
- [ ] Enrollment workflow works
- [ ] Progress tracking works
- [ ] Quiz submission works
- [ ] XP transactions record
- [ ] Streak updates work
- [ ] Certificate generation works

### UI
- [ ] CandidateDashboard shows real data
- [ ] InstructorDashboard shows cohorts
- [ ] Course content displays
- [ ] Progress bars update
- [ ] XP display works
- [ ] Streak flame shows
- [ ] Certificate downloads

### E2E Tests
- [ ] All academy scenarios passing

---

## Next Step

When complete, run:
```
Execute /rollout/08-client
```
