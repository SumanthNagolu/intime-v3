# Sync Entity - Backend/Frontend Alignment

Ensure an entity is fully aligned across database schema, entity config, tRPC router, Zod validation, and frontend screens.

## Usage
```
/sync-entity [entity-name]
```

## Examples
```
/sync-entity lead
/sync-entity account
/sync-entity job
/sync-entity talent
```

---

## Sync Process

### Step 1: Audit Current State

Check what exists for this entity:

| Layer | Location | Check |
|-------|----------|-------|
| DB Schema | `src/lib/db/schema/*.ts` | Table definition |
| Entity Config | `src/lib/entities/[domain]/[entity].entity.ts` | Entity config file |
| Zod Validation | `src/lib/validations/[entity].ts` | Zod schemas |
| tRPC Router | `src/server/routers/[domain].ts` | CRUD procedures |
| Frontend Screens | `src/screens/[domain]/[entity]-*.screen.ts` | Screen definitions |

### Step 2: Compare & Identify Gaps

Create a field-by-field comparison:

```
| Field | DB Column | Entity Config | Zod Schema | tRPC | Screen |
|-------|-----------|---------------|------------|------|--------|
| companyName | ✅ text | ✅ text | ✅ z.string() | ✅ | ✅ |
| status | ✅ text | ✅ enum | ⚠️ missing enum | ✅ | ✅ |
```

### Step 2.5: Check Workplan Configuration

**For ROOT ENTITIES only:** `lead`, `job`, `submission`, `deal`, `placement`

| Check | Location | Verification |
|-------|----------|--------------|
| Workplan template exists | `workplan_templates` table | Template code for entity |
| Activity patterns defined | `activity_patterns` table | Patterns for entity type |
| Pattern successors | `activity_pattern_successors` | Activity chains configured |
| Create mutation triggers workplan | tRPC router | `createWorkplanInstance` called |
| Update mutation logs activities | tRPC router | `logActivity` called |

**Verification SQL:**
```sql
-- Check workplan template exists
SELECT code, name, entity_type, trigger_event
FROM workplan_templates
WHERE entity_type = '[entity]';

-- Check activity patterns exist
SELECT code, name, entity_type, target_days, priority
FROM activity_patterns
WHERE entity_type = '[entity]'
ORDER BY code;

-- Check template has activities linked
SELECT wt.code as template, ap.code as pattern, wta.order_index, wta.is_required
FROM workplan_templates wt
JOIN workplan_template_activities wta ON wt.id = wta.template_id
JOIN activity_patterns ap ON wta.pattern_id = ap.id
WHERE wt.entity_type = '[entity]'
ORDER BY wta.order_index;
```

**If missing, create workplan template:**
```sql
-- 1. Create activity patterns (if needed)
INSERT INTO activity_patterns (org_id, code, name, entity_type, target_days, priority)
VALUES
  (NULL, '[entity]_initial', 'Initial [Entity] Activity', '[entity]', 1, 'normal'),
  (NULL, '[entity]_review', 'Review [Entity]', '[entity]', 3, 'normal'),
  (NULL, '[entity]_complete', 'Complete [Entity] Process', '[entity]', 5, 'normal');

-- 2. Create workplan template
INSERT INTO workplan_templates (org_id, code, name, entity_type, trigger_event)
VALUES (NULL, '[entity]_workflow', '[Entity] Workflow', '[entity]', 'create');

-- 3. Link patterns to template
INSERT INTO workplan_template_activities (template_id, pattern_id, order_index, is_required)
SELECT
  wt.id,
  ap.id,
  CASE ap.code
    WHEN '[entity]_initial' THEN 0
    WHEN '[entity]_review' THEN 1
    WHEN '[entity]_complete' THEN 2
  END,
  true
FROM workplan_templates wt
CROSS JOIN activity_patterns ap
WHERE wt.code = '[entity]_workflow'
  AND ap.entity_type = '[entity]';
```

### Step 3: Fix Misalignments

For each gap found:

#### Missing Entity Config
Create `src/lib/entities/[domain]/[entity].entity.ts`:
- Copy structure from `lead.entity.ts`
- Map all DB columns to field definitions
- Define relations, indexes, procedures

#### Missing/Outdated Zod Schemas
Update `src/lib/validations/[entity].ts`:
- Use entity config as source of truth
- Generate schemas using `entityToZodSchema()` helper
- Or manually define matching schemas

#### Missing tRPC Procedures
Add to `src/server/routers/[domain].ts`:
- `get[Entity]ById` - single entity query
- `list[Entities]` - paginated list with filters
- `create[Entity]` - create mutation
- `update[Entity]` - update mutation
- `delete[Entity]` - soft delete mutation

#### Missing Frontend Screens
Run `/convert-to-metadata` for:
- List screen
- Detail screen
- Create wizard (if needed)

### Step 4: Update Trackers

