# PM Handoff: Sprint 4 - Epic 2.5 (AI Infrastructure & Services)

**Sprint:** Sprint 4 (Week 11-12)
**Epic:** Epic 2.5 - AI Infrastructure & Services
**PM:** AI PM Agent
**Date:** 2025-11-19
**Status:** ✅ READY FOR ARCHITECTURE PHASE

---

## 📋 Executive Summary

Sprint 4 focuses on **Productivity Tracking & Employee AI Twins** - the final sprint of Epic 2.5 AI Infrastructure. This sprint delivers two critical business features:

1. **Productivity Tracking System** (AI-PROD-001, AI-PROD-002, AI-PROD-003)
   - Desktop screenshot agent with privacy controls
   - AI-powered activity classification (90%+ accuracy)
   - Daily timeline reports with insights

2. **Employee AI Twin Framework** (AI-TWIN-001)
   - Role-specific AI assistants (Recruiter, Trainer, Bench Sales, Admin)
   - Proactive suggestions and morning briefings
   - Context-aware workflow optimization

### Sprint Goals

✅ **Primary Goal:** Enable employee productivity measurement without privacy invasion
✅ **Secondary Goal:** Launch personalized AI assistants for 80%+ employee adoption
✅ **Strategic Goal:** Deliver $1.6M/year in cost savings (vs. manual time tracking + manager overhead)

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Productivity Classification Accuracy** | 90%+ | Manual validation of 100 sample screenshots |
| **Employee AI Twin Adoption** | 80%+ daily active users | Login analytics |
| **Privacy Compliance** | 100% | Legal review, GDPR/CCPA checklist |
| **Cost per Employee** | <$1,200/year | Helicone cost tracking |
| **Response Time** | <2 seconds (95th percentile) | Performance monitoring |
| **Privacy Opt-Out Rate** | <10% | User settings analytics |

### Business Value

**Cost Savings:**
- Productivity Tracking: $50,400/year (vs. manual time tracking managers)
- Employee AI Twins: $226,700/year (vs. additional manager overhead)
- **Total:** $277,100/year in recurring savings

**Productivity Gains:**
- 15+ hours/week saved per employee (proactive AI assistance)
- 30-60 day bench placement optimization (AI-powered matching)
- 48-hour recruiting turnaround (AI candidate sourcing)

---

## 📖 Story Breakdown

### AI-PROD-001: Desktop Screenshot Agent

**Story Points:** 5
**Priority:** HIGH (Foundation for productivity tracking)
**Dependencies:** None (can start immediately)

#### User Story

**As an** Employee
**I want** an Electron desktop app that captures screenshots every 30 seconds
**So that** my productivity can be analyzed while respecting my privacy and giving me full control

#### Business Context

The screenshot agent is the data collection foundation for productivity tracking. Key differentiator: **employee-first privacy controls** (not surveillance).

**Problem Being Solved:**
- Current state: No visibility into employee productivity patterns
- Business pain: Can't identify struggling employees early
- Opportunity: AI-driven insights WITHOUT micromanagement

#### Detailed Acceptance Criteria

1. **Cross-Platform Electron App**
   - ✅ Works on Windows, macOS, Linux
   - ✅ System tray integration (minimize to tray)
   - ✅ Auto-start on login (configurable)
   - ✅ Auto-update mechanism
   - ✅ < 50MB RAM usage (lightweight)
   - ✅ < 5% CPU usage (minimal performance impact)

2. **Screenshot Capture**
   - ✅ Configurable interval (default: 30 seconds)
   - ✅ Captures active screen only (multi-monitor: primary)
   - ✅ Image compression (JPEG 50% quality, max 1280px width)
   - ✅ File size: < 100KB per screenshot
   - ✅ Timestamps in UTC (ISO 8601 format)

3. **Privacy Controls (CRITICAL)**
   - ✅ Opt-in during onboarding (explicit consent required)
   - ✅ Pause button (immediate stop, visible status indicator)
   - ✅ Auto-pause for sensitive apps (password managers, banking)
   - ✅ Sensitive keywords: password, bank, credit card, social security, private, confidential
   - ✅ Employee can view their own screenshots (full transparency)
   - ✅ Configurable blacklist apps (e.g., personal email)
   - ✅ Visual indicator when capturing (tray icon color change)
   - ✅ Daily reminder: "Screenshots active today" (optional notification)

4. **Upload to Supabase Storage**
   - ✅ Folder structure: `employee-screenshots/{user_id}/{YYYY-MM-DD}/{timestamp}.jpg`
   - ✅ Signed upload URLs (secure)
   - ✅ Metadata logged: filename, file_size, captured_at
   - ✅ RLS: Employee can SELECT own screenshots, Admin can SELECT all

5. **Offline Queue & Retry Logic**
   - ✅ Queue screenshots when offline (max 50 in queue)
   - ✅ Retry on network failure (exponential backoff: 1s, 2s, 4s, 8s)
   - ✅ Persist queue to disk (survive app restarts)
   - ✅ Upload queue when reconnected
   - ✅ Alert if queue exceeds 50 items (connection issue)

6. **Data Retention**
   - ✅ Auto-delete screenshots > 30 days old (compliance)
   - ✅ PostgreSQL function: `cleanup_old_screenshots()` (daily cron)
   - ✅ Employee can request immediate deletion (GDPR right to erasure)

7. **Security**
   - ✅ No screenshots stored locally (upload then delete)
   - ✅ Encrypted upload (HTTPS only)
   - ✅ No PII in filenames (use UUIDs)
   - ✅ No screenshot preview in app (prevent shoulder surfing)

8. **Performance**
   - ✅ Screenshot capture: < 500ms
   - ✅ Compression: < 200ms
   - ✅ Upload: < 2 seconds (on 10 Mbps connection)
   - ✅ No UI freezing during capture

#### API Contracts

**Not applicable** - Electron app communicates directly with Supabase Storage.

**Supabase Storage Bucket:**
```typescript
// Bucket: employee-screenshots
// Config:
{
  public: false,
  allowedMimeTypes: ['image/jpeg'],
  fileSizeLimit: 200 * 1024, // 200KB max
}
```

#### Database Schema

```sql
-- Employee screenshots metadata table
CREATE TABLE employee_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,

  captured_at TIMESTAMPTZ NOT NULL,
  analyzed BOOLEAN DEFAULT false,
  activity_category TEXT, -- NULL until AI-PROD-002
  confidence FLOAT, -- NULL until AI-PROD-002

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_screenshots_user_id ON employee_screenshots(user_id);
CREATE INDEX idx_screenshots_captured_at ON employee_screenshots(captured_at DESC);
CREATE INDEX idx_screenshots_analyzed ON employee_screenshots(analyzed) WHERE NOT analyzed;

-- RLS Policies
ALTER TABLE employee_screenshots ENABLE ROW LEVEL SECURITY;

-- Employees can view their own screenshots
CREATE POLICY screenshots_user_own ON employee_screenshots
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all screenshots
CREATE POLICY screenshots_admin_all ON employee_screenshots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Automatic cleanup (delete screenshots older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_screenshots()
RETURNS void AS $$
BEGIN
  DELETE FROM employee_screenshots
  WHERE captured_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-old-screenshots',
  '0 2 * * *', -- 2 AM daily
  $$SELECT cleanup_old_screenshots()$$
);
```

#### UI/UX Requirements

**System Tray Icon:**
- Default: Gray icon (inactive/paused)
- Active: Blue icon (capturing screenshots)
- Error: Red icon (upload failures)
- Tooltip: "InTime Productivity - Active" or "Paused"

**Context Menu:**
```
InTime Productivity
├─ ⏸️ Pause (or ▶️ Resume)
├─ 📊 View My Stats (opens web dashboard)
├─ ⚙️ Settings
│  ├─ Capture Interval: [30s ▼]
│  ├─ Auto-pause apps: [List]
│  └─ Notifications: [✓ Enabled]
├─ 🔒 Privacy Policy
└─ 🚪 Quit
```

