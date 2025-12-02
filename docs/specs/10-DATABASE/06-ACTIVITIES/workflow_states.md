# WORKFLOW_STATES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workflow_states` |
| Schema | `public` |
| Purpose | Available states in workflow definitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `workflow_id` | uuid | NO | NULL | Reference to workflow |
| `name` | text | NO | NULL | Name |
| `display_name` | text | NO | NULL | Display name |
| `description` | text | YES | NULL | Description |
| `state_order` | integer | NO | NULL | State order |
| `is_initial` | boolean | NO | false | Boolean flag: initial |
| `is_terminal` | boolean | NO | false | Boolean flag: terminal |
| `actions` | jsonb | NO | [] | JSON data for actions |
| `metadata` | jsonb | NO | {} | JSON data for metadata |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `workflow_id` | `workflows.id` | Links to workflows |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_workflow_states_terminal` | `CREATE INDEX idx_workflow_states_terminal ON public.workflow_states USING btree (is_terminal) WHERE (is_terminal = true)` |
| `idx_workflow_states_workflow_id` | `CREATE INDEX idx_workflow_states_workflow_id ON public.workflow_states USING btree (workflow_id)` |
| `unique_state_name_per_workflow` | `CREATE UNIQUE INDEX unique_state_name_per_workflow ON public.workflow_states USING btree (workflow_id, name)` |
| `unique_state_order_per_workflow` | `CREATE UNIQUE INDEX unique_state_order_per_workflow ON public.workflow_states USING btree (workflow_id, state_order)` |
| `workflow_states_pkey` | `CREATE UNIQUE INDEX workflow_states_pkey ON public.workflow_states USING btree (id)` |

