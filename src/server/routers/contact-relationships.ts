import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const relationshipTypeEnum = z.enum([
  'works_at',
  'worked_at',
  'owns',
  'founded',
  'board_member',
  'reports_to',
  'manages',
  'referred_by',
  'knows',
  'mentors',
  'spouse_of'
])

const relationshipInput = z.object({
  sourceContactId: z.string().uuid(),
  targetContactId: z.string().uuid(),
  relationshipType: relationshipTypeEnum,
  // Employment context
  titleAtCompany: z.string().optional(),
  departmentAtCompany: z.string().optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  // Strength and notes
  relationshipStrength: z.number().min(1).max(10).optional(),
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

function transformRelationship(rel: Record<string, unknown>) {
  return {
    id: rel.id as string,
    sourceContactId: rel.source_contact_id as string,
    targetContactId: rel.target_contact_id as string,
    relationshipType: rel.relationship_type as string,
    titleAtCompany: rel.title_at_company as string | null,
    departmentAtCompany: rel.department_at_company as string | null,
    startDate: rel.start_date as string | null,
    endDate: rel.end_date as string | null,
    isCurrent: rel.is_current as boolean,
    relationshipStrength: rel.relationship_strength as number | null,
    notes: rel.notes as string | null,
    createdAt: rel.created_at as string,
    updatedAt: rel.updated_at as string,
    createdBy: rel.created_by as string | null,
    // Joined data
    sourceContact: rel.source_contact,
    targetContact: rel.target_contact,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactRelationshipsRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      sourceContactId: z.string().uuid().optional(),
      targetContactId: z.string().uuid().optional(),
      contactId: z.string().uuid().optional(), // Either source or target
      relationshipType: relationshipTypeEnum.optional(),
      isCurrent: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['relationship_type', 'start_date', 'created_at', 'updated_at']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_relationships')
        .select(`
          *,
          source_contact:contacts!source_contact_id(id, first_name, last_name, company_name, subtype, category),
          target_contact:contacts!target_contact_id(id, first_name, last_name, company_name, subtype, category)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by source contact
      if (input.sourceContactId) {
        query = query.eq('source_contact_id', input.sourceContactId)
      }

      // Filter by target contact
      if (input.targetContactId) {
        query = query.eq('target_contact_id', input.targetContactId)
      }

      // Filter by either source or target
      if (input.contactId) {
        query = query.or(`source_contact_id.eq.${input.contactId},target_contact_id.eq.${input.contactId}`)
      }

      // Filter by relationship type
      if (input.relationshipType) {
        query = query.eq('relationship_type', input.relationshipType)
      }

      // Filter by current status
      if (input.isCurrent !== undefined) {
        query = query.eq('is_current', input.isCurrent)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list contact relationships:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformRelationship) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single relationship
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_relationships')
        .select(`
          *,
          source_contact:contacts!source_contact_id(id, first_name, last_name, company_name, subtype, category),
          target_contact:contacts!target_contact_id(id, first_name, last_name, company_name, subtype, category)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Relationship not found' })
      }

      return transformRelationship(data)
    }),

  // ==========================================
  // GET BY CONTACT - All relationships for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      includeInverse: z.boolean().default(true), // Include relationships where this contact is the target
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_relationships')
        .select(`
          *,
          source_contact:contacts!source_contact_id(id, first_name, last_name, company_name, subtype, category),
          target_contact:contacts!target_contact_id(id, first_name, last_name, company_name, subtype, category)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.includeInverse) {
        query = query.or(`source_contact_id.eq.${input.contactId},target_contact_id.eq.${input.contactId}`)
      } else {
        query = query.eq('source_contact_id', input.contactId)
      }

      query = query.order('is_current', { ascending: false }).order('start_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get relationships by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformRelationship) ?? []
    }),

  // ==========================================
  // GET CURRENT EMPLOYER - For person contacts
  // ==========================================
  getCurrentEmployer: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_relationships')
        .select(`
          *,
          target_contact:contacts!target_contact_id(id, first_name, last_name, company_name, subtype, category)
        `)
        .eq('org_id', orgId)
        .eq('source_contact_id', input.contactId)
        .eq('relationship_type', 'works_at')
        .eq('is_current', true)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) {
        console.error('Failed to get current employer:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformRelationship(data) : null
    }),

  // ==========================================
  // CREATE - Add new relationship
  // ==========================================
  create: orgProtectedProcedure
    .input(relationshipInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // If this is a current works_at relationship, end any existing current employment
      if (input.relationshipType === 'works_at' && input.isCurrent) {
        await adminClient
          .from('contact_relationships')
          .update({
            is_current: false,
            end_date: new Date().toISOString().split('T')[0],
            updated_by: userId
          })
          .eq('org_id', orgId)
          .eq('source_contact_id', input.sourceContactId)
          .eq('relationship_type', 'works_at')
          .eq('is_current', true)
      }

      const { data, error } = await adminClient
        .from('contact_relationships')
        .insert({
          org_id: orgId,
          source_contact_id: input.sourceContactId,
          target_contact_id: input.targetContactId,
          relationship_type: input.relationshipType,
          title_at_company: input.titleAtCompany,
          department_at_company: input.departmentAtCompany,
          start_date: input.startDate,
          end_date: input.endDate,
          is_current: input.isCurrent,
          relationship_strength: input.relationshipStrength,
          notes: input.notes,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create relationship:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing relationship
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      relationshipType: relationshipTypeEnum.optional(),
      titleAtCompany: z.string().optional(),
      departmentAtCompany: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isCurrent: z.boolean().optional(),
      relationshipStrength: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const { id, ...updateData } = input

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }

      if (updateData.relationshipType !== undefined) dbUpdate.relationship_type = updateData.relationshipType
      if (updateData.titleAtCompany !== undefined) dbUpdate.title_at_company = updateData.titleAtCompany
      if (updateData.departmentAtCompany !== undefined) dbUpdate.department_at_company = updateData.departmentAtCompany
      if (updateData.startDate !== undefined) dbUpdate.start_date = updateData.startDate
      if (updateData.endDate !== undefined) dbUpdate.end_date = updateData.endDate
      if (updateData.isCurrent !== undefined) dbUpdate.is_current = updateData.isCurrent
      if (updateData.relationshipStrength !== undefined) dbUpdate.relationship_strength = updateData.relationshipStrength
      if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes

      const { error } = await adminClient
        .from('contact_relationships')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update relationship:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete relationship
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_relationships')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete relationship:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // END RELATIONSHIP - Mark as no longer current
  // ==========================================
  endRelationship: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      endDate: z.string().optional(), // Defaults to today
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_relationships')
        .update({
          is_current: false,
          end_date: input.endDate || new Date().toISOString().split('T')[0],
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to end relationship:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Relationship statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_relationships')
        .select('id, relationship_type, is_current')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.or(`source_contact_id.eq.${input.contactId},target_contact_id.eq.${input.contactId}`)
      }

      const { data: relationships } = await query

      const byType = relationships?.reduce((acc, rel) => {
        acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: relationships?.length ?? 0,
        current: relationships?.filter(r => r.is_current).length ?? 0,
        byType,
        employmentRelationships: (byType['works_at'] ?? 0) + (byType['worked_at'] ?? 0),
        personalRelationships: (byType['knows'] ?? 0) + (byType['mentors'] ?? 0) + (byType['spouse_of'] ?? 0),
        businessRelationships: (byType['owns'] ?? 0) + (byType['founded'] ?? 0) + (byType['board_member'] ?? 0),
      }
    }),
})
