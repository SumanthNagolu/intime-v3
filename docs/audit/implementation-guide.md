# InTime v3 - Complete Orchestrator Implementation Guide

**Date:** November 15, 2025
**Purpose:** Step-by-step guide for implementing enterprise-grade multi-agent orchestration
**Prerequisite:** Read `project-setup-architecture.md` first

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Week 1: Foundation & MCP Setup](#week-1-foundation--mcp-setup)
3. [Week 2: Agent System](#week-2-agent-system)
4. [Week 3: Workflows & Hooks](#week-3-workflows--hooks)
5. [Week 4: Production Deployment](#week-4-production-deployment)
6. [Testing & Verification](#testing--verification)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance & Optimization](#maintenance--optimization)

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Claude API key (Claude Pro or API access)
- GitHub account with personal access token
- Supabase project (free tier works)
- Git configured locally

**Optional but Recommended:**
- Cursor IDE installed
- Slack workspace (for notifications)
- Vercel account (for deployment testing)

### Project Setup Verification

Before starting, verify your project structure:

```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

# Check project exists
ls -la

# Verify package.json exists
cat package.json | head -n 10

# Check git status
git status
```

**Expected output:**
- Next.js 15 project with `app/` directory
- `package.json` with dependencies
- Git repository initialized

---

## Week 1: Foundation & MCP Setup

**Goal:** Set up MCP servers, project context, and basic orchestrator agent

### Day 1: MCP Configuration (2-3 hours)

#### Step 1.1: Create MCP Configuration File

```bash
# Navigate to project root
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

# Create .mcp.json
touch .mcp.json
```

**Edit `.mcp.json`:**

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/sumanthrajkumarnagolu/Projects/intime-v3"
      ]
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${SUPABASE_DB_URL}"
      }
    },
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "slack": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      }
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

#### Step 1.2: Create Environment Variables

```bash
# Create .env.local
touch .env.local

# Create .env.local.example (for version control)
touch .env.local.example
```

**Edit `.env.local.example`:**

```bash
# GitHub MCP
GITHUB_TOKEN=

# Supabase MCP
SUPABASE_DB_URL=

# Slack MCP (optional for now)
SLACK_BOT_TOKEN=
SLACK_TEAM_ID=

# Supabase Project
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Edit `.env.local` with actual values:**

1. **GitHub Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `read:org`, `workflow`
   - Copy token and paste in `.env.local`

2. **Supabase Database URL:**
   - Go to Supabase Dashboard → Your Project
   - Settings → Database → Connection String
   - Copy "Connection string" (transaction mode)
   - Paste in `.env.local`

3. **Slack (Skip for now, add later if needed)**

**Update `.gitignore`:**

```bash
# Add to .gitignore if not already there
echo ".env.local" >> .gitignore
echo ".claude/**/*agent-*.jsonl" >> .gitignore
```

#### Step 1.3: Test MCP Connectivity

**Option A: Using Claude Code CLI**

```bash
# Start Claude Code with MCP debug mode
claude --mcp-debug
```

**Expected output:**
```
MCP Servers loading...
✓ github connected
✓ filesystem connected
✓ postgres connected
✓ puppeteer connected
✓ sequential-thinking connected
⚠ slack not connected (missing credentials) - OK for now

Connected to 5 MCP servers
```

**Option B: Manual testing (if no CLI yet)**

```bash
# Test GitHub MCP
npx @modelcontextprotocol/server-github --help

# Verify returns help text (not error)
```

#### Step 1.4: Verify MCP Tools Available

In Claude Code CLI:

```
> "List my GitHub repositories"
```

**Expected:** Claude uses `mcp__github__list_repos` tool and shows your repos.

**If this works:** ✅ MCP setup complete!

**If this fails:** See [Troubleshooting](#troubleshooting-mcp-connection-issues) section.

---

### Day 2: Project Context Files (1-2 hours)

#### Step 2.1: Create Root CLAUDE.md

```bash
touch CLAUDE.md
```

**Edit `CLAUDE.md`:**

```markdown
# InTime v3 - Project Context

**Last Updated:** November 15, 2025

## What is InTime?

InTime is a "Living Organism" platform for running a complete IT staffing business with 5 integrated pillars:

1. **Training Academy** - Turn candidates into consultants (Guidewire focus)
2. **Recruiting** - Place talent with clients (48-hour turnaround)
3. **Bench Sales** - Market consultants between projects
4. **Talent Acquisition** - Build candidate pipeline
5. **Cross-Border Solutions** - International talent movement (www.intimeesolutions.com)

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React Server Components, TypeScript 5.6 (strict)
- **Backend:** Next.js API routes, Supabase (PostgreSQL + Auth + Real-time)
- **UI:** shadcn/ui components, Tailwind CSS
- **State:** Zustand (client-side)
- **Validation:** Zod schemas
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel (hosting), Supabase (database)

## Business Model

- **2-Person Pods:** Senior + Junior across all business units
- **Automation:** AI handles sourcing/screening, humans handle relationships
- **Cross-Pollination:** 1 conversation = 5+ lead opportunities
- **Target Metric:** 2 placements per 2-week sprint (per pod)

## Code Conventions

### Database
- All tables have Row Level Security (RLS) enabled
- Soft deletes: `deleted_at` column (nullable)
- Audit columns: `created_at`, `updated_at`
- Foreign keys with `ON DELETE CASCADE` or `ON DELETE SET NULL`

### TypeScript
- Strict mode (no `any` types)
- Explicit types for function parameters and returns
- Interfaces for objects, types for unions

### Components
- **Server Components by default** (data fetching server-side)
- **Client Components only when needed** (mark with `"use client"`)
- Real-time updates via Supabase subscriptions (client components)

### API Routes
- Zod validation on all inputs
- Consistent error format: `{ error: string, code?: string }`
- Auth check: Verify `auth.uid()` exists
- Return appropriate HTTP status codes (200, 201, 400, 401, 500)

### Testing
- Unit tests for API routes (80%+ coverage target)
- Integration tests for critical flows
- E2E tests for user journeys

## Agent Orchestration System

This project uses Claude Code's multi-agent system:

- **Orchestrator:** Routes requests to specialist agents
- **CEO/CFO Advisors:** Business strategy and financial analysis
- **PM Agent:** Requirements and user stories
- **Architect Agent:** Database schema and API design
- **Developer Agent:** Code implementation
- **QA Agent:** Testing and verification
- **Deployment Agent:** CI/CD and deployment

### Available Workflows

- `/start-planning` - Requirements + architecture
- `/feature <name>` - Full SDLC (PM → Dev → QA)
- `/ceo-review <topic>` - Business analysis
- `/test` - Run full test suite
- `/deploy <env>` - Deploy to staging/production

## Project Vision

Read `docs/audit/user-vision.md` for complete business vision and philosophy.

## Quick Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run unit + integration tests
pnpm test:e2e     # Run E2E tests
pnpm type-check   # TypeScript validation
pnpm lint         # Run ESLint
```

## Important Files

- `docs/audit/user-vision.md` - Complete business vision
- `docs/audit/project-setup-architecture.md` - Agent system architecture
- `docs/audit/implementation-guide.md` - Setup instructions (this file's companion)
```

#### Step 2.2: Create .claude Directory Structure

```bash
# Create directory structure
mkdir -p .claude/agents
mkdir -p .claude/commands/workflows
mkdir -p .claude/skills
mkdir -p .claude/hooks/scripts

# Create agent-specific context file
touch .claude/CLAUDE.md
```

**Edit `.claude/CLAUDE.md`:**

```markdown
# Agent-Specific Context

## For All Agents

When working on this project, remember:

### File-Based Communication
Agents communicate via markdown files:
- `requirements.md` - PM agent output
- `architecture.md` - Architect agent output
- `implementation-log.md` - Developer agent output
- `test-report.md` - QA agent output
- `deployment-report.md` - Deployment agent output

**Always** read the previous agent's output file before starting your work.

### Tech Stack Quick Reference

**Database:** Supabase PostgreSQL with RLS
**Backend:** Next.js 15 API routes
**Frontend:** React Server Components (default)
**Validation:** Zod schemas
**Testing:** Vitest (unit), Playwright (E2E)

### Common Patterns

**Database Table Template:**
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**API Route Template:**
```typescript
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) return Response.json({ error: 'Validation failed' }, { status: 400 });

    // Your logic here

    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Business Context

