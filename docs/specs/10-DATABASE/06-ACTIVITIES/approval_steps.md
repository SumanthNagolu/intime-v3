# APPROVAL_STEPS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `approval_steps` |
| Schema | `public` |
| Purpose | Individual approval steps within approval workflows |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `instance_id` | uuid | NO | NULL | Reference to instance |
| `level` | integer | NO | NULL | Level |
| `approver_role` | text | YES | NULL | Approver role |
| `approver_id` | uuid | YES | NULL | Reference to approver |
| `status` | text | NO | pending | Current status of the record |
| `decided_by` | uuid | YES | NULL | Decided by |
| `decided_at` | timestamp with time zone | YES | NULL | Timestamp when decided |
| `decision` | text | YES | NULL | Decision |
| `decision_notes` | text | YES | NULL | Decision notes |
| `reminder_sent_at` | timestamp with time zone | YES | NULL | Timestamp when reminder sent |
| `reminder_count` | integer | YES | 0 | Count of reminder |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `approver_id` | `user_profiles.id` | Links to user_profiles |
| `decided_by` | `user_profiles.id` | Links to user_profiles |
| `instance_id` | `approval_instances.id` | Links to approval_instances |

## Indexes

| Index Name | Definition |
|------------|------------|
| `approval_steps_pkey` | `CREATE UNIQUE INDEX approval_steps_pkey ON public.approval_steps USING btree (id)` |
| `idx_approval_steps_approver` | `CREATE INDEX idx_approval_steps_approver ON public.approval_steps USING btree (approver_id)` |
| `idx_approval_steps_instance` | `CREATE INDEX idx_approval_steps_instance ON public.approval_steps USING btree (instance_id)` |
| `idx_approval_steps_pending` | `CREATE INDEX idx_approval_steps_pending ON public.approval_steps USING btree (approver_id) WHERE (status = 'pending'::text)` |

