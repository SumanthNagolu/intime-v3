'use client'

import { createContext, useContext, ReactNode } from 'react'

interface SidebarUIContextValue {
  readonly isCollapsed: boolean
}

const SidebarUIContext = createContext<SidebarUIContextValue | null>(null)

interface SidebarUIProviderProps {
  readonly isCollapsed: boolean
  readonly children: ReactNode
}

export function SidebarUIProvider({ isCollapsed, children }: SidebarUIProviderProps) {
  return (
    <SidebarUIContext.Provider value={{ isCollapsed }}>
      {children}
    </SidebarUIContext.Provider>
  )
}

export function useSidebarUIContext(): SidebarUIContextValue {
  const context = useContext(SidebarUIContext)
  if (!context) {
    throw new Error('useSidebarUIContext must be used within SidebarUIProvider')
  }
  return context
}

// Safe version that returns null if not in context (for optional usage)
export function useSidebarUIContextSafe(): SidebarUIContextValue | null {
  return useContext(SidebarUIContext)
}

