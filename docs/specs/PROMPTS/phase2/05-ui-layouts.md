# PROMPT: UI-LAYOUTS (Window 5)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable layout components for InTime v3 application structure, navigation, and page layouts.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview)
- docs/specs/01-GLOSSARY.md (Business terms - pods, roles, RACI)
- docs/specs/30-SCREENS/01-LAYOUT-SHELL.md (Main layout shell specification - detailed!)
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Recruiter navigation, screen access)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales navigation, screen access)
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Manager views, pod dashboard)
- docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md (HR navigation, screen access)
- docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md (Executive dashboards)
- CLAUDE.md (App structure, tech stack)

## Create Layout Components:

### 1. App Shell (src/components/layouts/):

#### AppShell.tsx
**Based on:** 01-LAYOUT-SHELL.md wireframe
Root application layout:
- Sidebar (collapsible, 224px expanded / 64px collapsed)
- Header (fixed, 56px height)
- Main content area (calc(100% - sidebar width))
- Toast container (bottom-right)
- Modal portal
- Command bar (Cmd+K trigger)

#### WorkspaceLayout.tsx
Wrapper for /employee/workspace routes:
- AppShell with sidebar visible
- Role-based navigation
- Context providers (auth, workspace)

#### AuthLayout.tsx
Layout for login/auth pages:
- Centered card
- No sidebar/header
- Background branding

#### PortalLayout.tsx
Layout for /employee/portal routes:
- Simplified navigation
- Role selector
- Module cards

### 2. Header (src/components/layouts/header/):

#### Header.tsx
**Based on:** 01-LAYOUT-SHELL.md header specification
- Height: 56px, fixed top
- Left: Logo (32x32px, "IT" in forest bg), Brand text "InTime", Divider, Home link
- Center: Search input (max-w-md, opens command bar)
- Right: Notifications bell (badge for unread), User avatar dropdown
- Border bottom

#### UserMenu.tsx
Dropdown from avatar:
- User name, email
- Role display
- Employee Portal link
- Workspace link
- Sign Out (destructive)

#### NotificationsDropdown.tsx
- Notification list (recent 10)
- Mark all read
- View all link
- Real-time updates
- Notification types: task_due, submission_update, mention, system

#### BreadcrumbNav.tsx (Optional for detail pages)
- Auto-generated from route
- Custom overrides per page
- Clickable navigation
- Truncation for long paths

### 3. Sidebar (src/components/layouts/sidebar/):

#### Sidebar.tsx
**Based on:** 01-LAYOUT-SHELL.md sidebar specification
- Width: 224px (expanded) / 64px (collapsed)
- Background: bg-stone-50/50
- Border right
- Fixed left, below header
- Sections: Workspace, Core Objects, Management (permission-gated), Pinned, Recent
- Collapse button at bottom

#### SidebarHeader.tsx
- "Workspace" title
- Height: 48px
- Border bottom

#### SidebarSection.tsx
- Section label (small caps)
- Collapsible
- Items list

#### SidebarNavItem.tsx
- Height: 40px
- Icon (16px) + Label + Optional badge
- States: default, hover, active
- Active: bg-rust/10, text-rust
- Nested items support

#### SidebarPinnedItems.tsx
- Header with Pin icon
- List of pinned entities (max 5)
- Click to navigate
- Unpin action

#### SidebarRecentItems.tsx
- Header with Clock icon
- List of recently viewed (max 5)
- Click to navigate
- Auto-populated from history

#### SidebarCollapseButton.tsx
- Fixed at sidebar bottom
- Toggle collapse/expand
- Icon changes direction

### 4. Navigation Configuration (src/lib/navigation/):

