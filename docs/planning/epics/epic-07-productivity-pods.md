# Epic 7: Productivity & Pod Management (Trikala)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Productivity & Pod Management (Trikala)

**🎯 Goal:** Track pod performance (2 placements per 2-week sprint) and detect cross-pollination opportunities (1 conversation = 5+ leads)

**💰 Business Value:** Ensures pods hit targets (2 placements/sprint = $3.43M Year 1 revenue); AI-detects cross-pollination (multiplies revenue 35×); enables data-driven pod management

**👥 User Personas:**

- Pod Members (9.5 pods, Senior + Junior pairs)
- Pod Leads (manage pod goals, review performance)
- Executives (CEO, CFO - view company-wide metrics)
- Admins (configure goals, view cross-pollination opportunities)

**🎁 Key Features:**

- Pod management (create pods, assign members, set goals)
- Sprint planning (2-week sprints, goal: 2 placements per pod)
- Activity tracking (time spent on tasks, conversations, calls, emails)
- Productivity insights (AI analysis of activity patterns, recommendations)
- Cross-pollination detection (AI analyzes conversations for 5-pillar opportunities)
- Opportunity pipeline (detected leads, assignment to appropriate pod, tracking)
- Pod performance dashboard (placements this sprint, goal progress, velocity)
- Focus sessions (deep work blocks, interruption prevention)
- Meeting recording integration (Zoom/Teams, transcription, action items)
- Action item extraction (AI extracts tasks from meetings, assigns to members)
- Leaderboard (pods ranked by placements, revenue, cross-pollination finds)
- Executive dashboard (company-wide KPIs, pod comparisons, revenue tracking)

**📊 Success Metrics:**

- 80% of pods hit 2 placements/sprint goal (8 of 9.5 pods)
- Cross-pollination detection: 100+ opportunities/month (from all conversations)
- Opportunity conversion: 20% (20 of 100 detected → actual revenue)
- Productivity increase: 15% (vs baseline without tracking)
- Meeting action items completed: 80% (vs 50% without AI extraction)
- Executive dashboard usage: Daily (CEO/CFO check metrics every morning)

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation), Epic 6 (HR - for employee/team data)
- **Enables:** Cross-pollination revenue (multiplies all other epic revenue)
- **Blocks:** None

**⏱️ Effort Estimate:** 6 weeks, ~30 stories

**📅 Tentative Timeline:** Week 16-21 (After HR foundation)

**Key Stories (Sample):**

1. Create pods table (name, senior_id, junior_id, pillar, goals)
2. Build pod management interface (create, edit, member assignment)
3. Implement sprint planning (2-week cycles, goal setting, tracking)
4. Create activity tracking (time logs, task categories, manual entry)
5. Build AI productivity insights (analyze patterns, suggest optimizations)
6. Implement cross-pollination AI (conversation analysis, opportunity detection)
7. Create opportunity pipeline (detected leads, categorize by pillar, assign)
8. Build pod performance dashboard (current sprint, placements, goal progress)
9. Implement focus sessions (pomodoro timer, interruption blocking)
10. Create meeting recording integration (Zoom API, auto-record, transcribe)
11. Build action item extraction (AI extracts tasks, assigns to members)
12. Implement leaderboard (pods ranked, gamification, recognition)
13. Create executive dashboard (company KPIs, pod comparisons, trends)
14. Build cross-pollination notification (alert appropriate pod when lead detected)
15. Implement reporting (sprint retrospectives, velocity trends, revenue attribution)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Pod Structure

### 2-Person Pod Model

**Senior + Junior Pair:**
- **Senior:** 5+ years experience, leads strategy, closes deals
- **Junior:** 1-3 years experience, handles research, follow-ups

**Goal:** 2 placements per 2-week sprint per pod

**Year 1 Pods (9.5 total):**
- 1 Training Academy pod
- 6 Recruiting pods
- 1 Bench Sales pod
- 1 Talent Acquisition pod
- 0.5 Cross-Border specialist (Year 2 → full pod)

### Sprint Planning

**2-Week Sprint Structure:**

```
SPRINT GOAL: 2 placements

WEEK 1:
├─ Monday: Sprint planning (set goal, identify leads)
├─ Tuesday-Thursday: Outreach (calls, emails, submissions)
├─ Friday: Retrospective (what worked? what didn't?)

WEEK 2:
├─ Monday: Mid-sprint check-in (on track? adjust?)
├─ Tuesday-Thursday: Interviews, offer negotiations
├─ Friday: Sprint close (count placements, celebrate wins)
```