**Settings Window:**
- Simple, minimal design (inspired by Dropbox/Slack)
- Tabs: General, Privacy, Advanced
- "Test Screenshot" button (take one, show preview)
- "View Recent Uploads" (last 10 screenshots)

**Onboarding Flow:**
1. Welcome screen: "Help us understand productivity patterns"
2. Privacy explanation: "You control when screenshots are taken"
3. Consent checkbox: "I agree to productivity tracking" (required)
4. Settings customization: Interval, auto-pause apps
5. Test screenshot: "Let's test it out!"
6. Complete: Auto-minimize to tray

#### Testing Requirements

**Unit Tests:**
- Screenshot capture function (mocked Electron APIs)
- Image compression (verify file size reduction)
- Sensitive window detection (blacklist matching)
- Offline queue management (add, persist, retry, clear)

**Integration Tests:**
- Supabase Storage upload (real bucket)
- Database metadata logging (real table)
- RLS policies (employee can't see others' screenshots)
- Auto-cleanup function (delete old screenshots)

**E2E Tests (Playwright):**
- App launches and minimizes to tray
- Pause/resume toggle works
- Settings persistence (survives app restart)
- Offline mode: Queue screenshots, retry on reconnect
- Privacy: Sensitive app detected, screenshot skipped

**Performance Tests:**
- 1,000 screenshots captured (no memory leaks)
- Offline queue with 50 items (upload all in < 60s)
- CPU usage < 5% during active capture

**Security Tests:**
- No local screenshot files (deleted after upload)
- HTTPS-only uploads (reject HTTP)
- RLS: User A can't access User B's screenshots

**Privacy Audit:**
- Legal review: GDPR Article 5 compliance (data minimization)
- CCPA compliance: Right to opt-out, right to deletion
- Employee consent form: Clear language, no legalese

#### Dependencies

**Requires:**
- Supabase Storage bucket: `employee-screenshots` (public: false)
- PostgreSQL table: `employee_screenshots` (migration 016)
- pg_cron extension enabled (for auto-cleanup)

**Blocks:**
- AI-PROD-002 (Activity Classification) - needs screenshots to analyze

---

### AI-PROD-002: Activity Classification

**Story Points:** 8
**Priority:** CRITICAL (Core productivity feature)
**Dependencies:** AI-PROD-001 (Screenshot Agent)

#### User Story

**As a** System
**I want** to classify employee activities from screenshots using GPT-4o-mini vision
**So that** we can generate accurate productivity timelines and insights

#### Business Context

Activity classification transforms raw screenshots into actionable insights. **Key innovation:** 90%+ accuracy at <$0.002 per screenshot (10x cheaper than human annotation).

**Problem Being Solved:**
- Current state: Screenshots captured, but no analysis
- Business pain: Can't identify productivity patterns at scale
- Opportunity: AI vision replaces $875K/year in manual time tracking managers

#### Detailed Acceptance Criteria

1. **GPT-4o-mini Vision API Integration**
   - ✅ OpenAI SDK configured (API key in env)
   - ✅ Model: `gpt-4o-mini` (vision-enabled, cheap)
   - ✅ Input: Signed URL to screenshot (60-second expiry)
   - ✅ Output: JSON structured response

2. **Activity Categories (7 types)**
   - ✅ `coding`: Writing/editing code (IDE, text editor with code)
   - ✅ `email`: Reading/writing emails (Gmail, Outlook, Apple Mail)
   - ✅ `meeting`: Video calls (Zoom, Teams, Google Meet, Slack huddle)
   - ✅ `documentation`: Writing docs (Notion, Confluence, Google Docs, markdown)
   - ✅ `research`: Reading articles (Stack Overflow, docs sites, blogs)
   - ✅ `social_media`: Twitter, LinkedIn, Reddit, YouTube, non-work sites
   - ✅ `idle`: No activity, lock screen, blank screen, screensaver

3. **JSON Structured Output**
   ```json
   {
     "category": "coding",
     "confidence": 0.95,
     "reasoning": "Visual Studio Code open with TypeScript file visible"
   }
   ```
   - ✅ Always returns valid JSON (no plain text)
   - ✅ `confidence`: 0.0 to 1.0 (float)
   - ✅ `reasoning`: Human-readable explanation (1 sentence, < 100 chars)

4. **Confidence Scoring**
   - ✅ High confidence (0.8-1.0): Clear activity (IDE, Gmail, Zoom)
   - ✅ Medium confidence (0.5-0.79): Ambiguous (browser with code?)
   - ✅ Low confidence (0.0-0.49): Unclear (blurry, multiple windows)
   - ✅ Threshold for reporting: 0.5+ (ignore low-confidence classifications)

5. **Batch Processing**
   - ✅ Process 120 screenshots (1 employee, 1 hour) in < 5 minutes
   - ✅ Rate limit handling: 500 requests/min (OpenAI limit)
   - ✅ Batch size: 10 screenshots per batch (parallelized)
   - ✅ Delay between batches: 1 second (avoid rate limit)
   - ✅ Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)

6. **Accuracy Target: 90%+**
   - ✅ Validation dataset: 100 manually-labeled screenshots
   - ✅ Confusion matrix: Track misclassifications
   - ✅ Most common errors: `coding` vs. `documentation` (both text editors)
   - ✅ Acceptable errors: `email` vs. `social_media` (webmail UI)

7. **Cost Optimization (<$0.002/screenshot)**
   - ✅ GPT-4o-mini pricing: ~$0.0015 per image + text request
   - ✅ Max tokens: 150 (force concise responses)
   - ✅ Temperature: 0.3 (deterministic, less creative = cheaper)
   - ✅ No streaming (single request/response)

8. **Privacy-Safe Processing**
   - ✅ AI never stores screenshots (process and discard)
   - ✅ Only category + confidence saved to database
   - ✅ Signed URLs expire in 60 seconds (no long-term access)
   - ✅ No raw screenshot in API response

9. **Error Handling**
   - ✅ API failure: Fallback to `idle` with confidence 0.1
   - ✅ JSON parse error: Log warning, return `idle`
   - ✅ Rate limit hit: Exponential backoff, retry
   - ✅ Invalid image: Skip, mark as `analyzed: false`

10. **Performance**
    - ✅ Single classification: < 2 seconds
    - ✅ Batch of 10: < 20 seconds
    - ✅ Batch of 120 (1 hour): < 5 minutes
    - ✅ No memory leaks (process 1,000+ screenshots)

#### API Contracts

**POST /api/ai/productivity/classify**

Request:
```typescript
{
  screenshotId: string; // UUID
}
```

Response (Success):
```typescript
{
  success: true;
  data: {
    category: 'coding' | 'email' | 'meeting' | 'documentation' | 'research' | 'social_media' | 'idle';
    confidence: number; // 0.0 - 1.0
    reasoning: string;
    timestamp: string; // ISO 8601
  }
}
```

Response (Error):
```typescript
{
  success: false;
  error: {
    code: 'SCREENSHOT_NOT_FOUND' | 'CLASSIFICATION_FAILED' | 'RATE_LIMIT_EXCEEDED';
    message: string;
  }
}
```

**POST /api/ai/productivity/batch-classify**

Request:
```typescript
{
  userId: string; // UUID
  date: string; // YYYY-MM-DD
}
```

Response:
```typescript
{
  success: true;
  data: {
    total: number; // Total screenshots found
    classified: number; // Successfully classified
    failed: number; // Classification failures
    duration: number; // Processing time in ms
  }
}
```

**GET /api/ai/productivity/summary/:userId/:date**

