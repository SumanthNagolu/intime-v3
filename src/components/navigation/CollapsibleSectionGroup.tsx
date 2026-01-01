'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface CollapsibleSectionGroupProps {
  id: string
  label: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSectionGroup({
  id,
  label,
  count,
  defaultOpen = true,
  children,
}: CollapsibleSectionGroupProps) {
  // Session-level persistence using sessionStorage
  const storageKey = `section-group-${id}`

  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen
    const stored = sessionStorage.getItem(storageKey)
    return stored !== null ? stored === 'true' : defaultOpen
  })

  useEffect(() => {
    sessionStorage.setItem(storageKey, String(isOpen))
  }, [isOpen, storageKey])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-charcoal-100">
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 hover:bg-charcoal-50 transition-colors">
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-charcoal-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-charcoal-500" />
        )}
        <span className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto text-xs text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
