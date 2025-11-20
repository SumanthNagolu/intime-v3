# Sprint 7: Productivity & Employee Bots - Agent Prompts

**Sprint:** Sprint 7 (Week 13-14)
**Epic:** Epic 2.5 - AI Infrastructure & Services
**Points:** 21
**Stories:** AI-PROD-001, AI-PROD-002, AI-PROD-003, AI-TWIN-001
**Goal:** Build activity tracking and personalized employee AI assistants for Epic 6 (HR & Employee)

---

## 📋 Sprint Context

### Sprint Objectives
1. Build Desktop Screenshot Agent (Electron app) for privacy-safe screenshot capture
2. Build Activity Classification Agent (GPT-4o-mini vision) for categorizing work activities
3. Build Daily Timeline Generator for narrative productivity reports
4. Build Employee AI Twin Framework for role-specific workflow assistants

### Success Criteria
- [ ] Screenshot capture respects privacy (employee controls work)
- [ ] Activity classification 90%+ accuracy
- [ ] Daily timelines generated for 200 employees
- [ ] Employee AI Twin delivers personalized briefings
- [ ] 80%+ adoption rate in pilot (10 volunteers)
- [ ] GDPR/CCPA compliance verified

### Key Dependencies
- ✅ AI-INF-005 (BaseAgent) - PROD-002, PROD-003, TWIN-001 extend BaseAgent
- ✅ Epic 1 (Database, Supabase Storage) - For screenshot storage

---

## 🎯 PM Agent Prompt

### Task
Manage Sprint 4 with focus on privacy compliance and employee adoption.

### Work Stream Allocation

**Developer A (16 pts): Productivity Pipeline**
- AI-PROD-001: Desktop Screenshot Agent (5 pts) - Days 1-3
- AI-PROD-002: Activity Classification (8 pts) - Days 4-7
- AI-PROD-003: Daily Timeline Generator (3 pts) - Days 8-9

**Developer B (5 pts): Employee AI Twins**
- AI-TWIN-001: Employee AI Twin Framework (5 pts) - Days 1-9

**QA Engineer: Privacy & Compliance**
- GDPR/CCPA audit (Days 6-8)
- Pilot testing with 10 volunteers (Days 9-10)

### Sprint Plan
```
Day 1-3:   Dev A: Screenshot Agent (Electron)    | Dev B: AI Twin Framework
Day 4-7:   Dev A: Activity Classification (Vision)| Dev B: Twin Templates (Recruiter, Trainer)
Day 8-9:   Dev A: Timeline Generator             | Dev B: Morning Briefings
Day 9-10:  QA: Privacy audit + Pilot test (10 volunteers)
Day 10:    Sprint review + Epic 2.5 completion demo
```

### Privacy Risk Management
**CRITICAL: Privacy is non-negotiable**

**Risks:**
1. **Risk:** Employees feel surveilled, reject system
   - **Mitigation:** Transparent communication (Week 11 all-hands), employee controls (pause/resume)
   - **Fallback:** Opt-in only (no mandate)

2. **Risk:** Screenshots contain sensitive data (passwords, personal info)
   - **Mitigation:** No human access (AI-only analysis), 30-day retention, encrypted storage
   - **Fallback:** Blur sensitive regions (bank sites, healthcare, etc.)

3. **Risk:** Legal liability (GDPR, CCPA violations)
   - **Mitigation:** Legal review (Week 11), employee consent forms, data deletion on request
   - **Fallback:** Disable for EU/CA employees if non-compliant

**Privacy Checklist:**
- [ ] Employee consent form signed (required before enabling)
- [ ] Data retention policy (30 days max)
- [ ] Data deletion workflow (employee can request)
- [ ] No human access (only AI classification, aggregated metrics)
- [ ] Encryption at rest (Supabase Storage)
- [ ] Pause/resume controls (employee dashboard)

### Pilot Test Plan (10 Volunteers, Days 9-10)
**Recruiting:**
- 3 recruiters
- 3 trainers
- 2 bench sales reps
- 2 HR staff

