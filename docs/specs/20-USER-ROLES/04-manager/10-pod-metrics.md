# Use Case: Pod Metrics & Performance Tracking

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-007 |
| Actor | Manager |
| Goal | Track and analyze pod-level KPIs to optimize team performance and identify coaching opportunities |
| Frequency | Daily monitoring, weekly deep dive, monthly reporting |
| Estimated Time | 15 min daily, 1 hour weekly, 2 hours monthly |
| Priority | High (Core management responsibility) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to active pod
3. Pod has at least one IC member
4. Current sprint is active
5. Historical data available (at least 2 sprints)

---

## Trigger

One of the following:
- Manager opens Pod Dashboard (daily routine)
- Weekly metrics review meeting
- Monthly performance reporting cycle
- COO requests pod performance data
- Pod performance drops below threshold (automated alert)

---

## Core Pod Metrics Framework

### 1. Sprint Placement Metrics

**Primary KPI: Placements per Sprint**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **Sprint Placement Count** | Total placements this sprint | `COUNT(placements WHERE sprint_id AND pod_id)` | 1 per IC per sprint | <75% of target |
| **Sprint Completion Rate** | % of sprint target achieved | `(actual_placements / target_placements) * 100` | 100% | <80% |
| **Placement Velocity** | Placements per day | `total_placements / sprint_days_elapsed` | 0.5 per day (10-day sprint) | <0.3 per day |
| **Sprint Trend** | Sprint-over-sprint growth | `(current_sprint - last_sprint) / last_sprint * 100` | +5% growth | -10% decline |

