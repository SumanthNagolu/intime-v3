# Complete Documentation Index

**Last Updated:** 2025-11-20  
**Total Folders Documented:** 95  
**Coverage Level:** Maximum Granularity ✅

---

## 📚 Quick Navigation

- [Project-Wide Docs](#project-wide-documentation)
- [Strategic Level](#-strategic-level-6-folders) (6 folders)
- [Tactical Level](#-tactical-level) (domain modules)
- [Operational Level](#-operational-level) (specific components)
- [Update Commands](#-updating-documentation)

---

## 📚 Project-Wide Documentation

- [/CLAUDE.md](/CLAUDE.md) - Main project instructions for AI agents
- [/PROJECT-STRUCTURE.md](/PROJECT-STRUCTURE.md) - Complete project overview
- [/.claude/orchestration/FILE-STRUCTURE.md](/.claude/orchestration/FILE-STRUCTURE.md) - File-level docs
- [/.claude/CLEANUP-SUMMARY.md](/.claude/CLEANUP-SUMMARY.md) - Recent cleanup
- [/.claude/FOLDER-DOCS-IMPLEMENTATION.md](/.claude/FOLDER-DOCS-IMPLEMENTATION.md) - This system

---

## 🎯 Strategic Level (3 folders)

High-level, project-wide context:

### Claude Code Configuration
**Path:** `.claude/`  
**Purpose:** Complete AI agent system configuration including agents, workflows, and orchestration.

📄 [View CLAUDE.md](.claude/CLAUDE.md)

### Project Documentation
**Path:** `docs/`  
**Purpose:** Complete project documentation including requirements, architecture, and implementation guides.

📄 [View CLAUDE.md](docs/CLAUDE.md)

### Source Code
**Path:** `src/`  
**Purpose:** Next.js 15 application source code including app router, components, and utilities.

📄 [View CLAUDE.md](src/CLAUDE.md)

---

## 📊 Tactical Level (9 folders)

Domain-level modules:

### AI Agent Definitions
**Path:** `.claude/agents/`  
**Purpose:** 8 specialist agents organized by function (strategic, planning, implementation, operations, quality).

📄 [View CLAUDE.md](.claude/agents/CLAUDE.md)

### Multi-Agent Orchestration System
**Path:** `.claude/orchestration/`  
**Purpose:** Core engine that orchestrates multiple AI agents in sequential and parallel workflows.

📄 [View CLAUDE.md](.claude/orchestration/CLAUDE.md)

### Workflow Commands
**Path:** `.claude/commands/`  
**Purpose:** Slash commands that trigger multi-agent workflows (/feature, /database, /test, /deploy).

📄 [View CLAUDE.md](.claude/commands/CLAUDE.md)

### Next.js App Router
**Path:** `src/app/`  
**Purpose:** Next.js 15 app directory with server components, layouts, and routing.

📄 [View CLAUDE.md](src/app/CLAUDE.md)

### React Components
**Path:** `src/components/`  
**Purpose:** Reusable React components built with shadcn/ui and Tailwind CSS.

📄 [View CLAUDE.md](src/components/CLAUDE.md)

### Core Libraries
**Path:** `src/lib/`  
**Purpose:** Shared utilities, helpers, and business logic used across the application.

📄 [View CLAUDE.md](src/lib/CLAUDE.md)

### Audit Documentation
**Path:** `docs/audit/`  
**Purpose:** Requirements analysis, architecture decisions, and implementation guides from initial audit.

📄 [View CLAUDE.md](docs/audit/CLAUDE.md)

### Server
**Path:** `src/server/`  
**Purpose:** Application server module.

📄 [View CLAUDE.md](src/server/CLAUDE.md)

### Types
**Path:** `src/types/`  
**Purpose:** Application types module.

📄 [View CLAUDE.md](src/types/CLAUDE.md)

---

## ⚙️ Operational Level (83 folders)

Specific components and implementations:

#### .claude/orchestration/

- **Core Components** (`.claude/orchestration/core/`)  
  Core orchestration system components that power the multi-agent workflow engine.  
  📄 [View CLAUDE.md](.claude/orchestration/core/CLAUDE.md)

- **Cli** (`.claude/orchestration/cli/`)  
  Orchestration system cli components.  
  📄 [View CLAUDE.md](.claude/orchestration/cli/CLAUDE.md)

- **Scripts** (`.claude/orchestration/scripts/`)  
  Orchestration system scripts components.  
  📄 [View CLAUDE.md](.claude/orchestration/scripts/CLAUDE.md)

- **Templates** (`.claude/orchestration/templates/`)  
  Orchestration system templates components.  
  📄 [View CLAUDE.md](.claude/orchestration/templates/CLAUDE.md)

- **Workflows** (`.claude/orchestration/workflows/`)  
  Orchestration system workflows components.  
  📄 [View CLAUDE.md](.claude/orchestration/workflows/CLAUDE.md)

#### .claude/agents/

- **Implementation** (`.claude/agents/implementation/`)  
  Implementation agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/implementation/CLAUDE.md)

- **Operations** (`.claude/agents/operations/`)  
  Operations agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/operations/CLAUDE.md)

- **Orchestration** (`.claude/agents/orchestration/`)  
  Orchestration agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/orchestration/CLAUDE.md)

- **Planning** (`.claude/agents/planning/`)  
  Planning agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/planning/CLAUDE.md)

- **Quality** (`.claude/agents/quality/`)  
  Quality agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/quality/CLAUDE.md)

