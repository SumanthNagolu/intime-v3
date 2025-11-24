# Cursor + Claude Code CLI: Optimal Workflow Guide

## Overview

InTime v3 uses **two complementary AI development tools**:
- **Claude Code CLI** - Multi-agent orchestration (strategic planning, architecture, quality gates)
- **Cursor** - Active development (coding, debugging, visual feedback)

Both tools share configuration (`.mcp.json`) and documentation (`.claude/`, `docs/`), but serve different purposes.

---

## Tool Strengths & Division of Labor

### Claude Code CLI Strengths

**Native Multi-Agent Support:**
- 8 specialist agents with distinct expertise
- Automatic routing based on task type
- Agent handoffs with context preservation

**Workflow Automation:**
- `/feature` - Complete PM → Architect → Dev → QA → Deploy pipeline
- `/candidate-pipeline` - Staffing-specific workflow
- `/cross-pollination` - Opportunity detection workflow
- `/database` - Schema design with RLS enforcement

**Quality Gates:**
- Pre-commit hooks (RLS validation, audit trails)
- Session start/end hooks (automatic logging)
- PostToolUse validation

**State Management:**
- Automatic session logging to `.claude/state/timeline/`
- Artifact management (requirements, architecture, test reports)

**When to Use Claude Code CLI:**
1. Strategic planning & business decisions
2. Complete feature workflows (multi-stage)
3. Database schema design
4. Architecture decisions
5. Security audits
6. Quality reviews

---

### Cursor Strengths

**IDE Integration:**
- Deep VSCode integration
- Inline edits (Cmd+K)
- Visual file tree
- Split panes for comparing files

**Visual Feedback:**
- See changes before applying
- Multi-file editing view
- Diff visualization
- File tree highlighting

**Developer Velocity:**
- Tab autocomplete (fast!)
- Inline suggestions
- Composer mode (long conversations)
- Quick iterations

**When to Use Cursor:**
1. Active coding & implementation
2. Component development
3. Debugging & bug fixes
4. Refactoring existing code
5. Quick iterations
6. Visual UI feedback
7. File navigation & exploration

---

## Recommended Daily Workflow

### Morning: Strategic Planning (Claude Code CLI)

**Goal:** Define what to build and why

```bash
# 1. Review business strategy
claude "As CEO Advisor, review this week's priorities and cross-pollination opportunities"

# 2. Plan feature (if new feature)
claude "/start-planning" 
# PM Agent gathers requirements, writes user stories

# 3. Design architecture
claude "/database"
# Database Architect designs schema with RLS, audit trails

# Output:
# - .claude/state/artifacts/requirements.md
# - .claude/state/artifacts/architecture.md
# - Clear implementation plan
```

**Duration:** 30-60 minutes
**Output:** Clear requirements, schema design, success criteria

---

### Day: Active Development (Cursor)

**Goal:** Implement the plan

```typescript
// Open Cursor Composer (Cmd+Shift+I or Cmd+L)

// Example conversation:
"Implement the candidate submission feature following:
1. Requirements in .claude/state/artifacts/requirements.md
2. Schema design from architecture.md
3. Design standards from .claude/DESIGN-PHILOSOPHY.md

Build:
- Server Component for candidate list
- Client Component for submission form
- Zod validation
- Server Action for submission
- Multi-tenancy (org_id filtering)
- Soft delete support

Use minimal design system (beige bg, black text, coral accents, sharp edges)."

// Cursor will:
// - Create multiple files
// - Show visual diff before applying
// - Allow you to edit/refine
// - Apply changes when you approve
```

**Duration:** 4-6 hours
**Output:** Working implementation, tested locally

---

### Evening: Quality Review (Claude Code CLI)

**Goal:** Ensure quality and deploy

```bash
# 1. Run comprehensive tests
claude "/test"
# QA Agent creates test suite, runs tests, validates:
# - Multi-tenancy isolation
# - Cross-pillar workflows
# - Design compliance
# - Accessibility

# 2. Security audit (if sensitive data)
claude "As Security Auditor, review the candidate submission feature for:
- RLS policies
- PII handling
- GDPR compliance
- Input validation"

# 3. Deploy (when ready)
claude "/deploy"
# Deployment Specialist:
# - Runs migrations (with RLS)
# - Deploys with feature flags
# - Sets up monitoring
# - Creates rollback plan

# Session ends, auto-logs to timeline
```

**Duration:** 30-60 minutes
**Output:** Tests passing, security verified, deployed

---

## Workflow Examples

### Example 1: New Feature (Full Cycle)

**Scenario:** Build "Candidate Resume Upload" feature

#### Phase 1: Strategic Planning (Claude Code CLI)

