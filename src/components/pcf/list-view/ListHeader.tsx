'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon, Plus } from 'lucide-react'

interface ListHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  primaryAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }
  secondaryActions?: Array<{
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
    variant?: 'default' | 'outline' | 'ghost'
  }>
}

export function ListHeader({
  title,
  description,
  icon: TitleIcon,
  primaryAction,
  secondaryActions = [],
}: ListHeaderProps) {
  const PrimaryIcon = primaryAction?.icon || Plus

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          {TitleIcon && (
            <div className="p-2 bg-hublot-100 rounded-lg">
              <TitleIcon className="w-6 h-6 text-hublot-900" />
            </div>
          )}
          <h1 className="text-3xl font-heading font-bold text-charcoal-900">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-charcoal-500 mt-1 ml-[52px]">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {secondaryActions.map((action, index) => {
          const ActionIcon = action.icon
          const button = (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )

          return action.href ? (
            <Link key={index} href={action.href}>
              {button}
            </Link>
          ) : (
            button
          )
        })}

        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href}>
              <Button>
                <PrimaryIcon className="w-4 h-4 mr-2" />
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={primaryAction.onClick}>
              <PrimaryIcon className="w-4 h-4 mr-2" />
              {primaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
