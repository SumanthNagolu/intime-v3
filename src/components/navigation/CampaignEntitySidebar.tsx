'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  Copy,
  CheckCircle,
  BarChart3,
  UserPlus,
  Upload,
  StickyNote,
  FileText,
} from 'lucide-react'
import { getCampaignSectionsByGroup, SectionDefinition } from '@/lib/navigation/entity-sections'
import { useEntityNavigation } from '@/lib/navigation/EntityNavigationContext'
import { useSidebarUIContextSafe } from '@/lib/contexts/SidebarUIContext'
import { SidebarActionsPopover, type ActionItem } from './SidebarActionsPopover'

interface CampaignEntitySidebarProps {
  campaignId: string
  campaignName: string
  campaignSubtitle?: string
  campaignStatus: string
  counts?: {
    prospects?: number
    leads?: number
    activities?: number
    notes?: number
    documents?: number
  }
  className?: string
}

/**
 * CampaignEntitySidebar - Simplified sidebar with 3 categories
 *
 * Categories:
 * - Core: Overview + configuration sections (Setup, Targeting, Channels, Schedule, Budget, Team, Compliance)
 * - Related: Campaign data (Prospects, Leads, Funnel, Sequence, Analytics)
 * - Tools: Supporting functions (Activities, Notes, Documents, History)
 */
