# APPROVAL_WORKFLOWS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `approval_workflows` |
| Schema | `public` |
| Purpose | Multi-step approval workflow definitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `name` | text | NO | NULL | Name |
| `description` | text | YES | NULL | Description |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `approval_levels` | jsonb | NO | [] | JSON data for approval levels |
| `auto_approve_condition` | text | YES | NULL | Auto approve condition |
| `escalation_days` | integer | YES | 3 | Escalation days |
| `escalation_role` | text | YES | NULL | Escalation role |
| `is_active` | boolean | YES | true | Whether the record is active |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| `created_by` | uuid | YES | NULL | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `approval_workflows_pkey` | `CREATE UNIQUE INDEX approval_workflows_pkey ON public.approval_workflows USING btree (id)` |
| `idx_approval_workflows_active` | `CREATE INDEX idx_approval_workflows_active ON public.approval_workflows USING btree (org_id) WHERE (is_active = true)` |
| `idx_approval_workflows_entity_type` | `CREATE INDEX idx_approval_workflows_entity_type ON public.approval_workflows USING btree (entity_type)` |
| `idx_approval_workflows_org` | `CREATE INDEX idx_approval_workflows_org ON public.approval_workflows USING btree (org_id)` |

