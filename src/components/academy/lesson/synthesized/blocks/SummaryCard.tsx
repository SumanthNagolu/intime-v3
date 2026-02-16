'use client'

import React from 'react'
import { Award, ArrowRight } from 'lucide-react'
import type { SummaryBlock } from '@/lib/academy/types'

interface SummaryCardProps {
  block: SummaryBlock
}

export function SummaryCard({ block }: SummaryCardProps) {
  return (
    <div className="m-summary-card m-animate" id={`block-${block.id}`}>
      <div className="m-summary-header">
        <Award className="w-5 h-5" style={{ color: 'var(--m-accent-gold)' }} />
        <span>Key Takeaways</span>
      </div>

      <ul className="m-takeaways-list">
        {block.keyTakeaways.map((takeaway, i) => (
          <li key={i}>{takeaway}</li>
        ))}
      </ul>

      <div className="m-summary-connection">
        <div className="m-summary-connection-label">Real-World Application</div>
        <p>{block.realWorldConnection}</p>
      </div>

      {block.nextLessonPreview && (
        <div className="m-summary-preview">
          <ArrowRight className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="m-summary-preview-label">Up Next</span>
            <p>{block.nextLessonPreview}</p>
          </div>
        </div>
      )}
    </div>
  )
}
