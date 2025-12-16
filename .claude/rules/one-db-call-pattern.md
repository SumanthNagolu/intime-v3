# One Database Call Pattern (NON-NEGOTIABLE)

## Critical Rule

**Every detail page MUST make exactly ONE database call.**

This is a **NON-NEGOTIABLE** architectural requirement. Violations cause:
- 3-10x slower page loads
- Redundant database queries
- Wasted server resources
- Poor user experience

---

## The Pattern

```
┌──────────────────────────────────────────────────────────────────┐
│                     DETAIL PAGE ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. layout.tsx (Server Component)                                │
│     └─> getFullEntity({ id })  ← ONE DATABASE CALL               │
│         └─> EntityContextProvider(initialData)                    │
│                                                                   │
│  2. page.tsx (Client Component)                                  │
│     └─> useEntityData() ← Gets data from context                 │
│     └─> EntityDetailView(entity={data})                          │
│                                                                   │
│  3. EntityDetailView                                             │
│     └─> useEntityQuery(enabled: false) ← SKIPS query             │
│     └─> Uses entity prop from server                             │
│                                                                   │
│  4. Sidebar                                                      │
│     └─> useEntityData() ← Gets data from context                 │
│     └─> NO separate query                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Requirements

### 1. Server Layout: Fetch ONCE

```typescript
// src/app/employee/[module]/[entity]/[id]/layout.tsx
export default async function EntityLayout({ children, params }) {
  const { id } = await params
  const caller = await getServerCaller()

  // ONE DATABASE CALL: Fetch entity with ALL section data
  const entity = await caller.[module].[entity].getFullEntity({ id })

  return (
    <EntityContextProvider
      entityType="[entity]"
      entityId={id}
      entityName={entity.name}
      entityStatus={entity.status}
      initialData={entity}  // Pass full data to context
    >
      {children}
    </EntityContextProvider>
  )
}
```

### 2. Client Page: Use Context

```typescript
// src/app/employee/[module]/[entity]/[id]/page.tsx
'use client'

export default function EntityPage() {
  // Get data from server-side context - NO client query
  const entityData = useEntityData<Entity>()
  const entity = entityData?.data

  return (
    <EntityDetailView
      config={entityDetailConfig}
      entityId={entityId}
      entity={entity}  // Pass entity to skip client query
    />
  )
}
```

### 3. Config: Support Query Skip

```typescript
// src/configs/entities/[entity].config.ts
export const entityDetailConfig: DetailViewConfig<Entity> = {
  // ...
  useEntityQuery: (entityId, options) => trpc.[module].[entity].getFullEntity.useQuery(
    { id: entityId },
    {
      // Skip query when entity already provided from server
      enabled: options?.enabled ?? true,
    }
  ),
}
```

### 4. Sidebar: Use Navigation Context

Sidebars are rendered by `SidebarLayout` which is **outside** the `EntityContextProvider`. They cannot use `useEntityData()`.

**Solution**: Use `currentEntityData` from `EntityNavigationContext`:

```typescript
export function EntitySidebar({ entityId }) {
  // ONE DB CALL pattern: Get data from navigation context - NO query needed
  // Data is set by EntityContextProvider from server-side fetch
  const { currentEntityData } = useEntityNavigation()
  const entity = currentEntityData as EntityType | null

  // Use entity.sections for counts, etc.
}
```

**Why this works**: `EntityContextProvider` sets `currentEntityData` from the server-fetched `initialData`. Since `EntityNavigationContext` wraps the entire app (in root layout), the sidebar can access it.

**Result**: Exactly 1 server-side database call. NO client-side queries.

---

## Backend: getFullEntity Procedure

Each entity must have a `getFullEntity` procedure that returns ALL data needed by the detail page in ONE query:

```typescript
getFullEntity: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Fetch entity and all section data in parallel
    const [entity, prospects, leads, activities, notes, documents] = await Promise.all([
      // Main entity
      adminClient.from('entities').select('*').eq('id', input.id).single(),
      // Section data
      adminClient.from('prospects').select('*').eq('entity_id', input.id).limit(100),
      adminClient.from('leads').select('*').eq('entity_id', input.id).limit(100),
      adminClient.from('activities').select('*').eq('entity_id', input.id).limit(100),
      adminClient.from('notes').select('*').eq('entity_id', input.id).limit(50),
      adminClient.from('documents').select('*').eq('entity_id', input.id).limit(50),
    ])

    return {
      ...entity.data,
      sections: {
        prospects: { items: prospects.data, total: prospects.count },
        leads: { items: leads.data, total: leads.count },
        activities: { items: activities.data, total: activities.count },
        notes: { items: notes.data, total: notes.count },
        documents: { items: documents.data, total: documents.count },
      },
    }
  }),
```

---

## Forbidden Patterns

### DO NOT: Multiple queries for same entity

```typescript
// WRONG: 3 different calls for same data
const campaign = await caller.crm.campaigns.getById({ id })           // Query 1
const counts = await caller.crm.campaigns.getCounts({ id })           // Query 2
const sections = await caller.crm.campaigns.getSections({ id })       // Query 3
```

### DO NOT: Client components making independent queries

```typescript
// WRONG: Sidebar makes its own query
export function Sidebar({ entityId }) {
  const { data } = trpc.crm.campaigns.getById.useQuery({ id: entityId })  // BAD
}
```

### DO NOT: Page re-fetching server data

```typescript
// WRONG: Page queries despite layout already fetching
export default function Page() {
  const { data } = trpc.crm.campaigns.getByIdWithCounts.useQuery({ id })  // BAD
}
```

---

## Validation Checklist

Before any detail page PR is merged:

- [ ] Layout calls exactly ONE `getFullEntity` procedure
- [ ] Page uses `useEntityData()` from context
- [ ] Page passes `entity` prop to `EntityDetailView`
- [ ] Sidebar uses `useEntityNavigation().currentEntityData`
- [ ] Config's `useEntityQuery` has `enabled: options?.enabled ?? true`
- [ ] No tRPC queries in client components for entity data
- [ ] Network tab shows exactly ONE API call for entity data (server-side only)

---

## Performance Impact

| Metric | Before (Multiple Calls) | After (Optimized) |
|--------|------------------------|-------------------|
| API requests | 3-4 | 1 (server only) |
| Database queries | 10-15 (many duplicate) | 5-8 (parallel, no duplication) |
| Time to interactive | 4-7s | 1-2s |
| Server load | 3-4x | 1x |

**Note**: The sidebar accesses data via `EntityNavigationContext.currentEntityData` which is set by `EntityContextProvider` from the server-side fetch. No client-side queries are needed.

---

## Applying to Other Entities

When creating or updating detail pages for any entity:

1. **Create `getFullEntity` procedure** in the entity's router
2. **Update layout.tsx** to use `getFullEntity` and pass `initialData`
3. **Update page.tsx** to use `useEntityData()` and pass `entity` prop
4. **Update sidebar** to use `useEntityData()` instead of querying
5. **Update config** to accept `enabled` option in `useEntityQuery`

---

## Related Files

| Purpose | Location |
|---------|----------|
| Context Provider | `src/components/layouts/EntityContextProvider.tsx` |
| Detail View | `src/components/pcf/detail-view/EntityDetailView.tsx` |
| Type Definition | `src/configs/entities/types.ts` (useEntityQuery type) |
| Example Implementation | `src/app/employee/crm/campaigns/[id]/` |
