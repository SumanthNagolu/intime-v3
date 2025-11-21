# ACAD-001: Create Courses and Curriculum Tables

**Status:** ⚪ Not Started

**Story Points:** 5
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** CRITICAL (Blocks all Academy work)

---

## User Story

As a **Platform Architect**,
I want **a flexible course catalog system that supports any technical training**,
So that **we can offer Guidewire, Salesforce, AWS, and future courses without schema changes**.

---

## Acceptance Criteria

- [ ] `courses` table created with multi-course support (not hardcoded to Guidewire)
- [ ] `modules` table supports N modules per course (configurable)
- [ ] `topics` table supports M topics per module (flexible hierarchy)
- [ ] `lessons` table for granular content (videos, readings, quizzes, labs)
- [ ] Course metadata (pricing, duration, prerequisites) stored
- [ ] Module/topic sequencing enforced (order, prerequisites)
- [ ] Migration tested with 3 sample courses (Guidewire, Salesforce, AWS)
- [ ] Indexes created for performance (course_id, module_id, topic_id)

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/021_create_academy_courses.sql`

```sql
-- ============================================================================
-- COURSES: Multi-course catalog
-- ============================================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Course identity
  slug TEXT UNIQUE NOT NULL, -- 'guidewire-policycentdevelopment', 'salesforce-admin', 'aws-solutions-architect'
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,

  -- Curriculum structure
  total_modules INTEGER NOT NULL DEFAULT 0,
  total_topics INTEGER NOT NULL DEFAULT 0,
  estimated_duration_weeks INTEGER NOT NULL,

  -- Pricing
  price_monthly NUMERIC(10,2),
  price_one_time NUMERIC(10,2),
  is_included_in_all_access BOOLEAN DEFAULT true,

  -- Prerequisites
  prerequisite_course_ids UUID[], -- Array of course IDs required before enrollment
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),

  -- Media
  thumbnail_url TEXT,
  promo_video_url TEXT,

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- MODULES: High-level learning units (e.g., "Module 1: Insurance Fundamentals")
-- ============================================================================

CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Module identity
  slug TEXT NOT NULL, -- 'module-1-insurance-fundamentals'
  title TEXT NOT NULL,
  description TEXT,

  -- Sequencing
  module_number INTEGER NOT NULL, -- 1, 2, 3, ...
  estimated_duration_hours INTEGER,

  -- Prerequisites (within same course)
  prerequisite_module_ids UUID[], -- Must complete these modules first

  -- Status
  is_published BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_course_module_number UNIQUE (course_id, module_number),
  CONSTRAINT unique_course_module_slug UNIQUE (course_id, slug)
);

-- ============================================================================
-- TOPICS: Specific lessons within modules (e.g., "2.3 Data Model Deep Dive")
-- ============================================================================

CREATE TABLE module_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,

  -- Topic identity
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Sequencing
  topic_number INTEGER NOT NULL, -- 1, 2, 3, ... (within module)
  estimated_duration_minutes INTEGER,

  -- Content type
  content_type TEXT NOT NULL CHECK (
    content_type IN ('video', 'reading', 'quiz', 'lab', 'project')
  ),

  -- Prerequisites (within same module)
  prerequisite_topic_ids UUID[],

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true, -- Some topics optional

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_module_topic_number UNIQUE (module_id, topic_number),
  CONSTRAINT unique_module_topic_slug UNIQUE (module_id, slug)
);

-- ============================================================================
-- LESSONS: Granular content items (videos, readings, quizzes, labs)
-- ============================================================================

CREATE TABLE topic_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,

  -- Lesson identity
  title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,

  -- Content
  content_type TEXT NOT NULL CHECK (
    content_type IN ('video', 'markdown', 'pdf', 'quiz', 'lab', 'external_link')
  ),
  content_url TEXT, -- Vimeo URL, S3 URL, external link
  content_markdown TEXT, -- For markdown lessons
  duration_seconds INTEGER, -- For videos

  -- Lab-specific
  lab_environment_template TEXT, -- Docker compose, GitHub template, etc.
  lab_instructions_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_topic_lesson_number UNIQUE (topic_id, lesson_number)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Courses
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX idx_courses_featured ON courses(is_featured) WHERE is_featured = true;

-- Modules
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_number ON course_modules(course_id, module_number);

-- Topics
CREATE INDEX idx_module_topics_module_id ON module_topics(module_id);
CREATE INDEX idx_module_topics_number ON module_topics(module_id, topic_number);
CREATE INDEX idx_module_topics_required ON module_topics(is_required) WHERE is_required = true;

