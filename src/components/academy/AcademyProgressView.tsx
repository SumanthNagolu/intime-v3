'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Play,
  Target,
  Trophy,
  User,
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
import type { ChapterPhase } from '@/lib/academy/types'

export function AcademyProgressView() {
  const router = useRouter()
  const {
    lessons: lessonProgress,
    readinessIndex,
    streak,
    initializeProgress,
    getChapterProgress,
  } = useAcademyStore()

  useProgressSync()

  useEffect(() => {
    initializeProgress()
  }, [initializeProgress])

  // Stats
  const completedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === 'completed'
  ).length
  const completedChapters = CHAPTERS.filter(
    (ch) => getChapterProgress(ch.id).progress === 100
  ).length

  // Learning timeline: last N completed/in-progress lessons
  const timeline = useMemo(() => {
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
      .slice(0, 10)
  }, [lessonProgress])

  // Skills derived from chapter completion
  const skills = useMemo(() => {
    const skillMap: { label: string; chapterId: number }[] = [
      { label: 'Guidewire Cloud', chapterId: 1 },
      { label: 'SurePath Methodology', chapterId: 2 },
      { label: 'Implementation Tools', chapterId: 3 },
      { label: 'PolicyCenter', chapterId: 4 },
      { label: 'ClaimCenter', chapterId: 5 },
      { label: 'BillingCenter', chapterId: 6 },
      { label: 'Gosu Programming', chapterId: 7 },
      { label: 'Data Model & Plugins', chapterId: 8 },
      { label: 'UI & PCF', chapterId: 9 },
      { label: 'Integration', chapterId: 10 },
      { label: 'Product Configuration', chapterId: 11 },
      { label: 'Rating & LOB', chapterId: 12 },
      { label: 'Testing & Deployment', chapterId: 13 },
      { label: 'Advanced Topics', chapterId: 14 },
    ]
    return skillMap.map((s) => ({
      ...s,
      progress: getChapterProgress(s.chapterId).progress,
      completed: getChapterProgress(s.chapterId).progress === 100,
    }))
  }, [getChapterProgress])

  const navigateToLesson = (chapterSlug: string, lessonNumber: number) => {
    router.push(`/academy/lesson/${chapterSlug}/${lessonNumber}`)
  }

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-charcoal-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-gold-600" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
              Guidewire Developer Academy
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-900 tracking-tight leading-none">
            My Progress
          </h1>
          <p className="text-charcoal-500 text-base mt-4 max-w-xl leading-relaxed">
            Track your learning journey, achievements, and certification readiness.
          </p>
        </div>

        {/* Readiness badge */}
        <div className="hidden md:block">
          <div className="relative rounded-xl border border-charcoal-200/60 bg-white p-6 shadow-elevation-sm min-w-[200px]">
            <div className="text-center">
              <div className="text-5xl font-bold text-charcoal-900 tracking-tight tabular-nums">
                {readinessIndex}
                <span className="text-xl text-charcoal-400">%</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-charcoal-500 mt-1">
                Certification Ready
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

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Readiness"
          value={`${readinessIndex}%`}
          icon={Target}
          detail={readinessIndex >= 80 ? 'Certification Ready' : 'Keep going!'}
          highlight={readinessIndex >= 80}
        />
        <KPICard
          label="Completed"
          value={completedLessons}
          icon={CheckCircle}
          detail={`of ${TOTAL_LESSONS} lessons`}
        />
        <KPICard
          label="Streak"
          value={streak}
          icon={Flame}
          detail="consecutive days"
        />
        <KPICard
          label="Chapters"
          value={completedChapters}
          icon={Layers}
          detail={`of ${CHAPTERS.length} total`}
        />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Phase Progress */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Phase Progress</h3>
                  <p className="text-xs text-charcoal-500">Your journey through each training phase</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-charcoal-800">
                          {phase.label}
                        </span>
                        {pct === 100 && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <span className="text-xs text-charcoal-500 tabular-nums">
                        {completedInPhase}/{totalLessons} lessons &bull; {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
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
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Milestones</h3>
                  <p className="text-xs text-charcoal-500">Key achievements on your path</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'Foundation Complete',
                  description: 'Complete all 3 foundation chapters',
                  check: () =>
                    getChaptersByPhase('foundation').every(
                      (c) => getChapterProgress(c.id).progress === 100
                    ),
                },
                {
                  label: 'PolicyCenter Mastery',
                  description: 'Complete all PolicyCenter lessons',
                  check: () => getChapterProgress(4).progress === 100,
                },
                {
                  label: 'ClaimCenter Mastery',
                  description: 'Complete all ClaimCenter lessons',
                  check: () => getChapterProgress(5).progress === 100,
                },
                {
                  label: 'Developer Fundamentals',
                  description: 'Complete Gosu & development chapter',
                  check: () => getChapterProgress(7).progress === 100,
                },
                {
                  label: 'Full Certification Ready',
                  description: 'Reach 80% readiness index',
                  check: () => readinessIndex >= 80,
                },
              ].map((milestone) => {
                const achieved = milestone.check()
                return (
                  <div
                    key={milestone.label}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      achieved
                        ? 'border-gold-200 bg-gold-50/30'
                        : 'border-charcoal-200/60 bg-charcoal-50/30'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        achieved
                          ? 'bg-gold-100 text-gold-600'
                          : 'bg-charcoal-200 text-charcoal-400'
                      }`}
                    >
                      {achieved ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          achieved ? 'text-charcoal-900' : 'text-charcoal-500'
                        }`}
                      >
                        {milestone.label}
                      </p>
                      <p className="text-[10px] text-charcoal-400 mt-0.5">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chapter Completion Grid */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">All Chapters</h3>
                  <p className="text-xs text-charcoal-500">
                    {completedChapters} of {CHAPTERS.length} completed
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-charcoal-100">
              {CHAPTERS.map((chapter) => {
                const prog = getChapterProgress(chapter.id)
                const isComplete = prog.progress === 100
                const hasStarted = prog.lessonsCompleted > 0

                return (
                  <div
                    key={chapter.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50/50 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isComplete
                          ? 'bg-green-100 text-green-700'
                          : hasStarted
                            ? 'bg-charcoal-900 text-white'
                            : 'bg-charcoal-100 text-charcoal-500'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        chapter.id
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 truncate">
                        {chapter.title}
                      </p>
                      <p className="text-[10px] text-charcoal-400">
                        {chapter.totalLessons} lessons &bull; {chapter.weekRange}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-charcoal-500 tabular-nums">
                        {prog.lessonsCompleted}/{prog.totalLessons}
                      </span>
                      <div className="w-20 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : 'bg-gold-500'
                          }`}
                          style={{ width: `${prog.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Learning Timeline */}
          {timeline.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">
                      Learning Timeline
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Recent learning activity
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {timeline.map(({ lesson, chapter, progress }) => (
                    <button
                      key={lesson.lessonId}
                      onClick={() =>
                        navigateToLesson(lesson.chapterSlug, lesson.lessonNumber)
                      }
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
                      {progress.completedAt && (
                        <span className="text-[10px] text-charcoal-400 flex-shrink-0">
                          {new Date(progress.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-900 text-white shadow-elevation-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-charcoal-700 rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-2 border-charcoal-600">
                P
              </div>
              <h3 className="font-heading font-bold text-lg">Priya Sharma</h3>
              <p className="text-charcoal-400 text-xs mt-1">Senior Developer Track</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/20 rounded-full text-[10px] font-semibold uppercase tracking-widest text-gold-400 border border-gold-500/30">
                <GraduationCap className="w-3 h-3" />
                Active Student
              </div>
              {/* Mini readiness ring */}
              <div className="mt-5">
                <div className="text-3xl font-bold tabular-nums">
                  {readinessIndex}%
                </div>
                <div className="text-[10px] uppercase tracking-widest text-charcoal-400 mt-0.5">
                  Readiness
                </div>
                <div className="h-1.5 bg-charcoal-700 rounded-full mt-2 overflow-hidden mx-8">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessIndex}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills from chapter completion */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-600" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Skills</h3>
              </div>
              <p className="text-[10px] text-charcoal-400 mt-0.5">
                Auto-derived from chapter completion
              </p>
            </div>
            <div className="p-4 space-y-2">
              {skills.map((skill) => (
                <div
                  key={skill.label}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      skill.completed
                        ? 'bg-green-100 text-green-600'
                        : skill.progress > 0
                          ? 'bg-gold-100 text-gold-600'
                          : 'bg-charcoal-100 text-charcoal-400'
                    }`}
                  >
                    {skill.completed ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal-700 truncate">
                      {skill.label}
                    </p>
                  </div>
                  <span className="text-[10px] text-charcoal-400 tabular-nums flex-shrink-0">
                    {skill.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">
                  Quick Stats
                </h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <QuickStat icon={BookOpen} label="Total Lessons" value={TOTAL_LESSONS} />
              <QuickStat icon={CheckCircle} label="Completed" value={completedLessons} />
              <QuickStat icon={Layers} label="Chapters Done" value={completedChapters} />
              <QuickStat icon={Flame} label="Day Streak" value={streak} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function KPICard({
  label,
  value,
  icon: Icon,
  detail,
  highlight,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  detail: string
  highlight?: boolean
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-charcoal-900 tracking-tight tabular-nums">
              {value}
            </span>
          </div>
          <span
            className={`text-xs ${
              highlight ? 'text-green-600 font-medium' : 'text-charcoal-500'
            }`}
          >
            {detail}
          </span>
        </div>
        <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
          <Icon className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
          <Icon className="h-4 w-4 text-charcoal-500" />
        </div>
        <span className="text-sm text-charcoal-600">{label}</span>
      </div>
      <span className="text-lg font-semibold text-charcoal-900 tabular-nums">
        {value}
      </span>
    </div>
  )
}
