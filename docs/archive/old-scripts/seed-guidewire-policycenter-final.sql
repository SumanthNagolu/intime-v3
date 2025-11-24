-- ============================================================================
-- Guidewire PolicyCenter Course - Complete 5 Lessons Seed Data
-- ============================================================================
-- Updated: 2025-11-22
-- Based on actual uploaded content files
-- Course: PolicyCenter Introduction (5 lessons)
-- ============================================================================

-- 1. Create Guidewire PolicyCenter Course
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
  is_published
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'guidewire-policycenter-introduction',
  'Guidewire PolicyCenter Introduction',
  'Master PolicyCenter Fundamentals & Policy Administration',
  'Complete PolicyCenter training covering accounts, policy transactions, policy files, product model, and full application submission workflows.',
  1,
  5,
  8,
  'beginner',
  true
);

-- 2. Create Module 1: PolicyCenter Fundamentals
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
  'policycenter-fundamentals',
  'PolicyCenter Fundamentals',
  'Introduction to Guidewire PolicyCenter: accounts, transactions, policy files, product model, and application submission',
  1,
  40,
  true
);

-- ============================================================================
-- TOPIC 1: Accounts
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
  'lesson-01-accounts',
  'Lesson 1: Accounts',
  'Understanding PolicyCenter accounts: creating accounts, managing account information, account types, and account relationships.',
  1,
  90,
  'video',
  true,
  true
);

-- Lesson 1.1: Main Presentation
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Accounts Lesson',
  1,
  'external_link',
  '/courses/guidewire-developer/policy-center-introduction/lesson-01-accounts/lesson.pptx'
);

-- Lesson 1.2: Demo Video 1
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url,
  duration_seconds
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Accounts Demo Part 1',
  2,
  'video',
  '/courses/guidewire-developer/policy-center-introduction/lesson-01-accounts/demo-1.mp4',
  2700  -- Approximate 45 min
);

-- Lesson 1.3: Demo Video 2
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url,
  duration_seconds
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Accounts Demo Part 2',
  3,
  'video',
  '/courses/guidewire-developer/policy-center-introduction/lesson-01-accounts/demo-2.mp4',
  2700  -- Approximate 45 min
);

-- Lesson 1.4: Assignment
INSERT INTO topic_lessons (
  topic_id,
  title,
  lesson_number,
  content_type,
  content_url
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Accounts Assignment',
  4,
  'pdf',
  '/courses/guidewire-developer/policy-center-introduction/lesson-01-accounts/assignment.pdf'
);

-- ============================================================================
-- TOPIC 2: Policy Transactions
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
  'lesson-02-policy-transactions',
  'Lesson 2: Policy Transactions',
  'Deep dive into PolicyCenter transactions: new business, renewals, policy changes, cancellations, and reinstatements.',
  2,
  60,
  'video',
  true,
  true,
  ARRAY['33333333-3333-3333-3333-333333333333']::uuid[]
);

-- Lesson 2.1: Main Presentation
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('44444444-4444-4444-4444-444444444444', 'Policy Transactions Lesson', 1, 'external_link', '/courses/guidewire-developer/policy-center-introduction/lesson-02-policy-transactions/lesson.pptx')
;

-- Lesson 2.2: Assignment
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('44444444-4444-4444-4444-444444444444', 'Policy Transactions Assignment', 2, 'pdf', '/courses/guidewire-developer/policy-center-introduction/lesson-02-policy-transactions/assignment.pdf')
;

-- ============================================================================
-- TOPIC 3: The Policy File
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
  'lesson-03-policy-files',
  'Lesson 3: The Policy File',
  'Understanding the policy file structure: policy periods, policy lines, coverages, conditions, and exclusions.',
  3,
  90,
  'video',
  true,
  true,
  ARRAY['44444444-4444-4444-4444-444444444444']::uuid[]
);

-- Lesson 3.1: Main Presentation
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('55555555-5555-5555-5555-555555555555', 'The Policy File Lesson', 1, 'external_link', '/courses/guidewire-developer/policy-center-introduction/lesson-03-policy-files/lesson.pptx')
;

-- Lesson 3.2: Demo Video 1
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('55555555-5555-5555-5555-555555555555', 'Policy File Demo Part 1', 2, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-03-policy-files/demo-1.mp4', 3000)
;

-- Lesson 3.3: Demo Video 2
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('55555555-5555-5555-5555-555555555555', 'Policy File Demo Part 2', 3, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-03-policy-files/demo-2.mp4', 1800)
;

-- Lesson 3.4: Assignment
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('55555555-5555-5555-5555-555555555555', 'Policy File Assignment', 4, 'pdf', '/courses/guidewire-developer/policy-center-introduction/lesson-03-policy-files/assignment.pdf')
;

-- ============================================================================
-- TOPIC 4: Product Model Introduction
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
  'lesson-04-product-model',
  'Lesson 4: Product Model Introduction',
  'Introduction to PolicyCenter product model: offerings, policy lines, coverages, modifiers, and rating.',
  4,
  60,
  'video',
  true,
  true,
  ARRAY['55555555-5555-5555-5555-555555555555']::uuid[]
);

-- Lesson 4.1: Main Presentation
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('66666666-6666-6666-6666-666666666666', 'Product Model Introduction Lesson', 1, 'external_link', '/courses/guidewire-developer/policy-center-introduction/lesson-04-product-model/lesson.pptx')
;

-- Lesson 4.2: Assignment
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('66666666-6666-6666-6666-666666666666', 'Product Model Assignment', 2, 'pdf', '/courses/guidewire-developer/policy-center-introduction/lesson-04-product-model/assignment.pdf')
;

-- ============================================================================
-- TOPIC 5: Full Application Submission
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
  'lesson-05-full-application',
  'Lesson 5: Full Application Submission',
  'Complete walkthrough of the full application submission process: account creation, policy selection, quoting, binding, and issuance.',
  5,
  120,
  'video',
  true,
  true,
  ARRAY['66666666-6666-6666-6666-666666666666']::uuid[]
);

-- Lesson 5.1: Main Presentation
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('77777777-7777-7777-7777-777777777777', 'Full Application Submission Lesson', 1, 'external_link', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/lesson.pptx')
;

-- Lesson 5.2-5.6: Demo Videos (5 parts)
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url, duration_seconds) VALUES
('77777777-7777-7777-7777-777777777777', 'Full Application Demo Part 1', 2, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/demo-1.mp4', 3600),
('77777777-7777-7777-7777-777777777777', 'Full Application Demo Part 2', 3, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/demo-2.mp4', 3000),
('77777777-7777-7777-7777-777777777777', 'Full Application Demo Part 3', 4, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/demo-3.mp4', 3600),
('77777777-7777-7777-7777-777777777777', 'Full Application Demo Part 4', 5, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/demo-4.mp4', 4800),
('77777777-7777-7777-7777-777777777777', 'Full Application Demo Part 5', 6, 'video', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/demo-5.mp4', 2700)
;

-- Lesson 5.7: Assignment
INSERT INTO topic_lessons (topic_id, title, lesson_number, content_type, content_url) VALUES
('77777777-7777-7777-7777-777777777777', 'Full Application Assignment', 7, 'pdf', '/courses/guidewire-developer/policy-center-introduction/lesson-05-full-application/assignment.pdf')
;

-- ============================================================================
-- Create Test Student & Enrollment
-- ============================================================================

-- Enroll existing student@intime.com user
-- Note: This will fail gracefully if user doesn't exist
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
LIMIT 1;

-- ============================================================================
-- SEEDING COMPLETE
-- ============================================================================
-- Run verification queries separately to check results
