# InTime v3 - Figma Hybrid Approach Action Plan

**Approach:** Design System First → Build Per Epic
**Start Date:** 2025-11-20
**Duration:** 12 weeks (complete product)

---

## 📋 Overview

**Strategy:**
1. **Week 1:** Create complete design system in Figma
2. **Weeks 2-12:** Design + Build one epic every 1-2 weeks

**Benefits:**
- ✅ Ship features every 2 weeks
- ✅ Consistent design across all modules
- ✅ Get user feedback early and often
- ✅ Adjust based on real usage

---

## 🎨 Phase 1: Design System (Week 1)

### What to Create in Figma

**File Structure:**
```
InTime v3 Design System
├── Foundation/
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
├── Components/
│   ├── Buttons
│   ├── Forms (inputs, selects, checkboxes)
│   ├── Cards
│   ├── Badges/Tags
│   ├── Tables
│   ├── Modals
│   └── Navigation
└── Layouts/
    ├── Page Templates
    ├── Dashboard Grid
    └── Form Layouts
```

### Foundation

**Colors (Use InTime tokens):**
```
Backgrounds:
  • bg-primary: #F5F3EF (light beige)
  • bg-secondary: #FFFFFF (white)
  • bg-dark: #000000 (black)

Text:
  • text-primary: #000000 (black)
  • text-secondary: #4B5563 (gray-600)
  • text-tertiary: #9CA3AF (gray-400)

Accent:
  • accent-primary: #C87941 (coral - underlines only!)

Borders:
  • border-light: #E5E7EB (gray-200)
  • border-emphasis: #000000 (black)
```

**Typography:**
```
System fonts only:
  • Headings: text-6xl to text-8xl, font-bold, black
  • Body: text-xl, text-gray-700, leading-relaxed
  • Small: text-sm, text-gray-600
```

**Spacing:**
```
Generous white space:
  • Section padding: py-32
  • Card padding: p-8
  • Button padding: px-6 py-3
  • Gap between elements: gap-4, gap-6
```

### Components Library

**Create as Figma Components (with variants):**

1. **Button Component**
   - Variants: Primary, Secondary, Outline, Ghost
   - States: Default, Hover, Active, Disabled
   - Sizes: Small, Medium, Large

2. **Input Component**
   - Variants: Text, Email, Password, Number
   - States: Default, Focus, Error, Disabled
   - With/without label, error message

3. **Card Component**
   - Variants: Default, Hover, Selected
   - With/without image, badge, actions

4. **Badge Component**
   - Variants: Status (Available, Placed, Interview), Priority (High, Medium, Low)
   - Colors: Subtle, not vibrant

5. **Table Component**
   - Headers, rows, cells
   - Sortable columns
   - Pagination

6. **Modal Component**
   - Sizes: Small, Medium, Large, Full
   - With/without header, footer, close button

7. **Navigation Components**
   - Top nav, sidebar, breadcrumbs
   - With active states

### Page Templates

**Create 3 standard templates:**

1. **Dashboard Template**
   - Top nav
   - Sidebar (optional)
   - Main content area
   - Stats cards section

2. **List Page Template**
   - Top nav
   - Filters sidebar
   - Data table
   - Pagination

3. **Detail Page Template**
   - Top nav
   - Breadcrumbs
   - Header with actions
   - Tabbed content

### Deliverable

**By end of Week 1:**
- ✅ Complete Figma design system file
- ✅ All components as Figma Components (reusable)
- ✅ 3 page templates
- ✅ Design system documented
- ✅ Shared with team

**Time:** 5 days (1 designer full-time)

---

## 🚀 Phase 2: Build Per Epic (Weeks 2-12)

### Epic-by-Epic Workflow

Each epic follows this 2-week cycle:

```
Week N (Design):
  Day 1-2: Designer creates all pages for epic
  Day 3: Review with PM/team
  Day 4-5: Revisions + finalize

Week N+1 (Build):
  Day 1: Run workflow system (v0 + Claude)
  Day 2-3: Developer review + refinement
  Day 4: QA testing
  Day 5: Deploy + user feedback
```

---

## 📅 12-Week Schedule

### Week 1: Design System ✅
- Create foundation, components, templates
- No development yet
- **Deliverable:** Complete design system

### Weeks 2-3: Epic 1 - Candidate Management
**Design Week (Week 2):**
- Candidate list page
- Candidate detail page
- Candidate card component
- Add/edit candidate form
- Search and filters

**Build Week (Week 3):**
```bash
# Add Figma URLs to all stories
pnpm workflow epic CANDIDATE-MANAGEMENT-EPIC

# System generates all components
# Developer reviews and refines
# QA tests, Deploy
```

**Deliverable:** Working candidate module in production

### Weeks 4-5: Epic 2 - Training Academy
**Design Week (Week 4):**
- Course catalog page
- Course detail page
- Student dashboard
- Progress tracking
- Enrollment forms

**Build Week (Week 5):**
```bash
pnpm workflow epic TRAINING-ACADEMY-EPIC
```

**Deliverable:** Training academy live

### Weeks 6-7: Epic 3 - Guidewire Guru
**Design Week (Week 6):**
- Chat interface
- Curriculum browser
- Code editor integration
- Progress tracking
- Ask question form

**Build Week (Week 7):**
```bash
pnpm workflow epic GUIDEWIRE-GURU-EPIC
```

**Deliverable:** Guidewire Guru live

### Weeks 8-9: Epic 4 - Bench Sales & Recruitment
**Design Week (Week 8):**
- Bench consultant list
- Job matching dashboard
- Client management
- Placement tracking
- Communication tools

