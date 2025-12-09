---
date: 2025-12-08T00:00:00-06:00
researcher: Claude Code
git_commit: bfba1ba4789613a30e4a3048d3ae4d9b34a0b565
branch: main
repository: SumanthNagolu/intime-v3
topic: "Campaign Workspace - Guidewire-Inspired Architecture Research"
tags: [research, codebase, campaign, crm, guidewire, workspace]
status: complete
last_updated: 2025-12-08
last_updated_by: Claude Code
---

# Research: Campaign Workspace - Guidewire-Inspired Architecture

**Date**: 2025-12-08
**Researcher**: Claude Code
**Git Commit**: bfba1ba4789613a30e4a3048d3ae4d9b34a0b565
**Branch**: main
**Repository**: SumanthNagolu/intime-v3

## Research Question

Document the current state of the Campaign Workspace implementation to understand what files and line numbers are relevant to the CAMPAIGNS-01 issue for transforming it into a Guidewire-inspired system with 9 complete sections, activity-centric logging, and efficient queries.

## Summary

The Campaign Workspace already has substantial infrastructure in place. It includes:
- A complete 9-section navigation system defined in `entity-sections.ts`
- Section components for all 9 sections (Overview, Sequences, Prospects, Leads, Activities, Documents, Notes, Analytics, History)
- A dedicated `CampaignSectionSidebar` with journey visualization and metrics
- An optimized `getByIdWithCounts` tRPC procedure for single-query data fetching
- InlinePanel components for list-detail views (Prospects and Sequences sections)
- Activity logging for campaign mutations in the tRPC router

## Detailed Findings

### 1. Campaign Routing & Pages

**App Router Structure:**

| File | Purpose | Line Numbers |
|------|---------|--------------|
| `src/app/employee/crm/campaigns/page.tsx` | Campaign list route | Renders `CampaignsListPage` |
| `src/app/employee/crm/campaigns/layout.tsx` | Campaign list layout | Pass-through layout |
| `src/app/employee/crm/campaigns/[id]/page.tsx` | Campaign detail route | Renders `CampaignDetailPage` with campaignId |
| `src/app/employee/crm/campaigns/[id]/layout.tsx` | Campaign detail layout | Lines 1-39 - Server-side layout with `EntityContextProvider` |

**Campaign Detail Layout** (`src/app/employee/crm/campaigns/[id]/layout.tsx:13-38`):
- Uses `getServerCaller()` for server-side tRPC calls
- Fetches campaign with `getByIdWithCounts` (optimized single query)
- Wraps children in `EntityContextProvider` with campaign data
- Handles 404 with `notFound()`

### 2. Main Campaign Components

**CampaignDetailPage** (`src/components/crm/campaigns/CampaignDetailPage.tsx`):

| Section | Lines | Description |
|---------|-------|-------------|
| Props interface | 62-64 | `CampaignDetailPageProps` with `campaignId` |
| Status config | 66-97 | Status colors, icons, labels (draft, scheduled, active, paused, completed) |
| Data fetching | 119-125 | Uses `getByIdWithCounts` with 5-min cache |
| Status mutation | 127-136 | `updateStatus` mutation for pause/resume |
| Section rendering | 227-293 | Switch statement renders section components based on URL param |
| Sticky header | 299-578 | Header with metrics bar showing Contacted, Response Rate, Leads, Meetings |
| Dialogs | 586-619 | EditCampaignDialog, CompleteCampaignDialog, DuplicateCampaignDialog |

**Key features already implemented:**
- Sticky header with key metrics bar (line 429-577)
- URL-based section navigation via `searchParams.get('section')` (line 108)
- Lazy-loaded section rendering (line 227-293)
- Dialog event listener for sidebar actions (lines 151-165)

**CampaignSectionSidebar** (`src/components/navigation/CampaignSectionSidebar.tsx`):

