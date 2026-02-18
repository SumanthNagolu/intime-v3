'use client'

import React, { useState, useCallback } from 'react'
import {
  Code2,
  Send,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronDown,
  Eye,
} from 'lucide-react'
import type { CodeTaskBlock } from '@/lib/academy/types'

interface CodeTaskCardProps {
  block: CodeTaskBlock
  assignmentId: string
  existingSubmission?: {
    code: string
    feedback?: string
    score?: number
  }
  hintsRevealed: number
  onSubmit: (blockId: string, code: string, feedback?: string, score?: number) => void
  onRevealHint: () => void
}

export function CodeTaskCard({
  block,
  assignmentId,
  existingSubmission,
  hintsRevealed,
  onSubmit,
  onRevealHint,
}: CodeTaskCardProps) {
  const [code, setCode] = useState(existingSubmission?.code || block.starterCode || '')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<{
    score: number
    correct: boolean
    feedback: string
    suggestions?: string[]
  } | null>(
    existingSubmission?.feedback
      ? {
          score: existingSubmission.score ?? 0,
          correct: (existingSubmission.score ?? 0) >= 70,
          feedback: existingSubmission.feedback,
        }
      : null
  )
  const [showSolution, setShowSolution] = useState(false)

  const hints = block.hints ?? []
  const isSubmitted = result !== null

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || grading) return
    setGrading(true)

    try {
      const res = await fetch('/api/ai/grade-assignment-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: block.language,
          prompt: block.prompt,
          studentCode: code.trim(),
          referenceSolution: block.referenceSolution,
          exerciseContext: block.context,
        }),
      })

      if (!res.ok) throw new Error('Grading failed')
      const data = await res.json()
      const gradeResult = {
        score: data.score ?? 0,
        correct: Boolean(data.correct),
        feedback: String(data.feedback || ''),
        suggestions: data.suggestions,
      }
      setResult(gradeResult)
      onSubmit(block.id, code.trim(), gradeResult.feedback, gradeResult.score)
    } catch {
      const fallback = { score: 0, correct: false, feedback: 'Unable to grade code at this time.', suggestions: [] as string[] }
      setResult(fallback)
      onSubmit(block.id, code.trim())
    } finally {
      setGrading(false)
    }
  }, [code, grading, block, onSubmit])

  return (
    <div
      id={`block-${block.id}`}
      style={{
        borderRadius: 'var(--m-radius-lg)',
        overflow: 'hidden',
        border: `1px solid ${isSubmitted ? (result.correct ? 'rgba(90,122,90,0.2)' : 'rgba(220,38,38,0.15)') : 'var(--m-border)'}`,
        marginBottom: 20,
        boxShadow: 'var(--m-shadow-card)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'var(--m-bg-deep)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Code2 className="w-4 h-4" style={{ color: 'var(--m-accent-warm)' }} />
          <span className="m-code-lang">{block.language}</span>
          <span
            className="m-mono"
            style={{ fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)' }}
          >
            Code Task
          </span>
        </div>
        {block.skillTested && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
            {block.skillTested}
          </span>
        )}
      </div>

      {/* Prompt */}
      <div style={{ padding: '18px 20px', background: 'var(--m-bg-card)', borderBottom: '1px solid var(--m-border)' }}>
        <p style={{ fontSize: 14, color: 'var(--m-text-primary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
          {block.prompt}
        </p>
        {block.context && (
          <p style={{ fontSize: 13, color: 'var(--m-text-muted)', lineHeight: 1.7, marginTop: 10, fontStyle: 'italic' }}>
            {block.context}
          </p>
        )}
      </div>

      {/* Hints */}
      {hints.length > 0 && !isSubmitted && (
        <div style={{ padding: '12px 20px', background: 'var(--m-bg-cream)', borderBottom: '1px solid var(--m-border)' }}>
          {hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--m-text-secondary)', lineHeight: 1.7, marginBottom: 6 }}>
              <span className="m-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1px', color: 'var(--m-accent-warm)', marginRight: 8 }}>
                Hint {i + 1}
              </span>
              {hint}
            </div>
          ))}
          {hintsRevealed < hints.length && (
            <button className="m-practice-hint-toggle" onClick={onRevealHint}>
              <ChevronDown className="w-3.5 h-3.5" />
              Show hint {hintsRevealed + 1} of {hints.length}
            </button>
          )}
        </div>
      )}

      {/* Code editor */}
      <div style={{ background: 'var(--m-bg-deep)', position: 'relative' }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Write your code here..."
          rows={Math.max(8, code.split('\n').length + 2)}
          disabled={isSubmitted}
          style={{
            width: '100%',
            padding: 20,
            background: 'transparent',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: "'Source Code Pro', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            tabSize: 2,
            opacity: isSubmitted ? 0.6 : 1,
          }}
          spellCheck={false}
          onKeyDown={(e) => {
            // Tab support
            if (e.key === 'Tab') {
              e.preventDefault()
              const target = e.currentTarget
              const start = target.selectionStart
              const end = target.selectionEnd
              const newValue = code.substring(0, start) + '  ' + code.substring(end)
              setCode(newValue)
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2
              })
            }
            // Submit
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
      </div>

      {/* Submit / Result */}
      <div style={{ padding: '14px 20px', background: 'var(--m-bg-card)', borderTop: '1px solid var(--m-border)' }}>
        {!isSubmitted ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="m-mono" style={{ fontSize: 9, color: 'var(--m-text-light)', letterSpacing: '1px' }}>
              Cmd+Enter to submit &middot; Tab for indent
            </span>
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || grading}
              className="m-practice-btn"
              style={{
                padding: '8px 18px',
                fontSize: 13,
                opacity: !code.trim() || grading ? 0.4 : 1,
                cursor: !code.trim() || grading ? 'not-allowed' : 'pointer',
              }}
            >
              {grading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Code</>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Score + feedback */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: result.correct ? 'var(--m-accent-sage-soft)' : 'rgba(220,38,38,0.04)',
                border: `1px solid ${result.correct ? 'rgba(90,122,90,0.15)' : 'rgba(220,38,38,0.12)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {result.correct ? (
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--m-accent-sage)' }} />
                  ) : (
                    <XCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
                  )}
                  <span
                    className="m-mono"
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase' as const,
                      color: result.correct ? 'var(--m-accent-sage)' : '#dc2626',
                    }}
                  >
                    {result.correct ? 'Good Solution' : 'Needs Improvement'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: result.correct ? 'var(--m-accent-sage)' : '#dc2626',
                  }}
                >
                  {result.score}/100
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.85, margin: 0 }}>
                {result.feedback}
              </p>
              {result.suggestions && result.suggestions.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--m-text-muted)', lineHeight: 1.6 }}>
                      <Sparkles className="w-3 h-3 flex-shrink-0" style={{ marginTop: 3, color: 'var(--m-accent-gold)' }} />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solution reveal */}
            {block.referenceSolution && (
              <>
                {!showSolution ? (
                  <button
                    onClick={() => setShowSolution(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      background: 'none',
                      border: '1px dashed var(--m-border)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'var(--m-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View reference solution
                  </button>
                ) : (
                  <div className="m-code-block" style={{ animation: 'm-gentle-in 0.3s ease both' }}>
                    <div className="m-code-header">
                      <span className="m-code-lang">{block.language}</span>
                      <span className="m-code-title">Reference Solution</span>
                    </div>
                    <pre className="m-code-pre">
                      <code>{block.referenceSolution}</code>
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
