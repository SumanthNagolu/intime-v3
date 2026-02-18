'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Target,
  Shuffle,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewPrepData, InterviewQA } from '@/lib/academy/types'
import { loadInterviewPrep } from '@/lib/academy/content-loader'

export function CardsMode() {
  const [data, setData] = useState<InterviewPrepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState('all')
  const [questions, setQuestions] = useState<(InterviewQA & { sourceDoc?: string })[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isFlipping, setIsFlipping] = useState(false)

  // Load data
  useEffect(() => {
    loadInterviewPrep().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  // All QA pairs
  const allQA = useMemo(() => {
    if (!data) return []
    return data.documents.flatMap((doc) =>
      doc.qaPairs.map((qa) => ({ ...qa, sourceDoc: doc.title }))
    )
  }, [data])

  // Topics
  const topics = useMemo(() => {
    const topicSet = new Set(allQA.map((q) => q.topic).filter(Boolean))
    return ['all', ...Array.from(topicSet).sort()]
  }, [allQA])

  // Filtered QA
  const filteredQA = useMemo(() => {
    if (topicFilter === 'all') return allQA
    return allQA.filter((q) => q.topic === topicFilter)
  }, [allQA, topicFilter])

  // Shuffle and start
  const shuffle = useCallback(() => {
    const shuffled = [...filteredQA].sort(() => Math.random() - 0.5).slice(0, 20)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setShowAnswer(false)
    setScore({ correct: 0, total: 0 })
  }, [filteredQA])

  // Auto-shuffle on filter change or first load
  useEffect(() => {
    if (filteredQA.length > 0 && questions.length === 0) {
      shuffle()
    }
  }, [filteredQA]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[currentIndex]
  const isComplete = currentIndex >= questions.length && questions.length > 0

  const handleAnswer = useCallback(
    (gotIt: boolean) => {
      setIsFlipping(true)
      setTimeout(() => {
        setScore((s) => ({
          correct: s.correct + (gotIt ? 1 : 0),
          total: s.total + 1,
        }))
        setShowAnswer(false)
        setCurrentIndex((i) => i + 1)
        setIsFlipping(false)
      }, 200)
    },
    []
  )

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
          <p className="text-sm text-charcoal-500">No flashcard data available.</p>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isComplete) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className="flex items-center justify-center h-full bg-cream">
        <div className="text-center space-y-6 animate-fade-in max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center mx-auto">
            <Target className="w-10 h-10 text-gold-600" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">
              Round Complete!
            </h2>
            <p className="text-charcoal-500 mt-2">
              You got <span className="font-bold text-charcoal-900">{score.correct}</span> out
              of <span className="font-bold text-charcoal-900">{score.total}</span> correct
            </p>
          </div>

          {/* Score ring */}
          <div className="relative w-28 h-28 mx-auto">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#f0ebe3" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke={pct >= 70 ? '#0A8754' : pct >= 40 ? '#D97706' : '#DC2626'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - pct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-charcoal-900">{pct}%</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={shuffle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <Shuffle className="w-4 h-4" />
              New Round
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-charcoal-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-charcoal-400" />
          <select
            value={topicFilter}
            onChange={(e) => {
              setTopicFilter(e.target.value)
              // Reset on filter change
              const filtered = e.target.value === 'all' ? allQA : allQA.filter((q) => q.topic === e.target.value)
              const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 20)
              setQuestions(shuffled)
              setCurrentIndex(0)
              setShowAnswer(false)
              setScore({ correct: 0, total: 0 })
            }}
            className="px-3 py-1.5 rounded-lg border border-charcoal-200 text-sm bg-white focus:ring-2 focus:ring-gold-500/20"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? `All Topics (${allQA.length})` : t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-bold text-green-600 tabular-nums">{score.correct}</span>
            <span className="text-charcoal-300 mx-1">/</span>
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="font-bold text-red-500 tabular-nums">{score.total - score.correct}</span>
          </div>
          <button
            onClick={shuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Shuffle
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-charcoal-100 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Card counter */}
        <p className="text-xs text-charcoal-400 mb-6 tabular-nums">
          Card {currentIndex + 1} of {questions.length}
        </p>

        {/* The card */}
        <div
          className={cn(
            'w-full max-w-2xl rounded-2xl border-2 bg-white shadow-elevation-md overflow-hidden transition-all duration-300',
            showAnswer ? 'border-gold-300' : 'border-charcoal-200',
            isFlipping && 'opacity-0 scale-95'
          )}
        >
          {/* Question */}
          <div className="p-8 sm:p-10">
            {currentQuestion.topic && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-charcoal-100 text-charcoal-600 uppercase tracking-wider">
                  {currentQuestion.topic}
                </span>
              </div>
            )}
            <p className="text-lg sm:text-xl font-medium text-charcoal-900 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer reveal */}
          {showAnswer && (
            <div className="border-t border-gold-200 bg-gradient-to-b from-gold-50/50 to-white">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                    Answer
                  </span>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                  {currentQuestion.answer || 'No answer provided.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-3">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <Eye className="w-4 h-4" />
              Show Answer
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAnswer(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-700 border-2 border-red-200 text-sm font-medium hover:bg-red-100 hover:-translate-y-0.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Didn&apos;t Know
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 text-green-700 border-2 border-green-200 text-sm font-medium hover:bg-green-100 hover:-translate-y-0.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Got It
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
