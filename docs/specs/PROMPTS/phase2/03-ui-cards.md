# PROMPT: UI-CARDS (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable card components for InTime v3 dashboards, kanban views, and entity displays.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Dashboard cards)
- docs/specs/20-USER-ROLES/09-executive/00-OVERVIEW.md (KPI cards)
- docs/specs/20-USER-ROLES/02-bench-sales/03-manage-hotlist.md (Consultant cards)
- src/components/ui/card.tsx (Base shadcn card)

## Create Card Components:

### 1. Base Cards (src/components/cards/):

#### StatCard.tsx
- Label, value, trend (up/down/neutral)
- Comparison value (vs last period)
- Sparkline chart (optional)
- Icon
- Click to drill down

#### KPICard.tsx
- Title, current value, target value
- Progress indicator (circular or bar)
- Trend arrow with percentage
- Time period selector
- Status color (on track/at risk/behind)

#### MetricCard.tsx
- Multiple metrics in one card
- Primary metric (large)
- Secondary metrics (smaller, below)
- Comparison data

### 2. Entity Cards (src/components/cards/entity/):

#### JobCard.tsx
- Title, account, status badge
- Location, work_mode, job_type icons
- Rate range
- Positions: X open / Y filled
- Quick stats: submissions, interviews
- Priority indicator
- Actions: View, Submit Candidate

#### CandidateCard.tsx
- Avatar, name, current title
- Status badge
- Visa status indicator
- Skills tags (top 5)
- Contact icons (email, phone, LinkedIn)
- Availability indicator
- Actions: View, Submit, Add to Hotlist

#### ConsultantCard.tsx
- Avatar, name, headline
- Status badge, marketing status
- Visa type with expiry countdown
- Target rate
- Skills tags
- Availability date
- Actions: View Profile, Submit

#### SubmissionCard.tsx
- Candidate mini-card
- Job reference
- Status badge (with stage)
- Submitted date, days in stage
- Rates: Bill / Pay / Margin
- Next action indicator
- Actions: Update Status, View Details

#### LeadCard.tsx
- Company name, logo (if available)
- Contact name, title
- Source, status badge
- Lead score (circle indicator)
- Last touchpoint date
- Actions: View, Qualify, Convert

#### ActivityCard.tsx
- Pattern icon, subject
- Priority indicator
- Status badge
- Assigned to (avatar)
- Due date with SLA indicator
- Entity reference
- Actions: Start, Complete, Defer

#### DealCard.tsx
- Deal name, account
- Stage badge
- Value, probability
- Expected close date
- Owner avatar
- Actions: View, Update Stage

### 3. Kanban Cards (src/components/cards/kanban/):

#### KanbanCard.tsx (Base)
- Compact card for kanban columns
- Draggable with drag handle
- Status indicator (color strip)
- Key info only
- Hover to expand

#### SubmissionKanbanCard.tsx
- Candidate name
- Job title (truncated)
- Days in stage
- Margin indicator
- Drag to change status

#### DealKanbanCard.tsx
- Deal name
- Value
- Days in stage
- Probability
- Owner avatar

### 4. List Cards (src/components/cards/list/):

#### ActivityListCard.tsx
- Compact for activity lists
- Icon, subject (truncated)
- Due indicator
- Assigned avatar
- Quick actions

#### TimelineCard.tsx
- For timeline/feed views
- Icon based on type
- Title, description
- Timestamp
- Actor info

### 5. Dashboard Cards (src/components/cards/dashboard/):

#### RecentActivityCard.tsx
- Card with activity list
- Filter by type
- View all link

#### PipelineSnapshotCard.tsx
- Mini funnel visualization
- Stage counts
- Conversion rates

#### UpcomingCard.tsx
- Upcoming interviews/activities
- Date grouping
- Quick actions

#### AlertsCard.tsx
- Critical alerts list
- Severity indicators
- Acknowledge action

### 6. Card Utilities:

#### CardSkeleton.tsx
- Loading skeleton for cards
- Matches card layout

#### CardEmpty.tsx
- Empty state for no data
- Icon, message, CTA

## Requirements:
- Consistent sizing and spacing
- Hover and active states
- Click handlers for drill-down
- Responsive (stack on mobile)
- Dark mode support
- Animation on state changes
- Accessibility (focusable, keyboard)

## Component Pattern:
```tsx
interface EntityCardProps<T> {
  data: T;
  variant?: 'default' | 'compact' | 'expanded';
  onView?: () => void;
  onAction?: (action: string) => void;
  actions?: CardAction[];
  selected?: boolean;
}
```

## After Components:
Export all from src/components/cards/index.ts
