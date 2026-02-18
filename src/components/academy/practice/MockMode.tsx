'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Mic,
  Clock,
  ChevronRight,
  Trophy,
  Loader2,
  Sparkles,
  Brain,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  InterviewPrepData,
  InterviewQA,
  InterviewDifficulty,
  MockInterviewSession,
} from '@/lib/academy/types'
import { loadInterviewPrep } from '@/lib/academy/content-loader'

const DIFFICULTY_OPTIONS = [
  {
    level: 'beginner' as InterviewDifficulty,
    label: 'Beginner',
    questions: 10,
    time: 30,
    desc: 'Fundamental concepts, basic PolicyCenter questions',
  },
  {
    level: 'intermediate' as InterviewDifficulty,
    label: 'Intermediate',
    questions: 15,
    time: 45,
    desc: 'Configuration, Gosu programming, data model',
  },
  {
    level: 'advanced' as InterviewDifficulty,
    label: 'Advanced',
    questions: 20,
    time: 60,
    desc: 'Architecture, integrations, complex scenarios',
  },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockMode() {
  const [data, setData] = useState<InterviewPrepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<MockInterviewSession | null>(null)
  const [answer, setAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

  // Load data
  useEffect(() => {
    loadInterviewPrep().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  // Timer
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const allQA = useMemo(() => {
    if (!data) return []
    return data.documents.flatMap((doc) =>
      doc.qaPairs.map((qa) => ({ ...qa, sourceDoc: doc.title }))
    )
  }, [data])

  const startInterview = useCallback(
    (difficulty: InterviewDifficulty) => {
      const count = { beginner: 10, intermediate: 15, advanced: 20 }[difficulty]
      const timerMin = { beginner: 30, intermediate: 45, advanced: 60 }[difficulty]
      const shuffled = [...allQA].sort(() => Math.random() - 0.5).slice(0, count)

      setSession({
        id: Date.now().toString(),
        difficulty,
        topics: [...new Set(shuffled.map((q) => q.topic).filter(Boolean))],
        questions: shuffled,
        currentIndex: 0,
        answers: [],
        startedAt: new Date().toISOString(),
        timerMinutes: timerMin,
      })
      setAnswer('')
      setShowFeedback(false)
      setTimer(0)
      setTimerRunning(true)
    },
    [allQA]
  )

  const submitAnswer = useCallback(() => {
    if (!session) return
    const current = session.questions[session.currentIndex]
    const isReasonable = answer.trim().length > 10

    setSession((prev) =>
      prev
        ? {
            ...prev,
            answers: [
              ...prev.answers,
              { question: current.question, userAnswer: answer, score: isReasonable ? 1 : 0 },
            ],
          }
        : null
    )
    setShowFeedback(true)
  }, [session, answer])

  const nextQuestion = useCallback(() => {
    if (!session) return
    if (session.currentIndex >= session.questions.length - 1) {
      setTimerRunning(false)
      setSession((prev) => (prev ? { ...prev, completedAt: new Date().toISOString() } : null))
    } else {
      setSession((prev) => (prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null))
      setAnswer('')
      setShowFeedback(false)
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
      </div>
    )
  }

  if (!data || allQA.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Brain className="w-12 h-12 text-charcoal-300 mx-auto" />
          <p className="text-sm text-charcoal-500">No interview data available.</p>
        </div>
      </div>
    )
  }

  // Difficulty picker
  if (!session) {
    return (
      <div className="flex items-center justify-center h-full bg-cream">
        <div className="max-w-xl w-full space-y-8 px-6 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-charcoal-900 flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-gold-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">Mock Interview</h2>
            <p className="text-sm text-charcoal-500">
              Simulate a real Guidewire developer interview. Choose your difficulty:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.level}
                onClick={() => startInterview(opt.level)}
                className="rounded-xl border-2 border-charcoal-200 bg-white p-6 text-left hover:border-charcoal-400 hover:-translate-y-1 hover:shadow-elevation-md transition-all"
              >
                <h3 className="font-semibold text-charcoal-900 mb-1">{opt.label}</h3>
                <p className="text-xs text-charcoal-500 mb-4">{opt.desc}</p>
                <div className="flex items-center gap-3 text-[10px] text-charcoal-400 uppercase tracking-wider">
                  <span>{opt.questions} questions</span>
                  <span>&bull;</span>
                  <span>{opt.time} min</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Completed screen
  if (session.completedAt) {
    const answered = session.answers.filter((a) => a.score > 0).length
    return (
      <div className="flex items-center justify-center h-full bg-cream">
        <div className="max-w-xl w-full space-y-8 px-6 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">
              Interview Complete!
            </h2>
            <p className="text-sm text-charcoal-500">
              Duration: {formatTime(timer)} &bull; {session.questions.length} questions answered
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900">{answered}</p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">Answered</p>
            </div>
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900">{formatTime(timer)}</p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">Time</p>
            </div>
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900 capitalize">{session.difficulty}</p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">Level</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSession(null)}
              className="px-5 py-2.5 rounded-lg border border-charcoal-200 text-charcoal-700 text-sm font-medium hover:bg-charcoal-50 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => startInterview(session.difficulty)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              New Round
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active interview
  const currentQ = session.questions[session.currentIndex]
  const progress = ((session.currentIndex + 1) / session.questions.length) * 100
  const overTime = timer > session.timerMinutes * 60

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-charcoal-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-charcoal-600">
            Question {session.currentIndex + 1} of {session.questions.length}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-charcoal-100 text-charcoal-600 uppercase">
            {session.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-charcoal-400" />
          <span
            className={cn(
              'text-sm font-mono tabular-nums',
              overTime ? 'text-red-500' : 'text-charcoal-700'
            )}
          >
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-charcoal-100 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-8">
            {currentQ.topic && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-charcoal-100 text-charcoal-600 uppercase tracking-wider">
                  {currentQ.topic}
                </span>
              </div>
            )}

            <p className="text-lg font-medium text-charcoal-900 leading-relaxed mb-6">
              {currentQ.question}
            </p>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={showFeedback}
              className="w-full rounded-lg border border-charcoal-200 px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all resize-y disabled:bg-charcoal-50"
            />

            {showFeedback && (
              <div className="mt-4 p-4 rounded-lg bg-gold-50 border border-gold-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                    Reference Answer
                  </span>
                </div>
                <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                  {currentQ.answer || 'No reference answer available.'}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40"
                >
                  Submit Answer
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  {session.currentIndex >= session.questions.length - 1
                    ? 'Finish Interview'
                    : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
