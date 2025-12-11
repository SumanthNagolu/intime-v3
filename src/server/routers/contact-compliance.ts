import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const complianceTypeEnum = z.enum([
  // Company compliance types
  'general_liability',
  'workers_comp',
  'e_o', // Errors & Omissions
  'cyber',
  'w9',
  'coi', // Certificate of Insurance
  // Person compliance types
  'background_check',
  'drug_test',
  'i9',
  'w4',
  'direct_deposit'
])

const complianceStatusEnum = z.enum([
  'pending',
  'received',
  'verified',
  'expiring',
  'expired',
  'rejected'
])

const complianceInput = z.object({
  contactId: z.string().uuid(),
  complianceType: complianceTypeEnum,
  status: complianceStatusEnum.default('pending'),
  // Documents
  documentUrl: z.string().url().optional().or(z.literal('')),
  documentReceivedAt: z.string().optional(),
  // Validity
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  // Insurance specifics
  policyNumber: z.string().optional(),
  coverageAmount: z.number().optional(),
  insuranceCarrier: z.string().optional(),
  // Notes
  verificationNotes: z.string().optional(),
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

function transformCompliance(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    contactId: item.contact_id as string,
    complianceType: item.compliance_type as string,
    status: item.status as string,
    documentUrl: item.document_url as string | null,
    documentReceivedAt: item.document_received_at as string | null,
    effectiveDate: item.effective_date as string | null,
    expiryDate: item.expiry_date as string | null,
    verifiedBy: item.verified_by as string | null,
    verifiedAt: item.verified_at as string | null,
    verificationNotes: item.verification_notes as string | null,
    policyNumber: item.policy_number as string | null,
    coverageAmount: item.coverage_amount as number | null,
    insuranceCarrier: item.insurance_carrier as string | null,
    expiryAlertSentAt: item.expiry_alert_sent_at as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined data
    contact: item.contact,
    verifier: item.verifier,
  }
}

// Check if a compliance item is expiring soon (within 30 days)
function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  return expiry <= thirtyDaysFromNow && expiry > new Date()
}

// ============================================
// ROUTER
// ============================================

export const contactComplianceRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      complianceType: complianceTypeEnum.optional(),
      status: complianceStatusEnum.optional(),
      isExpiring: z.boolean().optional(), // Filter items expiring within 30 days
      isExpired: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['compliance_type', 'status', 'expiry_date', 'created_at']).default('expiry_date'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'), // Soonest expiry first by default
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_compliance')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          verifier:user_profiles!verified_by(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by contact
      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      // Filter by compliance type
      if (input.complianceType) {
        query = query.eq('compliance_type', input.complianceType)
      }

      // Filter by status
      if (input.status) {
        query = query.eq('status', input.status)
      }

      // Filter expiring items
      if (input.isExpiring === true) {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        query = query
          .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('expiry_date', new Date().toISOString().split('T')[0])
      }

      // Filter expired items
      if (input.isExpired === true) {
        query = query.lt('expiry_date', new Date().toISOString().split('T')[0])
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list compliance items:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformCompliance) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single compliance item
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_compliance')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          verifier:user_profiles!verified_by(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Compliance item not found' })
      }

      return transformCompliance(data)
    }),

  // ==========================================
  // GET BY CONTACT - All compliance for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_compliance')
        .select(`
          *,
          verifier:user_profiles!verified_by(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)
        .order('expiry_date', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('Failed to get compliance by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformCompliance) ?? []
    }),

  // ==========================================
  // GET EXPIRING - Items expiring soon
  // ==========================================
  getExpiring: orgProtectedProcedure
    .input(z.object({
      daysAhead: z.number().min(1).max(90).default(30),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      const { data, error } = await adminClient
        .from('contact_compliance')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(input.limit)

      if (error) {
        console.error('Failed to get expiring compliance:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformCompliance) ?? []
    }),

  // ==========================================
  // CREATE - Add new compliance item
  // ==========================================
  create: orgProtectedProcedure
    .input(complianceInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_compliance')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          compliance_type: input.complianceType,
          status: input.status,
          document_url: input.documentUrl || null,
          document_received_at: input.documentReceivedAt,
          effective_date: input.effectiveDate,
          expiry_date: input.expiryDate,
          policy_number: input.policyNumber,
          coverage_amount: input.coverageAmount,
          insurance_carrier: input.insuranceCarrier,
          verification_notes: input.verificationNotes,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create compliance item:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing compliance item
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      complianceType: complianceTypeEnum.optional(),
      status: complianceStatusEnum.optional(),
      documentUrl: z.string().url().optional().or(z.literal('')),
      documentReceivedAt: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      policyNumber: z.string().optional(),
      coverageAmount: z.number().optional(),
      insuranceCarrier: z.string().optional(),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.complianceType !== undefined) dbUpdate.compliance_type = updateData.complianceType
      if (updateData.status !== undefined) dbUpdate.status = updateData.status
      if (updateData.documentUrl !== undefined) dbUpdate.document_url = updateData.documentUrl || null
      if (updateData.documentReceivedAt !== undefined) dbUpdate.document_received_at = updateData.documentReceivedAt
      if (updateData.effectiveDate !== undefined) dbUpdate.effective_date = updateData.effectiveDate
      if (updateData.expiryDate !== undefined) dbUpdate.expiry_date = updateData.expiryDate
      if (updateData.policyNumber !== undefined) dbUpdate.policy_number = updateData.policyNumber
      if (updateData.coverageAmount !== undefined) dbUpdate.coverage_amount = updateData.coverageAmount
      if (updateData.insuranceCarrier !== undefined) dbUpdate.insurance_carrier = updateData.insuranceCarrier
      if (updateData.verificationNotes !== undefined) dbUpdate.verification_notes = updateData.verificationNotes

      const { error } = await adminClient
        .from('contact_compliance')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update compliance item:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete compliance item
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_compliance')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete compliance item:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // VERIFY - Mark compliance item as verified
  // ==========================================
  verify: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_compliance')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_notes: input.verificationNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to verify compliance item:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // REJECT - Mark compliance item as rejected
  // ==========================================
  reject: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_compliance')
        .update({
          status: 'rejected',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_notes: input.reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to reject compliance item:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Compliance statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_compliance')
        .select('id, compliance_type, status, expiry_date')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: items } = await query

      const byType = items?.reduce((acc, item) => {
        acc[item.compliance_type] = (acc[item.compliance_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byStatus = items?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      return {
        total: items?.length ?? 0,
        pending: byStatus['pending'] ?? 0,
        verified: byStatus['verified'] ?? 0,
        expired: items?.filter(i => i.expiry_date && new Date(i.expiry_date) < now).length ?? 0,
        expiringSoon: items?.filter(i => isExpiringSoon(i.expiry_date)).length ?? 0,
        byType,
        byStatus,
      }
    }),
})
