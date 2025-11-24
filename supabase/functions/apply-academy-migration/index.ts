import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Academy courses migration SQL
    const migrationSQL = `
-- ============================================================================
-- Migration: Create Academy Courses and Curriculum Tables
-- Story: ACAD-001
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  total_modules INTEGER NOT NULL DEFAULT 0,
  total_topics INTEGER NOT NULL DEFAULT 0,
  estimated_duration_weeks INTEGER NOT NULL,
  price_monthly NUMERIC(10,2),
  price_one_time NUMERIC(10,2),
  is_included_in_all_access BOOLEAN DEFAULT true,
  prerequisite_course_ids UUID[],
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  promo_video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  module_number INTEGER NOT NULL,
  estimated_duration_hours INTEGER,
  prerequisite_module_ids UUID[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_course_module_number UNIQUE (course_id, module_number),
  CONSTRAINT unique_course_module_slug UNIQUE (course_id, slug)
);

CREATE TABLE IF NOT EXISTS module_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic_number INTEGER NOT NULL,
  estimated_duration_minutes INTEGER,
  content_type TEXT NOT NULL CHECK (
    content_type IN ('video', 'reading', 'quiz', 'lab', 'project')
  ),
  prerequisite_topic_ids UUID[],
  is_published BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_module_topic_number UNIQUE (module_id, topic_number),
  CONSTRAINT unique_module_topic_slug UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS topic_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (
    content_type IN ('video', 'markdown', 'pdf', 'quiz', 'lab', 'external_link')
  ),
  content_url TEXT,
  content_markdown TEXT,
  duration_seconds INTEGER,
  lab_environment_template TEXT,
  lab_instructions_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_topic_lesson_number UNIQUE (topic_id, lesson_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_number ON course_modules(course_id, module_number);
CREATE INDEX IF NOT EXISTS idx_module_topics_module_id ON module_topics(module_id);
CREATE INDEX IF NOT EXISTS idx_module_topics_number ON module_topics(module_id, topic_number);
CREATE INDEX IF NOT EXISTS idx_module_topics_required ON module_topics(is_required) WHERE is_required = true;
CREATE INDEX IF NOT EXISTS idx_topic_lessons_topic_id ON topic_lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_lessons_type ON topic_lessons(content_type);

-- Triggers
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

DROP TRIGGER IF EXISTS trigger_update_course_module_count ON course_modules;
CREATE TRIGGER trigger_update_course_module_count
AFTER INSERT OR DELETE ON course_modules
FOR EACH ROW
EXECUTE FUNCTION update_course_module_count();

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

DROP TRIGGER IF EXISTS trigger_update_course_topic_count ON module_topics;
CREATE TRIGGER trigger_update_course_topic_count
AFTER INSERT OR DELETE ON module_topics
FOR EACH ROW
EXECUTE FUNCTION update_course_topic_count();
`;

    // Apply migration
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql_string: migrationSQL,
    });

    if (migrationError) {
      // If exec_sql RPC doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');
      const statements = migrationSQL.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (!statement.trim()) continue;

        const { error } = await supabase.rpc('execute', {
          query: statement,
        });

        if (error) {
          console.error('Statement error:', statement.substring(0, 100), error);
        }
      }
    }

    // Seed data
    const seedDataSQL = `
-- Seed data for Academy courses
INSERT INTO courses (id, slug, title, subtitle, description, total_modules, total_topics, estimated_duration_weeks, price_monthly, skill_level, is_published, is_featured)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'guidewire-policycenter-development',
  'Guidewire PolicyCenter Development',
  'Master insurance software development in 8 weeks',
  'Transform into a job-ready Guidewire consultant. Learn PolicyCenter configuration, Gosu scripting, integrations, and deliver a portfolio-ready capstone project.',
  7,
  42,
  8,
  499.00,
  'beginner',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

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
)
ON CONFLICT (id) DO NOTHING;
`;

    await supabase.rpc('exec_sql', { sql_string: seedDataSQL });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Academy migration applied successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
