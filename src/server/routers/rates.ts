import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// RATES-01: Unified Rate Cards & Billing Router
// Polymorphic rates system for any entity type
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const rateCardTypeEnum = z.enum([
  'standard', 'msp', 'vms', 'preferred', 'custom'
])

const rateUnitEnum = z.enum([
  'hourly', 'daily', 'weekly', 'monthly', 'annual', 'fixed', 'retainer', 'project'
])

const approvalTypeEnum = z.enum([
  'margin_exception', 'rate_change', 'new_rate', 'below_minimum'
])

const approvalStatusEnum = z.enum([
  'pending', 'approved', 'rejected', 'expired'
])

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformRateCard(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    rateCardName: item.rate_card_name as string,
    rateCardCode: item.rate_card_code as string | null,
    entityType: item.entity_type as string,
    entityId: item.entity_id as string,
    rateCardType: item.rate_card_type as string,
    currency: item.currency as string,
    version: item.version as number,
    isActive: item.is_active as boolean,
    isLatestVersion: item.is_latest_version as boolean,
    previousVersionId: item.previous_version_id as string | null,
    effectiveStartDate: item.effective_start_date as string,
    effectiveEndDate: item.effective_end_date as string | null,
    approvedAt: item.approved_at as string | null,
    approvedBy: item.approved_by as string | null,
    overtimeMultiplier: item.overtime_multiplier ? Number(item.overtime_multiplier) : null,
    doubleTimeMultiplier: item.double_time_multiplier ? Number(item.double_time_multiplier) : null,
    holidayMultiplier: item.holiday_multiplier ? Number(item.holiday_multiplier) : null,
    defaultMarkupPercentage: item.default_markup_percentage ? Number(item.default_markup_percentage) : null,
    minMarginPercentage: item.min_margin_percentage ? Number(item.min_margin_percentage) : null,
    targetMarginPercentage: item.target_margin_percentage ? Number(item.target_margin_percentage) : null,
    mspProgramName: item.msp_program_name as string | null,
    mspTier: item.msp_tier as string | null,
    vmsPlatform: item.vms_platform as string | null,
    vmsFeePercentage: item.vms_fee_percentage ? Number(item.vms_fee_percentage) : null,
    directHireFeePercentage: item.direct_hire_fee_percentage ? Number(item.direct_hire_fee_percentage) : null,
    directHireFeeFlat: item.direct_hire_fee_flat ? Number(item.direct_hire_fee_flat) : null,
    applicableRegions: item.applicable_regions as string[] | null,
    applicableJobCategories: item.applicable_job_categories as string[] | null,
    notes: item.notes as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    approver: item.approver,
    previousVersion: item.previous_version,
  }
}

function transformRateCardItem(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    rateCardId: item.rate_card_id as string,
    jobCategory: item.job_category as string | null,
    jobLevel: item.job_level as string | null,
    jobFamily: item.job_family as string | null,
    skillId: item.skill_id as string | null,
    rateUnit: item.rate_unit as string,
    minPayRate: item.min_pay_rate ? Number(item.min_pay_rate) : null,
    maxPayRate: item.max_pay_rate ? Number(item.max_pay_rate) : null,
    targetPayRate: item.target_pay_rate ? Number(item.target_pay_rate) : null,
    minBillRate: item.min_bill_rate ? Number(item.min_bill_rate) : null,
    maxBillRate: item.max_bill_rate ? Number(item.max_bill_rate) : null,
    standardBillRate: item.standard_bill_rate ? Number(item.standard_bill_rate) : null,
    calculatedMarkup: item.calculated_markup ? Number(item.calculated_markup) : null,
    calculatedMargin: item.calculated_margin ? Number(item.calculated_margin) : null,
    targetMarginPercentage: item.target_margin_percentage ? Number(item.target_margin_percentage) : null,
    minMarginPercentage: item.min_margin_percentage ? Number(item.min_margin_percentage) : null,
    requiresCertification: item.requires_certification as boolean,
    requiresClearance: item.requires_clearance as boolean,
    clearanceLevel: item.clearance_level as string | null,
    minYearsExperience: item.min_years_experience as number | null,
    notes: item.notes as string | null,
    displayOrder: item.display_order as number,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined relations
    skill: item.skill,
  }
}

function transformEntityRate(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    entityType: item.entity_type as string,
    entityId: item.entity_id as string,
    rateCardId: item.rate_card_id as string | null,
    rateCardItemId: item.rate_card_item_id as string | null,
    rateUnit: item.rate_unit as string,
    currency: item.currency as string,
    billRate: Number(item.bill_rate),
    payRate: Number(item.pay_rate),
    grossMargin: item.gross_margin ? Number(item.gross_margin) : null,
    marginPercentage: item.margin_percentage ? Number(item.margin_percentage) : null,
    markupPercentage: item.markup_percentage ? Number(item.markup_percentage) : null,
    otBillRate: item.ot_bill_rate ? Number(item.ot_bill_rate) : null,
    otPayRate: item.ot_pay_rate ? Number(item.ot_pay_rate) : null,
    dtBillRate: item.dt_bill_rate ? Number(item.dt_bill_rate) : null,
    dtPayRate: item.dt_pay_rate ? Number(item.dt_pay_rate) : null,
    effectiveDate: item.effective_date as string,
    endDate: item.end_date as string | null,
    isCurrent: item.is_current as boolean,
    originalBillRate: item.original_bill_rate ? Number(item.original_bill_rate) : null,
    originalPayRate: item.original_pay_rate ? Number(item.original_pay_rate) : null,
    negotiatedBy: item.negotiated_by as string | null,
    negotiationNotes: item.negotiation_notes as string | null,
    requiresApproval: item.requires_approval as boolean,
    approvedAt: item.approved_at as string | null,
    approvedBy: item.approved_by as string | null,
    approvalNotes: item.approval_notes as string | null,
    contextJobId: item.context_job_id as string | null,
    contextClientId: item.context_client_id as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    rateCard: item.rate_card,
    negotiator: item.negotiator,
    approver: item.approver,
  }
}

