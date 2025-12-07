# Guidewire Architecture Alignment Implementation Plan

## Overview

Transform InTime from a **role-based, module-centric UI** to a **Guidewire-style entity-centric, wizard-driven UI** where:
- Top navigation provides entity-type access (Jobs, Accounts, Candidates, My Work) with dropdown menus
- Left sidebar shows contextual wizard steps when viewing an entity (entity journey navigation)
- Entity lifecycles are represented as sequential wizard steps capturing the full business journey
- Activities track work items with queue-based assignment

This plan implements a **superuser-first approach** where all navigation items and features are accessible, with permission filtering to be added later.

## Current State Analysis

### What Exists Now
- **Role-based sidebar navigation** (`adminNavSections`, `recruiterNavSections`)
- **Static navigation per portal** (Admin, Workspace, Recruiting, CRM)
- **Tab-based entity detail pages** (Overview, Pipeline, Activity tabs)
- **5 dialog-based wizards** for specific flows (Onboarding, JobIntake, Placement, CloseJob, Import)
- **CommandPalette** (`Cmd+K`) for quick navigation
- **HorizontalTabsLayout** for section-level grouping (Settings, Integrations)

### Key Files
| Component | File | Purpose |
|-----------|------|---------|
| SidebarLayout | `src/components/layouts/SidebarLayout.tsx` | Main app shell |
| PortalHeader | `src/components/navigation/PortalHeader.tsx` | Top header (logo + user) |
| Sidebar | `src/components/navigation/Sidebar.tsx` | Left sidebar navigation |
| AdminNav | `src/lib/navigation/adminNavConfig.ts` | Admin navigation config |
| RecruiterNav | `src/lib/navigation/recruiterNavConfig.ts` | Recruiter navigation config |

### Architectural Gap
**InTime organizes by role/module**, **Guidewire organizes by entity/transaction type**.

## Desired End State

### 1. Top Navigation Bar with Entity Dropdowns
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo] │ Jobs ▼ │ Accounts ▼ │ Candidates ▼ │ CRM ▼ │ My Work ▼ │ Admin ▼ │ 👤│
└──────────────────────────────────────────────────────────────────────────────┘

Jobs Dropdown:              Accounts Dropdown:         My Work Dropdown:
├── Search Jobs            ├── Search Accounts        ├── My Dashboard
├── Recent Jobs (5)        ├── Recent Accounts (5)    ├── My Activities
├── My Assigned Jobs       ├── My Accounts            ├── My Queue
├── Create New Job         ├── Create Account         ├── Pending Approvals
└── Job Board              └── Account Health         └── Today's Tasks
```

### 2. Entity Journey Sidebar (when viewing Job detail)
```
┌─────────────────┐
│ Job: Sr. Dev    │
│ @ Acme Corp     │
├─────────────────┤
│ 1. ✓ Job Info   │
│ 2. ● Sourcing   │ ← Current step
│ 3. ○ Pipeline   │
│ 4. ○ Interviews │
│ 5. ○ Offers     │
│ 6. ○ Placement  │
├─────────────────┤
│ Quick Actions:  │
│ • Edit Job      │
│ • Hold Job      │
│ • Close Job     │
└─────────────────┘
```

### 3. Entity Detail Page Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Top Nav: [Logo] │ Jobs ▼ │ Accounts ▼ │ Candidates ▼ │ ...                 │
├──────────┬─────────────────────────────────────────────────────────────────┤
│ Entity   │  ┌─────────────────────────────────────────────────────────┐    │
│ Journey  │  │ Breadcrumb: Jobs > Senior Developer @ Acme Corp        │    │
│ Steps    │  ├─────────────────────────────────────────────────────────┤    │
│          │  │ [Tab: Overview] [Tab: Submissions] [Tab: Notes]         │    │
│ 1. ✓ Job │  ├─────────────────────────────────────────────────────────┤    │
│ 2. ● Src │  │                                                         │    │
│ 3. ○ Pip │  │  Step Content Area                                      │    │
│ 4. ○ Int │  │  (varies by current journey step)                       │    │
│ 5. ○ Off │  │                                                         │    │
│ 6. ○ Plc │  │                       │  Info Sidebar                   │    │
├──────────┤  │                       │  - Job Details                  │    │
│ Actions  │  │                       │  - Status History               │    │
│ • Edit   │  │                       │  - Related Items                │    │
│ • Hold   │  └─────────────────────────────────────────────────────────┘    │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

### Verification of End State
- [ ] Top navigation shows all entity type tabs with working dropdowns
- [ ] Recent items appear in dropdowns (stored in localStorage)
- [ ] Entity detail pages show journey wizard steps in left sidebar
- [ ] Clicking journey step navigates to that step's content
- [ ] Journey progress reflects entity status
- [ ] Quick actions in sidebar work correctly
- [ ] All features accessible to superuser (no permission filtering yet)

## What We're NOT Doing

1. **NOT implementing permission filtering** - Superuser sees all, permissions added later
2. **NOT implementing queue-based assignment** - Direct assignment only for now
3. **NOT implementing temporal/EffDated versioning** - Standard CRUD for now
4. **NOT modifying database schema** - Using existing tables and status enums
5. **NOT changing existing wizard dialogs** - They continue working as modals
6. **NOT implementing nested sub-wizards** - Linear entity journeys only
7. **NOT removing existing routes** - Adding new patterns alongside existing ones

## Implementation Approach

### Core Architecture Changes
1. **New EntityLayout component** - Wraps entity detail pages with journey sidebar
2. **New TopNav component** - Replaces/enhances PortalHeader with entity dropdowns
3. **Entity navigation context** - Tracks current entity type, ID, and journey step
4. **Journey configuration** - Defines steps per entity type (job, candidate, account, etc.)

### Migration Strategy
- **Parallel implementation**: New components work alongside existing ones
- **Gradual adoption**: Entity detail pages opt-in to new layout
- **Backwards compatible**: Existing routes and functionality preserved

---

## Phase 1: Foundation - Navigation Context & Types

### Overview
Create the foundation for entity-centric navigation: TypeScript types, context providers, and configuration structures.

### Changes Required:

#### 1.1 Entity Navigation Types

**File**: `src/lib/navigation/entity-navigation.types.ts` (NEW)
**Changes**: Create type definitions for entity-centric navigation

```typescript
import { LucideIcon } from 'lucide-react'

