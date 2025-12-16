'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TabItem {
  label: string
  href: string
  icon?: LucideIcon
}

export interface TabGroup {
  title?: string
  items: TabItem[]
}

interface HorizontalTabsLayoutProps {
  children: React.ReactNode
  /** Single row of tabs */
  tabs?: TabItem[]
  /** Multiple rows of grouped tabs */
  groups?: TabGroup[]
  /** Page title displayed above tabs */
  title?: string
  /** Optional description below title */
  description?: string
  className?: string
}

export function HorizontalTabsLayout({
  children,
  tabs,
  groups,
  title,
  description,
  className,
}: HorizontalTabsLayoutProps) {
  const pathname = usePathname()

  // Determine if we're using simple tabs or grouped tabs
  const tabGroups: TabGroup[] = groups || (tabs ? [{ items: tabs }] : [])

  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      {/* Sticky header with title and tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-charcoal-100 shadow-sm">
        {/* Title section */}
        {(title || description) && (
          <div className="px-6 lg:px-8 pt-4 pb-2">
            {title && (
              <h1 className="text-xl font-heading font-semibold text-charcoal-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-charcoal-500">{description}</p>
            )}
          </div>
        )}

        {/* Tab navigation */}
        <div className="px-6 lg:px-8">
          {tabGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-1">
              {/* Group title */}
              {group.title && (
                <span className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mr-4 min-w-[80px]">
                  {group.title}
                </span>
              )}
              
              {/* Tab items */}
              <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
                {group.items.map((tab) => {
                  const isActive = pathname === tab.href
                  const Icon = tab.icon

                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
                        isActive
                          ? 'border-gold-500 text-gold-600'
                          : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-200'
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {tab.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-cream">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}






