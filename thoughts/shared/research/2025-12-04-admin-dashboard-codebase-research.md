---
date: 2025-12-04T19:46:37Z
researcher: Claude
git_commit: 30516d1a5db25a205f6e46b7c311d4b7807f4eff
branch: main
repository: intime-v3
topic: "Admin Dashboard Implementation Research"
tags: [research, codebase, admin, dashboard, navigation, trpc, zustand]
status: complete
last_updated: 2025-12-04
last_updated_by: Claude
---

# Research: Admin Dashboard Implementation

**Date**: 2025-12-04T19:46:37Z
**Researcher**: Claude
**Git Commit**: 30516d1a5db25a205f6e46b7c311d4b7807f4eff
**Branch**: main
**Repository**: intime-v3

## Research Question

Research the codebase to understand how the system works and what files+line numbers are relevant to implementing the Admin Dashboard requirement defined in `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md`.

## Summary

The Admin Dashboard implementation requires building a new dashboard with system health metrics, critical alerts, quick actions, and navigation. The codebase has:

1. **Active dashboard components** in `src/components/dashboard/` ready for use
2. **AppShell/layout system** using modular components (`SidebarLayout`, `DashboardShell`)
3. **Command palette** already implemented with Cmd+K support
4. **No admin routes or tRPC routers exist yet** - these need to be created
5. **Navigation configuration** exists in archive as reference
6. **No Zustand stores exist** - pattern documented but not implemented

---

## Detailed Findings

### 1. Layout System

The codebase uses modular layout components rather than a monolithic AppShell.

#### Root Layout
**File**: `src/app/layout.tsx:11-30`
- Wraps entire app with `bg-cream` background (line 18)
- Includes `CommandPaletteProvider` for Cmd+K (line 26)
- Includes `Toaster` for notifications (line 25)

#### SidebarLayout Component
**File**: `src/components/layouts/SidebarLayout.tsx:6-50`
- **Props**: `children`, `sections`, `breadcrumbs`, `title`, `description`, `actions`
- Sidebar: 256px width (`w-64`), hidden on mobile (line 27)
- Main content uses `container-premium` class (line 30)
- Integrates `Sidebar` and `Breadcrumb` components

#### DashboardShell Component
**File**: `src/components/dashboard/DashboardShell.tsx:14-48`
- **Props**: `title`, `description`, `breadcrumbs`, `actions`, `children`
- Provides dashboard page structure with header
- Helper components: `DashboardGrid` (lines 51-71), `DashboardSection` (lines 73-95)

#### Container Utilities
**File**: `src/app/globals.css:164-189`
- `.container-premium`: Max width container with responsive padding
- `.card-premium`: White background with shadow and hover elevation
- `.card-glass`: Glass morphism effect

### 2. Dashboard Components (Active)

#### StatsCard
**File**: `src/components/dashboard/StatsCard.tsx:1-79`
- Displays metric with title, value, trend indicator
- **Variants**: `default`, `success`, `warning`, `error` (lines 40-45)
- Includes icon display and hover shadow effects

#### ActivityFeedWidget
**File**: `src/components/dashboard/ActivityFeedWidget.tsx:1-96`
- Activity timeline with icons, titles, timestamps
- **Props**: `activities`, `maxItems` (default 5), `showViewAll`
- Uses date-fns for timestamp formatting (line 81)

#### QuickActionsWidget
**File**: `src/components/dashboard/QuickActionsWidget.tsx:1-111`
- Grid of action buttons with navigation
- **Variants**: `default`, `primary`, `premium` (lines 44-48)
- Supports `href` links or `onClick` handlers

#### Exports
**File**: `src/components/dashboard/index.ts:1-4`
```typescript
export { StatsCard } from './StatsCard'
export { ActivityFeedWidget } from './ActivityFeedWidget'
export { QuickActionsWidget } from './QuickActionsWidget'
export { DashboardShell, DashboardGrid, DashboardSection } from './DashboardShell'
```

### 3. Navigation System

#### Sidebar Component
**File**: `src/components/navigation/Sidebar.tsx:27-138`
- **Type definitions** (lines 9-20): `SidebarItem`, `SidebarSection`
- Auto-expands nested items if child is active (lines 67-71)
- Active state: `bg-forest-50 text-forest-700` with left border (line 88)
- Badge support with gold styling (lines 77-81)

