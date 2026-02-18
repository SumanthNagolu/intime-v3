import { trpc } from '@/lib/trpc/client'
import { getPathChapters, getPathLessons, getLearningPath } from '@/lib/academy/learning-paths'
import type { Chapter, LessonMeta } from '@/lib/academy/types'
import type { LearningPathDefinition } from '@/lib/academy/learning-paths'

interface StudentEnrollmentResult {
  isLoading: boolean
  isEnrolled: boolean
  activePath: LearningPathDefinition | undefined
  activePathSlug: string | null
  pathChapters: Chapter[]
  pathLessons: LessonMeta[]
  enrollments: any[]
}

export function useStudentEnrollment(): StudentEnrollmentResult {
  const { data: enrollments, isLoading } = trpc.academy.getMyEnrollments.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  // Find the first active enrollment
  const activeEnrollment = enrollments?.find((e: any) => e.status === 'active')
  const activePathSlug = activeEnrollment?.learning_paths?.slug || null
  const activePath = activePathSlug ? getLearningPath(activePathSlug) : undefined
  const pathChapters = activePathSlug ? getPathChapters(activePathSlug) : []
  const pathLessons = activePathSlug ? getPathLessons(activePathSlug) : []

  return {
    isLoading,
    isEnrolled: !!activeEnrollment,
    activePath,
    activePathSlug,
    pathChapters,
    pathLessons,
    enrollments: enrollments || [],
  }
}
