import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// PHONE ROUTER
// Phase 3: Desktop & Phone
// ============================================

// Schemas
const callDirectionSchema = z.enum(['inbound', 'outbound'])
const callStatusSchema = z.enum([
  'initiated',
  'ringing',
  'connected',
  'completed',
  'missed',
  'voicemail',
  'failed',
  'cancelled',
])
const callOutcomeSchema = z.enum([
  'connected',
  'left_voicemail',
  'no_answer',
  'busy',
  'wrong_number',
  'disconnected',
  'call_back_requested',
  'not_interested',
  'interested',
  'scheduled_meeting',
  'other',
])

export const phoneRouter = router({
  // ============================================
  // PHONE ACCOUNTS
  // ============================================

  accounts: router({
    // List user's phone accounts
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data: accounts, error } = await adminClient
        .from('phone_accounts')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('user_id', ctx.userId)
        .is('deleted_at', null)
        .order('is_default', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return accounts ?? []
    }),

    // Connect new phone account
    connect: orgProtectedProcedure
      .input(z.object({
        provider: z.string(),
        phone_number: z.string(),
        display_name: z.string().optional(),
        account_sid: z.string().optional(),
        auth_token: z.string().optional(),
        api_key: z.string().optional(),
        is_default: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        if (input.is_default) {
          await adminClient
            .from('phone_accounts')
            .update({ is_default: false })
            .eq('org_id', ctx.orgId)
            .eq('user_id', ctx.userId)
        }

        const { data: account, error } = await adminClient
          .from('phone_accounts')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            ...input,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Phone number already connected' })
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return account
      }),

    // Disconnect phone account
    disconnect: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('phone_accounts')
          .update({ deleted_at: new Date().toISOString() })
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
  // CALL LOGS
  // ============================================

  calls: router({
    // List call logs
    list: orgProtectedProcedure
      .input(z.object({
        direction: callDirectionSchema.optional(),
        status: z.array(callStatusSchema).optional(),
        outcome: z.array(callOutcomeSchema).optional(),
        phoneNumber: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('call_logs')
          .select('*, call_entity_links(*)', { count: 'exact' })
          .eq('org_id', ctx.orgId)

        if (input.direction) query = query.eq('direction', input.direction)
        if (input.status && input.status.length > 0) query = query.in('status', input.status)
        if (input.outcome && input.outcome.length > 0) query = query.in('outcome', input.outcome)
        if (input.phoneNumber) {
          query = query.or(`from_number.eq.${input.phoneNumber},to_number.eq.${input.phoneNumber}`)
        }
        if (input.startDate) query = query.gte('initiated_at', input.startDate)
        if (input.endDate) query = query.lte('initiated_at', input.endDate)

        query = query
          .order('initiated_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data: calls, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { calls: calls ?? [], total: count ?? 0 }
      }),

    // Get single call
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: call, error } = await adminClient
          .from('call_logs')
          .select('*, call_entity_links(*)')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .single()

        if (error || !call) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Call not found' })
        }

        return call
      }),

    // Log a call (create call record)
    log: orgProtectedProcedure
      .input(z.object({
        phoneAccountId: z.string().uuid().optional(),
        direction: callDirectionSchema,
        fromNumber: z.string(),
        toNumber: z.string(),
        status: callStatusSchema.default('completed'),
        initiatedAt: z.string().datetime().optional(),
        answeredAt: z.string().datetime().optional(),
        endedAt: z.string().datetime().optional(),
        durationSeconds: z.number().optional(),
        outcome: callOutcomeSchema.optional(),
        outcomeNotes: z.string().optional(),
        // Entity linking
        linkedEntities: z.array(z.object({
          entityType: z.string(),
          entityId: z.string().uuid(),
          linkType: z.string().default('related'),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { linkedEntities, ...callData } = input
        const adminClient = getAdminClient()

        const { data: call, error: callError } = await adminClient
          .from('call_logs')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            phone_account_id: callData.phoneAccountId,
            direction: callData.direction,
            from_number: callData.fromNumber,
            to_number: callData.toNumber,
            status: callData.status,
            initiated_at: callData.initiatedAt ?? new Date().toISOString(),
            answered_at: callData.answeredAt,
            ended_at: callData.endedAt,
            duration_seconds: callData.durationSeconds,
            outcome: callData.outcome,
            outcome_notes: callData.outcomeNotes,
          })
          .select()
          .single()

        if (callError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: callError.message })
        }

        // Create entity links
        if (linkedEntities && linkedEntities.length > 0) {
          await adminClient.from('call_entity_links').insert(
            linkedEntities.map((link) => ({
              org_id: ctx.orgId,
              call_id: call.id,
              entity_type: link.entityType,
              entity_id: link.entityId,
              link_type: link.linkType,
              linked_by: 'manual',
              linked_by_user_id: ctx.userId,
            }))
          )
        }

        return call
      }),

    // Update call outcome
    updateOutcome: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        outcome: callOutcomeSchema,
        outcomeNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: call, error } = await adminClient
          .from('call_logs')
          .update({
            outcome: input.outcome,
            outcome_notes: input.outcomeNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return call
      }),

    // Get calls for entity
    forEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: links, error } = await adminClient
          .from('call_entity_links')
          .select('call_logs(*)')
          .eq('org_id', ctx.orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return (links ?? []).map((l) => (l as any).call_logs).filter(Boolean)
      }),
  }),

  // ============================================
  // CONTACT PHONES
  // ============================================

  contactPhones: router({
    // List phones for contact
    list: orgProtectedProcedure
      .input(z.object({ contactId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: phones, error } = await adminClient
          .from('contact_phones')
          .select('*')
          .eq('org_id', ctx.orgId)
          .eq('contact_id', input.contactId)
          .is('deleted_at', null)
          .order('is_primary', { ascending: false })

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return phones ?? []
      }),

    // Add phone to contact
    add: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        phoneNumber: z.string(),
        phoneType: z.enum(['mobile', 'work', 'home', 'fax', 'other']).default('mobile'),
        countryCode: z.string().optional(),
        extension: z.string().optional(),
        isPrimary: z.boolean().default(false),
        isSmscapable: z.boolean().default(true),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // If setting as primary, unset others
        if (input.isPrimary) {
          await adminClient
            .from('contact_phones')
            .update({ is_primary: false })
            .eq('org_id', ctx.orgId)
            .eq('contact_id', input.contactId)
        }

        const { data: phone, error } = await adminClient
          .from('contact_phones')
          .insert({
            org_id: ctx.orgId,
            contact_id: input.contactId,
            phone_number: input.phoneNumber,
            phone_type: input.phoneType,
            country_code: input.countryCode,
            extension: input.extension,
            is_primary: input.isPrimary,
            is_sms_capable: input.isSmscapable,
            notes: input.notes,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return phone
      }),

    // Update phone
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        phoneNumber: z.string().optional(),
        phoneType: z.enum(['mobile', 'work', 'home', 'fax', 'other']).optional(),
        countryCode: z.string().optional(),
        extension: z.string().optional(),
        isPrimary: z.boolean().optional(),
        isSmscapable: z.boolean().optional(),
        doNotCall: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input
        const adminClient = getAdminClient()

        // Get current phone to check contact_id for primary update
        if (updates.isPrimary === true) {
          const { data: current } = await adminClient
            .from('contact_phones')
            .select('contact_id')
            .eq('id', id)
            .single()

          if (current) {
            await adminClient
              .from('contact_phones')
              .update({ is_primary: false })
              .eq('org_id', ctx.orgId)
              .eq('contact_id', current.contact_id)
          }
        }

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber
        if (updates.phoneType) updateData.phone_type = updates.phoneType
        if (updates.countryCode !== undefined) updateData.country_code = updates.countryCode
        if (updates.extension !== undefined) updateData.extension = updates.extension
        if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary
        if (updates.isSmscapable !== undefined) updateData.is_sms_capable = updates.isSmscapable
        if (updates.doNotCall !== undefined) updateData.do_not_call = updates.doNotCall
        if (updates.notes !== undefined) updateData.notes = updates.notes

        const { data: phone, error } = await adminClient
          .from('contact_phones')
          .update(updateData)
          .eq('id', id)
          .eq('org_id', ctx.orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return phone
      }),

    // Remove phone
    remove: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contact_phones')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Look up contact by phone number
    lookupByNumber: orgProtectedProcedure
      .input(z.object({ phoneNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Normalize phone number (remove spaces, dashes, etc.)
        const normalized = input.phoneNumber.replace(/[^0-9+]/g, '')

        const { data: phones, error } = await adminClient
          .from('contact_phones')
          .select('*, contacts!inner(id, first_name, last_name, email)')
          .eq('org_id', ctx.orgId)
          .eq('phone_number', normalized)
          .is('deleted_at', null)
          .limit(5)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return phones ?? []
      }),
  }),

  // ============================================
  // SMS MESSAGES
  // ============================================

  sms: router({
    // List SMS messages
    list: orgProtectedProcedure
      .input(z.object({
        direction: callDirectionSchema.optional(),
        phoneNumber: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('sms_messages')
          .select('*, sms_entity_links(*)', { count: 'exact' })
          .eq('org_id', ctx.orgId)

        if (input.direction) query = query.eq('direction', input.direction)
        if (input.phoneNumber) {
          query = query.or(`from_number.eq.${input.phoneNumber},to_number.eq.${input.phoneNumber}`)
        }
        if (input.startDate) query = query.gte('sent_at', input.startDate)
        if (input.endDate) query = query.lte('sent_at', input.endDate)

        query = query
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data: messages, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { messages: messages ?? [], total: count ?? 0 }
      }),

    // Send SMS
    send: orgProtectedProcedure
      .input(z.object({
        phoneAccountId: z.string().uuid().optional(),
        toNumber: z.string(),
        body: z.string().min(1).max(1600),
        linkedEntities: z.array(z.object({
          entityType: z.string(),
          entityId: z.string().uuid(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { linkedEntities, ...smsData } = input
        const adminClient = getAdminClient()

        // Get user's default phone account if not specified
        let fromNumber = ''
        if (smsData.phoneAccountId) {
          const { data: account } = await adminClient
            .from('phone_accounts')
            .select('phone_number')
            .eq('id', smsData.phoneAccountId)
            .eq('user_id', ctx.userId)
            .single()
          fromNumber = account?.phone_number ?? ''
        } else {
          const { data: defaultAccount } = await adminClient
            .from('phone_accounts')
            .select('id, phone_number')
            .eq('org_id', ctx.orgId)
            .eq('user_id', ctx.userId)
            .eq('is_default', true)
            .is('deleted_at', null)
            .single()
          fromNumber = defaultAccount?.phone_number ?? ''
        }

        if (!fromNumber) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No phone account configured',
          })
        }

        // Create SMS record
        const { data: sms, error: smsError } = await adminClient
          .from('sms_messages')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            phone_account_id: smsData.phoneAccountId,
            direction: 'outbound',
            from_number: fromNumber,
            to_number: smsData.toNumber,
            body: smsData.body,
            status: 'queued',
            sent_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (smsError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: smsError.message })
        }

        // Create entity links
        if (linkedEntities && linkedEntities.length > 0) {
          await adminClient.from('sms_entity_links').insert(
            linkedEntities.map((link) => ({
              org_id: ctx.orgId,
              sms_id: sms.id,
              entity_type: link.entityType,
              entity_id: link.entityId,
              linked_by: 'manual',
              linked_by_user_id: ctx.userId,
            }))
          )
        }

        // TODO: Actually send via provider API (Twilio, etc.)

        return sms
      }),

    // Get SMS conversation with a number
    conversation: orgProtectedProcedure
      .input(z.object({
        phoneNumber: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: messages, error } = await adminClient
          .from('sms_messages')
          .select('*')
          .eq('org_id', ctx.orgId)
          .or(`from_number.eq.${input.phoneNumber},to_number.eq.${input.phoneNumber}`)
          .order('created_at', { ascending: true })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return messages ?? []
      }),
  }),

  // ============================================
  // ENTITY LINKS
  // ============================================

  links: router({
    // Link call to entity
    linkCall: orgProtectedProcedure
      .input(z.object({
        callId: z.string().uuid(),
        entityType: z.string(),
        entityId: z.string().uuid(),
        linkType: z.string().default('related'),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: link, error } = await adminClient
          .from('call_entity_links')
          .insert({
            org_id: ctx.orgId,
            call_id: input.callId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            link_type: input.linkType,
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

    // Unlink call from entity
    unlinkCall: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('call_entity_links')
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
