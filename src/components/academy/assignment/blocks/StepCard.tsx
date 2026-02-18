'use client'

import React from 'react'
import { Check } from 'lucide-react'
import type { StepBlock } from '@/lib/academy/types'

interface StepCardProps {
  block: StepBlock
  isDone: boolean
  onToggle: (stepId: string, done: boolean) => void
}

export function StepCard({ block, isDone, onToggle }: StepCardProps) {
  return (
    <div
      id={`block-${block.id}`}
      style={{
        display: 'flex',
        gap: 14,
        padding: '16px 20px',
        background: isDone ? 'var(--m-accent-sage-soft)' : 'var(--m-bg-card)',
        border: `1px solid ${isDone ? 'rgba(90,122,90,0.15)' : 'var(--m-border)'}`,
        borderRadius: 'var(--m-radius-md)',
        marginBottom: 8,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Checkbox */}
      {block.requiresAction && (
        <button
          onClick={() => onToggle(block.id, !isDone)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: `2px solid ${isDone ? 'var(--m-accent-sage)' : 'var(--m-border)'}`,
            background: isDone ? 'var(--m-accent-sage)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: 2,
            transition: 'all 0.2s',
          }}
        >
          {isDone && <Check className="w-3.5 h-3.5" style={{ color: 'white' }} />}
        </button>
      )}

      {/* Step number indicator (for non-action steps) */}
      {!block.requiresAction && (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--m-bg-cream)',
            border: '1px solid var(--m-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--m-text-muted)',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {block.stepNumber}
        </div>
      )}

      <div style={{ flex: 1 }}>
        {/* Step number label + instruction */}
        <div
          style={{
            fontSize: 14,
            color: isDone ? 'var(--m-text-muted)' : 'var(--m-text-primary)',
            lineHeight: 1.75,
            textDecoration: isDone ? 'line-through' : 'none',
            textDecorationColor: 'var(--m-text-light)',
          }}
        >
          <span
            className="m-mono"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1px',
              color: 'var(--m-accent-warm)',
              marginRight: 8,
            }}
          >
            Step {block.stepNumber}
          </span>
          {block.instruction}
        </div>

        {/* Sub-steps */}
        {block.substeps && block.substeps.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {block.substeps.map((sub) => (
              <div
                key={sub.letter}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  paddingLeft: 8,
                  fontSize: 13,
                  color: 'var(--m-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                <span
                  className="m-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'var(--m-text-muted)',
                    marginTop: 3,
                    flexShrink: 0,
                  }}
                >
                  {sub.letter}.
                </span>
                {sub.text}
              </div>
            ))}
          </div>
        )}

        {/* Embedded question */}
        {block.embeddedQuestion && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 16px',
              background: 'rgba(192,104,48,0.06)',
              border: '1px solid var(--m-border-warm)',
              borderRadius: 8,
              fontSize: 13,
              fontStyle: 'italic',
              color: 'var(--m-accent-warm)',
              lineHeight: 1.7,
            }}
          >
            {block.embeddedQuestion}
          </div>
        )}
      </div>
    </div>
  )
}
