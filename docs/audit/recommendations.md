# Strategic Recommendations for InTime v3

**Document Date:** November 15, 2025
**Project:** intime-v3
**Purpose:** Strategic roadmap for systematic rebuild with proper architecture

---

## Executive Summary

Based on comprehensive audit of the legacy project and research into modern development practices with Claude Code + MCP, this document provides a strategic roadmap for building InTime v3 with proper architecture, systematic development, and integrated modules from day one.

**Key Recommendation:** Adopt a **Hybrid Approach** - Launch MVP in 3-4 weeks, complete full platform in 6-8 weeks.

---

## Table of Contents

1. [Strategic Options Analysis](#strategic-options-analysis)
2. [Recommended Approach](#recommended-approach)
3. [Architecture-First Design](#architecture-first-design)
4. [MCP-Powered Development Workflow](#mcp-powered-development-workflow)
5. [Phase-by-Phase Implementation Plan](#phase-by-phase-implementation-plan)
6. [Design System & UI Philosophy](#design-system--ui-philosophy)
7. [Technology Stack Confirmation](#technology-stack-confirmation)
8. [Risk Mitigation](#risk-mitigation)
9. [Success Metrics](#success-metrics)
10. [Next 48 Hours Action Plan](#next-48-hours-action-plan)

---

## Strategic Options Analysis

### Option A: Quick MVP Launch (2-3 weeks) ⚡

**Approach:**
- Ship Academy (95% complete)
- Ship Marketing Website (95% complete)
- Ship Admin Portal (90% complete)
- Skip Trikala AI features (manual workflows)
- Skip Productivity advanced features

**Pros:**
- Start revenue immediately
- Validate market with real users
- Reduce time to feedback
- Lower risk

**Cons:**
- Limited feature set
- Manual workarounds needed
- Delayed competitive advantages (AI features)

**Timeline:** 2-3 weeks
**Risk:** Low
**Revenue:** Start Week 3

---

### Option B: Full Platform (7-8 weeks) 🏗️

**Approach:**
- Build complete architecture upfront
- Implement all 8 modules with integration
- Complete all AI features
- Full testing and documentation

**Pros:**
- Complete offering from day one
- No compromises on vision
- Full competitive advantage
- Better user experience

**Cons:**
- Longer time to revenue
- Higher upfront complexity
- Risk of perfectionism paralysis

**Timeline:** 7-8 weeks
**Risk:** Medium
**Revenue:** Start Week 8

---

### Option C: Hybrid Approach (4 weeks to MVP, +4 weeks to complete) 🎯 **RECOMMENDED**

**Approach:**

**Phase 1 (Week 1): Architecture Foundation**
- Design unified database schema
- Implement integration layer
- Set up MCP development workflow
- Configure quality gates

**Phase 2 (Week 2-3): MVP Launch**
- Ship Academy with proper architecture
- Ship Marketing Website
- Ship Admin Portal
- All modules use unified schema from day one

**Phase 3 (Week 4-7): Complete Platform**
- Add HR module
- Add Productivity Intelligence
- Complete Trikala with AI
- Full integration across all modules

**Pros:**
- Best of both worlds
- Revenue starts at Week 3
- Proper architecture from day one
- Incremental delivery reduces risk
- Each phase is production-ready

**Cons:**
- Requires discipline to not skip architecture
- Slightly longer than quick MVP

**Timeline:** 3 weeks to MVP, 7 weeks to complete platform
**Risk:** Low-Medium
**Revenue:** Start Week 3, scale Week 7

**VERDICT:** ✅ **Recommended - Balances speed, quality, and revenue**

---

## Recommended Approach: Hybrid with Architecture-First

### Core Principles

1. **Architecture Before Features**
   - Design complete database schema upfront
   - Implement integration layer before modules
   - Establish patterns before scaling

2. **Incremental Delivery**
   - Ship working software every 2 weeks
   - Each release is production-ready
   - Iterate based on real feedback

3. **Systematic Development**
   - Use MCP-powered agent workflows
   - Enforce quality via automated hooks
   - Test-driven for critical paths

4. **Salvage What Works**
   - Copy production-ready components from legacy
   - Refactor for new architecture
   - Don't reinvent working wheels

---

## Architecture-First Design

### 1. Unified Database Schema

**Philosophy:** Single Source of Truth for All Entities

#### Core Entities

**User Management (Single System):**
```sql
-- ONE user table to rule them all
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,

  -- Universal fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, suspended, archived

  -- Role-specific fields (nullable)
  -- Student fields
  student_enrollment_date TIMESTAMPTZ,
  student_graduation_date TIMESTAMPTZ,
  student_level INT DEFAULT 1,
  student_xp INT DEFAULT 0,

  -- Employee fields
  employee_hire_date TIMESTAMPTZ,
  employee_department_id UUID REFERENCES departments(id),
  employee_title TEXT,

  -- Candidate fields
  candidate_status TEXT, -- sourcing, screening, submitted, placed
  candidate_resume_url TEXT,

  -- Client fields
  client_company_name TEXT,
  client_industry TEXT,

  -- Admin/HR fields
  admin_level TEXT -- admin, super_admin, hr_manager, recruiter
);

-- Role-based access via junction table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- student, employee, candidate, client, admin, etc.
  permissions JSONB
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id),
  role_id UUID REFERENCES roles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES user_profiles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Benefits:**
- User can have multiple roles simultaneously
- Single authentication flow
- Unified permission system
- Cross-module data access solved
- CEO dashboard can query all users

#### Module-Specific Entities

**Academy Module:**
- `products` (courses)
- `topics` (curriculum)
- `topic_content_items` (videos, text, demos)
- `topic_completions` (progress tracking)
- `quizzes`, `quiz_questions`, `quiz_attempts`
- `learning_paths`, `learning_blocks`
- `xp_transactions`, `achievements`, `user_achievements`

**HR Module:**
- `departments`, `teams`
- `timesheets`, `attendance`, `work_shifts`
- `leave_types`, `leave_balances`, `leave_requests`
- `expense_claims`, `expense_items`, `expense_categories`
- `document_templates`, `generated_documents`
- `workflow_instances`, `workflow_stage_history`

**Productivity Module:**
- `productivity_screenshots`
- `productivity_ai_analysis`
- `productivity_work_summaries` (9 time windows)
- `productivity_presence`
- `productivity_teams`, `productivity_team_members`
- `processing_batches`, `productivity_scores`

**Trikala Workflow Platform:**
- `workflow_templates`, `workflow_instances`
- `object_types`, `objects` (candidates, jobs, placements)
- `pods`, `pod_members`
- `activity_definitions`, `user_activities`
- `performance_targets`, `achievements`
- `peer_feedback`, `sourcing_sessions`
- `resume_database`, `ai_job_matches`

**CMS Module:**
- `media_assets`
- `blog_posts`, `blog_post_versions`
- `resources`, `resource_downloads`
- `banners`, `banner_analytics`
- `cms_pages`, `cms_audit_log`

**Guidewire Guru:**
- `knowledge_chunks` (with pgvector embeddings)
- `companion_conversations`, `companion_messages`

**CRM/ATS:**
- `candidates` → Links to `user_profiles`
- `clients` → Links to `user_profiles`
- `contacts`, `jobs`, `applications`, `interviews`
- `placements`, `opportunities`
- `activities`, `notes`, `documents`, `tags`

**Cross-Module:**
- `notifications` (unified notification system)
- `system_events` (event bus)
- `audit_logs` (compliance tracking)
- `integrations` (external systems)

#### Migration Strategy

**Day 1: Create Complete Schema**
```bash
# Single migration file with ALL tables
supabase/migrations/20251115_complete_unified_schema.sql

# Includes:
- All tables with proper relationships
- All indexes for performance
- All RLS policies for security
- All functions and triggers
- Sample seed data
```

**Benefits:**
- No schema evolution chaos
- Clear dependencies from start
- Easy to reason about relationships
- Database migrations are predictable

---

### 2. Integration Layer (Event-Driven Architecture)

**Philosophy:** Modules Communicate via Events, Not Direct Calls

#### Event Bus Implementation

```typescript
// lib/events/event-bus.ts

export type SystemEvent =
  // Academy Events
  | { type: 'topic.completed', payload: { userId: string, topicId: string } }
  | { type: 'course.graduated', payload: { userId: string, courseId: string } }
  | { type: 'achievement.earned', payload: { userId: string, achievementId: string } }

  // HR Events
  | { type: 'employee.hired', payload: { userId: string, departmentId: string } }
  | { type: 'leave.approved', payload: { leaveId: string, userId: string } }

  // Trikala Events
  | { type: 'candidate.placed', payload: { candidateId: string, jobId: string } }
  | { type: 'workflow.completed', payload: { workflowId: string, objectId: string } }

  // Cross-Module Events
  | { type: 'user.role.granted', payload: { userId: string, roleId: string } }
  | { type: 'notification.send', payload: { userId: string, message: string } };

export class EventBus {
  private handlers: Map<string, Array<(event: SystemEvent) => Promise<void>>> = new Map();

  subscribe<T extends SystemEvent>(
    eventType: T['type'],
    handler: (event: T) => Promise<void>
  ) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as any);
  }

  async publish(event: SystemEvent) {
    // Persist event to database
    await db.system_events.insert({
      type: event.type,
      payload: event.payload,
      timestamp: new Date(),
    });

    // Trigger handlers
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }
}

export const eventBus = new EventBus();
```

#### Example Integration Flows

**Flow 1: Student Graduates → Becomes Candidate**

```typescript
// modules/academy/handlers.ts
eventBus.subscribe('course.graduated', async (event) => {
  const { userId, courseId } = event.payload;

  // Grant candidate role
  await grantRole(userId, 'candidate');

  // Create candidate profile
  await db.user_profiles.update(userId, {
    candidate_status: 'bench',
    candidate_resume_url: null, // To be generated
  });

  // Trigger resume generation
  await eventBus.publish({
    type: 'candidate.ready_for_resume',
    payload: { userId, courseId }
  });

  // Notify recruitment team
  await eventBus.publish({
    type: 'notification.send',
    payload: {
      userId: await getRecruitmentManagerId(),
      message: `New graduate ready for placement: ${await getUserName(userId)}`
    }
  });
});
```

**Flow 2: Candidate Placed → Update HR + Productivity + Trikala**

```typescript
// modules/trikala/handlers.ts
eventBus.subscribe('candidate.placed', async (event) => {
  const { candidateId, jobId } = event.payload;

  // Grant employee role
  await grantRole(candidateId, 'employee');

  // Create HR record
  await db.user_profiles.update(candidateId, {
    employee_hire_date: new Date(),
    employee_department_id: await getDepartmentForJob(jobId),
  });

  // Add to productivity tracking
  await db.productivity_teams.addMember({
    teamId: await getTeamForJob(jobId),
    userId: candidateId,
  });

  // Close workflow
  await db.workflow_instances.update({
    objectId: candidateId,
    status: 'completed',
  });

  // Celebrate!
  await eventBus.publish({
    type: 'achievement.earned',
    payload: {
      userId: await getRecruiterForPlacement(candidateId),
      achievementId: 'placement_success',
    }
  });
});
```

**Benefits:**
- Modules stay decoupled
- Easy to add new integrations
- Audit trail via event log
- Retry logic for failed handlers
- Testing is easier (mock event bus)

---

### 3. API Layer Standardization (tRPC)

**Philosophy:** Type-Safe APIs with Single Pattern

#### Unified tRPC Router

```typescript
// lib/trpc/root-router.ts

import { academyRouter } from '@/modules/academy/trpc';
import { hrRouter } from '@/modules/hr/trpc';
import { triakalaRouter } from '@/modules/trikala/trpc';
import { adminRouter } from '@/modules/admin/trpc';
import { productivityRouter } from '@/modules/productivity/trpc';
import { companionsRouter } from '@/modules/companions/trpc';

export const appRouter = router({
  academy: academyRouter,
  hr: hrRouter,
  trikala: triakalaRouter,
  admin: adminRouter,
  productivity: productivityRouter,
  companions: companionsRouter,
});

export type AppRouter = typeof appRouter;
```

#### Standard Response Pattern

```typescript
// lib/trpc/response.ts

export type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// All procedures return this type
export function success<T>(data: T): APIResponse<T> {
  return { success: true, data };
}

export function error(code: string, message: string, details?: unknown): APIResponse<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}
```

**Benefits:**
- Type safety from database to UI
- Single API pattern across entire app
- Auto-generated client types
- Easy to mock for testing
- Built-in error handling

---

### 4. Authentication & Authorization

**Philosophy:** One Login, Role-Based Access

#### Unified Auth Flow

```typescript
// lib/auth/unified-login.ts

export async function login(email: string, password: string) {
  // 1. Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;

  // 2. Get user profile with roles
  const profile = await db.user_profiles.findByIdWithRoles(authData.user.id);

  // 3. Determine default portal based on roles
  const defaultPortal = determineDefaultPortal(profile.roles);

  // 4. Redirect to appropriate dashboard
  return {
    user: profile,
    redirectTo: defaultPortal,
    availablePortals: getAvailablePortals(profile.roles),
  };
}

function determineDefaultPortal(roles: string[]): string {
  // Priority order
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('hr_manager')) return '/hr';
  if (roles.includes('employee')) return '/platform';
  if (roles.includes('student')) return '/academy';
  if (roles.includes('client')) return '/enterprise';
  return '/portals'; // Portal selector
}
```

#### Row-Level Security (RLS) Policies

```sql
-- Example: Students can only see their own data
CREATE POLICY "Students can view own topics"
ON topic_completions
FOR SELECT
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'student')
  )
);

-- Example: HR managers can see all employee data
CREATE POLICY "HR managers can view all employees"
ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('hr_manager', 'admin'))
  )
);

