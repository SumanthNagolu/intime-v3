'use client'

import { Lightbulb, AlertTriangle, AlertCircle, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalloutBlock, CalloutVariant } from '@/lib/academy/implementation-blocks'

const VARIANT_STYLES: Record<CalloutVariant, {
  icon: React.ElementType
  bg: string
  border: string
  accentBorder: string
  iconColor: string
  titleColor: string
}> = {
  tip: {
    icon: Lightbulb,
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/60',
    accentBorder: 'border-l-blue-400',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/60',
    accentBorder: 'border-l-amber-400',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
  },
  important: {
    icon: AlertCircle,
    bg: 'bg-red-50/70',
    border: 'border-red-200/60',
    accentBorder: 'border-l-red-400',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
  },
  gotcha: {
    icon: Bug,
    bg: 'bg-purple-50/70',
    border: 'border-purple-200/60',
    accentBorder: 'border-l-purple-400',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-800',
  },
}

interface CalloutBlockViewProps {
  block: CalloutBlock
}

export function CalloutBlockView({ block }: CalloutBlockViewProps) {
  if (!block.content && !block.title) return null

  const style = VARIANT_STYLES[block.variant]
  const Icon = style.icon

  return (
    <div className={cn(
      'rounded-lg border border-l-[3px] px-4 py-3 flex gap-3',
      style.bg, style.border, style.accentBorder
    )}>
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', style.iconColor)} />
      <div className="flex-1 min-w-0">
        {block.title && (
          <p className={cn('text-[13px] font-semibold mb-0.5', style.titleColor)}>
            {block.title}
          </p>
        )}
        <p className="text-[13px] text-charcoal-700 leading-[1.7] whitespace-pre-wrap">
          {block.content}
        </p>
      </div>
    </div>
  )
}
