'use client'

import * as React from "react"
import { SectionSidebar } from "@/components/navigation/SectionSidebar"
import { EntityJourneySidebar } from "@/components/navigation/EntityJourneySidebar"
import { AccountSectionSidebar } from "@/components/navigation/AccountSectionSidebar"
import { JobSectionSidebar } from "@/components/navigation/JobSectionSidebar"
import { ContactSectionSidebar } from "@/components/navigation/ContactSectionSidebar"
import { CampaignSectionSidebar } from "@/components/navigation/CampaignSectionSidebar"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { useEntityNavigationSafe } from "@/lib/navigation/EntityNavigationContext"
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
  /** Optional: section counts for section-based sidebars (accounts, deals, leads) */
  sectionCounts?: {
    contacts?: number
    jobs?: number
    placements?: number
    notes?: number
    meetings?: number
    escalations?: number
  }
  /** Optional: section counts for job sections view */
  jobSectionCounts?: {
    pipeline?: number
    submissions?: number
    interviews?: number
    offers?: number
    notes?: number
  }
  /** Optional: section counts for contact sections */
  contactSectionCounts?: {
    accounts?: number
    submissions?: number
    activities?: number
    communications?: number
    meetings?: number
    notes?: number
  }
  /** Optional: section counts for campaign sections */
  campaignSectionCounts?: {
    prospects?: number
    leads?: number
    activities?: number
    notes?: number
    documents?: number
    sequences?: number
  }
  /** Optional: metrics for campaign sidebar */
  campaignMetrics?: {
    prospects?: number
    contacted?: number
    opened?: number
    responded?: number
    leads?: number
    meetings?: number
    conversionRate?: number
    openRate?: number
    responseRate?: number
  }
  /** Optional: targets for campaign sidebar */
  campaignTargets?: {
    targetLeads?: number
    targetMeetings?: number
    targetRevenue?: number
  }
  /** Optional: dates for campaign sidebar */
  campaignDates?: {
    startDate?: string
    endDate?: string
  }
}

export function SidebarLayout({
  children,
  className,
  hideSidebar = false,
  sectionId,
  onEntityQuickAction,
  sectionCounts,
  jobSectionCounts,
  contactSectionCounts,
  campaignSectionCounts,
  campaignMetrics,
  campaignTargets,
  campaignDates,
}: SidebarLayoutProps) {
  const entityNav = useEntityNavigationSafe()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentEntity = entityNav?.currentEntity

  // Check for job view mode from URL
  const jobViewMode = currentEntity?.type === 'job'
    ? searchParams.get('view')
    : null

  // Determine navigation style based on entity type
  // For jobs, allow override via URL param ?view=sections
  const navigationStyle = currentEntity
    ? (currentEntity.type === 'job' && jobViewMode === 'sections'
        ? 'sections'
        : ENTITY_NAVIGATION_STYLES[currentEntity.type])
    : null

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
        {/* Dynamic sidebar based on entity type and navigation style */}
        {!hideSidebar && (
          currentEntity ? (
            // For jobs in sections mode, use JobSectionSidebar
            currentEntity.type === 'job' && navigationStyle === 'sections' ? (
              <JobSectionSidebar
                jobId={currentEntity.id}
                jobTitle={currentEntity.name}
                jobSubtitle={currentEntity.subtitle}
                jobStatus={currentEntity.status}
                counts={jobSectionCounts}
                onQuickAction={(action) => {
                  // Handle dialog actions
                  if (action.actionType === 'dialog' && action.dialogId) {
                    window.dispatchEvent(new CustomEvent('openJobDialog', {
                      detail: {
                        dialogId: action.dialogId,
                      }
                    }))
                  }
                }}
                className="hidden lg:flex"
              />
            ) : currentEntity.type === 'contact' && navigationStyle === 'sections' ? (
              // Use ContactSectionSidebar for contacts
              <ContactSectionSidebar
                contactId={currentEntity.id}
                contactName={currentEntity.name}
                contactSubtitle={currentEntity.subtitle}
                isPrimary={currentEntity.status === 'primary'}
                counts={contactSectionCounts}
                onQuickAction={(action) => {
                  // Handle dialog actions
                  if (action.actionType === 'dialog' && action.dialogId) {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: {
                        dialogId: action.dialogId,
                      }
                    }))
                  }
                }}
                className="hidden lg:flex"
              />
            ) : currentEntity.type === 'campaign' && navigationStyle === 'sections' ? (
              // Use CampaignSectionSidebar for campaigns
              <CampaignSectionSidebar
                campaignId={currentEntity.id}
                campaignName={currentEntity.name}
                campaignSubtitle={currentEntity.subtitle}
                campaignStatus={currentEntity.status}
                counts={campaignSectionCounts}
                metrics={campaignMetrics}
                targets={campaignTargets}
                dates={campaignDates}
                onQuickAction={(action) => {
                  // Handle dialog actions
                  if (action.actionType === 'dialog' && action.dialogId) {
                    window.dispatchEvent(new CustomEvent('openCampaignDialog', {
                      detail: {
                        dialogId: action.dialogId,
                      }
                    }))
                  }
                }}
                className="hidden lg:flex"
              />
            ) : navigationStyle === 'sections' ? (
              // Use section-based sidebar for accounts/deals/leads
              <AccountSectionSidebar
                accountId={currentEntity.id}
                accountName={currentEntity.name}
                accountSubtitle={currentEntity.subtitle}
                accountStatus={currentEntity.status}
                counts={sectionCounts}
                onQuickAction={(action) => {
                  // Handle dialog actions
                  if (action.actionType === 'dialog' && action.dialogId) {
                    window.dispatchEvent(new CustomEvent('openEntityDialog', {
                      detail: {
                        dialogId: action.dialogId,
                        entityType: currentEntity.type,
                        entityId: currentEntity.id,
                      }
                    }))
                  }
                }}
                className="hidden lg:flex"
              />
            ) : (
              <EntityJourneySidebar
                entityType={currentEntity.type}
                entityId={currentEntity.id}
                entityName={currentEntity.name}
                entitySubtitle={currentEntity.subtitle}
                entityStatus={currentEntity.status}
                onQuickAction={handleQuickAction}
                className="hidden lg:flex"
              />
            )
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
