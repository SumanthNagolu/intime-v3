# APPROVAL_INSTANCES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `approval_instances` |
| Schema | `public` |
| Purpose | Active approval requests |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `workflow_id` | uuid | NO | NULL | Reference to workflow |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `current_level` | integer | YES | 1 | Current level |
| `status` | text | NO | pending | Current status of the record |
| `requested_by` | uuid | NO | NULL | Requested by |
| `requested_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when requested |
| `request_notes` | text | YES | NULL | Request notes |
| `request_data` | jsonb | YES | {} | JSON data for request data |
| `resolved_by` | uuid | YES | NULL | Resolved by |
| `resolved_at` | timestamp with time zone | YES | NULL | Timestamp when resolved |
| `resolution_notes` | text | YES | NULL | Resolution notes |
| `is_escalated` | boolean | YES | false | Boolean flag: escalated |
| `escalated_at` | timestamp with time zone | YES | NULL | Timestamp when escalated |
| `escalated_to` | uuid | YES | NULL | Escalated to |
| `expires_at` | timestamp with time zone | YES | NULL | Timestamp when expires |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `escalated_to` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `requested_by` | `user_profiles.id` | Links to user_profiles |
| `resolved_by` | `user_profiles.id` | Links to user_profiles |
| `workflow_id` | `approval_workflows.id` | Links to approval_workflows |

## Indexes

| Index Name | Definition |
|------------|------------|
| `approval_instances_pkey` | `CREATE UNIQUE INDEX approval_instances_pkey ON public.approval_instances USING btree (id)` |
| `idx_approval_instances_entity` | `CREATE INDEX idx_approval_instances_entity ON public.approval_instances USING btree (entity_type, entity_id)` |
| `idx_approval_instances_org` | `CREATE INDEX idx_approval_instances_org ON public.approval_instances USING btree (org_id)` |
| `idx_approval_instances_pending` | `CREATE INDEX idx_approval_instances_pending ON public.approval_instances USING btree (org_id) WHERE (status = 'pending'::text)` |
| `idx_approval_instances_requestor` | `CREATE INDEX idx_approval_instances_requestor ON public.approval_instances USING btree (requested_by)` |
| `idx_approval_instances_status` | `CREATE INDEX idx_approval_instances_status ON public.approval_instances USING btree (status)` |
| `idx_approval_instances_workflow` | `CREATE INDEX idx_approval_instances_workflow ON public.approval_instances USING btree (workflow_id)` |

