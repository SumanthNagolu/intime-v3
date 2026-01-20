# Account Management - Frontend Integration Guide

This guide documents how to integrate with the per-section account endpoints using optimistic updates for the best user experience.

## Overview

The account management system uses a per-section save architecture where each section (Identity, Locations, Billing, etc.) has its own save endpoint. This enables:

- **Granular saves**: Only save what changed
- **Optimistic updates**: Immediate UI feedback
- **Partial success handling**: Some items may fail while others succeed

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| `trpc.accounts.createDraft` | Create a new draft account |
| `trpc.accounts.saveIdentity` | Save identity/classification data |
| `trpc.accounts.saveLocations` | Save addresses |
| `trpc.accounts.saveBilling` | Save billing/payment terms |
| `trpc.accounts.saveContacts` | Save contacts |
| `trpc.accounts.saveContracts` | Save contracts |
| `trpc.accounts.saveCompliance` | Save compliance requirements |
| `trpc.accounts.saveTeam` | Save team assignments |
| `trpc.accounts.submit` | Finalize draft to active status |

## Optimistic Update Pattern

### Basic Pattern

```typescript
import { trpc } from '@/lib/trpc/client'
import { useQueryClient } from '@tanstack/react-query'

function useOptimisticSaveIdentity(accountId: string) {
  const queryClient = useQueryClient()
  const utils = trpc.useUtils()

  return trpc.accounts.saveIdentity.useMutation({
    // Optimistic update - update cache before server responds
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await utils.crm.accounts.getById.cancel({ id: accountId })

      // Snapshot current value
      const previousData = utils.crm.accounts.getById.getData({ id: accountId })

      // Optimistically update
      utils.crm.accounts.getById.setData(
        { id: accountId },
        (old) => old ? { ...old, ...newData.data } : old
      )

      return { previousData }
    },

    // Rollback on error
    onError: (err, newData, context) => {
      if (context?.previousData) {
        utils.crm.accounts.getById.setData(
          { id: accountId },
          context.previousData
        )
      }
    },

    // Refetch after mutation
    onSettled: () => {
      utils.crm.accounts.getById.invalidate({ id: accountId })
    },
  })
}
```

### Handling Partial Success

Endpoints like `saveLocations` and `saveContacts` return detailed results:

```typescript
interface SaveResult {
  success: boolean
  details?: {
    saved: string[]    // IDs that saved successfully
    failed: Array<{    // Items that failed
      id: string
      error: string
    }>
  }
}
```

Handle partial success in UI:

```typescript
const saveMutation = trpc.accounts.saveLocations.useMutation({
  onSuccess: (result) => {
    if (!result.success && result.details?.failed.length) {
      // Some items failed - show which ones
      toast.warning({
        title: 'Partial save',
        description: `${result.details.saved.length} saved, ${result.details.failed.length} failed`,
      })

      // Mark failed items in UI
      setFailedIds(result.details.failed.map(f => f.id))
    } else {
      toast.success({ title: 'Saved successfully' })
    }
  },
})
```

### Section Hook Pattern

Create a reusable hook for each section:

```typescript
// src/components/accounts/hooks/useIdentitySection.ts
import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { IdentitySectionData } from '@/lib/accounts/types'

interface UseIdentitySectionOptions {
  accountId: string
  initialData?: IdentitySectionData
  mode: 'create' | 'view' | 'edit'
  onSaveComplete?: () => void
}

export function useIdentitySection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseIdentitySectionOptions) {
  const [localData, setLocalData] = useState(initialData || null)
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [isDirty, setIsDirty] = useState(false)

  const saveMutation = trpc.accounts.saveIdentity.useMutation()
  const utils = trpc.useUtils()

  // Sync from server data
  useEffect(() => {
    if (initialData) {
      setLocalData(initialData)
      setIsDirty(false)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => prev ? { ...prev, [field]: value } : null)
    setIsDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!localData) return

    // Optimistic update
    const previousData = utils.crm.accounts.getById.getData({ id: accountId })

    try {
      await saveMutation.mutateAsync({
        accountId,
        data: localData,
      })

      setIsEditing(false)
      setIsDirty(false)
      onSaveComplete?.()
    } catch (error) {
      // Revert optimistic update on failure
      if (previousData) {
        setLocalData(mapToIdentityData(previousData))
      }
      throw error
    }
  }, [accountId, localData, saveMutation, onSaveComplete])

  const handleCancel = useCallback(() => {
    // Reset to server data
    if (initialData) {
      setLocalData(initialData)
    }
    setIsEditing(false)
    setIsDirty(false)
  }, [initialData])

  return {
    data: localData,
    isLoading: !localData,
    isSaving: saveMutation.isPending,
    isEditing,
    isDirty,
    errors: saveMutation.error?.data?.zodError?.fieldErrors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit: () => setIsEditing(true),
  }
}
```

## Wizard Integration

For the create wizard flow:

```typescript
// Create draft on wizard entry
useEffect(() => {
  if (!draftId) {
    createDraft.mutateAsync().then(draft => {
      router.replace(`/accounts/new?id=${draft.id}&step=1`)
    })
  }
}, [draftId])

// Save section on "Continue"
const handleNext = async () => {
  // Save current section
  await currentSectionSave.mutateAsync({
    accountId: draftId,
    data: sectionData,
  })

  // Navigate to next step
  router.push(`/accounts/new?id=${draftId}&step=${currentStep + 1}`)
}

// Submit on final step
const handleSubmit = async () => {
  await submitMutation.mutateAsync({
    accountId: draftId,
    targetStatus: 'active',
  })

  router.push(`/accounts/${draftId}`)
}
```

## Error Handling

All endpoints return consistent error types:

```typescript
try {
  await saveMutation.mutateAsync(data)
} catch (error) {
  if (error.data?.code === 'NOT_FOUND') {
    // Account doesn't exist or was deleted
  } else if (error.data?.code === 'BAD_REQUEST') {
    // Validation error - check error.data.zodError
  } else if (error.data?.code === 'INTERNAL_SERVER_ERROR') {
    // Server error - retry later
  }
}
```

## Events

Each save operation emits an event that can trigger side effects:

| Event | Trigger |
|-------|---------|
| `account.draft.created` | `createDraft` |
| `account.identity.updated` | `saveIdentity` |
| `account.locations.updated` | `saveLocations` |
| `account.billing.updated` | `saveBilling` |
| `account.contacts.updated` | `saveContacts` |
| `account.contracts.updated` | `saveContracts` |
| `account.compliance.updated` | `saveCompliance` |
| `account.team.updated` | `saveTeam` |
| `account.submitted` | `submit` (creates welcome activity) |

## Best Practices

1. **Always use optimistic updates** for immediate feedback
2. **Handle partial success** for array-based sections (locations, contacts, contracts)
3. **Track dirty state** to warn users about unsaved changes
4. **Use section hooks** to encapsulate save logic
5. **Invalidate related queries** after mutations
6. **Show loading states** during saves
