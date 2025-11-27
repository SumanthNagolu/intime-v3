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

## Available Skills
Load domain expertise with: "Use the [skill-name] skill"
- `database` - Drizzle/Supabase patterns, migrations, schema design
- `trpc` - Router development, procedures, validation
- `recruiting` - ATS workflows, jobs, submissions, interviews
- `academy` - Training features, courses, XP, certificates
- `testing` - Vitest + Playwright patterns
- `bench-sales` - Bench consultant management
- `ai-twins` - AI Twin system architecture
- `hr` - HR/TA features
- `crm` - CRM features

## Key File Locations
- **Schemas:** `src/lib/db/schema/` (ats.ts, academy.ts, crm.ts, bench.ts)
- **Routers:** `src/server/routers/`, `src/server/trpc/routers/`
- **Components:** `src/components/[module]/`
- **Hooks:** `src/hooks/queries/`, `src/hooks/mutations/`
- **Adapters:** `src/lib/adapters/`
- **Actions:** `src/app/actions/`

## Rollout Commands
- `/rollout/00-master-rollout` - Full workflow
- `/rollout/01-auth` through `/rollout/08-client` - Module rollouts
- `/workflows/integrate-component` - Integration pattern

## Test Users (password: TestPass123!)
| Role | Email | Dashboard |
|------|-------|-----------|
| CEO | ceo@intime.com | /employee/ceo/dashboard |
| Admin | admin@intime.com | /employee/admin/dashboard |
| Recruiter | jr_rec@intime.com | /employee/recruiting/dashboard |
| Trainer | trainer@intime.com | /employee/portal |
| Student | student@intime.com | /academy/dashboard |

---

## Auto-Detection Rules

When I see these keywords in your message, I will take these actions:

### Testing Keywords
**Trigger:** "test", "e2e", "playwright", "browser", "click", "screenshot", "spec"
**Action:**
- If Playwright MCP tools aren't available, I'll suggest: `npm run claude:testing`
- I'll load the `testing` skill for patterns

### Database Keywords
**Trigger:** "migration", "schema", "drizzle", "table", "column", "relation", "insert", "query"
**Action:** Load the `database` skill

### API Keywords
**Trigger:** "router", "trpc", "endpoint", "mutation", "procedure", "api"
**Action:** Load the `trpc` skill

### Module-Specific Keywords
- "recruiting", "job", "candidate", "submission", "interview", "offer", "placement" → `recruiting` skill
- "academy", "course", "enrollment", "xp", "cohort", "certificate", "lesson" → `academy` skill
- "bench", "hotlist", "consultant", "marketing" → `bench-sales` skill
- "twin", "briefing", "ai assistant", "employee twin" → `ai-twins` skill
- "hr", "employee", "payroll", "review" → `hr` skill
- "crm", "lead", "deal", "account", "poc" → `crm` skill

### Complex Planning Keywords
**Trigger:** "plan", "architect", "design", "complex", "multi-step"
**Action:** For complex planning with extended reasoning, suggest: `npm run claude:full`

---

## MCP Preset Switching

```bash
# Default (coding mode - Supabase + Context7)
npm run claude:coding

# Testing (Supabase + Playwright)
npm run claude:testing

# Full (all servers for complex work)
npm run claude:full
```
### Playwiight Default Browser
- Always use broswer extension built in cursor ide for testing

After switching presets, restart Claude Code to apply changes.
