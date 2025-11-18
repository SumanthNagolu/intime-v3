# InTime v3 - Project Context

## What is InTime?

InTime is a **living organism** - not traditional software. It thinks with your principles, learns from every interaction, grows with your business, extends your capabilities, and scales your impact.

### The 5-Pillar Staffing Business
1. **Training Academy** - Transform candidates into consultants (8 weeks)
2. **Recruiting Services** - 48-hour turnaround for client placements
3. **Bench Sales** - 30-60 day placement for bench consultants
4. **Talent Acquisition** - Pipeline building and outreach
5. **Cross-Border Solutions** - International talent facilitation

### Business Model: 2-Person Pod Structure
- **Senior + Junior pairs** working collaboratively
- **Target:** 2 placements per 2-week sprint per pod
- **Cross-Pollination:** 1 conversation = 5+ lead opportunities across pillars

### 5-Year Vision
- **Year 1 (2026):** Internal tool for IntimeESolutions
- **Year 2 (2027):** B2B SaaS - "IntimeOS" for staffing companies
- **Year 3 (2028):** Multi-industry expansion
- **Year 5 (2030):** IPO-ready

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components)
- **TypeScript 5.6** (strict mode, no `any` types)
- **shadcn/ui** + Tailwind CSS
- **Zustand** for state management

### Backend
- **Supabase** (PostgreSQL + Auth + Real-time + Storage)
- **Drizzle ORM** with type-safe queries
- **Zod** for runtime validation

### Testing & Quality
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **TypeScript strict mode** (no implicit any, strict null checks)

### Infrastructure
- **Vercel** for deployment
- **GitHub** for version control
- **Sentry** for error tracking
- **Resend** for transactional email

### AI/Automation
- **Claude API** (Opus for reasoning, Sonnet for execution)
- **MCP (Model Context Protocol)** for tool integration
- **Multi-agent orchestration** for workflow automation

---

## Project Structure

```
intime-v3/
├── .claude/              # Claude Code configuration
│   ├── agents/          # 8 specialist agents
│   ├── commands/        # Workflow slash commands
│   ├── hooks/           # Quality gates & automation
│   └── settings.json    # Hooks configuration
├── .mcp.json            # MCP servers configuration
├── docs/                # Project documentation
├── src/                 # Source code (to be created)
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utilities & helpers
│   └── types/          # TypeScript definitions
└── tests/              # Test files
```

---

## Code Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `CandidateCard.tsx`)
- Utils/libs: `kebab-case.ts` (e.g., `format-date.ts`)
- Server actions: `actions.ts` in feature directories
- Types: `types.ts` or inline with usage

### Component Patterns
- **Server Components by default** (use "use client" only when needed)
- **Composition over props drilling** (use context sparingly)
- **shadcn/ui patterns** for consistency
- **Accessibility first** (proper ARIA labels, keyboard navigation)

### Database Conventions
- **Row Level Security (RLS)** on ALL tables
- **Soft deletes** for critical data (use `deleted_at` timestamp)
- **Audit trails** on sensitive operations (created_by, updated_by)
- **Foreign keys** with proper cascade rules

### API Patterns
- **Server Actions** for mutations (no separate API routes unless necessary)
- **Zod validation** on all inputs
- **Type-safe responses** using TypeScript discriminated unions
- **Error handling** with proper status codes and messages

### Testing Standards
- **80%+ code coverage** for critical paths
- **E2E tests** for user flows (auth, submission, approval)
- **Unit tests** for utilities and business logic
- **Integration tests** for database operations

---

## Lessons from Legacy Project

**Context:** InTime v3 is informed by comprehensive audit of a 7-day prototype that built 94,000 LOC across 8 modules.

### Critical Principles (MUST FOLLOW)

#### 1. Architecture First, Features Second

**Legacy Mistake:**
- Built modules in isolation
- Integration attempted afterward
- Result: Data silos, 3 weeks to fix

**v3 Approach:**
```sql
-- ONE user table with role-based columns
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,

  -- Role-specific fields (nullable)
  student_enrollment_date TIMESTAMPTZ,
  employee_hire_date TIMESTAMPTZ,
  candidate_status TEXT,
  client_company_name TEXT
);

-- Multi-role support via junction table
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Principle:** Design complete unified schema BEFORE building any module.

#### 2. Event-Driven Integration

**Legacy Mistake:**
- Event bus implemented but never used
- Manual cross-module workflows
- Duplicate functionality in each module

**v3 Approach:**
```typescript
// Example: Student graduates → Auto-create candidate profile
eventBus.subscribe('course.graduated', async (event) => {
  await grantRole(event.payload.userId, 'candidate');
  await db.user_profiles.update(event.payload.userId, {
    candidate_status: 'bench',
  });
  await notifyRecruitmentTeam(event.payload.userId);
});
```

**Principle:** All cross-module communication via events, not direct calls.

#### 3. Testing is Not Optional

**Legacy Mistake:**
- Test frameworks configured ✅
- Zero tests written ❌
- Bugs discovered late

**v3 Approach:**
- Tests alongside features (not "later")
- Minimum 80% coverage for critical paths
- Pre-commit hook blocks untested code
- E2E tests for cross-module flows

**Principle:** If it's not tested, it's broken.

#### 4. Delete Dead Code Immediately

**Legacy Mistake:**
- ~15% of codebase was unused
- Old implementations kept "just in case"
- Confusing for new developers

**v3 Approach:**
- Delete when replacing implementations
- Use git history for recovery
- Regular code audits (monthly)
- Automated dead code detection

**Principle:** Delete aggressively. Git remembers everything.

#### 5. Standardize API Patterns

**Legacy Mistake:**
- Mix of REST (35 routes) and tRPC (4 routers)
- 3 different error handling patterns
- Developer confusion

**v3 Approach:**
```typescript
// tRPC for ALL APIs
export const appRouter = router({
  academy: academyRouter,
  hr: hrRouter,
  trikala: triakalaRouter,
});

