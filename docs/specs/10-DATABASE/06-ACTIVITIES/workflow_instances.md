# WORKFLOW_INSTANCES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workflow_instances` |
| Schema | `public` |
| Purpose | Active workflow instances for entities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `workflow_id` | uuid | NO | NULL | Reference to workflow |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `current_state_id` | uuid | NO | NULL | Reference to current state |
| `started_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when started |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `cancelled_at` | timestamp with time zone | YES | NULL | Timestamp when cancelled |
| `status` | text | NO | active | Current status of the record |
| `metadata` | jsonb | NO | {} | JSON data for metadata |
| `version` | integer | NO | 0 | Version |
| `created_by` | uuid | NO | NULL | User who created the record |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `current_state_id` | `workflow_states.id` | Links to workflow_states |
| `org_id` | `organizations.id` | Links to organizations |
| `workflow_id` | `workflows.id` | Links to workflows |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_workflow_instances_current_state` | `CREATE INDEX idx_workflow_instances_current_state ON public.workflow_instances USING btree (current_state_id)` |
| `idx_workflow_instances_entity` | `CREATE INDEX idx_workflow_instances_entity ON public.workflow_instances USING btree (entity_type, entity_id)` |
| `idx_workflow_instances_org_id` | `CREATE INDEX idx_workflow_instances_org_id ON public.workflow_instances USING btree (org_id)` |
| `idx_workflow_instances_status` | `CREATE INDEX idx_workflow_instances_status ON public.workflow_instances USING btree (status) WHERE (status = 'active'::text)` |
| `idx_workflow_instances_workflow_id` | `CREATE INDEX idx_workflow_instances_workflow_id ON public.workflow_instances USING btree (workflow_id)` |
| `unique_entity_workflow` | `CREATE UNIQUE INDEX unique_entity_workflow ON public.workflow_instances USING btree (org_id, entity_type, entity_id, workflow_id)` |
| `workflow_instances_pkey` | `CREATE UNIQUE INDEX workflow_instances_pkey ON public.workflow_instances USING btree (id)` |

