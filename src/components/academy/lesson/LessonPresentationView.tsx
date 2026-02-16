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
import type { ExtractedLesson, SlideContent } from '@/lib/academy/types'
import {
  getChapterBySlug,
  getLessonsForChapter,
  getNextLesson,
  getPrevLesson,
} from '@/lib/academy/curriculum'
import { loadLessonContent } from '@/lib/academy/content-loader'
import { useAcademyStore } from '@/lib/academy/progress-store'

import { MentorshipSlide } from './MentorshipSlide'
import { DemoVideo } from './DemoVideo'
import { KnowledgeCheckCard } from './KnowledgeCheckCard'
import { AssignmentBlock } from './AssignmentBlock'

import './mentorship.css'

// --- Slide categorization ---
// Simple rules (Guidewire training PPT structure):
//  1. Slide 1 (index 0) → title slide (skip)
//  2. Slide 2 (index 1) → objectives slide (skip — always objectives in GW PPTs)
//  3. Title contains "objectives" → objectives (catch-all for any position)
//  4. Title starts with "Demo:" or contains "demonstration" → demo (skip)
//  5. Title starts with "Summary/Conclusion/Recap/Review:/Key Takeaway/Next Steps" → review
//  6. slideType=question OR questionData OR title "Knowledge Check" → question (KC cards)
//  7. slideType=exercise OR title contains "exercise"/"lab environment" → exercise (skip)
//  8. Empty (no title, no notes, no body) → empty (skip)
//  9. Everything else → content (shown)

type SlideCategory = 'title' | 'objectives' | 'demo' | 'review' | 'question' | 'empty' | 'exercise' | 'content'

function categorizeSlide(slide: SlideContent, index: number): SlideCategory {
  const title = (slide.title || '').toLowerCase().trim()

  // 1. First slide is always the title/intro slide — skip
  if (index === 0) return 'title'

  // 6. Knowledge Check — has questionData or explicit question type
  if (slide.questionData || slide.slideType === 'question' || title === 'knowledge check') {
    return 'question'
  }

  // 8. Empty — no title, no notes, no body text
  if (!title && !slide.notes && slide.bodyParagraphs.length === 0) {
    return 'empty'
  }

  // 2. Second slide is always objectives in Guidewire PPTs
  //    (AI extraction may have rewritten the title, but it's still objectives)
  if (index === 1) return 'objectives'

  // 3. Objectives — title contains the word "objectives" (any position)
  if (title.includes('objectives') || title.includes('objective')) {
    return 'objectives'
  }

  // 4. Demo — title starts with "Demo:"/"Interactive Demo:" or contains "demonstration"
  if (
    slide.slideType === 'demo' ||
    title.startsWith('demo:') ||
    title.startsWith('demo ') ||
    title.startsWith('interactive demo:') ||
    title.includes('demonstration') ||
    title.endsWith(' demo')
  ) {
    return 'demo'
  }

  // 7. Exercise / Lab
  if (
    slide.slideType === 'exercise' ||
    title.includes('student exercise') ||
    title.includes('lab environment') ||
    title.includes('hands-on exercise') ||
    title.startsWith('exercise:')
  ) {
    return 'exercise'
  }

  // 5. Review / Summary / Conclusion — match beginning of title to avoid false positives
  if (
    title.startsWith('summary') ||
    title.startsWith('conclusion') ||
    title.startsWith('recap') ||
    title.startsWith('review:') ||
    title.startsWith('review and') ||
    title.startsWith('next steps') ||
    title.startsWith('preview of next') ||
    title.startsWith('key takeaway') ||
    title === 'review' ||
    title === 'chapter summary' ||
    title === 'lesson summary'
  ) {
    return 'review'
  }

  return 'content'
}

/** Extract learning objectives from objectives slides */
function extractObjectives(slides: SlideContent[]): string[] {
  const objectives: string[] = []

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx]
    const title = (slide.title || '').toLowerCase()
    if (title.includes('objective') || categorizeSlide(slide, idx) === 'objectives') {
      // Extract from body paragraphs (bullet points)
      for (const para of slide.bodyParagraphs) {
        const text = para.text.trim()
        if (text.length > 10 && !text.toLowerCase().startsWith('by the end')) {
          objectives.push(text)
        }
      }
      // If no body paragraphs, try extracting from notes (comma-separated list)
      if (objectives.length === 0 && slide.notes) {
        // Strip preamble like "Learning objectives for this lesson:"
        const cleaned = slide.notes
          .replace(/^[^:]+:\s*/i, '') // remove preamble before first colon
          .replace(/\.\s*$/, '')       // remove trailing period
        // Split by comma + optional conjunction
        const items = cleaned
          .split(/,\s*(?:and\s+)?/)
          .map((s) => s.trim())
          .filter((s) => s.length > 10)
        for (const item of items) {
          // Capitalize first letter
          objectives.push(item.charAt(0).toUpperCase() + item.slice(1))
        }
      }
    }
  }

  return objectives.slice(0, 8)
}

