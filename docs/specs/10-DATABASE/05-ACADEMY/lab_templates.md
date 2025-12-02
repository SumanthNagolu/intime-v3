# lab_templates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lab_templates` |
| Schema | `public` |
| Purpose | Reusable lab exercise templates with instructions and requirements |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| name | text | NO | - | Display name |
| description | text | YES | - | Detailed description |
| github_template_url | text | NO | - | URL for github template |
| difficulty_level | text | YES | - | Difficulty Level |
| time_limit_minutes | integer | YES | 120 | Time Limit Minutes |
| auto_grading_enabled | boolean | YES | false | Auto Grading Enabled |
| github_actions_workflow | text | YES | - | Github Actions Workflow |
| required_skills | ARRAY | YES | - | Required Skills |
| estimated_duration_minutes | integer | YES | - | Estimated Duration Minutes |
| created_by | uuid | YES | - | User who created this record |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| is_active | boolean | YES | true | Whether record is active |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| created_by | user_profiles.id | lab_templates_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lab_templates_pkey | `CREATE UNIQUE INDEX lab_templates_pkey ON public.lab_templates USING btree (id)` |
| lab_templates_github_template_url_key | `CREATE UNIQUE INDEX lab_templates_github_template_url_key ON public.lab_templates USING btree (github_template_url)` |
| idx_lab_templates_active | `CREATE INDEX idx_lab_templates_active ON public.lab_templates USING btree (is_active)` |
| idx_lab_templates_difficulty | `CREATE INDEX idx_lab_templates_difficulty ON public.lab_templates USING btree (difficulty_level)` |
