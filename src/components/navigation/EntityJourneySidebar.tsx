'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entityJourneys, getVisibleQuickActions } from '@/lib/navigation/entity-journeys'
import { EntityType, ENTITY_BASE_PATHS, ENTITY_NAVIGATION_STYLES } from '@/lib/navigation/entity-navigation.types'
import { commonToolSections, getSectionsByGroup, jobSectionGroups, jobToolSections, getAccountSectionsByGroup, getContactSectionsByCategory, ContactCategory } from '@/lib/navigation/entity-sections'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { CollapsibleSectionGroup } from './CollapsibleSectionGroup'
import { SidebarActionsPopover, type ActionItem } from './SidebarActionsPopover'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarUIContextSafe } from '@/lib/contexts/SidebarUIContext'

interface EntityJourneySidebarProps {
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  /** Tool section counts */
  toolCounts?: {
    activities?: number
    notes?: number
    documents?: number
  }
  /** Section counts for section-based navigation */
  sectionCounts?: Record<string, number>
  className?: string
}

// Back link text per entity type
const backLinkText: Record<EntityType, string> = {
  job: 'All Jobs',
  candidate: 'All Candidates',
  submission: 'All Submissions',
  interview: 'All Interviews',
  offer: 'All Offers',
  placement: 'All Placements',
  account: 'All Accounts',
  contact: 'All Contacts',
  company: 'All Companies',
  deal: 'All Deals',
  lead: 'All Leads',
  campaign: 'All Campaigns',
  invoice: 'All Invoices',
  pay_run: 'All Pay Runs',
  timesheet: 'All Timesheets',
  team: 'All Teams',
}

/**
 * EntityJourneySidebar - Hublot-inspired entity detail sidebar
 *
 * Design principles:
 * - Clean visual hierarchy with generous whitespace
 * - Gold accents for active states
 * - No numbered sections (sections are navigation, not wizard steps)
 * - Clear separation between navigation zones
 */