```bash
$ claude

> "As CEO Advisor, should we build resume upload now or later? Consider:
- Which pillars benefit?
- Cross-pollination opportunities
- Resource allocation
- Alternatives (e.g., LinkedIn integration)"

# CEO Advisor responds with strategic analysis:
# - Pillar impact: Recruiting (high), Bench Sales (medium)
# - Cross-pollination score: 7/10 (resume analysis can identify training gaps)
# - Recommendation: BUILD NOW (high ROI, blocks other features)

> "/start-planning"

# PM Agent gathers requirements:
# - User stories with acceptance criteria
# - Cross-pollination opportunities defined
# - Success metrics (80% adoption, 50% faster screening)

> "/database"

# Database Architect designs:
# - resumes table (with RLS, org_id, soft deletes)
# - resume_skills junction table
# - S3 storage integration plan
# - Performance indexes
```

**Artifacts Created:**
- `.claude/state/artifacts/ceo-recommendation.md`
- `.claude/state/artifacts/requirements.md`
- `.claude/state/artifacts/database-schema.md`

---

#### Phase 2: Implementation (Cursor)

Open Cursor Composer:

```
"Implement resume upload feature following:

Requirements: .claude/state/artifacts/requirements.md
Schema: .claude/state/artifacts/database-schema.md
Design: .claude/DESIGN-PHILOSOPHY.md (minimal style)

Create:

1. Database schema (src/lib/db/schema/resumes.ts):
   - resumes table (RLS enabled, org_id, audit trails)
   - resume_skills junction table
   - Drizzle schema with proper types

2. Server Action (src/app/candidates/[id]/actions.ts):
   - uploadResume(formData, candidateId)
   - Zod validation for file type/size
   - S3 upload via Supabase Storage
   - Multi-tenancy check (org_id validation)
   - Extract skills using AI (optional enhancement)

3. UI Component (src/components/features/ResumeUpload.tsx):
   - Client component (needs file input)
   - Drag & drop zone
   - File validation (PDF/DOCX, max 5MB)
   - Upload progress indicator
   - Minimal design (beige bg, black text, sharp edges)

4. Tests (tests/features/resume-upload.test.ts):
   - Multi-tenancy isolation
   - File validation
   - S3 upload success/failure
   - UI accessibility

Include:
- TypeScript strict mode (no 'any')
- Zod validation on all inputs
- Error handling with user-friendly messages
- Loading states
- Accessibility (keyboard, screen reader)"
```

Cursor will:
1. Create all files
2. Show you the implementation
3. Let you review/edit
4. Apply when you approve

**You can iterate:**
- "Make the drag zone larger with more visual feedback"
- "Add skill extraction from resume text"
- "Change the upload button to black with white text"

**Duration:** 2-3 hours with iterations

---

#### Phase 3: Quality & Deploy (Claude Code CLI)

```bash
$ claude

> "/test"

# QA Agent creates comprehensive test suite:
# - Unit tests (file validation, S3 upload)
# - Integration tests (database operations with RLS)
# - E2E tests (upload flow, multi-tenancy)
# - Accessibility tests (keyboard nav, screen reader)
# - Design compliance (no AI-generic patterns)

> "As Security Auditor, review resume upload for:
- File type validation (prevent malicious uploads)
- Size limits (prevent DoS)
- S3 permissions (public vs private)
- PII in resumes (GDPR compliance)
- RLS policies (org isolation)"

# Security Auditor reviews and provides recommendations

> "/deploy"

# Deployment Specialist:
# - Runs migration (creates resumes table with RLS)
# - Deploys to staging first
# - Runs smoke tests
# - Deploys to production with feature flag
# - Sets up monitoring (upload success rate, errors)
# - Documents rollback plan
```

**Total Time:** 4-6 hours (start to finish)
**Output:** Production-ready feature with tests and monitoring

---

### Example 2: Quick Bug Fix (Cursor Only)

**Scenario:** Candidate email validation is too strict

```
// In Cursor:
// 1. Cmd+Shift+F: Search "email validation"
// 2. Find: src/lib/validations/candidate.ts
// 3. Cmd+K (inline edit):

"The email validation is rejecting valid emails with '+' symbols.
Update the Zod schema to allow '+' in email addresses."

// Cursor fixes inline:
email: z.string().email() // Already handles '+'

// Wait, it should work. Let me check the regex...

"Show me where we're using a custom email regex"

// Finds custom regex in form component:
const emailRegex = /^[a-z0-9]+@[a-z]+\.[a-z]+$/

// Fix:
"Replace custom regex with standard email validation"

// Done in 5 minutes, no need for Claude Code CLI
```

---

