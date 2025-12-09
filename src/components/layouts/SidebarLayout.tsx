'use client'

import * as React from "react"
import { Suspense } from "react"
import { SectionSidebar } from "@/components/navigation/SectionSidebar"
import { EntityJourneySidebar } from "@/components/navigation/EntityJourneySidebar"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { useEntityNavigationSafe } from "@/lib/navigation/EntityNavigationContext"
import { useEntityData } from "@/components/layouts/EntityContextProvider"
import { EntityQuickAction, resolveHref, ENTITY_NAVIGATION_STYLES } from "@/lib/navigation/entity-navigation.types"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

// Keep old interface for backwards compatibility but it's no longer used
interface SidebarSection {
  title?: string
  items: Array<{ label: string; href?: string }>
}

interface SidebarLayoutProps {
  children: React.ReactNode
  /** @deprecated - sections is no longer used, sidebar is auto-detected from path */
  sections?: SidebarSection[]
  className?: string
  /** Hide the left sidebar entirely */
  hideSidebar?: boolean
  /** Optional: specify section ID explicitly */
  sectionId?: string
  /** Optional: custom quick action handler for entity sidebar */
  onEntityQuickAction?: (action: EntityQuickAction) => void
  /** Optional: tool section counts for entity sidebar */
  toolCounts?: {
    activities?: number
    notes?: number
    documents?: number
  }
}

// Loading fallback for Suspense
function SidebarLayoutLoading({ className }: { className?: string }) {
  return (
    <div className={cn("h-screen flex flex-col overflow-hidden", className)}>
      <div className="h-16 bg-white border-b border-charcoal-100" />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-charcoal-100 animate-pulse hidden lg:block" />
        <main className="flex-1 min-w-0 overflow-y-auto bg-cream p-6">
          <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded mb-4" />
          <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
        </main>
      </div>
    </div>
  )
}

// Inner component that uses hooks - wrapped in Suspense
function SidebarLayoutInner({
  children,
  className,
  hideSidebar = false,
  sectionId,
  onEntityQuickAction,
  toolCounts,
}: SidebarLayoutProps) {
  const entityNav = useEntityNavigationSafe()
  const entityData = useEntityData()
  const router = useRouter()
  const currentEntity = entityNav?.currentEntity

  // Default quick action handler
  const handleQuickAction = React.useCallback((action: EntityQuickAction) => {
    if (onEntityQuickAction) {
      onEntityQuickAction(action)
      return
    }

    // Default handling
    if (!currentEntity) return

    switch (action.actionType) {
      case 'navigate':
        if (action.href) {
          router.push(resolveHref(action.href, currentEntity.id))
        }
        break
      case 'dialog':
        // Dispatch custom event for page to handle
        // Use entity-type-specific event name for backward compatibility
        const eventName = `open${currentEntity.type.charAt(0).toUpperCase()}${currentEntity.type.slice(1)}Dialog`
        window.dispatchEvent(new CustomEvent(eventName, {
          detail: {
            dialogId: action.dialogId,
            entityType: currentEntity.type,
            entityId: currentEntity.id,
          }
        }))
        break
      case 'mutation':
        // Dispatch custom event for page to handle
        window.dispatchEvent(new CustomEvent('entityMutation', {
          detail: {
            actionId: action.id,
            entityType: currentEntity.type,
            entityId: currentEntity.id,
          }
        }))
        break
    }
  }, [currentEntity, router, onEntityQuickAction])

  return (
    <div className={cn("h-screen flex flex-col overflow-hidden", className)}>
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Dynamic sidebar based on entity type */}
        {!hideSidebar && (
          currentEntity ? (
            // Use unified EntityJourneySidebar for all entity types
            // It handles both journey and section navigation based on entity type
            <EntityJourneySidebar
              entityType={currentEntity.type}
              entityId={currentEntity.id}
              entityName={currentEntity.name}
              entitySubtitle={currentEntity.subtitle}
              entityStatus={currentEntity.status}
              onQuickAction={handleQuickAction}
              toolCounts={toolCounts}
              className="hidden lg:flex"
            />
          ) : (
            <SectionSidebar sectionId={sectionId} className="hidden lg:flex" />
          )
        )}

        <main className="flex-1 min-w-0 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  )
}

// Wrapper component that provides Suspense boundary
export function SidebarLayout(props: SidebarLayoutProps) {
  return (
    <Suspense fallback={<SidebarLayoutLoading className={props.className} />}>
      <SidebarLayoutInner {...props} />
    </Suspense>
  )
}

// Export SidebarSection type for backwards compatibility
export type { SidebarSection }
