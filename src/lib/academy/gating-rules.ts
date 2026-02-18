// ============================================================
// Strict Sequential Gating Rules for Academy
// ============================================================

import type { LessonProgress, LessonMeta } from './types'
import { getPathLessons } from './learning-paths'

export interface GatingResult {
  allowed: boolean
  reason?: string
}

export interface CompletionBlocker {
  type: 'scroll_progress' | 'assignment_required'
  message: string
}

/**
 * Check if a lesson can be accessed given the student's progress.
 * Rules:
 * - First lesson in path is always accessible
 * - Subsequent lessons require previous lesson to be 'completed'
 */
export function canAccessLesson(
  lessonId: string,
  pathSlug: string,
  progress: Record<string, LessonProgress>
): GatingResult {
  const pathLessons = getPathLessons(pathSlug)
  if (pathLessons.length === 0) {
    return { allowed: false, reason: 'Invalid learning path' }
  }

  const lessonIndex = pathLessons.findIndex(l => l.lessonId === lessonId)
  if (lessonIndex === -1) {
    return { allowed: false, reason: 'Lesson not in your learning path' }
  }

  // First lesson is always accessible
  if (lessonIndex === 0) {
    return { allowed: true }
  }

  // Check if previous lesson is completed
  const prevLesson = pathLessons[lessonIndex - 1]
  const prevProgress = progress[prevLesson.lessonId]

  if (!prevProgress || prevProgress.status !== 'completed') {
    return {
      allowed: false,
      reason: `Complete "${prevLesson.title}" first`,
    }
  }

  return { allowed: true }
}

/**
 * Check if a lesson can be marked as completed.
 * Rules:
 * - Scroll progress >= 80% (or >= 50% of blocks visited)
 * - If lesson has assignment, assignment must be submitted
 */
export function canCompleteLesson(
  lessonId: string,
  progress: Record<string, LessonProgress>,
  lessonMeta: LessonMeta
): { allowed: boolean; blockers: CompletionBlocker[] } {
  const lessonProgress = progress[lessonId]
  const blockers: CompletionBlocker[] = []

  if (!lessonProgress) {
    return {
      allowed: false,
      blockers: [{ type: 'scroll_progress', message: 'Start the lesson first' }],
    }
  }

  // Check scroll/content progress
  if (lessonProgress.scrollProgress < 80) {
    blockers.push({
      type: 'scroll_progress',
      message: `Read at least 80% of the content (currently ${lessonProgress.scrollProgress}%)`,
    })
  }

  // Check assignment if required
  if (lessonMeta.hasAssignment && !lessonProgress.assignmentSubmitted) {
    blockers.push({
      type: 'assignment_required',
      message: 'Submit the assignment before completing this lesson',
    })
  }

  return {
    allowed: blockers.length === 0,
    blockers,
  }
}

/**
 * Get the index of a lesson within a path (for progress calculation)
 */
export function getLessonIndexInPath(lessonId: string, pathSlug: string): number {
  const pathLessons = getPathLessons(pathSlug)
  return pathLessons.findIndex(l => l.lessonId === lessonId)
}

/**
 * Calculate overall path progress percentage
 */
export function calculatePathProgress(
  pathSlug: string,
  progress: Record<string, LessonProgress>
): number {
  const pathLessons = getPathLessons(pathSlug)
  if (pathLessons.length === 0) return 0

  const completed = pathLessons.filter(
    l => progress[l.lessonId]?.status === 'completed'
  ).length

  return Math.round((completed / pathLessons.length) * 100)
}
