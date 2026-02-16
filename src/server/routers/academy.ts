import { z } from 'zod'
import { publicProcedure, router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

export const academyRouter = router({
  // ============================================
  // GUIDEWIRE ACADEMY PROGRESS SYNC
  // ============================================
  guidewire: router({
    getProgress: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const studentId = ctx.profileId

      if (!studentId) {
        return null
      }

      const { data } = await adminClient
        .from('student_progress')
        .select('lesson_progress, current_lesson, streak_count, last_active_date, readiness_index')
        .eq('student_id', studentId)
        .single()

      if (!data) {
        return null
      }

      return {
        lessonProgress: (data.lesson_progress ?? {}) as Record<string, unknown>,
        currentLesson: data.current_lesson as string | null,
        streakCount: (data.streak_count ?? 0) as number,
        lastActiveDate: data.last_active_date as string | null,
        readinessIndex: (data.readiness_index ?? 0) as number,
      }
    }),

    saveProgress: orgProtectedProcedure
      .input(z.object({
        lessonProgress: z.record(z.string(), z.unknown()),
        currentLesson: z.string().nullable(),
        streakCount: z.number().int().min(0),
        lastActiveDate: z.string().nullable(),
        readinessIndex: z.number().int().min(0).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const studentId = ctx.profileId

        if (!studentId) {
          return { success: false }
        }

        // Derive legacy fields from lesson progress blob
        const completedModules: string[] = []
        for (const [lessonId, progress] of Object.entries(input.lessonProgress)) {
          const p = progress as { status?: string } | null
          if (p?.status === 'completed') {
            completedModules.push(lessonId)
          }
        }

        const { error } = await adminClient
          .from('student_progress')
          .upsert({
            student_id: studentId,
            lesson_progress: input.lessonProgress,
            current_lesson: input.currentLesson,
            streak_count: input.streakCount,
            last_active_date: input.lastActiveDate,
            readiness_index: input.readinessIndex,
            // Backfill legacy fields
            current_module: input.currentLesson ?? '',
            completed_modules: completedModules,
            mastery_score: Math.min(input.readinessIndex, 100),
            last_activity_at: new Date().toISOString(),
          }, {
            onConflict: 'student_id',
          })

        if (error) {
          console.error('[guidewire.saveProgress] Error:', error)
          return { success: false }
        }

        return { success: true }
      }),
  }),

  getPublicCourseBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { data: course } = await adminClient
        .from('courses')
        .select(`
            *,
            course_modules (
                id,
                title,
                slug,
                description,
                module_number,
                is_published,
                module_topics (
                    id,
                    title,
                    slug,
                    topic_number,
                    content_type,
                    is_published,
                    estimated_duration_minutes
                )
            )
        `)
        .eq('slug', input.slug)
        .eq('is_published', true)
        .single()

      if (course && course.course_modules) {
        // Sort modules by number
        course.course_modules.sort((a: any, b: any) => (a.module_number || 0) - (b.module_number || 0));

        // Sort topics in each module
        course.course_modules.forEach((m: any) => {
          if (m.module_topics) {
            m.module_topics.sort((a: any, b: any) => (a.topic_number || 0) - (b.topic_number || 0));
          }
        });
      }

      return course;
    }),
  // ============================================
  // STUDENT PORTAL PROCEDURES
  // ============================================

  getProgressSummary: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { user } = ctx

    // Query student progress from academy tables
    // For MVP, return placeholder data mixed with real queries where possible
    const [enrollmentsResult, certificatesResult] = await Promise.all([
      adminClient
        .from('student_enrollments')
        .select('id, completed_at', { count: 'exact' })
        .eq('student_id', user?.id),
      adminClient
        .from('student_certificates')
        .select('id', { count: 'exact' })
        .eq('student_id', user?.id),
    ])

    const totalEnrollments = enrollmentsResult.count || 0
    const completedCourses = enrollmentsResult.data?.filter(e => e.completed_at)?.length || 0
    const inProgressCourses = totalEnrollments - completedCourses

    return {
      readinessScore: Math.min(100, Math.round((completedCourses / Math.max(1, totalEnrollments)) * 100)),
      totalXP: completedCourses * 250, // Placeholder XP calculation
      streakDays: 7, // Placeholder - would need streak tracking table
      certificateCount: certificatesResult.count || 0,
      coursesInProgress: inProgressCourses,
      coursesCompleted: completedCourses,
      recentlyCompleted: [],
    }
  }),

  getActiveCourses: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { user } = ctx

    const { data: enrollments } = await adminClient
      .from('student_enrollments')
      .select(`
        id,
        progress_percent,
        enrolled_at,
        courses (
          id,
          title,
          description,
          difficulty,
          duration_hours,
          xp_reward,
          thumbnail_url
        )
      `)
      .eq('student_id', user?.id)
      .is('completed_at', null)
      .limit(10)

    return enrollments || []
  }),

  getCourses: orgProtectedProcedure
    .input(z.object({
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      let query = adminClient
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('is_published', true)

      if (input?.difficulty) {
        query = query.eq('difficulty', input.difficulty)
      }
      if (input?.search) {
        query = query.ilike('title', `%${input.search}%`)
      }

      const { data, count } = await query
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1)
        .order('created_at', { ascending: false })

      return { courses: data || [], total: count || 0 }
    }),

  getCourseById: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data: course } = await adminClient
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            description,
            order_index,
            xp_reward
          )
        `)
        .eq('id', input.id)
        .single()

      return course
    }),

  getRecentAchievements: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { user } = ctx

    // Try to get real achievements from student_badges table
    const { data: badges } = await adminClient
      .from('student_badges')
      .select(`
        id,
        earned_at,
        badges (
          id,
          name,
          description,
          icon,
          xp_reward
        )
      `)
      .eq('student_id', user?.id)
      .order('earned_at', { ascending: false })
      .limit(6)

    if (badges && badges.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return badges.map((b: any) => ({
        id: b.badges?.id || b.id,
        name: b.badges?.name || 'Achievement',
        description: b.badges?.description || '',
        badge_icon: b.badges?.icon || '🏆',
        xp_reward: b.badges?.xp_reward || 50,
        earned_at: b.earned_at,
      }))
    }

    // Return placeholder achievements for MVP
    return [
      { id: '1', name: 'First Course', description: 'Complete your first course', badge_icon: '🎓', xp_reward: 100, earned_at: new Date().toISOString() },
      { id: '2', name: 'Week Streak', description: 'Learn for 7 days in a row', badge_icon: '🔥', xp_reward: 50, earned_at: new Date().toISOString() },
    ]
  }),

  getCertificates: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { user } = ctx

    const { data } = await adminClient
      .from('student_certificates')
      .select(`
        id,
        issued_at,
        certificate_number,
        courses (
          id,
          title
        )
      `)
      .eq('student_id', user?.id)
      .order('issued_at', { ascending: false })

    return data || []
  }),

  enrollInCourse: orgProtectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { user, orgId } = ctx

      // Check if already enrolled
      const { data: existing } = await adminClient
        .from('student_enrollments')
        .select('id')
        .eq('student_id', user?.id)
        .eq('course_id', input.courseId)
        .single()

      if (existing) {
        return { success: true, alreadyEnrolled: true, enrollmentId: existing.id }
      }

      // Create enrollment
      const { data, error } = await adminClient
        .from('student_enrollments')
        .insert({
          student_id: user?.id,
          course_id: input.courseId,
          org_id: orgId,
          progress_percent: 0,
          enrolled_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new Error('Failed to enroll in course')
      }

      return { success: true, alreadyEnrolled: false, enrollmentId: data.id }
    }),

  // ============================================
  // ADMIN PORTAL PROCEDURES
  // ============================================

  admin: router({
    getDashboardStats: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [coursesResult, enrollmentsResult, certificatesResult] = await Promise.all([
        adminClient.from('courses').select('id', { count: 'exact' }).eq('org_id', orgId),
        adminClient.from('student_enrollments').select('id', { count: 'exact' }),
        adminClient.from('student_certificates').select('id', { count: 'exact' }),
      ])

      // Get unique student count
      const { data: uniqueStudents } = await adminClient
        .from('student_enrollments')
        .select('student_id')

      const uniqueStudentIds = new Set(uniqueStudents?.map(s => s.student_id) || [])

      return {
        totalCourses: coursesResult.count || 0,
        activeEnrollments: enrollmentsResult.count || 0,
        certificatesIssued: certificatesResult.count || 0,
        activeStudents: uniqueStudentIds.size,
      }
    }),

    getCohorts: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data } = await adminClient
        .from('cohorts')
        .select('*')
        .eq('org_id', orgId)
        .order('start_date', { ascending: false })

      return data || []
    }),

    getStudents: orgProtectedProcedure
      .input(z.object({
        cohortId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        const adminClient = getAdminClient()

        // Query students with their progress
        const { data, count } = await adminClient
          .from('student_enrollments')
          .select(`
            student_id,
            users!student_enrollments_student_id_fkey (
              id,
              email,
              full_name
            ),
            courses (
              title
            ),
            progress_percent,
            enrolled_at
          `, { count: 'exact' })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1)

        return { students: data || [], total: count || 0 }
      }),

    getAllCourses: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data } = await adminClient
        .from('courses')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      return data || []
    }),

    createCourse: orgProtectedProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
        duration_hours: z.number().min(0).max(1000),
        xp_reward: z.number().min(0).default(100),
        is_published: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const { orgId, user } = ctx

        const { data, error } = await adminClient
          .from('courses')
          .insert({
            org_id: orgId,
            title: input.title,
            description: input.description,
            difficulty: input.difficulty,
            duration_hours: input.duration_hours,
            xp_reward: input.xp_reward,
            is_published: input.is_published,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          throw new Error('Failed to create course')
        }

        return data
      }),

    updateCourse: orgProtectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        duration_hours: z.number().min(0).max(1000).optional(),
        xp_reward: z.number().min(0).optional(),
        is_published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const adminClient = getAdminClient()
        const { id, ...updates } = input

        const { data, error } = await adminClient
          .from('courses')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new Error('Failed to update course')
        }

        return data
      }),

    deleteCourse: orgProtectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('courses')
          .delete()
          .eq('id', input.id)

        if (error) {
          throw new Error('Failed to delete course')
        }

        return { success: true }
      }),

    getCertificatesIssued: orgProtectedProcedure.query(async () => {
      const adminClient = getAdminClient()

      const { data } = await adminClient
        .from('student_certificates')
        .select(`
          id,
          issued_at,
          certificate_number,
          student_id,
          users!student_certificates_student_id_fkey (
            id,
            email,
            full_name
          ),
          courses (
            id,
            title
          )
        `)
        .order('issued_at', { ascending: false })
        .limit(100)

      return data || []
    }),

    issueCertificate: orgProtectedProcedure
      .input(z.object({
        studentId: z.string(),
        courseId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const adminClient = getAdminClient()

        // Generate certificate number
        const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        const { data, error } = await adminClient
          .from('student_certificates')
          .insert({
            student_id: input.studentId,
            course_id: input.courseId,
            certificate_number: certificateNumber,
            issued_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          throw new Error('Failed to issue certificate')
        }

        return data
      }),
  }),
})
