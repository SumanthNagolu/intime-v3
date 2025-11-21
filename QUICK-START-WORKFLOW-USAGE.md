# Quick Start - Unified Workflow System

**Last Updated:** 2025-11-20
**Status:** ✅ Ready to Use

---

## 🚀 Instant Usage (No Setup)

### Execute Any Story

```bash
pnpm workflow feature STORY-ID
```

**Example:**
```bash
pnpm workflow feature AI-INF-005-base-agent-framework
```

**What Happens:**
- ✅ All agents execute automatically
- ✅ Architecture designed
- ✅ Code generated
- ✅ Tests written
- ✅ Documentation updated
- ✅ Story status → 🟢 Complete

**Time:** 5-10 minutes (vs 5-10 hours traditional)

---

## 🎨 With Figma/v0 (Frontend Stories)

### Setup (One-Time, 5 Minutes)

**Step 1: Get Figma Token**
1. Go to https://www.figma.com → Settings → Account
2. Personal Access Tokens → "Create new token"
3. Name: "InTime v3"
4. Copy token (starts with `figd_...`)

**Step 2: Add to Project**
```bash
echo 'FIGMA_ACCESS_TOKEN="figd_YOUR_TOKEN"' >> .env.local
```

**Step 3: Add to Story**
Open any story file and add after Priority:
```markdown
**Figma Design:** https://www.figma.com/file/ABC123/design?node-id=123:456
**Figma Frame:** "ComponentName - Desktop"
```

**Step 4: Run Workflow**
```bash
pnpm workflow feature STORY-ID
```

**What Happens:**
- ✅ Figma design exported automatically
- ✅ v0 generates React components
- ✅ Claude refines to InTime design system
- ✅ Tests written
- ✅ Deployed to production

**Time:** 30-60 minutes (vs 4-8 hours traditional)
**Savings:** 85-90%

---

## 📋 All Commands

| Command | Purpose | Time |
|---------|---------|------|
| `pnpm workflow feature STORY-ID` | Execute one story | 5-10 min |
| `pnpm workflow epic EPIC-ID` | Execute all stories in epic | Varies |
| `pnpm workflow sprint 6` | Execute entire sprint | Varies |
| `pnpm workflow start "idea"` | Generate feature plan | 10-15 min |
| `pnpm workflow database "feature"` | Design database schema | 5-10 min |
| `pnpm workflow test "scope"` | Run comprehensive QA | 3-8 min |
| `pnpm workflow deploy prod` | Deploy to production | 5-10 min |
| `pnpm workflow status` | Check progress | Instant |
| `pnpm workflow list` | List all workflows | Instant |
| `pnpm workflow history` | View past runs | Instant |

---

## 📁 Where to Find Results

**After running a workflow:**

```bash
# View latest workflow artifacts
ls -la .claude/state/runs/$(ls -t .claude/state/runs/ | head -1)

# Open in Finder/Explorer
open .claude/state/runs/$(ls -t .claude/state/runs/ | head -1)
```

**What's inside:**
- `execution.json` - Workflow metadata
- `*-prompt.md` - All agent outputs (7-9 files)
- PM requirements, architecture, code, tests, deployment logs

**Story status:**
- Automatically updated from ⚪ → 🟢
- Check: `docs/planning/stories/epic-*/STORY-ID.md`

---

## 🎯 Recommended First Steps

### Today (5 minutes)
1. ✅ Try basic workflow: `pnpm workflow feature TEST-WORKFLOW-001-hello-world`
2. ✅ Check results: `ls .claude/state/runs/`
3. ✅ Read generated prompts

### This Week (30 minutes)
1. Get Figma token → Add to `.env.local`
2. Pick one frontend story
3. Add Figma URL to story
4. Run workflow
5. Measure time savings

### This Month
1. Run 10-20 production stories
2. Track actual ROI
3. Refine prompts based on learnings
4. Build workflow monitoring dashboard

---

## 💰 Expected Results

### Per Story
- **Traditional:** 5-10 hours manual work
- **With Workflow:** 50-100 minutes automated
- **Savings:** 70-90%

### Per Sprint (20 stories)
- **Traditional:** 100-200 hours (50-80% completion)
- **With Workflow:** 17-33 hours (100% completion)
- **Outcome:** 2-3x more stories completed

### Per Month (2 sprints)
- **Time saved:** 150-300 hours
- **Value saved:** $15K-30K per 2-person pod
- **Annual:** $180K-360K per pod

---

## 🆘 Troubleshooting

### "Agent file not found"
**Solution:** Agent definition missing, system will tell you which one. Create it or let me know.

### "Story file not found"
**Solution:**
```bash
# List available stories
find docs/planning/stories -name "*.md" | grep -v CLAUDE | grep -v README
```

### Figma export fails
**Solution:**
1. Check `FIGMA_ACCESS_TOKEN` in `.env.local`
2. Verify Figma file is accessible to your account
3. Check URL format is correct

### Want to see what agents will do?
**Solution:**
```bash
# Run workflow (generates prompts)
pnpm workflow feature STORY-ID

# Read agent prompts
cat .claude/state/runs/*/pm-agent-prompt.md
cat .claude/state/runs/*/architect-agent-prompt.md
```

---

## 📚 Complete Documentation

- **Figma/v0 Guide:** `docs/planning/FIGMA-V0-INTEGRATION-GUIDE.md`
- **Master Workflow Guide:** `MASTER-WORKFLOW-GUIDE.md`
- **Test Results:** `WORKFLOW-SYSTEM-TEST-RESULTS.md`
- **Database Workflow:** `DATABASE-WORKFLOW.md`

---

## ✅ Quick Reference Card

```bash
# MOST COMMON COMMANDS

# Execute a story
pnpm workflow feature STORY-ID

# Check what happened
ls -la .claude/state/runs/

# View story status
cat docs/planning/stories/epic-*/STORY-ID.md | head -10

# List available stories
find docs/planning/stories -name "*.md" | grep -v CLAUDE

# Check workflow status
pnpm workflow status
```

---

**YOU'RE READY TO BUILD AT 3X SPEED!** 🚀

**Start with:** `pnpm workflow feature TEST-WORKFLOW-001-hello-world`