**Metrics:**
- Daily briefing quality (helpful?)
- Proactive suggestion relevance (acted upon?)
- Privacy concerns (any discomfort?)
- Adoption (daily active use?)

**Success Criteria:**
- 80%+ say briefings are helpful
- 50%+ act on proactive suggestions
- 0 privacy concerns raised
- 80%+ use daily after Week 1

### Deliverables
1. **Sprint 4 Plan** with privacy-first approach
2. **Privacy Compliance Audit** (GDPR/CCPA checklist)
3. **Pilot Test Report** (10 volunteers, adoption metrics)
4. **Epic 6 Handoff Document** (Productivity tracking ready for HR module)

---

## 🏗️ Architect Agent Prompt

### Task
Design privacy-safe productivity tracking and employee AI assistant architecture.

### System Architecture

```
┌─────────────────────────────────────────────────┐
│         Electron Desktop App (Employee)         │
│  - Screenshot every 30s                         │
│  - Pause/Resume controls                        │
│  - Upload to Supabase Storage (encrypted)       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│       Supabase Storage (Screenshot Bucket)      │
│  - Encrypted at rest                            │
│  - 30-day TTL (auto-delete)                     │
│  - No human read access (RLS policy)            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│     Activity Classification Agent (GPT-4o-mini) │
│  - Vision API analyzes screenshot               │
│  - Classify: coding, email, meeting, idle, etc. │
│  - Output: JSON (no raw screenshot stored)      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  employee_productivity_logs (PostgreSQL)        │
│  - timestamp, activity_type, confidence         │
│  - Aggregated only (no raw screenshots)         │
│  - RLS: Employee sees only their own data       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Daily Timeline Generator (Batch)           │
│  - Run daily at 5 PM                            │
│  - Summarize 120 activities → narrative         │
│  - Manager sees aggregated metrics only         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Employee AI Twin (Morning Briefing)     │
│  - Analyzes yesterday's timeline                │
│  - Personalized briefing (9 AM)                 │
│  - Proactive suggestions (3×/day)               │
└─────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Screenshot metadata (NO raw screenshot content stored in DB)
CREATE TABLE employee_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES user_profiles(id),
  captured_at TIMESTAMPTZ NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  deleted_at TIMESTAMPTZ, -- Soft delete (employee request)
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- RLS: Employees see only their own screenshots
  CONSTRAINT rls_employee_screenshots CHECK (
    auth.uid() = employee_id OR
    is_admin(auth.uid())
  )
);

-- Activity classifications (aggregated, no PII)
CREATE TABLE employee_productivity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES user_profiles(id),
  activity_type TEXT NOT NULL, -- 'coding', 'email', 'meeting', 'social_media', 'idle'
  confidence DECIMAL(5,2) NOT NULL, -- 0-100, AI confidence score
  duration_seconds INT DEFAULT 30, -- 30s per screenshot
  logged_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_employee_logged (employee_id, logged_at DESC),
  INDEX idx_activity_type (activity_type),

  -- RLS: Employees see only their own data
  CONSTRAINT rls_productivity_logs CHECK (
    auth.uid() = employee_id OR
    is_admin(auth.uid())
  )
);

-- Daily timeline summaries
CREATE TABLE employee_daily_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES user_profiles(id),
  date DATE NOT NULL,
  summary TEXT NOT NULL, -- Narrative report
  total_productive_hours DECIMAL(5,2),
  top_activities JSONB, -- [{ type: 'coding', hours: 6.5 }]
  insights TEXT[], -- ["You spent 20% more time in meetings than usual"]
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (employee_id, date),

  -- RLS: Employees see only their own timelines
  CONSTRAINT rls_daily_timelines CHECK (
    auth.uid() = employee_id OR
    is_admin(auth.uid())
  )
);

-- Employee AI Twin state
CREATE TABLE employee_ai_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES user_profiles(id) UNIQUE,
  role_type TEXT NOT NULL, -- 'recruiter', 'trainer', 'bench_sales', 'hr'
  preferences JSONB DEFAULT '{}'::jsonb, -- { "briefing_time": "09:00", "suggestion_frequency": 3 }
  last_briefing_at TIMESTAMPTZ,
  last_suggestion_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Privacy Controls (RLS Policies)

```sql
-- Employees can ONLY see their own data
CREATE POLICY employee_own_data ON employee_productivity_logs
  FOR ALL
  USING (auth.uid() = employee_id);