Update both tracker files:
- `docs/BACKEND-SYNC-TRACKER.md`
- `docs/METADATA-UI-MIGRATION.md`

---

## Entity Config Template

```typescript
// src/lib/entities/[domain]/[entity].entity.ts

import type { EntityConfig } from '../types';

export const [entity]Entity: EntityConfig = {
  name: '[entity]',
  displayName: '[Entity]',
  pluralName: '[Entities]',

  tableName: '[table_name]',
  router: '[domain]',

  procedures: {
    getById: 'get[Entity]ById',
    list: 'list[Entities]',
    create: 'create[Entity]',
    update: 'update[Entity]',
    delete: 'delete[Entity]',
  },

  fields: {
    id: { type: 'uuid', primaryKey: true },
    orgId: { type: 'uuid', required: true, internal: true },
    // ... map all columns
    createdAt: { type: 'timestamp', auto: true },
    updatedAt: { type: 'timestamp', auto: true },
    deletedAt: { type: 'timestamp', softDelete: true },
  },

  relations: {
    // Define relations
  },

  indexes: [
    { fields: ['orgId'] },
    // Add common query indexes
  ],

  searchFields: ['name', 'email'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
};
```

---

## Validation Schema Template

```typescript
// src/lib/validations/[entity].ts

import { z } from 'zod';

// Full entity schema
export const [entity]Schema = z.object({
  id: z.string().uuid(),
  // ... all fields matching entity config
});

// Create input (omit auto fields)
export const create[Entity]Input = [entity]Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  deletedAt: true,
});

// Update input
export const update[Entity]Input = z.object({
  id: z.string().uuid(),
  data: create[Entity]Input.partial(),
});

// List input with filters
export const list[Entities]Input = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filters: z.object({
    // Entity-specific filters
  }).optional(),
});

// List output
export const list[Entities]Output = z.object({
  items: z.array([entity]Schema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});
```

---

## tRPC Router Template

```typescript
// Add to src/server/routers/[domain].ts

// GET BY ID
get[Entity]ById: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const result = await db.query.[table].findFirst({
      where: and(
        eq([table].id, input.id),
        eq([table].orgId, ctx.user.orgId),
        isNull([table].deletedAt),
      ),
      with: { /* relations */ },
    });
    if (!result) throw new TRPCError({ code: 'NOT_FOUND' });
    return result;
  }),

// LIST
list[Entities]: protectedProcedure
  .input(list[Entities]Input)
  .query(async ({ ctx, input }) => {
    // Build conditions, execute paginated query
    // Return { items, total, page, pageSize, totalPages }
  }),

// CREATE
create[Entity]: protectedProcedure
  .input(create[Entity]Input)
  .mutation(async ({ ctx, input }) => {
    const [result] = await db.insert([table]).values({
      ...input,
      orgId: ctx.user.orgId,
      createdBy: ctx.user.id,
    }).returning();
    return result;
  }),

// UPDATE
update[Entity]: protectedProcedure
  .input(update[Entity]Input)
  .mutation(async ({ ctx, input }) => {
    const [result] = await db.update([table])
      .set({ ...input.data, updatedAt: new Date() })
      .where(and(
        eq([table].id, input.id),
        eq([table].orgId, ctx.user.orgId),
      ))
      .returning();
    if (!result) throw new TRPCError({ code: 'NOT_FOUND' });
    return result;
  }),

// DELETE (soft)
delete[Entity]: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await db.update([table])
      .set({ deletedAt: new Date() })
      .where(and(
        eq([table].id, input.id),
        eq([table].orgId, ctx.user.orgId),
      ));
    return { success: true };
  }),
```

---

## Sync Checklist

### Core Layers
- [ ] DB schema exists and is up to date
- [ ] Entity config created with all fields
- [ ] Field types match across all layers
- [ ] Enum options match across all layers
- [ ] Relations defined in entity config
- [ ] Zod schemas generated/aligned
- [ ] All 5 standard tRPC procedures exist
- [ ] Frontend list screen created
- [ ] Frontend detail screen created

### Workplan Integration (Root Entities Only)
- [ ] Workplan template exists in database
- [ ] Activity patterns defined for entity type
- [ ] Pattern successors configured (activity chains)
- [ ] Create mutation calls `createWorkplanInstance`
- [ ] Update mutation calls `logActivity`
- [ ] Status change triggers `handleStatusChange`
- [ ] Activity tab included in detail screen
- [ ] WorkplanProgress component in sidebar

### Testing
- [ ] E2E test file created: `tests/e2e/[domain]/[entity]-complete-flow.spec.ts`
- [ ] All CRUD tests passing
- [ ] All list operation tests passing
- [ ] All workplan/activity tests passing (root entities)
- [ ] Screenshots captured

### Documentation
- [ ] `docs/CONVERSION-PLAYBOOK.md` progress updated
- [ ] `docs/BACKEND-SYNC-TRACKER.md` updated
