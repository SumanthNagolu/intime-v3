# Complete Documentation Index

**Last Updated:** 2025-11-19  
**Total Folders Documented:** 49  
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

## 📊 Tactical Level (8 folders)

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

### Types
**Path:** `src/types/`  
**Purpose:** Application types module.

📄 [View CLAUDE.md](src/types/CLAUDE.md)

---

## ⚙️ Operational Level (38 folders)

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

- **Stories** (`docs/planning/stories/`)  
  Documentation for stories.  
  📄 [View CLAUDE.md](docs/planning/stories/CLAUDE.md)

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

- **Admin** (`src/app/admin/`)  
  Application admin module.  
  📄 [View CLAUDE.md](src/app/admin/CLAUDE.md)

#### src/app/admin/

- **Timeline** (`src/app/admin/timeline/`)  
  Application timeline module.  
  📄 [View CLAUDE.md](src/app/admin/timeline/CLAUDE.md)

#### src/components/

- **Landing** (`src/components/landing/`)  
  Application landing module.  
  📄 [View CLAUDE.md](src/components/landing/CLAUDE.md)

- **Timeline** (`src/components/timeline/`)  
  Application timeline module.  
  📄 [View CLAUDE.md](src/components/timeline/CLAUDE.md)

#### src/lib/

- **Db** (`src/lib/db/`)  
  Application db module.  
  📄 [View CLAUDE.md](src/lib/db/CLAUDE.md)

#### src/lib/db/

- **Migrations** (`src/lib/db/migrations/`)  
  Application migrations module.  
  📄 [View CLAUDE.md](src/lib/db/migrations/CLAUDE.md)

- **Schema** (`src/lib/db/schema/`)  
  Application schema module.  
  📄 [View CLAUDE.md](src/lib/db/schema/CLAUDE.md)

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

*Maximum granularity documentation - Auto-generated on 2025-11-19*
