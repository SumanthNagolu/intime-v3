'use client'

/**
 * Ashby-style App Layout
 *
 * Light mode, data-dense layout with collapsible sidebar.
 */

import { type ReactNode, createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
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

export function AppLayout({ children, className }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const mobileSidebarValue: MobileSidebarContextValue = {
    isOpen: isMobileSidebarOpen,
    open: useCallback(() => setIsMobileSidebarOpen(true), []),
    close: useCallback(() => setIsMobileSidebarOpen(false), []),
    toggle: useCallback(() => setIsMobileSidebarOpen(prev => !prev), []),
  }

  return (
    <MobileSidebarContext.Provider value={mobileSidebarValue}>
      <div className={cn('ashby-app', className)}>
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 bg-[var(--ashby-bg)] border-b border-[var(--ashby-border)] md:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-[var(--ashby-text-secondary)] hover:text-[var(--ashby-text-primary)] hover:bg-[var(--ashby-bg-hover)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--ashby-accent)] flex items-center justify-center text-white font-bold text-xs">
              I
            </div>
            <span className="text-lg font-semibold">InTime</span>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:transform-none',
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="ashby-main pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </MobileSidebarContext.Provider>
  )
}

export default AppLayout
