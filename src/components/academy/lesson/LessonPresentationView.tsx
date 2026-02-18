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
import type { ExtractedLesson, SlideContent, KnowledgeCheckItem, VideoRef } from '@/lib/academy/types'
import {
  getChapterBySlug,
  getLessonsForChapter,
  getNextLesson,
  getPrevLesson,
} from '@/lib/academy/curriculum'
import { loadLessonContent, loadKnowledgeChecks } from '@/lib/academy/content-loader'
import { useAcademyStore } from '@/lib/academy/progress-store'

import { MentorshipSlide } from './MentorshipSlide'
import { DemoVideo } from './DemoVideo'
import { KnowledgeCheckCard } from './KnowledgeCheckCard'
import { AssignmentBlock } from './AssignmentBlock'

import './mentorship.css'

// --- Slide categorization ---
// Primary: trust slideType from JSON (set by extraction script).
// Fallback: title heuristics for slides without slideType.
//
// JSON slideType → SlideCategory mapping:
//   title              → title   (skip)
//   objectives         → objectives (skip — extract inline)
//   objectives_review  → review  (skip)
//   demo_instruction   → demo    (DemoVideo or skip)
//   demo_video         → demo    (DemoVideo or skip)
//   question           → question (KC cards)
//   answer             → answer  (skip)
//   exercise           → exercise (AssignmentBlock or skip)
//   content            → content (MentorshipSlide)

type SlideCategory = 'title' | 'objectives' | 'demo' | 'review' | 'question' | 'answer' | 'empty' | 'exercise' | 'content'