-- Managers can see aggregated metrics (NOT individual activities)
CREATE POLICY manager_aggregated_view ON employee_productivity_logs
  FOR SELECT
  USING (
    is_manager(auth.uid()) AND
    -- Only aggregated queries (GROUP BY) allowed, not individual rows
    current_setting('is_aggregated_query', true)::boolean
  );

-- NO POLICY for raw screenshots → No one can SELECT (AI-only access via service key)
-- Employee can DELETE their own screenshots
CREATE POLICY employee_delete_screenshots ON employee_screenshots
  FOR DELETE
  USING (auth.uid() = employee_id);
```

### Deliverables
1. **Privacy-First Architecture Diagram** (data flow, access controls)
2. **Database Schema** (productivity logs, timelines, AI twins)
3. **RLS Policies** (employee-only access, no manager access to individual activities)
4. **Electron App Architecture** (screenshot capture, pause/resume)
5. **GDPR/CCPA Compliance Checklist** (30-day retention, data deletion, consent)

---

## 💻 Developer Agent Prompt

### Task
Implement 4 stories focused on privacy-safe productivity tracking.

### Implementation Guide

#### Day 1-3: Desktop Screenshot Agent (Dev A, 5 pts)

**File:** `electron-app/src/main.ts`

```typescript
// Electron main process
import { app, BrowserWindow, Tray, Menu, desktopCapturer } from 'electron';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

let captureInterval: NodeJS.Timeout | null = null;
let isPaused = false;

async function captureAndUpload() {
  if (isPaused) return;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 },
  });

  const screenshot = sources[0].thumbnail.toPNG();

  // Compress screenshot (reduce size 70%)
  const compressed = await compressImage(screenshot);

  // Upload to Supabase Storage
  const employeeId = await getEmployeeId(); // From local storage
  const timestamp = new Date().toISOString();
  const path = `screenshots/${employeeId}/${timestamp}.png`;

  await supabase.storage
    .from('employee-screenshots')
    .upload(path, compressed, {
      contentType: 'image/png',
      cacheControl: '3600',
    });

  // Store metadata in DB
  await supabase.from('employee_screenshots').insert({
    employee_id: employeeId,
    captured_at: timestamp,
    storage_path: path,
  });
}

function startCapture() {
  // Capture every 30 seconds
  captureInterval = setInterval(captureAndUpload, 30000);
}

function pauseCapture() {
  isPaused = true;
}

function resumeCapture() {
  isPaused = false;
}

// System tray controls
const tray = new Tray('icon.png');
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Pause',
    click: () => {
      pauseCapture();
      updateTrayMenu('paused');
    },
  },
  {
    label: 'Resume',
    click: () => {
      resumeCapture();
      updateTrayMenu('active');
    },
  },
  {
    label: 'Quit',
    click: () => {
      if (captureInterval) clearInterval(captureInterval);
      app.quit();
    },
  },
]);

