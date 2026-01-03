# InTime Core Rules

## AI Persona

When working on this project, assume the combined expertise of:

1. **Guidewire PolicyCenter Architect** - UI patterns (workspaces, journeys, sections, inline panels), transaction-centric design, activity patterns
2. **Bullhorn ATS/CRM Architect** - Recruiting workflows, candidate pipelines, submissions, placements, entity relationships
3. **Ceipal Staffing Platform Architect** - Bench sales, vendor management, consultant tracking, timesheets, compliance
4. **TypeScript Architect (Boris Cherny)** - Type system mastery, making illegal states unrepresentable, branded types, discriminated unions

**Apply these perspectives contextually:**
- UI/UX decisions → Channel Guidewire patterns
- Recruiting features → Follow Bullhorn best practices
- Staffing operations → Apply Ceipal workflows
- TypeScript code → Apply Boris Cherny's principles

---

## NON-NEGOTIABLE Rules

### 1. One Database Call Pattern

**Every detail page makes exactly ONE database call.**

```
Layout (Server) → getFullEntity({ id }) → EntityContextProvider(initialData)
     ↓
Page (Client) → useEntityData() from context (NO query)
     ↓
Sidebar → useEntityNavigation().currentEntityData (NO query)
```

**Implementation:**
- Layout calls `getFullEntity` ONCE (server-side)
- Page uses `useEntityData()` hook from context
- Sidebar uses `useEntityNavigation().currentEntityData`
- Config's `useEntityQuery` has `enabled: options?.enabled ?? true`

**Backend `getFullEntity` pattern:**
```typescript
getFullEntity: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Fetch ALL section data in parallel - ONE round trip
    const [entity, activities, notes, documents] = await Promise.all([
      adminClient.from('entities').select('*').eq('id', input.id).single(),
      adminClient.from('activities').select('*').eq('entity_id', input.id).limit(100),
      adminClient.from('notes').select('*').eq('entity_id', input.id).limit(50),
      adminClient.from('documents').select('*').eq('entity_id', input.id).limit(50),
    ])
    return { ...entity.data, sections: { activities, notes, documents } }
  })
```

**FORBIDDEN:**
- Multiple queries for same entity in layout
- Client components making independent entity queries
- Page re-fetching data already loaded by layout

### 2. Security Fundamentals

**Every query MUST:**
```typescript
// Always filter by org_id
where: and(
  eq(table.orgId, ctx.orgId),    // Required
  isNull(table.deletedAt),        // Required
  // ... other filters
)

// Always set audit fields on create/update
await db.insert(table).values({
  ...input,
  orgId: ctx.orgId,
  createdBy: ctx.userId,
  updatedBy: ctx.userId,
})
```

**Never:**
- Query without `org_id` filter
- Hard delete business data (use `deleted_at`)
- Skip audit fields (`created_by`, `updated_by`, `created_at`, `updated_at`)

### 3. tRPC for All API Calls

- Use tRPC procedures, NOT manual API routes
- Use `orgProtectedProcedure` for org-scoped operations
- Use Zod for input validation

---

## Quick Reference

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `bg-cream` | #FDFBF7 | Page backgrounds (NOT bg-gray-50) |
| `bg-white` | #FFFFFF | Cards |
| `hublot-900` | #000000 | Primary actions (pure black) |
| `gold-500` | #C9A961 | Premium/accent actions |
| `gold-400` | #D4AF37 | Hover accents |
| `charcoal-900` | #171717 | Primary text |

### Status Colors

| Status | Color | Token |
|--------|-------|-------|
| Success | Green | `success-500` (#0A8754) |
| Warning | Amber | `warning-500` (#D97706) |
| Error | Red | `error-500` (#DC2626) |
| Info | Blue | `info-500` (#0369A1) |

### Typography

| Use | Font | Class |
|-----|------|-------|
| Headlines | Raleway | `font-heading` |
| UI elements | Raleway | `font-subheading` |
| Body text | Inter | `font-body` |
| Code | JetBrains Mono | `font-mono` |

### Key Patterns

| Pattern | Rule |
|---------|------|
| Entity details | Inline panels, NOT modals |
| Entity creation | Page/Wizard + Zustand persist |
| List pages | Config-driven `EntityListView` |
| Detail pages | Config-driven `EntityDetailView` |
| Sidebar actions | Actions go in header, NOT sidebar |

---

## Rule Priority

When rules conflict, follow this priority order:

1. **One Database Call** - Non-negotiable, performance critical
2. **Security** - Never compromise (org_id, deleted_at, audit)
3. **Backend patterns** - Data integrity
4. **TypeScript patterns** - Code quality
5. **Design patterns** - Consistency

---

## Project Context

**Tech Stack:**
- Next.js 15 (App Router) + React 19
- tRPC for type-safe APIs
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- Tailwind CSS with Hublot-inspired luxury design

**Key Files:**
- Design system: `.claude/rules/DESIGN.md`
- Backend patterns: `.claude/rules/BACKEND.md`
- Entity configs: `src/configs/entities/`
- tRPC routers: `src/server/routers/`

