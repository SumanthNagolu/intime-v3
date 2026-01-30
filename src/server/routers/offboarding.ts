/**
 * Offboarding Router
 * Manages employee offboarding processes, templates, and tasks
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// Input schemas
const listOffboardingInput = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
})

const createOffboardingInput = z.object({
  employeeId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  terminationType: z.enum(['voluntary', 'involuntary', 'retirement', 'contract_end', 'layoff', 'mutual']),
  lastWorkingDay: z.string(), // date string
  notes: z.string().optional(),
})

const updateOffboardingInput = z.object({
  id: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional(),
  lastWorkingDay: z.string().optional(),
  exitInterviewScheduledAt: z.string().optional(),
  exitInterviewCompletedAt: z.string().optional(),
  exitInterviewNotes: z.string().optional(),
  rehireEligible: z.boolean().optional(),
  rehireNotes: z.string().optional(),
})

const completeTaskInput = z.object({
  taskId: z.string().uuid(),
  notes: z.string().optional(),
})

// Template schemas
const createTemplateInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  terminationType: z.enum(['voluntary', 'involuntary', 'retirement', 'contract_end', 'layoff', 'mutual']).optional(),
  isDefault: z.boolean().optional(),
  tasks: z.array(z.object({
    taskName: z.string().min(1),
    description: z.string().optional(),
    category: z.enum(['it', 'hr', 'manager', 'finance', 'facilities', 'legal', 'other']),
    dueOffsetDays: z.number().default(0),
    assigneeRole: z.string().optional(),
    isRequired: z.boolean().default(true),
    sortOrder: z.number().default(0),
  })).optional(),
})

export const offboardingRouter = router({
  // List offboarding processes
  list: orgProtectedProcedure
    .input(listOffboardingInput)
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const offset = (input.page - 1) * input.pageSize

      let query = adminClient
        .from('employee_offboarding')
        .select(`
          *,
          employee:employees!inner(
            id,
            user_id,
            employee_number,
            job_title,
            department,
            user:user_profiles!inner(full_name, email, avatar_url)
          ),
          template:offboarding_templates(id, name)
        `, { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .order('last_working_day', { ascending: true })

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

  // Get offboarding stats
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('employee_offboarding')
      .select('status')
      .eq('org_id', ctx.orgId)
      .is('deleted_at', null)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const statusCounts = (data ?? []).reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: data?.length ?? 0,
      notStarted: statusCounts['not_started'] ?? 0,
      inProgress: statusCounts['in_progress'] ?? 0,
      completed: statusCounts['completed'] ?? 0,
      blocked: statusCounts['blocked'] ?? 0,
    }
  }),

  // Get single offboarding by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('employee_offboarding')
        .select(`
          *,
          employee:employees!inner(
            id,
            user_id,
            employee_number,
            job_title,
            department,
            hire_date,
            user:user_profiles!inner(full_name, email, avatar_url, phone)
          ),
          template:offboarding_templates(id, name, description)
        `)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offboarding not found' })
      }

      return data
    }),

  // Get full offboarding detail (ONE DB CALL pattern)
  getFullOffboarding: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Fetch all data in parallel
      const [offboardingResult, tasksResult] = await Promise.all([
        adminClient
          .from('employee_offboarding')
          .select(`
            *,
            employee:employees!inner(
              id,
              user_id,
              employee_number,
              job_title,
              department,
              hire_date,
              manager_id,
              user:user_profiles!inner(full_name, email, avatar_url, phone)
            ),
            template:offboarding_templates(id, name, description)
          `)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single(),

        adminClient
          .from('offboarding_tasks')
          .select(`
            *,
            assigned_user:user_profiles!offboarding_tasks_assigned_to_fkey(id, full_name, avatar_url),
            completed_user:user_profiles!offboarding_tasks_completed_by_fkey(id, full_name)
          `)
          .eq('offboarding_id', input.id)
          .order('category', { ascending: true })
          .order('due_date', { ascending: true }),
      ])

      if (offboardingResult.error || !offboardingResult.data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offboarding not found' })
      }

      // Group tasks by category
      const tasksByCategory = (tasksResult.data ?? []).reduce((acc, task) => {
        if (!acc[task.category]) acc[task.category] = []
        acc[task.category].push(task)
        return acc
      }, {} as Record<string, typeof tasksResult.data>)

      const completedTasks = (tasksResult.data ?? []).filter(t => t.status === 'completed').length
      const totalTasks = tasksResult.data?.length ?? 0

      return {
        ...offboardingResult.data,
        tasks: tasksResult.data ?? [],
        tasksByCategory,
        progress: {
          completed: completedTasks,
          total: totalTasks,
          percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
      }
    }),

  // Create offboarding process
  create: orgProtectedProcedure
    .input(createOffboardingInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Verify employee exists in org
      const { data: employee, error: empError } = await adminClient
        .from('employees')
        .select('id')
        .eq('id', input.employeeId)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (empError || !employee) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' })
      }

      // Create offboarding record
      const { data: offboarding, error } = await adminClient
        .from('employee_offboarding')
        .insert({
          org_id: ctx.orgId,
          employee_id: input.employeeId,
          template_id: input.templateId,
          termination_type: input.terminationType,
          last_working_day: input.lastWorkingDay,
          status: 'not_started',
          created_by: ctx.userId,
          updated_by: ctx.userId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // If template provided, copy tasks from template
      if (input.templateId) {
        const { data: templateTasks } = await adminClient
          .from('offboarding_template_tasks')
          .select('*')
          .eq('template_id', input.templateId)
          .order('sort_order')

        if (templateTasks && templateTasks.length > 0) {
          const lastWorkingDate = new Date(input.lastWorkingDay)
          const tasks = templateTasks.map(t => ({
            offboarding_id: offboarding.id,
            task_name: t.task_name,
            description: t.description,
            category: t.category,
            status: 'pending',
            due_date: new Date(lastWorkingDate.getTime() + (t.due_offset_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          }))

          await adminClient.from('offboarding_tasks').insert(tasks)
        }
      }

      return offboarding
    }),

  // Update offboarding
  update: orgProtectedProcedure
    .input(updateOffboardingInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: ctx.userId,
      }

      if (input.status) updateData.status = input.status
      if (input.lastWorkingDay) updateData.last_working_day = input.lastWorkingDay
      if (input.exitInterviewScheduledAt) updateData.exit_interview_scheduled_at = input.exitInterviewScheduledAt
      if (input.exitInterviewCompletedAt) updateData.exit_interview_completed_at = input.exitInterviewCompletedAt
      if (input.exitInterviewNotes !== undefined) updateData.exit_interview_notes = input.exitInterviewNotes
      if (input.rehireEligible !== undefined) updateData.rehire_eligible = input.rehireEligible
      if (input.rehireNotes !== undefined) updateData.rehire_notes = input.rehireNotes

      // Update status timestamps
      if (input.status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString()
      }
      if (input.status === 'completed' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error } = await adminClient
        .from('employee_offboarding')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete offboarding (soft delete)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('employee_offboarding')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: ctx.userId,
        })
        .eq('id', input.id)
        .eq('org_id', ctx.orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Complete a task
  completeTask: orgProtectedProcedure
    .input(completeTaskInput)
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('offboarding_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: ctx.userId,
          notes: input.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.taskId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Templates
  templates: router({
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('offboarding_templates')
        .select(`
          *,
          tasks:offboarding_template_tasks(count)
        `)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
    }),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('offboarding_templates')
          .select(`
            *,
            tasks:offboarding_template_tasks(*)
          `)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
        }

        return data
      }),

    create: orgProtectedProcedure
      .input(createTemplateInput)
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Create template
        const { data: template, error } = await adminClient
          .from('offboarding_templates')
          .insert({
            org_id: ctx.orgId,
            name: input.name,
            description: input.description,
            termination_type: input.terminationType,
            is_default: input.isDefault ?? false,
            created_by: ctx.userId,
            updated_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create template tasks if provided
        if (input.tasks && input.tasks.length > 0) {
          const tasks = input.tasks.map((t, idx) => ({
            template_id: template.id,
            task_name: t.taskName,
            description: t.description,
            category: t.category,
            due_offset_days: t.dueOffsetDays,
            assignee_role: t.assigneeRole,
            is_required: t.isRequired,
            sort_order: t.sortOrder ?? idx,
          }))

          await adminClient.from('offboarding_template_tasks').insert(tasks)
        }

        return template
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('offboarding_templates')
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: ctx.userId,
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // Dashboard data
  dashboard: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()

    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [statsResult, upcomingResult, overdueResult] = await Promise.all([
      // Stats
      adminClient
        .from('employee_offboarding')
        .select('status, termination_type')
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null),

      // Upcoming (next 30 days)
      adminClient
        .from('employee_offboarding')
        .select(`
          id,
          last_working_day,
          termination_type,
          status,
          employee:employees!inner(
            id,
            job_title,
            department,
            user:user_profiles!inner(full_name, avatar_url)
          )
        `)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .gte('last_working_day', today)
        .lte('last_working_day', thirtyDaysFromNow)
        .neq('status', 'completed')
        .order('last_working_day')
        .limit(10),

      // Overdue tasks
      adminClient
        .from('offboarding_tasks')
        .select(`
          id,
          task_name,
          due_date,
          category,
          offboarding:employee_offboarding!inner(
            id,
            org_id,
            employee:employees!inner(
              user:user_profiles!inner(full_name)
            )
          )
        `)
        .eq('status', 'pending')
        .lt('due_date', today)
        .limit(20),
    ])

    // Filter overdue tasks by org_id
    const overdueTasks = (overdueResult.data ?? []).filter(
      t => (t.offboarding as { org_id: string })?.org_id === ctx.orgId
    )

    const statusCounts = (statsResult.data ?? []).reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      stats: {
        total: statsResult.data?.length ?? 0,
        notStarted: statusCounts['not_started'] ?? 0,
        inProgress: statusCounts['in_progress'] ?? 0,
        completed: statusCounts['completed'] ?? 0,
      },
      upcoming: upcomingResult.data ?? [],
      overdueTasks,
    }
  }),
})