- **Strategic** (`.claude/agents/strategic/`)  
  Strategic agents for the multi-agent orchestration system.  
  📄 [View CLAUDE.md](.claude/agents/strategic/CLAUDE.md)

#### .claude/commands/

- **Workflows** (`.claude/commands/workflows/`)  
  workflows module.  
  📄 [View CLAUDE.md](.claude/commands/workflows/CLAUDE.md)

#### .claude/

- **Hooks** (`.claude/hooks/`)  
  hooks module.  
  📄 [View CLAUDE.md](.claude/hooks/CLAUDE.md)

- **State** (`.claude/state/`)  
  state module.  
  📄 [View CLAUDE.md](.claude/state/CLAUDE.md)

#### .claude/hooks/

- **Scripts** (`.claude/hooks/scripts/`)  
  scripts module.  
  📄 [View CLAUDE.md](.claude/hooks/scripts/CLAUDE.md)

#### .claude/state/

- **Timeline** (`.claude/state/timeline/`)  
  timeline module.  
  📄 [View CLAUDE.md](.claude/state/timeline/CLAUDE.md)

#### docs/

- **Adrs** (`docs/adrs/`)  
  Documentation for adrs.  
  📄 [View CLAUDE.md](docs/adrs/CLAUDE.md)

- **Architecture** (`docs/architecture/`)  
  Documentation for architecture.  
  📄 [View CLAUDE.md](docs/architecture/CLAUDE.md)

- **Deployment** (`docs/deployment/`)  
  Documentation for deployment.  
  📄 [View CLAUDE.md](docs/deployment/CLAUDE.md)

- **Design** (`docs/design/`)  
  Documentation for design.  
  📄 [View CLAUDE.md](docs/design/CLAUDE.md)

- **Financials** (`docs/financials/`)  
  Documentation for financials.  
  📄 [View CLAUDE.md](docs/financials/CLAUDE.md)

- **Implementation** (`docs/implementation/`)  
  Documentation for implementation.  
  📄 [View CLAUDE.md](docs/implementation/CLAUDE.md)

- **Migration** (`docs/migration/`)  
  Documentation for migration.  
  📄 [View CLAUDE.md](docs/migration/CLAUDE.md)

- **Planning** (`docs/planning/`)  
  Documentation for planning.  
  📄 [View CLAUDE.md](docs/planning/CLAUDE.md)

- **Qa** (`docs/qa/`)  
  Documentation for qa.  
  📄 [View CLAUDE.md](docs/qa/CLAUDE.md)

- **Requirements** (`docs/requirements/`)  
  Documentation for requirements.  
  📄 [View CLAUDE.md](docs/requirements/CLAUDE.md)

- **Vision** (`docs/vision/`)  
  Documentation for vision.  
  📄 [View CLAUDE.md](docs/vision/CLAUDE.md)

#### docs/planning/

- **Ai use cases** (`docs/planning/ai-use-cases/`)  
  Documentation for ai-use-cases.  
  📄 [View CLAUDE.md](docs/planning/ai-use-cases/CLAUDE.md)

- **Epics** (`docs/planning/epics/`)  
  Documentation for epics.  
  📄 [View CLAUDE.md](docs/planning/epics/CLAUDE.md)

- **Sprints** (`docs/planning/sprints/`)  
  Documentation for sprints.  
  📄 [View CLAUDE.md](docs/planning/sprints/CLAUDE.md)

- **Stories** (`docs/planning/stories/`)  
  Documentation for stories.  
  📄 [View CLAUDE.md](docs/planning/stories/CLAUDE.md)

#### docs/planning/sprints/

- **Sprint 01** (`docs/planning/sprints/sprint-01/`)  
  Documentation for sprint-01.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-01/CLAUDE.md)

- **Sprint 02** (`docs/planning/sprints/sprint-02/`)  
  Documentation for sprint-02.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-02/CLAUDE.md)

