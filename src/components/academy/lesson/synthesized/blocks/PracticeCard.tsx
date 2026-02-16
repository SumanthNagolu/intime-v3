'use client'

import React, { useState } from 'react'
import { FlaskConical, ChevronDown, Eye } from 'lucide-react'
import type { PracticeBlock } from '@/lib/academy/types'

interface PracticeCardProps {
  block: PracticeBlock
}

export function PracticeCard({ block }: PracticeCardProps) {
  const [revealedHints, setRevealedHints] = useState(0)
  const [showApproach, setShowApproach] = useState(false)

  const hints = block.hints ?? []

  return (
    <div className="m-practice-exercise m-animate" id={`block-${block.id}`}>
      <div className="m-practice-exercise-badge">
        <FlaskConical className="w-4 h-4" />
        <span>{block.level === 'guided' ? 'Guided Practice' : 'Independent Practice'}</span>
      </div>

      <div className="m-practice-scenario">{block.scenario}</div>
      <div className="m-practice-question-text">{block.question}</div>

      {/* Progressive hint reveal */}
      {hints.length > 0 && (
        <div className="m-practice-hints">
          {hints.slice(0, revealedHints).map((hint, i) => (
            <div key={i} className="m-practice-hint-item">
              <span className="m-practice-hint-num">Hint {i + 1}</span>
              <span>{hint}</span>
            </div>
          ))}
          {revealedHints < hints.length && (
            <button
              className="m-practice-hint-toggle"
              onClick={() => setRevealedHints(revealedHints + 1)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Show hint {revealedHints + 1} of {hints.length}
            </button>
          )}
        </div>
      )}

      {/* Expected approach reveal */}
      {block.expectedApproach && (
        <div className="m-practice-approach">
          {!showApproach ? (
            <button
              className="m-practice-approach-toggle"
              onClick={() => setShowApproach(true)}
            >
              <Eye className="w-3.5 h-3.5" />
              Reveal expected approach
            </button>
          ) : (
            <div className="m-practice-approach-content">
              <span className="m-practice-approach-label">Expected Approach</span>
              <p>{block.expectedApproach}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