#### Command Palette (Already Implemented)
**File**: `src/components/navigation/CommandPalette.tsx:1-487`
- Global shortcut: Cmd+K / Ctrl+K (lines 315-325)
- Keyboard navigation: Arrow keys, Enter, Escape (lines 288-312)
- Categories: Recent, Navigation, Quick Actions (lines 203-247)
- Recent items stored in localStorage (lines 165-200)
- **Currently has hardcoded recruiting routes** (lines 50-113)

#### CommandPaletteProvider
**File**: `src/components/navigation/CommandPaletteProvider.tsx:10-14`
- Renders CommandPalette globally
- Integrated in root layout at `src/app/layout.tsx:26`

#### Archived Navigation Config (Reference)
**File**: `.archive/ui-reference/navigation/navConfig.ts:667-782`
- Admin navigation definition with 4 sections:
  - Main (Dashboard)
  - User Management (Users, Roles, Pods, Permissions)
  - System (Settings, Integrations, Workflows, SLA, etc.)
  - Data (Data Hub, Audit Logs, System Logs)

#### Breadcrumb Component
**File**: `src/components/ui/breadcrumb.tsx:17-52`
- Home icon link, chevron separators
- Active items: bold text, no link

### 4. Admin Routes & Components

**Status**: No admin implementation exists yet in `src/`

#### Expected Route Structure (from specs):
```
src/app/employee/admin/
├── dashboard/page.tsx
├── users/page.tsx
├── users/invite/page.tsx
├── roles/page.tsx
├── pods/page.tsx
├── permissions/page.tsx
├── settings/page.tsx
├── integrations/page.tsx
├── workflows/page.tsx
├── audit/page.tsx
└── data/page.tsx
```

#### Archived Screen Definitions (Reference)
**File**: `.archive/ui-reference/screens/admin/index.ts:99-253`
- 31 screen definitions for all admin pages
- Includes `adminNavigation` structure (line 158)

#### Archived AdminLayout (Reference)
**File**: `.archive/ui-reference/layouts/AdminLayout.tsx:32-156`
- Admin-specific layout with permission check
- Sidebar navigation with collapsible sections

### 5. tRPC Router Patterns

**Status**: No actual tRPC implementation exists yet in `src/server/`

#### Dependencies (Installed)
**File**: `package.json:99-101`
```json
"@trpc/client": "^11.7.1",
"@trpc/react-query": "^11.7.1",
"@trpc/server": "^11.7.1"
```

#### Documented Patterns
**File**: `.claude/rules/backend-architecture.md:9-146`
- Procedure types: `publicProcedure`, `protectedProcedure`, `orgProtectedProcedure`
- All queries must filter by `org_id` (lines 90-105)
- Audit fields: `created_by`, `updated_by` on create/update (lines 123-146)
- Error handling with `TRPCError` (lines 60-84)

#### Admin Router Example (from epic doc)
**File**: `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md:151-204`
```typescript
// Proposed: src/server/routers/admin.ts
export const adminRouter = router({
  getSystemHealth: orgProtectedProcedure.query(async ({ ctx }) => {
    // Return: activeUsers, integrations, pendingApprovals, uptime, storageUsage
  }),
  getCriticalAlerts: orgProtectedProcedure.query(async ({ ctx }) => {
    // Return: security alerts with severity filtering
  }),
  getRecentActivity: orgProtectedProcedure.query(async ({ ctx }) => {
    // Return: recent audit events
  })
})
```

### 6. Zustand Store Patterns

**Status**: No stores implemented yet

#### Dependency (Installed)
**File**: `package.json:134`
```json
"zustand": "^5.0.8"
```

#### Documented Pattern (from epic doc)
**File**: `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md:207-224`
```typescript
// Proposed: src/stores/admin-dashboard.ts
interface AdminDashboardState {
  selectedTimeRange: '24h' | '7d' | '30d';
  setTimeRange: (range: '24h' | '7d' | '30d') => void;
  refreshInterval: number;  // 60000ms (1 minute)
  setRefreshInterval: (interval: number) => void;
}
```

### 7. Toast/Alert System

#### Toast Components (Active)
**File**: `src/components/ui/toast.tsx:29-127`
- Variants: `default`, `success`, `error`, `warning`, `info`
- Icons mapped by variant (lines 121-127)

