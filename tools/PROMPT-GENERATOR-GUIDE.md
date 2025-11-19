# 🚀 Implementation Prompt Generator - Complete Guide

Auto-generates perfect implementation prompts from your epic/story files, activating your full multi-agent architecture.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Commands Reference](#commands-reference)
3. [Usage Examples](#usage-examples)
4. [Output Formats](#output-formats)
5. [Prompt Templates](#prompt-templates)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### List All Available Epics

```bash
pnpm prompt:list
```

**Output:**
```
📚 Available Epics:

  epic-01         Foundation & Core Platform
                  └─ Foundation (Core Infrastructure)
                  └─ 23 stories, 4 weeks, ~15 stories

  epic-02         Training Academy (LMS)
                  └─ Training Academy
                  └─ 24 stories, 6 weeks, ~30 stories

  ...
```

### Generate Epic-Level Prompt

```bash
# Display in console
pnpm prompt:epic epic-02

# Save to file
pnpm prompt:epic epic-02 --output file --file prompts/epic-02.md

# Copy to clipboard (macOS/Linux)
pnpm prompt:epic epic-02 --output clipboard
```

### Generate Story-Level Prompt

```bash
# Display in console
pnpm prompt:story epic-02 --story 5

# Save to file
pnpm prompt:story epic-02 --story 5 --output file --file prompts/story-02-005.md
```

---

## 📚 Commands Reference

### `pnpm prompt:list`

Lists all available epics with metadata.

**Example:**
```bash
pnpm prompt:list
```

### `pnpm prompt:epic <epic-id> [options]`

Generates an epic-level implementation prompt.

**Arguments:**
- `<epic-id>` - Epic identifier (e.g., `epic-02`, `epic-2.5`)

**Options:**
- `--output <type>` - Output format: `console` (default), `file`, `clipboard`
- `--file <path>` - Custom output file path (used with `--output file`)

**Examples:**
```bash
# Console output (default)
pnpm prompt:epic epic-02

# Save to custom file
pnpm prompt:epic epic-02 --output file --file my-prompt.md

# Copy to clipboard
pnpm prompt:epic epic-02 --output clipboard
```

### `pnpm prompt:story <epic-id> --story <number> [options]`

Generates a story-level implementation prompt.

**Arguments:**
- `<epic-id>` - Epic identifier (e.g., `epic-02`)

**Options:**
- `--story <number>` - Story number (required for story-level prompts)
- `--output <type>` - Output format: `console`, `file`, `clipboard`
- `--file <path>` - Custom output file path

**Examples:**
```bash
# Console output
pnpm prompt:story epic-02 --story 5

# Save to file
pnpm prompt:story epic-02 --story 5 --output file --file prompts/story-5.md
```

---

## 💡 Usage Examples

### Example 1: Start Implementing Epic 2 (Training Academy)

```bash
# Step 1: Generate the prompt
pnpm prompt:epic epic-02 --output file --file implementation-epic-02.md

# Step 2: Copy the content and paste to Claude Code
# Step 3: Claude will activate the full agent workflow
```

**What happens next:**
1. PM Agent validates requirements
2. Database Architect designs schema
3. CEO/CFO review business value
4. Developer agents implement
5. QA Engineer writes tests
6. Security Auditor verifies
7. Deployment Specialist ships

### Example 2: Implement a Single Story

```bash
# Generate story-level prompt for "AI Mentor Integration"
pnpm prompt:story epic-02 --story 5 --output clipboard

# Paste to Claude Code
# Claude will use targeted agents (API Developer + Frontend + QA)
```

### Example 3: Batch Generate All Epic Prompts

```bash
# Create prompts directory
mkdir -p prompts/epics

# Generate all epic prompts
for epic in epic-01 epic-02 epic-02.5 epic-03 epic-04 epic-05 epic-06 epic-07 epic-08; do
  pnpm prompt:epic $epic --output file --file prompts/epics/$epic.md
done

echo "✅ All epic prompts generated in prompts/epics/"
```

### Example 4: Generate Prompts for Specific Stories

```bash
# Create directory
mkdir -p prompts/stories/epic-02

# Generate first 5 stories of Epic 2
for i in {1..5}; do
  pnpm prompt:story epic-02 --story $i --output file --file prompts/stories/epic-02/story-$i.md
done
```

---

## 📤 Output Formats

### Console (Default)

Displays the prompt directly in the terminal with formatting.

```bash
pnpm prompt:epic epic-02
```

**Use case:** Quick preview before saving

### File

Saves the prompt to a markdown file.

```bash
pnpm prompt:epic epic-02 --output file --file my-epic.md
```

**Default filename:** `prompt-{epic-id}.md` or `prompt-{epic-id}-story-{number}.md`

**Use case:**
- Save for later use
- Share with team
- Version control prompts

### Clipboard

Copies the prompt to your clipboard (requires `pbcopy` on macOS or `xclip` on Linux).

```bash
pnpm prompt:epic epic-02 --output clipboard
```

**Use case:** Immediate paste to Claude Code

---

## 📝 Prompt Templates

### Epic-Level Prompt Structure

```markdown
# Implement: EPIC-XX - [Name]

## 📋 Specification
- File path, type, business pillar, pod impact

## 🎯 Objectives
- Goals, business value, success metrics

## 🏗️ Architecture Alignment
- Database tables, events, cross-pollination, user personas

## ✅ Quality Standards
- Code quality, security, architecture requirements

## 🚀 Execution Plan
- Phase 1: Planning & Design
- Phase 2: Implementation
- Phase 3: Verification
- Phase 4: Deployment

## 📊 Success Criteria
- Comprehensive checklist

## 🎬 Start Implementation
- Recommended workflows and commands

## 📁 Key Files to Reference
- Related documentation

## 💡 Additional Context
- Features, dependencies, timeline
```

### Story-Level Prompt Structure

```markdown
# Implement User Story: EPIC-XX-YYY

## 📋 Story Details
- Epic, story description, file path

## 🎯 User Story Format
- As a [role], I want [feature] so that [benefit]

## 🏗️ Technical Context
- Business pillar, affected modules, database changes, integration points

## ✅ Acceptance Criteria
- Specific requirements from story

## 🚀 Implementation Checklist
- Backend, frontend, testing, quality gates

## 🎬 Quick Start
- Targeted implementation steps

## 📁 Related Files
- Epic spec, conventions, schema
```

---

## 🎯 Best Practices

### 1. Start with Epic-Level for Complex Features

**When to use:**
- First 2-3 epics of the project
- Complex features with multiple integrations
- Features requiring architectural decisions

**Why:**
- Activates full agent workflow
- PM Agent validates requirements
- Architect designs cohesive schema
- Establishes patterns for team

**Example:**
```bash
pnpm prompt:epic epic-01 --output clipboard
# Paste to Claude Code and start with /start-planning
```

### 2. Switch to Story-Level for Incremental Development

**When to use:**
- After patterns are established
- Well-understood CRUD operations
- Isolated features

**Why:**
- Faster iterations
- Clear boundaries
- Easier progress tracking

**Example:**
```bash
pnpm prompt:story epic-02 --story 5 --output file
```

### 3. Save Prompts to Version Control

**Recommended structure:**
```
prompts/
├── epics/
│   ├── epic-01.md
│   ├── epic-02.md
│   └── ...
└── stories/
    ├── epic-01/
    │   ├── story-001.md
    │   ├── story-002.md
    │   └── ...
    └── epic-02/
        └── ...
```

**Benefits:**
- Track what was implemented
- Share with team members
- Reference for future features

### 4. Customize Prompts for Context

**The generated prompts are templates.** Feel free to:
- Add specific technical constraints
- Mention deadlines or priorities
- Include additional business context
- Reference related work

**Example:**
```bash
# Generate base prompt
pnpm prompt:epic epic-02 --output file --file my-prompt.md

# Edit my-prompt.md to add:
# - "Priority: HIGH - Launch in 2 weeks"
# - "Integration constraint: Must work with existing Vimeo videos"
# - "Performance target: <2s page load (not 3s)"
```

### 5. Use Clipboard for Quick Iterations

```bash
# Quick workflow
pnpm prompt:epic epic-02 --output clipboard
# Paste to Claude Code
# Review agent response
# Iterate if needed
```

---

## 🛠️ Troubleshooting

### Issue: Epic Not Found

**Error:**
```
❌ Epic not found: epic-99
```

**Solution:**
```bash
# List all available epics
pnpm prompt:list

# Use the exact epic ID shown
pnpm prompt:epic epic-02
```

### Issue: Story Number Out of Range

**Error:**
```
❌ Story 50 not found in epic-02. Epic has 24 stories.
```

**Solution:**
- Check the epic file for the correct number of stories
- Use a valid story number (1-24 for epic-02)

### Issue: Clipboard Copy Failed

**Error:**
```
❌ Failed to copy to clipboard. Install pbcopy (macOS) or xclip (Linux).
```

**Solution:**

**macOS:** Already installed by default

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install xclip
```

**Linux (Fedora):**
```bash
sudo dnf install xclip
```

**Windows:** Use `--output file` instead

### Issue: File Not Created

**Problem:** Running `--output file` but file not appearing

**Solution:**
```bash
# Use absolute path
pnpm prompt:epic epic-02 --output file --file /full/path/to/prompt.md

# Or use relative path from project root
pnpm prompt:epic epic-02 --output file --file ./prompts/epic-02.md
```

### Issue: Permission Denied

**Error:**
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Create directory first
mkdir -p prompts

# Ensure you have write permissions
chmod u+w prompts

# Generate prompt
pnpm prompt:epic epic-02 --output file --file prompts/epic-02.md
```

---

## 🎬 Complete Workflow Example

### Implementing Epic 2: Training Academy

```bash
# Step 1: Review the epic
cat docs/planning/epics/epic-02-training-academy.md

# Step 2: Generate implementation prompt
pnpm prompt:epic epic-02 --output file --file epic-02-implementation.md

# Step 3: Review the generated prompt
cat epic-02-implementation.md

# Step 4: Copy to clipboard for Claude Code
pnpm prompt:epic epic-02 --output clipboard

# Step 5: Paste to Claude Code
# Claude responds with agent orchestration plan

# Step 6: Start implementation
# Use /start-planning workflow as suggested in prompt

# Step 7: Track progress with todos
# Claude creates todo list automatically

# Step 8: Generate story-level prompts for follow-up work
pnpm prompt:story epic-02 --story 1 --output file
pnpm prompt:story epic-02 --story 2 --output file
# ... etc
```

---

## 📊 What Gets Auto-Extracted from Epic Files

The tool automatically extracts:

✅ **Epic metadata:** ID, name, goal, business value
✅ **User personas:** All roles defined in epic
✅ **Key features:** Top features (limit 5 in prompt)
✅ **Success metrics:** Measurable goals
✅ **Dependencies:** Required epics, enabled epics
✅ **Effort & timeline:** Estimates from epic file
✅ **Stories:** All numbered stories (for story-level prompts)
✅ **Database tables:** Extracted from CREATE TABLE statements
✅ **Events:** Detected emit/subscribe patterns
✅ **Business pillar:** Auto-detected from epic ID/name
✅ **Cross-pollination:** Auto-generated based on pillar

---

## 🚀 Next Steps

1. **Generate your first prompt:**
   ```bash
   pnpm prompt:list
   pnpm prompt:epic epic-01 --output clipboard
   ```

2. **Paste to Claude Code and start implementation**

3. **Let the multi-agent workflow handle the rest:**
   - PM validates requirements
   - Architect designs schema
   - Developers implement
   - QA writes tests
   - Security audits
   - Deployment ships

4. **Track progress and iterate**

---

## 💡 Pro Tips

1. **Save prompts to Git** - Track what you've implemented
2. **Customize for context** - Add deadlines, constraints, priorities
3. **Use epic-level for first features** - Establish patterns
4. **Switch to story-level** - Speed up after patterns set
5. **Batch generate prompts** - Prepare for sprint planning

---

**Happy implementing! 🎉**

This tool activates your complete multi-agent architecture and ensures every implementation follows your quality standards and architectural principles.