// Entity types supported in the system
export type EntityType =
  | 'job'
  | 'candidate'
  | 'account'
  | 'submission'
  | 'placement'
  | 'lead'
  | 'deal'

// Entity journey step definition
export interface EntityJourneyStep {
  id: string
  label: string
  icon: LucideIcon
  description?: string
  // Which entity statuses map to this step being current/complete
  activeStatuses: string[]
  completedStatuses: string[]
}

// Entity journey configuration
export interface EntityJourneyConfig {
  entityType: EntityType
  steps: EntityJourneyStep[]
  // Quick actions available in sidebar
  quickActions: EntityQuickAction[]
}

// Quick action in entity sidebar
export interface EntityQuickAction {
  id: string
  label: string
  icon: LucideIcon
  variant?: 'default' | 'destructive' | 'outline'
  // Action handler receives entity ID
  actionType: 'dialog' | 'navigate' | 'mutation'
  dialogId?: string  // For dialog actions
  href?: string      // For navigate actions (can include :id placeholder)
}

// Top navigation entity tab
export interface EntityNavTab {
  id: string
  label: string
  entityType: EntityType
  icon: LucideIcon
  dropdown: EntityNavDropdownItem[]
}

// Dropdown item in entity tab
export interface EntityNavDropdownItem {
  id: string
  label: string
  icon?: LucideIcon
  href?: string
  type: 'link' | 'recent' | 'divider'
  badge?: string | number
}

// Current navigation context state
export interface EntityNavigationState {
  // Current entity being viewed (null if on list/dashboard)
  currentEntity: {
    type: EntityType
    id: string
    name: string
    status: string
  } | null
  // Current journey step (derived from entity status)
  currentStep: string | null
  // Recent entities per type (for dropdowns)
  recentEntities: Record<EntityType, RecentEntity[]>
}

export interface RecentEntity {
  id: string
  name: string
  subtitle?: string
  viewedAt: Date
}
```

#### 1.2 Entity Journey Configurations

**File**: `src/lib/navigation/entity-journeys.ts` (NEW)
**Changes**: Define journey steps for each entity type

```typescript
import {
  Briefcase, Search, Users, Calendar, FileText, CheckCircle,
  UserCheck, ClipboardCheck, Send, Building2, Target, Handshake,
  DollarSign, Award, Phone, Star, TrendingUp, Package
} from 'lucide-react'
import { EntityJourneyConfig, EntityType } from './entity-navigation.types'