-- Example: Recruiters can see candidates in their pods
CREATE POLICY "Recruiters can view pod candidates"
ON candidates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pod_members
    WHERE pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
    )
  )
);
```

**Benefits:**
- Security enforced at database level
- Can't bypass with API manipulation
- Clear permission boundaries
- Easy to audit

---

## MCP-Powered Development Workflow

### Philosophy: Software Agency Model via Claude Code + MCP

Instead of manually prompting for each feature, configure Claude Code with MCP servers and custom agents to replicate a software agency workflow.

### MCP Server Configuration

**Create:** `~/.cursor/mcp.json` (or Claude Code equivalent)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/sumanthrajkumarnagolu/Projects/intime-v3"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

### Custom Subagents

**Create:** `.claude/subagents/`

#### Project Manager Agent

**File:** `.claude/subagents/pm.md`

```markdown
---
name: project-manager
description: Technical PM for task breakdown and orchestration
model: sonnet
tools: [github, filesystem]
---

You are a Technical Project Manager for the InTime platform.

## Your Responsibilities

1. **Requirements Analysis**
   - Break down user stories into actionable tasks
   - Identify dependencies between tasks
   - Estimate complexity and timeline

2. **Task Management**
   - Create GitHub issues for each task
   - Assign labels (feature, bug, refactor, etc.)
   - Prioritize based on MVP requirements