This is a 5-pillar staffing business:
1. Training (Guidewire courses)
2. Recruiting (2-person pods)
3. Bench Sales (consultant marketing)
4. Talent Acquisition (pipeline building)
5. Cross-Border (immigration + placement)

**Key Metric:** 2 placements per 2-week sprint per pod

### Success Criteria

**For every feature you build:**
- ✅ Has RLS policies (security)
- ✅ Has soft delete support (data preservation)
- ✅ Has Zod validation (input safety)
- ✅ Has error handling (never crash silently)
- ✅ Has tests (80%+ coverage)
- ✅ Follows TypeScript strict mode (no `any`)
```

#### Step 2.3: Create .cursorrules (Cursor Sync)

```bash
touch .cursorrules
```

**Edit `.cursorrules`:**

```markdown
# Cursor AI Rules for InTime v3

## Project Context
This is a Next.js 15 + Supabase project for InTime, a 5-pillar IT staffing business.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript 5.6 (strict mode)
- Supabase (PostgreSQL + Auth + Real-time)
- shadcn/ui components
- Zustand (state management)
- Vitest + Playwright (testing)

## Code Conventions
- Server Components by default
- Client Components only when needed ("use client")
- All database tables have RLS policies
- Soft deletes (deleted_at column)
- Zod validation on all inputs
- No `any` types (TypeScript strict mode)

## Agent System
This project uses Claude Code's multi-agent orchestration.

Available workflows:
- `/feature <name>` - Full SDLC workflow
- `/start-planning` - Requirements + architecture
- `/ceo-review <topic>` - Business analysis

See `.claude/commands/workflows/` for all workflows.

## When Using Cursor
- All agents and workflows available in CLI are available here
- Changes to `.claude/` sync to CLI automatically
- Use same MCP servers (`.mcp.json`)
- Follow same conventions as CLI agents

