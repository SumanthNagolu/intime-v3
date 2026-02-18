// ============================================================
// Learning Path Definitions for Guidewire Academy
// Maps each career path to ordered chapter sequences
// ============================================================

import { CHAPTERS, CHAPTER_LESSONS, type Chapter, type LessonMeta } from './curriculum'

export interface LearningPathDefinition {
  slug: string
  title: string
  shortTitle: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedWeeks: number
  chapterSlugs: string[]
  icon: string // emoji
  color: string // tailwind color class
}

// The 4 Guidewire career paths
export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    slug: 'policycenter-developer',
    title: 'PolicyCenter Developer',
    shortTitle: 'PolicyCenter',
    description: 'Master PolicyCenter development: accounts, policy transactions, product model, coverages, rating, and full configuration. The most comprehensive path for insurance platform developers.',
    difficulty: 'intermediate',
    estimatedWeeks: 14,
    chapterSlugs: ['ch01', 'ch02', 'ch03', 'ch04', 'ch07', 'ch08', 'ch12', 'ch13', 'ch14'],
    icon: '🛡️',
    color: 'text-blue-600',
  },
  {
    slug: 'claimcenter-developer',
    title: 'ClaimCenter Developer',
    shortTitle: 'ClaimCenter',
    description: 'Become proficient in ClaimCenter: claims processing, intake, financials, vendor management, and advanced configuration for claims handling systems.',
    difficulty: 'intermediate',
    estimatedWeeks: 12,
    chapterSlugs: ['ch01', 'ch02', 'ch03', 'ch05', 'ch07', 'ch09'],
    icon: '📋',
    color: 'text-purple-600',
  },
  {
    slug: 'billingcenter-developer',
    title: 'BillingCenter Developer',
    shortTitle: 'BillingCenter',
    description: 'Specialize in BillingCenter: billing lifecycle, charge invoicing, payments, delinquency management, producer commissions, and billing configuration.',
    difficulty: 'intermediate',
    estimatedWeeks: 12,
    chapterSlugs: ['ch01', 'ch02', 'ch03', 'ch06', 'ch07', 'ch10'],
    icon: '💳',
    color: 'text-green-600',
  },
  {
    slug: 'integration-developer',
    title: 'Integration Developer',
    shortTitle: 'Integration',
    description: 'Focus on InsuranceSuite integration: web services, messaging, plugins, batch processes, and cloud integration patterns. Ideal for middleware and API developers.',
    difficulty: 'advanced',
    estimatedWeeks: 10,
    chapterSlugs: ['ch01', 'ch02', 'ch03', 'ch07', 'ch11'],
    icon: '🔗',
    color: 'text-amber-600',
  },
]

// --- Helper Functions ---

export function getLearningPath(slug: string): LearningPathDefinition | undefined {
  return LEARNING_PATHS.find(p => p.slug === slug)
}

export function getPathChapters(pathSlug: string): Chapter[] {
  const path = getLearningPath(pathSlug)
  if (!path) return []
  return path.chapterSlugs
    .map(slug => CHAPTERS.find(ch => ch.slug === slug))
    .filter((ch): ch is Chapter => ch !== undefined)
}

export function getPathLessons(pathSlug: string): LessonMeta[] {
  const path = getLearningPath(pathSlug)
  if (!path) return []
  return path.chapterSlugs.flatMap(slug => CHAPTER_LESSONS[slug] || [])
}

export function getPathTotalLessons(pathSlug: string): number {
  return getPathLessons(pathSlug).length
}

export function getPathEstimatedHours(pathSlug: string): number {
  const lessons = getPathLessons(pathSlug)
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0)
  return Math.round(totalMinutes / 60)
}

export function getNextLessonInPath(currentLessonId: string, pathSlug: string): LessonMeta | undefined {
  const lessons = getPathLessons(pathSlug)
  const idx = lessons.findIndex(l => l.lessonId === currentLessonId)
  return idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : undefined
}

export function getPrevLessonInPath(currentLessonId: string, pathSlug: string): LessonMeta | undefined {
  const lessons = getPathLessons(pathSlug)
  const idx = lessons.findIndex(l => l.lessonId === currentLessonId)
  return idx > 0 ? lessons[idx - 1] : undefined
}

export function isLessonInPath(lessonId: string, pathSlug: string): boolean {
  return getPathLessons(pathSlug).some(l => l.lessonId === lessonId)
}
