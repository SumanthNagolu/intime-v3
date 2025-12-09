'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChevronDown,
  ChevronRight,
  Map,
  LayoutGrid,
  Check,
  Circle,
  LucideIcon,
} from 'lucide-react'
import { getCampaignSectionsByGroup, SectionDefinition } from '@/lib/navigation/entity-sections'
import { getEntityJourney, getVisibleQuickActions, getCurrentStepIndex } from '@/lib/navigation/entity-journeys'
import { Campaign } from '@/configs/entities/campaigns.config'

type NavigationMode = 'journey' | 'sections'

interface CampaignEntitySidebarProps {
  campaign: Campaign
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
 * CampaignEntitySidebar - Enterprise-grade sidebar with dual navigation modes
 *
 * Journey Mode: Sequential workflow execution (Setup → Audience → Execute → Nurture → Close)
 * Sections Mode: Information-centric navigation (Overview, Prospects, Leads, Funnel, etc.)
 *
 * Features:
 * - Mode toggle with smooth transitions
 * - Journey progress indicator
 * - Section groups (Main, Automation, Tools)
 * - Context-aware quick actions
 * - Section counts with badges
 */
export function CampaignEntitySidebar({
  campaign,
  counts = {},
  className,
}: CampaignEntitySidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Navigation mode from URL or default to sections
  const urlMode = searchParams.get('mode') as NavigationMode | null
  const [mode, setMode] = useState<NavigationMode>(urlMode || 'sections')

  // Current section/step from URL
  const currentSection = searchParams.get('section') || 'overview'
  const currentStep = searchParams.get('step') || 'setup'

  // Tools section collapsed state
  const [toolsExpanded, setToolsExpanded] = useState(true)

  // Get journey and section configs
  const journeyConfig = getEntityJourney('campaign')
  const { mainSections, automationSections, toolSections } = getCampaignSectionsByGroup()

  // Get current journey step index
  const currentStepIndex = getCurrentStepIndex('campaign', campaign.status)

  // Get visible quick actions based on status
  const quickActions = getVisibleQuickActions('campaign', campaign.status)

  // Calculate journey progress percentage
  const progressPercentage = Math.round(((currentStepIndex + 1) / journeyConfig.steps.length) * 100)

  // Handle mode change
  const handleModeChange = (newMode: NavigationMode) => {
    setMode(newMode)
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', newMode)

    // Reset to appropriate default
    if (newMode === 'journey') {
      params.delete('section')
      params.set('step', journeyConfig.steps[currentStepIndex]?.id || 'setup')
    } else {
      params.delete('step')
      params.set('section', 'overview')
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Handle section navigation
  const handleSectionClick = (sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', 'sections')
    params.set('section', sectionId)
    params.delete('step')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Handle journey step navigation
  const handleStepClick = (stepId: string, stepIndex: number) => {
    // Only allow navigation to completed or current steps
    if (stepIndex > currentStepIndex) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', 'journey')
    params.set('step', stepId)
    params.delete('section')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Handle quick action click
  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.actionType === 'navigate' && action.href) {
      const href = action.href.replace(':id', campaign.id)
      router.push(href)
    } else if (action.actionType === 'dialog' && action.dialogId) {
      window.dispatchEvent(
        new CustomEvent('openCampaignDialog', {
          detail: { dialogId: action.dialogId, campaignId: campaign.id },
        })
      )
    } else if (action.actionType === 'mutation') {
      // Handle direct mutations (start, pause, resume)
      window.dispatchEvent(
        new CustomEvent('openCampaignDialog', {
          detail: { dialogId: action.id, campaignId: campaign.id },
        })
      )
    }
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'prospects':
        return counts.prospects
      case 'leads':
        return counts.leads
      case 'activities':
        return counts.activities
      case 'notes':
        return counts.notes
      case 'documents':
        return counts.documents
      default:
        return undefined
    }
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0 h-full',
          className
        )}
      >
        {/* Mode Toggle Header */}
        <div className="p-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-charcoal-900 text-sm uppercase tracking-wide">
              Campaign
            </h2>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex gap-1 p-1 bg-charcoal-100 rounded-lg">
            <button
              onClick={() => handleModeChange('journey')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                mode === 'journey'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              )}
            >
              <Map className="w-3.5 h-3.5" />
              Journey
            </button>
            <button
              onClick={() => handleModeChange('sections')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                mode === 'sections'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Sections
            </button>
          </div>
        </div>

        {/* Journey Mode Navigation */}
        {mode === 'journey' && (
          <div className="flex-1 overflow-y-auto">
            {/* Progress Indicator */}
            <div className="p-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-xs font-bold text-gold-600">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Journey Steps */}
            <nav className="p-4">
              <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
                Journey Steps
              </h3>
              <div className="relative">
                {/* Vertical line connecting steps */}
                <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-charcoal-200" />

                <ul className="space-y-1 relative">
                  {journeyConfig.steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isFuture = index > currentStepIndex
                    const isActive = currentStep === step.id && mode === 'journey'

                    return (
                      <li key={step.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleStepClick(step.id, index)}
                              disabled={isFuture}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left',
                                isActive && 'bg-gold-50',
                                isCurrent && !isActive && 'bg-charcoal-50',
                                isFuture && 'opacity-50 cursor-not-allowed',
                                !isFuture && !isActive && 'hover:bg-charcoal-50'
                              )}
                            >
                              {/* Step indicator */}
                              <div
                                className={cn(
                                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                                  isCompleted && 'bg-green-500 text-white',
                                  isCurrent && 'bg-gold-500 text-white ring-4 ring-gold-100',
                                  isFuture && 'bg-charcoal-200 text-charcoal-400'
                                )}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-bold">{index + 1}</span>
                                )}
                              </div>