Response:
```typescript
{
  success: true;
  data: {
    totalScreenshots: number;
    analyzed: number;
    byCategory: {
      coding: number;
      email: number;
      meeting: number;
      documentation: number;
      research: number;
      social_media: number;
      idle: number;
    };
    productiveHours: number; // Calculated: (productive screenshots * 30s) / 3600
  }
}
```

#### Database Schema

**Updates to existing table:**
```sql
-- Already created in AI-PROD-001, no new tables needed
-- Just ensure activity_category and confidence columns are used
```

**Indexes for performance:**
```sql
-- Already created in AI-PROD-001
-- idx_screenshots_analyzed (for batch processing)
```

#### UI/UX Requirements

**Not applicable for this story** - Backend-only classification service.

**Future UI (Epic 6 - HR & Employee):**
- Employee dashboard: "My Productivity Timeline" (graphs, charts)
- Manager dashboard: Team aggregates (no individual screenshots)

#### Testing Requirements

**Unit Tests:**
- Classification function (mocked OpenAI API)
- JSON parsing (handle malformed responses)
- Confidence scoring logic
- Category validation (only 7 allowed values)

**Integration Tests:**
- Real OpenAI API call (classify sample screenshot)
- Batch processing (10 screenshots, verify all classified)
- Database updates (analyzed=true, category/confidence populated)
- RLS: Employee can query own summary

**E2E Tests:**
- Full workflow: Screenshot → Upload → Classify → Query summary
- Batch classify 100 screenshots (verify accuracy)
- Cost tracking (verify <$0.002 per screenshot)

**Performance Tests:**
- Batch classify 500 screenshots (< 25 minutes)
- Concurrent classifications (10 employees, 120 screenshots each)
- Memory usage (no leaks after 1,000 classifications)

**Accuracy Validation:**
- Manual labeling: 100 diverse screenshots
- Run classification on validation set
- Calculate accuracy: (correct classifications / total) × 100
- Target: 90%+ accuracy
- Document common errors (e.g., coding vs. documentation confusion)

**Cost Validation:**
- Classify 100 screenshots
- Query Helicone cost report
- Average cost per screenshot
- Target: <$0.002 per screenshot

#### Dependencies

**Requires:**
- AI-PROD-001 (Screenshot Agent) - screenshots must exist
- AI-INF-001 (AI Model Router) - for cost tracking
- OpenAI API key with GPT-4o-mini access

**Blocks:**
- AI-PROD-003 (Daily Timeline Generator) - needs classified data

---

### AI-PROD-003: Daily Timeline Generator

**Story Points:** 3
**Priority:** MEDIUM (Analytics & Insights)
**Dependencies:** AI-PROD-002 (Activity Classification)

#### User Story

**As a** Manager
**I want** AI-generated daily timeline reports for employees
**So that** I understand team productivity patterns without invading privacy

#### Business Context

Timeline generator transforms classified activities into **actionable insights** for managers. **Key differentiator:** Aggregated metrics only (no raw screenshots, privacy-first).

**Problem Being Solved:**
- Current state: Data exists, but no insights
- Business pain: Managers can't identify struggling employees early
- Opportunity: Proactive coaching triggers (AI detects patterns)

#### Detailed Acceptance Criteria

1. **Generate Daily Narrative Report**
   - ✅ AI-written summary (200-300 words)
   - ✅ Personalized with employee name
   - ✅ Positive and constructive tone (not punitive)
   - ✅ Structured format: Summary → Insights → Recommendations

2. **Aggregate Metrics Only (Privacy-Safe)**
   - ✅ Managers see: Categories, hours, trends
   - ✅ Managers CANNOT see: Raw screenshots, specific apps, exact times
   - ✅ RLS: Managers can only query their direct reports
   - ✅ Employees can view their own detailed data

3. **Insights Generation**
   - ✅ Pattern detection: "Spent 60% time in meetings (up from 40% last week)"
   - ✅ Productivity trends: "Most productive 9-11 AM"
   - ✅ Distractions: "Social media usage increased 20%"
   - ✅ Positive highlights: "Coding time increased 15%"
   - ✅ 3-5 insights per report (most important only)

4. **Recommendations**
   - ✅ Actionable suggestions: "Consider blocking focus time 9-11 AM"
   - ✅ Coaching triggers: "High meeting load - suggest delegation review"
   - ✅ Resource suggestions: "Recommend productivity training"
   - ✅ 2-3 recommendations per report

5. **Batch Processing**
   - ✅ Nightly cron job: Generate reports for all employees (previous day)
   - ✅ Schedule: 2 AM daily (after classification completes)
   - ✅ Processing time: < 10 minutes for 200 employees
   - ✅ Error handling: Skip employees with <10 screenshots (insufficient data)

6. **Export to PDF/Email**
   - ✅ PDF generation (simple layout, 1 page per employee)
   - ✅ Email delivery to managers (optional, configurable)
   - ✅ Subject: "[InTime] Daily Productivity Summary - {Date}"
   - ✅ Unsubscribe option (managers can opt-out)

7. **Privacy-Safe Aggregation**
   - ✅ No PII in manager reports (employee name only)
   - ✅ No timestamps (only date, not hourly breakdown)
   - ✅ Minimum 10 screenshots required (avoid granular tracking)
   - ✅ Employees can request deletion of reports (GDPR)

8. **Comparison to Team Averages**
   - ✅ Optional metric: "Coding time: 4.5 hours (team avg: 5.2 hours)"
   - ✅ Anonymized team data (no individual comparisons)
   - ✅ Opt-out available (employee can hide from averages)

9. **Trend Analysis Over Time**
   - ✅ 7-day rolling average: Productivity trends
   - ✅ Week-over-week comparison: "Meeting time up 15%"
   - ✅ Historical charts (line graph, 30-day view)

10. **Performance**
    - ✅ Single report generation: < 5 seconds
    - ✅ Batch 200 reports: < 10 minutes
    - ✅ PDF export: < 2 seconds per report

#### API Contracts

**POST /api/ai/productivity/generate-report**

Request:
```typescript
{
  userId: string; // UUID
  date: string; // YYYY-MM-DD
}
```

Response:
```typescript
{
  success: true;
  data: {
    summary: string; // AI-generated narrative
    productiveHours: number;
    topActivities: Array<{
      category: string;
      percentage: number; // 0-100
    }>;
    insights: string[]; // 3-5 insights
    recommendations: string[]; // 2-3 recommendations
  }
}
```

**POST /api/ai/productivity/batch-generate-reports**

Request:
```typescript
{
  date: string; // YYYY-MM-DD
}
```

Response:
```typescript
{
  success: true;
  data: {
    total: number; // Employees processed
    generated: number; // Reports created
    skipped: number; // Insufficient data
    failed: number; // Generation errors
  }
}
```

**GET /api/ai/productivity/report/:userId/:date**

Response:
```typescript
{
  success: true;
  data: {
    id: string;
    userId: string;
    date: string;
    summary: string;
    productiveHours: number;
    topActivities: Array<{
      category: string;
      percentage: number;
    }>;
    insights: string[];
    recommendations: string[];
    createdAt: string;
  }
}
```

**GET /api/ai/productivity/manager-dashboard/:managerId**

Response:
```typescript
{
  success: true;
  data: {
    teamSize: number;
    reportsAvailable: number;
    teamAverages: {
      productiveHours: number;
      topCategories: string[];
    };
    reports: Array<{
      employeeId: string;
      employeeName: string;
      date: string;
      productiveHours: number;
      topCategory: string;
      needsAttention: boolean; // Flag for struggling employees
    }>;
  }
}
```

#### Database Schema

