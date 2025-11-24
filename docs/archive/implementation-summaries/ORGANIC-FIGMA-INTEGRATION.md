# Organic Figma Integration - Simple Guide

**Approach:** Add Figma naturally during planning, not as a separate phase
**Status:** Ready to use with existing workflows

---

## 🎯 Two Simple Steps

### Step 1: Decide Theme/Design (ONCE, at project start)

**When:** Before building any features
**Who:** Designer + PM
**Time:** 2-3 hours

**What to decide:**

```markdown
## InTime Design Theme

**Colors:**
- Primary: #0D4C3B (Forest Green)
- Accent: #F5A623 (Transformation Amber)
- Neutral: #2D3E50 (Professional Slate)

**Typography:**
- Headings: Playfair Display
- Body: Space Grotesk
- Mono: IBM Plex Mono

**Style:**
- Professional, data-driven
- Asymmetric layouts (not centered)
- Enterprise feel (not casual/startup)
- NO purple gradients, emojis, or AI-generic patterns

**Components We'll Need:**
- Buttons, cards, forms, tables
- Navigation, modals
- Dashboards, data visualizations
```

**Save to:** `docs/design/DESIGN-THEME.md`

**Create in Figma:**
- One file: "InTime Design Theme"
- Just the basics: colors, typography, 2-3 button examples
- **Time:** 2-3 hours (not a full design system!)

---

### Step 2: Add Figma During Epic/Story Planning (Organic!)

**When:** During `pnpm workflow start "feature idea"`
**How:** PM naturally asks: "Does this need custom design?"

#### During Feature Planning

When running `pnpm workflow start`:

**PM Agent asks:**
```
Does this feature have custom UI components?
  □ Yes → Designer creates Figma designs
  □ No → Use existing components
```

**If YES, PM adds to each UI story:**
```markdown
# STORY-ID: Story Title

**Story Points:** 3
**Design Needed:** ✅ YES
**Figma URL:** (Designer will add before implementation)

## User Story
...

## Design Requirements
- What pages/components need designing?
- Any specific layouts or interactions?
- Reference: docs/design/DESIGN-THEME.md
```

---

## 📋 Complete Organic Workflow

### Example: "Build Candidate Management Feature"

#### Phase 1: Feature Planning (10-15 min)

```bash
pnpm workflow start "Build candidate management with list, details, and search"
```

**PM Agent outputs:**
```
Epic: Candidate Management
  Story 1: Candidate List Page
    - Design Needed: ✅ YES (new page layout)
    - Figma URL: (pending)

  Story 2: Candidate Detail Page
    - Design Needed: ✅ YES (new page layout)
    - Figma URL: (pending)

  Story 3: Search API
    - Design Needed: ❌ NO (backend only)

  Story 4: Add Candidate Form
    - Design Needed: ❌ NO (use existing form patterns)
```

#### Phase 2: Design (Only for stories marked "YES")

**Designer:**
1. Opens Figma
2. Creates "Candidate Management" file
3. Designs:
   - Candidate List page
   - Candidate Detail page
4. Shares URLs
5. PM adds URLs to stories

**Time:** 4-6 hours for both pages

#### Phase 3: Implementation (Automatic!)

```bash
pnpm workflow epic CANDIDATE-MANAGEMENT
```

**System automatically:**
- Reads Figma URLs from stories
- Exports designs (for stories with URLs)
- Runs v0 generation (for stories with URLs)
- Claude refines all code
- Tests and deploys

**Stories without Figma URLs:** System skips design steps, goes straight to coding with existing components

---

## 🎨 When to Add Figma (Decision Tree)

```
Feature has UI?
  ├─ NO → Skip Figma entirely
  └─ YES → Check:
       ├─ New page layout? → ✅ ADD FIGMA
       ├─ Custom component? → ✅ ADD FIGMA
       ├─ Complex interaction? → ✅ ADD FIGMA
       ├─ Data visualization? → ✅ ADD FIGMA
       ├─ Marketing/landing page? → ✅ ADD FIGMA
       │
       └─ Standard CRUD form? → ❌ SKIP FIGMA (use existing)
       └─ Settings page? → ❌ SKIP FIGMA (use existing)
       └─ Admin table? → ❌ SKIP FIGMA (use existing)
```

---

## 💡 Real Examples

### Example 1: Candidate Management (Has Figma)

**Story:** CANDIDATE-UI-001 - Candidate List Page

