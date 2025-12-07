'use client'

import * as React from "react"
import { SectionSidebar } from "@/components/navigation/SectionSidebar"
import { EntityJourneySidebar } from "@/components/navigation/EntityJourneySidebar"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { useEntityNavigationSafe } from "@/lib/navigation/EntityNavigationContext"
import { EntityQuickAction, resolveHref } from "@/lib/navigation/entity-navigation.types"
import { useRouter } from "next/navigation"
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
}

export function SidebarLayout({
  children,
  className,
  hideSidebar = false,
  sectionId,
  onEntityQuickAction,
}: SidebarLayoutProps) {
  const entityNav = useEntityNavigationSafe()
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
        window.dispatchEvent(new CustomEvent('openEntityDialog', {
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
        {/* Dynamic sidebar: EntityJourneySidebar when viewing an entity, SectionSidebar otherwise */}
        {!hideSidebar && (
          currentEntity ? (
            <EntityJourneySidebar
              entityType={currentEntity.type}
              entityId={currentEntity.id}
              entityName={currentEntity.name}
              entitySubtitle={currentEntity.subtitle}
              entityStatus={currentEntity.status}
              onQuickAction={handleQuickAction}
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

// Export SidebarSection type for backwards compatibility
export type { SidebarSection }
