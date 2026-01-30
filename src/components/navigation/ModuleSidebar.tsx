'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { moduleConfigs } from '@/lib/navigation/module-configs'
import { ModuleSidebarConfig, ModuleSectionConfig } from '@/lib/navigation/list-view-sidebar.types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarUIContextSafe } from '@/lib/contexts/SidebarUIContext'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ModuleSidebarProps {
  moduleId: 'admin' | 'hr' | 'finance'
  className?: string
}

export function ModuleSidebar({ moduleId, className }: ModuleSidebarProps) {
  const pathname = usePathname()
  const sidebarContext = useSidebarUIContextSafe()
  const isCollapsed = sidebarContext?.isCollapsed ?? false

  const config = moduleConfigs[moduleId]

  if (!config) {
    return (
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
        <div className="p-4">
          <p className="text-sm text-charcoal-500">Module not found.</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col flex-1 overflow-y-auto', className)}>
        {/* Module Sections */}
        {config.sections.map((section) => (
          <ModuleSection
            key={section.id}
            section={section}
            moduleId={moduleId}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}

interface ModuleSectionProps {
  section: ModuleSectionConfig
  moduleId: string
  pathname: string
  isCollapsed: boolean
}

function ModuleSection({ section, moduleId, pathname, isCollapsed }: ModuleSectionProps) {
  // Persist section open state in sessionStorage
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true)

  useEffect(() => {
    const stored = sessionStorage.getItem(`module-section-${moduleId}-${section.id}`)
    if (stored !== null) {
      setIsOpen(stored === 'true')
    }
  }, [moduleId, section.id])

  const handleToggle = (open: boolean) => {
    setIsOpen(open)
    sessionStorage.setItem(`module-section-${moduleId}-${section.id}`, String(open))
  }

  // Check if any item in this section is active
  const hasActiveItem = section.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

  if (isCollapsed) {
    // In collapsed mode, show only icons for items in open sections
    return (
      <div className="py-2 px-2">
        <div className="space-y-0.5">
          {section.items.slice(0, 4).map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gold-100 text-gold-700'
                        : 'text-charcoal-600 hover:bg-charcoal-50'
                    )}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-charcoal-900 text-white">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <CollapsibleTrigger className={cn(
        'flex items-center gap-2 w-full px-4 py-2.5 text-left transition-all duration-200 hover:bg-charcoal-50/50',
        hasActiveItem && 'bg-charcoal-50/30'
      )}>
        <ChevronRight className={cn(
          'w-3 h-3 text-charcoal-400 transition-transform duration-200 flex-shrink-0',
          isOpen && 'rotate-90'
        )} />
        <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
          {section.label}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <nav className="px-2 pb-2">
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const ItemIcon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm group',
                      isActive
                        ? 'bg-gold-100 text-gold-800 font-medium'
                        : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                    )}
                  >
                    <ItemIcon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-600'
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full',
                        item.badge === 'new'
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-600'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Export for use in layouts
export { moduleConfigs }