- **Sprint 03** (`docs/planning/sprints/sprint-03/`)  
  Documentation for sprint-03.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-03/CLAUDE.md)

- **Sprint 04** (`docs/planning/sprints/sprint-04/`)  
  Documentation for sprint-04.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-04/CLAUDE.md)

- **Sprint 05** (`docs/planning/sprints/sprint-05/`)  
  Documentation for sprint-05.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-05/CLAUDE.md)

- **Sprint 06** (`docs/planning/sprints/sprint-06/`)  
  Documentation for sprint-06.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-06/CLAUDE.md)

- **Sprint 07** (`docs/planning/sprints/sprint-07/`)  
  Documentation for sprint-07.  
  📄 [View CLAUDE.md](docs/planning/sprints/sprint-07/CLAUDE.md)

#### docs/planning/stories/

- **Epic 01 foundation** (`docs/planning/stories/epic-01-foundation/`)  
  Documentation for epic-01-foundation.  
  📄 [View CLAUDE.md](docs/planning/stories/epic-01-foundation/CLAUDE.md)

- **Epic 02 training academy** (`docs/planning/stories/epic-02-training-academy/`)  
  Documentation for epic-02-training-academy.  
  📄 [View CLAUDE.md](docs/planning/stories/epic-02-training-academy/CLAUDE.md)

- **Epic 02.5 ai infrastructure** (`docs/planning/stories/epic-02.5-ai-infrastructure/`)  
  Documentation for epic-02.5-ai-infrastructure.  
  📄 [View CLAUDE.md](docs/planning/stories/epic-02.5-ai-infrastructure/CLAUDE.md)

#### src/app/

- **(auth)** (`src/app/(auth)/`)  
  Application (auth) module.  
  📄 [View CLAUDE.md](src/app/(auth)/CLAUDE.md)

- **Actions** (`src/app/actions/`)  
  Application actions module.  
  📄 [View CLAUDE.md](src/app/actions/CLAUDE.md)

- **Admin** (`src/app/admin/`)  
  Application admin module.  
  📄 [View CLAUDE.md](src/app/admin/CLAUDE.md)

- **Api** (`src/app/api/`)  
  Application api module.  
  📄 [View CLAUDE.md](src/app/api/CLAUDE.md)

- **Auth** (`src/app/auth/`)  
  Application auth module.  
  📄 [View CLAUDE.md](src/app/auth/CLAUDE.md)

- **Dashboard** (`src/app/dashboard/`)  
  Application dashboard module.  
  📄 [View CLAUDE.md](src/app/dashboard/CLAUDE.md)

- **Setup** (`src/app/setup/`)  
  Application setup module.  
  📄 [View CLAUDE.md](src/app/setup/CLAUDE.md)

#### src/app/(auth)/

- **Login** (`src/app/(auth)/login/`)  
  Application login module.  
  📄 [View CLAUDE.md](src/app/(auth)/login/CLAUDE.md)

- **Signup** (`src/app/(auth)/signup/`)  
  Application signup module.  
  📄 [View CLAUDE.md](src/app/(auth)/signup/CLAUDE.md)

#### src/app/admin/

- **Events** (`src/app/admin/events/`)  
  Application events module.  
  📄 [View CLAUDE.md](src/app/admin/events/CLAUDE.md)

- **Handlers** (`src/app/admin/handlers/`)  
  Application handlers module.  
  📄 [View CLAUDE.md](src/app/admin/handlers/CLAUDE.md)

- **Timeline** (`src/app/admin/timeline/`)  
  Application timeline module.  
  📄 [View CLAUDE.md](src/app/admin/timeline/CLAUDE.md)

#### src/app/api/

- **Migrate** (`src/app/api/migrate/`)  
  Application migrate module.  
  📄 [View CLAUDE.md](src/app/api/migrate/CLAUDE.md)

- **Trpc** (`src/app/api/trpc/`)  
  Application trpc module.  
  📄 [View CLAUDE.md](src/app/api/trpc/CLAUDE.md)

#### src/app/auth/

- **Callback** (`src/app/auth/callback/`)  
  Application callback module.  
  📄 [View CLAUDE.md](src/app/auth/callback/CLAUDE.md)

#### src/app/setup/

- **Migrate** (`src/app/setup/migrate/`)  
  Application migrate module.  
  📄 [View CLAUDE.md](src/app/setup/migrate/CLAUDE.md)

#### src/components/

- **Auth** (`src/components/auth/`)  
  Application auth module.  
  📄 [View CLAUDE.md](src/components/auth/CLAUDE.md)

- **Landing** (`src/components/landing/`)  
  Application landing module.  
  📄 [View CLAUDE.md](src/components/landing/CLAUDE.md)

