# Schema Gap Analysis

**Date:** 2025-12-01  
**Session:** Phase 1 - Database Schema Consolidation

This document compares the current database schema (`src/lib/db/schema/`) against the specifications in `docs/specs/10-DATABASE/`.

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| Organizations | ✅ Aligned | Has tier, industry, health_score |
| Regions | ✅ Aligned | Complete |
| Pods | ✅ Aligned | Defined in ta-hr.ts |
| Pod Members | ✅ Aligned | Junction table complete |
| System Roles | ✅ Aligned | All 14 roles defined |
| Permissions | ✅ Aligned | Entity/action/scope model |
| Activities | ⚠️ Needs Update | Missing fields from spec |
| Activity Patterns | ✅ Aligned | Template system complete |
| Events | ⚠️ Needs Update | Has legacy columns, missing types |
| Object Owners (RACI) | ❌ Missing | Not implemented |
| SLA Definitions | ❌ Missing | Not implemented |
| SLA Tracking | ❌ Missing | Not implemented |
| Audit Logs | ✅ Exists | Basic, may need enhancement |

---

## Detailed Analysis

### 1. Organizations (`organizations.ts`)

**Status: ✅ Aligned**

Current schema includes all required fields:
- ✅ `id`, `org_id` (self)
- ✅ `tier` (starter, growth, enterprise)
- ✅ `industry`
- ✅ `health_score`
- ✅ `country`
- ✅ Soft delete (`deleted_at`)
- ✅ Audit fields (`created_at`, `updated_at`)

**No changes required.**

---

### 2. Regions (`organizations.ts`)

**Status: ✅ Aligned**

Current schema includes:
- ✅ `name`, `code`, `country`, `timezone`
- ✅ `manager_id` reference
- ✅ `is_active` flag
- ✅ Audit fields

**No changes required.**

---

### 3. Pods (`ta-hr.ts`)

**Status: ✅ Aligned**

Current schema includes:
- ✅ Pod types (recruiting, bench_sales, ta)
- ✅ Senior/junior member references
- ✅ Manager reference
- ✅ Targets (placements per sprint)

**No changes required.**

---

### 4. RBAC System (`rbac.ts`)

**Status: ✅ Aligned**

Current schema includes:
- ✅ `system_roles` - All 14 roles defined
- ✅ `roles` - Custom org roles
- ✅ `permissions` - Entity/action/scope
- ✅ `role_permissions` - Junction table
- ✅ `user_roles` - User assignments

**No changes required.**

---

### 5. Activities (`activities.ts`)

**Status: ⚠️ Needs Update**

**Current Schema Has:**
- ✅ Core fields (id, org_id, entity_type, entity_id)
- ✅ Status lifecycle (scheduled, open, in_progress, completed, skipped, cancelled)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Basic outcomes (positive, neutral, negative)
- ✅ Timing fields (scheduled_at, due_date, escalation_date, completed_at)
- ✅ Assignment (assigned_to, performed_by)
- ✅ Follow-up chain (parent_activity_id)
- ✅ Activity patterns support

**Missing from Spec (docs/specs/10-DATABASE/11-activities.md):**

| Field | Type | Priority | Notes |
|-------|------|----------|-------|
| `activity_number` | TEXT | HIGH | Human-readable ID like "ACT-2025-00001" |
| `secondary_entity_type` | TEXT | MEDIUM | For cross-entity activities |
| `secondary_entity_id` | UUID | MEDIUM | For cross-entity activities |
| `outcome_notes` | TEXT | MEDIUM | Detailed outcome explanation |
| `follow_up_required` | BOOLEAN | MEDIUM | Flag for follow-up |
| `follow_up_date` | TIMESTAMPTZ | MEDIUM | When to follow up |
| `follow_up_activity_id` | UUID | MEDIUM | Link to created follow-up |
| `tags` | TEXT[] | LOW | Activity tags |
| `custom_fields` | JSONB | LOW | Extensibility |

**Type Gaps (from core types vs schema):**

Current types:
```
email, call, meeting, note, linkedin_message, task, follow_up, reminder
```

Spec requires (from `src/types/core/activity.types.ts`):
```
call, email, meeting, task, note, sms, linkedin, review, document, 
interview, submission, status_change, assignment, escalation, follow_up, custom
```

**Action Items:**
1. Add missing fields to activities table
2. Expand activity_type enum
3. Expand outcome enum (from 3 to 8 values)
4. Add activity_number generation trigger

---

### 6. Activity Patterns (`activities.ts`)

**Status: ✅ Aligned**

Current schema has complete pattern system:
- ✅ Pattern code, name, description
- ✅ Trigger event and conditions
- ✅ Activity template fields
- ✅ Assignment rules
- ✅ Due offset calculations
- ✅ SLA thresholds
- ✅ Active/system flags

**No changes required.**

---

### 7. Events (`events.ts`)

**Status: ⚠️ Needs Update**

**Current Schema Has:**
- ✅ Core fields (id, org_id, event_type, event_category)
- ✅ Severity levels
- ✅ Entity type/id (polymorphic)
- ✅ Actor information
- ✅ Correlation/causation IDs
- ✅ Related entities (JSONB)
- ✅ Retry mechanism
- ✅ Delivery log

**Issues:**

1. **Legacy Columns:**
   - `aggregate_id` - Legacy, use `entity_id`
   - `user_id` - Legacy, use `actor_id`
   - `payload` - Legacy, use `event_data`

