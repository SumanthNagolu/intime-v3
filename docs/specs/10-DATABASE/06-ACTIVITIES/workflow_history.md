# WORKFLOW_HISTORY Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workflow_history` |
| Schema | `public` |
| Purpose | Audit trail of workflow state changes |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `workflow_instance_id` | uuid | NO | NULL | Reference to workflow instance |
| `from_state_id` | uuid | YES | NULL | Reference to from state |
| `to_state_id` | uuid | NO | NULL | Reference to to state |
| `action` | text | NO | NULL | Action |
| `performed_by` | uuid | NO | NULL | User who performed the action |
| `notes` | text | YES | NULL | Notes |
| `metadata` | jsonb | NO | {} | JSON data for metadata |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `from_state_id` | `workflow_states.id` | Links to workflow_states |
| `performed_by` | `user_profiles.id` | Links to user_profiles |
| `to_state_id` | `workflow_states.id` | Links to workflow_states |
| `workflow_instance_id` | `workflow_instances.id` | Links to workflow_instances |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_workflow_history_created_at` | `CREATE INDEX idx_workflow_history_created_at ON public.workflow_history USING btree (created_at DESC)` |
| `idx_workflow_history_instance_id` | `CREATE INDEX idx_workflow_history_instance_id ON public.workflow_history USING btree (workflow_instance_id)` |
| `idx_workflow_history_performed_by` | `CREATE INDEX idx_workflow_history_performed_by ON public.workflow_history USING btree (performed_by)` |
| `workflow_history_pkey` | `CREATE UNIQUE INDEX workflow_history_pkey ON public.workflow_history USING btree (id)` |

