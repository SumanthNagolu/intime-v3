# Backend Architecture Rules

Standards for database schema, tRPC routers, and data layer that sync with the metadata-driven frontend.

---

## Core Principles

1. **Entity-Centric Design** - Each business entity (Lead, Job, Talent) has a consistent structure
2. **Standard CRUD Operations** - Predictable procedure names across all entities
3. **Field Path Mapping** - Database columns map directly to frontend field paths
4. **Validation Alignment** - Zod schemas match frontend field definitions
5. **Workplan Integration** - Root entities automatically get workplan/activity tracking
6. **Activity Logging** - All mutations log activities for audit trail

---

## Entity Categories

### Root Entities (Have Workplans)
These entities have full lifecycle tracking with workplans and activities:

```typescript
type RootEntity = 'lead' | 'job' | 'submission' | 'deal' | 'placement';

// Root entities MUST:
// 1. Auto-create workplan instance on creation
// 2. Log all mutations as activities
// 3. Handle status changes that trigger workplan activities
```

### Supporting Entities
These entities are referenced by root entities but don't have their own workplans:

```typescript
type SupportingEntity = 'account' | 'contact' | 'candidate' | 'interview' | 'offer';

// Supporting entities:
// - Log activities but don't have workplans
// - Activities linked to parent root entity when applicable
```

### Platform Entities
System-level entities that are not part of business workflows:

```typescript
type PlatformEntity = 'user' | 'organization' | 'group' | 'role' | 'permission';

---

## Entity Configuration Pattern

Every entity should have a configuration file that defines its structure:

```
src/lib/entities/[entity].entity.ts
```

### Entity Config Structure

```typescript
// src/lib/entities/lead.entity.ts
import type { EntityConfig } from '@/lib/entities/types';
import { z } from 'zod';

export const leadEntity: EntityConfig = {
  // Identity
  name: 'lead',
  displayName: 'Lead',
  pluralName: 'Leads',

  // Database
  tableName: 'leads',
  schema: 'public',

  // tRPC Router
  router: 'crm',

  // Standard procedures (auto-generated names)
  procedures: {
    getById: 'getLeadById',
    list: 'listLeads',
    create: 'createLead',
    update: 'updateLead',
    delete: 'deleteLead',
  },

  // Field definitions (sync with frontend)
  fields: {
    // Core fields
    id: { type: 'uuid', primaryKey: true },
    orgId: { type: 'uuid', required: true, internal: true },

    // Company fields
    companyName: { type: 'text', maxLength: 255 },
    industry: { type: 'enum', options: ['technology', 'healthcare', ...] },
    companyType: { type: 'enum', options: ['direct_client', 'msp_vms', ...] },
    tier: { type: 'enum', options: ['enterprise', 'mid_market', 'smb'] },
    website: { type: 'url' },

    // Contact fields
    firstName: { type: 'text', maxLength: 100 },
    lastName: { type: 'text', maxLength: 100 },
    email: { type: 'email' },
    phone: { type: 'phone' },

    // Status & tracking
    status: { type: 'enum', options: ['new', 'contacted', 'qualified', ...] },
    estimatedValue: { type: 'currency' },
    ownerId: { type: 'uuid', references: 'userProfiles' },

    // Timestamps (auto-managed)
    createdAt: { type: 'timestamp', auto: true },
    updatedAt: { type: 'timestamp', auto: true },
    deletedAt: { type: 'timestamp', softDelete: true },
  },

  // Relations
  relations: {
    owner: { type: 'belongsTo', entity: 'userProfile', field: 'ownerId' },
    account: { type: 'belongsTo', entity: 'account', field: 'accountId' },
    activities: { type: 'hasMany', entity: 'activity', foreignKey: 'entityId' },
  },

  // Indexes for common queries
  indexes: [
    { fields: ['orgId', 'status'] },
    { fields: ['orgId', 'ownerId'] },
    { fields: ['orgId', 'createdAt'] },
  ],
};
```

---

## Standard tRPC Procedure Patterns

### Naming Convention

| Operation | Pattern | Example |
|-----------|---------|---------|
| Get by ID | `get[Entity]ById` | `getLeadById` |
| List with filters | `list[Entities]` | `listLeads` |
| Create | `create[Entity]` | `createLead` |
| Update | `update[Entity]` | `updateLead` |
| Delete (soft) | `delete[Entity]` | `deleteLead` |
| Bulk operations | `bulk[Action][Entities]` | `bulkUpdateLeads` |

### Standard Input/Output Schemas

```typescript
// src/lib/validations/[entity].ts

