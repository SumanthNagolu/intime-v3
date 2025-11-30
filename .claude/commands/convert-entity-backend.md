# Convert Entity - Step 2: Backend Implementation

Generate Zod schemas and tRPC procedures from the entity configuration.

## Prerequisites
- Entity config must exist: `src/lib/entities/[domain]/[entity].entity.ts`
- Run `/convert-entity-config [entity]` first if not done

## Usage
```
/convert-entity-backend [entity-name]
```

## Examples
```
/convert-entity-backend lead
/convert-entity-backend job
/convert-entity-backend submission
```

---

## What This Command Does

1. Reads entity configuration file
2. Generates Zod validation schemas
3. Creates/updates tRPC router procedures
4. Sets up workplan integration (root entities)
5. Verifies backend works

**Outputs:**
- `src/lib/validations/[entity].ts`
- Updates to `src/server/routers/[domain].ts`

---

## Step 1: Read Entity Configuration

First, read the entity config to understand all fields:

```typescript
// src/lib/entities/[domain]/[entity].entity.ts
```

Extract:
- All field definitions
- Field types and validation rules
- Relations
- Workplan configuration

---

## Step 2: Generate Zod Schemas

Create file: `src/lib/validations/[entity].ts`

```typescript
import { z } from 'zod';

// ==========================================
// FIELD SCHEMAS (from entity config)
// ==========================================

// Enum schemas
const [entity]StatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
]);

// ==========================================
// FULL ENTITY SCHEMA
// ==========================================
export const [entity]Schema = z.object({
  // Primary key
  id: z.string().uuid(),
  orgId: z.string().uuid(),

  // Core fields (from entity config)
  companyName: z.string().min(1).max(255),
  status: [entity]StatusSchema,

  // Optional fields
  firstName: z.string().max(100).nullable(),
  lastName: z.string().max(100).nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),

  // Reference fields
  ownerId: z.string().uuid().nullable(),
  accountId: z.string().uuid().nullable(),

  // Numeric fields
  estimatedValue: z.number().min(0).nullable(),

  // Date fields
  expectedCloseDate: z.date().nullable(),

  // JSON fields
  metadata: z.record(z.unknown()).nullable(),

  // Audit fields
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  deletedAt: z.date().nullable(),
});

// ==========================================
// CREATE INPUT
// Omit auto-generated fields
// ==========================================
export const create[Entity]Input = z.object({
  // Required fields
  companyName: z.string().min(1).max(255),

  // Optional fields with defaults handled by DB
  status: [entity]StatusSchema.optional().default('new'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ==========================================
// UPDATE INPUT
// ==========================================
export const update[Entity]Input = z.object({
  id: z.string().uuid(),
  data: create[Entity]Input.partial(),
});

// ==========================================
// LIST INPUT (Pagination + Filters)
// ==========================================
export const list[Entities]Input = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),

  // Sorting
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),

  // Search
  search: z.string().optional(),

  // Filters (from entity config ui.list.filters)
  filters: z.object({
    status: z.array([entity]StatusSchema).optional(),
    ownerId: z.string().uuid().optional(),
    tier: z.array(z.string()).optional(),
    source: z.array(z.string()).optional(),
    dateRange: z.object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    }).optional(),
  }).optional(),
});

// ==========================================
// LIST OUTPUT
// ==========================================
export const list[Entities]Output = z.object({
  items: z.array([entity]Schema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  // Optional metrics
  metrics: z.object({
    byStatus: z.record(z.number()).optional(),
    totalValue: z.number().optional(),
  }).optional(),
});

// ==========================================
// TYPES
// ==========================================
export type [Entity] = z.infer<typeof [entity]Schema>;
export type Create[Entity]Input = z.infer<typeof create[Entity]Input>;
export type Update[Entity]Input = z.infer<typeof update[Entity]Input>;
export type List[Entities]Input = z.infer<typeof list[Entities]Input>;
export type List[Entities]Output = z.infer<typeof list[Entities]Output>;
```

### Schema Generation Rules