#### navConfig.ts
Role-based navigation structure:
```tsx
export const navConfig: Record<UserRole, NavSection[]> = {
  recruiter: [
    {
      label: 'My Workspace',
      items: [
        { label: 'Today', icon: LayoutDashboard, href: '/employee/workspace', badge: null },
        { label: 'Tasks', icon: CheckSquare, href: '/employee/workspace/tasks', badge: 'taskCount' },
      ],
    },
    {
      label: 'Core',
      items: [
        { label: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs', badge: 'openJobsCount' },
        { label: 'Candidates', icon: Users, href: '/employee/workspace/candidates' },
        { label: 'Submissions', icon: Send, href: '/employee/workspace/submissions', badge: 'pendingSubmissions' },
        { label: 'Placements', icon: Award, href: '/employee/workspace/placements' },
        { label: 'Accounts', icon: Building2, href: '/employee/workspace/accounts' },
        { label: 'Contacts', icon: Contact, href: '/employee/workspace/contacts' },
        { label: 'Leads', icon: Target, href: '/employee/workspace/leads' },
        { label: 'Deals', icon: DollarSign, href: '/employee/workspace/deals' },
        { label: 'Campaigns', icon: Mail, href: '/employee/workspace/campaigns' },
      ],
    },
    {
      label: 'Manage',
      permission: 'manager',
      items: [
        { label: 'Pods', icon: Users2, href: '/employee/workspace/pods' },
        { label: 'Analytics', icon: BarChart3, href: '/employee/workspace/analytics' },
      ],
    },
  ],
  bench_sales: [
    {
      label: 'My Workspace',
      items: [
        { label: 'Today', icon: LayoutDashboard, href: '/employee/workspace' },
        { label: 'Tasks', icon: CheckSquare, href: '/employee/workspace/tasks', badge: 'taskCount' },
      ],
    },
    {
      label: 'Bench',
      items: [
        { label: 'Dashboard', icon: BarChart3, href: '/employee/workspace/bench' },
        { label: 'Consultants', icon: Users, href: '/employee/workspace/bench/consultants', badge: 'onBenchCount' },
        { label: 'Vendor Bench', icon: Building2, href: '/employee/workspace/bench/vendor-consultants' },
        { label: 'External Jobs', icon: Briefcase, href: '/employee/workspace/bench/jobs' },
        { label: 'Submissions', icon: Send, href: '/employee/workspace/bench/submissions' },
        { label: 'Hotlists', icon: FileText, href: '/employee/workspace/bench/hotlists' },
        { label: 'Immigration', icon: Globe, href: '/employee/workspace/bench/immigration', badge: 'immigrationAlerts' },
        { label: 'Vendors', icon: Building, href: '/employee/workspace/bench/vendors' },
        { label: 'Placements', icon: Award, href: '/employee/workspace/bench/placements' },
      ],
    },
  ],
  hr_manager: [
    {
      label: 'HR',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/employee/hr/dashboard' },
        { label: 'Employees', icon: Users, href: '/employee/hr/people' },
        { label: 'Onboarding', icon: UserPlus, href: '/employee/hr/onboarding', badge: 'pendingOnboarding' },
        { label: 'Payroll', icon: DollarSign, href: '/employee/hr/payroll' },
        { label: 'Time & Attendance', icon: Clock, href: '/employee/hr/time' },
        { label: 'Benefits', icon: Heart, href: '/employee/hr/benefits' },
        { label: 'Performance', icon: Target, href: '/employee/hr/performance' },
        { label: 'Compliance', icon: Shield, href: '/employee/hr/compliance' },
        { label: 'Org Chart', icon: Network, href: '/employee/hr/org-chart' },
        { label: 'Reports', icon: BarChart3, href: '/employee/hr/reports' },
      ],
    },
  ],
  manager: [
    // Inherits from role (recruiting/bench_sales) plus:
    {
      label: 'Pod Management',
      items: [
        { label: 'Pod Dashboard', icon: LayoutDashboard, href: '/employee/manager/pod' },
        { label: 'Team', icon: Users, href: '/employee/manager/team' },
        { label: 'Sprint', icon: Zap, href: '/employee/manager/sprint' },
        { label: 'Escalations', icon: AlertTriangle, href: '/employee/manager/escalations', badge: 'escalationCount' },
        { label: 'Approvals', icon: CheckCircle, href: '/employee/manager/approvals', badge: 'pendingApprovals' },
        { label: 'Analytics', icon: BarChart3, href: '/employee/manager/analytics' },
      ],
    },
  ],
  cfo: [
    {
      label: 'Executive',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/employee/cfo/dashboard' },
        { label: 'Revenue', icon: DollarSign, href: '/employee/cfo/revenue' },
        { label: 'Placements', icon: Award, href: '/employee/cfo/placements' },
        { label: 'Margins', icon: TrendingUp, href: '/employee/cfo/margins' },
        { label: 'Accounts Receivable', icon: FileText, href: '/employee/cfo/ar' },
        { label: 'Reports', icon: BarChart3, href: '/employee/cfo/reports' },
      ],
    },
  ],
  admin: [
    // Full access to all modules
    {
      label: 'Admin',
      items: [
        { label: 'Users', icon: Users, href: '/admin/users' },
        { label: 'Pods', icon: Users2, href: '/admin/pods' },
        { label: 'Settings', icon: Settings, href: '/admin/settings' },
        { label: 'Integrations', icon: Plug, href: '/admin/integrations' },
        { label: 'Audit Log', icon: FileText, href: '/admin/audit' },
      ],
    },
  ],
};
```

