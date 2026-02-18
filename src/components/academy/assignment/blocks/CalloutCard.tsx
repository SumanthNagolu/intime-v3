'use client'

import React from 'react'
import {
  Lightbulb,
  AlertTriangle,
  Star,
  Sparkles,
  BookOpen,
  AlertCircle,
} from 'lucide-react'
import type { AssignmentCalloutBlock } from '@/lib/academy/types'

interface CalloutCardProps {
  block: AssignmentCalloutBlock
}

const CALLOUT_CONFIG = {
  hint: {
    icon: Lightbulb,
    className: 'm-callout-tip',
  },
  important: {
    icon: AlertCircle,
    className: 'm-callout-warning',
  },
  best_practice: {
    icon: Star,
    className: 'm-callout-best-practice',
  },
  tip: {
    icon: Sparkles,
    className: 'm-callout-tip',
  },
  cookbook_recipe: {
    icon: BookOpen,
    className: 'm-callout-definition',
  },
  warning: {
    icon: AlertTriangle,
    className: 'm-callout-gotcha',
  },
} as const

export function CalloutCard({ block }: CalloutCardProps) {
  const config = CALLOUT_CONFIG[block.variant]
  const Icon = config.icon

  return (
    <div id={`block-${block.id}`} className={`m-callout ${config.className}`}>
      <div className="m-callout-header">
        <Icon className="w-4 h-4" />
        <span className="m-callout-label">{block.title}</span>
      </div>
      <p className="m-callout-content">{block.content}</p>
    </div>
  )
}
