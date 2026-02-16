'use client'

import React from 'react'
import {
  Lightbulb,
  AlertTriangle,
  Star,
  AlertOctagon,
  BookOpen,
} from 'lucide-react'
import type { Callout } from '@/lib/academy/types'

const CALLOUT_CONFIG = {
  tip: { icon: Lightbulb, className: 'm-callout-tip', label: 'Tip' },
  warning: { icon: AlertTriangle, className: 'm-callout-warning', label: 'Warning' },
  best_practice: { icon: Star, className: 'm-callout-best-practice', label: 'Best Practice' },
  gotcha: { icon: AlertOctagon, className: 'm-callout-gotcha', label: 'Watch Out' },
  definition: { icon: BookOpen, className: 'm-callout-definition', label: 'Definition' },
} as const

interface CalloutBoxProps {
  callout: Callout
}

export function CalloutBox({ callout }: CalloutBoxProps) {
  const config = CALLOUT_CONFIG[callout.type]
  const Icon = config.icon

  return (
    <div className={`m-callout ${config.className}`}>
      <div className="m-callout-header">
        <Icon className="w-4 h-4" />
        <span className="m-callout-label">{callout.title || config.label}</span>
      </div>
      <p className="m-callout-content">{callout.content}</p>
    </div>
  )
}
