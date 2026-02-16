'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trophy,
  Sparkles,
} from 'lucide-react'
import type { ExtractedLesson, Checkpoint } from '@/lib/academy/types'
import { getChapterBySlug, getLessonsForChapter, getNextLesson, getPrevLesson } from '@/lib/academy/curriculum'
import { CHAPTERS } from '@/lib/academy/curriculum'
import { loadLessonContent } from '@/lib/academy/content-loader'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { useProgressSync } from '@/lib/academy/progress-sync'

import { SlideCard } from './SlideCard'
import { DemoVideo } from './DemoVideo'
import { CheckpointGate } from './CheckpointGate'
import { AssignmentBlock } from './AssignmentBlock'
import { LessonNav } from './LessonNav'

// Generate checkpoints from lesson content
function generateCheckpoints(lesson: ExtractedLesson): Checkpoint[] {
  if (!lesson.slides || lesson.slides.length < 6) return []

  const checkpoints: Checkpoint[] = []
  const slidesWithNotes = lesson.slides.filter((s) => s.notes && s.notes.length > 50)

  // Place a checkpoint every ~8 slides (roughly every subtopic)
  const interval = Math.max(6, Math.floor(lesson.totalSlides / 3))

  for (let i = interval; i < lesson.totalSlides; i += interval) {
    const nearbySlides = slidesWithNotes.filter(
      (s) => s.slideNumber >= Math.max(1, i - 4) && s.slideNumber <= i
    )

    if (nearbySlides.length === 0) continue

    // Generate a question from the notes content
    const sourceSlide = nearbySlides[nearbySlides.length - 1]
    const noteText = sourceSlide.notes

    // Extract key concepts for question generation
    const sentences = noteText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)

    if (sentences.length === 0) continue

    const mainConcept = sentences[0]

    checkpoints.push({
      id: `${lesson.lessonId}-cp-${checkpoints.length + 1}`,
      afterSlide: i,
      questions: [
        {
          id: `${lesson.lessonId}-q-${checkpoints.length + 1}`,
          question: `Based on what you've learned, which of the following best describes: ${mainConcept.slice(0, 80)}...?`,
          options: [
            mainConcept.length > 100 ? mainConcept.slice(0, 100) + '...' : mainConcept,
            'This concept is not covered in this lesson',
            'This is only relevant to ClaimCenter, not PolicyCenter',
            'None of the above applies in this context',
          ],
          correctIndex: 0,
          explanation: noteText.length > 200 ? noteText.slice(0, 200) + '...' : noteText,
          topic: lesson.title,
        },
      ],
    })
  }

  return checkpoints
}