-- Lessons
CREATE INDEX idx_topic_lessons_topic_id ON topic_lessons(topic_id);
CREATE INDEX idx_topic_lessons_type ON topic_lessons(content_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update course total_modules when modules added/deleted
CREATE OR REPLACE FUNCTION update_course_module_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses
    SET total_modules = (SELECT COUNT(*) FROM course_modules WHERE course_id = NEW.course_id)
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET total_modules = (SELECT COUNT(*) FROM course_modules WHERE course_id = OLD.course_id)
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_module_count
AFTER INSERT OR DELETE ON course_modules
FOR EACH ROW
EXECUTE FUNCTION update_course_module_count();

-- Update course total_topics when topics added/deleted
CREATE OR REPLACE FUNCTION update_course_topic_count()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT course_id INTO v_course_id
    FROM course_modules
    WHERE id = NEW.module_id;

    UPDATE courses
    SET total_topics = (
      SELECT COUNT(*)
      FROM module_topics mt
      JOIN course_modules cm ON cm.id = mt.module_id
      WHERE cm.course_id = v_course_id
    )
    WHERE id = v_course_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT course_id INTO v_course_id
    FROM course_modules
    WHERE id = OLD.module_id;

    UPDATE courses
    SET total_topics = (
      SELECT COUNT(*)
      FROM module_topics mt
      JOIN course_modules cm ON cm.id = mt.module_id
      WHERE cm.course_id = v_course_id
    )
    WHERE id = v_course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_topic_count
AFTER INSERT OR DELETE ON module_topics
FOR EACH ROW
EXECUTE FUNCTION update_course_topic_count();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE courses IS 'Multi-course catalog supporting any technical training (Guidewire, Salesforce, AWS, etc.)';
COMMENT ON COLUMN courses.prerequisite_course_ids IS 'Array of course UUIDs required before enrollment';
COMMENT ON TABLE course_modules IS 'High-level learning units within a course (typically 4-8 modules per course)';
COMMENT ON TABLE module_topics IS 'Specific lessons within modules (typically 5-10 topics per module)';
COMMENT ON TABLE topic_lessons IS 'Granular content items (videos, readings, quizzes, labs)';
```

### Rollback Migration

Create file: `supabase/migrations/021_create_academy_courses_rollback.sql`

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_course_topic_count ON module_topics;
DROP TRIGGER IF EXISTS trigger_update_course_module_count ON course_modules;
DROP FUNCTION IF EXISTS update_course_topic_count();
DROP FUNCTION IF EXISTS update_course_module_count();

-- Drop tables (cascade to dependent tables)
DROP TABLE IF EXISTS topic_lessons CASCADE;
DROP TABLE IF EXISTS module_topics CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
```

### Seed Data (3 Sample Courses)

Create file: `supabase/seeds/021_academy_courses_seed.sql`

```sql
-- ============================================================================
-- COURSE 1: Guidewire PolicyCenter Development (8 weeks, 7 modules)
-- ============================================================================

INSERT INTO courses (id, slug, title, subtitle, description, total_modules, total_topics, estimated_duration_weeks, price_monthly, skill_level, is_published, is_featured)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'guidewire-policycenter-development',
  'Guidewire PolicyCenter Development',
  'Master insurance software development in 8 weeks',
  'Transform into a job-ready Guidewire consultant. Learn PolicyCenter configuration, Gosu scripting, integrations, and deliver a portfolio-ready capstone project.',
  7,
  42, -- 7 modules × 6 topics avg
  8,
  499.00,
  'beginner',
  true,
  true
);

-- Module 1: Domain Fundamentals
INSERT INTO course_modules (id, course_id, slug, title, description, module_number, estimated_duration_hours, is_published)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111111',
  'module-1-domain-fundamentals',
  'Module 1: Insurance Domain Fundamentals',
  'Understand insurance industry basics, terminology, and business processes',
  1,
  10,
  true
);

-- Module 2: Platform Basics
INSERT INTO course_modules (id, course_id, slug, title, description, module_number, estimated_duration_hours, prerequisite_module_ids, is_published)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111111',
  'module-2-platform-basics',
  'Module 2: PolicyCenter Platform Basics',
  'PolicyCenter data model, navigation, and core configuration',
  2,
  12,
  ARRAY['11111111-1111-1111-1111-111111111101'::UUID],
  true
);

-- Add topics for Module 1
INSERT INTO module_topics (module_id, slug, title, description, topic_number, content_type, estimated_duration_minutes, is_published)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'topic-1-1-insurance-basics', '1.1 Insurance Industry Overview', 'How insurance companies operate', 1, 'video', 45, true),
  ('11111111-1111-1111-1111-111111111101', 'topic-1-2-key-terminology', '1.2 Key Insurance Terminology', 'Premium, deductible, claim, policy, underwriting', 2, 'reading', 30, true),
  ('11111111-1111-1111-1111-111111111101', 'topic-1-3-business-processes', '1.3 Insurance Business Processes', 'Quote → Bind → Renew → Claim workflow', 3, 'video', 60, true),
  ('11111111-1111-1111-1111-111111111101', 'topic-1-4-quiz', '1.4 Module 1 Quiz', 'Test your insurance fundamentals knowledge', 4, 'quiz', 20, true);

-- ============================================================================
-- COURSE 2: Salesforce Admin Certification (6 weeks, 6 modules)
-- ============================================================================

INSERT INTO courses (id, slug, title, subtitle, description, total_modules, total_topics, estimated_duration_weeks, price_monthly, skill_level, is_published)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'salesforce-admin-certification',
  'Salesforce Admin Certification',
  'Become a certified Salesforce Administrator',
  'Master Salesforce administration, automation, security, and earn your Admin certification. Hands-on labs with real Salesforce org.',
  6,
  36, -- 6 modules × 6 topics avg
  6,
  399.00,
  'beginner',
  true,
  false
);

-- Module 1: CRM Basics
INSERT INTO course_modules (id, course_id, slug, title, description, module_number, estimated_duration_hours, is_published)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222222',
  'module-1-crm-basics',
  'Module 1: CRM & Salesforce Fundamentals',
  'Salesforce platform overview, data model, and navigation',
  1,
  8,
  true
);

-- ============================================================================
-- COURSE 3: AWS Solutions Architect (10 weeks, 10 modules)
-- ============================================================================

INSERT INTO courses (id, slug, title, subtitle, description, total_modules, total_topics, estimated_duration_weeks, price_monthly, price_one_time, skill_level, is_published)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'aws-solutions-architect',
  'AWS Solutions Architect Associate',
  'Master cloud architecture and pass AWS SAA exam',
  'Comprehensive AWS training covering compute, storage, networking, databases, and security. Includes hands-on labs and certification prep.',
  10,
  60, -- 10 modules × 6 topics avg
  10,
  599.00,
  1499.00, -- One-time option
  'intermediate',
  false -- Not yet published
);

-- Module 1: Cloud Fundamentals
INSERT INTO course_modules (id, course_id, slug, title, description, module_number, estimated_duration_hours, is_published)
VALUES (
  '33333333-3333-3333-3333-333333333301',
  '33333333-3333-3333-3333-333333333333',
  'module-1-cloud-fundamentals',
  'Module 1: Cloud Computing Fundamentals',
  'Cloud concepts, AWS global infrastructure, and account setup',
  1,
  12,
  false -- Course not published yet
);
```

### TypeScript Types

Create file: `src/types/academy.ts`

```typescript
export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  total_modules: number;
  total_topics: number;
  estimated_duration_weeks: number;
  price_monthly: number | null;
  price_one_time: number | null;
  is_included_in_all_access: boolean;
  prerequisite_course_ids: string[] | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url: string | null;
  promo_video_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  module_number: number;
  estimated_duration_hours: number | null;
  prerequisite_module_ids: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleTopic {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  topic_number: number;
  estimated_duration_minutes: number | null;
  content_type: 'video' | 'reading' | 'quiz' | 'lab' | 'project';
  prerequisite_topic_ids: string[] | null;
  is_published: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicLesson {
  id: string;
  topic_id: string;
  title: string;
  lesson_number: number;
  content_type: 'video' | 'markdown' | 'pdf' | 'quiz' | 'lab' | 'external_link';
  content_url: string | null;
  content_markdown: string | null;
  duration_seconds: number | null;
  lab_environment_template: string | null;
  lab_instructions_url: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Testing

### Unit Tests

Create file: `src/lib/academy/__tests__/course-queries.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createClient } from '@/lib/supabase/server';

