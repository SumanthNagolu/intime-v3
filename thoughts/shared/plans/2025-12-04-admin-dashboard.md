# Admin Dashboard Implementation Plan

## Overview

Implement the Admin Dashboard as specified in `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md`. This includes setting up the tRPC foundation (currently not implemented) and building the dashboard with system health metrics, critical alerts, quick actions, and recent activity.

## Current State Analysis

### What Exists
- **Dashboard widgets**: `StatsCard`, `ActivityFeedWidget`, `QuickActionsWidget`, `DashboardShell` in `src/components/dashboard/`
- **Layout components**: `SidebarLayout`, `Sidebar`, `Breadcrumb` in `src/components/`
- **Command palette**: Implemented with Cmd+K at `src/components/navigation/CommandPalette.tsx` (has hardcoded recruiting routes)
- **Supabase client**: `src/lib/supabase/client.ts` (browser client only)
- **Database**: 290+ tables via SQL migrations, including `audit_logs`, `user_profiles`, `organizations`, `approval_instances`
- **tRPC packages**: Installed (`@trpc/server@11.7.1`, `@trpc/client@11.7.1`, `@trpc/react-query@11.7.1`)

### What's Missing
- `src/server/` directory does not exist (no tRPC setup)
- No API routes (`src/app/api/trpc/`)
- No admin routes (`src/app/employee/admin/`)
- No Zustand stores (`src/stores/`)
- No server-side Supabase client
- No admin navigation configuration

### Key Discoveries
- Drizzle ORM is installed but not configured - using direct Supabase queries
- `audit_logs` table is partitioned monthly for performance
- Role system exists: `user_profiles` → `user_roles` → `roles` → `role_permissions` → `permissions`
- No `system_health` table - metrics derived from existing tables

## Desired End State

After this implementation:

1. Admin users can access `/employee/admin/dashboard`
2. Dashboard displays:
   - System health metrics (users, integrations, approvals, storage)
   - Critical alerts (from notifications/audit logs)
   - Quick action buttons
   - Recent activity timeline
3. Sidebar navigation works with admin sections
4. Command palette includes admin navigation items
5. tRPC foundation is established for future features

### Verification Criteria
- [x] `/employee/admin/dashboard` renders without errors
- [x] All 5 system health metrics display (even if mock/zero values)
- [x] Quick actions navigate to correct routes
- [x] Recent activity shows formatted timestamps
- [x] Sidebar navigation highlights active item
- [x] Cmd+K shows admin navigation items
- [x] `pnpm build` succeeds without type errors

## What We're NOT Doing

- Real-time WebSocket updates (future enhancement per spec)
- Customizable dashboard widgets (future enhancement)
- Dashboard export/reporting (future enhancement)
- Full admin role verification middleware (only basic checks)
- Integration health check system (mocked for now)
- Storage usage calculation (mocked for now)
- API usage metrics (mocked for now)

## Implementation Approach

We'll build in 4 phases:
1. **tRPC Foundation**: Set up the tRPC infrastructure
2. **Admin Router**: Create admin-specific tRPC procedures
3. **Dashboard UI**: Build the dashboard page and components
4. **Navigation & Polish**: Integrate with navigation and command palette

---

## Phase 1: tRPC Foundation

### Overview
Set up the tRPC infrastructure including server initialization, context, middleware, and Next.js API handler. This enables type-safe API calls for the admin dashboard and all future features.

### Changes Required

#### 1. Server-side Supabase Client
**File**: `src/lib/supabase/server.ts` (NEW)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

#### 2. tRPC Initialization
**File**: `src/server/trpc/init.ts` (NEW)
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
export const createCallerFactory = t.createCallerFactory
```

#### 3. tRPC Context
**File**: `src/server/trpc/context.ts` (NEW)
```typescript
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User | null
  orgId: string | null
}

export async function createContext(): Promise<Context> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let orgId: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('auth_id', user.id)
      .single()

    orgId = profile?.org_id ?? null
  }

  return {
    supabase,
    user,
    orgId,
  }
}
```

#### 4. tRPC Middleware
**File**: `src/server/trpc/middleware.ts` (NEW)
```typescript
import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from './init'

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

