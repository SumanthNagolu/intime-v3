# Use Case: Bench Sales Reports and Analytics

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-021 |
| Actor | Bench Sales Recruiter (Self), Bench Sales Manager (Team), Executive (Org) |
| Goal | Analyze performance, identify trends, make data-driven decisions |
| Frequency | Weekly (individual), Monthly (team review), Quarterly (strategic planning) |
| Estimated Time | 10-20 minutes per report |
| Priority | Medium (Performance management and planning) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter, Manager, or Executive
2. Historical data exists (minimum 30 days for meaningful reports)
3. User has permission to view reports for their scope (self/team/org)
4. Metrics and KPIs are configured in system

---

## Trigger

One of the following:
- Weekly performance review (every Monday)
- Monthly team review meeting
- Quarterly business review (QBR)
- Manager requests report for 1:1 or performance evaluation
- User wants to track progress toward goals
- Executive requests bench operations analysis
- Budget planning or capacity forecasting needed

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Reports Section

**User Action:** User clicks "Reports" in sidebar or navigates from Dashboard

**System Response:**
- Loads Bench Sales Reports hub
- Shows available report categories
- Displays recent reports and favorites

**URL:** `/employee/workspace/bench/reports`

**Time:** ~1 second

---

### Step 2: View Reports Hub

**System Display:**

```
+------------------------------------------------------------------+
|  Bench Sales Reports & Analytics                 [Export] [Help] |
+------------------------------------------------------------------+
| Analyze performance, track trends, and make data-driven decisions |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Quick Reports                                               │   |
| │                                                             │   |
| │ [📊 My Weekly Summary]        [📈 Team Performance]         │   |
| │ [💰 Revenue Report]           [👥 Bench Utilization]        │   |
| │ [📋 Submission Analytics]     [🎯 Goal Progress]            │   |
| │ [🔄 Placement Pipeline]       [⚠️ At-Risk Analysis]         │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Report Categories                                                 |
+------------------------------------------------------------------+
|                                                                   |
| 📊 PERFORMANCE REPORTS                                            |
| • Individual Performance Summary (weekly/monthly/quarterly)       |
| • Team Performance Comparison                                    |
| • Goal Progress Tracking                                         |
| • KPI Trends and Forecasting                                     |
|                                                                   |
| 💰 FINANCIAL REPORTS                                              |
| • Revenue and Margin Analysis                                    |
| • Commission Summary                                             |
| • Vendor Payment Tracking                                        |
| • Profitability by Placement                                     |
|                                                                   |
| 👥 BENCH OPERATIONS REPORTS                                       |
| • Bench Utilization Trends                                       |
| • Consultant Tenure on Bench                                     |
| • Placement Success Rate                                         |
| • Days to Placement Analysis                                     |
|                                                                   |
| 📋 SUBMISSION & PIPELINE REPORTS                                  |
| • Submission Funnel Conversion                                   |
| • Pipeline Velocity Analysis                                     |
| • Source Effectiveness (vendor vs direct)                        |
| • Interview to Placement Ratio                                   |
|                                                                   |
| 📧 MARKETING REPORTS                                              |
| • Hotlist Performance Analytics                                  |
| • Vendor Response Rates                                          |
| • Marketing Campaign ROI                                         |
| • Email Engagement Metrics                                       |
|                                                                   |
| 🛂 IMMIGRATION & COMPLIANCE                                       |
| • Visa Status Summary                                            |
| • Immigration Alert Dashboard                                    |
| • Compliance Audit Report                                        |
| • Work Authorization Expiry Forecast                             |
|                                                                   |
| 🎯 STRATEGIC PLANNING                                             |
| • Capacity Planning                                              |
| • Skill Gap Analysis                                             |
| • Market Demand Trends                                           |
| • Competitive Positioning                                        |
|                                                                   |
+------------------------------------------------------------------+
| Recent Reports:                                                   |
| • My Weekly Summary (11/25 - 12/01) - Generated 12/02           |
| • Team Performance - November 2024 - Generated 12/01             |
| • Bench Utilization Trends Q4 2024 - Generated 11/28             |
+------------------------------------------------------------------+
```

