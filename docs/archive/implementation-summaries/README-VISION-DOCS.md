# Vision Documentation System

## Overview

This directory contains the synthesized, living vision documents for InTime. These documents evolve with the business and serve as the north star for all strategic decisions.

---

## Document Hierarchy

### 📊 **BOARD-EXECUTIVE-SUMMARY.md**
**Purpose:** High-level overview for board members, investors, and executives
**Audience:** Board of Directors, Strategic Investors, C-Suite
**Length:** ~25 pages (concise)
**Update Frequency:** Quarterly or before board meetings
**Format:** Executive summary with financial highlights, key metrics, and strategic decisions

**When to Use:**
- Board presentations
- Investor pitch decks
- Strategic planning sessions
- Executive briefings
- Due diligence for fundraising

---

### 📘 **VISION-AND-STRATEGY.md**
**Purpose:** Comprehensive, detailed vision and operational playbook
**Audience:** Leadership Team, Pod Managers, Strategic Partners
**Length:** ~150 pages (comprehensive)
**Update Frequency:** Monthly for metrics, Quarterly for strategy
**Format:** Deep-dive with workflows, financials, technology, and execution details

**When to Use:**
- Onboarding new leadership
- Strategic planning deep-dives
- Product roadmap planning
- Technology architecture decisions
- Operational playbook reference

---

### 📂 **audit/** (Historical)
**Purpose:** Original vision files from the audit phase
**Status:** Archive - reference only, not actively maintained
**Files:**
- `user-vision.md` - Original comprehensive vision
- `user-vision-2.md` - Question bank for completion
- `user-vision-COMPLETED-ANSWERS.md` - Financial calculations
- `user-vision-COMPLETED-ANSWERS-2.md` - Workflow details
- `user-vision-COMPLETED-ANSWERS-3.md` - Dashboard implementation
- `user-vision-COMPLETED-ANSWERS-4.md` - Technical patterns

**Note:** These files were synthesized into the main vision documents. Keep for historical reference but don't update.

---

## Version Control

### Version Numbering Scheme

**Format:** MAJOR.MINOR (e.g., 2.1)

**MAJOR version** (2.0, 3.0, etc.):
- Significant strategic pivots
- New business model elements
- Major market expansion
- Fundamental changes to vision

**MINOR version** (2.1, 2.2, etc.):
- Metric updates
- Financial model refinements
- Tactical adjustments
- Process improvements

### Change Log Location

Each document has a **Document Control** section at the top with version history:

```markdown
## Document Control

**Version:** 2.1
**Last Updated:** January 15, 2026
**Status:** Active - Living Document

**Version History:**
- v2.1 (Jan 2026): Updated Q4 2025 actuals, revised Year 2 projections
- v2.0 (Nov 2025): Complete synthesis of all vision documents
- v1.0 (Nov 2025): Initial draft
```

---

## Update Schedule

### Monthly Updates (Operational)

**What to Update:**
- Financial actuals (revenue, costs, margins)
- Key metrics (students enrolled, placements made, pod performance)
- Team headcount
- Product status (features launched, roadmap progress)

**Who Updates:**
- CEO (strategic sections)
- CFO or Finance Lead (financials)
- CTO or Tech Lead (technology updates)
- Operations Manager (team metrics)

**Process:**
1. Last week of each month
2. Collect data from all pods
3. Update VISION-AND-STRATEGY.md metrics sections
4. Commit to git with message: "Monthly update - [Month] [Year]"
5. No need to update BOARD-EXECUTIVE-SUMMARY.md monthly

---

### Quarterly Reviews (Strategic)

**What to Update:**
- Strategic direction and priorities
- Market analysis and competitive landscape
- Risk assessment
- Financial projections (update forward-looking numbers)
- Roadmap and milestones
- Both documents (VISION-AND-STRATEGY and BOARD-EXECUTIVE-SUMMARY)

**Who Reviews:**
- CEO (leads the review)
- Leadership Team (provides input)
- Board of Directors (reviews and approves)

**Process:**
1. Schedule 2-day offsite (leadership team)
2. Review performance vs. plan
3. Identify what's working, what's not
4. Make strategic adjustments
5. Update both vision documents
6. Present to board for approval
7. Commit with message: "Q[X] [Year] Strategic Review"
8. Increment MINOR version (e.g., 2.1 → 2.2)

---

### Annual Reviews (Visionary)

**What to Update:**
- Complete refresh of vision
- 5-year projections
- Market opportunity reassessment
- Technology roadmap
- Competitive moat evolution
- Exit strategy

