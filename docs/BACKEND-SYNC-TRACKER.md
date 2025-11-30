# Backend & Database Sync Tracker

Track alignment between database schema, entity configs, tRPC routers, and frontend screens.

---

## Sync Checklist Per Entity

For each entity, ensure these are aligned:

| Layer | File | Status |
|-------|------|--------|
| Database Schema | `src/lib/db/schema/[domain].ts` | |
| Entity Config | `src/lib/entities/[domain]/[entity].entity.ts` | |
| Zod Validation | `src/lib/validations/[entity].ts` | |
| tRPC Router | `src/server/routers/[domain].ts` | |
| Frontend Screen | `src/screens/[domain]/[entity]-*.screen.ts` | |

---

## CRM Module

### Lead
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `src/lib/db/schema/crm.ts` |
| Entity Config | ✅ Created | `src/lib/entities/crm/lead.entity.ts` |
| Zod Validation | 🔄 Partial | Needs alignment with entity config |
| tRPC Router | ✅ Exists | `src/server/routers/crm.ts` - needs standardization |
| Frontend Screens | ✅ Created | `lead-list.screen.ts`, `lead-detail.screen.ts` |

### Account
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `src/lib/db/schema/crm.ts` |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | Needs standardization |
| Frontend Screens | ⬜ Not Started | |

### Deal
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `src/lib/db/schema/crm.ts` |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | Needs standardization |
| Frontend Screens | ⬜ Not Started | |

### Contact (POC)
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `point_of_contacts` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | |
| Frontend Screens | ⬜ Not Started | |

### Activity
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `activity_log` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | ⬜ Not Started | |
| tRPC Router | ⬜ Not Started | |
| Frontend Screens | ⬜ Not Started | |

---

## ATS (Recruiting) Module

### Job
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `src/lib/db/schema/ats.ts` |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | |
| Frontend Screens | ⬜ Not Started | |

### Talent (Candidate)
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `candidates` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | |
| Frontend Screens | ⬜ Not Started | |

### Submission
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `submissions` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | 🔄 Partial | |
| tRPC Router | ✅ Exists | |
| Frontend Screens | ⬜ Not Started | |

### Interview
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `interviews` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | ⬜ Not Started | |
| tRPC Router | 🔄 Partial | |
| Frontend Screens | ⬜ Not Started | |

### Offer
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `offers` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | ⬜ Not Started | |
| tRPC Router | 🔄 Partial | |
| Frontend Screens | ⬜ Not Started | |

### Placement
| Component | Status | Notes |
|-----------|--------|-------|
| DB Schema | ✅ Exists | `placements` table |
| Entity Config | ⬜ Not Started | |
| Zod Validation | ⬜ Not Started | |
| tRPC Router | 🔄 Partial | |
| Frontend Screens | ⬜ Not Started | |

---

## Standard tRPC Procedures Checklist

For each entity, ensure these standard procedures exist:

| Procedure | Pattern | Lead | Account | Deal | Job | Talent | Submission |
|-----------|---------|------|---------|------|-----|--------|------------|
| Get by ID | `get[Entity]ById` | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| List | `list[Entities]` | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| Create | `create[Entity]` | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| Update | `update[Entity]` | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| Delete | `delete[Entity]` | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| Bulk Assign | `bulkAssign[Entities]` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bulk Status | `bulkUpdate[Entity]Status` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Validation Schema Alignment

Each entity should have these Zod schemas:

| Schema | Purpose | Lead | Account | Deal | Job | Talent |
|--------|---------|------|---------|------|-----|--------|
| `[entity]Schema` | Full entity | 🔄 | ⬜ | ⬜ | 🔄 | 🔄 |
| `create[Entity]Input` | Create operation | 🔄 | ⬜ | ⬜ | 🔄 | 🔄 |
| `update[Entity]Input` | Update operation | 🔄 | ⬜ | ⬜ | 🔄 | 🔄 |
| `list[Entities]Input` | List with filters | 🔄 | ⬜ | ⬜ | 🔄 | 🔄 |
| `list[Entities]Output` | Paginated response | 🔄 | ⬜ | ⬜ | 🔄 | 🔄 |

---

## Field Type Alignment Check

Verify these match across layers:

| Frontend Field | Entity Config | Drizzle Type | Zod Type |
|----------------|---------------|--------------|----------|
| `text` | `text` | `text()` | `z.string()` |
| `email` | `email` | `text()` | `z.string().email()` |
| `currency` | `currency` | `numeric(12,2)` | `z.string()` |
| `enum` | `enum` + options | `text()` | `z.enum([...])` |
| `date` | `date` | `date()` | `z.date()` |
| `datetime` | `timestamp` | `timestamp()` | `z.date()` |
| `select` (FK) | `uuid` + references | `uuid()` | `z.string().uuid()` |

---

## Progress Summary

| Module | Entities | Schema Done | Config Done | Router Done | Screens Done |
|--------|----------|-------------|-------------|-------------|--------------|
| CRM | 5 | 5/5 | 1/5 | 3/5 | 2/5 |
| ATS | 6 | 6/6 | 0/6 | 4/6 | 0/6 |
| Bench | 2 | 2/2 | 0/2 | 1/2 | 0/2 |
| Academy | 4 | 4/4 | 0/4 | 2/4 | 0/4 |

---

## Conversion Workflow

### Per-Entity Steps

1. **Verify DB Schema** - Check `src/lib/db/schema/[domain].ts`
2. **Create Entity Config** - `src/lib/entities/[domain]/[entity].entity.ts`
3. **Align Zod Schemas** - `src/lib/validations/[entity].ts`
4. **Standardize tRPC Router** - Follow patterns in backend-architecture.md
5. **Create Frontend Screens** - Use `/convert-to-metadata` command

### Quick Command

```
/sync-entity [entity-name]
```

This will:
1. Read existing DB schema
2. Generate/update entity config
3. Generate Zod validation schemas
4. Verify tRPC procedures exist
5. Flag any misalignments

---

## Status Legend

- ✅ Complete & Aligned
- 🔄 Exists but needs alignment
- ⬜ Not Started
- ❌ Has issues