## Quick Commands
- `pnpm dev` - Start dev server
- `pnpm test` - Run tests
- `pnpm type-check` - TypeScript validation
- `pnpm lint` - Lint code
```

#### Step 2.4: Test Context Loading

```bash
# Start Claude Code
claude
```

**In Claude Code:**

```
> "What is this project about?"
```

**Expected:** Claude references `CLAUDE.md` and explains it's the InTime v3 5-pillar staffing platform.

**If this works:** ✅ Context files loaded correctly!

---

### Day 3: Orchestrator Agent (2-3 hours)

#### Step 3.1: Create Orchestrator Agent

```bash
touch .claude/agents/orchestrator.md
```

**Copy the complete orchestrator prompt from `project-setup-architecture.md` (lines 855-993) into this file.**

Key sections to verify:
- Name: `orchestrator`
- Model: `opus`
- Tools: `Task` (only)
- Routing decision tree included
- File-based communication pattern documented

#### Step 3.2: Test Orchestrator Routing

**Start Claude Code:**

```bash
claude
```

**Test 1: Simple routing**

```
> "Analyze the user-vision.md file and summarize the business model"
```

**Expected behavior:**
- Orchestrator reads user-vision.md
- Provides summary without spawning agents (simple task)

**Test 2: Agent spawning**

```
> "I want to understand the database structure. Can you explore the Supabase schema?"
```

**Expected behavior:**
- Orchestrator recognizes this requires database exploration
- Spawns architect-agent OR directly uses postgres MCP tools
- Returns findings

**If routing works:** ✅ Orchestrator operational!

**Common issues:**
- If orchestrator tries to do work itself instead of delegating → Refine prompt to emphasize "delegate only"
- If can't spawn agents → Verify `Task` tool is available

---

### Day 4: Business Tier Agents (3-4 hours)

#### Step 4.1: Create CEO Advisor Agent

```bash
touch .claude/agents/ceo-advisor.md
```

**Copy CEO advisor prompt from `project-setup-architecture.md` (lines 995-1114) into this file.**

#### Step 4.2: Create CFO Advisor Agent

```bash
touch .claude/agents/cfo-advisor.md
```

**Copy CFO advisor prompt from `project-setup-architecture.md` (lines 1116-1271) into this file.**

#### Step 4.3: Test Business Agents

**Test CEO Agent:**

```
> "Should we expand to Canada for cross-border recruiting? Analyze the business opportunity."
```

**Expected:**
- Orchestrator routes to ceo-advisor
- CEO agent reads user-vision.md for context
- Provides strategic analysis with scenarios, risks, recommendations

**Test CFO Agent:**

```
> "What's the ROI of building custom recruiting software vs. using Salesforce?"
```

**Expected:**
- Orchestrator routes to cfo-advisor
- CFO agent provides financial model with 3-year TCO
- Includes ROI calculation, payback period, recommendation

**Validation checklist:**
- ✅ Agents read user-vision.md for business context
- ✅ Provide quantitative analysis (numbers, not just qualitative)
- ✅ Include scenarios (best/expected/worst case)
- ✅ Give clear recommendations

---

### Day 5: Planning Tier Agents (3-4 hours)

#### Step 5.1: Create PM Agent

```bash
touch .claude/agents/pm-agent.md
```

**Copy PM agent prompt from `project-setup-architecture.md` (lines 1273-1465).**

#### Step 5.2: Create Architect Agent

```bash
touch .claude/agents/architect-agent.md
```

**Copy architect agent prompt from `project-setup-architecture.md` (lines 1468-1857).**

#### Step 5.3: Test Planning Flow

**Test PM Agent:**

```
> "I want to add email notifications when a candidate is submitted to a client. Can you gather requirements?"
```

**Expected:**
- Orchestrator spawns pm-agent
- PM agent asks clarifying questions:
  - Who receives notifications?
  - What information in email?
  - Can users opt out?
  - Email templates needed?
- After answers, writes `requirements.md`

**Test Architect Agent:**

```
> "Design the database schema and API for the email notifications feature (read requirements.md)"
```

**Expected:**
- Architect agent reads requirements.md
- Designs normalized database schema
- Creates migration file
- Defines API endpoints
- Writes `architecture.md`

**Validation:**
- ✅ PM writes comprehensive `requirements.md` with user stories
- ✅ Architect writes `architecture.md` with SQL migration
- ✅ Architect includes RLS policies
- ✅ API contracts clearly defined

---

### Day 6-7: Execution Tier Agents (4-6 hours)

#### Step 6.1: Create Developer Agent

```bash
touch .claude/agents/developer-agent.md
```

**Copy developer agent prompt from `project-setup-architecture.md` (lines 1859-2259).**

#### Step 6.2: Create QA Agent

```bash
touch .claude/agents/qa-agent.md
```

**Copy QA agent prompt from `project-setup-architecture.md` (lines 2261-2723).**

#### Step 6.3: Create Deployment Agent

```bash
touch .claude/agents/deployment-agent.md
```

**Copy deployment agent prompt from `project-setup-architecture.md` (lines 2725-3098).**

#### Step 6.4: Test Execution Flow

**Test Developer Agent:**

```
> "Implement the email notifications feature (read architecture.md)"
```

**Expected:**
- Developer reads architecture.md
- Creates database migration file
- Implements API endpoints with Zod validation
- Builds UI components
- Writes tests
- Writes `implementation-log.md`

**Test QA Agent:**

```
> "Test the email notifications implementation"
```

**Expected:**
- QA reads implementation-log.md and requirements.md
- Runs existing tests
- Generates additional tests if coverage gaps
- Verifies acceptance criteria
- Writes `test-report.md` with bugs found + quality score

**Test Deployment Agent (dry-run):**

```
> "Verify if the email notifications feature is ready for deployment to staging"
```

**Expected:**
- Deployment agent checks test-report.md
- Verifies tests passing
- Checks QA sign-off
- Reports readiness (likely will say "not ready" since this is a test)

**Week 1 Completion Checklist:**

- ✅ 6 MCP servers configured and tested
- ✅ Project context files created (CLAUDE.md, .claude/CLAUDE.md, .cursorrules)
- ✅ 8 agents created and individually tested:
  - ✅ Orchestrator (routing works)
  - ✅ CEO Advisor (business analysis)
  - ✅ CFO Advisor (financial modeling)
  - ✅ PM Agent (requirements gathering)
  - ✅ Architect Agent (schema design)
  - ✅ Developer Agent (implementation)
  - ✅ QA Agent (testing)
  - ✅ Deployment Agent (deployment readiness)
- ✅ File-based communication working (agents read/write markdown files)
- ✅ All agents have appropriate tool access

---

## Week 2: Workflow Commands & Integration

**Goal:** Create slash commands for complete workflows, test end-to-end agent orchestration

### Day 8: Planning Workflow (2-3 hours)

#### Step 8.1: Create start-planning Command

```bash
touch .claude/commands/workflows/start-planning.md
```

**Copy start-planning workflow from `project-setup-architecture.md` (lines 3301-3338).**

#### Step 8.2: Test Planning Workflow

```
> /start-planning
```

Or naturally:

```
> "Let's plan a new feature for user authentication"
```

**Expected sequence:**
1. Orchestrator spawns pm-agent
2. PM agent asks questions, writes requirements.md
3. Orchestrator spawns architect-agent
4. Architect reads requirements.md, writes architecture.md
5. Orchestrator synthesizes both outputs
6. Presents summary with next steps

**Measure:**
- Time taken (should be 15-30 minutes for simple feature)
- Quality of requirements.md
- Quality of architecture.md
- Completeness of synthesis

**If workflow completes successfully:** ✅ Planning workflow operational!

---

### Day 9: Full Feature Workflow (3-4 hours)

#### Step 9.1: Create feature Command

```bash
touch .claude/commands/workflows/feature.md
```

**Copy feature workflow from `project-setup-architecture.md` (lines 3340-3381).**

#### Step 9.2: Test Full SDLC Workflow

```
> /feature simple-api-endpoint
```

**Feature to test:** "Add a simple GET /api/health endpoint that returns server status"

**Expected sequence:**
1. **PM Phase:** Gathers requirements (should be quick for simple endpoint)
2. **Architect Phase:** Designs API contract (minimal database changes)
3. **Developer Phase:** Implements endpoint
4. **QA Phase:** Writes tests, runs them
5. **Summary:** Orchestrator presents complete report

**Measure:**
- Total time (target: < 2 hours for simple feature)
- Each phase completes without errors
- Files created: requirements.md, architecture.md, implementation-log.md, test-report.md
- Code quality (Developer follows patterns)
- Test coverage (QA achieves 80%+)

**Common issues:**
- **Developer skips tests:** Refine developer prompt to emphasize TDD
- **QA doesn't run tests:** Ensure QA has Bash tool access
- **Architect over-designs:** For simple features, architect should recognize and keep it simple

---

### Day 10: Business Workflows (2 hours)

#### Step 10.1: Create CEO Review Workflow

```bash
touch .claude/commands/workflows/ceo-review.md
```

**Copy from `project-setup-architecture.md` (lines 3383-3427).**

#### Step 10.2: Create Database Workflow

```bash
touch .claude/commands/workflows/database.md
```

**Copy from `project-setup-architecture.md` (lines 3429-3473).**

#### Step 10.3: Test Business Workflows

**Test CEO Review:**

```
> /ceo-review should we raise training prices from $99 to $149?
```

**Expected:**
- CEO agent analyzes pricing strategy
- CFO agent calculates revenue impact
- Combined recommendation with ROI

**Test Database Workflow:**

```
> /database design schema for candidate skills tracking
```

**Expected:**
- PM agent gathers requirements (if not exist)
- Architect designs database schema
- Migration file ready to apply

---

### Day 11: Testing & Deployment Workflows (2 hours)

#### Step 11.1: Create Test Workflow

```bash
touch .claude/commands/workflows/test.md
```

**Copy from `project-setup-architecture.md` (lines 3475-3524).**

#### Step 11.2: Create Deploy Workflow

```bash
touch .claude/commands/workflows/deploy.md
```

**Copy from `project-setup-architecture.md` (lines 3526-3581).**

#### Step 11.3: Test Quality Workflows

**Test Testing Workflow:**

```
> /test
```

**Expected:**
- Runs `pnpm type-check`
- Runs `pnpm lint`
- Runs `pnpm test`
- Spawns QA agent to analyze results
- Writes test-report.md

**Test Deployment Workflow (dry-run):**

```
> /deploy staging
```

**Expected:**
- Checks test results
- Checks QA sign-off
- Verifies environment variables
- Reports readiness
- Does NOT actually deploy (since we're testing)

---

### Day 12: Skills (Optional, 1-2 hours)

Skills are auto-invoked capabilities. Create these if you want automatic behavior.

#### Step 12.1: Create Code Review Skill

```bash
mkdir -p .claude/skills/code-review
touch .claude/skills/code-review/SKILL.md
```

**Edit `.claude/skills/code-review/SKILL.md`:**

```markdown
---
name: code-review
description: Automatically review code quality when viewing diffs or pull requests
---

When the user asks to review code or views a git diff, automatically:

1. Check code quality:
   - TypeScript strict mode compliance
   - No `any` types
   - Proper error handling
   - Zod validation on inputs

2. Check security:
   - RLS policies present (for database operations)
   - Auth checks in API routes
   - Input sanitization