### Example 3: Database Schema Change (Claude Code CLI)

**Scenario:** Add "visa_expiry_date" to candidates table

**Why Claude Code CLI:** Database changes require RLS, migrations, multi-tenancy considerations

```bash
$ claude

> "As Database Architect, add visa_expiry_date to candidates table.

Consider:
- Is this PII? (Yes - affects cross-border hiring)
- Should it trigger alerts? (Yes - 90 day expiry warning)
- RLS implications? (Yes - only admins/recruiters can see)
- Cross-pollination? (Yes - expiring visa → training opportunity)"

# Database Architect responds with:
# 1. Migration script (add column, update RLS)
# 2. New RLS policy (visa_data_access)
# 3. Index on visa_expiry_date for alerts
# 4. Event trigger (90-day expiry warning)
# 5. Cross-pollination hook (expiring visa → training lead)

> "Generate the migration and update the schema"

# Creates:
# - src/lib/db/migrations/0005_add_visa_expiry.sql
# - Updates src/lib/db/schema/candidates.ts
# - Updates RLS policies
```

Then switch to **Cursor** to implement the UI for visa_expiry_date.

---

## Agent Expertise Simulation in Cursor

Since Cursor has a single AI context (not 8 agents), tell it which "agent perspective" to take:

### Database Work

```
"Act as Database Architect (see .claude/agents/implementation/database-architect.md).

Design the submissions table with:
- RLS policies
- Multi-tenancy (org_id)
- Audit trails
- Proper indexing

Follow InTime database standards."
```

### UI Work

```
"Act as Frontend Developer (see .claude/agents/implementation/frontend-developer.md).

Build a candidate form using:
- Minimal design system (beige/white/black/coral)
- Sharp edges (no rounded corners)
- System fonts only
- Zod validation
- Server Component where possible

NO purple gradients, emojis, or AI-generic patterns."
```

### Testing

```
"Act as QA Engineer (see .claude/agents/operations/qa-engineer.md).

Create test suite for candidate submission with:
- Multi-tenancy isolation tests (CRITICAL)
- Cross-pillar workflow tests
- Design compliance tests (no AI patterns)
- Accessibility tests
- 80%+ coverage"
```

### Strategic Review

```
"Act as CEO Advisor (see .claude/agents/strategic/ceo-advisor.md).

Analyze this feature idea: [describe feature]

Evaluate:
- Which of the 5 pillars benefit?
- Cross-pollination score (target: 5+ opportunities)
- 5-year vision alignment (Internal → SaaS → IPO)
- Resource allocation (is this the best use of time?)
- Market differentiation (how does this separate us from competitors?)"
```

---

## File Sharing Between Tools

Both tools share:

### Configuration
- `.mcp.json` - MCP server configuration (works identically in both)
- `.env.local` - Environment variables (same values)
- `tsconfig.json`, `next.config.js` - Project config

### Documentation
- `CLAUDE.md` - Project context
- `.claude/` - All agent docs, workflows, design philosophy
- `docs/` - Business vision, epics, stories
- `.cursorrules` - Cursor-specific consolidated rules (this was just created!)

### Code
- Everything in `src/`, `tests/`, etc.

