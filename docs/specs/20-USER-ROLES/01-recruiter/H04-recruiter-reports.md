# Use Case: Recruiter Reports

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-025 |
| Actor | Recruiter |
| Goal | Generate detailed performance reports for analysis and review |
| Frequency | Weekly, monthly, quarterly |
| Estimated Time | 5-15 minutes per report |
| Priority | Medium |

---

## Preconditions

1. User is logged in as Recruiter
2. Historical data exists (jobs, candidates, placements)
3. User has "reports.read" permission
4. Date range for reporting selected

---

## Trigger

One of the following:
- Weekly performance review
- Monthly one-on-one with manager
- Quarterly performance review
- Sprint retrospective
- Commission calculation period
- Manager requests report
- Self-assessment preparation

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Reports

**User Action:** Click "My Reports" in sidebar

**System Response:**
- Reports page loads
- Report templates displayed
- URL changes to: `/employee/workspace/reports`

**Screen State:**
```
+----------------------------------------------------------+
| MY REPORTS                              [📊 New Report]  |
+----------------------------------------------------------+
|                                                           |
| QUICK REPORTS                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ [This Sprint]  [This Month]  [This Quarter]  [YTD] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| REPORT TEMPLATES                        [Create Custom]  |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │  📈 PERFORMANCE SUMMARY                             │  |
| │  Complete overview of placements, revenue, quality  │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| │  💰 REVENUE & COMMISSION                            │  |
| │  Detailed revenue breakdown and commission calc     │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| │  📋 ACTIVITY REPORT                                 │  |
| │  Calls, emails, meetings, sourcing activity         │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| │  🎯 QUALITY METRICS                                 │  |
| │  Time-to-fill, submission quality, retention        │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| │  🏢 ACCOUNT PORTFOLIO                               │  |
| │  Account health, revenue by account, NPS scores     │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| │  📊 PIPELINE ANALYSIS                               │  |
| │  Jobs, candidates, submissions by stage             │  |
| │  [Generate Report]                                  │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| SAVED REPORTS                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ • Weekly Summary - Nov 25-Dec 1                     │  |
| │ • Monthly Performance - November 2025               │  |
| │ • Q4 2025 Review                                    │  |
| │                                          [View All]  │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Select Report Template

**User Action:** Click "Generate Report" on "Performance Summary"

**System Response:**
- Report configuration modal opens
- Default date range shown
- Options to customize

**Screen State:**
```
+----------------------------------------------------------+
|                            Generate Performance Summary   |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| REPORT PERIOD *                                           |
| ○ This Sprint (Nov 25 - Dec 8, 2025)                     |
| ○ Last Sprint                                             |
| ○ This Month (December 2025)                              |
| ○ Last Month                                              |
| ○ This Quarter (Q4 2025)                                  |
| ○ Last Quarter                                            |
| ○ Year to Date (2025)                                     |
| ○ Custom Date Range                                       |
|                                                           |
| CUSTOM DATE RANGE (if selected)                           |
| From: [MM/DD/YYYY           📅]                          |
| To:   [MM/DD/YYYY           📅]                          |
|                                                           |
| COMPARISON                                                |
| □ Compare to previous period                              |
| □ Compare to team average                                 |
| □ Show goal progress                                      |
|                                                           |
| SECTIONS TO INCLUDE                                       |
| ✅ Executive Summary                                      |
| ✅ Primary Metrics (Placements, Revenue)                  |
| ✅ Activity Breakdown (Calls, Emails, etc.)               |
| ✅ Quality Metrics (Time-to-fill, etc.)                   |
| ✅ Pipeline Status                                        |
| ✅ Account Portfolio                                      |
| ✅ Top Wins & Challenges                                  |
| ⬜ Detailed Transaction List                              |
| ⬜ Charts & Graphs                                        |
|                                                           |
| OUTPUT FORMAT                                             |
| ○ View in Browser  ○ Download PDF  ○ Email to Me         |
|                                                           |
| SAVE SETTINGS                                             |
| □ Save as recurring report (Generate weekly)              |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Generate Report ✓]         |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

### Step 3: Configure Report Settings

**User Action:** Select "This Month", check "Compare to previous period", click "Generate Report ✓"

**System Response:**
1. Report generation starts (loading indicator)
2. Data queried for selected period
3. Calculations performed
4. Report rendered

**Time:** ~3-5 seconds

---

### Step 4: View Generated Report

**System Response:**
- Report opens in new view
- All sections populated with data
- Comparison data shown side-by-side

