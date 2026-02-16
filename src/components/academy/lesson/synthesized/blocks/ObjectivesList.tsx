'use client'

import React from 'react'
import { Target, Clock } from 'lucide-react'
import type { ObjectivesBlock } from '@/lib/academy/types'

interface ObjectivesListProps {
  block: ObjectivesBlock
}

export function ObjectivesList({ block }: ObjectivesListProps) {
  return (
    <div className="m-objectives m-animate" id={`block-${block.id}`}>
      <div className="m-objectives-header">
        <Target className="w-[18px] h-[18px]" style={{ color: 'var(--m-accent-sage)' }} />
        <span className="m-objectives-label">Learning Objectives</span>
        {block.estimatedMinutes > 0 && (
          <span className="m-objectives-time">
            <Clock className="w-3 h-3" />
            ~{block.estimatedMinutes} min
          </span>
        )}
      </div>
      <p className="m-objectives-intro">By the end of this section, you will be able to:</p>
      <ul className="m-objectives-list">
        {block.objectives.map((obj, i) => (
          <li key={i}>{obj}</li>
        ))}
      </ul>
    </div>
  )
}