const hasOrg = middleware(async ({ ctx, next }) => {
  if (!ctx.orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must belong to an organization',
    })
  }
  return next({
    ctx: {
      ...ctx,
      orgId: ctx.orgId,
    },
  })
})

export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = protectedProcedure.use(hasOrg)
```

#### 5. Root Router
**File**: `src/server/trpc/root.ts` (NEW)
```typescript
import { router } from './init'
import { adminRouter } from '../routers/admin'

export const appRouter = router({
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
```

#### 6. API Route Handler
**File**: `src/app/api/trpc/[trpc]/route.ts` (NEW)
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/trpc/root'
import { createContext } from '@/server/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  })

export { handler as GET, handler as POST }
```

#### 7. tRPC Client Setup
**File**: `src/lib/trpc/client.ts` (NEW)
```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/trpc/root'

export const trpc = createTRPCReact<AppRouter>()
```

#### 8. tRPC Provider
**File**: `src/lib/trpc/Provider.tsx` (NEW)
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'
import { trpc } from './client'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

#### 9. Update Root Layout
**File**: `src/app/layout.tsx`
**Changes**: Wrap with TRPCProvider

```typescript
// Add import
import { TRPCProvider } from '@/lib/trpc/Provider'

// Wrap children in body
<body className="min-h-screen bg-cream antialiased font-body">
  <TRPCProvider>
    {/* existing content */}
  </TRPCProvider>
</body>
```

### Success Criteria

#### Automated Verification:
- [x] `pnpm build` succeeds without errors
- [x] `pnpm lint` passes
- [x] TypeScript compilation succeeds for all new files
- [x] API endpoint responds at `/api/trpc`

#### Manual Verification:
- [ ] No console errors when loading any page
- [ ] tRPC Provider initializes without issues

**Implementation Note**: After completing this phase, verify all automated checks pass before proceeding.

---

## Phase 2: Admin Router

### Overview
Create the admin tRPC router with procedures for system health, alerts, and activity data. These procedures query Supabase tables to provide dashboard data.

### Changes Required

#### 1. Admin Router
**File**: `src/server/routers/admin.ts` (NEW)
```typescript
import { z } from 'zod'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

export const adminRouter = router({
  getSystemHealth: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get active users count
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_active', true)

      // Get integrations count
      const { data: integrations } = await supabase
        .from('event_subscriptions')
        .select('is_active')
        .eq('org_id', orgId)

      const totalIntegrations = integrations?.length ?? 0
      const activeIntegrations = integrations?.filter(i => i.is_active).length ?? 0

      // Get pending approvals count
      const { count: pendingApprovals } = await supabase
        .from('approval_instances')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'pending')

      return {
        activeUsers: activeUsers ?? 0,
        totalIntegrations,
        activeIntegrations,
        pendingApprovals: pendingApprovals ?? 0,
        // Mocked for now - would require system monitoring
        uptime: 99.9,
        storageUsed: 45,
        storageTotal: 100,
      }
    }),

  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get high priority notifications as alerts
      const { data: alerts } = await supabase
        .from('notifications')
        .select('id, title, message, notification_type, created_at, priority')
        .eq('org_id', orgId)
        .eq('is_archived', false)
        .in('priority', ['high', 'urgent'])
        .order('created_at', { ascending: false })
        .limit(10)

      return alerts?.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        type: alert.notification_type,
        severity: alert.priority === 'urgent' ? 'critical' : 'warning',
        createdAt: alert.created_at,
      })) ?? []
    }),

  getRecentActivity: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get recent audit log entries
      const { data: activities } = await supabase
        .from('audit_logs')
        .select('id, action, table_name, user_email, created_at, old_values, new_values')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20)

      return activities?.map(activity => ({
        id: activity.id,
        action: activity.action,
        entity: activity.table_name,
        actor: activity.user_email,
        timestamp: activity.created_at,
        details: activity.new_values,
      })) ?? []
    }),
})
```

### Success Criteria

#### Automated Verification:
- [x] `pnpm build` succeeds
- [x] TypeScript types are properly inferred for all procedures
- [x] No Zod validation errors in input schemas

#### Manual Verification:
- [ ] API calls return expected data structure (can test via browser console)
- [ ] Error handling works for unauthenticated requests

**Implementation Note**: After completing this phase, test the API endpoints before proceeding.

---

## Phase 3: Dashboard UI

### Overview
Create the admin dashboard page and components using existing widgets (`StatsCard`, `ActivityFeedWidget`, `QuickActionsWidget`, `DashboardShell`).

### Changes Required

#### 1. Admin Dashboard Page
**File**: `src/app/employee/admin/dashboard/page.tsx` (NEW)
```typescript
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return <AdminDashboard />
}
```

#### 2. Admin Layout
**File**: `src/app/employee/admin/layout.tsx` (NEW)
```typescript
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { adminNavSections } from '@/lib/navigation/adminNavConfig'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      sections={adminNavSections}
      title="Admin Portal"
    >
      {children}
    </SidebarLayout>
  )
}
```

#### 3. Admin Navigation Config
**File**: `src/lib/navigation/adminNavConfig.ts` (NEW)
```typescript
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Database,
  Workflow,
  FileText,
  Bell,
  Flag,
  AlertTriangle,
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

export const adminNavSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/employee/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        label: 'Users',
        href: '/employee/admin/users',
        icon: Users,
      },
      {
        label: 'Roles',
        href: '/employee/admin/roles',
        icon: Shield,
      },
      {
        label: 'Permissions',
        href: '/employee/admin/permissions',
        icon: Shield,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Settings',
        href: '/employee/admin/settings',
        icon: Settings,
      },
      {
        label: 'Integrations',
        href: '/employee/admin/integrations',
        icon: Workflow,
      },
      {
        label: 'Workflows',
        href: '/employee/admin/workflows',
        icon: Workflow,
      },
      {
        label: 'Email Templates',
        href: '/employee/admin/email-templates',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        label: 'Audit Logs',
        href: '/employee/admin/audit',
        icon: FileText,
      },
      {
        label: 'Notifications',
        href: '/employee/admin/notifications',
        icon: Bell,
      },
      {
        label: 'Feature Flags',
        href: '/employee/admin/feature-flags',
        icon: Flag,
      },
      {
        label: 'Emergency',
        href: '/employee/admin/emergency',
        icon: AlertTriangle,
      },
    ],
  },
]
```

#### 4. Admin Dashboard Component
**File**: `src/components/admin/AdminDashboard.tsx` (NEW)
```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardGrid,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ActivityFeedWidget } from '@/components/dashboard/ActivityFeedWidget'
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget'
import { SystemHealthSkeleton } from './SystemHealthSkeleton'
import { AlertsSection } from './AlertsSection'
import {
  Users,
  Plug,
  Clock,
  HardDrive,
  CheckCircle,
} from 'lucide-react'

export function AdminDashboard() {
  const healthQuery = trpc.admin.getSystemHealth.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every 60 seconds
  })

  const alertsQuery = trpc.admin.getCriticalAlerts.useQuery()

  const activityQuery = trpc.admin.getRecentActivity.useQuery()

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Dashboard' },
  ]

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      href: '/employee/admin/users/new',
      variant: 'primary' as const,
    },
    {
      id: 'create-pod',
      label: 'Create Pod',
      href: '/employee/admin/pods/new',
    },
    {
      id: 'audit-logs',
      label: 'View Audit Logs',
      href: '/employee/admin/audit',
    },
    {
      id: 'settings',
      label: 'System Settings',
      href: '/employee/admin/settings',
    },
  ]

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Monitor system health and manage platform settings"
      breadcrumbs={breadcrumbs}
    >
      {/* System Health Metrics */}
      <DashboardSection title="System Health">
        {healthQuery.isLoading ? (
          <SystemHealthSkeleton />
        ) : healthQuery.error ? (
          <div className="text-red-600">Failed to load system health</div>
        ) : (
          <DashboardGrid columns={4}>
            <StatsCard
              title="Active Users"
              value={healthQuery.data?.activeUsers ?? 0}
              icon={Users}
            />
            <StatsCard
              title="Integrations"
              value={`${healthQuery.data?.activeIntegrations ?? 0}/${healthQuery.data?.totalIntegrations ?? 0}`}
              subtitle="active"
              icon={Plug}
              variant={
                (healthQuery.data?.activeIntegrations ?? 0) < (healthQuery.data?.totalIntegrations ?? 0)
                  ? 'warning'
                  : 'success'
              }
            />
            <StatsCard
              title="Pending Approvals"
              value={healthQuery.data?.pendingApprovals ?? 0}
              icon={CheckCircle}
              variant={
                (healthQuery.data?.pendingApprovals ?? 0) > 10
                  ? 'warning'
                  : 'default'
              }
            />
            <StatsCard
              title="Uptime"
              value={`${healthQuery.data?.uptime ?? 0}%`}
              icon={Clock}
              variant="success"
            />
            <StatsCard
              title="Storage"
              value={`${healthQuery.data?.storageUsed ?? 0}%`}
              subtitle="used"
              icon={HardDrive}
              variant={
                (healthQuery.data?.storageUsed ?? 0) > 80
                  ? 'warning'
                  : 'default'
              }
            />
          </DashboardGrid>
        )}
      </DashboardSection>

      {/* Critical Alerts */}
      <AlertsSection
        alerts={alertsQuery.data ?? []}
        isLoading={alertsQuery.isLoading}
      />

      {/* Quick Actions */}
      <DashboardSection title="Quick Actions">
        <QuickActionsWidget actions={quickActions} />
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        title="Recent Activity"
        action={
          <a
            href="/employee/admin/audit"
            className="text-sm text-forest-600 hover:text-forest-700"
          >
            View All
          </a>
        }
      >
        <ActivityFeedWidget
          activities={activityQuery.data?.map(a => ({
            id: a.id,
            title: `${a.action} ${a.entity}`,
            description: a.actor ?? 'System',
            timestamp: new Date(a.timestamp),
            icon: FileText,
          })) ?? []}
          isLoading={activityQuery.isLoading}
          maxItems={10}
        />
      </DashboardSection>
    </DashboardShell>
  )
}
```

#### 5. System Health Skeleton
**File**: `src/components/admin/SystemHealthSkeleton.tsx` (NEW)
```typescript
import { DashboardGrid } from '@/components/dashboard/DashboardShell'

export function SystemHealthSkeleton() {
  return (
    <DashboardGrid columns={4}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-28 bg-charcoal-100 animate-pulse rounded-xl"
        />
      ))}
    </DashboardGrid>
  )
}
```

#### 6. Alerts Section
**File**: `src/components/admin/AlertsSection.tsx` (NEW)
```typescript
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning'
  createdAt: string
}

interface AlertsSectionProps {
  alerts: Alert[]
  isLoading: boolean
}

export function AlertsSection({ alerts, isLoading }: AlertsSectionProps) {
  if (isLoading) {
    return (
      <DashboardSection title="Critical Alerts">
        <div className="h-24 bg-charcoal-100 animate-pulse rounded-xl" />
      </DashboardSection>
    )
  }

  if (alerts.length === 0) {
    return (
      <DashboardSection title="Critical Alerts">
        <div className="card-premium p-6 text-center text-charcoal-500">
          No critical alerts at this time
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title={`Critical Alerts (${alerts.length})`}
      action={
        <a
          href="/employee/admin/notifications"
          className="text-sm text-forest-600 hover:text-forest-700"
        >
          View All
        </a>
      }
    >
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'card-premium p-4 flex items-start gap-3',
              alert.severity === 'critical'
                ? 'border-l-4 border-l-red-500'
                : 'border-l-4 border-l-amber-500'
            )}
          >
            {alert.severity === 'critical' ? (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-charcoal-900">{alert.title}</p>
              <p className="text-sm text-charcoal-600 mt-1">{alert.message}</p>
              <p className="text-xs text-charcoal-400 mt-2">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  )
}
```

#### 7. Component Index Export
**File**: `src/components/admin/index.ts` (NEW)
```typescript
export { AdminDashboard } from './AdminDashboard'
export { SystemHealthSkeleton } from './SystemHealthSkeleton'
export { AlertsSection } from './AlertsSection'
```

### Success Criteria

#### Automated Verification:
- [x] `pnpm build` succeeds
- [x] `pnpm lint` passes
- [x] No TypeScript errors in admin components
- [x] All imports resolve correctly

#### Manual Verification:
- [ ] `/employee/admin/dashboard` renders the dashboard
- [ ] System health metrics display (with loading states)
- [ ] Alerts section shows or empty state
- [ ] Quick actions have working hover states
- [ ] Activity feed displays formatted items
- [ ] Sidebar navigation is visible and works
- [ ] Responsive layout works on mobile

**Implementation Note**: After completing this phase, manually test all dashboard sections before proceeding.

---

## Phase 4: Navigation & Polish

### Overview
Update the command palette with admin navigation routes and ensure consistent styling across the dashboard.

### Changes Required

#### 1. Update Command Palette Navigation
**File**: `src/components/navigation/CommandPalette.tsx`
**Changes**: Add admin routes to the navigation array

Find the navigation items array (around line 50-113) and add admin routes:

```typescript
// Add to the navigationItems array
{
  id: 'admin-dashboard',
  title: 'Admin Dashboard',
  description: 'System overview and health',
  href: '/employee/admin/dashboard',
  icon: LayoutDashboard,
  category: 'Admin',
},
{
  id: 'admin-users',
  title: 'User Management',
  description: 'Manage users and invitations',
  href: '/employee/admin/users',
  icon: Users,
  category: 'Admin',
},
{
  id: 'admin-roles',
  title: 'Role Management',
  description: 'Configure roles and permissions',
  href: '/employee/admin/roles',
  icon: Shield,
  category: 'Admin',
},
{
  id: 'admin-settings',
  title: 'System Settings',
  description: 'Configure system settings',
  href: '/employee/admin/settings',
  icon: Settings,
  category: 'Admin',
},
{
  id: 'admin-audit',
  title: 'Audit Logs',
  description: 'View system audit trail',
  href: '/employee/admin/audit',
  icon: FileText,
  category: 'Admin',
},
```

#### 2. Fix StatsCard Subtitle Prop (if needed)
**File**: `src/components/dashboard/StatsCard.tsx`
**Changes**: Ensure subtitle prop is supported

Check if the `subtitle` prop exists in StatsCard. If not, add it:

```typescript
interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string  // Add if missing
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'error'
  // ... other props
}
```

#### 3. Fix ActivityFeedWidget Props (if needed)
**File**: `src/components/dashboard/ActivityFeedWidget.tsx`
**Changes**: Ensure isLoading prop is supported

Check if `isLoading` prop exists. If not, add loading state handling.

### Success Criteria

#### Automated Verification:
- [x] `pnpm build` succeeds
- [x] `pnpm lint` passes

#### Manual Verification:
- [ ] Cmd+K opens command palette
- [ ] Typing "admin" shows admin navigation items
- [ ] Clicking admin items navigates correctly
- [ ] All dashboard metrics display correctly
- [ ] Hover states and transitions work smoothly
- [ ] No console errors or warnings

**Implementation Note**: After completing this phase, perform full end-to-end testing.

---

## Testing Strategy

### Unit Tests (Future)
- tRPC router procedures return correct data shapes
- Component rendering with mock data
- Error state handling

### Integration Tests (Future)
- Full dashboard load with authenticated user
- Navigation between admin pages
- Command palette search and navigation

### Manual Testing Steps
1. Sign in as a user with admin access
2. Navigate to `/employee/admin/dashboard`
3. Verify all system health metrics display
4. Verify alerts section shows or displays empty state
5. Click each quick action button - verify navigation
6. Scroll through recent activity
7. Click sidebar navigation items - verify routing
8. Press Cmd+K and search for "admin"
9. Test on mobile viewport - verify responsive behavior
10. Check browser console for errors

## Performance Considerations

- System health queries have 60-second refetch interval
- Initial page load may be slow without caching
- Consider adding Redis/cache layer for metrics (future)
- Audit logs query limited to 20 items for performance

## Migration Notes

No data migration required - this creates new UI for existing data.

## References

- Original epic: `thoughts/shared/epics/epic-01-admin/01-admin-dashboard.md`
- Research document: `thoughts/shared/research/2025-12-04-admin-dashboard-codebase-research.md`
- Source spec: `docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md`
- UI Design System: `.claude/rules/ui-design-system.md`
- Backend Architecture: `.claude/rules/backend-architecture.md`