/** Extract key concepts from content slide titles for sidebar */
function extractKeyConcepts(slides: SlideContent[]): string[] {
  const seen = new Set<string>()
  const concepts: string[] = []

  for (const slide of slides) {
    if (slide.title) {
      const words = slide.title
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
      for (const w of words) {
        const lower = w.toLowerCase()
        if (!seen.has(lower) && concepts.length < 10) {
          seen.add(lower)
          concepts.push(w)
        }
      }
    }
  }

  return concepts.slice(0, 8)
}

/** Group content slides into journey sections for left sidebar */
function buildJourneySections(slides: SlideContent[]): { label: string; slideNumbers: number[] }[] {
  const sections: { label: string; slideNumbers: number[] }[] = []
  let current: { label: string; slideNumbers: number[] } | null = null

  for (const slide of slides) {
    if (slide.title) {
      if (current) sections.push(current)
      current = { label: slide.title, slideNumbers: [slide.slideNumber] }
    } else if (current) {
      current.slideNumbers.push(slide.slideNumber)
    } else {
      current = { label: `Section ${slide.slideNumber}`, slideNumbers: [slide.slideNumber] }
    }
  }

  if (current) sections.push(current)

  // If too many sections, merge small ones
  if (sections.length > 12) {
    const merged: typeof sections = []
    for (let i = 0; i < sections.length; i++) {
      if (merged.length > 0 && sections[i].slideNumbers.length <= 1 && merged[merged.length - 1].slideNumbers.length <= 2) {
        merged[merged.length - 1].slideNumbers.push(...sections[i].slideNumbers)
      } else {
        merged.push({ ...sections[i] })
      }
    }
    return merged
  }

  return sections
}

// Wisdom quotes for lessons
const WISDOM_QUOTES = [
  { text: 'To understand the whole, first understand how its parts relate. A good model illuminates the territory it represents.', attr: 'A principle for Guidewire learners' },
  { text: 'The expert has failed more times than the beginner has tried. Mastery comes from patience, not speed.', attr: 'Ancient proverb for developers' },
  { text: 'Configuration is the language of the system. Learn to speak it fluently, and the system will do your bidding.', attr: 'Guidewire Architecture Wisdom' },
  { text: 'Every line of code tells a story. The best code tells the simplest story that still captures the truth.', attr: 'Software craftsmanship tradition' },
  { text: 'The most powerful tool a developer has is understanding. Before you write, understand. Before you fix, understand.', attr: 'Senior engineer\'s wisdom' },
]

// --- Main component ---

