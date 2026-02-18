'use client'

import React from 'react'
import { ClipboardCheck, Check } from 'lucide-react'
import type { VerificationBlock } from '@/lib/academy/types'

interface VerificationCardProps {
  block: VerificationBlock
  checkedSteps: string[]
  onToggle: (stepId: string, checked: boolean) => void
}

export function VerificationCard({ block, checkedSteps, onToggle }: VerificationCardProps) {
  const checkedSet = new Set(checkedSteps)
  const total = block.steps.length
  const completed = block.steps.filter((_, i) => checkedSet.has(`${block.id}-${i}`)).length
  const allDone = completed === total

  return (
    <div
      id={`block-${block.id}`}
      style={{
        padding: '22px 26px',
        background: allDone ? 'var(--m-accent-sage-soft)' : 'var(--m-bg-card)',
        border: `1px solid ${allDone ? 'rgba(90,122,90,0.2)' : 'var(--m-border)'}`,
        borderRadius: 'var(--m-radius-lg)',
        marginBottom: 20,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardCheck
            className="w-[18px] h-[18px]"
            style={{ color: allDone ? 'var(--m-accent-sage)' : 'var(--m-accent-warm)' }}
          />
          <span
            className="m-mono"
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '1.5px',
              textTransform: 'uppercase' as const,
              color: allDone ? 'var(--m-accent-sage)' : 'var(--m-accent-warm)',
            }}
          >
            {block.title}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: allDone ? 'var(--m-accent-sage)' : 'var(--m-text-muted)',
          }}
        >
          {completed} of {total} verified
        </span>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {block.steps.map((step, i) => {
          const stepId = `${block.id}-${i}`
          const isChecked = checkedSet.has(stepId)

          return (
            <div
              key={stepId}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 14px',
                background: isChecked ? 'rgba(90,122,90,0.06)' : 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => onToggle(stepId, !isChecked)}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: `2px solid ${isChecked ? 'var(--m-accent-sage)' : 'var(--m-border)'}`,
                  background: isChecked ? 'var(--m-accent-sage)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                  transition: 'all 0.2s',
                }}
              >
                {isChecked && <Check className="w-3 h-3" style={{ color: 'white' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: isChecked ? 'var(--m-text-muted)' : 'var(--m-text-primary)',
                    lineHeight: 1.6,
                    textDecoration: isChecked ? 'line-through' : 'none',
                    textDecorationColor: 'var(--m-text-light)',
                  }}
                >
                  {step.text}
                </span>
                {step.verificationNote && (
                  <p
                    style={{
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: 'var(--m-text-muted)',
                      marginTop: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.verificationNote}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
