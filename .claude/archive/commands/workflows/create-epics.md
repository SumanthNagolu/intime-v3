---
description: Stage 2 - Break a feature into major epics
---

I'll help you break down a feature into epics using the PM Agent.

**What This Does:**
1. Reads the feature definition from `docs/planning/features/[feature-name].md`
2. Breaks it into 3-5 major epics
3. Estimates timeline and dependencies for each epic
4. Creates epic documents

**Process:**
- PM Agent analyzes feature scope
- Creates epic breakdown
- Output: `docs/planning/epics/epic-[id]-[name].md` (multiple files)
- Next step: Run `/workflows:create-stories [epic-id]` for each epic

Let me spawn the PM Agent to create the epic breakdown...