export function CampaignEntitySidebar({
  campaignId,
  campaignName,
  campaignSubtitle,
  campaignStatus,
  counts = {},
  className,
}: CampaignEntitySidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get collapsed state from context
  const sidebarContext = useSidebarUIContextSafe()
  const isCollapsed = sidebarContext?.isCollapsed ?? false

  // ONE DB CALL pattern: Get full entity data from navigation context
  const { currentEntityData } = useEntityNavigation()
  const campaign = currentEntityData as { sections?: { prospects?: { total: number }, leads?: { total: number }, activities?: { total: number }, notes?: { total: number }, documents?: { total: number } } } | null
  const isLoading = !campaign

  // Extract counts from the full entity's sections data
  const sectionCounts = {
    prospects: counts.prospects ?? campaign?.sections?.prospects?.total,
    leads: counts.leads ?? campaign?.sections?.leads?.total,
    activities: counts.activities ?? campaign?.sections?.activities?.total,
    notes: counts.notes ?? campaign?.sections?.notes?.total,
    documents: counts.documents ?? campaign?.sections?.documents?.total,
  }

  // Current section from URL
  const currentSection = searchParams.get('section') || 'overview'

  // Collapsible section states
  const [coreExpanded, setCoreExpanded] = useState(true)
  const [relatedExpanded, setRelatedExpanded] = useState(true)
  const [toolsExpanded, setToolsExpanded] = useState(true)

  // Get section configs
  const { coreSections, relatedSections, toolSections } = getCampaignSectionsByGroup()

  // Handle section navigation
  const handleSectionClick = (sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', sectionId)
    // Clean up legacy params
    params.delete('mode')
    params.delete('step')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Show loading state while fetching campaign
  if (isLoading) {
    return (
      <aside
        className={cn(
          'w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0 h-full items-center justify-center',
          className
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </aside>
    )
  }

  // Get count for a section from server-fetched data
  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'prospects':
        return sectionCounts.prospects
      case 'leads':
        return sectionCounts.leads
      case 'activities':
        return sectionCounts.activities
      case 'notes':
        return sectionCounts.notes
      case 'documents':
        return sectionCounts.documents
      default:
        return undefined
    }
  }

  // Quick actions based on campaign status
  const getQuickActions = (): ActionItem[] => {
    const actions: ActionItem[] = []

    // Status-based actions
    if (campaignStatus === 'draft' || campaignStatus === 'scheduled') {
      actions.push({ id: 'start', label: 'Start Campaign', icon: Play, description: 'Launch campaign now' })
    }
    if (campaignStatus === 'active') {
      actions.push({ id: 'pause', label: 'Pause Campaign', icon: Pause, description: 'Temporarily pause campaign' })
    }
    if (campaignStatus === 'paused') {
      actions.push({ id: 'resume', label: 'Resume Campaign', icon: Play, description: 'Resume paused campaign' })
    }

    // Common actions
    actions.push({ id: 'duplicate', label: 'Duplicate', icon: Copy, description: 'Create a copy of this campaign' })
    actions.push({ id: 'viewAnalytics', label: 'View Analytics', icon: BarChart3, description: 'View campaign analytics', separator: true })
    actions.push({ id: 'addProspect', label: 'Add Prospect', icon: UserPlus, description: 'Add a prospect to campaign' })
    actions.push({ id: 'importProspects', label: 'Import Prospects', icon: Upload, description: 'Import prospects from file' })
    actions.push({ id: 'logActivity', label: 'Log Activity', icon: StickyNote, description: 'Log an activity', separator: true })
    actions.push({ id: 'uploadDocument', label: 'Upload Document', icon: FileText, description: 'Upload a document' })

    // Terminal action
    if (campaignStatus !== 'completed' && campaignStatus !== 'cancelled') {
      actions.push({ id: 'complete', label: 'Complete Campaign', icon: CheckCircle, description: 'Mark campaign as completed', variant: 'destructive', separator: true })
    }

    return actions
  }

  const handleQuickAction = (actionId: string) => {
    window.dispatchEvent(
      new CustomEvent('openCampaignDialog', {
        detail: { dialogId: actionId, campaignId },
      })
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col flex-1 min-h-0 overflow-hidden h-full', className)}>
        {/* ===== BACK + ACTIONS ROW ===== */}
        <div className="px-3 py-2.5 border-b border-charcoal-100 flex items-center justify-between gap-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/employee/crm/campaigns"
                  className="inline-flex items-center justify-center w-9 h-9 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-charcoal-900 text-white">
                <p>All Campaigns</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/employee/crm/campaigns"
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>All Campaigns</span>
            </Link>
          )}

          {/* Quick Actions Dropdown */}
          {!isCollapsed && (
            <SidebarActionsPopover
              actions={getQuickActions()}
              onAction={handleQuickAction}
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
                      {campaignName.substring(0, 2).toUpperCase()}
                    </div>
                    <StatusBadgeDot status={campaignStatus} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-800 text-white border-charcoal-700">
                  <div>
                    <p className="font-semibold">{campaignName}</p>
                    {campaignSubtitle && <p className="text-xs text-charcoal-300">{campaignSubtitle}</p>}
                    <p className="text-xs text-charcoal-400 mt-1 capitalize">{campaignStatus.replace(/_/g, ' ')}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="px-4 py-4">
              {/* Entity Type + Status Row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-500">
                  Campaign
                </span>
                <StatusBadgeDark status={campaignStatus} />
              </div>
              {/* Entity Name */}
              <h2 className="font-heading font-bold text-white text-lg truncate leading-tight">
                {campaignName}
              </h2>
              {/* Subtitle */}
              {campaignSubtitle && (
                <p className="text-sm text-charcoal-400 truncate mt-1">{campaignSubtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* ===== SECTIONS NAVIGATION ===== */}
        <div className="flex-1 overflow-y-auto">
          {/* Core Sections (Collapsible) */}
          <nav className="p-4 border-b border-charcoal-100">
            {!isCollapsed ? (
              <button
                onClick={() => setCoreExpanded(!coreExpanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-3 hover:text-charcoal-900 transition-colors"
              >
                <span>Core</span>
                {coreExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : null}
            {(coreExpanded || isCollapsed) && (
              <SectionList
                sections={coreSections}
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
                getSectionCount={getSectionCount}
                isCollapsed={isCollapsed}
              />
            )}
          </nav>

          {/* Related Sections (Collapsible) */}
          <nav className="p-4 border-b border-charcoal-100">
            {!isCollapsed ? (
              <button
                onClick={() => setRelatedExpanded(!relatedExpanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-3 hover:text-charcoal-900 transition-colors"
              >
                <span>Related</span>
                {relatedExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : null}
            {(relatedExpanded || isCollapsed) && (
              <SectionList
                sections={relatedSections}
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
                getSectionCount={getSectionCount}
                isCollapsed={isCollapsed}
              />
            )}
          </nav>

          {/* Tools Sections (Collapsible) */}
          <nav className="p-4">
            {!isCollapsed ? (
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="w-full flex items-center justify-between text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-3 hover:text-charcoal-900 transition-colors"
              >
                <span>Tools</span>
                {toolsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : null}
            {(toolsExpanded || isCollapsed) && (
              <SectionList
                sections={toolSections}
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
                getSectionCount={getSectionCount}
                isCollapsed={isCollapsed}
              />
            )}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * SectionList - Renders a list of section navigation items
 */
interface SectionListProps {
  sections: SectionDefinition[]
  currentSection: string
  onSectionClick: (sectionId: string) => void
  getSectionCount: (sectionId: string) => number | undefined
  isCollapsed?: boolean
}

function SectionList({
  sections,
  currentSection,
  onSectionClick,
  getSectionCount,
  isCollapsed = false,
}: SectionListProps) {
  return (
    <ul className="space-y-1">
      {sections.map((section) => {
        const SectionIcon = section.icon
        const isActive = currentSection === section.id
        const count = section.showCount ? getSectionCount(section.id) : undefined

        if (isCollapsed) {
          return (
            <li key={section.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                      'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-charcoal-900 text-white'
                        : 'text-charcoal-600 hover:bg-charcoal-100'
                    )}
                  >
                    <SectionIcon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-900 text-white">
                  <p>{section.label}</p>
                  {count !== undefined && count > 0 && (
                    <span className="text-xs text-charcoal-400 ml-1">({count})</span>
                  )}
                </TooltipContent>
              </Tooltip>
            </li>
          )
        }

        return (
          <li key={section.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
                    isActive
                      ? 'bg-charcoal-900 text-white'
                      : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-800'
                  )}
                >
                  <SectionIcon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-charcoal-500'
                    )}
                  />
                  <span className="flex-1 truncate text-sm">{section.label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={cn(
                        'text-xs tabular-nums transition-colors',
                        isActive ? 'text-charcoal-400' : 'text-charcoal-400'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {section.description && (
                <TooltipContent side="right">
                  <p>{section.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}

// ============================================================================
// STATUS BADGES
// ============================================================================

function StatusBadgeDark({ status }: { status: string }) {
  const config = getStatusConfigDark(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  )
}

function StatusBadgeDot({ status }: { status: string }) {
  const config = getStatusConfigDark(status)
  return <div className={cn('w-2.5 h-2.5 rounded-full', config.dot)} />
}

function getStatusConfigDark(status: string): {
  bg: string
  text: string
  dot: string
  border: string
} {
  const configs: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    // Success states
    active: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    // Warning states
    paused: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
    // Info/Blue states
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    // Error states
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
    // Neutral states
    draft: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
  }
  return configs[status] || { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' }
}

export default CampaignEntitySidebar
