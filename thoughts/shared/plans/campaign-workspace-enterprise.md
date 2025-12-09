# Campaign Workspace - Enterprise Implementation Plan

**Date**: 2025-12-09
**Status**: ✅ Implemented (2025-12-09)
**Scope**: Complete campaign management workspace with Journey + Sections dual-mode navigation
**Reconciled**: 2025-12-09 - All major features implemented, documentation deferred

---

## Executive Summary

Transform the campaign detail page into an enterprise-grade workspace inspired by Apple/Tesla design philosophy and Guidewire PolicyCenter architecture. The workspace provides **two complementary navigation modes**:

1. **Journey Mode**: Sequential workflow execution from campaign setup to completion
2. **Sections Mode**: Information-centric navigation for campaign management and analysis

---

## Architecture Overview

```
Campaign Workspace
├── Navigation Mode Toggle (Journey ↔ Sections)
├── Journey Mode
│   ├── Step 1: Setup (Configure campaign)
│   ├── Step 2: Audience (Build prospect list)
│   ├── Step 3: Execute (Run outreach)
│   ├── Step 4: Nurture (Follow-up engaged)
│   └── Step 5: Close (Complete & analyze)
├── Sections Mode
│   ├── Main Sections
│   │   ├── Overview (Dashboard)
│   │   ├── Prospects (Audience management)
│   │   ├── Leads (Converted prospects)
│   │   └── Funnel (Visual pipeline)
│   ├── Automation Sections
│   │   ├── Sequence (Email/LinkedIn automation)
│   │   └── Analytics (Performance metrics)
│   └── Tool Sections
│       ├── Activities
│       ├── Notes
│       ├── Documents
│       └── History
└── Shared Components
    ├── Campaign Header (sticky)
    ├── Metrics Bar
    ├── Quick Actions (context-aware)
    └── Dialog System
```

---

## Part 1: Journey Mode Implementation

### 1.1 Journey Steps Definition

| Step | ID | Label | Description | Active Statuses | Completed Statuses |
|------|-----|-------|-------------|-----------------|-------------------|
| 1 | `setup` | Setup | Configure campaign settings, goals, channels | `draft` | `scheduled`, `active`, `paused`, `completed` |
| 2 | `audience` | Audience | Build and refine prospect list | `draft`, `scheduled` | `active`, `paused`, `completed` |
| 3 | `execute` | Execute | Run outreach sequences | `active` | `paused`, `completed` |
| 4 | `nurture` | Nurture | Follow up with engaged prospects | `active` | `completed` |
| 5 | `close` | Close | Complete campaign, analyze results | `completed` | — |

### 1.2 Journey Step Components

#### Step 1: Setup (`CampaignJourneySetup.tsx`)
```typescript
interface SetupStepProps {
  entityId: string
  entity: Campaign
  onNext: () => void
}

// Checklist items:
// - Campaign name and type defined
// - Goal description added
// - Target metrics set (leads, meetings)
// - Budget allocated
// - Start/end dates configured
// - Channels selected
```

**UI Elements:**
- Editable info cards for campaign details
- Channel selector (Email, LinkedIn, Phone, SMS)
- Goal configuration form
- Budget allocation input
- Date range picker

#### Step 2: Audience (`CampaignJourneyAudience.tsx`)
```typescript
// Checklist items:
// - Target audience criteria defined
// - Prospects imported/added (minimum 10)
// - Duplicates removed
// - Invalid contacts cleaned
// - Segment assigned
```

**UI Elements:**
- Audience criteria builder
- Prospect import wizard
- Data quality indicators
- Segment assignment dropdown
- Prospect count with health score

#### Step 3: Execute (`CampaignJourneyExecute.tsx`)
```typescript
// Checklist items:
// - Email sequence configured
// - LinkedIn automation set (if applicable)
// - First batch sent
// - Tracking enabled
// - Response monitoring active
```

**UI Elements:**
- Sequence builder/preview
- Send schedule configuration
- Real-time send progress
- Open/click rate monitors
- Pause/resume controls

#### Step 4: Nurture (`CampaignJourneyNurture.tsx`)
```typescript
// Checklist items:
// - Responded prospects identified
// - Follow-up tasks created
// - Meetings scheduled
// - Leads qualified
// - Handoff to sales (if applicable)
```