**Who Reviews:**
- CEO + Board of Directors
- Strategic Advisors
- Key Investors (if applicable)

**Process:**
1. Schedule board retreat (2-3 days)
2. Full business review
3. Market landscape analysis
4. Strategic pivots if needed
5. Complete document refresh
6. Increment MAJOR version (e.g., 2.0 → 3.0)

---

## How to Update Documents

### Step 1: Create a Branch (Git Workflow)

```bash
# For monthly updates
git checkout -b vision-update-jan-2026

# For quarterly reviews
git checkout -b vision-q1-2026-review

# For major revisions
git checkout -b vision-v3.0
```

### Step 2: Edit Documents

**For VISION-AND-STRATEGY.md:**
- Update specific sections (don't rewrite everything)
- Use "Find & Replace" for metric updates (e.g., all instances of "Year 1 Target: $3M")
- Add new sections if needed (append, don't insert in middle)
- Update "Last Updated" date at top
- Update version number if strategic changes

**For BOARD-EXECUTIVE-SUMMARY.md:**
- Focus on high-level changes only
- Update executive summary numbers
- Revise key metrics table
- Adjust financial projections
- Keep concise (no more than 30 pages)

### Step 3: Commit Changes

```bash
git add docs/VISION-AND-STRATEGY.md docs/BOARD-EXECUTIVE-SUMMARY.md
git commit -m "Monthly update - January 2026: Updated Q4 actuals, revised Year 2 projections"
```

### Step 4: Review & Merge

**For Monthly Updates:**
- Self-review for accuracy
- Merge to main immediately

**For Quarterly/Major Updates:**
- Share with leadership team for review
- Incorporate feedback
- Board approval (for major strategic changes)
- Merge to main after approval

---

## Document Ownership

### Primary Owner: CEO

**Responsibilities:**
- Maintains strategic vision alignment
- Approves all major updates
- Ensures documents reflect current reality
- Drives quarterly and annual reviews

### Contributors

| Role | Sections Owned | Update Frequency |
|------|---------------|------------------|
| **CEO** | All strategic sections, philosophy, vision | Quarterly |
| **CFO** | Financial model, projections, unit economics | Monthly |
| **CTO** | Technology architecture, AI strategy, infrastructure | Quarterly |
| **CPO** | Product roadmap, user journeys, dashboards | Quarterly |
| **VP Operations** | Team structure, pod performance, operational metrics | Monthly |
| **VP Marketing** | Go-to-market, customer acquisition, competitive analysis | Quarterly |
| **Board** | Review and approve (advisory role) | Quarterly |

---

## Usage Guidelines

### For Team Members

**When starting a new project:**
1. Read VISION-AND-STRATEGY.md (relevant sections)
2. Understand how your work fits the bigger picture
3. Ensure alignment with principles and metrics

**When making decisions:**
1. Check "Founder Principles & Decision Framework" section
2. Reference non-negotiable metrics
3. Consult competitive moat and strategic priorities

**When onboarding:**
1. Read BOARD-EXECUTIVE-SUMMARY.md first (high-level overview)
2. Then read your relevant sections in VISION-AND-STRATEGY.md
3. Ask questions if anything is unclear

### For Board Members

**Before each meeting:**
1. Read updated BOARD-EXECUTIVE-SUMMARY.md
2. Review metrics vs. targets
3. Identify questions and discussion topics

**During strategic reviews:**
1. Use VISION-AND-STRATEGY.md for deep dives
2. Challenge assumptions
3. Provide external perspective

### For Investors (Current or Prospective)

**For due diligence:**
1. Start with BOARD-EXECUTIVE-SUMMARY.md
2. Deep-dive into financial model sections
3. Review competitive landscape and risks
4. Understand unit economics and path to profitability

**After investment:**
1. Quarterly review of BOARD-EXECUTIVE-SUMMARY.md
2. Track metrics vs. projections
3. Monitor risk mitigation progress

---

## Integration with Other Documents

### Relationship to Other Docs

```
VISION-AND-STRATEGY.md (strategic)
    ↓
CLAUDE.md (implementation context)
    ↓
PROJECT-STRUCTURE.md (technical organization)
    ↓
Individual CLAUDE.md files in each folder (tactical execution)
```

**Flow:**
1. **Vision** drives what we build (this document)
2. **Context** (CLAUDE.md) tells AI how to build it
3. **Structure** organizes the codebase
4. **Folder docs** provide specific implementation guidance

### Consistency Checks

**When updating Vision docs, also update:**
- `/CLAUDE.md` - Ensure project context aligns with vision
- `/PROJECT-STRUCTURE.md` - Verify folder organization matches strategic priorities
- `/.claude/agents/*/prompt.md` - Update agent prompts to reflect new priorities
- Relevant folder CLAUDE.md files if strategy changes affect their purpose

---

## Templates for Common Updates

### Template: Monthly Metric Update

```markdown
## [Month] [Year] Update

**Revenue:**
- Actual: $XXX,XXX (vs. Target: $XXX,XXX)
- Variance: +/- XX%

**Students:**
- Enrolled: XXX (vs. Target: XXX)
- Placement Rate: XX% (vs. Target: 80%)

**Placements:**
- Recruiting: XX (vs. Target: XX)
- Bench: XX (vs. Target: XX)

**Team:**
- Headcount: XX (vs. Target: XX)
- Open roles: XX

**Notes:**
- [Key wins this month]
- [Challenges encountered]
- [Adjustments made]
```

### Template: Quarterly Review Summary

```markdown
## Q[X] [Year] Review Summary

**Performance vs. Plan:**
- Revenue: XX% of target (Reason: ...)
- Margin: XX% vs. XX% target
- Key wins: [3-5 bullet points]
- Challenges: [3-5 bullet points]

**Strategic Adjustments:**
- [What we're changing and why]
- [New priorities]
- [Deprioritized initiatives]

**Updated Projections:**
- Year-end revenue: $XXM → $XXM (revised)
- Reason for revision: [Market, execution, opportunity, etc.]

**Action Items for Next Quarter:**
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

## Archiving Old Versions

### When to Archive

- After major version changes (2.0 → 3.0)
- Annually (keep last 3 years)

### Where to Archive

Create folder: `/docs/archive/vision/`

```
/docs/archive/vision/
├── 2026/
│   ├── VISION-AND-STRATEGY-v2.0.md (Jan 2026)
│   ├── VISION-AND-STRATEGY-v2.4.md (Dec 2026)
│   └── BOARD-EXECUTIVE-SUMMARY-v1.4.md (Dec 2026)
├── 2027/
│   ├── VISION-AND-STRATEGY-v3.0.md (Jan 2027)
│   └── ...
```

### Archive Process

```bash
# Before incrementing major version
cp docs/VISION-AND-STRATEGY.md docs/archive/vision/2026/VISION-AND-STRATEGY-v2.4.md
cp docs/BOARD-EXECUTIVE-SUMMARY.md docs/archive/vision/2026/BOARD-EXECUTIVE-SUMMARY-v1.4.md

# Then update main documents with new version
```

---

## Troubleshooting

### "Documents are getting too long"

**Solution:**
- Keep BOARD-EXECUTIVE-SUMMARY under 30 pages (concise)
- VISION-AND-STRATEGY can be long (it's comprehensive)
- Move historical data to appendices
- Archive old sections to `/docs/archive/`

### "Metrics are out of sync between documents"

**Solution:**
- Update VISION-AND-STRATEGY first (source of truth)
- Then copy key metrics to BOARD-EXECUTIVE-SUMMARY
- Use same exact numbers (don't round differently)
- Run consistency check script (future: automate this)

### "Team isn't reading the documents"

**Solution:**
- Don't make them read everything
- Create role-specific summaries
- Reference specific sections in meetings
- Use documents to answer questions (not repeat verbally)
- Make it a requirement for strategic decisions

---

## Future Enhancements

### Planned Improvements

1. **Automated Metric Updates** (Q2 2026)
   - Script to pull metrics from database
   - Auto-generate monthly update sections
   - Reduce manual work

2. **Interactive Dashboard** (Q3 2026)
   - Web view of BOARD-EXECUTIVE-SUMMARY
   - Real-time metrics (vs. static document)
   - Export to PDF for board meetings

3. **AI-Assisted Updates** (Q4 2026)
   - AI reads documents + metrics
   - Suggests updates based on changes
   - Drafts quarterly review summaries

4. **Consistency Checker** (Q1 2027)
   - Automated checks for metric mismatches
   - Validates links between documents
   - Flags outdated sections

---

## Questions?

**For document process questions:**
- Contact: CEO or designated document owner
- Slack: #vision-docs channel (create if needed)

**For content questions:**
- See "Document Ownership" section above
- Ask the section owner directly

**For git/technical questions:**
- Contact: CTO or tech lead
- Wiki: [Link to internal wiki with git tutorials]

---

**Last Updated:** November 17, 2025
**Document Owner:** CEO
**Next Review:** January 2026 (Monthly), February 2026 (Quarterly)
