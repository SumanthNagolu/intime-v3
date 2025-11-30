/**
 * Enrollment tRPC Router
 * Story: ACAD-002
 *
 * API endpoints for student enrollment management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { createClient } from '@/lib/supabase/server';

export const enrollmentRouter = router({
  /**
   * Get current user's enrollment stats
   */
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    const { data: enrollments, error } = await supabase
      .from('student_enrollments')
      .select('status')
      .eq('user_id', ctx.userId);

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const total = enrollments?.length || 0;
    const active = enrollments?.filter((e) => e.status === 'active').length || 0;
    const completed = enrollments?.filter((e) => e.status === 'completed').length || 0;

    return {
      total_count: total,
      active_count: active,
      completed_count: completed,
    };
  }),

  /**
   * Get current user's enrollments
   */
  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('student_enrollments')
      .select(
        `
          *,
          course:courses(
            id,
            slug,
            title,
            subtitle,
            thumbnail_url,
            total_modules,
            total_topics,
            estimated_duration_weeks
          )
        `
      )
      .eq('user_id', ctx.userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch enrollments: ${error.message}`);
    }

    return data;
  }),

  /**
   * Get enrollment by ID with full details
   */
  getEnrollment: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('student_enrollments')
        .select(
          `
            *,
            course:courses(*),
            current_module:course_modules(*),
            current_topic:module_topics(*)
          `
        )
        .eq('id', input.enrollmentId)
        .eq('user_id', ctx.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Enrollment not found');
        }
        throw new Error(`Failed to fetch enrollment: ${error.message}`);
      }

      return data;
    }),

  /**
   * Check prerequisites for a course
   */
  checkPrerequisites: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc('check_enrollment_prerequisites', {
        p_user_id: ctx.userId,
        p_course_id: input.courseId,
      });

      if (error) {
        throw new Error(`Failed to check prerequisites: ${error.message}`);
      }

      // Get prerequisite course details if not met
      if (!data) {
        const { data: course } = await supabase
          .from('courses')
          .select('prerequisite_course_ids')
          .eq('id', input.courseId)
          .single();

        if (course?.prerequisite_course_ids) {
          const { data: prereqCourses } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', course.prerequisite_course_ids);

          return {
            canEnroll: false,
            missingPrerequisites: prereqCourses || [],
          };
        }
      }

      return {
        canEnroll: data,
        missingPrerequisites: [],
      };
    }),

  /**
   * Enroll in a course
   */
  enrollInCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        paymentId: z.string(),
        paymentAmount: z.number().positive(),
        paymentType: z.enum(['subscription', 'one_time', 'free', 'scholarship']),
        startsAt: z.string().optional(),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc('enroll_student', {
        p_user_id: ctx.userId,
        p_course_id: input.courseId,
        p_payment_id: input.paymentId,
        p_payment_amount: input.paymentAmount,
        p_payment_type: input.paymentType,
        p_starts_at: input.startsAt || new Date().toISOString(),
        p_expires_at: input.expiresAt ?? undefined,
      });

      if (error) {
        throw new Error(`Failed to enroll: ${error.message}`);
      }

      const enrollmentId = data;

      // Get course details for event payload
      const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', input.courseId)
        .single();

      // Publish enrollment event (ACAD-024: triggers welcome email, onboarding checklist)
      await (supabase.rpc as unknown as (fn: string, params: Record<string, unknown>) => Promise<unknown>)('publish_event', {
        p_aggregate_id: enrollmentId,
        p_event_type: 'course.enrolled',
        p_payload: {
          studentId: ctx.userId,
          enrollmentId,
          courseId: input.courseId,
          courseName: course?.title || 'Unknown Course',
          enrolledAt: input.startsAt || new Date().toISOString(),
          paymentType: input.paymentType,
          paymentAmount: input.paymentAmount,
        },
        p_user_id: ctx.userId,
      });

      return { enrollmentId };
    }),

  /**
   * Update enrollment progress
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        currentModuleId: z.string().uuid().optional(),
        currentTopicId: z.string().uuid().optional(),
        completionPercentage: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { error } = await supabase
        .from('student_enrollments')
        .update({
          current_module_id: input.currentModuleId,
          current_topic_id: input.currentTopicId,
          completion_percentage: input.completionPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.enrollmentId)
        .eq('user_id', ctx.userId);

      if (error) {
        throw new Error(`Failed to update progress: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Drop a course
   */
  dropCourse: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClient();

      // Verify ownership and status
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('user_id, status')
        .eq('id', input.enrollmentId)
        .single();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.user_id !== ctx.userId) {
        throw new Error('Unauthorized');
      }

      if (enrollment.status === 'completed') {
        throw new Error('Cannot drop completed course');
      }

      const { error } = await supabase.rpc('update_enrollment_status', {
        p_enrollment_id: input.enrollmentId,
        p_new_status: 'dropped',
      });

      if (error) {
        throw new Error(`Failed to drop course: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Admin: Get all enrollments for a course
   */
  getCourseEnrollments: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        status: z
          .enum(['pending', 'active', 'completed', 'dropped', 'expired', 'all'])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Check admin/course_admin role using RBAC
      const supabase = await createClient();

      let query = supabase
        .from('student_enrollments')
        .select(
          `
            *,
            user:user_profiles(id, email, full_name)
          `
        )
        .eq('course_id', input.courseId)
        .order('enrolled_at', { ascending: false });

      if (input.status && input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch enrollments: ${error.message}`);
      }

      return data;
    }),

  /**
   * Admin: Get enrollment analytics for a course
   */
  getCourseAnalytics: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc('get_course_enrollment_analytics', {
        p_course_id: input.courseId,
      });

      if (error) {
        // If function doesn't exist yet, return basic stats
        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select('status')
          .eq('course_id', input.courseId);

        const total = enrollments?.length || 0;
        const active = enrollments?.filter((e) => e.status === 'active').length || 0;
        const completed = enrollments?.filter((e) => e.status === 'completed').length || 0;
        const dropped = enrollments?.filter((e) => e.status === 'dropped').length || 0;

        return {
          total_enrollments: total,
          active_enrollments: active,
          completed_enrollments: completed,
          dropped_enrollments: dropped,
          completion_rate: total > 0 ? (completed / total) * 100 : 0,
        };
      }

      return data;
    }),

  /**
   * Get onboarding checklist for enrollment (ACAD-024)
   */
  getOnboardingChecklist: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.from as unknown as (table: string) => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            order: (column: string, options: { ascending: boolean }) => Promise<{ data: unknown; error: unknown }>;
          };
        };
      })('onboarding_checklist')
        .select('*')
        .eq('enrollment_id', input.enrollmentId)
        .eq('user_id', ctx.userId)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch checklist: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Complete onboarding checklist item (ACAD-024)
   */
  completeChecklistItem: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        itemKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClient();

      const { error } = await (supabase.from as unknown as (table: string) => {
        update: (data: Record<string, unknown>) => {
          eq: (column: string, value: string) => Promise<{ error: unknown }>;
        };
      })('onboarding_checklist')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('enrollment_id', input.enrollmentId)
        .eq('user_id', ctx.userId)
        .eq('item_key', input.itemKey);

      if (error) {
        throw new Error(`Failed to complete item: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Get at-risk students (ACAD-025)
   * Trainers only - identifies students who need support
   */
  getAtRiskStudents: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      // Get enrollments with user details
      let query = supabase
        .from('student_enrollments')
        .select(
          `
            *,
            student:user_profiles!student_enrollments_user_id_fkey(id, full_name, email),
            course:courses(id, title)
          `
        )
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false })
        .limit(input.limit);

      if (input.courseId) {
        query = query.eq('course_id', input.courseId);
      }

      const { data: enrollments, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch enrollments: ${error.message}`);
      }

      if (!enrollments) {
        return [];
      }

      // For each enrollment, check at-risk criteria
      interface EnrollmentWithDetails {
        id: string;
        user_id: string;
        course_id: string;
        enrolled_at: string;
        completion_percentage: number | null;
        current_module_id: string | null;
        current_topic_id: string | null;
        student: {
          id: string;
          full_name: string;
          email: string;
        };
        course: {
          id: string;
          title: string;
        };
      }

      const atRiskStudents = await Promise.all(
        (enrollments as EnrollmentWithDetails[]).map(async (enrollment) => {
          const risks: string[] = [];
          let riskLevel: 'low' | 'medium' | 'high' = 'low';

          // Check quiz failures
          const { data: quizAttempts } = await supabase
            .from('quiz_attempts')
            .select('id, passed')
            .eq('user_id', enrollment.user_id)
            .eq('enrollment_id', enrollment.id)
            .order('attempted_at', { ascending: false })
            .limit(10);

          const recentFailures =
            quizAttempts?.filter((a) => !a.passed).length || 0;

          if (recentFailures >= 3) {
            risks.push(`${recentFailures} quiz failures`);
            riskLevel = recentFailures >= 5 ? 'high' : 'medium';
          }

          // Check inactivity
          const { data: recentActivity } = await supabase
            .from('topic_completions')
            .select('completed_at')
            .eq('user_id', enrollment.user_id)
            .eq('enrollment_id', enrollment.id)
            .gte(
              'completed_at',
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            )
            .limit(1);

          if (!recentActivity || recentActivity.length === 0) {
            risks.push('Inactive for 7+ days');
            if (riskLevel === 'low') riskLevel = 'medium';
            if (riskLevel === 'medium') riskLevel = 'high';
          }

          // Check low progress
          const completionPercentage = enrollment.completion_percentage || 0;
          const enrolledDays = Math.floor(
            (Date.now() - new Date(enrollment.enrolled_at).getTime()) /
            (1000 * 60 * 60 * 24)
          );

          // Expected 2% progress per week (14% per day rough estimate)
          const expectedProgress = Math.min(100, (enrolledDays / 7) * 2);

          if (completionPercentage < expectedProgress * 0.5 && enrolledDays > 7) {
            risks.push(`Low progress (${Math.round(completionPercentage)}%)`);
            if (riskLevel === 'low') riskLevel = 'medium';
          }

          // ACAD-027: Check AI mentor escalations
          const { count: escalationCount } = await (supabase.from as unknown as (table: string) => {
            select: (columns: string, options: { count: string; head: boolean }) => {
              eq: (column: string, value: string) => {
                gte: (column: string, value: string) => Promise<{ count: number | null; error: unknown }>;
              };
            };
          })('escalations')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', enrollment.user_id)
            .eq('enrollment_id', enrollment.id)
            .gte(
              'created_at',
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            );

          if (escalationCount && escalationCount >= 5) {
            risks.push(`${escalationCount} AI escalations`);
            if (riskLevel === 'low') riskLevel = 'medium';
            if (riskLevel === 'medium') riskLevel = 'high';
          }

          // ACAD-027: Check low quiz score average (< 60%)
          const { data: quizScores } = await supabase
            .from('quiz_attempts')
            .select('score')
            .eq('user_id', enrollment.user_id)
            .eq('enrollment_id', enrollment.id)
            .gte(
              'attempted_at',
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            )
            .limit(10);

          if (quizScores && quizScores.length > 0) {
            const avgScore =
              quizScores.reduce((sum, q) => sum + (q.score || 0), 0) / quizScores.length;
            if (avgScore < 60) {
              risks.push(`Low quiz average (${Math.round(avgScore)}%)`);
              if (riskLevel === 'low') riskLevel = 'medium';
            }
          }

          // Only return students with at least one risk
          if (risks.length === 0) {
            return null;
          }

          return {
            enrollmentId: enrollment.id,
            studentId: enrollment.student.id,
            studentName: enrollment.student.full_name,
            studentEmail: enrollment.student.email,
            courseId: enrollment.course.id,
            courseTitle: enrollment.course.title,
            enrolledAt: enrollment.enrolled_at,
            completionPercentage: enrollment.completion_percentage || 0,
            currentModuleId: enrollment.current_module_id,
            currentTopicId: enrollment.current_topic_id,
            lastActiveAt: recentActivity?.[0]?.completed_at || null,
            risks,
            riskLevel,
            enrolledDays,
          };
        })
      );

      // Filter out null values and sort by risk level
      const filtered = atRiskStudents.filter((s) => s !== null);

      return filtered.sort((a, b) => {
        const levelOrder = { high: 3, medium: 2, low: 1 };
        return levelOrder[b!.riskLevel] - levelOrder[a!.riskLevel];
      });
    }),

  /**
   * Get trainer dashboard stats (ACAD-025)
   */
  getTrainerStats: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      // Get enrollment stats
      let enrollmentQuery = supabase
        .from('student_enrollments')
        .select('status, completion_percentage, enrolled_at, completed_at');

      if (input.courseId) {
        enrollmentQuery = enrollmentQuery.eq('course_id', input.courseId);
      }

      const { data: enrollments } = await enrollmentQuery;

      const totalStudents = enrollments?.length || 0;
      const activeStudents =
        enrollments?.filter((e) => e.status === 'active').length || 0;
      const completedStudents =
        enrollments?.filter((e) => e.status === 'completed').length || 0;

      const avgProgress =
        enrollments && enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) /
          enrollments.length
          : 0;

      // Calculate completion rate
      const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;

      // Get grading queue count
      let gradingQuery = supabase
        .from('capstone_submissions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'trainer_review']);

      if (input.courseId) {
        gradingQuery = gradingQuery.eq('course_id', input.courseId);
      }

      const { count: pendingGrades } = await gradingQuery;

      // Get escalation count
      const { count: pendingEscalations } = await (supabase.from as unknown as (table: string) => {
        select: (columns: string, options: { count: string; head: boolean }) => {
          in: (column: string, values: string[]) => Promise<{ count: number | null; error: unknown }>;
        };
      })('escalations')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      return {
        totalStudents,
        activeStudents,
        completedStudents,
        avgProgress: Math.round(avgProgress),
        completionRate: Math.round(completionRate),
        pendingGrades: pendingGrades || 0,
        pendingEscalations: pendingEscalations || 0,
      };
    }),

  /**
   * Create intervention for at-risk student (ACAD-027)
   */
  createIntervention: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        studentId: z.string().uuid(),
        riskReasons: z.array(z.string()),
        riskLevel: z.enum(['low', 'medium', 'high']).default('medium'),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get enrollment details for event
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select(
          `
          *,
          student:user_profiles!student_enrollments_user_id_fkey(full_name, email),
          course:courses(id, title)
        `
        )
        .eq('id', input.enrollmentId)
        .single();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const { data, error } = await (supabase.from as unknown as (table: string) => {
        insert: (data: Record<string, unknown>) => {
          select: () => {
            single: () => Promise<{ data: { id: string } | null; error: unknown }>;
          };
        };
      })('student_interventions')
        .insert({
          enrollment_id: input.enrollmentId,
          student_id: input.studentId,
          trainer_id: ctx.userId,
          risk_reasons: input.riskReasons,
          notes: input.notes,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create intervention: ${error.message}`);
      }

      // Update enrollment with at-risk flag
      await supabase
        .from('student_enrollments')
        .update({ is_at_risk: true, at_risk_since: new Date().toISOString() })
        .eq('id', input.enrollmentId);

      // Publish student.at_risk_detected event (ACAD-027: triggers trainer notification)
      await (supabase.rpc as unknown as (fn: string, params: Record<string, unknown>) => Promise<unknown>)('publish_event', {
        p_aggregate_id: input.enrollmentId,
        p_event_type: 'student.at_risk_detected',
        p_payload: {
          studentId: input.studentId,
          studentName: enrollment.student.full_name,
          studentEmail: enrollment.student.email,
          enrollmentId: input.enrollmentId,
          courseId: enrollment.course.id,
          courseName: enrollment.course.title,
          riskReasons: input.riskReasons,
          riskLevel: input.riskLevel,
          interventionId: data.id,
          trainerId: ctx.userId,
          detectedAt: new Date().toISOString(),
        },
        p_user_id: input.studentId,
      });

      return { interventionId: data.id };
    }),

  /**
   * Get interventions for a student (ACAD-027)
   */
  getInterventions: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid().optional(),
        enrollmentId: z.string().uuid().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'ineffective']).optional(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      let query = (supabase.from as unknown as (table: string) => {
        select: (columns: string) => {
          order: (column: string, options: { ascending: boolean }) => {
            eq?: (column: string, value: string) => unknown;
          };
        };
      })('student_interventions')
        .select(
          `
          *,
          student:user_profiles!student_interventions_student_id_fkey(id, full_name, email),
          trainer:user_profiles!student_interventions_trainer_id_fkey(id, full_name),
          enrollment:student_enrollments(id, course_id, courses(title))
        `
        )
        .order('created_at', { ascending: false });

      if (input.studentId) {
        query = query.eq('student_id', input.studentId);
      }

      if (input.enrollmentId) {
        query = query.eq('enrollment_id', input.enrollmentId);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch interventions: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Update intervention status (ACAD-027)
   */
  updateIntervention: protectedProcedure
    .input(
      z.object({
        interventionId: z.string().uuid(),
        status: z.enum(['pending', 'in_progress', 'completed', 'ineffective']),
        notes: z.string().optional(),
        contactedAt: z.string().optional(),
        resolvedAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const updateData: Record<string, string> = {
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (input.notes) {
        updateData.notes = input.notes;
      }

      if (input.contactedAt) {
        updateData.contacted_at = input.contactedAt;
      }

      if (input.resolvedAt) {
        updateData.resolved_at = input.resolvedAt;
      }

      const { error } = await (supabase.from as unknown as (table: string) => {
        update: (data: Record<string, string>) => {
          eq: (column: string, value: string) => Promise<{ error: unknown }>;
        };
      })('student_interventions')
        .update(updateData)
        .eq('id', input.interventionId);

      if (error) {
        throw new Error(`Failed to update intervention: ${error.message}`);
      }

      // If completed, check if student is still at risk
      if (input.status === 'completed' && input.resolvedAt) {
        const { data: intervention } = await (supabase.from as unknown as (table: string) => {
          select: (columns: string) => {
            eq: (column: string, value: string) => {
              single: () => Promise<{ data: { enrollment_id: string } | null; error: unknown }>;
            };
          };
        })('student_interventions')
          .select('enrollment_id')
          .eq('id', input.interventionId)
          .single();

        if (intervention) {
          // Clear at-risk flag
          await supabase
            .from('student_enrollments')
            .update({ is_at_risk: false, at_risk_since: null })
            .eq('id', intervention.enrollment_id);
        }
      }

      return { success: true };
    }),

  /**
   * Mark enrollment as at-risk (ACAD-027)
   */
  markAsAtRisk: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        isAtRisk: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const { error } = await supabase
        .from('student_enrollments')
        .update({
          is_at_risk: input.isAtRisk,
          at_risk_since: input.isAtRisk ? new Date().toISOString() : null,
        })
        .eq('id', input.enrollmentId);

      if (error) {
        throw new Error(`Failed to update at-risk status: ${error.message}`);
      }

      return { success: true };
    }),
});
