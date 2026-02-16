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
  Bot,
  User,
} from 'lucide-react'
import { useAcademyStore } from '@/lib/academy/progress-store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface KnowledgeCheckCardProps {
  question: string
  referenceAnswer: string
  lessonId: string
  questionKey: string
  /** Called after submission — use for marking checkpoints complete, etc. */
  onAnswered?: (correct: boolean) => void
  /** Optional label, e.g. "Question 1 of 3" */
  label?: string
}

export function KnowledgeCheckCard({
  question,
  referenceAnswer,
  lessonId,
  questionKey,
  onAnswered,
  label,
}: KnowledgeCheckCardProps) {
  const { getLessonProgress, recordKnowledgeCheckAnswer } = useAcademyStore()
  const progress = getLessonProgress(lessonId)
  const existingAnswer = progress.knowledgeCheckAnswers?.[questionKey]

  const [answer, setAnswer] = useState(existingAnswer?.answer || '')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<{
    correct: boolean
    feedback: string
  } | null>(
    existingAnswer
      ? { correct: existingAnswer.correct, feedback: existingAnswer.feedback }
      : null
  )

  // AI Discussion state (for incorrect answers)
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [initialExplanationLoaded, setInitialExplanationLoaded] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Load initial AI explanation when discussion is first opened
  const startDiscussion = useCallback(async () => {
    setShowDiscussion(true)
    if (initialExplanationLoaded) {
      setTimeout(() => chatInputRef.current?.focus(), 100)
      return
    }

    setChatLoading(true)
    try {
      const studentAnswer = existingAnswer?.answer || answer
      const res = await fetch('/api/ai/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The student just answered a Knowledge Check question incorrectly. Help them understand what they missed and explain the concept clearly.

**Question:** ${question}

**Student's Answer:** ${studentAnswer}

**Correct Answer:** ${referenceAnswer}

**Grading Feedback:** ${result?.feedback || ''}

Please:
1. Acknowledge what the student got right (if anything)
2. Clearly explain what key concept(s) they missed
3. Break down the correct answer in simple terms
4. Give a memorable way to remember this concept

Keep it conversational and encouraging — they're learning.`,
          conversationHistory: [],
          lessonId,
        }),
      })

      if (!res.ok) throw new Error('Failed to get explanation')

      const data = await res.json()
      setChatMessages([{ role: 'assistant', content: data.answer }])
      setInitialExplanationLoaded(true)
      setTimeout(() => chatInputRef.current?.focus(), 100)
    } catch (err) {
      console.error('Discussion error:', err)
      setChatMessages([{
        role: 'assistant',
        content: 'I had trouble loading the explanation. Please try again.',
      }])
    } finally {
      setChatLoading(false)
    }
  }, [question, referenceAnswer, result, existingAnswer, answer, lessonId, initialExplanationLoaded])

  // Send follow-up message in discussion
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const conversationHistory = chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          lessonId,
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
      }])
    } finally {
      setChatLoading(false)
    }
  }, [chatInput, chatLoading, chatMessages, lessonId])

  const isSubmitted = result !== null

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || grading) return

    setGrading(true)
    try {
      const res = await fetch('/api/ai/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          correctAnswer: referenceAnswer,
          studentAnswer: answer.trim(),
        }),
      })

      if (!res.ok) throw new Error('Grading failed')

      const data = await res.json()
      const gradeResult = {
        correct: Boolean(data.correct),
        feedback: String(data.feedback || ''),
      }

      setResult(gradeResult)
      recordKnowledgeCheckAnswer(
        lessonId,
        questionKey,
        answer.trim(),
        gradeResult.correct,
        gradeResult.feedback
      )
      onAnswered?.(gradeResult.correct)
    } catch (err) {
      console.error('Grade error:', err)
      setResult({
        correct: false,
        feedback: 'Unable to grade at this time. Please try again.',
      })
    } finally {
      setGrading(false)
    }
  }, [answer, grading, question, referenceAnswer, lessonId, questionKey, recordKnowledgeCheckAnswer, onAnswered])

  return (
    <div className="rounded-xl border border-warm-light/20 bg-white shadow-elevation-sm overflow-hidden">
      {/* Accent bar */}
      <div
        className={`h-1 ${
          isSubmitted
            ? result.correct
              ? 'bg-gradient-to-r from-sage-400 via-sage-500 to-sage-400'
              : 'bg-gradient-to-r from-red-400 via-red-500 to-red-400'
            : 'bg-gradient-to-r from-copper-400 via-copper-500 to-copper-400'
        }`}
      />

      <div className="p-6">
        {/* Badge + score */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isSubmitted
                  ? result.correct
                    ? 'bg-sage-50 border border-sage-200/60'
                    : 'bg-red-50 border border-red-200/60'
                  : 'bg-copper-50 border border-copper-200/60'
              }`}
            >
              {isSubmitted ? (
                result.correct ? (
                  <CheckCircle className="w-[18px] h-[18px] text-sage-600" />
                ) : (
                  <XCircle className="w-[18px] h-[18px] text-red-600" />
                )
              ) : (
                <HelpCircle className="w-[18px] h-[18px] text-copper-500" />
              )}
            </div>
            <div>
              <p
                className={`font-mono-warm text-[9px] font-medium uppercase ${
                  isSubmitted
                    ? result.correct
                      ? 'text-sage-600'
                      : 'text-red-600'
                    : 'text-copper-500'
                }`}
                style={{ letterSpacing: '2.5px' }}
              >
                Knowledge Check
              </p>
              {label && (
                <p className="font-serif text-[10px] text-warm-muted">{label}</p>
              )}
            </div>
          </div>

          {isSubmitted && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                result.correct
                  ? 'bg-sage-50 text-sage-700 border border-sage-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {result.correct ? '1/1' : '0/1'}
            </div>
          )}
        </div>

        {/* Question */}
        <h3 className="font-display font-semibold text-lg md:text-xl text-warm-primary leading-snug mb-5" style={{ letterSpacing: '-0.01em' }}>
          {question}
        </h3>

        {/* Answer input or result */}
        {!isSubmitted ? (
          <div className="space-y-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              className="w-full rounded-lg border border-warm-light/20 bg-white px-4 py-3 font-serif text-[15px] text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-y"
              style={{ lineHeight: '1.85' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />

            <div className="flex items-center justify-between">
              <p className="font-mono-warm text-[9px] text-warm-light" style={{ letterSpacing: '1px' }}>
                Cmd+Enter to submit
              </p>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || grading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-warm-deep text-white text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {grading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {/* Student answer */}
            <div className="rounded-lg border border-warm-light/15 px-4 py-3" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
              <p className="font-serif text-sm text-warm-secondary whitespace-pre-wrap" style={{ lineHeight: '1.85' }}>
                {existingAnswer?.answer || answer}
              </p>
            </div>

            {/* AI Feedback */}
            <div
              className={`rounded-lg border px-4 py-3 ${
                result.correct
                  ? 'bg-sage-50/60 border-sage-200/50'
                  : 'bg-red-50/60 border-red-200/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    result.correct ? 'text-sage-600' : 'text-red-600'
                  }`}
                />
                <span
                  className={`font-mono-warm text-[9px] font-medium uppercase ${
                    result.correct ? 'text-sage-600' : 'text-red-600'
                  }`}
                  style={{ letterSpacing: '2.5px' }}
                >
                  {result.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p
                className={`font-serif text-sm leading-relaxed ${
                  result.correct ? 'text-sage-800' : 'text-red-800'
                }`}
                style={{ lineHeight: '1.85' }}
              >
                {result.feedback}
              </p>
            </div>

            {/* Reference answer */}
            <div className="rounded-lg border border-warm-light/15 px-4 py-3" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-warm-muted" />
                <span className="font-mono-warm text-[9px] font-medium uppercase text-warm-muted" style={{ letterSpacing: '2.5px' }}>
                  Reference Answer
                </span>
              </div>
              {referenceAnswer.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="font-serif text-sm text-warm-secondary"
                  style={{ marginTop: i > 0 ? '8px' : '0', lineHeight: '1.85' }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* AI Discussion - appears for incorrect answers */}
            {!result.correct && (
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                {!showDiscussion ? (
                  <button
                    onClick={startDiscussion}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-copper-200 bg-copper-50/60 text-copper-800 font-serif text-sm font-medium transition-all duration-300 hover:bg-copper-50 hover:border-copper-300 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discuss with Rajesh — understand what you missed
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <div className="rounded-lg border border-copper-200/60 bg-white overflow-hidden shadow-sm">
                    {/* Discussion header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-copper-50 to-copper-100/50 border-b border-copper-200/40">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white font-display text-[8px] font-bold"
                          style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
                        >
                          RK
                        </div>
                        <span className="font-mono-warm text-[9px] font-medium uppercase text-copper-700" style={{ letterSpacing: '2px' }}>
                          Discussion with Rajesh
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDiscussion(false)}
                        className="flex items-center gap-1 text-[10px] text-copper-600 hover:text-copper-800 transition-colors"
                      >
                        Collapse
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Chat messages */}
                    <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 scrollbar-warm">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                            msg.role === 'assistant'
                              ? ''
                              : 'bg-warm-cream'
                          }`}
                            style={msg.role === 'assistant' ? { background: 'linear-gradient(135deg, #c06830, #e08a4e)' } : undefined}
                          >
                            {msg.role === 'assistant' ? (
                              <span className="text-white font-display text-[8px] font-bold">RK</span>
                            ) : (
                              <User className="w-3.5 h-3.5 text-warm-muted" />
                            )}
                          </div>
                          <div className={`flex-1 rounded-lg px-3 py-2.5 font-serif text-sm leading-relaxed ${
                            msg.role === 'assistant'
                              ? 'text-warm-secondary'
                              : 'bg-copper-50 text-copper-900 ml-8'
                          }`}
                            style={msg.role === 'assistant' ? { backgroundColor: 'var(--al-cream, #f5efe5)', lineHeight: '1.85' } : { lineHeight: '1.85' }}
                          >
                            {msg.content.split('\n').map((line, j) => (
                              <React.Fragment key={j}>
                                {j > 0 && <br />}
                                {line.startsWith('**') && line.endsWith('**')
                                  ? <strong>{line.slice(2, -2)}</strong>
                                  : line.startsWith('- ')
                                    ? <span className="block pl-3">{'• '}{line.slice(2)}</span>
                                    : line
                                }
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="flex gap-2.5">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white font-display text-[8px] font-bold"
                            style={{ background: 'linear-gradient(135deg, #c06830, #e08a4e)' }}
                          >
                            RK
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-copper-500" />
                            <span className="font-serif text-xs text-warm-muted">Thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    {initialExplanationLoaded && (
                      <div className="px-4 py-3 border-t border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
                        <div className="flex gap-2">
                          <textarea
                            ref={chatInputRef}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            rows={1}
                            className="flex-1 rounded-lg border border-warm-light/20 bg-white px-3 py-2 font-serif text-sm text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                sendChatMessage()
                              }
                            }}
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || chatLoading}
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-copper-500 text-white transition-all duration-200 hover:bg-copper-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-mono-warm text-[8px] text-warm-light mt-1.5" style={{ letterSpacing: '1px' }}>
                          Press Enter to send, Shift+Enter for new line
                        </p>
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