describe('Course Queries', () => {
  it('should retrieve all published courses', async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('title');

    expect(error).toBeNull();
    expect(data).toHaveLength(2); // Guidewire + Salesforce
  });

  it('should retrieve course with modules', async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules:course_modules(*)
      `)
      .eq('slug', 'guidewire-policycenter-development')
      .single();

    expect(error).toBeNull();
    expect(data.modules).toHaveLength(2); // Module 1, Module 2
  });

  it('should respect module prerequisites', async () => {
    const supabase = createClient();

    const { data: module2 } = await supabase
      .from('course_modules')
      .select('prerequisite_module_ids')
      .eq('module_number', 2)
      .single();

    expect(module2.prerequisite_module_ids).toContain('11111111-1111-1111-1111-111111111101');
  });
});
```

### Integration Tests

Create file: `src/lib/academy/__tests__/course-crud.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Course CRUD Operations', () => {
  let supabase: ReturnType<typeof createAdminClient>;
  let testCourseId: string;

  beforeEach(async () => {
    supabase = createAdminClient();
  });

  it('should create a new course', async () => {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        slug: 'test-course',
        title: 'Test Course',
        description: 'Test description',
        estimated_duration_weeks: 4,
        skill_level: 'beginner'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.slug).toBe('test-course');
    testCourseId = data.id;
  });

  it('should auto-increment total_modules when module added', async () => {
    const { error: moduleError } = await supabase
      .from('course_modules')
      .insert({
        course_id: testCourseId,
        slug: 'test-module-1',
        title: 'Test Module 1',
        module_number: 1
      });

    expect(moduleError).toBeNull();

    const { data: course } = await supabase
      .from('courses')
      .select('total_modules')
      .eq('id', testCourseId)
      .single();

    expect(course.total_modules).toBe(1);
  });
});
```

---

## Dependencies

### From Epic 1
- **FOUND-001** (user_profiles) - Required for created_by foreign key
- **FOUND-002** (RBAC) - Required for admin role permissions
- **FOUND-010** (tRPC) - Required for API layer

### Blocks
- All other Academy stories (ACAD-002 through ACAD-030)
- Cannot enroll students without courses
- Cannot track progress without course structure

---

## Documentation

### Update Files

1. **Database Schema Docs** (`docs/architecture/DATABASE-SCHEMA.md`)
   - Add Academy schema section
   - Document course hierarchy (Course → Module → Topic → Lesson)
   - Explain prerequisite system

2. **API Documentation** (`docs/api/ACADEMY-API.md`)
   - Document course CRUD endpoints
   - Document public catalog API (for marketing site)

---

## Verification Queries

```sql
-- Verify course creation
SELECT id, slug, title, total_modules, total_topics, is_published
FROM courses
WHERE deleted_at IS NULL;

-- Verify module hierarchy
SELECT
  c.title AS course,
  cm.module_number,
  cm.title AS module,
  cm.prerequisite_module_ids
FROM courses c
JOIN course_modules cm ON cm.course_id = c.id
ORDER BY c.title, cm.module_number;

-- Verify topic structure
SELECT
  cm.title AS module,
  mt.topic_number,
  mt.title AS topic,
  mt.content_type,
  mt.is_required
FROM course_modules cm
JOIN module_topics mt ON mt.module_id = cm.id
WHERE cm.course_id = '11111111-1111-1111-1111-111111111111' -- Guidewire course
ORDER BY cm.module_number, mt.topic_number;

-- Test prerequisite enforcement
SELECT
  cm.module_number,
  cm.title,
  cm.prerequisite_module_ids,
  (
    SELECT ARRAY_AGG(cm2.title)
    FROM course_modules cm2
    WHERE cm2.id = ANY(cm.prerequisite_module_ids)
  ) AS prerequisite_titles
FROM course_modules cm
WHERE cm.course_id = '11111111-1111-1111-1111-111111111111'
ORDER BY cm.module_number;
```

---

## Notes

- **Multi-course support:** Schema designed for ANY technical training, not just Guidewire
- **Flexible hierarchy:** N modules × M topics × K lessons (no hardcoded limits)
- **Prerequisites:** Enforced at module and topic level (unlock next module after completing previous)
- **Auto-counters:** Triggers maintain total_modules and total_topics for performance
- **Soft deletes:** Course deletion preserves data for reporting
- **Seed data:** 3 sample courses demonstrate flexibility (insurance, CRM, cloud)

---

**Related Stories:**
- **Next:** ACAD-002 (Enrollment System)
- **Depends On:** FOUND-001, FOUND-002