**File**: `src/components/ui/use-toast.ts:7-8`
- `TOAST_LIMIT`: 5
- `TOAST_REMOVE_DELAY`: 5000ms

### 8. Design Tokens

From requirement doc `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md:117-123`:
- Background: `bg-cream` (#FDFBF7)
- Cards: `bg-white` with `shadow-elevation-sm`
- Metric cards hover: `shadow-elevation-md`
- Alert colors: Error `text-red-600`, Warning `text-amber-600`, Success `text-green-600`
- Primary action: `bg-forest-500` (#0D4C3B)

---

## Code References

### Active Files to Use

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/layout.tsx` | 11-30 | Root layout with providers |
| `src/components/layouts/SidebarLayout.tsx` | 6-50 | Sidebar layout component |
| `src/components/dashboard/DashboardShell.tsx` | 14-95 | Dashboard layout helpers |
| `src/components/dashboard/StatsCard.tsx` | 1-79 | Metric display card |
| `src/components/dashboard/ActivityFeedWidget.tsx` | 1-96 | Activity timeline |
| `src/components/dashboard/QuickActionsWidget.tsx` | 1-111 | Action buttons grid |
| `src/components/navigation/Sidebar.tsx` | 9-138 | Sidebar with sections |
| `src/components/navigation/CommandPalette.tsx` | 1-487 | Command palette (needs admin routes) |
| `src/components/ui/breadcrumb.tsx` | 6-52 | Breadcrumb navigation |
| `src/components/ui/toast.tsx` | 1-140 | Toast notifications |

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/employee/admin/dashboard/page.tsx` | Admin dashboard page |
| `src/components/admin/AdminDashboard.tsx` | Main dashboard component |
| `src/server/routers/admin.ts` | Admin tRPC router |
| `src/stores/admin-dashboard.ts` | Zustand store for dashboard state |
| `src/lib/navigation/adminNavConfig.ts` | Admin navigation configuration |

### Reference Files (Archived)

| File | Lines | Purpose |
|------|-------|---------|
| `.archive/ui-reference/screens/admin/admin-dashboard.screen.ts` | 1-150 | Dashboard screen definition |
| `.archive/ui-reference/screens/admin/index.ts` | 99-253 | All admin screen exports |
| `.archive/ui-reference/navigation/navConfig.ts` | 667-782 | Admin nav sections |
| `.archive/ui-reference/layouts/AdminLayout.tsx` | 32-156 | Admin layout reference |

---

## Architecture Documentation

### Layout Composition Pattern
```
Root Layout (src/app/layout.tsx)
  └── CommandPaletteProvider
  └── Toaster
  └── Page (src/app/employee/admin/dashboard/page.tsx)
      └── SidebarLayout (sections, breadcrumbs, title)
          └── Sidebar (navigation sections)
          └── DashboardShell (title, description, actions)
              └── DashboardGrid
                  └── StatsCard (metrics)
              └── DashboardSection (alerts, activity)
                  └── Alert components
                  └── ActivityFeedWidget
              └── QuickActionsWidget
```

### Data Flow Pattern
```
Page Component
  └── tRPC Queries (useQuery hooks)
      └── adminRouter.getSystemHealth
      └── adminRouter.getCriticalAlerts
      └── adminRouter.getRecentActivity
  └── Zustand Store (dashboard state)
      └── selectedTimeRange
      └── refreshInterval
  └── Render Components with data
```

### Navigation Integration Pattern
```
1. Define admin nav sections in config
2. Pass sections to SidebarLayout
3. Sidebar uses usePathname() for active state
4. Breadcrumbs passed to layout
5. CommandPalette needs admin routes added
```

---

## Related Documentation

- **Source Spec**: `docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md`
- **Epic Document**: `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md`
- **UI Design System**: `.claude/rules/ui-design-system.md`
- **Backend Architecture**: `.claude/rules/backend-architecture.md`
- **TypeScript Patterns**: `.claude/rules/typescript-patterns.md`

---

## Open Questions

1. **Database Schema**: What tables exist for system health metrics, alerts, audit logs?
2. **Authentication**: How is admin role verified in middleware?
3. **Real-time Updates**: Should metrics refresh automatically? (Spec mentions 60s intervals)
4. **Permission System**: How are admin permissions checked?
5. **Integration Status**: How to query integration health status?
