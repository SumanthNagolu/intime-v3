# Employee AI Twins: Personalized Workflow Assistants

**Feature:** AI-powered personal assistant for each employee (learns work style, proactive guidance)
**Architecture:** Multi-Agent per Role (Recruiter Twin, Trainer Twin, Bench Sales Twin)
**Budget:** $226,700/year (200 employees)
**ROI:** 7.1× (saves $1.6M in manager overhead)

---

## Overview

**Purpose:** AI assistant that knows each employee's:
- Work style and preferences
- Current pipeline/tasks
- Historical patterns
- Strengths and struggles

**Why Multi-Agent per Role?**
- Recruiter workflow ≠ Trainer workflow
- Role-specific terminology (CRM, pipeline, sourcing vs. students, grading, modules)
- Different proactive suggestions needed

---

## Architecture

```
┌───────────────────────────────────────┐
│  Employee AI Twin (One per person)    │
│  • Morning briefings                  │
│  • Proactive suggestions (3×/day)     │
│  • Struggle detection                 │
└────────────┬──────────────────────────┘
             │
  ┌──────────┴───────────┬──────────────┐
  │                      │              │
┌─▼──────────┐  ┌────────▼───┐  ┌──────▼────┐
│ Recruiter  │  │ Trainer    │  │ Bench     │
│ Twin       │  │ Twin       │  │ Sales Twin│
│            │  │            │  │           │
│ Pipeline   │  │ Student    │  │ Vendor    │
│ mgmt       │  │ progress   │  │ outreach  │
│ Sourcing   │  │ Grading    │  │ Resume    │
│ tips       │  │ queue      │  │ marketing │
└────────────┘  └────────────┘  └───────────┘
```

---

## Recruiter AI Twin (Example)

### Morning Briefing (9:00 AM Daily)

```typescript
async function generateMorningBriefing(recruiterId: string) {
  // Get active pipeline
  const candidates = await db.query(`
    SELECT c.*, r.job_title, r.submission_deadline
    FROM candidates c
    JOIN requisitions r ON c.requisition_id = r.id
    WHERE c.owner_id = $1 AND c.status IN ('interviewing', 'offered')
    ORDER BY r.submission_deadline ASC
  `, [recruiterId]);

  // Get tasks due soon
  const tasks = await db.getTasks(recruiterId, { dueSoon: true });

  // Get calendar
  const events = await calendar.getEvents(recruiterId, new Date());

  // Generate briefing
  return await llm.complete({
    model: 'gpt-4o-mini',
    prompt: `Generate morning briefing for recruiter.

Active Candidates: ${candidates.length}
Urgent: ${candidates.filter(c => c.deadline < tomorrow).length}
Today's Schedule: ${events.length} events

Tasks:
${tasks.map(t => `- ${t.title} (due ${t.dueDate})`).join('\n')}

Format:
🔥 Urgent (do first)
⏰ Today's schedule
📋 Pipeline check
💡 Proactive suggestion
🎯 Sprint goal check`
  });
}

// Output example:
/*
Good morning Jane! Here's your Monday game plan:

🔥 **Urgent**
1. Follow up with Sarah Johnson - deciding on offer by EOD
2. Submit Mike Chen to Pipeline Solutions - deadline tomorrow

⏰ **Today's Schedule**
- 10:00 AM: Phone screen with Alex Rodriguez
- 2:00 PM: Client check-in with Accenture

📋 **Pipeline Check**
- 4 candidates in final round (2 need follow-up)
- 3 candidates awaiting feedback

💡 **Suggestion**
You usually batch LinkedIn sourcing Monday afternoons. Block 2:30-4:00 PM?

🎯 **Sprint Goal**
Target: 2 placements | Current: 1 placement, 3 strong candidates (on track!)
*/
```

### Real-Time Struggle Detection

```typescript
// Runs every 30 minutes, integrates with productivity tracking
async function detectStruggles(employeeId: string) {
  const recentActivity = await redis.get(`activity:${employeeId}:last2hours`);

  // Same task too long?
  if (recentActivity.duration > 7200) { // 2 hours
    await offerHelp({
      type: 'stuck_on_task',
      message: "Working on that candidate submission for 2+ hours. Need help drafting the email?",
      actions: ['Generate Email', 'Find Examples', 'Dismiss']
    });
  }

  // Behind on sprint goal?
  const sprintProgress = await checkSprintProgress(employeeId);
  if (sprintProgress.placements < sprintProgress.target * 0.5) {
    await offerHelp({
      type: 'behind_on_goal',
      message: "Sprint ends Friday. Currently at 0 placements (target: 2). Let's review your pipeline?",
      actions: ['Review Pipeline', 'Schedule 1-on-1', 'Dismiss']
    });
  }
}
```

### Memory: Three-Tier System

```
Short-Term (Redis, 24h):
├─ Last 10 conversations
├─ Current tasks/focus
└─ Today's activity summary

Long-Term (PostgreSQL, permanent):
├─ Work history (all tasks, completions)
├─ Preferences (email style, work hours)
└─ Performance metrics (placements, speed)

Pattern Memory (pgvector):
├─ Learned behaviors (typical Monday workflow)
├─ Similar situations (how I handled this before)
└─ Best practices (what works for me)
```

---

## Cost Projection

```
Per Employee (daily):
- Morning briefing: $0.005
- Proactive suggestions (3×): $0.015
- On-demand questions (5×): $0.025
- Struggle detection: $0.005
- Total: $0.05/day

Annual per employee:
- Basic features: $0.05 × 260 days = $13/year
- Advanced features (voice, analytics): $1,120/year
- Total: $1,133/employee/year

200 Employees:
- Basic: $2,600/year
- Advanced: $224,000/year
- Total: $226,700/year

vs. 20 middle managers:
- $80,000/year × 20 = $1,600,000/year
- Savings: $1,373,300 (86% cost reduction)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time Saved | 15+ hours/week per employee | Before/after tracking |
| Adoption | 80%+ daily active use | Usage analytics |
| Satisfaction | 4.5+ stars | Monthly NPS |
| Sprint Goal Hit Rate | 90%+ teams hit 2 placements | Performance data |

---

**Status:** ✅ Planned - Week 11-12 Implementation
**Dependencies:** Epic 2.5 (AI Infrastructure), Productivity Tracking (for struggle detection)