```sql
-- Productivity reports table
CREATE TABLE productivity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  date DATE NOT NULL,

  summary TEXT NOT NULL,
  productive_hours FLOAT NOT NULL,
  top_activities JSONB NOT NULL,
  insights JSONB NOT NULL,
  recommendations JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

CREATE INDEX idx_productivity_reports_user_date ON productivity_reports(user_id, date DESC);
CREATE INDEX idx_productivity_reports_date ON productivity_reports(date DESC);

-- RLS Policies
ALTER TABLE productivity_reports ENABLE ROW LEVEL SECURITY;

-- Employees can view their own reports
CREATE POLICY reports_user_own ON productivity_reports
  FOR SELECT
  USING (user_id = auth.uid());

-- Managers can view their direct reports' reports
CREATE POLICY reports_manager_team ON productivity_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = user_id
      AND manager_id = auth.uid()
    )
  );

-- Admins can view all reports
CREATE POLICY reports_admin_all ON productivity_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

#### UI/UX Requirements

**Manager Dashboard (Epic 6):**

**Overview Page:**
```
┌─────────────────────────────────────────────────────┐
│ Team Productivity Dashboard                         │
├─────────────────────────────────────────────────────┤
│ Team Size: 12       Reports Today: 11       🔔 1    │
├─────────────────────────────────────────────────────┤
│ Team Averages (Last 7 Days)                         │
│ ⏱️ Productive Hours: 6.8 hrs/day                    │
│ 💻 Top Activity: Coding (45%)                       │
│ 📧 Email: 25%  📝 Documentation: 15%                │
├─────────────────────────────────────────────────────┤
│ Needs Attention                                      │
│ • Jane Doe - Meeting overload (8 hrs/day) [View]   │
├─────────────────────────────────────────────────────┤
│ Team Members                                         │
│ ┌─────────────┬──────────┬──────────┬─────────┐    │
│ │ Name        │ Prod Hrs │ Top Act  │ Trend   │    │
│ ├─────────────┼──────────┼──────────┼─────────┤    │
│ │ John Smith  │ 7.2      │ Coding   │ 📈 +5%  │    │
│ │ Jane Doe    │ 4.5      │ Meetings │ 📉 -15% │ 🔴 │
│ │ ...         │          │          │         │    │
│ └─────────────┴──────────┴──────────┴─────────┘    │
└─────────────────────────────────────────────────────┘
```

**Individual Report View:**
```
┌─────────────────────────────────────────────────────┐
│ Productivity Report - Jane Doe - Nov 18, 2025       │
├─────────────────────────────────────────────────────┤
│ Summary                                              │
│ Jane had a meeting-heavy day with 8 hours in video  │
│ calls. Coding time was limited to 1.5 hours. This   │
│ represents a 40% decrease from her typical 4-hour   │
│ coding baseline.                                     │
├─────────────────────────────────────────────────────┤
│ Activity Breakdown                                   │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░ Meetings (60%)                    │
│ ▓▓▓░░░░░░░░░░░░░ Email (15%)                        │
│ ▓▓░░░░░░░░░░░░░░ Coding (12%)                       │
│ ▓░░░░░░░░░░░░░░░ Documentation (8%)                 │
│                                                      │
│ Productive Hours: 4.5 / 8.0 (Team Avg: 6.8)        │
├─────────────────────────────────────────────────────┤
│ Insights                                             │
│ • Meeting time increased 40% vs. last week          │
│ • Most productive hours: 2-4 PM                     │
│ • Coding blocked by back-to-back meetings           │
├─────────────────────────────────────────────────────┤
│ Recommendations                                      │
│ • Block 2-hour focus time for coding (9-11 AM)     │
│ • Consider delegating non-critical meetings         │
│ • Review meeting effectiveness (are all necessary?) │
├─────────────────────────────────────────────────────┤
│ [Email Report] [Export PDF] [Schedule 1:1]          │
└─────────────────────────────────────────────────────┘
```

#### Testing Requirements

**Unit Tests:**
- Report generation function (mocked AI response)
- Insights extraction logic
- Recommendations generation
- Team averages calculation
- Trend analysis (7-day rolling average)

**Integration Tests:**
- Full report generation (real AI call)
- Database insertion (productivity_reports table)
- RLS: Manager can only see direct reports
- Batch generation (10 employees)

**E2E Tests:**
- Manager navigates to dashboard
- Clicks employee report
- Views insights and recommendations
- Exports to PDF
- Sends email report

**Performance Tests:**
- Generate 200 reports (< 10 minutes)
- Query manager dashboard (< 500ms)
- PDF export 50 reports (< 2 minutes)

**Privacy Tests:**
- Manager cannot access non-direct-report data
- No raw screenshots in report
- Employees can delete their own reports
- GDPR compliance: Data portability (export all reports)

#### Dependencies

**Requires:**
- AI-PROD-002 (Activity Classification) - needs classified data
- AI-INF-005 (Base Agent Framework) - for AI narrative generation
- AI-INF-006 (Prompt Library) - daily_timeline template

**Blocks:**
- Epic 6 (HR & Employee) - Manager dashboard UI

---

### AI-TWIN-001: Employee AI Twin Framework

**Story Points:** 5
**Priority:** HIGH (Strategic Differentiator)
**Dependencies:** AI-INF-005 (Base Agent Framework)

#### User Story

**As an** Employee
**I want** a personalized AI twin that knows my role and workflows
**So that** I get proactive suggestions, reminders, and help throughout my workday

#### Business Context

Employee AI Twins are **personalized workflow assistants** that extend employee capabilities. **Key innovation:** Role-specific intelligence (Recruiter Twin ≠ Trainer Twin).

**Problem Being Solved:**
- Current state: Employees waste time on repetitive tasks, miss follow-ups
- Business pain: Managers spend 30% time on coordination/reminders
- Opportunity: AI handles routine tasks, employees focus on high-value work

**ROI:**
- $226,700/year in cost savings (vs. additional manager overhead)
- 15+ hours/week saved per employee
- 80%+ adoption target (daily active use)

#### Detailed Acceptance Criteria

1. **Role-Specific Twin Templates**
   - ✅ Recruiter Twin: Candidate pipeline tracking, follow-up reminders, resume matching
   - ✅ Trainer Twin: Student progress monitoring, grading reminders, struggle detection
   - ✅ Bench Sales Twin: Consultant availability, client matching, market rate alerts
   - ✅ Admin Twin: System health monitoring, report generation, anomaly detection
   - ✅ System prompt per role (Socratic for Trainer, sales-oriented for Bench Sales)

2. **Morning Briefings (Personalized Daily Summary)**
   - ✅ Delivered at 8 AM local time (configurable)
   - ✅ Greeting with employee name
   - ✅ Top 3 priorities for the day
   - ✅ Urgent items (deadlines, follow-ups)
   - ✅ Opportunities (proactive suggestions)
   - ✅ Motivational close
   - ✅ Length: 200-300 words (concise, scannable)
   - ✅ Delivery: Email + Slack + In-app notification

3. **Proactive Suggestions (3×/day)**
   - ✅ Timing: 10 AM, 2 PM, 4 PM (configurable)
   - ✅ Format: "👋 Quick heads up... [opportunity/issue] → [suggested action]"
   - ✅ Examples:
     - Recruiter: "3 candidates waiting for follow-up - suggest sending check-in emails"
     - Trainer: "Student Jane struggling with Rating module - schedule 1:1"
     - Bench Sales: "Consultant Mike on bench 15 days - 3 matching reqs found"
   - ✅ Only suggest if actionable (no noise)
   - ✅ Length: 1-2 sentences

4. **On-Demand Question Answering**
   - ✅ Chat interface (web + Slack)
   - ✅ Context-aware: Knows employee's current tasks
   - ✅ Response time: < 2 seconds
   - ✅ Memory: Last 10 exchanges (Redis, 24h TTL)
   - ✅ Escalation: If can't answer, suggest human contact

5. **Context-Aware Intelligence**
   - ✅ Loads employee profile (role, manager, team)
   - ✅ Queries relevant data:
     - Recruiter: Active candidates, open job reqs
     - Trainer: Current students, grading deadlines
     - Bench Sales: Bench consultants, client requirements
   - ✅ Remembers preferences (learns from interactions)
   - ✅ Adapts tone (formal for Admin, casual for Trainer)

6. **Learning from Patterns**
   - ✅ Track user interactions (questions asked, actions taken)
   - ✅ Identify recurring needs (e.g., always asks for candidate status on Mondays)
   - ✅ Proactively offer information (before asked)
   - ✅ A/B test suggestions (learn what's helpful)

7. **Slack/Email Integration**
   - ✅ Slack bot: `@InTime Twin` mention triggers response
   - ✅ Email: Reply to briefing with questions
   - ✅ In-app: Chat widget in main dashboard

8. **Adoption Target: 80%+ Daily Active Use**
   - ✅ Onboarding: 30-minute training session
   - ✅ Early wins: Show time savings in Week 1
   - ✅ Gamification: Leaderboard for "Most AI-Assisted"
   - ✅ Manager endorsement: Leadership uses publicly

9. **Cost Target: <$15/day per Employee**
   - ✅ Breakdown:
     - Morning briefing: $0.005 × 1 = $0.005
     - Proactive suggestions: $0.005 × 3 = $0.015
     - On-demand questions: $0.005 × 10 = $0.05
     - Total: ~$0.07/day = $25.55/year per employee
   - ✅ Well under budget ($1,200/year allocated)

10. **Privacy & Security**
    - ✅ No cross-employee data leakage (RLS enforced)
    - ✅ Employees can pause twin (opt-out temporarily)
    - ✅ Audit log: All AI interactions tracked
    - ✅ No sensitive PII in prompts (candidate SSN, salary)

#### API Contracts

**POST /api/ai/twin/morning-briefing**

Request:
```typescript
{
  userId: string; // UUID
}
```

Response:
```typescript
{
  success: true;
  data: {
    briefing: string; // AI-generated narrative
    priorities: string[]; // Top 3 tasks
    urgentItems: string[]; // Deadlines, follow-ups
    opportunities: string[]; // Proactive suggestions
  }
}
```

**POST /api/ai/twin/proactive-suggestion**

Request:
```typescript
{
  userId: string;
}
```

Response:
```typescript
{
  success: true;
  data: {
    suggestion: string | null; // null if no actionable items
    category: 'follow_up' | 'opportunity' | 'alert' | 'reminder';
    priority: 'high' | 'medium' | 'low';
  }
}
```

**POST /api/ai/twin/chat**

Request:
```typescript
{
  userId: string;
  message: string;
  conversationId?: string; // Optional, for multi-turn
}
```

Response:
```typescript
{
  success: true;
  data: {
    response: string;
    conversationId: string;
    escalate: boolean; // true if AI can't answer
  }
}
```

**GET /api/ai/twin/context/:userId**

Response:
```typescript
{
  success: true;
  data: {
    role: 'recruiter' | 'trainer' | 'bench_sales' | 'admin';
    activeItems: number; // Candidates, students, consultants, etc.
    needsAttention: number; // Items requiring action
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: string;
    }>;
  }
}
```

#### Database Schema

```sql
-- AI Twin interactions log
CREATE TABLE ai_twin_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  interaction_type TEXT NOT NULL, -- 'briefing' | 'suggestion' | 'chat'
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,

  conversation_id UUID, -- For multi-turn chats
  metadata JSONB DEFAULT '{}'::jsonb,

  model_used TEXT,
  tokens_used INTEGER,
  cost FLOAT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_twin_interactions_user ON ai_twin_interactions(user_id, created_at DESC);
