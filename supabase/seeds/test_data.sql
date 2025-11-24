-- ============================================================================
-- Test Data Seed Script - InTime v3
-- Purpose: Create comprehensive test users across all 5 business pillars
-- ============================================================================

-- Step 1: Clean existing test data (soft delete)
UPDATE user_profiles 
SET deleted_at = NOW() 
WHERE email LIKE '%@intime.com';

-- Step 2: Insert Core Users
INSERT INTO user_profiles (
  org_id,
  email, 
  full_name, 
  timezone, 
  locale
) VALUES
  -- Leadership & Admin
  ('00000000-0000-0000-0000-000000000001', 'ceo@intime.com', 'Sumanth Nagolu (CEO)', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'admin@intime.com', 'System Administrator', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'hr@intime.com', 'HR Manager', 'America/New_York', 'en-US'),
  
  -- Training Academy (Pillar 1)
  ('00000000-0000-0000-0000-000000000001', 'student@intime.com', 'John Student', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'student1@intime.com', 'Jane Learner', 'America/Chicago', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'student2@intime.com', 'Bob Graduate', 'America/Los_Angeles', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'trainer@intime.com', 'Senior Trainer', 'America/New_York', 'en-US'),
  
  -- Recruiting Services (Pillar 2)
  ('00000000-0000-0000-0000-000000000001', 'sr_rec@intime.com', 'Alice Senior Recruiter', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'jr_rec@intime.com', 'Bob Junior Recruiter', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'sr_rec2@intime.com', 'Carol Senior Recruiter', 'America/Chicago', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'jr_rec2@intime.com', 'David Junior Recruiter', 'America/Chicago', 'en-US'),
  
  -- Bench Sales (Pillar 3)
  ('00000000-0000-0000-0000-000000000001', 'sr_bs@intime.com', 'Eve Senior Bench Sales', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'jr_bs@intime.com', 'Frank Junior Bench Sales', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'sr_bs2@intime.com', 'Grace Senior Bench Sales', 'America/Chicago', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'jr_bs2@intime.com', 'Henry Junior Bench Sales', 'America/Chicago', 'en-US'),
  
  -- Talent Acquisition (Pillar 4)
  ('00000000-0000-0000-0000-000000000001', 'sr_ta@intime.com', 'Ivy Senior TA', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'jr_ta@intime.com', 'Jack Junior TA', 'America/New_York', 'en-US'),
  
  -- Candidates (For Testing Recruiting & Bench)
  ('00000000-0000-0000-0000-000000000001', 'candidate@intime.com', 'Active Candidate', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'candidate1@intime.com', 'Bench Consultant', 'America/Chicago', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'candidate2@intime.com', 'Placed Consultant', 'America/Los_Angeles', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'candidate3@intime.com', 'Inactive Candidate', 'America/Denver', 'en-US'),
  
  -- Clients (For Testing Placements)
  ('00000000-0000-0000-0000-000000000001', 'client@intime.com', 'TechCorp Contact', 'America/New_York', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'client1@intime.com', 'HealthPlus Contact', 'America/Chicago', 'en-US'),
  ('00000000-0000-0000-0000-000000000001', 'client2@intime.com', 'FinanceHub Contact', 'America/Los_Angeles', 'en-US')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Update Role-Specific Fields

-- Students (Training Academy)
UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '30 days',
  student_current_module = 'PolicyCenter Basics',
  student_course_progress = '{"module_1": 100, "module_2": 75, "module_3": 30}'::jsonb
WHERE email = 'student@intime.com';

UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '10 days',
  student_current_module = 'Guidewire Introduction',
  student_course_progress = '{"module_1": 25}'::jsonb
WHERE email = 'student1@intime.com';

UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '90 days',
  student_current_module = 'Final Project',
  student_course_progress = '{"module_1": 100, "module_2": 100, "module_3": 100}'::jsonb,
  student_graduation_date = NOW() - INTERVAL '5 days',
  student_certificates = '[{"cert_id": "GW-CERT-001", "issued_date": "2025-11-17", "url": "https://cert.intime.com/GW-CERT-001"}]'::jsonb
WHERE email = 'student2@intime.com';

-- Employees (Recruiters, Bench Sales, TA, Trainer)
-- Senior Recruiters
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '2 years',
  employee_department = 'recruiting',
  employee_position = 'Senior Recruiter',
  employee_salary = 85000.00,
  employee_status = 'active',
  employee_performance_rating = 4.5,
  recruiter_territory = 'Northeast US',
  recruiter_specialization = ARRAY['Java', 'Guidewire', 'Salesforce'],
  recruiter_monthly_placement_target = 4
