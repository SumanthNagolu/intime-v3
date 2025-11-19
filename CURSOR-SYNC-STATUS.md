# Cursor ↔ Claude Code CLI Sync Status

## ✅ What Has Been Replicated to Cursor

### 1. Comprehensive Rules File (`.cursorrules`)
**Status:** ✅ COMPLETE (7,000+ lines)

**Includes:**
- All 8 agent expertise areas (CEO, CFO, PM, Database Architect, Frontend Dev, QA, etc.)
- Complete design philosophy (minimal design system, forbidden patterns)
- Code conventions (TypeScript strict mode, React/Next.js patterns, database operations)
- Testing requirements (multi-tenancy, cross-pillar workflows, 80%+ coverage)
- Quality standards (pre-commit checklist)
- Workflow patterns (feature development, candidate pipeline, cross-pollination)
- Business context (5-pillar model, cross-pollination principle, pod structure)

**How to Use:**
- Cursor automatically loads `.cursorrules` on startup
- Reference specific sections in prompts: "Follow the Database Architect guidelines in .cursorrules"
- Simulate agent expertise: "Act as PM Agent, create user story for..."

---

### 2. Workflow Guide (`CURSOR-CLAUDE-WORKFLOW.md`)
**Status:** ✅ COMPLETE

**Covers:**
- When to use each tool (strategic planning vs active development)
- Recommended daily workflow (morning/day/evening split)
- Complete workflow examples (new feature, bug fix, database change)
- Agent simulation in Cursor
- File sharing between tools
- Best practices and common scenarios

**How to Use:**
- Read once to understand optimal tool usage
- Reference specific scenarios: "Follow the 'New Feature (Full Cycle)' workflow"

---

### 3. MCP Server Configuration (`.mcp.json`)
**Status:** ✅ ALREADY COMPATIBLE

**Shared MCP Servers:**
- GitHub - Repository operations
- Filesystem - File operations
- PostgreSQL (Supabase) - Direct database access
- Puppeteer - Browser automation
- Slack - Team notifications
- Sequential Thinking - Enhanced reasoning

**How to Use:**
- Same `.mcp.json` works in both tools
- No changes needed
- MCP tools available in both environments

---

### 4. Documentation References
**Status:** ✅ COMPLETE (via `.cursorrules`)

**Accessible in Cursor:**
- `/CLAUDE.md` - Project fundamentals
- `/.claude/DESIGN-PHILOSOPHY.md` - Design system (CRITICAL for UI work)
- `/.claude/agents/` - All 8 specialist agent docs
- `/.claude/commands/workflows/` - Workflow commands
- `/docs/vision/` - Business vision
- `/docs/planning/epics/` - Feature epics and stories
- `/docs/audit/LESSONS-LEARNED.md` - What NOT to do

**How to Use:**
- Reference in prompts: "Follow the design standards in .claude/DESIGN-PHILOSOPHY.md"
- Let Cursor read the docs when needed

---

## ⚠️ What CANNOT Be Fully Replicated

### 1. Multi-Agent Orchestration
**Claude Code:** Native support for 8 specialist agents with automatic routing
**Cursor:** Single AI context

**Workaround:**
- Simulate agent expertise by telling Cursor which perspective to take
- Example: "Act as Database Architect (see .claude/agents/implementation/database-architect.md)"
- `.cursorrules` includes all agent knowledge for simulation

**Impact:** Medium (requires explicit instruction vs automatic routing)

---

### 2. Workflow Automation (Slash Commands)
**Claude Code:** `/feature`, `/database`, `/deploy`, `/candidate-pipeline`
**Cursor:** No native slash commands for complex workflows

**Workaround:**
- Follow documented workflows manually
- Reference workflow docs: "Follow the workflow in .claude/commands/workflows/feature.md"
- Use Cursor Composer for multi-step tasks

**Impact:** Low (workflows are well-documented, just not automated)

---

### 3. Session Hooks & Automation
**Claude Code:** 
- SessionStart hook (display project status)
- SessionEnd hook (auto-log to timeline)
- PreToolUse hooks (validate file paths before editing)
- PostToolUse hooks (quality checks)

**Cursor:** No hook system

**Workaround:**
- Manual quality checks using checklist in `.cursorrules`
- Git hooks for pre-commit validation (can be added)
- Manual session logging (if needed)

**Impact:** Low (hooks are nice-to-have, not critical)

---

### 4. State Management & Timeline
**Claude Code:** Automatic session logging to `.claude/state/timeline/`
**Cursor:** No automatic state management

