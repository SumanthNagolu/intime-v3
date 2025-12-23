import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// CONTRACTS-01: Unified Contract Management Router
// Polymorphic contracts system for any entity type
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const contractStatusEnum = z.enum([
  'draft', 'pending_review', 'pending_signature', 'partially_signed',
  'active', 'expired', 'terminated', 'renewed', 'superseded'
])

const contractTypeEnum = z.enum([
  'msa', 'nda', 'sow', 'amendment', 'addendum', 'rate_card_agreement',
  'sla', 'vendor_agreement', 'employment', 'contractor', 'subcontractor', 'other'
])

const versionTypeEnum = z.enum([
  'original', 'amendment', 'renewal', 'addendum'
])

const partyTypeEnum = z.enum([
  'company', 'individual', 'internal'
])

const partyRoleEnum = z.enum([
  'client', 'vendor', 'consultant', 'guarantor', 'witness'
])

const clauseCategoryEnum = z.enum([
  'liability', 'termination', 'confidentiality', 'ip', 'payment',
  'indemnification', 'warranty', 'dispute', 'general', 'other'
])

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformContract(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    entityType: item.entity_type as string,
    entityId: item.entity_id as string,
    secondaryEntityType: item.secondary_entity_type as string | null,
    secondaryEntityId: item.secondary_entity_id as string | null,
    contractNumber: item.contract_number as string | null,
    contractName: item.contract_name as string,
    contractType: item.contract_type as string,
    category: item.category as string | null,
    parentContractId: item.parent_contract_id as string | null,
    status: item.status as string,
    effectiveDate: item.effective_date as string | null,
    expiryDate: item.expiry_date as string | null,
    terminationDate: item.termination_date as string | null,
    autoRenew: item.auto_renew as boolean,
    renewalTermMonths: item.renewal_term_months as number | null,
    renewalNoticeDays: item.renewal_notice_days as number,
    maxRenewals: item.max_renewals as number | null,
    renewalsCount: item.renewals_count as number,
    contractValue: item.contract_value ? Number(item.contract_value) : null,
    currency: item.currency as string,
    terms: item.terms as Record<string, unknown> | null,
    documentId: item.document_id as string | null,
    documentUrl: item.document_url as string | null,
    signedDocumentId: item.signed_document_id as string | null,
    signedDocumentUrl: item.signed_document_url as string | null,
    templateId: item.template_id as string | null,
    version: item.version as number,
    isLatestVersion: item.is_latest_version as boolean,
    previousVersionId: item.previous_version_id as string | null,
    esignProvider: item.esign_provider as string | null,
    esignEnvelopeId: item.esign_envelope_id as string | null,
    esignStatus: item.esign_status as string | null,
    terminationReason: item.termination_reason as string | null,
    terminatedBy: item.terminated_by as string | null,
    contextJobId: item.context_job_id as string | null,
    contextPlacementId: item.context_placement_id as string | null,
    ownerId: item.owner_id as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    owner: item.owner,
    parentContract: item.parent_contract,
    template: item.template,
  }
}

function transformVersion(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    contractId: item.contract_id as string,
    versionNumber: item.version_number as number,
    versionType: item.version_type as string,
    versionName: item.version_name as string | null,
    changeSummary: item.change_summary as string | null,
    changesJson: item.changes_json as Record<string, unknown> | null,
    effectiveDate: item.effective_date as string | null,
    expiryDate: item.expiry_date as string | null,
    contractValue: item.contract_value ? Number(item.contract_value) : null,
    termsSnapshot: item.terms_snapshot as Record<string, unknown> | null,
    documentId: item.document_id as string | null,
    documentUrl: item.document_url as string | null,
    approvedBy: item.approved_by as string | null,
    approvedAt: item.approved_at as string | null,
    createdAt: item.created_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    approver: item.approver,
  }
}