```markdown
# CANDIDATE-UI-001: Candidate List Page

**Status:** ⚪ Not Started
**Story Points:** 5
**Design Needed:** ✅ YES
**Figma URL:** https://www.figma.com/file/ABC/candidates?node-id=123
**Figma Frame:** "Candidate-List-Desktop"

## User Story
As a Recruiter, I want to see all candidates in a searchable list...

## Design Requirements
- Table with search/filters
- Status badges
- Quick actions per row
- Pagination
- Reference: docs/design/DESIGN-THEME.md
```

**Workflow:**
1. Designer creates design → shares URL
2. PM adds URL to story
3. Run: `pnpm workflow feature CANDIDATE-UI-001`
4. System: Figma → v0 → Claude → Deploy

---

### Example 2: Search API (No Figma)

**Story:** CANDIDATE-API-001 - Search API

```markdown
# CANDIDATE-API-001: Candidate Search API

**Status:** ⚪ Not Started
**Story Points:** 3
**Design Needed:** ❌ NO (backend only)

## User Story
As a System, I need a search API for candidates...

## Technical Requirements
- Endpoint: GET /api/candidates/search
- Filters: name, skills, status
- Pagination support
```

**Workflow:**
1. No designer needed
2. Run: `pnpm workflow feature CANDIDATE-API-001`
3. System: Skips Figma → Goes straight to API Developer → Deploy

---

### Example 3: Add Candidate Form (No Figma)

**Story:** CANDIDATE-FORM-001 - Add Candidate Form

```markdown
# CANDIDATE-FORM-001: Add Candidate Form

**Status:** ⚪ Not Started
**Story Points:** 2
**Design Needed:** ❌ NO (use existing form patterns)

## User Story
As a Recruiter, I want to add new candidates...

## Implementation Note
- Use existing FormLayout component
- Use existing Input/Select components
- Follow standard form patterns from design system
```

**Workflow:**
1. No designer needed
2. Run: `pnpm workflow feature CANDIDATE-FORM-001`
3. System: Uses existing components → Claude codes → Deploy

---

## 🔄 Update Your Workflow (No Changes Needed!)

**Good news:** Your existing workflow ALREADY supports this!

**How it works:**
1. PM adds `**Figma URL:**` field to stories (optional)
2. If story has Figma URL → UI Designer agent runs
3. If no Figma URL → UI Designer agent skipped
4. Either way, development continues

**You're ready to use it RIGHT NOW!**

---

## 📊 Comparison: Upfront vs Organic

### Upfront Design System Approach
```
Week 1: Design entire system (40 hours)
Week 2-12: Build features
Result: 1 week delay, risk of unused components
```

### Organic Approach (RECOMMENDED)
```
Day 1: Decide theme (2-3 hours)
Week 1: Design + build Epic 1
Week 2: Design + build Epic 2
Week 3: Design + build Epic 3
Result: Ship features immediately, design as needed
```

**Winner:** Organic approach!
- ✅ Start shipping faster
- ✅ Design only what you need
- ✅ Adapt based on feedback
- ✅ No wasted work

---

## ✅ Action Items (Today)

### 1. Decide Theme (2-3 hours)
```bash
# Create theme file
cat > docs/design/DESIGN-THEME.md << 'EOF'
# InTime Design Theme

## Colors
- Forest Green #0D4C3B (primary)
- Transformation Amber #F5A623 (accent)
- Professional Slate #2D3E50 (neutral)

## Typography
- Headings: Playfair Display
- Body: Space Grotesk
- Mono: IBM Plex Mono

## Style
- Professional, data-driven
- Asymmetric layouts
- Enterprise feel
EOF
```

### 2. Create Basic Figma File (1 hour)
- File: "InTime Design Theme"
- Pages: Colors, Typography, 2-3 button examples
- Share with team

### 3. Add Figma Token (5 minutes)
```bash
echo 'FIGMA_ACCESS_TOKEN="figd_YOUR_TOKEN"' >> .env.local
```

### 4. Start Using It!
```bash
# Plan next feature
pnpm workflow start "Your feature idea"

# PM will ask: Design needed?
# If yes → Designer creates Figma
# If no → Skip to development
```

---

## 🎯 Summary

**Organic Approach = Natural + Flexible**

✅ **Step 1:** Decide theme ONCE (2-3 hours)
✅ **Step 2:** Add Figma during planning (as needed)
✅ **Step 3:** Run workflow (automatic)

**No big upfront investment!**
**No wasted design work!**
**Ship features faster!**

**Ready to use RIGHT NOW with your existing workflow!** 🚀