2. **Missing Event Types:**
   Current schema has string-based `event_type`, but doesn't enforce the 68+ event types from `03-EVENT-TYPE-CATALOG.md`.

3. **Missing Fields:**
   | Field | Type | Priority | Notes |
   |-------|------|----------|-------|
   | `event_id` | TEXT | HIGH | Human-readable like "EVT-2025-00001" |
   | `entity_name` | TEXT | MEDIUM | For quick display |
   | `source` | TEXT | MEDIUM | ui, api, integration, scheduler |
   | `triggered_activity_ids` | UUID[] | MEDIUM | Activities created by this event |

**Action Items:**
1. Add missing fields
2. Create event_type check constraint or enum
3. Mark legacy columns as deprecated (don't remove yet)
4. Add human-readable event_id generation

---

### 8. Object Owners / RACI (`NOT IMPLEMENTED`)

**Status: ❌ Missing**

**Spec Reference:** `docs/specs/10-DATABASE/12-object-owners.md`

This is a CRITICAL missing table. The spec defines:

```sql
CREATE TABLE object_owners (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Polymorphic Association
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Owner
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- RACI Role
  role TEXT NOT NULL, -- 'responsible', 'accountable', 'consulted', 'informed'
  
  -- Permission
  permission TEXT NOT NULL DEFAULT 'view', -- 'edit', 'view'
  
  -- Primary flag
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Assignment metadata
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  assignment_type TEXT DEFAULT 'auto',
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, user_id)
);
```

**Action Items:**
1. Create `object_owners` table in new schema file `src/lib/db/schema/raci.ts`
2. Add RLS policies
3. Add triggers for:
   - Auto-assign creator as accountable
   - Enforce single accountable per entity
   - Enforce primary owner alignment
4. Create indexes for performance

---

### 9. SLA System (`NOT IMPLEMENTED`)

**Status: ❌ Missing**

**Spec Reference:** `src/types/core/sla.types.ts`

Two tables needed:

**sla_definitions:**
```sql
CREATE TABLE sla_definitions (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  
  entity_type TEXT NOT NULL,
  metric TEXT NOT NULL, -- 'first_contact', 'first_submission', etc.
  
  warning_threshold INTEGER NOT NULL, -- hours
  breach_threshold INTEGER NOT NULL, -- hours
  
  notify_on_warning BOOLEAN DEFAULT TRUE,
  notify_on_breach BOOLEAN DEFAULT TRUE,
  warning_recipients TEXT[], -- 'owner', 'manager', 'coo'
  breach_recipients TEXT[],
  
  is_active BOOLEAN DEFAULT TRUE,
  business_hours_only BOOLEAN DEFAULT TRUE,
  exclude_weekends BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**sla_tracking:**
```sql
CREATE TABLE sla_tracking (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  
  definition_id UUID NOT NULL REFERENCES sla_definitions(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metric TEXT NOT NULL,
  
  started_at TIMESTAMPTZ NOT NULL,
  warning_at TIMESTAMPTZ NOT NULL,
  breach_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  
  status TEXT NOT NULL DEFAULT 'on_track', -- 'on_track', 'warning', 'breach', 'completed'
  was_breached BOOLEAN,
  actual_duration_hours NUMERIC,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Action Items:**
1. Create SLA tables in `src/lib/db/schema/sla.ts`
2. Add RLS policies
3. Add trigger to auto-create tracking records

---

### 10. Audit Logs (`audit.ts`)

**Status: ✅ Exists - Minor Enhancements**

Current schema has basic audit logging. May need:
- Verify alignment with event system
- Add more structured change tracking

**Low priority - review after core tables complete.**

---

## Migration Priority

### Phase 1: Critical (Required for Activities/Events)

1. **Object Owners (RACI)** - New table
   - Blocks: RACI-based access control
   - Effort: Medium

2. **Activities Updates** - Add missing fields
   - Blocks: Activity engine implementation
   - Effort: Small

3. **Events Updates** - Add missing fields
   - Blocks: Event system implementation
   - Effort: Small

### Phase 2: Important (Required for SLA)

4. **SLA Definitions** - New table
   - Blocks: SLA tracking feature
   - Effort: Small

5. **SLA Tracking** - New table
   - Blocks: SLA tracking feature
   - Effort: Small

### Phase 3: Enhancement

6. **Event Types Enum** - Add constraint
   - Enhancement: Better validation
   - Effort: Small

7. **Audit Enhancements** - Review
   - Enhancement: Better tracking
   - Effort: Small

---

## Schema Files to Create/Update

| File | Action | Priority |
|------|--------|----------|
| `src/lib/db/schema/raci.ts` | CREATE | HIGH |
| `src/lib/db/schema/sla.ts` | CREATE | HIGH |
| `src/lib/db/schema/activities.ts` | UPDATE | HIGH |
| `src/lib/db/schema/events.ts` | UPDATE | MEDIUM |
| `src/lib/db/schema/index.ts` | UPDATE | HIGH |

---

## Next Steps

1. Create `raci.ts` with object_owners table
2. Create `sla.ts` with SLA tables
3. Update `activities.ts` with missing fields
4. Update `events.ts` with missing fields
5. Generate Drizzle migrations
6. Apply migrations to database
7. Add RLS policies

---

*Generated: 2025-12-01*

