'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { SynthesizedLesson, ExtractedLesson, LessonBlock } from '@/lib/academy/types'
import {
  getChapterBySlug,
  getLessonsForChapter,
  getNextLesson,
  getPrevLesson,
} from '@/lib/academy/curriculum'
import { loadSynthesizedLesson, loadLessonContent, getStructuralSlideNumbers, isStructuralCaption } from '@/lib/academy/content-loader'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { useGuruUI } from '@/lib/academy/guru-ui-store'
import { useProgressSync } from '@/lib/academy/progress-sync'

import { BlockRenderer } from './BlockRenderer'
import { SynthesizedSidebar } from './SynthesizedSidebar'
import { LessonPresentationView } from '../LessonPresentationView'

import '../mentorship.css'
import './synthesized.css'

// Wisdom quotes for lessons
const WISDOM_QUOTES = [
  { text: 'To understand the whole, first understand how its parts relate. A good model illuminates the territory it represents.', attr: 'A principle for Guidewire learners' },
  { text: 'The expert has failed more times than the beginner has tried. Mastery comes from patience, not speed.', attr: 'Ancient proverb for developers' },
  { text: 'Configuration is the language of the system. Learn to speak it fluently, and the system will do your bidding.', attr: 'Guidewire Architecture Wisdom' },
  { text: 'Every line of code tells a story. The best code tells the simplest story that still captures the truth.', attr: 'Software craftsmanship tradition' },
  { text: 'The most powerful tool a developer has is understanding. Before you write, understand. Before you fix, understand.', attr: "Senior engineer's wisdom" },
]