tray.setContextMenu(contextMenu);
```

**Build & Distribution:**
```json
// package.json
{
  "name": "intime-productivity-tracker",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start": "electron .",
    "package": "electron-builder"
  },
  "build": {
    "appId": "com.intime.productivity",
    "mac": { "target": "dmg" },
    "win": { "target": "nsis" }
  }
}
```

#### Day 4-7: Activity Classification (Dev A, 8 pts)

**File:** `src/lib/ai/agents/ActivityClassifierAgent.ts`

```typescript
import { BaseAgent } from './BaseAgent';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class ActivityClassifierAgent extends BaseAgent {
  constructor() {
    super({
      name: 'activity_classifier',
      useCase: 'productivity_tracking',
      systemPrompt: `Classify this screenshot into ONE of these categories:
- coding: IDE, terminal, code editor visible
- email: Email client (Gmail, Outlook)
- meeting: Video call (Zoom, Teams, Meet)
- social_media: Twitter, LinkedIn, Facebook, Instagram
- idle: Blank screen, screensaver, locked

Respond with ONLY the category name and confidence (0-100).

Example: coding, 95`,
      complexity: 'simple', // GPT-4o-mini vision
    });
  }

  async classifyScreenshot(screenshotPath: string): Promise<{
    activity: string;
    confidence: number;
  }> {
    // Get screenshot from Supabase Storage
    const { data, error } = await supabase.storage
      .from('employee-screenshots')
      .download(screenshotPath);

    if (error) throw error;

    // Convert to base64
    const base64 = await data.arrayBuffer().then(buffer =>
      Buffer.from(buffer).toString('base64')
    );

    // Call GPT-4o-mini vision API
    const response = await routeAIRequest(
      {
        type: 'vision' as const,
        complexity: 'simple',
        useCase: this.config.useCase,
        userId: 'system',
      },
      `data:image/png;base64,${base64}`
    );

    // Parse response: "coding, 95"
    const [activity, confidenceStr] = response.content.split(',').map(s => s.trim());
    const confidence = parseInt(confidenceStr);

    return { activity, confidence };
  }

  async processScreenshots(employeeId: string, date: Date): Promise<void> {
    // Get all screenshots for employee for this date
    const { data: screenshots } = await supabase
      .from('employee_screenshots')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('captured_at', date.toISOString())
      .lt('captured_at', new Date(date.getTime() + 86400000).toISOString());

    if (!screenshots) return;

    // Batch process all screenshots
    for (const screenshot of screenshots) {
      const { activity, confidence } = await this.classifyScreenshot(
        screenshot.storage_path
      );

      // Store classification (NOT the screenshot)
      await supabase.from('employee_productivity_logs').insert({
        employee_id: employeeId,
        activity_type: activity,
        confidence: confidence,
        logged_at: screenshot.captured_at,
      });

      // Delete screenshot from storage (privacy)
      await supabase.storage
        .from('employee-screenshots')
        .remove([screenshot.storage_path]);
    }
  }
}
```

#### Day 8-9: Daily Timeline Generator (Dev A, 3 pts)

**File:** `src/lib/ai/agents/TimelineGeneratorAgent.ts`

```typescript
export class TimelineGeneratorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'timeline_generator',
      useCase: 'daily_summary',
      systemPrompt: `Generate a narrative daily productivity summary.

Input: Activity log (time, activity type)
Output: Narrative report with insights

Example:
"You had a productive day focused on coding (6.5 hours). You spent 1.5 hours in meetings (20% more than usual). Consider blocking focus time tomorrow to reduce context switching."`,
      requiresWriting: true, // GPT-4o for narrative quality
      complexity: 'medium',
    });
  }

  async generateTimeline(employeeId: string, date: Date): Promise<string> {
    // Get activity log for the day
    const { data: activities } = await supabase
      .from('employee_productivity_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('logged_at', date.toISOString())
      .lt('logged_at', new Date(date.getTime() + 86400000).toISOString())
      .order('logged_at', { ascending: true });

    if (!activities || activities.length === 0) {
      return 'No activity data for this day.';
    }

    // Aggregate activities
    const summary = this.aggregateActivities(activities);

    // Generate narrative with AI
    const prompt = `
Generate a daily productivity summary for:

Date: ${date.toLocaleDateString()}

Activities:
${summary.activities.map(a => `- ${a.type}: ${a.hours.toFixed(1)} hours`).join('\n')}

Total productive hours: ${summary.totalProductiveHours.toFixed(1)}

Include:
1. Main focus areas (top 2-3 activities)
2. Time spent in meetings (if > 2 hours, suggest reduction)
3. Comparison to usual patterns (if data available)
4. Actionable insight for tomorrow

Keep it concise (3-4 sentences).
    `;

    const response = await this.query(prompt, {
      conversationId: `timeline-${employeeId}-${date}`,
      userId: employeeId,
    });

    // Store timeline
    await supabase.from('employee_daily_timelines').insert({
      employee_id: employeeId,
      date: date,
      summary: response.content,
      total_productive_hours: summary.totalProductiveHours,
      top_activities: summary.activities,
    });

    return response.content;
  }

  private aggregateActivities(activities: any[]): any {
    // Group by activity type, sum hours
    const grouped = activities.reduce((acc, a) => {
      if (!acc[a.activity_type]) {
        acc[a.activity_type] = 0;
      }
      acc[a.activity_type] += 30 / 3600; // 30 seconds per screenshot
      return acc;
    }, {});

    return {
      activities: Object.entries(grouped).map(([type, hours]) => ({
        type,
        hours,
      })),
      totalProductiveHours: Object.values(grouped).reduce(
        (sum: number, hours: number) => sum + hours,
        0
      ),
    };
  }
}
```

#### Day 1-9: Employee AI Twin (Dev B, 5 pts)

**File:** `src/lib/ai/agents/EmployeeTwinAgent.ts`

```typescript
export class EmployeeTwinAgent extends BaseAgent {
  constructor(roleType: 'recruiter' | 'trainer' | 'bench_sales' | 'hr') {
    super({
      name: `employee_twin_${roleType}`,
      useCase: 'employee_assistant',
      systemPrompt: `You are a personalized AI assistant for a ${roleType}.

Your role:
- Morning briefing (9 AM): Summarize yesterday, suggest priorities for today
- Proactive suggestions (3×/day): Identify opportunities, remind of tasks
- On-demand help: Answer questions, provide guidance

Personality: Helpful, concise, actionable.`,
      requiresReasoning: true,
      complexity: 'medium',
    });
  }

