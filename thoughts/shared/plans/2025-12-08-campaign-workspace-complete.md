# Campaign Workspace Complete Implementation Plan

> **Status: ✅ IMPLEMENTED** (December 8, 2025)
>
> All 7 phases have been successfully implemented. The Campaign workspace now features:
> - Section-based navigation with CampaignSectionSidebar
> - Full activity tracking system (calls, emails, meetings, notes, LinkedIn)
> - Leads section for campaign-generated leads
> - Analytics section with Recharts visualizations
> - Notes section for campaign note-taking
> - Campaign lifecycle management with completion dialogs
>
> **Key files created/modified:**
> - `src/components/navigation/CampaignSectionSidebar.tsx` (new)
> - `src/components/crm/campaigns/sections/` (new directory with 6 section components)
> - `src/components/crm/campaigns/InlineCampaignActivityForm.tsx` (new)
> - `src/components/crm/campaigns/CompleteCampaignDialog.tsx` (new)
> - `src/lib/navigation/entity-sections.ts` (updated)
> - `src/lib/navigation/entity-navigation.types.ts` (updated)
> - `src/lib/navigation/entity-journeys.ts` (updated)
> - `src/server/routers/crm.ts` (added campaigns.complete, activities.listByEntity, leads.listByCampaign)
> - Package: Added `recharts` for analytics charts

## Overview

Implement a fully functional Campaign workspace with section-based navigation, activity tracking, analytics, and lifecycle management from creation through natural culminations (lead, deal, account, or failure).

## Current State Analysis

### What Exists
- `CampaignDetailPage.tsx` - Basic metrics, funnel visualization, prospects table
- `CreateCampaignDialog.tsx` - 4-step creation wizard
- `ConvertProspectDialog.tsx` - Prospect to lead conversion
- `EditCampaignDialog.tsx` - Campaign editing
- tRPC procedures in `crm.ts:4120-4817` - Full CRUD, metrics, prospects

### What's Missing
1. **Section Sidebar Navigation** - No `CampaignSectionSidebar` component
2. **Activity System** - Cannot log calls, emails, meetings on campaigns
3. **Notes Section** - No note-taking capability
4. **Analytics Section** - Performance tab is placeholder only
5. **Leads Section** - No dedicated view for campaign-generated leads
6. **Timeline/History** - No chronological event view
7. **Entity Navigation Registration** - Campaign not registered as navigable entity

### Key Discoveries
- Section sidebar pattern defined in `src/components/navigation/AccountSectionSidebar.tsx:79-226`
- Section definitions in `src/lib/navigation/entity-sections.ts` - need to add `campaignSections`
- Activity pattern in `src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx`
- Entity navigation styles in `src/lib/navigation/entity-navigation.types.ts`
- CRM activities use unified `activities` table with `entity_type='campaign'`

## Desired End State

A Campaign workspace where users can:
1. Navigate between sections via left sidebar (Overview, Prospects, Leads, Activities, Analytics, Notes)
2. Log activities (calls, emails, meetings, notes) directly on campaigns
3. View real-time analytics with charts and trends
4. Track leads generated from the campaign
5. Manage campaign through complete lifecycle to culmination
6. See a complete activity timeline/history

### Verification
- Navigate to `/employee/crm/campaigns/[id]` and see section sidebar
- Click each section and see appropriate content
- Log an activity and see it in the timeline
- View analytics with real chart visualizations
- Convert prospects and see leads in dedicated section

## What We're NOT Doing

- Sequence execution automation (background jobs for email/LinkedIn sends)
- Email service provider integration
- LinkedIn API integration
- A/B testing implementation
- Real-time push notifications
- Campaign budget approval workflow
- CSV import for prospects

---

## Implementation Approach

Follow the established patterns from Account workspace:
1. Add campaign to entity navigation system
2. Create `CampaignSectionSidebar` following `AccountSectionSidebar` pattern
3. Refactor `CampaignDetailPage` to section-based routing with query params
4. Create section components following existing patterns
5. Add activity system using unified `activities` table (already supports campaigns)

---

## Phase 1: Navigation Infrastructure

### Overview
Register campaigns as a navigable entity type and create the section sidebar component.

### Changes Required:

#### 1.1 Add Campaign Sections Definition

