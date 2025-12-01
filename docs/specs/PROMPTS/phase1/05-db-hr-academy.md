# PROMPT: DB-HR-ACADEMY (Window 5)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill, hr skill, and academy skill.

Design the complete HR and Academy database schema.

## Read First:
- docs/specs/20-USER-ROLES/06-hr-manager/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/06-hr-manager/02-onboard-employee.md
- docs/specs/20-USER-ROLES/06-hr-manager/03-manage-benefits.md
- docs/specs/20-USER-ROLES/06-hr-manager/04-us-employment-compliance.md
- docs/specs/20-USER-ROLES/08-academy/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/08-academy/02-create-course.md
- docs/specs/20-USER-ROLES/08-academy/03-enroll-learner.md
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (gamification, XP system)
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships)
- docs/specs/10-DATABASE/13-user-profiles.md (User profiles - employees are user profiles)
- src/lib/db/schema/hr.ts
- src/lib/db/schema/academy.ts

## Create/Update src/lib/db/schema/hr.ts:

### EMPLOYEES
- `employees` - user_id, employee_number, status (onboarding/active/on_leave/terminated), employment_type (fte/contractor/intern), hire_date, termination_date, department, job_title, manager_id, location, work_mode, salary_type (hourly/annual), salary_amount, currency
- `employee_profiles` - employee_id, date_of_birth, ssn_encrypted, address_street, address_city, address_state, address_country, address_postal, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- `employee_documents` - employee_id, document_type (offer_letter/contract/i9/w4/tax_form/nda/handbook_ack/performance_review), file_url, file_name, issue_date, expiry_date, status (pending/approved/expired), verified_by, verified_at
- `employee_onboarding` - employee_id, checklist_template_id, status (not_started/in_progress/completed), started_at, completed_at, assigned_to
- `onboarding_tasks` - onboarding_id, task_name, category (paperwork/it_setup/training/orientation/other), is_required, due_days_from_start, status (pending/completed/skipped), completed_at, completed_by, notes
- `employee_time_off` - employee_id, type (pto/sick/personal/bereavement/jury_duty/parental), status (pending/approved/denied/cancelled), start_date, end_date, hours, reason, approved_by, approved_at

### BENEFITS
- `benefit_plans` - name, type (health/dental/vision/401k/life/disability/hsa/fsa), provider, status (active/inactive), effective_date, termination_date, description
- `benefit_plan_options` - plan_id, option_name, coverage_level (employee/employee_spouse/employee_children/family), employer_contribution, employee_contribution, description
- `employee_benefits` - employee_id, plan_option_id, status (pending/active/terminated), enrollment_date, coverage_start, coverage_end, dependents_count
- `benefit_dependents` - employee_benefit_id, name, relationship (spouse/child/domestic_partner), date_of_birth, ssn_encrypted

### COMPLIANCE
- `compliance_requirements` - name, type (federal/state/local), jurisdiction, applies_to (all/fte/contractor), frequency (once/annual/quarterly), description, document_template_url
- `employee_compliance` - employee_id, requirement_id, status (pending/completed/overdue/exempt), due_date, completed_at, document_url, notes
- `i9_records` - employee_id, section1_completed_at, section2_completed_at, list_a_document, list_b_document, list_c_document, authorized_rep_name, authorized_rep_title, reverification_date, status

### PERFORMANCE
- `performance_reviews` - employee_id, review_period_start, review_period_end, reviewer_id, status (draft/self_review/manager_review/calibration/completed), overall_rating (1-5), submitted_at, completed_at
- `performance_goals` - employee_id, review_id, goal, category (business/development/behavioral), weight_percent, status (not_started/in_progress/completed/cancelled), rating (1-5), comments
- `performance_feedback` - review_id, feedback_type (strength/improvement/comment), content, category

## Create/Update src/lib/db/schema/academy.ts:

### COURSES
- `courses` - title, slug, description, category, difficulty (beginner/intermediate/advanced/expert), duration_minutes, status (draft/published/archived), thumbnail_url, instructor_id, prerequisites (array of course_ids), tags (array), xp_reward, passing_score
- `course_modules` - course_id, title, description, sequence, duration_minutes, is_required
- `module_lessons` - module_id, title, type (video/text/interactive/quiz/assignment), content_url, content (text for text lessons), duration_minutes, sequence, xp_reward
- `lesson_resources` - lesson_id, title, type (pdf/link/download), resource_url, description

### ASSESSMENTS
- `quizzes` - lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_questions, show_answers_after
- `quiz_questions` - quiz_id, question, type (multiple_choice/multi_select/true_false/short_answer), options (jsonb), correct_answer (jsonb), points, explanation, sequence
- `assignments` - lesson_id, title, description, instructions, submission_type (file/text/url), due_days_from_enrollment, max_points, rubric (jsonb)

### ENROLLMENTS
- `enrollments` - user_id, course_id, status (enrolled/in_progress/completed/dropped), enrolled_at, started_at, completed_at, deadline, assigned_by, is_required
- `lesson_progress` - enrollment_id, lesson_id, status (not_started/in_progress/completed), started_at, completed_at, time_spent_seconds, last_position (for video)
- `quiz_attempts` - enrollment_id, quiz_id, attempt_number, score, passed, started_at, completed_at, answers (jsonb)
- `assignment_submissions` - enrollment_id, assignment_id, submission_url, submission_text, submitted_at, grade, graded_by, graded_at, feedback

### CERTIFICATES
- `certificate_templates` - name, design_template, fields (jsonb), is_active
- `certificates` - enrollment_id, template_id, certificate_number, issued_at, expiry_date, pdf_url, verification_code

### GAMIFICATION
- `xp_transactions` - user_id, source_type (lesson/quiz/course/achievement/streak/bonus), source_id, xp_amount, description, created_at
- `user_levels` - user_id, current_level, current_xp, xp_to_next_level, level_up_at
- `level_definitions` - level, xp_required, title, badge_url, perks (jsonb)
- `achievements` - name, description, category (learning/engagement/mastery/social), badge_url, xp_reward, criteria (jsonb), is_secret
- `user_achievements` - user_id, achievement_id, unlocked_at, progress (jsonb)
- `streaks` - user_id, streak_type (daily_login/daily_learning/weekly_completion), current_count, longest_count, last_activity_date, streak_started_at
- `leaderboards` - type (weekly/monthly/all_time), scope (org/department/course), period_start, period_end
- `leaderboard_entries` - leaderboard_id, user_id, rank, xp_earned, courses_completed, lessons_completed

### LEARNING PATHS
- `learning_paths` - title, description, category, difficulty, duration_estimate_hours, status (draft/published/archived), thumbnail_url, created_by
- `learning_path_courses` - path_id, course_id, sequence, is_required
- `path_enrollments` - user_id, path_id, status (enrolled/in_progress/completed), enrolled_at, completed_at, progress_percent

## Requirements:
- Gamification with XP, levels, achievements, streaks
- Progress tracking at lesson level
- Certificate generation support
- Leaderboard support
- Proper indexes

## After Schema:
Generate migration: npx drizzle-kit generate

Use multi-agents to parallelize table creation. Analyze what we have in codebase, think hard and complete
