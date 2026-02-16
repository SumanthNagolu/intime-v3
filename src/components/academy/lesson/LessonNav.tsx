'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Play,
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle,
  Clock,
} from 'lucide-react'
import type { ExtractedLesson, VideoRef, Checkpoint } from '@/lib/academy/types'
import type { LessonMeta, Chapter } from '@/lib/academy/types'

interface LessonNavProps {
  chapter: Chapter
  lesson: LessonMeta
  lessonContent: ExtractedLesson | null
  checkpoints: Checkpoint[]
  scrollProgress: number
  videosWatched: string[]
  checkpointsCompleted: string[]
  assignmentSubmitted: boolean
  prevLesson: LessonMeta | null
  nextLesson: LessonMeta | null
  isNextAvailable: boolean
}

export function LessonNav({
  chapter,
  lesson,
  lessonContent,
  checkpoints,
  scrollProgress,
  videosWatched,
  checkpointsCompleted,
  assignmentSubmitted,
  prevLesson,
  nextLesson,
  isNextAvailable,
}: LessonNavProps) {
  const router = useRouter()

  const totalSlides = lessonContent?.totalSlides ?? 0
  const totalVideos = lessonContent?.videos?.length ?? 0
  const totalCheckpoints = checkpoints.length

  // Build outline items
  const outlineItems: { id: string; label: string; icon: React.ElementType; done: boolean }[] = []

  // Slides section
  if (totalSlides > 0) {
    outlineItems.push({
      id: 'slides',
      label: `${totalSlides} Slides`,
      icon: BookOpen,
      done: scrollProgress >= 90,
    })
  }

  // Videos
  if (lessonContent?.videos) {
    for (const v of lessonContent.videos) {
      outlineItems.push({
        id: `video-${v.index}`,
        label: `Demo ${v.index}`,
        icon: Play,
        done: videosWatched.includes(v.filename),
      })
    }
  }

  // Checkpoints
  for (const cp of checkpoints) {
    outlineItems.push({
      id: `checkpoint-${cp.id}`,
      label: 'Knowledge Check',
      icon: ShieldCheck,
      done: checkpointsCompleted.includes(cp.id),
    })
  }

  // Assignment
  if (lesson.hasAssignment) {
    outlineItems.push({
      id: 'assignment',
      label: 'Assignment',
      icon: FileText,
      done: assignmentSubmitted,
    })
  }

  const completedCount = outlineItems.filter((i) => i.done).length

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="sticky top-28 space-y-4">
      {/* Chapter + Lesson info */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="bg-charcoal-900 px-4 py-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-500">
            Chapter {chapter.id}
          </span>
          <h3 className="font-heading font-bold text-white text-sm mt-1 leading-tight">
            {lesson.title}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-charcoal-400" />
              <span className="text-[10px] text-charcoal-400">
                ~{lesson.estimatedMinutes} min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-charcoal-400" />
              <span className="text-[10px] text-charcoal-400">
                {totalSlides} slides
              </span>
            </div>
            {totalVideos > 0 && (
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 text-charcoal-400" />
                <span className="text-[10px] text-charcoal-400">
                  {totalVideos} demos
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-charcoal-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">
              Progress
            </span>
            <span className="text-xs font-semibold text-charcoal-700 tabular-nums">
              {completedCount}/{outlineItems.length}
            </span>
          </div>
          <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-500"
              style={{
                width: `${outlineItems.length > 0 ? (completedCount / outlineItems.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Outline items */}
        <div className="py-2">
          {outlineItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-charcoal-50 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.done
                    ? 'bg-green-100 text-green-600'
                    : 'bg-charcoal-100 text-charcoal-500'
                }`}
              >
                {item.done ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <item.icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-xs ${
                  item.done
                    ? 'text-charcoal-500 line-through'
                    : 'text-charcoal-700 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prev/Next navigation */}
      <div className="flex gap-2">
        {prevLesson && (
          <button
            onClick={() =>
              router.push(
                `/academy/lesson/${chapter.slug}/${prevLesson.lessonNumber}`
              )
            }
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-charcoal-200 text-charcoal-600 text-xs font-medium hover:bg-charcoal-50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        )}
        {nextLesson && (
          <button
            onClick={() => {
              if (isNextAvailable) {
                router.push(
                  `/academy/lesson/${chapter.slug}/${nextLesson.lessonNumber}`
                )
              }
            }}
            disabled={!isNextAvailable}
            className={`flex-1 flex items-center justify-end gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isNextAvailable
                ? 'bg-charcoal-900 text-white hover:-translate-y-0.5 hover:shadow-lg'
                : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
            }`}
          >
            {isNextAvailable ? 'Next' : <Lock className="w-3 h-3" />}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
