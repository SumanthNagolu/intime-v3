# PROMPT: UI-CARDS (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable card components for InTime v3 dashboards, kanban views, and entity displays.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview)
- docs/specs/01-GLOSSARY.md (Business terms)
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Recruiter metrics and dashboard)
- docs/specs/20-USER-ROLES/01-recruiter/01-daily-workflow.md (What recruiters need to see)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales metrics, bench alert thresholds)
- docs/specs/20-USER-ROLES/02-bench-sales/20-bench-dashboard.md (Bench dashboard KPIs)
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Pod manager metrics, team performance)
- docs/specs/20-USER-ROLES/04-manager/02-pod-dashboard.md (Team dashboard)
- docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md (HR metrics - compliance, payroll, attendance)
- docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md (Executive financial KPIs)
- src/components/ui/card.tsx (Base shadcn card)

## Create Card Components:

### 1. Base Metric Cards (src/components/cards/):

#### StatCard.tsx
- Label, value, trend (up/down/neutral)
- Comparison value (vs last period: day/week/month/quarter)
- Sparkline chart (optional, 7-day mini trend)
- Icon
- Click to drill down
- Color coding by performance (green/yellow/red)

#### KPICard.tsx
- Title, current value, target value
- Progress indicator (circular or bar)
- Trend arrow with percentage change
- Time period selector (MTD/QTD/YTD)
- Status color (on track/at risk/behind)
- Mini goal line

#### MetricGroupCard.tsx
- Multiple related metrics in one card
- Primary metric (large, prominent)
- Secondary metrics (smaller, in grid below)
- Comparison data with previous period
- Section title

#### CountdownCard.tsx
- For SLAs, deadlines, expiry dates
- Days/hours remaining display
- Urgency color coding
- Related entity link

### 2. Entity Cards (src/components/cards/entity/):

#### JobCard.tsx (Recruiting)
- Title, account link, status badge
- Location, workMode (remote/hybrid/onsite icons), jobType badge
- Rate range (formatted currency with rate type)
- Positions: X open / Y filled progress bar
- Quick stats: submissions count, interviews scheduled
- Priority indicator (icon), urgency indicator
- RCAI assignment display (avatars)
- Actions: View, Submit Candidate, Clone

#### CandidateCard.tsx (Recruiting)
- Avatar, name, current title @ company
- Status badge
- Visa status indicator with alert color
- Skills tags (top 5, +N more)
- Contact icons (email, phone, LinkedIn)
- Availability badge (immediately/2 weeks/etc)
- Match score (if in job context)
- Actions: View, Submit to Job, Add to Campaign

#### SubmissionCard.tsx (Recruiting)
- Candidate mini-info (avatar + name)
- Job reference (title @ account)
- Status badge with pipeline stage
- Submitted date, days in current stage
- Rates: Bill rate / Pay rate / Margin %
- Next action indicator (e.g., "Awaiting client response")
- Interview date (if scheduled)
- Actions: Update Status, Schedule Interview, View Details

#### BenchConsultantCard.tsx (Bench Sales)
- Avatar, name, headline/title
- Days on bench (with alert color: green 0-15, yellow 16-30, orange 31-60, red 61-90, black 91+)
- Visa type badge with expiry countdown
- Contract preference (C2C/W2/1099)
- Target rate + min rate
- Skills tags (top 5)
- Availability date
- Marketing status (active/passive)
- Actions: View Profile, Add to Hotlist, Submit to Requirement

#### VendorConsultantCard.tsx (Bench Sales)
- Avatar, name, vendor source
- Skills tags
- Visa status, rate
- Availability
- Match score (if in job context)
- Actions: Track, Submit

#### ImmigrationAlertCard.tsx (Bench Sales/HR)
- Consultant name + avatar
- Visa type badge
- Days to expiry (large, color-coded)
- Expiry date
- Renewal status badge
- Attorney assigned
- Actions: View Case, Contact Attorney, Update Status

#### HotlistCard.tsx (Bench Sales)
- Hotlist name
- Consultant count
- Status badge (draft/sent/expired)
- Target vendors (tags)
- Sent date, expires date
- Engagement metrics (open rate %, response rate %)
- Actions: View, Edit, Distribute

#### PlacementCard.tsx (Recruiting/Bench Sales)
- Consultant avatar + name
- Job title @ Account
- Start date, End date (or "Ongoing")
- Contract type badge
- Bill rate, Pay rate, Margin
- Status badge (active/completed/terminated)
- Check-in status (30/60/90 day indicators)
- Actions: View, Add Check-in, Extend

#### LeadCard.tsx (CRM/TA)
- Company name, logo (if available)
- Contact name, title
- Source badge, status badge
- Lead score (circle indicator 1-100)
- Qualification checklist progress
- Last touchpoint date
- Estimated value
- Actions: View, Qualify, Convert to Deal

#### DealCard.tsx (CRM)
- Deal name
- Account link
- Stage badge (with pipeline position)
- Value (formatted currency)
- Probability %
- Expected close date
- Owner avatar
- Competitors (if any)
- Actions: View, Update Stage, Add Note

#### AccountCard.tsx (CRM)
- Company name, logo
- Type badge (client/vendor/partner)
- Tier badge (enterprise/mid_market/smb)
- Primary contact
- Key metrics: Jobs, Placements, Revenue
- Last activity date
- Actions: View, Add Job, Add Contact

#### ContactCard.tsx (CRM)
- Avatar, name, title
- Account link
- Email, phone (clickable)
- Is primary badge
- Last contacted date
- Communication preference
- Actions: View, Email, Call, Add to Campaign

