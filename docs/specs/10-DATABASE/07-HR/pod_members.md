# pod_members Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pod_members` |
| Schema | `public` |
| Purpose | Pod membership and role assignments |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `pod_id` | uuid | NO | - | Reference to pod |
| `user_id` | uuid | NO | - | User profile reference |
| `role` | text | NO | - | Role |
| `joined_at` | timestamptz | NO | now() | Joined At |
| `left_at` | timestamptz | YES | - | Left At |
| `is_active` | boolean | YES | true | Active/inactive flag |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `org_id` | `organizations.id` | Links to organizations |
| `pod_id` | `pods.id` | Links to pods |
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `pod_members_pkey` | `CREATE UNIQUE INDEX pod_members_pkey ON public.pod_members USING btree (id)` |
| `pod_members_pod_id_user_id_key` | `CREATE UNIQUE INDEX pod_members_pod_id_user_id_key ON public.pod_members USING btree (pod_id, use...` |
| `idx_pod_members_org_id` | `CREATE INDEX idx_pod_members_org_id ON public.pod_members USING btree (org_id)` |
| `idx_pod_members_pod_id` | `CREATE INDEX idx_pod_members_pod_id ON public.pod_members USING btree (pod_id)` |
| `idx_pod_members_user_id` | `CREATE INDEX idx_pod_members_user_id ON public.pod_members USING btree (user_id)` |
| `idx_pod_members_is_active` | `CREATE INDEX idx_pod_members_is_active ON public.pod_members USING btree (is_active)` |

## Usage Notes