// Get by ID
export const getByIdInput = z.object({
  id: z.string().uuid(),
});

// List with pagination & filters
export const listInput = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),

  // Sorting
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),

  // Search
  search: z.string().optional(),

  // Filters (entity-specific)
  filters: z.object({
    status: z.array(z.string()).optional(),
    ownerId: z.string().uuid().optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
  }).optional(),
});

// List output (paginated)
export const listOutput = z.object({
  items: z.array(entitySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  metrics: z.object({...}).optional(), // Summary metrics
});

// Create input (omit auto-fields)
export const createInput = entitySchema.omit({
  id: true,
  orgId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// Update input (partial + id required)
export const updateInput = z.object({
  id: z.string().uuid(),
  data: createInput.partial(),
});
```

---

## Router Template

```typescript
// src/server/routers/[domain].ts

import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, ilike, inArray, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import {
  getByIdInput,
  listInput,
  createInput,
  updateInput,
} from '@/lib/validations/lead';

export const crmRouter = router({
  // ==========================================
  // GET BY ID
  // ==========================================
  getLeadById: protectedProcedure
    .input(getByIdInput)
    .query(async ({ ctx, input }) => {
      const lead = await db.query.leads.findFirst({
        where: and(
          eq(leads.id, input.id),
          eq(leads.orgId, ctx.user.orgId),
          isNull(leads.deletedAt),
        ),
        with: {
          owner: true,
          account: true,
        },
      });

      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' });
      }

      return lead;
    }),

  // ==========================================
  // LIST WITH PAGINATION & FILTERS
  // ==========================================
  listLeads: protectedProcedure
    .input(listInput)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortDirection, search, filters } = input;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const conditions = [
        eq(leads.orgId, ctx.user.orgId),
        isNull(leads.deletedAt),
      ];

      if (search) {
        conditions.push(
          or(
            ilike(leads.companyName, `%${search}%`),
            ilike(leads.email, `%${search}%`),
          )
        );
      }

      if (filters?.status?.length) {
        conditions.push(inArray(leads.status, filters.status));
      }

      if (filters?.ownerId) {
        conditions.push(eq(leads.ownerId, filters.ownerId));
      }

      // Execute queries
      const [items, [{ count }]] = await Promise.all([
        db.query.leads.findMany({
          where: and(...conditions),
          with: { owner: true },
          orderBy: sortDirection === 'asc'
            ? asc(leads[sortBy || 'createdAt'])
            : desc(leads[sortBy || 'createdAt']),
          limit: pageSize,
          offset,
        }),
        db.select({ count: sql<number>`count(*)` })
          .from(leads)
          .where(and(...conditions)),
      ]);

      // Calculate metrics
      const metrics = await calculateLeadMetrics(ctx.user.orgId);

      return {
        items,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
        metrics,
      };
    }),

  // ==========================================
  // CREATE
  // ==========================================
  createLead: protectedProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      const [lead] = await db.insert(leads).values({
        ...input,
        orgId: ctx.user.orgId,
        createdBy: ctx.user.id,
      }).returning();

      return lead;
    }),

  // ==========================================
  // UPDATE
  // ==========================================
  updateLead: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const [lead] = await db.update(leads)
        .set({
          ...input.data,
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        })
        .where(and(
          eq(leads.id, input.id),
          eq(leads.orgId, ctx.user.orgId),
        ))
        .returning();

      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' });
      }

      return lead;
    }),

  // ==========================================
  // DELETE (Soft)
  // ==========================================
  deleteLead: protectedProcedure
    .input(getByIdInput)
    .mutation(async ({ ctx, input }) => {
      const [lead] = await db.update(leads)
        .set({
          deletedAt: new Date(),
          updatedBy: ctx.user.id,
        })
        .where(and(
          eq(leads.id, input.id),
          eq(leads.orgId, ctx.user.orgId),
        ))
        .returning();

      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' });
      }

      return { success: true };
    }),
});
```

---

## Field Type Mapping

| Frontend Type | Database Type | Drizzle Type | Zod Type |
|---------------|---------------|--------------|----------|
| `text` | `TEXT` | `text()` | `z.string()` |
| `textarea` | `TEXT` | `text()` | `z.string()` |
| `number` | `INTEGER` | `integer()` | `z.number()` |
| `currency` | `NUMERIC(12,2)` | `numeric()` | `z.string()` (for precision) |
| `percentage` | `INTEGER` | `integer()` | `z.number().min(0).max(100)` |
| `date` | `DATE` | `date()` | `z.date()` |
| `datetime` | `TIMESTAMP` | `timestamp()` | `z.date()` |
| `boolean` | `BOOLEAN` | `boolean()` | `z.boolean()` |
| `enum` | `TEXT` | `text()` | `z.enum([...])` |
| `select` | `UUID` | `uuid()` | `z.string().uuid()` |
| `multiselect` | `TEXT[]` or junction | `text()[]` | `z.array(z.string())` |
| `tags` | `TEXT[]` | `text()[]` | `z.array(z.string())` |
| `email` | `TEXT` | `text()` | `z.string().email()` |
| `phone` | `TEXT` | `text()` | `z.string()` |
| `url` | `TEXT` | `text()` | `z.string().url()` |
| `uuid` | `UUID` | `uuid()` | `z.string().uuid()` |
| `json` | `JSONB` | `jsonb()` | `z.record()` or custom |

---

## Database Schema Standards

### Required Columns (Every Table)

```sql
-- Identity
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID NOT NULL REFERENCES organizations(id),

