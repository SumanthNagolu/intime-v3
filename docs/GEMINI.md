# InTime v3 - Gemini Context

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
- **Gemini 1.5 Pro** (Reasoning & Execution)
- **Claude API** (Legacy/Alternative)
- **OpenAI API** (Alternative)
- **MCP (Model Context Protocol)** for tool integration
- **Multi-agent orchestration** for workflow automation
- **pgvector** (RAG with semantic search)
- **Redis** (short-term memory for AI conversations)
- **Helicone** (AI cost monitoring and analytics)

**📖 Complete AI Strategy:** See `/docs/planning/AI-ARCHITECTURE-STRATEGY.md`

---

## Project Structure

```
intime-v3/
├── .gemini/              # Gemini configuration
│   ├── agents/          # Specialist agents (personas)
│   ├── commands/        # Workflow commands
│   ├── rules/           # Specific rules
│   └── settings.json    # Settings
├── .claude/             # Claude Code configuration (Reference)
├── .mcp.json            # MCP servers configuration
├── docs/                # Project documentation
├── src/                 # Source code
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
**Principle:** Design complete unified schema BEFORE building any module.

#### 2. Event-Driven Integration
**Principle:** All cross-module communication via events, not direct calls.

#### 3. Testing is Not Optional
**Principle:** If it's not tested, it's broken.

#### 4. Delete Dead Code Immediately
**Principle:** Delete aggressively. Git remembers everything.

#### 5. Standardize API Patterns
**Principle:** One pattern, documented, enforced, no exceptions.

### What We're NOT Doing
❌ Building modules in isolation
❌ Multiple user management systems
❌ API pattern mixing (REST + tRPC)
❌ "We'll add tests later"
❌ Accumulating dead code
❌ Database schema evolution without plan

### What We ARE Doing
✅ Unified schema design
✅ Event bus first
✅ tRPC for all APIs
✅ Tests alongside features
✅ Aggressive code cleanup
✅ Single source of truth documentation

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
This project uses **specialist AI agents/personas**:
- **Business tier:** CEO Advisor, CFO Advisor (strategic decisions)
- **Planning tier:** PM Agent, Architect Agent (requirements & design)
- **Execution tier:** Developer, QA, Deployment (implementation & testing)

See `.gemini/agents/` for individual agent specifications.

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

---

## Current Status

**Phase:** Foundation & Setup
**Next Steps:**
1. Complete MCP server configuration
2. Create all specialist agents
3. Implement workflow commands
4. Set up quality hooks
5. Begin feature development

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
Trigger specialist agents using natural language:
- "Start planning feature X" - Initiate PM requirements gathering
- "Implement feature X" - Complete feature implementation flow
- "Review strategy" - Business strategy analysis
- "Design database" - Schema design and migration
