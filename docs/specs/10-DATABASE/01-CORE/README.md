# CORE Domain Database Documentation

This directory contains detailed documentation for the CORE domain tables in InTime v3.

## Overview

The CORE domain provides foundational infrastructure for the entire InTime v3 platform, including:
- **Multi-tenancy**: Organization management and tenant isolation
- **User Management**: Universal user profiles supporting multiple personas
- **RBAC**: Role-based access control with permissions
- **Geography**: Address and region management
- **Skills**: Global skill taxonomy with org-specific aliases

## Tables

### Multi-Tenancy & Organization

1. **[organizations](./organizations.md)**
   - Root entity for multi-tenant architecture
   - Subscription and billing management
   - Organization settings and features
   - 39 columns | No FKs | 8 indexes

### User Management

2. **[user_profiles](./user_profiles.md)**
   - Universal user profile supporting 5+ personas
   - Personas: Student, Employee, Candidate, Client, Recruiter
   - Full-text search, contact preferences, hotlist management
   - 112 columns | 1 FK (org_id) | 22 indexes

### Role-Based Access Control (RBAC)

3. **[system_roles](./system_roles.md)**
   - Predefined system role templates
   - Category-based organization (admin, recruiting, bench_sales, hr, ta)
   - Default permission mappings
   - 15 columns | No FKs | 5 indexes

4. **[roles](./roles.md)**
   - Organization-defined custom roles
   - Hierarchical role structure
   - Links to permissions via role_permissions
   - 15 columns | 2 FKs | 5 indexes

5. **[permissions](./permissions.md)**
   - Granular permission definitions
   - Resource-Action-Scope pattern
   - Dangerous permission flagging
   - 9 columns | No FKs | 4 indexes

6. **[role_permissions](./role_permissions.md)**
   - Join table: roles ↔ permissions
   - Audit trail for permission grants
   - 4 columns | 3 FKs | 3 indexes

7. **[user_roles](./user_roles.md)**
   - Join table: users ↔ roles
   - Multiple roles per user
   - Temporary role assignments (expires_at)
   - Primary role designation
   - 11 columns | 3 FKs | 5 indexes

### Geography & Location

8. **[addresses](./addresses.md)**
   - Polymorphic address storage
   - Multiple address types (home, work, billing, shipping)
   - Address verification and geocoding
   - Temporal validity (effective_from/to)
   - 26 columns | 1 FK (org_id) | 4 indexes

9. **[regions](./regions.md)**
   - Geographic/organizational territories
   - Regional management and timezone handling
   - 12 columns | 3 FKs | 4 indexes

### Skills & Taxonomy

10. **[skills](./skills.md)**
    - Global skill taxonomy
    - Hierarchical skill relationships
    - Category-based organization
    - Usage tracking
    - 9 columns | 1 FK (parent_skill_id) | 5 indexes

11. **[skill_aliases](./skill_aliases.md)**
    - Organization-specific skill synonyms
    - Maps aliases to canonical skills
    - Enables flexible skill matching
    - 7 columns | 2 FKs | 2 indexes

## Entity Relationships

```
organizations (root)
    ├─→ user_profiles (multi-tenant users)
    ├─→ addresses (polymorphic addresses)
    ├─→ regions (geographic territories)
    └─→ skill_aliases (org-specific skill names)

system_roles (templates)
    └─→ roles (org custom roles)
        ├─→ role_permissions ←─ permissions
        └─→ user_roles ←─ user_profiles

skills (global taxonomy)
    ├─→ skill_aliases (org aliases)
    └─→ skills (self-referencing hierarchy)

user_profiles
    ├─→ user_roles (role assignments)
    ├─→ regions.manager_id (region managers)
    └─→ addresses (via polymorphic entity_type/entity_id)
```

## Key Design Patterns

### 1. Multi-Tenancy
- All domain tables reference `organizations.id` via `org_id`
- Ensures data isolation between organizations
- RLS policies enforce tenant boundaries

### 2. Soft Deletes
- Most tables use `deleted_at` timestamp for soft deletion
- Preserves audit trail and referential integrity
- Queries filter: `WHERE deleted_at IS NULL`

### 3. Audit Trail
- Standard columns: `created_at`, `updated_at`, `created_by`, `updated_by`
- Tracks who did what and when
- Essential for compliance and debugging

### 4. Polymorphic Relationships
- `addresses` table uses `entity_type` + `entity_id` pattern
- Single table serves multiple parent entities
- Flexible but requires careful query construction

