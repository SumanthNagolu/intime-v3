import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// EMAIL ROUTER
// Phase 2: Communications
// ============================================

// Schemas
const emailProviderSchema = z.enum(['gmail', 'outlook', 'exchange', 'imap'])
const emailSyncStatusSchema = z.enum(['active', 'paused', 'error', 'disconnected'])
const emailDirectionSchema = z.enum(['inbound', 'outbound'])
const linkConfidenceSchema = z.enum(['high', 'medium', 'low', 'manual'])

export const emailRouter = router({
  // ============================================
  // EMAIL ACCOUNTS
  // ============================================

  // List user's connected email accounts
  accounts: router({
    list: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()

      const { data: accounts, error } = await adminClient
        .from('email_accounts')
        .select('*')
        .eq('org_id', ctx.orgId)
        .eq('user_id', ctx.userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return accounts ?? []
    }),

    // Get single account
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: account, error } = await adminClient
          .from('email_accounts')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .is('deleted_at', null)
          .single()

        if (error || !account) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Email account not found' })
        }

        return account
      }),

    // Connect new email account
    connect: orgProtectedProcedure
      .input(z.object({
        provider: emailProviderSchema,
        email_address: z.string().email(),
        display_name: z.string().optional(),
        access_token: z.string().optional(),
        refresh_token: z.string().optional(),
        token_expires_at: z.string().datetime().optional(),
        sync_from_date: z.string().datetime().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Check if account already exists
        const { data: existing } = await adminClient
          .from('email_accounts')
          .select('id')
          .eq('org_id', ctx.orgId)
          .eq('email_address', input.email_address)
          .is('deleted_at', null)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email account already connected',
          })
        }

        const { data: account, error } = await adminClient
          .from('email_accounts')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            ...input,
            sync_status: 'active',
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return account
      }),

    // Update account settings
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        display_name: z.string().optional(),
        auto_link_enabled: z.boolean().optional(),
        signature: z.string().optional(),
        is_default: z.boolean().optional(),
        sync_status: emailSyncStatusSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input
        const adminClient = getAdminClient()

        // If setting as default, unset other defaults first
        if (updates.is_default === true) {
          await adminClient
            .from('email_accounts')
            .update({ is_default: false })
            .eq('org_id', ctx.orgId)
            .eq('user_id', ctx.userId)
        }

        const { data: account, error } = await adminClient
          .from('email_accounts')
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

    // Disconnect email account
    disconnect: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('email_accounts')
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

    // Update OAuth tokens
    updateTokens: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        access_token: z.string(),
        refresh_token: z.string().optional(),
        token_expires_at: z.string().datetime(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...tokens } = input
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('email_accounts')
          .update({
            ...tokens,
            sync_status: 'active',
            sync_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // EMAIL THREADS
  // ============================================

  threads: router({
    // List threads with filtering
    list: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid().optional(),
        unreadOnly: z.boolean().optional(),
        starredOnly: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Get user's account IDs
        const { data: accounts } = await adminClient
          .from('email_accounts')
          .select('id')
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .is('deleted_at', null)

        if (!accounts || accounts.length === 0) {
          return { threads: [], total: 0 }
        }

        const accountIds = input.accountId
          ? [input.accountId]
          : accounts.map((a) => a.id)

        let query = adminClient
          .from('email_threads')
          .select('*, email_accounts!inner(email_address, display_name)', { count: 'exact' })
          .in('account_id', accountIds)
          .eq('is_trash', false)
          .eq('is_spam', false)

        if (input.unreadOnly) {
          query = query.gt('unread_count', 0)
        }

        if (input.starredOnly) {
          query = query.eq('is_starred', true)
        }

        if (input.search) {
          query = query.ilike('subject', `%${input.search}%`)
        }

        query = query
          .order('last_message_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data: threads, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { threads: threads ?? [], total: count ?? 0 }
      }),

    // Get single thread with messages
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify ownership
        const { data: thread, error: threadError } = await adminClient
          .from('email_threads')
          .select(`
            *,
            email_accounts!inner(id, email_address, display_name, user_id),
            email_messages(*)
          `)
          .eq('id', input.id)
          .single()

        if (threadError || !thread) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' })
        }

        // Check user owns the account
        if (thread.email_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        // Get entity links
        const { data: links } = await adminClient
          .from('email_entity_links')
          .select('*')
          .eq('thread_id', input.id)

        return { ...thread, entity_links: links ?? [] }
      }),

    // Toggle star
    toggleStar: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        starred: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify ownership through account
        const { data: thread } = await adminClient
          .from('email_threads')
          .select('account_id, email_accounts!inner(user_id)')
          .eq('id', input.id)
          .single()

        if (!thread || (thread as any).email_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        const { error } = await adminClient
          .from('email_threads')
          .update({ is_starred: input.starred, updated_at: new Date().toISOString() })
          .eq('id', input.id)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Archive thread
    archive: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: thread } = await adminClient
          .from('email_threads')
          .select('account_id, email_accounts!inner(user_id)')
          .eq('id', input.id)
          .single()

        if (!thread || (thread as any).email_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        const { error } = await adminClient
          .from('email_threads')
          .update({ is_archived: true, updated_at: new Date().toISOString() })
          .eq('id', input.id)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // EMAIL MESSAGES
  // ============================================

  messages: router({
    // Get single message
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: message, error } = await adminClient
          .from('email_messages')
          .select(`
            *,
            email_accounts!inner(user_id),
            email_entity_links(*)
          `)
          .eq('id', input.id)
          .single()

        if (error || !message) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' })
        }

        if ((message as any).email_accounts.user_id !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
        }

        return message
      }),

    // Mark as read/unread
    markRead: orgProtectedProcedure
      .input(z.object({
        ids: z.array(z.string().uuid()),
        read: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify all messages belong to user
        const { data: messages } = await adminClient
          .from('email_messages')
          .select('id, email_accounts!inner(user_id)')
          .in('id', input.ids)

        const userMessages = (messages ?? []).filter(
          (m) => (m as any).email_accounts.user_id === ctx.userId
        )

        if (userMessages.length === 0) {
          return { success: true, count: 0 }
        }

        const { error } = await adminClient
          .from('email_messages')
          .update({ is_read: input.read, updated_at: new Date().toISOString() })
          .in('id', userMessages.map((m) => m.id))

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true, count: userMessages.length }
      }),

    // Send email (creates outbound message)
    send: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        threadId: z.string().uuid().optional(),
        to: z.array(z.object({ email: z.string().email(), name: z.string().optional() })),
        cc: z.array(z.object({ email: z.string().email(), name: z.string().optional() })).optional(),
        bcc: z.array(z.object({ email: z.string().email(), name: z.string().optional() })).optional(),
        subject: z.string(),
        bodyHtml: z.string(),
        bodyText: z.string().optional(),
        inReplyTo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        // Verify account ownership
        const { data: account } = await adminClient
          .from('email_accounts')
          .select('*')
          .eq('id', input.accountId)
          .eq('user_id', ctx.userId)
          .is('deleted_at', null)
          .single()

        if (!account) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Account not found' })
        }

        // Create or get thread
        let threadId = input.threadId
        if (!threadId) {
          const { data: newThread, error: threadError } = await adminClient
            .from('email_threads')
            .insert({
              org_id: ctx.orgId,
              account_id: input.accountId,
              provider_thread_id: `local-${Date.now()}`,
              subject: input.subject,
              participants: input.to,
              first_message_at: new Date().toISOString(),
              last_message_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (threadError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: threadError.message })
          }
          threadId = newThread.id
        }

        // Create message
        const { data: message, error: msgError } = await adminClient
          .from('email_messages')
          .insert({
            org_id: ctx.orgId,
            thread_id: threadId,
            account_id: input.accountId,
            provider_message_id: `local-${Date.now()}`,
            direction: 'outbound',
            is_read: true,
            from_address: account.email_address,
            from_name: account.display_name,
            to_addresses: input.to,
            cc_addresses: input.cc ?? [],
            bcc_addresses: input.bcc ?? [],
            subject: input.subject,
            body_html: input.bodyHtml,
            body_text: input.bodyText,
            snippet: input.bodyText?.slice(0, 200),
            sent_at: new Date().toISOString(),
            in_reply_to: input.inReplyTo,
          })
          .select()
          .single()

        if (msgError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: msgError.message })
        }

        // TODO: Actually send via provider API
        // This would integrate with Gmail/Outlook APIs

        return message
      }),
  }),

  // ============================================
  // ENTITY LINKS
  // ============================================

  links: router({
    // Get links for an entity
    forEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: links, error } = await adminClient
          .from('email_entity_links')
          .select(`
            *,
            email_threads(*),
            email_messages(*)
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

    // Create manual link
    create: orgProtectedProcedure
      .input(z.object({
        threadId: z.string().uuid().optional(),
        messageId: z.string().uuid().optional(),
        entityType: z.string(),
        entityId: z.string().uuid(),
        linkType: z.string().default('related'),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!input.threadId && !input.messageId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either threadId or messageId must be provided',
          })
        }

        const adminClient = getAdminClient()

        const { data: link, error } = await adminClient
          .from('email_entity_links')
          .insert({
            org_id: ctx.orgId,
            thread_id: input.threadId,
            message_id: input.messageId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            link_type: input.linkType,
            confidence: 'manual',
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
          .from('email_entity_links')
          .delete()
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  templates: router({
    list: orgProtectedProcedure
      .input(z.object({
        category: z.string().optional(),
        entityType: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('email_templates')
          .select('*')
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .or(`created_by.eq.${ctx.userId},is_shared.eq.true`)
          .order('name')

        if (input.category) {
          query = query.eq('category', input.category)
        }

        const { data: templates, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Filter by entity type if specified
        let filtered = templates ?? []
        if (input.entityType && filtered.length > 0) {
          filtered = filtered.filter((t) => {
            const types = t.entity_types as string[] | null
            return !types || types.length === 0 || types.includes(input.entityType!)
          })
        }

        return filtered
      }),

    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: template, error } = await adminClient
          .from('email_templates')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .is('deleted_at', null)
          .single()

        if (error || !template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
        }

        return template
      }),

    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        subject: z.string().min(1),
        body_html: z.string().min(1),
        body_text: z.string().optional(),
        variables: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          defaultValue: z.string().optional(),
        })).optional(),
        entity_types: z.array(z.string()).optional(),
        is_shared: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: template, error } = await adminClient
          .from('email_templates')
          .insert({
            org_id: ctx.orgId,
            created_by: ctx.userId,
            ...input,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return template
      }),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        subject: z.string().min(1).optional(),
        body_html: z.string().min(1).optional(),
        body_text: z.string().optional(),
        variables: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          defaultValue: z.string().optional(),
        })).optional(),
        entity_types: z.array(z.string()).optional(),
        is_shared: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input
        const adminClient = getAdminClient()

        const { data: template, error } = await adminClient
          .from('email_templates')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('org_id', ctx.orgId)
          .eq('created_by', ctx.userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return template
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('email_templates')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', ctx.orgId)
          .eq('created_by', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
