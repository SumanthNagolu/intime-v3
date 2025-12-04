# User Story: Admin Dashboard & Overview

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-001
**Priority:** High
**Estimated Context:** ~30K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md`

---

## User Story

**As an** Admin user,
**I want** a centralized dashboard that shows system health, quick actions, and navigation to all admin functions,
**So that** I can efficiently monitor and manage the InTime OS platform.

---

## Acceptance Criteria

### AC-1: Dashboard Layout
- [ ] Dashboard displays in AppShell with admin-specific navigation
- [ ] Shows system health metrics prominently
- [ ] Displays critical alerts and notifications
- [ ] Provides quick action tiles for common tasks
- [ ] Shows recent activity summary

### AC-2: System Health Metrics
- [ ] Display total active users count
- [ ] Display active integrations count with status
- [ ] Display pending approvals count
- [ ] Display system uptime percentage
- [ ] Display storage usage
- [ ] Display API usage (requests/hour)

### AC-3: Critical Alerts
- [ ] Show integration failures with severity indicator
- [ ] Show security alerts (failed logins, suspicious activity)
- [ ] Show SLA breaches
- [ ] Show pending compliance items
- [ ] Alerts link to detailed view

### AC-4: Quick Actions
- [ ] Add User button
- [ ] Create Pod button
- [ ] View Audit Logs button
- [ ] System Settings button
- [ ] Run Health Check button

### AC-5: Navigation
- [ ] Sidebar navigation to all admin modules
- [ ] Breadcrumb navigation
- [ ] Command palette support (Cmd+K)
- [ ] Keyboard shortcuts for common actions

---

## UI/UX Requirements

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SYSTEM HEALTH                                                │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│ │ Users    │Integr.   │ Pending  │ Uptime   │ Storage  │   │
│ │ 247      │ 16/18    │ 12       │ 99.9%    │ 45%      │   │
│ │ active   │ active   │ approvals│          │ used     │   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                                                              │
│ CRITICAL ALERTS (2)                              [View All] │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🔴 SMTP Integration: Connection timeout (15 min ago)     ││
│ │ 🟡 SLA Warning: 3 submissions approaching breach         ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ QUICK ACTIONS                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ + User   │ │ + Pod    │ │ Audit    │ │ Settings │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│ RECENT ACTIVITY                                  [View All] │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 10:30 AM - Admin created user: john.doe@company.com      ││
│ │ 10:15 AM - Workflow "Job Approval" activated             ││
│ │ 09:45 AM - Permission override created for Sarah Patel   ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Navigation Structure
```
Admin Portal
├── Dashboard (Home)
├── Users
│   ├── All Users
│   ├── Roles
│   └── Invitations
├── Pods
├── Permissions
├── Integrations
├── Settings
│   ├── System
│   └── Organization
├── Data Management
├── Workflows
├── Email Templates
├── Audit Logs
├── SLA Configuration
├── Activity Patterns
├── Feature Flags
└── Emergency Procedures
```

### Design Tokens
- Background: `bg-cream` (#FDFBF7)
- Cards: `bg-white` with `shadow-elevation-sm`
- Metric cards: Hover state `shadow-elevation-md`
- Alert colors: Error `text-red-600`, Warning `text-amber-600`, Success `text-green-600`
- Primary action: `bg-forest-500` (#0D4C3B)

---

## Technical Implementation

### Component Structure
```typescript
// src/app/employee/admin/dashboard/page.tsx
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}

// src/components/admin/AdminDashboard.tsx
export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <SystemHealthMetrics />
      <CriticalAlerts />
      <QuickActions />
      <RecentActivity />
    </div>
  );
}
```

### tRPC Endpoints
```typescript
// src/server/routers/admin.ts
export const adminRouter = router({
  getSystemHealth: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const [users, integrations, approvals] = await Promise.all([
        ctx.db.query.userProfiles.findMany({
          where: eq(userProfiles.orgId, ctx.org.id)
        }),
        ctx.db.query.integrations.findMany({
          where: eq(integrations.orgId, ctx.org.id)
        }),
        ctx.db.query.workflowApprovals.findMany({
          where: and(
            eq(workflowApprovals.orgId, ctx.org.id),
            eq(workflowApprovals.status, 'pending')
          )
        })
      ]);

      return {
        activeUsers: users.filter(u => u.status === 'active').length,
        totalIntegrations: integrations.length,
        activeIntegrations: integrations.filter(i => i.status === 'active').length,
        pendingApprovals: approvals.length,
        uptime: await getSystemUptime(),
        storageUsage: await getStorageUsage(ctx.org.id)
      };
    }),

  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const alerts = await ctx.db.query.securityAlerts.findMany({
        where: and(
          eq(securityAlerts.orgId, ctx.org.id),
          eq(securityAlerts.status, 'open'),
          inArray(securityAlerts.severity, ['critical', 'high'])
        ),
        orderBy: desc(securityAlerts.createdAt),
        limit: 10
      });
      return alerts;
    }),

  getRecentActivity: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const activities = await ctx.db.query.auditEvents.findMany({
        where: eq(auditEvents.orgId, ctx.org.id),
        orderBy: desc(auditEvents.timestamp),
        limit: 20
      });
      return activities;
    })
});
```

### State Management
```typescript
// src/stores/admin-dashboard.ts
import { create } from 'zustand';

interface AdminDashboardState {
  selectedTimeRange: '24h' | '7d' | '30d';
  setTimeRange: (range: '24h' | '7d' | '30d') => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  selectedTimeRange: '24h',
  setTimeRange: (range) => set({ selectedTimeRange: range }),
  refreshInterval: 60000, // 1 minute
  setRefreshInterval: (interval) => set({ refreshInterval: interval })
}));
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-DASH-001 | Navigate to dashboard | Dashboard loads with all sections visible |
| ADMIN-DASH-002 | View system health | Shows correct counts for users, integrations, approvals |
| ADMIN-DASH-003 | View critical alerts | Shows recent critical/high alerts with links |
| ADMIN-DASH-004 | Click quick action | Navigates to correct admin page |
| ADMIN-DASH-005 | View recent activity | Shows recent audit events with timestamps |
| ADMIN-DASH-006 | Auto-refresh | Dashboard refreshes metrics every 60 seconds |
| ADMIN-DASH-007 | Keyboard navigation | Cmd+K opens command palette |
| ADMIN-DASH-008 | Non-admin access | Returns 403 Forbidden |

---

## Dependencies

- Requires authentication system
- Requires audit logging system
- Requires integration health check system
- Requires workflow approval system

---

## Out of Scope

- Real-time WebSocket updates (future enhancement)
- Customizable dashboard widgets (future enhancement)
- Dashboard export/reporting (future enhancement)