  async morningBriefing(employeeId: string): Promise<string> {
    // Get yesterday's timeline
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: timeline } = await supabase
      .from('employee_daily_timelines')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', yesterday.toISOString().split('T')[0])
      .single();

    // Get today's calendar (integrate with Google Calendar API)
    const todayEvents = await getCalendarEvents(employeeId, new Date());

    const prompt = `
Generate a morning briefing for:

**Yesterday's Summary:**
${timeline?.summary || 'No data'}

**Today's Calendar:**
${todayEvents.map(e => `- ${e.time}: ${e.title}`).join('\n')}

**Briefing Format:**
1. Quick recap of yesterday (1 sentence)
2. Top 3 priorities for today
3. One actionable insight

Keep it under 150 words.
    `;

    const response = await this.query(prompt, {
      conversationId: `briefing-${employeeId}-${new Date().toISOString()}`,
      userId: employeeId,
    });

    // Send via email or Slack
    await sendBriefing(employeeId, response.content);

    return response.content;
  }

  async proactiveSuggestion(employeeId: string): Promise<string> {
    // Analyze recent activity, suggest next steps
    // e.g., "You have 3 follow-ups pending from yesterday's calls. Shall I draft follow-up emails?"
  }
}
```

### Deliverables
1. Electron app (screenshot capture with pause/resume)
2. ActivityClassifierAgent (vision classification)
3. TimelineGeneratorAgent (daily summaries)
4. EmployeeTwinAgent (morning briefings, proactive suggestions)
5. Privacy controls (RLS policies, data deletion workflow)

---

## 🧪 QA Agent Prompt

### Task
Validate privacy compliance and employee adoption in pilot test.

### Privacy Compliance Audit

**GDPR Checklist:**
- [ ] Employee consent form (signed before enabling)
- [ ] Data retention policy (30 days max)
- [ ] Data portability (employee can export their data)
- [ ] Right to deletion (employee can delete all screenshots)
- [ ] Data minimization (only activity type stored, not screenshots)
- [ ] No human access (AI-only classification)
- [ ] Encryption at rest (Supabase Storage)

**CCPA Checklist:**
- [ ] Privacy notice (employees informed of data collection)
- [ ] Opt-out mechanism (employees can disable tracking)
- [ ] Data deletion on request (within 45 days)
- [ ] No sale of personal information

**Testing:**
```typescript
describe('Privacy Compliance', () => {
  it('employees can delete all their screenshots', async () => {
    const employeeId = 'test-employee';

    // Upload test screenshot
    await uploadScreenshot(employeeId);

    // Employee requests deletion
    await deleteAllScreenshots(employeeId);

    // Verify deletion
    const { data } = await supabase.storage
      .from('employee-screenshots')
      .list(`screenshots/${employeeId}/`);

    expect(data).toHaveLength(0); // All deleted
  });

  it('managers cannot access individual activity logs', async () => {
    const managerId = 'test-manager';
    const employeeId = 'test-employee';

    // Manager attempts to query individual activities
    const { data, error } = await supabase
      .from('employee_productivity_logs')
      .select('*')
      .eq('employee_id', employeeId);

    expect(error).toBeDefined(); // RLS blocks access
    expect(data).toBeNull();
  });

  it('screenshots auto-delete after 30 days', async () => {
    // Set up test with old screenshot (31 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);

    await supabase.from('employee_screenshots').insert({
      employee_id: 'test',
      captured_at: oldDate.toISOString(),
      storage_path: 'test-path',
      expires_at: oldDate,
    });

    // Run cleanup job
    await cleanupExpiredScreenshots();

    // Verify deletion
    const { data } = await supabase
      .from('employee_screenshots')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    expect(data).toHaveLength(0);
  });
});
```

### Pilot Test (10 Volunteers, Days 9-10)

**Day 9 AM: Setup**
- Install Electron app on 10 volunteer laptops
- Sign consent forms
- Training session (15 min): How to pause/resume, view your timeline

**Day 9-10: Monitoring**
- Track daily active use
- Monitor screenshot capture (30s intervals working?)
- Verify activity classification (spot-check 20 screenshots)

**Day 10 PM: Survey**
```markdown
## Pilot Test Survey (10 questions, 5 min)

