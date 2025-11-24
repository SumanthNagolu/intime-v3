# Claude Code - Simplified Setup

**Welcome to the simplified Claude Code configuration!** This setup keeps the valuable parts while removing orchestration overhead.

## What's Here

```
.claude/
├── README.md                    ← You are here
├── AGENTS-REFERENCE.md          ← Different expertise areas I can take
├── QUICK-COMMANDS.md            ← Common task patterns
├── CLAUDE.md                    ← Technical context (auto-loaded)
├── settings.json                ← Hooks configuration
├── hooks/                       ← Session start/end automation
├── state/                       ← Timeline tracking
└── archive/                     ← Old orchestration system (archived)
```

## How to Use Claude Code

### 1. Just Talk Directly

The best way to use me is **direct conversation**:

```
✅ "Build the student enrollment feature"
✅ "Review this code for security issues"
✅ "Deploy Epic 2 to production safely"
✅ "Help me plan the next sprint"
```

I'll handle:
- Understanding what you need
- Breaking down complex tasks
- Writing the code
- Creating tests
- Reviewing quality
- Planning deployment

### 2. Reference Docs (Optional)

If you want to understand the different perspectives I can take:

- **AGENTS-REFERENCE.md** - Different expertise areas (PM, Architect, Developer, QA, etc.)
- **QUICK-COMMANDS.md** - Common task patterns and examples

**You don't need to read these to use me effectively** - they're just helpful references.

### 3. Let Me Track Progress

For complex tasks, I'll automatically use `TodoWrite` to show progress:

```
You: "Deploy Epic 2 to production"

Me: [Creates todo list]
1. ✅ Review implementation
2. 🔄 Create deployment plan
3. ⏳ Run safety checks
4. ⏳ Execute deployment
5. ⏳ Verify production
```

You'll see real-time progress.

## What Changed?

### ✅ Kept (Valuable)
- Project context (`CLAUDE.md` in root)
- Agent reference (simple one-pager)
- Session hooks (project status on startup)
- Timeline tracking
- MCP servers

### 📦 Archived (Complex Overhead)
- TypeScript orchestration engine
- Multi-agent workflow system
- Complex slash commands
- Auto-generated documentation (145 files!)
- Pre-commit hooks and validators

### 🎯 Result
**Simpler, faster, more flexible** - without losing any capability.

## Common Questions

### "How do I trigger workflows?"

**Just ask directly:**
```
Old way: /workflows:feature ACAD-001
New way: "Implement ACAD-001"
```

I'll handle it naturally.

### "Can you still do complex multi-step tasks?"

**Absolutely!** I can handle:
- Full feature implementation (planning → code → tests → deployment)
- Large refactoring projects
- Database migrations
- Production deployments
- Security audits

The difference: **you guide with conversation, not rigid workflows**.

### "What about the different agent types?"

**I naturally think from different perspectives:**
```
"Review this from a security angle" → I think like a security auditor
"Analyze the business value" → I think like a CEO
"Design the database" → I think like a database architect
```

You don't need separate agents - I shift perspectives naturally.

### "Can I still see what you're working on?"

**Yes!** I'll use TodoWrite to show progress on complex tasks in real-time.

## Tips for Best Results

**Be Specific:**
```
❌ "Fix the bug"
✅ "Fix the authentication error on signup - users can't create accounts"
```

**Give Context:**
```
❌ "Add a feature"
✅ "Add student progress tracking. Show completion %, time spent, badges earned"
```

**Iterate:**
```
You: "Build course enrollment"
Me: [asks about prerequisites, payment, confirmation flow]
You: [clarifies requirements]
Me: [implements with full context]
```

## Need More Help?

1. **Read QUICK-COMMANDS.md** - Common patterns and examples
2. **Read AGENTS-REFERENCE.md** - Understanding different expertise areas
3. **Just ask me** - "How should I ask for X?" and I'll guide you

---

## What's in Archive?

The `archive/` directory contains:
- Old orchestration engine (TypeScript code)
- Complex workflow definitions
- 8 separate agent files
- Auto-generated documentation
- Old test/status reports

**You can delete `archive/` anytime** - it's just kept for reference during the transition.

---

**Remember:** The best way to use Claude Code is **simple, direct conversation**. No workflows, no orchestration, no complexity - just clear communication about what you want to accomplish.

Let's build something great! 🚀