**Screen State:**
```
+----------------------------------------------------------+
| PERFORMANCE SUMMARY REPORT                   [⋮ Actions] |
| John Smith • December 2025                               |
| Generated: Dec 5, 2025 4:30 PM                          |
+----------------------------------------------------------+
|                                    [📧 Email] [💾 Save]  |
|                                    [📄 PDF] [📊 Excel]   |
+----------------------------------------------------------+
|                                                           |
| EXECUTIVE SUMMARY                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Period: December 1-31, 2025 (5 days elapsed)        │  |
| │ Compared to: November 2025                           │  |
| │                                                     │  |
| │ KEY HIGHLIGHTS:                                     │  |
| │ • 1 placement confirmed (2 in Nov) ↓ 50%           │  |
| │ • $18K revenue generated ($42K in Nov) ↓ 57%       │  |
| │ • 8 submissions sent (12 in Nov) ↓ 33%             │  |
| │ • 2 interviews scheduled (5 in Nov) ↓ 60%          │  |
| │ • Quality score: 92/100 (88/100 in Nov) ↑ 4pts     │  |
| │                                                     │  |
| │ OVERALL STATUS: 🟡 Below Pace                       │  |
| │ On track to hit 60% of monthly targets              │  |
| │ (Normal for early month)                            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PRIMARY METRICS                                           |
| ┌────────────────────────────────────────────────────┐  |
| │                         Dec 2025    Nov 2025  Change │  |
| │ ────────────────────────────────────────────────── │  |
| │ Placements               1           2        -50%  │  |
| │ Revenue Generated        $18,000     $42,000  -57%  │  |
| │ Submissions Sent         8           12       -33%  │  |
| │ Interviews Scheduled     2           5        -60%  │  |
| │ Candidates Sourced       71          168      -58%  │  |
| │ Phone Screens            23          58       -60%  │  |
| │ Active Jobs (end)        12          10       +20%  │  |
| │ Jobs Filled              1           3        -67%  │  |
| │                                                     │  |
| │ 📊 [Trend Charts]                                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ACTIVITY BREAKDOWN                                        |
| ┌────────────────────────────────────────────────────┐  |
| │                         Dec 2025    Nov 2025  Change │  |
| │ ────────────────────────────────────────────────── │  |
| │ Calls Logged             18          52       -65%  │  |
| │ Emails Sent              42          118      -64%  │  |
| │ Client Meetings          3           8        -63%  │  |
| │ Internal Meetings        3           7        -57%  │  |
| │ Activities Logged        89          245      -64%  │  |
| │                                                     │  |
| │ Daily Averages:                                     │  |
| │ • Calls: 3.6/day (target: 3)         ✅ Above       │  |
| │ • Emails: 8.4/day (target: 5)        ✅ Above       │  |
| │ • Sourcing: 14.2/day (target: 15)    🟡 Close       │  |
| │ • Screens: 4.6/day (target: 5)       🟡 Close       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| QUALITY METRICS                                           |
| ┌────────────────────────────────────────────────────┐  |
| │                         Dec 2025    Nov 2025  Target │  |
| │ ────────────────────────────────────────────────── │  |
| │ Time-to-Submit           36 hrs     42 hrs    <48   │  |
| │ Status: ✅ Improving, beating target                │  |
| │                                                     │  |
| │ Time-to-Fill             18 days    22 days   <21   │  |
| │ Status: ✅ Improving, beating target                │  |
| │                                                     │  |
| │ Submission Quality       85%        78%       >70%  │  |
| │ (% leading to interview)                            │  |
| │ Status: ✅ Significant improvement                  │  |
| │                                                     │  |
| │ Interview-to-Offer       42%        38%       >40%  │  |
| │ Status: ✅ Above target                             │  |
| │                                                     │  |
| │ Offer Acceptance         88%        82%       >85%  │  |
| │ Status: ✅ Above target                             │  |
| │                                                     │  |
| │ 30-Day Retention         97%        95%       >95%  │  |
| │ Status: ✅ Excellent                                │  |
| │                                                     │  |
| │ OVERALL QUALITY SCORE:   92/100 ⬆ +4 from Nov      │  |
| │ Ranking: Top 20% in organization                    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PIPELINE STATUS                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ JOBS BY STATUS                                      │  |
| │ • Active:          12 (10 in Nov) ↑                 │  |
| │ • On Hold:         2 (3 in Nov) ↓                   │  |
| │ • Filled:          1 (3 in Nov) ↓                   │  |
| │ • Cancelled:       0 (1 in Nov) ↓                   │  |
| │                                                     │  |
| │ CANDIDATES BY STAGE                                 │  |
| │ • New/Sourcing:    23 (12%)                         │  |
| │ • Screening:       42 (22%)                         │  |
| │ • Submitted:       15 (8%)                          │  |
| │ • Interview:       8 (4%)                           │  |
| │ • Offer:           1 (0.5%)                         │  |
| │ • Placed:          1 (0.5%)                         │  |
| │ • Total Active:    90 candidates                    │  |
| │                                                     │  |
| │ SUBMISSIONS PIPELINE                                │  |
| │ • Pending Review:  5 (awaiting client feedback)     │  |
| │ • Interviewed:     3 (waiting results)              │  |
| │ • Accepted:        1 (offer accepted this month)    │  |
| │ • Rejected:        2 (moved on to other roles)      │  |
| │                                                     │  |
| │ 📊 Conversion Funnel:                               │  |
| │ 90 Sourced → 23 Screened → 8 Submitted → 2 Interview│  |
| │         26%           35%           25%              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ACCOUNT PORTFOLIO                                         |
| ┌────────────────────────────────────────────────────┐  |
| │                    Jobs  Revenue  NPS  Last Contact │  |
| │ ────────────────────────────────────────────────── │  |
| │ Google Inc          8    $8,500   9    2 days ago  │  |
| │ Meta                5    $6,200   8    5 days ago  │  |
| │ TechStart Inc       2    $2,100   7    12 days ago │  |
| │ Acme Corp           1    $0       6    18 days ago │  |
| │                                                     │  |
| │ Total Active: 8 accounts                            │  |
| │ Total Revenue: $18,000 this month                   │  |
| │ Average NPS: 7.8/10                                 │  |
| │                                                     │  |
| │ 🟢 Healthy Accounts: 6                              │  |
| │ 🟡 Needs Attention: 1 (TechStart)                   │  |
| │ 🔴 At Risk: 1 (Acme Corp)                           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TOP WINS 🎉                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ • Placed Alex Rodriguez @ Google (Senior BE)        │  |
| │ • Offer accepted: Maria Garcia @ Meta               │  |
| │ • Improved quality score from 88 to 92              │  |
| │ • Reduced time-to-fill from 22 to 18 days          │  |
| │ • 97% placement retention (best in quarter)         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CHALLENGES & IMPROVEMENT AREAS 📋                        |
| ┌────────────────────────────────────────────────────┐  |
| │ • DevOps Engineer job struggling (21 days, weak)    │  |
| │ • Acme Corp account at risk (18 days no contact)    │  |
| │ • Interview scheduling below target                 │  |
| │ • Need to increase daily sourcing by 1-2 profiles   │  |
| │                                                     │  |
| │ ACTION PLAN:                                        │  |
| │ 1. Expand DevOps search to include contractors      │  |
| │ 2. Schedule Acme Corp check-in call this week       │  |
| │ 3. Follow up on 3 pending interview feedbacks       │  |
| │ 4. Add 30 min daily sourcing block                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| DETAILED TRANSACTIONS                                     |
| ┌────────────────────────────────────────────────────┐  |
| │ [Expandable section with full list of placements,   │  |
| │  submissions, interviews, etc. with dates and       │  |
| │  details]                                           │  |
| │                                          [Expand]    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CHARTS & VISUALIZATIONS                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ [Revenue Trend Chart - Line graph]                  │  |
| │ [Activity Breakdown - Pie chart]                    │  |
| │ [Pipeline Funnel - Funnel chart]                    │  |
| │ [Quality Metrics - Bar chart comparing to targets]  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** Scrolling through report ~3-5 minutes

---

### Step 5: Export Report

**User Action:** Click "📄 PDF" to download PDF version

**System Response:**
1. PDF generation starts
2. Loading indicator shown
3. PDF downloads automatically
4. Toast: "Report downloaded successfully"

**PDF Formatting:**
- Professional letterhead
- Charts rendered as images
- Optimized for printing
- Page breaks at logical sections

**Time:** ~3-5 seconds

---

### Step 6: Email Report to Manager

**User Action:** Click "📧 Email" button

**System Response:**
- Email composer opens
- Manager pre-filled in "To:" field
- Subject pre-filled
- Report attached as PDF

**Screen State:**
```
+----------------------------------------------------------+
|                                        Email Report      |
+----------------------------------------------------------+
| To: sarah.jones@intime.com (Manager)                     |
| CC: [                                         ]          |
| Subject: Performance Report - December 2025              |
|                                                           |
| Body:                                                     |
| Hi Sarah,                                                 |
|                                                           |
| Please find attached my performance report for December  |
| 2025 (first 5 days).                                     |
|                                                           |
| Highlights:                                               |
| • 1 placement: Alex Rodriguez @ Google                   |
| • Quality score improved to 92/100                       |
| • On track for 60% of monthly targets (normal for early  |
|   month)                                                  |
|                                                           |
| Areas of focus:                                           |
| • DevOps role needs more sourcing                        |
| • Acme Corp account needs attention                      |
|                                                           |
| Let me know if you'd like to discuss!                    |
|                                                           |
| Best,                                                     |
| John                                                      |
|                                                           |
| Attachments:                                              |
| 📄 Performance_Report_Dec2025_JohnSmith.pdf (245 KB)     |
+----------------------------------------------------------+
|                       [Cancel]  [Send ✓]                 |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

