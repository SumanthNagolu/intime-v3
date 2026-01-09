'use client'

import * as React from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  defaultOpen?: boolean
  actions?: React.ReactNode
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string
  headerClassName?: string
  contentClassName?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  actions,
  badge,
  badgeVariant = 'secondary',
  className,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        'group/section rounded-xl bg-white border border-charcoal-100/80 shadow-sm',
        'hover:shadow-md hover:border-charcoal-200/80 transition-all duration-300',
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-3 w-full px-5 py-4 cursor-pointer select-none',
            'transition-colors duration-200',
            isOpen ? 'border-b border-charcoal-100/60' : '',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {Icon && (
              <div className="p-2 rounded-lg bg-charcoal-50 ring-1 ring-charcoal-100/50">
                <Icon className="w-4 h-4 text-charcoal-600" />
              </div>
            )}
            <span className="font-semibold text-charcoal-900 tracking-tight">{title}</span>
            {badge !== undefined && (
              <Badge
                variant={badgeVariant}
                className="ml-1 font-medium text-xs px-2 py-0.5 bg-charcoal-100 text-charcoal-600 border-0"
              >
                {badge}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions && (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {actions}
              </div>
            )}
            <div className={cn(
              'p-1.5 rounded-md transition-all duration-300',
              'hover:bg-charcoal-100',
              isOpen ? '' : '-rotate-90'
            )}>
              <ChevronDown className="w-4 h-4 text-charcoal-400" />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className={cn('px-5 py-5', contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