**Screen State:**
```
+------------------------------------------------------------------+
| SPRINT PLACEMENT METRICS - Sprint 24 (Nov 15-29, 2024)          |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Progress: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (3/3) ✅            │ |
| │                                                              │ |
| │ Target: 3 placements (1 per IC)                             │ |
| │ Actual: 3 placements                                        │ |
| │ Status: ON TRACK 🟢                                         │ |
| │ Days Remaining: 3 days                                       │ |
| │ Velocity: 0.5 placements/day (target 0.5) ✅                │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| INDIVIDUAL CONTRIBUTIONS                                          |
| ┌────────────┬─────────────┬──────────┬────────────────────────┐|
| │ IC         │ Sprint Goal │ Actual   │ Status                 ││
| ├────────────┼─────────────┼──────────┼────────────────────────┤|
| │ John Smith │ 1           │ 1 ✅     │ On Track (Day 6)       ││
| │ Mary Jones │ 1           │ 1 ✅     │ On Track (Day 8)       ││
| │ Tom Brown  │ 1           │ 1 ✅     │ On Track (Day 10)      ││
| └────────────┴─────────────┴──────────┴────────────────────────┘|
+------------------------------------------------------------------+
| SPRINT-OVER-SPRINT TREND                                          |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Sprint 22: 2/3 (67%) 🔴                                      │ |
| │ Sprint 23: 3/3 (100%) 🟢                                     │ |
| │ Sprint 24: 3/3 (100%) 🟢 ← Current                          │ |
| │                                                              │ |
| │ Trend: +50% improvement from Sprint 22 ⬆                    │ |
| │ Consistency: 2 consecutive sprints at 100% ✅               │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

---

### 2. Pipeline Health Metrics

**Primary KPI: Pipeline Coverage Ratio**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **Coverage Ratio** | Submissions per active job | `total_submissions / active_jobs` | 3.0 | <1.5 |
| **Active Jobs** | Jobs currently being worked | `COUNT(jobs WHERE status='active' AND pod_id)` | 10-15 per IC | <5 per IC |
| **Active Submissions** | Submissions in pipeline | `COUNT(submissions WHERE status IN ('sourced','screening','submitted','interview'))` | 30-50 per pod | <15 per pod |
| **Stale Job Count** | Jobs with no activity >7 days | `COUNT(jobs WHERE last_activity < NOW() - INTERVAL '7 days')` | 0 | >3 |
| **Pipeline Distribution** | Submissions by stage | `COUNT(*) GROUP BY status` | Balanced funnel | Bottlenecks |

**Screen State:**
```
+------------------------------------------------------------------+
| PIPELINE HEALTH METRICS                                           |
+------------------------------------------------------------------+
| Coverage Ratio: 2.4 submissions/job 🟡 (Target: 3.0)            |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Active Jobs: 30 total                                        │ |
| │ ┌────────────────────────────────────────────────────────┐   │ |
| │ │ No Submissions:   5 jobs 🔴 (17%)                     │   │ |
| │ │ 1-2 Submissions: 12 jobs 🟡 (40%)                     │   │ |
| │ │ 3+ Submissions:  13 jobs 🟢 (43%)                     │   │ |
| │ └────────────────────────────────────────────────────────┘   │ |
| │                                                              │ |
| │ Active Submissions: 72 total                                 │ |
| │ ┌────────────┬───────┬────────────────────────────────────┐ │ |
| │ │ Stage      │ Count │ Progress                           │ │ |
| │ ├────────────┼───────┼────────────────────────────────────┤ │ |
| │ │ Sourced    │  24   │ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ (33%)        │ │ |
| │ │ Screening  │  18   │ ▓▓▓▓▓▓░░░░░░░░░░░░░░ (25%)        │ │ |
| │ │ Submitted  │  15   │ ▓▓▓▓▓░░░░░░░░░░░░░░░ (21%)        │ │ |
| │ │ Interview  │  12   │ ▓▓▓▓░░░░░░░░░░░░░░░░ (17%)        │ │ |
| │ │ Offer      │   3   │ ▓░░░░░░░░░░░░░░░░░░░ (4%)         │ │ |
| │ └────────────┴───────┴────────────────────────────────────┘ │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| STALE JOBS (No activity in 7+ days)                              |
| ┌────────────────────────────┬──────────┬─────────────────────┐ |
| │ Job                        │ Last Act │ Assigned IC         │ |
| ├────────────────────────────┼──────────┼─────────────────────┤ |
| │ Senior Java @ Netflix      │ 12 days  │ John Smith          │ |
| │ React Lead @ Stripe        │ 9 days   │ Mary Jones          │ |
| │ DevOps @ Google            │ 8 days   │ Tom Brown           │ |
| └────────────────────────────┴──────────┴─────────────────────┘ |
|                                                                   |
| ⚠️ Action Required: 3 stale jobs need immediate attention       |
| [Assign Priorities] [Bulk Follow-up] [Close Jobs]               |
+------------------------------------------------------------------+
```

---

### 3. Conversion Rate Metrics

**Primary KPI: Submission-to-Placement Conversion**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **Sourced → Submitted** | % of sourced candidates submitted | `(submitted / sourced) * 100` | 40%+ | <30% |
| **Submitted → Interview** | % of submissions that get interviews | `(interview / submitted) * 100` | 30%+ | <20% |
| **Interview → Offer** | % of interviews that get offers | `(offer / interview) * 100` | 40%+ | <30% |
| **Offer → Placed** | % of offers that convert to placements | `(placed / offer) * 100` | 80%+ | <60% |
| **Overall Conversion** | End-to-end sourced to placed | `(placed / sourced) * 100` | 5%+ | <3% |

**Screen State:**
```
+------------------------------------------------------------------+
| CONVERSION RATE METRICS (Last 30 Days)                           |
+------------------------------------------------------------------+
| Overall Pipeline Efficiency: 6.2% ✅ (Target: 5%+)              |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ FUNNEL VISUALIZATION                                         │ |
| │                                                              │ |
| │ 100 Sourced                                                  │ |
| │   ↓ 42% conversion ✅                                        │ |
| │ 42 Submitted                                                 │ |
| │   ↓ 36% conversion ✅                                        │ |
| │ 15 Interviews                                                │ |
| │   ↓ 47% conversion ✅                                        │ |
| │ 7 Offers                                                     │ |
| │   ↓ 86% conversion ✅                                        │ |
| │ 6 Placements                                                 │ |
| │                                                              │ |
| │ Overall: 6.2% (6 placed / 100 sourced)                      │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| STAGE-BY-STAGE BREAKDOWN                                          |
| ┌────────────────────┬────────┬────────┬────────┬──────────────┐|
| │ Conversion Stage   │ Target │ Actual │ Status │ Trend (vs 30d)││
| ├────────────────────┼────────┼────────┼────────┼──────────────┤|
| │ Sourced → Submit   │ 40%    │ 42%    │ 🟢 +2% │ ⬆ +5%       ││
| │ Submit → Interview │ 30%    │ 36%    │ 🟢 +6% │ ⬆ +3%       ││
| │ Interview → Offer  │ 40%    │ 47%    │ 🟢 +7% │ → Flat      ││
| │ Offer → Placed     │ 80%    │ 86%    │ 🟢 +6% │ ⬆ +8%       ││
| │ Overall (E2E)      │ 5%     │ 6.2%   │ 🟢 +1.2%│ ⬆ +1.5%    ││
| └────────────────────┴────────┴────────┴────────┴──────────────┘|
+------------------------------------------------------------------+
| KEY INSIGHTS                                                      |
| ✅ Strengths:                                                    |
| • Offer acceptance rate is excellent (86% vs 80% target)         |
| • Interview conversion improving (+3% vs last month)             |
| • Overall funnel efficiency above target                         |
|                                                                   |
| 🔍 Areas to Improve:                                             |
| • Interview → Offer conversion flat (not declining, but monitor) |
| • Consider increasing sourcing volume (maintain quality)         |
+------------------------------------------------------------------+
```

---

### 4. IC Performance Comparison

**Primary KPI: Individual vs Pod Average**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **IC Placement Rate** | Placements per sprint (individual) | `COUNT(placements WHERE ic_id AND sprint_id)` | 1 per sprint | 0 in 2 sprints |
| **IC Activity Volume** | Total activities per week | `COUNT(activities WHERE ic_id AND week)` | 20-30 | <15 |
| **IC Submission Rate** | Submissions per week | `COUNT(submissions WHERE ic_id AND week)` | 4-5 | <3 |
| **IC Conversion Rate** | Individual submission-to-placement % | `(placements / submissions) * 100` | 15%+ | <10% |
| **IC vs Pod Avg** | IC performance relative to pod | `ic_metric / pod_avg_metric` | 100% | <80% |

**Screen State:**
```
+------------------------------------------------------------------+
| IC PERFORMANCE COMPARISON - Sprint 24                             |
+------------------------------------------------------------------+
| Pod Average: 1.0 placements/sprint | Pod Benchmark: 1.0 target   |
+------------------------------------------------------------------+
| ┌──────────┬──────────┬───────────┬──────────┬────────────────┐ |
| │ IC       │ Place/Spr│ Submis/Wk │ Conv Rate│ vs Pod Avg     │ |
| ├──────────┼──────────┼───────────┼──────────┼────────────────┤ |
| │ John S.  │ 1.2 🟢   │ 5.1 🟢    │ 18% 🟢   │ +20% ⬆        │ |
| │ Mary J.  │ 0.9 🟡   │ 4.2 🟢    │ 14% 🟢   │ -10% ⬇        │ |
| │ Tom B.   │ 1.1 🟢   │ 3.8 🟡    │ 16% 🟢   │ +10% ⬆        │ |
| │          │          │           │          │                │ |
| │ POD AVG  │ 1.0      │ 4.4       │ 16%      │ -              │ |
| └──────────┴──────────┴───────────┴──────────┴────────────────┘ |
+------------------------------------------------------------------+
| INDIVIDUAL DEEP DIVE (Click IC name for details)                  |
|                                                                   |
| 🟢 Top Performer: John Smith                                     |
| • Placements: 1.2/sprint (20% above pod avg)                     |
| • Submission rate: 5.1/week (leading pod)                        |
| • Conversion: 18% (above target 15%)                             |
| • Strengths: High activity, consistent quality                   |
| • Action: Consider stretch goals, leadership opportunities       |
|                                                                   |
| 🟡 Needs Coaching: Mary Jones                                    |
| • Placements: 0.9/sprint (10% below pod avg)                     |
| • Submission rate: 4.2/week (on target)                          |
| • Conversion: 14% (slightly below target)                        |
| • Concerns: Last 2 sprints at 0.9 (was 1.0 before)               |
| • Action: 1:1 to identify blockers, review pipeline strategy     |
|                                                                   |
| 🟢 Solid Performer: Tom Brown                                    |
| • Placements: 1.1/sprint (10% above pod avg)                     |
| • Submission rate: 3.8/week (slightly below target)              |
| • Conversion: 16% (above target)                                 |
| • Strengths: Quality over quantity approach working              |
| • Action: Maintain current strategy, no changes needed           |
+------------------------------------------------------------------+
```

---

### 5. Revenue & Margin Metrics

**Primary KPI: Pod Revenue Generation**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **Total Revenue** | Sum of all placement margins | `SUM(bill_rate - pay_rate) * hours` | $50K/month | <$30K |
| **Avg Margin per Placement** | Average profit per placement | `AVG(bill_rate - pay_rate)` | $20/hr | <$15/hr |
| **Margin %** | Profit as % of bill rate | `((bill_rate - pay_rate) / bill_rate) * 100` | 20%+ | <15% |
| **Revenue per IC** | Revenue per team member | `total_revenue / ic_count` | $15K/month | <$10K |
| **Utilization Rate** | % of active placements | `active_placements / total_consultants` | 80%+ | <60% |

**Screen State:**
```
+------------------------------------------------------------------+
| REVENUE & MARGIN METRICS - November 2024                         |
+------------------------------------------------------------------+
| Total Pod Revenue: $62,400 🟢 (Target: $50K) [+24%]             |
| Active Placements: 12 placements                                 |
| Avg Margin: $21.50/hr 🟢 (Target: $20/hr)                       |
| Avg Margin %: 22.3% 🟢 (Target: 20%)                            |
+------------------------------------------------------------------+
| PLACEMENT BREAKDOWN                                               |
| ┌──────────────────┬─────────┬─────────┬────────┬───────────────┐|
| │ Placement        │ Bill/hr │ Pay/hr  │ Margin │ Monthly Rev   ││
| ├──────────────────┼─────────┼─────────┼────────┼───────────────┤|
| │ Kevin @ Oracle   │ $95     │ $75     │ $20    │ $3,200 (160h) ││
| │ Sarah @ MSFT     │ $110    │ $85     │ $25    │ $4,000 (160h) ││
| │ Mike @ Amazon    │ $100    │ $78     │ $22    │ $3,520 (160h) ││
| │ ... (9 more)     │ ...     │ ...     │ ...    │ ...           ││
| │                  │         │         │        │               ││
| │ TOTALS           │ -       │ -       │ Avg$21 │ $62,400       ││
| └──────────────────┴─────────┴─────────┴────────┴───────────────┘|
+------------------------------------------------------------------+
| REVENUE TREND (Last 6 Months)                                     |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Jun: $42K  Jul: $48K  Aug: $51K  Sep: $55K  Oct: $58K       │ |
| │ Nov: $62K ⬆ (+7% vs Oct, +48% vs Jun)                       │ |
| │                                                              │ |
| │ Trajectory: 📈 Consistent growth for 6 months                │ |
| │ Forecast Dec: $65K (projected based on current pipeline)    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| REVENUE PER IC                                                    |
| ┌────────────┬──────────────┬─────────────┬───────────────────┐ |
| │ IC         │ Placements   │ Monthly Rev │ vs Target ($15K)  │ |
| ├────────────┼──────────────┼─────────────┼───────────────────┤ |
| │ John Smith │ 5 active     │ $22,100     │ +47% 🟢          │ |
| │ Mary Jones │ 4 active     │ $18,200     │ +21% 🟢          │ |
| │ Tom Brown  │ 3 active     │ $22,100     │ +47% 🟢          │ |
| └────────────┴──────────────┴─────────────┴───────────────────┘ |
+------------------------------------------------------------------+
| MARGIN QUALITY ANALYSIS                                           |
| ✅ High Margin (>$25/hr): 4 placements (33%)                    |
| 🟢 Target Margin ($20-25/hr): 6 placements (50%)                |
| 🟡 Low Margin ($15-20/hr): 2 placements (17%)                   |
| 🔴 Negative Margin (<$15/hr): 0 placements (0%) ✅              |
|                                                                   |
| 💡 Insight: 83% of placements at or above target margin         |
| 🎯 Action: Continue targeting high-margin opportunities         |
+------------------------------------------------------------------+
```

---

### 6. Client Satisfaction Metrics

**Primary KPI: Net Promoter Score (NPS)**

| Metric | Description | Calculation | Target | Alert Threshold |
|--------|-------------|-------------|--------|-----------------|
| **NPS Score** | Client loyalty measurement | `% Promoters - % Detractors` | >50 | <30 |
| **Client Feedback Avg** | Average rating (1-5 scale) | `AVG(client_feedback_score)` | 4.0+ | <3.5 |
| **Response Time Avg** | Avg time to respond to client | `AVG(first_response_time)` | <4 hours | >8 hours |
| **Client Retention Rate** | % of clients retained quarter-over-quarter | `(retained_clients / total_clients) * 100` | 90%+ | <80% |
| **Escalation Rate** | % of placements that escalate | `(escalations / total_placements) * 100` | <5% | >10% |

**Screen State:**
```
+------------------------------------------------------------------+
| CLIENT SATISFACTION METRICS - Q4 2024                             |
+------------------------------------------------------------------+
| NPS Score: 62 🟢 (Target: >50) [Excellent]                      |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ NPS BREAKDOWN                                                │ |
| │                                                              │ |
| │ Promoters (9-10): 18 clients (72%) ████████████████████████ │ |
| │ Passives (7-8):    5 clients (20%) ██████                   │ |
| │ Detractors (0-6):  2 clients (8%)  ██                       │ |
| │                                                              │ |
| │ NPS = 72% - 8% = 64 (Excellent!)                            │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| CLIENT FEEDBACK (1-5 Star Ratings)                               |
| ┌────────────────────┬────────┬────────────────────────────────┐|
| │ Category           │ Avg    │ Rating                         ││
| ├────────────────────┼────────┼────────────────────────────────┤|
| │ Candidate Quality  │ 4.6/5  │ ★★★★★ ✅                      ││
| │ Communication      │ 4.3/5  │ ★★★★☆ 🟢                      ││
| │ Response Time      │ 4.1/5  │ ★★★★☆ 🟢                      ││
| │ Professionalism    │ 4.7/5  │ ★★★★★ ✅                      ││
| │ Overall Experience │ 4.4/5  │ ★★★★☆ ✅                      ││
| └────────────────────┴────────┴────────────────────────────────┘|
+------------------------------------------------------------------+
| RECENT CLIENT FEEDBACK (Last 10)                                  |
| ┌──────────────────┬──────┬────────────────────────────────────┐|
| │ Client           │ Stars│ Comment                            ││
| ├──────────────────┼──────┼────────────────────────────────────┤|
| │ Google Inc.      │ 5/5  │ "Excellent candidate (Sarah Chen)" ││
| │ Microsoft        │ 4/5  │ "Good fit, took longer than hoped" ││
| │ Oracle           │ 5/5  │ "Kevin is exceeding expectations"  ││
| │ Salesforce       │ 5/5  │ "Top-tier talent, great service"   ││
| │ Amazon           │ 3/5  │ "Candidate OK, communication slow" ││
| │ ... (5 more)     │ ...  │ ...                                ││
| └──────────────────┴──────┴────────────────────────────────────┘|
|                                                                   |
| ⚠️ Action Required: Amazon feedback (3/5) - Follow up needed    |
+------------------------------------------------------------------+
| CLIENT RETENTION                                                  |
| Q3 2024: 22 active clients                                       |
| Q4 2024: 21 active clients (1 lost, 0 new)                      |
| Retention Rate: 95% 🟢 (Target: 90%+)                           |
|                                                                   |
| Lost Client: TechCorp (moved in-house recruiting)                |
| Action: Pipeline 3 new clients for Q1 to grow base               |
+------------------------------------------------------------------+
```

---

## Metrics Dashboard Layouts

### Daily Manager View (Quick Glance)

**Screen State:**
```
+------------------------------------------------------------------+
| POD METRICS DASHBOARD - Daily View                                |
+------------------------------------------------------------------+
| Sprint 24: Day 11/14                  Pod: Recruiting Pod A       |
+------------------------------------------------------------------+
| ┌─────────────┬──────────────┬──────────────┬──────────────────┐|
| │ PLACEMENTS  │ PIPELINE     │ ACTIVITY     │ CLIENT SAT       ││
| │             │              │              │                  ││
| │     3/3     │   Coverage   │ Activities   │  NPS: 62        ││
| │     ✅      │   2.4x 🟡   │   92 ✅     │  ★★★★☆         ││
| │             │              │              │                  ││
| │ On Track    │ Needs Work   │ Above Avg    │ Excellent        ││
| └─────────────┴──────────────┴──────────────┴──────────────────┘|
+------------------------------------------------------------------+
| 🔔 ALERTS & ACTIONS                                              |
| • 🟡 Pipeline coverage at 2.4 (target 3.0) - Need more sourcing |
| • 🔴 3 stale jobs (>7 days) - Assign follow-ups                 |
| • 🟢 On track to hit sprint goal                                |
+------------------------------------------------------------------+
| [View Detailed Metrics] [Export Report] [Schedule Review Meeting]|
+------------------------------------------------------------------+
```

---

### Weekly Deep Dive View (Comprehensive Analysis)

**Screen State:**
```
+------------------------------------------------------------------+
| POD METRICS - Weekly Deep Dive (Nov 22-29, 2024)                 |
+------------------------------------------------------------------+
| [Sprint] [Pipeline] [Conversions] [ICs] [Revenue] [Clients]     |
+------------------------------------------------------------------+
| SPRINT PROGRESS                                                   |
| • Goal: 3 placements | Actual: 3 | Status: ✅ On Track          |
| • Velocity: 0.5/day (target met)                                 |
| • Trend: 2 consecutive 100% sprints                              |
|                                                                   |
| PIPELINE HEALTH                                                   |
| • Coverage: 2.4 (need 0.6 improvement to hit 3.0 target)         |
| • Stale Jobs: 3 (action required)                                |
| • Funnel: Balanced (no major bottlenecks)                        |
|                                                                   |
| CONVERSION RATES                                                  |
| • Sourced→Submit: 42% ✅ | Submit→Interview: 36% ✅            |
| • Interview→Offer: 47% ✅ | Offer→Placed: 86% ✅               |
| • Overall: 6.2% ✅ (above target)                               |
|                                                                   |
| IC PERFORMANCE                                                    |
| • John: 🟢 Leading (1.2 placements, 20% above avg)             |
| • Mary: 🟡 Needs coaching (0.9 placements, trending down)       |
| • Tom: 🟢 Solid (1.1 placements, quality approach)              |
|                                                                   |
| REVENUE                                                           |
| • Total: $62.4K ✅ (+24% vs target)                             |
| • Margin: $21.50/hr ✅ (above target)                           |
| • Trend: 6-month growth streak                                   |
|                                                                   |
| CLIENT SATISFACTION                                               |
| • NPS: 62 ✅ (Excellent)                                        |
| • Feedback: 4.4/5 ✅                                            |
| • Retention: 95% ✅                                             |
| • Escalations: 2% ✅ (well below 5% threshold)                  |
+------------------------------------------------------------------+
| KEY INSIGHTS & ACTIONS                                            |
| ✅ Strengths: Sprint consistency, revenue growth, client sat     |
| 🔍 Focus Areas: Pipeline coverage, Mary's performance decline    |
| 🎯 Next Week Actions:                                            |
|   1. Increase sourcing activity (target: 20 new candidates)      |
|   2. 1:1 with Mary - identify blockers, create action plan       |
|   3. Follow up on 3 stale jobs (reassign if needed)              |
|   4. Maintain quality - conversion rates are excellent           |
+------------------------------------------------------------------+
```

---

## Metric Alerts & Thresholds

### Auto-Alert System

| Alert Type | Condition | Notification | Action Required |
|------------|-----------|--------------|-----------------|
| **Critical: Sprint at Risk** | <50% of target with <3 days left | Manager (SMS), COO (Email) | Immediate intervention |
| **High: Pipeline Weak** | Coverage <1.5 for 3+ days | Manager (In-app, Email) | Increase sourcing |
| **Medium: IC Underperforming** | 0 placements 2 sprints in a row | Manager (In-app) | 1:1 coaching |
| **Low: Stale Jobs** | >5 jobs with no activity 7+ days | Manager (In-app) | Review and reassign |
| **Info: Milestone Hit** | Sprint goal achieved | Manager, COO, ICs (In-app) | Celebrate! |

---

## Reporting Cadence

### Daily (5-10 min)
- Sprint progress check
- Escalation review
- Stale job identification

### Weekly (30-60 min)
- Deep dive into all metrics
- IC performance comparison
- Pipeline health analysis
- Action planning for next week

### Monthly (2-3 hours)
- Revenue and margin analysis
- Client satisfaction review
- Trend analysis (3-month rolling)
- Executive reporting to COO/CEO

### Quarterly (4-6 hours)
- Comprehensive performance review
- IC development planning
- Goal setting for next quarter
- Strategic planning

---

## Related Use Cases

- [02-pod-dashboard.md](./02-pod-dashboard.md) - Primary interface for viewing metrics
- [08-coaching-workflow.md](./08-coaching-workflow.md) - Metrics inform 1:1 coaching
- [06-sprint-planning.md](./06-sprint-planning.md) - Metrics drive sprint goal setting

---

*Last Updated: 2024-11-30*