| Section | Lines | Description |
|---------|-------|-------------|
| Props interface | 175-193 | Accepts counts, metrics, targets, dates |
| Journey calculation | 212-218 | 4-stage journey: setup, active, converting, complete |
| Days calculation | 223-251 | Calculates days remaining/elapsed with progress |
| Health status | 256-269 | Health indicator: excellent, good, fair, poor |
| Journey visualization | 364-428 | 4-step visual journey with progress bar |
| Metrics grid | 430-573 | 4-card grid: Contacted, Opened, Responded, Leads with progress bars |
| Section navigation | 575-631 | 9 sections with counts and active state |
| Quick actions | 633-669 | Status-aware actions: Start, Resume, Pause, Complete, Edit, etc. |

### 3. Section Components

All sections in `src/components/crm/campaigns/sections/`:

| Component | File | Key Features |
|-----------|------|--------------|
| `CampaignOverviewSection` | `CampaignOverviewSection.tsx` | Dashboard/summary view with funnel, targets, budget |
| `CampaignSequencesSection` | `CampaignSequencesSection.tsx` | Table with inline panel (lines 133-374), channel filter |
| `CampaignProspectsSection` | `CampaignProspectsSection.tsx` | Table with inline panel (lines 130-370), status filter, convert action |
| `CampaignLeadsSection` | `CampaignLeadsSection.tsx` | Leads generated from campaign |
| `CampaignActivitiesSection` | `CampaignActivitiesSection.tsx` | Activity log/timeline |
| `CampaignDocumentsSection` | `CampaignDocumentsSection.tsx` | Document attachments |
| `CampaignNotesSection` | `CampaignNotesSection.tsx` | Internal notes |
| `CampaignAnalyticsSection` | `CampaignAnalyticsSection.tsx` | Performance charts, metrics |
| `CampaignHistorySection` | `CampaignHistorySection.tsx` | Event timeline |
| `ABTestingSection` | `ABTestingSection.tsx` | A/B testing functionality |

**InlinePanel Pattern** (demonstrated in `CampaignProspectsSection.tsx`):
- List shrinks when panel open: `max-w-[calc(100%-496px)]` (line 134)
- Selected row highlighted: `bg-hublot-50` (line 156)
- Panel width: `lg` = 480px (line 242)
- Uses `InlinePanel`, `InlinePanelHeader`, `InlinePanelContent`, `InlinePanelSection` components

### 4. Navigation Configuration

**Entity Sections** (`src/lib/navigation/entity-sections.ts:101-111`):

```typescript
export const campaignSections: SectionDefinition[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sequences', label: 'Sequences', icon: GitBranch, showCount: true },
  { id: 'prospects', label: 'Prospects', icon: Users, showCount: true },
  { id: 'leads', label: 'Leads', icon: Target, showCount: true },
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', icon: Clock },
]
```

All 9 sections are already defined with icons and count badges.

### 5. tRPC Router - Campaign Procedures

**Location**: `src/server/routers/crm.ts` (campaigns router nested under crmRouter)

| Procedure | Type | Lines | Description |
|-----------|------|-------|-------------|
| `list` | Query | ~4182 | List campaigns with filters |
| `getById` | Query | ~4252 | Full campaign details with funnel metrics |
| `getByIdWithCounts` | Query | ~4301 | **Optimized** - campaign + all section counts in one call |
| `getMetrics` | Query | ~4730 | Analytics metrics with date range |
| `getProspects` | Query | ~4801 | Paginated prospects with status filter |
| `create` | Mutation | ~4449 | Create campaign with activity logging |
| `update` | Mutation | ~4557 | Update with field change logging |
| `updateStatus` | Mutation | ~4623 | Status change with activity logging |
| `complete` | Mutation | ~4664 | Complete with outcome and metrics logging |
| `addProspects` | Mutation | ~4842 | Bulk add prospects with enrollment logging |
| `convertProspectToLead` | Mutation | ~4915 | Convert prospect to lead with activity |
| `delete` | Mutation | ~5049 | Soft delete with activity logging |
| `duplicate` | Mutation | ~5095 | Duplicate campaign |