export function SynthesizedLessonView() {
  const params = useParams()
  const router = useRouter()
  const mainRef = useRef<HTMLDivElement>(null)

  const chapterSlug = params.moduleId as string
  const lessonNumber = parseInt(params.lessonId as string, 10)

  // Store
  const {
    getLessonProgress,
    updateLessonStatus,
    updateScrollProgress,
    markBlockVisited,
    markVideoWatched,
    submitAssignment,
    completeLesson,
    setCurrentLesson,
    initializeProgress,
  } = useAcademyStore()
  const guruUI = useGuruUI()

  useProgressSync()

  // State
  const [synthesized, setSynthesized] = useState<SynthesizedLesson | null>(null)
  const [fallbackContent, setFallbackContent] = useState<ExtractedLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)

  // Derived data
  const chapter = getChapterBySlug(chapterSlug)
  const chapterLessons = chapter ? getLessonsForChapter(chapterSlug) : []
  const lessonMeta = chapterLessons.find((l) => l.lessonNumber === lessonNumber)
  const lessonId = lessonMeta?.lessonId ?? `${chapterSlug}-l${String(lessonNumber).padStart(2, '0')}`

  const progress = getLessonProgress(lessonId)
  const prevLesson = lessonMeta ? getPrevLesson(lessonId) : null
  const nextLesson = lessonMeta ? getNextLesson(lessonId) : null

  const wisdomQuote = useMemo(() =>
    WISDOM_QUOTES[Math.abs(lessonNumber * 7 + (chapter?.id ?? 0) * 13) % WISDOM_QUOTES.length],
    [lessonNumber, chapter?.id]
  )

  // Initialize
  useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  // Load synthesized content, fall back to original
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const synth = await loadSynthesizedLesson(chapterSlug, lessonNumber)
        if (cancelled) return

        if (synth && synth.blocks.length > 0) {
          // Filter structural slides (objectives, title, welcome) from concept figures
          const structuralSlides = await getStructuralSlideNumbers(chapterSlug, lessonNumber)
          const filtered: typeof synth = {
            ...synth,
            blocks: synth.blocks.map(block => {
              if (block.type === 'concept') {
                return {
                  ...block,
                  figures: block.figures.filter(fig =>
                    !structuralSlides.has(fig.slideNumber) &&
                    !isStructuralCaption(fig.caption || '')
                  ),
                }
              }
              return block
            }),
          }
          setSynthesized(filtered)
          setUseFallback(false)
        } else {
          // Load fallback
          const content = await loadLessonContent(chapterSlug, lessonNumber)
          if (cancelled) return
          setFallbackContent(content ?? null)
          setUseFallback(true)
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [chapterSlug, lessonNumber])

  // Reset scroll when lesson changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
    setActiveBlockId(null)
    setShowCompletion(false)
  }, [chapterSlug, lessonNumber])

  // Set current lesson — auto-unlock
  useEffect(() => {
    if (lessonId) {
      setCurrentLesson(lessonId)
      if (progress.status === 'locked' || progress.status === 'available') {
        updateLessonStatus(lessonId, 'in_progress')
      }
    }
  }, [lessonId, progress.status, setCurrentLesson, updateLessonStatus])

  // Scroll progress tracking
  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
        updateScrollProgress(lessonId, Math.round(pct))
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [lessonId, updateScrollProgress])

  // Track active block based on scroll position
  useEffect(() => {
    const el = mainRef.current
    if (!el || !synthesized) return

    function handleScroll() {
      const blockElements = el!.querySelectorAll('[id^="block-"]')
      let closest: string | null = null
      let closestDist = Infinity

      blockElements.forEach((blockEl) => {
        const rect = blockEl.getBoundingClientRect()
        const mainRect = el!.getBoundingClientRect()
        const dist = Math.abs(rect.top - mainRect.top)
        if (dist < closestDist) {
          closestDist = dist
          closest = blockEl.id.replace('block-', '')
        }
      })

      if (closest) {
        setActiveBlockId(closest)
        markBlockVisited(lessonId, closest)
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [synthesized, lessonId, markBlockVisited])

  // Handlers
  const handleVideoWatched = useCallback(
    (filename: string) => markVideoWatched(lessonId, filename),
    [lessonId, markVideoWatched]
  )

  const handleAssignmentSubmit = useCallback(
    (_id: string, response: string) => submitAssignment(lessonId, response),
    [lessonId, submitAssignment]
  )

  const handleCompleteLesson = useCallback(() => {
    completeLesson(lessonId)
    setShowCompletion(true)
    setTimeout(() => setShowCompletion(false), 4000)
  }, [lessonId, completeLesson])

  const scrollToBlock = useCallback((blockId: string) => {
    const el = document.getElementById(`block-${blockId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Derived data from synthesized content
  const blocks = synthesized?.blocks ?? []
  const videos = synthesized?.videos ?? []

  const kcBlocks = useMemo(
    () => blocks.filter((b): b is Extract<LessonBlock, { type: 'knowledge_check' }> => b.type === 'knowledge_check'),
    [blocks]
  )

  const allKcKeys = useMemo(
    () => kcBlocks.map((kc) => kc.questionKey),
    [kcBlocks]
  )

  const visitedBlocks = useMemo(
    () => new Set(progress.blocksVisited ?? []),
    [progress.blocksVisited]
  )

  const canComplete = useCallback(() => {
    if (progress.status === 'completed') return false
    if (progress.scrollProgress < 80) return false
    const answers = progress.knowledgeCheckAnswers || {}
    for (const key of allKcKeys) {
      if (!answers[key]) return false
    }
    if (lessonMeta?.hasAssignment && !progress.assignmentSubmitted) return false
    return true
  }, [progress, allKcKeys, lessonMeta])

  // Progress stats for sidebar
  const totalItems = useMemo(() => {
    let count = blocks.filter(b => b.type === 'concept').length > 0 ? 1 : 0
    count += videos.length
    count += allKcKeys.length
    if (lessonMeta?.hasAssignment) count++
    return Math.max(count, 1)
  }, [blocks, videos, allKcKeys, lessonMeta])

  const completedItems = useMemo(() => {
    let count = 0
    if (progress.scrollProgress >= 90) count++
    count += progress.videosWatched.length
    const answers = progress.knowledgeCheckAnswers || {}
    count += allKcKeys.filter((k) => answers[k]).length
    if (progress.assignmentSubmitted) count++
    return count
  }, [progress, allKcKeys])

  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // SVG circle math for progress ring
  const circumference = 2 * Math.PI * 24
  const dashOffset = circumference * (1 - progressPct / 100)

  // KC index tracker for block rendering
  let kcIndexCounter = 0

  // --- Error / Loading states ---

  if (!chapter || !lessonMeta) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h2 className="font-heading font-bold text-charcoal-900 text-lg">Lesson Not Found</h2>
          <button
            onClick={() => router.push('/academy/learn')}
            className="mt-3 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mentorship-view flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--m-accent-warm, #c06830)' }} />
          <p style={{ color: 'var(--m-text-muted, #9a9088)', fontSize: 14 }}>Loading lesson...</p>
        </div>
      </div>
    )
  }

  // Fallback to original LessonPresentationView
  if (useFallback) {
    return <LessonPresentationView />
  }

  // --- Main synthesized render ---

  return (
    <div className="mentorship-view flex-1 flex flex-col overflow-hidden">
      <div className="m-layout">

        {/* ====== LEFT SIDEBAR ====== */}
        <div className="m-sidebar-left">
          {/* Sensei card */}
          <div className="m-sensei-card">
            <div className="m-sensei-avatar">G</div>
            <div style={{ minWidth: 0 }}>
              <div className="m-sensei-name">Guidewire Guru</div>
              <div className="m-sensei-role">Your Guidewire Sensei</div>
              <div className="m-sensei-status">Available</div>
            </div>
          </div>

          {/* Block-based navigation */}
          <SynthesizedSidebar
            blocks={blocks}
            activeBlockId={activeBlockId}
            visitedBlocks={visitedBlocks}
            onBlockClick={scrollToBlock}
          />
        </div>

        {/* ====== MAIN CONTENT ====== */}
        <main className="m-main" ref={mainRef}>

          {/* Welcome banner */}
          <div className="m-welcome m-animate">
            <div className="m-welcome-greeting">Welcome back, Student</div>
            <div className="m-welcome-message">
              {progress.status === 'completed'
                ? "You've already completed this lesson. Feel free to review the material at your own pace."
                : synthesized?.subtitle || `Let's explore ${lessonMeta.title.toLowerCase()}. Take your time with this one.`
              }
            </div>
          </div>

          {/* Lesson header */}
          <div className="m-lesson-header">
            <div className="m-lesson-tag">
              <span className="m-lesson-tag-dot" />
              Chapter {chapter.id} &middot; Lesson {lessonMeta.lessonNumber}
            </div>
            <h1 className="m-lesson-title">{lessonMeta.title}</h1>
            <p className="m-lesson-intro">
              {chapter.title} &mdash; {chapter.description}
            </p>
            <div className="m-time-row">
              <span>~{synthesized?.estimatedMinutes ?? lessonMeta.estimatedMinutes} minutes</span>
              {videos.length > 0 && (
                <>
                  <span className="m-time-dot" />
                  <span>{videos.length} demo{videos.length > 1 ? 's' : ''}</span>
                </>
              )}
              {lessonMeta.hasAssignment && (
                <>
                  <span className="m-time-dot" />
                  <span>1 assignment</span>
                </>
              )}
              {progress.status === 'completed' && (
                <>
                  <span className="m-time-dot" />
                  <span style={{ color: 'var(--m-accent-sage)' }}>Completed</span>
                </>
              )}
            </div>
          </div>

          {/* Wisdom card */}
          <div className="m-wisdom">
            <div className="m-wisdom-text">{wisdomQuote.text}</div>
            <div className="m-wisdom-attr">&mdash; {wisdomQuote.attr}</div>
          </div>

          {/* Render all blocks */}
          {blocks.map((block) => {
            let kcIdx = 0
            if (block.type === 'knowledge_check') {
              kcIdx = kcIndexCounter
              kcIndexCounter++
            }

            return (
              <BlockRenderer
                key={block.id}
                block={block}
                chapterSlug={chapterSlug}
                lessonNumber={lessonNumber}
                lessonId={lessonId}
                videos={videos}
                onVideoWatched={handleVideoWatched}
                watchedVideos={progress.videosWatched}
                assignmentPdf={lessonMeta.assignmentPdf}
                solutionPdf={lessonMeta.solutionPdf}
                onAssignmentSubmit={handleAssignmentSubmit}
                isAssignmentSubmitted={progress.assignmentSubmitted}
                assignmentResponse={progress.assignmentResponse}
                kcIndex={kcIdx}
                totalKCs={kcBlocks.length}
              />
            )
          })}

          {/* Complete / Completed */}
          {progress.status === 'completed' ? (
            <div className="m-completion">
              <div className="m-completion-icon">
                <CheckCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3>Lesson Complete!</h3>
                <p>
                  {progress.completedAt
                    ? `Completed on ${new Date(progress.completedAt).toLocaleDateString()}`
                    : 'Great work on this lesson!'}
                </p>
              </div>
              {nextLesson && (
                <button
                  className="m-practice-btn"
                  onClick={() => router.push(`/academy/lesson/${nextLesson.chapterSlug}/${nextLesson.lessonNumber}`)}
                >
                  Next Lesson &rarr;
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <button
                className="m-complete-btn"
                onClick={handleCompleteLesson}
                disabled={!canComplete()}
              >
                <Trophy size={18} />
                Complete Lesson
              </button>
              {!canComplete() && (
                <p style={{ fontSize: 12, color: 'var(--m-text-muted)', marginTop: 8 }}>
                  {progress.scrollProgress < 80
                    ? 'Keep reading to complete all content'
                    : allKcKeys.some((k) => !(progress.knowledgeCheckAnswers || {})[k])
                      ? 'Complete all knowledge checks'
                      : lessonMeta.hasAssignment && !progress.assignmentSubmitted
                        ? 'Submit your assignment'
                        : 'Complete all requirements'}
                </p>
              )}
            </div>
          )}

          {/* Progress footer */}
          <div className="m-progress-footer">
            <div className="m-progress-bar">
              <div className="m-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="m-progress-label">
              <strong>{progressPct}%</strong> complete
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingBottom: 40 }}>
            {prevLesson && (
              <button
                className="m-practice-btn"
                style={{ background: 'var(--m-bg-cream)', color: 'var(--m-text-secondary)', boxShadow: 'none', border: '1px solid var(--m-border)' }}
                onClick={() => router.push(`/academy/lesson/${prevLesson.chapterSlug}/${prevLesson.lessonNumber}`)}
              >
                <ChevronLeft size={16} />
                Previous Lesson
              </button>
            )}
            {nextLesson && (
              <button
                className="m-practice-btn"
                style={{ marginLeft: 'auto' }}
                onClick={() => router.push(`/academy/lesson/${nextLesson.chapterSlug}/${nextLesson.lessonNumber}`)}
              >
                Next Lesson
                <ChevronRight size={16} />
              </button>
            )}
          </div>

        </main>

        {/* ====== RIGHT SIDEBAR ====== */}
        <aside className="m-sidebar-right">

          {/* Progress ring */}
          <div className="m-aside-section">
            <div className="m-aside-label">Your Progress</div>
            <div className="m-progress-block">
              <div style={{ width: 56, height: 56, position: 'relative', flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle className="m-ring-bg" cx="28" cy="28" r="24" />
                  <circle
                    className="m-ring-fill"
                    cx="28" cy="28" r="24"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <div className="m-ring-text">{progressPct}%</div>
              </div>
              <div className="m-progress-detail">
                <strong>{completedItems} of {totalItems} items</strong>
                completed so far
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="m-aside-section">
            <div className="m-aside-label">This Lesson</div>
            <div className="m-duration-card">
              <div className="m-duration-value">{synthesized?.estimatedMinutes ?? lessonMeta.estimatedMinutes}</div>
              <div className="m-duration-meta">
                <strong>minutes</strong>
                {blocks.filter(b => b.type === 'concept').length} sections &middot; {videos.length} video{videos.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Sensei mini */}
          <div className="m-aside-section">
            <div className="m-aside-label">Your Sensei</div>
            <div className="m-instructor-mini">
              <div className="m-instructor-mini-avatar">G</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--m-text-primary)' }}>
                  Guidewire Guru
                </div>
                <div style={{ fontSize: 11, color: 'var(--m-text-muted)', marginTop: 1 }}>
                  Sr. Guidewire Architect
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="m-aside-section">
            <div className="m-aside-label">Resources</div>
            {lessonMeta.hasAssignment && lessonMeta.assignmentPdf && (
              <div
                className="m-resource-item"
                onClick={() => {
                  const el = document.getElementById('assignment-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <div className="m-resource-icon">📄</div>
                <span>Assignment PDF</span>
              </div>
            )}
            <div className="m-resource-item" onClick={() => router.push('/academy/learn')}>
              <div className="m-resource-icon">📚</div>
              <span>Back to Dashboard</span>
            </div>
            {videos.length > 0 && (
              <div className="m-resource-item" onClick={() => {
                const el = document.querySelector('.m-video-block')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}>
                <div className="m-resource-icon">🎥</div>
                <span>Demo Video{videos.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Ask Sensei */}
          <div className="m-aside-section">
            <div className="m-ask-sensei" onClick={() => guruUI.open()}>
              <div className="m-ask-sensei-icon">💬</div>
              <div className="m-ask-sensei-text">
                <strong>Stuck on something?</strong>
                Ask Guidewire Guru for help
              </div>
            </div>
          </div>

          {/* Up Next */}
          {nextLesson && (
            <div className="m-aside-section">
              <div className="m-aside-label">Up Next</div>
              <div
                className="m-up-next"
                onClick={() => router.push(`/academy/lesson/${nextLesson.chapterSlug}/${nextLesson.lessonNumber}`)}
              >
                <div className="m-up-next-eyebrow">
                  Lesson {nextLesson.lessonNumber}
                </div>
                <div className="m-up-next-title">{nextLesson.title}</div>
                <div className="m-up-next-desc">
                  ~{nextLesson.estimatedMinutes} min
                </div>
                <div className="m-up-next-arrow">→</div>
              </div>
            </div>
          )}

        </aside>

      </div>

      {/* Completion toast */}
      {showCompletion && (
        <div className="m-toast">
          <div className="m-toast-inner">
            <div className="m-completion-icon" style={{ width: 40, height: 40 }}>
              <Trophy size={18} />
            </div>
            <div>
              <p className="m-display" style={{ fontWeight: 600, fontSize: 14 }}>Lesson Completed!</p>
              <p style={{ fontSize: 12, color: 'var(--m-text-muted)' }}>Keep up the great work</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