function categorizeSlide(slide: SlideContent, index: number): SlideCategory {
  const st = slide.slideType
  const title = (slide.title || '').toLowerCase().trim()

  // --- Primary: trust slideType from extraction ---
  if (st) {
    switch (st) {
      case 'title':              return 'title'
      case 'objectives':         return 'objectives'
      case 'objectives_review':  return 'review'
      case 'demo_instruction':   return 'demo'
      case 'demo_video':         return 'demo'
      case 'question':           return 'question'
      case 'answer':             return 'answer'
      case 'exercise':           return 'exercise'
      case 'vm_instructions':    return 'exercise'
      // 'content' falls through to heuristics below
    }
  }

  // --- Secondary: heuristics for slides without a specific slideType ---

  // First slide is always title
  if (index === 0) return 'title'

  // Knowledge check — has questionData
  if (slide.questionData || title === 'knowledge check') return 'question'

  // Empty — no title, no notes, no body
  if (!title && !slide.notes && slide.bodyParagraphs.length === 0) return 'empty'

  // Second slide is always objectives in GW PPTs
  if (index === 1) return 'objectives'

  // Objectives by title
  if (title.includes('objectives') || title.includes('objective')) return 'objectives'

  // Demo by title
  if (
    title.startsWith('demo:') ||
    title.startsWith('demo ') ||
    title.startsWith('interactive demo:') ||
    title.includes('demonstration') ||
    title.endsWith(' demo')
  ) {
    return 'demo'
  }

  // Exercise by title
  if (
    title.includes('student exercise') ||
    title.includes('lab environment') ||
    title.includes('hands-on exercise') ||
    title.startsWith('exercise:')
  ) {
    return 'exercise'
  }

  // Review by title
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
  const [centralKCs, setCentralKCs] = useState<KnowledgeCheckItem[]>([])
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

  // Initialize
  useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  // Load content + centralized knowledge checks
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [content, kcs] = await Promise.all([
          loadLessonContent(chapterSlug, lessonNumber),
          loadKnowledgeChecks(lessonId),
        ])
        if (cancelled) return
        setLessonContent(content ?? null)
        setCentralKCs(kcs)
      } catch {
        if (!cancelled) {
          setLessonContent(null)
          setCentralKCs([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [chapterSlug, lessonNumber, lessonId])

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
    (_id: string, response: string, blocks?: import('@/lib/academy/types').SubmissionBlock[]) => submitAssignment(lessonId, response, blocks),
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

  /** Demo slides — may anchor videos */
  const demoSlides = useMemo(
    () => categorizedSlides.filter((s) => s.category === 'demo').map((s) => s.slide),
    [categorizedSlides]
  )

  /** Exercise slides — may anchor assignment */
  const exerciseSlides = useMemo(
    () => categorizedSlides.filter((s) => s.category === 'exercise').map((s) => s.slide),
    [categorizedSlides]
  )

  /** All categorized slides in deck order — used to iterate and render by type */
  const allSlidesInOrder = useMemo(
    () => categorizedSlides.filter((s) =>
      s.category === 'content' || s.category === 'demo' || s.category === 'review' || s.category === 'exercise'
    ),
    [categorizedSlides]
  )

  /** Learning objectives extracted from objectives slides */
  const objectives = useMemo(
    () => extractObjectives(lessonContent?.slides ?? []),
    [lessonContent]
  )

  const videos = lessonContent?.videos ?? []

  /** Map demo slides to videos by index; leftover videos distribute among content slides */
  const { anchoredVideos, unanchoredVideos } = useMemo(() => {
    const anchored = new Map<number, VideoRef>() // slideNumber → video
    const leftover: VideoRef[] = []

    for (let i = 0; i < videos.length; i++) {
      if (i < demoSlides.length) {
        anchored.set(demoSlides[i].slideNumber, videos[i])
      } else {
        leftover.push(videos[i])
      }
    }

    return { anchoredVideos: anchored, unanchoredVideos: leftover }
  }, [videos, demoSlides])
  const journeySections = useMemo(() => buildJourneySections(contentSlides), [contentSlides])

  // Build knowledge check items — centralized file is the source of truth,
  // falling back to inline questionData for any slides not in the central file
  const questionItems = useMemo(() => {
    // Central knowledge checks (keyed by slide number for dedup)
    const centralBySlide = new Map(centralKCs.map((kc) => [kc.questionSlide, kc]))

    const items: { question: string; referenceAnswer: string; questionKey: string; afterSlide: number }[] = []

    // Add all central KCs for this lesson
    for (const kc of centralKCs) {
      items.push({
        question: kc.question,
        referenceAnswer: kc.answer,
        questionKey: `slide-${kc.questionSlide}`,
        afterSlide: kc.questionSlide,
      })
    }

    // Fallback: add any inline questionData not already covered by central
    for (const qs of questionSlides) {
      if (qs.questionData && !centralBySlide.has(qs.slideNumber)) {
        items.push({
          question: qs.questionData.question,
          referenceAnswer: qs.questionData.answer,
          questionKey: `slide-${qs.slideNumber}`,
          afterSlide: qs.slideNumber,
        })
      }
    }

    // Sort by slide number to maintain presentation order
    items.sort((a, b) => a.afterSlide - b.afterSlide)
    return items
  }, [centralKCs, questionSlides])

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

  // Build the narrative content with interleaved videos and knowledge checks.
  // Iterates ALL slides in deck order so demo/exercise blocks appear at their
  // original position, but only content slides render as MentorshipSlide.
  // Demo → DemoVideo (if anchored video), else skip.
  // Review → skip (not useful as raw slide images).
  // Exercise → AssignmentBlock (first only, if has assignment), else skip.
  const contentSections = useMemo(() => {
    const sections: React.ReactNode[] = []
    let unanchoredVideoIdx = 0
    let kcIndex = 0
    let contentSlideCount = 0
    let exerciseAssignmentPlaced = false

    // Count total content slides for distributing unanchored videos
    const totalContentSlides = allSlidesInOrder.filter((s) => s.category === 'content').length

    // Determine where to place each knowledge check (after the nearest preceding content slide)
    const kcPlacement = new Map<number, typeof questionItems>()
    for (const qi of questionItems) {
      let bestSlideNum = -1
      for (const rs of allSlidesInOrder) {
        if (rs.category === 'content' && rs.slide.slideNumber < qi.afterSlide) {
          bestSlideNum = rs.slide.slideNumber
        }
      }
      if (bestSlideNum >= 0) {
        const existing = kcPlacement.get(bestSlideNum) ?? []
        existing.push(qi)
        kcPlacement.set(bestSlideNum, existing)
      }
    }

    // Distribute unanchored videos evenly among content slides
    const videoEvery = unanchoredVideos.length > 0
      ? Math.max(3, Math.floor(totalContentSlides / unanchoredVideos.length))
      : Infinity

    for (let i = 0; i < allSlidesInOrder.length; i++) {
      const { slide, category } = allSlidesInOrder[i]

      switch (category) {
        case 'content': {
          contentSlideCount++
          sections.push(
            <MentorshipSlide
              key={`slide-${slide.slideNumber}`}
              slide={slide}
              chapterSlug={chapterSlug}
              lessonNumber={lessonNumber}
              slideIndex={contentSlideCount - 1}
            />
          )
          // Distribute unanchored videos among content slides
          if (unanchoredVideos.length > 0 && unanchoredVideoIdx < unanchoredVideos.length) {
            if (contentSlideCount % videoEvery === 0 || contentSlideCount === totalContentSlides) {
              const video = unanchoredVideos[unanchoredVideoIdx]
              sections.push(
                <div key={`video-${video.index}`} className="m-video-block">
                  <DemoVideo
                    video={video}
                    chapterSlug={chapterSlug}
                    onWatched={handleVideoWatched}
                    isWatched={progress.videosWatched.includes(video.filename)}
                  />
                </div>
              )
              unanchoredVideoIdx++
            }
          }

          // Place knowledge checks after the appropriate content slide
          const checksHere = kcPlacement.get(slide.slideNumber)
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
          break
        }

        case 'demo': {
          // Only render if there's an anchored video — otherwise skip
          const anchoredVideo = anchoredVideos.get(slide.slideNumber)
          if (anchoredVideo) {
            sections.push(
              <div key={`demo-video-${slide.slideNumber}`} id={`slide-${slide.slideNumber}`} className="m-video-block">
                <DemoVideo
                  video={anchoredVideo}
                  chapterSlug={chapterSlug}
                  onWatched={handleVideoWatched}
                  isWatched={progress.videosWatched.includes(anchoredVideo.filename)}
                />
              </div>
            )
          }
          // No video → skip entirely (don't render raw PPT slide)
          break
        }

        case 'review':
          // Skip — review/recap slides are not useful as raw content
          break

        case 'exercise': {
          // First exercise slide with assignment → AssignmentBlock, rest → skip
          if (!exerciseAssignmentPlaced && lessonMeta?.hasAssignment) {
            exerciseAssignmentPlaced = true
            sections.push(
              <div key={`exercise-${slide.slideNumber}`} id={`slide-${slide.slideNumber}`}>
                <div id="assignment-section">
                  <div className="m-divider" />
                  <div className="m-practice-card">
                    <div className="m-practice-label">Assignment</div>
                    <div className="m-practice-title">Apply What You&#39;ve Learned</div>
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
                    previousBlocks={progress.assignmentBlocks}
                  />
                </div>
              </div>
            )
          }
          // No assignment or already placed → skip
          break
        }
      }
    }

    // Add remaining unanchored videos that weren't placed
    while (unanchoredVideoIdx < unanchoredVideos.length) {
      const video = unanchoredVideos[unanchoredVideoIdx]
      sections.push(
        <div key={`video-${video.index}`} className="m-video-block">
          <DemoVideo
            video={video}
            chapterSlug={chapterSlug}
            onWatched={handleVideoWatched}
            isWatched={progress.videosWatched.includes(video.filename)}
          />
        </div>
      )
      unanchoredVideoIdx++
    }

    return sections
  }, [allSlidesInOrder, anchoredVideos, unanchoredVideos, questionItems, contentSlides, chapterSlug, lessonNumber, lessonId, lessonMeta, handleVideoWatched, handleAssignmentSubmit, progress.videosWatched, progress.assignmentSubmitted, progress.assignmentResponse])

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

  // --- Main render ---

  return (
    <div className="mentorship-view flex-1 flex flex-col overflow-hidden">
      {/* 3-Column Layout */}
      <div className="m-layout">

        {/* ====== LEFT SIDEBAR: Sensei + Journey ====== */}
        <div className="m-sidebar-left">
          {/* Journey navigation */}
          <div className="m-nav-label">Lesson Journey</div>

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
                    {section.label}
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

          {/* Assignment section — only when no exercise slide anchors it */}
          {lessonMeta.hasAssignment && exerciseSlides.length === 0 && (
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

          {/* Assignment — fallback when no exercise slide anchors it */}
          {lessonMeta.hasAssignment && exerciseSlides.length === 0 && (
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
                previousBlocks={progress.assignmentBlocks}
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

          {/* Prev / Next navigation — hide Next when completion card already shows it */}
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
            {nextLesson && progress.status !== 'completed' && (
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

          {/* Back to Learn */}
          <div className="m-aside-section">
            <div className="m-back-link" onClick={() => router.push('/academy/learn')}>
              <ChevronLeft size={14} />
              Back to Learn
            </div>
          </div>

          {/* Progress (compact text + bar) */}
          <div className="m-aside-section">
            <div className="m-aside-label">Your Progress</div>
            <div className="m-progress-compact">
              <div className="m-progress-compact-text">
                <strong>{completedItems} of {totalItems}</strong> complete
              </div>
              <div className="m-progress-bar">
                <div className="m-progress-fill" style={{ width: `${progressPct}%` }} />
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