export const entityJourneys: Record<EntityType, EntityJourneyConfig> = {
  job: {
    entityType: 'job',
    steps: [
      {
        id: 'info',
        label: 'Job Info',
        icon: Briefcase,
        description: 'Job requirements and details',
        activeStatuses: ['draft'],
        completedStatuses: ['open', 'active', 'on_hold', 'filled', 'cancelled'],
      },
      {
        id: 'sourcing',
        label: 'Sourcing',
        icon: Search,
        description: 'Finding candidates',
        activeStatuses: ['open'],
        completedStatuses: ['active', 'on_hold', 'filled'],
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: Users,
        description: 'Managing submissions',
        activeStatuses: ['active'],
        completedStatuses: ['filled'],
      },
      {
        id: 'interviews',
        label: 'Interviews',
        icon: Calendar,
        description: 'Client interviews',
        activeStatuses: ['active'], // Sub-state based on submissions
        completedStatuses: ['filled'],
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: FileText,
        description: 'Offer management',
        activeStatuses: ['active'], // Sub-state based on submissions
        completedStatuses: ['filled'],
      },
      {
        id: 'placement',
        label: 'Placement',
        icon: CheckCircle,
        description: 'Confirmed placements',
        activeStatuses: ['filled'],
        completedStatuses: [],
      },
    ],
    quickActions: [
      { id: 'edit', label: 'Edit Job', icon: Briefcase, actionType: 'navigate', href: '/employee/recruiting/jobs/:id/edit' },
      { id: 'hold', label: 'Put on Hold', icon: Calendar, actionType: 'dialog', dialogId: 'updateStatus' },
      { id: 'close', label: 'Close Job', icon: CheckCircle, actionType: 'dialog', dialogId: 'closeJob', variant: 'destructive' },
    ],
  },

  candidate: {
    entityType: 'candidate',
    steps: [
      {
        id: 'profile',
        label: 'Profile',
        icon: UserCheck,
        description: 'Candidate information',
        activeStatuses: ['sourced'],
        completedStatuses: ['screening', 'bench', 'active', 'placed'],
      },
      {
        id: 'screening',
        label: 'Screening',
        icon: ClipboardCheck,
        description: 'Initial assessment',
        activeStatuses: ['screening'],
        completedStatuses: ['bench', 'active', 'placed'],
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: Send,
        description: 'Job submissions',
        activeStatuses: ['bench', 'active'],
        completedStatuses: ['placed'],
      },
      {
        id: 'placed',
        label: 'Placed',
        icon: Award,
        description: 'Active placement',
        activeStatuses: ['placed'],
        completedStatuses: [],
      },
    ],
    quickActions: [
      { id: 'edit', label: 'Edit Candidate', icon: UserCheck, actionType: 'navigate', href: '/employee/recruiting/candidates/:id/edit' },
      { id: 'screen', label: 'Start Screening', icon: ClipboardCheck, actionType: 'dialog', dialogId: 'startScreening' },
      { id: 'submit', label: 'Submit to Job', icon: Send, actionType: 'dialog', dialogId: 'submitToJob' },
      { id: 'hotlist', label: 'Toggle Hotlist', icon: Star, actionType: 'mutation' },
    ],
  },

  account: {
    entityType: 'account',
    steps: [
      {
        id: 'profile',
        label: 'Company Profile',
        icon: Building2,
        description: 'Account information',
        activeStatuses: ['prospect'],
        completedStatuses: ['active'],
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: Users,
        description: 'Key contacts',
        activeStatuses: ['prospect', 'active'],
        completedStatuses: [],
      },
      {
        id: 'contracts',
        label: 'Contracts & Terms',
        icon: FileText,
        description: 'Business terms',
        activeStatuses: ['active'],
        completedStatuses: [],
      },
      {
        id: 'jobs',
        label: 'Active Jobs',
        icon: Briefcase,
        description: 'Job requisitions',
        activeStatuses: ['active'],
        completedStatuses: [],
      },
      {
        id: 'placements',
        label: 'Placements',
        icon: Award,
        description: 'Placement history',
        activeStatuses: ['active'],
        completedStatuses: [],
      },
    ],
    quickActions: [
      { id: 'edit', label: 'Edit Account', icon: Building2, actionType: 'navigate', href: '/employee/recruiting/accounts/:id/edit' },
      { id: 'contact', label: 'Add Contact', icon: Users, actionType: 'dialog', dialogId: 'addContact' },
      { id: 'job', label: 'New Job', icon: Briefcase, actionType: 'dialog', dialogId: 'jobIntake' },
      { id: 'activity', label: 'Log Activity', icon: Phone, actionType: 'dialog', dialogId: 'logActivity' },
    ],
  },

  submission: {
    entityType: 'submission',
    steps: [
      { id: 'sourced', label: 'Sourced', icon: Search, activeStatuses: ['sourced'], completedStatuses: ['screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed'] },
      { id: 'screening', label: 'Screening', icon: ClipboardCheck, activeStatuses: ['screening'], completedStatuses: ['submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed'] },
      { id: 'submission', label: 'Submission', icon: Send, activeStatuses: ['submission_ready', 'submitted_to_client'], completedStatuses: ['client_review', 'client_interview', 'offer_stage', 'placed'] },
      { id: 'review', label: 'Client Review', icon: Users, activeStatuses: ['client_review'], completedStatuses: ['client_interview', 'offer_stage', 'placed'] },
      { id: 'interview', label: 'Interview', icon: Calendar, activeStatuses: ['client_interview'], completedStatuses: ['offer_stage', 'placed'] },
      { id: 'offer', label: 'Offer', icon: FileText, activeStatuses: ['offer_stage'], completedStatuses: ['placed'] },
      { id: 'placed', label: 'Placed', icon: CheckCircle, activeStatuses: ['placed'], completedStatuses: [] },
    ],
    quickActions: [
      { id: 'advance', label: 'Advance Status', icon: TrendingUp, actionType: 'dialog', dialogId: 'updateSubmissionStatus' },
      { id: 'withdraw', label: 'Withdraw', icon: CheckCircle, actionType: 'dialog', dialogId: 'withdrawSubmission', variant: 'destructive' },
    ],
  },

  placement: {
    entityType: 'placement',
    steps: [
      { id: 'pending', label: 'Pending Start', icon: Calendar, activeStatuses: ['pending_start'], completedStatuses: ['active', 'extended', 'ended'] },
      { id: 'active', label: 'Active', icon: CheckCircle, activeStatuses: ['active'], completedStatuses: ['extended', 'ended'] },
      { id: 'extended', label: 'Extended', icon: TrendingUp, activeStatuses: ['extended'], completedStatuses: ['ended'] },
      { id: 'ended', label: 'Ended', icon: Package, activeStatuses: ['ended'], completedStatuses: [] },
    ],
    quickActions: [
      { id: 'extend', label: 'Extend Placement', icon: TrendingUp, actionType: 'dialog', dialogId: 'extendPlacement' },
      { id: 'checkin', label: 'Log Check-in', icon: Phone, actionType: 'dialog', dialogId: 'placementCheckin' },
      { id: 'end', label: 'End Placement', icon: Package, actionType: 'dialog', dialogId: 'endPlacement', variant: 'destructive' },
    ],
  },

  lead: {
    entityType: 'lead',
    steps: [
      { id: 'new', label: 'New', icon: Target, activeStatuses: ['new'], completedStatuses: ['contacted', 'qualified', 'converted'] },
      { id: 'contacted', label: 'Contacted', icon: Phone, activeStatuses: ['contacted'], completedStatuses: ['qualified', 'converted'] },
      { id: 'qualified', label: 'Qualified', icon: Star, activeStatuses: ['qualified'], completedStatuses: ['converted'] },
      { id: 'converted', label: 'Converted', icon: Handshake, activeStatuses: ['converted'], completedStatuses: [] },
    ],
    quickActions: [
      { id: 'edit', label: 'Edit Lead', icon: Target, actionType: 'navigate', href: '/employee/crm/leads/:id/edit' },
      { id: 'qualify', label: 'Update BANT', icon: Star, actionType: 'dialog', dialogId: 'qualifyLead' },
      { id: 'convert', label: 'Convert to Deal', icon: Handshake, actionType: 'dialog', dialogId: 'convertLead' },
    ],
  },

  deal: {
    entityType: 'deal',
    steps: [
      { id: 'discovery', label: 'Discovery', icon: Search, activeStatuses: ['discovery'], completedStatuses: ['qualification', 'proposal', 'negotiation', 'verbal_commit', 'closed_won'] },
      { id: 'qualification', label: 'Qualification', icon: Star, activeStatuses: ['qualification'], completedStatuses: ['proposal', 'negotiation', 'verbal_commit', 'closed_won'] },
      { id: 'proposal', label: 'Proposal', icon: FileText, activeStatuses: ['proposal'], completedStatuses: ['negotiation', 'verbal_commit', 'closed_won'] },
      { id: 'negotiation', label: 'Negotiation', icon: Handshake, activeStatuses: ['negotiation'], completedStatuses: ['verbal_commit', 'closed_won'] },
      { id: 'verbal_commit', label: 'Verbal Commit', icon: CheckCircle, activeStatuses: ['verbal_commit'], completedStatuses: ['closed_won'] },
      { id: 'closed', label: 'Closed', icon: DollarSign, activeStatuses: ['closed_won', 'closed_lost'], completedStatuses: [] },
    ],
    quickActions: [
      { id: 'edit', label: 'Edit Deal', icon: Target, actionType: 'navigate', href: '/employee/crm/deals/:id/edit' },
      { id: 'moveStage', label: 'Move Stage', icon: TrendingUp, actionType: 'dialog', dialogId: 'moveStage' },
      { id: 'activity', label: 'Log Activity', icon: Phone, actionType: 'dialog', dialogId: 'logDealActivity' },
      { id: 'closeWon', label: 'Close Won', icon: DollarSign, actionType: 'dialog', dialogId: 'closeWon' },
    ],
  },
}
```

#### 1.3 Top Navigation Configuration

**File**: `src/lib/navigation/top-navigation.ts` (NEW)
**Changes**: Define top navigation entity tabs and dropdowns

```typescript
import {
  Briefcase, Building2, Users, Target, Handshake, LayoutDashboard,
  Search, Clock, Plus, Gauge, Settings, Bell, ListTodo,
  Calendar, CheckCircle, AlertTriangle, Package
} from 'lucide-react'
import { EntityNavTab } from './entity-navigation.types'