**UI Elements:**
- Engaged prospect list
- Follow-up task queue
- Meeting scheduler
- Lead qualification form
- Handoff workflow

#### Step 5: Close (`CampaignJourneyClose.tsx`)
```typescript
// Checklist items:
// - All sequences completed
// - Final metrics captured
// - ROI calculated
// - Learnings documented
// - Archive/duplicate decision made
```

**UI Elements:**
- Final metrics dashboard
- ROI calculator
- Campaign summary generator
- Learnings note form
- Archive/duplicate actions

### 1.3 Journey Navigation Component

**File**: `src/components/navigation/CampaignJourneySidebar.tsx`

```typescript
interface CampaignJourneySidebarProps {
  campaign: Campaign
  currentStep: string
  onStepChange: (stepId: string) => void
  completedSteps: string[]
}

// Visual design:
// - Vertical step indicator
// - Checkmark for completed steps
// - Current step highlighted with gold accent
// - Future steps grayed out
// - Step description on hover
// - Progress percentage at top
```

### 1.4 Journey Mode URL Pattern

```
/employee/crm/campaigns/[id]?mode=journey&step=setup
/employee/crm/campaigns/[id]?mode=journey&step=audience
/employee/crm/campaigns/[id]?mode=journey&step=execute
/employee/crm/campaigns/[id]?mode=journey&step=nurture
/employee/crm/campaigns/[id]?mode=journey&step=close
```

---

## Part 2: Sections Mode Implementation

### 2.1 Enhanced Section Definitions

**File**: `src/lib/navigation/entity-sections.ts`

```typescript
export const campaignSectionsEnhanced: SectionDefinition[] = [
  // Main sections (always visible)
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'prospects', label: 'Prospects', icon: Users, showCount: true },
  { id: 'leads', label: 'Leads', icon: Target, showCount: true },
  { id: 'funnel', label: 'Funnel', icon: TrendingDown }, // NEW

  // Automation sections
  { id: 'sequence', label: 'Sequence', icon: Workflow }, // NEW
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },

  // Tool sections (collapsible)
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]
```

### 2.2 New Section Components

#### 2.2.1 Funnel Section (`CampaignFunnelSectionPCF.tsx`)

**Purpose**: Visual representation of prospect progression through campaign stages.

```typescript
interface FunnelStage {
  id: string
  label: string
  count: number
  percentage: number
  color: string
  dropOffRate?: number
}

const funnelStages: FunnelStage[] = [
  { id: 'audience', label: 'Audience', count: 500, percentage: 100, color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', count: 350, percentage: 70, color: 'bg-purple-500' },
  { id: 'opened', label: 'Opened', count: 175, percentage: 35, color: 'bg-indigo-500' },
  { id: 'clicked', label: 'Clicked', count: 87, percentage: 17.4, color: 'bg-cyan-500' },
  { id: 'responded', label: 'Responded', count: 45, percentage: 9, color: 'bg-green-500' },
  { id: 'qualified', label: 'Qualified', count: 25, percentage: 5, color: 'bg-amber-500' },
  { id: 'converted', label: 'Converted', count: 12, percentage: 2.4, color: 'bg-gold-500' },
]
```

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMPAIGN FUNNEL                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │████████████████████████████████████████████████████████████████████│ 500│
│  │ AUDIENCE                                                    100%    │    │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              ↓ 30% drop-off                                  │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │████████████████████████████████████████████████████████████    │ 350    │
│  │ CONTACTED                                               70%     │        │
│  └────────────────────────────────────────────────────────────────┘         │
│                              ↓ 50% drop-off                                  │
│  ┌────────────────────────────────────────────────┐                         │
│  │██████████████████████████████████████████      │ 175                     │
│  │ OPENED                                   35%    │                         │
│  └────────────────────────────────────────────────┘                         │
│                              ↓ 50% drop-off                                  │
│  ┌─────────────────────────────────┐                                        │
│  │██████████████████████████████   │ 87                                     │
│  │ CLICKED                   17.4% │                                        │
│  └─────────────────────────────────┘                                        │
│                              ↓ 48% drop-off                                  │
│  ┌─────────────────────────┐                                                │
│  │████████████████████     │ 45                                             │
│  │ RESPONDED          9%   │                                                │
│  └─────────────────────────┘                                                │
│                              ↓ 44% drop-off                                  │
│  ┌─────────────────┐                                                        │
│  │████████████     │ 25                                                     │
│  │ QUALIFIED  5%   │                                                        │
│  └─────────────────┘                                                        │
│                              ↓ 52% drop-off                                  │
│  ┌───────────┐                                                              │
│  │██████     │ 12                                                           │
│  │ LEAD 2.4% │                                                              │
│  └───────────┘                                                              │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ FUNNEL INSIGHTS                                                              │
│ • Highest drop-off: Contacted → Opened (50%)                                │
│ • Recommendation: Improve email subject lines                               │
│ • Overall conversion: 2.4% (Industry avg: 2.1%)                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Sequence Section (`CampaignSequenceSectionPCF.tsx`)