## Report Templates

### Template 1: Performance Summary (Shown Above)

Comprehensive overview of all metrics.

### Template 2: Revenue & Commission Report

```
REVENUE & COMMISSION REPORT
December 2025 • John Smith

REVENUE BREAKDOWN
─────────────────────────────────────────
Placement              Bill Rate  Hours  Revenue   Commission
Alex Rodriguez @ Google  $95/hr   160   $15,200    $1,520
[Future placements...]

TOTAL REVENUE (MONTH): $18,000
COMMISSION EARNED: $1,800 (10% rate)

YEAR TO DATE
Total Revenue: $458,000
Total Commission: $45,800

COMMISSION TIERS
$0 - $300K:     10% ($30,000)
$300K - $500K:  12% ($15,800)
Total: $45,800

NEXT TIER: $500K (12% → 15%)
Remaining: $42,000 to reach
```

### Template 3: Activity Report

```
ACTIVITY REPORT
December 1-5, 2025 • John Smith

COMMUNICATION
Calls Made:        18 (3.6/day) ✅ Above target (3/day)
Emails Sent:       42 (8.4/day) ✅ Above target (5/day)
Client Meetings:   3
Internal Meetings: 3

SOURCING
Candidates Added:  71 (14.2/day) 🟡 Close to target (15/day)
Phone Screens:     23 (4.6/day) 🟡 Close to target (5/day)
LinkedIn Outreach: 94 messages

SUBMISSIONS & INTERVIEWS
Submissions:       8
Interviews:        2 scheduled
Offers:           1 extended

TIME ALLOCATION
Client Activities:  35% (target: 30-40%)
Candidate Activities: 45% (target: 40-50%)
Admin:             10% (target: <15%)
BD/Prospecting:    10% (target: 10-15%)
```

