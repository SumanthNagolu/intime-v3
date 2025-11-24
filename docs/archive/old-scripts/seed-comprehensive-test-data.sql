-- ============================================================================
-- Comprehensive Test Data Seed Script - InTime v3
-- Purpose: Create complete set of test users for all application scenarios
-- Total Users: 36 across all roles and business pillars
-- Default Password: TestPass123! (to be set in Supabase Auth)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create System Roles (if not exists)
-- ============================================================================
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code) VALUES
  -- Leadership & Admin (Tier 0-1)
  ('super_admin', 'Super Admin', 'Complete system access', true, 0, '#dc2626'),
  ('admin', 'Administrator', 'System administration and user management', true, 1, '#ef4444'),
  ('ceo', 'CEO', 'Executive leadership and strategic oversight', true, 0, '#8b5cf6'),
  ('cfo', 'CFO', 'Financial oversight and budget management', true, 0, '#ec4899'),

  -- HR & People Management (Tier 1-2)
  ('hr_manager', 'HR Manager', 'Human resources and employee management', true, 1, '#10b981'),
  ('hr_admin', 'HR Administrator', 'HR administrative support', true, 2, '#34d399'),

  -- Training Academy (Tier 2-3)
  ('trainer', 'Trainer', 'Training academy instructor', true, 2, '#3b82f6'),
  ('student', 'Student', 'Academy student enrolled in training', true, 3, '#6366f1'),

  -- Recruiting Operations (Tier 2-3)
  ('senior_recruiter', 'Senior Recruiter', 'Lead recruiter managing pod', true, 2, '#f59e0b'),
  ('junior_recruiter', 'Junior Recruiter', 'Support recruiter in pod', true, 3, '#fbbf24'),

  -- Bench Sales Operations (Tier 2-3)
  ('senior_bench_sales', 'Senior Bench Sales', 'Lead bench sales managing pod', true, 2, '#06b6d4'),
  ('junior_bench_sales', 'Junior Bench Sales', 'Support bench sales in pod', true, 3, '#22d3ee'),

  -- Talent Acquisition Operations (Tier 2-3)
  ('senior_ta', 'Senior Talent Acquisition', 'Lead talent acquisition managing pod', true, 2, '#84cc16'),
  ('junior_ta', 'Junior Talent Acquisition', 'Support talent acquisition in pod', true, 3, '#a3e635'),

  -- External Stakeholders (Tier 4)
  ('candidate', 'Candidate', 'Job seeker or consultant', true, 4, '#64748b'),
  ('client', 'Client', 'Hiring company contact person', true, 4, '#475569'),
  ('employee', 'Employee', 'Internal employee', true, 3, '#059669')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Create User Profiles
-- ============================================================================