**Purpose**: Manage and monitor email/LinkedIn automation sequences.

```typescript
interface SequenceStep {
  id: string
  stepNumber: number
  channel: 'email' | 'linkedin' | 'phone' | 'sms'
  subject?: string
  templateName: string
  delay: { value: number; unit: 'hours' | 'days' }
  status: 'pending' | 'in_progress' | 'completed'
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
  }
}
```

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OUTREACH SEQUENCE                                    [Edit Sequence] [Pause]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ STEP 1 ────────────────────────────────────────────────────────────┐   │
│  │ ✉️  EMAIL • Introduction                                    ✓ Done   │   │
│  │ Subject: "Quick question about {{company}}'s hiring needs"          │   │
│  │                                                                      │   │
│  │ Sent: 500  │  Delivered: 495  │  Opened: 175 (35%)  │  Clicked: 45 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                         ⏱ 3 days                                            │
│                              ↓                                               │
│  ┌─ STEP 2 ────────────────────────────────────────────────────────────┐   │
│  │ 💼  LINKEDIN • Connection Request                           ✓ Done   │   │
│  │ "Hi {{first_name}}, I noticed we share connections at..."           │   │
│  │                                                                      │   │
│  │ Sent: 350  │  Accepted: 120 (34%)  │  Replied: 25                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                         ⏱ 2 days                                            │
│                              ↓                                               │
│  ┌─ STEP 3 ────────────────────────────────────────────────────────────┐   │
│  │ ✉️  EMAIL • Follow-up                                      ● Active  │   │
│  │ Subject: "Re: {{company}} - quick follow up"                        │   │
│  │                                                                      │   │
│  │ Sent: 280  │  Delivered: 278  │  Opened: 89 (32%)  │  Clicked: 22  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                         ⏱ 4 days                                            │
│                              ↓                                               │
│  ┌─ STEP 4 ────────────────────────────────────────────────────────────┐   │
│  │ 📞  PHONE • Call Attempt                                   ○ Pending │   │
│  │ Script: "Hi {{first_name}}, this is [Name] from InTime..."          │   │
│  │                                                                      │   │
│  │ Scheduled: 150 calls                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ SEQUENCE SUMMARY                                                             │
│ Total Steps: 4  │  Avg Open Rate: 33.5%  │  Reply Rate: 9%  │  Est. End: Dec 20│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Enhanced Overview Section

Update `CampaignOverviewSectionPCF.tsx` to include:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CAMPAIGN OVERVIEW                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ CAMPAIGN HEALTH ───────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │   │  ON TRACK │  │ 25/100   │  │ 5/20     │  │ $1,250   │           │   │
│  │   │  Status   │  │ Leads    │  │ Meetings │  │ Cost/Lead│           │   │
│  │   │    ●      │  │ ████░░░░ │  │ ██░░░░░░ │  │ ████░░░░ │           │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘           │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ QUICK STATS ───────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │   Prospects: 500          Response Rate: 9%                         │   │
│  │   Contacted: 350 (70%)    Conversion Rate: 2.4%                     │   │
│  │   Responded: 45 (9%)      Budget Used: $31,250 / $50,000            │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ CAMPAIGN TIMELINE ─────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Dec 1        Dec 8       Dec 15       Dec 22       Dec 29          │   │
│  │    ●───────────●───────────○───────────○───────────○               │   │
│  │  Start      Today                                  End              │   │
│  │                                                                      │   │
│  │  Day 8 of 28  │  29% Complete  │  On pace for 35 leads             │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ RECENT ACTIVITY ───────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  • 12 new responses today                                           │   │
│  │  • 3 meetings scheduled                                              │   │
│  │  • Step 3 email sending (280/350)                                   │   │
│  │  • 2 prospects converted to leads                                   │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Sections Mode URL Pattern

