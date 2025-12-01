# PROMPT: SCREENS-EXECUTIVE (Window 4)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create Executive role screens (CFO, COO, CEO) for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/09-executive/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/09-executive/02-cfo-financial-dashboard.md
- docs/specs/20-USER-ROLES/09-executive/03-coo-operations-dashboard.md
- docs/specs/20-USER-ROLES/09-executive/04-ceo-strategic-dashboard.md
- docs/specs/20-USER-ROLES/09-executive/05-business-intelligence.md

## Create Executive Screens (src/app/(app)/executive/):

### 1. Executive Home (/executive)
File: page.tsx

Layout:
- Role-based redirect or unified executive dashboard
- Top KPIs: Revenue, Placements, Pipeline Value, Headcount
- Quick links to role-specific dashboards
- Critical alerts panel
- Recent activity feed

---

## CFO Screens (src/app/(app)/executive/cfo/):

### 2. CFO Dashboard (/executive/cfo)
File: cfo/page.tsx

Layout:
- Financial KPIs row:
  - Revenue (MTD, YTD, vs Target)
  - Gross Margin
  - Operating Expenses
  - EBITDA
  - Cash Position
- Revenue breakdown chart (by service line, region, client)
- Margin analysis (by job type, visa type)
- AR/AP summary
- Collections status
- Budget vs Actual comparison

### 3. Revenue Analytics (/executive/cfo/revenue)
File: cfo/revenue/page.tsx

Layout:
- Revenue trends (monthly, quarterly, yearly)
- Revenue by:
  - Client tier (Strategic, Growth, Standard)
  - Service type (Contract, FTE, C2H)
  - Region
  - Pod
- Top accounts by revenue
- Revenue forecasting
- Export capabilities

### 4. Margin Analysis (/executive/cfo/margins)
File: cfo/margins/page.tsx

Layout:
- Overall margin trends
- Margin by job type
- Margin by visa type
- Margin by client
- Low margin alerts
- Margin improvement opportunities

### 5. Financial Reports (/executive/cfo/reports)
File: cfo/reports/page.tsx

Layout:
- P&L statements
- Balance sheet
- Cash flow
- AR aging
- Custom report builder
- Scheduled reports
- Export (Excel, PDF)

---

## COO Screens (src/app/(app)/executive/coo/):

### 6. COO Dashboard (/executive/coo)
File: coo/page.tsx

Layout:
- Operations KPIs row:
  - Active Placements
  - Open Jobs
  - Time to Fill
  - Submission to Interview Rate
  - Fill Rate
- Pod performance comparison
- SLA compliance (activities, response times)
- Process efficiency metrics
- Bottleneck identification
- Resource utilization

### 7. Operations Analytics (/executive/coo/operations)
File: coo/operations/page.tsx

Layout:
- Process metrics dashboard
- Funnel analysis (leads → placements)
- Conversion rates by stage
- Time in stage analysis
- Team productivity metrics
- Trend analysis

### 8. Team Performance (/executive/coo/teams)
File: coo/teams/page.tsx

Layout:
- All teams/pods overview
- Performance rankings
- Workload distribution
- Capacity planning
- Underperforming teams alerts
- Drill-down to pod details

### 9. SLA Dashboard (/executive/coo/sla)
File: coo/sla/page.tsx

Layout:
- SLA compliance overview (% met)
- SLA by type (response, resolution)
- Breach analysis
- At-risk items
- Trending violations
- Improvement recommendations

### 10. Process Metrics (/executive/coo/metrics)
File: coo/metrics/page.tsx

Layout:
- Key process metrics
- Cycle times
- Quality metrics
- Automation rates
- Error rates
- Continuous improvement tracking

---

## CEO Screens (src/app/(app)/executive/ceo/):

### 11. CEO Dashboard (/executive/ceo)
File: ceo/page.tsx

Layout:
- Strategic KPIs row:
  - Total Revenue
  - Revenue Growth %
  - Market Share
  - Client NPS
  - Employee Satisfaction
- Company health score (composite)
- Strategic initiative progress
- Competitive landscape
- Key alerts and decisions needed

### 12. Business Intelligence (/executive/ceo/intelligence)
File: ceo/intelligence/page.tsx

Layout:
- Market trends
- Competitive analysis
- Industry benchmarks
- Growth opportunities
- Risk assessment
- AI-powered insights

### 13. Strategic Initiatives (/executive/ceo/initiatives)
File: ceo/initiatives/page.tsx

Layout:
- Initiative cards (goal, progress, owner, deadline)
- Milestone tracking
- Resource allocation
- Dependencies
- Status updates
- Risk flags

### 14. Portfolio Overview (/executive/ceo/portfolio)
File: ceo/portfolio/page.tsx

Layout:
- Business unit performance
- Client portfolio health
- Revenue diversification
- Concentration risks
- Growth vs. mature accounts

### 15. Executive Reports (/executive/ceo/reports)
File: ceo/reports/page.tsx

Layout:
- Board-ready reports
- Investor updates
- Annual review
- Strategic planning docs
- Custom report builder

---

## Shared Executive Components:

### 16. Analytics Builder (/executive/analytics)
File: analytics/page.tsx

Layout:
- Drag-drop dashboard builder
- Widget library
- Custom metrics
- Save/share dashboards
- Schedule refresh

### 17. Benchmarking (/executive/benchmarks)
File: benchmarks/page.tsx

Layout:
- Industry benchmarks comparison
- Internal benchmarks (pod vs pod)
- Trend analysis
- Target setting

### 18. Forecasting (/executive/forecasting)
File: forecasting/page.tsx

Layout:
- Revenue forecasting
- Pipeline projections
- Headcount planning
- Scenario modeling
- What-if analysis

## Screen Metadata:
Create metadata in:
- src/lib/metadata/screens/executive/cfo/
- src/lib/metadata/screens/executive/coo/
- src/lib/metadata/screens/executive/ceo/

## Requirements:
- High-impact visualizations (charts, graphs)
- Drill-down capabilities (click to explore)
- Real-time data refresh
- Export to PDF/Excel for board presentations
- Mobile-responsive for on-the-go access
- Secure (role-based data access)
- AI insights integration points

## Chart Libraries:
- Use Recharts or similar for visualizations
- Consistent color scheme
- Interactive tooltips
- Comparison overlays

## After Screens:
- Add routes to navigation config
- Export screen metadata
