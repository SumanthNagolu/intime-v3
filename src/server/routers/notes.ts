import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { historyService } from '@/lib/services'

// ============================================
// NOTES-01: Centralized Notes System
// ============================================

// Input schemas
const NoteTypeEnum = z.enum([
  'general',
  'meeting',
  'call',
  'strategy',
  'warning',
  'opportunity',
  'competitive_intel',
  'internal',
  'important',
  'reminder',
])

const VisibilityEnum = z.enum(['private', 'team', 'organization'])


export const notesRouter = router({
  // ============================================
  // LIST NOTES BY ENTITY
  // ============================================
  listByEntity: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        noteType: NoteTypeEnum.optional(),
        includeReplies: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('notes')
        .select(
          `
          *,
          creator:user_profiles!created_by(id, full_name, avatar_url),
          reactions:note_reactions(reaction, user_id)
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!input.includeReplies) {
        query = query.is('parent_note_id', null)
      }
      if (input.noteType) {
        query = query.eq('note_type', input.noteType)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((n) => ({
            id: n.id,
            entityType: n.entity_type,
            entityId: n.entity_id,
            title: n.title,
            content: n.content,
            contentHtml: n.content_html,
            noteType: n.note_type,
            visibility: n.visibility,
            isPinned: n.is_pinned,
            isStarred: n.is_starred,
            replyCount: n.reply_count,
            tags: n.tags,
            mentionedUserIds: n.mentioned_user_ids,
            creator: n.creator,
            reactions: n.reactions,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET SINGLE NOTE WITH REPLIES
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('notes')
        .select(
          `
          *,
          creator:user_profiles!created_by(id, full_name, avatar_url),
          replies:notes!parent_note_id(
            id, content, created_at, created_by,
            creator:user_profiles!created_by(id, full_name, avatar_url)
          )
        `
        )
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found' })

      return {
        id: data.id,
        entityType: data.entity_type,
        entityId: data.entity_id,
        title: data.title,
        content: data.content,
        contentHtml: data.content_html,
        noteType: data.note_type,
        visibility: data.visibility,
        isPinned: data.is_pinned,
        isStarred: data.is_starred,
        replyCount: data.reply_count,
        tags: data.tags,
        mentionedUserIds: data.mentioned_user_ids,
        parentNoteId: data.parent_note_id,
        threadRootId: data.thread_root_id,
        creator: data.creator,
        replies: data.replies,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    }),

  // ============================================
  // CREATE NOTE
  // ============================================
  create: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        title: z.string().max(200).optional(),
        content: z.string().min(1).max(10000),
        contentHtml: z.string().optional(),
        noteType: NoteTypeEnum.default('general'),
        visibility: VisibilityEnum.default('team'),
        parentNoteId: z.string().uuid().optional(),
        tags: z.array(z.string()).optional(),
        mentionedUserIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth.users.id (FK references user_profiles, not auth.users)
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // If this is a reply, get the thread root
      let threadRootId = input.parentNoteId
      if (input.parentNoteId) {
        const { data: parent } = await adminClient
          .from('notes')
          .select('thread_root_id')
          .eq('id', input.parentNoteId)
          .eq('org_id', orgId)
          .single()
        threadRootId = parent?.thread_root_id || input.parentNoteId
      }

      // Use adminClient to bypass RLS - auth already validated via orgProtectedProcedure
      const { data, error } = await adminClient
        .from('notes')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          title: input.title,
          content: input.content,
          content_html: input.contentHtml,
          content_plain: input.content.replace(/<[^>]*>/g, ''),
          note_type: input.noteType,
          visibility: input.visibility,
          parent_note_id: input.parentNoteId,
          thread_root_id: threadRootId,
          tags: input.tags,
          mentioned_user_ids: input.mentionedUserIds,
          created_by: userProfileId,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Increment reply count on parent
      if (input.parentNoteId) {
        await adminClient.rpc('increment_field', {
          p_table: 'notes',
          p_column: 'reply_count',
          p_id: input.parentNoteId,
        })
      }

      // HISTORY: Record note added to parent entity (fire-and-forget)
      void historyService.recordRelatedObjectAdded(
        input.entityType,
        input.entityId,
        {
          type: 'note',
          id: data.id,
          label: input.title || `${input.noteType} note`,
          metadata: { noteType: input.noteType, visibility: input.visibility },
        },
        { orgId, userId: user?.id ?? null }
      ).catch(err => console.error('[History] Failed to record note addition:', err))

      return { id: data.id }
    }),

  // ============================================
  // UPDATE NOTE
  // ============================================
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(200).optional(),
        content: z.string().min(1).max(10000).optional(),
        contentHtml: z.string().optional(),
        noteType: NoteTypeEnum.optional(),
        visibility: VisibilityEnum.optional(),
        tags: z.array(z.string()).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const { id, ...updates } = input

      // Look up user_profiles.id from auth.users.id (FK references user_profiles, not auth.users)
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Fetch note to get entity info for history
      const { data: noteData } = await adminClient
        .from('notes')
        .select('entity_type, entity_id, title, note_type')
        .eq('id', id)
        .eq('org_id', orgId)
        .single()

      const updateData: Record<string, unknown> = {
        updated_by: userProfileId,
        updated_at: new Date().toISOString(),
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) {
        updateData.content = updates.content
        updateData.content_plain = updates.content.replace(/<[^>]*>/g, '')
      }
      if (updates.contentHtml !== undefined) updateData.content_html = updates.contentHtml
      if (updates.noteType !== undefined) updateData.note_type = updates.noteType
      if (updates.visibility !== undefined) updateData.visibility = updates.visibility
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.isPinned !== undefined) {
        updateData.is_pinned = updates.isPinned
        updateData.pin_order = updates.isPinned ? 0 : null
      }

      const { error } = await adminClient
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // HISTORY: Record note updated on parent entity (fire-and-forget)
      if (noteData) {
        void historyService.recordRelatedObjectUpdated(
          noteData.entity_type,
          noteData.entity_id,
          {
            type: 'note',
            id: id,
            label: updates.title ?? noteData.title ?? `${noteData.note_type} note`,
          },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record note update:', err))
      }

      return { success: true }
    }),

  // ============================================
  // DELETE NOTE (SOFT)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Fetch note to get entity info for history
      const { data: noteData } = await adminClient
        .from('notes')
        .select('entity_type, entity_id, title, note_type')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      const { error } = await adminClient
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // HISTORY: Record note removed from parent entity (fire-and-forget)
      if (noteData) {
        void historyService.recordRelatedObjectRemoved(
          noteData.entity_type,
          noteData.entity_id,
          {
            type: 'note',
            id: input.id,
            label: noteData.title ?? `${noteData.note_type} note`,
          },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record note removal:', err))
      }

      return { success: true }
    }),

  // ============================================
  // TOGGLE PIN
  // ============================================
  togglePin: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isPinned: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('notes')
        .update({
          is_pinned: input.isPinned,
          pin_order: input.isPinned ? 0 : null,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),

  // ============================================
  // TOGGLE STAR
  // ============================================
  toggleStar: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isStarred: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('notes')
        .update({ is_starred: input.isStarred })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),

  // ============================================
  // ADD/REMOVE REACTION
  // ============================================
  toggleReaction: orgProtectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid(),
        reaction: z.string().max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth.users.id (FK references user_profiles, not auth.users)
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Check if reaction exists
      const { data: existing } = await adminClient
        .from('note_reactions')
        .select('id')
        .eq('note_id', input.noteId)
        .eq('user_id', userProfileId)
        .eq('reaction', input.reaction)
        .single()

      if (existing) {
        // Remove reaction
        const { error } = await adminClient.from('note_reactions').delete().eq('id', existing.id)

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { added: false }
      } else {
        // Add reaction
        const { error } = await adminClient.from('note_reactions').insert({
          note_id: input.noteId,
          user_id: userProfileId,
          reaction: input.reaction,
        })

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { added: true }
      }
    }),

  // ============================================
  // GET STATS FOR ENTITY
  // ============================================
  statsByEntity: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { count } = await adminClient
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .is('parent_note_id', null)

      const { count: pinnedCount } = await adminClient
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .eq('is_pinned', true)

      return {
        total: count ?? 0,
        pinned: pinnedCount ?? 0,
      }
    }),

  // ============================================
  // SEARCH NOTES
  // ============================================
  search: orgProtectedProcedure
    .input(
      z.object({
        query: z.string().min(2).max(200),
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Use full-text search
      const searchQuery = input.query.split(' ').join(' & ')

      let query = adminClient
        .from('notes')
        .select(
          `
          id, title, content, note_type, entity_type, entity_id, created_at,
          creator:user_profiles!created_by(id, full_name, avatar_url)
        `
        )
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .textSearch('search_vector', searchQuery)
        .limit(input.limit)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }
      if (input.entityId) {
        query = query.eq('entity_id', input.entityId)
      }

      const { data, error } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            noteType: n.note_type,
            entityType: n.entity_type,
            entityId: n.entity_id,
            creator: n.creator,
            createdAt: n.created_at,
          })) ?? [],
      }
    }),

  // ============================================
  // GET MY NOTES (across all entities)
  // ============================================
  getMyNotes: orgProtectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        starredOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('notes')
        .select(
          `
          id, title, content, note_type, entity_type, entity_id,
          is_pinned, is_starred, created_at, updated_at
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .eq('created_by', user?.id)
        .is('deleted_at', null)
        .is('parent_note_id', null)
        .order('updated_at', { ascending: false })

      if (input.starredOnly) {
        query = query.eq('is_starred', true)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            noteType: n.note_type,
            entityType: n.entity_type,
            entityId: n.entity_id,
            isPinned: n.is_pinned,
            isStarred: n.is_starred,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })) ?? [],
        total: count ?? 0,
      }
    }),
})
