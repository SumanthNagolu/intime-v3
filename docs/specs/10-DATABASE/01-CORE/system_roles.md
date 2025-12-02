# system_roles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `system_roles` |
| Schema | `public` |
| Purpose | Defines predefined system roles with standardized codes, categories, and default permissions. These are immutable templates that organizations can use. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| code | text | NO | - | Unique system role code (e.g., 'ADMIN', 'REC_MGR') |
| name | text | NO | - | System role name |
| display_name | text | NO | - | Human-readable display name |
| description | text | YES | - | Role description |
| category | text | NO | - | Role category (admin, recruiting, bench_sales, hr, ta) |
| hierarchy_level | integer | YES | 0 | Hierarchical depth level |
| is_system_role | boolean | YES | true | Always true for system roles |
| is_active | boolean | YES | true | Active status |
| color_code | text | YES | '#6366f1' | UI color code for role badges |
| icon_name | text | YES | - | Icon identifier for UI |
| pod_type | text | YES | - | Associated pod type (recruiting, bench_sales, ta) |
| default_permissions | ARRAY | YES | - | Default permission codes for this role |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

No foreign keys (system roles are independent seed data)

## Indexes

| Index Name | Definition |
|------------|------------|
| system_roles_pkey | CREATE UNIQUE INDEX system_roles_pkey ON public.system_roles USING btree (id) |
| system_roles_code_key | CREATE UNIQUE INDEX system_roles_code_key ON public.system_roles USING btree (code) |
| idx_system_roles_code | CREATE INDEX idx_system_roles_code ON public.system_roles USING btree (code) |
| idx_system_roles_category | CREATE INDEX idx_system_roles_category ON public.system_roles USING btree (category) |
| idx_system_roles_pod_type | CREATE INDEX idx_system_roles_pod_type ON public.system_roles USING btree (pod_type) |

## Business Rules

1. **Immutable Templates**: System roles should not be deleted or modified by users
2. **Unique Codes**: code must be globally unique (e.g., 'ADMIN', 'REC_MGR', 'RECRUITER')
3. **Category-Based**: Organized by category (admin, recruiting, bench_sales, hr, ta)
4. **Pod Association**: pod_type links roles to pod/team types
5. **Default Permissions**: default_permissions array suggests initial permission setup
6. **Seeded Data**: Populated during initial database setup
7. **Template Source**: Organizations copy system roles to create custom roles table entries
8. **Hierarchy Levels**: hierarchy_level defines reporting structure (0=top, higher=subordinate)
9. **Visual Identity**: color_code and icon_name provide UI consistency
10. **Categories**:
    - admin: System administrators
    - recruiting: ATS recruiters and managers
    - bench_sales: Bench sales team
    - hr: HR and people ops
    - ta: Talent acquisition
11. **Common Codes**:
    - ADMIN: System administrator
    - REC_MGR: Recruiting manager
    - RECRUITER: Recruiter
    - BS_MGR: Bench sales manager
    - BS_REP: Bench sales representative
    - HR_MGR: HR manager
    - TA_MGR: Talent acquisition manager
