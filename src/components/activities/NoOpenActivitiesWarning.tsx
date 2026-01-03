'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

interface NoOpenActivitiesWarningProps {
  entityType: string
  entityId: string
  entityName?: string
  className?: string
}

/**
 * Warning banner that displays when an entity has no open activities.
 * Provides option to auto-create a watchlist activity.
 */
export function NoOpenActivitiesWarning({
  entityType,
  entityId,
  entityName,
  className,
}: NoOpenActivitiesWarningProps) {
  const [dismissed, setDismissed] = useState(false)

  // Query for open activities count
  const { data: countData, isLoading: countLoading } = trpc.activities.getOpenActivitiesCount.useQuery(
    { entityType, entityId },
    { enabled: !!entityId }
  )

  // Mutation to create watchlist activity
  const ensureActivity = trpc.activities.ensureOpenActivity.useMutation({
    onSuccess: () => {
      setDismissed(true)
    },
  })

  const utils = trpc.useUtils()

  // Don't show if loading, dismissed, or has activities
  if (countLoading || dismissed || (countData && countData.count > 0)) {
    return null
  }

  const handleCreateActivity = async () => {
    await ensureActivity.mutateAsync({ entityType, entityId })
    // Invalidate activities queries to refresh
    utils.activities.listByEntity.invalidate({ entityType, entityId })
    utils.activities.getOpenActivitiesCount.invalidate({ entityType, entityId })
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-100">
          <AlertTriangle className="h-4 w-4 text-warning-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-warning-800">
            No Open Activities
          </p>
          <p className="text-xs text-warning-600">
            This {entityType}{entityName ? ` "${entityName}"` : ''} has no open activities.
            A watchlist activity is recommended.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-warning-600 hover:text-warning-700 hover:bg-warning-100"
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={handleCreateActivity}
          disabled={ensureActivity.isPending}
          className="bg-warning-600 hover:bg-warning-700 text-white"
        >
          {ensureActivity.isPending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-3 w-3" />
              Create Watchlist
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
