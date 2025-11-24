-- ============================================================================
-- SEED DATA: Academy Courses
-- Story: ACAD-001
-- Description: Sample courses to demonstrate multi-course catalog
-- ============================================================================

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
