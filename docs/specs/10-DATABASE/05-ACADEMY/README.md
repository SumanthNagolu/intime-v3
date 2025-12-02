# ACADEMY Domain - Database Documentation

## Overview

This directory contains comprehensive documentation for all database tables in the **ACADEMY** domain of InTime v3. The Academy is a gamified training platform that includes courses, learning paths, assessments, labs, certifications, and engagement features.

## Table Count

**Total Tables:** 60

## Table Categories

### Core Course Structure (8 tables)
- [courses](./courses.md) - Main course catalog with metadata and pricing
- [course_modules](./course_modules.md) - Organizational units within courses
- [course_pricing](./course_pricing.md) - Pricing tiers and plans
- [module_topics](./module_topics.md) - Individual topics within modules
- [topic_lessons](./topic_lessons.md) - Lesson content and materials
- [topic_completions](./topic_completions.md) - Student completion tracking
- [topic_difficulty_stats](./topic_difficulty_stats.md) - Performance metrics per topic
- [topic_unlock_requirements](./topic_unlock_requirements.md) - Prerequisites for topics

### Learning Paths (4 tables)
- [learning_paths](./learning_paths.md) - Curated course sequences
- [learning_path_courses](./learning_path_courses.md) - Path-to-course mappings
- [path_enrollments](./path_enrollments.md) - Student path enrollments
- [learning_streaks](./learning_streaks.md) - Consecutive learning activity tracking

### Student Progress & Enrollment (4 tables)
- [student_enrollments](./student_enrollments.md) - Course enrollment records
- [student_progress](./student_progress.md) - Detailed progress tracking
- [student_interventions](./student_interventions.md) - Performance-based interventions

### Quizzes & Assessments (5 tables)
- [quiz_settings](./quiz_settings.md) - Quiz configuration
- [quiz_questions](./quiz_questions.md) - Question bank
- [quiz_attempts](./quiz_attempts.md) - Student quiz attempts
- [quiz_analytics](./quiz_analytics.md) - Quiz performance analytics
- [question_bank_stats](./question_bank_stats.md) - Question difficulty metrics

### Labs & Hands-on Practice (4 tables)
- [lab_templates](./lab_templates.md) - Reusable lab exercises
- [lab_instances](./lab_instances.md) - Student lab sessions
- [lab_submissions](./lab_submissions.md) - Lab work submissions
- [lab_statistics](./lab_statistics.md) - Lab engagement analytics

### Capstone Projects (3 tables)
- [capstone_submissions](./capstone_submissions.md) - Final project submissions
- [capstone_grading_queue](./capstone_grading_queue.md) - Grading workflow
- [capstone_statistics](./capstone_statistics.md) - Project outcome analytics

### Certificates (2 tables)
- [certificates](./certificates.md) - Issued certificates
- [certificate_templates](./certificate_templates.md) - Certificate designs

### Gamification - Achievements (3 tables)
- [achievements](./achievements.md) - Achievement definitions
- [user_achievements](./user_achievements.md) - User achievement records
- [rare_achievements](./rare_achievements.md) - Special high-difficulty achievements

### Gamification - Badges (9 tables)
- [badges](./badges.md) - Badge definitions
- [user_badges](./user_badges.md) - User badge records
- [badge_progress](./badge_progress.md) - Badge completion progress
- [user_badge_progress](./user_badge_progress.md) - Individual user progress
- [badge_completion_stats](./badge_completion_stats.md) - Completion analytics
- [badge_trigger_events](./badge_trigger_events.md) - Event-based triggers
- [badge_leaderboard](./badge_leaderboard.md) - Badge-based rankings

### XP & Leveling (3 tables)
- [xp_transactions](./xp_transactions.md) - Experience point log
- [level_definitions](./level_definitions.md) - Level thresholds and rewards
- [user_levels](./user_levels.md) - User level status

### Leaderboards (8 tables)
- [leaderboards](./leaderboards.md) - Leaderboard configurations
- [leaderboard_entries](./leaderboard_entries.md) - Generic entries
- [leaderboard_all_time](./leaderboard_all_time.md) - All-time rankings
- [leaderboard_weekly](./leaderboard_weekly.md) - Weekly rankings
- [leaderboard_by_course](./leaderboard_by_course.md) - Course-specific rankings
- [leaderboard_by_cohort](./leaderboard_by_cohort.md) - Cohort rankings
- [leaderboard_global](./leaderboard_global.md) - Global rankings

### Content Tracking (5 tables)
- [reading_progress](./reading_progress.md) - Reading material progress
- [reading_stats](./reading_stats.md) - Reading engagement analytics
- [video_progress](./video_progress.md) - Video watch progress
- [video_watch_stats](./video_watch_stats.md) - Video engagement analytics
- [content_assets](./content_assets.md) - Media and file assets

### Peer Review (3 tables)
- [peer_reviews](./peer_reviews.md) - Peer review submissions
- [peer_review_leaderboard](./peer_review_leaderboard.md) - Peer review rankings
- [grading_queue](./grading_queue.md) - General grading workflow

### Pricing & Discounts (3 tables)
- [pricing_plans](./pricing_plans.md) - Subscription plans
- [discount_codes](./discount_codes.md) - Promotional codes
- [discount_code_usage](./discount_code_usage.md) - Code redemption tracking

## Key Relationships

### Primary Foreign Keys
Most tables reference:
- `user_profiles.id` - For user associations (students, instructors, graders)
- `courses.id` - For course-related entities
- `course_modules.id` - For module-specific content
- `module_topics.id` - For topic-level tracking

### Cascade Patterns
- Course deletion cascades to modules, topics, and enrollments
- User deletion may be restricted or cascade based on data retention policies
- Soft deletes are used extensively (via `deleted_at` timestamp)

## Common Patterns

### Timestamps
Nearly all tables include:
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp
- `deleted_at` - Soft delete timestamp (nullable)

### Identifiers
- Primary keys use `uuid` with `gen_random_uuid()` default
- `slug` fields for URL-friendly unique identifiers
- Composite unique constraints where needed

### Indexing Strategy
- Primary keys have unique indexes
- Foreign keys are indexed for join performance
- Filtered indexes on boolean flags (`is_published`, `is_active`)
- Composite indexes for common query patterns

## Documentation Format

Each table documentation file includes:
1. **Overview** - Table name, schema, and purpose
2. **Columns** - Column details with types, nullability, defaults, and descriptions
3. **Foreign Keys** - Relationships to other tables
4. **Indexes** - Performance optimization indexes

## Generated Information

- **Generated Date:** 2025-12-01
- **Source Database:** InTime v3 Production Schema
- **Method:** Automated schema introspection via Supabase Edge Functions
- **Total Documentation Files:** 60

## Related Documentation

- See `/docs/specs/10-DATABASE/01-CORE/` for core platform tables
- See `/docs/specs/10-DATABASE/02-ATS/` for recruiting tables
- See `/docs/specs/10-DATABASE/03-BENCH/` for bench sales tables
- See `/docs/specs/10-DATABASE/04-CRM/` for CRM tables

## Maintenance Notes

This documentation is generated from the live database schema. When making schema changes:

1. Run migrations via the `execute-sql` Edge Function
2. Update Drizzle schema files in `src/lib/db/schema/academy.ts`
3. Regenerate this documentation to stay in sync
4. Update the Academy skill documentation if business logic changes

## Contact

For questions about Academy domain tables, consult:
- **Skill:** `academy` - Load with "Use the academy skill"
- **Schema File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/schema/academy.ts`
- **Migrations:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/supabase/migrations/`