**Report Categories:**
1. **Performance**: Individual and team KPIs
2. **Financial**: Revenue, margins, commission
3. **Bench Operations**: Utilization, placement success
4. **Submission & Pipeline**: Conversion rates, velocity
5. **Marketing**: Campaign effectiveness
6. **Immigration**: Compliance tracking
7. **Strategic**: Planning and forecasting

**Time:** ~30 seconds to review

---

### Step 3: Generate Individual Performance Report

**User Action:** Click "Individual Performance Summary"

**System Response:**
- Opens report configuration screen
- Allows user to select parameters

**Report Configuration:**

```
+------------------------------------------------------------------+
|  Individual Performance Summary - Configure Report          [×]  |
+------------------------------------------------------------------+
|                                                                   |
| Report Period: *                                                  |
| ● This Week (11/25 - 12/01)                                      |
| ○ Last Week (11/18 - 11/24)                                      |
| ○ This Month (November 2024)                                     |
| ○ Last Month (October 2024)                                      |
| ○ This Quarter (Q4 2024)                                         |
| ○ Custom Range:  [Start Date  ] to [End Date  ]                 |
|                                                                   |
| Benchmark Against:                                                |
| ☑ My goals                                                       |
| ☑ Team average                                                   |
| ☑ Organization average                                           |
| ☑ Industry benchmarks                                            |
|                                                                   |
| Include Sections:                                                 |
| ☑ Executive Summary                                              |
| ☑ Key Metrics (Placements, Submissions, Marketing)               |
| ☑ Bench Consultant Performance                                   |
| ☑ Placement Health & Retention                                   |
| ☑ Revenue & Commission                                           |
| ☑ Goal Progress                                                  |
| ☑ Trend Analysis                                                 |
| ☑ Recommendations & Action Items                                 |
|                                                                   |
| Output Format:                                                    |
| ● PDF (printable)                                                |
| ○ Excel (data analysis)                                          |
| ○ PowerPoint (presentation)                                      |
| ○ Interactive Web View                                           |
|                                                                   |
+------------------------------------------------------------------+
|                              [Cancel]  [Generate Report →]       |
+------------------------------------------------------------------+
```

**User Action:** Click "Generate Report →"

**System Response:**
- Generates report (processing time: 5-10 seconds)
- Displays report preview
- Provides download and share options

**Time:** ~5 seconds to generate

---

### Step 4: View Individual Performance Report

**System Display:**