export function LessonScrollView() {
  const params = useParams()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const chapterSlug = params.moduleId as string
  const lessonNumber = parseInt(params.lessonId as string, 10)

  // Store
  const {
    getLessonProgress,
    updateLessonStatus,
    updateScrollProgress,
    completeCheckpoint,
    markVideoWatched,
    submitAssignment,
    completeLesson,
    setCurrentLesson,
    isLessonAvailable,
    initializeProgress,
  } = useAcademyStore()

  useProgressSync()

  // State
  const [lessonContent, setLessonContent] = useState<ExtractedLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [showCompletion, setShowCompletion] = useState(false)

  // Derived data
  const chapter = getChapterBySlug(chapterSlug)
  const chapterLessons = chapter ? getLessonsForChapter(chapterSlug) : []
  const lessonMeta = chapterLessons.find((l) => l.lessonNumber === lessonNumber)
  const lessonId = lessonMeta?.lessonId ?? `${chapterSlug}-l${String(lessonNumber).padStart(2, '0')}`

  const progress = getLessonProgress(lessonId)
  const prevLesson = lessonMeta ? getPrevLesson(lessonId) : null
  const nextLesson = lessonMeta ? getNextLesson(lessonId) : null

  // Initialize and load content
  useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const content = await loadLessonContent(chapterSlug, lessonNumber)
        if (cancelled) return

        if (content) {
          setLessonContent(content)
          setCheckpoints(generateCheckpoints(content))
        } else {
          // No extracted content yet - still render with metadata
          setLessonContent(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load lesson content')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [chapterSlug, lessonNumber])

  // Set current lesson and mark as in_progress
  useEffect(() => {
    if (lessonId) {
      setCurrentLesson(lessonId)
      if (progress.status === 'available') {
        updateLessonStatus(lessonId, 'in_progress')
      }
    }
  }, [lessonId, progress.status, setCurrentLesson, updateLessonStatus])

  // Scroll progress tracking
  useEffect(() => {
    if (!contentRef.current) return

    const observer = new IntersectionObserver(
      () => {
        if (!contentRef.current) return
        const el = contentRef.current
        const scrolled = window.scrollY - el.offsetTop
        const total = el.scrollHeight - window.innerHeight
        if (total > 0) {
          const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
          updateScrollProgress(lessonId, Math.round(pct))
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 20) }
    )

    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [lessonId, updateScrollProgress])

  // Scroll listener for progress
  useEffect(() => {
    function handleScroll() {
      if (!contentRef.current) return
      const el = contentRef.current
      const rect = el.getBoundingClientRect()
      const visible = Math.max(0, -rect.top)
      const total = el.scrollHeight - window.innerHeight
      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (visible / total) * 100))
        updateScrollProgress(lessonId, Math.round(pct))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lessonId, updateScrollProgress])

  // Handlers
  const handleVideoWatched = useCallback(
    (filename: string) => markVideoWatched(lessonId, filename),
    [lessonId, markVideoWatched]
  )

  const handleCheckpointComplete = useCallback(
    (cpId: string) => completeCheckpoint(lessonId, cpId),
    [lessonId, completeCheckpoint]
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

  // Check if lesson can be completed
  const canComplete = useCallback(() => {
    if (progress.status === 'completed') return false
    // At minimum, need to have scrolled 80%
    if (progress.scrollProgress < 80) return false
    // All checkpoints should be done
    const allCpDone = checkpoints.every((cp) =>
      progress.checkpointsCompleted.includes(cp.id)
    )
    if (!allCpDone) return false
    // Assignment must be submitted if present
    if (lessonMeta?.hasAssignment && !progress.assignmentSubmitted) return false
    return true
  }, [progress, checkpoints, lessonMeta])

  if (!chapter || !lessonMeta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-charcoal-400 mx-auto" />
          <h2 className="font-heading font-bold text-charcoal-900 text-lg">
            Lesson Not Found
          </h2>
          <p className="text-sm text-charcoal-500">
            The requested lesson could not be found in the curriculum.
          </p>
          <button
            onClick={() => router.push('/academy/dashboard')}
            className="mt-4 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
          <p className="text-sm text-charcoal-500">Loading lesson content...</p>
        </div>
      </div>
    )
  }

  // Build the content sections with interleaved videos and checkpoints
  const contentSections: React.ReactNode[] = []
  const slides = lessonContent?.slides ?? []
  const videos = lessonContent?.videos ?? []

  let videoIndex = 0

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    // Add slide card
    contentSections.push(
      <SlideCard
        key={`slide-${slide.slideNumber}`}
        slide={slide}
        slideIndex={i}
        chapterSlug={chapterSlug}
        lessonNumber={lessonNumber}
      />
    )

    // Check if a video should be placed after this slide
    // Place videos roughly evenly distributed, or after every ~5 slides
    if (videos.length > 0 && videoIndex < videos.length) {
      const videoEvery = Math.max(3, Math.floor(slides.length / videos.length))
      if ((i + 1) % videoEvery === 0 || i === slides.length - 1) {
        const video = videos[videoIndex]
        contentSections.push(
          <DemoVideo
            key={`video-${video.index}`}
            video={video}
            chapterSlug={chapterSlug}
            onWatched={handleVideoWatched}
            isWatched={progress.videosWatched.includes(video.filename)}
          />
        )
        videoIndex++
      }
    }

    // Check if a checkpoint should be placed after this slide
    const cp = checkpoints.find((c) => c.afterSlide === slide.slideNumber)
    if (cp) {
      contentSections.push(
        <CheckpointGate
          key={`cp-${cp.id}`}
          checkpoint={cp}
          completedIds={progress.checkpointsCompleted}
          onComplete={handleCheckpointComplete}
        />
      )
    }
  }

  // Add any remaining videos
  while (videoIndex < videos.length) {
    const video = videos[videoIndex]
    contentSections.push(
      <DemoVideo
        key={`video-${video.index}`}
        video={video}
        chapterSlug={chapterSlug}
        onWatched={handleVideoWatched}
        isWatched={progress.videosWatched.includes(video.filename)}
      />
    )
    videoIndex++
  }

  return (
    <div className="relative">
      {/* Back nav */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/academy/dashboard')}
          className="flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main layout: content + sidebar */}
      <div className="flex gap-8">
        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-6" ref={contentRef} id="slides">
          {/* Lesson header */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="relative p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 via-charcoal-400 to-gold-500" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                    Chapter {chapter.id} &bull; Lesson {lessonMeta.lessonNumber}
                  </span>
                  {progress.status === 'completed' && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
                <h1 className="font-heading font-bold text-charcoal-900 text-2xl leading-tight">
                  {lessonMeta.title}
                </h1>
                <p className="text-sm text-charcoal-500 mt-2">
                  {chapter.title} &mdash; {chapter.description}
                </p>
              </div>
            </div>
          </div>

          {/* No content fallback */}
          {!lessonContent && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-amber-900">
                Content Being Processed
              </h3>
              <p className="text-sm text-amber-700 max-w-md mx-auto">
                This lesson&apos;s slide content is still being extracted. You can still
                access videos and assignments if available. Check back soon!
              </p>
            </div>
          )}

          {/* Content sections */}
          {contentSections}

          {/* Assignment */}
          {lessonMeta.hasAssignment && (
            <AssignmentBlock
              lessonId={lessonId}
              assignmentPdf={lessonMeta.assignmentPdf}
              solutionPdf={lessonMeta.solutionPdf}
              onSubmit={handleAssignmentSubmit}
              isSubmitted={progress.assignmentSubmitted}
              previousResponse={progress.assignmentResponse}
            />
          )}

          {/* Complete lesson button */}
          {progress.status !== 'completed' && (
            <div className="flex justify-center py-8">
              <button
                onClick={handleCompleteLesson}
                disabled={!canComplete()}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-white text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                <Trophy className="w-5 h-5 text-gold-400" />
                Complete Lesson
              </button>
              {!canComplete() && (
                <p className="text-xs text-charcoal-400 mt-2 text-center absolute">
                  {progress.scrollProgress < 80
                    ? 'Keep scrolling to read all content'
                    : !checkpoints.every((cp) => progress.checkpointsCompleted.includes(cp.id))
                      ? 'Complete all knowledge checks'
                      : lessonMeta.hasAssignment && !progress.assignmentSubmitted
                        ? 'Submit your assignment response'
                        : 'Complete all requirements to finish'}
                </p>
              )}
            </div>
          )}

          {/* Already completed */}
          {progress.status === 'completed' && (
            <div className="flex items-center justify-center gap-4 py-8 px-6 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Lesson Complete!
                </h3>
                <p className="text-sm text-green-700">
                  {progress.completedAt
                    ? `Completed on ${new Date(progress.completedAt).toLocaleDateString()}`
                    : 'Great work!'}
                </p>
              </div>
              {nextLesson && (
                <button
                  onClick={() =>
                    router.push(
                      `/academy/lesson/${chapterSlug}/${nextLesson.lessonNumber}`
                    )
                  }
                  className="ml-auto px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Next Lesson
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <LessonNav
            chapter={chapter}
            lesson={lessonMeta}
            lessonContent={lessonContent}
            checkpoints={checkpoints}
            scrollProgress={progress.scrollProgress}
            videosWatched={progress.videosWatched}
            checkpointsCompleted={progress.checkpointsCompleted}
            assignmentSubmitted={progress.assignmentSubmitted}
            prevLesson={prevLesson ? { ...prevLesson } : null}
            nextLesson={nextLesson ? { ...nextLesson } : null}
            isNextAvailable={nextLesson ? isLessonAvailable(nextLesson.lessonId) : false}
          />
        </div>
      </div>

      {/* Completion toast */}
      {showCompletion && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-charcoal-900 text-white shadow-elevation-xl">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <div>
              <p className="font-semibold text-sm">Lesson Completed!</p>
              <p className="text-xs text-charcoal-400">
                Keep up the great work
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
