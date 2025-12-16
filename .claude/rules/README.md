# Project Rules

This directory contains architecture rules and guidelines for the InTime v3 codebase. All agents should follow these rules when working on the project.

## NON-NEGOTIABLE Rules

These rules are **absolute requirements** - never violate them:

| Rule | File | Summary |
|------|------|---------|
| **One Database Call** | `one-db-call-pattern.md` | Every detail page makes exactly ONE API call |

## Rule Files

| File | Purpose |
|------|---------|
| `one-db-call-pattern.md` | **NON-NEGOTIABLE**: One database call per detail page pattern |
| `ui-design-system.md` | Premium Minimalist Design System (colors, typography, spacing, components) |
| `ui-per-role.md` | Role-specific UI patterns and layouts |
| `backend-architecture.md` | tRPC patterns, database access, events, services |
| `typescript-patterns.md` | TypeScript conventions, React patterns, file organization |
| `database-patterns.md` | Schema design, queries, migrations, indexing |

## Quick Reference

### One Database Call Pattern (NON-NEGOTIABLE)
- Layout calls `getFullEntity({ id })` ONCE
- Page uses `useEntityData()` from context
- Sidebar uses `useEntityNavigation().currentEntityData`
- NO independent client queries for entity data

### Design System
- **Background**: `bg-cream` (#FDFBF7)
- **Cards**: `bg-white` with `shadow-elevation-sm`
- **Primary**: `hublot-900` (#000000) - pure black
- **Accent**: `gold-500` (#C9A961) - warm gold
- **Headlines**: `font-heading` (Raleway) - geometric sans-serif

### Backend
- Filter all queries by `org_id`
- Use soft deletes (`deleted_at`)
- Emit events for business actions
- Use `orgProtectedProcedure` for tRPC

### TypeScript
- Use Zod for runtime validation
- Use explicit return types
- Use path aliases (`@/`)
- Use named exports

## When to Read Which Rule

| Task | Read |
|------|------|
| **Creating/modifying detail pages** | `one-db-call-pattern.md` (ALWAYS) |
| Building UI components | `ui-design-system.md` |
| Creating role-specific screens | `ui-per-role.md` |
| Writing tRPC procedures | `backend-architecture.md` |
| Database queries/migrations | `database-patterns.md` |
| General TypeScript code | `typescript-patterns.md` |

## Rule Priority

If rules conflict, follow this priority:
1. **One Database Call pattern** (non-negotiable for performance)
2. Security (never compromise)
3. Backend patterns (data integrity)
4. TypeScript patterns (code quality)
5. UI patterns (consistency)