                              {/* Step label */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    isActive && 'text-gold-700',
                                    isCurrent && !isActive && 'text-charcoal-900',
                                    isCompleted && 'text-charcoal-700',
                                    isFuture && 'text-charcoal-400'
                                  )}
                                >
                                  {step.label}
                                </p>
                                <p className="text-xs text-charcoal-500 truncate">
                                  {step.description}
                                </p>
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="font-medium">{step.label}</p>
                            <p className="text-xs text-charcoal-400">{step.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
          </div>
        )}

        {/* Sections Mode Navigation */}
        {mode === 'sections' && (
          <div className="flex-1 overflow-y-auto">
            {/* Main Sections */}
            <nav className="p-4 border-b border-charcoal-100">
              <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
                Main
              </h3>
              <SectionList
                sections={mainSections}
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
                getSectionCount={getSectionCount}
              />
            </nav>

            {/* Automation Sections */}
            <nav className="p-4 border-b border-charcoal-100">
              <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
                Automation
              </h3>
              <SectionList
                sections={automationSections}
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
                getSectionCount={getSectionCount}
              />
            </nav>

            {/* Tools Sections (Collapsible) */}
            <nav className="p-4">
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3 hover:text-charcoal-700 transition-colors"
              >
                <span>Tools</span>
                {toolsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {toolsExpanded && (
                <SectionList
                  sections={toolSections}
                  currentSection={currentSection}
                  onSectionClick={handleSectionClick}
                  getSectionCount={getSectionCount}
                />
              )}
            </nav>
          </div>
        )}

        {/* Quick Actions (Always visible) */}
        <div className="p-4 border-t border-charcoal-100 bg-charcoal-50/50">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.slice(0, 4).map((action) => {
              const ActionIcon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant === 'default' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => handleQuickAction(action)}
                >
                  <ActionIcon className="w-3.5 h-3.5" />
                  {action.label}
                </Button>
              )
            })}
          </div>
        </div>
      </aside>
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
}

function SectionList({
  sections,
  currentSection,
  onSectionClick,
  getSectionCount,
}: SectionListProps) {
  return (
    <ul className="space-y-1">
      {sections.map((section) => {
        const SectionIcon = section.icon
        const isActive = currentSection === section.id
        const count = section.showCount ? getSectionCount(section.id) : undefined

        return (
          <li key={section.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium'
                      : 'text-charcoal-600 hover:bg-charcoal-50'
                  )}
                >
                  <SectionIcon
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-600'
                    )}
                  />
                  <span className="flex-1 truncate text-sm">{section.label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-xs rounded-full font-medium',
                        isActive
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-600'
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

export default CampaignEntitySidebar
