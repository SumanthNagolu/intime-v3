'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react'
import type { WriteItDownBlock } from '@/lib/academy/types'

interface WriteItDownCardProps {
  block: WriteItDownBlock
  assignmentId: string
  existingAnswer?: {
    answer: string
    correct?: boolean
    feedback?: string
    attempts: number
  }
  hintsRevealed: number
  onSubmit: (blockId: string, answer: string, correct?: boolean, feedback?: string) => void
  onRevealHint: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function WriteItDownCard({
  block,
  assignmentId,
  existingAnswer,
  hintsRevealed,
  onSubmit,
  onRevealHint,
}: WriteItDownCardProps) {
  const [answer, setAnswer] = useState(existingAnswer?.answer || '')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(
    existingAnswer?.correct !== undefined
      ? { correct: existingAnswer.correct!, feedback: existingAnswer.feedback || '' }
      : null
  )

  // Discussion state
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [initialExplanationLoaded, setInitialExplanationLoaded] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const hints = block.hints ?? []
  const isSubmitted = result !== null

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || grading) return
    setGrading(true)

    try {
      const res = await fetch('/api/ai/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: block.question,
          correctAnswer: block.referenceAnswer || '',
          studentAnswer: answer.trim(),
        }),
      })

      if (!res.ok) throw new Error('Grading failed')
      const data = await res.json()
      const gradeResult = { correct: Boolean(data.correct), feedback: String(data.feedback || '') }
      setResult(gradeResult)
      onSubmit(block.id, answer.trim(), gradeResult.correct, gradeResult.feedback)
    } catch {
      const fallback = { correct: false, feedback: 'Unable to grade at this time. Please try again.' }
      setResult(fallback)
      onSubmit(block.id, answer.trim())
    } finally {
      setGrading(false)
    }
  }, [answer, grading, block.question, block.referenceAnswer, block.id, onSubmit])

  const startDiscussion = useCallback(async () => {
    setShowDiscussion(true)
    if (initialExplanationLoaded) {
      setTimeout(() => chatInputRef.current?.focus(), 100)
      return
    }
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The student answered an assignment question incorrectly. Help them understand.\n\n**Question:** ${block.question}\n\n**Student's Answer:** ${existingAnswer?.answer || answer}\n\n**Correct Answer:** ${block.referenceAnswer || 'Not provided'}\n\n**Feedback:** ${result?.feedback || ''}\n\nExplain clearly what they missed.`,
          conversationHistory: [],
          lessonId: assignmentId,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setChatMessages([{ role: 'assistant', content: data.answer }])
      setInitialExplanationLoaded(true)
      setTimeout(() => chatInputRef.current?.focus(), 100)
    } catch {
      setChatMessages([{ role: 'assistant', content: 'I had trouble loading the explanation. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }, [block.question, block.referenceAnswer, result, existingAnswer, answer, assignmentId, initialExplanationLoaded])

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          lessonId: assignmentId,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding.' }])
    } finally {
      setChatLoading(false)
    }
  }, [chatInput, chatLoading, chatMessages, assignmentId])

  return (
    <div
      id={`block-${block.id}`}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: isSubmitted
          ? result.correct ? 'rgba(90,122,90,0.2)' : 'rgba(220,38,38,0.2)'
          : 'var(--m-border-warm)',
        background: 'var(--m-bg-card)',
        marginBottom: 16,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: 3,
          background: isSubmitted
            ? result.correct
              ? 'linear-gradient(90deg, var(--m-accent-sage), #7aa07a)'
              : 'linear-gradient(90deg, #dc2626, #ef4444)'
            : 'linear-gradient(90deg, var(--m-accent-warm), var(--m-accent-gold))',
        }}
      />

      <div style={{ padding: 24 }}>
        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSubmitted
                ? result.correct ? 'var(--m-accent-sage-soft)' : 'rgba(220,38,38,0.06)'
                : 'rgba(192,104,48,0.08)',
              border: `1px solid ${
                isSubmitted
                  ? result.correct ? 'rgba(90,122,90,0.2)' : 'rgba(220,38,38,0.15)'
                  : 'var(--m-border-warm)'
              }`,
            }}
          >
            {isSubmitted ? (
              result.correct ? (
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--m-accent-sage)' }} />
              ) : (
                <XCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
              )
            ) : (
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--m-accent-warm)' }} />
            )}
          </div>
          <span
            className="m-mono"
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '2.5px',
              textTransform: 'uppercase' as const,
              color: isSubmitted
                ? result.correct ? 'var(--m-accent-sage)' : '#dc2626'
                : 'var(--m-accent-warm)',
            }}
          >
            Write It Down
          </span>
          {block.skillTested && (
            <span className="m-concept-pill" style={{ fontSize: 10, padding: '2px 10px' }}>
              {block.skillTested}
            </span>
          )}
        </div>

        {/* Question */}
        <h4
          className="m-display"
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--m-text-primary)',
            lineHeight: 1.45,
            marginBottom: 16,
          }}
        >
          {block.question}
        </h4>

        {/* Progressive hints */}
        {hints.length > 0 && !isSubmitted && (
          <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hints.slice(0, hintsRevealed).map((hint, i) => (
              <div key={i} className="m-practice-hint-item">
                <span className="m-practice-hint-num">Hint {i + 1}</span>
                <span>{hint}</span>
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

        {/* Answer input or result */}
        {!isSubmitted ? (
          <div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={block.answerType === 'paragraph' ? 4 : 2}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid var(--m-border)',
                background: 'white',
                padding: '12px 16px',
                fontSize: 15,
                color: 'var(--m-text-primary)',
                lineHeight: 1.85,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'Lora, serif',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--m-accent-warm)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span className="m-mono" style={{ fontSize: 9, color: 'var(--m-text-light)', letterSpacing: '1px' }}>
                Cmd+Enter to submit
              </span>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || grading}
                className="m-practice-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: 13,
                  opacity: !answer.trim() || grading ? 0.4 : 1,
                  cursor: !answer.trim() || grading ? 'not-allowed' : 'pointer',
                }}
              >
                {grading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Grading...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Student answer */}
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--m-bg-cream)', border: '1px solid var(--m-border)' }}>
              <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.85, whiteSpace: 'pre-wrap', margin: 0 }}>
                {existingAnswer?.answer || answer}
              </p>
            </div>

            {/* Feedback */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: result.correct ? 'var(--m-accent-sage-soft)' : 'rgba(220,38,38,0.04)',
                border: `1px solid ${result.correct ? 'rgba(90,122,90,0.15)' : 'rgba(220,38,38,0.12)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: result.correct ? 'var(--m-accent-sage)' : '#dc2626' }} />
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
                  {result.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: result.correct ? '#3a5a3a' : '#7f1d1d', lineHeight: 1.85, margin: 0 }}>
                {result.feedback}
              </p>
            </div>

            {/* Reference answer */}
            {block.referenceAnswer && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--m-bg-cream)', border: '1px solid var(--m-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--m-text-muted)' }} />
                  <span className="m-mono" style={{ fontSize: 9, fontWeight: 500, letterSpacing: '2.5px', textTransform: 'uppercase' as const, color: 'var(--m-text-muted)' }}>
                    Reference Answer
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.85, margin: 0 }}>
                  {block.referenceAnswer}
                </p>
              </div>
            )}

            {/* Discussion CTA for incorrect */}
            {!result.correct && (
              <div style={{ animation: 'm-gentle-in 0.3s ease both', animationDelay: '300ms' }}>
                {!showDiscussion ? (
                  <button
                    onClick={startDiscussion}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--m-border-warm)',
                      background: 'rgba(192,104,48,0.04)',
                      color: 'var(--m-accent-warm)',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discuss with Rajesh
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div style={{ borderRadius: 12, border: '1px solid var(--m-border-warm)', overflow: 'hidden' }}>
                    {/* Chat header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        background: 'linear-gradient(90deg, rgba(192,104,48,0.06), rgba(192,104,48,0.02))',
                        borderBottom: '1px solid var(--m-border-warm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #c06830, #e08a4e)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 8,
                            fontWeight: 700,
                          }}
                        >
                          RK
                        </div>
                        <span className="m-mono" style={{ fontSize: 9, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: 'var(--m-accent-warm)' }}>
                          Discussion
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDiscussion(false)}
                        style={{ fontSize: 10, color: 'var(--m-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none' }}
                      >
                        Collapse <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div style={{ maxHeight: 280, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {chatMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              ...(msg.role === 'assistant'
                                ? { background: 'linear-gradient(135deg, #c06830, #e08a4e)' }
                                : { background: 'var(--m-bg-cream)' }),
                            }}
                          >
                            {msg.role === 'assistant' ? (
                              <span style={{ color: 'white', fontSize: 8, fontWeight: 700 }}>RK</span>
                            ) : (
                              <User className="w-3 h-3" style={{ color: 'var(--m-text-muted)' }} />
                            )}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              borderRadius: 10,
                              padding: '8px 12px',
                              fontSize: 13,
                              lineHeight: 1.85,
                              ...(msg.role === 'assistant'
                                ? { background: 'var(--m-bg-cream)', color: 'var(--m-text-secondary)' }
                                : { background: 'rgba(192,104,48,0.06)', color: 'var(--m-text-primary)', marginLeft: 24 }),
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #c06830, #e08a4e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: 8, fontWeight: 700 }}>RK</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'var(--m-bg-cream)' }}>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--m-accent-warm)' }} />
                            <span style={{ fontSize: 12, color: 'var(--m-text-muted)' }}>Thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    {initialExplanationLoaded && (
                      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--m-border)', background: 'var(--m-bg-cream)' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <textarea
                            ref={chatInputRef}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a follow-up..."
                            rows={1}
                            style={{
                              flex: 1,
                              borderRadius: 8,
                              border: '1px solid var(--m-border)',
                              background: 'white',
                              padding: '8px 12px',
                              fontSize: 13,
                              resize: 'none',
                              outline: 'none',
                              fontFamily: 'Lora, serif',
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() }
                            }}
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || chatLoading}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: 'var(--m-accent-warm)',
                              color: 'white',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer',
                              opacity: !chatInput.trim() || chatLoading ? 0.4 : 1,
                            }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
