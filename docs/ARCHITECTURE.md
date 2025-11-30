# InTime v3 - System Architecture

Enterprise Staffing SaaS with Guidewire-Inspired Patterns

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Principles](#core-principles)
3. [Entity Architecture](#entity-architecture)
4. [Workplan & Activity System](#workplan--activity-system)
5. [Data Flow](#data-flow)
6. [Tech Stack](#tech-stack)
7. [Module Structure](#module-structure)
8. [Security & Multi-Tenancy](#security--multi-tenancy)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTIME v3                                       │
│                     Enterprise Staffing SaaS Platform                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   CRM    │  │Recruiting│  │  Bench   │  │  Academy │  │   HR     │       │
│  │          │  │  (ATS)   │  │  Sales   │  │          │  │          │       │
│  │ Leads    │  │ Jobs     │  │ Hotlist  │  │ Courses  │  │ People   │       │
│  │ Deals    │  │Submissions│  │ Deals   │  │ XP/Certs │  │ Talent   │       │
│  │ Accounts │  │Placements│  │Placements│  │ Cohorts  │  │ Acq.     │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │             │              │
│       └─────────────┴──────┬──────┴─────────────┴─────────────┘              │
│                            │                                                 │
│                 ┌──────────▼──────────┐                                      │
│                 │   WORKPLAN SYSTEM   │                                      │
│                 │  (Guidewire-style)  │                                      │
│                 │                     │                                      │
│                 │ • Activity Patterns │                                      │
│                 │ • Workplan Templates│                                      │
│                 │ • Activity Chains   │                                      │
│                 │ • Auto-Scheduling   │                                      │
│                 └──────────┬──────────┘                                      │
│                            │                                                 │
│       ┌────────────────────┼────────────────────┐                            │
│       │                    │                    │                            │
│  ┌────▼────┐         ┌─────▼─────┐        ┌────▼────┐                        │
│  │ tRPC    │         │  Drizzle  │        │ Supabase│                        │
│  │ API     │◄───────►│   ORM     │◄──────►│Postgres │                        │
│  └─────────┘         └───────────┘        └─────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. Entity-First Design

Everything is an **Entity**. Entities are categorized by their role in business workflows:

| Category | Entities | Characteristics |
|----------|----------|-----------------|
| **Root** | lead, job, submission, deal, placement | Drive workflows, get workplans, full activity logging |
| **Supporting** | account, contact, candidate, interview, offer | Support root entities, no workplans |
| **Platform** | user, organization, role, permission | System infrastructure |

### 2. Single Source of Truth

Each entity has ONE configuration file that drives everything:

```
src/lib/entities/[domain]/[entity].entity.ts
         │
         ├──► Zod Schemas (validation)
         ├──► tRPC Procedures (API)
         ├──► Screen Definitions (UI)
         └──► E2E Tests (testing)
```

### 3. Guidewire-Inspired Workplan System

Root entities get automatic workflow management:

```
Entity Created
      │
      ▼
┌─────────────────┐
│ Workplan        │
│ Instance        │
│ Created         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Activity 1      │────►│ Activity 2      │────►│ Activity 3      │
│ (from pattern)  │     │ (successor)     │     │ (successor)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 4. Metadata-Driven UI

Screens are defined as TypeScript configurations, not JSX:

```typescript
// Define once
const leadDetailScreen: ScreenDefinition = {
  id: 'lead-detail',
  type: 'detail',
  tabs: [...],
  sections: [...],
  actions: [...],
};

// Render anywhere
<ScreenRenderer screen={leadDetailScreen} />
```

### 5. Multi-Tenant by Default

Every query includes `orgId` filtering. No exceptions.

```typescript
// Always
where: and(
  eq(table.orgId, ctx.user.orgId),
  isNull(table.deletedAt),
  // ... other conditions
)
```

---

## Entity Architecture

### Entity Configuration Structure

```typescript
// src/lib/entities/[domain]/[entity].entity.ts

export const leadEntity: EntityConfig = {
  // ═══════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════
  name: 'lead',
  displayName: 'Lead',
  pluralName: 'Leads',
  category: 'root',  // root | supporting | platform

  // ═══════════════════════════════════════
  // DATABASE
  // ═══════════════════════════════════════
  tableName: 'leads',
  schema: 'public',
  router: 'crm',

  // ═══════════════════════════════════════
  // PROCEDURES
  // ═══════════════════════════════════════
  procedures: {
    getById: 'getLeadById',
    list: 'listLeads',
    create: 'createLead',
    update: 'updateLead',
    delete: 'deleteLead',
    // Entity-specific
    convert: 'convertLead',
    qualify: 'qualifyLead',
  },

  // ═══════════════════════════════════════
  // WORKPLAN (Root Entities Only)
  // ═══════════════════════════════════════
  workplan: {
    templateCode: 'lead_workflow',
    triggerOnCreate: true,
    triggerOnStatusChange: true,
  },

  // ═══════════════════════════════════════
  // FIELDS (All Database Columns)
  // ═══════════════════════════════════════
  fields: {
    id: { type: 'uuid', primaryKey: true },
    orgId: { type: 'uuid', required: true, internal: true },

    // Core fields
    companyName: {
      type: 'text',
      required: true,
      label: 'Company Name',
      searchable: true,
    },
    status: {
      type: 'enum',
      required: true,
      label: 'Status',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' },
      ],
      default: 'new',
    },

    // Reference fields
    ownerId: {
      type: 'uuid',
      label: 'Owner',
      references: { entity: 'userProfile', display: 'fullName' },
    },

    // Audit fields
    createdAt: { type: 'timestamp', auto: true },
    updatedAt: { type: 'timestamp', auto: true },
    deletedAt: { type: 'timestamp', softDelete: true },
  },

  // ═══════════════════════════════════════
  // RELATIONS
  // ═══════════════════════════════════════
  relations: {
    owner: { type: 'belongsTo', entity: 'userProfile', field: 'ownerId' },
    account: { type: 'belongsTo', entity: 'account', field: 'accountId' },
    activities: { type: 'hasMany', entity: 'activity', polymorphic: true },
  },

  // ═══════════════════════════════════════
  // UI CONFIGURATION
  // ═══════════════════════════════════════
  ui: {
    list: {
      columns: ['companyName', 'status', 'owner', 'createdAt'],
      filters: ['status', 'owner', 'source'],
      defaultSort: { field: 'createdAt', direction: 'desc' },
    },
    detail: {
      tabs: [
        { id: 'overview', label: 'Overview', sections: ['info', 'contact'] },
        { id: 'qualification', label: 'Qualification', sections: ['bant'] },
        { id: 'activity', label: 'Activity', sections: ['workplan', 'timeline'] },
      ],
    },
  },
};
```

### Entity Flow

```
                    Entity Config
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  Zod    │    │  tRPC   │    │ Screen  │
    │ Schemas │    │ Router  │    │  Defs   │
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   E2E Tests   │
                 └───────────────┘
```

---

## Workplan & Activity System

### Core Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKPLAN SCHEMA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  workplan_templates          activity_patterns                   │
│  ┌─────────────────┐        ┌─────────────────┐                 │
│  │ id              │        │ id              │                 │
│  │ code            │        │ code            │                 │
│  │ name            │        │ name            │                 │
│  │ entity_type     │        │ entity_type     │                 │
│  │ trigger_event   │        │ category        │                 │
│  └────────┬────────┘        │ target_days     │                 │
│           │                 │ priority        │                 │
│           │                 └────────┬────────┘                 │
│           │                          │                          │
│           ▼                          ▼                          │
│  workplan_template_activities       activity_pattern_successors │
│  ┌─────────────────┐        ┌─────────────────┐                 │
│  │ template_id     │        │ pattern_id      │                 │
│  │ pattern_id      │        │ successor_id    │                 │
│  │ order_index     │        │ trigger_on      │                 │
│  │ is_required     │        │ delay_days      │                 │
│  └─────────────────┘        └─────────────────┘                 │
│                                                                  │
│           │                          │                          │
│           └──────────┬───────────────┘                          │
│                      ▼                                          │
│           workplan_instances                                    │
│           ┌─────────────────┐                                   │
│           │ id              │                                   │
│           │ template_id     │                                   │
│           │ entity_type     │                                   │
│           │ entity_id       │                                   │
│           │ status          │                                   │
│           └────────┬────────┘                                   │
│                    │                                            │
│                    ▼                                            │
│           activities                                            │
│           ┌─────────────────┐                                   │
│           │ id              │                                   │
│           │ workplan_id     │                                   │
│           │ pattern_id      │                                   │
│           │ entity_type     │                                   │
│           │ entity_id       │                                   │
│           │ subject         │                                   │
│           │ status          │                                   │
│           │ due_date        │                                   │
│           │ completed_at    │                                   │
│           └─────────────────┘                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Activity Lifecycle

```
┌─────────┐     ┌─────────────┐     ┌───────────┐     ┌──────────┐
│  OPEN   │────►│ IN_PROGRESS │────►│ COMPLETED │     │ SKIPPED  │
└─────────┘     └─────────────┘     └─────┬─────┘     └──────────┘
                       │                  │
                       │                  ▼
                       │          ┌─────────────────┐
                       │          │ Trigger         │
                       │          │ Successors      │
                       │          └─────────────────┘
                       │
                       ▼
                ┌─────────────┐
                │  ESCALATED  │
                └─────────────┘
```

### Workplan Integration in tRPC

```typescript
// Create mutation with workplan
create: protectedProcedure
  .input(createSchema)
  .mutation(async ({ ctx, input }) => {
    return db.transaction(async (tx) => {
      // 1. Create entity
      const [entity] = await tx.insert(table).values({...}).returning();

      // 2. Create workplan (ROOT ENTITIES ONLY)
      await createWorkplanInstance(tx, {
        orgId: ctx.user.orgId,
        entityType: 'lead',
        entityId: entity.id,
        templateCode: 'lead_workflow',
        createdBy: ctx.user.id,
      });

      // 3. Log activity
      await logActivity(tx, {
        entityType: 'lead',
        entityId: entity.id,
        subject: 'Lead created',
        category: 'lifecycle',
      });

      return entity;
    });
  }),
```

---

## Data Flow

### Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ React Query │◄──►│ tRPC Client │◄──►│ HTTP        │          │
│  │ Cache       │    │             │    │ Transport   │          │
│  └─────────────┘    └─────────────┘    └──────┬──────┘          │
│                                               │                  │
└───────────────────────────────────────────────┼──────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ tRPC Router │◄──►│ Middleware  │◄──►│ Procedures  │          │
│  │             │    │ (auth, org) │    │             │          │
│  └─────────────┘    └─────────────┘    └──────┬──────┘          │
│                                               │                  │
│                                               ▼                  │
│                                        ┌─────────────┐          │
│                                        │ Drizzle ORM │          │
│                                        └──────┬──────┘          │
│                                               │                  │
└───────────────────────────────────────────────┼──────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (Supabase)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ PostgreSQL  │    │ RLS Policies│    │ Edge Funcs  │          │
│  │             │    │             │    │             │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mutation Flow (Root Entity)

```
User Action (Create Lead)
         │
         ▼
┌─────────────────┐
│ React Hook      │
│ useCreateLead() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ tRPC Mutation   │
│ crm.createLead  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Transaction                          │
│ ┌─────────────────────────────────┐ │
│ │ 1. Insert Lead                  │ │
│ ├─────────────────────────────────┤ │
│ │ 2. Create Workplan Instance     │ │
│ ├─────────────────────────────────┤ │
│ │ 3. Create Initial Activities    │ │
│ ├─────────────────────────────────┤ │
│ │ 4. Log Creation Activity        │ │
│ └─────────────────────────────────┘ │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Invalidate      │
│ Query Cache     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ UI Updates      │
│ Automatically   │
└─────────────────┘
```

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Query (via tRPC) |
| Forms | React Hook Form + Zod |

### Backend
| Layer | Technology |
|-------|------------|
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Validation | Zod |

### Infrastructure
| Layer | Technology |
|-------|------------|
| Hosting | Vercel |
| Database | Supabase |
| Storage | Supabase Storage |
| AI | OpenAI, Claude, Gemini |

---

## Module Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages
│   ├── employee/                 # Employee portal
│   │   ├── recruiting/           # ATS module
│   │   ├── bench/                # Bench sales
│   │   ├── hr/                   # HR module
│   │   └── admin/                # Admin
│   ├── academy/                  # Academy portal
│   ├── client/                   # Client portal
│   └── talent/                   # Talent portal
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── screens/                  # Screen renderers
│   ├── recruiting/               # ATS components
│   ├── crm/                      # CRM components
│   └── academy/                  # Academy components
│
├── lib/
│   ├── db/
│   │   └── schema/               # Drizzle schemas
│   │       ├── ats.ts
│   │       ├── crm.ts
│   │       ├── academy.ts
│   │       └── workplan.ts       # Workplan system
│   │
│   ├── entities/                 # Entity configurations
│   │   ├── crm/
│   │   │   ├── lead.entity.ts
│   │   │   └── deal.entity.ts
│   │   └── ats/
│   │       ├── job.entity.ts
│   │       └── submission.entity.ts
│   │
│   ├── validations/              # Zod schemas
│   └── workplan/                 # Workplan helpers
│
├── server/
│   └── routers/                  # tRPC routers
│       ├── ats.ts
│       ├── crm.ts
│       ├── activities.ts
│       └── workplan.ts
│
├── screens/                      # Screen definitions
│   ├── crm/
│   │   ├── lead-list.screen.ts
│   │   └── lead-detail.screen.ts
│   └── ats/
│       ├── job-list.screen.ts
│       └── job-detail.screen.ts
│
├── hooks/
│   ├── queries/                  # React Query hooks
│   └── mutations/                # Mutation hooks
│
└── stores/                       # Client state (Zustand)
```

---

## Security & Multi-Tenancy

### Organization Isolation

Every database query MUST include `orgId`:

```typescript
// Required pattern
const items = await db.query.leads.findMany({
  where: and(
    eq(leads.orgId, ctx.user.orgId),  // REQUIRED
    isNull(leads.deletedAt),           // Soft delete
    // ... other conditions
  ),
});
```

### Authentication Flow

```
┌─────────────────┐
│ Supabase Auth   │
│ (JWT)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auth Middleware │
│ (verify JWT)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Org Middleware  │
│ (load org)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RBAC Middleware │
│ (check perms)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Procedure       │
│ (execute)       │
└─────────────────┘
```

### Role-Based Access Control

```typescript
// Permission check in procedure
if (!ctx.user.permissions.includes('leads:create')) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Entity Config as SSOT | Consistency across layers, reduces drift |
| Workplan System | Guidewire-proven pattern for workflow management |
| Metadata-Driven UI | Reduces boilerplate, ensures consistency |
| tRPC | Type safety end-to-end, great DX |
| Drizzle ORM | Type-safe SQL, better than Prisma for complex queries |
| Soft Deletes | Audit trail, data recovery, compliance |
| Multi-tenant by default | Enterprise requirement, built-in from start |

---

## Related Documents

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Step-by-step plan
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Cheat sheet
- [CONVERSION-PLAYBOOK.md](./CONVERSION-PLAYBOOK.md) - Entity conversion guide
- [DATABASE-ARCHITECTURE.md](./DATABASE-ARCHITECTURE.md) - Database details