**Activity Logging Pattern** (example from `create` mutation):
```typescript
await ctx.db.insert(activities).values({
  org_id: ctx.orgId,
  entity_type: 'campaign',
  entity_id: campaign.id,
  activity_type: 'note',
  subject: 'Campaign Created',
  description: `Created campaign "${input.setup.name}"`,
  created_by: ctx.userId,
})
```

### 6. Database Schema

**Primary Tables** (from migrations):

| Table | File | Key Columns |
|-------|------|-------------|
| `campaigns` | `20260115000000_campaigns_and_lead_credits.sql` | id, name, campaign_type, goal, status, target_criteria, channels, sequences, budget_*, target_*, prospects_*, leads_generated, etc. |
| `campaign_prospects` | Same file | campaign_id, lead_id, status, response_type, engagement_score, converted_lead_id |
| `campaign_sequence_logs` | Same file | campaign_id, prospect_id, channel, step_number, action_type |
| `campaign_documents` | `20260117000000_campaign_documents_table.sql` | campaign_id, name, document_type, category, file_url |

**Database Functions**:
- `get_campaign_funnel(p_campaign_id)` - Returns funnel metrics
- `get_campaign_channel_performance(p_campaign_id)` - Returns per-channel stats

### 7. UI Components - Base Patterns

**InlinePanel** (`src/components/ui/inline-panel.tsx`):
- Widths: sm (320px), md (384px), lg (480px), xl (560px)
- Components: `InlinePanel`, `InlinePanelHeader`, `InlinePanelContent`, `InlinePanelSection`
- Features: Close button, escape key handling, slide-in animation

**SidebarLayout** (`src/components/layouts/SidebarLayout.tsx:1-100`):
- Auto-detects sidebar type from path
- Renders `CampaignSectionSidebar` when entityType is 'campaign'
- Props for campaign-specific data: `campaignSectionCounts`, `campaignMetrics`, `campaignTargets`, `campaignDates`

### 8. Activity System Integration

**Activity Templates** (`src/lib/campaigns/activity-templates.ts`):
- Campaign-specific activity templates
- Functions: `getTemplatesByType()`, `getAutoCreateTemplates()`, `getManualTemplates()`
- Interface: `ActivityTemplate` with activity_type, subject, body, auto_create flag

**Activity Router** (`src/server/routers/activities.ts`):
- `log` mutation for creating activities
- Activity types: email, call, meeting, note, linkedin_message, task, follow_up
- Supports direction, outcome, status fields

**Current Activity Logging Points in Campaign Router**:
1. Campaign creation (`create` mutation)
2. Campaign updates (`update` mutation) - logs changed fields
3. Status changes (`updateStatus` mutation)
4. Campaign completion (`complete` mutation)
5. Prospect enrollment (`addProspects` mutation)
6. Prospect conversion (`convertProspectToLead` mutation)
7. Campaign deletion (`delete` mutation)

### 9. Dialog Components

Located in `src/components/crm/campaigns/`:

| Dialog | File | Purpose |
|--------|------|---------|
| `CreateCampaignDialog` | `CreateCampaignDialog.tsx` | 5-step campaign creation wizard |
| `EditCampaignDialog` | `EditCampaignDialog.tsx` | Edit existing campaign |
| `CompleteCampaignDialog` | `CompleteCampaignDialog.tsx` | Complete with outcome selection |
| `DuplicateCampaignDialog` | `DuplicateCampaignDialog.tsx` | Duplicate campaign |
| `ConvertProspectDialog` | `ConvertProspectDialog.tsx` | Convert prospect to lead |
| `ProspectImportDialog` | `ProspectImportDialog.tsx` | Bulk import prospects |

## Code References

