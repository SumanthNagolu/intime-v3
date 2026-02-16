'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'
import type { HookBlock } from '@/lib/academy/types'

interface HookCardProps {
  block: HookBlock
}

export function HookCard({ block }: HookCardProps) {
  return (
    <div className="m-hook-card m-animate" id={`block-${block.id}`}>
      <div className="m-hook-badge">
        <Lightbulb className="w-4 h-4" />
        <span>Why This Matters</span>
      </div>
      <p className="m-hook-scenario">{block.scenario}</p>
      <div className="m-hook-question">
        <span className="m-hook-question-mark">?</span>
        <p>{block.question}</p>
      </div>
    </div>
  )
}
