'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronRight,
  CheckCircle,
  Play,
  FileText,
  Clock,
  Lock,
  BookOpen,
  Layers,
  GraduationCap,
  Target,
  Sparkles,
} from 'lucide-react'
import {
  CHAPTERS,
  CHAPTER_LESSONS,
  TOTAL_LESSONS,
  PHASES,
  PHASE_CONFIG,
  getAllChaptersByPhase,
} from '@/lib/academy/curriculum'
import { useAcademyStore } from '@/lib/academy/progress-store'
import type { Chapter, LessonMeta, ChapterPhase } from '@/lib/academy/types'

export const ModulesList: React.FC = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  const {
    lessons: lessonProgress,
    readinessIndex,
    initializeProgress,
    getChapterProgress,
    isLessonAvailable,
  } = useAcademyStore()

  React.useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  const completedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'completed'
  ).length

  const completedChapters = CHAPTERS.filter(
    (ch) => getChapterProgress(ch.id).progress === 100
  ).length

  const chaptersByPhase = getAllChaptersByPhase()
  const phaseOrder: ChapterPhase[] = [
    'foundation',
    'specialization',
    'developer-core',
    'configuration',
    'advanced',
  ]

  // Search filtering
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
          // Auto-expand chapters where lessons match but not the chapter title itself
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
    // If chapter title matches, show all lessons; otherwise filter
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
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  const isChapterExpanded = (chapterId: number) =>
    expandedChapters.has(chapterId) || autoExpandedChapters.has(chapterId)

  const navigateToLesson = (lesson: LessonMeta) => {
    router.push(`/academy/lesson/${lesson.chapterSlug}/${lesson.lessonNumber}`)
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-gold-600" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
            Guidewire Developer Academy
          </span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-900 tracking-tight leading-none">
          Full Curriculum
        </h1>
        <p className="text-charcoal-500 text-base mt-3 max-w-xl leading-relaxed">
          14 chapters of comprehensive Guidewire InsuranceSuite training, from
          cloud fundamentals to advanced integration and rating.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatsCard label="Chapters" value={CHAPTERS.length} icon={Layers} />
        <StatsCard label="Lessons" value={TOTAL_LESSONS} icon={BookOpen} />
        <StatsCard
          label="Completed"
          value={completedLessons}
          icon={CheckCircle}
        />
        <StatsCard
          label="Readiness"
          value={`${readinessIndex}%`}
          icon={Target}
        />
      </div>

      {/* Search */}
      <div className="mb-10 sticky top-20 z-20">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-charcoal-400" />
          </div>
          <input
            type="text"
            placeholder="Search chapters or lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-3.5 rounded-xl border border-charcoal-200/60 bg-white/95 backdrop-blur shadow-elevation-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm text-charcoal-900 transition-all duration-300"
          />
        </div>
      </div>

      {/* Phase Sections */}
      {filteredPhases.length > 0 ? (
        <div className="space-y-12">
          {filteredPhases.map((phaseKey) => {
            const phase = PHASES[phaseKey]
            const phaseConfig = PHASE_CONFIG[phaseKey]
            const chapters = getFilteredChapters(phaseKey)
            if (chapters.length === 0) return null

            return (
              <div key={phaseKey}>
                {/* Phase Header */}
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

                {/* Chapter Cards */}
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
  )
}

// --- Sub-components ---

function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
          {label}
        </span>
        <Icon className="w-4 h-4 text-charcoal-400" />
      </div>
      <span className="text-2xl font-bold text-charcoal-900 tabular-nums">
        {value}
      </span>
    </div>
  )
}

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
      {/* Chapter header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-charcoal-50/50 transition-colors"
      >
        {/* Chapter number badge */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            isComplete
              ? 'bg-green-100 text-green-700'
              : hasStarted
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-500'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            chapter.id
          )}
        </div>

        {/* Title & meta */}
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

        {/* Progress % + chevron */}
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

      {/* Progress bar */}
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

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-charcoal-100">
          {/* Chapter description */}
          <div className="px-5 py-3 bg-charcoal-50/30">
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {chapter.description}
            </p>
          </div>

          {/* Lesson rows */}
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
                  {/* Status dot */}
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

                  {/* Lesson title */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal-800 truncate">
                      {lesson.title}
                    </p>
                  </div>

                  {/* Meta icons */}
                  <div className="flex items-center gap-2.5 text-charcoal-400 flex-shrink-0">
                    {lesson.videoCount > 0 && (
                      <Play className="w-3 h-3" />
                    )}
                    {lesson.hasAssignment && (
                      <FileText className="w-3 h-3" />
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
