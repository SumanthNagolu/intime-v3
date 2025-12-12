/**
 * @deprecated LEGACY ROUTER - DO NOT USE FOR NEW DEVELOPMENT
 *
 * This router is deprecated and will be removed in a future version.
 * Use the unified contracts router instead: `src/server/routers/contracts.ts`
 *
 * Migration guide:
 * - contactAgreements.list        -> contracts.list (with entity_type='contact')
 * - contactAgreements.getById     -> contracts.getById
 * - contactAgreements.getByContact -> contracts.list (with entityId filter)
 * - contactAgreements.getActiveMsa -> contracts.getActiveByType (with contractType='msa')
 * - contactAgreements.create      -> contracts.create (with entity_type='contact')
 * - contactAgreements.update      -> contracts.update
 * - contactAgreements.delete      -> contracts.delete
 * - contactAgreements.activate    -> contracts.activate
 * - contactAgreements.terminate   -> contracts.terminate
 * - contactAgreements.stats       -> contracts.getStats
 *
 * Database migration: Legacy views are available at contact_agreements_legacy
 * that map to the new contracts table.
 *
 * @see src/server/routers/contracts.ts
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// @deprecated - Use contracts.ts instead
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const agreementTypeEnum = z.enum([
  'msa', // Master Service Agreement
  'nda', // Non-Disclosure Agreement
  'sow', // Statement of Work
  'rate_card',
  'sla', // Service Level Agreement
  'vendor_agreement',
  'other'
])

const agreementStatusEnum = z.enum([
  'draft',
  'pending', // Sent for signature
  'active',
  'expired',
  'terminated'
])

const agreementInput = z.object({
  contactId: z.string().uuid(),
  agreementType: agreementTypeEnum,
  agreementName: z.string().optional(),
  // Dates
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  autoRenew: z.boolean().default(false),
  renewalNoticeDays: z.number().default(30),
  // Status
  status: agreementStatusEnum.default('draft'),
  // Documents
  documentUrl: z.string().url().optional().or(z.literal('')),
  signedDocumentUrl: z.string().url().optional().or(z.literal('')),
  // Signatories
  ourSignerId: z.string().uuid().optional(),
  ourSignedAt: z.string().optional(),
  theirSignerName: z.string().optional(),
  theirSignedAt: z.string().optional(),
  // Terms (flexible JSON storage)
  terms: z.record(z.unknown()).optional(),
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

function transformAgreement(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    contactId: item.contact_id as string,
    agreementType: item.agreement_type as string,
    agreementName: item.agreement_name as string | null,
    effectiveDate: item.effective_date as string | null,
    expiryDate: item.expiry_date as string | null,
    autoRenew: item.auto_renew as boolean,
    renewalNoticeDays: item.renewal_notice_days as number,
    status: item.status as string,
    documentUrl: item.document_url as string | null,
    signedDocumentUrl: item.signed_document_url as string | null,
    ourSignerId: item.our_signer_id as string | null,
    ourSignedAt: item.our_signed_at as string | null,
    theirSignerName: item.their_signer_name as string | null,
    theirSignedAt: item.their_signed_at as string | null,
    terms: item.terms as Record<string, unknown> | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined data
    contact: item.contact,
    ourSigner: item.our_signer,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactAgreementsRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      agreementType: agreementTypeEnum.optional(),
      status: agreementStatusEnum.optional(),
      isExpiring: z.boolean().optional(), // Expiring within 30 days
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['agreement_type', 'status', 'expiry_date', 'created_at']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_agreements')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          our_signer:user_profiles!our_signer_id(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by contact
      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      // Filter by agreement type
      if (input.agreementType) {
        query = query.eq('agreement_type', input.agreementType)
      }

      // Filter by status
      if (input.status) {
        query = query.eq('status', input.status)
      }

      // Filter expiring agreements
      if (input.isExpiring === true) {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        query = query
          .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('expiry_date', new Date().toISOString().split('T')[0])
          .eq('status', 'active')
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list agreements:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformAgreement) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single agreement
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_agreements')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype, category),
          our_signer:user_profiles!our_signer_id(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agreement not found' })
      }

      return transformAgreement(data)
    }),

  // ==========================================
  // GET BY CONTACT - All agreements for a contact
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
        .from('contact_agreements')
        .select(`
          *,
          our_signer:user_profiles!our_signer_id(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)

      if (input.activeOnly) {
        query = query.eq('status', 'active')
      }

      query = query.order('effective_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get agreements by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformAgreement) ?? []
    }),

  // ==========================================
  // GET ACTIVE MSA - Get active MSA for a contact
  // ==========================================
  getActiveMsa: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_agreements')
        .select(`
          *,
          our_signer:user_profiles!our_signer_id(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('agreement_type', 'msa')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Failed to get active MSA:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformAgreement(data) : null
    }),

  // ==========================================
  // CREATE - Add new agreement
  // ==========================================
  create: orgProtectedProcedure
    .input(agreementInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_agreements')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          agreement_type: input.agreementType,
          agreement_name: input.agreementName,
          effective_date: input.effectiveDate,
          expiry_date: input.expiryDate,
          auto_renew: input.autoRenew,
          renewal_notice_days: input.renewalNoticeDays,
          status: input.status,
          document_url: input.documentUrl || null,
          signed_document_url: input.signedDocumentUrl || null,
          our_signer_id: input.ourSignerId,
          our_signed_at: input.ourSignedAt,
          their_signer_name: input.theirSignerName,
          their_signed_at: input.theirSignedAt,
          terms: input.terms || {},
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create agreement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing agreement
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      agreementType: agreementTypeEnum.optional(),
      agreementName: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      autoRenew: z.boolean().optional(),
      renewalNoticeDays: z.number().optional(),
      status: agreementStatusEnum.optional(),
      documentUrl: z.string().url().optional().or(z.literal('')),
      signedDocumentUrl: z.string().url().optional().or(z.literal('')),
      ourSignerId: z.string().uuid().optional(),
      ourSignedAt: z.string().optional(),
      theirSignerName: z.string().optional(),
      theirSignedAt: z.string().optional(),
      terms: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.agreementType !== undefined) dbUpdate.agreement_type = updateData.agreementType
      if (updateData.agreementName !== undefined) dbUpdate.agreement_name = updateData.agreementName
      if (updateData.effectiveDate !== undefined) dbUpdate.effective_date = updateData.effectiveDate
      if (updateData.expiryDate !== undefined) dbUpdate.expiry_date = updateData.expiryDate
      if (updateData.autoRenew !== undefined) dbUpdate.auto_renew = updateData.autoRenew
      if (updateData.renewalNoticeDays !== undefined) dbUpdate.renewal_notice_days = updateData.renewalNoticeDays
      if (updateData.status !== undefined) dbUpdate.status = updateData.status
      if (updateData.documentUrl !== undefined) dbUpdate.document_url = updateData.documentUrl || null
      if (updateData.signedDocumentUrl !== undefined) dbUpdate.signed_document_url = updateData.signedDocumentUrl || null
      if (updateData.ourSignerId !== undefined) dbUpdate.our_signer_id = updateData.ourSignerId
      if (updateData.ourSignedAt !== undefined) dbUpdate.our_signed_at = updateData.ourSignedAt
      if (updateData.theirSignerName !== undefined) dbUpdate.their_signer_name = updateData.theirSignerName
      if (updateData.theirSignedAt !== undefined) dbUpdate.their_signed_at = updateData.theirSignedAt
      if (updateData.terms !== undefined) dbUpdate.terms = updateData.terms

      const { error } = await adminClient
        .from('contact_agreements')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update agreement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete agreement
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_agreements')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete agreement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // ACTIVATE - Move agreement to active status
  // ==========================================
  activate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      effectiveDate: z.string().optional(), // Defaults to today
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_agreements')
        .update({
          status: 'active',
          effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to activate agreement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // TERMINATE - End agreement early
  // ==========================================
  terminate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      terminationDate: z.string().optional(), // Defaults to today
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get current terms
      const { data: current } = await adminClient
        .from('contact_agreements')
        .select('terms')
        .eq('id', input.id)
        .single()

      const terms = (current?.terms as Record<string, unknown>) || {}
      terms.terminationReason = input.reason
      terms.terminatedAt = new Date().toISOString()

      const { error } = await adminClient
        .from('contact_agreements')
        .update({
          status: 'terminated',
          expiry_date: input.terminationDate || new Date().toISOString().split('T')[0],
          terms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to terminate agreement:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Agreement statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_agreements')
        .select('id, agreement_type, status, expiry_date, auto_renew')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: items } = await query

      const byType = items?.reduce((acc, item) => {
        acc[item.agreement_type] = (acc[item.agreement_type] || 0) + 1
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
        active: byStatus['active'] ?? 0,
        pending: byStatus['pending'] ?? 0,
        expired: byStatus['expired'] ?? 0,
        expiringSoon: items?.filter(i =>
          i.status === 'active' &&
          i.expiry_date &&
          new Date(i.expiry_date) <= thirtyDaysFromNow &&
          new Date(i.expiry_date) > now
        ).length ?? 0,
        autoRenewing: items?.filter(i => i.auto_renew).length ?? 0,
        byType,
        byStatus,
      }
    }),
})
