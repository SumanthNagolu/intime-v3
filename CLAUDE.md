# InTime v3 - Enterprise Staffing SaaS

## Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **API:** tRPC for type-safe APIs
- **Database:** Drizzle ORM with PostgreSQL (Supabase)
- **UI:** Tailwind CSS + shadcn/ui + Radix primitives
- **AI:** OpenAI, Claude, Gemini + Employee Twin system

## Business Domains
- **Academy:** Gamified training platform (XP, streaks, certificates)
- **Recruiting (ATS):** End-to-end hiring workflow
- **Bench Sales:** Consultant marketing and placement
- **HR/TA:** People operations and talent acquisition
- **CRM:** Client relationship management
- **Client Portal:** External client access

## Key Business Rules

- **Pods = Teams**: In InTime v3, the `pods` table represents teams. Each pod has a senior member (manager) and junior member (recruiter). Pod types: `recruiting`, `bench_sales`, `ta`.
- **DB Changes Rule**: Before running ANY script that modifies the database (users, profiles, seed data), ALWAYS confirm exactly what will be added/deleted/modified. Never run bulk operations without explicitly listing affected records first. ADD means add only - don't touch existing data.

---

## MCP Preset System

### Quick Reference

| Preset | Command | Best For |
|--------|---------|----------|
| **Coding** | `pnpm claude:coding` | Daily development (default) |
| **Testing** | `pnpm claude:testing` | E2E tests, debugging |
| **Full** | `pnpm claude:full` | Architecture, planning |

**After switching, restart Claude Code.**

### Preset Details

#### CODING (Default)
```
postgres      → Direct SQL queries, schema inspection
filesystem    → File operations, project navigation
seq-thinking  → Multi-step problem decomposition
```

#### TESTING
```
postgres      → Test data verification
playwright    → E2E browser automation, screenshots
seq-thinking  → Test planning, debugging
```

#### FULL (Architecture/Planning)
```
postgres      → Database operations
filesystem    → Project navigation
playwright    → Visual testing
github        → PRs, issues, repo insights
seq-thinking  → Complex reasoning
```

---

## Skills System

### Available Skills
Load with: `Use the [skill-name] skill`

| Skill | Domain | Key Topics |
|-------|--------|------------|
| `database` | Infrastructure | Drizzle ORM, migrations, schema design |
| `trpc` | Infrastructure | Router development, procedures, validation |
| `metadata` | Infrastructure | Screen definitions, layouts, actions |
| `recruiting` | Business | ATS workflows, jobs, submissions, interviews |
| `academy` | Business | Training, courses, XP, certificates |
| `crm` | Business | Leads, deals, accounts, activities |
| `bench-sales` | Business | Consultant marketing, placements |
| `hr` | Business | People ops, talent acquisition |
| `ai-twins` | AI | Twin system architecture |
| `testing` | Quality | Vitest unit tests, Playwright E2E |

### Auto-Load by Context

| When Working On | Load Skills |
|-----------------|-------------|
| `**/recruiting/**`, `schema/ats` | `recruiting`, `database` |
| `**/academy/**`, `schema/academy` | `academy`, `database` |
| `**/crm/**`, `schema/crm` | `crm`, `database` |
| `**/bench/**`, `schema/bench` | `bench-sales`, `database` |
| `**/*.test.ts`, `**/e2e/**` | `testing` |
| `**/routers/**`, `trpc` | `trpc`, `database` |

### Keyword Triggers

| Keywords | Skill |
|----------|-------|
| migration, schema, drizzle, table | `database` |
| router, trpc, procedure, mutation | `trpc` |
| job, candidate, submission, interview | `recruiting` |
| course, enrollment, xp, certificate | `academy` |
| lead, deal, account, pipeline | `crm` |
| bench, hotlist, consultant | `bench-sales` |
| test, e2e, playwright, coverage | `testing` |

---

## Key File Locations

```
src/lib/db/schema/     → Database schemas (ats.ts, academy.ts, crm.ts)
src/server/routers/    → tRPC routers
src/components/        → React components by module
src/hooks/queries/     → React Query hooks
src/hooks/mutations/   → Mutation hooks
src/lib/adapters/      → Data adapters
src/app/actions/       → Server actions
```

## Rollout Commands
- `/rollout/00-master-rollout` - Full workflow
- `/rollout/01-auth` through `/rollout/08-client` - Module rollouts
- `/workflows/integrate-component` - Integration pattern

## Test Users (password: TestPass123!)

| Role | Email |
|------|-------|
| Admin | admin@intime.com |
| HR Manager | hr@intime.com |
| Recruiting Mgr 1 | rec_mgr1@intime.com |
| Recruiter 1 | rec1@intime.com |
| Recruiting Mgr 2 | rec_mgr2@intime.com |
| Recruiter 2 | rec2@intime.com |
| Bench Sales Mgr 1 | bs_mgr1@intime.com |
| Bench Sales 1 | bs1@intime.com |
| Bench Sales Mgr 2 | bs_mgr2@intime.com |
| Bench Sales 2 | bs2@intime.com |

---

## Database Migration Rules

**Use the `execute-sql` Edge Function. Never use `npx supabase db push` directly.**

### Run Migrations

```bash
# 1. Source environment variables
source .env.local

# 2. Execute SQL via Edge Function
curl -X POST 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql' \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"sql":"YOUR SQL STATEMENT HERE"}'
```

### Migration Best Practices

1. **Check schema first:**
   ```bash
   source .env.local && curl -X POST 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql' \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"sql":"SELECT column_name FROM information_schema.columns WHERE table_name = '\''TABLE_NAME'\'' ORDER BY ordinal_position"}'
   ```

2. **Use idempotent DDL:**
   ```sql
   ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
   CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);
   ```

3. **Keep in sync:** Update `supabase/migrations/` and `src/lib/db/schema/`

---

## TypeScript Quick Reference

### Critical Patterns (Prevent Compilation Errors)

| Issue | Wrong | Correct |
|-------|-------|---------|
| Drizzle numeric | `job.rateMin` (string) | `parseFloat(job.rateMin)` |
| Drizzle date | `job.createdAt.toISOString()` | `job.createdAt` (already string) |
| Drizzle relations | `job.account.name` | `job.accountId` (use ID) |
| Supabase table | `supabase.from('audit_logs')` | `(supabase.from as any)('audit_logs')` |
| tRPC error | `options.onError(error)` | `options.onError(error as unknown as Error)` |
| Metadata field | `fieldType: 'text'` | `type: 'text'` |
| DataSource | `{ procedure: 'x' }` | `{ query: { procedure: 'x' } }` |
| Null default | `value \|\| ''` | `value ?? ''` |

### Pre-Commit Check

```bash
pnpm tsc --noEmit  # Must pass before committing
```

### Detailed Patterns

See `.claude/rules/typescript-patterns.md` for comprehensive guide.

---

## Core Capabilities (All Sessions)

- Sequential thinking for multi-step reasoning
- Parallel agent execution via Task tool
- TodoWrite for progress tracking
- Enterprise SaaS expertise (ATS, CRM, Staffing)