// Unified response type
export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

**Principle:** One pattern, documented, enforced, no exceptions.

### What We're NOT Doing

❌ Building modules in isolation
❌ Multiple user management systems
❌ API pattern mixing (REST + tRPC)
❌ "We'll add tests later"
❌ Accumulating dead code
❌ Database schema evolution without plan

### What We ARE Doing

✅ Unified schema design (Week 1)
✅ Event bus first (before modules)
✅ tRPC for all APIs
✅ Tests alongside features
✅ Aggressive code cleanup
✅ Single source of truth documentation

### Cost Optimization Insights

**Legacy Project Costs (100 users):**
- OpenAI: $80/month
- Anthropic: $200/month
- **Total:** $280/month

**v3 Optimizations:**
- Batch processing → 70% cost reduction
- Model selection (GPT-4o-mini for simple tasks) → 10x cheaper
- Caching (24 hours) → 50% reduction
- Rate limiting → Prevents abuse

**Optimized:** $100/month (65% savings)

### Salvageable from Legacy

**Production-Ready Components (70%+):**
1. Academy Module (95% complete)
2. Marketing Website (95% complete)
3. Admin Portal (90% complete)
4. Guidewire Guru RAG system (90% complete)
5. UI Component Library (shadcn/ui)
6. AI integration patterns

**Principle:** Don't reinvent working wheels. Refactor and integrate.

**See:** `docs/audit/LESSONS-LEARNED.md` for complete analysis

---

## Development Workflow

### Quality Gates
All code changes must pass:
1. TypeScript compilation (no errors)
2. ESLint (no errors, warnings acceptable with justification)
3. Unit tests (all passing)
4. Build process (successful production build)

### Git Workflow
- **Main branch:** Protected, production-ready code
- **Feature branches:** `feature/description` or `fix/description`
- **Commits:** Descriptive messages (what & why)
- **Pull requests:** Required for all changes to main

### Agent-Driven Development
This project uses **8 specialist AI agents** coordinated by an orchestrator:
- **Business tier:** CEO Advisor, CFO Advisor (strategic decisions)
- **Planning tier:** PM Agent, Architect Agent (requirements & design)
- **Execution tier:** Developer, QA, Deployment (implementation & testing)

See `.claude/agents/` for individual agent specifications.

---

## Business Context for AI Agents

### Non-Negotiable Principles
1. **Quality over speed** - "Best, only the best, nothing but the best"
2. **Student success = job placement** - Not just certifications
3. **Cross-pollination** - Every interaction has 5+ business opportunities
4. **Data ownership** - Complete control of all business data
5. **Scalability** - Design for 10x growth from day one

### Key Metrics
- **Training:** 8-week completion rate, job placement rate
- **Recruiting:** Time-to-fill, candidate quality score
- **Bench Sales:** 30-60 day placement rate
- **Pods:** 2 placements per sprint per pod
- **Revenue:** Monthly recurring revenue, customer acquisition cost

### Founder's Philosophy
> "This is not just software. This is an organism that thinks with your principles, grows with your business, learns from every interaction, extends your capabilities, and scales your impact."

The platform should embody:
- **Socratic teaching method** (guide with questions, not answers)
- **Sequential mastery** (can't skip ahead, master before progressing)
- **Hands-on experience** (project-based learning, not just theory)
- **Real-world simulation** (assumed personas with actual experience)

---

## Current Status

**Phase:** Foundation & Setup
**Next Steps:**
1. Complete MCP server configuration
2. Create all 8 specialist agents
3. Implement workflow commands
4. Set up quality hooks
5. Begin feature development

**Documentation:**
- See `docs/audit/user-vision.md` for complete business vision
- See `docs/audit/project-setup-architecture.md` for technical architecture
- See `docs/audit/implementation-guide.md` for setup instructions

---

## Quick Reference

### Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
- `GITHUB_TOKEN` - For GitHub MCP integration
- `SUPABASE_DB_URL` - For PostgreSQL MCP access
- `SLACK_BOT_TOKEN` - For Slack notifications (optional)

### MCP Servers Available
- **GitHub:** Repository operations, PR management
- **Filesystem:** File operations with proper permissions
- **PostgreSQL:** Direct database access via Supabase
- **Puppeteer:** Browser automation for testing
- **Slack:** Team notifications and updates
- **Sequential Thinking:** Enhanced reasoning for complex problems

### Agent Workflows
Trigger specialist agents using natural language or slash commands:
- `/start-planning` - Initiate PM requirements gathering
- `/feature [name]` - Complete feature implementation flow
- `/ceo-review` - Business strategy analysis
- `/database` - Schema design and migration

---

**Last Updated:** 2025-11-15
**Version:** 3.0 (Complete rewrite)
**Status:** In active development
