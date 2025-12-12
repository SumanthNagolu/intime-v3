import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// =====================================================
// SCHEMAS
// =====================================================

const employmentStatusSchema = z.enum(['onboarding', 'active', 'on_leave', 'terminated', 'all'])
const employmentTypeSchema = z.enum(['fte', 'contractor', 'intern', 'part_time', 'all'])

// Onboarding schemas
const onboardingStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'cancelled'])
const taskCategorySchema = z.enum(['paperwork', 'it_setup', 'training', 'orientation', 'other'])
const taskStatusSchema = z.enum(['pending', 'completed', 'skipped'])
const sortFieldSchema = z.enum([
  'created_at',
  'hire_date',
  'employee_number',
  'job_title',
  'department',
  'status',
  'location',
])

// =====================================================
// HR ROUTER
// =====================================================

export const hrRouter = router({
  // =====================================================
  // EMPLOYEES NAMESPACE
  // =====================================================
  employees: router({
    // ============================================
    // LIST EMPLOYEES
    // ============================================
    list: orgProtectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: employmentStatusSchema.optional(),
          employmentType: employmentTypeSchema.optional(),
          department: z.string().optional(),
          managerId: z.string().uuid().optional(),
          podId: z.string().uuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          sortBy: sortFieldSchema.default('created_at'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
        })
      )
      .query(async ({ ctx, input }) => {
        const { supabase, orgId } = ctx
        const {
          search,
          status,
          employmentType,
          department,
          managerId,
          podId,
          limit,
          offset,
          sortBy,
          sortOrder,
        } = input

        let query = supabase
          .from('employees')
          .select(
            `
            *,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            ),
            manager:employees!employees_manager_id_fkey(
              id,
              user_id,
              user:user_profiles!employees_user_id_fkey(
                id,
                full_name,
                avatar_url
              )
            )
          `,
            { count: 'exact' }
          )
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Apply filters
        if (search) {
          // Search in user_profiles table via RPC or join
          // For now, we search in job_title and department
          query = query.or(
            `job_title.ilike.%${search}%,department.ilike.%${search}%,employee_number.ilike.%${search}%`
          )
        }

        if (status && status !== 'all') {
          query = query.eq('status', status)
        }

        if (employmentType && employmentType !== 'all') {
          query = query.eq('employment_type', employmentType)
        }

        if (department) {
          query = query.eq('department', department)
        }

        if (managerId) {
          query = query.eq('manager_id', managerId)
        }

        // Sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Pagination
        query = query.range(offset, offset + limit - 1)

        const { data, count, error } = await query

        if (error) {
          console.error('Failed to fetch employees:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch employees',
          })
        }

        // Transform to camelCase for frontend
        const items = (data ?? []).map((employee) => ({
          id: employee.id,
          userId: employee.user_id,
          employeeNumber: employee.employee_number,
          status: employee.status,
          employmentType: employee.employment_type,
          hireDate: employee.hire_date,
          terminationDate: employee.termination_date,
          department: employee.department,
          jobTitle: employee.job_title,
          location: employee.location,
          workMode: employee.work_mode,
          salaryType: employee.salary_type,
          salaryAmount: employee.salary_amount,
          currency: employee.currency,
          createdAt: employee.created_at,
          updatedAt: employee.updated_at,
          // Related data
          user: employee.user,
          manager: employee.manager,
        }))

        return {
          items,
          total: count ?? 0,
        }
      }),

    // ============================================
    // GET EMPLOYEE STATS
    // ============================================
    stats: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get all employees for this org
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, status, hire_date, department')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to fetch employee stats:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch employee stats',
        })
      }

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const total = employees?.length ?? 0
      const active = employees?.filter((e) => e.status === 'active').length ?? 0
      const newThisMonth =
        employees?.filter((e) => {
          if (!e.hire_date) return false
          return new Date(e.hire_date) >= startOfMonth
        }).length ?? 0

      // Count by department
      const departmentCounts: Record<string, number> = {}
      employees?.forEach((e) => {
        if (e.department) {
          departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1
        }
      })

      return {
        total,
        active,
        newThisMonth,
        byDepartment: Object.keys(departmentCounts).length,
      }
    }),

    // ============================================
    // GET EMPLOYEE BY ID
    // ============================================
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { supabase, orgId } = ctx

        const { data: employee, error } = await supabase
          .from('employees')
          .select(
            `
            *,
            user:user_profiles!employees_user_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            ),
            manager:employees!employees_manager_id_fkey(
              id,
              user_id,
              user:user_profiles!employees_user_id_fkey(
                id,
                full_name,
                avatar_url
              )
            ),
            profile:employee_profiles(*)
          `
          )
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !employee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Employee not found',
          })
        }

        return employee
      }),

    // ============================================
    // GET DEPARTMENTS (for filter dropdown)
    // ============================================
    getDepartments: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('department', 'is', null)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch departments',
        })
      }

      // Get unique departments
      const departments = [...new Set(data?.map((e) => e.department).filter(Boolean))]
      return departments.sort()
    }),

    // ============================================
    // GET MANAGERS (for filter dropdown)
    // ============================================
    getManagers: orgProtectedProcedure.query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get employees who are managers (have direct reports)
      const { data: managerIds, error: managerError } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('manager_id', 'is', null)

      if (managerError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch managers',
        })
      }

      const uniqueManagerIds = [...new Set(managerIds?.map((e) => e.manager_id).filter(Boolean))]

      if (uniqueManagerIds.length === 0) {
        return []
      }

      const { data: managers, error } = await supabase
        .from('employees')
        .select(
          `
          id,
          user:user_profiles!employees_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `
        )
        .in('id', uniqueManagerIds)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch manager details',
        })
      }

      return managers ?? []
    }),
  }),

  // =====================================================
  // ONBOARDING NAMESPACE
  // =====================================================
  onboarding: router({
    // ============================================
    // TEMPLATES
    // ============================================
    templates: router({
      // Create a new onboarding template
      create: orgProtectedProcedure
        .input(
          z.object({
            name: z.string().min(1).max(200),
            description: z.string().optional(),
            employeeType: z.enum(['full_time', 'contractor', 'intern', 'temp']).optional(),
            department: z.string().max(100).optional(),
            isDefault: z.boolean().default(false),
            tasks: z.array(
              z.object({
                taskName: z.string().min(1).max(200),
                description: z.string().optional(),
                category: taskCategorySchema.default('other'),
                dueOffsetDays: z.number().int().default(0),
                isRequired: z.boolean().default(true),
                sortOrder: z.number().int().default(0),
                assigneeRole: z.string().max(100).optional(),
                complianceRequirementId: z.string().uuid().optional(),
                documentTemplateId: z.string().uuid().optional(),
              })
            ).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id
          const { tasks, ...templateData } = input

          // If marking as default, unset other defaults for same type/department
          if (templateData.isDefault) {
            await supabase
              .from('onboarding_templates')
              .update({ is_default: false, updated_by: userId })
              .eq('org_id', orgId)
              .eq('is_default', true)
              .is('deleted_at', null)
              .or(
                templateData.employeeType
                  ? `employee_type.eq.${templateData.employeeType}`
                  : 'employee_type.is.null'
              )
          }

          // Create template
          const { data: template, error: templateError } = await supabase
            .from('onboarding_templates')
            .insert({
              org_id: orgId,
              name: templateData.name,
              description: templateData.description,
              employee_type: templateData.employeeType,
              department: templateData.department,
              is_default: templateData.isDefault,
              is_active: true,
              created_by: userId,
              updated_by: userId,
            })
            .select()
            .single()

          if (templateError || !template) {
            console.error('Failed to create onboarding template:', templateError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create onboarding template',
            })
          }

          // Create template tasks if provided
          if (tasks && tasks.length > 0) {
            const taskRecords = tasks.map((task, index) => ({
              org_id: orgId,
              template_id: template.id,
              task_name: task.taskName,
              description: task.description,
              category: task.category,
              due_offset_days: task.dueOffsetDays,
              is_required: task.isRequired,
              sort_order: task.sortOrder ?? index,
              assignee_role: task.assigneeRole,
              compliance_requirement_id: task.complianceRequirementId,
              document_template_id: task.documentTemplateId,
            }))

            const { error: tasksError } = await supabase
              .from('onboarding_template_tasks')
              .insert(taskRecords)

            if (tasksError) {
              console.error('Failed to create template tasks:', tasksError)
              // Template was created, so return it but note the task error
            }
          }

          return {
            id: template.id,
            name: template.name,
            description: template.description,
            employeeType: template.employee_type,
            department: template.department,
            isDefault: template.is_default,
            isActive: template.is_active,
            createdAt: template.created_at,
          }
        }),

      // List onboarding templates
      list: orgProtectedProcedure
        .input(
          z.object({
            employeeType: z.string().optional(),
            department: z.string().optional(),
            includeInactive: z.boolean().default(false),
          })
        )
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          let query = supabase
            .from('onboarding_templates')
            .select('*, tasks:onboarding_template_tasks(count)')
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('is_default', { ascending: false })
            .order('name', { ascending: true })

          if (!input.includeInactive) {
            query = query.eq('is_active', true)
          }

          if (input.employeeType) {
            query = query.or(`employee_type.eq.${input.employeeType},employee_type.is.null`)
          }

          if (input.department) {
            query = query.or(`department.eq.${input.department},department.is.null`)
          }

          const { data, error } = await query

          if (error) {
            console.error('Failed to fetch onboarding templates:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch onboarding templates',
            })
          }

          return (data ?? []).map((template) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            employeeType: template.employee_type,
            department: template.department,
            isDefault: template.is_default,
            isActive: template.is_active,
            taskCount: Array.isArray(template.tasks) ? template.tasks.length : 0,
            createdAt: template.created_at,
            updatedAt: template.updated_at,
          }))
        }),

      // Get template by ID with tasks
      getById: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          const { data: template, error } = await supabase
            .from('onboarding_templates')
            .select(
              `
              *,
              tasks:onboarding_template_tasks(
                id,
                task_name,
                description,
                category,
                due_offset_days,
                is_required,
                sort_order,
                assignee_role,
                compliance_requirement_id,
                document_template_id
              ),
              creator:user_profiles!onboarding_templates_created_by_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single()

          if (error || !template) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Onboarding template not found',
            })
          }

          return {
            id: template.id,
            name: template.name,
            description: template.description,
            employeeType: template.employee_type,
            department: template.department,
            isDefault: template.is_default,
            isActive: template.is_active,
            tasks: (template.tasks ?? []).map((task: Record<string, unknown>) => ({
              id: task.id,
              taskName: task.task_name,
              description: task.description,
              category: task.category,
              dueOffsetDays: task.due_offset_days,
              isRequired: task.is_required,
              sortOrder: task.sort_order,
              assigneeRole: task.assignee_role,
              complianceRequirementId: task.compliance_requirement_id,
              documentTemplateId: task.document_template_id,
            })),
            creator: template.creator,
            createdAt: template.created_at,
            updatedAt: template.updated_at,
          }
        }),

      // Update template
      update: orgProtectedProcedure
        .input(
          z.object({
            id: z.string().uuid(),
            name: z.string().min(1).max(200).optional(),
            description: z.string().optional(),
            employeeType: z.enum(['full_time', 'contractor', 'intern', 'temp']).nullable().optional(),
            department: z.string().max(100).nullable().optional(),
            isDefault: z.boolean().optional(),
            isActive: z.boolean().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id
          const { id, ...updates } = input

          // Build update object
          const updateData: Record<string, unknown> = { updated_by: userId }
          if (updates.name !== undefined) updateData.name = updates.name
          if (updates.description !== undefined) updateData.description = updates.description
          if (updates.employeeType !== undefined) updateData.employee_type = updates.employeeType
          if (updates.department !== undefined) updateData.department = updates.department
          if (updates.isActive !== undefined) updateData.is_active = updates.isActive

          // Handle default flag
          if (updates.isDefault !== undefined) {
            updateData.is_default = updates.isDefault
            if (updates.isDefault) {
              // Unset other defaults first
              await supabase
                .from('onboarding_templates')
                .update({ is_default: false, updated_by: userId })
                .eq('org_id', orgId)
                .eq('is_default', true)
                .neq('id', id)
                .is('deleted_at', null)
            }
          }

          const { data, error } = await supabase
            .from('onboarding_templates')
            .update(updateData)
            .eq('id', id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .select()
            .single()

          if (error || !data) {
            console.error('Failed to update onboarding template:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to update onboarding template',
            })
          }

          return {
            id: data.id,
            name: data.name,
            description: data.description,
            employeeType: data.employee_type,
            department: data.department,
            isDefault: data.is_default,
            isActive: data.is_active,
            updatedAt: data.updated_at,
          }
        }),

      // Delete template (soft delete)
      delete: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id

          const { error } = await supabase
            .from('onboarding_templates')
            .update({ deleted_at: new Date().toISOString(), updated_by: userId })
            .eq('id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)

          if (error) {
            console.error('Failed to delete onboarding template:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to delete onboarding template',
            })
          }

          return { success: true }
        }),
    }),

    // ============================================
    // CHECKLISTS
    // ============================================
    checklists: router({
      // Assign onboarding checklist to employee
      assign: orgProtectedProcedure
        .input(
          z.object({
            contactId: z.string().uuid().optional(),
            employeeId: z.string().uuid().optional(),
            templateId: z.string().uuid(),
            startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            assignedTo: z.string().uuid().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id

          // Validate at least one identifier is provided
          if (!input.contactId && !input.employeeId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Either contactId or employeeId is required',
            })
          }

          // Get template with tasks
          const { data: template, error: templateError } = await supabase
            .from('onboarding_templates')
            .select('*, tasks:onboarding_template_tasks(*)')
            .eq('id', input.templateId)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single()

          if (templateError || !template) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Onboarding template not found',
            })
          }

          // Create the onboarding checklist
          const { data: checklist, error: checklistError } = await supabase
            .from('employee_onboarding')
            .insert({
              org_id: orgId,
              employee_id: input.employeeId,
              contact_id: input.contactId,
              checklist_template_id: input.templateId,
              status: 'not_started',
              assigned_to: input.assignedTo,
              created_by: userId,
            })
            .select()
            .single()

          if (checklistError || !checklist) {
            console.error('Failed to create onboarding checklist:', checklistError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create onboarding checklist',
            })
          }

          // Create tasks from template
          const templateTasks = template.tasks as Array<Record<string, unknown>>
          if (templateTasks && templateTasks.length > 0) {
            const startDate = new Date(input.startDate)

            const taskRecords = templateTasks.map((task) => {
              const dueOffsetDays = (task.due_offset_days as number) ?? 0
              const dueDate = new Date(startDate)
              dueDate.setDate(dueDate.getDate() + dueOffsetDays)

              return {
                org_id: orgId,
                onboarding_id: checklist.id,
                task_name: task.task_name,
                description: task.description,
                category: task.category ?? 'other',
                is_required: task.is_required ?? true,
                due_days_from_start: task.due_offset_days ?? 0,
                due_date: dueDate.toISOString().split('T')[0],
                status: 'pending',
                sort_order: task.sort_order ?? 0,
              }
            })

            const { error: tasksError } = await supabase.from('onboarding_tasks').insert(taskRecords)

            if (tasksError) {
              console.error('Failed to create onboarding tasks:', tasksError)
              // Checklist was created, tasks failed - log but don't fail
            }
          }

          return {
            id: checklist.id,
            employeeId: checklist.employee_id,
            contactId: checklist.contact_id,
            templateId: checklist.checklist_template_id,
            status: checklist.status,
            createdAt: checklist.created_at,
          }
        }),

      // Get checklists by contact/employee
      getByContact: orgProtectedProcedure
        .input(
          z.object({
            contactId: z.string().uuid().optional(),
            employeeId: z.string().uuid().optional(),
          })
        )
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          if (!input.contactId && !input.employeeId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Either contactId or employeeId is required',
            })
          }

          let query = supabase
            .from('employee_onboarding')
            .select(
              `
              *,
              template:onboarding_templates(id, name),
              tasks:onboarding_tasks(
                id,
                task_name,
                category,
                status,
                is_required,
                due_date,
                completed_at
              ),
              assigned_user:user_profiles!employee_onboarding_assigned_to_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })

          if (input.contactId) {
            query = query.eq('contact_id', input.contactId)
          }
          if (input.employeeId) {
            query = query.eq('employee_id', input.employeeId)
          }

          const { data, error } = await query

          if (error) {
            console.error('Failed to fetch onboarding checklists:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch onboarding checklists',
            })
          }

          return (data ?? []).map((checklist) => {
            const tasks = (checklist.tasks ?? []) as Array<Record<string, unknown>>
            const totalTasks = tasks.length
            const completedTasks = tasks.filter(
              (t) => t.status === 'completed' || t.status === 'skipped'
            ).length
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return {
              id: checklist.id,
              employeeId: checklist.employee_id,
              contactId: checklist.contact_id,
              templateId: checklist.checklist_template_id,
              templateName: (checklist.template as Record<string, unknown>)?.name,
              status: checklist.status,
              startedAt: checklist.started_at,
              completedAt: checklist.completed_at,
              assignedTo: checklist.assigned_user,
              notes: checklist.notes,
              progress,
              totalTasks,
              completedTasks,
              createdAt: checklist.created_at,
            }
          })
        }),

      // Get checklist by ID with full details
      getById: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          const { data: checklist, error } = await supabase
            .from('employee_onboarding')
            .select(
              `
              *,
              template:onboarding_templates(id, name, description),
              tasks:onboarding_tasks(
                id,
                task_name,
                description,
                category,
                status,
                is_required,
                due_date,
                due_days_from_start,
                completed_at,
                completed_by,
                skip_reason,
                notes,
                sort_order,
                assigned_to,
                assignee:user_profiles!onboarding_tasks_assigned_to_fkey(
                  id,
                  full_name,
                  avatar_url
                ),
                completer:user_profiles!onboarding_tasks_completed_by_fkey(
                  id,
                  full_name,
                  avatar_url
                )
              ),
              assigned_user:user_profiles!employee_onboarding_assigned_to_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          if (error || !checklist) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Onboarding checklist not found',
            })
          }

          const tasks = (checklist.tasks ?? []) as Array<Record<string, unknown>>
          const totalTasks = tasks.length
          const completedTasks = tasks.filter(
            (t) => t.status === 'completed' || t.status === 'skipped'
          ).length
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

          // Sort tasks by sort_order
          const sortedTasks = tasks.sort(
            (a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0)
          )

          return {
            id: checklist.id,
            employeeId: checklist.employee_id,
            contactId: checklist.contact_id,
            template: checklist.template,
            status: checklist.status,
            startedAt: checklist.started_at,
            completedAt: checklist.completed_at,
            assignedTo: checklist.assigned_user,
            notes: checklist.notes,
            progress,
            totalTasks,
            completedTasks,
            tasks: sortedTasks.map((task) => ({
              id: task.id,
              taskName: task.task_name,
              description: task.description,
              category: task.category,
              status: task.status,
              isRequired: task.is_required,
              dueDate: task.due_date,
              dueDaysFromStart: task.due_days_from_start,
              completedAt: task.completed_at,
              completedBy: task.completer,
              skipReason: task.skip_reason,
              notes: task.notes,
              sortOrder: task.sort_order,
              assignedTo: task.assignee,
            })),
            createdAt: checklist.created_at,
            updatedAt: checklist.updated_at,
          }
        }),

      // Get progress for a checklist
      getProgress: orgProtectedProcedure
        .input(z.object({ checklistId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          const { data, error } = await supabase
            .from('employee_onboarding')
            .select(
              `
              id,
              status,
              tasks:onboarding_tasks(
                id,
                status,
                is_required,
                category
              )
            `
            )
            .eq('id', input.checklistId)
            .eq('org_id', orgId)
            .single()

          if (error || !data) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Onboarding checklist not found',
            })
          }

          const tasks = (data.tasks ?? []) as Array<Record<string, unknown>>
          const byCategory: Record<string, { total: number; completed: number }> = {}

          tasks.forEach((task) => {
            const category = (task.category as string) ?? 'other'
            if (!byCategory[category]) {
              byCategory[category] = { total: 0, completed: 0 }
            }
            byCategory[category].total++
            if (task.status === 'completed' || task.status === 'skipped') {
              byCategory[category].completed++
            }
          })

          const total = tasks.length
          const completed = tasks.filter(
            (t) => t.status === 'completed' || t.status === 'skipped'
          ).length
          const required = tasks.filter((t) => t.is_required).length
          const requiredCompleted = tasks.filter(
            (t) => t.is_required && (t.status === 'completed' || t.status === 'skipped')
          ).length

          return {
            checklistId: data.id,
            checklistStatus: data.status,
            total,
            completed,
            pending: total - completed,
            required,
            requiredCompleted,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            requiredProgress: required > 0 ? Math.round((requiredCompleted / required) * 100) : 0,
            byCategory: Object.entries(byCategory).map(([category, stats]) => ({
              category,
              total: stats.total,
              completed: stats.completed,
              progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            })),
          }
        }),
    }),

    // ============================================
    // TASKS
    // ============================================
    tasks: router({
      // Complete a task
      complete: orgProtectedProcedure
        .input(
          z.object({
            taskId: z.string().uuid(),
            notes: z.string().optional(),
            documentId: z.string().uuid().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id

          // Get the task to verify ownership and get onboarding_id
          const { data: task, error: taskError } = await supabase
            .from('onboarding_tasks')
            .select('*, onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(id, org_id, status)')
            .eq('id', input.taskId)
            .single()

          if (taskError || !task) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found',
            })
          }

          const onboarding = task.onboarding as Record<string, unknown>
          if (onboarding?.org_id !== orgId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Access denied',
            })
          }

          // Update task to completed
          const { data: updatedTask, error } = await supabase
            .from('onboarding_tasks')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              completed_by: userId,
              notes: input.notes ?? task.notes,
              document_id: input.documentId,
            })
            .eq('id', input.taskId)
            .select()
            .single()

          if (error || !updatedTask) {
            console.error('Failed to complete task:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to complete task',
            })
          }

          // Update onboarding status if not started
          if (onboarding?.status === 'not_started') {
            await supabase
              .from('employee_onboarding')
              .update({
                status: 'in_progress',
                started_at: new Date().toISOString(),
              })
              .eq('id', onboarding.id)
          }

          // Check if all tasks are complete
          const { data: allTasks } = await supabase
            .from('onboarding_tasks')
            .select('id, status, is_required')
            .eq('onboarding_id', onboarding?.id)

          const allRequiredComplete = (allTasks ?? [])
            .filter((t) => t.is_required)
            .every((t) => t.status === 'completed' || t.status === 'skipped')

          if (allRequiredComplete) {
            const allComplete = (allTasks ?? []).every(
              (t) => t.status === 'completed' || t.status === 'skipped'
            )
            if (allComplete) {
              await supabase
                .from('employee_onboarding')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                })
                .eq('id', onboarding?.id)
            }
          }

          return {
            id: updatedTask.id,
            taskName: updatedTask.task_name,
            status: updatedTask.status,
            completedAt: updatedTask.completed_at,
          }
        }),

      // Skip a task
      skip: orgProtectedProcedure
        .input(
          z.object({
            taskId: z.string().uuid(),
            reason: z.string().min(1),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId, user } = ctx
          const userId = user?.id

          // Get the task to verify ownership
          const { data: task, error: taskError } = await supabase
            .from('onboarding_tasks')
            .select('*, onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(id, org_id)')
            .eq('id', input.taskId)
            .single()

          if (taskError || !task) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found',
            })
          }

          const onboarding = task.onboarding as Record<string, unknown>
          if (onboarding?.org_id !== orgId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Access denied',
            })
          }

          // Update task to skipped
          const { data: updatedTask, error } = await supabase
            .from('onboarding_tasks')
            .update({
              status: 'skipped',
              completed_at: new Date().toISOString(),
              completed_by: userId,
              skip_reason: input.reason,
            })
            .eq('id', input.taskId)
            .select()
            .single()

          if (error || !updatedTask) {
            console.error('Failed to skip task:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to skip task',
            })
          }

          return {
            id: updatedTask.id,
            taskName: updatedTask.task_name,
            status: updatedTask.status,
            skipReason: updatedTask.skip_reason,
          }
        }),

      // Reassign a task
      reassign: orgProtectedProcedure
        .input(
          z.object({
            taskId: z.string().uuid(),
            assigneeId: z.string().uuid(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          // Verify task belongs to org
          const { data: task, error: taskError } = await supabase
            .from('onboarding_tasks')
            .select('*, onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(org_id)')
            .eq('id', input.taskId)
            .single()

          if (taskError || !task) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found',
            })
          }

          const onboarding = task.onboarding as Record<string, unknown>
          if (onboarding?.org_id !== orgId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Access denied',
            })
          }

          const { data: updatedTask, error } = await supabase
            .from('onboarding_tasks')
            .update({ assigned_to: input.assigneeId })
            .eq('id', input.taskId)
            .select(
              `
              id,
              task_name,
              assigned_to,
              assignee:user_profiles!onboarding_tasks_assigned_to_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .single()

          if (error || !updatedTask) {
            console.error('Failed to reassign task:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to reassign task',
            })
          }

          return {
            id: updatedTask.id,
            taskName: updatedTask.task_name,
            assignedTo: updatedTask.assignee,
          }
        }),

      // Add note to task
      addNote: orgProtectedProcedure
        .input(
          z.object({
            taskId: z.string().uuid(),
            note: z.string().min(1),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          // Verify task belongs to org
          const { data: task, error: taskError } = await supabase
            .from('onboarding_tasks')
            .select('notes, onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(org_id)')
            .eq('id', input.taskId)
            .single()

          if (taskError || !task) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found',
            })
          }

          const onboarding = task.onboarding as unknown as Record<string, unknown>
          if (onboarding?.org_id !== orgId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Access denied',
            })
          }

          // Append note (preserve existing notes)
          const existingNotes = task.notes ?? ''
          const timestamp = new Date().toISOString()
          const newNotes = existingNotes
            ? `${existingNotes}\n\n[${timestamp}]\n${input.note}`
            : `[${timestamp}]\n${input.note}`

          const { error } = await supabase
            .from('onboarding_tasks')
            .update({ notes: newNotes })
            .eq('id', input.taskId)

          if (error) {
            console.error('Failed to add note:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to add note',
            })
          }

          return { success: true }
        }),
    }),

    // ============================================
    // DASHBOARD
    // ============================================
    dashboard: router({
      // Get pending tasks (optionally by assignee)
      getPending: orgProtectedProcedure
        .input(
          z.object({
            assigneeId: z.string().uuid().optional(),
            dueSoon: z.boolean().default(false), // Due within 7 days
            limit: z.number().int().min(1).max(100).default(20),
          })
        )
        .query(async ({ ctx, input }) => {
          const { supabase, orgId } = ctx

          let query = supabase
            .from('onboarding_tasks')
            .select(
              `
              id,
              task_name,
              category,
              status,
              is_required,
              due_date,
              sort_order,
              onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(
                id,
                org_id,
                employee_id,
                contact_id,
                employee:employees!employee_onboarding_employee_id_fkey(
                  id,
                  user:user_profiles!employees_user_id_fkey(
                    id,
                    full_name,
                    avatar_url
                  )
                )
              ),
              assignee:user_profiles!onboarding_tasks_assigned_to_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq('status', 'pending')
            .order('due_date', { ascending: true, nullsFirst: false })
            .limit(input.limit)

          if (input.assigneeId) {
            query = query.eq('assigned_to', input.assigneeId)
          }

          if (input.dueSoon) {
            const sevenDaysFromNow = new Date()
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
            query = query.lte('due_date', sevenDaysFromNow.toISOString().split('T')[0])
          }

          const { data, error } = await query

          if (error) {
            console.error('Failed to fetch pending tasks:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch pending tasks',
            })
          }

          // Filter by org_id in memory (since nested filter is complex)
          const filteredData = (data ?? []).filter((task) => {
            const onboarding = task.onboarding as unknown as Record<string, unknown>
            return onboarding?.org_id === orgId
          })

          return filteredData.map((task) => {
            const onboarding = task.onboarding as unknown as Record<string, unknown>
            const employee = onboarding?.employee as unknown as Record<string, unknown>
            const user = employee?.user as unknown as Record<string, unknown>

            return {
              id: task.id,
              taskName: task.task_name,
              category: task.category,
              isRequired: task.is_required,
              dueDate: task.due_date,
              onboardingId: onboarding?.id,
              employeeId: onboarding?.employee_id,
              contactId: onboarding?.contact_id,
              employeeName: user?.full_name,
              employeeAvatar: user?.avatar_url,
              assignee: task.assignee,
            }
          })
        }),

      // Get overdue tasks
      getOverdue: orgProtectedProcedure.query(async ({ ctx }) => {
        const { supabase, orgId } = ctx
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('onboarding_tasks')
          .select(
            `
            id,
            task_name,
            category,
            is_required,
            due_date,
            onboarding:employee_onboarding!onboarding_tasks_onboarding_id_fkey(
              id,
              org_id,
              employee_id,
              contact_id,
              employee:employees!employee_onboarding_employee_id_fkey(
                id,
                user:user_profiles!employees_user_id_fkey(
                  id,
                  full_name,
                  avatar_url
                )
              )
            ),
            assignee:user_profiles!onboarding_tasks_assigned_to_fkey(
              id,
              full_name,
              avatar_url
            )
          `
          )
          .eq('status', 'pending')
          .lt('due_date', today)
          .order('due_date', { ascending: true })

        if (error) {
          console.error('Failed to fetch overdue tasks:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch overdue tasks',
          })
        }

        // Filter by org_id in memory
        const filteredData = (data ?? []).filter((task) => {
          const onboarding = task.onboarding as unknown as Record<string, unknown>
          return onboarding?.org_id === orgId
        })

        return filteredData.map((task) => {
          const onboarding = task.onboarding as unknown as Record<string, unknown>
          const employee = onboarding?.employee as unknown as Record<string, unknown>
          const user = employee?.user as unknown as Record<string, unknown>
          const dueDate = new Date(task.due_date as string)
          const today = new Date()
          const daysOverdue = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          return {
            id: task.id,
            taskName: task.task_name,
            category: task.category,
            isRequired: task.is_required,
            dueDate: task.due_date,
            daysOverdue,
            onboardingId: onboarding?.id,
            employeeId: onboarding?.employee_id,
            employeeName: user?.full_name,
            employeeAvatar: user?.avatar_url,
            assignee: task.assignee,
          }
        })
      }),

      // Get onboarding stats
      getStats: orgProtectedProcedure.query(async ({ ctx }) => {
        const { supabase, orgId } = ctx

        // Get all onboarding checklists
        const { data: checklists, error: checklistError } = await supabase
          .from('employee_onboarding')
          .select('id, status')
          .eq('org_id', orgId)

        if (checklistError) {
          console.error('Failed to fetch onboarding stats:', checklistError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch onboarding stats',
          })
        }

        const total = checklists?.length ?? 0
        const notStarted = checklists?.filter((c) => c.status === 'not_started').length ?? 0
        const inProgress = checklists?.filter((c) => c.status === 'in_progress').length ?? 0
        const completed = checklists?.filter((c) => c.status === 'completed').length ?? 0
        const cancelled = checklists?.filter((c) => c.status === 'cancelled').length ?? 0

        // Get pending tasks count
        const { count: pendingTasksCount } = await supabase
          .from('onboarding_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending')

        // Get overdue tasks count
        const today = new Date().toISOString().split('T')[0]
        const { count: overdueTasksCount } = await supabase
          .from('onboarding_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending')
          .lt('due_date', today)

        return {
          totalOnboardings: total,
          notStarted,
          inProgress,
          completed,
          cancelled,
          active: notStarted + inProgress,
          pendingTasks: pendingTasksCount ?? 0,
          overdueTasks: overdueTasksCount ?? 0,
        }
      }),
    }),
  }),
})