**File**: `src/lib/navigation/entity-sections.ts`
**Changes**: Add `campaignSections` array and update `getSectionsForEntity`

```typescript
import {
  // ... existing imports
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

/**
 * Campaign sections - section-based navigation for campaigns
 */
export const campaignSections: SectionDefinition[] = [
  { id: 'overview', label: 'Campaign Overview', icon: Target },
  { id: 'prospects', label: 'Prospects', icon: Users, showCount: true },
  { id: 'leads', label: 'Leads', icon: TrendingUp, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock, showCount: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
]

// Update getSectionsForEntity:
export function getSectionsForEntity(entityType: string): SectionDefinition[] {
  switch (entityType) {
    // ... existing cases
    case 'campaign':
      return campaignSections
    default:
      return []
  }
}
```

#### 1.2 Update Entity Navigation Types

**File**: `src/lib/navigation/entity-navigation.types.ts`
**Changes**: Add 'campaign' to entity types and navigation styles

Add `'campaign'` to the EntityType union and set navigation style to `'sections'`.

#### 1.3 Create CampaignSectionSidebar Component

**File**: `src/components/navigation/CampaignSectionSidebar.tsx` (new file)
**Changes**: Create component following AccountSectionSidebar pattern

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { campaignSections } from '@/lib/navigation/entity-sections'
import {
  Target,
  Edit,
  Phone,
  Pause,
  Play,
} from 'lucide-react'

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    draft: 'bg-charcoal-100 text-charcoal-700',
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    completed: 'bg-charcoal-100 text-charcoal-700',
  }
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
      statusColors[status] || 'bg-charcoal-100 text-charcoal-700'
    )}>
      {status}
    </span>
  )
}

// Quick action types
interface QuickAction {
  id: string
  label: string
  icon: typeof Target
  actionType: 'navigate' | 'dialog'
  href?: string
  dialogId?: string
}

const campaignQuickActions: QuickAction[] = [
  { id: 'edit', label: 'Edit Campaign', icon: Edit, actionType: 'dialog', dialogId: 'editCampaign' },
  { id: 'logActivity', label: 'Log Activity', icon: Phone, actionType: 'dialog', dialogId: 'logActivity' },
]

interface CampaignSectionSidebarProps {
  campaignId: string
  campaignName: string
  campaignSubtitle?: string // campaign type
  campaignStatus: string
  counts?: {
    prospects?: number
    leads?: number
    activities?: number
    notes?: number
  }
  onQuickAction?: (action: QuickAction) => void
  className?: string
}