3. Check patterns:
   - Server Components by default
   - Client Components only when needed
   - Proper use of Supabase client (server vs. client)

4. Provide feedback:
   - ✅ What's done well
   - ⚠️ What could be improved
   - 🔴 Critical issues that must be fixed

Format feedback as a checklist.
```

#### Step 12.2: Test Skill Auto-Invocation

**Create a test file with bad code:**

```typescript
// test-bad.ts
export function test(data: any) { // Bad: any type
  return data
}
```

**Ask for review:**

```
> "Review test-bad.ts"
```

**Expected:**
- Code review skill auto-activates
- Identifies `any` type issue
- Provides feedback

**If skill activates:** ✅ Skills working!

**If skill doesn't activate:** Skills are optional, continue without them.

---

### Day 13-14: Workflow Refinement (3-4 hours)

#### Step 13.1: Run Full Feature Workflow End-to-End

Pick a real feature from your backlog (not a test feature):

```
> /feature add-candidate-status-tracking
```

**Monitor:**
- Does PM ask good questions?
- Does Architect design proper schema?
- Does Developer implement correctly?
- Does QA find bugs?
- Total time taken?

**Document issues found:**
- Slow steps (which agent takes too long?)
- Quality issues (which agent produces poor output?)
- Missing context (which agent needs more information?)

#### Step 13.2: Optimize Agent Prompts

Based on issues found:

**If PM asks too many questions:**
- Add more context to PM prompt about typical features
- Reference user-vision.md more

**If Architect over-designs:**
- Emphasize "design for simplicity first"
- Add examples of simple vs. complex features

**If Developer forgets tests:**
- Make test writing more explicit in checklist
- Add test template examples

**If QA is too lenient:**
- Raise quality bar in prompt
- Add more edge cases to test

#### Step 13.3: Test Parallel Execution

For features with independent components:

```
> "Build three dashboard widgets in parallel: revenue, users, and activity"
```

**Expected:**
- Orchestrator recognizes independent tasks
- Spawns 3 developer agents simultaneously
- Each works on separate file
- Collects results and synthesizes

**If parallel execution works:** ✅ Advanced orchestration operational!

---

**Week 2 Completion Checklist:**

- ✅ 6 workflow commands created:
  - ✅ /start-planning
  - ✅ /feature
  - ✅ /ceo-review
  - ✅ /database
  - ✅ /test
  - ✅ /deploy
- ✅ End-to-end workflows tested
- ✅ Sequential workflows working (PM → Arch → Dev → QA)
- ✅ Parallel workflows working (multiple agents simultaneously)
- ✅ Agent prompts optimized based on real usage
- ✅ Skills created and tested (optional)

---

## Week 3: Quality Hooks & Automation

**Goal:** Implement quality gates, auto-formatting, notifications

### Day 15: Hook Infrastructure (1-2 hours)

#### Step 15.1: Create Hooks Configuration

```bash
touch .claude/settings.json
```

**Edit `.claude/settings.json`:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/pre-edit.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/post-write.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "developer-agent",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/post-dev.sh",
            "timeout": 60
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/session-start.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

#### Step 15.2: Create Hook Scripts Directory

```bash
mkdir -p .claude/hooks/scripts
```

---

### Day 16: Pre/Post Edit Hooks (2 hours)

#### Step 16.1: Create Pre-Edit Hook

```bash
touch .claude/hooks/scripts/pre-edit.sh
chmod +x .claude/hooks/scripts/pre-edit.sh
```

**Copy pre-edit hook from `project-setup-architecture.md` (lines 3656-3691).**

#### Step 16.2: Create Post-Write Hook

```bash
touch .claude/hooks/scripts/post-write.sh
chmod +x .claude/hooks/scripts/post-write.sh
```

**Copy post-write hook from `project-setup-architecture.md` (lines 3693-3731).**

#### Step 16.3: Test Edit Hooks

**Test pre-edit validation:**

Try to edit a file in node_modules:

```
> "Edit node_modules/some-package/index.js"
```

**Expected:**
- Pre-edit hook blocks the edit
- Error message: "❌ Cannot edit files in node_modules"

**Test post-write auto-format:**

Create a poorly formatted TypeScript file:

```typescript
// test-format.ts
export   function   test(  ){   return   "hello"  }
```

After writing, check if file is auto-formatted by prettier.

**If hooks trigger:** ✅ Edit hooks working!

---

### Day 17: Subagent Hooks (2-3 hours)

#### Step 17.1: Create Post-Developer Hook

```bash
touch .claude/hooks/scripts/post-dev.sh
chmod +x .claude/hooks/scripts/post-dev.sh
```

**Copy post-dev hook from `project-setup-architecture.md` (lines 3733-3777).**

**Important:** This hook runs TypeScript check, linting, tests, and build.

#### Step 17.2: Test Developer Quality Gate

**Run a feature that triggers developer agent:**

```
> /feature add-simple-function
```

**Expected after developer completes:**
- Post-dev hook automatically runs
- Runs `pnpm type-check`
- Runs `pnpm lint`
- Runs `pnpm test`
- If any fail → Hook blocks and reports error
- Developer must fix before QA agent runs

**Test failure scenario:**

Have developer agent create code with TypeScript error:

```typescript
const x: string = 123; // Type error
```

**Expected:**
- Post-dev hook catches type error
- Blocks workflow
- Reports: "❌ Type check failed"

**If blocking works:** ✅ Quality gates operational!

---

### Day 18: Session Hooks (1 hour)

#### Step 18.1: Create Session Start Hook

```bash
touch .claude/hooks/scripts/session-start.sh
chmod +x .claude/hooks/scripts/session-start.sh
```

**Copy session-start hook from `project-setup-architecture.md` (lines 3779-3815).**

#### Step 18.2: Test Session Hook

**Restart Claude Code:**

```bash
claude
```

**Expected on startup:**
```
🚀 InTime v3 Development Session Starting...

📝 Git Status:
   M docs/audit/implementation-guide.md
   ?? .claude/

📊 Recent Activity:
   Last commit: abc123 - Add implementation guide (2 hours ago)

🔧 Environment:
   Node: v20.10.0
   pnpm: 8.14.0

📚 Project context loaded from CLAUDE.md
✅ Ready for development
```

**If session hook displays info:** ✅ Session hooks working!

---

### Day 19: Notification Hooks (Optional, 2 hours)

**Note:** Only do this if you've configured Slack MCP.

#### Step 19.1: Create Deployment Notification

**Edit `.claude/hooks/scripts/post-deploy.sh`:**

```bash
#!/bin/bash
set -e

# Get deployment info from stdin
input=$(cat)
environment=$(echo "$input" | jq -r '.environment // "unknown"')
status=$(echo "$input" | jq -r '.status // "unknown"')

# Send Slack notification
if [ "$status" = "success" ]; then
  message="✅ Deployment to $environment successful!"
else
  message="🔴 Deployment to $environment failed!"
fi

# Use Slack MCP to send message
echo "Sending to Slack: $message"