#### useNavigation.ts
Hook for navigation state:
- Current path detection
- Active item highlighting
- Badge counts from queries
- Collapsed state persistence

### 5. Page Layouts (src/components/layouts/pages/):

#### PageLayout.tsx
Standard page wrapper:
- Page header (title, subtitle, actions)
- Content area with padding
- Loading state (skeleton)
- Error boundary with retry

#### DashboardLayout.tsx
Dashboard pages:
- Welcome banner (optional, dismissible)
- Quick stats row (StatCard grid)
- Widget grid (2-3 columns responsive)
- Customizable layout (save preference)

#### ListLayout.tsx
List/table pages:
- Page header with title + "Create New" button
- Toolbar (search input, filter dropdowns, view toggle)
- Table/grid content area
- Pagination at bottom
- Empty state

#### DetailLayout.tsx
Entity detail pages:
- Back button + breadcrumb
- Entity header (icon, title, status badge, action buttons)
- Tabs navigation (horizontal)
- Tab content area
- Optional right side panel (related entities, quick stats)

#### SplitPaneLayout.tsx
Master-detail pattern:
- Left panel: list with selection
- Right panel: detail view of selected item
- Resizable divider (drag handle)
- Mobile: stack vertically or drawer for detail
- URL sync for selected item

#### KanbanLayout.tsx
Kanban/pipeline pages:
- Board header (title, filters, column config)
- Horizontal scrolling column container
- Column headers with counts and collapse toggle
- Drop zones for drag-drop
- Add card button per column

### 6. Content Layouts (src/components/layouts/content/):

#### GridLayout.tsx
Responsive grid container:
- columns prop (1-6)
- gap prop
- Responsive column overrides
- CSS Grid based

#### StackLayout.tsx
Flex-based stacking:
- direction: row | column
- spacing
- alignment (start/center/end/stretch)
- Optional dividers

#### TabsLayout.tsx
Tabbed content:
- Tab list (horizontal, with icons optional)
- Tab panels (lazy loaded)
- URL sync for active tab (?tab=overview)
- Badge counts on tabs

#### AccordionLayout.tsx
Collapsible sections:
- Single or multi-open mode
- Default open items
- Smooth animation
- Section headers with counts

#### CardGridLayout.tsx
Grid of cards:
- Responsive columns
- Consistent card sizing
- Gap spacing
- Masonry option

### 7. Dashboard Widgets (src/components/layouts/widgets/):

#### WidgetGrid.tsx
Dashboard widget system:
- React Grid Layout based
- Responsive breakpoints
- Drag-drop reorder (manager+ permission)
- Resize handles
- Save layout to user preferences
- Default layouts per role

#### Widget.tsx
Widget wrapper component:
- Title + action menu (refresh, fullscreen, hide)
- Loading skeleton
- Error state with retry
- Last updated timestamp
- Collapsible

#### WidgetRegistry.ts
Available widgets per role:

**Recruiter widgets:**
- OpenJobsWidget - Active jobs count with list
- PipelineWidget - Submission pipeline funnel
- UpcomingInterviewsWidget - Calendar preview
- RecentActivityWidget - Activity feed
- TasksDueWidget - Overdue + due today
- PlacementsMTDWidget - Month-to-date placements