**Build Week (Week 9):**
```bash
pnpm workflow epic BENCH-SALES-EPIC
```

**Deliverable:** Bench sales module live

### Weeks 10-11: Epic 5 - Admin & Reports
**Design Week (Week 10):**
- Admin dashboard
- User management
- Reports and analytics
- Settings
- Audit logs

**Build Week (Week 11):**
```bash
pnpm workflow epic ADMIN-EPIC
```

**Deliverable:** Admin module complete

### Week 12: Polish & Launch 🚀
- Final QA across all modules
- Performance optimization
- Security audit
- Marketing site
- **LAUNCH!**

---

## 📁 Figma Organization

### Recommended Structure

```
InTime v3 (Team)
├── 📁 Design System
│   └── InTime-Design-System.fig
│
├── 📁 Epic 1 - Candidates
│   └── Candidate-Module.fig
│       ├── Page: Candidate List
│       ├── Page: Candidate Detail
│       ├── Page: Add Candidate Form
│       └── Components: CandidateCard, StatusBadge, etc.
│
├── 📁 Epic 2 - Training
│   └── Training-Module.fig
│
├── 📁 Epic 3 - Guru
│   └── Guru-Module.fig
│
└── 📁 Epic 4 - Bench Sales
    └── BenchSales-Module.fig
```

### Naming Conventions

**Figma Frames:**
```
[Module]-[PageType]-[Variant]

Examples:
  • Candidate-List-Desktop
  • Candidate-List-Mobile
  • Candidate-Detail-Desktop
  • Candidate-Card-Default
  • Candidate-Card-Hover
```

**Figma Components:**
```
[Component]/[Variant]/[State]

Examples:
  • Button/Primary/Default
  • Button/Primary/Hover
  • Card/Candidate/Default
  • Badge/Status/Available
```

---

## 🔗 Integration with User Stories

### How to Add Figma to Stories

**For each story that needs UI:**

1. **Designer creates design in Figma**
2. **Get shareable link** (right-click frame → "Copy/Paste as" → "Copy link")
3. **Add to story file:**

```markdown
# STORY-ID: Story Title

**Status:** ⚪ Not Started
**Story Points:** 3
**Sprint:** Sprint 6

**Figma Design:** https://www.figma.com/file/ABC123/Candidate-Module?node-id=123:456
**Figma Frame:** "Candidate-List-Desktop"

## User Story
...
```

4. **Run workflow:**
```bash
pnpm workflow feature STORY-ID
```

---

## 🎯 Success Metrics

### Design Phase (Week 1)
- ✅ Complete design system documented
- ✅ All components created
- ✅ 3 page templates ready
- ✅ Team can start using immediately

### Per Epic (Every 2 Weeks)
- ✅ All pages designed (Week N)
- ✅ All components generated via v0 (Day 1 of Week N+1)
- ✅ All components refined by Claude (Day 1-2)
- ✅ Feature deployed to production (End of Week N+1)
- ✅ User feedback collected

### Overall (12 Weeks)
- ✅ 5 complete epics shipped
- ✅ All major features live
- ✅ Product ready for customers
- ✅ Design consistency across all modules

---

## 💰 Cost & ROI

### Design Investment
- **Week 1 Design System:** 40 hours × $50/hr = $2,000
- **Per Epic Design:** 20 hours × $50/hr = $1,000
- **Total Design Cost:** $2,000 + (5 epics × $1,000) = $7,000

### Development Savings (with v0 + Claude)
- **Traditional:** 40 hours/epic × $100/hr × 5 epics = $20,000
- **With Automation:** 8 hours/epic × $100/hr × 5 epics = $4,000
- **Savings:** $16,000 (80% reduction)

### Total ROI
- **Investment:** $7,000 (design) + $4,000 (dev) = $11,000
- **vs Traditional:** $7,000 (design) + $20,000 (dev) = $27,000
- **Savings:** $16,000 (59% cost reduction)
- **Time to Market:** 12 weeks vs 24 weeks (50% faster)

---

## 🆘 Common Questions

### Q: Can we skip the design system week?
**A:** No - it's critical for consistency. Without it, each epic will look different.

### Q: Can we do multiple epics in parallel?
**A:** Yes! If you have 2 designers, you can design 2 epics simultaneously. But build them sequentially to maintain quality.

### Q: What if v0 doesn't generate good code?
**A:** Claude will refine it. But if v0 output is very poor, you can skip v0 and have Claude code from Figma directly.

### Q: Do ALL stories in an epic need Figma?
**A:** No! Only UI stories. API/Database stories skip Figma.

---

## 📞 Next Steps (This Week)

### Today
1. ☐ Review this plan with team
2. ☐ Assign designer for Week 1 (design system)
3. ☐ Get Figma token → Add to .env.local
4. ☐ Create Figma team/project structure

### Week 1 (Design System Week)
1. ☐ Designer creates foundation (colors, typography, spacing)
2. ☐ Designer creates all components
3. ☐ Designer creates 3 page templates
4. ☐ Team reviews design system
5. ☐ Document and share with team

### Week 2 (First Epic Design)
1. ☐ Designer designs Candidate Module pages
2. ☐ Get Figma URLs for all pages
3. ☐ Add URLs to user stories
4. ☐ Ready to build in Week 3!

---

**YOU'RE READY TO START! Let's build InTime v3 the smart way!** 🚀

**Start:** Design system this week → Ship first epic in 3 weeks!
