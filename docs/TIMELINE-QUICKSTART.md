# Timeline System - Quick Start Guide

**🎯 Goal:** Track every interaction, decision, and outcome in your project with a powerful logging system.

---

## ⚡ 5-Minute Quick Start

### 1. Start a Session

```bash
pnpm timeline session start "Working on authentication feature"
```

### 2. Log Your Work

```bash
# Log what you did
pnpm timeline add "Implemented JWT authentication"

# Log with tags
pnpm timeline add "Fixed login bug" --tags bug,auth

# Log with more detail
pnpm timeline add "Designed database schema" \
  --tags database,design \
  --decision "Using soft deletes for audit trail" \
  --note "Need to add cleanup job later"
```

### 3. View Your History

```bash
# List recent entries
pnpm timeline list

# Search for something
pnpm timeline search "authentication"

# View statistics
pnpm timeline stats
```

### 4. End Session

```bash
pnpm timeline session end
```

### 5. View Dashboard

```bash
pnpm dev
# Open http://localhost:3000/admin/timeline
```

---

## 📋 Common Commands

```bash
# Quick log
pnpm timeline add "Your summary here"

# Log with status
pnpm timeline add "Completed feature X" --status success

# Log with tags
pnpm timeline add "Refactored code" --tags refactor,cleanup

# Search
pnpm timeline search "bug"

# List last 20 entries
pnpm timeline list --limit 20

# View statistics
pnpm timeline stats

# Session management
pnpm timeline session start "Goal description"
pnpm timeline session end
pnpm timeline session current
```

---

## 🎨 Real-World Examples

### Morning Standup Log

```bash
pnpm timeline add "Yesterday: Completed user authentication. Today: Working on dashboard" \
  --tags standup,auth,dashboard
```

### Bug Fix

```bash
pnpm timeline add "Fixed infinite loop in data sync" \
  --tags bug,critical \
  --decision "Added cycle detection" \
  --status success
```

### Feature Complete

```bash
pnpm timeline add "User profile feature complete" \
  --tags feature,milestone \
  --status success
```

### Learning Note

```bash
pnpm timeline add "Learned about Supabase RLS policies" \
  --tags learning,database \
  --note "Need to implement for all tables"
```

---

## 🤖 Automatic Logging

Timeline entries are automatically created when:

- ✅ Session starts (via session-start hook)
- ✅ Session ends (via session-end hook)
- ✅ Git changes detected (auto-tagged)

No manual work required!

---

## 📊 Dashboard Features

Access at `http://localhost:3000/admin/timeline`:

- 📈 **Statistics** - Total entries, sessions, success rate
- 🔍 **Search** - Full-text search across all entries
- 🏷️ **Filter by Tags** - database, auth, ui, testing, etc.
- 📋 **Expandable Cards** - Click to see full details
- 📊 **Charts** - Status breakdown, top tags

---

## 🚀 Next Steps

1. **Set up Supabase** (optional, but recommended)
   - Run migration: `src/lib/db/migrations/001_create_timeline_tables.sql`
   - Configure database connection
   - Enable full-text search

2. **Customize Auto-Tagging**
   - Edit `.claude/hooks/scripts/session-end.sh`
   - Add patterns for your project

3. **Export Your Data**
   - Timeline stored in `.claude/state/timeline/`
   - JSON format for easy parsing
   - Migrate to database when ready

---

## 💡 Pro Tips

1. **Use consistent tags** - Easier filtering later
   - `auth`, `database`, `ui`, `api`, `bug`, `feature`, `testing`

2. **Add notes for future you** - What needs follow-up?
   ```bash
   --note "Need to optimize this query later"
   ```

3. **Track decisions** - Why did you choose this approach?
   ```bash
   --decision "Using Redis for caching (fast lookups needed)"
   ```

4. **Use sessions** - Group related work together
   ```bash
   pnpm timeline session start "Sprint 1 - Auth feature"
   # ... do work ...
   pnpm timeline session end
   ```

5. **Search is powerful** - Find anything instantly
   ```bash
   pnpm timeline search "authentication"
   ```

---

## 🆘 Help

```bash
# CLI help
pnpm timeline --help

# Command help
pnpm timeline add --help
pnpm timeline session --help
```

Full documentation: `/docs/PROJECT-TIMELINE-SYSTEM.md`

---

**Happy logging! 📝**

This is your project's biography. Use it well.
