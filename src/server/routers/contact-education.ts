import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const degreeTypeEnum = z.enum([
  'high_school', 'associate', 'bachelor', 'master', 'doctorate', 'certificate', 'bootcamp', 'other'
])

const institutionTypeEnum = z.enum([
  'university', 'college', 'community_college', 'online', 'bootcamp', 'trade_school', 'other'
])

const educationInput = z.object({
  contactId: z.string().uuid(),
  institutionName: z.string().min(1),
  institutionType: institutionTypeEnum.optional(),
  degreeType: degreeTypeEnum.optional(),
  fieldOfStudy: z.string().optional(),
  major: z.string().optional(),
  minor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  graduationDate: z.string().optional(),
  isCompleted: z.boolean().default(false),
  gpa: z.number().min(0).max(5).optional(),
  gpaScale: z.number().default(4.0),
  honors: z.string().optional(),
  activities: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  displayOrder: z.number().int().default(0),
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

// Degree ranking for getHighestDegree
const degreeRank: Record<string, number> = {
  doctorate: 6,
  master: 5,
  bachelor: 4,
  associate: 3,
  certificate: 2,
  bootcamp: 2,
  high_school: 1,
  other: 0,
}

function transformEducation(edu: Record<string, unknown>) {
  return {
    id: edu.id as string,
    contactId: edu.contact_id as string,
    institutionName: edu.institution_name as string,
    institutionType: edu.institution_type as string | null,
    degreeType: edu.degree_type as string | null,
    fieldOfStudy: edu.field_of_study as string | null,
    major: edu.major as string | null,
    minor: edu.minor as string | null,
    startDate: edu.start_date as string | null,
    endDate: edu.end_date as string | null,
    graduationDate: edu.graduation_date as string | null,
    isCompleted: edu.is_completed as boolean,
    gpa: edu.gpa as number | null,
    gpaScale: edu.gpa_scale as number,
    honors: edu.honors as string | null,
    activities: edu.activities as string | null,
    achievements: (edu.achievements as string[]) || [],
    isVerified: edu.is_verified as boolean,
    verifiedBy: edu.verified_by as string | null,
    displayOrder: edu.display_order as number,
    createdAt: edu.created_at as string,
    updatedAt: edu.updated_at as string,
    // Joined data
    contact: edu.contact,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactEducationRouter = router({
  // ==========================================
  // LIST
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      degreeType: degreeTypeEnum.optional(),
      institutionType: institutionTypeEnum.optional(),
      isCompleted: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['graduation_date', 'institution_name', 'degree_type', 'created_at']).default('graduation_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_education')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      if (input.degreeType) {
        query = query.eq('degree_type', input.degreeType)
      }

      if (input.institutionType) {
        query = query.eq('institution_type', input.institutionType)
      }

      if (input.isCompleted !== undefined) {
        query = query.eq('is_completed', input.isCompleted)
      }

      if (input.search) {
        query = query.or(`institution_name.ilike.%${input.search}%,field_of_study.ilike.%${input.search}%,major.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list education:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformEducation) ?? [],
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
        .from('contact_education')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Education record not found' })
      }

      return transformEducation(data)
    }),

  // ==========================================
  // GET BY CONTACT
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_education')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })
        .order('graduation_date', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('Failed to get education by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformEducation) ?? []
    }),

  // ==========================================
  // GET HIGHEST DEGREE
  // ==========================================
  getHighestDegree: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_education')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('is_completed', true)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to get highest degree:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      if (!data || data.length === 0) {
        return null
      }

      // Find highest ranked degree
      const sorted = data.sort((a, b) => {
        const rankA = degreeRank[a.degree_type || 'other'] || 0
        const rankB = degreeRank[b.degree_type || 'other'] || 0
        return rankB - rankA
      })

      return transformEducation(sorted[0])
    }),

  // ==========================================
  // CREATE
  // ==========================================
  create: orgProtectedProcedure
    .input(educationInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Validate GPA against scale
      if (input.gpa !== undefined && input.gpa > input.gpaScale) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `GPA (${input.gpa}) cannot exceed scale (${input.gpaScale})`,
        })
      }

      const { data, error } = await adminClient
        .from('contact_education')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          institution_name: input.institutionName,
          institution_type: input.institutionType,
          degree_type: input.degreeType,
          field_of_study: input.fieldOfStudy,
          major: input.major,
          minor: input.minor,
          start_date: input.startDate,
          end_date: input.endDate,
          graduation_date: input.graduationDate,
          is_completed: input.isCompleted,
          gpa: input.gpa,
          gpa_scale: input.gpaScale,
          honors: input.honors,
          activities: input.activities,
          achievements: input.achievements,
          display_order: input.displayOrder,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create education:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      institutionName: z.string().min(1).optional(),
      institutionType: institutionTypeEnum.optional(),
      degreeType: degreeTypeEnum.optional(),
      fieldOfStudy: z.string().optional(),
      major: z.string().optional(),
      minor: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      graduationDate: z.string().optional(),
      isCompleted: z.boolean().optional(),
      gpa: z.number().min(0).max(5).optional(),
      gpaScale: z.number().optional(),
      honors: z.string().optional(),
      activities: z.string().optional(),
      achievements: z.array(z.string()).optional(),
      displayOrder: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.institutionName !== undefined) dbUpdate.institution_name = updateData.institutionName
      if (updateData.institutionType !== undefined) dbUpdate.institution_type = updateData.institutionType
      if (updateData.degreeType !== undefined) dbUpdate.degree_type = updateData.degreeType
      if (updateData.fieldOfStudy !== undefined) dbUpdate.field_of_study = updateData.fieldOfStudy
      if (updateData.major !== undefined) dbUpdate.major = updateData.major
      if (updateData.minor !== undefined) dbUpdate.minor = updateData.minor
      if (updateData.startDate !== undefined) dbUpdate.start_date = updateData.startDate
      if (updateData.endDate !== undefined) dbUpdate.end_date = updateData.endDate
      if (updateData.graduationDate !== undefined) dbUpdate.graduation_date = updateData.graduationDate
      if (updateData.isCompleted !== undefined) dbUpdate.is_completed = updateData.isCompleted
      if (updateData.gpa !== undefined) dbUpdate.gpa = updateData.gpa
      if (updateData.gpaScale !== undefined) dbUpdate.gpa_scale = updateData.gpaScale
      if (updateData.honors !== undefined) dbUpdate.honors = updateData.honors
      if (updateData.activities !== undefined) dbUpdate.activities = updateData.activities
      if (updateData.achievements !== undefined) dbUpdate.achievements = updateData.achievements
      if (updateData.displayOrder !== undefined) dbUpdate.display_order = updateData.displayOrder

      const { error } = await adminClient
        .from('contact_education')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update education:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_education')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete education:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // VERIFY
  // ==========================================
  verify: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      isVerified: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_education')
        .update({
          is_verified: input.isVerified,
          verified_by: input.isVerified ? user?.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to verify education:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // REORDER
  // ==========================================
  reorder: orgProtectedProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string().uuid(),
        displayOrder: z.number().int(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      for (const item of input.items) {
        const { error } = await adminClient
          .from('contact_education')
          .update({ display_order: item.displayOrder })
          .eq('id', item.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to reorder education:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }
      }

      return { success: true }
    }),

  // ==========================================
  // STATS
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_education')
        .select('id, is_completed, degree_type, institution_type, is_verified')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: items } = await query

      const byDegreeType = items?.reduce((acc, item) => {
        const type = item.degree_type || 'unspecified'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byInstitutionType = items?.reduce((acc, item) => {
        const type = item.institution_type || 'unspecified'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: items?.length ?? 0,
        completed: items?.filter(i => i.is_completed).length ?? 0,
        verified: items?.filter(i => i.is_verified).length ?? 0,
        byDegreeType,
        byInstitutionType,
      }
    }),
})
