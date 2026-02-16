'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Clock,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shuffle,
  Filter,
  Loader2,
  Sparkles,
  Brain,
  Flame,
  Mic,
  MicOff,
} from 'lucide-react'
import type {
  InterviewPrepData,
  InterviewDocument,
  InterviewQA,
  InterviewDifficulty,
  MockInterviewSession,
} from '@/lib/academy/types'
import { loadInterviewPrep } from '@/lib/academy/content-loader'

type ViewMode = 'browse' | 'practice' | 'mock'

export function InterviewPrep() {
  const [data, setData] = useState<InterviewPrepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceShowAnswer, setPracticeShowAnswer] = useState(false)
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 })
  const [practiceQuestions, setPracticeQuestions] = useState<InterviewQA[]>([])
  const [topicFilter, setTopicFilter] = useState<string>('all')

  // Mock interview state
  const [mockSession, setMockSession] = useState<MockInterviewSession | null>(null)
  const [mockAnswer, setMockAnswer] = useState('')
  const [mockShowFeedback, setMockShowFeedback] = useState(false)
  const [mockTimer, setMockTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

  // Load data
  useEffect(() => {
    async function load() {
      const prepData = await loadInterviewPrep()
      setData(prepData)
      setLoading(false)
    }
    load()
  }, [])

  // Timer effect
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setMockTimer((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  // Get all Q&A pairs across documents
  const allQA = useMemo(() => {
    if (!data) return []
    return data.documents.flatMap((doc) =>
      doc.qaPairs.map((qa) => ({
        ...qa,
        sourceDoc: doc.title,
      }))
    )
  }, [data])

  // Get unique topics
  const topics = useMemo(() => {
    const topicSet = new Set(allQA.map((q) => q.topic).filter(Boolean))
    return ['all', ...Array.from(topicSet).sort()]
  }, [allQA])

  // Filtered Q&A
  const filteredQA = useMemo(() => {
    let filtered = allQA
    if (topicFilter !== 'all') {
      filtered = filtered.filter((q) => q.topic === topicFilter)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [allQA, topicFilter, searchQuery])

  // Start practice mode
  const startPractice = useCallback(() => {
    const shuffled = [...filteredQA].sort(() => Math.random() - 0.5)
    setPracticeQuestions(shuffled.slice(0, 20))
    setPracticeIndex(0)
    setPracticeShowAnswer(false)
    setPracticeScore({ correct: 0, total: 0 })
    setViewMode('practice')
  }, [filteredQA])

  // Start mock interview
  const startMockInterview = useCallback(
    (difficulty: InterviewDifficulty) => {
      const count = { beginner: 10, intermediate: 15, advanced: 20 }[difficulty]
      const shuffled = [...allQA].sort(() => Math.random() - 0.5).slice(0, count)
      const timerMin = { beginner: 30, intermediate: 45, advanced: 60 }[difficulty]

      setMockSession({
        id: Date.now().toString(),
        difficulty,
        topics: [...new Set(shuffled.map((q) => q.topic).filter(Boolean))],
        questions: shuffled,
        currentIndex: 0,
        answers: [],
        startedAt: new Date().toISOString(),
        timerMinutes: timerMin,
      })
      setMockAnswer('')
      setMockShowFeedback(false)
      setMockTimer(0)
      setTimerRunning(true)
      setViewMode('mock')
    },
    [allQA]
  )

  const submitMockAnswer = useCallback(() => {
    if (!mockSession) return
    const current = mockSession.questions[mockSession.currentIndex]
    const isReasonable = mockAnswer.trim().length > 10

    setMockSession((prev) =>
      prev
        ? {
            ...prev,
            answers: [
              ...prev.answers,
              {
                question: current.question,
                userAnswer: mockAnswer,
                score: isReasonable ? 1 : 0,
              },
            ],
          }
        : null
    )
    setMockShowFeedback(true)
  }, [mockSession, mockAnswer])

  const nextMockQuestion = useCallback(() => {
    if (!mockSession) return
    if (mockSession.currentIndex >= mockSession.questions.length - 1) {
      setTimerRunning(false)
      setMockSession((prev) =>
        prev ? { ...prev, completedAt: new Date().toISOString() } : null
      )
    } else {
      setMockSession((prev) =>
        prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null
      )
      setMockAnswer('')
      setMockShowFeedback(false)
    }
  }, [mockSession])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
          <p className="text-sm text-charcoal-500">
            Loading interview preparation material...
          </p>
        </div>
      </div>
    )
  }

  if (!data || data.totalQuestions === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Brain className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h3 className="font-semibold text-charcoal-800">
            No Interview Questions Available
          </h3>
          <p className="text-sm text-charcoal-500">
            Interview prep data is still being processed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-gold-600" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
              Interview Preparation
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight">
            Interview Assist
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            {data.totalQuestions.toLocaleString()} questions from{' '}
            {data.totalDocuments} sources
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-charcoal-100">
          {[
            { id: 'browse' as ViewMode, label: 'Browse', icon: BookOpen },
            { id: 'practice' as ViewMode, label: 'Flashcards', icon: Shuffle },
            { id: 'mock' as ViewMode, label: 'Mock Interview', icon: Mic },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'practice') startPractice()
                else if (tab.id === 'mock') setViewMode('mock')
                else setViewMode('browse')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                viewMode === tab.id
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Browse mode */}
      {viewMode === 'browse' && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-charcoal-200 text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
              />
            </div>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-charcoal-200 text-sm bg-white focus:ring-2 focus:ring-gold-500/20"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Topics' : t}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-charcoal-400">
            Showing {filteredQA.length} of {allQA.length} questions
          </p>

          {/* Questions list */}
          <div className="space-y-3">
            {filteredQA.slice(0, 50).map((qa, i) => (
              <div
                key={i}
                className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden"
              >
                <button
                  onClick={() =>
                    setShowAnswers((prev) => ({
                      ...prev,
                      [i]: !prev[i],
                    }))
                  }
                  className="w-full flex items-start gap-3 p-5 text-left hover:bg-charcoal-50/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-charcoal-600">
                      Q
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 leading-relaxed">
                      {qa.question}
                    </p>
                    {qa.topic && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-charcoal-100 text-charcoal-600">
                        {qa.topic}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-charcoal-400 flex-shrink-0 transition-transform ${
                      showAnswers[i] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {showAnswers[i] && qa.answer && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-10 border-l-2 border-gold-400/60 ml-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3 h-3 text-gold-600" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                          Answer
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                        {qa.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredQA.length > 50 && (
              <p className="text-center text-xs text-charcoal-400 py-4">
                Showing 50 of {filteredQA.length} results. Narrow your search
                for more specific results.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Practice / Flashcard mode */}
      {viewMode === 'practice' && practiceQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-600">
              Question {practiceIndex + 1} of {practiceQuestions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-green-600 font-medium">
                {practiceScore.correct} correct
              </span>
              <span className="text-sm text-charcoal-400">
                of {practiceScore.total} answered
              </span>
            </div>
          </div>

          <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-300"
              style={{
                width: `${((practiceIndex + 1) / practiceQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Card */}
          <div className="rounded-xl border-2 border-charcoal-200 bg-white shadow-elevation-md p-8 min-h-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-gold-600" />
              {practiceQuestions[practiceIndex].topic && (
                <span className="text-xs text-charcoal-500">
                  {practiceQuestions[practiceIndex].topic}
                </span>
              )}
            </div>

            <p className="text-lg font-medium text-charcoal-900 leading-relaxed flex-1">
              {practiceQuestions[practiceIndex].question}
            </p>

            {practiceShowAnswer && (
              <div className="mt-6 pt-6 border-t border-charcoal-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                    Answer
                  </span>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                  {practiceQuestions[practiceIndex].answer || 'No answer provided for this question.'}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!practiceShowAnswer ? (
              <button
                onClick={() => setPracticeShowAnswer(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Show Answer
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setPracticeScore((s) => ({
                      correct: s.correct,
                      total: s.total + 1,
                    }))
                    setPracticeShowAnswer(false)
                    setPracticeIndex((i) =>
                      Math.min(i + 1, practiceQuestions.length - 1)
                    )
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Didn&apos;t Know
                </button>
                <button
                  onClick={() => {
                    setPracticeScore((s) => ({
                      correct: s.correct + 1,
                      total: s.total + 1,
                    }))
                    setPracticeShowAnswer(false)
                    setPracticeIndex((i) =>
                      Math.min(i + 1, practiceQuestions.length - 1)
                    )
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-medium hover:bg-green-100 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Got It
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => startPractice()}
              className="flex items-center gap-2 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Shuffle &amp; Restart
            </button>
          </div>
        </div>
      )}

      {/* Mock Interview mode */}
      {viewMode === 'mock' && !mockSession && (
        <div className="max-w-xl mx-auto space-y-8 py-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-charcoal-900 flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-gold-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">
              Mock Interview
            </h2>
            <p className="text-sm text-charcoal-500">
              Simulate a real Guidewire developer interview. Choose your
              difficulty level:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
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
              ] as const
            ).map((opt) => (
              <button
                key={opt.level}
                onClick={() => startMockInterview(opt.level)}
                className="rounded-xl border-2 border-charcoal-200 bg-white p-6 text-left hover:border-charcoal-400 hover:-translate-y-1 hover:shadow-elevation-md transition-all"
              >
                <h3 className="font-semibold text-charcoal-900 mb-1">
                  {opt.label}
                </h3>
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
      )}

      {viewMode === 'mock' && mockSession && !mockSession.completedAt && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Timer + progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-charcoal-600">
                Question {mockSession.currentIndex + 1} of{' '}
                {mockSession.questions.length}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-charcoal-100 text-charcoal-600 uppercase">
                {mockSession.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal-400" />
              <span
                className={`text-sm font-mono tabular-nums ${
                  mockTimer > mockSession.timerMinutes * 60
                    ? 'text-red-500'
                    : 'text-charcoal-700'
                }`}
              >
                {formatTime(mockTimer)}
              </span>
            </div>
          </div>

          <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all"
              style={{
                width: `${((mockSession.currentIndex + 1) / mockSession.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-8">
            <p className="text-lg font-medium text-charcoal-900 leading-relaxed mb-6">
              {mockSession.questions[mockSession.currentIndex].question}
            </p>

            <textarea
              value={mockAnswer}
              onChange={(e) => setMockAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={mockShowFeedback}
              className="w-full rounded-lg border border-charcoal-200 px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all resize-y disabled:bg-charcoal-50"
            />

            {mockShowFeedback && (
              <div className="mt-4 p-4 rounded-lg bg-gold-50 border border-gold-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                    Reference Answer
                  </span>
                </div>
                <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                  {mockSession.questions[mockSession.currentIndex].answer || 'No reference answer available.'}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              {!mockShowFeedback ? (
                <button
                  onClick={submitMockAnswer}
                  disabled={!mockAnswer.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40"
                >
                  Submit Answer
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={nextMockQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  {mockSession.currentIndex >=
                  mockSession.questions.length - 1
                    ? 'Finish Interview'
                    : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mock interview complete */}
      {viewMode === 'mock' && mockSession?.completedAt && (
        <div className="max-w-xl mx-auto space-y-8 py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">
              Interview Complete!
            </h2>
            <p className="text-sm text-charcoal-500">
              Duration: {formatTime(mockTimer)} &bull;{' '}
              {mockSession.questions.length} questions answered
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900">
                {mockSession.answers.filter((a) => a.score > 0).length}
              </p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">
                Answered
              </p>
            </div>
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900">
                {formatTime(mockTimer)}
              </p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">
                Time
              </p>
            </div>
            <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-charcoal-900 capitalize">
                {mockSession.difficulty}
              </p>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">
                Level
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setMockSession(null)}
              className="px-5 py-2.5 rounded-lg border border-charcoal-200 text-charcoal-700 text-sm font-medium hover:bg-charcoal-50 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className="px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Back to Browse
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
