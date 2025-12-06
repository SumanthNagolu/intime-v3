# Recruiter Daily Operations (H01-H04) Implementation Plan

## Overview

This plan implements Section H: Daily Operations for the Recruiter role, covering:
- **H01**: Daily Workflow (Today View, priority management, workflow support)
- **H02**: Log Activity (Activity logging modal with all field types)
- **H03**: Recruiter Dashboard (Performance widgets, pipeline health, metrics)
- **H04**: Recruiter Reports (Report templates, generation, export)

## Current State Analysis

### Existing Infrastructure
- **tRPC**: 14 routers exist but missing core business routers (crm, activities, ats, dashboard, reports)
- **Database**: Comprehensive schema exists for activities, CRM, ATS, HR modules
- **Dashboard Components**: StatsCard, ActivityFeedWidget, QuickActionsWidget, DashboardShell available
- **UI Components**: Full Radix UI component library with luxury design system
- **Navigation**: Only admin navigation active; recruiter navigation archived

### Key Discoveries
- Activity system uses unified table (`activities`) with polymorphic entity association (`entity_type` + `entity_id`)
- Activity patterns provide templates for creating activities with predefined fields/outcomes
- Dashboard patterns established in AdminDashboard.tsx using DashboardShell + StatsCard + widgets
- Form patterns use controlled inputs with tRPC mutations and query invalidation

## Desired End State

After implementation:
1. Recruiters can access `/employee/workspace` with full Today View dashboard
2. Log Activity modal (Cmd+L hotkey) works for all activity types
3. Dashboard shows real-time sprint progress, pipeline health, and quality metrics
4. Reports page generates performance, revenue, activity, and quality reports
5. All data is org-scoped and properly secured

### Verification
- Dashboard loads with real data from database
- Activities can be created, viewed, and filtered by entity
- Reports generate accurate metrics with export capability
- Navigation works correctly for recruiter role

## What We're NOT Doing

- Email integration (auto-logging from Gmail/Outlook) - Future feature
- Voice-to-text activity logging - Future feature
- Calendar integration (Google Calendar sync) - Future feature
- Mobile-optimized responsive layouts - Future iteration
- Batch activity logging - Future feature
- Activity templates - Future feature
- Scheduled/recurring reports - Future feature
- PDF/Excel export - Phase 2 of reports

---

## Implementation Approach

The implementation is split into 5 phases:

1. **Phase 1**: Foundation - Core tRPC Routers (activities, crm, ats, dashboard)
2. **Phase 2**: Navigation & Routes (recruiter workspace routes, nav config)
3. **Phase 3**: H02 - Log Activity Modal (complete activity logging system)
4. **Phase 4**: H03 - Dashboard Widgets (all recruiter dashboard widgets)
5. **Phase 5**: H04 - Reports System (report templates and generation)

Each phase builds on the previous, with clear success criteria.

---

## Phase 1: Foundation - Core tRPC Routers

### Overview
Create the missing tRPC routers needed to support H01-H04 functionality.

### Changes Required

#### 1. Activities Router
**File**: `src/server/routers/activities.ts`

Create comprehensive activities router with:

```typescript
import { z } from 'zod'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

// Input schemas
const ActivityTypeEnum = z.enum(['email', 'call', 'meeting', 'note', 'task', 'linkedin_message'])
const DirectionEnum = z.enum(['inbound', 'outbound'])
const OutcomeEnum = z.enum(['positive', 'neutral', 'negative'])
const StatusEnum = z.enum(['scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled'])
const PriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

const LogActivityInput = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  activityType: ActivityTypeEnum,
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  direction: DirectionEnum.optional(),
  durationMinutes: z.number().min(0).max(480).optional(),
  outcome: OutcomeEnum.optional(),
  pocId: z.string().uuid().optional(),
  activityDate: z.date().optional(),
  // Follow-up
  createFollowUp: z.boolean().default(false),
  followUpSubject: z.string().max(200).optional(),
  followUpDueDate: z.date().optional(),
})

export const activitiesRouter = router({
  // Log a completed activity (H02)
  log: orgProtectedProcedure
    .input(LogActivityInput)
    .mutation(async ({ ctx, input }) => {
      // Implementation details in Phase 3
    }),

  // List activities for an entity
  listByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      activityTypes: z.array(ActivityTypeEnum).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Query activities filtered by entity
    }),

  // Get user's tasks (Today View)
  getMyTasks: orgProtectedProcedure
    .input(z.object({
      status: z.array(StatusEnum).optional(),
      priority: z.array(PriorityEnum).optional(),
      dueDate: z.enum(['overdue', 'today', 'tomorrow', 'this_week', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // Query user's assigned activities
    }),

  // Complete an activity
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcome: OutcomeEnum.optional(),
      outcomeNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mark activity as completed
    }),

  // Get activity stats for dashboard
  getStats: orgProtectedProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'sprint']).default('week'),
    }))
    .query(async ({ ctx, input }) => {
      // Aggregate activity counts
    }),
})
```

