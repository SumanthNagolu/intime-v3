'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface GWTab {
  id: string
  label: string
  badge?: number | string
  disabled?: boolean
}

interface GWTabsProps {
  tabs: GWTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/**
 * GWTabs - Guidewire-style horizontal tabs with underline indicator
 * 
 * Features:
 * - Horizontal tab bar above content
 * - Underline style active indicator (not pill style)
 * - Optional badge counts
 * - Follows Hublot design system
 */
export function GWTabs({ tabs, activeTab, onTabChange, className }: GWTabsProps) {
  return (
    <div className={cn('border-b border-charcoal-200', className)}>
      <nav className="flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'relative py-3 px-1 text-sm font-medium transition-colors duration-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
                isActive
                  ? 'text-charcoal-900'
                  : 'text-charcoal-500 hover:text-charcoal-700',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge !== undefined && (
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={cn(
                      'text-xs px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center',
                      isActive ? 'bg-gold-500 text-white' : 'bg-charcoal-100 text-charcoal-600'
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </span>
              {/* Active underline indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 transition-all duration-300"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

interface GWTabContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Container for tab content with standard padding
 */
export function GWTabContent({ children, className }: GWTabContentProps) {
  return (
    <div className={cn('pt-4', className)}>
      {children}
    </div>
  )
}

interface GWTabPanelProps {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

/**
 * Individual tab panel that shows/hides based on active tab
 */
export function GWTabPanel({ id, activeTab, children, className }: GWTabPanelProps) {
  if (id !== activeTab) return null
  
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cn('animate-in fade-in duration-300', className)}
    >
      {children}
    </div>
  )
}

export type { GWTab, GWTabsProps }






