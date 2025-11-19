# Epic Dependency Map

## Visual Representation

```
                    ┌──────────────────────────────┐
                    │   EPIC 1: FOUNDATION         │
                    │   (Week 1-4)                 │
                    │   - Auth, User Mgmt, DB,     │
                    │     Event Bus, UI Library    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐      ┌───────────────────────┐
        │ EPIC 2: ACADEMY       │      │ EPIC 6: HR & EMPLOYEE │
        │ (Week 5-10)           │      │ (Week 14-18)          │
        │ - LMS, AI Mentor,     │      │ - Timesheets, Leave,  │
        │   Courses, Grading    │      │   Expenses, Docs      │
        └───────────┬───────────┘      └───────────┬───────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐      ┌───────────────────────┐
        │ EPIC 3: RECRUITING    │      │ EPIC 7: PRODUCTIVITY  │
        │ (Week 8-13)           │      │ (Week 16-21)          │
        │ - ATS, Jobs, AI       │      │ - Pods, Sprints,      │
        │   Matching, 48hr SLA  │      │   Cross-Pollination   │
        └───────────┬───────────┘      └───────────────────────┘
                    │
                    ├──────────────┬───────────────┐
                    ▼              ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
        │ EPIC 4: BENCH    │  │ EPIC 5: TA   │  │ EPIC 8: CROSS-   │
        │ (Week 11-14)     │  │ (Week 12-16) │  │ BORDER           │
        │ - Bench Mgmt,    │  │ - Outbound,  │  │ (Week 22-25)     │
        │   Commissions    │  │   Partnerships│ │ - LMIA, H-1B     │
        └──────────────────┘  └──────────────┘  └──────────────────┘
```

## Dependency Table

| Epic | Requires (Must Build First) | Enables (Unlocks These) | Parallel (Can Build Together) |
|------|----------------------------|------------------------|------------------------------|
| **1. Foundation** | None | All other epics | None (must finish first) |
| **2. Academy** | Epic 1 | Epic 3 (graduates → candidates) | Epic 6 (HR) |
| **3. Recruiting** | Epic 1, Epic 2 (for pipeline) | Epic 4 (Bench), Epic 5 (TA) | Epic 6 (HR) |
| **4. Bench Sales** | Epic 1, Epic 3 (for clients) | Cross-pollination revenue | Epic 5 (TA), Epic 6 (HR) |
| **5. TA (Outbound)** | Epic 1, Epic 3 (for fulfillment) | Enterprise clients, Epic 8 (Cross-Border) | Epic 4 (Bench), Epic 6 (HR) |
| **6. HR & Employee** | Epic 1 | Epic 7 (Productivity - uses timesheet data) | Epic 2, 3, 4, 5 |
| **7. Productivity** | Epic 1, Epic 6 (employee data) | Cross-pollination detection | None (near end of Year 1) |
| **8. Cross-Border** | Epic 1, Epic 3, Epic 5 (clients) | Gold mine opportunities (H-1B, TN visa) | None (Year 2 priority) |

## Critical Path Analysis

### Shortest Path to Revenue

1. **Epic 1** (Week 1-4): Foundation
2. **Epic 2** (Week 5-10): Academy → First students enrolled, tuition revenue
3. **Epic 3** (Week 8-13): Recruiting → First placements, $5K fees

**Total:** 13 weeks to first recruiting revenue

### Full Platform (Year 1 Complete)

1. Epic 1 → 2 → 3 → 4 → 5 (Revenue pillars operational by Week 16)
2. Epic 6 → 7 (Internal operations optimized by Week 21)
3. Epic 8 (Year 2 priority, setup in Week 22-25)

**Total:** 25 weeks to full Year 1 platform

## Sequencing Rationale

### Why This Sequence

**1. Foundation First (Epic 1):**
- Non-negotiable: All other epics depend on auth, DB, event bus
- Lesson from legacy: Build foundation BEFORE modules (avoid integration hell)

**2. Academy Early (Epic 2, Week 5):**
- Creates talent pipeline for Recruiting (graduates → candidates)
- Early revenue ($499/month subscriptions start immediately)
- Proves AI mentor concept (critical differentiator)

**3. Recruiting Core (Epic 3, Week 8):**
- Overlaps with Academy finish (Week 10)
- By Week 11: First Academy graduates → First recruiting placements
- Highest revenue pillar ($1.5M Year 1)

**4. Bench + TA Parallel (Epics 4-5, Week 11-16):**
- Both depend on Recruiting (share client base)
- Can build in parallel (different teams)
- Bench is faster (4 weeks) than TA (5 weeks)

**5. HR Mid-Stream (Epic 6, Week 14):**
- Not customer-facing (internal operations)
- Can start when recruiting is stable
- Parallel with Bench + TA finish

**6. Productivity Late (Epic 7, Week 16):**
- Requires HR data (timesheets, teams)
- Cross-pollination AI needs other modules operational (conversations to analyze)
- Near Year 1 end (when pods are established, metrics matter)

**7. Cross-Border Last (Epic 8, Week 22):**
- Year 2 priority ($0 revenue Year 1)
- Requires recruiting + TA operational (client relationships)
- Most complex (immigration paperwork, government processes)

## Risk Mitigation

**Risk:** Foundation takes longer than 4 weeks

**Mitigation:** Lock scope (MVP features only), time-box to 4 weeks max, defer nice-to-haves

**Risk:** Academy and Recruiting both slip → no revenue by Week 13

**Mitigation:** Academy Week 5-10 (6 weeks buffer), Recruiting overlaps Week 8 (starts before Academy done)

**Risk:** Team capacity (not enough developers for parallel work)

**Mitigation:** Sequence critical path first (Foundation → Academy → Recruiting), only parallelize when safe (Bench + TA, both simple)

**Risk:** Cross-pollination AI (Epic 7) doesn't work

**Mitigation:** Optional Year 1 (manual cross-pollination via Slack/meetings), Epic 7 is enhancement not blocker

## Implementation Phases

### Phase 1: Foundation (Week 1-4)

- **Epic 1:** Complete
- **Team:** 2-3 developers, 1 architect
- **Deliverable:** Working authentication, database, event bus, UI library
- **Success:** Can create users, assign roles, publish events

### Phase 2: Revenue Pillars (Week 5-16)

- **Epics 2-5:** Academy, Recruiting, Bench, TA
- **Team:** 4-6 developers (can split into 2 teams after Week 10)
- **Deliverable:** All 5 business pillars operational
- **Success:** First students enrolled, first placements made, revenue flowing

### Phase 3: Operations (Week 14-21)

- **Epics 6-7:** HR, Productivity
- **Team:** 2-3 developers (parallel with Phase 2 finish)
- **Deliverable:** Internal operations optimized, cross-pollination detection
- **Success:** HR processes automated, pod metrics tracked, cross-pollination opportunities captured

### Phase 4: Advanced (Week 22-25, Year 2 Prep)

- **Epic 8:** Cross-Border
- **Team:** 1-2 developers + immigration specialist
- **Deliverable:** LMIA workflow ready for Year 2 pilot
- **Success:** First LMIA case processed (even if not approved until Year 2)

---

**Related Documents:**

- [All Epics](./README.md)
- [Business Model](../../vision/02-BUSINESS-MODEL.md)
- [Financial Model](../../vision/03-FINANCIAL-MODEL.md)