-- Leadership & Admin (3 users)
INSERT INTO user_profiles (org_id, email, full_name, phone, timezone, locale, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@intime.com', 'System Administrator', '+15550001', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'ceo@intime.com', 'Sumanth Rajkumar Nagolu', '+15550002', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'cfo@intime.com', 'Sarah Johnson', '+15550003', 'America/New_York', 'en-US', true),

  -- HR Department (2 users)
  ('00000000-0000-0000-0000-000000000001', 'hr@intime.com', 'Maria Rodriguez', '+15550010', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'hr_admin@intime.com', 'James Wilson', '+15550011', 'America/New_York', 'en-US', true),

  -- Training Academy (5 users)
  ('00000000-0000-0000-0000-000000000001', 'trainer@intime.com', 'Dr. Emily Chen', '+15550020', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'trainer_2@intime.com', 'Prof. Michael Anderson', '+15550021', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'student@intime.com', 'Alex Kumar', '+15550025', 'America/Los_Angeles', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'student_2@intime.com', 'Jessica Martinez', '+15550026', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'student_3@intime.com', 'David Lee', '+15550027', 'America/Denver', 'en-US', true),

  -- Recruiting Pod (4 users)
  ('00000000-0000-0000-0000-000000000001', 'sr_rec@intime.com', 'Alice Thompson', '+15550030', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_rec@intime.com', 'Bob Garcia', '+15550031', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'sr_rec_2@intime.com', 'Carol Davis', '+15550032', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_rec_2@intime.com', 'Daniel Brown', '+15550033', 'America/Chicago', 'en-US', true),

  -- Bench Sales Pod (4 users)
  ('00000000-0000-0000-0000-000000000001', 'sr_bs@intime.com', 'Eve Williams', '+15550040', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_bs@intime.com', 'Frank Miller', '+15550041', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'sr_bs_2@intime.com', 'Grace Taylor', '+15550042', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_bs_2@intime.com', 'Henry Clark', '+15550043', 'America/Chicago', 'en-US', true),

  -- Talent Acquisition Pod (4 users)
  ('00000000-0000-0000-0000-000000000001', 'sr_ta@intime.com', 'Ivy Moore', '+15550050', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_ta@intime.com', 'Jack White', '+15550051', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'sr_ta_2@intime.com', 'Karen Harris', '+15550052', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'jr_ta_2@intime.com', 'Leo Martin', '+15550053', 'America/Chicago', 'en-US', true),

  -- Candidates (6 users with varying statuses and visa types)
  ('00000000-0000-0000-0000-000000000001', 'candidate@intime.com', 'Priya Sharma', '+15550060', 'America/Los_Angeles', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'candidate_bench@intime.com', 'Raj Patel', '+15550061', 'America/Dallas', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'candidate_placed@intime.com', 'Wei Zhang', '+15550062', 'America/Seattle', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'candidate_h1b@intime.com', 'Amit Singh', '+15550063', 'America/San_Francisco', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'candidate_gc@intime.com', 'Maria Gonzalez', '+15550064', 'America/Miami', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'candidate_usc@intime.com', 'John Smith', '+15550065', 'America/Boston', 'en-US', true),

  -- Clients (4 users with different company tiers)
  ('00000000-0000-0000-0000-000000000001', 'client@intime.com', 'Robert Johnson (TechCorp)', '+15550070', 'America/New_York', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'client_strategic@intime.com', 'Linda Chen (HealthPlus)', '+15550071', 'America/Chicago', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'client_exclusive@intime.com', 'Thomas Anderson (FinanceHub)', '+15550072', 'America/Los_Angeles', 'en-US', true),
  ('00000000-0000-0000-0000-000000000001', 'client_new@intime.com', 'Sophie Turner (StartupCo)', '+15550073', 'America/Austin', 'en-US', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 3: Update User Profiles with Role-Specific Data
-- ============================================================================

-- Update HR users with employee data
UPDATE user_profiles SET
  employee_hire_date = '2024-01-15',
  employee_department = 'human_resources',
  employee_position = 'HR Manager',
  employee_status = 'active',
  employee_salary = 95000
WHERE email = 'hr@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-03-01',
  employee_department = 'human_resources',
  employee_position = 'HR Administrator',
  employee_status = 'active',
  employee_salary = 65000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'hr@intime.com')
WHERE email = 'hr_admin@intime.com';

-- Update Trainers with employee data
UPDATE user_profiles SET
  employee_hire_date = '2023-06-01',
  employee_department = 'training',
  employee_position = 'Lead Training Instructor',
  employee_status = 'active',
  employee_salary = 85000
WHERE email = 'trainer@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2023-09-15',
  employee_department = 'training',
  employee_position = 'Training Instructor',
  employee_status = 'active',
  employee_salary = 75000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'trainer@intime.com')
WHERE email = 'trainer_2@intime.com';

-- Update Students with academy data
UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '4 weeks',
  student_current_module = 'Module 2: Advanced Guidewire',
  student_course_progress = '{"module1": 100, "module2": 45}'::jsonb
WHERE email = 'student@intime.com';

UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '6 weeks',
  student_current_module = 'Module 3: Real-world Projects',
  student_course_progress = '{"module1": 100, "module2": 100, "module3": 60}'::jsonb
WHERE email = 'student_2@intime.com';

UPDATE user_profiles SET
  student_enrollment_date = NOW() - INTERVAL '8 weeks',
  student_current_module = 'Module 4: Interview Preparation',
  student_course_progress = '{"module1": 100, "module2": 100, "module3": 100, "module4": 80}'::jsonb,
  student_graduation_date = NOW() + INTERVAL '1 week'
WHERE email = 'student_3@intime.com';

-- Update Recruiters with employee and recruiter data
UPDATE user_profiles SET
  employee_hire_date = '2023-02-01',
  employee_department = 'recruiting',
  employee_position = 'Senior Recruiter',
  employee_status = 'active',
  employee_salary = 80000,
  recruiter_territory = 'Northeast',
  recruiter_specialization = ARRAY['Guidewire', 'Insurance Tech'],
  recruiter_monthly_placement_target = 3
WHERE email = 'sr_rec@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-01-15',
  employee_department = 'recruiting',
  employee_position = 'Junior Recruiter',
  employee_status = 'active',
  employee_salary = 55000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_rec@intime.com'),
  recruiter_territory = 'Northeast',
  recruiter_specialization = ARRAY['Guidewire'],
  recruiter_monthly_placement_target = 2
WHERE email = 'jr_rec@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2023-04-01',
  employee_department = 'recruiting',
  employee_position = 'Senior Recruiter',
  employee_status = 'active',
  employee_salary = 82000,
  recruiter_territory = 'Midwest',
  recruiter_specialization = ARRAY['Guidewire', 'Insurance Tech', 'P&C'],
  recruiter_monthly_placement_target = 3
WHERE email = 'sr_rec_2@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-02-01',
  employee_department = 'recruiting',
  employee_position = 'Junior Recruiter',
  employee_status = 'active',
  employee_salary = 56000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_rec_2@intime.com'),
  recruiter_territory = 'Midwest',
  recruiter_specialization = ARRAY['Guidewire'],
  recruiter_monthly_placement_target = 2
WHERE email = 'jr_rec_2@intime.com';

-- Update Bench Sales with employee data
UPDATE user_profiles SET
  employee_hire_date = '2023-03-15',
  employee_department = 'bench_sales',
  employee_position = 'Senior Bench Sales',
  employee_status = 'active',
  employee_salary = 75000,
  recruiter_monthly_placement_target = 2
WHERE email = 'sr_bs@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-01-20',
  employee_department = 'bench_sales',
  employee_position = 'Junior Bench Sales',
  employee_status = 'active',
  employee_salary = 52000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_bs@intime.com'),
  recruiter_monthly_placement_target = 1
WHERE email = 'jr_bs@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2023-05-01',
  employee_department = 'bench_sales',
  employee_position = 'Senior Bench Sales',
  employee_status = 'active',
  employee_salary = 76000,
  recruiter_monthly_placement_target = 2
WHERE email = 'sr_bs_2@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-02-15',
  employee_department = 'bench_sales',
  employee_position = 'Junior Bench Sales',
  employee_status = 'active',
  employee_salary = 53000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_bs_2@intime.com'),
  recruiter_monthly_placement_target = 1
WHERE email = 'jr_bs_2@intime.com';

-- Update Talent Acquisition with employee data
UPDATE user_profiles SET
  employee_hire_date = '2023-07-01',
  employee_department = 'talent_acquisition',
  employee_position = 'Senior Talent Acquisition',
  employee_status = 'active',
  employee_salary = 78000,
  recruiter_territory = 'National',
  recruiter_specialization = ARRAY['Technical Sourcing', 'Pipeline Building'],
  recruiter_monthly_placement_target = 4
WHERE email = 'sr_ta@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-03-01',
  employee_department = 'talent_acquisition',
  employee_position = 'Junior Talent Acquisition',
  employee_status = 'active',
  employee_salary = 54000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_ta@intime.com'),
  recruiter_territory = 'National',
  recruiter_specialization = ARRAY['Technical Sourcing'],
  recruiter_monthly_placement_target = 2
WHERE email = 'jr_ta@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2023-08-15',
  employee_department = 'talent_acquisition',
  employee_position = 'Senior Talent Acquisition',
  employee_status = 'active',
  employee_salary = 79000,
  recruiter_territory = 'International',
  recruiter_specialization = ARRAY['Technical Sourcing', 'Cross-Border Hiring'],
  recruiter_monthly_placement_target = 4
WHERE email = 'sr_ta_2@intime.com';

UPDATE user_profiles SET
  employee_hire_date = '2024-04-01',
  employee_department = 'talent_acquisition',
  employee_position = 'Junior Talent Acquisition',
  employee_status = 'active',
  employee_salary = 55000,
  employee_manager_id = (SELECT id FROM user_profiles WHERE email = 'sr_ta_2@intime.com'),
  recruiter_territory = 'International',
  recruiter_specialization = ARRAY['Technical Sourcing'],
  recruiter_monthly_placement_target = 2
WHERE email = 'jr_ta_2@intime.com';

-- Update Candidates with detailed profiles
UPDATE user_profiles SET
  candidate_status = 'active',
  candidate_resume_url = 'https://example.com/resumes/priya-sharma.pdf',
  candidate_skills = ARRAY['Guidewire PolicyCenter', 'Guidewire BillingCenter', 'Java', 'SQL'],
  candidate_experience_years = 5,
  candidate_current_visa = 'OPT',
  candidate_visa_expiry = NOW() + INTERVAL '6 months',
  candidate_hourly_rate = 65.00,
  candidate_availability = 'immediate',
  candidate_location = 'Los Angeles, CA',
  candidate_willing_to_relocate = true
WHERE email = 'candidate@intime.com';

UPDATE user_profiles SET
  candidate_status = 'bench',
  candidate_resume_url = 'https://example.com/resumes/raj-patel.pdf',
  candidate_skills = ARRAY['Guidewire ClaimCenter', 'Guidewire PolicyCenter', 'Java', 'REST APIs'],
  candidate_experience_years = 7,
  candidate_current_visa = 'H1B',
  candidate_visa_expiry = NOW() + INTERVAL '2 years',
  candidate_hourly_rate = 75.00,
  candidate_bench_start_date = NOW() - INTERVAL '15 days',
  candidate_availability = 'immediate',
  candidate_location = 'Dallas, TX',
  candidate_willing_to_relocate = true
WHERE email = 'candidate_bench@intime.com';

UPDATE user_profiles SET
  candidate_status = 'placed',
  candidate_resume_url = 'https://example.com/resumes/wei-zhang.pdf',
  candidate_skills = ARRAY['Guidewire Suite', 'Java', 'Microservices', 'AWS'],
  candidate_experience_years = 8,
  candidate_current_visa = 'GC',
  candidate_hourly_rate = 85.00,
  candidate_availability = '1_month',
  candidate_location = 'Seattle, WA',
  candidate_willing_to_relocate = false
WHERE email = 'candidate_placed@intime.com';

UPDATE user_profiles SET
  candidate_status = 'active',
  candidate_resume_url = 'https://example.com/resumes/amit-singh.pdf',
  candidate_skills = ARRAY['Guidewire PolicyCenter', 'Guidewire ClaimCenter', 'Java', 'Spring Boot'],
  candidate_experience_years = 6,
  candidate_current_visa = 'H1B',
  candidate_visa_expiry = NOW() + INTERVAL '18 months',
  candidate_hourly_rate = 70.00,
  candidate_availability = '2_weeks',
  candidate_location = 'San Francisco, CA',
  candidate_willing_to_relocate = true
WHERE email = 'candidate_h1b@intime.com';

UPDATE user_profiles SET
  candidate_status = 'active',
  candidate_resume_url = 'https://example.com/resumes/maria-gonzalez.pdf',
  candidate_skills = ARRAY['Guidewire BillingCenter', 'Guidewire PolicyCenter', 'Java', 'PostgreSQL'],
  candidate_experience_years = 9,
  candidate_current_visa = 'GC',
  candidate_hourly_rate = 80.00,
  candidate_availability = 'immediate',
  candidate_location = 'Miami, FL',
  candidate_willing_to_relocate = true
WHERE email = 'candidate_gc@intime.com';

UPDATE user_profiles SET
  candidate_status = 'active',
  candidate_resume_url = 'https://example.com/resumes/john-smith.pdf',
  candidate_skills = ARRAY['Guidewire Suite', 'Java', 'Microservices', 'Kubernetes', 'Docker'],
  candidate_experience_years = 10,
  candidate_current_visa = 'USC',
  candidate_hourly_rate = 90.00,
  candidate_availability = 'immediate',
  candidate_location = 'Boston, MA',
  candidate_willing_to_relocate = true
WHERE email = 'candidate_usc@intime.com';

-- Update Clients with company details
UPDATE user_profiles SET
  client_company_name = 'TechCorp Inc',
  client_industry = 'Technology',
  client_tier = 'preferred',
  client_contract_start_date = '2024-01-01',
  client_contract_end_date = '2025-12-31',
  client_payment_terms = 30,
  client_preferred_markup_percentage = 25.00
WHERE email = 'client@intime.com';

UPDATE user_profiles SET
  client_company_name = 'HealthPlus Solutions',
  client_industry = 'Healthcare',
  client_tier = 'strategic',
  client_contract_start_date = '2023-06-01',
  client_contract_end_date = '2026-05-31',
  client_payment_terms = 45,
  client_preferred_markup_percentage = 30.00
WHERE email = 'client_strategic@intime.com';

UPDATE user_profiles SET
  client_company_name = 'FinanceHub Global',
  client_industry = 'Financial Services',
  client_tier = 'exclusive',
  client_contract_start_date = '2023-01-01',
  client_contract_end_date = '2028-12-31',
  client_payment_terms = 60,
  client_preferred_markup_percentage = 35.00
WHERE email = 'client_exclusive@intime.com';

UPDATE user_profiles SET
  client_company_name = 'StartupCo',
  client_industry = 'Insurance Tech',
  client_tier = 'preferred',
  client_contract_start_date = NOW(),
  client_contract_end_date = NOW() + INTERVAL '1 year',
  client_payment_terms = 30,
  client_preferred_markup_percentage = 22.00
WHERE email = 'client_new@intime.com';

-- ============================================================================
-- STEP 4: Assign Roles to Users
-- ============================================================================

-- Leadership & Admin
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email = 'admin@intime.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email = 'ceo@intime.com' AND r.name = 'ceo'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email = 'cfo@intime.com' AND r.name = 'cfo'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- HR Department
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email = 'hr@intime.com' AND r.name = 'hr_manager'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email = 'hr_admin@intime.com' AND r.name = 'hr_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Training Academy
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('trainer@intime.com', 'trainer_2@intime.com') AND r.name = 'trainer'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('student@intime.com', 'student_2@intime.com', 'student_3@intime.com') AND r.name = 'student'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Recruiting
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('sr_rec@intime.com', 'sr_rec_2@intime.com') AND r.name = 'senior_recruiter'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('jr_rec@intime.com', 'jr_rec_2@intime.com') AND r.name = 'junior_recruiter'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Bench Sales
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('sr_bs@intime.com', 'sr_bs_2@intime.com') AND r.name = 'senior_bench_sales'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('jr_bs@intime.com', 'jr_bs_2@intime.com') AND r.name = 'junior_bench_sales'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Talent Acquisition
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('sr_ta@intime.com', 'sr_ta_2@intime.com') AND r.name = 'senior_ta'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN ('jr_ta@intime.com', 'jr_ta_2@intime.com') AND r.name = 'junior_ta'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Candidates
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN (
  'candidate@intime.com',
  'candidate_bench@intime.com',
  'candidate_placed@intime.com',
  'candidate_h1b@intime.com',
  'candidate_gc@intime.com',
  'candidate_usc@intime.com'
) AND r.name = 'candidate'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Clients
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM user_profiles up, roles r
WHERE up.email IN (
  'client@intime.com',
  'client_strategic@intime.com',
  'client_exclusive@intime.com',
  'client_new@intime.com'
) AND r.name = 'client'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- STEP 5: Verification
-- ============================================================================

SELECT
  '=== USER CREATION SUMMARY ===' as summary;

SELECT
  r.display_name as role,
  COUNT(ur.user_id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id
WHERE r.is_system_role = true
GROUP BY r.id, r.display_name, r.hierarchy_level
ORDER BY r.hierarchy_level, r.display_name;

SELECT
  '=== TOTAL COUNTS ===' as summary;

SELECT
  (SELECT COUNT(*) FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM user_roles WHERE user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intime.com')) as total_role_assignments,
  (SELECT COUNT(*) FROM roles WHERE is_system_role = true) as total_system_roles;
