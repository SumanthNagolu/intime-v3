# Use Case: Track Campaign Metrics

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-A02 |
| Actor | Recruiter (Business Development Role) |
| Goal | Monitor campaign performance, analyze conversion rates, and optimize outreach effectiveness |
| Frequency | Daily monitoring, weekly analysis |
| Estimated Time | 5-15 minutes per review |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "campaign.read" permission
3. Active or completed campaign exists
4. Campaign has been running for at least 24 hours (meaningful data)

---

## Trigger

One of the following:
- Daily campaign performance check
- Weekly metrics review
- Pod Manager requests campaign update
- Campaign approaching end date
- Response rate drops below threshold
- Lead target milestone reached
- A/B test results ready

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Campaign Analytics

**User Action:** Click campaign name from campaigns list or dashboard alert

**System Response:**
- Campaign detail page loads
- Analytics tab automatically selected if clicking from alert
- Real-time metrics displayed

**Screen State:**
```
+----------------------------------------------------------+
| [← Back to Campaigns]                    Campaign Detail  |
+----------------------------------------------------------+
|                                                           |
| Q4 FinTech Startup Outreach                              |
| Status: 🟢 Active                       [Pause] [Edit]   |
| Owner: John Smith | Running 12 days (42 remaining)       |
|                                                           |
+----------------------------------------------------------+
| Overview | Prospects | Activity | [Analytics] | Settings |
+----------------------------------------------------------+
|                                                           |
| CAMPAIGN PERFORMANCE DASHBOARD                            |
|                                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │                    KEY METRICS                       │ |
| │                                                     │ |
| │  REACH          ENGAGEMENT       CONVERSIONS        │ |
| │  ┌─────────┐   ┌─────────┐      ┌─────────┐       │ |
| │  │  1,847  │   │  42.3%  │      │  8.7%   │       │ |
| │  │Contacted│   │Open Rate│      │Response │       │ |
| │  │ of 2,450│   │ (target │      │  Rate   │       │ |
| │  │  (75%)  │   │  35%)   │      │(tgt 8%) │       │ |
| │  │   🟢    │   │   🟢    │      │   🟢    │       │ |
| │  └─────────┘   └─────────┘      └─────────┘       │ |
| │                                                     │ |
| │  LEADS          MEETINGS         PIPELINE           │ |
| │  ┌─────────┐   ┌─────────┐      ┌─────────┐       │ |
| │  │   32    │   │    6    │      │ $48,000 │       │ |
| │  │Qualified│   │ Booked  │      │Pipeline │       │ |
| │  │ of 50   │   │ of 10   │      │ Value   │       │ |
| │  │  (64%)  │   │  (60%)  │      │(tgt $75K│       │ |
| │  │   🟢    │   │   🟡    │      │   🟡    │       │ |
| │  └─────────┘   └─────────┘      └─────────┘       │ |
| │                                                     │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| CONVERSION FUNNEL                                         |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Prospects   Contacted   Opened    Responded  Leads  │ |
| │    2,450 →   1,847   →   782   →    161   →   32   │ |
| │   (100%)    (75.4%)   (42.3%)    (8.7%)    (1.3%)  │ |
| │                                                     │ |
| │ ████████████████████████████████████░░░░░░░░░░░░░░ │ |
| │                                                     │ |
| │ Funnel Health: 🟢 Healthy (above benchmarks)       │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| CHANNEL BREAKDOWN                                         |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Channel      Sent    Open%   Click%  Response  Leads│ |
| │ ──────────────────────────────────────────────────  │ |
| │ LinkedIn     892     N/A     N/A     11.2%     18  │ |
| │ Email       1,847    42.3%   8.5%    6.8%      14  │ |
| │ ──────────────────────────────────────────────────  │ |
| │ Total       2,739    42.3%   8.5%    8.7%      32  │ |
| │                                                     │ |
| │ Best Performer: LinkedIn (11.2% response rate)     │ |
| │ Recommendation: Consider increasing LinkedIn budget │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| SEQUENCE PERFORMANCE                                      |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Email Sequence Performance by Step                  │ |
| │                                                     │ |
| │ Step 1: Initial     1,847 sent  45% open  3.2% resp│ |
| │ Step 2: Follow-up   1,424 sent  38% open  2.1% resp│ |
| │ Step 3: Case Study    987 sent  52% open  4.5% resp│ |
| │ Step 4: Value Add     612 sent  35% open  1.8% resp│ |
| │ Step 5: Final         389 sent  28% open  0.8% resp│ |
| │                                                     │ |
| │ 🌟 Top Performer: Step 3 (Case Study) - 4.5% resp  │ |
| │ 💡 Insight: Case studies drive highest engagement   │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| TIME-BASED TRENDS                   [Daily] [Weekly] ▼   |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │  Responses Over Time (Last 14 Days)                │ |
| │                                                     │ |
| │  15│    ▄                                          │ |
| │  12│   ▄█▄                                         │ |
| │   9│  ▄███▄      ▄                                 │ |
| │   6│ ▄█████▄   ▄█▄                                 │ |
| │   3│▄███████▄▄████▄▄                               │ |
| │   0│──────────────────────────────────             │ |
| │    Mon Tue Wed Thu Fri Sat Sun Mon Tue Wed Thu Fri │ |
| │                                                     │ |
| │ Peak Day: Tuesday (15 responses)                   │ |
| │ Best Time: 10-11 AM recipient local time           │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| A/B TEST RESULTS                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Subject Line Test (Step 1 Email)                   │ |
| │                                                     │ |
| │ Variant A: "Scaling your engineering team in 2025?"│ |
| │   Sent: 924 | Open: 41.2% | Response: 2.9%         │ |
| │                                                     │ |
| │ Variant B: "Quick question about [Company] hiring" │ |
| │   Sent: 923 | Open: 49.1% | Response: 3.6% 🏆      │ |
| │                                                     │ |
| │ Winner: Variant B (+19% opens, +24% responses)     │ |
| │ Confidence: 94% (Statistically significant)        │ |
| │                                                     │ |
| │ [Apply Winner to All] [Continue Testing]           │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| LEAD QUALITY ANALYSIS                                     |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Leads by Quality Score                              │ |
| │                                                     │ |
| │ Hot (Score 80-100):     8 leads  (25%)  🔥         │ |
| │ Warm (Score 50-79):    16 leads  (50%)  🌡️         │ |
| │ Cold (Score 0-49):      8 leads  (25%)  ❄️         │ |
| │                                                     │ |
| │ Average Lead Score: 62/100                          │ |
| │ Above campaign benchmark: ✅ Yes (+8 points)        │ |
| │                                                     │ |
| │ Top Lead Sources:                                   │ |
| │ 1. Series B FinTech (18 leads, avg score: 71)      │ |
| │ 2. West Coast companies (12 leads, avg score: 65)  │ |
| │ 3. VP Engineering title (20 leads, avg score: 68)  │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| COST ANALYSIS                                             |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ Budget Spent:     $156 / $250  (62.4%)             │ |
| │ Cost per Lead:    $4.88 (target: <$10)  ✅         │ |
| │ Cost per Meeting: $26.00 (target: <$50) ✅         │ |
| │                                                     │ |
| │ ROI Projection:                                     │ |
| │ Pipeline Value:     $48,000                         │ |
| │ Expected Close:     $14,400 (30% win rate)         │ |
| │ Campaign Cost:      $156                            │ |
| │ Projected ROI:      92x                             │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| RECOMMENDATIONS                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │ 💡 AI-Powered Insights                              │ |
| │                                                     │ |
| │ 1. INCREASE LINKEDIN BUDGET                         │ |
| │    LinkedIn shows 65% higher response rate than     │ |
| │    email. Consider reallocating $50 to LinkedIn.   │ |
| │    [Apply Recommendation]                           │ |
| │                                                     │ |
| │ 2. USE WINNING SUBJECT LINE                         │ |
| │    A/B test shows Variant B performs 24% better.   │ |
| │    Apply to remaining sequences.                    │ |
| │    [Apply Winner]                                   │ |
| │                                                     │ |
| │ 3. FOCUS ON SERIES B COMPANIES                      │ |
| │    Series B FinTech companies convert at 2x rate.  │ |
| │    Consider creating focused micro-campaign.        │ |
| │    [Create Segment]                                 │ |
| │                                                     │ |
| │ 4. OPTIMIZE SEND TIMES                              │ |
| │    Tuesday 10-11 AM shows peak engagement.         │ |
| │    Adjust schedule for remaining sends.             │ |
| │    [Optimize Schedule]                              │ |
| │                                                     │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
+----------------------------------------------------------+
| [Export Report]  [Share with Manager]  [Schedule Report] |
+----------------------------------------------------------+
```

