# lab_instances Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lab_instances` |
| Schema | `public` |
| Purpose | Individual student lab sessions with environment configuration |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| topic_id | uuid | NO | - | Reference to module topic |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| lab_template_id | uuid | YES | - | Foreign key reference to lab template |
| forked_repo_url | text | NO | - | URL for forked repo |
| forked_repo_name | text | YES | - | Forked Repo Name |
| original_template_url | text | NO | - | URL for original template |
| status | text | YES | 'active'::text | Current status |
| started_at | timestamp with time zone | YES | now() | Timestamp for started |
| expires_at | timestamp with time zone | YES | - | Timestamp for expires |
| completed_at | timestamp with time zone | YES | - | Timestamp for completed |
| time_spent_seconds | integer | YES | 0 | Time Spent Seconds |
| last_activity_at | timestamp with time zone | YES | now() | Timestamp for last activity |
| github_username | text | YES | - | Github Username |
| provisioning_metadata | jsonb | YES | - | Provisioning Metadata |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | lab_instances_enrollment_id_fkey |
| lab_template_id | lab_templates.id | lab_instances_lab_template_id_fkey |
| topic_id | module_topics.id | lab_instances_topic_id_fkey |
| user_id | user_profiles.id | lab_instances_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lab_instances_pkey | `CREATE UNIQUE INDEX lab_instances_pkey ON public.lab_instances USING btree (id)` |
| idx_lab_instances_user | `CREATE INDEX idx_lab_instances_user ON public.lab_instances USING btree (user_id)` |
| idx_lab_instances_topic | `CREATE INDEX idx_lab_instances_topic ON public.lab_instances USING btree (topic_id)` |
| idx_lab_instances_status | `CREATE INDEX idx_lab_instances_status ON public.lab_instances USING btree (status)` |
| idx_lab_instances_expires | `CREATE INDEX idx_lab_instances_expires ON public.lab_instances USING btree (expires_at)` |
| idx_lab_instances_enrollment | `CREATE INDEX idx_lab_instances_enrollment ON public.lab_instances USING btree (enrollment_id)` |
| idx_lab_instances_active_unique | `CREATE UNIQUE INDEX idx_lab_instances_active_unique ON public.lab_instances USING btree (user_id, topic_id) WHERE (status = 'active'::text)` |
