# role_permissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `role_permissions` |
| Schema | `public` |
| Purpose | Join table linking roles to permissions. Defines which permissions each role has. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| role_id | uuid | NO | - | Role identifier (composite PK) |
| permission_id | uuid | NO | - | Permission identifier (composite PK) |
| granted_at | timestamp with time zone | NO | now() | Permission grant timestamp |
| granted_by | uuid | YES | - | User who granted permission (user_profiles.id) |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| granted_by | user_profiles.id | SET NULL |
| permission_id | permissions.id | CASCADE |
| role_id | roles.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| role_permissions_pkey | CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (role_id, permission_id) |
| idx_role_permissions_role | CREATE INDEX idx_role_permissions_role ON public.role_permissions USING btree (role_id) |
| idx_role_permissions_permission | CREATE INDEX idx_role_permissions_permission ON public.role_permissions USING btree (permission_id) |

## Business Rules

1. **Composite Primary Key**: (role_id, permission_id) ensures unique role-permission pairs
2. **Cascade Deletes**: Deleting a role or permission removes related mappings
3. **Audit Trail**: granted_at and granted_by track who assigned permissions
4. **Many-to-Many**: A role can have many permissions, a permission can belong to many roles
5. **Permission Inheritance**: If roles support hierarchy, permissions can be inherited from parent roles
6. **Fast Lookups**: Indexed by both role_id and permission_id for bidirectional queries
7. **No Soft Deletes**: Hard deletes only - permission grants are either active or removed
8. **Grant Timestamp**: granted_at helps track when permissions were added for compliance
