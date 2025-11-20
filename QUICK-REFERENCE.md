# InTime v3 - Quick Reference Card

## 🎯 One-Sentence Summary
**Gemini 1.5 Pro** for strategy/architecture/quality, **Cursor** for active coding/debugging/iteration - both tools share full InTime knowledge.

---

## ⚡ Quick Decision Matrix

| I Need To... | Use This Tool | Why |
|-------------|--------------|-----|
| Plan a new feature | Gemini | PM Agent + Architect Agent workflow |
| Write component code | Cursor | Visual feedback, fast iteration |
| Design database schema | Gemini | Database Architect enforces RLS/audit trails |
| Fix a bug | Cursor | Inline edits, quick debugging |
| Make strategic decision | Gemini | CEO/CFO Advisor analysis |
| Refactor code | Cursor | Multi-file editing, visual diff |
| Run comprehensive tests | Gemini | QA Agent with full test suite |
| Build UI components | Cursor | Design system compliance, visual preview |
| Security audit | Gemini | Security Auditor specialist |
| Deploy to production | Gemini | Deployment Specialist workflow |

---

## 📅 Recommended Daily Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ MORNING (30-60 min) - Gemini                                │
├─────────────────────────────────────────────────────────────┤
│ • Review priorities (CEO Advisor)                           │
│ • Plan features (PM Agent)                                  │
│ • Design schemas (Database Architect)                       │
│                                                             │
│ OUTPUT: Requirements + Architecture docs in                 │
│         .gemini/state/artifacts/                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DAY (4-6 hours) - Cursor                                    │
├─────────────────────────────────────────────────────────────┤
│ • Implement planned features                                │
│ • Build UI components                                       │
│ • Write server actions                                      │
│ • Debug issues                                              │
│ • Refactor code                                             │
│                                                             │
│ OUTPUT: Working code in src/, tests in tests/               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EVENING (30-60 min) - Gemini                                │
├─────────────────────────────────────────────────────────────┤
│ • Run comprehensive tests (QA Agent)                        │
│ • Security audit (Security Auditor)                         │
│ • Deploy to production (Deployment Specialist)              │
│                                                             │
│ OUTPUT: Test reports, production deployment, session log    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 Agent Simulation in Cursor

Tell Cursor which agent perspective to take:

```typescript
// ❌ Generic prompt
"Design a database table"

// ✅ With agent simulation
"Act as Database Architect (see .gemini/agents/implementation/database-architect.md).

Design a candidates table with:
- RLS policies enabled
- Multi-tenancy (org_id column)
- Audit trails (created_at, updated_at, created_by, updated_by, deleted_at)
- Soft delete support
- Proper indexes on foreign keys

Follow InTime database standards."
```

**Available Agents:**
- **CEO Advisor** - Strategic decisions, cross-pollination analysis
- **PM Agent** - Requirements, user stories, success metrics
- **Database Architect** - Schema design, RLS, multi-tenancy
- **Frontend Developer** - UI components, minimal design system
- **QA Engineer** - Testing, multi-tenancy validation
- **Security Auditor** - Security review, GDPR compliance

---

## 🎨 Design System (Critical Before Any UI Work)

### Color Palette (USE ONLY THESE)
```typescript
Background: "#F5F3EF"  // Light beige
Cards:      "#FFFFFF"  // Pure white
Callouts:   "#000000"  // Black
Text:       "#000000"  // Black
Secondary:  "#4B5563"  // Gray-600
Metadata:   "#9CA3AF"  // Gray-400
Accent:     "#C87941"  // Coral (underlines ONLY)
Borders:    "#E5E7EB"  // Gray-200
```

### Typography
```typescript
Font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
Headings: "text-6xl to text-8xl, font-bold"
Body: "text-xl text-gray-700 leading-relaxed"
Underline: "decoration-[#C87941] decoration-4 underline-offset-8"
```

### 🚫 FORBIDDEN (Will Fail QA)
- ❌ Purple/pink/indigo gradients
- ❌ Emoji icons (🎓, 🚀, 💡)
- ❌ Rounded corners (`rounded-lg`)
- ❌ Heavy shadows (`shadow-2xl`)
- ❌ Generic marketing copy ("Transform your X")

### ✅ USE INSTEAD
- ✅ Light beige backgrounds
- ✅ Sharp edges (no rounded corners)
- ✅ 2px borders
- ✅ Coral underlines for emphasis
- ✅ Generous white space
- ✅ System fonts only

---

## 💻 Code Conventions (Auto-Applied)

### TypeScript Strict Mode
```typescript
// ❌ WRONG
function process(data: any) { ... }

// ✅ RIGHT
function process(data: unknown): Result {
  const validated = schema.parse(data) // Zod validation
  return result
}
```

### Database Operations
```typescript
// ✅ ALWAYS include org_id (multi-tenancy)
export async function getCandidates(orgId: string) {
  return await db.query.candidates.findMany({
    where: and(
      eq(candidates.orgId, orgId),
      isNull(candidates.deletedAt) // Soft delete
    )
  })
}

// ✅ ALWAYS soft delete (never hard delete)
await db.update(candidates)
  .set({ deletedAt: new Date() })
  .where(eq(candidates.id, id))
```

### React Components
```typescript
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// ✅ Client Component (only when needed)
"use client"
export function Interactive() {
  const [state, setState] = useState()
  // ...
}
```

---

## 🧪 Testing Requirements

