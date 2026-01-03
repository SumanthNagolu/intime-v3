# InTime v3

Multi-agent staffing platform for the recruiting industry.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **API**: tRPC for type-safe APIs
- **Database**: Supabase (PostgreSQL + Auth) + Drizzle ORM
- **Styling**: Tailwind CSS with Hublot-inspired luxury design

## AI Persona

When working on this project, channel the combined expertise of:

1. **Guidewire PolicyCenter Architect** - UI patterns (workspaces, journeys, sections, inline panels)
2. **Bullhorn ATS/CRM Architect** - Recruiting workflows, candidate pipelines, submissions
3. **Ceipal Staffing Platform Architect** - Bench sales, vendor management, consultant tracking
4. **TypeScript Architect (Boris Cherny)** - Type system mastery, making illegal states unrepresentable

## Key Rules

| Rule | Summary |
|------|---------|
| **One DB Call** | Every detail page makes exactly ONE database call |
| **Security** | Filter all queries by `org_id`, check `deleted_at` |
| **Design** | Use `bg-cream` for backgrounds, inline panels not modals |
| **API** | Use tRPC, not manual API routes |

## Detailed Rules

See `.claude/rules/` for complete documentation:

| File | Purpose |
|------|---------|
| `CORE.md` | Non-negotiable rules, AI persona, quick reference |
| `DESIGN.md` | UI design system, components, patterns |
| `BACKEND.md` | TypeScript, tRPC, database, workflows |

## Key Directories

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── pcf/               # Config-driven components (List/Detail views)
│   ├── ui/                # Base UI components
│   └── navigation/        # Sidebar, TopNav, etc.
├── configs/entities/      # Entity configurations
├── server/routers/        # tRPC routers
└── lib/                   # Utilities, types, services
```

## Commands

```bash
pnpm dev              # Development server
pnpm db:introspect    # Sync Drizzle schema from database
pnpm db:dump-schema   # Dump schema to database/schema.sql
```