```
/employee/crm/campaigns/[id]?mode=sections&section=overview
/employee/crm/campaigns/[id]?mode=sections&section=prospects
/employee/crm/campaigns/[id]?mode=sections&section=leads
/employee/crm/campaigns/[id]?mode=sections&section=funnel
/employee/crm/campaigns/[id]?mode=sections&section=sequence
/employee/crm/campaigns/[id]?mode=sections&section=analytics
/employee/crm/campaigns/[id]?section=activities (tools)
```

---

## Part 3: Sidebar Implementation

### 3.1 Campaign Entity Sidebar

**File**: `src/components/navigation/CampaignEntitySidebar.tsx`

This sidebar adapts based on the current navigation mode:

```typescript
interface CampaignEntitySidebarProps {
  campaign: Campaign
  mode: 'journey' | 'sections'
  currentStep?: string
  currentSection?: string
  counts: {
    prospects: number
    leads: number
    activities: number
    notes: number
    documents: number
  }
}
```

**Journey Mode Layout**:
```
┌─────────────────────────┐
│ CAMPAIGN JOURNEY        │
│ ████████░░░░ 40%        │
├─────────────────────────┤
│                         │
│  ① Setup          ✓     │
│  ② Audience       ✓     │
│  ③ Execute        ●     │
│  ④ Nurture        ○     │
│  ⑤ Close          ○     │
│                         │
├─────────────────────────┤
│ QUICK ACTIONS           │
├─────────────────────────┤
│ [Pause Campaign]        │
│ [Add Prospects]         │
│ [View Analytics]        │
├─────────────────────────┤
│ TOOLS                   │
├─────────────────────────┤
│ ○ Activities (24)       │
│ ○ Notes (5)             │
│ ○ Documents (3)         │
└─────────────────────────┘
```

**Sections Mode Layout**:
```
┌─────────────────────────┐
│ CAMPAIGN                │
│ [Journey ↔ Sections]    │
├─────────────────────────┤
│ MAIN                    │
├─────────────────────────┤
│ □ Overview              │
│ □ Prospects (500)       │
│ □ Leads (25)            │
│ □ Funnel                │
├─────────────────────────┤
│ AUTOMATION              │
├─────────────────────────┤
│ □ Sequence              │
│ □ Analytics             │
├─────────────────────────┤
│ TOOLS                   │
├─────────────────────────┤
│ ○ Activities (24)       │
│ ○ Notes (5)             │
│ ○ Documents (3)         │
│ ○ History               │
├─────────────────────────┤
│ QUICK ACTIONS           │
├─────────────────────────┤
│ [Start Campaign]        │
│ [Add Prospects]         │
│ [Export Report]         │
└─────────────────────────┘
```

---

## Part 4: Visual Components

### 4.1 Funnel Chart Component

**File**: `src/components/ui/funnel-chart.tsx`

```typescript
interface FunnelChartProps {
  stages: FunnelStage[]
  showDropOff?: boolean
  showInsights?: boolean
  variant?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

// Styling:
// - Smooth gradient transitions between stages
// - 300ms animation on hover
// - Tooltip with detailed metrics
// - Responsive sizing
// - Gold accent for conversion stage
```

### 4.2 Sequence Timeline Component

**File**: `src/components/ui/sequence-timeline.tsx`

```typescript
interface SequenceTimelineProps {
  steps: SequenceStep[]
  currentStep: number
  onStepClick: (stepId: string) => void
  onEditStep: (stepId: string) => void
}

// Styling:
// - Vertical timeline with connecting lines
// - Channel icons (email, linkedin, phone)
// - Status indicators (done, active, pending)
// - Expandable step details
// - Inline stats display
```

### 4.3 Progress Ring Component

**File**: `src/components/ui/progress-ring.tsx`

```typescript
interface ProgressRingProps {
  value: number
  max: number
  label: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showPercentage?: boolean
}

// Visual: Circular progress indicator (Tesla-style)
```

---

