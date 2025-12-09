---
date: 2025-12-09T14:55:14-05:00
researcher: Claude
git_commit: a416381
branch: main
repository: intime-v3
topic: "CAMPAIGNS-02: New Campaign Button Does Not Respond to Clicks"
tags: [research, codebase, campaigns, pcf, event-handling, buttons]
status: complete
last_updated: 2025-12-09
last_updated_by: Claude
---

# Research: CAMPAIGNS-02 - New Campaign Button Not Working

**Date**: 2025-12-09T14:55:14-05:00
**Researcher**: Claude
**Git Commit**: a416381
**Branch**: main
**Repository**: intime-v3

## Research Question

Why does the "+ NEW CAMPAIGN" button on the campaigns list page (`/employee/crm/campaigns`) not respond to clicks?

## Summary

The button click handler is correctly wired and fires as expected, dispatching an `openCampaignDialog` custom event. However, **no event listener exists on the campaigns list page to handle this event**. The event listeners are only set up on the campaign detail pages (`/employee/crm/campaigns/[id]/`), not the list page.

## Detailed Findings

### 1. Campaigns List Page Implementation

**File**: `src/app/employee/crm/campaigns/page.tsx`

The campaigns list page is a minimal wrapper that only renders the `EntityListView` component:

```tsx
'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { campaignsListConfig, Campaign } from '@/configs/entities/campaigns.config'

export default function CampaignsPage() {
  return <EntityListView<Campaign> config={campaignsListConfig} />
}
```

**Key observation**: No `useEffect` hook, no event listener, no dialog component.

### 2. Campaigns Config Primary Action

**File**: `src/configs/entities/campaigns.config.ts:187-193`

The config defines the primary action button with an `onClick` handler that dispatches a custom event:

```tsx
primaryAction: {
  label: 'New Campaign',
  icon: Plus,
  onClick: () => {
    window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'create' } }))
  },
},
```

**Key observation**: The button dispatches `openCampaignDialog` event with `dialogId: 'create'`.

### 3. EntityListView → ListHeader Button Rendering

**File**: `src/components/pcf/list-view/EntityListView.tsx:127-132`

```tsx
{showHeader && (
  <ListHeader
    title={effectiveTitle}
    description={effectiveDescription}
    icon={config.icon}
    primaryAction={showPrimaryAction ? config.primaryAction : undefined}
  />
)}
```

**File**: `src/components/pcf/list-view/ListHeader.tsx:76-89`

```tsx
{primaryAction && (
  primaryAction.href ? (
    <Link href={primaryAction.href}>
      <Button>
        <PrimaryIcon className="w-4 h-4 mr-2" />
        {primaryAction.label}
      </Button>
    </Link>
  ) : (
    <Button onClick={primaryAction.onClick}>
      <PrimaryIcon className="w-4 h-4 mr-2" />
      {primaryAction.label}
    </Button>
  )
)}
```

**Key observation**: The button correctly receives and calls `primaryAction.onClick`. The event IS being dispatched.

### 4. Event Listeners Location

Event listeners for `openCampaignDialog` exist only in:

| File | Line | Context |
|------|------|---------|
| `src/app/employee/crm/campaigns/[id]/page.tsx` | 154 | Campaign detail page |
| `src/app/employee/crm/campaigns/[id]/prospects/[prospectId]/page.tsx` | 77 | Prospect detail page |

**Missing from**: `src/app/employee/crm/campaigns/page.tsx` (list page)

### 5. Working Example: Deals List Page

**File**: `src/app/employee/crm/deals/page.tsx`

The deals list page correctly implements the pattern:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { dealsListConfig, Deal } from '@/configs/entities/deals.config'
import { CreateDealDialog } from '@/components/crm/deals'

// Declare the custom event type for TypeScript
declare global {
  interface WindowEventMap {
    openDealDialog: CustomEvent<{ dialogId: string; dealId?: string }>
  }
}

export default function DealsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Listen for custom event to open dialogs
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; dealId?: string }>) => {
      if (event.detail.dialogId === 'create') {
        setCreateDialogOpen(true)
      }
    }

    window.addEventListener('openDealDialog', handleOpenDialog)
    return () => window.removeEventListener('openDealDialog', handleOpenDialog)
  }, [])

  return (
    <>
      <EntityListView<Deal> config={dealsListConfig} />

      <CreateDealDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Dialog closes automatically and list refetches via tRPC cache invalidation
        }}
      />
    </>
  )
}
```

**Key differences from campaigns page**:
1. Has `useState` for dialog open state
2. Has `useEffect` with event listener for `openDealDialog`
3. Renders `CreateDealDialog` component

### 6. Alternative Pattern: Direct Navigation (Accounts)

**File**: `src/configs/entities/accounts.config.ts:195-198`

Some entities use `href` instead of `onClick`:

```tsx
primaryAction: {
  label: 'New Account',
  icon: Plus,
  href: '/employee/recruiting/accounts/new',
},
```

This pattern navigates directly to a creation page without needing event listeners.

### 7. CreateCampaignDialog Component Exists

**File**: `src/components/crm/campaigns/CreateCampaignDialog.tsx`

The dialog component exists and is exported from `src/components/crm/campaigns/index.ts`:

```tsx
export { CreateCampaignDialog } from './CreateCampaignDialog'
```

## Code References

| File | Line | Description |
|------|------|-------------|
| `src/app/employee/crm/campaigns/page.tsx` | 1-8 | Campaigns list page (missing event listener) |
| `src/configs/entities/campaigns.config.ts` | 187-193 | Primary action config with onClick |
| `src/components/pcf/list-view/ListHeader.tsx` | 76-89 | Button rendering logic |
| `src/app/employee/crm/deals/page.tsx` | 1-43 | Working implementation pattern |
| `src/app/employee/crm/campaigns/[id]/page.tsx` | 154-156 | Event listener on detail page |
| `src/components/crm/campaigns/CreateCampaignDialog.tsx` | - | Dialog component |

## Architecture Documentation

### PCF Primary Action Pattern

The PCF (PolicyCenter Framework) list views support two patterns for primary actions:

1. **Navigation Pattern** (`href`): Navigates to a dedicated creation page
   - Used by: accounts, candidates, vendors
   - Pros: No event handling needed, simpler page code
   - Cons: Requires separate creation page

2. **Dialog Pattern** (`onClick`): Opens a dialog on the same page
   - Used by: deals, campaigns, leads, contacts, interviews
   - Requires: Event listener + dialog component on the list page
   - Pros: Better UX (no page navigation)
   - Cons: More complex page implementation

### Event Flow for Dialog Pattern

```
User clicks button
    ↓
ListHeader calls onClick
    ↓
Config dispatches CustomEvent('openXDialog', { dialogId: 'create' })
    ↓
Page's useEffect event listener receives event
    ↓
Handler sets dialog state to open
    ↓
Dialog component renders
```

## Open Questions

1. Should the campaigns list page follow the deals pattern (add event listener + dialog)?
2. Or should it switch to the accounts pattern (use `href` to navigate to a creation page)?
3. Are there other list pages with the same missing event listener issue (e.g., leads)?

## Related Files

- `src/app/employee/crm/leads/page.tsx` - Also appears to be missing event listener (same pattern as campaigns)
- `src/configs/entities/leads.config.ts` - Uses onClick pattern like campaigns
