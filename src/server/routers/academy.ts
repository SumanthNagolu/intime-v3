import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc/init'
import { orgProtectedProcedure, protectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  sendEnrollmentReceivedEmail,
  sendEnrollmentApprovedEmail,
  sendEnrollmentRejectedEmail,
  sendInvitationEmail,
} from '@/lib/academy/email-triggers'
import { sendWhatsAppWelcome, sendWhatsAppGraduation } from '@/lib/whatsapp/service'
import { generateCertificateNumber, generateVerificationCode } from '@/lib/academy/graduation'
import { sendGraduationEmail } from '@/lib/academy/email-triggers'

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

    // --- Enrollment Management ---

    getEnrollmentRequests: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('enrollment_requests')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })

        if (input?.status) {
          query = query.eq('status', input.status)
        }

        const { data, count } = await query
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1)

        return { requests: data || [], total: count || 0 }
      }),

    approveEnrollmentRequest: orgProtectedProcedure
      .input(z.object({ requestId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get the request
        const { data: request, error: reqError } = await adminClient
          .from('enrollment_requests')
          .select('*, learning_paths:path_id(slug, title)')
          .eq('id', input.requestId)
          .single()

        if (reqError || !request) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Enrollment request not found' })
        }

        if (request.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Request is already ${request.status}` })
        }

        // Update request status
        const { error: updateError } = await adminClient
          .from('enrollment_requests')
          .update({
            status: 'approved',
            reviewed_by: ctx.profileId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.requestId)

        if (updateError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to approve request' })
        }

        // Create path enrollment if user exists
        if (request.user_id && request.path_id) {
          await adminClient
            .from('path_enrollments')
            .upsert({
              user_id: request.user_id,
              path_id: request.path_id,
              status: 'active',
              progress_percent: 0,
              enrolled_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,path_id',
            })
        }

        // Send approval email (fire-and-forget)
        const pathInfo = request.learning_paths as { slug: string; title: string } | null
        void sendEnrollmentApprovedEmail({
          to: request.applicant_email,
          firstName: request.applicant_first_name || 'Student',
          pathTitle: pathInfo?.title || 'Guidewire Developer Training',
          pathSlug: pathInfo?.slug || '',
        })

        // Send WhatsApp welcome if user opted in (fire-and-forget)
        if (request.user_id) {
          void sendWhatsAppWelcome({
            userId: request.user_id,
            firstName: request.applicant_first_name || 'Student',
            pathTitle: pathInfo?.title || 'Guidewire Developer Training',
          })
        }

        return { success: true }
      }),

    rejectEnrollmentRequest: orgProtectedProcedure
      .input(z.object({
        requestId: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Fetch request + path info before updating
        const { data: request } = await adminClient
          .from('enrollment_requests')
          .select('applicant_email, applicant_first_name, learning_paths:path_id(title)')
          .eq('id', input.requestId)
          .eq('status', 'pending')
          .single()

        const { error } = await adminClient
          .from('enrollment_requests')
          .update({
            status: 'rejected',
            rejection_reason: input.reason || null,
            reviewed_by: ctx.profileId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.requestId)
          .eq('status', 'pending')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reject request' })
        }

        // Send rejection email (fire-and-forget)
        if (request) {
          const pathInfo = request.learning_paths as { title: string } | null
          void sendEnrollmentRejectedEmail({
            to: request.applicant_email,
            firstName: request.applicant_first_name || 'Applicant',
            pathTitle: pathInfo?.title || 'Guidewire Developer Training',
            reason: input.reason,
          })
        }

        return { success: true }
      }),

    createInvitation: orgProtectedProcedure
      .input(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        pathId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const token = crypto.randomUUID()

        // Lookup path title for the email
        const { data: pathData } = await adminClient
          .from('learning_paths')
          .select('title')
          .eq('id', input.pathId)
          .single()

        const { data, error } = await adminClient
          .from('enrollment_requests')
          .insert({
            applicant_email: input.email,
            applicant_first_name: input.firstName,
            applicant_last_name: input.lastName,
            path_id: input.pathId,
            source: 'invitation',
            invitation_token: token,
            status: 'pending',
          })
          .select('id')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create invitation' })
        }

        // Send invitation email (fire-and-forget)
        // Lookup sender name
        const { data: sender } = await adminClient
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', ctx.profileId)
          .single()

        void sendInvitationEmail({
          to: input.email,
          firstName: input.firstName,
          pathTitle: pathData?.title || 'Guidewire Developer Training',
          invitationToken: token,
          senderName: sender ? `${sender.first_name} ${sender.last_name}`.trim() : undefined,
        })

        return { success: true, requestId: data.id, token }
      }),
  }),

  // ============================================
  // ENROLLMENT REQUEST (PUBLIC)
  // ============================================

  submitEnrollmentRequest: publicProcedure
    .input(z.object({
      pathSlug: z.string(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      priorExperience: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const adminClient = getAdminClient()

      // Lookup path by slug
      const { data: path } = await adminClient
        .from('learning_paths')
        .select('id, title')
        .eq('slug', input.pathSlug)
        .single()

      const { error } = await adminClient
        .from('enrollment_requests')
        .insert({
          path_id: path?.id || null,
          applicant_email: input.email,
          applicant_first_name: input.firstName,
          applicant_last_name: input.lastName,
          applicant_phone: input.phone || null,
          source: 'self_signup',
          status: 'pending',
          admin_notes: [
            input.priorExperience ? `Experience: ${input.priorExperience}` : null,
            input.message ? `Message: ${input.message}` : null,
          ].filter(Boolean).join('\n') || null,
        })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to submit enrollment request' })
      }

      // Send confirmation email (fire-and-forget)
      void sendEnrollmentReceivedEmail({
        to: input.email,
        firstName: input.firstName,
        pathTitle: path?.title || 'Guidewire Developer Training',
      })

      return { success: true }
    }),

  // ============================================
  // PUBLIC LEARNING PATHS
  // ============================================

  getPublicPaths: publicProcedure.query(async () => {
    const adminClient = getAdminClient()

    const { data } = await adminClient
      .from('learning_paths')
      .select('id, slug, title, description, difficulty, status')
      .eq('status', 'published')
      .order('created_at', { ascending: true })

    return data || []
  }),

  // ============================================
  // STUDENT ENROLLMENT STATUS
  // ============================================

  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const profileId = ctx.profileId || ctx.user?.id

    if (!profileId) {
      return []
    }

    const { data } = await adminClient
      .from('path_enrollments')
      .select(`
        id,
        status,
        progress_percent,
        enrolled_at,
        completed_at,
        learning_paths (
          id,
          slug,
          title,
          description,
          difficulty
        )
      `)
      .eq('user_id', profileId)
      .in('status', ['active', 'completed'])
      .order('enrolled_at', { ascending: false })

    return data || []
  }),

  getMyEnrollmentRequests: protectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const email = ctx.user?.email

    if (!email) {
      return []
    }

    const { data } = await adminClient
      .from('enrollment_requests')
      .select('id, status, path_id, created_at, reviewed_at, rejection_reason, learning_paths(slug, title)')
      .eq('applicant_email', email)
      .order('created_at', { ascending: false })

    return data || []
  }),

  // ============================================
  // WHATSAPP OPT-IN
  // ============================================

  updateWhatsAppOptIn: protectedProcedure
    .input(z.object({
      phone: z.string().nullable(),
      optedIn: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const profileId = ctx.profileId || ctx.user?.id

      if (!profileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
      }

      const { error } = await adminClient
        .from('user_profiles')
        .update({
          whatsapp_phone: input.phone,
          whatsapp_opted_in: input.optedIn,
          whatsapp_opted_in_at: input.optedIn ? new Date().toISOString() : null,
        })
        .eq('id', profileId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update WhatsApp preferences' })
      }

      return { success: true }
    }),

  getWhatsAppStatus: protectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const profileId = ctx.profileId || ctx.user?.id

    if (!profileId) {
      return { optedIn: false, phone: null }
    }

    const { data } = await adminClient
      .from('user_profiles')
      .select('whatsapp_phone, whatsapp_opted_in')
      .eq('id', profileId)
      .single()

    return {
      optedIn: data?.whatsapp_opted_in || false,
      phone: data?.whatsapp_phone || null,
    }
  }),

  // ============================================
  // GRADUATION & CERTIFICATES
  // ============================================

  requestGraduation: protectedProcedure
    .input(z.object({ pathSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const profileId = ctx.profileId || ctx.user?.id

      if (!profileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      // Find the active enrollment
      const { data: enrollment } = await adminClient
        .from('path_enrollments')
        .select('id, path_id, learning_paths:path_id(title, slug)')
        .eq('user_id', profileId)
        .eq('status', 'active')
        .single()

      if (!enrollment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No active enrollment found' })
      }

      // Check if already graduated
      const { data: existingCert } = await adminClient
        .from('certificates')
        .select('id')
        .eq('enrollment_id', enrollment.id)
        .limit(1)

      if (existingCert && existingCert.length > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Certificate already issued' })
      }

      const certNumber = generateCertificateNumber()
      const verificationCode = generateVerificationCode()

      // Create certificate
      const { error: certError } = await adminClient
        .from('certificates')
        .insert({
          enrollment_id: enrollment.id,
          certificate_number: certNumber,
          verification_code: verificationCode,
          issued_at: new Date().toISOString(),
        })

      if (certError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to issue certificate' })
      }

      // Mark enrollment as completed
      await adminClient
        .from('path_enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .eq('id', enrollment.id)

      // Send graduation notifications (fire-and-forget)
      const pathInfo = enrollment.learning_paths as { title: string; slug: string } | null
      const email = ctx.user?.email

      // Get student name
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('first_name')
        .eq('id', profileId)
        .single()

      const firstName = profile?.first_name || 'Student'
      const pathTitle = pathInfo?.title || 'Guidewire Developer Training'
      const completionDate = new Date().toLocaleDateString('en-US', { dateStyle: 'long' })

      if (email) {
        void sendGraduationEmail({
          to: email,
          firstName,
          pathTitle,
          completionDate,
        })
      }

      void sendWhatsAppGraduation({
        userId: profileId,
        firstName,
        pathTitle,
      })

      return { success: true, certificateNumber: certNumber }
    }),

  getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const profileId = ctx.profileId || ctx.user?.id

    if (!profileId) return []

    // First get user's enrollment IDs
    const { data: enrollments } = await adminClient
      .from('path_enrollments')
      .select('id')
      .eq('user_id', profileId)

    if (!enrollments || enrollments.length === 0) return []

    const enrollmentIds = enrollments.map(e => e.id)

    const { data } = await adminClient
      .from('certificates')
      .select(`
        id,
        certificate_number,
        verification_code,
        issued_at,
        pdf_url,
        path_enrollments:enrollment_id(
          learning_paths:path_id(title, slug)
        )
      `)
      .in('enrollment_id', enrollmentIds)
      .order('issued_at', { ascending: false })

    return data || []
  }),

  verifyCertificate: publicProcedure
    .input(z.object({ certificateNumber: z.string() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data } = await adminClient
        .from('certificates')
        .select(`
          id,
          certificate_number,
          verification_code,
          issued_at,
          path_enrollments:enrollment_id(
            user_profiles:user_id(first_name, last_name),
            learning_paths:path_id(title)
          )
        `)
        .eq('certificate_number', input.certificateNumber)
        .single()

      if (!data) {
        return { valid: false }
      }

      const enrollment = data.path_enrollments as {
        user_profiles: { first_name: string; last_name: string } | null
        learning_paths: { title: string } | null
      } | null

      return {
        valid: true,
        certificateNumber: data.certificate_number,
        issuedAt: data.issued_at,
        studentName: enrollment?.user_profiles
          ? `${enrollment.user_profiles.first_name} ${enrollment.user_profiles.last_name}`.trim()
          : null,
        pathTitle: enrollment?.learning_paths?.title || null,
      }
    }),
})
