import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { historyService } from '@/lib/services'

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
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

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

      // Create the activity (use userProfileId for FK constraints)
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
          assigned_to: userProfileId,
          performed_by: userProfileId,
          created_by: userProfileId,
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
            assigned_to: userProfileId,
            created_by: userProfileId,
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

      // HISTORY: Record activity logged on parent entity (fire-and-forget)
      void historyService.recordRelatedObjectAdded(
        input.entityType,
        input.entityId,
        { type: 'activity', id: activity.id, label: subject || input.activityType },
        { orgId, userId: user?.id ?? null }
      ).catch(err => console.error('[History] Failed to record activity logged:', err))

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
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get user_profiles.id from auth_id (user.id is auth.users.id, not user_profiles.id)
      let profileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        profileId = profile?.id ?? null
      }

      const { data, error } = await adminClient
        .from('activities')
        .update({
          status: 'completed',
          outcome: input.outcome,
          outcome_notes: input.outcomeNotes,
          completed_at: new Date().toISOString(),
          performed_by: profileId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        console.error('[complete] Activity update failed:', { id: input.id, orgId, error: error.message })
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activity_completed',
        table_name: 'activities',
        record_id: input.id,
        new_values: { outcome: input.outcome },
      })

      // HISTORY: Record activity completed on parent entity (fire-and-forget)
      if (data.entity_type && data.entity_id) {
        void historyService.recordRelatedObjectUpdated(
          data.entity_type,
          data.entity_id,
          { type: 'activity', id: data.id, label: data.subject ?? 'Activity' },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record activity completed:', err))
      }

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
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('activities')
        .update({
          status: 'skipped',
          skipped_at: new Date().toISOString(),
          outcome_notes: input.reason, // Store skip reason in outcome_notes
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
  // REASSIGN AN ACTIVITY (TEAM WORKSPACE)
  // ============================================
  reassign: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      assignedTo: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profiles ID for the current user (for updated_by FK)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      const { data, error } = await adminClient
        .from('activities')
        .update({
          assigned_to: input.assignedTo,
          updated_at: new Date().toISOString(),
          updated_by: userProfileId,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'activity_reassigned',
        table_name: 'activities',
        record_id: input.id,
        new_values: { assigned_to: input.assignedTo },
      })

      return {
        id: data.id,
        assignedTo: data.assigned_to,
      }
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

  // ============================================
  // GET ACTIVITY DETAIL (GUIDEWIRE PATTERN)
  // Full activity with notes and history
  // ============================================
  getDetail: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      console.log('[getDetail] Looking up activity:', { id: input.id, orgId })
      const adminClient = getAdminClient()

      // Get activity base data
      const { data: activity, error } = await adminClient
        .from('activities')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !activity) {
        console.error('[getDetail] Activity query failed:', { id: input.id, orgId, error: error?.message, code: error?.code })
        throw new TRPCError({ code: 'NOT_FOUND', message: `Activity not found: ${error?.message || 'no data'}` })
      }

      // Fetch related data in parallel
      const [assignedToResult, createdByResult, performedByResult, patternResult, queueResult, notesResult] = await Promise.all([
        activity.assigned_to
          ? adminClient.from('user_profiles').select('id, full_name, avatar_url, email').eq('id', activity.assigned_to).single()
          : Promise.resolve({ data: null }),
        activity.created_by
          ? adminClient.from('user_profiles').select('id, full_name, avatar_url').eq('id', activity.created_by).single()
          : Promise.resolve({ data: null }),
        activity.performed_by
          ? adminClient.from('user_profiles').select('id, full_name, avatar_url').eq('id', activity.performed_by).single()
          : Promise.resolve({ data: null }),
        activity.pattern_id
          ? adminClient.from('activity_patterns').select('id, code, name, description, instructions').eq('id', activity.pattern_id).single()
          : Promise.resolve({ data: null }),
        activity.queue_id
          ? adminClient.from('work_queues').select('id, name, code').eq('id', activity.queue_id).single()
          : Promise.resolve({ data: null }),
        adminClient
          .from('notes')
          .select(`
            id, content, visibility, created_at,
            created_by_user:user_profiles!created_by(id, full_name, avatar_url)
          `)
          .eq('entity_type', 'activity')
          .eq('entity_id', input.id)
          .eq('org_id', orgId)
          .order('created_at', { ascending: true }),
      ])

      const assignedToUser = assignedToResult.data
      const createdByUser = createdByResult.data
      const performedByUser = performedByResult.data
      const pattern = patternResult.data
      const queue = queueResult.data
      const notes = notesResult.data

      // Get entity info based on entity_type
      let entityInfo = null
      if (activity.entity_type === 'company' || activity.entity_type === 'account') {
        const { data: company } = await adminClient
          .from('companies')
          .select('id, name, segment, industry')
          .eq('id', activity.entity_id)
          .single()
        entityInfo = company ? { type: 'company', ...company } : null
      } else if (activity.entity_type === 'candidate') {
        const { data: candidate } = await adminClient
          .from('candidates')
          .select('id, first_name, last_name, email, title')
          .eq('id', activity.entity_id)
          .single()
        entityInfo = candidate ? {
          type: 'candidate',
          ...candidate,
          name: `${candidate.first_name} ${candidate.last_name}`
        } : null
      } else if (activity.entity_type === 'job') {
        const { data: job } = await adminClient
          .from('jobs')
          .select('id, title, status, company:companies!company_id(id, name)')
          .eq('id', activity.entity_id)
          .single()
        entityInfo = job ? { type: 'job', ...job } : null
      }

      return {
        id: activity.id,
        subject: activity.subject,
        description: activity.description,
        activityType: activity.activity_type,
        status: activity.status,
        priority: activity.priority,
        category: activity.category,
        dueDate: activity.due_date,
        escalationDate: activity.escalation_date,
        completedAt: activity.completed_at,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,

        // Assignment
        assignedTo: assignedToUser,
        createdBy: createdByUser,
        performedBy: performedByUser,
        queue,
        claimedAt: activity.claimed_at,

        // Entity
        entityType: activity.entity_type,
        entityId: activity.entity_id,
        entityInfo,

        // Pattern
        pattern,
        patternCode: activity.pattern_code,

        // Instructions
        instructions: activity.instructions,

        // Outcomes
        outcome: activity.outcome,
        outcomeNotes: activity.outcome_notes,

        // Escalation
        escalationCount: activity.escalation_count,
        lastEscalatedAt: activity.last_escalated_at,

        // Snooze
        snoozedUntil: activity.snoozed_until,

        // Related data
        notes: notes?.map(n => ({
          id: n.id,
          content: n.content,
          isInternal: n.visibility === 'private', // Map visibility to isInternal
          createdAt: n.created_at,
          createdBy: n.created_by_user, // User object with full_name
        })) ?? [],
      }
    }),

  // ============================================
  // CREATE ACTIVITY FROM PATTERN (GUIDEWIRE)
  // ============================================
  createFromPattern: orgProtectedProcedure
    .input(z.object({
      patternId: z.string().uuid(),
      entityType: z.string(),
      entityId: z.string().uuid(),
      assignedTo: z.string().uuid().optional(),
      queueId: z.string().uuid().optional(),
      dueDate: z.coerce.date().optional(),
      subject: z.string().max(200).optional(),
      description: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // Get the pattern
      const { data: pattern, error: patternError } = await adminClient
        .from('activity_patterns')
        .select('*')
        .eq('id', input.patternId)
        .single()

      if (patternError || !pattern) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity pattern not found' })
      }

      // Calculate due date from pattern if not provided
      const targetDays = pattern.target_days || 1
      const dueDate = input.dueDate || new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000)

      // Calculate escalation date
      const escalationDays = pattern.escalation_days || targetDays + 1
      const escalationDate = new Date(Date.now() + escalationDays * 24 * 60 * 60 * 1000)

      // Determine assignee (use userProfileId for FK constraints)
      let assignedTo = input.assignedTo
      if (!assignedTo && pattern.default_assignee === 'creator') {
        assignedTo = userProfileId
      } else if (!assignedTo && pattern.assignee_user_id) {
        assignedTo = pattern.assignee_user_id
      }

      // Create the activity (use adminClient to bypass RLS recursion issues)
      const { data: activity, error } = await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          activity_type: 'task',
          pattern_id: input.patternId,
          pattern_code: pattern.code,
          subject: input.subject || pattern.name,
          description: input.description || pattern.description,
          instructions: pattern.instructions,
          priority: pattern.priority || 'normal',
          category: pattern.category,
          status: 'open',
          due_date: dueDate.toISOString(),
          escalation_date: escalationDate.toISOString(),
          assigned_to: assignedTo,
          assigned_group: pattern.assignee_group_id,
          queue_id: input.queueId,
          created_by: userProfileId,
          auto_created: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create activity from pattern:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: activity.id,
        subject: activity.subject,
        status: activity.status,
        dueDate: activity.due_date,
        patternCode: activity.pattern_code,
      }
    }),

  // ============================================
  // ASSIGN ACTIVITY TO QUEUE
  // ============================================
  assignToQueue: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
      queueId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Verify queue exists
      const { data: queue, error: queueError } = await adminClient
        .from('work_queues')
        .select('id, name')
        .eq('id', input.queueId)
        .eq('org_id', orgId)
        .single()

      if (queueError || !queue) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Work queue not found' })
      }

      // Get current activity for history
      const { data: currentActivity } = await adminClient
        .from('activities')
        .select('queue_id')
        .eq('id', input.activityId)
        .single()

      // Update activity
      const { data: activity, error } = await supabase
        .from('activities')
        .update({
          queue_id: input.queueId,
          assigned_to: null, // Release from current user when assigning to queue
          claimed_at: null,
          claimed_by: null,
          status: 'open',
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }


      return {
        id: activity.id,
        queueId: activity.queue_id,
        status: activity.status,
      }
    }),

  // ============================================
  // CLAIM ACTIVITY FROM QUEUE
  // ============================================
  claimFromQueue: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current activity
      const { data: currentActivity, error: fetchError } = await adminClient
        .from('activities')
        .select('*, queue:work_queues!queue_id(id, name)')
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !currentActivity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
      }

      if (currentActivity.assigned_to && currentActivity.assigned_to !== user?.id) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Activity is already assigned to another user' })
      }

      // Check if user is member of the queue (if queue assigned)
      if (currentActivity.queue_id) {
        const { data: membership } = await adminClient
          .from('work_queue_members')
          .select('id, can_claim, max_active_activities, current_load')
          .eq('queue_id', currentActivity.queue_id)
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .single()

        if (!membership) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this queue' })
        }

        if (!membership.can_claim) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to claim from this queue' })
        }

        if (membership.current_load >= membership.max_active_activities) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You have reached your maximum activity capacity' })
        }

        // Update member load
        await adminClient
          .from('work_queue_members')
          .update({ current_load: membership.current_load + 1 })
          .eq('id', membership.id)
      }

      // Claim the activity
      const { data: activity, error } = await supabase
        .from('activities')
        .update({
          assigned_to: user?.id,
          claimed_at: new Date().toISOString(),
          claimed_by: user?.id,
          status: currentActivity.status === 'open' ? 'in_progress' : currentActivity.status,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: activity.id,
        assignedTo: activity.assigned_to,
        claimedAt: activity.claimed_at,
        status: activity.status,
      }
    }),

  // ============================================
  // RELEASE ACTIVITY BACK TO QUEUE
  // ============================================
  releaseToQueue: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Get current activity
      const { data: currentActivity, error: fetchError } = await adminClient
        .from('activities')
        .select('*')
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !currentActivity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
      }

      if (currentActivity.assigned_to !== user?.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the assigned user can release the activity' })
      }

      // Update member load if from queue
      if (currentActivity.queue_id) {
        await adminClient
          .from('work_queue_members')
          .update({ current_load: adminClient.rpc('greatest', { a: 0, b: 'current_load - 1' }) })
          .eq('queue_id', currentActivity.queue_id)
          .eq('user_id', user?.id)
      }

      // Release the activity
      const { data: activity, error } = await supabase
        .from('activities')
        .update({
          assigned_to: null,
          claimed_at: null,
          claimed_by: null,
          status: 'open',
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: activity.id,
        status: activity.status,
      }
    }),

  // ============================================
  // ADD NOTE TO ACTIVITY
  // ============================================
  addNote: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
      content: z.string().min(1).max(5000),
      isInternal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // Insert into unified notes table
      const { data: note, error } = await adminClient
        .from('notes')
        .insert({
          entity_type: 'activity',
          entity_id: input.activityId,
          org_id: orgId,
          content: input.content,
          visibility: input.isInternal ? 'private' : 'team', // Map isInternal to visibility
          created_by: userProfileId, // Use user_profiles.id, not auth.users.id
        })
        .select(`
          id, content, visibility, created_at,
          created_by_user:user_profiles!created_by(id, full_name, avatar_url)
        `)
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: note.id,
        content: note.content,
        isInternal: note.visibility === 'private', // Map visibility back to isInternal
        createdAt: note.created_at,
        createdBy: note.created_by_user,
      }
    }),

  // ============================================
  // SNOOZE ACTIVITY
  // ============================================
  snooze: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
      snoozeUntil: z.coerce.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get user_profiles.id from auth_id
      let profileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        profileId = profile?.id ?? null
      }

      const { data: activity, error } = await adminClient
        .from('activities')
        .update({
          snoozed_until: input.snoozeUntil.toISOString(),
          reminder_sent_at: null, // Reset reminder
          updated_at: new Date().toISOString(),
          updated_by: profileId,
        })
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: activity.id,
        snoozedUntil: activity.snoozed_until,
      }
    }),

  // ============================================
  // MANUALLY ESCALATE ACTIVITY
  // ============================================
  escalateManually: orgProtectedProcedure
    .input(z.object({
      activityId: z.string().uuid(),
      reason: z.string().max(500),
      escalateToUserId: z.string().uuid().optional(),
      escalateToQueueId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the user_profiles ID for the current user (for updated_by FK)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // Get current activity
      const { data: currentActivity, error: fetchError } = await adminClient
        .from('activities')
        .select('*')
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !currentActivity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
      }

      const newEscalationLevel = (currentActivity.escalation_count || 0) + 1

      // Update activity
      const updateData: Record<string, unknown> = {
        escalation_count: newEscalationLevel,
        last_escalated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: userProfileId,
      }

      // Escalate priority if level is high
      if (newEscalationLevel >= 3) {
        updateData.priority = 'urgent'
      } else if (newEscalationLevel >= 2) {
        updateData.priority = 'high'
      }

      // Reassign if specified
      if (input.escalateToUserId) {
        updateData.assigned_to = input.escalateToUserId
      }
      if (input.escalateToQueueId) {
        updateData.queue_id = input.escalateToQueueId
        updateData.assigned_to = null
      }

      const { data: activity, error } = await adminClient
        .from('activities')
        .update(updateData)
        .eq('id', input.activityId)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: activity.id,
        escalationCount: activity.escalation_count,
        priority: activity.priority,
        assignedTo: activity.assigned_to,
      }
    }),

  // ============================================
  // LIST ACTIVITY PATTERNS
  // ============================================
  listPatterns: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      category: z.string().optional(),
      isActive: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('activity_patterns')
        .select('*')
        .eq('is_active', input.isActive)
        .or(`org_id.eq.${orgId},is_system.eq.true`)
        .order('display_order', { ascending: true })

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }
      if (input.category) {
        query = query.eq('category', input.category)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        icon: p.icon,
        color: p.color,
        targetDays: p.target_days,
        escalationDays: p.escalation_days,
        priority: p.priority,
        category: p.category,
        entityType: p.entity_type,
        hasChecklist: !!p.checklist && (p.checklist as Array<unknown>).length > 0,
        checklistCount: p.checklist ? (p.checklist as Array<unknown>).length : 0,
        isSystem: p.is_system,
        instructions: p.instructions,
        checklist: p.checklist,
      })) ?? []
    }),

  // ============================================
  // LIST WORK QUEUES
  // ============================================
  listQueues: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('work_queues')
        .select('id, name, description')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Failed to list queues:', error)
        return []
      }

      return data ?? []
    }),

  // ============================================
  // CREATE ACTIVITY (UNIFIED - PATTERN OR MANUAL)
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      subject: z.string().min(1).max(200),
      patternId: z.string().uuid().optional(),
      description: z.string().max(5000).optional(),
      category: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      status: z.enum(['scheduled', 'open', 'in_progress']).default('open'),
      dueDate: z.string().datetime().optional(),
      escalationDate: z.string().datetime().optional(),
      assignedTo: z.string().uuid().optional(),
      queueId: z.string().uuid().optional(),
      relatedContactId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // If pattern-based, get pattern details
      let pattern = null
      if (input.patternId) {
        const { data: patternData, error: patternError } = await adminClient
          .from('activity_patterns')
          .select('*')
          .eq('id', input.patternId)
          .single()

        if (patternError || !patternData) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity pattern not found' })
        }
        pattern = patternData
      }

      // Determine activity type
      const activityType = pattern ? 'task' : 'manual'

      // Calculate due date
      let dueDate = input.dueDate ? new Date(input.dueDate) : null
      if (!dueDate && pattern?.target_days) {
        dueDate = new Date(Date.now() + pattern.target_days * 24 * 60 * 60 * 1000)
      }
      if (!dueDate) {
        dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Default: tomorrow
      }

      // Calculate escalation date
      let escalationDate = input.escalationDate ? new Date(input.escalationDate) : null
      if (!escalationDate && pattern?.escalation_days) {
        escalationDate = new Date(Date.now() + pattern.escalation_days * 24 * 60 * 60 * 1000)
      }

      // Determine assignee
      let assignedTo = input.assignedTo
      if (!assignedTo && pattern) {
        if (pattern.default_assignee === 'creator') {
          assignedTo = userProfileId
        } else if (pattern.assignee_user_id) {
          assignedTo = pattern.assignee_user_id
        }
      }
      // Default to creator if still not assigned
      if (!assignedTo) {
        assignedTo = userProfileId
      }

      // Build insert data
      const insertData: Record<string, unknown> = {
        org_id: orgId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        activity_type: activityType,
        subject: input.subject,
        description: input.description,
        category: input.category || pattern?.category,
        priority: input.priority || pattern?.priority || 'medium',
        status: input.status,
        due_date: dueDate.toISOString(),
        escalation_date: escalationDate?.toISOString(),
        assigned_to: assignedTo,
        queue_id: input.queueId,
        related_contact_id: input.relatedContactId,
        created_by: userProfileId,
        auto_created: false,
      }

      // Add pattern-specific fields
      if (pattern) {
        insertData.pattern_id = input.patternId
        insertData.pattern_code = pattern.code
        insertData.instructions = pattern.instructions
        insertData.assigned_group = pattern.assignee_group_id
      }

      // Create the activity
      const { data: activity, error } = await adminClient
        .from('activities')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Failed to create activity:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // HISTORY: Record activity created on parent entity (fire-and-forget)
      void historyService.recordRelatedObjectAdded(
        input.entityType,
        input.entityId,
        { type: 'activity', id: activity.id, label: input.subject },
        { orgId, userId: user?.id ?? null }
      ).catch(err => console.error('[History] Failed to record activity created:', err))

      return {
        id: activity.id,
        subject: activity.subject,
        status: activity.status,
        dueDate: activity.due_date,
        patternCode: activity.pattern_code,
      }
    }),

  // ============================================
  // GET ESCALATED ACTIVITIES
  // ============================================
  getEscalated: orgProtectedProcedure
    .input(z.object({
      minLevel: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error, count } = await adminClient
        .from('activities')
        .select(`
          id, subject, activity_type, status, priority, due_date,
          entity_type, entity_id, escalation_count, last_escalated_at,
          assigned_to_user:user_profiles!assigned_to(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .gte('escalation_count', input.minLevel)
        .in('status', ['open', 'in_progress', 'scheduled'])
        .order('escalation_count', { ascending: false })
        .order('due_date', { ascending: true })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(a => ({
          id: a.id,
          subject: a.subject,
          activityType: a.activity_type,
          status: a.status,
          priority: a.priority,
          dueDate: a.due_date,
          entityType: a.entity_type,
          entityId: a.entity_id,
          escalationCount: a.escalation_count,
          lastEscalatedAt: a.last_escalated_at,
          assignedTo: a.assigned_to_user,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GUIDEWIRE-INSPIRED ACTIVITY SYSTEM
  // ============================================

  // Get count of open activities for an entity
  getOpenActivitiesCount: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { count, error } = await adminClient
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .in('status', ['open', 'in_progress', 'scheduled'])
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { count: count ?? 0 }
    }),

  // Ensure entity has at least one open activity (creates watchlist if none)
  ensureOpenActivity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      ownerId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // 1. Count existing open activities
      const { count } = await adminClient
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .in('status', ['open', 'in_progress', 'scheduled'])
        .is('deleted_at', null)

      if ((count ?? 0) > 0) {
        return { created: false, existingCount: count ?? 0 }
      }

      // 2. Get owner if not provided
      let ownerId = input.ownerId
      if (!ownerId) {
        const entityTableMap: Record<string, { table: string; ownerField: string }> = {
          account: { table: 'companies', ownerField: 'owner_id' },
          company: { table: 'companies', ownerField: 'owner_id' },
          job: { table: 'jobs', ownerField: 'owner_id' },
          submission: { table: 'submissions', ownerField: 'owner_id' },
          candidate: { table: 'candidates', ownerField: 'owner_id' },
          placement: { table: 'placements', ownerField: 'recruiter_id' },
          lead: { table: 'leads', ownerField: 'owner_id' },
          deal: { table: 'deals', ownerField: 'owner_id' },
          contact: { table: 'contacts', ownerField: 'owner_id' },
          campaign: { table: 'campaigns', ownerField: 'owner_id' },
        }
        const config = entityTableMap[input.entityType]
        if (config) {
          const { data: entity } = await adminClient
            .from(config.table)
            .select(config.ownerField)
            .eq('id', input.entityId)
            .eq('org_id', orgId)
            .single()
          ownerId = entity?.[config.ownerField as keyof typeof entity] as string | undefined
        }
      }

      // 3. Get watchlist pattern
      const patternCode = `sys_watchlist_${input.entityType}`
      const { data: pattern } = await adminClient
        .from('activity_patterns')
        .select('id, code, name, target_days, priority, instructions')
        .eq('code', patternCode)
        .eq('is_active', true)
        .single()

      // 4. Calculate due date
      const targetDays = pattern?.target_days ?? 30
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + targetDays)

      // 5. Create watchlist activity (use userProfileId for FK constraints)
      const { data: activity, error } = await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          activity_type: 'task',
          subject: pattern?.name || 'Watchlist',
          description: `Auto-created: This ${input.entityType} requires attention. No open activities existed.`,
          instructions: pattern?.instructions,
          status: 'open',
          priority: pattern?.priority || 'low',
          due_date: dueDate.toISOString(),
          assigned_to: ownerId || userProfileId,
          pattern_id: pattern?.id,
          pattern_code: patternCode,
          auto_created: true,
          created_by: userProfileId,
        })
        .select('id')
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { created: true, activityId: activity.id, existingCount: 0 }
    }),

  // Check for blocking activities preventing status change
  checkBlockingActivities: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      targetStatus: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Define closing statuses per entity type
      const closingStatuses: Record<string, string[]> = {
        account: ['inactive', 'closed', 'churned', 'lost'],
        job: ['closed', 'cancelled', 'filled', 'on_hold'],
        submission: ['rejected', 'withdrawn', 'declined'],
        placement: ['terminated', 'ended', 'cancelled'],
        candidate: ['inactive', 'archived', 'do_not_contact'],
        lead: ['closed', 'lost', 'disqualified', 'converted'],
        deal: ['closed_lost', 'closed_won', 'cancelled'],
        campaign: ['completed', 'cancelled', 'archived'],
      }

      // Only check blocking for closing statuses
      const entityClosingStatuses = closingStatuses[input.entityType] || []
      if (!entityClosingStatuses.includes(input.targetStatus.toLowerCase())) {
        return { blocked: false, activities: [] }
      }

      // Find blocking activities
      const { data: activities, error } = await adminClient
        .from('activities')
        .select(`
          id,
          subject,
          status,
          priority,
          due_date,
          is_blocking,
          blocking_statuses,
          assigned_to,
          user_profiles!activities_assigned_to_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .in('status', ['open', 'in_progress', 'scheduled'])
        .eq('is_blocking', true)
        .is('deleted_at', null)

      if (error) {
        // If is_blocking column doesn't exist yet, return not blocked
        if (error.message.includes('is_blocking')) {
          return { blocked: false, activities: [] }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      if (!activities || activities.length === 0) {
        return { blocked: false, activities: [] }
      }

      // Filter to activities that block the target status
      const blockingActivities = activities
        .filter((activity) => {
          const blockingStatuses = activity.blocking_statuses as string[] | null
          if (!blockingStatuses || blockingStatuses.length === 0) return true
          return blockingStatuses.includes(input.targetStatus.toLowerCase())
        })
        .map((activity) => ({
          id: activity.id,
          subject: activity.subject,
          status: activity.status,
          priority: activity.priority,
          dueDate: activity.due_date,
          blockingStatuses: (activity.blocking_statuses as string[]) || [],
          assignedTo: (() => {
            const profile = Array.isArray(activity.user_profiles)
              ? activity.user_profiles[0]
              : activity.user_profiles
            if (!profile) return null
            return {
              id: (profile as { id: string; first_name: string; last_name: string }).id,
              firstName: (profile as { id: string; first_name: string; last_name: string }).first_name,
              lastName: (profile as { id: string; first_name: string; last_name: string }).last_name,
            }
          })(),
        }))

      return {
        blocked: blockingActivities.length > 0,
        activities: blockingActivities,
      }
    }),

  // Create activity from meeting/escalation action item
  createFromActionItem: orgProtectedProcedure
    .input(z.object({
      sourceType: z.enum(['meeting', 'escalation']),
      sourceId: z.string().uuid(),
      accountId: z.string().uuid().optional(),
      actionItem: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.coerce.date().optional(),
        assignedTo: z.string().uuid().optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id (for FK constraints)
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // Get account ID if not provided
      let accountId = input.accountId
      if (!accountId) {
        if (input.sourceType === 'meeting') {
          const { data: meeting } = await adminClient
            .from('meeting_notes')
            .select('account_id')
            .eq('id', input.sourceId)
            .eq('org_id', orgId)
            .single()
          accountId = meeting?.account_id
        } else if (input.sourceType === 'escalation') {
          const { data: escalation } = await adminClient
            .from('escalations')
            .select('account_id')
            .eq('id', input.sourceId)
            .eq('org_id', orgId)
            .single()
          accountId = escalation?.account_id
        }
      }

      // Create activity (use userProfileId for FK constraints)
      const { data: activity, error } = await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: input.sourceType,
          entity_id: input.sourceId,
          secondary_entity_type: accountId ? 'account' : null,
          secondary_entity_id: accountId,
          activity_type: 'task',
          subject: input.actionItem.title,
          description: input.actionItem.description,
          status: 'open',
          priority: input.actionItem.priority,
          due_date: input.actionItem.dueDate?.toISOString(),
          assigned_to: input.actionItem.assignedTo || userProfileId,
          created_by: userProfileId,
          auto_created: false,
        })
        .select('id')
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { activityId: activity.id }
    }),

  // Get manager for escalation (finds supervisor in chain)
  getEscalationTarget: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      escalationLevel: z.number().min(1).default(1),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get user's profile with manager info
      const { data: user } = await adminClient
        .from('user_profiles')
        .select('id, employee_manager_id, recruiter_pod_id, manager_id')
        .eq('id', input.userId)
        .single()

      if (!user) {
        return { managerId: null, source: null }
      }

      // Level 1: Direct manager
      if (input.escalationLevel <= 1) {
        const directManager = user.employee_manager_id || user.manager_id
        if (directManager && directManager !== input.userId) {
          return { managerId: directManager, source: 'direct_manager' }
        }
      }

      // Level 2+: Pod manager
      if (user.recruiter_pod_id) {
        const { data: pod } = await adminClient
          .from('pods')
          .select('manager_id')
          .eq('id', user.recruiter_pod_id)
          .single()

        if (pod?.manager_id && pod.manager_id !== input.userId) {
          return { managerId: pod.manager_id, source: 'pod_manager' }
        }
      }

      // Fallback: Any org admin
      const { data: orgAdmin } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('org_id', orgId)
        .eq('role', 'admin')
        .neq('id', input.userId)
        .limit(1)
        .single()

      return {
        managerId: orgAdmin?.id || null,
        source: orgAdmin ? 'org_admin' : null,
      }
    }),
  // ============================================
  // UPDATE ACTIVITY STATUS (BOARD DRAG-DROP)
  // ============================================
  updateStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.string(), // Accepting string to allow 'todo'/'review' mapping if necessary, but ideally should leverage StatusEnum
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id via auth_id
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user?.id)
        .single()

      const userProfileId = userProfile?.id

      // Allow mapping 'todo' -> 'open', 'done' -> 'completed', etc if the UI sends those
      // But TeamBoardSection sends: 'completed', 'waiting', 'in_progress', 'open' based on its getStatusFromColumn.
      // So input.status should be valid.

      const { data: activity, error } = await supabase
        .from('activities')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
          updated_by: userProfileId,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return activity
    }),
})

