import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const mergeHistoryInput = z.object({
  survivorContactId: z.string().uuid(),
  mergedContactId: z.string().uuid(),
  fieldSelections: z.record(z.string(), z.string()), // { field: 'survivor' | 'merged' }
  mergedContactSnapshot: z.record(z.string(), z.unknown()), // Full contact backup
  notes: z.string().optional(),
})

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformMergeHistory(mh: Record<string, unknown>) {
  return {
    id: mh.id as string,
    survivorContactId: mh.survivor_contact_id as string,
    mergedContactId: mh.merged_contact_id as string,
    mergedAt: mh.merged_at as string,
    mergedBy: mh.merged_by as string | null,
    fieldSelections: (mh.field_selections as Record<string, string>) || {},
    mergedContactSnapshot: (mh.merged_contact_snapshot as Record<string, unknown>) || {},
    notes: mh.notes as string | null,
    // Joined data
    survivorContact: mh.survivor_contact,
    mergedByUser: mh.merged_by_user,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactMergeHistoryRouter = router({
  // ==========================================
  // LIST - Paginated merge history
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      survivorContactId: z.string().uuid().optional(),
      mergedBy: z.string().uuid().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['merged_at']).default('merged_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_merge_history')
        .select(`
          *,
          survivor_contact:contacts!survivor_contact_id(id, first_name, last_name, email),
          merged_by_user:user_profiles!merged_by(id, full_name, email)
        `, { count: 'exact' })
        .eq('org_id', orgId)

      if (input.survivorContactId) {
        query = query.eq('survivor_contact_id', input.survivorContactId)
      }

      if (input.mergedBy) {
        query = query.eq('merged_by', input.mergedBy)
      }

      // Search in snapshot data (JSON search)
      if (input.search) {
        query = query.or(`merged_contact_snapshot->>'email'.ilike.%${input.search}%,merged_contact_snapshot->>'first_name'.ilike.%${input.search}%,merged_contact_snapshot->>'last_name'.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list merge history:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformMergeHistory) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_merge_history')
        .select(`
          *,
          survivor_contact:contacts!survivor_contact_id(id, first_name, last_name, email),
          merged_by_user:user_profiles!merged_by(id, full_name, email)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Merge history record not found' })
      }

      return transformMergeHistory(data)
    }),

  // ==========================================
  // GET BY SURVIVOR - All merges for a survivor contact
  // ==========================================
  getBySurvivor: orgProtectedProcedure
    .input(z.object({ survivorContactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_merge_history')
        .select(`
          *,
          merged_by_user:user_profiles!merged_by(id, full_name, email)
        `)
        .eq('org_id', orgId)
        .eq('survivor_contact_id', input.survivorContactId)
        .order('merged_at', { ascending: false })

      if (error) {
        console.error('Failed to get merge history by survivor:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformMergeHistory) ?? []
    }),

  // ==========================================
  // GET BY MERGED CONTACT - Find merge record for a deleted contact ID
  // ==========================================
  getByMergedContact: orgProtectedProcedure
    .input(z.object({ mergedContactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_merge_history')
        .select(`
          *,
          survivor_contact:contacts!survivor_contact_id(id, first_name, last_name, email),
          merged_by_user:user_profiles!merged_by(id, full_name, email)
        `)
        .eq('org_id', orgId)
        .eq('merged_contact_id', input.mergedContactId)
        .maybeSingle()

      if (error) {
        console.error('Failed to get merge history by merged contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformMergeHistory(data) : null
    }),

  // ==========================================
  // CREATE - Record merge operation (requires full snapshot)
  // ==========================================
  create: orgProtectedProcedure
    .input(mergeHistoryInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Validate that survivor contact exists
      const { data: survivorExists } = await adminClient
        .from('contacts')
        .select('id')
        .eq('id', input.survivorContactId)
        .eq('org_id', orgId)
        .single()

      if (!survivorExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Survivor contact does not exist',
        })
      }

      // Validate that merged contact snapshot is not empty
      if (Object.keys(input.mergedContactSnapshot).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Merged contact snapshot cannot be empty',
        })
      }

      const { data, error } = await adminClient
        .from('contact_merge_history')
        .insert({
          org_id: orgId,
          survivor_contact_id: input.survivorContactId,
          merged_contact_id: input.mergedContactId,
          merged_by: user?.id,
          field_selections: input.fieldSelections,
          merged_contact_snapshot: input.mergedContactSnapshot,
          notes: input.notes,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create merge history:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // GET SNAPSHOT - Extract merged contact data from JSONB
  // ==========================================
  getSnapshot: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_merge_history')
        .select('merged_contact_snapshot')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Merge history record not found' })
      }

      return data.merged_contact_snapshot as Record<string, unknown>
    }),

  // ==========================================
  // STATS - Total merges, by user, recent merges
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      mergedBy: z.string().uuid().optional(),
      daysBack: z.number().default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Total merges
      let query = adminClient
        .from('contact_merge_history')
        .select('id, merged_by, merged_at')
        .eq('org_id', orgId)

      if (input?.mergedBy) {
        query = query.eq('merged_by', input.mergedBy)
      }

      const { data: allMerges } = await query

      // Recent merges (within daysBack)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - (input?.daysBack ?? 30))

      const recentMerges = allMerges?.filter(m =>
        new Date(m.merged_at) >= cutoffDate
      ) ?? []

      // By user breakdown
      const byUser = allMerges?.reduce((acc, m) => {
        const userId = m.merged_by || 'unknown'
        acc[userId] = (acc[userId] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: allMerges?.length ?? 0,
        recentCount: recentMerges.length,
        byUser,
      }
    }),

  // NOTE: This router is IMMUTABLE - NO update or delete procedures.
  // Merge history should never be modified or deleted as it serves as an audit trail.
})
