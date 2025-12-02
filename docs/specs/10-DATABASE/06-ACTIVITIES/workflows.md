# WORKFLOWS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workflows` |
| Schema | `public` |
| Purpose | Workflow definitions with states and transitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `name` | text | NO | NULL | Name |
| `description` | text | YES | NULL | Description |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `initial_state_id` | uuid | YES | NULL | Reference to initial state |
| `version` | integer | NO | 1 | Version |
| `is_active` | boolean | NO | true | Whether the record is active |
| `created_by` | uuid | NO | NULL | User who created the record |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| `deleted_at` | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if active) |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_workflows_active` | `CREATE INDEX idx_workflows_active ON public.workflows USING btree (is_active) WHERE (is_active = true)` |
| `idx_workflows_entity_type` | `CREATE INDEX idx_workflows_entity_type ON public.workflows USING btree (entity_type)` |
| `idx_workflows_org_id` | `CREATE INDEX idx_workflows_org_id ON public.workflows USING btree (org_id)` |
| `unique_workflow_name_per_org` | `CREATE UNIQUE INDEX unique_workflow_name_per_org ON public.workflows USING btree (org_id, name, version)` |
| `workflows_pkey` | `CREATE UNIQUE INDEX workflows_pkey ON public.workflows USING btree (id)` |

## Usage Notes

- Workflows define state machines for entities
- States and transitions are defined in separate tables
- Workflow instances track the current state of entities
- History is maintained in workflow_history