#### 2. CRM Router
**File**: `src/server/routers/crm.ts`

```typescript
export const crmRouter = router({
  // Accounts
  accounts: {
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    getHealth: orgProtectedProcedure.query(...), // Account health scores
  },

  // Leads
  leads: {
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
  },

  // Deals
  deals: {
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
  },

  // Point of Contacts (for activity logging)
  contacts: {
    search: orgProtectedProcedure.input(z.object({
      query: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      limit: z.number().default(10),
    })).query(...),
  },
})
```

#### 3. ATS Router
**File**: `src/server/routers/ats.ts`

```typescript
export const atsRouter = router({
  // Jobs
  jobs: {
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    getStats: orgProtectedProcedure.query(...), // Pipeline stats
  },

  // Submissions
  submissions: {
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    getStats: orgProtectedProcedure.query(...),
  },

  // Interviews
  interviews: {
    list: orgProtectedProcedure.input(...).query(...),
    getUpcoming: orgProtectedProcedure.query(...),
  },

  // Placements
  placements: {
    list: orgProtectedProcedure.input(...).query(...),
    getStats: orgProtectedProcedure.query(...),
  },

  // Candidates
  candidates: {
    search: orgProtectedProcedure.input(...).query(...),
  },
})
```

#### 4. Dashboard Router
**File**: `src/server/routers/dashboard.ts`

```typescript
export const dashboardRouter = router({
  // Recruiter-specific dashboard data
  recruiter: {
    // Sprint progress widget
    getSprintProgress: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { placements, revenue, submissions, interviews, candidates, jobFillRate }
      // Each with: { current, target, percentage }
    }),

    // Pipeline health widget
    getPipelineHealth: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { activeJobs, candidatesSourcing, submissionsPending, interviewsThisWeek, offersOutstanding, placementsActive }
      // Plus urgentItems array
    }),

    // Account portfolio widget
    getAccountPortfolio: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns accounts with health scores, revenue, NPS, lastContact
    }),

    // Activity summary (last 7 days)
    getActivitySummary: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { callsLogged, emailsSent, meetings, candidatesSourced, phoneScreens, submissionsSent, interviewsScheduled }
    }),

    // Quality metrics (last 30 days)
    getQualityMetrics: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { timeToSubmit, timeToFill, submissionQuality, interviewToOffer, offerAcceptance, retention30Day, overallScore }
    }),

    // Today's priorities
    getTodaysPriorities: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { overdue: [], dueToday: [], highPriority: [] }
    }),

    // Upcoming calendar
    getUpcomingCalendar: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns: { today: [], tomorrow: [], thisWeek: { clientCalls, interviews, internalMeetings } }
    }),

    // Recent wins
    getRecentWins: orgProtectedProcedure.query(async ({ ctx }) => {
      // Returns array of recent achievements
    }),
  },
})
```

#### 5. Reports Router
**File**: `src/server/routers/reports.ts`

```typescript
export const reportsRouter = router({
  // Generate report
  generate: orgProtectedProcedure
    .input(z.object({
      reportType: z.enum(['performance_summary', 'revenue_commission', 'activity_report', 'quality_metrics', 'account_portfolio', 'pipeline_analysis']),
      period: z.enum(['this_sprint', 'last_sprint', 'this_month', 'last_month', 'this_quarter', 'last_quarter', 'ytd', 'custom']),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      compareToPrevious: z.boolean().default(false),
      compareToTeam: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // Generate report data based on type
    }),

  // Get saved reports
  listSaved: orgProtectedProcedure.query(...),

  // Save report
  save: orgProtectedProcedure.mutation(...),
})
```

#### 6. Register Routers
**File**: `src/server/trpc/root.ts`