-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by UUID REFERENCES user_profiles(id),
updated_by UUID REFERENCES user_profiles(id),

-- Soft delete
deleted_at TIMESTAMPTZ
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case`, plural | `leads`, `job_orders` |
| Columns | `snake_case` | `company_name`, `created_at` |
| Foreign keys | `[entity]_id` | `account_id`, `owner_id` |
| Indexes | `idx_[table]_[columns]` | `idx_leads_org_status` |
| Constraints | `[table]_[column]_[type]` | `leads_email_unique` |

### Index Strategy

```sql
-- Always index org_id (multi-tenant)
CREATE INDEX idx_[table]_org_id ON [table](org_id);

-- Index soft delete filter
CREATE INDEX idx_[table]_org_deleted ON [table](org_id) WHERE deleted_at IS NULL;

-- Index common filters
CREATE INDEX idx_[table]_org_status ON [table](org_id, status) WHERE deleted_at IS NULL;

-- Index foreign keys
CREATE INDEX idx_[table]_[fk] ON [table]([fk_column]);
```

---

## Validation Schema Alignment

Frontend field definitions should match backend Zod schemas:

```typescript
// Frontend (screen definition)
{
  id: 'email',
  label: 'Email',
  fieldType: 'email',
  required: true,
  config: { maxLength: 255 },
}

// Backend (Zod schema)
email: z.string().email().max(255),

// Database (Drizzle schema)
email: text('email').notNull(),
```

### Validation Rules Mapping

| Frontend Rule | Zod Equivalent |
|---------------|----------------|
| `required: true` | No `.optional()` |
| `config.minLength` | `.min(n)` |
| `config.maxLength` | `.max(n)` |
| `config.min` | `.min(n)` (number) |
| `config.max` | `.max(n)` (number) |
| `config.pattern` | `.regex(pattern)` |
| `fieldType: 'email'` | `.email()` |
| `fieldType: 'url'` | `.url()` |
| `fieldType: 'uuid'` | `.uuid()` |

---

## Activity/Audit Pattern

All entities should support activity logging:

```typescript
// Log activity after mutations
async function logActivity(
  orgId: string,
  entityType: string,
  entityId: string,
  activityType: 'created' | 'updated' | 'deleted' | 'status_changed',
  userId: string,
  details?: Record<string, unknown>
) {
  await db.insert(activities).values({
    orgId,
    entityType,
    entityId,
    activityType,
    performedBy: userId,
    details,
    activityDate: new Date(),
  });
}
```

---

## Anti-Patterns to Avoid

1. **Don't create procedures without org_id filtering** - Security risk
2. **Don't skip soft delete checks** - Always filter `deletedAt IS NULL`
3. **Don't return sensitive fields** - Use `.select()` to limit columns
4. **Don't allow arbitrary sorting** - Validate sortBy against allowed fields
5. **Don't skip pagination** - Always paginate list queries
6. **Don't hardcode org_id** - Always use `ctx.user.orgId`
7. **Don't expose internal IDs** - Use UUIDs for all external references
8. **Don't skip workplan creation for root entities** - Always auto-create
9. **Don't skip activity logging on mutations** - Audit trail is required

---

## Workplan Integration Pattern

### Root Entity Creation (Transaction Pattern)

```typescript
// src/server/routers/crm.ts