### Template 4: Quality Metrics Report

```
QUALITY METRICS REPORT
Last 30 Days • John Smith

SPEED METRICS
────────────────────────────────
Time-to-Submit:    36 hours ✅ (Target: <48 hours)
  Best: 8 hours (React Dev for Google)
  Worst: 62 hours (DevOps for TechStart) ⚠

Time-to-Fill:      18 days ✅ (Target: <21 days)
  Best: 12 days (Frontend Dev for Meta)
  Worst: 28 days (Senior BE for Google) ⚠

QUALITY METRICS
────────────────────────────────
Submission-to-Interview: 85% ✅ (Target: >70%)
Interview-to-Offer:      42% ✅ (Target: >40%)
Offer Acceptance:        88% ✅ (Target: >85%)

RETENTION
────────────────────────────────
30-Day Retention:  97% ✅ (Target: >95%)
60-Day Retention:  95% ✅ (Target: >90%)
90-Day Retention:  92% ✅ (Target: >90%)

Overall Quality Score: 92/100
Ranking: Top 20% in organization
```

### Template 5: Account Portfolio Report

```
ACCOUNT PORTFOLIO REPORT
December 2025 • John Smith

ACCOUNT HEALTH SUMMARY
────────────────────────────────
Total Accounts: 8
🟢 Healthy: 6 (75%)
🟡 Needs Attention: 1 (13%)
🔴 At Risk: 1 (12%)

REVENUE BY ACCOUNT (MTD)
────────────────────────────────
Google Inc     $8,500   (47%)  NPS: 9  🟢
Meta           $6,200   (34%)  NPS: 8  🟢
TechStart      $2,100   (12%)  NPS: 7  🟡
Others         $1,200   (7%)

ENGAGEMENT METRICS
────────────────────────────────
Avg. Contact Frequency: 1.8x/week
Avg. NPS Score: 7.8/10
Client Satisfaction: 88%
Response Rate: 94%

AT-RISK ACCOUNTS (Action Required)
────────────────────────────────
Acme Corp
  • Last Contact: 18 days ago
  • NPS: 6/10
  • Revenue YTD: $0
  • Action: Schedule check-in call this week
```