### Core Files
- `src/app/employee/crm/campaigns/[id]/layout.tsx:13-38` - Server layout with optimized query
- `src/components/crm/campaigns/CampaignDetailPage.tsx:105-624` - Main detail page component
- `src/components/navigation/CampaignSectionSidebar.tsx:195-674` - Sidebar with journey and metrics
- `src/lib/navigation/entity-sections.ts:101-111` - 9-section configuration
- `src/server/routers/crm.ts:4180-5160` - Campaign tRPC procedures

### Section Components
- `src/components/crm/campaigns/sections/CampaignOverviewSection.tsx` - Dashboard section
- `src/components/crm/campaigns/sections/CampaignSequencesSection.tsx:52-379` - Sequences with inline panel
- `src/components/crm/campaigns/sections/CampaignProspectsSection.tsx:71-387` - Prospects with inline panel
- `src/components/crm/campaigns/sections/CampaignLeadsSection.tsx` - Leads section
- `src/components/crm/campaigns/sections/CampaignActivitiesSection.tsx` - Activities section
- `src/components/crm/campaigns/sections/CampaignDocumentsSection.tsx` - Documents section
- `src/components/crm/campaigns/sections/CampaignNotesSection.tsx` - Notes section
- `src/components/crm/campaigns/sections/CampaignAnalyticsSection.tsx` - Analytics section
- `src/components/crm/campaigns/sections/CampaignHistorySection.tsx` - History section

### UI Patterns
- `src/components/ui/inline-panel.tsx` - Base inline panel component
- `src/components/layouts/SidebarLayout.tsx:60-91` - Campaign-specific props

### Database
- `supabase/migrations/20260115000000_campaigns_and_lead_credits.sql` - Main campaign tables
- `supabase/migrations/20260117000000_campaign_documents_table.sql` - Documents table

## Architecture Documentation

### Current UI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER - Main navigation (TopNavigation)                   │
├─────────────┬───────────────────────────────────────────────┤
│  SIDEBAR    │  CONTENT AREA                                 │
│  (264px)    │  ┌─────────────────────────────────────────┐  │
│             │  │ Sticky Header + Metrics Bar             │  │
│  - Back     │  │ (Campaign name, status, key metrics)    │  │
│  - Journey  │  ├─────────────────────────────────────────┤  │
│  - Metrics  │  │ Section Content                         │  │
│  - Sections │  │ - Overview/Dashboard                    │  │
│  - Actions  │  │ - Lists with InlinePanel                │  │
│             │  │ - Analytics charts                      │  │
│             │  │ - History timeline                      │  │
│             │  └─────────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────────┘
```

### Data Flow

```
Layout (Server) → getByIdWithCounts → EntityContextProvider
                                            ↓
CampaignDetailPage (Client) ← useQuery(getByIdWithCounts)
        ↓
  renderSection() → Section Component → useQuery(specific data)
                                            ↓
                                    InlinePanel (detail view)
```

### Section Navigation Pattern

- URL: `/employee/crm/campaigns/[id]?section=<section-id>`
- Default section: `overview`
- Section IDs: overview, sequences, prospects, leads, activities, documents, notes, analytics, history

## Related Research

- `thoughts/shared/research/2025-12-08-campaign-workspace-system.md` (referenced in issue)
- `thoughts/shared/research/2025-12-08-guidewire-ui-architecture-current-state.md` (referenced in issue)

## Open Questions

1. **Sequences Section Performance Data**: Currently shows 0 for sent/openRate/responseRate. Need to aggregate from `campaign_sequence_logs` table.

2. **History Section Implementation**: Need to verify it fetches all activities for the campaign entity type.

3. **Documents Section CRUD**: Verify upload and management functionality is complete.

4. **Activity Templates**: Check if `auto_create` templates are being triggered on campaign events.

5. **Inline Panel Add/Edit**: Issue mentions "All Pages with add/edit options" - need to verify each section supports add/edit in inline panel or via dialogs.
