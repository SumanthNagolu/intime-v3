'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  ArrowRight,
} from 'lucide-react'
import {
  CHAPTERS,
  CHAPTER_LESSONS,
  TOTAL_LESSONS,
  PHASES,
  getChaptersByPhase,
  getAllLessons,
} from '@/lib/academy/curriculum'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { useProgressSync } from '@/lib/academy/progress-sync'
import type { LessonMeta, ChapterPhase } from '@/lib/academy/types'

export function AcademyDashboard() {
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

  // Find current/next lesson to continue
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

  // Stats
  const completedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'completed'
  ).length
  const inProgressLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'in_progress'
  ).length
  const completedChapters = CHAPTERS.filter(
    (ch) => getChapterProgress(ch.id).progress === 100
  ).length

  // Recent activity: last 5 lessons touched (in_progress or completed), sorted by recency
  const recentActivity = useMemo(() => {
    const allLessons = getAllLessons()
    const touched = allLessons
      .filter((l) => {
        const prog = lessonProgress[l.lessonId]
        return prog && (prog.status === 'in_progress' || prog.status === 'completed')
      })
      .map((l) => ({
        lesson: l,
        chapter: CHAPTERS.find((c) => c.slug === l.chapterSlug),
        progress: lessonProgress[l.lessonId],
      }))
      // Sort completed-with-timestamp first, then in_progress
      .sort((a, b) => {
        const aTime = a.progress.completedAt || ''
        const bTime = b.progress.completedAt || ''
        if (aTime && bTime) return bTime.localeCompare(aTime)
        if (aTime) return -1
        if (bTime) return 1
        return 0
      })

    return touched.slice(0, 5)
  }, [lessonProgress])

  // Up next: next 3 available lessons not completed
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
            Your Learning
            <br />
            Journey
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero: Continue learning */}
          {continueLesson && continueChapter && (
            <button
              onClick={() => navigateToLesson(continueLesson)}
              className="w-full text-left group"
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
                        Chapter {continueChapter.id} &bull;{' '}
                        {continueChapter.title}
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
                      {getLessonProgress(continueLesson.lessonId).status ===
                      'in_progress'
                        ? 'Resume'
                        : 'Start'}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Chapter Progress Strip */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">
                    Chapter Progress
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    {completedChapters} of {CHAPTERS.length} completed
                  </p>
                </div>
              </div>
              <Link
                href="/academy/modules"
                className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-3">
                {CHAPTERS.map((chapter) => {
                  const prog = getChapterProgress(chapter.id)
                  const isComplete = prog.progress === 100
                  const hasStarted = prog.lessonsCompleted > 0

                  return (
                    <div key={chapter.id} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          isComplete
                            ? 'bg-green-100 text-green-700'
                            : hasStarted
                              ? 'bg-charcoal-900 text-white'
                              : 'bg-charcoal-100 text-charcoal-500'
                        }`}
                        title={`Ch ${chapter.id}: ${chapter.title}`}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          chapter.id
                        )}
                      </div>
                      <div className="w-full h-1 bg-charcoal-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : 'bg-gold-500'
                          }`}
                          style={{ width: `${prog.progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">
                    Recent Activity
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Your learning timeline
                  </p>
                </div>
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
                <div className="text-center py-8">
                  <p className="text-xs text-charcoal-400">
                    Start your first lesson to see activity here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Completed"
              value={completedLessons}
              icon={CheckCircle}
              subtitle={`of ${TOTAL_LESSONS}`}
            />
            <StatCard
              label="In Progress"
              value={inProgressLessons}
              icon={BookOpen}
              subtitle="lessons"
            />
            <StatCard
              label="Streak"
              value={streak}
              icon={Flame}
              subtitle="days"
            />
            <StatCard
              label="Chapters"
              value={CHAPTERS.length}
              icon={Layers}
              subtitle="total"
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
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
}: {
  label: string
  value: number
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
        <span className="text-xs text-charcoal-400">{subtitle}</span>
      </div>
    </div>
  )
}
