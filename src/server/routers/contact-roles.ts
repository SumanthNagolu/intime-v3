import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const roleTypeEnum = z.enum([
  'candidate',
  'employee',
  'client_contact',
  'hiring_manager',
  'hr_contact',
  'vendor_contact',
  'bench_internal',
  'bench_vendor',
  'placed',
  'referral_source',
  'alumni'
])

const roleStatusEnum = z.enum(['active', 'inactive', 'pending', 'suspended'])

const roleInput = z.object({
  contactId: z.string().uuid(),
  roleType: roleTypeEnum,
  roleStatus: roleStatusEnum.default('active'),
  contextCompanyId: z.string().uuid().optional(), // Company where this role applies
  contextDetails: z.record(z.unknown()).optional(), // Additional context data (jsonb)
  roleStartedAt: z.string().optional(), // ISO datetime
  roleEndedAt: z.string().optional(),
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

function transformRole(role: Record<string, unknown>) {
  return {
    id: role.id as string,
    contactId: role.contact_id as string,
    roleType: role.role_type as string,
    roleStatus: role.role_status as string,
    contextCompanyId: role.context_company_id as string | null,
    contextDetails: role.context_details as Record<string, unknown> | null,
    roleStartedAt: role.role_started_at as string | null,
    roleEndedAt: role.role_ended_at as string | null,
    createdAt: role.created_at as string,
    updatedAt: role.updated_at as string,
    createdBy: role.created_by as string | null,
    // Joined data
    contact: role.contact,
    contextCompany: role.context_company,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactRolesRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      roleType: roleTypeEnum.optional(),
      roleStatus: roleStatusEnum.optional(),
      contextCompanyId: z.string().uuid().optional(),
      isActive: z.boolean().optional(), // Only active roles (status = 'active' and not ended)
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['role_type', 'role_status', 'role_started_at', 'created_at']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_roles')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          context_company:contacts!context_company_id(id, company_name, subtype)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by contact
      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      // Filter by role type
      if (input.roleType) {
        query = query.eq('role_type', input.roleType)
      }

      // Filter by role status
      if (input.roleStatus) {
        query = query.eq('role_status', input.roleStatus)
      }

      // Filter by context company
      if (input.contextCompanyId) {
        query = query.eq('context_company_id', input.contextCompanyId)
      }

      // Filter active roles only
      if (input.isActive === true) {
        query = query.eq('role_status', 'active').is('role_ended_at', null)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list contact roles:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformRole) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single role
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_roles')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          context_company:contacts!context_company_id(id, company_name, subtype)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Role not found' })
      }

      return transformRole(data)
    }),

  // ==========================================
  // GET BY CONTACT - All roles for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      activeOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_roles')
        .select(`
          *,
          context_company:contacts!context_company_id(id, company_name, subtype)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)

      if (input.activeOnly) {
        query = query.eq('role_status', 'active').is('role_ended_at', null)
      }

      query = query.order('role_started_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get roles by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformRole) ?? []
    }),

  // ==========================================
  // GET ACTIVE ROLES - Current active roles for a contact
  // ==========================================
  getActiveRoles: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_roles')
        .select(`
          *,
          context_company:contacts!context_company_id(id, company_name, subtype)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('role_status', 'active')
        .is('role_ended_at', null)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to get active roles:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformRole) ?? []
    }),

  // ==========================================
  // CREATE - Add new role
  // ==========================================
  create: orgProtectedProcedure
    .input(roleInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const { data, error } = await adminClient
        .from('contact_roles')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          role_type: input.roleType,
          role_status: input.roleStatus,
          context_company_id: input.contextCompanyId,
          context_details: input.contextDetails || {},
          role_started_at: input.roleStartedAt || new Date().toISOString(),
          role_ended_at: input.roleEndedAt,
          created_by: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create role:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing role
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      roleType: roleTypeEnum.optional(),
      roleStatus: roleStatusEnum.optional(),
      contextCompanyId: z.string().uuid().optional(),
      contextDetails: z.record(z.unknown()).optional(),
      roleStartedAt: z.string().optional(),
      roleEndedAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.roleType !== undefined) dbUpdate.role_type = updateData.roleType
      if (updateData.roleStatus !== undefined) dbUpdate.role_status = updateData.roleStatus
      if (updateData.contextCompanyId !== undefined) dbUpdate.context_company_id = updateData.contextCompanyId
      if (updateData.contextDetails !== undefined) dbUpdate.context_details = updateData.contextDetails
      if (updateData.roleStartedAt !== undefined) dbUpdate.role_started_at = updateData.roleStartedAt
      if (updateData.roleEndedAt !== undefined) dbUpdate.role_ended_at = updateData.roleEndedAt

      const { error } = await adminClient
        .from('contact_roles')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update role:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete role
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_roles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete role:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // END ROLE - Mark role as ended
  // ==========================================
  endRole: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      endDate: z.string().optional(), // Defaults to now
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_roles')
        .update({
          role_status: 'inactive',
          role_ended_at: input.endDate || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to end role:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Role statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_roles')
        .select('id, role_type, role_status, role_ended_at')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: roles } = await query

      const byType = roles?.reduce((acc, role) => {
        acc[role.role_type] = (acc[role.role_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byStatus = roles?.reduce((acc, role) => {
        acc[role.role_status] = (acc[role.role_status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: roles?.length ?? 0,
        active: roles?.filter(r => r.role_status === 'active' && !r.role_ended_at).length ?? 0,
        byType,
        byStatus,
      }
    }),
})
