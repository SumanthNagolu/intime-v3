'use client'

import { useEffect, ReactNode } from 'react'
import { TopNavigation } from '@/components/navigation/TopNavigation'
import { EntityJourneySidebar } from '@/components/navigation/EntityJourneySidebar'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { EntityType, EntityQuickAction, resolveHref } from '@/lib/navigation/entity-navigation.types'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface EntityDetailLayoutProps {
  children: ReactNode
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  /** Custom quick action handler - if not provided, default behavior is used */
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
  const router = useRouter()

  // Set current entity in context and add to recent
  useEffect(() => {
    setCurrentEntity({
      type: entityType,
      id: entityId,
      name: entityName,
      status: entityStatus,
      subtitle: entitySubtitle,
    })

    addRecentEntity(entityType, {
      id: entityId,
      name: entityName,
      subtitle: entitySubtitle,
    })

    // Clear on unmount (optional - can be kept for back navigation)
    return () => {
      // Don't clear immediately - let it persist for back navigation
    }
  }, [entityType, entityId, entityName, entityStatus, entitySubtitle, setCurrentEntity, addRecentEntity])

  // Default quick action handler
  const handleQuickAction = (action: EntityQuickAction) => {
    // If custom handler provided, use it
    if (onQuickAction) {
      onQuickAction(action)
      return
    }

    // Default handling
    switch (action.actionType) {
      case 'navigate':
        if (action.href) {
          router.push(resolveHref(action.href, entityId))
        }
        break
      case 'dialog':
        // Dispatch custom event for page to handle
        window.dispatchEvent(new CustomEvent('openEntityDialog', {
          detail: {
            dialogId: action.dialogId,
            entityType,
            entityId,
          }
        }))
        break
      case 'mutation':
        // Dispatch custom event for page to handle
        window.dispatchEvent(new CustomEvent('entityMutation', {
          detail: {
            actionId: action.id,
            entityType,
            entityId,
          }
        }))
        break
    }
  }

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
          onQuickAction={handleQuickAction}
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

// Loading skeleton for entity detail layout
export function EntityDetailLayoutSkeleton() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-charcoal-100 flex-col flex-shrink-0">
          <div className="p-4 border-b border-charcoal-100">
            <div className="h-6 w-32 bg-charcoal-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-charcoal-100 rounded animate-pulse mt-2" />
            <div className="h-6 w-16 bg-charcoal-100 rounded animate-pulse mt-2" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-charcoal-200 animate-pulse" />
                <div className="h-4 flex-1 bg-charcoal-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </aside>

        {/* Content Skeleton */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-cream p-6">
          <div className="h-8 w-48 bg-charcoal-200 rounded animate-pulse mb-6" />
          <div className="h-64 bg-white rounded-lg animate-pulse" />
        </main>
      </div>
    </div>
  )
}

// Error state for entity detail layout
export function EntityDetailLayoutError({
  title = 'Not Found',
  message = 'The item you are looking for does not exist or you do not have access.',
  backHref = '/employee/workspace/dashboard',
  backLabel = 'Go Back',
}: {
  title?: string
  message?: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavigation />

      <div className="flex flex-1 items-center justify-center bg-cream">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">{title}</h2>
          <p className="text-charcoal-500 mb-6">{message}</p>
          <a
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-hublot-900 text-white rounded-lg font-medium text-sm hover:bg-hublot-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {backLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
