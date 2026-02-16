import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// CALENDAR ROUTER
// Phase 2: Communications
// ============================================

// Schemas
const calendarProviderSchema = z.enum(['google', 'outlook', 'exchange', 'ical'])
const recruitingEventTypeSchema = z.enum([
  'phone_screen',
  'technical_interview',
  'onsite_interview',
  'panel_interview',
  'hiring_manager_interview',
  'client_interview',
  'debrief',
  'offer_call',
  'intake_call',
  'kickoff_meeting',
  'check_in',
  'other',
])
const eventResponseStatusSchema = z.enum(['accepted', 'declined', 'tentative', 'needs_action'])
const interviewStatusSchema = z.enum([
  'pending',
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled',
])
const interviewRatingSchema = z.enum(['strong_yes', 'yes', 'neutral', 'no', 'strong_no'])

export const calendarRouter = router({
  // ============================================
  // CALENDAR ACCOUNTS
  // ============================================

  accounts: router({
    // List user's connected calendars
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data: accounts, error } = await adminClient
        .from('calendar_accounts')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('user_id', ctx.userId)
        .is('deleted_at', null)
        .order('is_primary', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return accounts ?? []
    }),

    // Connect new calendar
    connect: orgProtectedProcedure
      .input(z.object({
        provider: calendarProviderSchema,
        calendar_id: z.string(),
        calendar_name: z.string(),
        email_address: z.string().email(),
        access_token: z.string().optional(),
        refresh_token: z.string().optional(),
        token_expires_at: z.string().datetime().optional(),
        color: z.string().optional(),
        is_primary: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // If setting as primary, unset others
        if (input.is_primary) {
          await adminClient
            .from('calendar_accounts')
            .update({ is_primary: false })
            .eq('org_id', ctx.orgId)
            .eq('user_id', ctx.userId)
        }

        const { data: account, error } = await adminClient
          .from('calendar_accounts')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            ...input,
            sync_status: 'active',
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Calendar already connected' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return account
      }),

    // Update calendar settings
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        calendar_name: z.string().optional(),
        color: z.string().optional(),
        is_primary: z.boolean().optional(),
        show_in_availability: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input
        const adminClient = getAdminClient()

        if (updates.is_primary === true) {
          await adminClient
            .from('calendar_accounts')
            .update({ is_primary: false })
            .eq('org_id', ctx.orgId)
            .eq('user_id', ctx.userId)
        }

        const { data: account, error } = await adminClient
          .from('calendar_accounts')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return account
      }),

    // Disconnect calendar
    disconnect: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('calendar_accounts')
          .update({
            deleted_at: new Date().toISOString(),
            sync_status: 'disconnected',
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // CALENDAR EVENTS
  // ============================================

  events: router({
    // List events in date range
    list: orgProtectedProcedure
      .input(z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        accountId: z.string().uuid().optional(),
        eventType: recruitingEventTypeSchema.optional(),
        includeLinked: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get user's calendar accounts
        const { data: accounts } = await adminClient
          .from('calendar_accounts')
          .select('id')
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .is('deleted_at', null)

        if (!accounts || accounts.length === 0) {
          return []
        }

        const accountIds = input.accountId
          ? [input.accountId]
          : accounts.map((a) => a.id)

        let query = adminClient
          .from('calendar_events')
          .select(input.includeLinked ? '*, calendar_entity_links(*)' : '*')
          .in('calendar_account_id', accountIds)
          .gte('start_time', input.startDate)
          .lte('start_time', input.endDate)
          .eq('is_cancelled', false)
          .order('start_time')

        if (input.eventType) {
          query = query.eq('recruiting_event_type', input.eventType)
        }

        const { data: events, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return events ?? []
      }),

    // Get single event
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: event, error } = await adminClient
          .from('calendar_events')
          .select(`
            *,
            calendar_accounts!inner(user_id),
            calendar_entity_links(*, entities:entity_id)
          `)
          .eq('id', input.id)
          .single()

        if (error || !event) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
        }

        if ((event as any).calendar_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        return event
      }),

    // Create event
    create: orgProtectedProcedure
      .input(z.object({
        calendarAccountId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        location: z.string().optional(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        timezone: z.string().default('UTC'),
        isAllDay: z.boolean().default(false),
        recruitingEventType: recruitingEventTypeSchema.optional(),
        attendees: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
          optional: z.boolean().optional(),
        })).optional(),
        conferenceProvider: z.string().optional(),
        // Entity linking
        linkedEntities: z.array(z.object({
          entityType: z.string(),
          entityId: z.string().uuid(),
          linkType: z.string().default('related'),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { linkedEntities, ...eventData } = input
        const adminClient = getAdminClient()

        // Verify account ownership
        const { data: account } = await adminClient
          .from('calendar_accounts')
          .select('email_address')
          .eq('id', input.calendarAccountId)
          .eq('user_id', ctx.userId)
          .is('deleted_at', null)
          .single()

        if (!account) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Calendar not found' })
        }

        // Create event
        const { data: event, error: eventError } = await adminClient
          .from('calendar_events')
          .insert({
            org_id: ctx.orgId,
            calendar_account_id: eventData.calendarAccountId,
            provider_event_id: `local-${Date.now()}`,
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            start_time: eventData.startTime,
            end_time: eventData.endTime,
            timezone: eventData.timezone,
            is_all_day: eventData.isAllDay,
            recruiting_event_type: eventData.recruitingEventType,
            organizer_email: account.email_address,
            attendees: eventData.attendees ?? [],
            conference_provider: eventData.conferenceProvider,
          })
          .select()
          .single()

        if (eventError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: eventError.message })
        }

        // Create entity links
        if (linkedEntities && linkedEntities.length > 0) {
          await adminClient.from('calendar_entity_links').insert(
            linkedEntities.map((link) => ({
              org_id: ctx.orgId,
              event_id: event.id,
              entity_type: link.entityType,
              entity_id: link.entityId,
              link_type: link.linkType,
              linked_by: 'manual',
              linked_by_user_id: ctx.userId,
            }))
          )
        }

        // TODO: Sync to provider (Google/Outlook)

        return event
      }),

    // Update event
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        recruitingEventType: recruitingEventTypeSchema.optional(),
        attendees: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
          optional: z.boolean().optional(),
        })).optional(),
        responseStatus: eventResponseStatusSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input
        const adminClient = getAdminClient()

        // Verify ownership
        const { data: existing } = await adminClient
          .from('calendar_events')
          .select('calendar_account_id, calendar_accounts!inner(user_id)')
          .eq('id', id)
          .single()

        if (!existing || (existing as any).calendar_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (updates.title) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.location !== undefined) updateData.location = updates.location
        if (updates.startTime) updateData.start_time = updates.startTime
        if (updates.endTime) updateData.end_time = updates.endTime
        if (updates.recruitingEventType) updateData.recruiting_event_type = updates.recruitingEventType
        if (updates.attendees) updateData.attendees = updates.attendees
        if (updates.responseStatus) updateData.response_status = updates.responseStatus

        const { data: event, error } = await adminClient
          .from('calendar_events')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return event
      }),

    // Cancel event
    cancel: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: existing } = await adminClient
          .from('calendar_events')
          .select('calendar_account_id, calendar_accounts!inner(user_id)')
          .eq('id', input.id)
          .single()

        if (!existing || (existing as any).calendar_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        const { error } = await adminClient
          .from('calendar_events')
          .update({ is_cancelled: true, updated_at: new Date().toISOString() })
          .eq('id', input.id)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // AVAILABILITY
  // ============================================

  availability: router({
    // List availability blocks
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data: blocks, error } = await adminClient
        .from('availability_blocks')
        .select('*')
        .eq('user_id', ctx.userId)
        .is('deleted_at', null)
        .order('day_of_week')
        .order('start_time')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return blocks ?? []
    }),

    // Create availability block
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().optional(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(), // HH:MM format
        endTime: z.string(),
        timezone: z.string().default('UTC'),
        effectiveFrom: z.string().optional(),
        effectiveUntil: z.string().optional(),
        eventTypes: z.array(recruitingEventTypeSchema).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: block, error } = await adminClient
          .from('availability_blocks')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            name: input.name,
            day_of_week: input.dayOfWeek,
            start_time: input.startTime,
            end_time: input.endTime,
            timezone: input.timezone,
            effective_from: input.effectiveFrom,
            effective_until: input.effectiveUntil,
            event_types: input.eventTypes ?? [],
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return block
      }),

    // Delete availability block
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('availability_blocks')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Get available slots for a user
    getSlots: orgProtectedProcedure
      .input(z.object({
        userId: z.string().uuid(),
        date: z.string(), // YYYY-MM-DD
        durationMinutes: z.number().min(15).max(480),
        bufferBefore: z.number().min(0).default(0),
        bufferAfter: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Call the database function
        const { data: slots, error } = await adminClient.rpc('get_available_slots', {
          p_user_id: input.userId,
          p_date: input.date,
          p_duration_minutes: input.durationMinutes,
          p_buffer_before: input.bufferBefore,
          p_buffer_after: input.bufferAfter,
        })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return slots ?? []
      }),
  }),

  // ============================================
  // SCHEDULING LINKS
  // ============================================

  schedulingLinks: router({
    // List user's scheduling links
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data: links, error } = await adminClient
        .from('scheduling_links')
        .select('*')
        .eq('user_id', ctx.userId)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return links ?? []
    }),

    // Get scheduling link by slug (public)
    getBySlug: orgProtectedProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: link, error } = await adminClient
          .from('scheduling_links')
          .select('*, users!inner(id, full_name, avatar_url)')
          .eq('org_id', ctx.orgId)
          .eq('slug', input.slug)
          .eq('is_active', true)
          .is('deleted_at', null)
          .single()

        if (error || !link) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Scheduling link not found' })
        }

        return link
      }),

    // Create scheduling link
    create: orgProtectedProcedure
      .input(z.object({
        slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
        name: z.string().min(1),
        description: z.string().optional(),
        eventTitleTemplate: z.string().default('{{attendee_name}} <> {{owner_name}}'),
        eventDurationMinutes: z.number().min(15).max(480).default(30),
        eventType: recruitingEventTypeSchema.optional(),
        locationType: z.enum(['video', 'phone', 'in_person']).default('video'),
        conferenceProvider: z.string().optional(),
        calendarAccountId: z.string().uuid(),
        bufferBeforeMinutes: z.number().min(0).default(0),
        bufferAfterMinutes: z.number().min(0).default(0),
        minNoticeHours: z.number().min(0).default(24),
        maxDaysAhead: z.number().min(1).default(60),
        availableDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
        availableHoursStart: z.string().default('09:00'),
        availableHoursEnd: z.string().default('17:00'),
        timezone: z.string().default('UTC'),
        questions: z.array(z.object({
          id: z.string(),
          label: z.string(),
          type: z.enum(['text', 'textarea', 'select']),
          required: z.boolean().default(false),
          options: z.array(z.string()).optional(),
        })).optional(),
        confirmationMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: link, error } = await adminClient
          .from('scheduling_links')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            slug: input.slug,
            name: input.name,
            description: input.description,
            event_title_template: input.eventTitleTemplate,
            event_duration_minutes: input.eventDurationMinutes,
            event_type: input.eventType,
            location_type: input.locationType,
            conference_provider: input.conferenceProvider,
            calendar_account_id: input.calendarAccountId,
            buffer_before_minutes: input.bufferBeforeMinutes,
            buffer_after_minutes: input.bufferAfterMinutes,
            min_notice_hours: input.minNoticeHours,
            max_days_ahead: input.maxDaysAhead,
            available_days: input.availableDays,
            available_hours_start: input.availableHoursStart,
            available_hours_end: input.availableHoursEnd,
            timezone: input.timezone,
            questions: input.questions ?? [],
            confirmation_message: input.confirmationMessage,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Slug already in use' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return link
      }),

    // Toggle active status
    toggleActive: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        active: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('scheduling_links')
          .update({ is_active: input.active, updated_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete scheduling link
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('scheduling_links')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // INTERVIEWS
  // ============================================

  interviews: router({
    // List interviews
    list: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        status: z.array(interviewStatusSchema).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('scheduled_interviews')
          .select('*', { count: 'exact' })
          .eq('org_id', ctx.orgId)

        if (input.jobId) query = query.eq('job_id', input.jobId)
        if (input.candidateId) query = query.eq('candidate_id', input.candidateId)
        if (input.status && input.status.length > 0) query = query.in('status', input.status)
        if (input.startDate) query = query.gte('scheduled_start', input.startDate)
        if (input.endDate) query = query.lte('scheduled_start', input.endDate)

        query = query
          .order('scheduled_start', { ascending: true })
          .range(input.offset, input.offset + input.limit - 1)

        const { data: interviews, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { interviews: interviews ?? [], total: count ?? 0 }
      }),

    // Get single interview
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: interview, error } = await adminClient
          .from('scheduled_interviews')
          .select(`
            *,
            interview_feedback(*)
          `)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .single()

        if (error || !interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        return interview
      }),

    // Schedule interview
    schedule: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid().optional(),
        jobId: z.string().uuid(),
        candidateId: z.string().uuid(),
        interviewType: recruitingEventTypeSchema,
        interviewRound: z.number().min(1).default(1),
        title: z.string(),
        scheduledStart: z.string().datetime(),
        scheduledEnd: z.string().datetime(),
        timezone: z.string().default('UTC'),
        locationType: z.enum(['video', 'phone', 'in_person']).default('video'),
        locationDetails: z.string().optional(),
        conferenceLink: z.string().optional(),
        interviewers: z.array(z.object({
          userId: z.string().uuid(),
          name: z.string(),
          email: z.string().email(),
          role: z.string().optional(),
        })),
        hiringManagerId: z.string().uuid().optional(),
        candidateEmail: z.string().email(),
        candidatePhone: z.string().optional(),
        feedbackDueHours: z.number().default(24),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const feedbackDueAt = new Date(input.scheduledEnd)
        feedbackDueAt.setHours(feedbackDueAt.getHours() + input.feedbackDueHours)

        const { data: interview, error } = await adminClient
          .from('scheduled_interviews')
          .insert({
            org_id: ctx.orgId,
            submission_id: input.submissionId,
            job_id: input.jobId,
            candidate_id: input.candidateId,
            interview_type: input.interviewType,
            interview_round: input.interviewRound,
            title: input.title,
            scheduled_start: input.scheduledStart,
            scheduled_end: input.scheduledEnd,
            timezone: input.timezone,
            location_type: input.locationType,
            location_details: input.locationDetails,
            conference_link: input.conferenceLink,
            interviewers: input.interviewers,
            hiring_manager_id: input.hiringManagerId,
            candidate_email: input.candidateEmail,
            candidate_phone: input.candidatePhone,
            status: 'scheduled',
            feedback_due_at: feedbackDueAt.toISOString(),
            created_by: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // TODO: Create calendar event, send invites

        return interview
      }),

    // Update interview status
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: interviewStatusSchema,
        cancellationReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const updates: Record<string, unknown> = {
          status: input.status,
          updated_at: new Date().toISOString(),
        }

        if (input.status === 'cancelled') {
          updates.cancelled_at = new Date().toISOString()
          updates.cancelled_by = ctx.userId
          updates.cancellation_reason = input.cancellationReason
        }

        const { data: interview, error } = await adminClient
          .from('scheduled_interviews')
          .update(updates)
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return interview
      }),

    // Submit feedback
    submitFeedback: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        overallRating: interviewRatingSchema,
        categoryRatings: z.array(z.object({
          category: z.string(),
          rating: z.number().min(1).max(5),
          notes: z.string().optional(),
        })).optional(),
        strengths: z.string().optional(),
        concerns: z.string().optional(),
        notes: z.string().optional(),
        recommendation: z.enum(['hire', 'advance', 'hold', 'reject']).optional(),
        recommendedNextStep: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get org_id from interview
        const { data: interview } = await adminClient
          .from('scheduled_interviews')
          .select('org_id')
          .eq('id', input.interviewId)
          .single()

        if (!interview) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Interview not found' })
        }

        const { data: feedback, error } = await adminClient
          .from('interview_feedback')
          .upsert({
            org_id: interview.org_id,
            interview_id: input.interviewId,
            interviewer_id: ctx.userId,
            overall_rating: input.overallRating,
            category_ratings: input.categoryRatings ?? [],
            strengths: input.strengths,
            concerns: input.concerns,
            notes: input.notes,
            recommendation: input.recommendation,
            recommended_next_step: input.recommendedNextStep,
            is_submitted: true,
            submitted_at: new Date().toISOString(),
          }, {
            onConflict: 'interview_id,interviewer_id',
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return feedback
      }),

    // Get feedback for interview
    getFeedback: orgProtectedProcedure
      .input(z.object({ interviewId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: feedback, error } = await adminClient
          .from('interview_feedback')
          .select('*, users!inner(full_name, avatar_url)')
          .eq('interview_id', input.interviewId)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return feedback ?? []
      }),
  }),

  // ============================================
  // ENTITY LINKS
  // ============================================

  links: router({
    // Get calendar events for entity
    forEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: links, error } = await adminClient
          .from('calendar_entity_links')
          .select(`
            *,
            calendar_events(*)
          `)
          .eq('org_id', ctx.orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return links ?? []
      }),

    // Create link
    create: orgProtectedProcedure
      .input(z.object({
        eventId: z.string().uuid(),
        entityType: z.string(),
        entityId: z.string().uuid(),
        linkType: z.string().default('related'),
        role: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: link, error } = await adminClient
          .from('calendar_entity_links')
          .insert({
            org_id: ctx.orgId,
            event_id: input.eventId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            link_type: input.linkType,
            role: input.role,
            linked_by: 'manual',
            linked_by_user_id: ctx.userId,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Link already exists' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return link
      }),

    // Remove link
    remove: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('calendar_entity_links')
          .delete()
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
