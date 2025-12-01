# PROMPT: DB-ATS (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill and recruiting skill.

Design the complete ATS (Applicant Tracking System) database schema.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md
- docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md
- docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (visa types, job types)
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships - CRITICAL)
- docs/specs/10-DATABASE/01-jobs.md (Full jobs table spec with all fields)
- docs/specs/10-DATABASE/02-candidates.md (Full candidates table spec)
- docs/specs/10-DATABASE/07-submissions.md (Submissions table spec)
- docs/specs/10-DATABASE/09-placements.md (Placements table spec)
- src/lib/db/schema/ats.ts

## Create/Update src/lib/db/schema/ats.ts:

### SKILLS (shared)
- `skills` - name, category, is_verified
- `skill_aliases` - skill_id, alias

### JOBS
- `jobs` - title, account_id, status (draft/open/paused/filled/closed), priority (critical/high/medium/low), job_type (contract/fte/c2h/part_time), work_mode (remote/hybrid/onsite), location_city, location_state, location_country, description, positions_open, positions_filled, published_at, closes_at
- `job_requirements` - job_id, requirement, type (must_have/nice_to_have), sequence
- `job_skills` - job_id, skill_id, importance (required/preferred), min_years
- `job_rates` - job_id, bill_rate_min, bill_rate_max, pay_rate_min, pay_rate_max, currency, rate_type (hourly/daily/annual)
- `job_assignments` - job_id, user_id, role (primary/secondary/sourcer)
- `job_screening_questions` - job_id, question, type (text/select/boolean), options (jsonb), is_required

### CANDIDATES
- `candidates` - first_name, last_name, email, phone, status (new/contacted/qualified/submitted/interviewing/offered/placed/rejected/inactive), source (linkedin/referral/job_board/direct), visa_status, current_company, current_title, willing_relocate, preferred_locations (array)
- `candidate_profiles` - candidate_id, summary, total_experience_years, highest_education, linkedin_url, github_url, portfolio_url
- `candidate_skills` - candidate_id, skill_id, years_experience, proficiency (beginner/intermediate/advanced/expert), is_verified
- `candidate_work_history` - candidate_id, company, title, location, start_date, end_date, is_current, description, achievements
- `candidate_education` - candidate_id, institution, degree, field, start_year, end_year, gpa
- `candidate_documents` - candidate_id, type (resume/cover_letter/portfolio/certification), file_url, file_name, version, is_primary, uploaded_at
- `candidate_availability` - candidate_id, available_from, notice_period_days, preferred_rate_min, preferred_rate_max, currency
- `candidate_preferences` - candidate_id, preferred_job_types (array), preferred_work_modes (array), preferred_industries (array), min_rate, max_commute_miles

### SUBMISSIONS
- `submissions` - candidate_id, job_id, status (draft/submitted/under_review/shortlisted/rejected/interview/offer/withdrawn), submitted_by, submitted_at, client_submitted_at
- `submission_rates` - submission_id, bill_rate, pay_rate, margin_percent, margin_amount, currency
- `submission_screening_answers` - submission_id, question_id, answer
- `submission_notes` - submission_id, note, is_client_visible, created_by, created_at
- `submission_status_history` - submission_id, from_status, to_status, reason, changed_by, changed_at

### INTERVIEWS
- `interviews` - submission_id, type (phone_screen/technical/behavioral/panel/onsite/final), status (scheduled/completed/cancelled/no_show), scheduled_at, duration_minutes, location, meeting_url, timezone
- `interview_participants` - interview_id, participant_type (interviewer/candidate/recruiter), user_id, external_name, external_email, is_required
- `interview_feedback` - interview_id, submitted_by, rating (1-5), recommendation (strong_yes/yes/maybe/no/strong_no), strengths, weaknesses, notes, submitted_at
- `interview_reminders` - interview_id, reminder_type (24h/1h/15m), sent_at

### OFFERS
- `offers` - submission_id, status (draft/pending_approval/sent/negotiating/accepted/declined/expired/withdrawn), salary_type (hourly/annual), salary_amount, currency, start_date, offer_expiry_date, sent_at
- `offer_terms` - offer_id, term_type (signing_bonus/relocation/pto/benefits/other), value, description
- `offer_negotiations` - offer_id, requested_by (candidate/client), requested_changes, status (pending/accepted/rejected), notes, created_at
- `offer_approvals` - offer_id, approver_id, status (pending/approved/rejected), notes, decided_at

### PLACEMENTS
- `placements` - offer_id, status (pending_start/active/completed/terminated), start_date, original_end_date, current_end_date, actual_end_date, termination_reason
- `placement_rates` - placement_id, bill_rate, pay_rate, margin_percent, effective_from, effective_to
- `placement_extensions` - placement_id, previous_end_date, new_end_date, reason, approved_by, approved_at
- `placement_timesheets` - placement_id, week_ending, regular_hours, overtime_hours, status (draft/submitted/approved/rejected), submitted_at, approved_by, approved_at
- `placement_milestones` - placement_id, milestone_type (day1/week1/day30/day60/day90/end), due_date, completed_at, notes

## Requirements:
- All tables: id, org_id, created_at, updated_at, deleted_at
- Add proper relations between tables
- Create indexes for: status fields, foreign keys, date fields
- Export TypeScript types

## After Schema:
Generate migration: npx drizzle-kit generate

Use multi-agents to parallelize table creation. Analyze what we have, think hard and complete
