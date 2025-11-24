---
description: Stage 3 - Break an epic into implementable stories
---

I'll help you break down an epic into user stories using the PM Agent.

**What This Does:**
1. Reads the epic definition from `docs/planning/epics/[epic-id].md`
2. Breaks it into 5-15 implementable stories
3. Defines acceptance criteria for each story
4. Estimates story points
5. Creates story documents

**Process:**
- PM Agent analyzes epic requirements
- Creates detailed story breakdown
- Output: `docs/planning/stories/[epic-id]/[story-id]-[name].md` (multiple files)
- Next step: Run `/workflows:plan-sprint [sprint-number] [epic-id]`

**Story Naming Convention:**
- Foundation: FOUND-001, FOUND-002, etc.
- Training Academy: ACAD-001, ACAD-002, etc.
- AI Infrastructure: AI-INF-001, AI-GURU-001, etc.
- Recruiting: RECR-001, RECR-002, etc.

Let me spawn the PM Agent to create the story breakdown...