| Entity Config Type | Zod Schema |
|-------------------|------------|
| `text` | `z.string().max(n)` |
| `textarea` | `z.string()` |
| `email` | `z.string().email()` |
| `phone` | `z.string()` |
| `url` | `z.string().url()` |
| `number` | `z.number()` |
| `currency` | `z.number().min(0)` |
| `boolean` | `z.boolean()` |
| `date` | `z.coerce.date()` |
| `timestamp` | `z.date()` |
| `uuid` | `z.string().uuid()` |
| `enum` | `z.enum([...options])` |
| `tags` | `z.array(z.string())` |
| `json` | `z.record(z.unknown())` |

---

## Step 3: Create tRPC Procedures

Add to: `src/server/routers/[domain].ts`

```typescript
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, or, ilike, inArray, isNull, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { [table] } from '@/lib/db/schema';
import {
  create[Entity]Input,
  update[Entity]Input,
  list[Entities]Input,
} from '@/lib/validations/[entity]';
import { createWorkplanInstance, logActivity, handleStatusChange } from '@/lib/workplan';

export const [domain]Router = router({

  // ==========================================
  // GET BY ID
  // ==========================================
  get[Entity]ById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await db.query.[table].findFirst({
        where: and(
          eq([table].id, input.id),
          eq([table].orgId, ctx.user.orgId),
          isNull([table].deletedAt),
        ),
        with: {
          owner: true,
          account: true,
          // Add relations from entity config
        },
      });

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '[Entity] not found'
        });
      }

      return result;
    }),

  // ==========================================
  // LIST WITH PAGINATION & FILTERS
  // ==========================================
  list[Entities]: protectedProcedure
    .input(list[Entities]Input)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortDirection, search, filters } = input;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const conditions = [
        eq([table].orgId, ctx.user.orgId),
        isNull([table].deletedAt),
      ];

      // Search (from entity config searchFields)
      if (search) {
        conditions.push(
          or(
            ilike([table].companyName, `%${search}%`),
            ilike([table].email, `%${search}%`),
            ilike([table].firstName, `%${search}%`),
            ilike([table].lastName, `%${search}%`),
          )
        );
      }

      // Filters
      if (filters?.status?.length) {
        conditions.push(inArray([table].status, filters.status));
      }

      if (filters?.ownerId) {
        conditions.push(eq([table].ownerId, filters.ownerId));
      }

      if (filters?.dateRange?.from) {
        conditions.push(gte([table].createdAt, filters.dateRange.from));
      }

      if (filters?.dateRange?.to) {
        conditions.push(lte([table].createdAt, filters.dateRange.to));
      }

      // Execute queries in parallel
      const [items, [{ count }]] = await Promise.all([
        db.query.[table].findMany({
          where: and(...conditions),
          with: { owner: true },
          orderBy: sortDirection === 'asc'
            ? asc([table][sortBy || 'createdAt'])
            : desc([table][sortBy || 'createdAt']),
          limit: pageSize,
          offset,
        }),
        db.select({ count: sql<number>`count(*)` })
          .from([table])
          .where(and(...conditions)),
      ]);

      return {
        items,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    }),

  // ==========================================
  // CREATE (with workplan for root entities)
  // ==========================================
  create[Entity]: protectedProcedure
    .input(create[Entity]Input)
    .mutation(async ({ ctx, input }) => {
      return db.transaction(async (tx) => {
        // 1. Create entity
        const [[entity]] = await tx.insert([table]).values({
          ...input,
          orgId: ctx.user.orgId,
          createdBy: ctx.user.id,
        }).returning();

        // 2. Create workplan (ROOT ENTITIES ONLY)
        // Check entity config: if category === 'root'
        await createWorkplanInstance(tx, {
          orgId: ctx.user.orgId,
          entityType: '[entity]',
          entityId: [entity].id,
          templateCode: '[entity]_workflow', // From entity config
          createdBy: ctx.user.id,
        });

        // 3. Log activity
        await logActivity(tx, {
          orgId: ctx.user.orgId,
          entityType: '[entity]',
          entityId: [entity].id,
          subject: '[Entity] created',
          category: 'lifecycle',
          performedBy: ctx.user.id,
          details: { source: input.source },
        });

        return [entity];
      });
    }),

  // ==========================================
  // UPDATE (with activity logging)
  // ==========================================
  update[Entity]: protectedProcedure
    .input(update[Entity]Input)
    .mutation(async ({ ctx, input }) => {
      return db.transaction(async (tx) => {
        // 1. Get old values for change tracking
        const old = await tx.query.[table].findFirst({
          where: and(
            eq([table].id, input.id),
            eq([table].orgId, ctx.user.orgId),
          ),
        });

        if (!old) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '[Entity] not found'
          });
        }

        // 2. Update
        const [[entity]] = await tx.update([table])
          .set({
            ...input.data,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(and(
            eq([table].id, input.id),
            eq([table].orgId, ctx.user.orgId),
          ))
          .returning();

        // 3. Log activity
        await logActivity(tx, {
          orgId: ctx.user.orgId,
          entityType: '[entity]',
          entityId: [entity].id,
          subject: '[Entity] updated',
          category: 'update',
          performedBy: ctx.user.id,
        });

        // 4. Handle status change (ROOT ENTITIES ONLY)
        if (old.status !== [entity].status) {
          await handleStatusChange(tx, {
            orgId: ctx.user.orgId,
            entityType: '[entity]',
            entityId: [entity].id,
            oldStatus: old.status,
            newStatus: [entity].status,
            changedBy: ctx.user.id,
          });
        }

        return [entity];
      });
    }),

  // ==========================================
  // DELETE (soft)
  // ==========================================
  delete[Entity]: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await db.update([table])
        .set({
          deletedAt: new Date(),
          updatedBy: ctx.user.id,
        })
        .where(and(
          eq([table].id, input.id),
          eq([table].orgId, ctx.user.orgId),
        ))
        .returning();

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '[Entity] not found'
        });
      }

      return { success: true };
    }),

  // ==========================================
  // ENTITY-SPECIFIC PROCEDURES
  // Add based on entity config procedures
  // ==========================================

});
```

