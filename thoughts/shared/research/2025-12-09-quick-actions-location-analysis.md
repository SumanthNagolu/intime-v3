---
date: 2025-12-09T14:37:07-05:00
researcher: Claude
git_commit: a416381
branch: main
repository: intime-v3
topic: "Quick Actions Location Analysis - Where Quick Actions Are Displayed"
tags: [research, navigation, quick-actions, sidebar, header]
status: complete
last_updated: 2025-12-09
last_updated_by: Claude
---

# Research: Quick Actions Location Analysis

**Date**: 2025-12-09T14:37:07-05:00
**Researcher**: Claude
**Git Commit**: a416381
**Branch**: main
**Repository**: intime-v3

## Research Question

Where are quick actions currently displayed in the navigation system? The user states: "We don't want any quick actions in side navigation. All quick actions that are relevant to the workspace/page we are in should only be at top right like how we have now."

## Summary

Quick actions are currently displayed in **TWO locations**:

1. **Top Right (Header Area)** - In `DetailHeader.tsx` and `QuickActionBar.tsx` - This is the DESIRED location
2. **Sidebar Bottom** - In multiple sidebar components - This is the location to REMOVE

The quick actions in sidebars appear at the bottom of:
- `EntityJourneySidebar.tsx` (lines 298-348)
- `SectionSidebar.tsx` (lines 275-301)
- `EntitySidebar.tsx` (via `SidebarActions.tsx`)

## Detailed Findings

### 1. Top Right Quick Actions (DESIRED - Keep These)

#### DetailHeader.tsx (`src/components/pcf/detail-view/DetailHeader.tsx`)
Lines 117-153 render quick actions in the header:

```tsx
{/* Quick Actions */}
<div className="flex items-center gap-2">
  {visibleActions.map((action) => {
    const Icon = action.icon
    const disabled = action.isDisabled?.(entity) || isLoading
    return (
      <Button key={action.id} ...>
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {action.label}
      </Button>
    )
  })}
  {/* Dropdown Menu */}
  {dropdownActions.length > 0 && (...)}
</div>
```

This is used by `EntityDetailView.tsx` and receives `quickActions` and `dropdownActions` from entity configs.

#### QuickActionBar.tsx (`src/components/pcf/shared/QuickActionBar.tsx`)
A standalone component that renders quick actions horizontally with an optional dropdown menu. Used in list views and other pages.

### 2. Sidebar Quick Actions (TO BE REMOVED)

#### EntityJourneySidebar.tsx (`src/components/navigation/EntityJourneySidebar.tsx:298-348`)
Renders a "Quick Actions" section at the bottom of journey-style sidebars:

```tsx
{/* Quick Actions */}
{visibleQuickActions.length > 0 && (
  <div className="p-3 border-t border-charcoal-100">
    <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
      Actions
    </div>
    <div className="space-y-1.5">
      {visibleQuickActions.slice(0, 5).map((action) => ...)}
    </div>
  </div>
)}
```

Quick actions are:
- Defined in `entity-journeys.ts` per entity type
- Filtered by `getVisibleQuickActions(entityType, entityStatus)`
- Status-dependent visibility

#### SectionSidebar.tsx (`src/components/navigation/SectionSidebar.tsx:275-301`)
Renders a "Quick Actions" section at the bottom of section-style sidebars:

```tsx
{/* Quick Actions */}
{section.quickActions && section.quickActions.length > 0 && (
  <div className="p-4 border-t border-charcoal-100">
    <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
      Quick Actions
    </h3>
    <div className="space-y-2">
      {section.quickActions.map((action) => ...)}
    </div>
  </div>
)}
```

Quick actions are defined in `sectionConfigs` (lines 35-156) per section:
- jobs: `New Job` button
- candidates: `Add Candidate` button
- accounts: `New Account` button
- leads: `New Lead` button
- deals: `New Deal` button
- campaigns: `New Campaign` button
- academy: `New Course` button

#### EntitySidebar.tsx (`src/components/pcf/sidebar/EntitySidebar.tsx`)
Uses `SidebarActions.tsx` component (lines 66-73):

```tsx
{/* Quick Actions */}
{config.quickActions && config.quickActions.length > 0 && (
  <SidebarActions
    actions={config.quickActions}
    entityId={entityId}
    entityStatus={entityStatus}
    onAction={onQuickAction}
  />
)}
```

