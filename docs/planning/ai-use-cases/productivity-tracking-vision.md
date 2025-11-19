# Productivity Tracking: Screenshot Analysis with Vision AI

**Feature:** Automated employee productivity monitoring via screenshot analysis
**Architecture:** Single-Agent Vision Pipeline
**Budget:** $50,400/year (200 employees)
**ROI:** 17.4× (saves $875K in manager time tracking overhead)

---

## Overview

**Purpose:** Understand work patterns, detect struggles early, provide coaching insights - all automated via AI vision analysis.

**Why Single-Agent (Not Multi-Agent)?**
- Simple classification task (coding vs. meeting vs. email)
- High volume (192K images/day at scale)
- Fixed categories (no complex reasoning needed)
- Cost-sensitive (18% of total AI budget)

**Result:** Minimal overhead, maximum throughput

---

## Architecture

```
Desktop Agent → Screenshot Capture (30s intervals)
       ↓
Supabase Storage → Queue for processing
       ↓
GPT-4o-mini Vision → Classification ($0.001/image)
       ↓
PostgreSQL → Structured activity data
       ↓
Daily Batch → Timeline Generation ($0.01/report)
       ↓
Manager Dashboard → Aggregated insights (no raw screenshots)
```

---

## Implementation

### 1. Desktop Agent (Electron)

```typescript
// Electron main process
async function captureAndUpload() {
  const img = await screenshot({ format: 'jpg', quality: 60 });
  const fileName = `${userId}/${Date.now()}.jpg`;

  await supabase.storage.from('screenshots').upload(fileName, img);
  await supabase.from('screenshot_queue').insert({
    user_id: userId,
    file_path: fileName,
    captured_at: new Date()
  });
}

setInterval(captureAndUpload, 30_000); // Every 30 seconds
```

### 2. Classification Agent

```typescript
const CLASSIFICATION_PROMPT = `Analyze screenshot. Return JSON ONLY.

Categories: coding, email_work, meeting, research, linkedin_recruiting,
            crm_work, idle, social_media, news, shopping

Output:
{
  "activity": "Brief description",
  "category": "coding",
  "productive": true,
  "confidence": 0.95,
  "tools": ["VSCode", "Python"]
}`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: CLASSIFICATION_PROMPT },
      { type: 'image_url', image_url: { url: screenshotURL, detail: 'low' }}
    ]
  }],
  response_format: { type: 'json_object' }
});
```

### 3. Daily Timeline

```typescript
// Batch generate at 6 PM daily
async function generateDailyTimeline(userId: string, date: Date) {
  const activities = await db.getActivities(userId, date); // 120 summaries

  const timeline = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Generate daily productivity report.

Activities:
${activities.map(a => `${a.time}: ${a.activity}`).join('\n')}

Include:
1. Timeline (group similar activities)
2. Strengths (what went well)
3. Opportunities (gentle improvement suggestions)
4. Metrics (tasks completed, time distribution)`
    }]
  });

  return timeline.choices[0].message.content;
}
```

---

## Privacy & Ethics

**Transparency:**
- ✅ Employees informed during onboarding
- ✅ Can pause tracking (breaks, personal time)
- ✅ See own data anytime
- ❌ No human reviews raw screenshots (AI-only)
- ❌ Screenshots deleted after 30 days

**Manager Dashboard:**
- Shows: Aggregated metrics, trends, alerts
- Hides: Raw screenshots, specific websites, real-time tracking

---

## Cost Projection

```
Per Employee (annual):
- Screenshots: 480/day × 260 days = 124,800/year
- Classification: 124,800 × $0.002 = $249.60
- Daily timeline: 260 × $0.01 = $2.60
- Total: $252/employee/year

200 Employees:
- Total: $50,400/year

vs. Manager time tracking:
- 200 employees × 2 hours/week × $85/hour = $875,000/year
- Savings: $824,600 (94% cost reduction)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Classification Accuracy | 90%+ | Weekly employee validation |
| Privacy Concerns | <5% employees | Monthly survey |
| Manager Time Saved | 15+ hours/week | Time tracking |
| Cost | <$60K/year | Helicone dashboard |

---

**Status:** ✅ Planned - Week 9-10 Implementation
**Dependencies:** Epic 2.5 (AI Infrastructure)
