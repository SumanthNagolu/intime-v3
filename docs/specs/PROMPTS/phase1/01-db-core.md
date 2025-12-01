# PROMPT: DB-CORE (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill.

Read the USER-ROLES documentation and design the CORE database tables.

## Read First:
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/00-PERMISSIONS-MATRIX.md
- docs/specs/10-DATABASE/00-ERD.md (Entity relationships)
- docs/specs/10-DATABASE/11-activities.md (Unified activities table)
- docs/specs/10-DATABASE/12-object-owners.md (RCAI ownership)
- docs/specs/10-DATABASE/14-pods.md (Pod structure)
- docs/specs/10-DATABASE/13-user-profiles.md (User profiles)
- src/lib/db/schema/organizations.ts
- src/lib/db/schema/rbac.ts

## Create/Update These Schema Files:

### 1. src/lib/db/schema/organizations.ts

Tables:
- `organizations` - Add: tier (enum: starter/growth/enterprise), industry, country, health_score, settings (jsonb)
- `pods` - type (recruiting/bench_sales/ta), name, senior_member_id, junior_member_id, status
- `regions` - name, country, timezone, manager_id
- `pod_members` - pod_id, user_id, role, joined_at

### 2. src/lib/db/schema/rbac.ts

Tables:
- `system_roles` - All 12 roles from docs: technical_recruiter, bench_sales_recruiter, ta_specialist, recruiting_manager, bench_manager, ta_manager, hr_manager, regional_director, cfo, coo, ceo, admin, client_user, candidate_user
- `permissions` - entity, action (create/read/update/delete), scope (own/team/org)
- `role_permissions` - role_id, permission_id
- `object_owners` - Polymorphic RACI: entity_type, entity_id, user_id, raci_role (R/A/C/I), assigned_at, assigned_by

### 3. src/lib/db/schema/audit.ts

Tables:
- `audit_logs` - entity_type, entity_id, action, old_values (jsonb), new_values (jsonb), actor_id, actor_ip, user_agent, created_at

### 4. src/lib/db/schema/events.ts

Tables:
- `events` - event_type (varchar 100), event_category, severity, entity_type, entity_id, actor_type, actor_id, event_data (jsonb), related_entities (jsonb), correlation_id, occurred_at
- `event_subscriptions` - user_id, event_pattern, channel (email/push/sms), is_active

## Requirements:
- Every table: id (uuid), org_id, created_at, updated_at, deleted_at (soft delete)
- Proper indexes for common queries
- Export TypeScript types
- Follow existing Drizzle patterns

## After Schema:
Generate migration SQL using: npx drizzle-kit generate

Use multi-agents as needed to complete faster.