## Part 5: Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [x] Update `entity-sections.ts` with enhanced campaign sections
  - ✓ RESOLVED (2025-12-09): Complete with main/automation/tools groups in `src/lib/navigation/entity-sections.ts`
- [x] Update `entity-journeys.ts` with detailed campaign journey steps
  - ✓ RESOLVED (2025-12-09): 5-step journey (setup→audience→execute→nurture→close) in `src/lib/navigation/entity-journeys.ts`
- [x] Create `CampaignEntitySidebar.tsx` with mode toggle
  - ✓ RESOLVED (2025-12-09): Full implementation in `src/components/navigation/CampaignEntitySidebar.tsx`
- [x] Update campaign detail page to support dual modes
  - ✓ RESOLVED (2025-12-09): Uses EntityDetailView with dialog handlers in `src/app/employee/crm/campaigns/[id]/page.tsx`

### Phase 2: Journey Mode (Days 3-4)
- [x] Create journey step components (5 steps)
  - ✓ RESOLVED (2025-12-09): All 5 step components created in `src/configs/entities/steps/campaigns.steps.tsx`
    - CampaignSetupStepPCF, CampaignAudienceStepPCF, CampaignExecuteStepPCF, CampaignNurtureStepPCF, CampaignCloseStepPCF
- [x] Implement checklist system with persistence
  - ✓ RESOLVED (2025-12-09): Created `src/lib/hooks/useJourneyChecklist.ts` with localStorage persistence
    - Supports manual toggle, auto-completion from entity data, progress calculation
- [x] Add step navigation with completion tracking
  - ✓ RESOLVED (2025-12-09): Updated `EntityDetailView.tsx` to render journey steps via `renderContent()` function
    - URL pattern: `?mode=journey&step=setup|audience|execute|nurture|close`
- [x] Create journey progress indicator
  - ✓ RESOLVED (2025-12-09): Progress bar in CampaignEntitySidebar.tsx (lines 212-226)

### Phase 3: Sections Mode (Days 5-6)
- [x] Create `CampaignFunnelSectionPCF.tsx`
  - ✓ RESOLVED (2025-12-09): Implemented in `src/configs/entities/sections/campaigns.sections.tsx` (lines 1050-1213)
- [x] Create `CampaignSequenceSectionPCF.tsx`
  - ✓ RESOLVED (2025-12-09): Implemented in `src/configs/entities/sections/campaigns.sections.tsx` (lines 1224-1421)
- [x] Enhance `CampaignOverviewSectionPCF.tsx`
  - ✓ RESOLVED (2025-12-09): Enterprise dashboard with health ring, metrics grid, recent activity (lines 81-535)
- [x] Add section counts and badges
  - ✓ RESOLVED (2025-12-09): showCount property in entity-sections.ts + badge rendering in CampaignEntitySidebar

### Phase 4: Visual Components (Days 7-8)
- [x] Build `funnel-chart.tsx`
  - ✓ RESOLVED (2025-12-09): Full implementation with FunnelChart, FunnelChartCompact, insights generation in `src/components/ui/funnel-chart.tsx`
- [x] Build `sequence-timeline.tsx`
  - ✓ RESOLVED (2025-12-09): Full implementation with SequenceTimeline, SequenceTimelineCompact in `src/components/ui/sequence-timeline.tsx`
- [x] Build `progress-ring.tsx`
  - ✓ RESOLVED (2025-12-09): Full implementation with ProgressRing, CampaignHealthRing in `src/components/ui/progress-ring.tsx`
- [x] Add animations and transitions
  - ✓ RESOLVED (2025-12-09): 300ms transitions throughout, animated progress bars, hover effects

### Phase 5: Backend Support (Days 9-10)
- [x] Add tRPC procedures for funnel metrics
  - ✓ RESOLVED (2025-12-09): `get_campaign_funnel` RPC called in `crm.ts:4606,4703,5084`; returns prospects/contacted/opened/responded/leads/meetings
- [x] Add sequence management endpoints
  - ✓ RESOLVED (2025-12-09): Full CRUD procedures added in `src/server/routers/crm.ts:5892-6168`
    - `sequence.list` - List steps from sequences JSONB
    - `sequence.addStep` - Add step to channel sequence
    - `sequence.updateStep` - Update specific step
    - `sequence.deleteStep` - Remove and renumber steps
    - `sequence.getPerformance` - Step-by-step analytics from campaign_sequence_logs
