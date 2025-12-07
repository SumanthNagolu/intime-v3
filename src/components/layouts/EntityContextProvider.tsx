'use client'

import { useEffect, ReactNode } from 'react'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { EntityType } from '@/lib/navigation/entity-navigation.types'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface EntityContextProviderProps {
  children: ReactNode
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
}

/**
 * Sets the current entity in navigation context without providing layout shell.
 * Use this when the parent layout (SidebarLayout) handles the navigation and sidebar.
 */
export function EntityContextProvider({
  children,
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
}: EntityContextProviderProps) {
  const { setCurrentEntity, addRecentEntity, clearCurrentEntity } = useEntityNavigation()

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

    // Clear on unmount
    return () => {
      clearCurrentEntity()
    }
  }, [entityType, entityId, entityName, entityStatus, entitySubtitle, setCurrentEntity, addRecentEntity, clearCurrentEntity])

  return <>{children}</>
}

// Loading skeleton for entity pages (just content, no shell)
export function EntityContentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  )
}

// Error state for entity pages (just content, no shell)
export function EntityContentError({
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
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">{title}</h2>
        <p className="text-charcoal-500 mb-6">{message}</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-hublot-900 text-white rounded-lg font-medium text-sm hover:bg-hublot-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </Link>
      </div>
    </div>
  )
}
