'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSidebarUI } from '@/stores/sidebar-ui-store'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarToggleButton() {
  const state = useSidebarUI((store) => store.state)
  const toggleCollapsed = useSidebarUI((store) => store.toggleCollapsed)
  const isCollapsed = state.mode === 'collapsed'

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleCollapsed}
            className={cn(
              'absolute top-3 right-3 z-50',
              'w-7 h-7 rounded-md',
              'flex items-center justify-center',
              'bg-white border-2 border-charcoal-300 shadow-sm',
              'hover:bg-gold-50 hover:border-gold-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
              'group'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight
                className={cn(
                  'w-4 h-4 text-charcoal-600',
                  'group-hover:text-gold-600',
                  'transition-colors duration-200'
                )}
              />
            ) : (
              <ChevronLeft
                className={cn(
                  'w-4 h-4 text-charcoal-600',
                  'group-hover:text-gold-600',
                  'transition-colors duration-200'
                )}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-charcoal-900 text-white">
          <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