3. **Progress Tracking**
   - Monitor task completion
   - Identify blockers
   - Report status to user

4. **Quality Gates**
   - Ensure tests are written
   - Verify documentation is updated
   - Check integration requirements

## Task Breakdown Template

For each user request, create:
- [ ] Architecture/design task
- [ ] Database schema (if needed)
- [ ] API implementation
- [ ] UI components
- [ ] Tests (unit + integration)
- [ ] Documentation

Always consider integration with existing modules.
```

#### Developer Agent

**File:** `.claude/subagents/developer.md`

```markdown
---
name: developer
description: Full-stack developer for implementation
model: sonnet
tools: [github, filesystem, postgres]
---

You are a Senior Full-Stack Developer for the InTime platform.

## Your Responsibilities

1. **Implementation**
   - Write clean, type-safe TypeScript code
   - Follow established patterns (tRPC, Next.js App Router)
   - Use Supabase for database operations
   - Implement proper error handling

2. **Code Quality**
   - Follow TypeScript strict mode
   - Use proper TypeScript types (no `any`)
   - Write self-documenting code
   - Add comments for complex logic

3. **Integration**
   - Emit events via event bus for cross-module communication
   - Use tRPC for all API calls
   - Follow unified database schema

4. **Testing**
   - Write unit tests for business logic
   - Write integration tests for API endpoints
   - Ensure >80% code coverage

