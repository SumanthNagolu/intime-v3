'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  BookOpen,
  Play,
  Clock,
  Flame,
  Lock,
  CheckCircle,
  Sparkles,
  Layers,
  Search,
  FileText,
} from 'lucide-react'
import {
  CHAPTERS,
  CHAPTER_LESSONS,
  PHASES,
  PHASE_CONFIG,
  getAllChaptersByPhase,
  getAllLessons,
  getChaptersForPath,
  getLessonsForPath,
} from '@/lib/academy/curriculum'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { useProgressSync } from '@/lib/academy/progress-sync'
import { useStudentEnrollment } from '@/hooks/useStudentEnrollment'
import type { Chapter, LessonMeta, ChapterPhase } from '@/lib/academy/types'

export function AcademyLearnView() {
  const router = useRouter()
  const {
    lessons: lessonProgress,
    streak,
    currentLesson,
    initializeProgress,
    initializePathProgress,
    getChapterProgress,
    isLessonAvailable,
    getLessonProgress,
  } = useAcademyStore()

  useProgressSync()

  // Path-aware enrollment
  const { activePath, activePathSlug, pathChapters, pathLessons, isEnrolled, isLoading: enrollmentLoading } = useStudentEnrollment()

  // Redirect unenrolled users to explore
  useEffect(() => {
    if (!enrollmentLoading && !isEnrolled) {
      router.replace('/academy/explore')
    }
  }, [enrollmentLoading, isEnrolled, router])

  // Use path-filtered data if enrolled, otherwise show all
  const effectiveChapters = isEnrolled && pathChapters.length > 0 ? pathChapters : CHAPTERS
  const effectiveAllLessons = isEnrolled && pathLessons.length > 0 ? pathLessons : getAllLessons()

  useEffect(() => {
    initializeProgress()
    if (isEnrolled && activePathSlug) {
      initializePathProgress(activePathSlug)
    }
  }, [initializeProgress, initializePathProgress, isEnrolled, activePathSlug])

  // --- Search state ---
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  // --- Continue lesson ---
  const continueLesson = useMemo(() => {
    if (currentLesson) {
      const progress = lessonProgress[currentLesson]
      if (progress && progress.status !== 'completed') {
        return effectiveAllLessons.find((l) => l.lessonId === currentLesson) ?? null
      }
    }
    for (const lesson of effectiveAllLessons) {
      const prog = lessonProgress[lesson.lessonId]
      if (!prog || prog.status === 'available' || prog.status === 'in_progress') {
        return lesson
      }
    }
    return effectiveAllLessons[0] ?? null
  }, [currentLesson, lessonProgress, effectiveAllLessons])

  const continueChapter = continueLesson
    ? effectiveChapters.find((c) => c.slug === continueLesson.chapterSlug)
    : null

  // --- Chapter progress for hero bar ---
  const continueChapterProgress = useMemo(() => {
    if (!continueChapter) return null
    const prog = getChapterProgress(continueChapter.id)
    return prog
  }, [continueChapter, getChapterProgress])

  // --- Stats ---
  const completedChapters = effectiveChapters.filter(
    (ch) => getChapterProgress(ch.id).progress === 100
  ).length

  // --- Up next ---
  const upNextLessons = useMemo(() => {
    return effectiveAllLessons
      .filter((l) => {
        const prog = lessonProgress[l.lessonId]
        const available = isLessonAvailable(l.lessonId)
        return available && (!prog || prog.status === 'available' || prog.status === 'in_progress')
      })
      .slice(0, 3)
  }, [lessonProgress, isLessonAvailable, effectiveAllLessons])

  // --- Search filtering ---
  // Build phase grouping from effective chapters (path-filtered or all)
  const chaptersByPhase = useMemo(() => {
    const grouped: Record<ChapterPhase, Chapter[]> = {
      'foundation': [],
      'specialization': [],
      'developer-core': [],
      'configuration': [],
      'advanced': [],
    }
    effectiveChapters.forEach(ch => grouped[ch.phase].push(ch))
    return grouped
  }, [effectiveChapters])
  const phaseOrder: ChapterPhase[] = [
    'foundation',
    'specialization',
    'developer-core',
    'configuration',
    'advanced',
  ]

  const { filteredPhases, autoExpandedChapters } = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      return { filteredPhases: phaseOrder, autoExpandedChapters: new Set<number>() }
    }

    const autoExpanded = new Set<number>()
    const phasesWithResults: ChapterPhase[] = []

    for (const phase of phaseOrder) {
      const chapters = chaptersByPhase[phase] || []
      let hasMatch = false

      for (const chapter of chapters) {
        const chapterMatches =
          chapter.title.toLowerCase().includes(term) ||
          chapter.description.toLowerCase().includes(term)
        const lessons = CHAPTER_LESSONS[chapter.slug] || []
        const lessonMatches = lessons.some((l) =>
          l.title.toLowerCase().includes(term)
        )
        if (chapterMatches || lessonMatches) {
          hasMatch = true
          if (lessonMatches && !chapterMatches) {
            autoExpanded.add(chapter.id)
          }
        }
      }
      if (hasMatch) phasesWithResults.push(phase)
    }

    return { filteredPhases: phasesWithResults, autoExpandedChapters: autoExpanded }
  }, [searchTerm, chaptersByPhase])

  const getFilteredChapters = (phase: ChapterPhase): Chapter[] => {
    const chapters = chaptersByPhase[phase] || []
    const term = searchTerm.toLowerCase().trim()
    if (!term) return chapters
    return chapters.filter((chapter) => {
      const chapterMatches =
        chapter.title.toLowerCase().includes(term) ||
        chapter.description.toLowerCase().includes(term)
      const lessons = CHAPTER_LESSONS[chapter.slug] || []
      const lessonMatches = lessons.some((l) =>
        l.title.toLowerCase().includes(term)
      )
      return chapterMatches || lessonMatches
    })
  }

  const getFilteredLessons = (chapterSlug: string): LessonMeta[] => {
    const lessons = CHAPTER_LESSONS[chapterSlug] || []
    const term = searchTerm.toLowerCase().trim()
    if (!term) return lessons
    const chapter = CHAPTERS.find((c) => c.slug === chapterSlug)
    if (
      chapter &&
      (chapter.title.toLowerCase().includes(term) ||
        chapter.description.toLowerCase().includes(term))
    ) {
      return lessons
    }
    return lessons.filter((l) => l.title.toLowerCase().includes(term))
  }

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  const isChapterExpanded = (chapterId: number) =>
    expandedChapters.has(chapterId) || autoExpandedChapters.has(chapterId)

  const navigateToLesson = (lesson: LessonMeta) => {
    router.push(`/academy/lesson/${lesson.chapterSlug}/${lesson.lessonNumber}`)
  }

  return (
    <div className="animate-fade-in pt-4">
      {/* Path Header Banner */}
      {isEnrolled && activePath && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-charcoal-200/60 shadow-elevation-sm">
          <span className="text-2xl">{activePath.icon}</span>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
              Your Learning Path
            </div>
            <div className="font-heading font-bold text-charcoal-900">
              {activePath.title}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-charcoal-900">
              {effectiveChapters.length} <span className="text-xs font-normal text-charcoal-400">chapters</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero: Continue Learning - full width */}
      {continueLesson && continueChapter && (
        <button
          onClick={() => navigateToLesson(continueLesson)}
          className="w-full text-left group mb-8"
        >
          <div className="relative rounded-xl bg-charcoal-900 text-white p-8 md:p-10 shadow-elevation-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-lg">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                  Continue Learning
                </span>
              </div>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs text-charcoal-400 mb-2">
                    Chapter {continueChapter.id} &bull; {continueChapter.title}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
                    {continueLesson.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-charcoal-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      ~{continueLesson.estimatedMinutes} min
                    </div>
                    {continueLesson.videoCount > 0 && (
                      <div className="flex items-center gap-1.5 text-charcoal-400 text-xs">
                        <Play className="w-3.5 h-3.5" />
                        {continueLesson.videoCount} demos
                      </div>
                    )}
                    {continueLesson.hasAssignment && (
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        Assignment
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-charcoal-900 font-semibold text-sm transition-all group-hover:bg-gold-500 group-hover:text-white">
                  {getLessonProgress(continueLesson.lessonId).status === 'in_progress'
                    ? 'Resume'
                    : 'Start'}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Chapter progress bar */}
              {continueChapterProgress && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
                      Chapter {continueChapter.id} progress
                    </span>
                    <span className="text-xs text-charcoal-400 tabular-nums">
                      {continueChapterProgress.lessonsCompleted} of{' '}
                      {continueChapterProgress.totalLessons} lessons
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-700"
                      style={{ width: `${continueChapterProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>
      )}

      {/* Stat Pills */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-charcoal-200/60 bg-white shadow-elevation-sm text-sm">
          <Layers className="w-3.5 h-3.5 text-charcoal-500" />
          <span className="font-semibold text-charcoal-900 tabular-nums">
            {completedChapters}
          </span>
          <span className="text-charcoal-500">of {effectiveChapters.length} chapters</span>
        </div>
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-charcoal-200/60 bg-white shadow-elevation-sm text-sm">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold text-charcoal-900 tabular-nums">
              {streak}
            </span>
            <span className="text-charcoal-500">day streak</span>
          </div>
        )}
      </div>

      {/* Section header with inline search */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-charcoal-900">
          Chapters
        </h2>
        <div className="relative w-56">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-charcoal-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-charcoal-200/60 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Curriculum Browser */}
        <div className="lg:col-span-8 space-y-8">
          {/* Phase Sections */}
          {filteredPhases.length > 0 ? (
            <div className="space-y-10">
              {filteredPhases.map((phaseKey) => {
                const phase = PHASES[phaseKey]
                const phaseConfig = PHASE_CONFIG[phaseKey]
                const chapters = getFilteredChapters(phaseKey)
                if (chapters.length === 0) return null

                return (
                  <div key={phaseKey}>
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${phaseConfig.color}`}
                      >
                        {phase.label}
                      </span>
                      <span className="text-xs text-charcoal-400">
                        {phase.description}
                      </span>
                      <div className="flex-1 h-px bg-charcoal-200/60" />
                    </div>

                    <div className="space-y-3">
                      {chapters.map((chapter) => (
                        <CurriculumChapterCard
                          key={chapter.id}
                          chapter={chapter}
                          progress={getChapterProgress(chapter.id)}
                          lessons={getFilteredLessons(chapter.slug)}
                          lessonProgress={lessonProgress}
                          isExpanded={isChapterExpanded(chapter.id)}
                          onToggle={() => toggleChapter(chapter.id)}
                          onNavigate={navigateToLesson}
                          isLessonAvailable={isLessonAvailable}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-charcoal-400" />
              </div>
              <p className="text-charcoal-500 text-sm">
                No chapters or lessons match &ldquo;{searchTerm}&rdquo;
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs text-gold-600 hover:text-gold-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky sidebar - Up Next only */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Up Next */}
            {upNextLessons.length > 0 && (
              <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-charcoal-200/60">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-600" />
                    <h3 className="font-semibold text-charcoal-900 text-sm">
                      Up Next
                    </h3>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  {upNextLessons.map((lesson) => {
                    const chapter = CHAPTERS.find(
                      (c) => c.slug === lesson.chapterSlug
                    )
                    return (
                      <button
                        key={lesson.lessonId}
                        onClick={() => navigateToLesson(lesson)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-white transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-white border border-charcoal-200/60 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-charcoal-600">
                            {lesson.lessonNumber}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-charcoal-800 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-charcoal-400">
                            Ch {chapter?.id}
                          </p>
                        </div>
                        <span className="text-[10px] text-charcoal-400 tabular-nums flex-shrink-0">
                          ~{lesson.estimatedMinutes}m
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function CurriculumChapterCard({
  chapter,
  progress,
  lessons,
  lessonProgress,
  isExpanded,
  onToggle,
  onNavigate,
  isLessonAvailable,
}: {
  chapter: Chapter
  progress: { lessonsCompleted: number; totalLessons: number; progress: number }
  lessons: LessonMeta[]
  lessonProgress: Record<string, any>
  isExpanded: boolean
  onToggle: () => void
  onNavigate: (lesson: LessonMeta) => void
  isLessonAvailable: (lessonId: string) => boolean
}) {
  const isComplete = progress.progress === 100
  const hasStarted = progress.lessonsCompleted > 0

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        isComplete
          ? 'border-green-200 bg-green-50/20'
          : 'border-charcoal-200/60 bg-white shadow-elevation-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-charcoal-50/50 transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            isComplete
              ? 'bg-green-100 text-green-700'
              : hasStarted
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-500'
          }`}
        >
          {isComplete ? <CheckCircle className="w-5 h-5" /> : chapter.id}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal-900 truncate">
            {chapter.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-charcoal-400">
              {chapter.totalLessons} lesson{chapter.totalLessons !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-charcoal-300">&bull;</span>
            <span className="text-[10px] text-charcoal-400">
              {chapter.weekRange}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-semibold text-charcoal-600 tabular-nums">
            {progress.lessonsCompleted}/{progress.totalLessons}
          </span>
          <ChevronRight
            className={`w-4 h-4 text-charcoal-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </button>

      <div className="px-5 pb-3">
        <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-gold-500'
            }`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-charcoal-100">
          <div className="px-5 py-3 bg-charcoal-50/30">
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {chapter.description}
            </p>
          </div>

          <div className="px-3 py-2">
            {lessons.map((lesson) => {
              const lProg = lessonProgress[lesson.lessonId]
              const status =
                lProg?.status ??
                (isLessonAvailable(lesson.lessonId) ? 'available' : 'locked')

              return (
                <button
                  key={lesson.lessonId}
                  onClick={() => {
                    if (status !== 'locked') onNavigate(lesson)
                  }}
                  disabled={status === 'locked'}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left transition-colors ${
                    status === 'locked'
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-charcoal-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : status === 'in_progress'
                          ? 'bg-gold-100 text-gold-600'
                          : status === 'available'
                            ? 'bg-charcoal-100 text-charcoal-600'
                            : 'bg-charcoal-100 text-charcoal-400'
                    }`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : status === 'locked' ? (
                      <Lock className="w-3 h-3" />
                    ) : status === 'in_progress' ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      <span className="text-[9px] font-bold">
                        {lesson.lessonNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal-800 truncate">
                      {lesson.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 text-charcoal-400 flex-shrink-0">
                    {lesson.videoCount > 0 && <Play className="w-3 h-3" />}
                    {lesson.hasAssignment && (
                      lProg?.assignmentSubmitted ? (
                        <span className="text-green-500" title="Assignment submitted">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                      ) : (
                        <span title="Assignment required">
                          <FileText className="w-3 h-3" />
                        </span>
                      )
                    )}
                    <span className="text-[10px] tabular-nums">
                      ~{lesson.estimatedMinutes}m
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