### 5. RBAC Pattern
- Permissions: resource + action + scope
- Roles: collections of permissions
- Users: can have multiple roles
- Hierarchical roles via parent_role_id

### 6. Hierarchical Data
- `roles.parent_role_id` → roles
- `skills.parent_skill_id` → skills
- Enables tree structures via self-referencing foreign keys

### 7. Temporal Data
- `user_roles.expires_at`: Temporary role assignments
- `addresses.effective_from/to`: Time-bound addresses
- Enables historical tracking and scheduled changes

## Common Query Patterns

### Get User with Roles and Permissions
```sql
SELECT
  u.*,
  r.name as role_name,
  array_agg(p.resource || ':' || p.action || ':' || p.scope) as permissions
FROM user_profiles u
JOIN user_roles ur ON ur.user_id = u.id AND ur.deleted_at IS NULL
JOIN roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id AND p.deleted_at IS NULL
WHERE u.id = $1 AND u.deleted_at IS NULL
GROUP BY u.id, r.name;
```

### Find Users by Skill
```sql
SELECT DISTINCT u.*
FROM user_profiles u
WHERE u.candidate_skills && ARRAY['JavaScript', 'React']
  AND u.deleted_at IS NULL;
```

### Resolve Skill Alias to Canonical
```sql
SELECT s.*
FROM skills s
LEFT JOIN skill_aliases sa ON sa.skill_id = s.id AND sa.org_id = $1
WHERE s.name ILIKE $2 OR sa.alias ILIKE $2
LIMIT 1;
```

### Get Active Regions with Managers
```sql
SELECT
  r.*,
  u.full_name as manager_name
FROM regions r
LEFT JOIN user_profiles u ON u.id = r.manager_id
WHERE r.org_id = $1
  AND r.is_active = true
  AND r.deleted_at IS NULL;
```

## Index Strategy

### Performance Optimization
1. **Composite Indexes**: `(org_id, deleted_at)` for multi-tenant queries
2. **Partial Indexes**: `WHERE deleted_at IS NULL` excludes soft-deleted records
3. **GIN Indexes**: For JSONB and array columns (skills, tags)
4. **Full-Text Search**: `search_vector` for user profile search
5. **Foreign Key Indexes**: All FK columns indexed for join performance

### Index Maintenance
- VACUUM ANALYZE after bulk operations
- Monitor index bloat via pg_stat_user_indexes
- Rebuild indexes if fragmentation > 20%

## Migration Guidelines

### Adding Columns
```sql
-- Always use IF NOT EXISTS for idempotency
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS new_field text;
```

### Creating Indexes
```sql
-- Use IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_name
ON table_name(column_name)
WHERE deleted_at IS NULL;
```

### Data Backfill
```sql
-- Always confirm what will change first
SELECT id, current_value, new_value
FROM table_name
WHERE condition;

-- Then execute update
UPDATE table_name
SET column = new_value
WHERE condition;
```

## Security Considerations

1. **Row-Level Security (RLS)**
   - Enable RLS on all multi-tenant tables
   - Policy: `org_id = current_setting('app.current_org_id')::uuid`

2. **Dangerous Permissions**
   - `permissions.is_dangerous = true` requires extra UI confirmation
   - Examples: delete:all, export:all, purge:all

3. **Soft Delete Strategy**
   - Never hard delete users, roles, or permissions
   - Preserve audit trail for compliance

4. **PII Protection**
   - Encrypt sensitive fields (SSN, tax_id, salary)
   - Mask in logs and error messages

## Performance Tips

1. **Avoid N+1 Queries**: Use JOINs or batch loading
2. **Index Coverage**: Ensure queries use indexes (EXPLAIN ANALYZE)
3. **Pagination**: Always paginate large result sets
4. **Connection Pooling**: Use pgBouncer for connection management
5. **Query Caching**: Cache frequently accessed reference data (roles, permissions, skills)

## Maintenance Tasks

### Daily
- Monitor slow queries (> 100ms)
- Check connection pool utilization
- Review error logs

### Weekly
- VACUUM ANALYZE critical tables
- Review index usage (pg_stat_user_indexes)
- Check table bloat

### Monthly
- Review and archive soft-deleted records
- Update statistics (ANALYZE)
- Audit permission changes

## Related Documentation

- **Schema Files**: `/src/lib/db/schema/core.ts`
- **Migrations**: `/supabase/migrations/`
- **tRPC Routers**: `/src/server/routers/users.ts`, `/src/server/routers/rbac.ts`
- **Business Logic**: See domain-specific documentation in `/docs/specs/10-DATABASE/`
