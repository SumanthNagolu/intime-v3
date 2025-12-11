import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const employmentTypeEnum = z.enum([
  'full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary'
])

const workHistoryInput = z.object({
  contactId: z.string().uuid(),
  companyName: z.string().min(1),
  companyContactId: z.string().uuid().optional(),
  title: z.string().min(1),
  department: z.string().optional(),
  employmentType: employmentTypeEnum.optional(),
  startDate: z.string(), // ISO date
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  reasonForLeaving: z.string().optional(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
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

function transformWorkHistory(wh: Record<string, unknown>) {
  return {
    id: wh.id as string,
    contactId: wh.contact_id as string,
    companyName: wh.company_name as string,
    companyContactId: wh.company_contact_id as string | null,
    title: wh.title as string,
    department: wh.department as string | null,
    employmentType: wh.employment_type as string | null,
    startDate: wh.start_date as string,
    endDate: wh.end_date as string | null,
    isCurrent: wh.is_current as boolean,
    description: wh.description as string | null,
    achievements: (wh.achievements as string[]) || [],
    reasonForLeaving: wh.reason_for_leaving as string | null,
    managerName: wh.manager_name as string | null,
    managerContact: wh.manager_contact as string | null,
    location: wh.location as string | null,
    isRemote: wh.is_remote as boolean,
    isVerified: wh.is_verified as boolean,
    verifiedBy: wh.verified_by as string | null,
    verifiedAt: wh.verified_at as string | null,
    displayOrder: wh.display_order as number,
    createdAt: wh.created_at as string,
    updatedAt: wh.updated_at as string,
    // Joined data
    companyContact: wh.company_contact,
    contact: wh.contact,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactWorkHistoryRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      companyContactId: z.string().uuid().optional(),
      isCurrent: z.boolean().optional(),
      employmentType: employmentTypeEnum.optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['start_date', 'end_date', 'company_name', 'created_at']).default('start_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_work_history')
        .select(`
          *,
          company_contact:contacts!company_contact_id(id, first_name, last_name, company_name),
          contact:contacts!contact_id(id, first_name, last_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      if (input.companyContactId) {
        query = query.eq('company_contact_id', input.companyContactId)
      }

      if (input.isCurrent !== undefined) {
        query = query.eq('is_current', input.isCurrent)
      }

      if (input.employmentType) {
        query = query.eq('employment_type', input.employmentType)
      }

      if (input.search) {
        query = query.or(`company_name.ilike.%${input.search}%,title.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list work history:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformWorkHistory) ?? [],
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
        .from('contact_work_history')
        .select(`
          *,
          company_contact:contacts!company_contact_id(id, first_name, last_name, company_name),
          contact:contacts!contact_id(id, first_name, last_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Work history not found' })
      }

      return transformWorkHistory(data)
    }),

  // ==========================================
  // GET BY CONTACT - All work history for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_work_history')
        .select(`
          *,
          company_contact:contacts!company_contact_id(id, first_name, last_name, company_name)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false })

      if (error) {
        console.error('Failed to get work history by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformWorkHistory) ?? []
    }),

  // ==========================================
  // GET CURRENT EMPLOYMENT
  // ==========================================
  getCurrentEmployment: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_work_history')
        .select(`
          *,
          company_contact:contacts!company_contact_id(id, first_name, last_name, company_name)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('is_current', true)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) {
        console.error('Failed to get current employment:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformWorkHistory(data) : null
    }),

  // ==========================================
  // CREATE
  // ==========================================
  create: orgProtectedProcedure
    .input(workHistoryInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // If this is current employment, end any existing current employment
      if (input.isCurrent) {
        await adminClient
          .from('contact_work_history')
          .update({
            is_current: false,
            end_date: new Date().toISOString().split('T')[0],
          })
          .eq('org_id', orgId)
          .eq('contact_id', input.contactId)
          .eq('is_current', true)
      }

      const { data, error } = await adminClient
        .from('contact_work_history')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          company_name: input.companyName,
          company_contact_id: input.companyContactId,
          title: input.title,
          department: input.department,
          employment_type: input.employmentType,
          start_date: input.startDate,
          end_date: input.endDate,
          is_current: input.isCurrent,
          description: input.description,
          achievements: input.achievements,
          reason_for_leaving: input.reasonForLeaving,
          manager_name: input.managerName,
          manager_contact: input.managerContact,
          location: input.location,
          is_remote: input.isRemote,
          display_order: input.displayOrder,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create work history:', error)
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
      companyName: z.string().min(1).optional(),
      companyContactId: z.string().uuid().optional(),
      title: z.string().min(1).optional(),
      department: z.string().optional(),
      employmentType: employmentTypeEnum.optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isCurrent: z.boolean().optional(),
      description: z.string().optional(),
      achievements: z.array(z.string()).optional(),
      reasonForLeaving: z.string().optional(),
      managerName: z.string().optional(),
      managerContact: z.string().optional(),
      location: z.string().optional(),
      isRemote: z.boolean().optional(),
      displayOrder: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.companyName !== undefined) dbUpdate.company_name = updateData.companyName
      if (updateData.companyContactId !== undefined) dbUpdate.company_contact_id = updateData.companyContactId
      if (updateData.title !== undefined) dbUpdate.title = updateData.title
      if (updateData.department !== undefined) dbUpdate.department = updateData.department
      if (updateData.employmentType !== undefined) dbUpdate.employment_type = updateData.employmentType
      if (updateData.startDate !== undefined) dbUpdate.start_date = updateData.startDate
      if (updateData.endDate !== undefined) dbUpdate.end_date = updateData.endDate
      if (updateData.isCurrent !== undefined) dbUpdate.is_current = updateData.isCurrent
      if (updateData.description !== undefined) dbUpdate.description = updateData.description
      if (updateData.achievements !== undefined) dbUpdate.achievements = updateData.achievements
      if (updateData.reasonForLeaving !== undefined) dbUpdate.reason_for_leaving = updateData.reasonForLeaving
      if (updateData.managerName !== undefined) dbUpdate.manager_name = updateData.managerName
      if (updateData.managerContact !== undefined) dbUpdate.manager_contact = updateData.managerContact
      if (updateData.location !== undefined) dbUpdate.location = updateData.location
      if (updateData.isRemote !== undefined) dbUpdate.is_remote = updateData.isRemote
      if (updateData.displayOrder !== undefined) dbUpdate.display_order = updateData.displayOrder

      const { error } = await adminClient
        .from('contact_work_history')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update work history:', error)
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
        .from('contact_work_history')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete work history:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // END EMPLOYMENT
  // ==========================================
  endEmployment: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      endDate: z.string().optional(),
      reasonForLeaving: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_work_history')
        .update({
          is_current: false,
          end_date: input.endDate || new Date().toISOString().split('T')[0],
          reason_for_leaving: input.reasonForLeaving,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to end employment:', error)
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
        .from('contact_work_history')
        .update({
          is_verified: input.isVerified,
          verified_by: input.isVerified ? user?.id : null,
          verified_at: input.isVerified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to verify work history:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // REORDER - Batch update display_order
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
          .from('contact_work_history')
          .update({ display_order: item.displayOrder })
          .eq('id', item.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to reorder work history:', error)
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
        .from('contact_work_history')
        .select('id, is_current, employment_type, is_verified')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: items } = await query

      const byEmploymentType = items?.reduce((acc, item) => {
        const type = item.employment_type || 'unspecified'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: items?.length ?? 0,
        current: items?.filter(i => i.is_current).length ?? 0,
        verified: items?.filter(i => i.is_verified).length ?? 0,
        byEmploymentType,
      }
    }),
})
