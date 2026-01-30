/**
 * Performance Management Router
 * Review cycles, reviews, goals/OKRs, calibration, 1:1 meetings
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// Enums
const reviewCycleStatusEnum = z.enum([
  'draft', 'self_review', 'manager_review', 'calibration', 'acknowledged', 'completed', 'cancelled'
])

const reviewStatusEnum = z.enum([
  'pending', 'self_review', 'self_submitted', 'manager_review', 'manager_submitted',
  'calibration', 'calibrated', 'acknowledged', 'completed'
])

const goalScopeEnum = z.enum(['company', 'department', 'team', 'individual'])
const goalTypeEnum = z.enum(['objective', 'key_result', 'goal', 'initiative'])
const meetingStatusEnum = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])

// Input schemas
const createCycleInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(['annual', 'semi_annual', 'quarterly', 'monthly']),
  reviewPeriodStart: z.string(),
  reviewPeriodEnd: z.string(),
  selfReviewDeadline: z.string(),
  managerReviewDeadline: z.string(),
  calibrationDeadline: z.string().optional(),
  acknowledgementDeadline: z.string().optional(),
  includeSelfAssessment: z.boolean().default(true),
  includePeerFeedback: z.boolean().default(false),
  includeGoals: z.boolean().default(true),
  includeCompetencies: z.boolean().default(true),
  requireCalibration: z.boolean().default(false),
})

const createGoalInput = z.object({
  employeeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  reviewId: z.string().uuid().optional(),
  cycleId: z.string().uuid().optional(),
  parentGoalId: z.string().uuid().optional(),
  goal: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['performance', 'development', 'project']),
  scope: goalScopeEnum.default('individual'),
  goalType: goalTypeEnum.default('goal'),
  weightPercent: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
})

const createOneOnOneInput = z.object({
  employeeId: z.string().uuid(),
  managerId: z.string().uuid(),
  scheduledAt: z.string(),
  durationMinutes: z.number().default(30),
  employeeAgenda: z.string().optional(),
  managerAgenda: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
})

export const performanceRouter = router({
  // ============ REVIEW CYCLES ============

  cycles: router({
    list: orgProtectedProcedure
      .input(z.object({
        status: reviewCycleStatusEnum.optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const offset = (input.page - 1) * input.pageSize

        let query = adminClient
          .from('review_cycles')
          .select('*', { count: 'exact' })
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('review_period_start', { ascending: false })

        if (input.status) {
          query = query.eq('status', input.status)
        }

        const { data, count, error } = await query.range(offset, offset + input.pageSize - 1)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          pagination: {
            total: count ?? 0,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil((count ?? 0) / input.pageSize),
          },
        }
      }),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('review_cycles')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cycle not found' })
        }

        return data
      }),

    create: orgProtectedProcedure
      .input(createCycleInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('review_cycles')
          .insert({
            org_id: ctx.orgId,
            name: input.name,
            description: input.description,
            frequency: input.frequency,
            review_period_start: input.reviewPeriodStart,
            review_period_end: input.reviewPeriodEnd,
            self_review_deadline: input.selfReviewDeadline,
            manager_review_deadline: input.managerReviewDeadline,
            calibration_deadline: input.calibrationDeadline,
            acknowledgement_deadline: input.acknowledgementDeadline,
            include_self_assessment: input.includeSelfAssessment,
            include_peer_feedback: input.includePeerFeedback,
            include_goals: input.includeGoals,
            include_competencies: input.includeCompetencies,
            require_calibration: input.requireCalibration,
            status: 'draft',
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Launch a cycle (create reviews for all active employees)
    launch: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get the cycle
        const { data: cycle } = await adminClient
          .from('review_cycles')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('status', 'draft')
          .is('deleted_at', null)
          .single()

        if (!cycle) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cycle not found or already launched' })
        }

        // Get all active employees with managers
        const { data: employees } = await adminClient
          .from('employees')
          .select('id, manager_id')
          .eq('org_id', ctx.orgId)
          .eq('status', 'active')
          .is('deleted_at', null)

        if (!employees || employees.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active employees found' })
        }

        // Create reviews for each employee
        const reviews = employees
          .filter(e => e.manager_id) // Only employees with managers
          .map(e => ({
            org_id: ctx.orgId,
            cycle_id: cycle.id,
            employee_id: e.id,
            reviewer_id: e.manager_id,
            review_cycle: cycle.name,
            review_type: cycle.frequency,
            period_start_date: cycle.review_period_start,
            period_end_date: cycle.review_period_end,
            review_status: 'pending',
            status: 'draft',
          }))

        if (reviews.length > 0) {
          const { error: reviewError } = await adminClient
            .from('performance_reviews')
            .insert(reviews)

          if (reviewError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: reviewError.message })
          }
        }

        // Update cycle status
        const { data, error } = await adminClient
          .from('review_cycles')
          .update({
            status: 'self_review',
            launched_at: new Date().toISOString(),
            self_review_start_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { cycle: data, reviewsCreated: reviews.length }
      }),

    // Get cycle progress/stats
    getProgress: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const [cycleResult, reviewsResult] = await Promise.all([
          adminClient
            .from('review_cycles')
            .select('*')
            .eq('id', input.id)
            .eq('org_id', ctx.orgId)
            .is('deleted_at', null)
            .single(),

          adminClient
            .from('performance_reviews')
            .select('review_status')
            .eq('cycle_id', input.id)
            .eq('org_id', ctx.orgId),
        ])

        if (cycleResult.error || !cycleResult.data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cycle not found' })
        }

        const statusCounts = (reviewsResult.data ?? []).reduce((acc, r) => {
          acc[r.review_status] = (acc[r.review_status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const total = reviewsResult.data?.length ?? 0

        return {
          cycle: cycleResult.data,
          stats: {
            total,
            pending: statusCounts['pending'] ?? 0,
            selfReview: statusCounts['self_review'] ?? 0,
            selfSubmitted: statusCounts['self_submitted'] ?? 0,
            managerReview: statusCounts['manager_review'] ?? 0,
            managerSubmitted: statusCounts['manager_submitted'] ?? 0,
            calibration: statusCounts['calibration'] ?? 0,
            calibrated: statusCounts['calibrated'] ?? 0,
            acknowledged: statusCounts['acknowledged'] ?? 0,
            completed: statusCounts['completed'] ?? 0,
          },
        }
      }),
  }),

  // ============ REVIEWS ============

  reviews: router({
    list: orgProtectedProcedure
      .input(z.object({
        cycleId: z.string().uuid().optional(),
        employeeId: z.string().uuid().optional(),
        reviewerId: z.string().uuid().optional(),
        status: reviewStatusEnum.optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const offset = (input.page - 1) * input.pageSize

        let query = adminClient
          .from('performance_reviews')
          .select(`
            *,
            employee:employees!performance_reviews_employee_id_fkey(
              id, job_title, department,
              user:user_profiles!inner(full_name, avatar_url)
            ),
            reviewer:user_profiles!performance_reviews_reviewer_id_fkey(id, full_name, avatar_url),
            cycle:review_cycles(id, name, status)
          `, { count: 'exact' })
          .eq('org_id', ctx.orgId)
          .order('created_at', { ascending: false })

        if (input.cycleId) query = query.eq('cycle_id', input.cycleId)
        if (input.employeeId) query = query.eq('employee_id', input.employeeId)
        if (input.reviewerId) query = query.eq('reviewer_id', input.reviewerId)
        if (input.status) query = query.eq('review_status', input.status)

        const { data, count, error } = await query.range(offset, offset + input.pageSize - 1)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          pagination: {
            total: count ?? 0,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil((count ?? 0) / input.pageSize),
          },
        }
      }),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const [reviewResult, goalsResult, competenciesResult, feedbackResult] = await Promise.all([
          adminClient
            .from('performance_reviews')
            .select(`
              *,
              employee:employees!performance_reviews_employee_id_fkey(
                id, job_title, department, hire_date,
                user:user_profiles!inner(full_name, email, avatar_url)
              ),
              reviewer:user_profiles!performance_reviews_reviewer_id_fkey(id, full_name, avatar_url),
              cycle:review_cycles(id, name, status, include_self_assessment, include_goals, include_competencies)
            `)
            .eq('id', input.id)
            .eq('org_id', ctx.orgId)
            .single(),

          adminClient
            .from('performance_goals')
            .select('*')
            .eq('review_id', input.id)
            .order('created_at'),

          adminClient
            .from('review_competency_assessments')
            .select(`
              *,
              competency:competencies(id, name, category, level_1_description, level_2_description, level_3_description, level_4_description, level_5_description)
            `)
            .eq('review_id', input.id),

          adminClient
            .from('performance_feedback')
            .select('*')
            .eq('review_id', input.id),
        ])

        if (reviewResult.error || !reviewResult.data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' })
        }

        return {
          ...reviewResult.data,
          goals: goalsResult.data ?? [],
          competencies: competenciesResult.data ?? [],
          feedback: feedbackResult.data ?? [],
        }
      }),

    // Submit self-assessment
    submitSelfAssessment: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        selfAssessment: z.string(),
        employeeComments: z.string().optional(),
        goalRatings: z.array(z.object({
          goalId: z.string().uuid(),
          rating: z.number().min(1).max(5),
          comments: z.string().optional(),
        })).optional(),
        competencyRatings: z.array(z.object({
          competencyId: z.string().uuid(),
          selfRating: z.number().min(1).max(5),
          selfComments: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Update review
        const { data, error } = await adminClient
          .from('performance_reviews')
          .update({
            employee_self_assessment: input.selfAssessment,
            employee_comments: input.employeeComments,
            review_status: 'self_submitted',
            self_review_submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update goal ratings
        if (input.goalRatings) {
          for (const gr of input.goalRatings) {
            await adminClient
              .from('performance_goals')
              .update({
                rating: gr.rating,
                comments: gr.comments,
                updated_at: new Date().toISOString(),
              })
              .eq('id', gr.goalId)
          }
        }

        // Update competency ratings
        if (input.competencyRatings) {
          for (const cr of input.competencyRatings) {
            await adminClient
              .from('review_competency_assessments')
              .upsert({
                review_id: input.id,
                competency_id: cr.competencyId,
                self_rating: cr.selfRating,
                self_comments: cr.selfComments,
                updated_at: new Date().toISOString(),
              })
          }
        }

        return data
      }),

    // Submit manager review
    submitManagerReview: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        overallRating: z.number().min(1).max(5),
        qualityOfWork: z.number().min(1).max(5).optional(),
        communication: z.number().min(1).max(5).optional(),
        teamwork: z.number().min(1).max(5).optional(),
        initiative: z.number().min(1).max(5).optional(),
        reliability: z.number().min(1).max(5).optional(),
        potentialRating: z.number().min(1).max(5).optional(),
        strengths: z.string().optional(),
        areasForImprovement: z.string().optional(),
        managerComments: z.string().optional(),
        competencyRatings: z.array(z.object({
          competencyId: z.string().uuid(),
          managerRating: z.number().min(1).max(5),
          managerComments: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('performance_reviews')
          .update({
            overall_rating: input.overallRating,
            quality_of_work: input.qualityOfWork,
            communication: input.communication,
            teamwork: input.teamwork,
            initiative: input.initiative,
            reliability: input.reliability,
            potential_rating: input.potentialRating,
            strengths: input.strengths,
            areas_for_improvement: input.areasForImprovement,
            manager_comments: input.managerComments,
            review_status: 'manager_submitted',
            manager_review_submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update competency ratings
        if (input.competencyRatings) {
          for (const cr of input.competencyRatings) {
            await adminClient
              .from('review_competency_assessments')
              .upsert({
                review_id: input.id,
                competency_id: cr.competencyId,
                manager_rating: cr.managerRating,
                manager_comments: cr.managerComments,
                updated_at: new Date().toISOString(),
              })
          }
        }

        return data
      }),

    // Employee acknowledge review
    acknowledge: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        employeeComments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('performance_reviews')
          .update({
            review_status: 'acknowledged',
            employee_acknowledged_at: new Date().toISOString(),
            employee_comments: input.employeeComments,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // ============ CALIBRATION ============

  calibration: router({
    // Get 9-box grid data
    getNineBoxGrid: orgProtectedProcedure
      .input(z.object({
        cycleId: z.string().uuid(),
        departmentId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('performance_reviews')
          .select(`
            id,
            overall_rating,
            potential_rating,
            calibrated_rating,
            nine_box_position,
            employee:employees!performance_reviews_employee_id_fkey(
              id, job_title, department, department_id,
              user:user_profiles!inner(full_name, avatar_url)
            )
          `)
          .eq('cycle_id', input.cycleId)
          .eq('org_id', ctx.orgId)
          .in('review_status', ['manager_submitted', 'calibration', 'calibrated'])

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by department if specified
        let filteredData = data ?? []
        if (input.departmentId) {
          filteredData = filteredData.filter(
            r => (r.employee as { department_id: string })?.department_id === input.departmentId
          )
        }

        // Group into 9-box grid
        const grid: Record<string, typeof filteredData> = {
          'high-low': [],
          'high-medium': [],
          'high-high': [],
          'medium-low': [],
          'medium-medium': [],
          'medium-high': [],
          'low-low': [],
          'low-medium': [],
          'low-high': [],
        }

        filteredData.forEach(review => {
          const perf = review.calibrated_rating ?? review.overall_rating ?? 3
          const pot = review.potential_rating ?? 3

          const perfLevel = perf >= 4 ? 'high' : perf >= 3 ? 'medium' : 'low'
          const potLevel = pot >= 4 ? 'high' : pot >= 3 ? 'medium' : 'low'
          const key = `${potLevel}-${perfLevel}`

          if (grid[key]) {
            grid[key].push(review)
          }
        })

        return { grid, total: filteredData.length }
      }),

    // Update calibration for a review
    updateCalibration: orgProtectedProcedure
      .input(z.object({
        reviewId: z.string().uuid(),
        calibratedRating: z.number().min(1).max(5),
        calibrationNotes: z.string().optional(),
        nineBoxPosition: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('performance_reviews')
          .update({
            calibrated_rating: input.calibratedRating,
            calibration_notes: input.calibrationNotes,
            nine_box_position: input.nineBoxPosition,
            calibrated_by: ctx.userId,
            calibrated_at: new Date().toISOString(),
            review_status: 'calibrated',
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.reviewId)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // ============ GOALS / OKRs ============

  goals: router({
    list: orgProtectedProcedure
      .input(z.object({
        scope: goalScopeEnum.optional(),
        employeeId: z.string().uuid().optional(),
        departmentId: z.string().uuid().optional(),
        cycleId: z.string().uuid().optional(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'deferred', 'cancelled']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('performance_goals')
          .select(`
            *,
            employee:employees!performance_goals_employee_id_fkey(
              id, job_title,
              user:user_profiles!inner(full_name, avatar_url)
            ),
            parent:performance_goals!performance_goals_parent_goal_id_fkey(id, goal),
            children:performance_goals!performance_goals_parent_goal_id_fkey(id, goal, progress_percent, status)
          `)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.scope) query = query.eq('scope', input.scope)
        if (input.employeeId) query = query.eq('employee_id', input.employeeId)
        if (input.departmentId) query = query.eq('department_id', input.departmentId)
        if (input.cycleId) query = query.eq('cycle_id', input.cycleId)
        if (input.status) query = query.eq('status', input.status)

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    create: orgProtectedProcedure
      .input(createGoalInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('performance_goals')
          .insert({
            org_id: ctx.orgId,
            employee_id: input.employeeId,
            department_id: input.departmentId,
            review_id: input.reviewId,
            cycle_id: input.cycleId,
            parent_goal_id: input.parentGoalId,
            goal: input.goal,
            category: input.category,
            scope: input.scope,
            goal_type_enum: input.goalType,
            weight_percent: input.weightPercent,
            start_date: input.startDate,
            target_date: input.targetDate,
            status: 'not_started',
            progress_percent: 0,
            owner_id: input.employeeId ? null : ctx.userId,
            created_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    updateProgress: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        progressPercent: z.number().min(0).max(100),
        comments: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          progress_percent: input.progressPercent,
          updated_at: new Date().toISOString(),
        }

        if (input.comments) updateData.comments = input.comments
        if (input.progressPercent >= 100) {
          updateData.status = 'completed'
          updateData.completed_at = new Date().toISOString()
        } else if (input.progressPercent > 0) {
          updateData.status = 'in_progress'
        }

        const { data, error } = await adminClient
          .from('performance_goals')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Get OKR cascade tree
    getCascadeTree: orgProtectedProcedure
      .input(z.object({ cycleId: z.string().uuid().optional() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('performance_goals')
          .select(`
            *,
            employee:employees!performance_goals_employee_id_fkey(
              user:user_profiles!inner(full_name, avatar_url)
            ),
            department:departments(id, name)
          `)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('scope')
          .order('created_at')

        if (input.cycleId) {
          query = query.eq('cycle_id', input.cycleId)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Build tree structure
        const goals = data ?? []
        const goalMap = new Map(goals.map(g => [g.id, { ...g, children: [] as typeof goals }]))

        const rootGoals: typeof goals = []
        goals.forEach(goal => {
          if (goal.parent_goal_id && goalMap.has(goal.parent_goal_id)) {
            goalMap.get(goal.parent_goal_id)!.children.push(goalMap.get(goal.id)!)
          } else {
            rootGoals.push(goalMap.get(goal.id)!)
          }
        })

        return rootGoals
      }),
  }),

  // ============ ONE-ON-ONE MEETINGS ============

  oneOnOnes: router({
    list: orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
        managerId: z.string().uuid().optional(),
        status: meetingStatusEnum.optional(),
        upcoming: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('one_on_one_meetings')
          .select(`
            *,
            employee:employees!one_on_one_meetings_employee_id_fkey(
              id, job_title,
              user:user_profiles!inner(full_name, avatar_url)
            ),
            manager:employees!one_on_one_meetings_manager_id_fkey(
              id, job_title,
              user:user_profiles!inner(full_name, avatar_url)
            )
          `)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .order('scheduled_at', { ascending: input.upcoming ?? false })

        if (input.employeeId) query = query.eq('employee_id', input.employeeId)
        if (input.managerId) query = query.eq('manager_id', input.managerId)
        if (input.status) query = query.eq('status', input.status)
        if (input.upcoming) {
          query = query.gte('scheduled_at', new Date().toISOString())
        }

        const { data, error } = await query.limit(50)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    create: orgProtectedProcedure
      .input(createOneOnOneInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('one_on_one_meetings')
          .insert({
            org_id: ctx.orgId,
            employee_id: input.employeeId,
            manager_id: input.managerId,
            scheduled_at: input.scheduledAt,
            duration_minutes: input.durationMinutes,
            employee_agenda: input.employeeAgenda,
            manager_agenda: input.managerAgenda,
            is_recurring: input.isRecurring,
            recurrence_rule: input.recurrenceRule,
            status: 'scheduled',
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    updateAgenda: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        employeeAgenda: z.string().optional(),
        managerAgenda: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (input.employeeAgenda !== undefined) updateData.employee_agenda = input.employeeAgenda
        if (input.managerAgenda !== undefined) updateData.manager_agenda = input.managerAgenda

        const { data, error } = await adminClient
          .from('one_on_one_meetings')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    complete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        sharedNotes: z.string().optional(),
        privateManagerNotes: z.string().optional(),
        actionItems: z.array(z.object({
          description: z.string(),
          assignedTo: z.string().optional(),
          dueDate: z.string().optional(),
        })).optional(),
        nextMeetingAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('one_on_one_meetings')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            shared_notes: input.sharedNotes,
            private_manager_notes: input.privateManagerNotes,
            action_items: input.actionItems ?? [],
            next_meeting_at: input.nextMeetingAt,
            updated_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    getUpcoming: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      // Get employee for current user
      const { data: employee } = await adminClient
        .from('employees')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (!employee) {
        return []
      }

      const { data, error } = await adminClient
        .from('one_on_one_meetings')
        .select(`
          *,
          employee:employees!one_on_one_meetings_employee_id_fkey(
            user:user_profiles!inner(full_name, avatar_url)
          ),
          manager:employees!one_on_one_meetings_manager_id_fkey(
            user:user_profiles!inner(full_name, avatar_url)
          )
        `)
        .eq('org_id', ctx.orgId)
        .or(`employee_id.eq.${employee.id},manager_id.eq.${employee.id}`)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .is('deleted_at', null)
        .order('scheduled_at')
        .limit(10)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
    }),
  }),

  // Dashboard stats
  dashboard: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    const [activeCycleResult, pendingReviewsResult, goalsResult, meetingsResult] = await Promise.all([
      // Active review cycle
      adminClient
        .from('review_cycles')
        .select('id, name, status, self_review_deadline, manager_review_deadline')
        .eq('org_id', ctx.orgId)
        .in('status', ['self_review', 'manager_review', 'calibration'])
        .is('deleted_at', null)
        .limit(1)
        .single(),

      // Pending reviews count
      adminClient
        .from('performance_reviews')
        .select('id')
        .eq('org_id', ctx.orgId)
        .in('review_status', ['pending', 'self_review', 'manager_review']),

      // Active goals count
      adminClient
        .from('performance_goals')
        .select('id')
        .eq('org_id', ctx.orgId)
        .in('status', ['not_started', 'in_progress'])
        .is('deleted_at', null),

      // Upcoming 1:1s
      adminClient
        .from('one_on_one_meetings')
        .select('id')
        .eq('org_id', ctx.orgId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .is('deleted_at', null),
    ])

    return {
      activeCycle: activeCycleResult.data ?? null,
      pendingReviews: pendingReviewsResult.data?.length ?? 0,
      activeGoals: goalsResult.data?.length ?? 0,
      upcomingMeetings: meetingsResult.data?.length ?? 0,
    }
  }),
})
