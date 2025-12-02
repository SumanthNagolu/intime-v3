# onboarding_checklist Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `onboarding_checklist` |
| Schema | `public` |
| Purpose | Onboarding checklist templates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `user_id` | uuid | NO | - | User profile reference |
| `completed_profile` | boolean | YES | false | Completed Profile |
| `completed_profile_at` | timestamptz | YES | - | Completed Profile At |
| `enrolled_first_course` | boolean | YES | false | Enrolled First Course |
| `enrolled_first_course_at` | timestamptz | YES | - | Enrolled First Course At |
| `watched_first_video` | boolean | YES | false | Watched First Video |
| `watched_first_video_at` | timestamptz | YES | - | Watched First Video At |
| `completed_first_quiz` | boolean | YES | false | Completed First Quiz |
| `completed_first_quiz_at` | timestamptz | YES | - | Completed First Quiz At |
| `joined_community` | boolean | YES | false | Joined Community |
| `joined_community_at` | timestamptz | YES | - | Joined Community At |
| `connected_payment_method` | boolean | YES | false | Connected Payment Method |
| `connected_payment_method_at` | timestamptz | YES | - | Connected Payment Method At |
| `set_learning_goals` | boolean | YES | false | Set Learning Goals |
| `set_learning_goals_at` | timestamptz | YES | - | Set Learning Goals At |
| `completed_orientation` | boolean | YES | false | Completed Orientation |
| `completed_orientation_at` | timestamptz | YES | - | Completed Orientation At |
| `total_steps` | integer | YES | - | Total Steps |
| `completed_steps` | integer | YES | - | Completed Steps |
| `completion_percentage` | integer | YES | - | Completion Percentage |
| `created_at` | timestamptz | YES | now() | Record creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |
| `completed_at` | timestamptz | YES | - | Completed At |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `onboarding_checklist_pkey` | `CREATE UNIQUE INDEX onboarding_checklist_pkey ON public.onboarding_checklist USING btree (id)` |
| `unique_checklist_per_user` | `CREATE UNIQUE INDEX unique_checklist_per_user ON public.onboarding_checklist USING btree (user_id)` |
| `idx_onboarding_checklist_user` | `CREATE INDEX idx_onboarding_checklist_user ON public.onboarding_checklist USING btree (user_id)` |
| `idx_onboarding_checklist_incomplete` | `CREATE INDEX idx_onboarding_checklist_incomplete ON public.onboarding_checklist USING btree (user...` |
| `idx_onboarding_checklist_completion` | `CREATE INDEX idx_onboarding_checklist_completion ON public.onboarding_checklist USING btree (comp...` |

## Usage Notes

- Part of employee onboarding workflow
- Tracks tasks and checklist completion