```
+------------------------------------------------------------------+
|                 INDIVIDUAL PERFORMANCE SUMMARY                    |
|                   Week of November 25 - December 1, 2024         |
+------------------------------------------------------------------+
|                                                                   |
| Bench Sales Recruiter: Alex Thompson                             |
| Team: Bench Sales - Team Alpha                                   |
| Manager: Sarah Williams                                          |
| Report Generated: December 2, 2024 at 9:15 AM                    |
|                                                                   |
+------------------------------------------------------------------+
| EXECUTIVE SUMMARY                                                 |
+------------------------------------------------------------------+
|                                                                   |
| Overall Performance: 🟡 MEETS EXPECTATIONS (87/100)              |
|                                                                   |
| Highlights:                                                       |
| ✅ Strong marketing activity (3 hotlists, 16% response rate)     |
| ✅ Good submission volume (18 subs, 90% of goal)                 |
| ✅ All placements healthy (4/4 good standing)                    |
| ⚠️  Below placement goal (0 placements this week, goal: 0.5)     |
| ⚠️  Bench utilization above target (28% vs 25% goal)             |
|                                                                   |
| Key Recommendations:                                              |
| 1. Accelerate pipeline - convert interviews to offers            |
| 2. Focus on orange bench consultants (2 over 30 days)            |
| 3. Maintain strong marketing momentum                            |
|                                                                   |
+------------------------------------------------------------------+
| KEY METRICS vs GOALS                                              |
+------------------------------------------------------------------+
| Metric                    | Actual  | Goal    | % of Goal | Status |
|---------------------------|---------|---------|-----------|--------|
| Placements                | 0       | 0.5/wk  | 0%        | 🔴     |
| Bench Submissions         | 18      | 20/wk   | 90%       | 🟡     |
| Vendor Submissions        | 9       | 10/wk   | 90%       | 🟡     |
| Hotlists Sent             | 3       | 3/wk    | 100%      | ✅     |
| Marketing Response Rate   | 16%     | >15%    | 107%      | ✅     |
| Active Placements         | 4       | -       | -         | ✅     |
| Placement Health Avg      | 87.5%   | >80%    | 109%      | ✅     |
| Avg Days on Bench         | 35      | <30 days| -         | 🔴     |
| Bench Utilization         | 28%     | <25%    | -         | 🔴     |
| Immigration Compliance    | 100%    | 100%    | 100%      | ✅     |
+------------------------------------------------------------------+
| Status Key: ✅ Exceeding (>100%) | 🟡 Meeting (80-100%) | 🔴 Below (<80%)|
+------------------------------------------------------------------+
|                                                                   |
+------------------------------------------------------------------+
| TREND ANALYSIS (Last 4 Weeks)                                     |
+------------------------------------------------------------------+
|                                                                   |
| Placements:       0 → 1 → 0 → 0  (Trend: ↓ Declining)            |
| Submissions:     15 → 20 → 17 → 18  (Trend: → Stable)            |
| Bench Size:       8 → 7 → 7 → 6  (Trend: ↓ Improving)            |
| Avg Days on Bench: 42 → 38 → 36 → 35  (Trend: ↓ Improving)       |
| Marketing Response: 12% → 14% → 15% → 16%  (Trend: ↑ Improving)  |
|                                                                   |
| Visual Trend:                                                     |
|                                                                   |
| Placements (Last 8 Weeks):                                        |
| 2 |     ●                                                          |
| 1 | ●       ●                                                      |
| 0 |             ●   ●   ●   ●   ●   ●                             |
|   └─────────────────────────────────────                         |
|     W1  W2  W3  W4  W5  W6  W7  W8                               |
|                                                                   |
| Submissions (Last 8 Weeks):                                       |
| 25|                 ●                                             |
| 20|         ●           ●       ●                                 |
| 15| ●   ●                   ●       ●                             |
| 10|                                                               |
|   └─────────────────────────────────────                         |
|     W1  W2  W3  W4  W5  W6  W7  W8                               |
|                                                                   |
+------------------------------------------------------------------+
| BENCH CONSULTANT PERFORMANCE                                      |
+------------------------------------------------------------------+
|                                                                   |
| Consultants Assigned: 6                                           |
| • On Bench: 6 (100%)                                              |
| • Placed This Week: 0                                             |
| • At Risk: 0                                                      |
|                                                                   |
| Consultant Breakdown:                                             |
|                                                                   |
| 🟠 ORANGE (31+ days): 2 consultants                              |
| • Rajesh Kumar - 42 days (2 active subs, interview this week)    |
| • John Smith - 35 days (1 active sub, needs more opportunities)  |
|                                                                   |
| 🟢 GREEN (0-30 days): 4 consultants                              |
| • Priya Sharma - 18 days (3 active subs, strong pipeline)        |
| • David Lee - 22 days (2 active subs, 1 interview scheduled)     |
| • Maria Garcia - 15 days (1 active sub, immigration alert!)      |
| • Ahmed Ali - 8 days (1 active sub, new to bench)                |
|                                                                   |
| Average Days on Bench: 35 days                                    |
| Longest on Bench: Rajesh Kumar (42 days)                         |
| Newest on Bench: Ahmed Ali (8 days)                              |
|                                                                   |
+------------------------------------------------------------------+
| ACTIVE PLACEMENTS (4 Total)                                       |
+------------------------------------------------------------------+
|                                                                   |
| Placement Health: 🟢 87.5% Average (All Healthy)                 |
|                                                                   |
| 1. Sarah Johnson @ Capital One - 🟢 Healthy (90%)                |
|    • Bill Rate: $90/hr | Duration: 70 days                       |
|    • Last Check-in: 11/15 (on schedule)                          |
|    • Status: Stable, on track for extension                      |
|                                                                   |
| 2. Priya Sharma @ Google - 🟢 Healthy (95%)                      |
|    • Bill Rate: $110/hr | Duration: 113 days                     |
|    • Last Check-in: 11/20 (on schedule)                          |
|    • Status: Extension confirmed (6 months)                      |
|                                                                   |
| 3. Michael Brown @ Amazon - 🟡 Needs Attention (75%)             |
|    • Bill Rate: $85/hr | Duration: 34 days                       |
|    • Last Check-in: OVERDUE (30-day milestone)                   |
|    • Status: Check-in needed ASAP                                |
|                                                                   |
| 4. Lisa Wong @ Uber - 🟢 Healthy (90%)                           |
|    • Bill Rate: $95/hr | Duration: 16 days                       |
|    • Last Check-in: 11/28 (on schedule)                          |
|    • Status: New placement, onboarding well                      |
|                                                                   |
| Total Monthly Revenue: $66,600                                    |
| Average Placement Duration: 58 days                              |
| Retention Rate: 100% (no early terminations)                     |
|                                                                   |
+------------------------------------------------------------------+
| SUBMISSION & PIPELINE ANALYSIS                                    |
+------------------------------------------------------------------+
|                                                                   |
| This Week:                                                        |
| • Total Submissions: 18 (Goal: 20)                               |
|   - Bench Submissions: 18                                        |
|   - Vendor Submissions: 9                                        |
|                                                                   |
| Pipeline Status (23 Active):                                      |
| • Submitted: 10                                                  |
| • Vendor Review: 6                                               |
| • Client Review: 2                                               |
| • Interview: 5 (2 scheduled this week)                           |
| • Offer: 2 (negotiating)                                         |
|                                                                   |
| Conversion Rates:                                                 |
| • Submitted → Interview: 22% (Industry: 20%)                     |
| • Interview → Offer: 40% (Industry: 35%)                         |
| • Offer → Placement: 100% (Industry: 85%)                        |
| • Overall Submission → Placement: 8.8% (Industry: 4-5%) ✅       |
|                                                                   |
| Top Sources:                                                      |
| 1. Dice.com - 6 submissions (33%)                                |
| 2. Vendor (TechStaff) - 4 submissions (22%)                      |
| 3. LinkedIn - 3 submissions (17%)                                |
| 4. Vendor (Global IT) - 3 submissions (17%)                      |
| 5. Indeed - 2 submissions (11%)                                  |
|                                                                   |
+------------------------------------------------------------------+
| MARKETING ACTIVITY                                                |
+------------------------------------------------------------------+
|                                                                   |
| Hotlists Sent: 3 (Goal: 3) ✅                                    |
|                                                                   |
| Campaign Performance:                                             |
| 1. Java/.NET Developers (11/25) - 247 vendors                    |
|    • Open Rate: 45% (Industry: 35%)                              |
|    • Click Rate: 19% (Industry: 12%)                             |
|    • Response Rate: 9%                                           |
|    • Submissions Generated: 7                                    |
|                                                                   |
| 2. React/Frontend (11/26) - 198 vendors                          |
|    • Open Rate: 44%                                              |
|    • Click Rate: 16%                                             |
|    • Response Rate: 7%                                           |
|    • Submissions Generated: 4                                    |
|                                                                   |
| 3. DevOps/Cloud (11/27) - 135 vendors                            |
|    • Open Rate: 38%                                              |
|    • Click Rate: 14%                                             |
|    • Response Rate: 6%                                           |
|    • Submissions Generated: 3                                    |
|                                                                   |
| Overall Marketing Stats:                                          |
| • Total Recipients: 580 vendors                                  |
| • Average Open Rate: 42% (vs Industry: 35%) ✅                   |
| • Average Click Rate: 16% (vs Industry: 12%) ✅                  |
| • Average Response Rate: 7.3%                                    |
| • Total Submissions Generated: 14                                |
| • Marketing ROI: 78% (14 subs / 18 total subs)                   |
|                                                                   |
| Other Marketing Activity:                                         |
| • Vendor Calls: 18                                               |
| • LinkedIn Messages: 34                                          |
| • Vendor Meetings: 2                                             |
|                                                                   |
+------------------------------------------------------------------+
| REVENUE & FINANCIAL SUMMARY                                       |
+------------------------------------------------------------------+
|                                                                   |
| Active Placement Revenue: $66,600/month                          |
|                                                                   |
| Breakdown by Placement:                                           |
| • Sarah Johnson: $15,600/mo (23.4% margin)                       |
| • Priya Sharma: $19,360/mo (24.1% margin)                        |
| • Michael Brown: $14,960/mo (21.8% margin)                       |
| • Lisa Wong: $16,680/mo (22.7% margin)                           |
|                                                                   |
| Average Margin: 23.0% (Goal: >22%) ✅                            |
|                                                                   |
| Vendor Commission: $2,840/month                                  |
| Net Margin: $12,760/month                                        |
|                                                                   |
| Year-to-Date Performance:                                         |
| • Total Revenue: $598,400                                        |
| • Total Placements: 14                                           |
| • Average Placement Value: $42,743                               |
| • Average Margin: 22.8%                                          |
|                                                                   |
| Projected Annual Revenue: $799,200 (on track)                    |
|                                                                   |
+------------------------------------------------------------------+
| IMMIGRATION & COMPLIANCE                                          |
+------------------------------------------------------------------+
|                                                                   |
| Compliance Status: ✅ 100% (No violations)                       |
|                                                                   |
| Active Consultants: 10 (6 bench + 4 placed)                      |
|                                                                   |
| Visa Status Breakdown:                                            |
| • 🟢 GREEN (>180 days): 6 consultants                            |
| • 🟡 YELLOW (90-180 days): 3 consultants                         |
| • 🟠 ORANGE (30-90 days): 1 consultant                           |
| • 🔴 RED (<30 days): 0 consultants                               |
| • ⚫ BLACK (Expired): 0 consultants                              |
|                                                                   |
| ⚠️  ALERT: Maria Garcia - H1B expires in 28 days                 |
| Action Required: File H1B extension immediately                  |
|                                                                   |
+------------------------------------------------------------------+
| RECOMMENDATIONS & ACTION ITEMS                                    |
+------------------------------------------------------------------+
|                                                                   |
| HIGH PRIORITY (This Week):                                        |
| 1. Complete Michael Brown 30-day check-in (OVERDUE)              |
| 2. Coordinate Maria Garcia H1B extension with HR (URGENT)        |
| 3. Push 2 pending offers to close (potential placements)         |
| 4. Focus on Rajesh Kumar & John Smith (orange bench, 31+ days)   |
|                                                                   |
| MEDIUM PRIORITY (Next 2 Weeks):                                   |
| 5. Increase submission volume to hit 20/week goal consistently   |
| 6. Follow up on 5 pending vendor responses                       |
| 7. Schedule contract extension discussion for Priya Sharma       |
| 8. Review and refresh consultant profiles (update skills/rates)  |
|                                                                   |
| LONG-TERM FOCUS (This Month):                                     |
| 9. Reduce bench utilization from 28% to <25% target              |
| 10. Reduce avg days on bench from 35 to <30 days                 |
| 11. Maintain strong marketing performance (>15% response rate)   |
| 12. Achieve 2 placements in December to meet monthly goal        |
|                                                                   |
+------------------------------------------------------------------+
| COMPARATIVE ANALYSIS                                              |
+------------------------------------------------------------------+
|                                                                   |
| vs Team Average:                                                  |
| • Placements: You: 0 | Team: 0.3/wk (Below avg)                  |
| • Submissions: You: 18 | Team: 16/wk (Above avg) ✅              |
| • Marketing Response: You: 16% | Team: 13% (Above avg) ✅        |
| • Avg Days on Bench: You: 35 | Team: 32 (Below avg)              |
|                                                                   |
| vs Organization:                                                  |
| • Placement Margin: You: 23.0% | Org: 21.5% (Above avg) ✅       |
| • Bench Utilization: You: 28% | Org: 26% (Below avg)             |
| • Retention Rate: You: 100% | Org: 88% (Above avg) ✅            |
|                                                                   |
| Ranking (within team of 12):                                      |
| • Overall Performance: #5 (Top 42%)                              |
| • Submissions: #3 (Top 25%)                                      |
| • Placements: #8 (Top 67%)                                       |
| • Marketing: #2 (Top 17%) ✅                                     |
| • Bench Utilization: #7 (Top 58%)                                |
|                                                                   |
+------------------------------------------------------------------+
| QUARTERLY GOAL PROGRESS (Q4 2024)                                 |
+------------------------------------------------------------------+
|                                                                   |
| Placement Goal: 6 placements/quarter                             |
| Progress: 4 / 6 (67%) - 2 weeks remaining                        |
| Status: 🟡 At risk - Need 2 placements in 2 weeks                |
|                                                                   |
| Revenue Goal: $500k/quarter                                      |
| Progress: $398k / $500k (80%) - On track                         |
| Status: 🟢 Likely to achieve with current placements             |
|                                                                   |
| Bench Reduction Goal: <25% utilization                           |
| Current: 28%                                                     |
| Status: 🔴 Behind - Need to place 2 more consultants             |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| Report Generated: December 2, 2024 at 9:15 AM                    |
| Next Report: December 9, 2024 (weekly)                           |
|                                                                   |
| [Download PDF] [Export to Excel] [Share via Email] [Schedule]   |
+------------------------------------------------------------------+
```