import { createWorkplanInstance, logActivity } from '@/lib/workplan';

createLead: protectedProcedure
  .input(createLeadInput)
  .mutation(async ({ ctx, input }) => {
    return db.transaction(async (tx) => {
      // 1. Create the entity
      const [lead] = await tx.insert(leads).values({
        ...input,
        orgId: ctx.user.orgId,
        createdBy: ctx.user.id,
      }).returning();

      // 2. Auto-create workplan instance
      await createWorkplanInstance(tx, {
        orgId: ctx.user.orgId,
        entityType: 'lead',
        entityId: lead.id,
        templateCode: 'lead_qualification',
        createdBy: ctx.user.id,
      });

      // 3. Log creation activity
      await logActivity(tx, {
        orgId: ctx.user.orgId,
        entityType: 'lead',
        entityId: lead.id,
        subject: 'Lead created',
        category: 'lifecycle',
        performedBy: ctx.user.id,
        details: { source: input.source },
      });

      return lead;
    });
  }),
```

### Root Entity Update (With Status Change Handling)

```typescript
updateLead: protectedProcedure
  .input(updateLeadInput)
  .mutation(async ({ ctx, input }) => {
    return db.transaction(async (tx) => {
      // 1. Get old values for change tracking
      const oldLead = await tx.query.leads.findFirst({
        where: eq(leads.id, input.id),
      });

      if (!oldLead) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // 2. Update the entity
      const [lead] = await tx.update(leads)
        .set({
          ...input.data,
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        })
        .where(and(
          eq(leads.id, input.id),
          eq(leads.orgId, ctx.user.orgId),
        ))
        .returning();

      // 3. Log update activity with changes
      const changes = diffObjects(oldLead, lead);
      if (Object.keys(changes).length > 0) {
        await logActivity(tx, {
          orgId: ctx.user.orgId,
          entityType: 'lead',
          entityId: lead.id,
          subject: 'Lead updated',
          category: 'update',
          performedBy: ctx.user.id,
          details: { changes },
        });
      }

      // 4. Handle status change - may trigger workplan activities
      if (oldLead.status !== lead.status) {
        await handleStatusChange(tx, {
          orgId: ctx.user.orgId,
          entityType: 'lead',
          entityId: lead.id,
          oldStatus: oldLead.status,
          newStatus: lead.status,
          changedBy: ctx.user.id,
        });
      }

      return lead;
    });
  }),
```

### Helper Functions

```typescript
// src/lib/workplan/helpers.ts

import { db } from '@/lib/db';
import { activities, workplanInstances } from '@/lib/db/schema';