1. How helpful was your morning briefing? (1-5 scale)
2. Did you act on any proactive suggestions? (Yes/No)
3. Did you have any privacy concerns? (Yes/No, explain)
4. How often did you use the pause button? (Never/Rarely/Often/Always)
5. Was the timeline accurate for your day? (Yes/No, explain)
6. Would you continue using this daily? (Yes/No)
7. What did you like most?
8. What should we improve?
9. Any bugs or technical issues?
10. Net Promoter Score: Would you recommend this to colleagues? (0-10)
```

### Quality Gates
- [ ] 80%+ pilot adoption (8 of 10 use daily)
- [ ] 80%+ find briefings helpful (Q1 score ≥4)
- [ ] 0 privacy concerns raised (Q3 = No for all)
- [ ] 90%+ activity classification accuracy (spot-check)
- [ ] NPS ≥50 (Q10 avg ≥7)

### Deliverables
1. **Privacy Compliance Audit Report** (GDPR/CCPA checklist)
2. **Pilot Test Report** (10 volunteers, metrics, survey results)
3. **Sprint 4 QA Summary** (80%+ adoption achieved?)
4. **Epic 2.5 Completion Report** (all 15 stories delivered)

---

## ✅ Sprint 4 Completion Checklist

- [ ] **PM:** Pilot test successful, privacy compliance verified, Epic 6 handoff
- [ ] **Architect:** Privacy-first architecture validated, RLS policies tested
- [ ] **Developer:** Electron app deployed, all agents operational, tests passing
- [ ] **QA:** 80%+ adoption, 0 privacy concerns, NPS ≥50

**Epic 2.5 Complete:** All 15 stories delivered, ready to enable Epic 2 (Training Academy) and Epic 6 (HR & Employee)

---

**Created:** 2025-11-19
**Sprint:** Sprint 4 (Week 11-12)
**Status:** Ready for Execution
**Dependencies:** Sprint 2 (BaseAgent) must be complete