function transformParty(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    contractId: item.contract_id as string,
    partyType: item.party_type as string,
    partyRole: item.party_role as string,
    userId: item.user_id as string | null,
    contactId: item.contact_id as string | null,
    companyId: item.company_id as string | null,
    partyName: item.party_name as string | null,
    partyEmail: item.party_email as string | null,
    partyTitle: item.party_title as string | null,
    partyCompany: item.party_company as string | null,
    signatoryStatus: item.signatory_status as string,
    signatureRequestedAt: item.signature_requested_at as string | null,
    signedAt: item.signed_at as string | null,
    signatureIp: item.signature_ip as string | null,
    declinedReason: item.declined_reason as string | null,
    esignRecipientId: item.esign_recipient_id as string | null,
    signingOrder: item.signing_order as number,
    isRequired: item.is_required as boolean,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined relations
    user: item.user,
    contact: item.contact,
    company: item.company,
  }
}

function transformTemplate(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    templateName: item.template_name as string,
    templateCode: item.template_code as string | null,
    contractType: item.contract_type as string,
    description: item.description as string | null,
    templateContent: item.template_content as string | null,
    templateDocumentId: item.template_document_id as string | null,
    availableVariables: item.available_variables as Record<string, unknown>[] | null,
    defaultClauses: item.default_clauses as string[] | null,
    defaultTerms: item.default_terms as Record<string, unknown> | null,
    defaultRenewalMonths: item.default_renewal_months as number | null,
    defaultNoticeDays: item.default_notice_days as number | null,
    isActive: item.is_active as boolean,
    usageCount: item.usage_count as number,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
  }
}

function transformClause(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    clauseName: item.clause_name as string,
    clauseCode: item.clause_code as string | null,
    category: item.category as string | null,
    clauseText: item.clause_text as string,
    clauseVersion: item.clause_version as number,
    legalApproved: item.legal_approved as boolean,
    legalApprovedBy: item.legal_approved_by as string | null,
    legalApprovedAt: item.legal_approved_at as string | null,
    isStandard: item.is_standard as boolean,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    approver: item.approver,
  }
}

// ============================================
// ROUTER
// ============================================