**Time:** ~2 seconds to load

---

### Step 2: Analyze Conversion Funnel

**User Action:** Click on funnel stage to drill down

**System Response:**
- Detailed breakdown of selected stage
- List of prospects in that stage
- Actions available

**Screen State (Clicking "Responded"):**
```
+----------------------------------------------------------+
|                          Responded Prospects (161)    [×] |
+----------------------------------------------------------+
|                                                           |
| Filter: [All Responses ▼]  [All Channels ▼]  [Export]    |
|                                                           |
| RESPONSE BREAKDOWN                                        |
| ┌─────────────────────────────────────────────────────┐ |
| │ Positive (Interested):     89 (55%)  [View All]     │ |
| │ Neutral (More Info):       42 (26%)  [View All]     │ |
| │ Negative (Not Interested): 18 (11%)  [View All]     │ |
| │ Auto-Reply/OOO:            12 (8%)   [View All]     │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| POSITIVE RESPONSES (89)                    [Convert All] |
| ┌─────────────────────────────────────────────────────┐ |
| │ ☐ Sarah Chen | VP Engineering @ TechStart          │ |
| │   Response: "This looks interesting. Let's chat."  │ |
| │   Channel: LinkedIn | Dec 8 | Score: 85            │ |
| │   [Create Lead] [Schedule Meeting] [View Thread]   │ |
| │                                                     │ |
| │ ☐ Mike Johnson | CTO @ FinanceAI                   │ |
| │   Response: "Send me more info about your rates."  │ |
| │   Channel: Email | Dec 10 | Score: 72              │ |
| │   [Create Lead] [Send Info] [View Thread]          │ |
| │                                                     │ |
| │ ☐ Lisa Wang | Dir Engineering @ PayFlow            │ |
| │   Response: "We're actively hiring. Call me."      │ |
| │   Channel: LinkedIn | Dec 9 | Score: 91            │ |
| │   [Create Lead] [Schedule Call] [View Thread]      │ |
| │                                                     │ |
| │ ... (86 more)                                      │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| BULK ACTIONS                                              |
| [☐ Select All]  [Create Leads]  [Assign to Me]  [Export]|
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Export Campaign Report

**User Action:** Click "Export Report" button

**System Response:**
- Export options modal opens
- Multiple format choices

**Screen State:**
```
+----------------------------------------------------------+
|                                    Export Campaign Report |
+----------------------------------------------------------+
|                                                           |
| REPORT CONTENT                                            |
| ☑ Executive Summary                                       |
| ☑ Key Metrics Dashboard                                   |
| ☑ Conversion Funnel Analysis                              |
| ☑ Channel Performance                                     |
| ☑ Sequence Performance                                    |
| ☑ A/B Test Results                                        |
| ☑ Lead Quality Analysis                                   |
| ☑ Cost Analysis & ROI                                     |
| ☑ Recommendations                                         |
| ☐ Full Prospect List (CSV)                               |
| ☐ Detailed Activity Log                                   |
|                                                           |
| DATE RANGE                                                |
| ○ Campaign to Date (Dec 9 - Dec 21)                      |
| ○ Last 7 Days                                             |
| ○ Custom Range                                            |
|                                                           |
| FORMAT                                                    |
| ○ PDF Report (Professional format)                       |
| ○ Excel Workbook (Raw data + charts)                     |
| ○ Google Slides (Presentation format)                    |
| ○ Email Summary (Inline)                                  |
|                                                           |
| DELIVERY                                                  |
| ○ Download Now                                            |
| ○ Email to Me                                             |
| ○ Email to Manager (Sarah Johnson)                       |
| ○ Schedule Weekly Report                                  |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Generate Report ✓]      |
+----------------------------------------------------------+
```

**Time:** ~30 seconds to configure, ~5 seconds to generate

---

## Postconditions

1. ✅ Campaign metrics reviewed and understood
2. ✅ Performance trends identified
3. ✅ A/B test results analyzed
4. ✅ Optimization recommendations reviewed
5. ✅ Report exported/shared (if requested)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `campaign.analytics_viewed` | `{ campaign_id, user_id, viewed_at }` |
| `campaign.report_exported` | `{ campaign_id, format, sections, exported_by }` |
| `campaign.recommendation_applied` | `{ campaign_id, recommendation_type, applied_by }` |

---

## Metrics Definitions

### Primary Metrics

| Metric | Calculation | Benchmark |
|--------|-------------|-----------|
| **Reach Rate** | (Contacted / Total Prospects) × 100 | Target: >90% |
| **Open Rate** | (Opens / Emails Sent) × 100 | Target: 35-45% |
| **Click Rate** | (Clicks / Emails Opened) × 100 | Target: 8-12% |
| **Response Rate** | (Responses / Contacted) × 100 | Target: 6-10% |
| **Lead Conversion** | (Leads / Responses) × 100 | Target: 15-25% |
| **Meeting Conversion** | (Meetings / Leads) × 100 | Target: 20-30% |

### Quality Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Lead Quality Score** | Weighted score of industry, company size, title, engagement | >60/100 |
| **Cost per Lead** | Total Spend / Number of Leads | <$10 |
| **Cost per Meeting** | Total Spend / Number of Meetings | <$50 |
| **Pipeline Value** | Sum of potential deal values from leads | Varies |
| **Projected ROI** | (Expected Revenue - Cost) / Cost | >10x |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | View analytics |
| `e` | Export report |
| `r` | Refresh data |
| `1-5` | Switch between tabs |

---

## Alternative Flows

### A1: Automated Weekly Report

1. Configure scheduled report in Settings
2. System auto-generates every Monday
3. Email sent to recruiter and manager
4. Includes week-over-week comparison

### A2: Real-Time Alert Monitoring

1. Set alert thresholds (e.g., response rate <5%)
2. System monitors in real-time
3. Push notification when threshold breached
4. Quick action to pause or adjust campaign

---

## Related Use Cases

- [A01-run-campaign.md](./A01-run-campaign.md) - Create campaigns
- [A03-generate-lead-from-campaign.md](./A03-generate-lead-from-campaign.md) - Convert to leads
- [H03-recruiter-dashboard.md](./H03-recruiter-dashboard.md) - Dashboard metrics

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | View active campaign metrics | All metrics display correctly |
| TC-002 | Drill down into funnel stage | Prospect list shows |
| TC-003 | Export PDF report | PDF downloads with all sections |
| TC-004 | A/B test reaches significance | Winner highlighted, apply button shown |
| TC-005 | Campaign has zero responses | Shows "No data yet" message |
| TC-006 | Apply recommendation | Campaign updated, confirmation shown |
| TC-007 | Compare two campaigns | Side-by-side comparison view |

---

## Backend Processing

### tRPC Procedures

- `campaigns.getMetrics` - Fetch aggregated metrics
- `campaigns.getFunnel` - Get conversion funnel data
- `campaigns.getProspects` - List prospects by stage
- `campaigns.exportReport` - Generate PDF/Excel report
- `campaigns.applyRecommendation` - Apply optimization

### Analytics Queries

```sql
-- Campaign conversion funnel
SELECT
  COUNT(*) AS total_prospects,
  COUNT(*) FILTER (WHERE contacted_at IS NOT NULL) AS contacted,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
  COUNT(*) FILTER (WHERE responded_at IS NOT NULL) AS responded,
  COUNT(*) FILTER (WHERE converted_to_lead_at IS NOT NULL) AS leads
FROM campaign_prospects
WHERE campaign_id = $1;

-- Channel performance
SELECT
  channel,
  COUNT(*) AS sent,
  AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 AS open_rate,
  AVG(CASE WHEN responded_at IS NOT NULL THEN 1 ELSE 0 END) * 100 AS response_rate,
  COUNT(*) FILTER (WHERE converted_to_lead_at IS NOT NULL) AS leads
FROM campaign_prospects
WHERE campaign_id = $1
GROUP BY channel;
```

---

*Last Updated: 2025-12-05*