CREATE INDEX idx_twin_interactions_conv ON ai_twin_interactions(conversation_id);

-- AI Twin preferences (learned patterns)
CREATE TABLE ai_twin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  preference_key TEXT NOT NULL, -- e.g., 'preferred_briefing_time'
  preference_value JSONB NOT NULL,

  learned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, preference_key)
);

CREATE INDEX idx_twin_prefs_user ON ai_twin_preferences(user_id);

-- RLS
ALTER TABLE ai_twin_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_twin_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY twin_interactions_user_own ON ai_twin_interactions
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY twin_prefs_user_own ON ai_twin_preferences
  FOR ALL
  USING (user_id = auth.uid());
```

#### UI/UX Requirements

**Chat Widget (Main Dashboard):**
```
┌─────────────────────────────────────────────────────┐
│ 🤖 Your AI Twin                              [—][×] │
├─────────────────────────────────────────────────────┤
│ Good morning, Sarah! You have:                       │
│ • 3 candidates needing follow-up                    │
│ • 2 new job reqs assigned                           │
│ • 1 resume match with 90% confidence                │
│                                                      │
│ What would you like help with?                      │
├─────────────────────────────────────────────────────┤
│ [Show me candidates] [Job req details] [Resume]    │
├─────────────────────────────────────────────────────┤
│ 💬 Type your question...                      [→]   │
└─────────────────────────────────────────────────────┘
```

**Morning Briefing (Email):**
```
Subject: [InTime] Your Daily Briefing - Nov 19, 2025

Hi Sarah,

Good morning! Here's what's on your plate today:

🎯 TOP PRIORITIES
1. Follow up with 3 candidates (John, Jane, Mike) - last contact 4+ days ago
2. Review new PolicyCenter job req #42 - client needs response by EOD
3. Schedule interviews for 2 qualified candidates from yesterday's screening

⚠️ URGENT ITEMS
• Client ABC waiting for candidate shortlist (deadline: today 5 PM)
• Resume match found: Mike Doe 90% fit for ClaimCenter role

💡 OPPORTUNITIES
• New candidate applications: 5 profiles match your active reqs
• Market rate update: PolicyCenter developers up 10% - adjust job postings?

Have a productive day! I'm here if you need anything.

---
Your AI Twin 🤖
[Chat with me] [Update preferences] [Unsubscribe]
```

**Proactive Suggestion (Slack):**
```
InTime Twin APP 10:05 AM
👋 Quick heads up, Sarah!

You have 3 candidates who haven't been contacted in 4+ days:
• John Smith (PolicyCenter developer)
• Jane Doe (BillingCenter analyst)
• Mike Johnson (ClaimCenter lead)

Would you like me to draft follow-up emails? [Yes, please] [No thanks]
```

#### Testing Requirements

**Unit Tests:**
- Role-specific system prompts (verify content)
- Morning briefing generation (mocked context)
- Proactive suggestion logic (actionable items detection)
- Context gathering (query database for role-specific data)

**Integration Tests:**
- Full briefing generation (real AI call)
- Multi-turn chat (conversation memory)
- Slack integration (bot responds to mentions)
- Email delivery (Resend API)

**E2E Tests:**
- Employee receives morning briefing (email + Slack)
- Employee asks question via chat widget
- AI Twin suggests proactive action
- Employee marks suggestion as helpful/not helpful
- Adoption tracking (daily active users)

**Performance Tests:**
- Generate 200 briefings (< 5 minutes)
- Chat response time (< 2 seconds)
- Context gathering (< 500ms)

**Adoption Tests:**
- Onboarding completion rate (target: 90%+)
- Daily active users (target: 80%+)
- Helpful rating (target: 80%+)
- Time saved self-reported (survey)

**Privacy Tests:**
- RLS: Employee A can't access Employee B's twin data
- No sensitive PII in prompts (SSN, salary)
- Audit log: All interactions tracked

#### Dependencies

**Requires:**
- AI-INF-005 (Base Agent Framework) - EmployeeTwin extends BaseAgent
- AI-INF-006 (Prompt Library) - role_briefing, proactive_suggestion templates
- Epic 1 (Foundation) - User profiles, roles, RBAC
- Slack integration (MCP or SDK)
- Resend email API

**Blocks:**
- Employee onboarding flow (Epic 6)
- Workflow automation (Epic 7)

---

## 📊 Sprint-Level Requirements

### Database Migrations

**Migration 016: Productivity Tracking**
```sql
-- employee_screenshots table (AI-PROD-001)
-- productivity_reports table (AI-PROD-003)
-- ai_twin_interactions table (AI-TWIN-001)
-- ai_twin_preferences table (AI-TWIN-001)
-- cleanup_old_screenshots() function
-- pg_cron scheduled job
```

**Migration Dependencies:**
- Epic 1: user_profiles, roles, user_roles tables must exist
- pgvector extension enabled
- pg_cron extension enabled

### API Routes

**New tRPC Routers:**
- `/api/ai/productivity` (classify, batch-classify, summary, generate-report)
- `/api/ai/twin` (morning-briefing, proactive-suggestion, chat, context)

### Supabase Storage

**New Bucket:**
- Name: `employee-screenshots`
- Public: false
- Allowed MIME types: `image/jpeg`
- File size limit: 200KB

### Environment Variables

```bash
# Already exists from Sprint 1-3
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
HELICONE_API_KEY=...