- **Timeline** (`src/components/timeline/`)  
  Application timeline module.  
  📄 [View CLAUDE.md](src/components/timeline/CLAUDE.md)

#### src/lib/

- **Ai** (`src/lib/ai/`)  
  Application ai module.  
  📄 [View CLAUDE.md](src/lib/ai/CLAUDE.md)

- **Auth** (`src/lib/auth/`)  
  Application auth module.  
  📄 [View CLAUDE.md](src/lib/auth/CLAUDE.md)

- **Db** (`src/lib/db/`)  
  Application db module.  
  📄 [View CLAUDE.md](src/lib/db/CLAUDE.md)

- **Errors** (`src/lib/errors/`)  
  Application errors module.  
  📄 [View CLAUDE.md](src/lib/errors/CLAUDE.md)

- **Events** (`src/lib/events/`)  
  Application events module.  
  📄 [View CLAUDE.md](src/lib/events/CLAUDE.md)

- **Forms** (`src/lib/forms/`)  
  Application forms module.  
  📄 [View CLAUDE.md](src/lib/forms/CLAUDE.md)

- **Rbac** (`src/lib/rbac/`)  
  Application rbac module.  
  📄 [View CLAUDE.md](src/lib/rbac/CLAUDE.md)

- **Supabase** (`src/lib/supabase/`)  
  Application supabase module.  
  📄 [View CLAUDE.md](src/lib/supabase/CLAUDE.md)

- **Testing** (`src/lib/testing/`)  
  Application testing module.  
  📄 [View CLAUDE.md](src/lib/testing/CLAUDE.md)

- **Trpc** (`src/lib/trpc/`)  
  Application trpc module.  
  📄 [View CLAUDE.md](src/lib/trpc/CLAUDE.md)

- **Validations** (`src/lib/validations/`)  
  Application validations module.  
  📄 [View CLAUDE.md](src/lib/validations/CLAUDE.md)

- **Workflows** (`src/lib/workflows/`)  
  Application workflows module.  
  📄 [View CLAUDE.md](src/lib/workflows/CLAUDE.md)

#### src/lib/ai/

- **Productivity** (`src/lib/ai/productivity/`)  
  Application productivity module.  
  📄 [View CLAUDE.md](src/lib/ai/productivity/CLAUDE.md)

- **Twins** (`src/lib/ai/twins/`)  
  Application twins module.  
  📄 [View CLAUDE.md](src/lib/ai/twins/CLAUDE.md)

#### src/lib/db/

- **Migrations** (`src/lib/db/migrations/`)  
  Application migrations module.  
  📄 [View CLAUDE.md](src/lib/db/migrations/CLAUDE.md)

- **Schema** (`src/lib/db/schema/`)  
  Application schema module.  
  📄 [View CLAUDE.md](src/lib/db/schema/CLAUDE.md)

#### src/lib/errors/

- **__tests__** (`src/lib/errors/__tests__/`)  
  Application __tests__ module.  
  📄 [View CLAUDE.md](src/lib/errors/__tests__/CLAUDE.md)

#### src/lib/events/

- **Handlers** (`src/lib/events/handlers/`)  
  Application handlers module.  
  📄 [View CLAUDE.md](src/lib/events/handlers/CLAUDE.md)

#### src/lib/forms/

- **__tests__** (`src/lib/forms/__tests__/`)  
  Application __tests__ module.  
  📄 [View CLAUDE.md](src/lib/forms/__tests__/CLAUDE.md)

#### src/lib/trpc/

- **Routers** (`src/lib/trpc/routers/`)  
  Application routers module.  
  📄 [View CLAUDE.md](src/lib/trpc/routers/CLAUDE.md)

#### src/lib/validations/

- **__tests__** (`src/lib/validations/__tests__/`)  
  Application __tests__ module.  
  📄 [View CLAUDE.md](src/lib/validations/__tests__/CLAUDE.md)

#### src/server/

- **Trpc** (`src/server/trpc/`)  
  Application trpc module.  
  📄 [View CLAUDE.md](src/server/trpc/CLAUDE.md)

#### src/server/trpc/

- **Routers** (`src/server/trpc/routers/`)  
  Application routers module.  
  📄 [View CLAUDE.md](src/server/trpc/routers/CLAUDE.md)

---

## 🔄 Updating Documentation

### Auto-Update (Recommended)
```bash
# Documentation auto-updates on every git commit ✅
git commit -m "Your changes"
```

### Manual Update
```bash
# Regenerate all folder docs (maximum granularity)
pnpm exec tsx .claude/orchestration/scripts/generate-all-folder-docs.ts

# View what changed
git diff **/CLAUDE.md
```

---

*Maximum granularity documentation - Auto-generated on 2025-11-20*
