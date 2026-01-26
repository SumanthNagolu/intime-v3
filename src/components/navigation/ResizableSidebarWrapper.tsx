'use client'

import { ReactNode, useEffect } from 'react'
import { useSidebarUI, COLLAPSED_WIDTH } from '@/stores/sidebar-ui-store'
import { SidebarUIProvider } from '@/lib/contexts/SidebarUIContext'
import { SidebarResizeHandle } from './SidebarResizeHandle'
import { SidebarToggleButton } from './SidebarToggleButton'
import { cn } from '@/lib/utils'

interface ResizableSidebarWrapperProps {
  readonly children: ReactNode
  readonly className?: string
}

export function ResizableSidebarWrapper({ children, className }: ResizableSidebarWrapperProps) {
  const state = useSidebarUI((store) => store.state)
  const toggleCollapsed = useSidebarUI((store) => store.toggleCollapsed)
  
  // Compute derived values from state
  const isCollapsed = state.mode === 'collapsed'
  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : state.width

  // Keyboard shortcut: Ctrl/Cmd + B to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+B (Windows/Linux) or Cmd+B (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleCollapsed()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleCollapsed])

  return (
    <SidebarUIProvider isCollapsed={isCollapsed}>
      <aside
        style={{ width: currentWidth }}
        className={cn(
          'relative bg-white border-r border-charcoal-100 flex-shrink-0',
          'transition-all duration-200 ease-in-out',
          'hidden lg:flex lg:flex-col',
          className
        )}
        aria-label="Sidebar navigation"
      >
        {/* Toggle Button - Always visible */}
        <SidebarToggleButton />

        {/* Sidebar Content - with bottom padding for collapse button */}
        <div className="flex-1 flex flex-col min-h-0 pb-16">
          {children}
        </div>

        {/* Resize Handle (only visible when expanded) */}
        {!isCollapsed && <SidebarResizeHandle />}
      </aside>
    </SidebarUIProvider>
  )
}

