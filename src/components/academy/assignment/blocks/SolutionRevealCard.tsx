'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, ChevronDown, Camera } from 'lucide-react'
import type { SolutionStepBlock } from '@/lib/academy/types'

interface SolutionRevealCardProps {
  block: SolutionStepBlock
  isRevealed: boolean
  onReveal: () => void
}

export function SolutionRevealCard({ block, isRevealed, onReveal }: SolutionRevealCardProps) {
  if (!isRevealed) {
    return (
      <div id={`block-${block.id}`} style={{ marginBottom: 8 }}>
        <button
          onClick={onReveal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'none',
            border: '1px dashed var(--m-border)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--m-text-muted)',
            cursor: 'pointer',
            transition: 'all 0.25s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--m-accent-warm)'
            e.currentTarget.style.color = 'var(--m-accent-warm)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--m-border)'
            e.currentTarget.style.color = 'var(--m-text-muted)'
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          Reveal Solution Step {block.stepNumber}
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      id={`block-${block.id}`}
      style={{
        padding: '18px 22px',
        background: 'rgba(184,148,46,0.06)',
        border: '1px solid rgba(184,148,46,0.15)',
        borderRadius: 'var(--m-radius-md)',
        marginBottom: 8,
        animation: 'm-gentle-in 0.4s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <EyeOff className="w-4 h-4" style={{ color: 'var(--m-accent-gold)' }} />
        <span
          className="m-mono"
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            color: 'var(--m-accent-gold)',
          }}
        >
          Solution Step {block.stepNumber}
        </span>
      </div>

      {/* Instruction */}
      <p style={{ fontSize: 14, color: 'var(--m-text-primary)', lineHeight: 1.75, marginBottom: 8 }}>
        {block.instruction}
      </p>

      {/* Sub-steps */}
      {block.substeps && block.substeps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, paddingLeft: 8 }}>
          {block.substeps.map((sub) => (
            <div
              key={sub.letter}
              style={{
                display: 'flex',
                gap: 8,
                fontSize: 13,
                color: 'var(--m-text-secondary)',
                lineHeight: 1.7,
              }}
            >
              <span className="m-mono" style={{ fontSize: 10, color: 'var(--m-text-muted)', marginTop: 3 }}>
                {sub.letter}.
              </span>
              {sub.text}
            </div>
          ))}
        </div>
      )}

      {/* Code snippet */}
      {block.codeSnippet && (
        <div className="m-code-block" style={{ marginTop: 12, marginBottom: block.codeSnippet.explanation ? 0 : 12 }}>
          <div className="m-code-header">
            <span className="m-code-lang">{block.codeSnippet.language}</span>
          </div>
          <pre className="m-code-pre">
            <code>{block.codeSnippet.code}</code>
          </pre>
          {block.codeSnippet.explanation && (
            <p className="m-code-explanation">{block.codeSnippet.explanation}</p>
          )}
        </div>
      )}

      {/* Screenshot caption */}
      {block.screenshotCaption && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: 8,
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--m-text-muted)',
            lineHeight: 1.6,
            marginTop: 8,
          }}
        >
          <Camera className="w-3.5 h-3.5 flex-shrink-0" style={{ marginTop: 1 }} />
          {block.screenshotCaption}
        </div>
      )}
    </div>
  )
}