**Report Sections:**
1. **Executive Summary**: High-level overview
2. **Key Metrics**: Performance vs goals
3. **Trend Analysis**: Historical patterns
4. **Bench Consultant Performance**: Individual consultant status
5. **Active Placements**: Placement health
6. **Submission & Pipeline**: Conversion metrics
7. **Marketing Activity**: Campaign performance
8. **Revenue & Financial**: Financial summary
9. **Immigration & Compliance**: Visa tracking
10. **Recommendations**: Actionable next steps
11. **Comparative Analysis**: Benchmarking
12. **Quarterly Goal Progress**: Long-term tracking

**Time:** ~10-15 minutes to review

---

### Step 5: Generate Team Performance Report (Manager View)

**User Action:** Manager clicks "Team Performance Comparison"

**System Response:**
- Opens team report configuration
- Allows selection of team members and metrics

**Team Report Preview:**

```
+------------------------------------------------------------------+
|            TEAM PERFORMANCE COMPARISON - NOVEMBER 2024            |
+------------------------------------------------------------------+
| Team: Bench Sales - Team Alpha                                   |
| Manager: Sarah Williams                                          |
| Team Size: 12 Bench Sales Recruiters                             |
| Report Period: November 1-30, 2024                               |
+------------------------------------------------------------------+
|                                                                   |
| TEAM SUMMARY                                                      |
+------------------------------------------------------------------+
| Overall Team Performance: 🟢 EXCEEDING EXPECTATIONS (92/100)     |
|                                                                   |
| Total Team Metrics:                                               |
| • Placements: 18 (Goal: 24) - 75% ✅                             |
| • Total Bench: 72 consultants                                    |
| • Avg Days on Bench: 32 days (Goal: <30) 🟡                     |
| • Team Bench Utilization: 26% (Goal: <25%) 🟡                   |
| • Total Revenue: $1.2M/month                                     |
| • Average Margin: 22.3% (Goal: >22%) ✅                          |
|                                                                   |
+------------------------------------------------------------------+
| INDIVIDUAL PERFORMANCE SCORECARDS                                 |
+------------------------------------------------------------------+
| Rank | Name            | Placements | Subs/wk | Bench | Score   |
|------|-----------------|------------|---------|-------|---------|
| 1    | Emily Chen      | 3          | 25      | 4     | 98 🥇  |
| 2    | Michael Torres  | 2          | 23      | 5     | 95 🥈  |
| 3    | Alex Thompson   | 1          | 18      | 6     | 87 🥉  |
| 4    | Jessica Lee     | 2          | 19      | 7     | 86      |
| 5    | David Park      | 1          | 22      | 5     | 85      |
| 6    | Rachel Kim      | 2          | 17      | 6     | 84      |
| 7    | James Wilson    | 1          | 20      | 8     | 82      |
| 8    | Lisa Martinez   | 1          | 16      | 7     | 78      |
| 9    | Robert Brown    | 1          | 15      | 9     | 75      |
| 10   | Maria Gonzalez  | 1          | 14      | 8     | 72      |
| 11   | Kevin Patel     | 1          | 12      | 10    | 68      |
| 12   | Sarah Johnson   | 0          | 11      | 12    | 58 ⚠️   |
+------------------------------------------------------------------+
| Performance Distribution:                                         |
| • Top Performers (90+): 2 (17%)                                  |
| • Strong Performers (80-89): 5 (42%)                             |
| • Meets Expectations (70-79): 3 (25%)                            |
| • Needs Improvement (<70): 2 (17%)                               |
+------------------------------------------------------------------+
|                                                                   |
| TOP PERFORMERS ANALYSIS:                                          |
+------------------------------------------------------------------+
| 🥇 Emily Chen - What's Working:                                  |
| • Highest submission volume (25/week)                            |
| • Strong vendor relationships (22% marketing response rate)      |
| • Excellent pipeline management (3 placements)                   |
| • Low bench size (4 consultants, all green)                      |
| • High placement margins (24.5% avg)                             |
|                                                                   |
| 🥈 Michael Torres - What's Working:                              |
| • Consistent placement delivery (2/month)                        |
| • Strong conversion rates (9% submission → placement)            |
| • Excellent client relationships (95% placement health)          |
| • Effective hotlist campaigns (18% response rate)                |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| IMPROVEMENT OPPORTUNITIES:                                        |
+------------------------------------------------------------------+
| ⚠️  Sarah Johnson - Action Plan:                                 |
| • Low submission volume (11/week vs 20 goal)                     |
| • High bench size (12 consultants, 3 orange)                     |
| • No placements in November                                      |
|                                                                   |
| Coaching Plan:                                                    |
| 1. Daily submission target: 4/day minimum                        |
| 2. Shadow Emily Chen (top performer) for 2 days                  |
| 3. Focus on 3 orange bench consultants this week                 |
| 4. Manager 1:1 Friday to review progress                         |
|                                                                   |
| ⚠️  Kevin Patel - Action Plan:                                   |
| • Below submission volume (12/week vs 20 goal)                   |
| • High avg days on bench (45 days vs 30 goal)                    |
| • Marketing response rate low (9% vs 15% goal)                   |
|                                                                   |
| Coaching Plan:                                                    |
| 1. Marketing training with Rachel Kim (84 score, strong marketing)|
| 2. Improve hotlist quality and targeting                         |
| 3. Increase vendor relationship building (20 calls/week)         |
| 4. Weekly check-ins with manager                                 |
|                                                                   |
+------------------------------------------------------------------+
| TEAM BEST PRACTICES (Lessons from Top Performers)                 |
+------------------------------------------------------------------+
| 1. Daily submission routine (4-5 per day) - Emily Chen           |
| 2. Vendor relationship nurturing (weekly calls) - Michael Torres |
| 3. Targeted hotlists by skill vertical - Alex Thompson           |
| 4. Proactive placement check-ins (weekly) - Jessica Lee          |
| 5. Immigration tracking discipline - David Park                  |
+------------------------------------------------------------------+
| [Share with Team] [Schedule Team Meeting] [Export] [1:1 Schedule]|
+------------------------------------------------------------------+
```