WHERE email IN ('sr_rec@intime.com', 'sr_rec2@intime.com');

-- Junior Recruiters
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '6 months',
  employee_department = 'recruiting',
  employee_position = 'Junior Recruiter',
  employee_salary = 55000.00,
  employee_status = 'active',
  employee_performance_rating = 3.8,
  recruiter_specialization = ARRAY['Java', 'Python'],
  recruiter_monthly_placement_target = 2
WHERE email IN ('jr_rec@intime.com', 'jr_rec2@intime.com');

-- Senior Bench Sales
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '18 months',
  employee_department = 'bench_sales',
  employee_position = 'Senior Bench Sales',
  employee_salary = 80000.00,
  employee_status = 'active',
  employee_performance_rating = 4.2
WHERE email IN ('sr_bs@intime.com', 'sr_bs2@intime.com');

-- Junior Bench Sales
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '4 months',
  employee_department = 'bench_sales',
  employee_position = 'Junior Bench Sales',
  employee_salary = 50000.00,
  employee_status = 'active',
  employee_performance_rating = 3.5
WHERE email IN ('jr_bs@intime.com', 'jr_bs2@intime.com');

-- Talent Acquisition
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '1 year',
  employee_department = 'talent_acquisition',
  employee_position = 'Senior TA',
  employee_salary = 75000.00,
  employee_status = 'active',
  employee_performance_rating = 4.0
WHERE email = 'sr_ta@intime.com';

UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '3 months',
  employee_department = 'talent_acquisition',
  employee_position = 'Junior TA',
  employee_salary = 48000.00,
  employee_status = 'active',
  employee_performance_rating = 3.6
WHERE email = 'jr_ta@intime.com';

-- Trainer
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '3 years',
  employee_department = 'training',
  employee_position = 'Senior Trainer',
  employee_salary = 90000.00,
  employee_status = 'active',
  employee_performance_rating = 4.7
WHERE email = 'trainer@intime.com';

-- HR Manager
UPDATE user_profiles SET
  employee_hire_date = NOW() - INTERVAL '5 years',
  employee_department = 'hr',
  employee_position = 'HR Manager',
  employee_salary = 95000.00,
  employee_status = 'active',
  employee_performance_rating = 4.6
WHERE email = 'hr@intime.com';

-- Candidates
UPDATE user_profiles SET
  candidate_status = 'active',
  candidate_resume_url = 'https://storage.intime.com/resumes/candidate-001.pdf',
  candidate_skills = ARRAY['Java', 'Spring Boot', 'Microservices', 'AWS', 'Docker'],
  candidate_experience_years = 5,
  candidate_current_visa = 'H1B',
  candidate_visa_expiry = NOW() + INTERVAL '2 years',
  candidate_hourly_rate = 85.00,
  candidate_availability = 'immediate',
  candidate_location = 'Remote',
  candidate_willing_to_relocate = true
WHERE email = 'candidate@intime.com';

UPDATE user_profiles SET
  candidate_status = 'bench',
  candidate_resume_url = 'https://storage.intime.com/resumes/candidate-002.pdf',
  candidate_skills = ARRAY['Guidewire', 'Java', 'ClaimCenter', 'PolicyCenter'],
  candidate_experience_years = 7,
  candidate_current_visa = 'GC',
  candidate_hourly_rate = 95.00,
  candidate_bench_start_date = NOW() - INTERVAL '15 days',
  candidate_availability = 'immediate',
  candidate_location = 'Chicago, IL',
  candidate_willing_to_relocate = false
WHERE email = 'candidate1@intime.com';

UPDATE user_profiles SET
  candidate_status = 'placed',
  candidate_skills = ARRAY['Salesforce', 'Apex', 'Lightning'],
  candidate_experience_years = 4,
  candidate_current_visa = 'USC',
  candidate_hourly_rate = 75.00,
  candidate_location = 'Los Angeles, CA'
WHERE email = 'candidate2@intime.com';

UPDATE user_profiles SET
  candidate_status = 'inactive',
  candidate_skills = ARRAY['Python', 'Django', 'AWS'],
  candidate_experience_years = 3,
  candidate_current_visa = 'OPT',
  candidate_visa_expiry = NOW() + INTERVAL '6 months',
  candidate_location = 'Denver, CO'
WHERE email = 'candidate3@intime.com';

-- Clients
UPDATE user_profiles SET
  client_company_name = 'TechCorp USA',
  client_industry = 'Technology',
  client_tier = 'strategic',
  client_contract_start_date = NOW() - INTERVAL '1 year',
  client_contract_end_date = NOW() + INTERVAL '2 years',
  client_payment_terms = 30,
  client_preferred_markup_percentage = 35.00