**Bench Sales widgets:**
- BenchUtilizationWidget - Utilization rate gauge
- DaysOnBenchWidget - Alert distribution chart
- ImmigrationAlertsWidget - Expiring visas list
- HotlistsWidget - Recent hotlists + engagement
- VendorActivityWidget - Vendor response rates
- PlacementsMTDWidget - Month-to-date placements

**Manager widgets:**
- PodPerformanceWidget - Team metrics
- SprintProgressWidget - Sprint burn-down
- EscalationsWidget - Pending escalations
- ApprovalsWidget - Pending approvals
- TeamActivityWidget - IC activity summary
- PipelineCoverageWidget - Coverage ratio

**HR widgets:**
- OnboardingQueueWidget - Pending onboardings
- PTORequestsWidget - Pending requests
- TimesheetApprovalsWidget - Pending timesheets
- ComplianceAlertsWidget - I-9, expiring docs
- HeadcountWidget - Employee count by department

**CFO widgets:**
- RevenueMTDWidget - Month-to-date revenue
- MarginWidget - Average margin trend
- PlacementsWidget - Placement count + value
- ARAgingWidget - Accounts receivable aging
- CashFlowWidget - Cash position

### 8. Specialized Layouts (src/components/layouts/specialized/):

#### TimelineLayout.tsx
Vertical timeline:
- Date grouping headers
- Timeline items (cards)
- Connector lines
- Load more pagination
- Filter by type

#### CalendarLayout.tsx
Calendar view:
- Month/week/day view toggle
- Event display (interviews, tasks)
- Click to view detail
- Drag to reschedule
- Color coding by type

#### PipelineLayout.tsx
Funnel/pipeline visualization:
- Stage columns with headers
- Items per stage (cards or count)
- Conversion rates between stages
- Metrics per stage
- Click to filter table

#### OrgChartLayout.tsx (HR)
Organization hierarchy:
- Tree visualization
- Expand/collapse levels
- Employee cards
- Click to view profile
- Reporting lines

### 9. Responsive Utilities (src/components/layouts/responsive/):

#### ResponsiveContainer.tsx
- max-width constraints by breakpoint
- Centered with auto margins
- Padding responsive

#### ShowAt.tsx / HideAt.tsx
Conditional render by breakpoint:
```tsx
<ShowAt breakpoint="md">Desktop only content</ShowAt>
<HideAt breakpoint="md">Mobile only content</HideAt>
```

#### MobileNav.tsx
Mobile navigation (< 768px):
- Bottom tab bar for primary nav
- Hamburger menu for full nav
- Swipe gestures

### 10. Command Bar (src/components/layouts/command/):

#### CommandBar.tsx
**Based on:** 01-LAYOUT-SHELL.md command bar specification
- Modal overlay (640px width, 480px max height)
- Search input (auto-focus)
- Results by category
- Keyboard navigation
- Recent searches
- Command mode (starts with ">")

#### CommandInput.tsx
- Search icon
- Placeholder: "Type a command or search..."
- Clear button

#### CommandResults.tsx
- Grouped by entity type
- Item icon + title + subtitle
- Type badge
- Keyboard selection highlight

#### CommandActions.tsx
Commands available with ">":
- `> jobs` → Go to Jobs
- `> new job` → Create Job modal
- `> submit` → Submit Candidate modal
- Role-specific commands

## Layout Tokens:
```tsx
export const layoutTokens = {
  sidebar: {
    widthCollapsed: 64,
    widthExpanded: 224,
  },
  header: {
    height: 56,
  },
  page: {
    paddingX: 24,
    paddingY: 24,
    maxWidth: 1440,
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
```

## Requirements:
- Mobile-first responsive design (breakpoints: sm 640, md 768, lg 1024, xl 1280)
- Consistent spacing using tokens
- Dark mode support (theme tokens)
- Smooth transitions (150-200ms)
- Keyboard navigation
- Skip links for accessibility
- Focus visible states
- Print styles (hide nav, full width content)

## After Components:
Export all from src/components/layouts/index.ts

  use parallel agents.. not for sake of using..  only where it
  makes sense