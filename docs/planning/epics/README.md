# InTime v3 - Epics

**Version:** 1.0
**Created:** 2025-11-18
**Author:** PM Agent + CEO Advisor
**Status:** Ready for Architecture Review

---

## Overview

This directory contains detailed Epic Canvases for all 8 major initiatives in InTime v3. Each epic represents a complete module or business pillar with defined goals, features, success metrics, and dependencies.

## Epic List

### Revenue-Generating Epics

1. **[Foundation & Core Platform](./epic-01-foundation.md)** - Week 1-4, 4 weeks
   - Unified auth, database, event bus, UI library
   - **Business Value:** Enables all other epics

2. **[Training Academy (LMS)](./epic-02-training-academy.md)** - Week 5-10, 6 weeks
   - AI-powered Socratic learning, 8-week program
   - **Business Value:** $599K Year 1 revenue, 80% placement rate

3. **[Recruiting Services (ATS)](./epic-03-recruiting-services.md)** - Week 8-13, 6 weeks
   - 48-hour candidate submission guarantee
   - **Business Value:** $1.5M Year 1 revenue, 300 placements

4. **[Bench Sales](./epic-04-bench-sales.md)** - Week 11-14, 4 weeks
   - 30-day placement average, 5% commission model
   - **Business Value:** $1.13M Year 1 revenue, 92% margin

5. **[Talent Acquisition (Outbound)](./epic-05-talent-acquisition.md)** - Week 12-16, 5 weeks
   - Enterprise client pipeline building
   - **Business Value:** $200K Year 1, $200K LTV per client

### Operational Epics

6. **[HR & Employee Management](./epic-06-hr-employee.md)** - Week 14-18, 5 weeks
   - Timesheets, leave, expenses, documents
   - **Business Value:** Scales from 19 to 100+ employees

7. **[Productivity & Pod Management (Trikala)](./epic-07-productivity-pods.md)** - Week 16-21, 6 weeks
   - Pod tracking, cross-pollination detection
   - **Business Value:** 2 placements/sprint/pod = $3.43M Year 1

### Strategic Epics

8. **[Cross-Border Solutions](./epic-08-cross-border.md)** - Week 22-25, 4 weeks
   - LMIA/H-1B immigration workflows
   - **Business Value:** $0 Year 1, $100K Year 2, $1M Year 5

## Dependencies

See **[Dependency Map](./DEPENDENCY-MAP.md)** for:
- Visual dependency diagram
- Detailed dependency table
- Critical path analysis
- Sequencing rationale
- Risk mitigation strategies

## Quick Reference

### Critical Path to Revenue
1. Foundation (Week 1-4)
2. Academy (Week 5-10) → First tuition revenue
3. Recruiting (Week 8-13) → First placement revenue

**Total:** 13 weeks to first recruiting revenue

### Full Platform Timeline
**25 weeks** to complete all 8 epics (Year 1 platform)

### Key Metrics

| Epic | Duration | Stories | Year 1 Revenue |
|------|----------|---------|----------------|
| 1. Foundation | 4 weeks | 15 | Enables revenue |
| 2. Academy | 6 weeks | 30 | $599K |
| 3. Recruiting | 6 weeks | 35 | $1.5M |
| 4. Bench Sales | 4 weeks | 20 | $1.13M |
| 5. TA (Outbound) | 5 weeks | 25 | $200K |
| 6. HR & Employee | 5 weeks | 25 | Internal ops |
| 7. Productivity | 6 weeks | 30 | Multiplier |
| 8. Cross-Border | 4 weeks | 20 | $0 (Year 2) |
| **TOTAL** | **40 weeks*** | **200** | **$3.43M** |

*Some epics run in parallel, actual calendar time is 25 weeks

## Usage

### For Architects
Review each epic for:
- Technical feasibility
- Database schema requirements
- API surface area
- Integration points

### For Developers
Each epic includes:
- Key features to build
- Sample user stories
- Success criteria
- Testing requirements

### For Product/PM
Each epic includes:
- Business value justification
- User personas
- Success metrics
- Dependencies and sequencing

## Next Steps

1. **Architecture Review** - Validate technical approach for each epic
2. **Story Breakdown** - Decompose epics into detailed user stories
3. **Sprint Planning** - Organize stories into 2-week sprints
4. **Team Assignment** - Allocate developers to epics based on skills/capacity
5. **Kickoff** - Begin Week 1 with Epic 1: Foundation

---

**Document Owner:** PM Agent + CEO Advisor
**Review Cycle:** Weekly during implementation
**Related Documents:**
- [Business Model](../../vision/02-BUSINESS-MODEL.md)
- [Financial Model](../../vision/03-FINANCIAL-MODEL.md)
- [Database Schema](../../architecture/DATABASE-SCHEMA.md)
- [Event-Driven Integration](../../architecture/EVENT-DRIVEN-INTEGRATION.md)