**Manager-Specific Insights:**
- **Team Rankings**: Identify top and underperformers
- **Performance Distribution**: Understand team spread
- **Best Practices**: Extract lessons from top performers
- **Coaching Plans**: Action plans for underperformers
- **Team Trends**: Historical team performance

**Time:** ~15-20 minutes to review

---

## Field Specifications

### Report Configuration

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| Report Type | Dropdown | Yes | 20+ report types | Determines report template |
| Report Period | Radio | Yes | Week/Month/Quarter/Custom | Time range |
| Custom Start Date | Date | If custom | Cannot be future | Start of custom range |
| Custom End Date | Date | If custom | ≥ Start date | End of custom range |
| Benchmark Against | Multi-select | No | Goals/Team/Org/Industry | Comparison sources |
| Include Sections | Checkboxes | No | Report-specific | Customize output |
| Output Format | Radio | Yes | PDF/Excel/PPT/Web | Delivery format |
| Recipient Email | Email | If sharing | Valid email | For scheduled reports |
| Schedule Frequency | Dropdown | No | Daily/Weekly/Monthly | Automated delivery |

---

## Postconditions

### Success Postconditions

1. **Report generated** with requested parameters
2. **Data analyzed** and visualized
3. **Insights identified** (trends, anomalies, opportunities)
4. **Report downloaded** or shared
5. **Schedule created** (if recurring report)
6. **Actions identified** from recommendations

