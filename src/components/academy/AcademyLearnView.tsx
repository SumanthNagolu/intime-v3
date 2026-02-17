'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  BookOpen,
  Play,
  Clock,
  Target,
  Trophy,
  Flame,
  Lock,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Layers,
  Search,
  FileText,
} from 'lucide-react'
import {
  CHAPTERS,
  CHAPTER_LESSONS,
  TOTAL_LESSONS,
  PHASES,
  PHASE_CONFIG,
  getChaptersByPhase,
  getAllChaptersByPhase,
  getAllLessons,
} from '@/lib/academy/curriculum'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { useProgressSync } from '@/lib/academy/progress-sync'
import type { Chapter, LessonMeta, ChapterPhase } from '@/lib/academy/types'

export function AcademyLearnView() {
  const router = useRouter()
  const {
    lessons: lessonProgress,
    readinessIndex,
    streak,
    currentLesson,
    initializeProgress,
    getChapterProgress,
    isLessonAvailable,
    getLessonProgress,
  } = useAcademyStore()

  useProgressSync()

  useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  // --- Search state ---
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  // --- Continue lesson ---
  const continueLesson = useMemo(() => {
    if (currentLesson) {
      const progress = lessonProgress[currentLesson]
      if (progress && progress.status !== 'completed') {
        const allLessons = getAllLessons()
        return allLessons.find((l) => l.lessonId === currentLesson) ?? null
      }
    }
    const allLessons = getAllLessons()
    for (const lesson of allLessons) {
      const prog = lessonProgress[lesson.lessonId]
      if (!prog || prog.status === 'available' || prog.status === 'in_progress') {
        return lesson
      }
    }
    return allLessons[0] ?? null
  }, [currentLesson, lessonProgress])

  const continueChapter = continueLesson
    ? CHAPTERS.find((c) => c.slug === continueLesson.chapterSlug)
    : null

  // --- Stats ---
  const completedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'completed'
  ).length
  const inProgressLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'in_progress'
  ).length
  const completedChapters = CHAPTERS.filter(
    (ch) => getChapterProgress(ch.id).progress === 100
  ).length

  // --- Up next ---
  const upNextLessons = useMemo(() => {
    const allLessons = getAllLessons()
    return allLessons
      .filter((l) => {
        const prog = lessonProgress[l.lessonId]
        const available = isLessonAvailable(l.lessonId)
        return available && (!prog || prog.status === 'available' || prog.status === 'in_progress')
      })
      .slice(0, 3)
  }, [lessonProgress, isLessonAvailable])

  // --- Recent activity ---
  const recentActivity = useMemo(() => {
    const allLessons = getAllLessons()
    return allLessons
      .filter((l) => {
        const prog = lessonProgress[l.lessonId]
        return prog && (prog.status === 'in_progress' || prog.status === 'completed')
      })
      .map((l) => ({
        lesson: l,
        chapter: CHAPTERS.find((c) => c.slug === l.chapterSlug),
        progress: lessonProgress[l.lessonId],
      }))
      .sort((a, b) => {
        const aTime = a.progress.completedAt || ''
        const bTime = b.progress.completedAt || ''
        if (aTime && bTime) return bTime.localeCompare(aTime)
        if (aTime) return -1
        if (bTime) return 1
        return 0
      })
      .slice(0, 5)
  }, [lessonProgress])

  // --- Search filtering ---
  const chaptersByPhase = getAllChaptersByPhase()
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
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-charcoal-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-gold-600" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
              Guidewire Developer Academy
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-900 tracking-tight leading-none">
            Learn
          </h1>
          <p className="text-charcoal-500 text-base mt-4 max-w-xl leading-relaxed">
            Master Guidewire InsuranceSuite development across 14 chapters of
            comprehensive training with hands-on assignments and demos.
          </p>
        </div>

        {/* Readiness Index */}
        <div className="hidden md:block">
          <div className="relative rounded-xl border border-charcoal-200/60 bg-white p-6 shadow-elevation-sm min-w-[200px]">
            <div className="text-center">
              <div className="text-5xl font-bold text-charcoal-900 tracking-tight tabular-nums">
                {readinessIndex}
                <span className="text-xl text-charcoal-400">%</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-charcoal-500 mt-1">
                Readiness Index
              </div>
              <div className="h-1.5 bg-charcoal-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-700"
                  style={{ width: `${readinessIndex}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight">
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
                <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-charcoal-900 font-semibold text-sm transition-all group-hover:bg-gold-500 group-hover:text-white">
                  {getLessonProgress(continueLesson.lessonId).status === 'in_progress'
                    ? 'Resume'
                    : 'Start'}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatsCard label="Chapters" value={CHAPTERS.length} icon={Layers} />
        <StatsCard label="Lessons" value={TOTAL_LESSONS} icon={BookOpen} />
        <StatsCard label="Completed" value={completedLessons} icon={CheckCircle} />
        <StatsCard label="In Progress" value={inProgressLessons} icon={Play} />
        <StatsCard label="Streak" value={`${streak}d`} icon={Flame} />
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search + Curriculum Browser */}
        <div className="lg:col-span-8 space-y-8">
          {/* Search */}
          <div className="sticky top-20 z-20">
            <div className="relative">
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

        {/* Right Column: Sticky sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Quick Stats 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              <MiniStatCard
                label="Completed"
                value={completedLessons}
                icon={CheckCircle}
                subtitle={`of ${TOTAL_LESSONS}`}
              />
              <MiniStatCard
                label="Chapters"
                value={completedChapters}
                icon={Layers}
                subtitle={`of ${CHAPTERS.length}`}
              />
              <MiniStatCard
                label="Streak"
                value={streak}
                icon={Flame}
                subtitle="days"
              />
              <MiniStatCard
                label="Readiness"
                value={`${readinessIndex}%`}
                icon={Target}
                subtitle=""
              />
            </div>

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

            {/* Phase Progress */}
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">
                    Phase Progress
                  </h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {Object.entries(PHASES).map(([phaseKey, phase]) => {
                  const chapters = getChaptersByPhase(phaseKey as ChapterPhase)
                  const totalLessons = chapters.reduce(
                    (sum, c) => sum + c.totalLessons,
                    0
                  )
                  const completedInPhase = chapters.reduce((sum, c) => {
                    const prog = getChapterProgress(c.id)
                    return sum + prog.lessonsCompleted
                  }, 0)
                  const pct =
                    totalLessons > 0
                      ? Math.round((completedInPhase / totalLessons) * 100)
                      : 0

                  return (
                    <div key={phaseKey}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-charcoal-700">
                          {phase.label}
                        </span>
                        <span className="text-xs text-charcoal-500 tabular-nums">
                          {completedInPhase}/{totalLessons}
                        </span>
                      </div>
                      <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct === 100 ? 'bg-green-500' : 'bg-gold-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal-200/60">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-600" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">
                    Milestones
                  </h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  {
                    label: 'Foundation Complete',
                    check: () =>
                      getChaptersByPhase('foundation').every(
                        (c) => getChapterProgress(c.id).progress === 100
                      ),
                  },
                  {
                    label: 'PolicyCenter Mastery',
                    check: () => getChapterProgress(4).progress === 100,
                  },
                  {
                    label: 'ClaimCenter Mastery',
                    check: () => getChapterProgress(5).progress === 100,
                  },
                  {
                    label: 'Developer Fundamentals',
                    check: () => getChapterProgress(7).progress === 100,
                  },
                  {
                    label: 'Full Certification Ready',
                    check: () => readinessIndex >= 80,
                  },
                ].map((milestone) => {
                  const achieved = milestone.check()
                  return (
                    <div
                      key={milestone.label}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achieved
                            ? 'bg-gold-100 text-gold-600'
                            : 'bg-charcoal-200 text-charcoal-400'
                        }`}
                      >
                        {achieved ? (
                          <Trophy className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          achieved
                            ? 'text-charcoal-900 font-medium'
                            : 'text-charcoal-500'
                        }`}
                      >
                        {milestone.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">
                    Recent Activity
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map(({ lesson, chapter, progress }) => (
                      <button
                        key={lesson.lessonId}
                        onClick={() => navigateToLesson(lesson)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-charcoal-50 transition-colors"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            progress.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gold-100 text-gold-600'
                          }`}
                        >
                          {progress.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-charcoal-800 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-charcoal-400 truncate">
                            Ch {chapter?.id} &bull; {chapter?.title}
                          </p>
                        </div>
                        <span className="text-[10px] text-charcoal-400 tabular-nums flex-shrink-0">
                          ~{lesson.estimatedMinutes}m
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-charcoal-400">
                      Start your first lesson to see activity here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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

function MiniStatCard({
  label,
  value,
  icon: Icon,
  subtitle,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  subtitle: string
}) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white p-4 shadow-elevation-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
          {label}
        </span>
        <Icon className="w-4 h-4 text-charcoal-400" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-charcoal-900 tabular-nums">
          {value}
        </span>
        {subtitle && <span className="text-xs text-charcoal-400">{subtitle}</span>}
      </div>
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
                    {lesson.hasAssignment && <FileText className="w-3 h-3" />}
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