### Must-Have Tests
```typescript
// 1. Multi-Tenancy Isolation (CRITICAL)
test('org A cannot see org B data', async () => {
  const orgA = await createOrg()
  const orgB = await createOrg()
  const dataB = await createData({ orgId: orgB.id })
  
  const results = await getData(orgA.id)
  expect(results).not.toContain(dataB)
})

// 2. Design Compliance
test('no AI-generic gradients', async ({ page }) => {
  await page.goto('/')
  const hasAIGradient = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => {
      const bg = getComputedStyle(el).background
      return bg.includes('purple') && bg.includes('pink')
    })
  })
  expect(hasAIGradient).toBe(false)
})

// 3. Soft Delete
test('deleted records hidden', async () => {
  const item = await create()
  await softDelete(item.id)
  
  const found = await find(item.id)
  expect(found).toBeNull()
})
```

**Coverage Target:** 80%+ for critical paths

---

## 📁 Essential Files

### Read Before Starting
1. **`GEMINI-USAGE-GUIDE.md`** - Complete workflow guide (10 min read)
2. **`.geminirules`** - All agent knowledge (reference, don't read cover-to-cover)
3. **`GEMINI.md`** - Project fundamentals
4. **`REPLICATION-SUMMARY.md`** - Migration context

### Reference During Work
- **`.gemini/agents/`** - Specialist agent expertise
- **`.gemini/commands/workflows/`** - Workflow patterns
- **`docs/planning/epics/`** - Feature specifications

---

## 🔧 MCP Servers (Shared Between Tools)

**Available:**
- GitHub - Repository operations
- Filesystem - File operations
- PostgreSQL - Direct database access (Supabase)
- Puppeteer - Browser automation
- Slack - Team notifications
- Sequential Thinking - Enhanced reasoning

**Configuration:** `.mcp.json` (works in both tools)

---

## ✅ Pre-Commit Checklist

Before committing:
- [ ] TypeScript compiles (no errors)
- [ ] ESLint passes
- [ ] Tests passing (80%+ coverage)
- [ ] Build succeeds (`pnpm build`)
- [ ] No console.logs in production
- [ ] RLS enabled on new tables
- [ ] Multi-tenancy respected (org_id in queries)
- [ ] Soft delete implemented (deleted_at)
- [ ] Design compliance (no AI-generic patterns)
- [ ] Accessible (WCAG AA)

---

## 🎯 Success Metrics

**You'll know it's working when:**

In Cursor:
- ✅ Suggests `org_id` in database queries automatically
- ✅ Applies Zod validation without prompting
- ✅ Uses minimal design (beige/black/coral, sharp edges)
- ✅ Rejects purple gradients and emojis
- ✅ Includes RLS in schema designs

In Gemini:
- ✅ CEO Advisor analyzes cross-pollination
- ✅ Database Architect enforces RLS and audit trails
- ✅ QA Engineer tests multi-tenancy isolation
- ✅ Workflows complete end-to-end

---

## 🆘 Quick Troubleshooting

**Issue:** Cursor not following InTime standards
**Fix:** Be more explicit: "Follow database standards in .geminirules" or "Act as Database Architect"

**Issue:** Not sure which tool to use
**Fix:** Strategic/quality → Gemini, Coding/debugging → Cursor

**Issue:** Need agent expertise
**Fix:** "Act as [Agent Name]. Read .gemini/agents/[tier]/[agent].md then..."

---

## 🚀 Most Common Commands

### In Cursor (Composer)
```
"Act as Database Architect. Design [table] with RLS, multi-tenancy, audit trails"

"Act as Frontend Developer. Build [component] using minimal design system 
(beige bg, black text, coral accents, sharp edges, system fonts)"

"Act as QA Engineer. Create test suite with multi-tenancy isolation tests"

"Implement [feature] following .gemini/state/artifacts/requirements.md"
```

### In Gemini
```bash
# Strategic review
$ gemini "As CEO Advisor, analyze [decision]"

# Plan feature
$ gemini "/start-planning"
$ gemini "/database"

# Quality check
$ gemini "/test"
$ gemini "As Security Auditor, review [feature]"

# Deploy
$ gemini "/deploy"
```

---

## 🎓 Learning Priority

**Week 1:** Understand tools
- [ ] Read `GEMINI-USAGE-GUIDE.md`
- [ ] Try simple task in each tool
- [ ] Practice agent simulation

**Week 2:** Establish workflow
- [ ] Follow morning/day/evening pattern
- [ ] Build one complete feature
- [ ] Reference design philosophy

**Week 3:** Optimize
- [ ] Personalize workflow
- [ ] Help team members
- [ ] Contribute improvements

---

## 💡 Pro Tips

1. **Keep both tools open** - Left: Cursor (code), Right: Terminal (Gemini)
2. **Reference explicitly** - "Follow .geminirules" vs "use design system"
3. **Simulate agents** - "Act as Database Architect" for better results
4. **Commit frequently** - Create handoff points between tools
5. **Start with strategy** - Don't jump into coding without planning

---

## 📊 Key Numbers to Remember

- **5 Pillars:** Training, Recruiting, Bench Sales, Talent Acquisition, Cross-Border
- **5+ Opportunities:** Cross-pollination target per conversation
- **2 Placements:** Per 2-week sprint per pod (target)
- **48 Hours:** Recruiting SLA
- **30-60 Days:** Bench sales SLA
- **80%+ Coverage:** Testing requirement
- **8 Agents:** CEO, CFO, PM, Architect, Frontend, API, QA, Deploy

---

**Last Updated:** 2025-11-19
**Print this page and keep it visible during development!**

**Philosophy:** "Two tools, one vision, zero compromises."


