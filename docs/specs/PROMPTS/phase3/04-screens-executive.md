# PROMPT: SCREENS-EXECUTIVE (Window 4)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and backend skill.

Create/Update Executive role screens (CFO, COO, CEO) for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md (CFO role with financial metrics)
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (COO oversees all pod managers)
- docs/specs/01-GLOSSARY.md (Business terms)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/operations/index.ts (Operations screen registry)
- src/screens/operations/cfo-dashboard.screen.ts
- src/screens/operations/coo-dashboard.screen.ts
- src/screens/operations/ceo-dashboard.screen.ts
- src/screens/finance/index.ts (Finance screens if exist)
- src/lib/metadata/types.ts (ScreenDefinition type)

## Context:
- Routes: `/employee/cfo/*`, `/employee/coo/*`, `/employee/ceo/*`
- Executives have org-wide visibility
- Dashboards focus on high-level metrics and strategic decisions
- Drill-down capabilities to pod/team/individual level
- Export for board presentations

## Executive Hierarchy:
- CEO: Strategic oversight, all company data
- COO: Operations oversight, all pods and processes
- CFO: Financial oversight, revenue, margins, AR/AP
- Regional Director: Multi-country P&L, regional operations (see 06-regional/00-OVERVIEW.md)

## Note on Regional Director:
Regional Directors use the same dashboard patterns as CFO/COO/CEO but scoped to their region.
Their screens filter all data by region assignment. Key additions:
- Multi-country view (country tabs/filters)
- Cross-border compliance dashboard
- Regional P&L vs country breakdown
- Country manager performance comparison

---

## CFO Screens (src/screens/operations/ or src/screens/finance/):

### 1. CFO Dashboard (UPDATE existing)
File: cfo-dashboard.screen.ts
Route: `/employee/cfo/dashboard`
Status: EXISTS - Verify per 07-cfo/00-OVERVIEW.md

Per CFO Role Spec:

KPI Cards (Row 1):
- Revenue MTD vs Target
- Revenue YTD vs Target
- Gross Margin %
- EBITDA

KPI Cards (Row 2):
- Cash Position
- AR Outstanding
- DSO (Days Sales Outstanding)
- Collection Rate

Charts:
- Revenue Trend (12-month rolling)
- Revenue by Service Line (Contract, FTE, C2H, Bench)
- Margin by Client Tier (Enterprise, Mid-Market, SMB)
- AR Aging Distribution (Current, 30, 60, 90+)

Alerts Panel:
- Large invoices overdue
- Margin exceptions (negative or below threshold)
- Unusual commission claims

### 2. Revenue Analytics (CREATE if missing)
File: revenue-analytics.screen.ts
Route: `/employee/cfo/revenue`

Tabs:
- Overview: Revenue trends, comparisons
- By Service: Contract vs FTE vs C2H vs Bench breakdown
- By Client: Top clients, concentration risk
- By Region: Geographic distribution
- By Pod: Pod-level contribution

Charts: Bar, line, pie with drill-down
Filters: Date range, Service type, Region, Client tier
Export: PDF, Excel

### 3. Margin Analysis (CREATE if missing)
File: margin-analysis.screen.ts
Route: `/employee/cfo/margins`

Sections:
- Overall Margin Trends (line chart)
- Margin by Placement Type (Contract/FTE/Bench)
- Margin by Visa Type (US Citizen, Green Card, H1B, etc.)
- Margin by Client
- Low Margin Alerts (placements below threshold)
- Margin Improvement Opportunities

Rate Stack Display:
```
Bill Rate → Markup → Pay Rate → Margin
$100/hr  →  25%   → $75/hr  → $25/hr
```

### 4. Accounts Receivable (CREATE if missing)
File: ar-dashboard.screen.ts
Route: `/employee/cfo/ar`

Sections:
- AR Aging Summary (Current, 1-30, 31-60, 61-90, 90+)
- AR by Client (top debtors)
- Collection Queue (actions needed)
- Payment History
- DSO Trend

Actions: Send Reminder, Escalate, Write Off
Integration: Invoicing system

### 5. Placements Financial View (CREATE if missing)
File: placements-financial.screen.ts
Route: `/employee/cfo/placements`

Financial perspective on placements:
- Active Placements with Revenue
- Projected Revenue (based on end dates)
- Extension Impact
- Margin Summary
- Commission Obligations

Columns: consultant, client, billRate, payRate, margin, weeklyRevenue, mtdRevenue

### 6. Financial Reports (CREATE if missing)
File: financial-reports.screen.ts
Route: `/employee/cfo/reports`

Report Types:
- P&L Statement (monthly, quarterly, annual)
- Cash Flow Statement
- AR Aging Report
- Commission Report
- Margin Analysis Report
- Revenue Forecast

Actions: Generate, Schedule, Export (PDF/Excel)

---

## COO Screens (src/screens/operations/):

### 7. COO Dashboard (UPDATE existing)
File: coo-dashboard.screen.ts
Route: `/employee/coo/dashboard`
Status: EXISTS - Enhance

Per COO oversight role:

KPI Cards:
- Total Active Placements
- Open Jobs (all pods)
- Avg Time to Fill
- Submission to Interview Rate
- Fill Rate %
- Active Escalations

Widgets:
- Pod Performance Comparison (bar chart ranking)
- SLA Compliance by Pod
- Process Bottlenecks (where deals are stuck)
- Resource Utilization

Alerts:
- Pods below target
- High escalation pods
- SLA breaches

### 8. All Pods Overview (CREATE if missing)
File: all-pods-overview.screen.ts
Route: `/employee/coo/pods`

Grid of all pods:
- Pod card: name, type, manager, IC count, sprint progress, health score
- Performance ranking
- Click → Pod detail

