# PROMPT: UI-LAYOUTS (Window 5)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable layout components for InTime v3 application structure, navigation, and page layouts.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Recruiter dashboard layout)
- docs/specs/20-USER-ROLES/09-executive/00-OVERVIEW.md (Executive dashboard)
- docs/specs/20-USER-ROLES/05-manager/00-OVERVIEW.md (Manager views)
- CLAUDE.md (App structure)

## Create Layout Components:

### 1. App Shell (src/components/layouts/):

#### AppShell.tsx
Root application layout:
- Sidebar (collapsible)
- Header (fixed)
- Main content area
- Footer (optional)
- Toast container
- Modal portal

#### Sidebar.tsx
Navigation sidebar:
- Logo/brand
- Navigation groups
- Collapsible sections
- Active state indicators
- User menu at bottom
- Collapse toggle
- Mobile: slide-out drawer

#### Header.tsx
Top header bar:
- Breadcrumbs
- Page title
- Search (global)
- Notifications bell
- User avatar/menu
- Quick actions

#### Breadcrumbs.tsx
- Auto-generated from route
- Custom overrides
- Clickable navigation

### 2. Page Layouts (src/components/layouts/pages/):

#### PageLayout.tsx
Standard page wrapper:
- Page header (title, actions)
- Content area
- Loading state
- Error boundary

#### DashboardLayout.tsx
Dashboard pages:
- Welcome banner
- Quick stats row
- Widget grid (responsive)
- Customizable layout

#### ListLayout.tsx
List/table pages:
- Page header with title
- Toolbar (search, filters, actions)
- Table/grid area
- Pagination

#### DetailLayout.tsx
Entity detail pages:
- Entity header (breadcrumb, title, status, actions)
- Tabs navigation
- Tab content area
- Side panel (optional)

#### SplitLayout.tsx
Master-detail pattern:
- Left panel (list)
- Right panel (detail)
- Resizable divider
- Mobile: stack or drawer

#### KanbanLayout.tsx
Kanban board pages:
- Board header (title, filters)
- Horizontal scrolling columns
- Column headers with counts
- Drop zones

### 3. Navigation (src/components/layouts/navigation/):

#### NavGroup.tsx
- Group label
- Collapsible items
- Badge counts

#### NavItem.tsx
- Icon, label
- Active state
- Nested items support
- Badge/count

#### NavConfig.ts
Role-based navigation:
```tsx
const navConfig: NavConfig = {
  recruiter: [
    { label: 'Dashboard', icon: Home, href: '/recruiter' },
    { label: 'Jobs', icon: Briefcase, href: '/recruiter/jobs', badge: 'openCount' },
    { label: 'Candidates', icon: Users, href: '/recruiter/candidates' },
    { label: 'Submissions', icon: Send, href: '/recruiter/submissions' },
    { label: 'Interviews', icon: Calendar, href: '/recruiter/interviews' },
    { label: 'Activities', icon: Activity, href: '/recruiter/activities' },
  ],
  // ... other roles
};
```

### 4. Content Layouts (src/components/layouts/content/):

#### GridLayout.tsx
Responsive grid:
- Column configuration
- Gap spacing
- Responsive breakpoints

#### StackLayout.tsx
Vertical/horizontal stacking:
- Direction
- Spacing
- Alignment
- Dividers (optional)

#### TabsLayout.tsx
Tabbed content:
- Tab list
- Tab panels
- URL sync (optional)
- Lazy loading

#### AccordionLayout.tsx
Collapsible sections:
- Single/multi open
- Default open state
- Animation

### 5. Dashboard Widgets (src/components/layouts/widgets/):

#### WidgetGrid.tsx
Dashboard widget system:
- Responsive grid
- Drag-drop reorder
- Resize handles
- Save layout preference

#### Widget.tsx
Widget wrapper:
- Title, actions menu
- Loading state
- Error state
- Refresh action
- Fullscreen toggle

#### WidgetRegistry.ts
Available widgets:
- RecentActivities
- PipelineMetrics
- UpcomingInterviews
- OpenJobs
- TopCandidates
- TeamPerformance
- KPICards

### 6. Specialized Layouts (src/components/layouts/specialized/):

#### TimelineLayout.tsx
Vertical timeline:
- Date grouping
- Item cards
- Load more

#### CalendarLayout.tsx
Calendar view:
- Month/week/day views
- Event display
- Click to view/create
- Drag to reschedule

#### PipelineLayout.tsx
Funnel/pipeline view:
- Stages as columns
- Conversion between stages
- Metrics per stage

### 7. Responsive Utilities (src/components/layouts/responsive/):

#### ResponsiveContainer.tsx
- Breakpoint-aware container
- Max-width constraints

#### ShowAt.tsx / HideAt.tsx
- Conditional render by breakpoint

#### MobileNav.tsx
- Bottom tab navigation
- Slide-out menu

## Requirements:
- Mobile-first responsive design
- Consistent spacing scale
- Dark mode support
- Smooth transitions
- Keyboard navigation
- Skip links for accessibility
- Print styles

## Layout Tokens:
```tsx
const spacing = {
  sidebar: { collapsed: 64, expanded: 256 },
  header: { height: 64 },
  page: { padding: 24, maxWidth: 1440 },
};
```

## After Components:
Export all from src/components/layouts/index.ts
