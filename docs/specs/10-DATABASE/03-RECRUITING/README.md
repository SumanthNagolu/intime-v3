# RECRUITING/ATS Domain Tables Documentation

This directory contains comprehensive documentation for all database tables in the Recruiting/ATS domain of InTime v3.

## Overview

The Recruiting/ATS domain manages the complete applicant tracking system workflow, from job requisitions through candidate sourcing, submissions, interviews, offers, and placements.

## Table Categories

### Job Management (5 tables)
- **jobs.md** - Core job/requisition table
- **job_assignments.md** - User assignments to jobs
- **job_rates.md** - Detailed rate structures
- **job_requirements.md** - Job requirements and qualifications
- **job_screening_questions.md** - Custom screening questions
- **job_skills.md** - Job-skill junction table

### Candidate Management (14 tables)
- **candidate_profiles.md** - Core candidate information
- **candidate_availability.md** - Availability windows
- **candidate_background_checks.md** - Background check records
- **candidate_certifications.md** - Professional certifications
- **candidate_compliance_documents.md** - Compliance documents (I-9, etc.)
- **candidate_documents.md** - General document storage
- **candidate_education.md** - Education history
- **candidate_embeddings.md** - AI vector embeddings
- **candidate_preferences.md** - Job preferences
- **candidate_references.md** - Professional references
- **candidate_resumes.md** - Resume files and metadata
- **candidate_skills.md** - Skills with proficiency levels
- **candidate_work_authorizations.md** - Work authorization/visa status
- **candidate_work_history.md** - Employment history

### Submission Workflow (5 tables)
- **submissions.md** - Core submission entity (candidate-to-job)
- **submission_notes.md** - Notes on submissions
- **submission_rates.md** - Rate negotiations
- **submission_screening_answers.md** - Screening question answers
- **submission_status_history.md** - Status change audit trail

### Interview Process (5 tables)
- **interviews.md** - Interview scheduling
- **interview_feedback.md** - Interviewer feedback
- **interview_participants.md** - Interview participants
- **interview_reminders.md** - Reminder configurations
- **interview_sessions.md** - Individual interview rounds

### Offer Management (4 tables)
- **offers.md** - Job offers
- **offer_approvals.md** - Approval workflow
- **offer_negotiations.md** - Negotiation history
- **offer_terms.md** - Detailed offer terms

### Placement Management (6 tables)
- **placements.md** - Active placements
- **placement_credits.md** - Commission allocation
- **placement_extensions.md** - Contract extensions
- **placement_milestones.md** - Lifecycle milestones
- **placement_rates.md** - Billing rates
- **placement_timesheets.md** - Timesheet submissions

### Special Purpose (4 tables)
- **graduate_candidates.md** - Academy graduates tracking
- **resume_matches.md** - AI resume-to-job matching
- **resume_versions.md** - Resume version history
- **requisition_embeddings.md** - AI job vector embeddings

## ATS Workflow

The typical ATS workflow follows this path:

1. **Job Creation** - `jobs` table with related `job_requirements`, `job_skills`, `job_screening_questions`
2. **Job Assignment** - `job_assignments` assigns recruiters to work on the job
3. **Candidate Sourcing** - `candidate_profiles` with supporting tables (skills, education, work history, etc.)
4. **Submission** - `submissions` links candidate to job, tracks AI matching scores
5. **Screening** - `submission_screening_answers` captures responses to job-specific questions
6. **Interview** - `interviews` with `interview_sessions`, `interview_participants`, `interview_feedback`
7. **Offer** - `offers` with `offer_terms`, `offer_negotiations`, `offer_approvals`
8. **Placement** - `placements` with billing rates, milestones, timesheets, credits

## AI/ML Integration

Several tables support AI-powered features:

- **candidate_embeddings** - Vector representations for semantic candidate search
- **requisition_embeddings** - Vector representations for semantic job search
- **resume_matches** - AI-generated candidate-to-job match scores and explanations
- **submissions.ai_match_score** - AI confidence in candidate-job fit

## Documentation Format

Each table documentation includes:

1. **Overview** - Table name, schema, and purpose
2. **Columns** - Complete column definitions with types, nullability, defaults, and descriptions
3. **Foreign Keys** - References to other tables
4. **Indexes** - Performance optimization indexes

## Total Tables: 44

All tables follow InTime v3 conventions:
- UUID primary keys
- Soft deletes via `deleted_at`
- Audit fields (`created_at`, `updated_at`, `created_by`)
- Organization multi-tenancy via `org_id`
- Full-text search support where applicable

## Generated

This documentation was auto-generated from the production database schema on 2025-12-01.
