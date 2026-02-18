// ============================================================
// Graduation Logic
// Evaluates if a student has completed all requirements
// ============================================================

import type { LessonProgress, LessonMeta } from './types'

export interface GraduationEligibility {
  eligible: boolean
  totalLessons: number
  completedLessons: number
  progressPercent: number
  assignmentsRequired: number
  assignmentsSubmitted: number
  missingLessons: LessonMeta[]
  missingAssignments: LessonMeta[]
}

/**
 * Evaluate whether a student is eligible for graduation
 * Requirements:
 * - All lessons in the path must be completed
 * - All assignments must be submitted
 */
export function evaluateGraduationEligibility(
  pathLessons: LessonMeta[],
  progress: Record<string, LessonProgress>
): GraduationEligibility {
  const totalLessons = pathLessons.length
  const completedLessons = pathLessons.filter(
    l => progress[l.lessonId]?.status === 'completed'
  ).length

  const assignmentLessons = pathLessons.filter(l => l.hasAssignment)
  const assignmentsRequired = assignmentLessons.length
  const assignmentsSubmitted = assignmentLessons.filter(
    l => progress[l.lessonId]?.assignmentSubmitted
  ).length

  const missingLessons = pathLessons.filter(
    l => progress[l.lessonId]?.status !== 'completed'
  )

  const missingAssignments = assignmentLessons.filter(
    l => !progress[l.lessonId]?.assignmentSubmitted
  )

  const eligible = completedLessons === totalLessons && assignmentsSubmitted === assignmentsRequired
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return {
    eligible,
    totalLessons,
    completedLessons,
    progressPercent,
    assignmentsRequired,
    assignmentsSubmitted,
    missingLessons,
    missingAssignments,
  }
}

/**
 * Generate a unique certificate number
 * Format: CERT-{YYYYMMDD}-{RANDOM}
 */
export function generateCertificateNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${date}-${random}`
}

/**
 * Generate a verification code for public verification
 * Format: 6-character alphanumeric
 */
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
