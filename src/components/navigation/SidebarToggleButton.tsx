'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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

  // Collapsed state: small icon button at bottom
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCollapsed}
              className={cn(
                'absolute bottom-4 left-1/2 -translate-x-1/2 z-50',
                'w-10 h-10 rounded-lg',
                'flex items-center justify-center',
                'bg-charcoal-900 text-white shadow-lg',
                'hover:bg-gold-600',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                'group'
              )}
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-charcoal-900 text-white">
            <p>Expand sidebar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Expanded state: full-width button at bottom with text
  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-charcoal-100 bg-white z-50">
      <button
        onClick={toggleCollapsed}
        className={cn(
          'w-full h-10 rounded-lg',
          'flex items-center justify-center gap-2',
          'bg-charcoal-900 text-white font-medium text-sm',
          'hover:bg-gold-600',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
          'group'
        )}
        aria-label="Collapse sidebar"
        aria-expanded={true}
      >
        <PanelLeftClose className="w-4 h-4" />
        <span>Collapse</span>
      </button>
    </div>
  )
}

