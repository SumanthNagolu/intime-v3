-- ============================================================================
-- Migration: Create Academy Courses and Curriculum Tables
-- Story: ACAD-001
-- Description: Multi-course catalog system with flexible curriculum hierarchy
-- ============================================================================

-- ============================================================================
-- COURSES: Multi-course catalog
-- ============================================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Course identity
  slug TEXT UNIQUE NOT NULL, -- 'guidewire-policycenter-development', 'salesforce-admin', 'aws-solutions-architect'
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
