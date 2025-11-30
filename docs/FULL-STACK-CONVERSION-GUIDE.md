# Full-Stack Conversion Guide

Complete workflow for converting InTime v3 to the metadata-driven architecture, ensuring sync across all layers.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ Screen Defs     │───▶│ ScreenRenderer  │───▶│ React UI    │  │
│  │ (TypeScript)    │    │ (Metadata)      │    │ (Components)│  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│           │                                                      │
│           │ Field paths, entity types, procedures                │
│           ▼                                                      │
├─────────────────────────────────────────────────────────────────┤
│                         ENTITY LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Entity Configs (src/lib/entities/*)                         ││
│  │ - Field definitions with types, validation                  ││
│  │ - Relations mapping                                         ││
│  │ - Procedure names                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│           │                                                      │
│           │ Generates/informs                                    │
│           ▼                                                      │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ Zod Schemas     │───▶│ tRPC Routers    │───▶│ Drizzle ORM │  │
│  │ (Validation)    │    │ (API Layer)     │    │ (DB Access) │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                       │          │
├───────────────────────────────────────────────────────┼─────────┤
│                         DATABASE                       │          │
│  ┌─────────────────────────────────────────────────────┘        │
│  │ PostgreSQL (Supabase)                                        │
│  │ - Tables match entity configs                                │
│  │ - Columns match field definitions                            │
│  └──────────────────────────────────────────────────────────────┘
```

---

## Conversion Order

### Recommended Approach: Entity by Entity

For each entity, complete ALL layers before moving to the next:

```
Entity → DB Schema → Entity Config → Zod Schemas → tRPC Router → Frontend Screens
```

### Phase 1: CRM Module (Foundation)

| Order | Entity | DB | Config | Zod | tRPC | Screens |
|-------|--------|-----|--------|-----|------|---------|
| 1 | Lead | ✅ | ✅ | 🔄 | 🔄 | ✅ |
| 2 | Account | ✅ | ⬜ | 🔄 | 🔄 | ⬜ |
| 3 | Deal | ✅ | ⬜ | 🔄 | 🔄 | ⬜ |
| 4 | Contact | ✅ | ⬜ | 🔄 | 🔄 | ⬜ |
| 5 | Activity | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |

### Phase 2: ATS Module (Core Business)

| Order | Entity | DB | Config | Zod | tRPC | Screens |
|-------|--------|-----|--------|-----|------|---------|
| 6 | Job | ✅ | ⬜ | 🔄 | ✅ | ⬜ |
| 7 | Talent | ✅ | ⬜ | 🔄 | ✅ | ⬜ |
| 8 | Submission | ✅ | ⬜ | 🔄 | ✅ | ⬜ |
| 9 | Interview | ✅ | ⬜ | ⬜ | 🔄 | ⬜ |
| 10 | Offer | ✅ | ⬜ | ⬜ | 🔄 | ⬜ |
| 11 | Placement | ✅ | ⬜ | ⬜ | 🔄 | ⬜ |

### Phase 3: Remaining Modules

| Module | Entities |
|--------|----------|
| Bench Sales | Consultant, VendorSubmission |
| Academy | Course, Enrollment, Certificate |
| HR | Employee, Department |

---

## Per-Entity Workflow

### Step 1: Verify Database Schema

```bash
# Check existing schema
grep -A 50 "export const [table]" src/lib/db/schema/[domain].ts
```

Ensure:
- All needed columns exist
- Types are correct
- Indexes for common queries

### Step 2: Create Entity Config

```bash
# Create entity config file
/sync-entity [entity-name]
```

File: `src/lib/entities/[domain]/[entity].entity.ts`

### Step 3: Align Zod Schemas

Create/update: `src/lib/validations/[entity].ts`

```typescript
// Must match entity config fields exactly
export const [entity]Schema = z.object({ ... });
export const create[Entity]Input = ...;
export const update[Entity]Input = ...;
export const list[Entities]Input = ...;
```

### Step 4: Standardize tRPC Router

Verify all 5 procedures exist in `src/server/routers/[domain].ts`:
- `get[Entity]ById`
- `list[Entities]`
- `create[Entity]`
- `update[Entity]`
- `delete[Entity]`

### Step 5: Create Frontend Screens

```bash
# Convert list screen
/convert-to-metadata src/components/[domain]/[Entity]List.tsx

# Convert detail screen
/convert-to-metadata src/components/[domain]/[Entity]Detail.tsx
```

### Step 6: Update Trackers

Update both:
- `docs/BACKEND-SYNC-TRACKER.md`
- `docs/METADATA-UI-MIGRATION.md`

---

## Quick Commands

| Task | Command |
|------|---------|
| Sync entity (full stack) | `/sync-entity [entity]` |
| Convert screen to metadata | `/convert-to-metadata [path]` |
| Check entity status | View `docs/BACKEND-SYNC-TRACKER.md` |
| Check screen status | View `docs/METADATA-UI-MIGRATION.md` |

---

## File Locations

### Source of Truth Files

| Purpose | Location |
|---------|----------|
| DB Schema | `src/lib/db/schema/[domain].ts` |
| Entity Configs | `src/lib/entities/[domain]/[entity].entity.ts` |
| Zod Validations | `src/lib/validations/[entity].ts` |
| tRPC Routers | `src/server/routers/[domain].ts` |
| Screen Definitions | `src/screens/[domain]/[entity]-*.screen.ts` |

### Documentation & Rules

| Purpose | Location |
|---------|----------|
| Frontend Rules | `.claude/rules/frontend-architecture.md` |
| Backend Rules | `.claude/rules/backend-architecture.md` |
| Frontend Tracker | `docs/METADATA-UI-MIGRATION.md` |
| Backend Tracker | `docs/BACKEND-SYNC-TRACKER.md` |

### Reusable Components

| Purpose | Location |
|---------|----------|
| InputSets | `src/lib/metadata/inputsets/` |
| Display Widgets | `src/lib/metadata/widgets/display/` |
| Input Widgets | `src/lib/metadata/widgets/input/` |
| Renderers | `src/lib/metadata/renderers/` |

---

## Validation Checklist

Before marking an entity as complete:

- [ ] **Database**: Schema matches entity config
- [ ] **Entity Config**: All fields defined with correct types
- [ ] **Zod Schemas**: Match entity config exactly
- [ ] **tRPC Router**: All 5 standard procedures exist
- [ ] **Frontend List**: Screen definition created
- [ ] **Frontend Detail**: Screen definition created
- [ ] **Integration**: Screens render correctly with real data
- [ ] **Edit Mode**: Forms submit and save correctly
- [ ] **Trackers Updated**: Both tracker files updated

---

## Common Issues & Solutions

### Field Type Mismatch

**Symptom**: Data doesn't display correctly or validation fails

**Solution**: Cross-check field type in:
1. DB schema (Drizzle type)
2. Entity config (field type)
3. Zod schema (z.* type)
4. Screen definition (fieldType)

### Missing Procedure

**Symptom**: Frontend can't fetch/save data

**Solution**: Add missing tRPC procedure following template in backend rules

### Enum Options Mismatch

**Symptom**: Dropdown shows wrong options or badge colors wrong

**Solution**: Ensure enum options are identical in:
1. Entity config
2. Zod schema
3. Screen definition field config

---

## Next Steps

1. **Start with Lead** - Already has template, verify all layers work
2. **Then Account** - Similar structure, builds on Lead patterns
3. **Then Deal** - Adds pipeline/stage patterns
4. **Then Job** - Core ATS entity, complex but critical
5. **Then Talent** - Most complex entity, lots of fields

Start simple, validate each layer, then move to next entity.