export function EntityJourneySidebar({
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  toolCounts = {},
  sectionCounts = {},
  className,
}: EntityJourneySidebarProps) {
  const navigationStyle = ENTITY_NAVIGATION_STYLES[entityType]
  const journeyConfig = entityJourneys[entityType]
  const searchParams = useSearchParams()
  const router = useRouter()
  // Default section varies by entity type (account uses 'summary', others use 'overview')
  const defaultSection = entityType === 'account' ? 'summary' : 'overview'
  const currentSection = searchParams.get('section') || defaultSection
  const [isRelatedOpen, setIsRelatedOpen] = useState(true)
  const [isToolsOpen, setIsToolsOpen] = useState(true)

  // Get collapsed state from context
  const sidebarContext = useSidebarUIContextSafe()
  const isCollapsed = sidebarContext?.isCollapsed ?? false

  // Get visible quick actions based on entity status
  const visibleQuickActions = useMemo(() => {
    return getVisibleQuickActions(entityType, entityStatus)
  }, [entityType, entityStatus])

  // Get sections for section-based navigation
  const { mainSections, toolSections } = useMemo(() => {
    if (navigationStyle === 'sections') {
      return getSectionsByGroup(entityType)
    }
    return { mainSections: [], toolSections: commonToolSections }
  }, [entityType, navigationStyle])

  // Get account-specific sections (overview, main, related, tools)
  const accountSections = useMemo(() => {
    if (entityType === 'account') {
      return getAccountSectionsByGroup()
    }
    return null
  }, [entityType])

  // Get contact-specific sections based on category (person vs company)
  const { currentEntityData } = useEntityNavigation()
  const contactSections = useMemo(() => {
    if (entityType === 'contact' && currentEntityData) {
      // Extract category from full contact data
      const contactData = currentEntityData as { contact?: { category?: ContactCategory } }
      const category = contactData?.contact?.category || 'person'
      return getContactSectionsByCategory(category)
    }
    return null
  }, [entityType, currentEntityData])

  // Determine current and completed steps based on entity status (for journey navigation)
  const { currentStepIndex, steps } = useMemo(() => {
    if (navigationStyle !== 'journey' || !journeyConfig) {
      return { currentStepIndex: 0, steps: [] }
    }
    const stepsWithState = journeyConfig.steps.map((step, index) => {
      const isCompleted = step.completedStatuses.includes(entityStatus)
      const isActive = step.activeStatuses.includes(entityStatus)
      return { ...step, isCompleted, isActive, index }
    })

    // Find current step (first active, or last completed)
    const activeIndex = stepsWithState.findIndex(s => s.isActive)
    let currentIdx = activeIndex >= 0 ? activeIndex : 0

    // If no active step found, find the last completed
    if (activeIndex < 0) {
      for (let i = stepsWithState.length - 1; i >= 0; i--) {
        if (stepsWithState[i].isCompleted) {
          currentIdx = i
          break
        }
      }
    }

    return { currentStepIndex: currentIdx, steps: stepsWithState }
  }, [journeyConfig, entityStatus, navigationStyle])

  // Build step href - use defaultTab if available, otherwise use step query param
  const buildStepHref = (stepId: string, defaultTab?: string) => {
    const basePath = ENTITY_BASE_PATHS[entityType]
    if (defaultTab) {
      return `${basePath}/${entityId}?tab=${defaultTab}`
    }
    return `${basePath}/${entityId}?step=${stepId}`
  }

  // Build tool section href
  const buildToolHref = (sectionId: string) => {
    const basePath = ENTITY_BASE_PATHS[entityType]
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    // Check section-specific counts first
    if (sectionCounts[sectionId] !== undefined) {
      return sectionCounts[sectionId]
    }
    // Fall back to tool counts for tool sections
    switch (sectionId) {
      case 'activities':
        return toolCounts.activities
      case 'notes':
        return toolCounts.notes
      case 'documents':
        return toolCounts.documents
      default:
        return undefined
    }
  }

  // Handle quick action click
  const handleQuickAction = (action: (typeof visibleQuickActions)[0]) => {
    switch (action.actionType) {
      case 'navigate':
        if (action.href) {
          const href = action.href.replace(':id', entityId)
          router.push(href)
        }
        break
      case 'dialog':
        // Trigger dialog via custom event
        window.dispatchEvent(
          new CustomEvent('openEntityDialog', {
            detail: {
              dialogId: action.dialogId,
              entityType,
              entityId,
            },
          })
        )
        break
      case 'mutation':
        // Trigger mutation action via custom event
        window.dispatchEvent(
          new CustomEvent('entityAction', {
            detail: {
              action: action.id,
              entityType,
              entityId,
            },
          })
        )
        break
    }
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col flex-1 overflow-hidden bg-white', className)}>
        {/* ===== BACK + ACTIONS ROW ===== */}
        <div className="px-3 py-2.5 border-b border-charcoal-100 flex items-center justify-between gap-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={ENTITY_BASE_PATHS[entityType]}
                  className="inline-flex items-center justify-center w-9 h-9 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-charcoal-900 text-white">
                <p>{backLinkText[entityType]}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={ENTITY_BASE_PATHS[entityType]}
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{backLinkText[entityType]}</span>
            </Link>
          )}

          {/* Quick Actions Dropdown */}
          {visibleQuickActions.length > 0 && !isCollapsed && (
            <SidebarActionsPopover
              actions={visibleQuickActions.map((action) => ({
                id: action.id,
                label: action.label,
                icon: action.icon,
                variant: action.variant as ActionItem['variant'],
              }))}
              onAction={(actionId) => {
                const action = visibleQuickActions.find((a) => a.id === actionId)
                if (action) handleQuickAction(action)
              }}
            />
          )}
        </div>

        {/* ===== ENTITY HEADER - Dark Premium Style ===== */}
        <div className="bg-charcoal-900 text-white">
          {isCollapsed ? (
            <div className="px-2 py-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-charcoal-900 font-bold text-sm shadow-lg">
                      {entityName.substring(0, 2).toUpperCase()}
                    </div>
                    <StatusBadgeDot status={entityStatus} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-800 text-white border-charcoal-700">
                  <div>
                    <p className="font-semibold">{entityName}</p>
                    {entitySubtitle && <p className="text-xs text-charcoal-300">{entitySubtitle}</p>}
                    <p className="text-xs text-charcoal-400 mt-1 capitalize">{entityStatus.replace(/_/g, ' ')}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="px-4 py-4">
              {/* Entity Type + Status Row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-500">
                  {entityType.replace(/_/g, ' ')}
                </span>
                <StatusBadgeDark status={entityStatus} />
              </div>
              {/* Entity Name */}
              <h2 className="font-heading font-bold text-white text-lg truncate leading-tight">
                {entityName}
              </h2>
              {/* Subtitle */}
              {entitySubtitle && (
                <p className="text-sm text-charcoal-400 truncate mt-1">{entitySubtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* ===== NAVIGATION ===== */}
        <nav className="flex-1 overflow-y-auto">
          {/* ACCOUNT SECTIONS MODE - Hublot-inspired clean design */}
          {navigationStyle === 'sections' && entityType === 'account' && accountSections && (
            <>
              {/* Main Sections - Clean list without numbers */}
              <div className="py-3">
                {!isCollapsed && (
                  <div className="px-4 pb-2">
                    <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                      Sections
                    </span>
                  </div>
                )}
                <ul className="space-y-0.5 px-2">
                  {/* Overview/Summary Section */}
                  {accountSections.overviewSection && (
                    <SectionNavItem
                      section={accountSections.overviewSection}
                      isActive={currentSection === accountSections.overviewSection.id}
                      href={buildToolHref(accountSections.overviewSection.id)}
                      count={getSectionCount(accountSections.overviewSection.id)}
                      isCollapsed={isCollapsed}
                    />
                  )}
                  {/* Main Sections (no numbers, just clean icons) */}
                  {accountSections.mainSections.map((section) => (
                    <SectionNavItem
                      key={section.id}
                      section={section}
                      isActive={currentSection === section.id}
                      href={buildToolHref(section.id)}
                      count={section.showCount ? getSectionCount(section.id) : undefined}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </ul>
              </div>

              {/* Related Data - Collapsible */}
              {accountSections.relatedSections.length > 0 && (
                <Collapsible
                  open={isRelatedOpen}
                  onOpenChange={setIsRelatedOpen}
                  className="border-t border-charcoal-100/80"
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {!isCollapsed && (
                      <>
                        <ChevronRight className={cn(
                          'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                          isRelatedOpen && 'rotate-90'
                        )} />
                        <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                          Related
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-9 h-9 flex items-center justify-center">
                            <ChevronRight className={cn(
                              'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200',
                              isRelatedOpen && 'rotate-90'
                            )} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>Related Data</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="space-y-0.5 px-2 pb-3">
                      {accountSections.relatedSections.map((section) => (
                        <SectionNavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          href={buildToolHref(section.id)}
                          count={section.showCount ? getSectionCount(section.id) : undefined}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Tools - Collapsible */}
              {accountSections.toolSections.length > 0 && (
                <Collapsible
                  open={isToolsOpen}
                  onOpenChange={setIsToolsOpen}
                  className="border-t border-charcoal-100/80"
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {!isCollapsed && (
                      <>
                        <ChevronRight className={cn(
                          'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                          isToolsOpen && 'rotate-90'
                        )} />
                        <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                          Tools
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-9 h-9 flex items-center justify-center">
                            <ChevronRight className={cn(
                              'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200',
                              isToolsOpen && 'rotate-90'
                            )} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>Tools</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="space-y-0.5 px-2 pb-3">
                      {accountSections.toolSections.map((section) => (
                        <SectionNavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          href={buildToolHref(section.id)}
                          count={section.showCount ? getSectionCount(section.id) : undefined}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          )}

          {/* CONTACT SECTIONS MODE - Category-aware Hublot-inspired design */}
          {navigationStyle === 'sections' && entityType === 'contact' && contactSections && (
            <>
              {/* Main Sections - Clean list without numbers */}
              <div className="py-3">
                {!isCollapsed && (
                  <div className="px-4 pb-2">
                    <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                      Sections
                    </span>
                  </div>
                )}
                <ul className="space-y-0.5 px-2">
                  {/* Overview/Summary Section */}
                  {contactSections.overviewSection && (
                    <SectionNavItem
                      section={contactSections.overviewSection}
                      isActive={currentSection === contactSections.overviewSection.id}
                      href={buildToolHref(contactSections.overviewSection.id)}
                      count={getSectionCount(contactSections.overviewSection.id)}
                      isCollapsed={isCollapsed}
                    />
                  )}
                  {/* Main Sections (no numbers, just clean icons) */}
                  {contactSections.mainSections.map((section) => (
                    <SectionNavItem
                      key={section.id}
                      section={section}
                      isActive={currentSection === section.id}
                      href={buildToolHref(section.id)}
                      count={section.showCount ? getSectionCount(section.id) : undefined}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </ul>
              </div>

              {/* Related Data - Collapsible */}
              {contactSections.relatedSections.length > 0 && (
                <Collapsible
                  open={isRelatedOpen}
                  onOpenChange={setIsRelatedOpen}
                  className="border-t border-charcoal-100/80"
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {!isCollapsed && (
                      <>
                        <ChevronRight className={cn(
                          'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                          isRelatedOpen && 'rotate-90'
                        )} />
                        <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                          Related
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-9 h-9 flex items-center justify-center">
                            <ChevronRight className={cn(
                              'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200',
                              isRelatedOpen && 'rotate-90'
                            )} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>Related Data</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="space-y-0.5 px-2 pb-3">
                      {contactSections.relatedSections.map((section) => (
                        <SectionNavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          href={buildToolHref(section.id)}
                          count={section.showCount ? getSectionCount(section.id) : undefined}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Tools - Collapsible */}
              {contactSections.toolSections.length > 0 && (
                <Collapsible
                  open={isToolsOpen}
                  onOpenChange={setIsToolsOpen}
                  className="border-t border-charcoal-100/80"
                >
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {!isCollapsed && (
                      <>
                        <ChevronRight className={cn(
                          'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                          isToolsOpen && 'rotate-90'
                        )} />
                        <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                          Tools
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-9 h-9 flex items-center justify-center">
                            <ChevronRight className={cn(
                              'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200',
                              isToolsOpen && 'rotate-90'
                            )} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-charcoal-900 text-white">
                          <p>Tools</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="space-y-0.5 px-2 pb-3">
                      {contactSections.toolSections.map((section) => (
                        <SectionNavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          href={buildToolHref(section.id)}
                          count={section.showCount ? getSectionCount(section.id) : undefined}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          )}

          {/* JOB SECTIONS MODE - Collapsible groups */}
          {navigationStyle === 'sections' && entityType === 'job' && (
            <>
              {/* Job-specific: Collapsible Section Groups */}
              {jobSectionGroups.map((group) => {
                const groupSections = mainSections.filter((s) => group.sectionIds.includes(s.id))
                const groupTotal = groupSections.reduce((sum, s) => {
                  const count = getSectionCount(s.id)
                  return sum + (count || 0)
                }, 0)

                return (
                  <CollapsibleSectionGroup
                    key={group.id}
                    id={group.id}
                    label={group.label}
                    count={group.sectionIds.length > 1 ? groupTotal : undefined}
                    defaultOpen={group.defaultOpen}
                  >
                    <ul className="space-y-0.5 px-2">
                      {groupSections.map((section) => (
                        <SectionNavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          href={buildToolHref(section.id)}
                          count={section.showCount ? getSectionCount(section.id) : undefined}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </ul>
                  </CollapsibleSectionGroup>
                )
              })}

              {/* Tool Sections (Collapsible) for Jobs */}
              <Collapsible
                open={isToolsOpen}
                onOpenChange={setIsToolsOpen}
                className="border-t border-charcoal-100/80"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50">
                  <ChevronRight className={cn(
                    'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                    isToolsOpen && 'rotate-90'
                  )} />
                  <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                    Tools
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="space-y-0.5 px-2 pb-3">
                    {jobToolSections.map((section) => (
                      <SectionNavItem
                        key={section.id}
                        section={section}
                        isActive={currentSection === section.id}
                        href={buildToolHref(section.id)}
                        count={section.showCount ? getSectionCount(section.id) : undefined}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* OTHER SECTIONS MODE - Generic non-job, non-account entities */}
          {navigationStyle === 'sections' && entityType !== 'job' && entityType !== 'account' && (
            <>
              {/* Main Sections */}
              <div className="py-3">
                {!isCollapsed && (
                  <div className="px-4 pb-2">
                    <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                      Sections
                    </span>
                  </div>
                )}
                <ul className="space-y-0.5 px-2">
                  {mainSections.map((section) => (
                    <SectionNavItem
                      key={section.id}
                      section={section}
                      isActive={currentSection === section.id}
                      href={buildToolHref(section.id)}
                      count={section.showCount ? getSectionCount(section.id) : undefined}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </ul>
              </div>

              {/* Tool Sections (Collapsible) */}
              <Collapsible
                open={isToolsOpen}
                onOpenChange={setIsToolsOpen}
                className="border-t border-charcoal-100/80"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50">
                  <ChevronRight className={cn(
                    'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                    isToolsOpen && 'rotate-90'
                  )} />
                  <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                    Tools
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="space-y-0.5 px-2 pb-3">
                    {toolSections.map((section) => (
                      <SectionNavItem
                        key={section.id}
                        section={section}
                        isActive={currentSection === section.id}
                        href={buildToolHref(section.id)}
                        count={section.showCount ? getSectionCount(section.id) : undefined}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* JOURNEY MODE: Show journey steps + tool sections */}
          {navigationStyle === 'journey' && (
            <>
              {/* Journey Steps */}
              <div className="py-3">
                {!isCollapsed && (
                  <div className="px-4 pb-2">
                    <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                      Journey
                    </span>
                  </div>
                )}
                <ul className="space-y-1 px-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCurrent = index === currentStepIndex
                    const isPast = step.isCompleted || index < currentStepIndex
                    const isFuture = !isPast && !isCurrent

                    return (
                      <li key={step.id}>
                        <Link
                          href={buildStepHref(step.id, step.defaultTab)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                            isCurrent && 'bg-gold-50 text-gold-700',
                            isPast && 'text-charcoal-600 hover:bg-charcoal-50',
                            isFuture && 'text-charcoal-400 hover:bg-charcoal-50'
                          )}
                        >
                          {/* Step Indicator */}
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0',
                              isPast && 'bg-success-500 text-white',
                              isCurrent && 'bg-gold-500 text-white',
                              isFuture && 'bg-charcoal-200 text-charcoal-500'
                            )}
                          >
                            {isPast ? <Check className="w-3.5 h-3.5" /> : index + 1}
                          </div>

                          {/* Step Content */}
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <span className={cn('text-sm truncate block', isCurrent && 'font-medium')}>
                                {step.label}
                              </span>
                              {step.description && isCurrent && (
                                <span className="text-xs text-charcoal-500 truncate block">
                                  {step.description}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Active Indicator */}
                          {isCurrent && !isCollapsed && (
                            <ChevronRight className="w-4 h-4 text-gold-500 flex-shrink-0" />
                          )}
                        </Link>

                        {/* Connector Line */}
                        {index < steps.length - 1 && !isCollapsed && (
                          <div className="ml-6 pl-[11px] py-1">
                            <div className={cn('w-0.5 h-4', isPast ? 'bg-success-500' : 'bg-charcoal-200')} />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Tools Section - Collapsible */}
              <Collapsible
                open={isToolsOpen}
                onOpenChange={setIsToolsOpen}
                className="border-t border-charcoal-100/80"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50">
                  <ChevronRight className={cn(
                    'w-3 h-3 text-charcoal-400 transition-transform duration-200',
                    isToolsOpen && 'rotate-90'
                  )} />
                  <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
                    Tools
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="space-y-0.5 px-2 pb-3">
                    {commonToolSections.map((section) => (
                      <SectionNavItem
                        key={section.id}
                        section={section}
                        isActive={currentSection === section.id}
                        href={buildToolHref(section.id)}
                        count={section.showCount ? getSectionCount(section.id) : undefined}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </nav>
      </div>
    </TooltipProvider>
  )
}

// ============================================================================
// SECTION NAV ITEM - Reusable navigation item component
// ============================================================================

interface SectionNavItemProps {
  section: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    alertOnCount?: boolean
  }
  isActive: boolean
  href: string
  count?: number
  isCollapsed: boolean
}

function SectionNavItem({ section, isActive, href, count, isCollapsed }: SectionNavItemProps) {
  const Icon = section.icon
  const hasAlert = section.alertOnCount && count && count > 0

  if (isCollapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={href}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-charcoal-900 text-white'
                  : 'text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-700'
              )}
            >
              <Icon className="w-4 h-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-charcoal-900 text-white">
            <div className="flex items-center gap-2">
              <span>{section.label}</span>
              {count !== undefined && (
                <span className="text-charcoal-400">({count})</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive
            ? 'bg-charcoal-900 text-white'
            : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-800'
        )}
      >
        <Icon
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-colors',
            isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-charcoal-500'
          )}
        />
        <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>{section.label}</span>
        {count !== undefined && (
          <span
            className={cn(
              'text-xs tabular-nums transition-colors',
              isActive ? 'text-charcoal-400' : hasAlert ? 'text-error-600 font-medium' : 'text-charcoal-400'
            )}
          >
            {count}
          </span>
        )}
      </Link>
    </li>
  )
}

// ============================================================================
// STATUS BADGES
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </div>
  )
}

// Dark variant for dark header backgrounds
function StatusBadgeDark({ status }: { status: string }) {
  const darkConfig = getStatusConfigDark(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        darkConfig.bg,
        darkConfig.text,
        darkConfig.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', darkConfig.dot)} />
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  )
}

function StatusBadgeDot({ status }: { status: string }) {
  const config = getStatusConfig(status)
  return <div className={cn('w-2.5 h-2.5 rounded-full', config.dot)} />
}

function getStatusConfig(status: string): {
  bg: string
  text: string
  dot: string
  border: string
} {
  const configs: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    // Success states
    active: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    placed: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    qualified: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    closed_won: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    filled: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    completed: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },

    // Warning states
    prospect: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    sourced: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    on_hold: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    paused: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    pending_start: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    proposal: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },

    // Info/Blue states
    open: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    screening: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    contacted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    discovery: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    submission_ready: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    extended: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },

    // Purple states
    bench: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
    converted: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
    verbal_commit: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
    offer_stage: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },

    // Error states
    churned: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },
    cancelled: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },
    rejected: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },
    lost: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },
    closed_lost: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },

    // Neutral states
    draft: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' },
    inactive: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' },
    withdrawn: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' },
    ended: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' },
  }

  return configs[status] || { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' }
}

// Dark variant config for dark backgrounds
function getStatusConfigDark(status: string): {
  bg: string
  text: string
  dot: string
  border: string
} {
  const configs: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    // Success states - green glow on dark
    active: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    placed: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    qualified: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    closed_won: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    filled: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },

    // Warning states - amber glow
    prospect: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    sourced: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    on_hold: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    paused: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    pending_start: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    proposal: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },

    // Info/Blue states
    open: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    new: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    screening: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    contacted: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    discovery: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    submission_ready: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    extended: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },

    // Purple states
    bench: { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-400', border: 'border-purple-500/30' },
    converted: { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-400', border: 'border-purple-500/30' },
    verbal_commit: { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-400', border: 'border-purple-500/30' },
    offer_stage: { bg: 'bg-purple-500/20', text: 'text-purple-300', dot: 'bg-purple-400', border: 'border-purple-500/30' },

    // Error states - red glow
    churned: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
    lost: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
    closed_lost: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },

    // Neutral states
    draft: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
    inactive: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
    withdrawn: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
    ended: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
  }

  return configs[status] || { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' }
}

export { StatusBadge, StatusBadgeDark, StatusBadgeDot }
