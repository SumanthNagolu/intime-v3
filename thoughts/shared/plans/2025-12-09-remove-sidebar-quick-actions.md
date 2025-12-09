# Remove Quick Actions from Sidebar Navigation

## Overview

Remove all quick action sections from sidebar components. Quick actions should only appear in the top-right header area (via `DetailHeader.tsx`), not in sidebars. This is a cleanup task to consolidate the UI pattern.

## Current State Analysis

Quick actions currently appear in **two locations**:
1. **Top Right Header** (via `DetailHeader.tsx`) - KEEP
2. **Sidebar Bottom** (via multiple components) - REMOVE

### Sidebar Components with Quick Actions (TO REMOVE)

| Component | Location | Lines |
|-----------|----------|-------|
| `EntityJourneySidebar.tsx` | `src/components/navigation/` | 298-348 |
| `SectionSidebar.tsx` | `src/components/navigation/` | 275-301 |
| `EntitySidebar.tsx` | `src/components/pcf/sidebar/` | 76-84 |
| `SidebarActions.tsx` | `src/components/pcf/sidebar/` | Entire file |

### Key Discoveries
- `SidebarActions.tsx` is only used by `EntitySidebar.tsx` - can be deleted entirely
- `sectionConfigs` in `SectionSidebar.tsx` defines `quickActions` arrays - will remove these
- `EntityJourneySidebar.tsx` uses `getVisibleQuickActions()` - will remove related code
- `onQuickAction` prop exists in both sidebar interfaces - will remove

## Desired End State

- No quick actions rendered in any sidebar component
- All quick actions consolidated in header area only
- Clean removal of unused code, props, and interfaces
- `SidebarActions.tsx` deleted entirely

## What We're NOT Doing

- NOT modifying header quick actions (`DetailHeader.tsx`, `QuickActionBar.tsx`)
- NOT removing `quickActions` from entity config files (`*.config.ts`) - those feed the header
- NOT removing `entityJourneys` quick actions definitions - may be used elsewhere
- NOT changing any styling or layout of sidebars beyond action removal

## Implementation Approach

Systematic removal in 4 phases, one component at a time. Each phase is independently testable.

---

## Phase 1: Remove Quick Actions from EntityJourneySidebar

### Overview
Remove the Quick Actions section and related code from the journey-style sidebar used for workflow entities (jobs, candidates, submissions, placements).

### Changes Required

**File**: `src/components/navigation/EntityJourneySidebar.tsx`

#### 1.1 Remove `onQuickAction` from interface (line 25)
```tsx
// REMOVE this line from EntityJourneySidebarProps interface:
onQuickAction?: (action: EntityQuickAction) => void
```

#### 1.2 Remove `onQuickAction` from destructuring (line 54)
```tsx
// REMOVE onQuickAction from the destructured props:
// Before:
  onQuickAction,
  toolCounts = {},

// After:
  toolCounts = {},
```

#### 1.3 Remove `visibleQuickActions` useMemo (lines 88-91)
```tsx
// REMOVE entire block:
const visibleQuickActions = useMemo(() => {
  return getVisibleQuickActions(entityType, entityStatus)
}, [entityType, entityStatus])
```

#### 1.4 Remove `handleQuickAction` function (lines 118-123)
```tsx
// REMOVE entire block:
const handleQuickAction = (action: EntityQuickAction) => {
  if (onQuickAction) {
    onQuickAction(action)
  }
}
```

#### 1.5 Remove Quick Actions section (lines 298-348)
```tsx
// REMOVE entire block starting with:
{/* Quick Actions */}
{visibleQuickActions.length > 0 && (
  ...
)}
```

#### 1.6 Remove unused import (line 8)
```tsx
// REMOVE getVisibleQuickActions from import:
// Before:
import { entityJourneys, getVisibleQuickActions } from '@/lib/navigation/entity-journeys'

// After:
import { entityJourneys } from '@/lib/navigation/entity-journeys'
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm lint`
- [ ] App builds successfully: `pnpm build`

#### Manual Verification:
- [ ] Job detail page sidebar shows journey steps and tools, but NO quick actions at bottom
- [ ] Candidate detail page sidebar shows journey steps and tools, but NO quick actions at bottom
- [ ] Submission detail page sidebar works correctly without quick actions

---

## Phase 2: Remove Quick Actions from SectionSidebar

### Overview
Remove the Quick Actions section and `quickActions` from section configs. This sidebar is used for list pages (jobs, candidates, accounts, etc.).

### Changes Required

**File**: `src/components/navigation/SectionSidebar.tsx`

#### 2.1 Remove `quickActions` from SectionConfig interface (lines 18-25)
```tsx
// REMOVE these lines from SectionConfig interface:
quickActions?: Array<{
  id: string
  label: string
  icon: LucideIcon
  href?: string
  variant?: 'default' | 'outline'
}>
```