export function CampaignSectionSidebar({
  campaignId,
  campaignName,
  campaignSubtitle,
  campaignStatus,
  counts = {},
  onQuickAction,
  className,
}: CampaignSectionSidebarProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'overview'

  const buildSectionHref = (sectionId: string) => {
    if (sectionId === 'overview') {
      return `/employee/crm/campaigns/${campaignId}`
    }
    return `/employee/crm/campaigns/${campaignId}?section=${sectionId}`
  }

  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'prospects': return counts.prospects
      case 'leads': return counts.leads
      case 'activities': return counts.activities
      case 'notes': return counts.notes
      default: return undefined
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <aside className={cn(
      'w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0 hidden lg:flex',
      className
    )}>
      {/* Entity Header */}
      <div className="p-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {campaignName}
        </h2>
        {campaignSubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5 capitalize">
            {campaignSubtitle.replace(/_/g, ' ')}
          </p>
        )}
        <div className="mt-2">
          <StatusBadge status={campaignStatus} />
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {campaignSections.map((section) => {
            const Icon = section.icon
            const isActive = currentSection === section.id
            const count = getSectionCount(section.id)

            return (
              <li key={section.id}>
                <Link
                  href={buildSectionHref(section.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive && 'bg-hublot-50 text-hublot-700 font-medium',
                    !isActive && 'text-charcoal-600 hover:bg-charcoal-50'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-hublot-600'
                  )} />
                  <span className="flex-1 text-sm truncate">
                    {section.label}
                  </span>
                  {section.showCount && count !== undefined && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                      isActive && 'bg-hublot-100 text-hublot-700',
                      !isActive && 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-charcoal-100">
        <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {campaignQuickActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction(action)}
              >
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
```

#### 1.4 Update SidebarLayout Integration

**File**: `src/components/layouts/SidebarLayout.tsx`
**Changes**: Add campaign sidebar rendering logic

Add import for `CampaignSectionSidebar` and add conditional rendering block:

```typescript
// In the sidebar selection logic, add:
currentEntity.type === 'campaign' && navigationStyle === 'sections' ? (
  <CampaignSectionSidebar
    campaignId={currentEntity.id}
    campaignName={currentEntity.name}
    campaignSubtitle={currentEntity.subtitle}
    campaignStatus={currentEntity.status}
    counts={campaignSectionCounts}
    onQuickAction={(action) => {
      window.dispatchEvent(new CustomEvent('openCampaignDialog', {
        detail: { dialogId: action.dialogId }
      }))
    }}
  />
)
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`
- [x] Build succeeds: `pnpm build`

#### Manual Verification:
- [x] Navigate to `/employee/crm/campaigns/[id]` and section sidebar appears
- [x] Sidebar shows campaign name, type, and status
- [x] All 6 sections are listed with correct icons
- [x] Section counts display when available
- [x] Quick action buttons are visible

**Implementation Note**: ✅ Phase 1 completed.

---

## Phase 2: Campaign Detail Page Restructure

### Overview
Refactor `CampaignDetailPage` to use section-based routing with query params instead of tabs.

### Changes Required:

#### 2.1 Update Campaign Detail Route

**File**: `src/app/employee/crm/campaigns/[id]/page.tsx`
**Changes**: Update to use entity navigation context and pass campaign data

```typescript
'use client'

import { useParams } from 'next/navigation'
import { CampaignDetailPage } from '@/components/crm/campaigns/CampaignDetailPage'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  const entityNav = useEntityNavigation()

  // Fetch campaign data for navigation context
  const { data: campaign } = trpc.crm.campaigns.getById.useQuery(
    { id: campaignId },
    { enabled: !!campaignId }
  )

  // Set current entity for sidebar
  useEffect(() => {
    if (campaign && entityNav) {
      entityNav.setCurrentEntity({
        type: 'campaign',
        id: campaignId,
        name: campaign.name,
        subtitle: campaign.campaign_type,
        status: campaign.status,
      })
    }
    return () => {
      entityNav?.setCurrentEntity(null)
    }
  }, [campaign, campaignId, entityNav])

  return <CampaignDetailPage campaignId={campaignId} />
}
```

#### 2.2 Refactor CampaignDetailPage to Section-Based

**File**: `src/components/crm/campaigns/CampaignDetailPage.tsx`
**Changes**: Replace tabs with section-based routing

Major changes:
- Remove `activeTab` state, use `searchParams.get('section')` instead
- Create section components: `CampaignOverviewSection`, `CampaignProspectsSection`, etc.
- Use conditional rendering based on `activeSection`
- Add dialog event listener for sidebar quick actions

```typescript
// Key structural change:
export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('section') || 'overview'

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [logActivityOpen, setLogActivityOpen] = useState(false)

  // Listen for quick action events from sidebar
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'editCampaign':
          setEditDialogOpen(true)
          break
        case 'logActivity':
          setLogActivityOpen(true)
          break
      }
    }
    window.addEventListener('openCampaignDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openCampaignDialog', handleOpenDialog as EventListener)
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Page Header - always visible */}
      <CampaignHeader campaign={campaign} onToggleStatus={handleToggleStatus} />

      {/* Section Content */}
      {activeSection === 'overview' && (
        <CampaignOverviewSection campaignId={campaignId} campaign={campaign} metrics={metrics} />
      )}
      {activeSection === 'prospects' && (
        <CampaignProspectsSection campaignId={campaignId} />
      )}
      {activeSection === 'leads' && (
        <CampaignLeadsSection campaignId={campaignId} />
      )}
      {activeSection === 'activities' && (
        <CampaignActivitiesSection campaignId={campaignId} />
      )}
      {activeSection === 'analytics' && (
        <CampaignAnalyticsSection campaignId={campaignId} metrics={metrics} />
      )}
      {activeSection === 'notes' && (
        <CampaignNotesSection campaignId={campaignId} />
      )}

      {/* Dialogs */}
      <EditCampaignDialog ... />
      <LogActivityDialog ... />
    </div>
  )
}
```

#### 2.3 Create Campaign Section Components Directory

**File**: `src/components/crm/campaigns/sections/index.ts` (new directory and file)
**Changes**: Create section component exports

```typescript
export { CampaignOverviewSection } from './CampaignOverviewSection'
export { CampaignProspectsSection } from './CampaignProspectsSection'
export { CampaignLeadsSection } from './CampaignLeadsSection'
export { CampaignActivitiesSection } from './CampaignActivitiesSection'
export { CampaignAnalyticsSection } from './CampaignAnalyticsSection'
export { CampaignNotesSection } from './CampaignNotesSection'
```

#### 2.4 Create CampaignOverviewSection

**File**: `src/components/crm/campaigns/sections/CampaignOverviewSection.tsx` (new file)
**Changes**: Extract overview content from current CampaignDetailPage

Move the metrics cards, funnel visualization, target progress, budget tracking, and channel performance into this dedicated section component.

#### 2.5 Create CampaignProspectsSection

**File**: `src/components/crm/campaigns/sections/CampaignProspectsSection.tsx` (new file)
**Changes**: Extract prospects tab content

Move the prospects table, filtering, and convert actions into this section. Add bulk actions and enhanced filtering.

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`
- [x] Build succeeds: `pnpm build`