function transformRateApproval(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    entityRateId: item.entity_rate_id as string,
    approvalType: item.approval_type as string,
    requestedBy: item.requested_by as string | null,
    requestedAt: item.requested_at as string | null,
    justification: item.justification as string | null,
    proposedBillRate: item.proposed_bill_rate ? Number(item.proposed_bill_rate) : null,
    proposedPayRate: item.proposed_pay_rate ? Number(item.proposed_pay_rate) : null,
    proposedMarginPercentage: item.proposed_margin_percentage ? Number(item.proposed_margin_percentage) : null,
    status: item.status as string,
    decidedBy: item.decided_by as string | null,
    decidedAt: item.decided_at as string | null,
    decisionReason: item.decision_reason as string | null,
    expiresAt: item.expires_at as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    // Joined relations
    requester: item.requester,
    decider: item.decider,
    entityRate: item.entity_rate,
  }
}

function transformRateChangeHistory(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    entityRateId: item.entity_rate_id as string,
    changeType: item.change_type as string,
    oldBillRate: item.old_bill_rate ? Number(item.old_bill_rate) : null,
    newBillRate: item.new_bill_rate ? Number(item.new_bill_rate) : null,
    oldPayRate: item.old_pay_rate ? Number(item.old_pay_rate) : null,
    newPayRate: item.new_pay_rate ? Number(item.new_pay_rate) : null,
    reason: item.reason as string | null,
    changedBy: item.changed_by as string | null,
    changedAt: item.changed_at as string,
    // Joined relations
    changer: item.changer,
  }
}

// ============================================
// ROUTER
// ============================================