exit 0
```

```bash
chmod +x .claude/hooks/scripts/post-deploy.sh
```

#### Step 19.2: Test Slack Notification

```
> /deploy staging
```

**Expected:**
- After deployment, post-deploy hook triggers
- Slack message sent to #engineering channel

---

### Day 20-21: Integration & Performance Testing (3-4 hours)

#### Step 20.1: Test All Hooks Together

**Run complete feature workflow with all hooks active:**

```
> /feature comprehensive-test-feature
```

**Monitor hook execution:**
- SessionStart hook (on claude startup)
- PreToolUse hooks (before edits)
- PostToolUse hooks (after writes - auto-format)
- SubagentStop hook (after developer - quality checks)

**Verify:**
- ✅ Hooks don't significantly slow down workflow
- ✅ Quality checks catch issues
- ✅ Auto-formatting works
- ✅ No false positives (hooks blocking valid operations)

#### Step 20.2: Performance Measurement

**Measure workflow time with vs. without hooks:**

**Without hooks (disable in settings.json):**

```
> /feature simple-api-route
```

Time: ~X minutes

**With hooks (enable in settings.json):**

```
> /feature simple-api-route
```

Time: ~Y minutes

**Acceptable overhead:** < 20% slowdown

**If overhead too high:**
- Reduce hook timeouts
- Optimize hook scripts (cache npm installs)
- Run hooks in parallel where possible

#### Step 20.3: Optimize Hook Scripts

**Optimization techniques:**

1. **Cache npm packages:**

```bash
# In post-write.sh, add caching:
if ! command -v prettier &> /dev/null; then
  npm install -g prettier
fi
```

2. **Skip hooks for certain files:**

```bash
# In pre-edit.sh, add skip logic:
if [[ "$file_path" == *".md" ]]; then
  exit 0  # Skip markdown files
fi
```

3. **Parallel execution:**

```bash
# In post-dev.sh, run checks in parallel:
pnpm type-check &
PID1=$!
pnpm lint &
PID2=$!
pnpm test &
PID3=$!

wait $PID1 $PID2 $PID3
```

---

**Week 3 Completion Checklist:**

- ✅ Hooks configuration created (settings.json)
- ✅ Hook scripts implemented:
  - ✅ pre-edit.sh (validation)
  - ✅ post-write.sh (auto-format)
  - ✅ post-dev.sh (quality checks)
  - ✅ session-start.sh (project status)
- ✅ All hooks tested individually
- ✅ Full workflow tested with all hooks
- ✅ Performance measured and optimized
- ✅ Notification hooks (optional, if Slack configured)

---

## Week 4: Production Deployment

**Goal:** Polish, document, deploy orchestrator system for team use

### Day 22: Cursor Sync (1-2 hours)

#### Step 22.1: Test Cursor with .claude Config

**Open Cursor IDE:**

```bash
cursor /Users/sumanthrajkumarnagolu/Projects/intime-v3
```

**Verify Cursor sees:**
- `.claude/` directory with all agents
- `.cursorrules` file
- `.mcp.json` configuration

#### Step 22.2: Test Agent Availability in Cursor

**In Cursor, press Cmd+K (AI prompt):**

```
Show me available agents
```

**Expected:**
- Cursor lists all 8 agents
- Can invoke agents via Cmd+K

**Test workflow in Cursor:**

```
/feature test-cursor-workflow
```

**Expected:**
- Workflow runs same as in CLI
- File outputs created
- No sync issues

#### Step 22.3: Document Sync Process

**Create `.claude/README.md`:**

```markdown
# Claude Code Orchestrator System

## Tools

**Claude Code CLI (Primary):**
- Best for: Multi-agent workflows, complex orchestration
- Usage: `claude` from project root

**Cursor IDE (Secondary):**
- Best for: Quick edits, visual debugging, code navigation
- Usage: Open project in Cursor, use Cmd+K for AI

## Sync

Both tools read from same configuration:
- `.claude/` - Agents, commands, settings
- `.mcp.json` - MCP servers
- `CLAUDE.md` - Project context

**Changes made in one tool are immediately available in the other.**

## Available Workflows

- `/start-planning` - Requirements + architecture
- `/feature <name>` - Full SDLC (PM → Dev → QA)
- `/ceo-review <topic>` - Business analysis
- `/database <feature>` - Database design
- `/test` - Run full test suite
- `/deploy <env>` - Deploy (staging/production)
```

---

### Day 23: Documentation (2-3 hours)

#### Step 23.1: Update CLAUDE.md

Ensure `CLAUDE.md` has all current patterns and decisions.

**Add sections:**
- Recent architectural decisions
- Common patterns discovered
- Known issues and workarounds

#### Step 23.2: Document Each Agent

**Create `.claude/agents/README.md`:**

```markdown
# Agent Directory

## Orchestrator
**File:** `orchestrator.md`
**Purpose:** Routes requests to specialist agents
**Model:** Opus
**When to use:** Main entry point (always active)

## Business Tier

### CEO Advisor
**File:** `ceo-advisor.md`
**Purpose:** Business strategy, market analysis, strategic decisions
**Model:** Opus
**When to invoke:** Business questions, strategic decisions, market analysis

### CFO Advisor
**File:** `cfo-advisor.md`
**Purpose:** Financial modeling, ROI analysis, budget planning
**Model:** Opus
**When to invoke:** Financial questions, cost analysis, revenue modeling

## Planning Tier

### PM Agent
**File:** `pm-agent.md`
**Purpose:** Requirements gathering, user stories, task breakdown
**Model:** Sonnet
**Output:** requirements.md

### Architect Agent
**File:** `architect-agent.md`
**Purpose:** Database design, API contracts, system architecture
**Model:** Sonnet
**Input:** requirements.md
**Output:** architecture.md

## Execution Tier

### Developer Agent
**File:** `developer-agent.md`
**Purpose:** Code implementation, testing, git commits
**Model:** Sonnet
**Input:** architecture.md
**Output:** implementation-log.md

### QA Agent
**File:** `qa-agent.md`
**Purpose:** Testing, bug detection, quality verification
**Model:** Sonnet
**Input:** implementation-log.md, requirements.md
**Output:** test-report.md

### Deployment Agent
**File:** `deployment-agent.md`
**Purpose:** CI/CD, deployment, monitoring, rollback
**Model:** Sonnet
**Input:** test-report.md
**Output:** deployment-report.md
```

#### Step 23.3: Create Troubleshooting Guide

**Create `docs/audit/troubleshooting.md`:**

(See [Troubleshooting](#troubleshooting) section below for content)

---

### Day 24: Cost Optimization (2 hours)

#### Step 24.1: Measure Current Costs

**Track usage for 1 week:**
- Count number of agent invocations
- Measure tokens used per agent
- Calculate weekly cost

**Estimation formula:**
```
Weekly Cost = (Opus tokens × $15/1M) + (Sonnet tokens × $3/1M)
```

#### Step 24.2: Optimize Agent Prompts

**Reduce token usage:**

1. **Trim system prompts:** Remove redundant examples
2. **Use Haiku for simple tasks:** Switch agents to Haiku where appropriate
3. **Add caching:** For orchestrator (holds plan across requests)

**Before optimization:**
- Orchestrator: ~2000 tokens/invocation
- PM agent: ~1500 tokens/invocation
- Total weekly: ~50,000 tokens → ~$2.50/week

**After optimization:**
- Orchestrator: ~1500 tokens/invocation (25% reduction)
- PM agent (Haiku): ~1000 tokens → 10x cost reduction
- Total weekly: ~$1.50/week (40% reduction)

#### Step 24.3: Cost Monitoring Script

**Create `scripts/cost-monitor.sh`:**

```bash
#!/bin/bash
# Cost monitoring script (placeholder - implement based on your API usage)