## Code Standards

**File Structure:**
- Components: `components/[module]/[feature]/ComponentName.tsx`
- API: `modules/[module]/trpc.ts`
- Types: `types/[module].ts`
- Utils: `lib/[category]/utility-name.ts`

**Naming Conventions:**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Internal modules
4. Relative imports
5. Types
```

#### Tester Agent

**File:** `.claude/subagents/tester.md`

```markdown
---
name: tester
description: QA engineer for automated testing
model: sonnet
tools: [github, filesystem, puppeteer]
---

You are a QA Engineer for the InTime platform.

## Your Responsibilities

1. **Test Planning**
   - Identify critical user paths
   - Define test scenarios
   - Create test data

2. **Unit Testing (Vitest)**
   - Test business logic functions
   - Test utility functions
   - Mock external dependencies
   - Aim for >80% coverage

3. **Integration Testing**
   - Test API endpoints
   - Test database operations
   - Test event handlers

4. **E2E Testing (Playwright)**
   - Test complete user flows
   - Test across different roles (student, employee, admin)
   - Test responsive design

5. **Bug Reporting**
   - Create GitHub issues for bugs
   - Include reproduction steps
   - Add screenshots/videos
   - Assign appropriate labels

## Test Structure

**Unit Test Template:**
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('FeatureName', () => {
  it('should do expected behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**E2E Test Template:**
```typescript
import { test, expect } from '@playwright/test';

test('User can complete topic', async ({ page }) => {
  // Login as student
  // Navigate to topic
  // Complete topic
  // Verify completion
});
```
```

### Slash Commands for Workflows

**Create:** `.claude/commands/`

#### New Feature Workflow

**File:** `.claude/commands/feature.md`

```markdown
# New Feature Development Workflow

Execute this systematic workflow for developing a new feature:

## 1. Planning (PM Agent)

- Analyze requirements
- Break down into tasks
- Create GitHub issues
- Identify integration points

## 2. Architecture (PM + Developer)

- Design database schema changes (if needed)
- Design API contracts
- Identify affected modules
- Plan event emissions

## 3. Implementation (Developer Agent)

- Create feature branch: `feature/[feature-name]`
- Implement database migrations
- Implement tRPC procedures
- Implement UI components
- Emit integration events

## 4. Testing (Tester Agent)

- Write unit tests
- Write integration tests
- Write E2E tests for critical path
- Run all tests: `pnpm test`
- Verify >80% coverage

## 5. Code Review

- Self-review checklist:
  - [ ] TypeScript strict mode passes
  - [ ] No console.logs
  - [ ] Error handling implemented
  - [ ] Loading states implemented
  - [ ] Events emitted for integration
  - [ ] RLS policies updated
  - [ ] Documentation updated

## 6. Integration Testing

- Test cross-module functionality
- Verify event handlers work
- Check CEO dashboard can access data

## 7. Deployment

- Create PR
- Run CI/CD pipeline
- Merge to main
- Deploy to staging
- User acceptance testing
- Deploy to production

Use this workflow for ALL new features to ensure consistency and quality.
```

#### Bug Fix Workflow

**File:** `.claude/commands/bugfix.md`

```markdown
# Bug Fix Workflow

## 1. Reproduce (Tester Agent)

- Document steps to reproduce
- Identify affected component/module
- Check error logs
- Create GitHub issue if not exists

## 2. Write Failing Test (Tester Agent)

- Write unit test that reproduces bug
- Verify test fails
- Commit failing test

## 3. Fix (Developer Agent)

- Implement fix
- Ensure test now passes
- Check for similar issues in codebase

## 4. Regression Testing (Tester Agent)

- Run full test suite
- Verify no new failures
- Test related functionality

## 5. Deploy

- Create PR with bug number
- Deploy to staging
- Verify fix in staging
- Deploy to production
```

### Quality Hooks

**Create:** `.claude/hooks/`

#### Pre-Commit Hook

**File:** `.claude/hooks/pre-commit.ts`

```typescript
export async function hook(context: HookContext) {
  console.log("🔍 Running pre-commit quality checks...");

  // 1. Type checking
  console.log("  Checking TypeScript types...");
  await context.exec("pnpm type-check");

  // 2. Linting
  console.log("  Running ESLint...");
  await context.exec("pnpm lint");

  // 3. Tests
  console.log("  Running tests...");
  await context.exec("pnpm test");

  // 4. Format check
  console.log("  Checking code formatting...");
  await context.exec("pnpm prettier --check .");

  console.log("✅ All quality checks passed!");

  return { allow: true };
}
```

#### Pre-Push Hook

**File:** `.claude/hooks/pre-push.ts`

```typescript
export async function hook(context: HookContext) {
  console.log("🚀 Running pre-push checks...");

  // 1. Full test suite
  console.log("  Running full test suite with coverage...");
  await context.exec("pnpm test:coverage");

  // 2. Build check
  console.log("  Verifying build succeeds...");
  await context.exec("pnpm build");

  // 3. E2E tests (critical path only)
  console.log("  Running critical E2E tests...");
  await context.exec("pnpm test:e2e:critical");

  console.log("✅ All checks passed! Safe to push.");

  return { allow: true };
}
```

### Benefits of This Workflow

**Consistency:**
- Every feature follows same process
- Quality gates enforced automatically
- No steps skipped

**Speed:**
- Agents work in parallel where possible
- MCP servers provide direct tool access
- No context switching

**Quality:**
- Tests written for every feature
- Code review checklist enforced
- Integration verified automatically

**Team Collaboration:**
- Workflows are version controlled (git)
- Team members use same process
- Easy onboarding for new developers

---

## Phase-by-Phase Implementation Plan

### Week 1: Foundation 🏗️

#### Day 1: Database Design & Project Setup

**Morning (4 hours):**
1. Design complete unified database schema
   - All 150+ tables
   - All relationships
   - All RLS policies
   - Sample seed data
2. Create migration file: `20251115_complete_unified_schema.sql`
3. Document schema in `docs/architecture/database-schema.md`

**Afternoon (4 hours):**
1. Initialize Next.js 15 project with TypeScript
   ```bash
   npx create-next-app@latest intime-v3 --typescript --tailwind --app
   ```
2. Configure Supabase CLI
   ```bash
   npx supabase init
   npx supabase start
   ```
3. Run database migration
   ```bash
   npx supabase db push
   ```
4. Generate TypeScript types
   ```bash
   npx supabase gen types typescript --local > types/database.ts
   ```

#### Day 2: Integration Layer

**Morning (4 hours):**
1. Implement event bus (`lib/events/event-bus.ts`)
2. Create system_events table
3. Write tests for event bus
4. Document event patterns

**Afternoon (4 hours):**
1. Set up tRPC (`lib/trpc/`)
2. Create root router
3. Implement standard response types
4. Create example procedure

#### Day 3: MCP Configuration & Agents

**Morning (4 hours):**
1. Configure MCP servers (`~/.cursor/mcp.json`)
2. Test MCP connectivity: `claude --mcp-debug`
3. Verify GitHub, Filesystem, Postgres access

**Afternoon (4 hours):**
1. Create custom subagents (`.claude/subagents/`)
   - pm.md
   - developer.md
   - tester.md
2. Create workflow commands (`.claude/commands/`)
   - feature.md
   - bugfix.md
   - test.md
3. Create quality hooks (`.claude/hooks/`)
   - pre-commit.ts
   - pre-push.ts

#### Day 4: Authentication & Authorization

**Morning (4 hours):**
1. Implement unified login flow
2. Create role-based access utilities
3. Set up middleware for route protection
4. Create portal selector page

**Afternoon (4 hours):**
1. Implement RLS policies for all tables
2. Test permission boundaries
3. Create auth integration tests

#### Day 5: Salvage UI Components

**All Day (8 hours):**
1. Copy shadcn/ui components from legacy (`components/ui/`)
2. Copy reusable layouts and patterns
3. Create design system documentation
4. Set up Storybook (optional but recommended)

#### Day 6-7: Testing Infrastructure

**Day 6 Morning (4 hours):**
1. Configure Vitest for unit/integration tests
2. Write example tests
3. Set up coverage reporting
4. Configure test database

**Day 6 Afternoon (4 hours):**
1. Configure Playwright for E2E tests
2. Write example E2E test
3. Set up visual regression testing (optional)

**Day 7 Morning (4 hours):**
1. Set up GitHub Actions CI/CD
2. Configure automated testing on PR
3. Set up deployment pipeline (Vercel)

**Day 7 Afternoon (4 hours):**
1. Documentation:
   - Architecture overview
   - Development workflow
   - Testing guide
   - Deployment guide

**End of Week 1 Deliverables:**
- ✅ Complete database schema deployed
- ✅ Integration layer functional
- ✅ MCP-powered development workflow ready
- ✅ Authentication system working
- ✅ Testing infrastructure in place
- ✅ CI/CD pipeline configured
- ✅ Documentation complete

---

### Week 2-3: MVP Launch 🚀

#### Week 2: Academy + Marketing + Admin

**Monday-Tuesday: Academy Module**
1. Copy components from legacy: `components/academy/`
2. Refactor for new auth system
3. Implement tRPC procedures
4. Update to use unified user_profiles table
5. Write tests for critical paths:
   - Topic progression
   - Quiz completion
   - AI mentor chat
6. Test integration: Student graduates → Event emitted

**Wednesday: Marketing Website**
1. Copy components from legacy: `components/marketing/`
2. Update forms to use new API
3. Integrate with CMS module
4. SEO optimization
5. Performance optimization
6. Deploy to production domain

**Thursday: Admin Portal**
1. Copy components from legacy: `components/admin/`
2. Refactor for unified schema
3. Implement CMS management
4. Integrate analytics
5. Test admin workflows

**Friday: Integration & Testing**
1. Write E2E tests for MVP user flows:
   - Student signup → enroll → complete topic
   - Admin creates course → publishes → student sees it
2. User acceptance testing
3. Bug fixes
4. Performance optimization

#### Week 3: Polish & Launch

**Monday-Wednesday: Polish**
1. UI/UX refinements based on design inspiration:
   - Apply Apple minimalism
   - Add Tesla sleekness
   - Ensure Deloitte trustworthiness
2. Accessibility audit (WCAG 2.1 AA)
3. Mobile responsiveness testing
4. Load testing and performance optimization

**Thursday: Production Prep**
1. Set up production environment
2. Configure production Supabase project
3. Run database migrations
4. Set up monitoring (Sentry)
5. Configure analytics (Google Analytics)
6. Set up backups

**Friday: MVP Launch! 🎉**
1. Deploy to production
2. Smoke testing in production
3. Monitor error logs
4. Announce to initial users
5. Gather feedback

**End of Week 3 Deliverables:**
- ✅ Academy module live and accepting students
- ✅ Marketing website attracting leads
- ✅ Admin portal managing content
- ✅ Production monitoring active
- ✅ Revenue generation begins

---

### Week 4-5: HR + Productivity

#### Week 4: HR Module

**Monday-Tuesday: Core HR Features**
1. Copy HR components from legacy
2. Refactor for unified user system:
   - employees table → user_profiles with employee role
3. Implement tRPC procedures for:
   - Employee management
   - Department/team management
   - Timesheet tracking
4. Write tests

**Wednesday: Leave Management**
1. Implement leave request/approval workflow
2. Email notifications via event bus
3. Calendar integration
4. Manager dashboard

**Thursday: Expense Management**
1. Implement expense claim workflow
2. Receipt upload to Supabase Storage
3. Approval workflow
4. Reimbursement tracking

**Friday: HR Analytics**
1. HR dashboard with metrics:
   - Headcount by department
   - Attendance rates
   - Leave trends
2. Integration with CEO dashboard
3. Testing and bug fixes

#### Week 5: Productivity Intelligence

**Monday: Desktop Agent**
1. Copy working desktop agent: `productivity-capture/`
2. Update API endpoints for new schema
3. Test screenshot capture and upload
4. Verify idle detection

**Tuesday: AI Analysis**
1. Implement Claude Vision integration
2. Batch processing optimization
3. Activity categorization
4. Project/client detection

**Wednesday-Thursday: Hierarchical Summarization**
1. Implement 9 time-window summaries
2. AI narrative generation
3. Context-aware synthesis
4. Real-time updates

**Friday: Productivity Dashboard**
1. Team view components
2. Individual reports
3. Bottleneck detection
4. Manager insights
5. Testing and optimization

**End of Week 5 Deliverables:**
- ✅ HR module managing employees
- ✅ Productivity Intelligence tracking team
- ✅ Integration events flowing between modules
- ✅ CEO dashboard showing unified metrics

---

### Week 6-7: Trikala Platform Completion

#### Week 6: Core Trikala Features

**Monday: Workflow Designer**
1. Copy React Flow workflow designer from legacy
2. Update for new schema
3. Test template creation
4. Test workflow instances

**Tuesday: Pod Management**
1. Implement pod creation and member assignment
2. Performance tracking
3. Team dashboards
4. Leaderboards

**Wednesday: AI Integration - Resume Parsing**
1. Implement resume upload
2. GPT-4o parsing to extract:
   - Contact info
   - Work experience
   - Education
   - Skills
3. Auto-populate candidate profile

**Thursday: AI Integration - Job Matching**
1. Implement job description analysis
2. Vector search for candidate matching
3. AI-powered ranking
4. Match explanations

**Friday: Sourcing Hub**
1. Multi-source aggregation (LinkedIn, Indeed, Dice APIs)
2. Quota tracking (30 resumes per JD)
3. Duplicate detection
4. Candidate pipeline view

#### Week 7: Production Dashboard & Launch

**Monday-Tuesday: Production Dashboard**
1. Real-time workflow visualization
2. AI-powered bottleneck detection:
   - Stages with high dwell time
   - Candidates stuck in pipeline
   - Resource allocation suggestions
3. Performance analytics:
   - Submissions per recruiter
   - Time to placement
   - Conversion rates

**Wednesday: Gamification**
1. Activity definitions
2. Point calculations
3. Achievements
4. Leaderboard integration

**Thursday: Full Platform Testing**
1. End-to-end integration tests across ALL modules
2. Cross-module event verification
3. Performance testing under load
4. Security audit

**Friday: Full Platform Launch! 🚀**
1. Deploy all modules to production
2. Comprehensive smoke testing
3. User onboarding (employees, recruiters)
4. Training sessions
5. Monitor and support

**End of Week 7 Deliverables:**
- ✅ Complete platform with all 8 modules live
- ✅ Full integration across modules via event bus
- ✅ AI-powered features operational
- ✅ Production monitoring and analytics active
- ✅ Team onboarded and using platform

---

### Week 8+: Optimization & Scale

**Ongoing:**
1. Gather user feedback
2. Fix bugs and optimize
3. Add requested features
4. Scale infrastructure as needed
5. Expand to new markets/clients

---


---

## Technology Stack Confirmation

### Frontend

**Framework:** Next.js 15.0.2+
- App Router (Server Components by default)
- Streaming & Suspense
- Server Actions
- Metadata API for SEO

**Language:** TypeScript 5.6.3+ (Strict Mode)

**Styling:**
- Tailwind CSS 3.4.15+
- CSS Modules for complex components
- Framer Motion for animations

**UI Components:**
- shadcn/ui (customizable, accessible)
- Radix UI primitives
- Lucide icons

**State Management:**
- Server state: tRPC + React Query
- Client state: Zustand (minimal, for UI state only)
- URL state: Next.js router (searchParams)

### Backend

**Database:** Supabase (PostgreSQL 15+)
- Row Level Security (RLS)
- Real-time subscriptions
- Supabase Storage for media
- Supabase Auth for authentication

**API Layer:** tRPC 10+
- Type-safe APIs
- Auto-generated client types
- Built-in error handling

**AI Services:**
- OpenAI (GPT-4o, GPT-4o-mini, Embeddings)
- Anthropic Claude (Sonnet 3.5, Opus for vision)
- Vercel AI SDK for streaming

**Vector Search:** pgvector (for RAG in Companions)

### DevOps

**Hosting:** Vercel (Next.js optimized)
- Edge Functions
- ISR (Incremental Static Regeneration)
- Image Optimization

**CI/CD:** GitHub Actions
- Automated testing on PR
- Automated deployment to staging/production
- Database migrations validation

**Monitoring:**
- Sentry (error tracking)
- Vercel Analytics (performance)
- Google Analytics (user behavior)

**Email:** Resend (developer-friendly)

**Rate Limiting:** Upstash Redis

### Development Tools

**Package Manager:** pnpm (fast, disk-efficient)

**Testing:**
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- Testing Library (React component tests)

**Code Quality:**
- ESLint (linting)
- Prettier (formatting)
- TypeScript strict mode
- Husky (git hooks)

**Documentation:**
- Markdown docs in `/docs`
- Storybook (component library - optional)

---

## Risk Mitigation

### Risk 1: Scope Creep

**Risk:** Adding features mid-development, delaying launch

**Mitigation:**
- Define MVP features clearly (Week 1)
- Maintain "Future Enhancements" backlog
- User stories must be approved before implementation
- Bi-weekly scope review with stakeholder

### Risk 2: Integration Failures

**Risk:** Modules don't integrate properly despite event bus

**Mitigation:**
- Write integration tests from Week 1
- Test cross-module flows weekly
- Use feature flags for risky integrations
- Maintain event bus audit log for debugging

### Risk 3: AI Cost Overruns

**Risk:** AI usage exceeds budget, especially productivity module

**Mitigation:**
- Set up cost alerts in OpenAI/Anthropic dashboards
- Implement rate limiting per user
- Use cheaper models where possible (GPT-4o-mini)
- Batch processing for productivity analysis
- Cache AI responses aggressively

### Risk 4: Performance Issues

**Risk:** App is slow with multiple modules active

**Mitigation:**
- Performance budgets defined (Core Web Vitals)
- Lighthouse CI in GitHub Actions
- Database query optimization (explain analyze)
- Implement caching strategy (Redis)
- Use Next.js streaming and suspense

### Risk 5: Data Migration Issues

**Risk:** Moving data from legacy to new schema fails

**Mitigation:**
- Test migration on copy of production database
- Write rollback scripts
- Migrate in phases (users first, then module data)
- Verify data integrity after migration
- Keep legacy database as backup for 30 days

### Risk 6: Security Vulnerabilities

**Risk:** Security holes due to rapid development

**Mitigation:**
- Security audit before production launch
- Automated security scanning (Snyk, Dependabot)
- RLS policies reviewed by second developer
- Penetration testing (Week 7)
- Bug bounty program post-launch (optional)

### Risk 7: Team Unavailability

**Risk:** Key developer unavailable during critical phase

**Mitigation:**
- Comprehensive documentation from Day 1
- Code reviews ensure knowledge sharing
- Pair programming for complex features
- Cross-training on all modules

---

## Success Metrics

### Technical Metrics

**Code Quality:**
- Test coverage: >80%
- TypeScript strict mode: 100% (no `any`)
- Lint errors: 0
- Build time: <2 minutes
- Bundle size: <500KB (initial load)

**Performance:**
- Lighthouse Score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

**Reliability:**
- Uptime: >99.9%
- Error rate: <0.1%
- API response time p95: <500ms
- Database query time p95: <100ms

### Business Metrics

**MVP Launch (Week 3):**
- 10 students enrolled in Academy
- 5 blog posts published via CMS
- 100 website visitors
- 10 leads captured

**Full Platform (Week 7):**
- 50 students in Academy
- 20 employees using platform
- 5 active recruiters using Trikala
- 100 candidates in database
- 10 job postings active

**3 Months Post-Launch:**
- 200 students ($10,000 MRR)
- 50 employees ($7,500 MRR)
- 10 client companies ($15,000 MRR)
- Total MRR: $32,500
- Operating costs: ~$1,500
- Profit: $31,000/month

### User Experience Metrics

**Engagement:**
- Daily Active Users (DAU): >60% of enrolled users
- Session duration: >15 minutes (Academy)
- Topic completion rate: >80%
- Return rate: >70% week-over-week

**Satisfaction:**
- Net Promoter Score (NPS): >50
- Customer Satisfaction (CSAT): >4.5/5
- Support ticket volume: <5/week
- Feature request volume: >10/month (indicates engagement)

---

## Next 48 Hours Action Plan

### Hour 0-4: Audit Review & Decision

**You (User):**
1. Read all audit documents (2 hours)
2. Review recommendations (1 hour)
3. Make strategic decision: MVP-first or Full Platform (30 minutes)
4. Approve Phase 1 plan (30 minutes)

### Hour 4-8: Environment Setup

**With Claude Code:**
1. Set up GitHub repository
2. Configure MCP servers
3. Initialize Next.js 15 project
4. Initialize Supabase project
5. Set up environment variables

### Hour 8-16: Database Design

**With Claude Code (PM Agent + Developer Agent):**
1. Design complete unified schema (4 hours)
   - All 150+ tables
   - All relationships
   - All RLS policies
2. Review and refine (2 hours)
3. Create migration SQL file (1 hour)
4. Document schema (1 hour)

### Hour 16-24: Database Deployment & Validation

**With Claude Code (Developer Agent):**
1. Run migration on local Supabase
2. Generate TypeScript types
3. Seed sample data
4. Test RLS policies
5. Verify all relationships

### Hour 24-32: Integration Layer

**With Claude Code (Developer Agent):**
1. Implement event bus (2 hours)
2. Write event bus tests (2 hours)
3. Set up tRPC (2 hours)
4. Create example procedure (1 hour)
5. Document patterns (1 hour)

### Hour 32-40: MCP Workflow Configuration

**With Claude Code:**
1. Create custom subagents (PM, Developer, Tester)
2. Create slash commands (feature, bugfix)
3. Create quality hooks (pre-commit, pre-push)
4. Test workflow end-to-end
5. Document for team

### Hour 40-48: Authentication & First Component

**With Claude Code (Developer Agent + Tester Agent):**
1. Implement unified login flow (3 hours)
2. Create portal selector page (1 hour)
3. Write authentication tests (2 hours)
4. Copy first salvageable component from legacy (1 hour)
5. Deploy to staging (1 hour)

### End of 48 Hours

**Deliverables:**
- ✅ Project initialized
- ✅ Complete database schema deployed
- ✅ Integration layer working
- ✅ MCP workflow operational
- ✅ Authentication functional
- ✅ First component deployed to staging

**Next Steps:**
- Proceed with Week 1 plan (Day 5-7)
- Then Week 2-3 for MVP launch

---

## Conclusion

### You Have Everything You Need

**Legacy Project Provides:**
- 70%+ production-ready code to salvage
- Validated product-market fit
- Proven technology stack
- Clear lessons on what NOT to do

**New Architecture Provides:**
- Unified database (no fragmentation)
- Integration layer (event-driven)
- Systematic development (MCP agents)
- Quality enforcement (automated hooks)

**Timeline is Realistic:**
- Week 1: Foundation (architecture, integration, MCP)
- Week 2-3: MVP (Academy + Marketing + Admin)
- Week 4-7: Full Platform (HR + Productivity + Trikala)
- Total: 6-8 weeks to production-ready platform

### The Vision is Achievable

You're not building from scratch. You're **refactoring with a plan**.

**Confidence Level: 95%**

This is doable. The architecture is sound. The workflow is systematic. The tools (Claude Code + MCP) enable the software agency model you envisioned.

**Let's build this right.**

---

**Ready to proceed?**

Please review these documents and let me know:
1. Which strategic approach you prefer (MVP-first, Full Platform, or Hybrid)
2. Any adjustments to the timeline
3. Any specific concerns or questions
4. When you'd like to start (recommend: immediately)

Once you confirm, we'll kick off the 48-hour sprint to get the foundation in place.

🚀 **Let's make InTime v3 a reality.**