---

## Step 4: Register Router (if new)

If this is a new router, add to `src/server/trpc/root.ts`:

```typescript
import { [domain]Router } from '../routers/[domain]';

export const appRouter = router({
  // ... existing routers
  [domain]: [domain]Router,
});
```

---

## Step 5: Verify Workplan Setup (Root Entities Only)

Check workplan template exists:

```sql
SELECT * FROM workplan_templates WHERE code = '[entity]_workflow';
SELECT * FROM activity_patterns WHERE entity_type = '[entity]';
```

If missing, the migration should have created them. If not:

```sql
-- Create template
INSERT INTO workplan_templates (org_id, code, name, entity_type, trigger_event)
VALUES (NULL, '[entity]_workflow', '[Entity] Workflow', '[entity]', 'create');
```

---

## Step 6: Test Backend

Create test script or use API directly:

```bash
# Start dev server
pnpm dev

# Test via tRPC panel or direct API calls
```

### Manual Verification Checklist

- [ ] `get[Entity]ById` returns entity with relations
- [ ] `list[Entities]` returns paginated results
- [ ] `list[Entities]` search works
- [ ] `list[Entities]` filters work
- [ ] `create[Entity]` creates entity
- [ ] `create[Entity]` creates workplan (root entities)
- [ ] `create[Entity]` logs activity
- [ ] `update[Entity]` updates entity
- [ ] `update[Entity]` logs activity
- [ ] `update[Entity]` handles status change (root entities)
- [ ] `delete[Entity]` soft deletes

---

## Step 7: Commit Checkpoint

```bash
git add src/lib/validations/[entity].ts
git add src/server/routers/[domain].ts
git commit -m "feat([domain]): add [entity] backend procedures

- Add Zod validation schemas
- Add tRPC CRUD procedures
- Integrate workplan creation
- Add activity logging

🤖 Generated with Claude Code"
```

---

## Next Steps

After this command completes and is committed:

```bash
/convert-entity-ui [entity]  # Generate frontend + tests from config
```

---

## Troubleshooting

### Type Errors in Router
- Ensure Drizzle schema matches entity config
- Check import paths for table and relations

### Workplan Not Created
- Verify template exists in `workplan_templates`
- Check `createWorkplanInstance` import

### Activity Not Logged
- Verify `activities` table exists
- Check `logActivity` import

### Relation Queries Fail
- Ensure relation defined in Drizzle schema
- Check `with: {}` syntax
