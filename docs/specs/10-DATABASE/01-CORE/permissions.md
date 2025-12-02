# permissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `permissions` |
| Schema | `public` |
| Purpose | Defines granular permissions for RBAC system using resource-action-scope pattern (e.g., candidates:create:all) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| resource | text | NO | - | Resource type (e.g., 'candidates', 'jobs', 'users') |
| action | text | NO | - | Action type (e.g., 'create', 'read', 'update', 'delete') |
| scope | text | YES | 'own' | Permission scope ('own', 'team', 'all', 'org') |
| display_name | text | NO | - | Human-readable permission name |
| description | text | YES | - | Permission description |
| is_dangerous | boolean | YES | false | Marks dangerous permissions (delete, export, etc.) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

No foreign keys (permissions are independent entities)

## Indexes

| Index Name | Definition |
|------------|------------|
| permissions_pkey | CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id) |
| unique_permission | CREATE UNIQUE INDEX unique_permission ON public.permissions USING btree (resource, action, scope) |
| idx_permissions_resource | CREATE INDEX idx_permissions_resource ON public.permissions USING btree (resource) WHERE (deleted_at IS NULL) |
| idx_permissions_action | CREATE INDEX idx_permissions_action ON public.permissions USING btree (action) WHERE (deleted_at IS NULL) |

## Business Rules

1. **Triple Uniqueness**: (resource, action, scope) combination must be unique
2. **Resource-Action Pattern**: Follows standard RBAC pattern
3. **Scope Levels**:
   - `own`: User can only act on their own records
   - `team`: User can act on team/pod records
   - `all`: User can act on all records in organization
   - `org`: Organization-wide administrative actions
4. **Dangerous Permissions**: is_dangerous=true requires extra confirmation in UI
5. **Soft Deletes**: Uses deleted_at for soft deletion
6. **Role Binding**: Permissions assigned to roles via role_permissions table
7. **Display Names**: display_name shown in UI permission management
8. **Indexing**: Indexed by resource and action for fast permission checks
9. **Common Resources**: candidates, jobs, users, interviews, submissions, placements, accounts, deals, leads
10. **Common Actions**: create, read, update, delete, export, approve, reject, assign
