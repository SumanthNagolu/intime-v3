# roles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `roles` |
| Schema | `public` |
| Purpose | Stores custom organization-defined roles for Role-Based Access Control (RBAC). Supports hierarchical role structures. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| name | text | NO | - | Unique role identifier (e.g., 'senior_recruiter') |
| display_name | text | NO | - | Human-readable role name |
| description | text | YES | - | Role description |
| parent_role_id | uuid | YES | - | Parent role for inheritance (self-referencing) |
| hierarchy_level | integer | YES | 0 | Hierarchical depth level |
| is_system_role | boolean | YES | false | Whether this is a system-defined role |
| is_active | boolean | YES | true | Active status |
| color_code | text | YES | '#6366f1' | UI color code for role badges |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | Created by user_profiles.id |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| updated_by | uuid | YES | - | Updated by user_profiles.id |
| display_order | integer | YES | 0 | Sort order for UI display |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| created_by | user_profiles.id | SET NULL |
| parent_role_id | roles.id | CASCADE (self-referencing) |

## Indexes

| Index Name | Definition |
|------------|------------|
| roles_pkey | CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id) |
| roles_name_key | CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name) |
| idx_roles_name | CREATE INDEX idx_roles_name ON public.roles USING btree (name) WHERE (deleted_at IS NULL) |
| idx_roles_parent | CREATE INDEX idx_roles_parent ON public.roles USING btree (parent_role_id) WHERE (deleted_at IS NULL) |
| idx_roles_system | CREATE INDEX idx_roles_system ON public.roles USING btree (is_system_role) WHERE (is_system_role = true) |

## Business Rules

1. **Custom Roles**: Organizations can define custom roles beyond system_roles
2. **Hierarchical Structure**: Supports role inheritance via parent_role_id
3. **Unique Names**: Role names must be globally unique (name is unique constraint)
4. **System Roles**: is_system_role=true prevents deletion/modification of core roles
5. **Soft Deletes**: Uses deleted_at for soft deletion
6. **Permission Mapping**: Links to permissions via role_permissions join table
7. **User Assignment**: Users get roles via user_roles join table
8. **Display Order**: display_order controls UI sorting
9. **Color Coding**: color_code enables visual differentiation in UI
10. **Audit Trail**: Tracks created_by and updated_by for role changes