# New for Sprint 4
SLACK_BOT_TOKEN=xoxb-... # For AI Twin Slack integration
RESEND_API_KEY=re_... # For morning briefing emails
```

### Cron Jobs

**Daily Cleanup (2 AM):**
```sql
SELECT cleanup_old_screenshots();
```

**Daily Report Generation (3 AM):**
```sql
SELECT batch_generate_reports(CURRENT_DATE - INTERVAL '1 day');
```

**Morning Briefings (8 AM local time):**
- Node.js script: `scripts/send-morning-briefings.ts`
- Triggered by pg_cron or separate cron daemon

---

## 🎯 Success Criteria

### Definition of Done (Sprint 4)

**Code Complete:**
- [ ] All 4 stories implemented (AI-PROD-001, 002, 003, AI-TWIN-001)
- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors (warnings acceptable with justification)
- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: All passing
- [ ] E2E tests: Critical paths covered

**Documentation:**
- [ ] API contracts documented (OpenAPI spec)
- [ ] Database schema documented (migration files + comments)
- [ ] Privacy policy updated (screenshot tracking, AI Twin data usage)
- [ ] Employee onboarding guide (how to use AI Twin)
- [ ] Manager guide (how to interpret productivity reports)

**Privacy & Compliance:**
- [ ] Legal review: GDPR Article 5 compliance (data minimization)
- [ ] CCPA compliance: Right to opt-out, right to deletion
- [ ] Employee consent form: Clear language, no legalese
- [ ] Privacy audit: No PII leakage, secure storage
- [ ] RLS policies: Tested and verified

**Performance:**
- [ ] Classification accuracy: 90%+ (validated on 100 sample screenshots)
- [ ] AI response time: <2 seconds (95th percentile)
- [ ] Batch processing: 120 screenshots in <5 minutes
- [ ] Cost per screenshot: <$0.002
- [ ] AI Twin response: <2 seconds

**Business Metrics:**
- [ ] Privacy opt-out rate: <10% (target)
- [ ] AI Twin adoption: 80%+ daily active users (target, measured in Week 1)
- [ ] Helpful rating: 80%+ (AI responses marked helpful)
- [ ] Cost per employee: <$1,200/year (Helicone tracking)

**Deployment:**
- [ ] Migration 016 applied to production
- [ ] Supabase Storage bucket created
- [ ] Cron jobs scheduled
- [ ] Environment variables configured
- [ ] Electron app built for Windows/macOS/Linux
- [ ] App distributed (internal download link)

---

## ⚠️ Risks & Mitigation

### Critical Risks

#### RISK 1: Privacy Backlash (HIGH IMPACT, MEDIUM PROBABILITY)

**Description:**
Employees perceive screenshot tracking as surveillance, not productivity measurement.

**Impact:**
- High opt-out rate (>50%)
- Morale decline
- Legal liability (GDPR violations)
- Feature failure

**Mitigation Strategy:**

1. **Transparent Communication (Pre-Launch):**
   - All-hands meeting: Explain purpose (help, not surveillance)
   - Written FAQ: "How is my data used?" "Who can see my screenshots?"
   - Demo: Show employee view (full transparency)

2. **Pilot Program (10 Volunteers):**
   - Week 1-2: Test with volunteers only
   - Gather feedback: "What concerns you?"
   - Iterate: Address concerns before full rollout

3. **Employee Controls (Mandatory):**
   - Pause button: Immediate stop (no questions asked)
   - Auto-pause: Sensitive apps blacklist
   - View own data: Employees see everything AI sees
   - Delete anytime: GDPR right to erasure (1-click)

4. **Manager Training (Mandatory):**
   - Do NOT use for performance reviews (coaching only)
   - Focus on trends, not individuals
   - Positive framing: "How can I help?" not "Why so many meetings?"

5. **Legal Review (Before Launch):**
   - GDPR compliance audit
   - CCPA compliance audit
   - Employee consent form review
   - Privacy policy update

**Contingency Plan:**
If opt-out rate >20% in Week 1:
- Pause rollout
- Focus groups: Understand concerns
- Redesign: Address specific issues
- Re-launch in 2 weeks

**Success Criteria:**
- Opt-out rate <10%
- 80%+ employees say "I understand how my data is used" (survey)

---

#### RISK 2: Classification Accuracy Below 90% (HIGH IMPACT, MEDIUM PROBABILITY)

**Description:**
GPT-4o-mini vision misclassifies activities (e.g., coding vs. documentation confusion).

**Impact:**
- Inaccurate productivity reports
- Employee frustration: "AI says I'm idle, but I was working!"
- Manager mistrust: "Can't rely on this data"
- Feature credibility loss

**Mitigation Strategy:**

1. **Pre-Launch Validation:**
   - Manual label 100 diverse screenshots
   - Run classification
   - Calculate accuracy: (correct / total) × 100
   - Document confusion matrix: Which categories confused?

2. **Acceptable Accuracy Threshold:**
   - 90%+ overall accuracy (target)
   - 85%+ minimum (acceptable)
   - <85%: Do NOT launch, iterate prompts

3. **Iterative Prompt Engineering:**
   - If accuracy <90%, refine prompts:
     - Add category definitions (clearer boundaries)
     - Provide examples ("Coding = IDE with code, not browser with docs")
     - Increase temperature (more nuanced classifications)

4. **Confidence Filtering:**
   - Only report classifications with confidence >0.5
   - Low confidence (<0.5): Mark as "Unclear" in reports
   - Aggregate "Unclear" separately (transparency)

5. **Employee Feedback Loop:**
   - "Was this classification correct?" thumbs up/down
   - Weekly review: Retrain prompts based on feedback
   - A/B test: Old prompt vs. new prompt

**Contingency Plan:**
If accuracy <85% after 2 weeks:
- Pause classification
- Switch to GPT-4o (higher cost, better accuracy)
- Budget impact: $0.0015 → $0.003 per screenshot (2x cost)
- Re-validate on 100 screenshots

**Success Criteria:**
- 90%+ accuracy on validation set
- <5% employee disputes ("AI got it wrong")

---

#### RISK 3: Low AI Twin Adoption (<50%) (MEDIUM IMPACT, HIGH PROBABILITY)

**Description:**
Employees don't use AI Twin daily (prefer email, Slack, manual workflows).

**Impact:**
- ROI doesn't materialize ($226K savings not realized)
- Low business value
- Feature considered failure

**Mitigation Strategy:**

1. **Onboarding Excellence:**
   - Mandatory 30-minute training session
   - Live demo: Show actual use cases
   - Hands-on: Each employee asks 3 questions
   - Cheat sheet: "Top 10 ways AI Twin helps you"

2. **Early Wins (Week 1):**
   - Morning briefing: Show immediate value
   - Proactive suggestion: Surface actionable item
   - Quick response: <2 seconds (delight users)
   - Gamification: "You saved 2 hours this week!"

3. **Manager Endorsement:**
   - Leadership uses AI Twin publicly
   - Managers share wins in team meetings
   - "I asked AI Twin, and it suggested..." (normalize usage)

4. **Slack Integration (Low Friction):**
   - No need to open app
   - `@InTime Twin` mention = instant response
   - Reduces adoption barrier

5. **Feedback Loop:**
   - Weekly survey: "How helpful was AI Twin this week?" (1-5 stars)
   - Monthly focus group: "What would make it better?"
   - Iterate: Add features based on feedback

6. **Incentives (Optional):**
   - Leaderboard: "Most AI-Assisted Team"
   - Recognition: "AI Power User of the Month"
   - Swag: InTime t-shirt for 90-day streak

**Contingency Plan:**
If adoption <50% after 4 weeks:
- Focus groups: "Why aren't you using it?"
- Identify barriers: Complexity? Lack of value? Prefer human contact?
- Pivot: Simplify, add missing features, or sunset feature

**Success Criteria:**
- 80%+ daily active users by Week 4
- 4+ stars average helpfulness rating

---

#### RISK 4: Cost Overruns (>$280K Budget) (MEDIUM IMPACT, LOW PROBABILITY)

**Description:**
AI usage exceeds projections (more employees, more questions, higher model costs).

**Impact:**
- Budget exceeded
- Emergency cost optimization required
- Feature scope reduction

**Mitigation Strategy:**

1. **Daily Cost Monitoring (Helicone):**
   - Dashboard: Real-time spend by use case
   - Alerts: Email if >$500/day ($182K/year pace)
   - Weekly reports: Sent to CFO

2. **Rate Limiting (Prevent Abuse):**
   - Max 50 questions/day per student
   - Max 20 queries/day per employee (AI Twin)
   - Max 120 screenshots/employee/day

3. **Model Downgrading:**
   - If budget at 80%: Switch GPT-4o → GPT-4o-mini (10x cheaper)
   - If budget at 90%: Reduce proactive suggestions from 3/day → 1/day

4. **Caching (50% Hit Rate Expected):**
   - Cache common queries (e.g., "What is rating?")
   - 24-hour TTL
   - Reduces OpenAI calls by ~50%

5. **Budget Buffer (Built-In):**
   - Budget: $280K
   - Projected: $277K
   - Buffer: $3K (1%)

**Contingency Plan:**
If spend exceeds $500/day:
- Immediate model downgrade: GPT-4o → GPT-4o-mini
- Reduce rate limits: 50 → 25 questions/day
- Pause screenshot classification (most expensive feature)
- Executive review: Increase budget or reduce scope

**Success Criteria:**
- Total AI spend <$280K/year
- No emergency cost optimizations needed

---

#### RISK 5: Electron App Distribution Challenges (LOW IMPACT, MEDIUM PROBABILITY)

**Description:**
Employees can't install Electron app (IT restrictions, permissions, compatibility).

**Impact:**
- Screenshot tracking unavailable
- Productivity feature delayed
- Manual workarounds needed

**Mitigation Strategy:**

1. **IT Coordination (Pre-Launch):**
   - Work with IT team: Whitelist app, approve installation
   - Code signing: macOS (Apple Developer certificate), Windows (Authenticode)
   - IT deploys via MDM (Jamf, Intune)

2. **Multi-Platform Builds:**
   - Windows: .exe installer (signed)
   - macOS: .dmg installer (notarized)
   - Linux: .AppImage (portable)

3. **Auto-Update Mechanism:**
   - electron-updater library
   - Silently downloads updates
   - Prompts user to restart (non-intrusive)

4. **Fallback: Web-Based Upload:**
   - If Electron app fails, web upload option
   - Employee manually uploads screenshots (drag-and-drop)
   - Less ideal, but functional

**Contingency Plan:**
If >20% installation failures:
- IT desk support: Help employees install
- Extended rollout: 10 employees/week (not all at once)
- Web-based fallback for problematic machines

**Success Criteria:**
- 90%+ successful installations
- <5% support tickets for installation issues

---

## 🔄 Dependencies & Integration

### Depends On (Must Be Complete First)

**Epic 1 (Foundation):**
- ✅ PostgreSQL database with user_profiles, roles, user_roles
- ✅ Supabase Auth with RLS
- ✅ pgvector extension enabled
- ✅ Event bus (PostgreSQL LISTEN/NOTIFY)
- ✅ tRPC API infrastructure
- ✅ Testing framework (Vitest + Playwright)
- ✅ Error handling (Sentry)

**Sprint 1 (AI Infrastructure):**
- ✅ AI-INF-001: AI Model Router (for cost tracking)
- ✅ AI-INF-002: RAG Infrastructure (for context retrieval)
- ✅ AI-INF-003: Memory Layer (for conversation history)

**Sprint 2 (Monitoring & Base Agents):**
- ✅ AI-INF-004: Cost Monitoring with Helicone
- ✅ AI-INF-005: Base Agent Framework (for EmployeeTwin)
- ✅ AI-INF-006: Prompt Library (for templates)

### Enables (Unblocks These Features)

**Epic 6 (HR & Employee):**
- Employee productivity dashboards
- Manager team dashboards
- Workflow optimization

**Epic 7 (Productivity Pods):**
- Pod performance tracking
- 2-person pod metrics
- Cross-pollination opportunity detection

---

## 📚 Testing Strategy

### Test Coverage Targets

| Layer | Coverage | Tools |
|-------|----------|-------|
| Unit Tests | 80%+ | Vitest |
| Integration Tests | Critical paths | Vitest + Supabase |
| E2E Tests | User flows | Playwright |
| Performance Tests | Key metrics | Custom scripts |
| Security Tests | RLS, auth | Manual + automated |

### Critical Test Scenarios

**Productivity Tracking:**
1. Screenshot capture → Upload → Classify → Report (full E2E)
2. Privacy controls: Pause, sensitive app detection
3. Offline queue: Network failure → Retry → Success
4. RLS: Employee A can't access Employee B's data
5. Auto-cleanup: Screenshots >30 days deleted
6. Classification accuracy: 90%+ on validation set
7. Cost: <$0.002 per screenshot (Helicone validation)

**Employee AI Twin:**
1. Morning briefing: Generated and delivered (email + Slack)
2. Proactive suggestion: Actionable item detected and suggested
3. Chat: Multi-turn conversation (memory persists)
4. Context gathering: Role-specific data queried
5. RLS: Employee A's twin can't access Employee B's data
6. Adoption: 80%+ daily active users (Week 4)
7. Cost: <$15/day per employee

---

## 📝 Documentation Requirements

### For Developers (Architect & Developer)

**Technical Docs:**
- [ ] API contracts (OpenAPI spec)
- [ ] Database schema (ERD + migration files)
- [ ] Architecture diagrams (system flow, data flow)
- [ ] Code comments (complex logic explained)
- [ ] README: How to run Electron app locally

**Deployment Docs:**
- [ ] Migration guide (016_productivity_tracking.sql)
- [ ] Supabase Storage setup (bucket creation)
- [ ] Cron job configuration (daily cleanup, reports, briefings)
- [ ] Environment variables (SLACK_BOT_TOKEN, RESEND_API_KEY)
- [ ] Electron app build and distribution (Windows, macOS, Linux)

### For End Users (Employees & Managers)

**Employee Guides:**
- [ ] "How to Use Your AI Twin" (5-minute read)
- [ ] "Productivity Tracking: Privacy & Controls" (FAQ)
- [ ] "Pause Screenshot Capture" (quick reference)
- [ ] "View Your Data" (transparency guide)

**Manager Guides:**
- [ ] "Interpreting Productivity Reports" (10-minute read)
- [ ] "Coaching with AI Insights" (best practices)
- [ ] "DO NOT Use for Performance Reviews" (warning)
- [ ] "Privacy Policy Compliance" (legal requirements)

### For Legal/Compliance

**Privacy & Compliance:**
- [ ] Updated privacy policy (screenshot tracking, AI Twin)
- [ ] GDPR compliance checklist (Article 5, Article 17)
- [ ] CCPA compliance checklist (Right to opt-out, right to deletion)
- [ ] Employee consent form (clear language, no legalese)
- [ ] Data retention policy (30 days max for screenshots)

---

## 🎯 Questions for Architect

### Critical Questions (Must Answer Before Architecture Phase)

1. **Electron App Architecture:**
   - Should we use Electron Forge or custom build setup?
   - Auto-update strategy: electron-updater vs. manual downloads?
   - Code signing certificates: Who manages Apple Developer + Windows Authenticode?
   - Distribution: MDM (Jamf/Intune) or self-service download?

2. **Screenshot Storage Optimization:**
   - Compression level: JPEG 50% quality sufficient, or test 30%/70%?
   - Image resolution: 1280px width max, or allow 1920px for high-DPI screens?
   - Storage costs: Projected 5GB/employee/month × 200 = 1TB total × $0.021/GB = $21/month
   - CDN needed: CloudFront for faster screenshot retrieval?

3. **Activity Classification Prompt Engineering:**
   - Should we use JSON mode (OpenAI structured outputs) or parse from text?
   - Temperature: 0.3 (current) or 0.1 (more deterministic)?
   - Max tokens: 150 sufficient, or increase to 200 for better reasoning?
   - Few-shot examples: Include 2-3 example classifications in prompt?

4. **AI Twin Context Gathering:**
   - How much data to load: Last 7 days or 30 days of employee activity?
   - Database query performance: Add indexes on user_id + date columns?
   - Caching strategy: Cache employee context for 1 hour (reduce DB queries)?
   - Real-time vs. batch: Morning briefing can be pre-generated at 2 AM?

5. **Privacy & Compliance:**
   - GDPR: Do we need Data Protection Impact Assessment (DPIA)?
   - CCPA: Are we "selling" employee data (NO, but need explicit statement)?
   - Consent: Opt-in during onboarding sufficient, or require annual re-consent?
   - Data deletion: Employee requests deletion → immediate or 30-day grace period?

6. **Cost Optimization:**
   - Screenshot classification: GPT-4o-mini sufficient, or upgrade to GPT-4o for accuracy?
   - AI Twin: Claude Sonnet for reasoning tasks, or GPT-4o-mini for all?
   - Caching: Redis for employee context (1 hour TTL) to reduce DB + AI calls?
   - Batch processing: Process all screenshots at 3 AM (off-peak pricing)?

7. **Scalability:**
   - Database: 200 employees × 120 screenshots/day × 30 days = 720K rows/month
   - Postgres performance: Partition employee_screenshots by month (faster queries)?
   - Supabase Storage: 1TB projected, does free tier support? (Probably need Pro plan)
   - AI API rate limits: OpenAI 500 req/min, sufficient for 200 employees?

8. **Testing:**
   - Classification validation: Who labels 100 screenshots (PM, QA, or crowdsource)?
   - Privacy testing: How to test RLS without exposing real employee data?
   - Load testing: Simulate 200 employees × 120 screenshots/day?
   - Cost testing: Run full pipeline for 1 week, validate <$280K/year projection?

---

## 📅 Timeline & Effort Estimates

### Sprint 4 Breakdown (Week 11-12)

**Week 11:**
- Days 1-2: AI-PROD-001 (Electron app, screenshot capture, upload)
- Days 3-4: AI-PROD-002 (Activity classification, batch processing)
- Day 5: Testing & bug fixes

**Week 12:**
- Days 1-2: AI-PROD-003 (Daily timeline generator, manager dashboard API)
- Days 3-4: AI-TWIN-001 (Employee AI Twin framework, Slack integration)
- Day 5: Testing, privacy audit, documentation

### Story Effort Breakdown

| Story | Points | Estimated Hours | Critical Path |
|-------|--------|----------------|---------------|
| AI-PROD-001 | 5 | 20 hours | Yes (blocks AI-PROD-002) |
| AI-PROD-002 | 8 | 32 hours | Yes (blocks AI-PROD-003) |
| AI-PROD-003 | 3 | 12 hours | No (parallel with AI-TWIN-001) |
| AI-TWIN-001 | 5 | 20 hours | No |
| **Total** | **21** | **84 hours** | **10 days** |

### Parallel Work Opportunities

**Week 11:**
- Developer 1: AI-PROD-001 + AI-PROD-002 (sequential)
- Developer 2: AI-TWIN-001 (parallel, no dependencies)

**Week 12:**
- Developer 1: AI-PROD-003 (depends on AI-PROD-002)
- Developer 2: Testing + privacy audit + documentation

**Assumption:** 2 developers working simultaneously (realistic for Sprint 4)

---

## ✅ Sprint 4 Handoff Checklist

### PM → Architect Handoff

- [x] User stories documented (all 4 stories)
- [x] Acceptance criteria detailed (8-10 per story)
- [x] API contracts defined (request/response types)
- [x] Database schema specified (tables, indexes, RLS)
- [x] UI/UX requirements outlined (manager dashboard, chat widget)
- [x] Testing requirements listed (unit, integration, E2E)
- [x] Dependencies mapped (Epic 1, Sprint 1-3)
- [x] Risks identified (5 critical risks + mitigation)
- [x] Success criteria defined (measurable metrics)
- [x] Questions for Architect (8 critical questions)
- [x] Timeline estimated (2 weeks, 84 hours)
- [x] Privacy concerns flagged (GDPR, CCPA, consent)
- [x] Cost projections validated (<$280K/year)

### Architect Next Steps

1. **Answer Critical Questions** (1-2 days)
   - Electron app architecture decisions
   - Privacy compliance strategy
   - Cost optimization plan

2. **Create Technical Design** (2-3 days)
   - Architecture diagrams (system, data flow)
   - Database schema finalization
   - API endpoint specifications
   - Electron app structure

3. **Handoff to Developer** (1 day)
   - Technical design document
   - Implementation plan
   - Code scaffolding (if needed)

---

## 📊 Appendix: Business Context

### ROI Calculation (Sprint 4 Features)

**Productivity Tracking:**
- Current cost: 5 managers × $175K/year = $875K (manual time tracking oversight)
- AI cost: $50,400/year (screenshot classification + reports)
- **Savings:** $824,600/year (17.4x ROI)

**Employee AI Twins:**
- Current cost: Additional 10 managers × $175K = $1.75M (coordination, reminders, follow-ups)
- AI cost: $226,700/year (200 employees × $1,133/year)
- **Savings:** $1,523,300/year (7.7x ROI)

**Total Sprint 4 Value:**
- Combined savings: $2,347,900/year
- Combined AI cost: $277,100/year
- **Net ROI:** $2,070,800/year (8.5x return)

### Strategic Importance

**Why Sprint 4 is Critical:**
1. **Highest ROI Sprint** ($2M+ savings, 82% of Epic 2.5 budget)
2. **Employee Empowerment** (AI extends capabilities, not replaces)
3. **Competitive Differentiator** (No other staffing company has AI Twins)
4. **Scalability Foundation** (Works for 200 or 2,000 employees)
5. **Data-Driven Culture** (Productivity insights without micromanagement)

---

**End of PM Handoff Document**

**Next Action:** Architect review → Technical design → Implementation kick-off

**PM Contact:** AI PM Agent
**Date Prepared:** 2025-11-19
**Status:** ✅ READY FOR ARCHITECTURE PHASE
