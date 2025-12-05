# Database Migrations Log

This document tracks all database migrations applied to the InTime v3 project.

## Migration Status

**Total Migrations**: 72
**Last Updated**: 2025-12-05
**Database**: Supabase PostgreSQL

## Recent Migrations

### 2025-12-06: Permission Management System
- **File**: `20251206000000_permission_management_tables.sql`
- **Status**: Applied
- **Description**: Comprehensive permission management system
- **Tables Created**:
  - `permissions` - Permission definitions (code, name, object_type, action)
  - `role_permissions` - Role-permission mappings with scope conditions
  - `permission_overrides` - User-specific permission overrides
  - `feature_flags` - Feature flag definitions
  - `feature_flag_roles` - Feature flag role assignments
  - `api_tokens` - API token management
  - `bulk_update_history` - Bulk update history with rollback support
- **Seed Data**:
  - 54+ permissions across 11 object types
  - Role-permission mappings for all 14 system roles
  - 10 feature flags with role assignments
- **Functions**: `app_check_permission()` for permission checking
- **RLS Policies**: Applied to all new tables

### 2025-12-05: User Management Tables
- **File**: `20251205000000_user_management_tables.sql`
- **Status**: Applied
- **Description**: Enhanced user management with proper constraints

### 2025-12-04: Pod Management System
- **File**: `20251204000000_pod_management_tables.sql`
- **Status**: Applied
- **Description**: Pod structure and membership tables

## Migration Commands

```bash
# Check migration status
pnpm db:status

# Run pending migrations
pnpm db:migrate

# Push migrations to remote
pnpm db:push
```

## Migration History (Chronological)

| Timestamp | Description | Status |
|-----------|-------------|--------|
| 20251119184000 | Initial schema setup | Applied |
| 20251119190000 | Core tables | Applied |
| 20251120200000 | Organizations & users | Applied |
| 20251120210000 | System roles | Applied |
| 20251120220000 | Additional schema | Applied |
| 20251121000000 - 20251121200000 | Activity system, CRM, ATS modules | Applied |
| 20251122000000 | HR module | Applied |
| 20251123000000 | Bench sales module | Applied |
| 20251124000000 - 20251124050000 | Immigration & compliance | Applied |
| 20251126000000 | Portal tables | Applied |
| 20251127000000 - 20251127100000 | Notifications & email | Applied |
| 20251128000000 - 20251128120000 | Reporting & analytics | Applied |
| 20251129000000 - 20251129300000 | Workflow automation | Applied |
| 20251130000000 - 20251130230000 | Data management & cleanup | Applied |
| 20251201000000 - 20251201300000 | Performance optimization | Applied |
| 20251204000000 | Pod management | Applied |
| 20251205000000 | User management enhancement | Applied |
| 20251206000000 | Permission management system | Applied |

## Notes

- All migrations are idempotent (safe to re-run)
- RLS (Row Level Security) policies are applied to all org-scoped tables
- Seed data uses `ON CONFLICT DO NOTHING` for safe re-execution
- Always run `pnpm db:status` before applying new migrations
