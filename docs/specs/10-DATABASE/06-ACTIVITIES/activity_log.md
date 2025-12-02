# ACTIVITY_LOG Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_log` |
| Schema | `public` |
| Purpose | Log of activity execution and system events |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `activity_type` | text | NO | NULL | Activity type |
| `subject` | text | YES | NULL | Subject |
| `body` | text | YES | NULL | Body |
| `direction` | text | YES | NULL | Direction |
| `performed_by` | uuid | YES | NULL | User who performed the action |
| `poc_id` | uuid | YES | NULL | Reference to poc |
| `activity_date` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Activity date |
| `duration_minutes` | integer | YES | NULL | Duration minutes |
| `outcome` | text | YES | NULL | Outcome |
| `next_action` | text | YES | NULL | Next action |
| `next_action_date` | timestamp with time zone | YES | NULL | Next action date |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `org_id` | `organizations.id` | Links to organizations |
| `performed_by` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_log_pkey` | `CREATE UNIQUE INDEX activity_log_pkey ON public.activity_log USING btree (id)` |
| `idx_activity_date` | `CREATE INDEX idx_activity_date ON public.activity_log USING btree (activity_date DESC)` |
| `idx_activity_entity` | `CREATE INDEX idx_activity_entity ON public.activity_log USING btree (entity_type, entity_id)` |
| `idx_activity_log_activity_date` | `CREATE INDEX idx_activity_log_activity_date ON public.activity_log USING btree (activity_date)` |
| `idx_activity_log_entity` | `CREATE INDEX idx_activity_log_entity ON public.activity_log USING btree (entity_type, entity_id)` |
| `idx_activity_log_org_id` | `CREATE INDEX idx_activity_log_org_id ON public.activity_log USING btree (org_id)` |
| `idx_activity_log_performed_by` | `CREATE INDEX idx_activity_log_performed_by ON public.activity_log USING btree (performed_by)` |
| `idx_activity_org` | `CREATE INDEX idx_activity_org ON public.activity_log USING btree (org_id)` |
| `idx_activity_owner` | `CREATE INDEX idx_activity_owner ON public.activity_log USING btree (performed_by)` |
| `idx_activity_poc` | `CREATE INDEX idx_activity_poc ON public.activity_log USING btree (poc_id)` |