echo "Cost Monitoring"
echo "==============="
echo "Week: $(date +%U)"
echo ""
echo "Agent invocations:"
echo "- Orchestrator: [track in logs]"
echo "- PM Agent: [track in logs]"
echo "- Developer Agent: [track in logs]"
echo ""
echo "Estimated cost: \$[calculate]"
```

---

### Day 25: Team Onboarding (2-3 hours)

#### Step 25.1: Create Onboarding Guide

**Create `docs/onboarding-guide.md`:**

```markdown
# InTime v3 Orchestrator - Team Onboarding

## Quick Start (5 minutes)

### 1. Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Navigate to Project

```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3
```

### 3. Start Claude Code

```bash
claude
```

### 4. Try Your First Workflow

```
> /feature my-first-feature
```

Claude will guide you through requirements, architecture, implementation, and testing.

## Available Workflows

### Planning
- `/start-planning` - Requirements + architecture only

### Development
- `/feature <name>` - Full SDLC (PM → Dev → QA → Deploy)
- `/database <feature>` - Database schema design

### Business
- `/ceo-review <topic>` - Strategic analysis
- Calculate ROI, analyze opportunities

### Quality
- `/test` - Run full test suite + QA analysis

### Deployment
- `/deploy staging` - Deploy to staging
- `/deploy production` - Deploy to production

## Natural Language

You can also use natural language:

```
> "I want to add user authentication"
> "Should we raise training prices?"
> "Design a database schema for skills tracking"
```

Orchestrator will route to the appropriate agents automatically.

## Best Practices

1. **Let agents ask questions** - PM agent will clarify requirements
2. **Review architecture before coding** - Check architecture.md before proceeding
3. **Fix quality issues immediately** - Post-dev hooks will catch issues early
4. **Read agent outputs** - requirements.md, architecture.md, etc. contain important decisions

## Troubleshooting

**MCP Connection Issues:**
- Check `.env.local` has all required tokens
- Run `claude --mcp-debug` to diagnose

**Agent Not Responding:**
- Check agent file exists in `.claude/agents/`
- Verify agent name in orchestrator routing

**Hooks Blocking Valid Operations:**
- Check `.claude/hooks/scripts/` for hook logic
- Temporarily disable hooks in `.claude/settings.json`

## Getting Help

- Read `docs/audit/project-setup-architecture.md` for complete system design
- Read `docs/audit/implementation-guide.md` for setup instructions
- Read `docs/audit/troubleshooting.md` for common issues
```

#### Step 25.2: Record Demo Video (Optional)

**Topics to cover:**
1. Starting Claude Code (5 min)
2. Running /feature workflow (10 min)
3. Reviewing agent outputs (5 min)
4. Fixing issues caught by hooks (5 min)
5. Q&A (5 min)

**Total:** ~30 minutes

---

### Day 26: Production Readiness Testing (3-4 hours)

#### Step 26.1: End-to-End System Test

**Run 3-5 complete feature workflows:**

1. Simple feature (API endpoint)
2. Medium feature (database + API + UI)
3. Complex feature (multi-component with integrations)
4. Business analysis (CEO review)
5. Database design

**Track:**
- Success rate (all complete without errors?)
- Average time per workflow
- Quality of outputs
- Issues discovered

#### Step 26.2: Stress Testing

**Test parallel workflows:**

```
> "Build these 5 features in parallel:
1. Health check endpoint
2. User profile page
3. Settings panel
4. Notification system
5. Activity log"
```

**Monitor:**
- Can orchestrator handle multiple concurrent subagents?
- Do agents conflict (file editing)?
- Total time vs. sequential?

#### Step 26.3: Create Rollback Plan

**Document in `docs/audit/rollback-plan.md`:**

```markdown
# Orchestrator System Rollback Plan

## If System Breaks

### Option 1: Disable Hooks Temporarily

Edit `.claude/settings.json`:

```json
{
  "hooks": {}
}
```

This disables all hooks but keeps agents functional.

### Option 2: Revert to Specific Agent Version

```bash
git checkout <commit-hash> -- .claude/agents/agent-name.md
```

### Option 3: Disable Specific Agent

Rename agent file:

```bash
mv .claude/agents/broken-agent.md .claude/agents/broken-agent.md.backup
```

Orchestrator will skip broken agent.

### Option 4: Full System Disable

Rename .claude directory:

```bash
mv .claude .claude.backup
```

Claude Code will run without orchestration.

## Recovery Steps

1. Identify which component broke (agent, hook, workflow)
2. Apply appropriate rollback
3. Test with simple workflow
4. Debug issue
5. Re-enable component
6. Re-test

## Emergency Contacts

- System architect: [Name]
- Claude Code expert: [Name]
```

---

### Day 27: Deployment to Team (2 hours)

#### Step 27.1: Commit All Files to Git

```bash
# Verify what will be committed
git status

# Add all .claude files
git add .claude/

# Add MCP config
git add .mcp.json

# Add documentation
git add docs/audit/

# Add context files
git add CLAUDE.md .cursorrules

# Commit
git commit -m "feat: add complete multi-agent orchestration system

- Add 8 specialist agents (orchestrator, CEO, CFO, PM, architect, developer, QA, deployment)
- Add 6 workflow commands (planning, feature, ceo-review, database, test, deploy)
- Add quality hooks (pre-edit, post-write, post-dev, session-start)
- Add 6 MCP server configurations (GitHub, filesystem, postgres, puppeteer, slack, sequential-thinking)
- Add comprehensive documentation (architecture, implementation guide, troubleshooting)
- Add CLI + Cursor sync support

System enables natural language triggering of complete SDLC workflows.
Agents communicate via file-based protocol (requirements.md, architecture.md, etc.)
Quality gates enforce testing, type-checking, and linting automatically.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin main
```

#### Step 27.2: Create Release Notes

**Tag release:**

```bash
git tag -a v1.0.0-orchestrator -m "Initial orchestrator system release"
git push --tags
```

**Create GitHub release with notes:**

```markdown
# InTime v3 Orchestrator System v1.0.0

## What's New

Complete multi-agent orchestration system for systematic software development.

### Features

**8 Specialist Agents:**
- Orchestrator - Routes requests to appropriate agents
- CEO/CFO Advisors - Business strategy and financial analysis
- PM Agent - Requirements gathering and user stories
- Architect Agent - Database schema and API design
- Developer Agent - Code implementation with tests
- QA Agent - Comprehensive testing and bug detection
- Deployment Agent - CI/CD and deployment management

**6 Workflow Commands:**
- `/start-planning` - Requirements + architecture
- `/feature <name>` - Full SDLC (PM → Dev → QA)
- `/ceo-review <topic>` - Business analysis
- `/database <feature>` - Database design
- `/test` - Full test suite execution
- `/deploy <env>` - Deployment orchestration

**Quality Automation:**
- Pre-edit validation (prevent invalid operations)
- Post-write auto-formatting (prettier)
- Post-development quality checks (type-check, lint, test)
- Session start project status display

