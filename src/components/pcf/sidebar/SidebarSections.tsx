'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { SidebarSectionConfig } from './types'

interface SidebarSectionsProps {
  sections: SidebarSectionConfig[]
  currentSection: string
  basePath: string
  entityId: string
  counts?: Record<string, number>
  className?: string
}

export function SidebarSections({
  sections,
  currentSection,
  basePath,
  entityId,
  counts = {},
  className,
}: SidebarSectionsProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(true)

  // Split sections into main and tools
  const mainSections = sections.filter((s) => !s.isToolSection)
  const toolSections = sections.filter((s) => s.isToolSection)

  const buildHref = (sectionId: string) => {
    const defaultSection = mainSections[0]?.id
    if (sectionId === defaultSection) {
      return `${basePath}/${entityId}`
    }
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  const renderSection = (section: SidebarSectionConfig) => {
    const Icon = section.icon
    const isActive = section.id === currentSection
    const count = counts[section.id]

    return (
      <Link
        key={section.id}
        href={buildHref(section.id)}
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
        <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
          {section.label}
        </span>
        {section.showCount && count !== undefined && (
          <Badge
            variant="secondary"
            className={cn(
              'min-w-[22px] h-5 text-xs tabular-nums justify-center',
              isActive
                ? 'bg-gold-100 text-gold-700'
                : section.alertOnCount && count > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-charcoal-100 text-charcoal-600'
            )}
          >
            {count}
          </Badge>
        )}
        {isActive && <ChevronRight className="w-4 h-4 text-gold-400" />}
      </Link>
    )
  }

  return (
    <nav className={cn('flex-1 overflow-y-auto', className)}>
      {/* Main Sections */}
      <div className="p-3">
        <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
          Sections
        </div>
        <ul className="space-y-0.5">
          {mainSections.map((section) => (
            <li key={section.id}>{renderSection(section)}</li>
          ))}
        </ul>
      </div>

      {/* Tool Sections - Collapsible */}
      {toolSections.length > 0 && (
        <Collapsible
          open={isToolsOpen}
          onOpenChange={setIsToolsOpen}
          className="border-t border-charcoal-100 pt-2 px-3 pb-3"
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
              {toolSections.map((section) => (
                <li key={section.id}>{renderSection(section)}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  )
}

