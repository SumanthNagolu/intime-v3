import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// COMPLIANCE-01: Unified Compliance Router
// Polymorphic compliance system for any entity type
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const complianceStatusEnum = z.enum([
  'pending', 'received', 'under_review', 'verified',
  'expiring', 'expired', 'rejected', 'waived'
])

const complianceCategoryEnum = z.enum([
  'background', 'drug_test', 'tax', 'insurance', 'certification',
  'legal', 'immigration', 'health', 'training', 'other'
])

const compliancePriorityEnum = z.enum(['critical', 'high', 'medium', 'low'])

// ============================================
// ADMIN CLIENT
// ============================================

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

function transformRequirement(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    requirementCode: item.requirement_code as string,
    requirementName: item.requirement_name as string,
    description: item.description as string | null,
    category: item.category as string,
    subcategory: item.subcategory as string | null,
    appliesToEntityTypes: item.applies_to_entity_types as string[],
    validityPeriodDays: item.validity_period_days as number | null,
    renewalLeadDays: item.renewal_lead_days as number,
    priority: item.priority as string,
    isBlocking: item.is_blocking as boolean,
    requiresDocument: item.requires_document as boolean,
    acceptedDocumentTypes: item.accepted_document_types as string[] | null,
    jurisdiction: item.jurisdiction as string | null,
    jurisdictionRegion: item.jurisdiction_region as string | null,
    isActive: item.is_active as boolean,
    effectiveFrom: item.effective_from as string | null,
    effectiveUntil: item.effective_until as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
  }
}

function transformComplianceItem(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    entityType: item.entity_type as string,
    entityId: item.entity_id as string,
    requirementId: item.requirement_id as string | null,
    complianceType: item.compliance_type as string | null,
    complianceName: item.compliance_name as string | null,
    status: item.status as string,
    documentId: item.document_id as string | null,
    documentUrl: item.document_url as string | null,
    documentReceivedAt: item.document_received_at as string | null,
    effectiveDate: item.effective_date as string | null,
    expiryDate: item.expiry_date as string | null,
    verifiedBy: item.verified_by as string | null,
    verifiedAt: item.verified_at as string | null,
    verificationMethod: item.verification_method as string | null,
    verificationNotes: item.verification_notes as string | null,
    rejectionReason: item.rejection_reason as string | null,
    waivedBy: item.waived_by as string | null,
    waivedAt: item.waived_at as string | null,
    waiverReason: item.waiver_reason as string | null,
    waiverExpiresAt: item.waiver_expires_at as string | null,
    policyNumber: item.policy_number as string | null,
    coverageAmount: item.coverage_amount as number | null,
    insuranceCarrier: item.insurance_carrier as string | null,
    contextPlacementId: item.context_placement_id as string | null,
    contextClientId: item.context_client_id as string | null,
    expiryAlertSentAt: item.expiry_alert_sent_at as string | null,
    expiryAlertDaysBefore: item.expiry_alert_days_before as number,
    inheritedFromEntityType: item.inherited_from_entity_type as string | null,
    inheritedFromEntityId: item.inherited_from_entity_id as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    requirement: item.requirement,
    verifier: item.verifier,
  }
}

// ============================================
// ROUTER
// ============================================