#### SidebarActions.tsx (`src/components/pcf/sidebar/SidebarActions.tsx`)
Renders quick actions at the bottom of PCF sidebars (full file, 99 lines).

### 3. Quick Actions Definition Sources

#### entity-journeys.ts (`src/lib/navigation/entity-journeys.ts`)
Defines `quickActions` arrays for each entity type in the `entityJourneys` config:
- `job`: 6 actions (publish, edit, add-candidate, hold, resume, close)
- `candidate`: 5 actions (edit, screen, submit, hotlist, activity)
- `account`: 4 actions (edit, contact, job, activity)
- `contact`: 4 actions (edit, call, email, meeting)
- `submission`: 3 actions (advance, schedule, withdraw)
- `placement`: 3 actions (extend, checkin, end)
- `lead`: 4 actions (edit, qualify, activity, convert)
- `deal`: 4 actions (edit, moveStage, activity, closeWon)
- `campaign`: 10 actions (start, resume, pause, add-prospect, import, edit, complete, activity, analytics, duplicate)

#### Entity Config Files (`src/configs/entities/*.config.ts`)
Each entity config defines `quickActions` array in the `DetailViewConfig`:

Example from `accounts.config.ts` (lines 626-666):
```tsx
quickActions: [
  { id: 'log-activity', label: 'Log Activity', icon: Activity, variant: 'default', onClick: ... },
  { id: 'add-contact', label: 'Add Contact', icon: Users, variant: 'outline', onClick: ... },
  { id: 'create-job', label: 'Create Job', icon: Plus, variant: 'outline', onClick: ... },
],
```

These are used by `DetailHeader.tsx` for the top-right header actions.

## Code References

### Sidebar Quick Actions (TO REMOVE)
- `src/components/navigation/EntityJourneySidebar.tsx:298-348` - Journey sidebar actions section
- `src/components/navigation/SectionSidebar.tsx:275-301` - Section sidebar actions section
- `src/components/pcf/sidebar/EntitySidebar.tsx:66-73` - PCF sidebar actions integration
- `src/components/pcf/sidebar/SidebarActions.tsx:1-99` - Sidebar actions component

### Header Quick Actions (TO KEEP)
- `src/components/pcf/detail-view/DetailHeader.tsx:117-153` - Header quick actions
- `src/components/pcf/shared/QuickActionBar.tsx:1-82` - Quick action bar component

### Quick Actions Definitions
- `src/lib/navigation/entity-journeys.ts` - Journey-based quick actions
- `src/configs/entities/*.config.ts` - Entity-specific quick actions in `quickActions` property

## Architecture Documentation

### Current Quick Actions Flow

```
Entity Config Files
    │
    ├──→ quickActions[] ──→ DetailHeader.tsx ──→ TOP RIGHT (Header Area) ✓
    │                              └──→ EntityDetailView.tsx
    │
    └──→ quickActions[] ──→ EntitySidebar.tsx ──→ SIDEBAR BOTTOM ✗
                                 └──→ SidebarActions.tsx

entity-journeys.ts
    │
    └──→ quickActions[] ──→ EntityJourneySidebar.tsx ──→ SIDEBAR BOTTOM ✗
                                 └──→ getVisibleQuickActions()

sectionConfigs
    │
    └──→ quickActions[] ──→ SectionSidebar.tsx ──→ SIDEBAR BOTTOM ✗
```

### Files That Need Modification

To remove sidebar quick actions:

1. **EntityJourneySidebar.tsx** - Remove lines 298-348 (Quick Actions section)
2. **SectionSidebar.tsx** - Remove lines 275-301 (Quick Actions section)
3. **EntitySidebar.tsx** - Remove lines 66-73 (SidebarActions integration)
4. **SidebarActions.tsx** - Can be deleted entirely (only used by sidebar)

Note: The `sectionConfigs.quickActions` in `SectionSidebar.tsx` and the journey `quickActions` in `entity-journeys.ts` can remain as data definitions - they just won't be rendered in the sidebar.

## Open Questions

1. Should the quick actions data still be kept in configs even if not rendered in sidebar?
2. Are there any other sidebar components that render quick actions?
3. Should the "New X" primary actions (like "New Job", "New Account") move to a different location?