### Template 6: Pipeline Analysis Report

```
PIPELINE ANALYSIS REPORT
December 5, 2025 • John Smith

JOBS PIPELINE
────────────────────────────────
Active Jobs:     12
  • Urgent (0-7 days old):      6
  • High (8-14 days):            4
  • Normal (15+ days):           2

Avg. Age:        11 days
Fill Rate:       50% (6 of 12 filled YTD)
Avg. Time-to-Fill: 18 days

CANDIDATES PIPELINE
────────────────────────────────
Total Active:    90 candidates

By Stage:
  New/Sourcing:   23 (26%)
  Screening:      42 (47%)
  Submitted:      15 (17%)
  Interview:      8 (9%)
  Offer:          1 (1%)

CONVERSION RATES
────────────────────────────────
Sourced → Screened:    26%
Screened → Submitted:  35%
Submitted → Interview: 53%
Interview → Offer:     42%
Offer → Placed:        88%

BOTTLENECK ANALYSIS
────────────────────────────────
⚠ Low sourcing-to-screening conversion (26%)
  Recommendation: Improve initial screening criteria

✅ Strong submission-to-interview (53%)
  Keep doing what you're doing!
```

---

## Postconditions

1. ✅ Report generated successfully
2. ✅ Data accurate for selected period
3. ✅ Comparison data shown (if selected)
4. ✅ Report saved for future reference
5. ✅ Report exported/emailed (if requested)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `report.generated` | `{ report_type, user_id, date_range, generated_at }` |
| `report.exported` | `{ report_id, export_format, exported_by }` |
| `report.emailed` | `{ report_id, recipient, sent_at }` |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g` then `r` | Go to reports |
| `n` | New report |
| `p` | Export to PDF |
| `e` | Email report |

---

## Alternative Flows

### A1: Custom Report Builder

For advanced users:
1. Click "Create Custom"
2. Select metrics from library
3. Choose date ranges
4. Add filters
5. Arrange layout
6. Save as template

### A2: Scheduled Reports

Automate recurring reports:
1. Create report as normal
2. Check "Save as recurring"
3. Select frequency (weekly, monthly)
4. Select recipients
5. Report auto-generates and emails

---

## Related Use Cases

- [H03-recruiter-dashboard.md](./H03-recruiter-dashboard.md) - Real-time dashboard
- [H01-daily-workflow.md](./H01-daily-workflow.md) - Daily activities

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Generate monthly report | All sections populated correctly |
| TC-002 | Export to PDF | PDF downloads with all charts |
| TC-003 | Compare to previous period | Comparison data shown accurately |
| TC-004 | Email to manager | Email sent with PDF attachment |
| TC-005 | Custom date range | Data filtered to exact dates |
| TC-006 | No data for period | Report shows zeros, not errors |
| TC-007 | Schedule weekly report | Report auto-generates each Monday |

---

## Backend Processing

### tRPC Procedures

- `reports.generate` - Generate report data
- `reports.export` - Export to PDF/Excel
- `reports.email` - Email report
- `reports.schedule` - Create recurring report

### Report Queries

Complex aggregation queries across:
- `placements` table
- `submissions` table
- `candidates` table
- `jobs` table
- `activities` table
- `accounts` table

Example query for quality metrics:
```sql
WITH placement_metrics AS (
  SELECT
    AVG(EXTRACT(EPOCH FROM (submitted_at - job.created_at)) / 3600)::int AS avg_time_to_submit_hours,
    AVG(EXTRACT(DAY FROM (placed_at - job.created_at)))::int AS avg_time_to_fill_days,
    COUNT(*) FILTER (WHERE status = 'interview') * 100.0 / COUNT(*) AS submission_to_interview_pct,
    COUNT(*) FILTER (WHERE status = 'offer') * 100.0 / COUNT(*) FILTER (WHERE status = 'interview') AS interview_to_offer_pct
  FROM submissions
  WHERE owner_id = $1
    AND created_at BETWEEN $2 AND $3
)
SELECT * FROM placement_metrics;
```

---

*Last Updated: 2025-11-30*