---

## Cross-Pollination AI

### The 35× Multiplier

**Concept:** Every conversation has 5+ business opportunities across all pillars

**Example Conversation:**

```
RECRUITER (on call with candidate):
"So you're looking for PolicyCenter work. Tell me about your background."

CANDIDATE:
"I have 5 years PolicyCenter experience. I'm currently on bench at XYZ Agency.
My friend Rahul is also looking - he's in India, wants to move to Canada.
And my previous client ABC Insurance is hiring 10 PolicyCenter devs for their
new implementation. I could introduce you if helpful."

CROSS-POLLINATION OPPORTUNITIES DETECTED:
1. Candidate himself (Recruiting opportunity) ✅
2. Bench consultant (Bench Sales opportunity) ✅
3. Referral - Rahul (Cross-Border opportunity) ✅
4. Client lead - ABC Insurance (TA opportunity) ✅
5. ABC Insurance needs 10 devs (Volume hiring = Strategic Partnership) ✅

RESULT: 1 conversation = 5+ lead opportunities
```

### AI Detection

**How It Works:**

```typescript
async function analyzeConversation(transcript: string) {
  const prompt = `Analyze this conversation for business opportunities across:
  - Training Academy (mentions wanting to learn Guidewire)
  - Recruiting (candidate looking for job)
  - Bench Sales (consultant between projects)
  - Talent Acquisition (company implementing Guidewire)
  - Cross-Border (international candidate wants US/Canada)

  Transcript: ${transcript}

  Return JSON with detected opportunities.`;

  const opportunities = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  return opportunities;
}
```

**AI Output:**

```json
{
  "opportunities": [
    {
      "type": "recruiting",
      "confidence": 0.95,
      "details": "Candidate has 5 years PolicyCenter, actively looking",
      "action": "Submit to active PolicyCenter roles"
    },
    {
      "type": "bench_sales",
      "confidence": 0.90,
      "details": "Candidate currently on bench at XYZ Agency",
      "action": "Add to bench pipeline, proactive outreach"
    },
    {
      "type": "cross_border",
      "confidence": 0.85,
      "details": "Friend 'Rahul' in India wants Canada",
      "action": "Get Rahul's contact, start LMIA process"
    },
    {
      "type": "talent_acquisition",
      "confidence": 0.92,
      "details": "ABC Insurance hiring 10 PolicyCenter devs",
      "action": "Reach out to ABC, offer volume hiring support"
    },
    {
      "type": "partnership",
      "confidence": 0.88,
      "details": "ABC needs 10 devs = volume hiring = partnership opportunity",
      "action": "Pitch Strategic Partner tier ($5K/month retainer)"
    }
  ]
}
```

---

## Pod Performance Dashboard

### Real-Time Metrics

**For Pod Members:**

```
CURRENT SPRINT (Week 1 of 2)
Goal: 2 placements by Friday

PROGRESS:
├─ Placements: 0 / 2 (⚠️ Behind)
├─ Active Candidates: 8
├─ Interviews Scheduled: 3 (this week)
├─ Offers Pending: 1 (waiting on client)
└─ Days Remaining: 10

ACTION ITEMS:
1. Follow up on pending offer (Client ABC)
2. Submit 2 more candidates this week (beat 48-hour SLA)
3. Schedule 2 more interviews (close conversion gap)

CROSS-POLLINATION:
├─ Opportunities Detected: 3 (this sprint)
├─ Opportunities Assigned: 2 (to other pods)
└─ Credit for Referrals: $10K (commission from TA pod)
```

**For Pod Leads:**

```
ALL PODS OVERVIEW

RECRUITING PODS (6 total):
├─ Pod 1: 2 placements ✅ (goal met)
├─ Pod 2: 1 placement ⚠️ (1 more needed)
├─ Pod 3: 3 placements 🎉 (exceeded goal!)
├─ Pod 4: 0 placements ❌ (intervention needed)
├─ Pod 5: 2 placements ✅
└─ Pod 6: 1 placement ⚠️

SPRINT GOAL ACHIEVEMENT: 67% (4 of 6 pods hit goal)

ACTION: Coach Pod 4 (behind), celebrate Pod 3 (exceeded)
```