WHERE email = 'client@intime.com';

UPDATE user_profiles SET
  client_company_name = 'HealthPlus Inc',
  client_industry = 'Healthcare',
  client_tier = 'preferred',
  client_contract_start_date = NOW() - INTERVAL '6 months',
  client_payment_terms = 45,
  client_preferred_markup_percentage = 30.00
WHERE email = 'client1@intime.com';

UPDATE user_profiles SET
  client_company_name = 'FinanceHub',
  client_industry = 'Finance',
  client_tier = 'exclusive',
  client_contract_start_date = NOW() - INTERVAL '2 years',
  client_contract_end_date = NOW() + INTERVAL '3 years',
  client_payment_terms = 30,
  client_preferred_markup_percentage = 40.00
WHERE email = 'client2@intime.com';

-- Step 4: Create System Roles (if not exist)
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
VALUES
  ('admin', 'Administrator', 'Full system access', true, 0, '#ef4444'),
  ('ceo', 'CEO', 'Executive access', true, 0, '#8b5cf6'),
  ('hr_manager', 'HR Manager', 'Human resources management', true, 1, '#10b981'),
  ('trainer', 'Trainer', 'Course instructor', true, 2, '#3b82f6'),
  ('student', 'Student', 'Academy student', true, 3, '#6366f1'),
  ('senior_recruiter', 'Senior Recruiter', 'Lead recruitment pod', true, 2, '#f59e0b'),
  ('junior_recruiter', 'Junior Recruiter', 'Support recruitment', true, 3, '#fbbf24'),
  ('senior_bench_sales', 'Senior Bench Sales', 'Lead bench sales pod', true, 2, '#06b6d4'),
  ('junior_bench_sales', 'Junior Bench Sales', 'Support bench sales', true, 3, '#22d3ee'),
  ('senior_ta', 'Senior TA', 'Lead talent acquisition', true, 2, '#84cc16'),
  ('junior_ta', 'Junior TA', 'Support talent acquisition', true, 3, '#a3e635'),
  ('candidate', 'Candidate', 'Job seeker', true, 4, '#64748b'),
  ('client', 'Client', 'Hiring company contact', true, 4, '#475569')
ON CONFLICT (name) DO NOTHING;

-- Step 5: Assign Roles to Users

-- Leadership
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, up.id
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'ceo@intime.com' AND r.name = 'ceo'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, up.id
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'admin@intime.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, up.id
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'hr@intime.com' AND r.name = 'hr_manager'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Students
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('student@intime.com', 'student1@intime.com', 'student2@intime.com')
  AND r.name = 'student'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Trainer
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'trainer@intime.com' AND r.name = 'trainer'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Recruiters
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('sr_rec@intime.com', 'sr_rec2@intime.com')
  AND r.name = 'senior_recruiter'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('jr_rec@intime.com', 'jr_rec2@intime.com')
  AND r.name = 'junior_recruiter'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Bench Sales
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('sr_bs@intime.com', 'sr_bs2@intime.com')
  AND r.name = 'senior_bench_sales'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('jr_bs@intime.com', 'jr_bs2@intime.com')
  AND r.name = 'junior_bench_sales'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Talent Acquisition
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'sr_ta@intime.com' AND r.name = 'senior_ta'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email = 'jr_ta@intime.com' AND r.name = 'junior_ta'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Candidates
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('candidate@intime.com', 'candidate1@intime.com', 'candidate2@intime.com', 'candidate3@intime.com')
  AND r.name = 'candidate'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Clients
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT up.id, r.id, true, (SELECT id FROM user_profiles WHERE email = 'admin@intime.com')
FROM user_profiles up
CROSS JOIN roles r
WHERE up.email IN ('client@intime.com', 'client1@intime.com', 'client2@intime.com')
  AND r.name = 'client'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 6: Verification Query
SELECT 
  up.email,
  up.full_name,
  r.display_name as role,
  up.employee_department
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id AND ur.is_primary = true
LEFT JOIN roles r ON ur.role_id = r.id
WHERE up.email LIKE '%@intime.com'
  AND up.deleted_at IS NULL
ORDER BY up.email;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Test Data Seed Complete!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Users Created: 25';
  RAISE NOTICE 'Roles Assigned: 13 role types';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Test Credentials:';
  RAISE NOTICE '  - student@intime.com (68%% progress)';
  RAISE NOTICE '  - sr_rec@intime.com (Senior Recruiter)';
  RAISE NOTICE '  - admin@intime.com (Full access)';
  RAISE NOTICE '============================================================';
END $$;