export const topNavigationTabs: EntityNavTab[] = [
  {
    id: 'jobs',
    label: 'Jobs',
    entityType: 'job',
    icon: Briefcase,
    dropdown: [
      { id: 'search-jobs', label: 'Search Jobs', icon: Search, href: '/employee/recruiting/jobs', type: 'link' },
      { id: 'recent-jobs', label: 'Recent Jobs', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'my-jobs', label: 'My Assigned Jobs', icon: Users, href: '/employee/recruiting/jobs?assigned=me', type: 'link' },
      { id: 'active-jobs', label: 'Active Jobs', icon: CheckCircle, href: '/employee/recruiting/jobs?status=active', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-job', label: 'Create Job', icon: Plus, href: '/employee/recruiting/jobs/new', type: 'link' },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    entityType: 'account',
    icon: Building2,
    dropdown: [
      { id: 'search-accounts', label: 'Search Accounts', icon: Search, href: '/employee/recruiting/accounts', type: 'link' },
      { id: 'recent-accounts', label: 'Recent Accounts', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'my-accounts', label: 'My Accounts', icon: Users, href: '/employee/recruiting/accounts?owner=me', type: 'link' },
      { id: 'account-health', label: 'Account Health', icon: Gauge, href: '/employee/recruiting/accounts/health', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-account', label: 'Create Account', icon: Plus, href: '/employee/recruiting/accounts/new', type: 'link' },
    ],
  },
  {
    id: 'candidates',
    label: 'Candidates',
    entityType: 'candidate',
    icon: Users,
    dropdown: [
      { id: 'search-candidates', label: 'Search Candidates', icon: Search, href: '/employee/recruiting/candidates', type: 'link' },
      { id: 'recent-candidates', label: 'Recent Candidates', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'hotlist', label: 'Hotlist', icon: CheckCircle, href: '/employee/recruiting/hotlist', type: 'link' },
      { id: 'bench', label: 'Bench', icon: Package, href: '/employee/recruiting/candidates?status=bench', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-candidate', label: 'Add Candidate', icon: Plus, href: '/employee/recruiting/candidates/new', type: 'link' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    entityType: 'lead',
    icon: Target,
    dropdown: [
      { id: 'leads', label: 'Leads', icon: Target, href: '/employee/crm/leads', type: 'link' },
      { id: 'deals', label: 'Deals Pipeline', icon: Handshake, href: '/employee/crm/deals', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'campaigns', label: 'Campaigns', icon: Gauge, href: '/employee/crm/campaigns', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-lead', label: 'Create Lead', icon: Plus, href: '/employee/crm/leads/new', type: 'link' },
      { id: 'new-deal', label: 'Create Deal', icon: Plus, href: '/employee/crm/deals/new', type: 'link' },
    ],
  },
  {
    id: 'workspace',
    label: 'My Work',
    entityType: 'job', // Not entity-specific, but needed for type
    icon: LayoutDashboard,
    dropdown: [
      { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, href: '/employee/workspace/dashboard', type: 'link' },
      { id: 'today', label: "Today's Tasks", icon: Calendar, href: '/employee/workspace/today', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'activities', label: 'My Activities', icon: ListTodo, href: '/employee/workspace/activities', type: 'link' },
      { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle, href: '/employee/workspace/approvals', type: 'link' },
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/employee/workspace/notifications', type: 'link' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    entityType: 'job', // Not entity-specific
    icon: Settings,
    dropdown: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, href: '/employee/admin/dashboard', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'users', label: 'Users', icon: Users, href: '/employee/admin/users', type: 'link' },
      { id: 'roles', label: 'Roles & Permissions', icon: Settings, href: '/employee/admin/roles', type: 'link' },
      { id: 'pods', label: 'Pods', icon: Package, href: '/employee/admin/pods', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/employee/admin/settings/organization', type: 'link' },
      { id: 'integrations', label: 'Integrations', icon: Package, href: '/employee/admin/integrations', type: 'link' },
    ],
  },
]
```

#### 1.4 Entity Navigation Context Provider

**File**: `src/lib/navigation/EntityNavigationContext.tsx` (NEW)
**Changes**: Create React context for entity navigation state

```typescript
'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { EntityNavigationState, EntityType, RecentEntity } from './entity-navigation.types'

const RECENT_ENTITIES_KEY = 'intime_recent_entities'
const MAX_RECENT_ENTITIES = 5

interface EntityNavigationContextValue extends EntityNavigationState {
  setCurrentEntity: (entity: EntityNavigationState['currentEntity']) => void
  addRecentEntity: (type: EntityType, entity: Omit<RecentEntity, 'viewedAt'>) => void
  clearCurrentEntity: () => void
}

const EntityNavigationContext = createContext<EntityNavigationContextValue | null>(null)

export function EntityNavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EntityNavigationState>({
    currentEntity: null,
    currentStep: null,
    recentEntities: {
      job: [],
      candidate: [],
      account: [],
      submission: [],
      placement: [],
      lead: [],
      deal: [],
    },
  })

  // Load recent entities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_ENTITIES_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setState(prev => ({ ...prev, recentEntities: parsed }))
      } catch (e) {
        console.error('Failed to parse recent entities:', e)
      }
    }
  }, [])

  // Save recent entities to localStorage when changed
  useEffect(() => {
    localStorage.setItem(RECENT_ENTITIES_KEY, JSON.stringify(state.recentEntities))
  }, [state.recentEntities])

  const setCurrentEntity = useCallback((entity: EntityNavigationState['currentEntity']) => {
    setState(prev => ({
      ...prev,
      currentEntity: entity,
      currentStep: entity ? deriveCurrentStep(entity.type, entity.status) : null,
    }))
  }, [])

  const clearCurrentEntity = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentEntity: null,
      currentStep: null,
    }))
  }, [])

  const addRecentEntity = useCallback((type: EntityType, entity: Omit<RecentEntity, 'viewedAt'>) => {
    setState(prev => {
      const current = prev.recentEntities[type]
      // Remove existing entry for same ID
      const filtered = current.filter(e => e.id !== entity.id)
      // Add to front with timestamp
      const updated = [{ ...entity, viewedAt: new Date() }, ...filtered].slice(0, MAX_RECENT_ENTITIES)

      return {
        ...prev,
        recentEntities: {
          ...prev.recentEntities,
          [type]: updated,
        },
      }
    })
  }, [])

  return (
    <EntityNavigationContext.Provider
      value={{
        ...state,
        setCurrentEntity,
        addRecentEntity,
        clearCurrentEntity,
      }}
    >
      {children}
    </EntityNavigationContext.Provider>
  )
}