#### Manual Verification:
- [x] URL query param `?section=X` navigates to correct section
- [x] Overview section shows metrics, funnel, budget info
- [x] Prospects section shows filterable prospects table
- [x] Page header remains visible across sections
- [x] Back navigation works correctly

**Implementation Note**: ✅ Phase 2 completed.

---

## Phase 3: Activities System

### Overview
Implement full activity tracking for campaigns using the unified `activities` table and following the Account activities pattern.

### Changes Required:

#### 3.1 Create CampaignActivitiesSection

**File**: `src/components/crm/campaigns/sections/CampaignActivitiesSection.tsx` (new file)
**Changes**: Create activities section following AccountActivitiesSection pattern

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'
import { InlineCampaignActivityForm } from '../InlineCampaignActivityForm'
import { CampaignActivityInlinePanel } from '../CampaignActivityInlinePanel'
import { Phone, Mail, Calendar, FileText, MessageSquare, Linkedin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CampaignActivitiesSectionProps {
  campaignId: string
}

export function CampaignActivitiesSection({ campaignId }: CampaignActivitiesSectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  // Fetch activities for this campaign
  const { data: activities, isLoading } = trpc.crm.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId: campaignId,
  })

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId)
  }

  const handleClosePanel = () => {
    setSelectedActivityId(null)
  }

  // ... render logic following AccountActivitiesSection pattern
}
```

#### 3.2 Create InlineCampaignActivityForm

**File**: `src/components/crm/campaigns/InlineCampaignActivityForm.tsx` (new file)
**Changes**: Create inline activity form for campaigns

Follow `InlineActivityForm.tsx` pattern but for campaign entity type:
- Activity type buttons (call, email, meeting, note, task, linkedin_message)
- Subject and description fields
- Outcome dropdown
- Optional contact selection (contacts associated with campaign prospects)

#### 3.3 Create CampaignActivityInlinePanel

**File**: `src/components/crm/campaigns/CampaignActivityInlinePanel.tsx` (new file)
**Changes**: Create inline panel for viewing/editing campaign activities

Follow `ActivityInlinePanel.tsx` pattern:
- View mode with activity details
- Edit mode with form fields
- Delete confirmation
- Duration display for calls/meetings

#### 3.4 Add/Verify tRPC Activity Procedures for Campaigns

**File**: `src/server/routers/crm.ts`
**Changes**: Verify `listByEntity` procedure supports campaigns (or add if missing)

The existing `crm.activities.listByAccount` needs a more generic version:

```typescript
// Add new procedure or modify existing
listByEntity: orgProtectedProcedure
  .input(z.object({
    entityType: z.enum(['account', 'campaign', 'lead', 'deal', 'contact']),
    entityId: z.string().uuid(),
    activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'linkedin_message']).optional(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .query(async ({ ctx, input }) => {
    const { adminClient, orgId } = ctx

    let query = adminClient
      .from('activities')
      .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
      .eq('org_id', orgId)
      .eq('entity_type', input.entityType)
      .eq('entity_id', input.entityId)
      .order('created_at', { ascending: false })
      .limit(input.limit)

    if (input.activityType) {
      query = query.eq('activity_type', input.activityType)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
  }),
```

#### 3.5 Add Activity Log Mutation for Campaigns

**File**: `src/server/routers/crm.ts`
**Changes**: Ensure `log` mutation works with campaign entity type

The existing `crm.activities.log` should already support this if it accepts `entityType: 'campaign'`. Verify the enum includes 'campaign'.

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`
- [x] Build succeeds: `pnpm build`

#### Manual Verification:
- [x] Navigate to Activities section, see activity list
- [x] Create new activity using inline form
- [x] Click activity to open inline panel
- [x] Edit activity and save changes
- [x] Delete activity with confirmation
- [x] Activity count updates in sidebar

**Implementation Note**: ✅ Phase 3 completed.

---

## Phase 4: Leads Section

### Overview
Create a dedicated section to view and manage leads generated from the campaign.

### Changes Required:

#### 4.1 Create CampaignLeadsSection

**File**: `src/components/crm/campaigns/sections/CampaignLeadsSection.tsx` (new file)
**Changes**: Create section showing campaign-generated leads

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface CampaignLeadsSectionProps {
  campaignId: string
}

export function CampaignLeadsSection({ campaignId }: CampaignLeadsSectionProps) {
  // Fetch leads generated from this campaign
  const { data: leads, isLoading } = trpc.crm.leads.listByCampaign.useQuery({
    campaignId,
  })

  // Lead statistics
  const stats = {
    total: leads?.length || 0,
    qualified: leads?.filter(l => l.lead_status === 'qualified').length || 0,
    converted: leads?.filter(l => l.converted_to_deal_id).length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-charcoal-500" />
              <span className="text-sm text-charcoal-500">Total Leads</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-charcoal-500">Qualified</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.qualified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gold-500" />
              <span className="text-sm text-charcoal-500">Converted to Deal</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.converted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell>{lead.company_name}</TableCell>
                  <TableCell>
                    <Badge variant={lead.lead_status === 'qualified' ? 'default' : 'secondary'}>
                      {lead.lead_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.lead_score}/100</TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/employee/crm/leads/${lead.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 4.2 Add tRPC Procedure for Campaign Leads

**File**: `src/server/routers/crm.ts`
**Changes**: Add `leads.listByCampaign` procedure

```typescript
listByCampaign: orgProtectedProcedure
  .input(z.object({
    campaignId: z.string().uuid(),
  }))
  .query(async ({ ctx, input }) => {
    const { adminClient, orgId } = ctx

    const { data, error } = await adminClient
      .from('leads')
      .select('*')
      .eq('org_id', orgId)
      .eq('campaign_id', input.campaignId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }),
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`

#### Manual Verification:
- [x] Navigate to Leads section
- [x] See statistics cards (total, qualified, converted)
- [x] See leads table with proper data
- [x] Click lead to navigate to lead detail page
- [x] Lead count shows in sidebar

**Implementation Note**: ✅ Phase 4 completed.

---

## Phase 5: Analytics Section

### Overview
Build out the Analytics section with real chart visualizations and performance metrics.

### Changes Required:

#### 5.1 Create CampaignAnalyticsSection

**File**: `src/components/crm/campaigns/sections/CampaignAnalyticsSection.tsx` (new file)
**Changes**: Create analytics section with charts

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'

// Chart components (using recharts or similar)
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface CampaignAnalyticsSectionProps {
  campaignId: string
  metrics?: CampaignMetrics
}

export function CampaignAnalyticsSection({ campaignId, metrics }: CampaignAnalyticsSectionProps) {
  // Fetch detailed metrics
  const { data: analyticsData } = trpc.crm.campaigns.getMetrics.useQuery({
    id: campaignId,
  })

  return (
    <div className="space-y-6">
      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Prospect journey through campaign stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trends</CardTitle>
          <CardDescription>Engagement over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="opens" stroke="#3b82f6" name="Opens" />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clicks" />
                <Line type="monotone" dataKey="responses" stroke="#f59e0b" name="Responses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Comparison across outreach channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#94a3b8" name="Sent" />
                <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
                <Bar dataKey="responded" fill="#10b981" name="Responded" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ROI Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-charcoal-500">Cost per Lead</p>
            <p className="text-2xl font-bold">${metrics?.costs?.costPerLead?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-green-600">Target: &lt;$10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-charcoal-500">Cost per Meeting</p>
            <p className="text-2xl font-bold">${metrics?.costs?.costPerMeeting?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-green-600">Target: &lt;$50</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-charcoal-500">Response Rate</p>
            <p className="text-2xl font-bold">{((metrics?.funnel?.responded || 0) / (metrics?.funnel?.contacted || 1) * 100).toFixed(1)}%</p>
            <p className="text-xs text-green-600">Target: 6-10%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-charcoal-500">Conversion Rate</p>
            <p className="text-2xl font-bold">{((metrics?.funnel?.leads || 0) / (metrics?.funnel?.responded || 1) * 100).toFixed(1)}%</p>
            <p className="text-xs text-green-600">Target: 15-25%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`

#### Manual Verification:
- [x] Navigate to Analytics section
- [x] See funnel bar chart with campaign stages
- [x] See daily trends line chart
- [x] See channel performance comparison
- [x] See ROI metrics cards

**Implementation Note**: ✅ Phase 5 completed.

---

## Phase 6: Notes Section

### Overview
Add notes functionality for campaign-level note-taking.

### Changes Required:

#### 6.1 Create CampaignNotesSection

**File**: `src/components/crm/campaigns/sections/CampaignNotesSection.tsx` (new file)
**Changes**: Create notes section following activity pattern

Notes can use the unified `activities` table with `activity_type='note'`, or a dedicated notes table if one exists. For consistency, use the activity system:

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface CampaignNotesSectionProps {
  campaignId: string
}

export function CampaignNotesSection({ campaignId }: CampaignNotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const utils = trpc.useUtils()

  // Fetch notes (activities with type='note')
  const { data: notes, isLoading } = trpc.crm.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId: campaignId,
    activityType: 'note',
  })

  const createNote = trpc.crm.activities.log.useMutation({
    onSuccess: () => {
      utils.crm.activities.listByEntity.invalidate({ entityType: 'campaign', entityId: campaignId })
      setIsAddingNote(false)
      setSubject('')
      setDescription('')
    },
  })

  const handleCreateNote = () => {
    if (!subject.trim()) return
    createNote.mutate({
      entityType: 'campaign',
      entityId: campaignId,
      activityType: 'note',
      subject,
      description,
    })
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      {isAddingNote ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Note content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateNote} disabled={createNote.isPending || !subject.trim()}>
                {createNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingNote(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes?.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-charcoal-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{note.subject}</h4>
                  {note.description && (
                    <p className="text-sm text-charcoal-600 mt-1 whitespace-pre-wrap">
                      {note.description}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-400 mt-2">
                    {note.creator?.full_name} · {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notes?.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-charcoal-500">No notes yet</p>
              <p className="text-sm text-charcoal-400">Add notes to track important campaign information</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`

#### Manual Verification:
- [x] Navigate to Notes section
- [x] See "Add Note" button
- [x] Create new note with title and content
- [x] See note in list with creator and timestamp
- [x] Note count updates in sidebar

**Implementation Note**: ✅ Phase 6 completed.

---

## Phase 7: Campaign Lifecycle & Culminations

### Overview
Implement campaign lifecycle management including completion, failure, and success tracking.

### Changes Required:

#### 7.1 Add Campaign Completion Dialog

**File**: `src/components/crm/campaigns/CompleteCampaignDialog.tsx` (new file)
**Changes**: Create dialog for completing campaigns with outcome tracking

```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface CompleteCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  campaignName: string
}

export function CompleteCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  campaignName,
}: CompleteCampaignDialogProps) {
  const [outcome, setOutcome] = useState<'successful' | 'partial' | 'unsuccessful'>('successful')
  const [notes, setNotes] = useState('')

  const utils = trpc.useUtils()

  const completeCampaign = trpc.crm.campaigns.complete.useMutation({
    onSuccess: () => {
      utils.crm.campaigns.getById.invalidate({ id: campaignId })
      toast.success('Campaign completed successfully')
      onOpenChange(false)
    },
  })

  const handleComplete = () => {
    completeCampaign.mutate({
      id: campaignId,
      outcome,
      notes,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Campaign</DialogTitle>
          <DialogDescription>
            Mark "{campaignName}" as completed and record the outcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Campaign Outcome</Label>
            <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="successful" id="successful" />
                <Label htmlFor="successful">Successful - Met or exceeded targets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial">Partially successful - Some targets met</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsuccessful" id="unsuccessful" />
                <Label htmlFor="unsuccessful">Unsuccessful - Targets not met</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              placeholder="Key learnings, what worked, what didn't..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={completeCampaign.isPending}>
            Complete Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### 7.2 Add Campaign Complete Procedure

**File**: `src/server/routers/crm.ts`
**Changes**: Add `campaigns.complete` mutation

```typescript
complete: orgProtectedProcedure
  .input(z.object({
    id: z.string().uuid(),
    outcome: z.enum(['successful', 'partial', 'unsuccessful']),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { adminClient, orgId, user } = ctx

    // Update campaign status and outcome
    const { data: campaign, error } = await adminClient
      .from('campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        outcome: input.outcome,
        completion_notes: input.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Log activity
    await adminClient.from('activities').insert({
      org_id: orgId,
      entity_type: 'campaign',
      entity_id: input.id,
      activity_type: 'note',
      subject: `Campaign Completed - ${input.outcome.charAt(0).toUpperCase() + input.outcome.slice(1)}`,
      description: input.notes || `Campaign marked as ${input.outcome}`,
      created_by: user?.id,
    })

    return campaign
  }),
```

#### 7.3 Update Campaign Header with Lifecycle Actions

**File**: `src/components/crm/campaigns/CampaignHeader.tsx` (extract or modify in CampaignDetailPage)
**Changes**: Add complete/reactivate actions based on status

```typescript
// In the header action buttons:
{campaign.status === 'active' && (
  <Button variant="outline" onClick={() => setCompleteCampaignOpen(true)}>
    <CheckCircle className="mr-2 h-4 w-4" />
    Complete Campaign
  </Button>
)}

{campaign.status === 'completed' && (
  <Badge variant={
    campaign.outcome === 'successful' ? 'default' :
    campaign.outcome === 'partial' ? 'secondary' : 'destructive'
  }>
    {campaign.outcome}
  </Badge>
)}
```

#### 7.4 Add Culmination Summary to Overview

**File**: `src/components/crm/campaigns/sections/CampaignOverviewSection.tsx`
**Changes**: Show campaign results summary for completed campaigns

Add a "Campaign Results" card that shows:
- Final lead count vs target
- Final meeting count vs target
- ROI calculation
- Key success/failure factors

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit`
- [x] Linting passes: `pnpm lint`

#### Manual Verification:
- [x] Active campaign shows "Complete Campaign" button
- [x] Completion dialog allows selecting outcome
- [x] Completed campaign shows outcome badge
- [x] Activity logged for completion
- [x] Overview shows results summary for completed campaigns

**Implementation Note**: ✅ Phase 7 completed.

---

## Testing Strategy

### Unit Tests
- Section sidebar renders correct sections
- Activity form validation
- Lead conversion data mapping

### Integration Tests
- Navigation between sections updates URL
- Activity creation persists to database
- Metrics calculation accuracy

### Manual Testing Steps
1. Create a new campaign with all fields
2. Navigate through all sections via sidebar
3. Log activities (call, email, meeting, note)
4. View activities in inline panel
5. Convert prospects to leads
6. View leads in Leads section
7. Review analytics charts
8. Add notes
9. Complete campaign with outcome
10. Verify all data persisted correctly

## Performance Considerations

- Use React Query caching for section data
- Lazy load chart components
- Paginate prospects and leads tables
- Debounce activity list refresh

## Migration Notes

- No database migrations required (using unified `activities` table)
- Existing campaign data will work with new UI
- New `outcome` and `completion_notes` columns may need migration if not present

## References

- Research: `thoughts/shared/research/2025-12-08-campaign-workspace-system.md`
- Functional specs: `docs/specs/20-USER-ROLES/01-recruiter/A01-run-campaign.md`
- Lead conversion spec: `docs/specs/20-USER-ROLES/01-recruiter/A03-generate-lead-from-campaign.md`
- Account sidebar pattern: `src/components/navigation/AccountSectionSidebar.tsx`
- Activity section pattern: `src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx`
