import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INPUT SCHEMAS
// ============================================

const ActivityTypeEnum = z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message', 'task', 'follow_up'])
const DirectionEnum = z.enum(['inbound', 'outbound'])
const OutcomeEnum = z.enum(['positive', 'neutral', 'negative'])
const StatusEnum = z.enum(['scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled'])
const PriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

const LogActivityInput = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  activityType: ActivityTypeEnum,
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  direction: DirectionEnum.optional(),
  durationMinutes: z.number().min(0).max(480).optional(),
  outcome: OutcomeEnum.optional(),
  pocId: z.string().uuid().optional(),
  activityDate: z.coerce.date().optional(),
  // Follow-up
  createFollowUp: z.boolean().default(false),
  followUpSubject: z.string().max(200).optional(),
  followUpDueDate: z.coerce.date().optional(),
})

// ============================================
// ROUTER
// ============================================

export const activitiesRouter = router({
  // ============================================
  // LOG A COMPLETED ACTIVITY (H02)
  // ============================================
  log: orgProtectedProcedure
    .input(LogActivityInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      // Validate at least subject or body
      if (!input.subject && !input.body) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Please enter a subject or body for this activity',
        })
      }

      // Validate follow-up
      if (input.createFollowUp && !input.followUpDueDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Follow-up due date is required when scheduling a follow-up',
        })
      }

      // Auto-generate subject for calls/notes if not provided
      let subject = input.subject
      if (!subject) {
        if (input.activityType === 'call') {
          subject = `${input.direction === 'inbound' ? 'Inbound' : 'Outbound'} call`
        } else if (input.activityType === 'note') {
          subject = 'Note'
        }
      }

      const activityDate = input.activityDate || new Date()

      // Create the activity
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          activity_type: input.activityType,
          subject,
          description: input.body,
          direction: input.direction,
          duration_minutes: input.durationMinutes,
          outcome: input.outcome,
          poc_id: input.pocId,
          status: 'completed',
          completed_at: activityDate.toISOString(),
          due_date: activityDate.toISOString(),
          assigned_to: user?.id,
          performed_by: user?.id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to log activity:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create follow-up if requested
      let followUp = null
      if (input.createFollowUp && input.followUpDueDate) {
        const { data: followUpData, error: followUpError } = await supabase
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            activity_type: 'follow_up',
            subject: input.followUpSubject || `Follow up on: ${subject}`,
            status: 'scheduled',
            priority: 'normal',
            due_date: input.followUpDueDate.toISOString(),
            parent_activity_id: activity.id,
            assigned_to: user?.id,
            created_by: user?.id,
          })
          .select()
          .single()

        if (!followUpError && followUpData) {
          followUp = {
            id: followUpData.id,
            activityType: 'follow_up',
            status: 'scheduled',
            subject: followUpData.subject,
            dueDate: followUpData.due_date,
            parentActivityId: activity.id,
          }
        }
      }

      // Update entity's lastContactedAt if applicable (for leads)
      if (['email', 'call', 'meeting', 'linkedin_message'].includes(input.activityType)) {
        if (input.entityType === 'lead') {
          await supabase
            .from('leads')
            .update({ last_contacted_at: activityDate.toISOString() })
            .eq('id', input.entityId)
            .eq('org_id', orgId)
        } else if (input.entityType === 'candidate') {
          await supabase
            .from('candidates')
            .update({ last_contacted_at: activityDate.toISOString() })
            .eq('id', input.entityId)
            .eq('org_id', orgId)
        } else if (input.entityType === 'account' || input.entityType === 'company') {
          await supabase
            .from('companies')
            .update({ last_contacted_date: activityDate.toISOString() })
            .eq('id', input.entityId)
            .eq('org_id', orgId)
        }
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activity_logged',
        table_name: 'activities',
        record_id: activity.id,
        new_values: { activity_type: input.activityType, entity_type: input.entityType },
      })

      return {
        activity: {
          id: activity.id,
          entityType: activity.entity_type,
          entityId: activity.entity_id,
          activityType: activity.activity_type,
          status: activity.status,
          subject: activity.subject,
          body: activity.description,
          direction: activity.direction,
          durationMinutes: activity.duration_minutes,
          outcome: activity.outcome,
          completedAt: activity.completed_at,
          createdAt: activity.created_at,
        },
        followUp,
      }
    }),

  // ============================================
  // LIST ACTIVITIES FOR AN ENTITY
  // ============================================
  listByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      activityTypes: z.array(ActivityTypeEnum).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('activities')
        .select('*, performed_by_user:user_profiles!performed_by(id, full_name, avatar_url)', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.activityTypes && input.activityTypes.length > 0) {
        query = query.in('activity_type', input.activityTypes)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(a => ({
          id: a.id,
          entityType: a.entity_type,
          entityId: a.entity_id,
          activityType: a.activity_type,
          status: a.status,
          priority: a.priority,
          subject: a.subject,
          description: a.description,
          direction: a.direction,
          durationMinutes: a.duration_minutes,
          outcome: a.outcome,
          dueDate: a.due_date,
          completedAt: a.completed_at,
          createdAt: a.created_at,
          performedBy: a.performed_by_user,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET USER'S TASKS (TODAY VIEW)
  // ============================================
  getMyTasks: orgProtectedProcedure
    .input(z.object({
      status: z.array(StatusEnum).optional(),
      priority: z.array(PriorityEnum).optional(),
      dueDate: z.enum(['overdue', 'today', 'tomorrow', 'this_week', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

      let query = adminClient
        .from('activities')
        .select('*, entity:entity_id(id)', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .in('status', ['scheduled', 'open', 'in_progress'])
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      // Apply status filter
      if (input.status && input.status.length > 0) {
        query = query.in('status', input.status)
      }

      // Apply priority filter
      if (input.priority && input.priority.length > 0) {
        query = query.in('priority', input.priority)
      }

      // Apply due date filter
      if (input.dueDate === 'overdue') {
        query = query.lt('due_date', today.toISOString())
      } else if (input.dueDate === 'today') {
        query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
      } else if (input.dueDate === 'tomorrow') {
        const dayAfterTomorrow = new Date(tomorrow)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
        query = query.gte('due_date', tomorrow.toISOString()).lt('due_date', dayAfterTomorrow.toISOString())
      } else if (input.dueDate === 'this_week') {
        query = query.gte('due_date', today.toISOString()).lt('due_date', endOfWeek.toISOString())
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(a => ({
          id: a.id,
          entityType: a.entity_type,
          entityId: a.entity_id,
          activityType: a.activity_type,
          status: a.status,
          priority: a.priority,
          subject: a.subject,
          description: a.description,
          dueDate: a.due_date,
          isOverdue: a.due_date && new Date(a.due_date) < today,
          isDueToday: a.due_date && new Date(a.due_date) >= today && new Date(a.due_date) < tomorrow,
          createdAt: a.created_at,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // COMPLETE AN ACTIVITY
  // ============================================
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcome: OutcomeEnum.optional(),
      outcomeNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('activities')
        .update({
          status: 'completed',
          outcome: input.outcome,
          outcome_notes: input.outcomeNotes,
          completed_at: new Date().toISOString(),
          performed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activity_completed',
        table_name: 'activities',
        record_id: input.id,
        new_values: { outcome: input.outcome },
      })

      return {
        id: data.id,
        status: data.status,
        outcome: data.outcome,
        completedAt: data.completed_at,
      }
    }),

  // ============================================
  // SKIP AN ACTIVITY
  // ============================================
  skip: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx

      const { data, error } = await supabase
        .from('activities')
        .update({
          status: 'skipped',
          skip_reason: input.reason,
          skipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id, status: data.status }
    }),

  // ============================================
  // GET ACTIVITY STATS FOR DASHBOARD
  // ============================================
  getStats: orgProtectedProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'sprint']).default('week'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      let startDate: Date

      if (input.period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (input.period === 'week') {
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
      } else if (input.period === 'month') {
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        // Sprint (2 weeks)
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 14)
      }

      // Get activities for the period
      const { data: activities } = await adminClient
        .from('activities')
        .select('activity_type, status, outcome')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .gte('created_at', startDate.toISOString())

      // Count by type
      const byType: Record<string, number> = {}
      const byStatus: Record<string, number> = {}
      const byOutcome: Record<string, number> = {}

      activities?.forEach(a => {
        byType[a.activity_type] = (byType[a.activity_type] || 0) + 1
        byStatus[a.status] = (byStatus[a.status] || 0) + 1
        if (a.outcome) {
          byOutcome[a.outcome] = (byOutcome[a.outcome] || 0) + 1
        }
      })

      // Get pending tasks count
      const { count: pendingTasks } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .in('status', ['scheduled', 'open', 'in_progress'])

      // Get overdue tasks count
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: overdueTasks } = await adminClient
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .in('status', ['scheduled', 'open', 'in_progress'])
        .lt('due_date', today.toISOString())

      return {
        total: activities?.length ?? 0,
        byType,
        byStatus,
        byOutcome,
        pendingTasks: pendingTasks ?? 0,
        overdueTasks: overdueTasks ?? 0,
        completionRate: activities?.length
          ? Math.round((byStatus['completed'] || 0) / activities.length * 100)
          : 0,
      }
    }),

  // ============================================
  // GET MY ACTIVITIES (DESKTOP VIEW)
  // ============================================
  getMyActivities: orgProtectedProcedure
    .input(z.object({
      activityType: ActivityTypeEnum.optional(),
      status: StatusEnum.optional(),
      dueBefore: z.coerce.date().optional(),
      dueAfter: z.coerce.date().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      let query = adminClient
        .from('activities')
        .select(`
          id, subject, description, activity_type, status, priority, due_date,
          entity_type, entity_id, created_at, completed_at,
          poc:contacts!poc_id(id, first_name, last_name),
          company:companies!entity_id(id, name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })

      // Apply filters
      if (input.activityType) {
        query = query.eq('activity_type', input.activityType)
      }
      if (input.status) {
        query = query.eq('status', input.status)
      } else {
        // Default: show pending activities
        query = query.in('status', ['scheduled', 'open', 'in_progress'])
      }
      if (input.dueBefore) {
        query = query.lt('due_date', input.dueBefore.toISOString())
      }
      if (input.dueAfter) {
        query = query.gte('due_date', input.dueAfter.toISOString())
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(a => {
          const dueDate = a.due_date ? new Date(a.due_date) : null
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          // Get company name - handle both direct company activities and other entity types
          let accountName: string | null = null
          if ((a.entity_type === 'account' || a.entity_type === 'company') && a.company) {
            const companyArray = a.company as Array<{ id: string; name: string }> | null
            const company = companyArray?.[0]
            accountName = company?.name ?? null
          }

          return {
            id: a.id,
            subject: a.subject,
            description: a.description,
            activityType: a.activity_type,
            status: a.status,
            priority: a.priority,
            dueDate: a.due_date,
            entityType: a.entity_type,
            entityId: a.entity_id,
            accountName,
            contact: (() => {
              const pocArray = a.poc as Array<{ id: string; first_name: string; last_name: string }> | null
              const poc = pocArray?.[0]
              return poc ? {
                id: poc.id,
                name: `${poc.first_name} ${poc.last_name}`,
              } : null
            })(),
            isOverdue: dueDate ? dueDate < today : false,
            isDueToday: dueDate ? dueDate >= today && dueDate < tomorrow : false,
            createdAt: a.created_at,
            completedAt: a.completed_at,
          }
        }) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET RECENT ACTIVITIES (ACTIVITY FEED)
  // ============================================
  getRecent: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('activities')
        .select('*, performed_by_user:user_profiles!performed_by(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .eq('assigned_to', user?.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(a => ({
        id: a.id,
        entityType: a.entity_type,
        entityId: a.entity_id,
        activityType: a.activity_type,
        subject: a.subject,
        direction: a.direction,
        outcome: a.outcome,
        completedAt: a.completed_at,
        performedBy: a.performed_by_user,
      })) ?? []
    }),

  // ============================================
  // SEARCH ENTITIES FOR ACTIVITY LOGGING
  // ============================================
  searchEntities: orgProtectedProcedure
    .input(z.object({
      query: z.string().min(1),
      entityTypes: z.array(z.string()).optional(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const results: Array<{
        entityType: string
        entityId: string
        label: string
        sublabel?: string
      }> = []

      // Search candidates
      if (!input.entityTypes || input.entityTypes.includes('candidate')) {
        const { data: candidates } = await adminClient
          .from('candidates')
          .select('id, first_name, last_name, email')
          .eq('org_id', orgId)
          .or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%`)
          .limit(input.limit)

        candidates?.forEach(c => {
          results.push({
            entityType: 'candidate',
            entityId: c.id,
            label: `${c.first_name} ${c.last_name}`,
            sublabel: c.email,
          })
        })
      }

      // Search companies (accounts)
      if (!input.entityTypes || input.entityTypes.includes('account') || input.entityTypes.includes('company')) {
        const { data: companies } = await adminClient
          .from('companies')
          .select('id, name, segment')
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .ilike('name', `%${input.query}%`)
          .limit(input.limit)

        companies?.forEach(c => {
          results.push({
            entityType: 'company',
            entityId: c.id,
            label: c.name,
            sublabel: c.segment,
          })
        })
      }

      // Search jobs
      if (!input.entityTypes || input.entityTypes.includes('job')) {
        const { data: jobs } = await adminClient
          .from('jobs')
          .select('id, title, company:companies!jobs_company_id_fkey(name)')
          .eq('org_id', orgId)
          .ilike('title', `%${input.query}%`)
          .limit(input.limit)

        jobs?.forEach(j => {
          const companyArray = j.company as Array<{ name: string }> | null
          const company = companyArray?.[0]
          results.push({
            entityType: 'job',
            entityId: j.id,
            label: j.title,
            sublabel: company?.name,
          })
        })
      }

      // Search leads
      if (!input.entityTypes || input.entityTypes.includes('lead')) {
        const { data: leads } = await adminClient
          .from('leads')
          .select('id, company_name, contact_name')
          .eq('org_id', orgId)
          .or(`company_name.ilike.%${input.query}%,contact_name.ilike.%${input.query}%`)
          .limit(input.limit)

        leads?.forEach(l => {
          results.push({
            entityType: 'lead',
            entityId: l.id,
            label: l.company_name || l.contact_name || 'Lead',
            sublabel: l.contact_name,
          })
        })
      }

      return results.slice(0, input.limit)
    }),

  // ============================================
  // SEARCH CONTACTS FOR ACTIVITY LOGGING
  // ============================================
  searchContacts: orgProtectedProcedure
    .input(z.object({
      query: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contacts')
        .select('id, first_name, last_name, title, email, account_id')
        .eq('org_id', orgId)
        .limit(input.limit)

      if (input.query) {
        query = query.or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%`)
      }

      if (input.entityType === 'account' && input.entityId) {
        query = query.eq('account_id', input.entityId)
      }

      const { data, error } = await query

      if (error) {
        return []
      }

      return data?.map(c => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        title: c.title,
        email: c.email,
      })) ?? []
    }),

  // ============================================
  // GET STATS FOR ENTITY ACTIVITIES (SECTION VIEW)
  // ============================================
  statsByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Get all activities for this entity
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, activity_type, status, due_date, completed_at')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)

      // Calculate stats
      const total = activities?.length ?? 0

      // Completed today
      const completedToday = activities?.filter(a => {
        if (a.status !== 'completed' || !a.completed_at) return false
        const completedDate = new Date(a.completed_at)
        return completedDate >= today && completedDate < tomorrow
      }).length ?? 0

      // Overdue
      const overdue = activities?.filter(a => {
        if (!a.due_date) return false
        if (['completed', 'skipped', 'canceled'].includes(a.status)) return false
        return new Date(a.due_date) < today
      }).length ?? 0

      // By type breakdown
      const byType: Record<string, number> = {}
      activities?.forEach(a => {
        byType[a.activity_type] = (byType[a.activity_type] || 0) + 1
      })

      // By status breakdown
      const byStatus: Record<string, number> = {}
      activities?.forEach(a => {
        byStatus[a.status] = (byStatus[a.status] || 0) + 1
      })

      return {
        total,
        completedToday,
        overdue,
        byType,
        byStatus,
      }
    }),
})