- [x] Add journey progress tracking
  - ✓ RESOLVED (2025-12-09): Implemented via `useJourneyChecklist` hook with localStorage persistence
    - Hybrid approach: auto-completion from entity data + manual checklist persistence
    - Future: Add optional database sync via `useJourneyProgressSync`
- [x] Add analytics aggregation
  - ✓ RESOLVED (2025-12-09): Funnel metrics via RPC + sequence performance via `sequence.getPerformance`
    - Deep analytics deferred to future sprint (time-series, A/B testing)

### Phase 6: Polish (Days 11-12)
- [x] Responsive design testing
  - ✓ RESOLVED (2025-12-09): Updated all grids to responsive breakpoints
    - `grid-cols-1 lg:grid-cols-12`, `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
    - Mobile-first approach with breakpoints at `md` (768px) and `lg` (1024px)
- [x] Accessibility audit
  - ✓ RESOLVED (2025-12-09): Added ARIA labels and roles
    - `role="region" aria-label="..."` on metric sections
    - Focus states with `focus:ring-2 focus:ring-gold-500`
    - Semantic HTML with proper heading hierarchy
- [x] Performance optimization
  - ✓ RESOLVED (2025-12-09): Added React optimizations
    - `React.memo()` on ChecklistItemComponent and StepHeader
    - `useMemo()` for checklist items and computed values
    - `useCallback()` for event handlers
- [ ] Documentation
  - ⏸️ DEFERRED: User documentation to be created when feature is finalized

---

## Workarounds Identified

1. **CampaignProspectsSectionPCF** (`campaigns.sections.tsx:544-579`)
   - ✓ RESOLVED (2025-12-09): Now uses `trpc.crm.campaigns.getProspects.useQuery()`
   - Prospects list populated from actual data via existing procedure
   - Loading state properly connected to `prospectsQuery.isLoading`

2. **CampaignSequenceSectionPCF** (`campaigns.sections.tsx:1228`)
   - ✓ RESOLVED (2025-12-09): Now uses `trpc.crm.campaigns.sequence.list.useQuery()`
   - Backend procedure implemented at `src/server/routers/crm.ts:5892-5946`
   - Parses sequences JSONB column and returns flat array of steps

---

## File Changes Summary

### New Files (Implemented)
```
src/configs/entities/steps/campaigns.steps.tsx          ← Journey step components (5 steps)
src/lib/hooks/useJourneyChecklist.ts                   ← Checklist persistence hook
src/components/navigation/CampaignEntitySidebar.tsx    ← Dual-mode sidebar
src/components/ui/funnel-chart.tsx                     ← Visual funnel component
src/components/ui/sequence-timeline.tsx                ← Sequence timeline component
src/components/ui/progress-ring.tsx                    ← Progress ring component
```

### Modified Files
```
src/lib/navigation/entity-sections.ts                  ← Enhanced campaign sections
src/lib/navigation/entity-journeys.ts                  ← 5-step campaign journey
src/configs/entities/campaigns.config.ts               ← Added journeySteps config array
src/configs/entities/types.ts                          ← Added component to JourneyStepConfig
src/configs/entities/sections/campaigns.sections.tsx   ← Fixed prospects/sequence queries, responsive
src/components/pcf/detail-view/EntityDetailView.tsx    ← Added renderContent() for journey mode
src/server/routers/crm.ts                              ← Added sequence.* CRUD procedures
src/app/employee/crm/campaigns/[id]/page.tsx           ← Dialog handlers
```

---

## Success Criteria

1. **Journey Mode**: Users can execute campaigns step-by-step with clear progress
2. **Sections Mode**: Users can access any campaign information in 1 click
3. **Visual Excellence**: Funnel and sequence visualizations are intuitive
4. **Performance**: Page loads in <1s, interactions feel instant (300ms)
5. **Responsiveness**: Works on desktop, tablet, and mobile
6. **Accessibility**: WCAG 2.1 AA compliant

---

## Next Steps

1. Review and approve this plan
2. Create feature branch: `feat/campaign-workspace-enterprise`
3. Begin Phase 1 implementation
4. Daily progress reviews

---

*Plan created: 2025-12-09*
*Author: Claude Code*
