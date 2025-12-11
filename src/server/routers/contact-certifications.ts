import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const certificationInput = z.object({
  contactId: z.string().uuid(),
  certificationName: z.string().min(1),
  issuingOrganization: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().default(true),
  credentialId: z.string().optional(),
  verificationUrl: z.string().url().optional().or(z.literal('')),
  renewalRequired: z.boolean().default(false),
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

function transformCertification(cert: Record<string, unknown>) {
  return {
    id: cert.id as string,
    contactId: cert.contact_id as string,
    certificationName: cert.certification_name as string,
    issuingOrganization: cert.issuing_organization as string | null,
    issueDate: cert.issue_date as string | null,
    expiryDate: cert.expiry_date as string | null,
    isActive: cert.is_active as boolean,
    credentialId: cert.credential_id as string | null,
    verificationUrl: cert.verification_url as string | null,
    renewalRequired: cert.renewal_required as boolean,
    renewalReminderSentAt: cert.renewal_reminder_sent_at as string | null,
    createdAt: cert.created_at as string,
    updatedAt: cert.updated_at as string,
    // Joined data
    contact: cert.contact,
  }
}

function isExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

function isExpiringSoon(expiryDate: string | null, daysThreshold: number): boolean {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + daysThreshold)
  return expiry >= new Date() && expiry <= threshold
}

// ============================================
// ROUTER
// ============================================

export const contactCertificationsRouter = router({
  // ==========================================
  // LIST
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      issuingOrganization: z.string().optional(),
      isActive: z.boolean().optional(),
      renewalRequired: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['certification_name', 'issue_date', 'expiry_date', 'created_at']).default('expiry_date'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_certifications')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      if (input.issuingOrganization) {
        query = query.eq('issuing_organization', input.issuingOrganization)
      }

      if (input.isActive !== undefined) {
        query = query.eq('is_active', input.isActive)
      }

      if (input.renewalRequired !== undefined) {
        query = query.eq('renewal_required', input.renewalRequired)
      }

      if (input.search) {
        query = query.or(`certification_name.ilike.%${input.search}%,issuing_organization.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list certifications:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformCertification) ?? [],
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
        .from('contact_certifications')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Certification not found' })
      }

      return transformCertification(data)
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
        .from('contact_certifications')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)
        .order('is_active', { ascending: false })
        .order('expiry_date', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('Failed to get certifications by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformCertification) ?? []
    }),

  // ==========================================
  // GET ACTIVE CERTIFICATIONS
  // ==========================================
  getActiveCertifications: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await adminClient
        .from('contact_certifications')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('is_active', true)
        .or(`expiry_date.is.null,expiry_date.gte.${today}`)
        .is('deleted_at', null)
        .order('certification_name')

      if (error) {
        console.error('Failed to get active certifications:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformCertification) ?? []
    }),

  // ==========================================
  // GET EXPIRING CERTIFICATIONS
  // ==========================================
  getExpiringCertifications: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      daysThreshold: z.number().default(90),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const today = new Date()
      const thresholdDate = new Date()
      thresholdDate.setDate(today.getDate() + input.daysThreshold)

      let query = adminClient
        .from('contact_certifications')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        `)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .not('expiry_date', 'is', null)
        .gte('expiry_date', today.toISOString().split('T')[0])
        .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
        .is('deleted_at', null)
        .order('expiry_date', { ascending: true })

      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get expiring certifications:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformCertification) ?? []
    }),

  // ==========================================
  // CREATE
  // ==========================================
  create: orgProtectedProcedure
    .input(certificationInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Auto-set is_active based on expiry date
      const autoIsActive = input.expiryDate ? !isExpired(input.expiryDate) : input.isActive

      const { data, error } = await adminClient
        .from('contact_certifications')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          certification_name: input.certificationName,
          issuing_organization: input.issuingOrganization,
          issue_date: input.issueDate,
          expiry_date: input.expiryDate,
          is_active: autoIsActive,
          credential_id: input.credentialId,
          verification_url: input.verificationUrl || null,
          renewal_required: input.renewalRequired,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create certification:', error)
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
      certificationName: z.string().min(1).optional(),
      issuingOrganization: z.string().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      isActive: z.boolean().optional(),
      credentialId: z.string().optional(),
      verificationUrl: z.string().url().optional().or(z.literal('')),
      renewalRequired: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.certificationName !== undefined) dbUpdate.certification_name = updateData.certificationName
      if (updateData.issuingOrganization !== undefined) dbUpdate.issuing_organization = updateData.issuingOrganization
      if (updateData.issueDate !== undefined) dbUpdate.issue_date = updateData.issueDate
      if (updateData.expiryDate !== undefined) {
        dbUpdate.expiry_date = updateData.expiryDate
        // Recalculate is_active if expiry date changes
        if (updateData.isActive === undefined) {
          dbUpdate.is_active = !isExpired(updateData.expiryDate)
        }
      }
      if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive
      if (updateData.credentialId !== undefined) dbUpdate.credential_id = updateData.credentialId
      if (updateData.verificationUrl !== undefined) dbUpdate.verification_url = updateData.verificationUrl || null
      if (updateData.renewalRequired !== undefined) dbUpdate.renewal_required = updateData.renewalRequired

      const { error } = await adminClient
        .from('contact_certifications')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update certification:', error)
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
        .from('contact_certifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete certification:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // RENEW - Update dates for renewal
  // ==========================================
  renew: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      issueDate: z.string(),
      expiryDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_certifications')
        .update({
          issue_date: input.issueDate,
          expiry_date: input.expiryDate,
          is_active: true,
          renewal_reminder_sent_at: null, // Reset reminder
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to renew certification:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // SEND RENEWAL REMINDER
  // ==========================================
  sendRenewalReminder: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_certifications')
        .update({
          renewal_reminder_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update renewal reminder:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // CHECK EXPIRATION - Batch update is_active=false for expired
  // ==========================================
  checkExpiration: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await adminClient
        .from('contact_certifications')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .eq('is_active', true)
        .lt('expiry_date', today)
        .is('deleted_at', null)
        .select('id')

      if (error) {
        console.error('Failed to check expiration:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        expiredCount: data?.length ?? 0,
        expiredIds: data?.map(d => d.id) ?? [],
      }
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
        .from('contact_certifications')
        .select('id, is_active, expiry_date, issuing_organization')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: items } = await query

      const byOrganization = items?.reduce((acc, item) => {
        const org = item.issuing_organization || 'Unknown'
        acc[org] = (acc[org] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const expiringSoon = items?.filter(i => isExpiringSoon(i.expiry_date, 90)).length ?? 0

      return {
        total: items?.length ?? 0,
        active: items?.filter(i => i.is_active).length ?? 0,
        expired: items?.filter(i => isExpired(i.expiry_date)).length ?? 0,
        expiringSoon,
        byOrganization,
      }
    }),
})