Filters: Type (recruiting/bench_sales/ta), Performance tier

### 9. Pod Detail (COO View) (CREATE if missing)
File: coo-pod-detail.screen.ts
Route: `/employee/coo/pods/[podId]`

COO can see any pod in detail:
- Pod metrics
- Team members
- Sprint progress
- Pipeline
- Escalations
- Historical performance

Actions: Adjust Targets (with justification), Reassign Manager

### 10. Operations Analytics (CREATE if missing)
File: operations-analytics.screen.ts
Route: `/employee/coo/analytics`

Org-wide operations metrics:
- Pipeline Funnel (leads → placements)
- Conversion Rates by Stage
- Time in Stage Analysis
- Process Efficiency Metrics
- Trend Analysis (improving/declining)

Drill-down: By pod, by IC, by account

### 11. SLA Dashboard (CREATE if missing)
File: sla-dashboard.screen.ts
Route: `/employee/coo/sla`

SLA Compliance:
- Overall % Met
- By Activity Type
- By Pod
- Breach Analysis (root causes)
- At-Risk Items
- Trending Violations

Actions: Review Breaches, Adjust SLAs

### 12. Process Metrics (CREATE if missing)
File: process-metrics.screen.ts
Route: `/employee/coo/metrics`

Detailed process metrics:
- Cycle Times (job open → placed)
- Stage Durations
- Quality Metrics (submission quality, interview pass rate)
- Error Rates
- Automation Rates
- Continuous Improvement Tracking

### 13. Escalations Overview (CREATE if missing)
File: coo-escalations.screen.ts
Route: `/employee/coo/escalations`

Org-wide escalation view:
- All open escalations (across pods)
- Escalation by type
- Escalation by pod
- Resolution time trends
- Manager performance on escalations

Actions: Assign to Manager, Take Over, Close

---

## CEO Screens (src/screens/operations/):

### 14. CEO Dashboard (UPDATE existing)
File: ceo-dashboard.screen.ts
Route: `/employee/ceo/dashboard`
Status: EXISTS - Enhance

Strategic overview:

KPI Cards:
- Total Revenue (MTD/YTD)
- Revenue Growth %
- Total Placements (active)
- Client Count (active)
- Employee Count
- Gross Margin %

Company Health Score (composite):
- Financial Health: Revenue vs target, margin
- Operational Health: Fill rate, SLA compliance
- Client Health: NPS, retention
- Team Health: IC productivity, retention

Strategic Sections:
- Top Clients (revenue, health)
- Key Initiatives Progress
- Critical Alerts
- Recent Wins

### 15. Business Intelligence (CREATE if missing)
File: business-intelligence.screen.ts
Route: `/employee/ceo/intelligence`

Strategic insights:
- Market Trends
- Competitive Landscape
- Industry Benchmarks
- Growth Opportunities
- Risk Assessment
- AI-Powered Insights

### 16. Strategic Initiatives (CREATE if missing)
File: strategic-initiatives.screen.ts
Route: `/employee/ceo/initiatives`

Initiative Tracker:
- Cards: Goal, Progress %, Owner, Deadline
- Milestone Timeline
- Resource Allocation
- Dependencies
- Risk Flags

Actions: Add Initiative, Update Status, Close

### 17. Portfolio Overview (CREATE if missing)
File: portfolio-overview.screen.ts
Route: `/employee/ceo/portfolio`

Business portfolio:
- Revenue by Business Unit
- Client Portfolio Health
- Concentration Risks (>10% revenue from single client)
- Growth vs Mature Accounts
- Diversification Analysis

### 18. Executive Reports (CREATE if missing)
File: executive-reports.screen.ts
Route: `/employee/ceo/reports`

Board-Ready Reports:
- Board Deck Generator
- Investor Updates
- Annual Review
- Strategic Planning Docs
- Custom Report Builder

Export: PowerPoint, PDF

---

## Shared Executive Components:

### 19. Forecasting (CREATE if missing)
File: forecasting.screen.ts
Route: `/employee/executive/forecasting`

Forecasting Tools:
- Revenue Forecast (ML-based if available)
- Pipeline Projections
- Headcount Planning
- Scenario Modeling
- What-If Analysis

### 20. Benchmarking (CREATE if missing)
File: benchmarking.screen.ts
Route: `/employee/executive/benchmarks`

Benchmarks:
- Industry Comparisons
- Internal Benchmarks (pod vs pod)
- Historical Trends
- Target Setting Tools

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const executiveScreenName: ScreenDefinition = {
  id: 'executive-screen-id',
  type: 'dashboard',
  title: 'Screen Title',
  icon: 'IconName',

  permission: {
    roles: ['cfo', 'coo', 'ceo', 'admin'],
  },

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'metrics', procedure: 'executive.getMetrics' },
      { key: 'trends', procedure: 'executive.getTrends' },
    ],
  },

  layout: {
    type: 'dashboard',
    sections: [/* KPI rows, charts, tables */],
  },
};
```

## Requirements:
- High-impact data visualizations (Recharts or similar)
- Drill-down capabilities (click chart segment → detail view)
- Real-time data refresh option
- Export to PDF/Excel for board presentations
- Mobile responsive for on-the-go access
- Secure (role-based data scoping)
- Loading skeletons for data-heavy screens

## Visualization Guidelines:
- Consistent color palette across all executive screens
- Interactive tooltips with details
- Comparison overlays (vs last period, vs target)
- Trend indicators (up/down arrows with %)
- Threshold highlighting (red for alerts)

## After Screens:
1. Export from src/screens/operations/index.ts or src/screens/finance/index.ts
2. Add to operationsScreens registry
3. Create routes in src/app/employee/cfo/, /coo/, /ceo/
4. Update navigation config for executive roles
