'use client'

import React, { useState } from 'react'
import { BrainCircuit, ChevronDown } from 'lucide-react'
import type { ActivateBlock } from '@/lib/academy/types'

interface ActivateCardProps {
  block: ActivateBlock
}

export function ActivateCard({ block }: ActivateCardProps) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="m-activate-card m-animate" id={`block-${block.id}`}>
      <div className="m-activate-badge">
        <BrainCircuit className="w-4 h-4" />
        <span>Activate Prior Knowledge</span>
      </div>
      <p className="m-activate-prior">{block.priorKnowledge}</p>
      <div className="m-activate-question">
        <p className="m-activate-question-text">{block.warmupQuestion}</p>
        {block.hint && (
          <button
            className="m-activate-hint-toggle"
            onClick={() => setShowHint(!showHint)}
          >
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: showHint ? 'rotate(180deg)' : undefined }}
            />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && block.hint && (
          <p className="m-activate-hint">{block.hint}</p>
        )}
      </div>
    </div>
  )
}
