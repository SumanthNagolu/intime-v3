# InTime v3: Quick Reference Guide
## Daily Execution Cheat Sheet

**Full Playbook:** See `IMPLEMENTATION-PLAYBOOK.md`

---

## 🚀 How to Start (Right Now)

### **Step 1: Begin Week -1 Day 1**

Open new Claude Code chat, copy-paste this:

```
I need you to act as the PM Agent and CEO Advisor working together.

Your task: Create 8 Epic Canvases for InTime v3.

Context:
- Review /CLAUDE.md for business vision (5-pillar model)
- Review /docs/requirements/ for detailed requirements
- Review /docs/architecture/DATABASE-SCHEMA.md for technical context

For each module (Admin, HR, Productivity, Recruiting, Bench Sales,
Training Academy, Talent Acquisition, Cross-Border), create a
1-page Epic Canvas using this template:

Epic Canvas Template:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Epic Name: [Module Name]
🎯 Goal: [One sentence]
💰 Business Value: [Why build this? Revenue impact?]
👥 User Personas: [Who uses this?]
🎁 Key Features: [5-7 bullets]
📊 Success Metrics: [How measure success?]
🔗 Dependencies: [Requires/Enables/Blocks]
⏱️ Effort Estimate: [Weeks, # stories]
📅 Tentative Timeline: [Week X-Y]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requirements:
1. Research industry best practices
2. Align with InTime vision
3. Identify dependencies
4. Estimate effort
5. Propose sequence

Deliverable: 8 Epic Canvases + Epic Dependency Map

Please proceed.
```

**Wait ~5 hours for agent output**

**Your action (2 hours):** Review epic canvases, approve/adjust

---

## ⏰ Daily Schedule (Mon-Thu)

```
09:00 - Run multi-agent prompts (3-4 parallel chats)
       Agent work time: ~4-6 hours

15:00 - Integration checkpoint (10 min)
       Pull code, run migrations, run tests

15:30 - Human review (30 min)
       Code review + manual testing + test review

16:00 - Security audit (15 min)
       Agent reviews, you check report

16:30 - Merge to main
       Commit, push, merge, cleanup

17:00 - Story COMPLETE ✓
```

---

## 📋 Human Review Checklist (30 min)

```
CODE REVIEW (10-15 min):
□ Read diffs
□ No 'any' types?
□ Error handling?
□ Comments present?
□ Follows patterns?

MANUAL TEST (10-15 min):
□ Happy path works?
□ Edge cases (null, empty, invalid)?
□ Security (bypass auth? cross-org access?)?

TEST REVIEW (5 min):
□ Coverage >80%?
□ All acceptance criteria tested?

DECISION:
✓ Approve → Security audit
✗ Request changes → Agent revises
```

---

## 🛠️ Essential Commands

```bash
# DATABASE
pnpm drizzle-kit push      # Apply migration
pnpm drizzle-kit studio    # Open DB GUI

# TESTING
pnpm test                  # Run all tests
pnpm test:coverage         # Check coverage

# QUALITY
pnpm tsc --noEmit          # Type check
pnpm lint                  # ESLint
pnpm build                 # Production build

# GIT
git checkout -b story-X-name
git add .
git commit -m "feat: description"
git push origin story-X-name
git checkout main
git merge story-X-name

# QUALITY GATE (before merge)
./scripts/pre-merge-check.sh
```

---

## 📅 Weekly Rhythm

**Friday:**
- Morning: Integration testing (2-3 hours)
- Midday: Retrospective (30 min)
- Afternoon: Plan next week (PM Agent → Your approval)

**Monday:**
- Review approved stories
- Start Story 1 at 9am

**Tue-Thu:**
- Continue daily pattern (1-2 stories/day)

---

## 🎨 Assets

**Figma (Premium available):**
- Use for UI designs (Week 2+)
- Export design tokens → Tailwind
- Component mockups → React

**Marketing Materials:**
- Migrate to Training Academy (Week 17-19)
- Reuse: Landing pages, emails, testimonials

---

## 🚨 When to Pause & Adjust

**Stop if:**
- Stories taking >1 day consistently
- Agent code quality <50% usable
- Integration breaking frequently
- Timeline slipping >1 week

**Action:**
1. Finish current story
2. Run retrospective
3. Identify root cause
4. Adjust (smaller stories, better prompts, etc.)
5. Resume

---

## 📞 Escalation

**Run CEO/CFO Advisor if:**
- Timeline slipping >2 weeks
- Scope too large
- Major architecture decision needed

---

## ✅ Success Metrics

**Per Story:**
- TypeScript: No errors
- ESLint: Passing
- Tests: >80% coverage
- Security: 0 critical vulnerabilities
- Review time: <35 min

**Per Week:**
- Stories: 5-7 completed
- Integration: All passing
- Human time: ~3.5 hours total

---

**Full details in:** `IMPLEMENTATION-PLAYBOOK.md`

**Ready to build!** 🚀