**MCP Integration:**
- GitHub (repository management)
- Filesystem (file operations)
- PostgreSQL (database access)
- Puppeteer (browser automation)
- Slack (team notifications)
- Sequential Thinking (enhanced reasoning)

### Getting Started

1. Install Claude Code CLI: `npm install -g @anthropic-ai/claude-code`
2. Clone repository
3. Copy `.env.local.example` to `.env.local` and add tokens
4. Run `claude` from project root
5. Try `/feature test-feature`

### Documentation

- `docs/audit/project-setup-architecture.md` - Complete system architecture
- `docs/audit/implementation-guide.md` - Setup instructions
- `docs/audit/troubleshooting.md` - Common issues and solutions
- `docs/onboarding-guide.md` - Team onboarding

### Breaking Changes

None (initial release)

### Known Issues

None identified in testing

### Contributors

- [Your team members]
- Claude AI (Co-Authored)
```

#### Step 27.3: Announce to Team

**Slack announcement:**

```
🚀 InTime v3 Orchestrator System is LIVE!

We now have a complete multi-agent development workflow system powered by Claude Code.

What this means:
✅ Natural language feature development ("I want to add user auth" → complete implementation)
✅ Automated quality gates (tests, type-checking, linting)
✅ Business analysis on demand (/ceo-review for strategic decisions)
✅ Full SDLC in one command (/feature <name>)

Getting started:
1. Read docs/onboarding-guide.md
2. Run `claude` from project root
3. Try `/feature your-first-feature`

Questions? Ask in #engineering

Demo session: [Schedule time]
```

---

### Day 28: Monitoring & Iteration (Ongoing)

#### Step 28.1: Usage Monitoring

**Track for first week:**
- Which agents used most?
- Which workflows most popular?
- Average workflow completion time?
- Issues reported?

**Create `docs/usage-metrics.md`:**

```markdown
# Orchestrator Usage Metrics

## Week 1 (Nov 15-22, 2025)

### Agent Invocations
- Orchestrator: 47 (always active)
- PM Agent: 12
- Developer Agent: 12
- QA Agent: 10
- Architect Agent: 8
- CEO Advisor: 3
- CFO Advisor: 2
- Deployment Agent: 1

### Workflow Usage
- /feature: 8 times
- /start-planning: 4 times
- /test: 6 times
- /ceo-review: 2 times
- /deploy: 1 time

### Completion Rate
- Successful: 90% (18/20 workflows)
- Failed: 10% (2/20 - due to test failures, expected behavior)

### Average Duration
- /feature: 45 minutes (simple features)
- /start-planning: 20 minutes
- /test: 10 minutes

### Cost
- Total API usage: ~$12 for week
- Per feature cost: ~$1.50
- ROI: ~40 hours saved (development time) vs. $12 spent = 333x ROI

### Issues Reported
- None critical
- 2 minor: Hook false positives (resolved by adjusting thresholds)
```

#### Step 28.2: Collect Feedback

**Survey team:**

1. What works well?
2. What's confusing?
3. Which agents need improvement?
4. What workflows are missing?
5. What would make this more useful?

#### Step 28.3: Iteration Plan

**Based on feedback, prioritize:**

1. **High impact, low effort:**
   - Improve agent prompt clarity
   - Add more workflow examples
   - Optimize hook performance

2. **High impact, high effort:**
   - Add new specialized agents (e.g., security-audit agent)
   - Implement cost-per-feature tracking
   - Build visual workflow dashboard

3. **Low priority:**
   - Nice-to-have integrations
   - Optional optimizations

**Document next iteration goals in project roadmap.**

---

**Week 4 Completion Checklist:**

- ✅ Cursor IDE sync verified
- ✅ Documentation complete:
  - ✅ Agent documentation
  - ✅ Workflow documentation
  - ✅ Troubleshooting guide
  - ✅ Onboarding guide
- ✅ Cost optimization performed
- ✅ Team onboarding materials created
- ✅ Production readiness testing passed
- ✅ System deployed to version control
- ✅ Release created and announced
- ✅ Usage monitoring in place
- ✅ Feedback collection process established

**🎉 Orchestrator system fully operational and team-ready!**

---

## Testing & Verification

### Unit Testing Agents

**Test each agent individually:**

```bash
# Create test script
cat > scripts/test-agents.sh << 'EOF'
#!/bin/bash

echo "Testing Orchestrator..."
echo "Test: 'Summarize user-vision.md'" | claude
# Verify: Orchestrator reads and summarizes

echo "Testing PM Agent..."
echo "I want to add a health check endpoint. Gather requirements." | claude
# Verify: PM asks questions, writes requirements.md

echo "Testing Architect Agent..."
echo "Design database schema for health check (read requirements.md)" | claude
# Verify: Architect writes architecture.md with schema

# Continue for all agents...

EOF

chmod +x scripts/test-agents.sh
```

### Integration Testing

**Test complete workflows:**

```bash
# Create integration test script
cat > scripts/test-workflows.sh << 'EOF'
#!/bin/bash

echo "=== Integration Test: Full Feature Workflow ==="

echo "Running /feature test-integration-workflow" | claude

# Wait for completion
sleep 300  # 5 minutes

# Verify outputs exist
if [ -f "requirements.md" ] && [ -f "architecture.md" ] && [ -f "implementation-log.md" ] && [ -f "test-report.md" ]; then
  echo "✅ All output files created"
else
  echo "❌ Missing output files"
  exit 1
fi

# Verify tests pass
pnpm test
if [ $? -eq 0 ]; then
  echo "✅ Tests passing"
else
  echo "❌ Tests failing"
  exit 1
fi

echo "✅ Integration test complete"

EOF

chmod +x scripts/test-workflows.sh
```

### Performance Testing

**Measure workflow times:**

```bash
# Create performance test script
cat > scripts/performance-test.sh << 'EOF'
#!/bin/bash

echo "=== Performance Test ==="

start_time=$(date +%s)

echo "Running /feature simple-api-endpoint" | claude

# Wait for completion (timeout after 30 min)
timeout 1800 tail -f /dev/null

end_time=$(date +%s)
duration=$((end_time - start_time))

echo "Duration: ${duration}s"

if [ $duration -lt 1800 ]; then
  echo "✅ Performance acceptable (<30 min)"
else
  echo "⚠️ Performance slow (>30 min)"
fi

EOF

chmod +x scripts/performance-test.sh
```

---

## Troubleshooting

### MCP Connection Issues

**Problem:** MCP servers not connecting

**Diagnosis:**

```bash
# Start with debug mode
claude --mcp-debug
```

**Look for:**
- Connection errors
- Missing environment variables
- npx failures

**Solutions:**

1. **Missing GITHUB_TOKEN:**

```bash
# Verify token exists
echo $GITHUB_TOKEN

# If empty, add to .env.local
echo "GITHUB_TOKEN=ghp_your_token" >> .env.local
```

2. **npx command not found:**

```bash
# Install Node.js
brew install node  # macOS
# or
apt install nodejs  # Linux
```

3. **MCP server package not found:**

```bash
# Manually install
npx @modelcontextprotocol/server-github --help