**Workaround:**
- Use git commits for progress tracking
- Manual notes in project management tool
- Claude Code CLI for important sessions that need logging

**Impact:** Low (timeline is for record-keeping, not functionality)

---

### 5. Artifact Management
**Claude Code:** Automatic creation of artifacts (requirements.md, architecture.md, test-report.md)
**Cursor:** No automatic artifact creation

**Workaround:**
- Manually create documents in `.claude/state/artifacts/`
- Ask Cursor to create docs: "Create requirements.md following PM Agent template"
- Use Claude Code CLI for formal documentation

**Impact:** Low (can create manually when needed)

---

## 🎯 Optimal Tool Usage Strategy

### Use Claude Code CLI When You Need:

1. **Multi-Agent Orchestration**
   - Complete feature workflows (PM → Architect → Dev → QA → Deploy)
   - Strategic business decisions (CEO/CFO Advisor)
   - Complex decision-making with multiple perspectives

2. **Automated Workflows**
   - `/feature [name]` - Complete feature pipeline
   - `/database` - Schema design with RLS enforcement
   - `/candidate-pipeline` - Staffing-specific workflows
   - `/cross-pollination` - Opportunity detection

3. **Quality Automation**
   - Pre-commit hooks (RLS validation, audit trails)
   - Session logging
   - Automated quality checks

4. **Formal Documentation**
   - Requirements documents
   - Architecture decisions
   - Test reports
   - Deployment logs

---

### Use Cursor When You Need:

1. **Active Development**
   - Writing component code
   - Implementing designs
   - Quick iterations

2. **Visual Feedback**
   - See changes before applying
   - Multi-file editing view
   - File tree navigation

3. **Fast Iteration**
   - Tab autocomplete
   - Inline edits (Cmd+K)
   - Composer for extended conversations

4. **Debugging**
   - Understanding existing code
   - Tracing bugs across files
   - Quick fixes

---

## 📊 Replication Summary Table

| Feature | Claude Code CLI | Cursor | Workaround |
|---------|----------------|--------|------------|
| Agent Knowledge | ✅ 8 specialists | ✅ Consolidated in .cursorrules | Simulate agent in prompts |
| Design Philosophy | ✅ Native | ✅ In .cursorrules | Reference explicitly |
| Code Conventions | ✅ Native | ✅ In .cursorrules | Auto-applied |
| MCP Servers | ✅ 6 servers | ✅ Same .mcp.json | Fully compatible |
| Slash Commands | ✅ /feature, /database, etc. | ❌ Not available | Follow workflow docs |
| Multi-Agent Routing | ✅ Automatic | ❌ Manual | Specify agent in prompt |
| Session Hooks | ✅ Pre/Post hooks | ❌ Not available | Manual checks |
| Timeline Logging | ✅ Automatic | ❌ Not available | Git commits |
| Artifact Creation | ✅ Automatic | ❌ Manual | Create docs manually |
| Visual IDE | ❌ Terminal only | ✅ Full IDE | Use Cursor for this |
| Inline Edits | ❌ Not available | ✅ Cmd+K | Use Cursor for this |
| Tab Autocomplete | ❌ Not available | ✅ Native | Use Cursor for this |

---

## 🚀 Quick Start Guide

### First Time Setup (Already Done!)

✅ **Step 1:** Created comprehensive `.cursorrules` file
✅ **Step 2:** Created `CURSOR-CLAUDE-WORKFLOW.md` guide
✅ **Step 3:** Verified `.mcp.json` compatibility
✅ **Step 4:** Created this sync status document

### Using Cursor Now

**For Simple Tasks:**
```
// Just start coding, Cursor knows InTime conventions from .cursorrules
"Create a candidate form with Zod validation and minimal design"
```

**For Complex Tasks:**
```
// Specify agent perspective
"Act as Database Architect. Design a submissions table with RLS, 
multi-tenancy, and audit trails following InTime standards."
```

**For Strategic Decisions:**
```
// Reference CEO Advisor explicitly
"Act as CEO Advisor (see .claude/agents/strategic/ceo-advisor.md).
Should we build feature X or feature Y? Analyze cross-pollination 
opportunities and 5-year vision alignment."
```

---

## 📋 Daily Workflow Recommendation

### Morning (30-60 min) - Claude Code CLI
```bash
$ claude

# Strategic review
> "As CEO Advisor, review this week's priorities"

# Plan new feature
> "/start-planning"
> "/database"

# Output: Requirements, schema design in .claude/state/artifacts/
```

