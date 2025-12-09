'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkspaceTabConfig } from './types'

interface WorkspaceTabsProps {
  tabs: WorkspaceTabConfig[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function WorkspaceTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: WorkspaceTabsProps) {
  return (
    <div className={cn('border-b border-charcoal-200', className)}>
      <nav className="flex gap-1 -mb-px" aria-label="Workspace tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon
          const badgeValue = tab.badge?.()

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-gold-500 text-gold-700'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-gold-600' : 'text-charcoal-400'
                  )}
                />
              )}
              <span>{tab.label}</span>
              {badgeValue !== undefined && badgeValue > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'min-w-[20px] h-5 px-1.5 text-xs',
                    isActive
                      ? 'bg-gold-100 text-gold-700'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {badgeValue}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

