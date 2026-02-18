'use client'

import React, { useState } from 'react'
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import type { ReferenceBlock } from '@/lib/academy/types'

interface ReferenceCardProps {
  block: ReferenceBlock
}

export function ReferenceCard({ block }: ReferenceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isReview = block.variant === 'review'

  return (
    <div
      id={`block-${block.id}`}
      style={{
        padding: '18px 22px',
        background: isReview ? 'var(--m-accent-gold-soft)' : 'var(--m-accent-sage-soft)',
        border: `1px solid ${isReview ? 'rgba(184,148,46,0.15)' : 'rgba(90,122,90,0.15)'}`,
        borderRadius: 'var(--m-radius-md)',
        marginBottom: 12,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
        }}
      >
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          {isReview ? (
            <HelpCircle className="w-[18px] h-[18px]" style={{ color: 'var(--m-accent-gold)' }} />
          ) : (
            <Lightbulb className="w-[18px] h-[18px]" style={{ color: 'var(--m-accent-sage)' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <span
            className="m-mono"
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
              color: isReview ? 'var(--m-accent-gold)' : 'var(--m-accent-sage)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            {isReview ? 'Review Question' : 'Tip'}
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--m-text-primary)', lineHeight: 1.5 }}>
            {block.question}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--m-text-muted)', marginTop: 2 }} />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--m-text-muted)', marginTop: 2 }} />
        )}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${isReview ? 'rgba(184,148,46,0.15)' : 'rgba(90,122,90,0.12)'}`,
            fontSize: 14,
            color: 'var(--m-text-secondary)',
            lineHeight: 1.85,
            animation: 'm-gentle-in 0.3s ease both',
          }}
        >
          {block.explanation}
        </div>
      )}
    </div>
  )
}