export const ratesRouter = router({
  // ==========================================
  // RATE CARDS - Master rate card definitions
  // ==========================================
  rateCards: router({
    // List rate cards with filters
    list: orgProtectedProcedure
      .input(z.object({
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
        rateCardType: rateCardTypeEnum.optional(),
        isActive: z.boolean().optional(),
        isLatestVersion: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['rate_card_name', 'rate_card_type', 'effective_start_date', 'created_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('rate_cards')
          .select(`
            *,
            approver:user_profiles!approved_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.entityType) query = query.eq('entity_type', input.entityType)
        if (input.entityId) query = query.eq('entity_id', input.entityId)
        if (input.rateCardType) query = query.eq('rate_card_type', input.rateCardType)
        if (input.isActive !== undefined) query = query.eq('is_active', input.isActive)
        if (input.isLatestVersion !== undefined) query = query.eq('is_latest_version', input.isLatestVersion)

        if (input.search) {
          query = query.or(`rate_card_name.ilike.%${input.search}%,rate_card_code.ilike.%${input.search}%`)
        }

        query = query
          .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list rate cards:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformRateCard) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single rate card
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('rate_cards')
          .select(`
            *,
            approver:user_profiles!approved_by(id, full_name),
            previous_version:rate_cards!previous_version_id(id, rate_card_name, version)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
        }

        return transformRateCard(data)
      }),

    // List rate cards by entity
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
          .from('rate_cards')
          .select(`
            *,
            approver:user_profiles!approved_by(id, full_name)
          `)
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .is('deleted_at', null)

        if (input.activeOnly) {
          query = query.eq('is_active', true)
        }

        if (input.latestVersionOnly) {
          query = query.eq('is_latest_version', true)
        }

        query = query.order('effective_start_date', { ascending: false })

        const { data, error } = await query

        if (error) {
          console.error('Failed to list rate cards by entity:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformRateCard) ?? []
      }),

    // Get active rate card for entity
    getActive: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await adminClient
          .from('rate_cards')
          .select(`
            *,
            approver:user_profiles!approved_by(id, full_name)
          `)
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .eq('is_active', true)
          .eq('is_latest_version', true)
          .lte('effective_start_date', today)
          .or(`effective_end_date.is.null,effective_end_date.gte.${today}`)
          .is('deleted_at', null)
          .order('effective_start_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error('Failed to get active rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ? transformRateCard(data) : null
      }),

    // Create rate card
    create: orgProtectedProcedure
      .input(z.object({
        rateCardName: z.string().min(1).max(200),
        rateCardCode: z.string().max(50).optional(),
        entityType: z.string(),
        entityId: z.string().uuid(),
        rateCardType: rateCardTypeEnum.default('standard'),
        currency: z.string().length(3).default('USD'),
        effectiveStartDate: z.string(),
        effectiveEndDate: z.string().optional(),
        overtimeMultiplier: z.number().min(0).max(10).default(1.5),
        doubleTimeMultiplier: z.number().min(0).max(10).default(2.0),
        holidayMultiplier: z.number().min(0).max(10).default(1.5),
        defaultMarkupPercentage: z.number().min(0).max(500).optional(),
        minMarginPercentage: z.number().min(0).max(100).default(10),
        targetMarginPercentage: z.number().min(0).max(100).default(20),
        mspProgramName: z.string().max(200).optional(),
        mspTier: z.string().max(50).optional(),
        vmsPlatform: z.string().max(100).optional(),
        vmsFeePercentage: z.number().min(0).max(100).optional(),
        directHireFeePercentage: z.number().min(0).max(100).optional(),
        directHireFeeFlat: z.number().min(0).optional(),
        applicableRegions: z.array(z.string()).optional(),
        applicableJobCategories: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Deactivate any existing active rate card for this entity
        await adminClient
          .from('rate_cards')
          .update({
            is_active: false,
            is_latest_version: false,
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .eq('is_active', true)

        const { data, error } = await adminClient
          .from('rate_cards')
          .insert({
            org_id: orgId,
            rate_card_name: input.rateCardName,
            rate_card_code: input.rateCardCode,
            entity_type: input.entityType,
            entity_id: input.entityId,
            rate_card_type: input.rateCardType,
            currency: input.currency,
            version: 1,
            is_active: true,
            is_latest_version: true,
            effective_start_date: input.effectiveStartDate,
            effective_end_date: input.effectiveEndDate,
            overtime_multiplier: input.overtimeMultiplier,
            double_time_multiplier: input.doubleTimeMultiplier,
            holiday_multiplier: input.holidayMultiplier,
            default_markup_percentage: input.defaultMarkupPercentage,
            min_margin_percentage: input.minMarginPercentage,
            target_margin_percentage: input.targetMarginPercentage,
            msp_program_name: input.mspProgramName,
            msp_tier: input.mspTier,
            vms_platform: input.vmsPlatform,
            vms_fee_percentage: input.vmsFeePercentage,
            direct_hire_fee_percentage: input.directHireFeePercentage,
            direct_hire_fee_flat: input.directHireFeeFlat,
            applicable_regions: input.applicableRegions,
            applicable_job_categories: input.applicableJobCategories,
            notes: input.notes,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new TRPCError({ code: 'CONFLICT', message: 'Rate card code already exists' })
          }
          console.error('Failed to create rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update rate card
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        rateCardName: z.string().min(1).max(200).optional(),
        rateCardType: rateCardTypeEnum.optional(),
        effectiveEndDate: z.string().optional(),
        overtimeMultiplier: z.number().min(0).max(10).optional(),
        doubleTimeMultiplier: z.number().min(0).max(10).optional(),
        holidayMultiplier: z.number().min(0).max(10).optional(),
        defaultMarkupPercentage: z.number().min(0).max(500).nullable().optional(),
        minMarginPercentage: z.number().min(0).max(100).optional(),
        targetMarginPercentage: z.number().min(0).max(100).optional(),
        mspProgramName: z.string().max(200).optional(),
        mspTier: z.string().max(50).optional(),
        vmsPlatform: z.string().max(100).optional(),
        vmsFeePercentage: z.number().min(0).max(100).nullable().optional(),
        directHireFeePercentage: z.number().min(0).max(100).nullable().optional(),
        directHireFeeFlat: z.number().min(0).nullable().optional(),
        applicableRegions: z.array(z.string()).optional(),
        applicableJobCategories: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.rateCardName !== undefined) dbUpdate.rate_card_name = updateData.rateCardName
        if (updateData.rateCardType !== undefined) dbUpdate.rate_card_type = updateData.rateCardType
        if (updateData.effectiveEndDate !== undefined) dbUpdate.effective_end_date = updateData.effectiveEndDate
        if (updateData.overtimeMultiplier !== undefined) dbUpdate.overtime_multiplier = updateData.overtimeMultiplier
        if (updateData.doubleTimeMultiplier !== undefined) dbUpdate.double_time_multiplier = updateData.doubleTimeMultiplier
        if (updateData.holidayMultiplier !== undefined) dbUpdate.holiday_multiplier = updateData.holidayMultiplier
        if (updateData.defaultMarkupPercentage !== undefined) dbUpdate.default_markup_percentage = updateData.defaultMarkupPercentage
        if (updateData.minMarginPercentage !== undefined) dbUpdate.min_margin_percentage = updateData.minMarginPercentage
        if (updateData.targetMarginPercentage !== undefined) dbUpdate.target_margin_percentage = updateData.targetMarginPercentage
        if (updateData.mspProgramName !== undefined) dbUpdate.msp_program_name = updateData.mspProgramName
        if (updateData.mspTier !== undefined) dbUpdate.msp_tier = updateData.mspTier
        if (updateData.vmsPlatform !== undefined) dbUpdate.vms_platform = updateData.vmsPlatform
        if (updateData.vmsFeePercentage !== undefined) dbUpdate.vms_fee_percentage = updateData.vmsFeePercentage
        if (updateData.directHireFeePercentage !== undefined) dbUpdate.direct_hire_fee_percentage = updateData.directHireFeePercentage
        if (updateData.directHireFeeFlat !== undefined) dbUpdate.direct_hire_fee_flat = updateData.directHireFeeFlat
        if (updateData.applicableRegions !== undefined) dbUpdate.applicable_regions = updateData.applicableRegions
        if (updateData.applicableJobCategories !== undefined) dbUpdate.applicable_job_categories = updateData.applicableJobCategories
        if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes

        const { error } = await adminClient
          .from('rate_cards')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete rate card (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('rate_cards')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Create new version of rate card
    createVersion: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(), // ID of current rate card
        effectiveStartDate: z.string(),
        effectiveEndDate: z.string().optional(),
        notes: z.string().optional(),
        // Optional overrides for the new version
        rateCardName: z.string().min(1).max(200).optional(),
        defaultMarkupPercentage: z.number().min(0).max(500).optional(),
        minMarginPercentage: z.number().min(0).max(100).optional(),
        targetMarginPercentage: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get current rate card
        const { data: current, error: fetchError } = await adminClient
          .from('rate_cards')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !current) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
        }

        // Mark current as not latest
        await adminClient
          .from('rate_cards')
          .update({
            is_latest_version: false,
            is_active: false,
            effective_end_date: input.effectiveStartDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)

        // Create new version
        const { data: newVersion, error: createError } = await adminClient
          .from('rate_cards')
          .insert({
            org_id: orgId,
            rate_card_name: input.rateCardName ?? current.rate_card_name,
            rate_card_code: current.rate_card_code,
            entity_type: current.entity_type,
            entity_id: current.entity_id,
            rate_card_type: current.rate_card_type,
            currency: current.currency,
            version: current.version + 1,
            is_active: true,
            is_latest_version: true,
            previous_version_id: current.id,
            effective_start_date: input.effectiveStartDate,
            effective_end_date: input.effectiveEndDate,
            overtime_multiplier: current.overtime_multiplier,
            double_time_multiplier: current.double_time_multiplier,
            holiday_multiplier: current.holiday_multiplier,
            default_markup_percentage: input.defaultMarkupPercentage ?? current.default_markup_percentage,
            min_margin_percentage: input.minMarginPercentage ?? current.min_margin_percentage,
            target_margin_percentage: input.targetMarginPercentage ?? current.target_margin_percentage,
            msp_program_name: current.msp_program_name,
            msp_tier: current.msp_tier,
            vms_platform: current.vms_platform,
            vms_fee_percentage: current.vms_fee_percentage,
            direct_hire_fee_percentage: current.direct_hire_fee_percentage,
            direct_hire_fee_flat: current.direct_hire_fee_flat,
            applicable_regions: current.applicable_regions,
            applicable_job_categories: current.applicable_job_categories,
            notes: input.notes ?? current.notes,
            created_by: user?.id,
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create rate card version:', createError)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message })
        }

        // Copy rate card items to new version
        const { data: items } = await adminClient
          .from('rate_card_items')
          .select('*')
          .eq('rate_card_id', current.id)
          .is('deleted_at', null)

        if (items && items.length > 0) {
          const newItems = items.map(item => ({
            org_id: orgId,
            rate_card_id: newVersion.id,
            job_category: item.job_category,
            job_level: item.job_level,
            job_family: item.job_family,
            skill_id: item.skill_id,
            rate_unit: item.rate_unit,
            min_pay_rate: item.min_pay_rate,
            max_pay_rate: item.max_pay_rate,
            target_pay_rate: item.target_pay_rate,
            min_bill_rate: item.min_bill_rate,
            max_bill_rate: item.max_bill_rate,
            standard_bill_rate: item.standard_bill_rate,
            target_margin_percentage: item.target_margin_percentage,
            min_margin_percentage: item.min_margin_percentage,
            requires_certification: item.requires_certification,
            requires_clearance: item.requires_clearance,
            clearance_level: item.clearance_level,
            min_years_experience: item.min_years_experience,
            notes: item.notes,
            display_order: item.display_order,
          }))

          await adminClient.from('rate_card_items').insert(newItems)
        }

        return { id: newVersion.id, previousId: current.id, version: newVersion.version }
      }),

    // Activate rate card
    activate: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get the rate card to find its entity
        const { data: rateCard } = await adminClient
          .from('rate_cards')
          .select('entity_type, entity_id')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (!rateCard) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
        }

        // Deactivate other rate cards for the same entity
        await adminClient
          .from('rate_cards')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('org_id', orgId)
          .eq('entity_type', rateCard.entity_type)
          .eq('entity_id', rateCard.entity_id)
          .eq('is_active', true)
          .neq('id', input.id)

        // Activate this rate card
        const { error } = await adminClient
          .from('rate_cards')
          .update({
            is_active: true,
            approved_at: new Date().toISOString(),
            approved_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to activate rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Deactivate rate card
    deactivate: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        effectiveEndDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('rate_cards')
          .update({
            is_active: false,
            effective_end_date: input.effectiveEndDate || new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to deactivate rate card:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Rate card statistics
    stats: orgProtectedProcedure
      .input(z.object({
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('rate_cards')
          .select('id, rate_card_type, is_active, is_latest_version, effective_start_date, effective_end_date')
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
          acc[item.rate_card_type] = (acc[item.rate_card_type] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        const today = new Date().toISOString().split('T')[0]

        return {
          total: items?.length ?? 0,
          active: items?.filter(i => i.is_active).length ?? 0,
          latestVersions: items?.filter(i => i.is_latest_version).length ?? 0,
          expired: items?.filter(i =>
            i.effective_end_date && i.effective_end_date < today
          ).length ?? 0,
          byType,
        }
      }),
  }),

  // ==========================================
  // ITEMS - Rate card line items
  // ==========================================
  items: router({
    // List items for a rate card
    list: orgProtectedProcedure
      .input(z.object({
        rateCardId: z.string().uuid(),
        jobCategory: z.string().optional(),
        jobLevel: z.string().optional(),
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify rate card belongs to org
        const { data: rateCard } = await adminClient
          .from('rate_cards')
          .select('id')
          .eq('id', input.rateCardId)
          .eq('org_id', orgId)
          .single()

        if (!rateCard) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
        }

        let query = adminClient
          .from('rate_card_items')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .eq('rate_card_id', input.rateCardId)
          .is('deleted_at', null)

        if (input.jobCategory) query = query.eq('job_category', input.jobCategory)
        if (input.jobLevel) query = query.eq('job_level', input.jobLevel)

        query = query
          .order('display_order')
          .order('job_category')
          .order('job_level')
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list rate card items:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformRateCardItem) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single item
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('rate_card_items')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card item not found' })
        }

        return transformRateCardItem(data)
      }),

    // Create item
    create: orgProtectedProcedure
      .input(z.object({
        rateCardId: z.string().uuid(),
        jobCategory: z.string().max(100).optional(),
        jobLevel: z.string().max(50).optional(),
        jobFamily: z.string().max(100).optional(),
        skillId: z.string().uuid().optional(),
        rateUnit: rateUnitEnum.default('hourly'),
        minPayRate: z.number().min(0).optional(),
        maxPayRate: z.number().min(0).optional(),
        targetPayRate: z.number().min(0).optional(),
        minBillRate: z.number().min(0).optional(),
        maxBillRate: z.number().min(0).optional(),
        standardBillRate: z.number().min(0).optional(),
        targetMarginPercentage: z.number().min(0).max(100).optional(),
        minMarginPercentage: z.number().min(0).max(100).optional(),
        requiresCertification: z.boolean().default(false),
        requiresClearance: z.boolean().default(false),
        clearanceLevel: z.string().max(50).optional(),
        minYearsExperience: z.number().int().min(0).optional(),
        notes: z.string().optional(),
        displayOrder: z.number().int().min(0).default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify rate card belongs to org
        const { data: rateCard } = await adminClient
          .from('rate_cards')
          .select('id')
          .eq('id', input.rateCardId)
          .eq('org_id', orgId)
          .single()

        if (!rateCard) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
        }

        const { data, error } = await adminClient
          .from('rate_card_items')
          .insert({
            org_id: orgId,
            rate_card_id: input.rateCardId,
            job_category: input.jobCategory,
            job_level: input.jobLevel,
            job_family: input.jobFamily,
            skill_id: input.skillId,
            rate_unit: input.rateUnit,
            min_pay_rate: input.minPayRate,
            max_pay_rate: input.maxPayRate,
            target_pay_rate: input.targetPayRate,
            min_bill_rate: input.minBillRate,
            max_bill_rate: input.maxBillRate,
            standard_bill_rate: input.standardBillRate,
            target_margin_percentage: input.targetMarginPercentage,
            min_margin_percentage: input.minMarginPercentage,
            requires_certification: input.requiresCertification,
            requires_clearance: input.requiresClearance,
            clearance_level: input.clearanceLevel,
            min_years_experience: input.minYearsExperience,
            notes: input.notes,
            display_order: input.displayOrder,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create rate card item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update item
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        jobCategory: z.string().max(100).optional(),
        jobLevel: z.string().max(50).optional(),
        jobFamily: z.string().max(100).optional(),
        skillId: z.string().uuid().optional(),
        rateUnit: rateUnitEnum.optional(),
        minPayRate: z.number().min(0).nullable().optional(),
        maxPayRate: z.number().min(0).nullable().optional(),
        targetPayRate: z.number().min(0).nullable().optional(),
        minBillRate: z.number().min(0).nullable().optional(),
        maxBillRate: z.number().min(0).nullable().optional(),
        standardBillRate: z.number().min(0).nullable().optional(),
        targetMarginPercentage: z.number().min(0).max(100).nullable().optional(),
        minMarginPercentage: z.number().min(0).max(100).nullable().optional(),
        requiresCertification: z.boolean().optional(),
        requiresClearance: z.boolean().optional(),
        clearanceLevel: z.string().max(50).nullable().optional(),
        minYearsExperience: z.number().int().min(0).nullable().optional(),
        notes: z.string().optional(),
        displayOrder: z.number().int().min(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.jobCategory !== undefined) dbUpdate.job_category = updateData.jobCategory
        if (updateData.jobLevel !== undefined) dbUpdate.job_level = updateData.jobLevel
        if (updateData.jobFamily !== undefined) dbUpdate.job_family = updateData.jobFamily
        if (updateData.skillId !== undefined) dbUpdate.skill_id = updateData.skillId
        if (updateData.rateUnit !== undefined) dbUpdate.rate_unit = updateData.rateUnit
        if (updateData.minPayRate !== undefined) dbUpdate.min_pay_rate = updateData.minPayRate
        if (updateData.maxPayRate !== undefined) dbUpdate.max_pay_rate = updateData.maxPayRate
        if (updateData.targetPayRate !== undefined) dbUpdate.target_pay_rate = updateData.targetPayRate
        if (updateData.minBillRate !== undefined) dbUpdate.min_bill_rate = updateData.minBillRate
        if (updateData.maxBillRate !== undefined) dbUpdate.max_bill_rate = updateData.maxBillRate
        if (updateData.standardBillRate !== undefined) dbUpdate.standard_bill_rate = updateData.standardBillRate
        if (updateData.targetMarginPercentage !== undefined) dbUpdate.target_margin_percentage = updateData.targetMarginPercentage
        if (updateData.minMarginPercentage !== undefined) dbUpdate.min_margin_percentage = updateData.minMarginPercentage
        if (updateData.requiresCertification !== undefined) dbUpdate.requires_certification = updateData.requiresCertification
        if (updateData.requiresClearance !== undefined) dbUpdate.requires_clearance = updateData.requiresClearance
        if (updateData.clearanceLevel !== undefined) dbUpdate.clearance_level = updateData.clearanceLevel
        if (updateData.minYearsExperience !== undefined) dbUpdate.min_years_experience = updateData.minYearsExperience
        if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes
        if (updateData.displayOrder !== undefined) dbUpdate.display_order = updateData.displayOrder

        const { error } = await adminClient
          .from('rate_card_items')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update rate card item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete item (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('rate_card_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete rate card item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // ENTITY RATES - Specific rates for entities
  // ==========================================
  entityRates: router({
    // List rates for an entity
    listByEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        currentOnly: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('entity_rates')
          .select(`
            *,
            rate_card:rate_cards!rate_card_id(id, rate_card_name),
            negotiator:user_profiles!negotiated_by(id, full_name),
            approver:user_profiles!approved_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .is('deleted_at', null)

        if (input.currentOnly) {
          query = query.eq('is_current', true)
        }

        query = query
          .order('effective_date', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list entity rates:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformEntityRate) ?? [],
          total: count ?? 0,
        }
      }),

    // Get single entity rate
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('entity_rates')
          .select(`
            *,
            rate_card:rate_cards!rate_card_id(id, rate_card_name, rate_card_type),
            negotiator:user_profiles!negotiated_by(id, full_name),
            approver:user_profiles!approved_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity rate not found' })
        }

        return transformEntityRate(data)
      }),

    // Get current rate for entity
    getCurrentRate: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        contextClientId: z.string().uuid().optional(),
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
          .rpc('get_entity_rate', {
            p_entity_type: input.entityType,
            p_entity_id: input.entityId,
            p_context_client_id: input.contextClientId || null,
          })

        if (error) {
          console.error('Failed to get current entity rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        if (!data || data.length === 0) {
          return null
        }

        const result = data[0]
        return {
          billRate: result.bill_rate ? Number(result.bill_rate) : null,
          payRate: result.pay_rate ? Number(result.pay_rate) : null,
          marginPercentage: result.margin_percentage ? Number(result.margin_percentage) : null,
          rateUnit: result.rate_unit,
          source: result.source,
        }
      }),

    // Create entity rate
    create: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        rateCardId: z.string().uuid().optional(),
        rateCardItemId: z.string().uuid().optional(),
        rateUnit: rateUnitEnum.default('hourly'),
        currency: z.string().length(3).default('USD'),
        billRate: z.number().min(0),
        payRate: z.number().min(0),
        otBillRate: z.number().min(0).optional(),
        otPayRate: z.number().min(0).optional(),
        dtBillRate: z.number().min(0).optional(),
        dtPayRate: z.number().min(0).optional(),
        effectiveDate: z.string(),
        endDate: z.string().optional(),
        originalBillRate: z.number().min(0).optional(),
        originalPayRate: z.number().min(0).optional(),
        negotiationNotes: z.string().optional(),
        requiresApproval: z.boolean().default(false),
        contextJobId: z.string().uuid().optional(),
        contextClientId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Mark any existing current rate as not current
        await adminClient
          .from('entity_rates')
          .update({
            is_current: false,
            end_date: input.effectiveDate,
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .eq('is_current', true)

        const { data, error } = await adminClient
          .from('entity_rates')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            rate_card_id: input.rateCardId,
            rate_card_item_id: input.rateCardItemId,
            rate_unit: input.rateUnit,
            currency: input.currency,
            bill_rate: input.billRate,
            pay_rate: input.payRate,
            ot_bill_rate: input.otBillRate,
            ot_pay_rate: input.otPayRate,
            dt_bill_rate: input.dtBillRate,
            dt_pay_rate: input.dtPayRate,
            effective_date: input.effectiveDate,
            end_date: input.endDate,
            is_current: true,
            original_bill_rate: input.originalBillRate,
            original_pay_rate: input.originalPayRate,
            negotiated_by: (input.originalBillRate || input.originalPayRate) ? user?.id : null,
            negotiation_notes: input.negotiationNotes,
            requires_approval: input.requiresApproval,
            context_job_id: input.contextJobId,
            context_client_id: input.contextClientId,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create entity rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create change history
        await adminClient
          .from('rate_change_history')
          .insert({
            entity_rate_id: data.id,
            change_type: 'created',
            new_bill_rate: input.billRate,
            new_pay_rate: input.payRate,
            reason: 'Initial rate creation',
            changed_by: user?.id,
          })

        return { id: data.id }
      }),

    // Update entity rate
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        billRate: z.number().min(0).optional(),
        payRate: z.number().min(0).optional(),
        otBillRate: z.number().min(0).nullable().optional(),
        otPayRate: z.number().min(0).nullable().optional(),
        dtBillRate: z.number().min(0).nullable().optional(),
        dtPayRate: z.number().min(0).nullable().optional(),
        endDate: z.string().optional(),
        negotiationNotes: z.string().optional(),
        approvalNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { id, ...updateData } = input

        // Get current values for history
        const { data: current } = await adminClient
          .from('entity_rates')
          .select('bill_rate, pay_rate')
          .eq('id', id)
          .eq('org_id', orgId)
          .single()

        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.billRate !== undefined) dbUpdate.bill_rate = updateData.billRate
        if (updateData.payRate !== undefined) dbUpdate.pay_rate = updateData.payRate
        if (updateData.otBillRate !== undefined) dbUpdate.ot_bill_rate = updateData.otBillRate
        if (updateData.otPayRate !== undefined) dbUpdate.ot_pay_rate = updateData.otPayRate
        if (updateData.dtBillRate !== undefined) dbUpdate.dt_bill_rate = updateData.dtBillRate
        if (updateData.dtPayRate !== undefined) dbUpdate.dt_pay_rate = updateData.dtPayRate
        if (updateData.endDate !== undefined) dbUpdate.end_date = updateData.endDate
        if (updateData.negotiationNotes !== undefined) dbUpdate.negotiation_notes = updateData.negotiationNotes
        if (updateData.approvalNotes !== undefined) dbUpdate.approval_notes = updateData.approvalNotes

        const { error } = await adminClient
          .from('entity_rates')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update entity rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Record change history if rates changed
        if (current && (updateData.billRate !== undefined || updateData.payRate !== undefined)) {
          await adminClient
            .from('rate_change_history')
            .insert({
              entity_rate_id: id,
              change_type: 'updated',
              old_bill_rate: current.bill_rate,
              new_bill_rate: updateData.billRate ?? current.bill_rate,
              old_pay_rate: current.pay_rate,
              new_pay_rate: updateData.payRate ?? current.pay_rate,
              reason: updateData.negotiationNotes || 'Rate updated',
              changed_by: user?.id,
            })
        }

        return { success: true }
      }),

    // Delete entity rate (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('entity_rates')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete entity rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Request approval for rate
    requestApproval: orgProtectedProcedure
      .input(z.object({
        entityRateId: z.string().uuid(),
        approvalType: approvalTypeEnum,
        justification: z.string().optional(),
        proposedBillRate: z.number().min(0).optional(),
        proposedPayRate: z.number().min(0).optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify entity rate belongs to org
        const { data: rate } = await adminClient
          .from('entity_rates')
          .select('id, bill_rate, pay_rate')
          .eq('id', input.entityRateId)
          .eq('org_id', orgId)
          .single()

        if (!rate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity rate not found' })
        }

        // Calculate proposed margin percentage
        const proposedBill = input.proposedBillRate ?? Number(rate.bill_rate)
        const proposedPay = input.proposedPayRate ?? Number(rate.pay_rate)
        const proposedMargin = proposedBill > 0 ? ((proposedBill - proposedPay) / proposedBill * 100) : 0

        const { data, error } = await adminClient
          .from('rate_approvals')
          .insert({
            org_id: orgId,
            entity_rate_id: input.entityRateId,
            approval_type: input.approvalType,
            requested_by: user?.id,
            requested_at: new Date().toISOString(),
            justification: input.justification,
            proposed_bill_rate: input.proposedBillRate,
            proposed_pay_rate: input.proposedPayRate,
            proposed_margin_percentage: proposedMargin,
            status: 'pending',
            expires_at: input.expiresAt,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to request rate approval:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Mark entity rate as requiring approval
        await adminClient
          .from('entity_rates')
          .update({
            requires_approval: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.entityRateId)

        return { id: data.id }
      }),

    // Get rate history
    getHistory: orgProtectedProcedure
      .input(z.object({
        entityRateId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify entity rate belongs to org
        const { data: rate } = await adminClient
          .from('entity_rates')
          .select('id')
          .eq('id', input.entityRateId)
          .eq('org_id', orgId)
          .single()

        if (!rate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity rate not found' })
        }

        const { data, error } = await adminClient
          .from('rate_change_history')
          .select(`
            *,
            changer:user_profiles!changed_by(id, full_name)
          `)
          .eq('entity_rate_id', input.entityRateId)
          .order('changed_at', { ascending: false })
          .limit(input.limit)

        if (error) {
          console.error('Failed to get rate history:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformRateChangeHistory) ?? []
      }),

    // Entity rate statistics
    stats: orgProtectedProcedure
      .input(z.object({
        entityType: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('entity_rates')
          .select('id, margin_percentage, is_current, requires_approval')
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input?.entityType) {
          query = query.eq('entity_type', input.entityType)
        }

        const { data: items } = await query

        const currentRates = items?.filter(i => i.is_current) ?? []
        const margins = currentRates
          .map(i => Number(i.margin_percentage))
          .filter(m => !isNaN(m))

        const avgMargin = margins.length > 0
          ? (margins.reduce((sum, m) => sum + m, 0) / margins.length)
          : 0

        return {
          total: items?.length ?? 0,
          current: currentRates.length,
          pendingApproval: items?.filter(i => i.requires_approval).length ?? 0,
          avgMarginPercentage: Math.round(avgMargin * 100) / 100,
          marginRange: margins.length > 0 ? {
            min: Math.min(...margins),
            max: Math.max(...margins),
          } : null,
        }
      }),
  }),

  // ==========================================
  // APPROVALS - Rate approval workflow
  // ==========================================
  approvals: router({
    // List approvals
    list: orgProtectedProcedure
      .input(z.object({
        status: approvalStatusEnum.optional(),
        approvalType: approvalTypeEnum.optional(),
        entityRateId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('rate_approvals')
          .select(`
            *,
            requester:user_profiles!requested_by(id, full_name),
            decider:user_profiles!decided_by(id, full_name),
            entity_rate:entity_rates!entity_rate_id(id, entity_type, entity_id, bill_rate, pay_rate)
          `, { count: 'exact' })
          .eq('org_id', orgId)

        if (input.status) query = query.eq('status', input.status)
        if (input.approvalType) query = query.eq('approval_type', input.approvalType)
        if (input.entityRateId) query = query.eq('entity_rate_id', input.entityRateId)

        query = query
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list approvals:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformRateApproval) ?? [],
          total: count ?? 0,
        }
      }),

    // Get pending approvals count
    getPendingCount: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { count, error } = await adminClient
          .from('rate_approvals')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending')

        if (error) {
          console.error('Failed to get pending approvals count:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { count: count ?? 0 }
      }),

    // Approve rate
    approve: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get the approval to find the proposed rates
        const { data: approval } = await adminClient
          .from('rate_approvals')
          .select('entity_rate_id, proposed_bill_rate, proposed_pay_rate')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('status', 'pending')
          .single()

        if (!approval) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Approval request not found or already processed' })
        }

        // Update approval
        const { error } = await adminClient
          .from('rate_approvals')
          .update({
            status: 'approved',
            decided_by: user?.id,
            decided_at: new Date().toISOString(),
            decision_reason: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to approve rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Get current entity rate values
        const { data: currentRate } = await adminClient
          .from('entity_rates')
          .select('bill_rate, pay_rate')
          .eq('id', approval.entity_rate_id)
          .single()

        // Update entity rate with approved values and clear requires_approval
        const updateFields: Record<string, unknown> = {
          requires_approval: false,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          approval_notes: input.reason,
          updated_at: new Date().toISOString(),
        }

        if (approval.proposed_bill_rate !== null) {
          updateFields.bill_rate = approval.proposed_bill_rate
        }
        if (approval.proposed_pay_rate !== null) {
          updateFields.pay_rate = approval.proposed_pay_rate
        }

        await adminClient
          .from('entity_rates')
          .update(updateFields)
          .eq('id', approval.entity_rate_id)

        // Record change history
        if (currentRate) {
          await adminClient
            .from('rate_change_history')
            .insert({
              entity_rate_id: approval.entity_rate_id,
              change_type: 'approved',
              old_bill_rate: currentRate.bill_rate,
              new_bill_rate: approval.proposed_bill_rate ?? currentRate.bill_rate,
              old_pay_rate: currentRate.pay_rate,
              new_pay_rate: approval.proposed_pay_rate ?? currentRate.pay_rate,
              reason: input.reason || 'Rate approved',
              changed_by: user?.id,
            })
        }

        return { success: true }
      }),

    // Reject rate
    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get the approval
        const { data: approval } = await adminClient
          .from('rate_approvals')
          .select('entity_rate_id')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('status', 'pending')
          .single()

        if (!approval) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Approval request not found or already processed' })
        }

        // Update approval
        const { error } = await adminClient
          .from('rate_approvals')
          .update({
            status: 'rejected',
            decided_by: user?.id,
            decided_at: new Date().toISOString(),
            decision_reason: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to reject rate:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Clear requires_approval flag on entity rate
        await adminClient
          .from('entity_rates')
          .update({
            requires_approval: false,
            approval_notes: `Rejected: ${input.reason}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', approval.entity_rate_id)

        // Record change history
        await adminClient
          .from('rate_change_history')
          .insert({
            entity_rate_id: approval.entity_rate_id,
            change_type: 'rejected',
            reason: input.reason,
            changed_by: user?.id,
          })

        return { success: true }
      }),
  }),

  // ==========================================
  // UTILITY - Margin calculation
  // ==========================================
  calculateMargin: orgProtectedProcedure
    .input(z.object({
      billRate: z.number().min(0),
      payRate: z.number().min(0),
    }))
    .query(async ({ input }) => {
      const grossMargin = input.billRate - input.payRate
      const marginPercentage = input.billRate > 0
        ? Math.round(((input.billRate - input.payRate) / input.billRate * 100) * 100) / 100
        : 0
      const markupPercentage = input.payRate > 0
        ? Math.round(((input.billRate - input.payRate) / input.payRate * 100) * 100) / 100
        : 0

      // Margin quality assessment
      let quality: 'excellent' | 'good' | 'acceptable' | 'low' | 'critical'
      if (marginPercentage >= 20) quality = 'excellent'
      else if (marginPercentage >= 15) quality = 'good'
      else if (marginPercentage >= 10) quality = 'acceptable'
      else if (marginPercentage >= 5) quality = 'low'
      else quality = 'critical'

      return {
        grossMargin,
        marginPercentage,
        markupPercentage,
        quality,
      }
    }),
})