### State (Claude Code CLI only)
- `.claude/state/timeline/` - Session logs (Cursor doesn't write here)
- `.claude/state/artifacts/` - Requirements, architecture docs (Cursor reads, doesn't write)

---

## Best Practices

### 1. Start with Strategy (Claude Code)

Don't jump into coding. Ask:
- Is this feature worth building?
- Which pillars benefit?
- What are the cross-pollination opportunities?
- How does this fit the 5-year vision?

**Tool:** Claude Code CLI with CEO/CFO Advisors

---

### 2. Plan Before Implementing (Claude Code)

Get clear requirements and architecture:
- User stories with acceptance criteria
- Database schema with RLS
- API contracts
- Success metrics

**Tool:** Claude Code CLI with PM Agent + Database Architect

---

### 3. Implement with Visual Feedback (Cursor)

Build the actual code:
- See changes before applying
- Iterate quickly
- Visual file tree
- Inline edits

**Tool:** Cursor with Composer mode

---

### 4. Test Thoroughly (Both)

Write tests alongside code:
- Unit tests (Cursor - fast iteration)
- Integration tests (Cursor)
- E2E tests (Claude Code - QA Agent creates comprehensive suite)
- Design compliance (Claude Code - automated checks)

**Tools:** Both (Cursor for writing, Claude Code for comprehensive review)

---

### 5. Review Quality (Claude Code)

Before deploying:
- Security audit
- Design compliance
- Performance review
- Accessibility check

**Tool:** Claude Code CLI with QA + Security Auditor

---

### 6. Deploy Safely (Claude Code)

Production deployment:
- Migrations with RLS
- Feature flags
- Monitoring
- Rollback plan

**Tool:** Claude Code CLI with Deployment Specialist

---

## Common Scenarios

### "I need to understand existing code"

**Use:** Cursor
**Why:** Visual file tree, quick navigation, inline explanations

```
// In Cursor:
"Explain how candidate submission works, tracing from:
1. The form component
2. The server action
3. The database operation
4. The RLS policy"
```

---

### "I need to plan a complex feature"

**Use:** Claude Code CLI
**Why:** Multi-agent orchestration (PM → Architect → strategic review)

```bash
$ claude "/feature 'Advanced candidate search with AI matching'"
# Routes through PM → Architect → CEO review → Implementation plan
```

---

### "I need to fix a visual bug"

**Use:** Cursor
**Why:** Visual feedback, inline edits, fast iteration

```
// Cursor Cmd+K on the component:
"The button is too small on mobile. Make it full-width on screens < 768px"
```

---

### "I need to add a database table"

**Use:** Claude Code CLI
**Why:** Database Architect ensures RLS, multi-tenancy, audit trails

```bash
$ claude "As Database Architect, design a 'job_postings' table with:
- RLS policies
- Multi-tenancy
- Audit trails
- Relationship to clients table"
```

---

### "I need to refactor a component"

**Use:** Cursor
**Why:** Visual multi-file editing, see changes across files

```
// Cursor Composer:
"Refactor CandidateCard to:
1. Extract submission logic to separate hook
2. Move validation to Zod schema
3. Simplify the render logic
Show me the changes before applying."
```

---

### "I need to ensure security compliance"

**Use:** Claude Code CLI
**Why:** Security Auditor has comprehensive checklist

```bash
$ claude "As Security Auditor, review the new payment processing feature for:
- PII handling
- RLS policies
- Input validation
- GDPR compliance
- Encryption requirements"
```

---

## Integration Tips

### Share Context via Files

When switching from Claude Code → Cursor:

```bash
# In Claude Code CLI:
$ claude "/start-planning"
# Creates: .claude/state/artifacts/requirements.md

# Then in Cursor:
"Implement the feature described in .claude/state/artifacts/requirements.md"
```

### Share Context via Git Commits

Commit after each phase:

```bash
# After Claude Code planning:
git commit -m "docs: add requirements and architecture for resume upload"

# After Cursor implementation:
git commit -m "feat: implement resume upload with S3 integration"

# After Claude Code QA:
git commit -m "test: add comprehensive test suite for resume upload"
```

### Use Both in Same Session

Keep both open:
- **Left monitor:** Cursor (coding)
- **Right monitor:** Terminal with Claude Code CLI (planning/review)

Workflow:
1. Claude Code: "Design the schema"
2. Cursor: Implement the schema
3. Claude Code: "Review the implementation"
4. Cursor: Fix issues
5. Claude Code: "Run tests"

---

## Keyboard Shortcuts Reference

### Cursor
- `Cmd+L` - Composer (long conversation)
- `Cmd+K` - Inline edit
- `Cmd+Shift+F` - Search across files
- `Tab` - Accept autocomplete
- `Cmd+I` - Chat in sidebar

### Claude Code CLI
- Just type naturally in terminal
- Use `/feature`, `/database`, `/deploy` for workflows
- Session auto-saves on exit

---

## Troubleshooting

### "Cursor doesn't understand InTime context"

**Solution:** Reference the agent docs explicitly:

```
"Review .claude/agents/implementation/database-architect.md, then design
the candidates table following InTime standards (RLS, org_id, audit trails)"
```

### "Claude Code is too slow for quick iterations"

**Solution:** Use Cursor for implementation, Claude Code for planning/review

### "I need both planning AND fast iteration"

**Solution:** Use Claude Code for initial plan, then switch to Cursor:

```bash
# Claude Code:
$ claude "/database"
# Get schema design

# Cursor:
"Implement the schema from .claude/state/artifacts/database-schema.md
and iterate on the API layer"
```

---

## Summary: The Perfect Workflow

**Morning (Claude Code CLI):**
- Strategic review
- Requirements gathering
- Architecture design

**Day (Cursor):**
- Active coding
- Component development
- Quick iterations
- Bug fixes

**Evening (Claude Code CLI):**
- Quality review
- Testing
- Security audit
- Deployment

**Result:** Best of both worlds - strategic planning + fast implementation + quality assurance

---

**Last Updated:** 2025-11-19
**For Questions:** Review `.claude/AGENT-USAGE-EXAMPLES.md` for more scenarios


