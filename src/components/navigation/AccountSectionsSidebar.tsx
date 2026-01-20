'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronDown, Wrench, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ENTITY_BASE_PATHS } from '@/lib/navigation/entity-navigation.types'
import { SidebarActionsPopover, type ActionItem } from './SidebarActionsPopover'
import { Badge } from '@/components/ui/badge'
import { getVisibleQuickActions } from '@/lib/navigation/entity-journeys'
import { getAccountSectionsByGroup } from '@/lib/navigation/entity-sections'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Get section groups from centralized definitions
const {
  overviewSection,
  mainSections: accountMainSectionsBase,
  relatedSections: accountRelatedSections,
  toolSections: accountToolSections,
} = getAccountSectionsByGroup()

// Combine overview with main sections for rendering
const accountMainSections = overviewSection
  ? [overviewSection, ...accountMainSectionsBase]
  : accountMainSectionsBase

interface AccountSectionsSidebarProps {
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  sectionCounts?: Record<string, number>
  /** Which sections have data (for completion indicators) */
  sectionHasData?: Record<string, boolean>
  className?: string
}

export function AccountSectionsSidebar({
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  sectionCounts = {},
  sectionHasData = {},
  className,
}: AccountSectionsSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSection = searchParams.get('section') || 'summary'
  const [isToolsOpen, setIsToolsOpen] = useState(true)
  const [isRelatedOpen, setIsRelatedOpen] = useState(true)

  // Get visible quick actions based on entity status
  const visibleQuickActions = useMemo(() => {
    return getVisibleQuickActions('account', entityStatus)
  }, [entityStatus])

  // Build section href
  const buildSectionHref = (sectionId: string) => {
    return `${ENTITY_BASE_PATHS.account}/${entityId}?section=${sectionId}`
  }

  // Handle quick action click
  const handleQuickAction = (action: typeof visibleQuickActions[0]) => {
    switch (action.actionType) {
      case 'navigate':
        if (action.href) {
          const href = action.href.replace(':id', entityId)
          router.push(href)
        }
        break
      case 'dialog':
        window.dispatchEvent(
          new CustomEvent('openEntityDialog', {
            detail: {
              dialogId: action.dialogId,
              entityType: 'account',
              entityId,
            },
          })
        )
        break
      case 'mutation':
        window.dispatchEvent(
          new CustomEvent('entityAction', {
            detail: {
              action: action.id,
              entityType: 'account',
              entityId,
            },
          })
        )
        break
    }
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    return sectionCounts[sectionId]
  }

  // Check if section has data (for completion indicator)
  const hasSectionData = (sectionId: string): boolean => {
    return sectionHasData[sectionId] ?? false
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Dark Header - Matching Wizard Style */}
      <div className="p-4 border-b border-charcoal-100 bg-charcoal-900 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-500">
            Account
          </span>
          <StatusBadgeLight status={entityStatus} />
        </div>
        <h2 className="text-lg font-heading font-bold text-white truncate" title={entityName}>
          {entityName}
        </h2>
        {entitySubtitle && (
          <p className="text-sm text-charcoal-400 truncate mt-0.5">
            {entitySubtitle}
          </p>
        )}
      </div>

      {/* Back Link + Actions */}
      <div className="px-4 py-3 border-b border-charcoal-100 flex items-center justify-between">
        <Link
          href={ENTITY_BASE_PATHS.account}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Accounts
        </Link>

        {visibleQuickActions.length > 0 && (
          <SidebarActionsPopover
            actions={visibleQuickActions.map((action) => ({
              id: action.id,
              label: action.label,
              icon: action.icon,
              variant: action.variant as ActionItem['variant'],
            }))}
            onAction={(actionId) => {
              const action = visibleQuickActions.find(a => a.id === actionId)
              if (action) handleQuickAction(action)
            }}
          />
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {/* Main Sections - Wizard Step Style */}
        <div className="py-3">
          <div className="px-4 mb-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            Sections
          </div>
          <div className="space-y-0.5">
            {accountMainSections.map((section) => {
              const Icon = section.icon
              const isActive = currentSection === section.id
              const hasData = hasSectionData(section.id)
              const count = section.showCount ? getSectionCount(section.id) : undefined

              return (
                <Link
                  key={section.id}
                  href={buildSectionHref(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 border-l-4',
                    isActive
                      ? 'bg-gold-50 border-gold-500'
                      : 'border-transparent hover:bg-charcoal-50'
                  )}
                >
                  {/* Status Indicator */}
                  {section.isOverview ? (
                    // Summary uses icon instead of number
                    <div className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full transition-colors',
                      isActive
                        ? 'bg-gold-500 text-white'
                        : 'bg-charcoal-100 text-charcoal-500'
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    // Numbered sections with completion indicator
                    <div className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium transition-colors',
                      hasData
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                          ? 'bg-gold-500 border-gold-500 text-white'
                          : 'border-charcoal-300 text-charcoal-500'
                    )}>
                      {hasData ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>{section.number}</span>
                      )}
                    </div>
                  )}

                  {/* Label */}
                  <span className={cn(
                    'flex-1 text-sm truncate',
                    isActive ? 'font-medium text-charcoal-900' : 'text-charcoal-600'
                  )}>
                    {section.label}
                  </span>

                  {/* Count Badge */}
                  {count !== undefined && count > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                        isActive
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-600'
                      )}
                    >
                      {count}
                    </Badge>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Related Data Sections - Collapsible */}
        <Collapsible
          open={isRelatedOpen}
          onOpenChange={setIsRelatedOpen}
          className="border-t border-charcoal-100"
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider hover:text-charcoal-700 transition-colors">
            {isRelatedOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Related Data</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pb-2 space-y-0.5">
              {accountRelatedSections.map((section) => {
                const Icon = section.icon
                const isActive = currentSection === section.id
                const count = section.showCount ? getSectionCount(section.id) : undefined

                return (
                  <Link
                    key={section.id}
                    href={buildSectionHref(section.id)}
                    className={cn(
                      'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all duration-150 group',
                      isActive
                        ? 'bg-gold-50 text-gold-700'
                        : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                      )}
                    />
                    <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
                      {section.label}
                    </span>
                    {count !== undefined && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                          isActive
                            ? 'bg-gold-100 text-gold-700'
                            : 'bg-charcoal-100 text-charcoal-600'
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-gold-400" />
                    )}
                  </Link>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tools Section - Collapsible */}
        <Collapsible
          open={isToolsOpen}
          onOpenChange={setIsToolsOpen}
          className="border-t border-charcoal-100 bg-charcoal-50/50"
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider hover:text-charcoal-700 transition-colors">
            {isToolsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pb-3 space-y-0.5">
              {accountToolSections.map((section) => {
                const Icon = section.icon
                const isActive = currentSection === section.id
                const count = section.showCount ? getSectionCount(section.id) : undefined

                return (
                  <Link
                    key={section.id}
                    href={buildSectionHref(section.id)}
                    className={cn(
                      'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all duration-150 group',
                      isActive
                        ? 'bg-white text-gold-700 shadow-sm'
                        : 'text-charcoal-600 hover:bg-white hover:text-charcoal-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                      )}
                    />
                    <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
                      {section.label}
                    </span>
                    {count !== undefined && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                          isActive
                            ? 'bg-gold-100 text-gold-700'
                            : 'bg-charcoal-100 text-charcoal-600'
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-gold-400" />
                    )}
                  </Link>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </nav>
    </div>
  )
}

// Light status badge for dark header
function StatusBadgeLight({ status }: { status: string }) {
  const colors: Record<string, string> = {
    prospect: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    active: 'bg-green-500/20 text-green-300 border-green-500/30',
    inactive: 'bg-charcoal-500/20 text-charcoal-300 border-charcoal-500/30',
    on_hold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    churned: 'bg-red-500/20 text-red-300 border-red-500/30',
    default: 'bg-white/10 text-white border-white/20',
  }

  return (
    <span className={cn(
      'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
      colors[status] || colors.default
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// Re-export for external use
export { accountMainSections, accountRelatedSections, accountToolSections }

// Also export the component's section groups helper
export { getAccountSectionsByGroup } from '@/lib/navigation/entity-sections'
