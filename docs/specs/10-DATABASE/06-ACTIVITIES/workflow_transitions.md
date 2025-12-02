# WORKFLOW_TRANSITIONS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workflow_transitions` |
| Schema | `public` |
| Purpose | Allowed transitions between workflow states |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `workflow_id` | uuid | NO | NULL | Reference to workflow |
| `from_state_id` | uuid | NO | NULL | Reference to from state |
| `to_state_id` | uuid | NO | NULL | Reference to to state |
| `action` | text | NO | NULL | Action |
| `display_name` | text | NO | NULL | Display name |
| `required_permission` | text | YES | NULL | Required permission |
| `conditions` | jsonb | NO | {} | JSON data for conditions |
| `auto_transition` | boolean | NO | false | Auto transition |
| `metadata` | jsonb | NO | {} | JSON data for metadata |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `from_state_id` | `workflow_states.id` | Links to workflow_states |
| `to_state_id` | `workflow_states.id` | Links to workflow_states |
| `workflow_id` | `workflows.id` | Links to workflows |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_workflow_transitions_action` | `CREATE INDEX idx_workflow_transitions_action ON public.workflow_transitions USING btree (action)` |
| `idx_workflow_transitions_from_state` | `CREATE INDEX idx_workflow_transitions_from_state ON public.workflow_transitions USING btree (from_state_id)` |
| `idx_workflow_transitions_workflow_id` | `CREATE INDEX idx_workflow_transitions_workflow_id ON public.workflow_transitions USING btree (workflow_id)` |
| `unique_transition_action` | `CREATE UNIQUE INDEX unique_transition_action ON public.workflow_transitions USING btree (workflow_id, from_state_id, action)` |
| `workflow_transitions_pkey` | `CREATE UNIQUE INDEX workflow_transitions_pkey ON public.workflow_transitions USING btree (id)` |

