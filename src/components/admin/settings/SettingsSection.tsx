'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  action,
}: SettingsSectionProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-charcoal-100 shadow-elevation-xs', className)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-charcoal-50 rounded-lg">
                <Icon className="h-5 w-5 text-charcoal-600" />
              </div>
            )}
            <div>
              <h3 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