### Day (4-6 hours) - Cursor
```
Open Cursor, start Composer:

"Implement feature X following:
- Requirements: .claude/state/artifacts/requirements.md
- Schema: .claude/state/artifacts/database-schema.md
- Design: .claude/DESIGN-PHILOSOPHY.md

Build with Server Components, Zod validation, minimal design."

[Iterate, refine, test locally]
```

### Evening (30-60 min) - Claude Code CLI
```bash
$ claude

# Quality review
> "/test"

# Security audit
> "As Security Auditor, review feature X"

# Deploy
> "/deploy"

# Session auto-logs to timeline
```

---

## ✨ What You Get from This Sync

### Knowledge Parity
- Cursor now has access to all 8 specialist agent expertise
- Design philosophy embedded (no more AI-generic designs)
- Code conventions enforced (TypeScript strict, RLS, audit trails)
- Testing standards defined (80%+ coverage, multi-tenancy tests)

### Tool Flexibility
- Use whichever tool fits the task
- Both tools share configuration and documentation
- Seamless handoffs between tools

### Quality Consistency
- Same standards enforced in both tools
- `.cursorrules` ensures consistency
- Pre-commit hooks add additional safety net

### Maximum Productivity
- Strategic planning (Claude Code) + Fast implementation (Cursor)
- Best of both worlds
- No compromises

---

## 🔄 Keeping in Sync

### When You Update Claude Code CLI Agents

1. **Update `.cursorrules`** - Copy relevant changes
2. **Test in Cursor** - Verify new rules work
3. **Document changes** - Update this file

### When You Update Design Philosophy

1. **Update `.claude/DESIGN-PHILOSOPHY.md`** - Source of truth
2. **Update `.cursorrules`** - Sync design section
3. **Test compliance** - Verify new patterns enforced

### When You Add New Workflows

1. **Create in `.claude/commands/workflows/`** - Claude Code format
2. **Document in `CURSOR-CLAUDE-WORKFLOW.md`** - Cursor usage guide
3. **Reference in `.cursorrules`** - Quick reference

---

## 📞 Support & Questions

### Not Sure Which Tool to Use?

**Quick Decision Tree:**
- Need strategic planning? → Claude Code CLI
- Need to write code? → Cursor
- Need quality review? → Claude Code CLI
- Need to debug? → Cursor
- Need architecture design? → Claude Code CLI
- Need visual feedback? → Cursor

### Cursor Not Following InTime Standards?

**Solutions:**
1. Reference `.cursorrules` explicitly: "Follow the database standards in .cursorrules"
2. Specify agent perspective: "Act as Database Architect"
3. Point to design philosophy: "Use minimal design system from .claude/DESIGN-PHILOSOPHY.md"

### Need Agent Expertise Not in `.cursorrules`?

**Solutions:**
1. Read agent file directly: `.claude/agents/[tier]/[agent].md`
2. Ask Cursor to read it: "Review .claude/agents/strategic/ceo-advisor.md then..."
3. Copy relevant sections to `.cursorrules` for future use

---

## 🎓 Next Steps

### Recommended Actions:

1. ✅ **Read `CURSOR-CLAUDE-WORKFLOW.md`** - Understand optimal tool usage
2. ✅ **Try both tools** - Build something simple with each
3. ✅ **Establish your workflow** - Morning (Claude), Day (Cursor), Evening (Claude)
4. ✅ **Experiment with agent simulation** - "Act as Database Architect..."
5. ✅ **Reference design philosophy** - Before any UI work

### Advanced Usage:

6. Set up git hooks for pre-commit validation (optional)
7. Create custom MCP servers for InTime-specific integrations
8. Build workflow templates in both tools
9. Establish team conventions (which tool for what)

---

## 🎯 Success Metrics

**You'll know the sync is working when:**

- ✅ Cursor suggests code following InTime conventions (TypeScript strict, RLS, Zod validation)
- ✅ Cursor rejects AI-generic design patterns (purple gradients, emojis)
- ✅ Cursor includes multi-tenancy (org_id) in database queries automatically
- ✅ Cursor writes tests for multi-tenancy isolation
- ✅ Cursor uses minimal design system (beige/black/coral, sharp edges)
- ✅ You can seamlessly switch between tools without context loss

---

**Status:** ✅ SYNC COMPLETE
**Last Updated:** 2025-11-19
**Version:** 1.0
**Maintainer:** InTime Engineering Team

**Philosophy:** "Two tools, one vision, zero compromises."


