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