export async function createWorkplanInstance(
  tx: typeof db,
  params: {
    orgId: string;
    entityType: string;
    entityId: string;
    templateCode: string;
    createdBy: string;
  }
) {
  // Get template
  const template = await tx.query.workplanTemplates.findFirst({
    where: and(
      eq(workplanTemplates.code, params.templateCode),
      or(
        eq(workplanTemplates.orgId, params.orgId),
        isNull(workplanTemplates.orgId), // System templates
      ),
    ),
    with: {
      templateActivities: {
        with: { pattern: true },
        orderBy: asc(workplanTemplateActivities.orderIndex),
      },
    },
  });

  if (!template) return null;

  // Create instance
  const [instance] = await tx.insert(workplanInstances).values({
    orgId: params.orgId,
    templateId: template.id,
    entityType: params.entityType,
    entityId: params.entityId,
    templateCode: template.code,
    templateName: template.name,
    status: 'active',
    totalActivities: template.templateActivities.length,
    createdBy: params.createdBy,
  }).returning();

  // Create initial activities
  for (const ta of template.templateActivities) {
    if (ta.orderIndex === 0 || ta.canRunParallel) {
      await tx.insert(activities).values({
        orgId: params.orgId,
        patternId: ta.patternId,
        patternCode: ta.pattern.code,
        workplanInstanceId: instance.id,
        entityType: params.entityType,
        entityId: params.entityId,
        subject: ta.pattern.name,
        description: ta.pattern.description,
        priority: ta.pattern.priority,
        category: ta.pattern.category,
        instructions: ta.pattern.instructions,
        checklist: ta.pattern.checklist,
        dueDate: addDays(new Date(), ta.pattern.targetDays || 1),
        status: 'open',
        autoCreated: true,
        createdBy: params.createdBy,
      });
    }
  }

  return instance;
}

export async function logActivity(
  tx: typeof db,
  params: {
    orgId: string;
    entityType: string;
    entityId: string;
    subject: string;
    category?: string;
    performedBy: string;
    details?: Record<string, unknown>;
  }
) {
  await tx.insert(activities).values({
    orgId: params.orgId,
    entityType: params.entityType,
    entityId: params.entityId,
    subject: params.subject,
    category: params.category || 'system',
    description: JSON.stringify(params.details),
    status: 'completed',
    completedAt: new Date(),
    autoCreated: true,
    autoCompleted: true,
    createdBy: params.performedBy,
  });
}

export async function handleStatusChange(
  tx: typeof db,
  params: {
    orgId: string;
    entityType: string;
    entityId: string;
    oldStatus: string | null;
    newStatus: string;
    changedBy: string;
  }
) {
  // Log status change activity
  await logActivity(tx, {
    orgId: params.orgId,
    entityType: params.entityType,
    entityId: params.entityId,
    subject: `Status changed from ${params.oldStatus || 'none'} to ${params.newStatus}`,
    category: 'status_change',
    performedBy: params.changedBy,
    details: {
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
    },
  });

  // Check for workplan activities that should be triggered
  const instance = await tx.query.workplanInstances.findFirst({
    where: and(
      eq(workplanInstances.entityType, params.entityType),
      eq(workplanInstances.entityId, params.entityId),
      eq(workplanInstances.status, 'active'),
    ),
  });

  if (instance) {
    // Trigger successor activities based on status
    // Implementation depends on activity pattern configuration
  }
}

export function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const key of Object.keys(newObj)) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }

  return changes;
}
```

---

## Workplan Templates by Entity

| Entity | Template Code | Trigger | Key Activities |
|--------|--------------|---------|----------------|
| Lead | `lead_qualification` | On create | Initial Research → Discovery Call → BANT Assessment → Proposal |
| Job | `job_fulfillment` | On create | Requirements Review → Sourcing → Screening → Client Submission |
| Submission | `submission_processing` | On create | Resume Review → Internal Interview → Client Submission → Feedback |
| Deal | `deal_closing` | On create | Needs Analysis → Solution Design → Proposal → Negotiation → Close |
| Placement | `placement_onboarding` | On create | Paperwork → Background Check → Onboarding → Start Date |

---

## Activity Pattern Checklist

When creating a new root entity, ensure these activity patterns exist:

```sql
-- Check patterns exist for entity type
SELECT code, name, entity_type FROM activity_patterns
WHERE entity_type = 'lead'
ORDER BY code;

-- Check workplan template exists
SELECT code, name, entity_type FROM workplan_templates
WHERE entity_type = 'lead';

-- Check template has activities
SELECT wta.order_index, ap.code, ap.name
FROM workplan_template_activities wta
JOIN activity_patterns ap ON wta.pattern_id = ap.id
JOIN workplan_templates wt ON wta.template_id = wt.id
WHERE wt.entity_type = 'lead'
ORDER BY wta.order_index;
```