### Failure Postconditions

1. **Insufficient data**: Notify user, suggest longer period
2. **Permission denied**: Show accessible scope only
3. **Export failure**: Offer alternative formats
4. **Email delivery failed**: Retry or allow manual download

---

## Events Logged

| Event | Payload |
|-------|---------|
| `report.generated` | `{ report_type, period, user_id, timestamp }` |
| `report.viewed` | `{ report_id, user_id, duration, timestamp }` |
| `report.downloaded` | `{ report_id, format, user_id, timestamp }` |
| `report.shared` | `{ report_id, shared_with, user_id, timestamp }` |
| `report.scheduled` | `{ report_type, frequency, recipients, user_id, timestamp }` |

---

## Error Scenarios

| Scenario | Cause | System Response | User Action |
|----------|-------|-----------------|-------------|
| **No data available** | No activity in selected period | Show message, suggest different period | Select period with data |
| **Report timeout** | Complex report, large dataset | Show progress indicator, allow cancel | Wait or simplify report |
| **Export failure** | File size too large | Offer simplified version or data subset | Choose smaller period or fewer sections |
| **Permission denied** | User lacks access to data | Show error, explain permission requirements | Contact manager for access |
| **Scheduled report fails** | Email service down | Retry up to 3 times, notify user | Download manually or reschedule |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g then r` | Go to Reports |
| `Cmd/Ctrl + P` | Print report |
| `Cmd/Ctrl + E` | Export report |
| `Cmd/Ctrl + S` | Share report |
| `?` | Show report help |

---

## Alternative Flows

### A1: Scheduled Recurring Report

**Trigger:** User sets up weekly/monthly recurring report

**Flow:**
1. User configures report with "Schedule" option
2. Selects frequency (weekly/monthly/quarterly)
3. Adds recipient emails (self + manager)
4. System saves schedule
5. Every week/month, system:
   - Auto-generates report
   - Emails PDF to recipients
   - Stores in Reports archive
6. User receives email with report attached

### A2: Executive Dashboard Report

**Trigger:** Executive requests organization-wide bench operations report

**Report Includes:**
- **Organization Bench Utilization**: Trend over time
- **Revenue by Division**: Breakdown by region/team
- **Placement Velocity**: Time to placement metrics
- **Financial Summary**: Revenue, margins, projections
- **Risk Dashboard**: At-risk placements, immigration issues
- **Capacity Planning**: Bench capacity vs demand forecast

**Differences from Individual Report:**
- **Aggregated data**: No individual rep details
- **Strategic focus**: High-level insights, not tactical
- **Financial emphasis**: Revenue and profitability front and center
- **Trend analysis**: Long-term patterns (quarters, years)

### A3: Custom Ad-Hoc Report

**Trigger:** User needs specific analysis not covered by standard reports

**Flow:**
1. User clicks "Create Custom Report"
2. System shows report builder:
   - Select metrics (from 50+ options)
   - Choose dimensions (consultant, client, vendor, time, etc.)
   - Add filters (visa type, location, skills, etc.)
   - Choose visualizations (charts, tables, graphs)
3. User previews report
4. User saves as custom template for future use
5. User generates and exports

**Example Custom Report:**
- **Visa Type Performance Analysis**: Placement success rate by visa type
- **Skills Gap Report**: High-demand skills vs consultant availability
- **Vendor ROI**: Submissions and placements by vendor source

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Report Period | Start ≤ End | "Start date must be before end date" |
| Custom Date Range | Max 1 year | "Date range cannot exceed 1 year" |
| Recipients | Valid email | "Invalid email address" |
| Report Type | Required | "Please select a report type" |

---

## Business Rules

### Report Data Freshness

| Report Type | Data Lag | Update Frequency |
|-------------|----------|------------------|
| Real-time Dashboard | <5 minutes | Live |
| Weekly Summary | 1 hour | Nightly |
| Monthly Report | 1 day | End of month |
| Quarterly Report | 1 day | End of quarter |

### Report Access Permissions

| Role | Access Scope | Reports Available |
|------|--------------|-------------------|
| **Recruiter** | Own data only | Individual performance, own bench, own placements |
| **Manager** | Team data | Team performance, team bench, team comparisons |
| **Regional Director** | Region data | Regional summary, multi-team analysis |
| **Executive** | Organization | All reports, org-wide analytics |

### Benchmark Data Sources

- **My Goals**: User-defined or manager-assigned goals
- **Team Average**: Mean of team members
- **Org Average**: Mean across organization
- **Industry Benchmarks**: External data (e.g., Staffing Industry Analysts)

---

## Related Use Cases

- [20-bench-dashboard.md](./20-bench-dashboard.md) - Real-time dashboard
- [02-manage-bench.md](./02-manage-bench.md) - Bench operations
- [19-post-placement.md](./19-post-placement.md) - Placement tracking
- [16-vendor-commission.md](./16-vendor-commission.md) - Financial reporting

---

*Last Updated: 2024-11-30*
