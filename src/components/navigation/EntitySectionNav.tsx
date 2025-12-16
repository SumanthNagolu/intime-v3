'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, ChevronDown, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { SectionDefinition, getSectionsByGroup } from '@/lib/navigation/entity-sections'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface EntitySectionNavProps {
  /** Entity type for fetching sections config */
  entityType: string
  /** Entity ID for building URLs */
  entityId: string
  /** Base path for the entity (e.g., /employee/crm/campaigns) */
  basePath: string
  /** Current section from URL (defaults to first main section) */
  currentSection?: string
  /** Section counts map: sectionId -> count */
  counts?: Record<string, number | undefined>
  /** Custom sections override (if not using entity type config) */
  sections?: SectionDefinition[]
  /** Whether Tools section should be initially expanded */
  toolsExpanded?: boolean
  className?: string
}

/**
 * Shared section navigation component for Guidewire-style sidebars
 * Renders main sections + collapsible Tools section
 */
export function EntitySectionNav({
  entityType,
  entityId,
  basePath,
  currentSection,
  counts = {},
  sections: customSections,
  toolsExpanded = true,
  className,
}: EntitySectionNavProps) {
  const searchParams = useSearchParams()
  const [isToolsOpen, setIsToolsOpen] = useState(toolsExpanded)

  // Get sections from config or use custom
  const { mainSections, toolSections } = customSections
    ? {
        mainSections: customSections.filter(s => !s.isToolSection),
        toolSections: customSections.filter(s => s.isToolSection),
      }
    : getSectionsByGroup(entityType)

  // Determine current section from URL or default to first main section
  const activeSection = currentSection 
    || searchParams.get('section') 
    || mainSections[0]?.id 
    || 'overview'

  // Build section href
  const buildSectionHref = (sectionId: string) => {
    // First section (overview/dashboard) doesn't need section param
    if (sectionId === mainSections[0]?.id) {
      return `${basePath}/${entityId}`
    }
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  // Render a single section item
  const renderSectionItem = (section: SectionDefinition, isInTools = false) => {
    const Icon = section.icon
    const isActive = activeSection === section.id
    const count = counts[section.id]
    const hasAlert = section.alertOnCount && count && count > 0

    return (
      <li key={section.id}>
        <Link
          href={buildSectionHref(section.id)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
            isActive
              ? 'bg-gold-50 text-gold-700'
              : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800',
            isInTools && 'py-1.5 text-sm'
          )}
        >
          <Icon
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-colors',
              isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
            )}
          />
          <span
            className={cn(
              'flex-1',
              isActive && 'font-medium',
              isInTools && 'text-sm'
            )}
          >
            {section.label}
          </span>
          {section.showCount && count !== undefined && (
            <Badge
              variant="secondary"
              className={cn(
                'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                isActive
                  ? 'bg-gold-100 text-gold-700'
                  : hasAlert
                    ? 'bg-red-100 text-red-700'
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
      </li>
    )
  }

  return (
    <nav className={cn('flex flex-col', className)}>
      {/* Main Sections */}
      <div className="px-3 mb-1">
        <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
          Sections
        </div>
        <ul className="space-y-0.5">
          {mainSections.map(section => renderSectionItem(section))}
        </ul>
      </div>

      {/* Tools Section - Collapsible */}
      {toolSections.length > 0 && (
        <Collapsible
          open={isToolsOpen}
          onOpenChange={setIsToolsOpen}
          className="mt-3 border-t border-charcoal-100 pt-3 px-3"
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-charcoal-400 uppercase tracking-wider hover:text-charcoal-600 transition-colors">
            {isToolsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            <ul className="space-y-0.5">
              {toolSections.map(section => renderSectionItem(section, true))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  )
}

/**
 * Minimal section nav for compact sidebars
 * Just renders a flat list without Tools grouping
 */
export function EntitySectionNavFlat({
  sections,
  entityId,
  basePath,
  currentSection,
  counts = {},
  className,
}: {
  sections: SectionDefinition[]
  entityId: string
  basePath: string
  currentSection?: string
  counts?: Record<string, number | undefined>
  className?: string
}) {
  const searchParams = useSearchParams()
  const activeSection = currentSection || searchParams.get('section') || sections[0]?.id || 'overview'

  const buildSectionHref = (sectionId: string) => {
    if (sectionId === sections[0]?.id) {
      return `${basePath}/${entityId}`
    }
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  return (
    <nav className={cn('px-3', className)}>
      <ul className="space-y-0.5">
        {sections.map(section => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const count = counts[section.id]
          const hasAlert = section.alertOnCount && count && count > 0

          return (
            <li key={section.id}>
              <Link
                href={buildSectionHref(section.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
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
                <span className={cn('flex-1', isActive && 'font-medium')}>
                  {section.label}
                </span>
                {section.showCount && count !== undefined && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                      isActive
                        ? 'bg-gold-100 text-gold-700'
                        : hasAlert
                          ? 'bg-red-100 text-red-700'
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
            </li>
          )
        })}
      </ul>
    </nav>
  )
}






