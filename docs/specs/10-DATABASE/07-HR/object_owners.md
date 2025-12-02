# object_owners Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `object_owners` |
| Schema | `public` |
| Purpose | Entity ownership and permission tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `entity_type` | text | NO | - | Entity Type |
| `entity_id` | uuid | NO | - | Reference to entity |
| `user_id` | uuid | NO | - | User profile reference |
| `role` | text | NO | - | Role |
| `permission` | text | NO | 'view'::text | Permission |
| `is_primary` | boolean | YES | false | Primary flag |
| `assigned_at` | timestamptz | NO | now() | Assigned At |
| `assigned_by` | uuid | YES | - | Assigned By |
| `assignment_type` | text | YES | 'auto'::text | Assignment Type |
| `notes` | text | YES | - | Notes |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `object_owners_pkey` | `CREATE UNIQUE INDEX object_owners_pkey ON public.object_owners USING btree (id)` |
| `object_owners_entity_type_entity_id_user_id_key` | `CREATE UNIQUE INDEX object_owners_entity_type_entity_id_user_id_key ON public.object_owners USING...` |
| `idx_object_owners_entity` | `CREATE INDEX idx_object_owners_entity ON public.object_owners USING btree (entity_type, entity_id)` |
| `idx_object_owners_user` | `CREATE INDEX idx_object_owners_user ON public.object_owners USING btree (user_id)` |
| `idx_object_owners_org` | `CREATE INDEX idx_object_owners_org ON public.object_owners USING btree (org_id)` |
| `idx_object_owners_role` | `CREATE INDEX idx_object_owners_role ON public.object_owners USING btree (role)` |
| `idx_object_owners_permission` | `CREATE INDEX idx_object_owners_permission ON public.object_owners USING btree (permission)` |
| `idx_object_owners_primary` | `CREATE INDEX idx_object_owners_primary ON public.object_owners USING btree (entity_type, entity_i...` |

## Usage Notes

- Generic ownership tracking for any entity type
- Supports role-based permissions (view, edit, etc.)
- Can have primary owners and assignment types (auto, manual)
