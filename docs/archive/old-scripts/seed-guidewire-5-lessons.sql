-- ============================================================================
-- Guidewire Developer Course - 5 Lessons Seed Data
-- ============================================================================
-- Structure: Course → Module → Topics (5) → Lessons (video, reading, quiz each)
-- File paths point to: public/courses/guidewire-developer/lesson-XX/
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
  'Complete Guidewire training covering the full platform ecosystem with hands-on projects',
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
  'Introduction to Guidewire platform architecture and core concepts',
  1,
  40,
  true
) ON CONFLICT DO NOTHING;

-- 3. Create Topic 1: Introduction to Guidewire
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
  'Overview of Guidewire platform, architecture, and industry use cases',
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
-- 4. Create Topic 2: [UPDATE WITH YOUR TOPIC NAME]
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
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'lesson-02-topic',  -- UPDATE THIS
  'Lesson 2: [YOUR TOPIC TITLE]',  -- UPDATE THIS
  '[YOUR DESCRIPTION]',  -- UPDATE THIS
  2,
  50,
  'video',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Topic 2 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('44444444-4444-4444-4444-444444444444', 'Lesson 2 Video', 1, 'video', '/courses/guidewire-developer/lesson-02-topic/video.mp4', 3000),
('44444444-4444-4444-4444-444444444444', 'Lesson 2 Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-02-topic/presentation.pdf', NULL),
('44444444-4444-4444-4444-444444444444', 'Lesson 2 Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-02-topic/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. Create Topic 3: [UPDATE WITH YOUR TOPIC NAME]
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
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'lesson-03-topic',  -- UPDATE THIS
  'Lesson 3: [YOUR TOPIC TITLE]',  -- UPDATE THIS
  '[YOUR DESCRIPTION]',  -- UPDATE THIS
  3,
  55,
  'video',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Topic 3 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('55555555-5555-5555-5555-555555555555', 'Lesson 3 Video', 1, 'video', '/courses/guidewire-developer/lesson-03-topic/video.mp4', 3300),
('55555555-5555-5555-5555-555555555555', 'Lesson 3 Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-03-topic/presentation.pdf', NULL),
('55555555-5555-5555-5555-555555555555', 'Lesson 3 Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-03-topic/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. Create Topic 4: [UPDATE WITH YOUR TOPIC NAME]
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
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'lesson-04-topic',  -- UPDATE THIS
  'Lesson 4: [YOUR TOPIC TITLE]',  -- UPDATE THIS
  '[YOUR DESCRIPTION]',  -- UPDATE THIS
  4,
  60,
  'video',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Topic 4 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('66666666-6666-6666-6666-666666666666', 'Lesson 4 Video', 1, 'video', '/courses/guidewire-developer/lesson-04-topic/video.mp4', 3600),
('66666666-6666-6666-6666-666666666666', 'Lesson 4 Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-04-topic/presentation.pdf', NULL),
('66666666-6666-6666-6666-666666666666', 'Lesson 4 Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-04-topic/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. Create Topic 5: [UPDATE WITH YOUR TOPIC NAME]
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
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'lesson-05-topic',  -- UPDATE THIS
  'Lesson 5: [YOUR TOPIC TITLE]',  -- UPDATE THIS
  '[YOUR DESCRIPTION]',  -- UPDATE THIS
  5,
  50,
  'video',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Topic 5 Lessons
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('77777777-7777-7777-7777-777777777777', 'Lesson 5 Video', 1, 'video', '/courses/guidewire-developer/lesson-05-topic/video.mp4', 3000),
('77777777-7777-7777-7777-777777777777', 'Lesson 5 Presentation', 2, 'pdf', '/courses/guidewire-developer/lesson-05-topic/presentation.pdf', NULL),
('77777777-7777-7777-7777-777777777777', 'Lesson 5 Assignment', 3, 'pdf', '/courses/guidewire-developer/lesson-05-topic/assignment.pdf', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. Create Enrollment for Test Student
-- ============================================================================
INSERT INTO student_enrollments (
  user_id,
  course_id,
  status,
  enrolled_at
)
SELECT 
  id,
  '11111111-1111-1111-1111-111111111111',
  'active',
  NOW()
FROM user_profiles
WHERE email = 'student@intime.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check what was created
SELECT 'Created Course:' as check_type, slug, title FROM courses WHERE slug = 'guidewire-developer'
UNION ALL
SELECT 'Created Module:', slug, title FROM course_modules WHERE course_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Created Topics:', slug, title FROM module_topics WHERE module_id = '22222222-2222-2222-2222-222222222222' ORDER BY topic_number;

SELECT 'Total Lessons Created:' as summary, COUNT(*)::text as count 
FROM topic_lessons 
WHERE topic_id IN (
  SELECT id FROM module_topics WHERE module_id = '22222222-2222-2222-2222-222222222222'
);