export const complianceRouter = router({
  // ==========================================
  // REQUIREMENTS - Master requirement definitions
  // ==========================================
  requirements: router({
    // List all requirements with filters
    list: orgProtectedProcedure
      .input(z.object({
        category: complianceCategoryEnum.optional(),
        isActive: z.boolean().optional(),
        isBlocking: z.boolean().optional(),
        appliesToEntityType: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['requirement_name', 'category', 'priority', 'created_at']).default('category'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('compliance_requirements')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.category) query = query.eq('category', input.category)
        if (input.isActive !== undefined) query = query.eq('is_active', input.isActive)
        if (input.isBlocking !== undefined) query = query.eq('is_blocking', input.isBlocking)
        if (input.appliesToEntityType) {
          query = query.contains('applies_to_entity_types', [input.appliesToEntityType])
        }
        if (input.search) {
          query = query.or(`requirement_name.ilike.%${input.search}%,requirement_code.ilike.%${input.search}%`)
        }

        query = query
          .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list compliance requirements:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformRequirement) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single requirement by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_requirements')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Compliance requirement not found' })
        }

        return transformRequirement(data)
      }),

    // Create new requirement
    create: orgProtectedProcedure
      .input(z.object({
        requirementCode: z.string().min(1).max(50),
        requirementName: z.string().min(1).max(200),
        description: z.string().optional(),
        category: complianceCategoryEnum,
        subcategory: z.string().max(50).optional(),
        appliesToEntityTypes: z.array(z.string()).default(['contact']),
        validityPeriodDays: z.number().int().positive().optional(),
        renewalLeadDays: z.number().int().min(0).default(30),
        priority: compliancePriorityEnum.default('medium'),
        isBlocking: z.boolean().default(false),
        requiresDocument: z.boolean().default(true),
        acceptedDocumentTypes: z.array(z.string()).optional(),
        jurisdiction: z.string().max(50).optional(),
        jurisdictionRegion: z.string().max(100).optional(),
        effectiveFrom: z.string().optional(),
        effectiveUntil: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_requirements')
          .insert({
            org_id: orgId,
            requirement_code: input.requirementCode,
            requirement_name: input.requirementName,
            description: input.description,
            category: input.category,
            subcategory: input.subcategory,
            applies_to_entity_types: input.appliesToEntityTypes,
            validity_period_days: input.validityPeriodDays,
            renewal_lead_days: input.renewalLeadDays,
            priority: input.priority,
            is_blocking: input.isBlocking,
            requires_document: input.requiresDocument,
            accepted_document_types: input.acceptedDocumentTypes,
            jurisdiction: input.jurisdiction,
            jurisdiction_region: input.jurisdictionRegion,
            effective_from: input.effectiveFrom,
            effective_until: input.effectiveUntil,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Requirement code already exists' })
          }
          console.error('Failed to create compliance requirement:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update requirement
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        requirementName: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        subcategory: z.string().max(50).optional(),
        appliesToEntityTypes: z.array(z.string()).optional(),
        validityPeriodDays: z.number().int().positive().nullable().optional(),
        renewalLeadDays: z.number().int().min(0).optional(),
        priority: compliancePriorityEnum.optional(),
        isBlocking: z.boolean().optional(),
        requiresDocument: z.boolean().optional(),
        acceptedDocumentTypes: z.array(z.string()).optional(),
        jurisdiction: z.string().max(50).optional(),
        jurisdictionRegion: z.string().max(100).optional(),
        isActive: z.boolean().optional(),
        effectiveFrom: z.string().optional(),
        effectiveUntil: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.requirementName !== undefined) dbUpdate.requirement_name = updateData.requirementName
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.subcategory !== undefined) dbUpdate.subcategory = updateData.subcategory
        if (updateData.appliesToEntityTypes !== undefined) dbUpdate.applies_to_entity_types = updateData.appliesToEntityTypes
        if (updateData.validityPeriodDays !== undefined) dbUpdate.validity_period_days = updateData.validityPeriodDays
        if (updateData.renewalLeadDays !== undefined) dbUpdate.renewal_lead_days = updateData.renewalLeadDays
        if (updateData.priority !== undefined) dbUpdate.priority = updateData.priority
        if (updateData.isBlocking !== undefined) dbUpdate.is_blocking = updateData.isBlocking
        if (updateData.requiresDocument !== undefined) dbUpdate.requires_document = updateData.requiresDocument
        if (updateData.acceptedDocumentTypes !== undefined) dbUpdate.accepted_document_types = updateData.acceptedDocumentTypes
        if (updateData.jurisdiction !== undefined) dbUpdate.jurisdiction = updateData.jurisdiction
        if (updateData.jurisdictionRegion !== undefined) dbUpdate.jurisdiction_region = updateData.jurisdictionRegion
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive
        if (updateData.effectiveFrom !== undefined) dbUpdate.effective_from = updateData.effectiveFrom
        if (updateData.effectiveUntil !== undefined) dbUpdate.effective_until = updateData.effectiveUntil

        const { error } = await adminClient
          .from('compliance_requirements')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update compliance requirement:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete requirement (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_requirements')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete compliance requirement:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // ITEMS - Polymorphic compliance records
  // ==========================================
  items: router({
    // List compliance items by entity
    listByEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        status: complianceStatusEnum.optional(),
        category: complianceCategoryEnum.optional(),
        isExpiring: z.boolean().optional(),
        isExpired: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['expiry_date', 'status', 'created_at']).default('expiry_date'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('compliance_items')
          .select(`
            *,
            requirement:compliance_requirements!requirement_id(id, requirement_name, category, is_blocking, priority),
            verifier:user_profiles!verified_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .is('deleted_at', null)

        if (input.status) query = query.eq('status', input.status)

        // Filter by category through requirement join
        if (input.category) {
          query = query.eq('requirement.category', input.category)
        }

        // Filter expiring items (within 30 days)
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

        query = query
          .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list compliance items:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformComplianceItem) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single compliance item
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_items')
          .select(`
            *,
            requirement:compliance_requirements!requirement_id(id, requirement_name, category, is_blocking, priority, validity_period_days),
            verifier:user_profiles!verified_by(id, full_name),
            waiver_user:user_profiles!waived_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Compliance item not found' })
        }

        return transformComplianceItem(data)
      }),

    // Create compliance item
    create: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        requirementId: z.string().uuid().optional(),
        complianceType: z.string().max(100).optional(),
        complianceName: z.string().max(200).optional(),
        status: complianceStatusEnum.default('pending'),
        documentId: z.string().uuid().optional(),
        documentUrl: z.string().url().optional().or(z.literal('')),
        documentReceivedAt: z.string().optional(),
        effectiveDate: z.string().optional(),
        expiryDate: z.string().optional(),
        policyNumber: z.string().max(100).optional(),
        coverageAmount: z.number().optional(),
        insuranceCarrier: z.string().max(200).optional(),
        verificationNotes: z.string().optional(),
        contextPlacementId: z.string().uuid().optional(),
        contextClientId: z.string().uuid().optional(),
        expiryAlertDaysBefore: z.number().int().min(0).default(30),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_items')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            requirement_id: input.requirementId,
            compliance_type: input.complianceType,
            compliance_name: input.complianceName,
            status: input.status,
            document_id: input.documentId,
            document_url: input.documentUrl || null,
            document_received_at: input.documentReceivedAt,
            effective_date: input.effectiveDate,
            expiry_date: input.expiryDate,
            policy_number: input.policyNumber,
            coverage_amount: input.coverageAmount,
            insurance_carrier: input.insuranceCarrier,
            verification_notes: input.verificationNotes,
            context_placement_id: input.contextPlacementId,
            context_client_id: input.contextClientId,
            expiry_alert_days_before: input.expiryAlertDaysBefore,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create compliance item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update compliance item
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: complianceStatusEnum.optional(),
        documentId: z.string().uuid().optional(),
        documentUrl: z.string().url().optional().or(z.literal('')),
        documentReceivedAt: z.string().optional(),
        effectiveDate: z.string().optional(),
        expiryDate: z.string().optional(),
        policyNumber: z.string().max(100).optional(),
        coverageAmount: z.number().optional(),
        insuranceCarrier: z.string().max(200).optional(),
        verificationNotes: z.string().optional(),
        expiryAlertDaysBefore: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.status !== undefined) dbUpdate.status = updateData.status
        if (updateData.documentId !== undefined) dbUpdate.document_id = updateData.documentId
        if (updateData.documentUrl !== undefined) dbUpdate.document_url = updateData.documentUrl || null
        if (updateData.documentReceivedAt !== undefined) dbUpdate.document_received_at = updateData.documentReceivedAt
        if (updateData.effectiveDate !== undefined) dbUpdate.effective_date = updateData.effectiveDate
        if (updateData.expiryDate !== undefined) dbUpdate.expiry_date = updateData.expiryDate
        if (updateData.policyNumber !== undefined) dbUpdate.policy_number = updateData.policyNumber
        if (updateData.coverageAmount !== undefined) dbUpdate.coverage_amount = updateData.coverageAmount
        if (updateData.insuranceCarrier !== undefined) dbUpdate.insurance_carrier = updateData.insuranceCarrier
        if (updateData.verificationNotes !== undefined) dbUpdate.verification_notes = updateData.verificationNotes
        if (updateData.expiryAlertDaysBefore !== undefined) dbUpdate.expiry_alert_days_before = updateData.expiryAlertDaysBefore

        const { error } = await adminClient
          .from('compliance_items')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update compliance item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Verify compliance item
    verify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        verificationMethod: z.enum(['manual', 'automated', 'third_party']).default('manual'),
        verificationNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({
            status: 'verified',
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
            verification_method: input.verificationMethod,
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

    // Reject compliance item
    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({
            status: 'rejected',
            rejection_reason: input.reason,
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
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

    // Waive compliance item
    waive: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().min(1),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({
            status: 'waived',
            waived_by: user?.id,
            waived_at: new Date().toISOString(),
            waiver_reason: input.reason,
            waiver_expires_at: input.expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to waive compliance item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete compliance item (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete compliance item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // COMPLIANCE CHECK - Check entity compliance
  // ==========================================
  checkCompliance: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      blockingOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Set the org_id in session for the function to use
      await adminClient.rpc('set_config', {
        setting: 'app.org_id',
        value: orgId,
      })

      const { data, error } = await adminClient
        .rpc('check_entity_compliance', {
          p_entity_type: input.entityType,
          p_entity_id: input.entityId,
          p_check_blocking_only: input.blockingOnly,
        })

      if (error) {
        console.error('Failed to check entity compliance:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const result = data?.[0] ?? {
        is_compliant: true,
        total_requirements: 0,
        compliant_count: 0,
        pending_count: 0,
        expired_count: 0,
        blocking_issues: null,
      }

      return {
        isCompliant: result.is_compliant as boolean,
        totalRequirements: result.total_requirements as number,
        compliantCount: result.compliant_count as number,
        pendingCount: result.pending_count as number,
        expiredCount: result.expired_count as number,
        blockingIssues: (result.blocking_issues as string[] | null) ?? [],
      }
    }),

  // ==========================================
  // EXPIRING - Get expiring compliance items
  // ==========================================
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
        .from('compliance_items')
        .select(`
          *,
          requirement:compliance_requirements!requirement_id(id, requirement_name, category, is_blocking, priority)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('status', 'in', '("expired","rejected","waived")')
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(input.limit)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get expiring compliance:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformComplianceItem) ?? []
    }),

  // ==========================================
  // STATS - Compliance statistics by entity
  // ==========================================
  statsByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data } = await adminClient
        .from('compliance_items')
        .select('id, status, expiry_date, requirement:compliance_requirements!requirement_id(category, is_blocking)')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)

      const now = new Date()
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)

      const items = data ?? []

      const byStatus = items.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byCategory = items.reduce((acc, item) => {
        const req = item.requirement as unknown as { category: string; is_blocking: boolean } | null
        const category = req?.category ?? 'other'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const blockingCount = items.filter(item => {
        const req = item.requirement as unknown as { category: string; is_blocking: boolean } | null
        return req?.is_blocking ?? false
      }).length

      return {
        total: items.length,
        verified: byStatus['verified'] ?? 0,
        pending: (byStatus['pending'] ?? 0) + (byStatus['received'] ?? 0) + (byStatus['under_review'] ?? 0),
        expired: items.filter(i =>
          i.status === 'expired' || (i.expiry_date && new Date(i.expiry_date) < now)
        ).length,
        expiringSoon: items.filter(i =>
          i.expiry_date &&
          new Date(i.expiry_date) <= thirtyDays &&
          new Date(i.expiry_date) > now &&
          !['expired', 'rejected', 'waived'].includes(i.status)
        ).length,
        rejected: byStatus['rejected'] ?? 0,
        waived: byStatus['waived'] ?? 0,
        blocking: blockingCount,
        byStatus,
        byCategory,
      }
    }),

  // ==========================================
  // ENTITY REQUIREMENTS - Assign requirements to entities
  // ==========================================
  entityRequirements: router({
    // List requirements assigned to an entity
    listByEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('entity_compliance_requirements')
          .select(`
            *,
            requirement:compliance_requirements!requirement_id(*)
          `)
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)

        if (error) {
          console.error('Failed to list entity requirements:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(item => ({
          id: item.id,
          entityType: item.entity_type,
          entityId: item.entity_id,
          requirementId: item.requirement_id,
          isRequired: item.is_required,
          customValidityDays: item.custom_validity_days,
          customLeadDays: item.custom_lead_days,
          notes: item.notes,
          createdAt: item.created_at,
          requirement: item.requirement ? transformRequirement(item.requirement as Record<string, unknown>) : null,
        })) ?? []
      }),

    // Assign requirement to entity
    assign: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        requirementId: z.string().uuid(),
        isRequired: z.boolean().default(true),
        customValidityDays: z.number().int().positive().optional(),
        customLeadDays: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('entity_compliance_requirements')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            requirement_id: input.requirementId,
            is_required: input.isRequired,
            custom_validity_days: input.customValidityDays,
            custom_lead_days: input.customLeadDays,
            notes: input.notes,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Requirement already assigned to this entity' })
          }
          console.error('Failed to assign requirement:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Remove requirement from entity
    remove: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        requirementId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('entity_compliance_requirements')
          .delete()
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .eq('requirement_id', input.requirementId)

        if (error) {
          console.error('Failed to remove requirement:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