export function LessonPresentationView() {
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
    markVideoWatched,
    submitAssignment,
    completeLesson,
    setCurrentLesson,
    initializeProgress,
  } = useAcademyStore()

  // State
  const [lessonContent, setLessonContent] = useState<ExtractedLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

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

  // Load content
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const content = await loadLessonContent(chapterSlug, lessonNumber)
        if (cancelled) return
        if (content) {
          setLessonContent(content)
        } else {
          setLessonContent(null)
        }
      } catch {
        if (!cancelled) setLessonContent(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [chapterSlug, lessonNumber])

  // Reset scroll + active section when lesson changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
    setActiveSection(0)
    setShowCompletion(false)
  }, [chapterSlug, lessonNumber])

  // Set current lesson — auto-unlock if navigated directly
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

  // Track active section based on scroll
  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function handleScroll() {
      const slideElements = el!.querySelectorAll('[id^="slide-"]')
      let closest = 0
      let closestDist = Infinity

      slideElements.forEach((slideEl, idx) => {
        const rect = slideEl.getBoundingClientRect()
        const mainRect = el!.getBoundingClientRect()
        const dist = Math.abs(rect.top - mainRect.top)
        if (dist < closestDist) {
          closestDist = dist
          closest = idx
        }
      })

      setActiveSection(closest)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [lessonContent])

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

  const scrollToSlide = useCallback((slideNum: number) => {
    const el = document.getElementById(`slide-${slideNum}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // --- Derived content ---

  /** Categorize every slide once */
  const categorizedSlides = useMemo(() => {
    if (!lessonContent) return []
    return lessonContent.slides.map((slide, idx) => ({
      slide,
      category: categorizeSlide(slide, idx),
    }))
  }, [lessonContent])

  /** Only true content slides shown in narrative */
  const contentSlides = useMemo(
    () => categorizedSlides.filter((s) => s.category === 'content').map((s) => s.slide),
    [categorizedSlides]
  )

  /** Question slides → converted to KnowledgeCheckCards */
  const questionSlides = useMemo(
    () => categorizedSlides.filter((s) => s.category === 'question').map((s) => s.slide),
    [categorizedSlides]
  )

  /** Review slides shown at the end */
  const reviewSlides = useMemo(
    () => categorizedSlides.filter((s) => s.category === 'review').map((s) => s.slide),
    [categorizedSlides]
  )

  /** Learning objectives extracted from objectives slides */
  const objectives = useMemo(
    () => extractObjectives(lessonContent?.slides ?? []),
    [lessonContent]
  )

  const videos = lessonContent?.videos ?? []
  const keyConcepts = useMemo(() => extractKeyConcepts(contentSlides), [contentSlides])
  const journeySections = useMemo(() => buildJourneySections(contentSlides), [contentSlides])

  // Build knowledge check items from question slides (PPT Q&A)
  const questionItems = useMemo(() =>
    questionSlides
      .filter((qs) => qs.questionData)
      .map((qs) => ({
        question: qs.questionData!.question,
        referenceAnswer: qs.questionData!.answer,
        questionKey: `slide-${qs.slideNumber}`,
        afterSlide: qs.slideNumber, // position hint — place after nearby content
      })),
    [questionSlides]
  )

  // Knowledge check keys — from PPT question slides only
  const allKcKeys = useMemo(
    () => questionItems.map((qi) => qi.questionKey),
    [questionItems]
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

  // Build the narrative content with interleaved videos and knowledge checks
  const contentSections = useMemo(() => {
    const sections: React.ReactNode[] = []
    let videoIndex = 0
    let kcIndex = 0

    // Determine where to place each knowledge check (after the nearest preceding content slide)
    const kcPlacement = new Map<number, typeof questionItems>()
    for (const qi of questionItems) {
      // Find the content slide just before this question's original position
      let bestIdx = contentSlides.length - 1
      for (let i = 0; i < contentSlides.length; i++) {
        if (contentSlides[i].slideNumber < qi.afterSlide) {
          bestIdx = i
        }
      }
      const existing = kcPlacement.get(bestIdx) ?? []
      existing.push(qi)
      kcPlacement.set(bestIdx, existing)
    }

    for (let i = 0; i < contentSlides.length; i++) {
      const slide = contentSlides[i]

      // Add slide as narrative block
      sections.push(
        <MentorshipSlide
          key={`slide-${slide.slideNumber}`}
          slide={slide}
          chapterSlug={chapterSlug}
          lessonNumber={lessonNumber}
          slideIndex={i}
        />
      )

      // Interleave videos after content slides
      if (videos.length > 0 && videoIndex < videos.length) {
        const videoEvery = Math.max(3, Math.floor(contentSlides.length / videos.length))
        if ((i + 1) % videoEvery === 0 || i === contentSlides.length - 1) {
          sections.push(
            <div key={`video-${videos[videoIndex].index}`} className="m-video-block">
              <DemoVideo
                video={videos[videoIndex]}
                chapterSlug={chapterSlug}
                onWatched={handleVideoWatched}
                isWatched={progress.videosWatched.includes(videos[videoIndex].filename)}
              />
            </div>
          )
          videoIndex++
        }
      }

      // Place knowledge checks that belong after this content slide
      const checksHere = kcPlacement.get(i)
      if (checksHere) {
        for (const kc of checksHere) {
          kcIndex++
          sections.push(
            <div key={`kc-${kc.questionKey}`} className="m-knowledge-block">
              <KnowledgeCheckCard
                question={kc.question}
                referenceAnswer={kc.referenceAnswer}
                lessonId={lessonId}
                questionKey={kc.questionKey}
                label={`Knowledge Check ${kcIndex} of ${questionItems.length}`}
              />
            </div>
          )
        }
      }
    }

    // Add remaining videos that weren't placed
    while (videoIndex < videos.length) {
      sections.push(
        <div key={`video-${videos[videoIndex].index}`} className="m-video-block">
          <DemoVideo
            video={videos[videoIndex]}
            chapterSlug={chapterSlug}
            onWatched={handleVideoWatched}
            isWatched={progress.videosWatched.includes(videos[videoIndex].filename)}
          />
        </div>
      )
      videoIndex++
    }

    // Review / Key Takeaways — text only, no slide image
    if (reviewSlides.length > 0) {
      const takeaways: string[] = []
      for (const rs of reviewSlides) {
        // Extract key points from notes
        if (rs.notes) {
          const cleaned = rs.notes
            .replace(/^[^:]+:\s*/i, '') // strip preamble before first colon
            .replace(/\.\s*$/, '')
          const items = cleaned
            .split(/,\s*(?:and\s+)?/)
            .map((s) => s.trim())
            .filter((s) => s.length > 8)
          takeaways.push(...items)
        }
        // Also pull from body paragraphs
        for (const para of rs.bodyParagraphs) {
          if (para.text.trim().length > 8) {
            takeaways.push(para.text.trim())
          }
        }
      }

      sections.push(
        <div key="review-takeaways" className="m-takeaways m-animate">
          <div className="m-takeaways-header">
            <Trophy size={16} />
            <span>Key Takeaways</span>
          </div>
          {takeaways.length > 0 ? (
            <ul className="m-takeaways-list">
              {takeaways.slice(0, 10).map((t, i) => (
                <li key={i}>{t.charAt(0).toUpperCase() + t.slice(1)}</li>
              ))}
            </ul>
          ) : (
            <p className="m-takeaways-fallback">
              {reviewSlides[0].notes || 'Review the key concepts covered in this lesson.'}
            </p>
          )}
        </div>
      )
    }

    return sections
  }, [contentSlides, reviewSlides, questionItems, videos, chapterSlug, lessonNumber, lessonId, handleVideoWatched, progress.videosWatched])

  // --- Progress stats for sidebar ---
  const totalItems = useMemo(() => {
    let count = 0
    if (contentSlides.length > 0) count++ // slides
    count += videos.length // videos
    count += allKcKeys.length // knowledge checks
    if (lessonMeta?.hasAssignment) count++ // assignment
    return count
  }, [contentSlides, videos, allKcKeys, lessonMeta])

  const completedItems = useMemo(() => {
    let count = 0
    if (progress.scrollProgress >= 90) count++ // slides read
    count += progress.videosWatched.length // videos watched
    const answers = progress.knowledgeCheckAnswers || {}
    count += allKcKeys.filter((k) => answers[k]).length // checks answered
    if (progress.assignmentSubmitted) count++ // assignment done
    return count
  }, [progress, allKcKeys])

  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // SVG circle math for progress ring
  const circumference = 2 * Math.PI * 24 // r=24
  const dashOffset = circumference * (1 - progressPct / 100)

  // --- Error / Loading states ---

  if (!chapter || !lessonMeta) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h2 className="font-heading font-bold text-charcoal-900 text-lg">Lesson Not Found</h2>
          <button
            onClick={() => router.push('/academy/dashboard')}
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

  // --- Main render ---

  return (
    <div className="mentorship-view flex-1 flex flex-col overflow-hidden">
      {/* 3-Column Layout */}
      <div className="m-layout">

        {/* ====== LEFT SIDEBAR: Sensei + Journey ====== */}
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

          {/* Journey navigation */}
          <div className="m-nav-label">Your Journey</div>

          {journeySections.map((section, idx) => {
            const isCompleted = idx < activeSection
            const isActive = idx === activeSection
            const firstSlide = section.slideNumbers[0]

            return (
              <div
                key={idx}
                className={`m-nav-item-wrapper ${isCompleted ? 'completed' : ''}`}
              >
                <div
                  className={`m-nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => scrollToSlide(firstSlide)}
                >
                  <div className="m-nav-dot">
                    {isCompleted ? '✓' : ''}
                  </div>
                  <div className="m-nav-title">
                    {section.label.length > 35
                      ? section.label.slice(0, 35) + '...'
                      : section.label}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Knowledge Check section in journey */}
          {questionItems.length > 0 && (
            <div className="m-nav-item-wrapper">
              <div
                className={`m-nav-item ${allKcKeys.every((k) => (progress.knowledgeCheckAnswers || {})[k]) ? 'completed' : ''}`}
                onClick={() => {
                  const el = document.querySelector('.m-knowledge-block')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <div className="m-nav-dot">
                  {allKcKeys.every((k) => (progress.knowledgeCheckAnswers || {})[k]) ? '✓' : ''}
                </div>
                <div className="m-nav-title">Knowledge Check ({questionItems.length})</div>
              </div>
            </div>
          )}

          {/* Review section */}
          {reviewSlides.length > 0 && (
            <div className="m-nav-item-wrapper">
              <div
                className={`m-nav-item ${activeSection >= journeySections.length ? 'active' : ''}`}
                onClick={() => scrollToSlide(reviewSlides[0].slideNumber)}
              >
                <div className="m-nav-dot"><Trophy size={10} /></div>
                <div className="m-nav-title">Review & Takeaways</div>
              </div>
            </div>
          )}

          {/* Assignment section */}
          {lessonMeta.hasAssignment && (
            <div className="m-nav-item-wrapper">
              <div
                className={`m-nav-item ${progress.assignmentSubmitted ? 'completed' : ''}`}
                onClick={() => {
                  const el = document.getElementById('assignment-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <div className="m-nav-dot">
                  {progress.assignmentSubmitted ? '✓' : ''}
                </div>
                <div className="m-nav-title">Assignment</div>
              </div>
            </div>
          )}
        </div>

        {/* ====== MAIN CONTENT: Narrative Scroll ====== */}
        <main className="m-main" ref={mainRef}>

          {/* Welcome banner */}
          <div className="m-welcome m-animate">
            <div className="m-welcome-greeting">Welcome back, Student</div>
            <div className="m-welcome-message">
              {progress.status === 'completed'
                ? `You've already completed this lesson. Feel free to review the material at your own pace.`
                : contentSlides.length > 0
                  ? `Let's continue your journey. Today we explore ${lessonMeta.title.toLowerCase()}. Take your time — this one is worth understanding deeply.`
                  : `This lesson's content is being prepared. Check back soon!`
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
              <span>~{lessonMeta.estimatedMinutes} minutes</span>
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
            <div className="m-wisdom-attr">— {wisdomQuote.attr}</div>
          </div>

          {/* Learning Objectives — extracted from objectives slides */}
          {objectives.length > 0 && (
            <div className="m-objectives m-animate">
              <div className="m-objectives-header">
                <span className="m-objectives-icon">🎯</span>
                <span className="m-objectives-label">Learning Objectives</span>
              </div>
              <p className="m-objectives-intro">By the end of this lesson, you will be able to:</p>
              <ul className="m-objectives-list">
                {objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* No content fallback */}
          {!lessonContent && (
            <div style={{
              padding: '32px',
              background: '#fef3e8',
              borderRadius: 'var(--m-radius-lg)',
              border: '1px solid var(--m-border-warm)',
              textAlign: 'center',
              marginBottom: 40,
            }}>
              <AlertCircle size={40} style={{ color: 'var(--m-accent-warm)', margin: '0 auto 12px' }} />
              <h3 className="m-display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Content Being Prepared
              </h3>
              <p style={{ fontSize: 14, color: 'var(--m-text-secondary)' }}>
                This lesson&apos;s slide content is still being extracted. Check back soon!
              </p>
            </div>
          )}

          {/* Content sections — the narrative flow */}
          {contentSections}

          {/* Assignment */}
          {lessonMeta.hasAssignment && (
            <div id="assignment-section">
              <div className="m-divider" />
              <div className="m-practice-card">
                <div className="m-practice-label">Assignment</div>
                <div className="m-practice-title">Apply What You&apos;ve Learned</div>
                <div className="m-practice-text">
                  Put your knowledge into practice. Complete the assignment below to demonstrate your understanding.
                </div>
              </div>
              <AssignmentBlock
                lessonId={lessonId}
                assignmentPdf={lessonMeta.assignmentPdf}
                solutionPdf={lessonMeta.solutionPdf}
                onSubmit={handleAssignmentSubmit}
                isSubmitted={progress.assignmentSubmitted}
                previousResponse={progress.assignmentResponse}
              />
            </div>
          )}

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

        {/* ====== RIGHT SIDEBAR: Editorial Components ====== */}
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
              <div className="m-duration-value">{lessonMeta.estimatedMinutes}</div>
              <div className="m-duration-meta">
                <strong>minutes</strong>
                {contentSlides.length} slides &middot; {videos.length} video{videos.length !== 1 ? 's' : ''}
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

          {/* Key Concepts */}
          {keyConcepts.length > 0 && (
            <div className="m-aside-section">
              <div className="m-aside-label">Key Concepts</div>
              <div className="m-concept-tags">
                {keyConcepts.map((concept, i) => (
                  <span key={i} className="m-concept-pill">{concept}</span>
                ))}
              </div>
            </div>
          )}

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
            <div className="m-resource-item" onClick={() => router.push('/academy/dashboard')}>
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
            <div className="m-ask-sensei" onClick={() => router.push('/academy/assistant')}>
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
