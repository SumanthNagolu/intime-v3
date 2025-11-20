---
description: Stage 4 - Plan a sprint with stories from an epic
---

I'll help you plan a sprint using the PM Agent.

**What This Does:**
1. Reads all stories for the specified epic
2. Selects stories for this sprint (target: 20-25 story points per 2-person team)
3. Orders stories by dependencies
4. Creates sprint plan with timeline
5. Identifies risks and blockers

**Process:**
- PM Agent analyzes story points and dependencies
- Creates optimal sprint plan
- Output: `docs/planning/sprints/sprint-[N]/sprint-plan.md`
- Next step: Execute stories with `/workflows:feature [story-id]`

**Sprint Capacity Rules:**
- 2-week sprint
- Target: 20-25 story points (2 developers)
- Buffer: 20% for unknowns
- 1 story point = ~4 hours work

Let me spawn the PM Agent to create the sprint plan...