---

## Executive Dashboard

### CEO/CFO Morning View

**Company-Wide KPIs (Today):**

```
REVENUE (MTD):
├─ Training Academy: $41,560 (83 students × $499/month)
├─ Recruiting: $125,000 (25 placements × $5K)
├─ Bench Sales: $94,200 (5 placements × $10K + commissions)
├─ TA: $15,000 (3 placements from enterprise clients)
└─ TOTAL: $275,760 MTD (on track for $3.43M year)

PLACEMENTS (This Sprint):
├─ Goal: 19 placements (9.5 pods × 2 each)
├─ Actual: 15 placements (79% of goal)
└─ Forecast: 17 by Friday (89% of goal)

CROSS-POLLINATION:
├─ Opportunities Detected: 87 this month
├─ Opportunities Converted: 18 (21% conversion)
├─ Cross-Pollination Revenue: $90K (attributed)
└─ Multiplier Effect: 35× (as projected!)

POD PERFORMANCE:
├─ Top Performer: Recruiting Pod 3 (3 placements)
├─ Needs Support: Recruiting Pod 4 (0 placements)
└─ Overall: 79% hitting goals (target: 80%)
```

---

## Meeting Recording & Action Items

### Auto-Transcription

**Zoom Integration:**

```typescript
// Subscribe to Zoom meeting end event
zoomWebhook.on('meeting.ended', async (event) => {
  const meetingId = event.meetingId;

  // Download recording
  const recording = await zoom.downloadRecording(meetingId);

  // Transcribe (Whisper API)
  const transcript = await openai.audio.transcriptions.create({
    file: recording,
    model: 'whisper-1'
  });

  // Extract action items (GPT-4o)
  const actionItems = await extractActionItems(transcript.text);

  // Assign to pod members
  for (const item of actionItems) {
    await createTask({
      assignedTo: item.assignee,
      description: item.task,
      dueDate: item.dueDate,
      source: 'meeting_recording'
    });
  }
});
```

**Action Item Extraction:**

```
MEETING: Client Discovery Call (ABC Insurance)
PARTICIPANTS: TA Specialist, Client CTO

ACTION ITEMS EXTRACTED:
1. [TA Specialist] Send 5 PolicyCenter candidate profiles by Friday
2. [Client CTO] Review profiles by Monday
3. [TA Specialist] Schedule interviews for shortlisted candidates (next week)
4. [TA Specialist] Follow up on Wednesday if no response
```

---

## Gamification & Leaderboard

### Pod Rankings

**Monthly Leaderboard:**

```
🏆 TOP PERFORMERS (March 2026)

1. 🥇 Recruiting Pod 3
   ├─ Placements: 12 (goal: 8)
   ├─ Revenue: $60K
   ├─ Cross-Pollination Finds: 5
   └─ Reward: $1,000 bonus split

2. 🥈 Bench Sales Pod
   ├─ Placements: 8 (goal: 8)
   ├─ Revenue: $94K (commissions!)
   ├─ Cross-Pollination Finds: 3
   └─ Reward: Team dinner ($500)

3. 🥉 Recruiting Pod 1
   ├─ Placements: 9 (goal: 8)
   ├─ Revenue: $45K
   ├─ Cross-Pollination Finds: 2
   └─ Reward: Recognition (company-wide Slack)
```

---

## Success Criteria

**Definition of Done:**

1. ✅ All pods created, members assigned, goals set
2. ✅ Sprint planning functional (2-week cycles, goal tracking)
3. ✅ Cross-pollination AI detects opportunities from conversations
4. ✅ Opportunities assigned to appropriate pods
5. ✅ Pod performance dashboard shows real-time progress
6. ✅ Executive dashboard aggregates company-wide metrics
7. ✅ Meeting recordings auto-transcribed, action items extracted
8. ✅ Leaderboard ranks pods by performance

**Quality Gates:**

- 80%+ of pods hit 2 placements/sprint goal
- Cross-pollination: 100+ opportunities/month detected
- Opportunity conversion: 20%+ (detected → revenue)
- Executive dashboard: Used daily by CEO/CFO

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 6: HR & Employee](./epic-06-hr-employee.md) (Required for employee data)
- All revenue epics (benefits from cross-pollination detection)

**Next Epic:** [Epic 8: Cross-Border Solutions](./epic-08-cross-border.md)
