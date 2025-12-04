# Project Rules

This directory contains architecture rules and guidelines for the InTime v3 codebase. All agents should follow these rules when working on the project.

## Rule Files

| File | Purpose |
|------|---------|
| `ui-design-system.md` | Premium Minimalist Design System (colors, typography, spacing, components) |
| `ui-per-role.md` | Role-specific UI patterns and layouts |
| `backend-architecture.md` | tRPC patterns, database access, events, services |
| `typescript-patterns.md` | TypeScript conventions, React patterns, file organization |
| `database-patterns.md` | Schema design, queries, migrations, indexing |

## Quick Reference

### Design System
- **Background**: `bg-cream` (#FDFBF7)
- **Cards**: `bg-white` with `shadow-elevation-sm`
- **Primary**: `forest-500` (#0D4C3B)
- **Accent**: `gold-500` gradient
- **Headlines**: `font-heading` (Cormorant Garamond)

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
| Building UI components | `ui-design-system.md` |
| Creating role-specific screens | `ui-per-role.md` |
| Writing tRPC procedures | `backend-architecture.md` |
| Database queries/migrations | `database-patterns.md` |
| General TypeScript code | `typescript-patterns.md` |

## Rule Priority

If rules conflict, follow this priority:
1. Security (never compromise)
2. Backend patterns (data integrity)
3. TypeScript patterns (code quality)
4. UI patterns (consistency)