export const contractsRouter = router({
  // ==========================================
  // CONTRACTS - Main contract operations
  // ==========================================

  // List contracts with filters
  list: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      contractType: contractTypeEnum.optional(),
      status: contractStatusEnum.optional(),
      category: z.string().optional(),
      parentContractId: z.string().uuid().optional(),
      isExpiring: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['contract_name', 'contract_type', 'status', 'effective_date', 'expiry_date', 'created_at']).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contracts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name),
          parent_contract:contracts!parent_contract_id(id, contract_name, contract_type)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.entityType) query = query.eq('entity_type', input.entityType)
      if (input.entityId) query = query.eq('entity_id', input.entityId)
      if (input.contractType) query = query.eq('contract_type', input.contractType)
      if (input.status) query = query.eq('status', input.status)
      if (input.category) query = query.eq('category', input.category)
      if (input.parentContractId) query = query.eq('parent_contract_id', input.parentContractId)

      if (input.search) {
        query = query.or(`contract_name.ilike.%${input.search}%,contract_number.ilike.%${input.search}%`)
      }

      if (input.isExpiring === true) {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        query = query
          .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
          .gte('expiry_date', new Date().toISOString().split('T')[0])
          .eq('status', 'active')
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list contracts:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformContract) ?? [],
        total: count ?? 0,
      }
    }),

  // Get single contract
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contracts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name),
          parent_contract:contracts!parent_contract_id(id, contract_name, contract_type),
          template:contract_templates!template_id(id, template_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
      }

      return transformContract(data)
    }),

  // List contracts by entity
  listByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      activeOnly: z.boolean().default(false),
      latestVersionOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contracts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)

      if (input.activeOnly) {
        query = query.eq('status', 'active')
      }

      if (input.latestVersionOnly) {
        query = query.eq('is_latest_version', true)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to list contracts by entity:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformContract) ?? []
    }),

  // Create contract
  create: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      secondaryEntityType: z.string().optional(),
      secondaryEntityId: z.string().uuid().optional(),
      contractNumber: z.string().max(50).optional(),
      contractName: z.string().min(1).max(300),
      contractType: contractTypeEnum,
      category: z.string().max(50).optional(),
      parentContractId: z.string().uuid().optional(),
      status: contractStatusEnum.default('draft'),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      autoRenew: z.boolean().default(false),
      renewalTermMonths: z.number().int().positive().optional(),
      renewalNoticeDays: z.number().int().min(0).default(30),
      maxRenewals: z.number().int().positive().optional(),
      contractValue: z.number().optional(),
      currency: z.string().length(3).default('USD'),
      terms: z.record(z.unknown()).optional(),
      documentId: z.string().uuid().optional(),
      documentUrl: z.string().url().optional().or(z.literal('')),
      templateId: z.string().uuid().optional(),
      esignProvider: z.string().max(50).optional(),
      contextJobId: z.string().uuid().optional(),
      contextPlacementId: z.string().uuid().optional(),
      ownerId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contracts')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          secondary_entity_type: input.secondaryEntityType,
          secondary_entity_id: input.secondaryEntityId,
          contract_number: input.contractNumber,
          contract_name: input.contractName,
          contract_type: input.contractType,
          category: input.category,
          parent_contract_id: input.parentContractId,
          status: input.status,
          effective_date: input.effectiveDate,
          expiry_date: input.expiryDate,
          auto_renew: input.autoRenew,
          renewal_term_months: input.renewalTermMonths,
          renewal_notice_days: input.renewalNoticeDays,
          max_renewals: input.maxRenewals,
          contract_value: input.contractValue,
          currency: input.currency,
          terms: input.terms || {},
          document_id: input.documentId,
          document_url: input.documentUrl || null,
          template_id: input.templateId,
          esign_provider: input.esignProvider,
          context_job_id: input.contextJobId,
          context_placement_id: input.contextPlacementId,
          owner_id: input.ownerId || user?.id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Contract number already exists' })
        }
        console.error('Failed to create contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create initial version record
      await adminClient
        .from('contract_versions')
        .insert({
          contract_id: data.id,
          version_number: 1,
          version_type: 'original',
          version_name: 'Original Contract',
          effective_date: input.effectiveDate,
          expiry_date: input.expiryDate,
          contract_value: input.contractValue,
          terms_snapshot: input.terms || {},
          document_id: input.documentId,
          document_url: input.documentUrl || null,
          created_by: user?.id,
        })

      return { id: data.id }
    }),

  // Update contract
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      contractName: z.string().min(1).max(300).optional(),
      category: z.string().max(50).optional(),
      status: contractStatusEnum.optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      autoRenew: z.boolean().optional(),
      renewalTermMonths: z.number().int().positive().optional(),
      renewalNoticeDays: z.number().int().min(0).optional(),
      maxRenewals: z.number().int().positive().optional(),
      contractValue: z.number().optional(),
      currency: z.string().length(3).optional(),
      terms: z.record(z.unknown()).optional(),
      documentId: z.string().uuid().optional(),
      documentUrl: z.string().url().optional().or(z.literal('')),
      signedDocumentId: z.string().uuid().optional(),
      signedDocumentUrl: z.string().url().optional().or(z.literal('')),
      esignProvider: z.string().max(50).optional(),
      esignEnvelopeId: z.string().max(200).optional(),
      esignStatus: z.string().max(50).optional(),
      ownerId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.contractName !== undefined) dbUpdate.contract_name = updateData.contractName
      if (updateData.category !== undefined) dbUpdate.category = updateData.category
      if (updateData.status !== undefined) dbUpdate.status = updateData.status
      if (updateData.effectiveDate !== undefined) dbUpdate.effective_date = updateData.effectiveDate
      if (updateData.expiryDate !== undefined) dbUpdate.expiry_date = updateData.expiryDate
      if (updateData.autoRenew !== undefined) dbUpdate.auto_renew = updateData.autoRenew
      if (updateData.renewalTermMonths !== undefined) dbUpdate.renewal_term_months = updateData.renewalTermMonths
      if (updateData.renewalNoticeDays !== undefined) dbUpdate.renewal_notice_days = updateData.renewalNoticeDays
      if (updateData.maxRenewals !== undefined) dbUpdate.max_renewals = updateData.maxRenewals
      if (updateData.contractValue !== undefined) dbUpdate.contract_value = updateData.contractValue
      if (updateData.currency !== undefined) dbUpdate.currency = updateData.currency
      if (updateData.terms !== undefined) dbUpdate.terms = updateData.terms
      if (updateData.documentId !== undefined) dbUpdate.document_id = updateData.documentId
      if (updateData.documentUrl !== undefined) dbUpdate.document_url = updateData.documentUrl || null
      if (updateData.signedDocumentId !== undefined) dbUpdate.signed_document_id = updateData.signedDocumentId
      if (updateData.signedDocumentUrl !== undefined) dbUpdate.signed_document_url = updateData.signedDocumentUrl || null
      if (updateData.esignProvider !== undefined) dbUpdate.esign_provider = updateData.esignProvider
      if (updateData.esignEnvelopeId !== undefined) dbUpdate.esign_envelope_id = updateData.esignEnvelopeId
      if (updateData.esignStatus !== undefined) dbUpdate.esign_status = updateData.esignStatus
      if (updateData.ownerId !== undefined) dbUpdate.owner_id = updateData.ownerId

      const { error } = await adminClient
        .from('contracts')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Delete contract (soft delete)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contracts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Activate contract
  activate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      effectiveDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contracts')
        .update({
          status: 'active',
          effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to activate contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Terminate contract
  terminate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      terminationDate: z.string().optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contracts')
        .update({
          status: 'terminated',
          termination_date: input.terminationDate || new Date().toISOString().split('T')[0],
          termination_reason: input.reason,
          terminated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to terminate contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Renew contract
  renew: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newEffectiveDate: z.string(),
      newExpiryDate: z.string().optional(),
      newContractValue: z.number().optional(),
      newTerms: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current contract
      const { data: current, error: fetchError } = await adminClient
        .from('contracts')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
      }

      // Check renewal limits
      if (current.max_renewals && current.renewals_count >= current.max_renewals) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Maximum renewals reached' })
      }

      // Calculate new expiry date if not provided
      let newExpiryDate = input.newExpiryDate
      if (!newExpiryDate && current.renewal_term_months) {
        const date = new Date(input.newEffectiveDate)
        date.setMonth(date.getMonth() + current.renewal_term_months)
        newExpiryDate = date.toISOString().split('T')[0]
      }

      // Mark current contract as renewed
      await adminClient
        .from('contracts')
        .update({
          status: 'renewed',
          is_latest_version: false,
          renewals_count: current.renewals_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)

      // Create new version
      const { data: newContract, error: createError } = await adminClient
        .from('contracts')
        .insert({
          org_id: orgId,
          entity_type: current.entity_type,
          entity_id: current.entity_id,
          secondary_entity_type: current.secondary_entity_type,
          secondary_entity_id: current.secondary_entity_id,
          contract_number: current.contract_number,
          contract_name: current.contract_name,
          contract_type: current.contract_type,
          category: current.category,
          parent_contract_id: current.parent_contract_id,
          status: 'active',
          effective_date: input.newEffectiveDate,
          expiry_date: newExpiryDate,
          auto_renew: current.auto_renew,
          renewal_term_months: current.renewal_term_months,
          renewal_notice_days: current.renewal_notice_days,
          max_renewals: current.max_renewals,
          renewals_count: 0,
          contract_value: input.newContractValue ?? current.contract_value,
          currency: current.currency,
          terms: input.newTerms ?? current.terms,
          document_id: current.document_id,
          document_url: current.document_url,
          template_id: current.template_id,
          version: current.version + 1,
          is_latest_version: true,
          previous_version_id: current.id,
          owner_id: current.owner_id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create renewed contract:', createError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message })
      }

      // Create version record
      await adminClient
        .from('contract_versions')
        .insert({
          contract_id: newContract.id,
          version_number: newContract.version,
          version_type: 'renewal',
          version_name: `Renewal ${current.renewals_count + 1}`,
          change_summary: 'Contract renewed',
          effective_date: input.newEffectiveDate,
          expiry_date: newExpiryDate,
          contract_value: input.newContractValue ?? current.contract_value,
          terms_snapshot: input.newTerms ?? current.terms,
          created_by: user?.id,
        })

      return { id: newContract.id, previousId: current.id }
    }),

  // Get active contract by type
  getActiveByType: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      contractType: contractTypeEnum,
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Set org_id for the function
      await adminClient.rpc('set_config', {
        setting: 'app.org_id',
        value: orgId,
      })

      const { data, error } = await adminClient
        .rpc('get_active_contract', {
          p_entity_type: input.entityType,
          p_entity_id: input.entityId,
          p_contract_type: input.contractType,
        })

      if (error) {
        console.error('Failed to get active contract:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      if (!data) {
        return null
      }

      // Fetch full contract details
      const { data: contract } = await adminClient
        .from('contracts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name)
        `)
        .eq('id', data)
        .single()

      return contract ? transformContract(contract) : null
    }),

  // Get expiring contracts
  getExpiring: orgProtectedProcedure
    .input(z.object({
      daysAhead: z.number().min(1).max(90).default(30),
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      let query = adminClient
        .from('contracts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .eq('status', 'active')
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(input.limit)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get expiring contracts:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformContract) ?? []
    }),

  // Check signatures status
  checkSignatures: orgProtectedProcedure
    .input(z.object({ contractId: z.string().uuid() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('check_contract_signatures', {
          p_contract_id: input.contractId,
        })

      if (error) {
        console.error('Failed to check signatures:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const result = data?.[0] ?? {
        all_signed: false,
        total_parties: 0,
        signed_count: 0,
        pending_count: 0,
      }

      return {
        allSigned: result.all_signed as boolean,
        totalParties: result.total_parties as number,
        signedCount: result.signed_count as number,
        pendingCount: result.pending_count as number,
      }
    }),

  // Contract statistics
  stats: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contracts')
        .select('id, contract_type, status, expiry_date, auto_renew, contract_value')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.entityType) {
        query = query.eq('entity_type', input.entityType)
      }
      if (input?.entityId) {
        query = query.eq('entity_id', input.entityId)
      }

      const { data: items } = await query

      const byType = items?.reduce((acc, item) => {
        acc[item.contract_type] = (acc[item.contract_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byStatus = items?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const totalValue = items?.reduce((sum, item) =>
        sum + (item.contract_value ? Number(item.contract_value) : 0), 0) || 0

      return {
        total: items?.length ?? 0,
        active: byStatus['active'] ?? 0,
        draft: byStatus['draft'] ?? 0,
        pendingSignature: (byStatus['pending_signature'] ?? 0) + (byStatus['partially_signed'] ?? 0),
        expired: byStatus['expired'] ?? 0,
        terminated: byStatus['terminated'] ?? 0,
        expiringSoon: items?.filter(i =>
          i.status === 'active' &&
          i.expiry_date &&
          new Date(i.expiry_date) <= thirtyDaysFromNow &&
          new Date(i.expiry_date) > now
        ).length ?? 0,
        autoRenewing: items?.filter(i => i.auto_renew).length ?? 0,
        totalValue,
        byType,
        byStatus,
      }
    }),

  // ==========================================
  // VERSIONS - Contract version management
  // ==========================================
  versions: router({
    // List versions for a contract
    list: orgProtectedProcedure
      .input(z.object({
        contractId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // First verify contract belongs to org
        const { data: contract } = await adminClient
          .from('contracts')
          .select('id')
          .eq('id', input.contractId)
          .eq('org_id', orgId)
          .single()

        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
        }

        const { data, error } = await adminClient
          .from('contract_versions')
          .select(`
            *,
            approver:user_profiles!approved_by(id, full_name)
          `)
          .eq('contract_id', input.contractId)
          .order('version_number', { ascending: false })

        if (error) {
          console.error('Failed to list versions:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformVersion) ?? []
      }),

    // Create new version (amendment/addendum)
    create: orgProtectedProcedure
      .input(z.object({
        contractId: z.string().uuid(),
        versionType: versionTypeEnum,
        versionName: z.string().max(200).optional(),
        changeSummary: z.string().optional(),
        changesJson: z.record(z.unknown()).optional(),
        effectiveDate: z.string().optional(),
        expiryDate: z.string().optional(),
        contractValue: z.number().optional(),
        termsSnapshot: z.record(z.unknown()).optional(),
        documentId: z.string().uuid().optional(),
        documentUrl: z.string().url().optional().or(z.literal('')),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get current contract and latest version
        const { data: contract } = await adminClient
          .from('contracts')
          .select('id, version, org_id')
          .eq('id', input.contractId)
          .eq('org_id', orgId)
          .single()

        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
        }

        const { data: latestVersion } = await adminClient
          .from('contract_versions')
          .select('version_number')
          .eq('contract_id', input.contractId)
          .order('version_number', { ascending: false })
          .limit(1)
          .single()

        const newVersionNumber = (latestVersion?.version_number ?? 0) + 1

        // Create version record
        const { data, error } = await adminClient
          .from('contract_versions')
          .insert({
            contract_id: input.contractId,
            version_number: newVersionNumber,
            version_type: input.versionType,
            version_name: input.versionName,
            change_summary: input.changeSummary,
            changes_json: input.changesJson,
            effective_date: input.effectiveDate,
            expiry_date: input.expiryDate,
            contract_value: input.contractValue,
            terms_snapshot: input.termsSnapshot,
            document_id: input.documentId,
            document_url: input.documentUrl || null,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create version:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update contract version number
        await adminClient
          .from('contracts')
          .update({
            version: newVersionNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.contractId)

        return { id: data.id, versionNumber: newVersionNumber }
      }),

    // Approve version
    approve: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify version belongs to org's contract
        const { data: version } = await adminClient
          .from('contract_versions')
          .select('contract_id')
          .eq('id', input.id)
          .single()

        if (!version) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Version not found' })
        }

        const { data: contract } = await adminClient
          .from('contracts')
          .select('id')
          .eq('id', version.contract_id)
          .eq('org_id', orgId)
          .single()

        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
        }

        const { error } = await adminClient
          .from('contract_versions')
          .update({
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', input.id)

        if (error) {
          console.error('Failed to approve version:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // PARTIES - Multi-party signatory management
  // ==========================================
  parties: router({
    // List parties for a contract
    list: orgProtectedProcedure
      .input(z.object({
        contractId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contract_parties')
          .select(`
            *,
            user:user_profiles!user_id(id, full_name, email),
            contact:contacts!contact_id(id, first_name, last_name, email, company_name),
            company:companies!contract_parties_company_id_fkey(id, legal_name)
          `)
          .eq('org_id', orgId)
          .eq('contract_id', input.contractId)
          .order('signing_order', { ascending: true })

        if (error) {
          console.error('Failed to list parties:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformParty) ?? []
      }),

    // Add party to contract
    add: orgProtectedProcedure
      .input(z.object({
        contractId: z.string().uuid(),
        partyType: partyTypeEnum,
        partyRole: partyRoleEnum,
        userId: z.string().uuid().optional(),
        contactId: z.string().uuid().optional(),
        companyId: z.string().uuid().optional(),
        partyName: z.string().max(200).optional(),
        partyEmail: z.string().email().optional(),
        partyTitle: z.string().max(100).optional(),
        partyCompany: z.string().max(200).optional(),
        signingOrder: z.number().int().min(1).default(1),
        isRequired: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify contract belongs to org
        const { data: contract } = await adminClient
          .from('contracts')
          .select('id')
          .eq('id', input.contractId)
          .eq('org_id', orgId)
          .single()

        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
        }

        const { data, error } = await adminClient
          .from('contract_parties')
          .insert({
            org_id: orgId,
            contract_id: input.contractId,
            party_type: input.partyType,
            party_role: input.partyRole,
            user_id: input.userId,
            contact_id: input.contactId,
            company_id: input.companyId,
            party_name: input.partyName,
            party_email: input.partyEmail,
            party_title: input.partyTitle,
            party_company: input.partyCompany,
            signing_order: input.signingOrder,
            is_required: input.isRequired,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to add party:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update party
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        partyName: z.string().max(200).optional(),
        partyEmail: z.string().email().optional(),
        partyTitle: z.string().max(100).optional(),
        partyCompany: z.string().max(200).optional(),
        signingOrder: z.number().int().min(1).optional(),
        isRequired: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.partyName !== undefined) dbUpdate.party_name = updateData.partyName
        if (updateData.partyEmail !== undefined) dbUpdate.party_email = updateData.partyEmail
        if (updateData.partyTitle !== undefined) dbUpdate.party_title = updateData.partyTitle
        if (updateData.partyCompany !== undefined) dbUpdate.party_company = updateData.partyCompany
        if (updateData.signingOrder !== undefined) dbUpdate.signing_order = updateData.signingOrder
        if (updateData.isRequired !== undefined) dbUpdate.is_required = updateData.isRequired

        const { error } = await adminClient
          .from('contract_parties')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update party:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Remove party
    remove: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_parties')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to remove party:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Record signature
    sign: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        signatureIp: z.string().max(45).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_parties')
          .update({
            signatory_status: 'signed',
            signed_at: new Date().toISOString(),
            signature_ip: input.signatureIp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to record signature:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Check if all parties have signed and update contract status if so
        const { data: party } = await adminClient
          .from('contract_parties')
          .select('contract_id')
          .eq('id', input.id)
          .single()

        if (party) {
          const { data: sigStatus } = await adminClient
            .rpc('check_contract_signatures', { p_contract_id: party.contract_id })

          if (sigStatus?.[0]?.all_signed) {
            await adminClient
              .from('contracts')
              .update({
                status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', party.contract_id)
          } else {
            // Update to partially_signed if not all signed yet
            await adminClient
              .from('contracts')
              .update({
                status: 'partially_signed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', party.contract_id)
              .in('status', ['pending_signature'])
          }
        }

        return { success: true }
      }),

    // Record declined signature
    decline: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_parties')
          .update({
            signatory_status: 'declined',
            declined_reason: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to record declined signature:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Request signature
    requestSignature: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        esignRecipientId: z.string().max(200).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_parties')
          .update({
            signature_requested_at: new Date().toISOString(),
            esign_recipient_id: input.esignRecipientId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to request signature:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // TEMPLATES - Contract templates
  // ==========================================
  templates: router({
    // List templates
    list: orgProtectedProcedure
      .input(z.object({
        contractType: contractTypeEnum.optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contract_templates')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.contractType) query = query.eq('contract_type', input.contractType)
        if (input.isActive !== undefined) query = query.eq('is_active', input.isActive)
        if (input.search) {
          query = query.or(`template_name.ilike.%${input.search}%,template_code.ilike.%${input.search}%`)
        }

        query = query
          .order('template_name')
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list templates:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformTemplate) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single template
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contract_templates')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
        }

        return transformTemplate(data)
      }),

    // Create template
    create: orgProtectedProcedure
      .input(z.object({
        templateName: z.string().min(1).max(200),
        templateCode: z.string().max(50).optional(),
        contractType: contractTypeEnum,
        description: z.string().optional(),
        templateContent: z.string().optional(),
        templateDocumentId: z.string().uuid().optional(),
        availableVariables: z.array(z.record(z.unknown())).optional(),
        defaultClauses: z.array(z.string().uuid()).optional(),
        defaultTerms: z.record(z.unknown()).optional(),
        defaultRenewalMonths: z.number().int().positive().optional(),
        defaultNoticeDays: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contract_templates')
          .insert({
            org_id: orgId,
            template_name: input.templateName,
            template_code: input.templateCode,
            contract_type: input.contractType,
            description: input.description,
            template_content: input.templateContent,
            template_document_id: input.templateDocumentId,
            available_variables: input.availableVariables,
            default_clauses: input.defaultClauses,
            default_terms: input.defaultTerms,
            default_renewal_months: input.defaultRenewalMonths,
            default_notice_days: input.defaultNoticeDays,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Template code already exists' })
          }
          console.error('Failed to create template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update template
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        templateName: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        templateContent: z.string().optional(),
        templateDocumentId: z.string().uuid().optional(),
        availableVariables: z.array(z.record(z.unknown())).optional(),
        defaultClauses: z.array(z.string().uuid()).optional(),
        defaultTerms: z.record(z.unknown()).optional(),
        defaultRenewalMonths: z.number().int().positive().optional(),
        defaultNoticeDays: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.templateName !== undefined) dbUpdate.template_name = updateData.templateName
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.templateContent !== undefined) dbUpdate.template_content = updateData.templateContent
        if (updateData.templateDocumentId !== undefined) dbUpdate.template_document_id = updateData.templateDocumentId
        if (updateData.availableVariables !== undefined) dbUpdate.available_variables = updateData.availableVariables
        if (updateData.defaultClauses !== undefined) dbUpdate.default_clauses = updateData.defaultClauses
        if (updateData.defaultTerms !== undefined) dbUpdate.default_terms = updateData.defaultTerms
        if (updateData.defaultRenewalMonths !== undefined) dbUpdate.default_renewal_months = updateData.defaultRenewalMonths
        if (updateData.defaultNoticeDays !== undefined) dbUpdate.default_notice_days = updateData.defaultNoticeDays
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('contract_templates')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete template (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_templates')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Increment usage count
    incrementUsage: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: current } = await adminClient
          .from('contract_templates')
          .select('usage_count')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (current) {
          await adminClient
            .from('contract_templates')
            .update({
              usage_count: (current.usage_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.id)
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // CLAUSES - Contract clause library
  // ==========================================
  clauses: router({
    // List clauses
    list: orgProtectedProcedure
      .input(z.object({
        category: clauseCategoryEnum.optional(),
        isActive: z.boolean().optional(),
        isStandard: z.boolean().optional(),
        legalApproved: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contract_clauses')
          .select(`
            *,
            approver:user_profiles!legal_approved_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.category) query = query.eq('category', input.category)
        if (input.isActive !== undefined) query = query.eq('is_active', input.isActive)
        if (input.isStandard !== undefined) query = query.eq('is_standard', input.isStandard)
        if (input.legalApproved !== undefined) query = query.eq('legal_approved', input.legalApproved)
        if (input.search) {
          query = query.or(`clause_name.ilike.%${input.search}%,clause_code.ilike.%${input.search}%`)
        }

        query = query
          .order('category')
          .order('clause_name')
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list clauses:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformClause) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single clause
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contract_clauses')
          .select(`
            *,
            approver:user_profiles!legal_approved_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Clause not found' })
        }

        return transformClause(data)
      }),

    // Create clause
    create: orgProtectedProcedure
      .input(z.object({
        clauseName: z.string().min(1).max(200),
        clauseCode: z.string().max(50).optional(),
        category: clauseCategoryEnum.optional(),
        clauseText: z.string().min(1),
        isStandard: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contract_clauses')
          .insert({
            org_id: orgId,
            clause_name: input.clauseName,
            clause_code: input.clauseCode,
            category: input.category,
            clause_text: input.clauseText,
            is_standard: input.isStandard,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create clause:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update clause
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        clauseName: z.string().min(1).max(200).optional(),
        category: clauseCategoryEnum.optional(),
        clauseText: z.string().min(1).optional(),
        isStandard: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        // Get current clause to increment version if text changed
        const { data: current } = await adminClient
          .from('contract_clauses')
          .select('clause_version, clause_text')
          .eq('id', id)
          .single()

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.clauseName !== undefined) dbUpdate.clause_name = updateData.clauseName
        if (updateData.category !== undefined) dbUpdate.category = updateData.category
        if (updateData.clauseText !== undefined) {
          dbUpdate.clause_text = updateData.clauseText
          // Increment version if text changed
          if (current && updateData.clauseText !== current.clause_text) {
            dbUpdate.clause_version = (current.clause_version || 1) + 1
            // Reset legal approval when text changes
            dbUpdate.legal_approved = false
            dbUpdate.legal_approved_by = null
            dbUpdate.legal_approved_at = null
          }
        }
        if (updateData.isStandard !== undefined) dbUpdate.is_standard = updateData.isStandard
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('contract_clauses')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update clause:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete clause (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_clauses')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete clause:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Legal approval
    approve: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_clauses')
          .update({
            legal_approved: true,
            legal_approved_by: user?.id,
            legal_approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to approve clause:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Revoke legal approval
    revokeApproval: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contract_clauses')
          .update({
            legal_approved: false,
            legal_approved_by: null,
            legal_approved_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to revoke approval:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
