# user_roles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_roles` |
| Schema | `public` |
| Purpose | Join table linking users to roles. Supports multiple roles per user with expiration and primary role designation. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | User identifier (composite PK) |
| role_id | uuid | NO | - | Role identifier (composite PK) |
| assigned_at | timestamp with time zone | NO | now() | Role assignment timestamp |
| assigned_by | uuid | YES | - | User who assigned role (user_profiles.id) |
| expires_at | timestamp with time zone | YES | - | Optional expiration timestamp |
| is_primary | boolean | YES | false | Marks user's primary role |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| created_by | uuid | YES | - | Created by user_profiles.id |
| updated_by | uuid | YES | - | Updated by user_profiles.id |
| updated_at | timestamp with time zone | YES | - | Last update timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| assigned_by | user_profiles.id | SET NULL |
| role_id | roles.id | CASCADE |
| user_id | user_profiles.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_roles_pkey | CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (user_id, role_id) |
| idx_user_roles_user | CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id) WHERE (deleted_at IS NULL) |
| idx_user_roles_role | CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role_id) WHERE (deleted_at IS NULL) |
| idx_user_roles_primary | CREATE INDEX idx_user_roles_primary ON public.user_roles USING btree (user_id, is_primary) WHERE (is_primary = true) |
| idx_user_roles_expires | CREATE INDEX idx_user_roles_expires ON public.user_roles USING btree (expires_at) WHERE (expires_at IS NOT NULL) |

## Business Rules

1. **Composite Primary Key**: (user_id, role_id) ensures unique user-role pairs
2. **Multiple Roles**: Users can have multiple roles simultaneously
3. **Primary Role**: Each user should have exactly one is_primary=true role
4. **Temporary Roles**: expires_at enables temporary role assignments (e.g., acting manager)
5. **Cascade Deletes**: Deleting user or role removes related assignments
6. **Soft Deletes**: Uses deleted_at for soft deletion (preserves audit trail)
7. **Audit Trail**: assigned_at, assigned_by, created_by, updated_by track role changes
8. **Expiration Index**: idx_user_roles_expires enables efficient cleanup of expired roles
9. **Active Roles Only**: Queries should filter by deleted_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())
10. **Role Conflicts**: Application logic should prevent conflicting roles (e.g., recruiter + candidate)