# Should download and show help
```

---

### Agent Not Responding

**Problem:** Orchestrator doesn't route to specialist agents

**Diagnosis:**

1. **Check agent file exists:**

```bash
ls -la .claude/agents/pm-agent.md
```

2. **Check agent YAML frontmatter:**

```bash
head -n 10 .claude/agents/pm-agent.md
```

**Should see:**
```yaml
---
name: pm-agent
description: ...
model: sonnet
---
```

3. **Check orchestrator routing rules:**

```bash
grep -A 5 "pm-agent" .claude/agents/orchestrator.md
```

**Solutions:**

1. **Agent name mismatch:**
   - Orchestrator references `pm-agent`
   - File is `pm_agent.md` (underscore instead of hyphen)
   - Fix: Rename file to use hyphens

2. **Missing description:**
   - Add clear description in YAML frontmatter
   - Description should explain when to use this agent

---

### Hooks Blocking Valid Operations

**Problem:** Hooks prevent legitimate edits

**Diagnosis:**

```bash
# Check which hook is blocking
cat .claude/hooks/scripts/pre-edit.sh
```

**Solutions:**

1. **Temporary disable:**

Edit `.claude/settings.json`:

```json
{
  "hooks": {
    // Comment out problematic hook
    // "PreToolUse": [...]
  }
}
```

2. **Adjust hook logic:**

Edit hook script to be less strict:

```bash
# In pre-edit.sh, change from blocking to warning:

# OLD:
echo "❌ Cannot edit files in node_modules"
exit 2  # Blocking error

# NEW:
echo "⚠️ Warning: Editing node_modules (allowed but not recommended)"
exit 0  # Allow but warn
```

---

### Workflow Timeout

**Problem:** Workflow takes too long, times out

**Diagnosis:**

1. **Identify which agent is slow:**

Monitor agent execution times:
- PM agent asking too many questions?
- Developer agent implementing complex feature?
- QA agent running too many tests?

2. **Check hook execution:**

Hooks have 30-60 second timeouts. If tests take longer, hook will fail.

**Solutions:**

1. **Increase hook timeout:**

Edit `.claude/settings.json`:

```json
{
  "hooks": {
    "SubagentStop": [{
      "matcher": "developer-agent",
      "hooks": [{
        "timeout": 120  // Increase from 60 to 120 seconds
      }]
    }]
  }
}
```

2. **Optimize agent prompts:**

Reduce unnecessary verbosity in agent outputs.

3. **Split large features:**

Instead of:
```
/feature complete-authentication-system
```

Do:
```
/feature auth-database-schema
/feature auth-api-endpoints
/feature auth-ui-components
```

---

### Cost Exceeding Budget

**Problem:** API costs higher than expected

**Diagnosis:**

1. **Track which model used most:**

- Opus: $15/million tokens
- Sonnet: $3/million tokens
- Haiku: $0.25/million tokens

2. **Measure token usage per agent:**

Orchestrator using Opus for simple routing = expensive

**Solutions:**

1. **Switch agents to cheaper models:**

Edit agent YAML:

```yaml
---
name: pm-agent
model: haiku  # Changed from sonnet
---
```

2. **Add caching to orchestrator:**

(Requires Claude Code caching feature support)

3. **Optimize prompts:**

- Remove redundant examples
- Reduce system prompt length
- Remove unnecessary context

---

### Tests Failing After Developer Agent

**Problem:** Post-dev hook reports test failures

**Diagnosis:**

1. **Which tests failing?**

```bash
pnpm test
```

2. **Check implementation-log.md:**

Did developer mention known issues?

**Solutions:**

1. **If false positive (test environment issue):**

Fix test environment, re-run workflow.

2. **If real bug:**

This is expected behavior! Hook caught the bug.

Ask developer agent to fix:

```
> "Fix the failing tests in implementation-log.md"
```

Developer will:
- Read test errors
- Fix code
- Re-run tests
- Verify passing

3. **If test too strict:**

Review test, adjust if needed.

---

### Parallel Workflows Conflict

**Problem:** Multiple agents editing same file simultaneously

**Diagnosis:**

```bash
git status
```

See merge conflicts in files.

**Solutions:**

1. **Partition work explicitly:**

```
> "Build 3 dashboard widgets in parallel, each in separate file:
- revenue-widget.tsx
- users-widget.tsx
- activity-widget.tsx"
```

2. **Run sequentially for conflicting changes:**

Instead of parallel, run sequential workflows.

3. **Manual merge:**

Resolve conflicts manually, commit.

---

## Maintenance & Optimization

### Monthly Maintenance Tasks

**Task 1: Update Agent Prompts**

Based on usage patterns, refine prompts:

```bash
# Review agent outputs from past month
ls requirements*.md architecture*.md

# Identify common issues
# Update agent prompts accordingly
```

**Task 2: Update MCP Servers**

```bash
# Check for MCP server updates
npx @modelcontextprotocol/server-github --version

# Update if newer version available
npm install -g @modelcontextprotocol/server-github@latest
```

**Task 3: Review Hooks Performance**

```bash
# Check hook execution times
# Optimize slow hooks
```

**Task 4: Cost Review**

```bash
# Review monthly API costs
# Adjust model selection if over budget
```

**Task 5: Agent Performance Review**

```bash
# Which agents used most?
# Which agents produce best outputs?
# Which agents need improvement?
```

---

### Quarterly Optimization Tasks

**Task 1: Agent Prompt Overhaul**

Complete review and rewrite of underperforming agents.

**Task 2: Workflow Addition**

Add new workflows based on team needs:

```bash
# Example: Security audit workflow
touch .claude/commands/workflows/security-audit.md
```

**Task 3: MCP Expansion**

Add new MCP servers for additional capabilities:

- Figma MCP (design integration)
- Sentry MCP (error tracking)
- Linear MCP (project management)

**Task 4: Team Training**

- Update onboarding materials
- Run training session for new workflows
- Collect feedback

---

### Scaling Considerations

**When to scale:**

- Team grows beyond 5 developers
- Workflow usage > 100/week
- API costs > $200/month

**How to scale:**

1. **Add specialized agents:**
   - Security audit agent
   - Performance optimization agent
   - Documentation agent

2. **Implement request queuing:**
   - Limit concurrent workflows
   - Queue requests during high usage

3. **Add caching:**
   - Cache common agent outputs
   - Reuse previous analyses

4. **Implement cost controls:**
   - Set per-agent budgets
   - Alert on high usage
   - Automatic fallback to cheaper models

---

## Conclusion

You now have a complete, production-ready multi-agent orchestration system for InTime v3.

**What you've built:**
- ✅ 8 specialist agents orchestrating complete SDLC
- ✅ 6 workflow commands for common tasks
- ✅ Quality automation via hooks
- ✅ 6 MCP servers for tool integration
- ✅ CLI + Cursor sync for flexibility
- ✅ Complete documentation and troubleshooting guides

**What this enables:**
- Natural language feature development
- Automated quality gates
- Business analysis on demand
- Team productivity multiplier (40-60% time savings)
- Systematic, repeatable development process

**Next steps:**
1. Use the system daily
2. Collect feedback
3. Iterate and improve
4. Share learnings with team
5. Celebrate the productivity gains! 🎉

**Questions or issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review `docs/audit/project-setup-architecture.md`
- Ask in team Slack channel

**Happy orchestrating! 🚀**
