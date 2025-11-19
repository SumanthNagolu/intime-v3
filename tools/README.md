# 🛠️ InTime v3 - Tools Directory

Command-line utilities for development, automation, and implementation.

---

## 📚 Available Tools

### 1. 🚀 Implementation Prompt Generator

**File:** `generate-prompt.ts`
**Documentation:** [PROMPT-GENERATOR-GUIDE.md](./PROMPT-GENERATOR-GUIDE.md)

Auto-generates perfect implementation prompts from epic/story files that activate your full multi-agent architecture.

**Quick Start:**
```bash
# List all epics
pnpm prompt:list

# Generate epic prompt
pnpm prompt:epic epic-02 --output clipboard

# Generate story prompt
pnpm prompt:story epic-02 --story 5 --output file
```

**Features:**
- ✅ Auto-extracts metadata from epic files
- ✅ Generates structured implementation prompts
- ✅ Supports epic-level and story-level prompts
- ✅ Multiple output formats (console, file, clipboard)
- ✅ Includes quality standards and success criteria
- ✅ Activates full multi-agent workflow

---

### 2. 📊 Timeline CLI

**File:** `timeline-cli.ts`

Track project timeline, sessions, and development progress.

**Quick Start:**
```bash
# Add timeline entry
pnpm timeline:add "Implemented user authentication"

# List recent entries
pnpm timeline:list

# Search timeline
pnpm timeline:search "authentication"

# View statistics
pnpm timeline:stats
```

---

## 🎯 Recommended Workflow

### Starting a New Epic

```bash
# 1. Review the epic
cat docs/planning/epics/epic-02-training-academy.md

# 2. Generate implementation prompt
pnpm prompt:epic epic-02 --output clipboard

# 3. Paste to Claude Code
# Claude activates PM Agent → Architect → Developers → QA → Deploy

# 4. Track progress
pnpm timeline:add "Started Epic 2: Training Academy"
```

### Implementing Individual Stories

```bash
# 1. Generate story prompt
pnpm prompt:story epic-02 --story 5 --output clipboard

# 2. Paste to Claude Code
# Claude uses targeted agents (API Dev + Frontend + QA)

# 3. Track completion
pnpm timeline:add "Completed story epic-02-005: AI Mentor Integration"
```

---

## 📖 Documentation

- **Prompt Generator Guide:** [PROMPT-GENERATOR-GUIDE.md](./PROMPT-GENERATOR-GUIDE.md)
- **Epic Files:** `docs/planning/epics/`
- **Agent Workflows:** `.claude/commands/workflows/`

---

## 🚀 Quick Reference

### Prompt Generator Commands

| Command | Description |
|---------|-------------|
| `pnpm prompt:list` | List all available epics |
| `pnpm prompt:epic <id>` | Generate epic-level prompt |
| `pnpm prompt:story <id> --story <n>` | Generate story-level prompt |
| `--output file` | Save to file |
| `--output clipboard` | Copy to clipboard |
| `--file <path>` | Custom file path |

### Timeline Commands

| Command | Description |
|---------|-------------|
| `pnpm timeline:add "<message>"` | Add timeline entry |
| `pnpm timeline:list` | List recent entries |
| `pnpm timeline:search "<query>"` | Search timeline |
| `pnpm timeline:stats` | View statistics |

---

## 💡 Tips

1. **Use clipboard for quick iterations:**
   ```bash
   pnpm prompt:epic epic-02 --output clipboard
   # Paste to Claude Code immediately
   ```

2. **Save prompts for team sharing:**
   ```bash
   mkdir -p prompts/epics
   pnpm prompt:epic epic-02 --output file --file prompts/epics/epic-02.md
   ```

3. **Batch generate all epic prompts:**
   ```bash
   for epic in epic-{01..08}; do
     pnpm prompt:epic $epic --output file --file prompts/$epic.md
   done
   ```

4. **Track major milestones:**
   ```bash
   pnpm timeline:add "Epic 2 completed - Training Academy live"
   ```

---

## 🛠️ Development

### Adding New Tools

1. Create TypeScript file in `tools/` directory
2. Add pnpm script to `package.json`
3. Use existing tools as templates (see `timeline-cli.ts`)
4. Document in this README

### Testing Tools

```bash
# Run TypeScript directly
tsx tools/your-tool.ts

# Or via pnpm script
pnpm your-tool
```

---

## 📝 Notes

- All tools use **tsx** for running TypeScript
- Tools have access to project dependencies (commander, chalk, etc.)
- Keep tools focused and single-purpose
- Document thoroughly for team usage

---

**Last Updated:** 2025-11-18
**Maintained by:** InTime Development Team