export function useEntityNavigation() {
  const context = useContext(EntityNavigationContext)
  if (!context) {
    throw new Error('useEntityNavigation must be used within EntityNavigationProvider')
  }
  return context
}

// Helper to derive current step from entity status
function deriveCurrentStep(type: EntityType, status: string): string | null {
  // Import journey configs and find matching step
  // This is a simplified version - full implementation would use entityJourneys
  return status // For now, step ID matches status
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] New files exist at expected paths

#### Manual Verification:
- [ ] Types are correctly exported and importable
- [ ] Context provider can be used in test component

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Top Navigation Component

### Overview
Replace the simple PortalHeader with a new TopNavigation component that includes entity type tabs with dropdown menus.

### Changes Required:

#### 2.1 Top Navigation Component

**File**: `src/components/navigation/TopNavigation.tsx` (NEW)
**Changes**: Create Guidewire-style top navigation with entity dropdowns

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, User, LogOut, Clock, Command } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { topNavigationTabs } from '@/lib/navigation/top-navigation'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { formatDistanceToNow } from 'date-fns'

export function TopNavigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { recentEntities } = useEntityNavigation()

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Auth state management (same as PortalHeader)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const ref = dropdownRefs.current[activeDropdown]
        if (ref && !ref.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown])

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null)
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const toggleDropdown = (tabId: string) => {
    setActiveDropdown(activeDropdown === tabId ? null : tabId)
  }

  // Determine which tab is active based on current path
  const getActiveTab = () => {
    if (pathname.includes('/employee/recruiting/jobs')) return 'jobs'
    if (pathname.includes('/employee/recruiting/accounts')) return 'accounts'
    if (pathname.includes('/employee/recruiting/candidates')) return 'candidates'
    if (pathname.includes('/employee/crm')) return 'crm'
    if (pathname.includes('/employee/workspace')) return 'workspace'
    if (pathname.includes('/employee/admin')) return 'admin'
    return null
  }

  const activeTab = getActiveTab()

  return (
    <header className="bg-hublot-900 text-white z-50 shadow-lg flex-shrink-0">
      <div className="px-4 lg:px-6">
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/employee/workspace/dashboard" className="flex items-center gap-2 mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold italic text-sm text-hublot-900">I</span>
            </div>
            <span className="text-lg font-heading font-bold text-white hidden sm:block">InTime</span>
          </Link>

          {/* Entity Navigation Tabs */}
          <nav className="flex items-center gap-1 flex-1">
            {topNavigationTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isOpen = activeDropdown === tab.id

              return (
                <div
                  key={tab.id}
                  ref={(el) => { dropdownRefs.current[tab.id] = el }}
                  className="relative"
                >
                  <button
                    onClick={() => toggleDropdown(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5',
                      isOpen && 'bg-white/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={cn(
                      'absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                      isOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    )}
                  >
                    {tab.dropdown.map((item) => {
                      if (item.type === 'divider') {
                        return <div key={item.id} className="my-2 border-t border-charcoal-100" />
                      }

                      if (item.type === 'recent') {
                        const recent = recentEntities[tab.entityType] || []
                        if (recent.length === 0) return null

                        return (
                          <div key={item.id}>
                            <div className="px-3 py-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                              Recent
                            </div>
                            {recent.slice(0, 5).map((entity) => (
                              <Link
                                key={entity.id}
                                href={`/employee/recruiting/${tab.entityType}s/${entity.id}`}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <Clock className="w-4 h-4 text-charcoal-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{entity.name}</p>
                                  {entity.subtitle && (
                                    <p className="text-xs text-charcoal-500 truncate">{entity.subtitle}</p>
                                  )}
                                </div>
                                <span className="text-xs text-charcoal-400">
                                  {formatDistanceToNow(new Date(entity.viewedAt), { addSuffix: true })}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )
                      }

                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {ItemIcon && <ItemIcon className="w-4 h-4 text-charcoal-400" />}
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Right Side: Command Palette Hint + User Menu */}
          <div className="flex items-center gap-3">
            {/* Command Palette Hint */}
            <button
              onClick={() => {
                // Dispatch keyboard event to open CommandPalette
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Command className="w-4 h-4" />
              <span className="text-xs">⌘K</span>
            </button>

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-hublot-900" />
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-white/70 transition-transform',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                    userMenuOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                >
                  <div className="px-4 py-3 border-b border-charcoal-100">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-charcoal-500">Superuser</p>
                  </div>
                  <Link
                    href="/employee/admin/settings/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-600 text-hublot-900 rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### 2.2 Update SidebarLayout to Use TopNavigation

**File**: `src/components/layouts/SidebarLayout.tsx`
**Changes**: Replace PortalHeader with TopNavigation

```typescript
import * as React from "react"
import { Sidebar, SidebarSection } from "@/components/navigation/Sidebar"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
  sections: SidebarSection[]
  className?: string
}

export function SidebarLayout({
  children,
  sections,
  className,
}: SidebarLayoutProps) {
  return (
    <div className={cn("h-screen flex flex-col overflow-hidden", className)}>
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar sections={sections} className="hidden lg:flex border-r border-charcoal-100 bg-white" />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 2.3 Add EntityNavigationProvider to Root Layout

**File**: `src/app/employee/layout.tsx` (Modify or Create)
**Changes**: Wrap employee routes with EntityNavigationProvider

```typescript
import { EntityNavigationProvider } from '@/lib/navigation/EntityNavigationContext'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntityNavigationProvider>
      {children}
    </EntityNavigationProvider>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] Development server starts: `pnpm dev`

#### Manual Verification:
- [ ] Top navigation renders with all entity tabs
- [ ] Clicking tab opens dropdown
- [ ] Dropdown items navigate correctly
- [ ] Active tab is highlighted based on current route
- [ ] User menu works (sign out)
- [ ] Command palette hint works

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 3.

---

## Phase 3: Entity Journey Sidebar Component

### Overview
Create the EntityJourneySidebar component that shows wizard-style steps when viewing an entity detail page.

### Changes Required:

#### 3.1 Entity Journey Sidebar Component

**File**: `src/components/navigation/EntityJourneySidebar.tsx` (NEW)
**Changes**: Create sidebar component showing entity journey steps

```typescript
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entityJourneys } from '@/lib/navigation/entity-journeys'
import { EntityType, EntityJourneyStep, EntityQuickAction } from '@/lib/navigation/entity-navigation.types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface EntityJourneySidebarProps {
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  onQuickAction?: (action: EntityQuickAction) => void
  className?: string
}

export function EntityJourneySidebar({
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  onQuickAction,
  className,
}: EntityJourneySidebarProps) {
  const journeyConfig = entityJourneys[entityType]

  // Determine current and completed steps based on entity status
  const { currentStepIndex, steps } = useMemo(() => {
    const steps = journeyConfig.steps.map((step, index) => {
      const isCompleted = step.completedStatuses.includes(entityStatus)
      const isActive = step.activeStatuses.includes(entityStatus)
      return { ...step, isCompleted, isActive, index }
    })

    // Find current step (first active, or last completed)
    const activeIndex = steps.findIndex(s => s.isActive)
    const currentStepIndex = activeIndex >= 0 ? activeIndex : steps.filter(s => s.isCompleted).length - 1

    return { currentStepIndex, steps }
  }, [journeyConfig, entityStatus])

  // Build step href (for now, all steps go to main entity page)
  const buildStepHref = (step: EntityJourneyStep) => {
    const basePath = getEntityBasePath(entityType)
    return `${basePath}/${entityId}?step=${step.id}`
  }

  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col', className)}>
      {/* Entity Header */}
      <div className="p-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate">
          {entityName}
        </h2>
        {entitySubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5">
            {entitySubtitle}
          </p>
        )}
        <div className="mt-2">
          <StatusBadge status={entityStatus} />
        </div>
      </div>

      {/* Journey Steps */}
      <nav className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
          Journey
        </h3>
        <ul className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCurrent = index === currentStepIndex
            const isPast = step.isCompleted || index < currentStepIndex
            const isFuture = !isPast && !isCurrent

            return (
              <li key={step.id}>
                <Link
                  href={buildStepHref(step)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isCurrent && 'bg-gold-50 text-gold-700 font-medium',
                    isPast && 'text-charcoal-600 hover:bg-charcoal-50',
                    isFuture && 'text-charcoal-400 hover:bg-charcoal-50'
                  )}
                >
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                      isPast && 'bg-green-500 text-white',
                      isCurrent && 'bg-gold-500 text-white',
                      isFuture && 'bg-charcoal-200 text-charcoal-500'
                    )}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm truncate block',
                      isCurrent && 'font-medium'
                    )}>
                      {step.label}
                    </span>
                    {step.description && isCurrent && (
                      <span className="text-xs text-charcoal-500 truncate block">
                        {step.description}
                      </span>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isCurrent && (
                    <ChevronRight className="w-4 h-4 text-gold-500" />
                  )}
                </Link>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="ml-6 pl-[11px] py-1">
                    <div
                      className={cn(
                        'w-0.5 h-4',
                        isPast ? 'bg-green-500' : 'bg-charcoal-200'
                      )}
                    />
                  </div>
                )}
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
          {journeyConfig.quickActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => onQuickAction?.(action)}
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

// Helper to get base path for entity type
function getEntityBasePath(type: EntityType): string {
  const paths: Record<EntityType, string> = {
    job: '/employee/recruiting/jobs',
    candidate: '/employee/recruiting/candidates',
    account: '/employee/recruiting/accounts',
    submission: '/employee/recruiting/submissions',
    placement: '/employee/recruiting/placements',
    lead: '/employee/crm/leads',
    deal: '/employee/crm/deals',
  }
  return paths[type]
}

// Simple status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    // Job statuses
    draft: 'bg-charcoal-100 text-charcoal-700',
    open: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    on_hold: 'bg-amber-100 text-amber-700',
    filled: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
    // Candidate statuses
    sourced: 'bg-amber-100 text-amber-700',
    screening: 'bg-blue-100 text-blue-700',
    bench: 'bg-purple-100 text-purple-700',
    placed: 'bg-indigo-100 text-indigo-700',
    inactive: 'bg-charcoal-100 text-charcoal-600',
    // Default
    default: 'bg-charcoal-100 text-charcoal-700',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
      colors[status] || colors.default
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
```

#### 3.2 Entity Detail Layout Component

**File**: `src/components/layouts/EntityDetailLayout.tsx` (NEW)
**Changes**: Create layout that combines top nav + entity sidebar + content

```typescript
'use client'

import { useEffect, ReactNode } from 'react'
import { TopNavigation } from '@/components/navigation/TopNavigation'
import { EntityJourneySidebar } from '@/components/navigation/EntityJourneySidebar'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, EntityQuickAction } from '@/lib/navigation/entity-navigation.types'
import { cn } from '@/lib/utils'

interface EntityDetailLayoutProps {
  children: ReactNode
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  onQuickAction?: (action: EntityQuickAction) => void
  className?: string
}

export function EntityDetailLayout({
  children,
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  onQuickAction,
  className,
}: EntityDetailLayoutProps) {
  const { setCurrentEntity, addRecentEntity } = useEntityNavigation()

  // Set current entity in context and add to recent
  useEffect(() => {
    setCurrentEntity({
      type: entityType,
      id: entityId,
      name: entityName,
      status: entityStatus,
    })

    addRecentEntity(entityType, {
      id: entityId,
      name: entityName,
      subtitle: entitySubtitle,
    })

    // Clear on unmount
    return () => {
      // Don't clear immediately - let it persist for back navigation
    }
  }, [entityType, entityId, entityName, entityStatus, entitySubtitle, setCurrentEntity, addRecentEntity])

  return (
    <div className={cn('h-screen flex flex-col overflow-hidden', className)}>
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Entity Journey Sidebar */}
        <EntityJourneySidebar
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          entitySubtitle={entitySubtitle}
          entityStatus={entityStatus}
          onQuickAction={onQuickAction}
          className="hidden lg:flex"
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] Components can be imported and rendered

#### Manual Verification:
- [ ] EntityJourneySidebar renders all journey steps
- [ ] Current step is highlighted based on entity status
- [ ] Completed steps show checkmarks
- [ ] Quick actions buttons are clickable
- [ ] EntityDetailLayout properly composes components

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 4.

---

## Phase 4: Migrate Job Detail Page

### Overview
Update the Job detail page to use the new EntityDetailLayout and demonstrate the entity-centric pattern.

### Changes Required:

#### 4.1 Create Job Entity Layout

**File**: `src/app/employee/recruiting/jobs/[id]/layout.tsx` (NEW)
**Changes**: Create layout wrapper for job detail pages

```typescript
'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityDetailLayout } from '@/components/layouts/EntityDetailLayout'
import { trpc } from '@/lib/trpc/client'
import { EntityQuickAction } from '@/lib/navigation/entity-navigation.types'
import { useRouter } from 'next/navigation'

// Dialog states will be managed by page component, passed via context or props

export default function JobDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  // Fetch job data for layout
  const { data: job, isLoading } = trpc.ats.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  )

  // Handle quick actions
  const handleQuickAction = (action: EntityQuickAction) => {
    switch (action.actionType) {
      case 'navigate':
        if (action.href) {
          router.push(action.href.replace(':id', jobId))
        }
        break
      case 'dialog':
        // Dispatch custom event for page to handle
        window.dispatchEvent(new CustomEvent('openJobDialog', {
          detail: { dialogId: action.dialogId }
        }))
        break
      case 'mutation':
        // Handle direct mutations
        break
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-charcoal-500">Job not found</p>
      </div>
    )
  }

  return (
    <EntityDetailLayout
      entityType="job"
      entityId={jobId}
      entityName={job.title}
      entitySubtitle={job.account?.name || 'No client'}
      entityStatus={job.status}
      onQuickAction={handleQuickAction}
    >
      {children}
    </EntityDetailLayout>
  )
}
```

#### 4.2 Simplify Job Detail Page

**File**: `src/app/employee/recruiting/jobs/[id]/page.tsx`
**Changes**: Remove header and navigation since EntityDetailLayout handles it

The existing job detail page should be simplified to remove:
- Custom header with back button (handled by breadcrumbs)
- Status badge in header (shown in sidebar)
- Action buttons (moved to sidebar quick actions)

Keep:
- Summary cards
- Tab content (Overview, Pipeline, Activity)
- All dialogs

```typescript
// Key changes to make:
// 1. Remove the header section (lines ~133-232)
// 2. Keep summary cards and tabs
// 3. Add listener for quick action events
// 4. Update layout to not include its own header

// Add event listener for dialog opening
useEffect(() => {
  const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
    switch (event.detail.dialogId) {
      case 'updateStatus':
        setShowStatusDialog(true)
        break
      case 'closeJob':
        setShowCloseWizard(true)
        break
    }
  }

  window.addEventListener('openJobDialog', handleOpenDialog as EventListener)
  return () => window.removeEventListener('openJobDialog', handleOpenDialog as EventListener)
}, [])
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] Development server runs: `pnpm dev`

#### Manual Verification:
- [ ] Job detail page loads with entity sidebar
- [ ] Journey steps reflect job status correctly
- [ ] Quick actions open appropriate dialogs
- [ ] Tab navigation still works
- [ ] All existing functionality preserved

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 5.

---

## Phase 5: Migrate Remaining Entity Pages

### Overview
Apply the entity-centric pattern to Candidate, Account, Deal, and Lead detail pages.

### Changes Required:

#### 5.1 Candidate Detail Layout

**File**: `src/app/employee/recruiting/candidates/[id]/layout.tsx` (NEW)

Similar pattern to Job layout - fetch candidate, wrap with EntityDetailLayout.

#### 5.2 Account Detail Layout

**File**: `src/app/employee/recruiting/accounts/[id]/layout.tsx` (NEW)

Similar pattern - fetch account, wrap with EntityDetailLayout.

#### 5.3 Deal Detail Layout

**File**: `src/app/employee/crm/deals/[id]/layout.tsx` (NEW)

Similar pattern - fetch deal, wrap with EntityDetailLayout.

#### 5.4 Lead Detail Layout

**File**: `src/app/employee/crm/leads/[id]/layout.tsx` (NEW)

Similar pattern - fetch lead, wrap with EntityDetailLayout.

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] All entity detail pages show journey sidebar
- [ ] Journey steps are correct for each entity type
- [ ] Quick actions work for each entity type
- [ ] Recent entities appear in top nav dropdowns

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 6.

---

## Phase 6: Polish & Refinements

### Overview
Final polish: mobile responsiveness, keyboard navigation, accessibility, and edge cases.

### Changes Required:

#### 6.1 Mobile Navigation

**File**: `src/components/navigation/TopNavigation.tsx`
**Changes**: Add mobile menu toggle and slide-out navigation

#### 6.2 Keyboard Navigation

**File**: Multiple navigation components
**Changes**: Add keyboard navigation support (arrow keys, Tab, Enter)

#### 6.3 Accessibility

**Changes**:
- Add ARIA labels and roles
- Ensure focus management
- Screen reader announcements for navigation

#### 6.4 Loading States

**Changes**:
- Skeleton loading for entity sidebar
- Graceful fallbacks when data unavailable

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Navigation works on mobile devices
- [ ] Keyboard navigation works throughout
- [ ] No accessibility violations (axe-core)
- [ ] Loading states display correctly

---

## Testing Strategy

### Unit Tests
- EntityNavigationContext state management
- Journey step calculation from entity status
- Recent entities localStorage persistence

### Integration Tests
- Top navigation dropdown interactions
- Entity sidebar renders correct steps
- Quick action dispatching

### Manual Testing Steps
1. Navigate through all top nav dropdowns
2. View Job detail - verify journey sidebar
3. Change job status - verify step updates
4. Use quick actions - verify dialogs open
5. Check recent entities populate in dropdowns
6. Test on mobile viewport
7. Test keyboard-only navigation

## Performance Considerations

- **Recent entities capped at 5 per type** to limit localStorage size
- **Journey configs are static** - no runtime computation
- **Entity sidebar data fetched once** at layout level, not per step
- **Dropdown menus lazy-mounted** to reduce initial render

## Migration Notes

### Backwards Compatibility
- Existing routes remain functional
- Old `PortalHeader` can be kept for non-entity pages
- Gradual migration - pages opt-in to new layout

### Rollback Plan
If issues arise:
1. Remove entity layouts from app/employee routes
2. Restore `PortalHeader` import in `SidebarLayout`
3. Entity navigation context can remain (no side effects)

## References

- Research document: `thoughts/shared/research/2025-12-07-guidewire-architecture-alignment.md`
- Guidewire documentation: https://docs.guidewire.com/
- Current navigation: `src/lib/navigation/`
- Current layouts: `src/components/layouts/`