#### 2.2 Remove `quickActions` from all section configs (lines 35-156)

Remove `quickActions` property from each section:
- `jobs` (lines 42-44)
- `candidates` (lines 55-57)
- `accounts` (lines 69-71)
- `leads` (lines 82-84)
- `deals` (lines 95-97)
- `campaigns` (lines 118-120)
- `academy` (lines 145-147)

Example for `jobs`:
```tsx
// Before:
jobs: {
  id: 'jobs',
  title: 'Jobs',
  icon: List,
  entityType: 'job',
  basePath: '/employee/recruiting/jobs',
  quickActions: [
    { id: 'new-job', label: 'New Job', icon: Plus, href: '/employee/recruiting/jobs/new' },
  ],
  navLinks: [...],
},

// After:
jobs: {
  id: 'jobs',
  title: 'Jobs',
  icon: List,
  entityType: 'job',
  basePath: '/employee/recruiting/jobs',
  navLinks: [...],
},
```

#### 2.3 Remove Quick Actions section from render (lines 275-301)
```tsx
// REMOVE entire block:
{/* Quick Actions */}
{section.quickActions && section.quickActions.length > 0 && (
  <div className="p-4 border-t border-charcoal-100">
    ...
  </div>
)}
```

#### 2.4 Remove unused `Plus` import (line 5)
```tsx
// REMOVE Plus from imports if no longer used:
// Before:
import { Clock, Plus, LucideIcon, List, Home, ... } from 'lucide-react'

// After:
import { Clock, LucideIcon, List, Home, ... } from 'lucide-react'
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm lint`
- [ ] App builds successfully: `pnpm build`

#### Manual Verification:
- [ ] Jobs list page sidebar shows navigation links and recent entities, but NO quick actions
- [ ] Accounts list page sidebar works correctly without quick actions
- [ ] Campaigns list page sidebar works correctly without quick actions

---

## Phase 3: Remove Quick Actions from EntitySidebar

### Overview
Remove the SidebarActions integration from the PCF EntitySidebar component and its `onQuickAction` prop.

### Changes Required

**File**: `src/components/pcf/sidebar/EntitySidebar.tsx`

#### 3.1 Remove `onQuickAction` from interface (line 18)
```tsx
// REMOVE this line from EntitySidebarProps interface:
onQuickAction?: (action: SidebarActionConfig) => void
```

#### 3.2 Remove `onQuickAction` from destructuring (line 30)
```tsx
// REMOVE onQuickAction from destructured props:
// Before:
  onQuickAction,
  className,

// After:
  className,
```

#### 3.3 Remove Quick Actions section (lines 76-84)
```tsx
// REMOVE entire block:
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

#### 3.4 Remove SidebarActions import and re-export (lines 7, 93)
```tsx
// REMOVE from imports (line 7):
import { SidebarActions } from './SidebarActions'

// REMOVE from re-exports (line 93):
export { SidebarActions } from './SidebarActions'
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm lint`
- [ ] App builds successfully: `pnpm build`

#### Manual Verification:
- [ ] PCF-based detail pages render correctly without sidebar quick actions
- [ ] No console errors on entity detail pages

---

## Phase 4: Delete SidebarActions Component

### Overview
Delete the `SidebarActions.tsx` file entirely since it's no longer used.

### Changes Required

#### 4.1 Delete file
**Delete**: `src/components/pcf/sidebar/SidebarActions.tsx`

#### 4.2 Clean up types (if needed)
**File**: `src/components/pcf/sidebar/types.ts`

Check if `SidebarActionConfig` type is still used elsewhere. If not, consider removing or keeping for potential future use.

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm lint`
- [ ] App builds successfully: `pnpm build`
- [x] No import errors for deleted file

#### Manual Verification:
- [ ] Application runs without errors
- [ ] All sidebar pages render correctly

---

## Testing Strategy

### Automated Tests
- TypeScript compilation check
- ESLint lint check
- Build verification

### Manual Testing Steps
1. Navigate to Jobs list page → Sidebar should show navigation + recent entities, NO actions
2. Open a Job detail page → Sidebar should show journey steps + tools, NO actions at bottom
3. Navigate to Accounts list page → Sidebar should show navigation + recent entities, NO actions
4. Open an Account detail page → Sidebar should show sections, NO actions at bottom
5. Navigate to Campaigns list page → Sidebar should show navigation + recent entities, NO actions
6. Verify quick actions STILL appear in header area (top-right) on detail pages

## Performance Considerations

None - this is a removal of code, should have no performance impact.

## Migration Notes

None - no data changes required.

## References

- Research: `thoughts/shared/research/2025-12-09-quick-actions-location-analysis.md`
- Header quick actions (KEEP): `src/components/pcf/detail-view/DetailHeader.tsx:117-153`
