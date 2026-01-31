'use client'

/**
 * AppLayout - Main application layout for InTime v4
 *
 * Linear-style layout with sidebar and main content area.
 * Mobile-responsive with slide-out sidebar.
 */

import { type ReactNode, createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { CommandPaletteProvider } from '../command/CommandPalette'
import { ThemeProvider } from '../theme/ThemeProvider'
import { useNavigationShortcuts } from '@/hooks/useKeyboardNavigation'
import { Menu, X } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

// Mobile sidebar context
interface MobileSidebarContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null)

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext)
  if (!context) {
    throw new Error('useMobileSidebar must be used within AppLayout')
  }
  return context
}

function LayoutContent({ children, className }: AppLayoutProps) {
  // Enable global navigation shortcuts (G+J, G+C, etc.)
  useNavigationShortcuts()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const mobileSidebarValue: MobileSidebarContextValue = {
    isOpen: isMobileSidebarOpen,
    open: useCallback(() => setIsMobileSidebarOpen(true), []),
    close: useCallback(() => setIsMobileSidebarOpen(false), []),
    toggle: useCallback(() => setIsMobileSidebarOpen(prev => !prev), []),
  }

  return (
    <MobileSidebarContext.Provider value={mobileSidebarValue}>
      <div
        className={cn(
          'flex h-screen bg-[var(--linear-bg)] text-[var(--linear-text-primary)]',
          className
        )}
      >
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 bg-[var(--linear-bg)] border-b border-[var(--linear-border-subtle)] md:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)] hover:bg-[var(--linear-surface-hover)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-lg font-semibold">InTime</span>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar - hidden on mobile, slide-in when open */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none',
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </MobileSidebarContext.Provider>
  )
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <CommandPaletteProvider>
        <LayoutContent className={className}>{children}</LayoutContent>
      </CommandPaletteProvider>
    </ThemeProvider>
  )
}

export default AppLayout