#### EmployeeCard.tsx (HR)
- Avatar, name, job title
- Department, Manager
- Employment type badge
- Hire date, tenure
- Status badge (active/on_leave/terminated)
- Location
- Actions: View, Edit, Add Note

#### TaskCard.tsx (All Roles)
- Title, description preview
- Related entity link
- Priority badge (color coded)
- Due date with overdue alert
- Status badge
- Assigned to avatar
- Checklist progress (if any)
- Actions: Complete, Reassign, Snooze

#### ActivityCard.tsx (All Roles)
- Pattern icon + name
- Subject line
- Priority badge
- Status badge
- Assigned to avatar
- Due date with SLA indicator (on track/at risk/breached)
- Entity reference link
- Checklist progress
- Actions: Start, Complete, Defer, Reassign

### 3. Kanban Cards (src/components/cards/kanban/):

#### KanbanCardBase.tsx
- Compact card for kanban columns
- Draggable with drag handle icon
- Status indicator (left color strip)
- Key info only (title, subtitle, badge)
- Hover to show more details
- Selection checkbox (for bulk actions)

#### SubmissionKanbanCard.tsx
Based on submission pipeline stages:
- Candidate name (avatar + text)
- Job title (truncated)
- Days in current stage
- Margin indicator (green/yellow/red)
- Status sub-badge
- Drag to change status

#### DealKanbanCard.tsx
- Deal name
- Account
- Value (formatted)
- Days in stage
- Probability bar
- Owner avatar
- Expected close indicator

#### TaskKanbanCard.tsx
- Title (truncated)
- Entity reference
- Due date (with overdue styling)
- Priority indicator
- Assignee avatar

### 4. List Cards (src/components/cards/list/):

#### ActivityListItem.tsx
- Compact for activity lists in sidebar/panels
- Icon based on pattern type
- Subject (truncated)
- Due indicator (relative time)
- Assigned avatar
- Quick complete action
- SLA status dot

#### TimelineEventCard.tsx
- For timeline/feed views
- Icon based on event type (call, email, note, status_change, etc.)
- Title, description (expandable)
- Timestamp (relative)
- Actor info (who did it)
- Related entity link

#### NotificationCard.tsx
- Icon + title
- Message preview
- Timestamp
- Read/unread state
- Action button
- Dismiss action

### 5. Dashboard Cards (src/components/cards/dashboard/):

#### RecentActivityFeed.tsx
- Card container with activity list
- Filter by type dropdown
- "View all" link
- Real-time updates indicator
- Grouped by date

#### PipelineFunnelCard.tsx
- Mini funnel visualization
- Stage names and counts
- Conversion rates between stages
- Click stage to filter

#### UtilizationCard.tsx (Bench Sales/Manager)
- Utilization rate (large %)
- Trend indicator
- Breakdown: On bench vs Placed
- Bench alert distribution

#### UpcomingInterviewsCard.tsx
- List of upcoming interviews
- Date/time, candidate, job
- Calendar integration link
- Grouped by day

#### TasksDueCard.tsx
- Overdue count (prominent, red if > 0)
- Due today count
- Due this week count
- Quick task list
- "View all" link

#### AlertsBannerCard.tsx
- Critical alerts list (immigration expiry, bench alerts, SLA breaches)
- Severity indicators (warning/critical)
- Count badge
- Acknowledge action
- Expandable details

#### SprintProgressCard.tsx (Manager)
- Sprint name, dates
- Progress bar (days elapsed / total)
- Placements: X / Y target
- Pod members progress

#### PodPerformanceCard.tsx (Manager)
- Pod name
- Members count
- Aggregate metrics (placements, submissions, pipeline)
- Performance vs target indicator

### 6. Financial Cards (CFO/Executive):

#### RevenueCard.tsx
- Total revenue (large)
- Period selector (MTD/QTD/YTD)
- Trend vs previous period
- Breakdown by type (placements, contracts)

#### MarginCard.tsx
- Average margin %
- Trend indicator
- Distribution chart (low/mid/high margin)

#### CashFlowCard.tsx
- Current cash position
- AR (accounts receivable)
- AP (accounts payable)
- Net position

### 7. Card Utilities:

#### CardSkeleton.tsx
- Loading skeleton matching card layouts
- Variant for each card type

#### CardEmpty.tsx
- Empty state for no data
- Icon, message, CTA button

#### CardError.tsx
- Error state display
- Retry action

#### CardGroup.tsx
- Group multiple cards with title
- Show more/less toggle
- Grid layout options

## Requirements:
- Consistent sizing and spacing across all cards
- Hover states (subtle lift, shadow)
- Active/selected states (border highlight)
- Click handlers for drill-down navigation
- Responsive (stack on mobile, adjust content)
- Dark mode support (theme tokens)
- Animation on state changes (subtle transitions)
- Accessibility (focusable, keyboard navigation, ARIA labels)
- Consistent action button placement

## Component Pattern:
```tsx
export interface EntityCardProps<T> {
  data: T;
  variant?: 'default' | 'compact' | 'expanded' | 'kanban';
  onView?: () => void;
  onAction?: (action: string, data?: any) => void;
  actions?: CardAction[];
  selected?: boolean;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export interface CardAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  hidden?: boolean;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  status?: 'on_track' | 'at_risk' | 'behind';
  icon?: LucideIcon;
  onClick?: () => void;
  sparklineData?: number[];
}
```

## After Components:
Export all from src/components/cards/index.ts
