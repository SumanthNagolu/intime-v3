# twin_preferences Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `twin_preferences` |
| Schema | `public` |
| Purpose | Stores user preferences for their AI Twin behavior, notifications, and proactive suggestions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for preferences |
| user_id | uuid | NO | - | User these preferences belong to |
| enable_morning_briefing | boolean | YES | true | Whether to send daily morning briefings |
| morning_briefing_time | time without time zone | YES | '09:00:00'::time without time zone | Time for morning briefing |
| enable_proactive_suggestions | boolean | YES | true | Whether twin can make proactive suggestions |
| suggestion_frequency | integer | YES | 3 | Maximum suggestions per day |
| notify_via_ui | boolean | YES | true | Show notifications in the UI |
| notify_via_slack | boolean | YES | false | Send notifications to Slack |
| notify_via_email | boolean | YES | false | Send notifications via email |
| use_productivity_data | boolean | YES | true | Allow twin to analyze productivity patterns |
| use_activity_data | boolean | YES | true | Allow twin to analyze activity history |
| created_at | timestamp with time zone | YES | now() | When preferences were created |
| updated_at | timestamp with time zone | YES | now() | Last update timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| twin_preferences_pkey | CREATE UNIQUE INDEX twin_preferences_pkey ON public.twin_preferences USING btree (id) |
| twin_preferences_user_id_key | CREATE UNIQUE INDEX twin_preferences_user_id_key ON public.twin_preferences USING btree (user_id) |
| idx_twin_preferences_user | CREATE INDEX idx_twin_preferences_user ON public.twin_preferences USING btree (user_id) |

## Usage Notes

- One record per user (enforced by unique constraint)
- Enables users to control twin behavior and communication channels
- Morning briefing feature supports daily summaries
- Granular notification preferences for different channels
- Privacy controls for data usage in twin suggestions