```typescript
import { activitiesRouter } from '../routers/activities'
import { crmRouter } from '../routers/crm'
import { atsRouter } from '../routers/ats'
import { dashboardRouter } from '../routers/dashboard'
import { reportsRouter } from '../routers/reports'

export const appRouter = router({
  // ... existing routers
  activities: activitiesRouter,
  crm: crmRouter,
  ats: atsRouter,
  dashboard: dashboardRouter,
  reports: reportsRouter,
})
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] All new routers are properly typed
- [ ] Routers are registered in root.ts

#### Manual Verification
- [ ] Test each router endpoint via tRPC panel or API call
- [ ] Verify org_id filtering works correctly
- [ ] Confirm proper error handling for unauthorized access

**Implementation Note**: After completing this phase, pause for verification that routers compile and basic queries work before proceeding.

---

## Phase 2: Navigation & Routes

### Overview
Set up recruiter workspace routes and navigation configuration.

### Changes Required

#### 1. Recruiter Navigation Config
**File**: `src/lib/navigation/recruiterNavConfig.ts`

```typescript
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Target,
  Activity,
  FileText,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

export const recruiterNavConfig: SidebarSection[] = [
  {
    items: [
      {
        label: 'My Dashboard',
        href: '/employee/workspace',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { label: 'Jobs', href: '/employee/workspace/jobs', icon: Briefcase },
      { label: 'Submissions', href: '/employee/workspace/submissions', icon: FileText },
      { label: 'Interviews', href: '/employee/workspace/interviews', icon: Calendar },
      { label: 'Placements', href: '/employee/workspace/placements', icon: TrendingUp },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Accounts', href: '/employee/workspace/accounts', icon: Building2 },
      { label: 'Leads', href: '/employee/workspace/leads', icon: Target },
      { label: 'Candidates', href: '/employee/workspace/candidates', icon: Users },
    ],
  },
  {
    title: 'Activity',
    items: [
      { label: 'My Tasks', href: '/employee/workspace/tasks', icon: Activity },
      { label: 'Calendar', href: '/employee/workspace/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'My Reports', href: '/employee/workspace/reports', icon: FileText },
    ],
  },
]
```

#### 2. Workspace Dashboard Page
**File**: `src/app/employee/workspace/page.tsx`

```typescript
import { RecruiterDashboard } from '@/components/recruiter/RecruiterDashboard'

export default function RecruiterWorkspacePage() {
  return <RecruiterDashboard />
}
```

#### 3. Reports Page
**File**: `src/app/employee/workspace/reports/page.tsx`

```typescript
import { RecruiterReportsPage } from '@/components/recruiter/reports/RecruiterReportsPage'

export default function ReportsPage() {
  return <RecruiterReportsPage />
}
```

#### 4. Workspace Layout
**File**: `src/app/employee/workspace/layout.tsx`

```typescript
import { AppShell } from '@/components/layouts/AppShell'
import { recruiterNavConfig } from '@/lib/navigation/recruiterNavConfig'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell navigation={recruiterNavConfig} role="recruiter">
      {children}
    </AppShell>
  )
}
```

### Success Criteria

#### Automated Verification
- [ ] Build succeeds: `pnpm build`
- [ ] Routes accessible without 404

#### Manual Verification
- [ ] Navigate to `/employee/workspace` shows dashboard placeholder
- [ ] Sidebar navigation displays correct items
- [ ] Navigation links work correctly

---

## Phase 3: H02 - Log Activity Modal

### Overview
Implement the complete Log Activity modal with all field types, activity type tabs, follow-up scheduling, and global keyboard shortcut.

### Changes Required

#### 1. Log Activity Modal Component
**File**: `src/components/recruiter/activities/LogActivityModal.tsx`

Core functionality:
- Activity type tabs (Email, Call, Meeting, LinkedIn, Note)
- Dynamic field display based on activity type
- Direction toggle (Inbound/Outbound)
- Outcome buttons (Positive/Neutral/Negative)
- Duration input for calls/meetings
- Point of Contact dropdown with search
- Custom activity date/time picker
- Follow-up scheduling panel
- Form validation
- Keyboard shortcuts (Tab navigation, Cmd+Enter submit)

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Mail, Phone, Calendar, Linkedin, FileText,
  Clock, Plus, Send, Loader2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/components/ui/use-toast'

// Activity type configurations
const ACTIVITY_TYPES = {
  email: { icon: Mail, label: 'EMAIL', color: 'blue', showSubject: true, showDirection: true, showDuration: false },
  call: { icon: Phone, label: 'CALL', color: 'green', showSubject: false, showDirection: true, showDuration: true },
  meeting: { icon: Calendar, label: 'MEETING', color: 'purple', showSubject: true, showDirection: false, showDuration: true },
  linkedin_message: { icon: Linkedin, label: 'LINKEDIN', color: 'blue', showSubject: true, showDirection: true, showDuration: false },
  note: { icon: FileText, label: 'NOTE', color: 'gray', showSubject: false, showDirection: false, showDuration: false },
}

interface LogActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType?: string
  entityId?: string
  entityName?: string
}

export function LogActivityModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName
}: LogActivityModalProps) {
  // Form state
  const [activityType, setActivityType] = useState<keyof typeof ACTIVITY_TYPES>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound')
  const [duration, setDuration] = useState('')
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative' | null>(null)
  const [pocId, setPocId] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activityDate, setActivityDate] = useState<string>('')
  const [createFollowUp, setCreateFollowUp] = useState(false)
  const [followUpSubject, setFollowUpSubject] = useState('')
  const [followUpDueDate, setFollowUpDueDate] = useState('')

  // Entity selection (for global modal)
  const [selectedEntityType, setSelectedEntityType] = useState(entityType || '')
  const [selectedEntityId, setSelectedEntityId] = useState(entityId || '')

  const utils = trpc.useUtils()

  const logMutation = trpc.activities.log.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Activity logged successfully' })
      if (data.followUp) {
        toast({
          title: `Follow-up scheduled for ${new Date(data.followUp.dueDate).toLocaleDateString()}`,
          variant: 'default'
        })
      }
      utils.activities.listByEntity.invalidate()
      utils.dashboard.recruiter.getActivitySummary.invalidate()
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast({ title: 'Failed to log activity', description: error.message, variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setActivityType('email')
    setSubject('')
    setBody('')
    setDirection('outbound')
    setDuration('')
    setOutcome(null)
    setPocId(null)
    setShowDatePicker(false)
    setActivityDate('')
    setCreateFollowUp(false)
    setFollowUpSubject('')
    setFollowUpDueDate('')
  }

  const handleSubmit = () => {
    if (!selectedEntityType || !selectedEntityId) {
      toast({ title: 'Please select an entity', variant: 'destructive' })
      return
    }

    if (!subject && !body) {
      toast({ title: 'Please enter a subject or body', variant: 'destructive' })
      return
    }

    if (createFollowUp && !followUpDueDate) {
      toast({ title: 'Follow-up due date is required', variant: 'destructive' })
      return
    }

    logMutation.mutate({
      entityType: selectedEntityType,
      entityId: selectedEntityId,
      activityType,
      subject: subject || undefined,
      body: body || undefined,
      direction: ACTIVITY_TYPES[activityType].showDirection ? direction : undefined,
      durationMinutes: duration ? parseInt(duration) : undefined,
      outcome: outcome || undefined,
      pocId: pocId || undefined,
      activityDate: activityDate ? new Date(activityDate) : undefined,
      createFollowUp,
      followUpSubject: followUpSubject || undefined,
      followUpDueDate: followUpDueDate ? new Date(followUpDueDate) : undefined,
    })
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && open) {
        e.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleSubmit])

  const config = ACTIVITY_TYPES[activityType]
  const submitLabel = `Log ${config.label.charAt(0) + config.label.slice(1).toLowerCase()}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {entityName ? `Log Activity - ${entityName}` : 'Quick Log Activity'}
          </DialogTitle>
        </DialogHeader>

        {/* Entity selector if not pre-selected */}
        {!entityType && (
          <div className="mb-4">
            <Label>Log activity for:</Label>
            {/* EntitySearchCombobox component */}
          </div>
        )}

        {/* Activity Type Tabs */}
        <Tabs value={activityType} onValueChange={(v) => setActivityType(v as keyof typeof ACTIVITY_TYPES)}>
          <TabsList className="w-full">
            {Object.entries(ACTIVITY_TYPES).map(([type, cfg]) => (
              <TabsTrigger key={type} value={type} className="flex-1">
                <cfg.icon className="w-4 h-4 mr-1" />
                {cfg.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4 py-4">
          {/* Subject field (conditional) */}
          {config.showSubject && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Subject</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="h-6 px-2"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                maxLength={200}
              />
              <p className="text-xs text-charcoal-500 mt-1 text-right">{subject.length}/200</p>
            </div>
          )}

          {/* Date/time picker panel */}
          {showDatePicker && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label>Activity Date & Time</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowDatePicker(false)}>×</Button>
              </div>
              <Input
                type="datetime-local"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                max={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-charcoal-500 mt-1">When did this activity happen? Defaults to now.</p>
            </div>
          )}

          {/* Direction toggle (conditional) */}
          {config.showDirection && (
            <div>
              <Label>Direction</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant={direction === 'outbound' ? 'default' : 'outline'}
                  onClick={() => setDirection('outbound')}
                  className="flex-1"
                >
                  Outbound
                </Button>
                <Button
                  type="button"
                  variant={direction === 'inbound' ? 'default' : 'outline'}
                  onClick={() => setDirection('inbound')}
                  className="flex-1"
                >
                  Inbound
                </Button>
              </div>
            </div>
          )}

          {/* Body/Notes textarea */}
          <div>
            <Label htmlFor="body">
              {activityType === 'note' ? 'Notes' : 'Body'}
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Log details about this ${activityType}...`}
              maxLength={5000}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-charcoal-500 mt-1 text-right">{body.length}/5000</p>
          </div>

          {/* Duration (conditional) */}
          {config.showDuration && (
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min={0}
                max={480}
              />
            </div>
          )}

          {/* Outcome buttons (not for notes) */}
          {activityType !== 'note' && (
            <div>
              <Label>Outcome</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOutcome(outcome === 'positive' ? null : 'positive')}
                  className={outcome === 'positive' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                >
                  Positive
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOutcome(outcome === 'neutral' ? null : 'neutral')}
                  className={outcome === 'neutral' ? 'bg-stone-100 text-stone-600 border-stone-200' : ''}
                >
                  Neutral
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOutcome(outcome === 'negative' ? null : 'negative')}
                  className={outcome === 'negative' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                >
                  Negative
                </Button>
              </div>
            </div>
          )}

          {/* Point of Contact dropdown */}
          <div>
            <Label>Point of Contact (Optional)</Label>
            {/* POCSearchCombobox component */}
          </div>

          {/* Follow-up scheduling */}
          {activityType !== 'note' && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateFollowUp(!createFollowUp)}
                className={`w-full justify-start ${createFollowUp ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Follow-up Activity
              </Button>

              {createFollowUp && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <p className="text-sm text-blue-700">This will create a new task linked to this activity</p>
                  <Input
                    value={followUpSubject}
                    onChange={(e) => setFollowUpSubject(e.target.value)}
                    placeholder="Follow-up subject (e.g., 'Check in after demo')"
                  />
                  <div>
                    <Label>Follow-up Due Date *</Label>
                    <Input
                      type="date"
                      value={followUpDueDate}
                      onChange={(e) => setFollowUpDueDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      required={createFollowUp}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={logMutation.isPending || (!subject && !body)}
          >
            {logMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### 2. Global Keyboard Shortcut Provider
**File**: `src/components/providers/ActivityShortcutProvider.tsx`

```typescript
'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { LogActivityModal } from '@/components/recruiter/activities/LogActivityModal'

interface ActivityShortcutContextType {
  openLogActivity: (entityType?: string, entityId?: string, entityName?: string) => void
}

const ActivityShortcutContext = createContext<ActivityShortcutContextType | null>(null)

export function useActivityShortcut() {
  const context = useContext(ActivityShortcutContext)
  if (!context) throw new Error('useActivityShortcut must be used within ActivityShortcutProvider')
  return context
}

export function ActivityShortcutProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [entityContext, setEntityContext] = useState<{
    entityType?: string
    entityId?: string
    entityName?: string
  }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+L or Ctrl+L to open Log Activity modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openLogActivity = (entityType?: string, entityId?: string, entityName?: string) => {
    setEntityContext({ entityType, entityId, entityName })
    setOpen(true)
  }

  return (
    <ActivityShortcutContext.Provider value={{ openLogActivity }}>
      {children}
      <LogActivityModal
        open={open}
        onOpenChange={setOpen}
        entityType={entityContext.entityType}
        entityId={entityContext.entityId}
        entityName={entityContext.entityName}
      />
    </ActivityShortcutContext.Provider>
  )
}
```

#### 3. Implement activities.log Mutation
**File**: `src/server/routers/activities.ts` (complete implementation)

```typescript
log: orgProtectedProcedure
  .input(LogActivityInput)
  .mutation(async ({ ctx, input }) => {
    const { orgId, user } = ctx
    const supabase = await createClient()

    // Validate at least subject or body
    if (!input.subject && !input.body) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please enter a subject or body for this activity',
      })
    }

    // Auto-generate subject for calls/notes if not provided
    let subject = input.subject
    if (!subject) {
      if (input.activityType === 'call') {
        subject = `${input.direction === 'inbound' ? 'Inbound' : 'Outbound'} call`
      } else if (input.activityType === 'note') {
        subject = 'Note'
      }
    }

    const activityDate = input.activityDate || new Date()

    // Create the activity
    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        org_id: orgId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        activity_type: input.activityType,
        subject,
        description: input.body,
        direction: input.direction,
        duration_minutes: input.durationMinutes,
        outcome: input.outcome,
        poc_id: input.pocId,
        status: 'completed',
        completed_at: activityDate.toISOString(),
        due_date: activityDate.toISOString(),
        assigned_to: user!.id,
        created_by: user!.id,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    // Create follow-up if requested
    let followUp = null
    if (input.createFollowUp && input.followUpDueDate) {
      const { data: followUpData, error: followUpError } = await supabase
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          activity_type: 'task',
          subject: input.followUpSubject || `Follow up on: ${subject}`,
          status: 'scheduled',
          due_date: input.followUpDueDate.toISOString(),
          parent_activity_id: activity.id,
          assigned_to: user!.id,
          created_by: user!.id,
        })
        .select()
        .single()

      if (!followUpError && followUpData) {
        followUp = {
          id: followUpData.id,
          activityType: 'follow_up',
          status: 'scheduled',
          subject: followUpData.subject,
          dueDate: followUpData.due_date,
          parentActivityId: activity.id,
        }
      }
    }

    // Update entity's lastContactedAt if applicable (for leads)
    if (['email', 'call', 'meeting', 'linkedin_message'].includes(input.activityType)) {
      if (input.entityType === 'lead') {
        await supabase
          .from('leads')
          .update({ last_contacted_at: activityDate.toISOString() })
          .eq('id', input.entityId)
          .eq('org_id', orgId)
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      org_id: orgId,
      user_id: user?.id,
      action: 'activity_logged',
      table_name: 'activities',
      record_id: activity.id,
      new_values: { activity_type: input.activityType, entity_type: input.entityType },
    })

    return {
      activity: {
        id: activity.id,
        entityType: activity.entity_type,
        entityId: activity.entity_id,
        activityType: activity.activity_type,
        status: activity.status,
        subject: activity.subject,
        body: activity.description,
        direction: activity.direction,
        durationMinutes: activity.duration_minutes,
        outcome: activity.outcome,
        completedAt: activity.completed_at,
        createdAt: activity.created_at,
      },
      followUp,
    }
  }),
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compiles: `pnpm build`
- [ ] Modal renders without errors

#### Manual Verification
- [ ] Press Cmd+L anywhere to open Quick Log Activity modal
- [ ] All 5 activity types show correct fields
- [ ] Direction toggle works for email/call/linkedin
- [ ] Duration field appears for call/meeting
- [ ] Outcome buttons toggle correctly
- [ ] Follow-up panel expands/collapses
- [ ] Form submission creates activity in database
- [ ] Follow-up task created when enabled
- [ ] Toast notifications appear on success/error
- [ ] Modal closes and form resets after success

---

## Phase 4: H03 - Recruiter Dashboard Widgets

### Overview
Implement all dashboard widgets for the recruiter workspace.

### Changes Required

#### 1. Sprint Progress Widget
**File**: `src/components/recruiter/dashboard/SprintProgressWidget.tsx`

```typescript
// Displays 6 metric cards: Placements, Revenue, Submissions, Interviews, Candidates, Job Fill Rate
// Each shows: current/target, percentage, color-coded status (green/yellow/red)
// Uses dashboard.recruiter.getSprintProgress query
```

#### 2. Todays Priorities Widget
**File**: `src/components/recruiter/dashboard/TodaysPrioritiesWidget.tsx`

```typescript
// Three sections: Overdue (red), Due Today (orange), High Priority (yellow)
// Uses activities.getMyTasks query with filters
// Click task to navigate or mark complete
```

#### 3. Pipeline Health Widget
**File**: `src/components/recruiter/dashboard/PipelineHealthWidget.tsx`

```typescript
// Shows: Active Jobs, Candidates Sourcing, Submissions Pending, Interviews This Week, Offers Outstanding, Placements Active
// Urgent attention alerts at bottom
// Uses dashboard.recruiter.getPipelineHealth query
```

#### 4. Account Portfolio Widget
**File**: `src/components/recruiter/dashboard/AccountPortfolioWidget.tsx`

```typescript
// List of accounts with health indicators (green/yellow/red)
// Shows: Jobs, YTD Revenue, NPS, Last Contact
// Sorted by risk level
// Uses dashboard.recruiter.getAccountPortfolio query
```

#### 5. Activity Summary Widget
**File**: `src/components/recruiter/dashboard/ActivitySummaryWidget.tsx`

```typescript
// Trailing 7-day metrics: Calls, Emails, Meetings, Candidates Sourced, Phone Screens, Submissions, Interviews
// Shows daily averages vs targets
// Uses dashboard.recruiter.getActivitySummary query
```

#### 6. Quality Metrics Widget
**File**: `src/components/recruiter/dashboard/QualityMetricsWidget.tsx`

```typescript
// 30-day quality indicators: Time-to-Submit, Time-to-Fill, Submission Quality, Interview-to-Offer, Offer Acceptance, 30-Day Retention
// Overall quality score with ranking
// Uses dashboard.recruiter.getQualityMetrics query
```

#### 7. Upcoming Calendar Widget
**File**: `src/components/recruiter/dashboard/UpcomingCalendarWidget.tsx`

```typescript
// Today's schedule, tomorrow's schedule, week overview
// Click to view full calendar
// Uses dashboard.recruiter.getUpcomingCalendar query
```

#### 8. Recent Wins Widget
**File**: `src/components/recruiter/dashboard/RecentWinsWidget.tsx`

```typescript
// List of recent achievements: placements, offers, goals hit
// Uses dashboard.recruiter.getRecentWins query
```

#### 9. Main Dashboard Component
**File**: `src/components/recruiter/RecruiterDashboard.tsx`

```typescript
'use client'

import { DashboardShell, DashboardSection, DashboardGrid } from '@/components/dashboard'
import { SprintProgressWidget } from './dashboard/SprintProgressWidget'
import { TodaysPrioritiesWidget } from './dashboard/TodaysPrioritiesWidget'
import { PipelineHealthWidget } from './dashboard/PipelineHealthWidget'
import { AccountPortfolioWidget } from './dashboard/AccountPortfolioWidget'
import { ActivitySummaryWidget } from './dashboard/ActivitySummaryWidget'
import { QualityMetricsWidget } from './dashboard/QualityMetricsWidget'
import { UpcomingCalendarWidget } from './dashboard/UpcomingCalendarWidget'
import { RecentWinsWidget } from './dashboard/RecentWinsWidget'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw } from 'lucide-react'

export function RecruiterDashboard() {
  const breadcrumbs = [
    { label: 'Workspace', href: '/employee/workspace' },
    { label: 'Dashboard' },
  ]

  return (
    <DashboardShell
      title="My Dashboard"
      description="Monitor your performance and manage daily activities"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {/* Sprint Progress - Full width */}
      <DashboardSection>
        <SprintProgressWidget />
      </DashboardSection>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Today's Priorities" action={<Button variant="link" size="sm">View All Tasks</Button>}>
          <TodaysPrioritiesWidget />
        </DashboardSection>

        <DashboardSection title="Pipeline Health" action={<Button variant="link" size="sm">View Details</Button>}>
          <PipelineHealthWidget />
        </DashboardSection>
      </div>

      {/* Account Portfolio - Full width */}
      <DashboardSection title="Account Portfolio" action={<Button variant="link" size="sm">View Accounts</Button>}>
        <AccountPortfolioWidget />
      </DashboardSection>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Activity Summary (Last 7 Days)" action={<Button variant="link" size="sm">View All</Button>}>
          <ActivitySummaryWidget />
        </DashboardSection>

        <DashboardSection title="Quality Metrics (Last 30 Days)">
          <QualityMetricsWidget />
        </DashboardSection>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Upcoming Calendar" action={<Button variant="link" size="sm">View Calendar</Button>}>
          <UpcomingCalendarWidget />
        </DashboardSection>

        <DashboardSection title="Recent Wins 🎉">
          <RecentWinsWidget />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
```

### Success Criteria

#### Automated Verification
- [ ] All components compile: `pnpm build`
- [ ] No runtime errors on dashboard load

#### Manual Verification
- [ ] Dashboard loads at `/employee/workspace`
- [ ] Sprint Progress shows 6 metric cards with percentages
- [ ] Today's Priorities shows overdue, due today, high priority tasks
- [ ] Pipeline Health shows job/candidate/submission counts
- [ ] Account Portfolio shows accounts with health indicators
- [ ] Activity Summary shows 7-day metrics
- [ ] Quality Metrics shows performance indicators
- [ ] Upcoming Calendar shows schedule
- [ ] Recent Wins shows achievements
- [ ] Data refreshes when clicking Refresh button

---

## Phase 5: H04 - Reports System

### Overview
Implement report templates, generation, and display.

### Changes Required

#### 1. Report Templates Page
**File**: `src/components/recruiter/reports/RecruiterReportsPage.tsx`

```typescript
// Report template selection
// Quick reports: This Sprint, This Month, This Quarter, YTD
// Template cards: Performance Summary, Revenue & Commission, Activity Report, Quality Metrics, Account Portfolio, Pipeline Analysis
// Saved reports list
```

#### 2. Report Generation Modal
**File**: `src/components/recruiter/reports/GenerateReportModal.tsx`

```typescript
// Report period selection (radio buttons)
// Custom date range inputs
// Comparison options (checkboxes)
// Sections to include (checkboxes)
// Output format selection
// Generate button
```

#### 3. Report Viewer Component
**File**: `src/components/recruiter/reports/ReportViewer.tsx`

```typescript
// Report header with title, date, user
// Action buttons: Email, Save, PDF, Excel
// Executive Summary section
// Primary Metrics table with comparison
// Activity Breakdown section
// Quality Metrics section
// Pipeline Status section
// Account Portfolio section
// Top Wins & Challenges sections
// Expandable detailed transactions
// Charts (using recharts or similar)
```

#### 4. Report Data Queries
**File**: `src/server/routers/reports.ts` (complete implementation)

Implement all report type generators:
- Performance Summary
- Revenue & Commission
- Activity Report
- Quality Metrics
- Account Portfolio
- Pipeline Analysis

### Success Criteria

#### Automated Verification
- [ ] All components compile: `pnpm build`
- [ ] Report generation queries return expected shape

#### Manual Verification
- [ ] Reports page loads at `/employee/workspace/reports`
- [ ] Quick report buttons generate reports for correct periods
- [ ] Report templates open configuration modal
- [ ] Generated reports display all sections
- [ ] Comparison data shows correctly when enabled
- [ ] Save button saves report for future reference
- [ ] Email button opens email composer (stub for now)

---

## Testing Strategy

### Unit Tests
- Activity router: Test input validation, log mutation, task queries
- Dashboard router: Test metric calculations
- Report router: Test report generation logic

### Integration Tests
- Full flow: Log activity → appears in dashboard → shows in reports
- Follow-up flow: Create follow-up → appears in tasks

### Manual Testing Steps
1. Login as recruiter
2. Navigate to `/employee/workspace`
3. Verify all dashboard widgets load with data
4. Press Cmd+L to open activity modal
5. Log each activity type (email, call, meeting, linkedin, note)
6. Verify activities appear in entity timelines
7. Create activity with follow-up
8. Check follow-up appears in Today's Priorities
9. Navigate to Reports
10. Generate each report type
11. Verify metrics match dashboard

---

## Performance Considerations

1. **Dashboard Queries**: Use parallel queries for independent widgets
2. **Activity Feed**: Paginate with limit/offset, lazy load
3. **Reports**: Consider caching generated reports
4. **Real-time Updates**: Use optimistic updates for activity logging
5. **Large Lists**: Virtual scrolling for long entity lists

---

## Migration Notes

N/A - This is new functionality building on existing schema.

---

## References

- Spec files:
  - `docs/specs/20-USER-ROLES/01-recruiter/H01-daily-workflow.md`
  - `docs/specs/20-USER-ROLES/01-recruiter/H02-log-activity.md`
  - `docs/specs/20-USER-ROLES/01-recruiter/H03-recruiter-dashboard.md`
  - `docs/specs/20-USER-ROLES/01-recruiter/H04-recruiter-reports.md`
- Research: `thoughts/shared/research/2025-12-06-recruiter-workspace-h01-h04-research.md`
- Existing patterns:
  - `src/components/admin/AdminDashboard.tsx` - Dashboard pattern
  - `src/components/admin/feature-flags/CreateFeatureFlagDialog.tsx` - Modal pattern
  - `src/server/routers/activityPatterns.ts` - Router pattern
