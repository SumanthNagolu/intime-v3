-- ============================================================================
-- Guidewire Developer Course - Complete 5 Lessons Seed Data
-- ============================================================================
-- Updated: 2025-11-22
-- All lesson metadata completed (titles, descriptions, slugs)
-- File paths point to: public/courses/guidewire-developer/lesson-XX-*/
-- ============================================================================

-- 1. Create Guidewire Developer Course
INSERT INTO courses (
  id,
  slug,
  title,
  subtitle,
  description,
  total_modules,
  total_topics,
  estimated_duration_weeks,
  skill_level,
  thumbnail_url,
  is_published
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'guidewire-developer',
  'Guidewire Developer Fundamentals',
  'Master ClaimCenter, PolicyCenter & BillingCenter',
  'Complete Guidewire training covering the full platform ecosystem with hands-on projects. Learn architecture, data modeling, configuration, and integration patterns used by Fortune 500 insurance companies.',
  1,
  5,
  8,
  'beginner',
  '/courses/guidewire-developer/thumbnail.jpg',
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  total_topics = EXCLUDED.total_topics,
  is_published = EXCLUDED.is_published;

-- 2. Create Module 1: Guidewire Fundamentals
INSERT INTO course_modules (
  id,
  course_id,
  slug,
  title,
  description,
  module_number,
  estimated_duration_hours,
  is_published
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'guidewire-fundamentals',
  'Guidewire Fundamentals',
  'Introduction to Guidewire platform architecture, data model, configuration, and integration patterns',
  1,
  40,
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- TOPIC 1: Introduction to Guidewire
-- ============================================================================
INSERT INTO module_topics (
  id,
  module_id,
  slug,
  title,
  description,
  topic_number,
  estimated_duration_minutes,
  content_type,
  is_published,
  is_required
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'introduction-to-guidewire',
  'Lesson 1: Introduction to Guidewire',
  'Overview of Guidewire platform, architecture, and industry use cases. Learn about ClaimCenter, PolicyCenter, BillingCenter, and career opportunities in P&C insurance software.',
  1,
  45,
  'video',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Lesson 1.1: Video Lecture
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url,
  duration_seconds
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Introduction Video',
  1,
  'video',
  '/courses/guidewire-developer/lesson-01-introduction/video.mp4',
  2700  -- 45 minutes
) ON CONFLICT DO NOTHING;

-- Lesson 1.2: Presentation PDF
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Introduction Presentation',
  2,
  'pdf',
  '/courses/guidewire-developer/lesson-01-introduction/presentation.pdf'
) ON CONFLICT DO NOTHING;

-- Lesson 1.3: Assignment
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Introduction Assignment',
  3,
  'pdf',
  '/courses/guidewire-developer/lesson-01-introduction/assignment.pdf'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- TOPIC 2: Guidewire Architecture Deep Dive
-- ============================================================================
INSERT INTO module_topics (
  id,
  module_id,
  slug,
  title,
  description,
  topic_number,
  estimated_duration_minutes,
  content_type,
  is_published,
  is_required,
  prerequisite_topic_ids
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'guidewire-architecture',
  'Lesson 2: Guidewire Architecture Deep Dive',
  'Deep dive into Guidewire technical architecture: multi-tier design, Gosu programming language, database architecture, integration patterns, and development environment setup.',
  2,
  50,
  'video',
  true,
  true,
  ARRAY['33333333-3333-3333-3333-333333333333']::uuid[]
) ON CONFLICT DO NOTHING;

-- Topic 2 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('44444444-4444-4444-4444-444444444444', 'Architecture Deep Dive Video', 1, 'video', '/courses/guidewire-developer/lesson-02-architecture/video.mp4', 3000),
('44444444-4444-4444-4444-444444444444', 'Architecture Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-02-architecture/presentation.pdf', NULL),
('44444444-4444-4444-4444-444444444444', 'Architecture Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-02-architecture/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TOPIC 3: Guidewire Data Model & Entities
-- ============================================================================
INSERT INTO module_topics (
  id,
  module_id,
  slug,
  title,
  description,
  topic_number,
  estimated_duration_minutes,
  content_type,
  is_published,
  is_required,
  prerequisite_topic_ids
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'guidewire-data-model',
  'Lesson 3: Guidewire Data Model & Entities',
  'Understanding Guidewire data model: core entities (Claim, Policy, Account), entity relationships, denormalization strategies, custom entities, and querying patterns.',
  3,
  55,
  'video',
  true,
  true,
  ARRAY['44444444-4444-4444-4444-444444444444']::uuid[]
) ON CONFLICT DO NOTHING;

-- Topic 3 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('55555555-5555-5555-5555-555555555555', 'Data Model Deep Dive Video', 1, 'video', '/courses/guidewire-developer/lesson-03-data-model/video.mp4', 3300),
('55555555-5555-5555-5555-555555555555', 'Data Model Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-03-data-model/presentation.pdf', NULL),
('55555555-5555-5555-5555-555555555555', 'Data Model Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-03-data-model/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TOPIC 4: Configuration & Customization
-- ============================================================================
INSERT INTO module_topics (
  id,
  module_id,
  slug,
  title,
  description,
  topic_number,
  estimated_duration_minutes,
  content_type,
  is_published,
  is_required,
  prerequisite_topic_ids
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'guidewire-configuration',
  'Lesson 4: Configuration & Customization',
  'Guidewire configuration tools and techniques: Guidewire Studio, PCF files, rules engine, business rules, validations, localization, and upgrade considerations.',
  4,
  60,
  'video',
  true,
  true,
  ARRAY['55555555-5555-5555-5555-555555555555']::uuid[]
) ON CONFLICT DO NOTHING;

-- Topic 4 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('66666666-6666-6666-6666-666666666666', 'Configuration Masterclass Video', 1, 'video', '/courses/guidewire-developer/lesson-04-configuration/video.mp4', 3600),
('66666666-6666-6666-6666-666666666666', 'Configuration Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-04-configuration/presentation.pdf', NULL),
('66666666-6666-6666-6666-666666666666', 'Configuration Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-04-configuration/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TOPIC 5: Integration Patterns & APIs
-- ============================================================================
INSERT INTO module_topics (
  id,
  module_id,
  slug,
  title,
  description,
  topic_number,
  estimated_duration_minutes,
  content_type,
  is_published,
  is_required,
  prerequisite_topic_ids
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'guidewire-integration',
  'Lesson 5: Integration Patterns & APIs',
  'Integrating Guidewire with external systems: REST APIs, SOAP web services, messaging (JMS/Kafka), batch jobs, error handling, security, and authentication.',
  5,
  50,
  'video',
  true,
  true,
  ARRAY['66666666-6666-6666-6666-666666666666']::uuid[]
) ON CONFLICT DO NOTHING;

-- Topic 5 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('77777777-7777-7777-7777-777777777777', 'Integration Patterns Video', 1, 'video', '/courses/guidewire-developer/lesson-05-integration/video.mp4', 3000),
('77777777-7777-7777-7777-777777777777', 'Integration Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-05-integration/presentation.pdf', NULL),
('77777777-7777-7777-7777-777777777777', 'Integration Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-05-integration/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Create Test Student & Enrollment
-- ============================================================================

-- Ensure test student exists in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'student@intime.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Ensure user profile exists
INSERT INTO user_profiles (
  id,
  email,
  full_name
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'student@intime.com',
  'Test Student'
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name;

-- Enroll test student
INSERT INTO student_enrollments (
  user_id,
  course_id,
  status,
  enrolled_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'active',
  NOW()
) ON CONFLICT (user_id, course_id) DO UPDATE SET
  status = 'active',
  enrolled_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check course created
SELECT 'Course Created' as status, slug, title, total_topics
FROM courses
WHERE slug = 'guidewire-developer';

-- Check module created
SELECT 'Module Created' as status, slug, title, estimated_duration_hours
FROM course_modules
WHERE course_id = '11111111-1111-1111-1111-111111111111';

-- Check all 5 topics created
SELECT 'Topics Created' as status, topic_number, slug, title
FROM module_topics
WHERE module_id = '22222222-2222-2222-2222-222222222222'
ORDER BY topic_number;

-- Check all 15 lessons created (5 topics × 3 lessons each)
SELECT 'Lessons Created' as status, COUNT(*)::text as total_lessons
FROM topic_lessons
WHERE topic_id IN (
  SELECT id FROM module_topics
  WHERE module_id = '22222222-2222-2222-2222-222222222222'
);

-- Check student enrollment
SELECT 'Student Enrolled' as status, u.email, e.status, e.enrolled_at
FROM student_enrollments e
JOIN user_profiles u ON u.id = e.user_id
WHERE e.course_id = '11111111-1111-1111-1111-111111111111';

-- Check prerequisite chain
SELECT
  topic_number,
  title,
  CASE
    WHEN prerequisite_topic_ids IS NULL THEN 'None (first lesson)'
    ELSE 'Lesson ' || (topic_number - 1)::text
  END as prerequisites
FROM module_topics
WHERE module_id = '22222222-2222-2222-2222-222222222222'
ORDER BY topic_number;

-- Show complete course structure
SELECT
  c.title as course,
  m.title as module,
  t.topic_number,
  t.title as topic,
  COUNT(l.id) as lesson_count
FROM courses c
JOIN course_modules m ON m.course_id = c.id
JOIN module_topics t ON t.module_id = m.id
LEFT JOIN topic_lessons l ON l.topic_id = t.id
WHERE c.slug = 'guidewire-developer'
GROUP BY c.title, m.title, t.topic_number, t.title
ORDER BY t.topic_number;
