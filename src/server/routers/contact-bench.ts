import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INPUT SCHEMAS
// ============================================

const benchTypeEnum = z.enum(['w2_internal', 'w2_vendor', '1099', 'c2c'])
const benchStatusEnum = z.enum(['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive'])
const marketingStatusEnum = z.enum(['draft', 'active', 'paused', 'archived'])
const workPreferenceEnum = z.enum(['remote', 'hybrid', 'onsite', 'flexible'])

const benchDataInput = z.object({
  contactId: z.string().uuid(),
  benchStartDate: z.string(),
  benchType: benchTypeEnum.optional(),
  benchStatus: benchStatusEnum.default('available'),
  // Work authorization
  visaType: z.string().optional(),
  visaExpiryDate: z.string().optional(),
  workAuthStatus: z.string().optional(),
  visaNotes: z.string().optional(),
  // Rates
  minAcceptableRate: z.number().min(0).optional(),
  targetRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  billRate: z.number().min(0).optional(),
  payRate: z.number().min(0).optional(),
  markupPercentage: z.number().min(0).max(100).optional(),
  // Location
  willingToRelocate: z.boolean().default(false),
  preferredLocations: z.array(z.string()).default([]),
  workPreference: workPreferenceEnum.optional(),
  // Marketing
  marketingStatus: marketingStatusEnum.default('draft'),
  marketingNotes: z.string().optional(),
  benchSalesRepId: z.string().uuid().optional(),
  // Vendor
  vendorId: z.string().uuid().optional(),
  vendorContactId: z.string().uuid().optional(),
  vendorTerms: z.string().optional(),
  // Performance
  targetEndDate: z.string().optional(),
  maxBenchDays: z.number().int().optional(),
  // Skills
  primarySkills: z.array(z.string()).default([]),
  yearsOfExperience: z.number().min(0).optional(),
  certifications: z.array(z.string()).default([]),
})


// ============================================
// HELPER FUNCTIONS
// ============================================

function transformBenchData(bd: Record<string, unknown>) {
  return {
    id: bd.id as string,
    contactId: bd.contact_id as string,
    benchStartDate: bd.bench_start_date as string,
    benchType: bd.bench_type as string | null,
    benchStatus: bd.bench_status as string,
    // Work auth
    visaType: bd.visa_type as string | null,
    visaExpiryDate: bd.visa_expiry_date as string | null,
    workAuthStatus: bd.work_auth_status as string | null,
    visaNotes: bd.visa_notes as string | null,
    // Rates
    minAcceptableRate: bd.min_acceptable_rate as number | null,
    targetRate: bd.target_rate as number | null,
    maxRate: bd.max_rate as number | null,
    currency: bd.currency as string,
    billRate: bd.bill_rate as number | null,
    payRate: bd.pay_rate as number | null,
    markupPercentage: bd.markup_percentage as number | null,
    costPerDay: bd.cost_per_day as number | null,
    // Location
    willingToRelocate: bd.willing_to_relocate as boolean,
    preferredLocations: (bd.preferred_locations as string[]) || [],
    workPreference: bd.work_preference as string | null,
    // Marketing
    marketingStatus: bd.marketing_status as string,
    marketingStartedAt: bd.marketing_started_at as string | null,
    marketingNotes: bd.marketing_notes as string | null,
    benchSalesRepId: bd.bench_sales_rep_id as string | null,
    // Vendor
    vendorId: bd.vendor_id as string | null,
    vendorContactId: bd.vendor_contact_id as string | null,
    vendorTerms: bd.vendor_terms as string | null,
    // Performance
    targetEndDate: bd.target_end_date as string | null,
    maxBenchDays: bd.max_bench_days as number | null,
    totalPlacements: bd.total_placements as number,
    lastPlacementEnd: bd.last_placement_end as string | null,
    utilizationRate: bd.utilization_rate as number | null,
    daysOnBench: bd.days_on_bench as number | null,
    // Skills
    primarySkills: (bd.primary_skills as string[]) || [],
    yearsOfExperience: bd.years_of_experience as number | null,
    certifications: (bd.certifications as string[]) || [],
    // Legacy
    legacyBenchConsultantId: bd.legacy_bench_consultant_id as string | null,
    // Audit
    createdAt: bd.created_at as string,
    updatedAt: bd.updated_at as string,
    // Joined data
    contact: bd.contact,
    vendor: bd.vendor,
    salesRep: bd.sales_rep,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactBenchRouter = router({
  // ==========================================
  // LIST - Bench consultants with extended data
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      benchType: benchTypeEnum.optional(),
      benchStatus: benchStatusEnum.optional(),
      marketingStatus: marketingStatusEnum.optional(),
      vendorId: z.string().uuid().optional(),
      benchSalesRepId: z.string().uuid().optional(),
      willingToRelocate: z.boolean().optional(),
      visaExpiringWithinDays: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['bench_start_date', 'bench_status', 'marketing_status', 'target_rate', 'created_at']).default('bench_start_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_bench_data')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, email, phone, title),
          vendor:companies!vendor_id(id, name),
          sales_rep:user_profiles!bench_sales_rep_id(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.search) {
        // Search in joined contact fields
        const { data: contactIds } = await adminClient
          .from('contacts')
          .select('id')
          .eq('org_id', orgId)
          .or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
          .limit(100)

        if (contactIds && contactIds.length > 0) {
          query = query.in('contact_id', contactIds.map(c => c.id))
        }
      }

      if (input.benchType) {
        query = query.eq('bench_type', input.benchType)
      }

      if (input.benchStatus) {
        query = query.eq('bench_status', input.benchStatus)
      }

      if (input.marketingStatus) {
        query = query.eq('marketing_status', input.marketingStatus)
      }

      if (input.vendorId) {
        query = query.eq('vendor_id', input.vendorId)
      }

      if (input.benchSalesRepId) {
        query = query.eq('bench_sales_rep_id', input.benchSalesRepId)
      }

      if (input.willingToRelocate !== undefined) {
        query = query.eq('willing_to_relocate', input.willingToRelocate)
      }

      if (input.visaExpiringWithinDays) {
        const threshold = new Date()
        threshold.setDate(threshold.getDate() + input.visaExpiringWithinDays)
        query = query.lte('visa_expiry_date', threshold.toISOString().split('T')[0])
        query = query.gte('visa_expiry_date', new Date().toISOString().split('T')[0])
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list bench consultants:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: (data || []).map(transformBenchData),
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
        .from('contact_bench_data')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, email, phone, title, linkedin_url),
          vendor:companies!vendor_id(id, name, website),
          vendor_contact:contacts!vendor_contact_id(id, first_name, last_name, email, phone),
          sales_rep:user_profiles!bench_sales_rep_id(id, full_name, avatar_url, email)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bench data not found' })
      }

      return transformBenchData(data)
    }),

  // ==========================================
  // GET BY CONTACT ID
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .select(`
          *,
          vendor:companies!vendor_id(id, name),
          sales_rep:user_profiles!bench_sales_rep_id(id, full_name)
        `)
        .eq('contact_id', input.contactId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No bench data for this contact
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return transformBenchData(data)
    }),

  // ==========================================
  // CREATE - Add bench data to contact
  // ==========================================
  create: orgProtectedProcedure
    .input(benchDataInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify contact exists and belongs to org
      const { data: contact, error: contactError } = await adminClient
        .from('contacts')
        .select('id, subtype')
        .eq('id', input.contactId)
        .eq('org_id', orgId)
        .single()

      if (contactError || !contact) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' })
      }

      // Check if bench data already exists
      const { data: existing } = await adminClient
        .from('contact_bench_data')
        .select('id')
        .eq('contact_id', input.contactId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Bench data already exists for this contact. Use update instead.',
        })
      }

      // Calculate cost per day if rates provided
      let costPerDay: number | undefined
      if (input.payRate) {
        costPerDay = input.payRate * 8 // Assuming 8 hours/day
      }

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          bench_start_date: input.benchStartDate,
          bench_type: input.benchType,
          bench_status: input.benchStatus,
          visa_type: input.visaType,
          visa_expiry_date: input.visaExpiryDate,
          work_auth_status: input.workAuthStatus,
          visa_notes: input.visaNotes,
          min_acceptable_rate: input.minAcceptableRate,
          target_rate: input.targetRate,
          max_rate: input.maxRate,
          currency: input.currency,
          bill_rate: input.billRate,
          pay_rate: input.payRate,
          markup_percentage: input.markupPercentage,
          cost_per_day: costPerDay,
          willing_to_relocate: input.willingToRelocate,
          preferred_locations: input.preferredLocations,
          work_preference: input.workPreference,
          marketing_status: input.marketingStatus,
          marketing_notes: input.marketingNotes,
          bench_sales_rep_id: input.benchSalesRepId,
          vendor_id: input.vendorId,
          vendor_contact_id: input.vendorContactId,
          vendor_terms: input.vendorTerms,
          target_end_date: input.targetEndDate,
          max_bench_days: input.maxBenchDays,
          primary_skills: input.primarySkills,
          years_of_experience: input.yearsOfExperience,
          certifications: input.certifications,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create bench data:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update contact subtype to bench
      const newSubtype = input.benchType === 'w2_vendor' || input.benchType === 'c2c'
        ? 'person_bench_vendor'
        : 'person_bench_internal'

      await adminClient
        .from('contacts')
        .update({
          subtype: newSubtype,
          bench_type: input.benchType,
          bench_status: input.benchStatus,
          bench_start_date: input.benchStartDate,
          updated_by: user?.id,
        })
        .eq('id', input.contactId)

      // Log activity
      await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: 'contact',
          entity_id: input.contactId,
          activity_type: 'status_change',
          subject: 'Added to Bench',
          description: `Contact added to bench as ${input.benchType || 'consultant'}`,
          created_by: user?.id,
        })

      return transformBenchData(data)
    }),

  // ==========================================
  // UPDATE
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      benchType: benchTypeEnum.optional(),
      benchStatus: benchStatusEnum.optional(),
      visaType: z.string().optional(),
      visaExpiryDate: z.string().nullable().optional(),
      workAuthStatus: z.string().optional(),
      visaNotes: z.string().optional(),
      minAcceptableRate: z.number().min(0).optional(),
      targetRate: z.number().min(0).optional(),
      maxRate: z.number().min(0).optional(),
      currency: z.string().optional(),
      billRate: z.number().min(0).optional(),
      payRate: z.number().min(0).optional(),
      markupPercentage: z.number().min(0).max(100).optional(),
      willingToRelocate: z.boolean().optional(),
      preferredLocations: z.array(z.string()).optional(),
      workPreference: workPreferenceEnum.optional(),
      marketingStatus: marketingStatusEnum.optional(),
      marketingNotes: z.string().optional(),
      benchSalesRepId: z.string().uuid().nullable().optional(),
      vendorId: z.string().uuid().nullable().optional(),
      vendorContactId: z.string().uuid().nullable().optional(),
      vendorTerms: z.string().optional(),
      targetEndDate: z.string().nullable().optional(),
      maxBenchDays: z.number().int().optional(),
      primarySkills: z.array(z.string()).optional(),
      yearsOfExperience: z.number().min(0).optional(),
      certifications: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_by: user?.id,
      }

      if (input.benchType !== undefined) updateData.bench_type = input.benchType
      if (input.benchStatus !== undefined) updateData.bench_status = input.benchStatus
      if (input.visaType !== undefined) updateData.visa_type = input.visaType
      if (input.visaExpiryDate !== undefined) updateData.visa_expiry_date = input.visaExpiryDate
      if (input.workAuthStatus !== undefined) updateData.work_auth_status = input.workAuthStatus
      if (input.visaNotes !== undefined) updateData.visa_notes = input.visaNotes
      if (input.minAcceptableRate !== undefined) updateData.min_acceptable_rate = input.minAcceptableRate
      if (input.targetRate !== undefined) updateData.target_rate = input.targetRate
      if (input.maxRate !== undefined) updateData.max_rate = input.maxRate
      if (input.currency !== undefined) updateData.currency = input.currency
      if (input.billRate !== undefined) updateData.bill_rate = input.billRate
      if (input.payRate !== undefined) {
        updateData.pay_rate = input.payRate
        updateData.cost_per_day = input.payRate * 8
      }
      if (input.markupPercentage !== undefined) updateData.markup_percentage = input.markupPercentage
      if (input.willingToRelocate !== undefined) updateData.willing_to_relocate = input.willingToRelocate
      if (input.preferredLocations !== undefined) updateData.preferred_locations = input.preferredLocations
      if (input.workPreference !== undefined) updateData.work_preference = input.workPreference
      if (input.marketingStatus !== undefined) {
        updateData.marketing_status = input.marketingStatus
        if (input.marketingStatus === 'active') {
          updateData.marketing_started_at = new Date().toISOString()
        }
      }
      if (input.marketingNotes !== undefined) updateData.marketing_notes = input.marketingNotes
      if (input.benchSalesRepId !== undefined) updateData.bench_sales_rep_id = input.benchSalesRepId
      if (input.vendorId !== undefined) updateData.vendor_id = input.vendorId
      if (input.vendorContactId !== undefined) updateData.vendor_contact_id = input.vendorContactId
      if (input.vendorTerms !== undefined) updateData.vendor_terms = input.vendorTerms
      if (input.targetEndDate !== undefined) updateData.target_end_date = input.targetEndDate
      if (input.maxBenchDays !== undefined) updateData.max_bench_days = input.maxBenchDays
      if (input.primarySkills !== undefined) updateData.primary_skills = input.primarySkills
      if (input.yearsOfExperience !== undefined) updateData.years_of_experience = input.yearsOfExperience
      if (input.certifications !== undefined) updateData.certifications = input.certifications

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        console.error('Failed to update bench data:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Sync key fields to contacts table
      if (input.benchType || input.benchStatus) {
        const contactUpdate: Record<string, unknown> = { updated_by: user?.id }
        if (input.benchType) contactUpdate.bench_type = input.benchType
        if (input.benchStatus) contactUpdate.bench_status = input.benchStatus

        await adminClient
          .from('contacts')
          .update(contactUpdate)
          .eq('id', data.contact_id)
      }

      return transformBenchData(data)
    }),

  // ==========================================
  // DELETE (soft)
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select('contact_id')
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update contact subtype back to regular
      if (data?.contact_id) {
        await adminClient
          .from('contacts')
          .update({
            subtype: 'person_regular',
            bench_type: null,
            bench_status: null,
            updated_by: user?.id,
          })
          .eq('id', data.contact_id)
      }

      return { success: true }
    }),

  // ==========================================
  // GET EXPIRING VISAS
  // ==========================================
  getExpiringVisas: orgProtectedProcedure
    .input(z.object({
      daysThreshold: z.number().min(1).max(365).default(90),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const threshold = new Date()
      threshold.setDate(threshold.getDate() + input.daysThreshold)

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, email, phone)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('visa_expiry_date', 'is', null)
        .lte('visa_expiry_date', threshold.toISOString().split('T')[0])
        .gte('visa_expiry_date', new Date().toISOString().split('T')[0])
        .order('visa_expiry_date', { ascending: true })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return (data || []).map(transformBenchData)
    }),

  // ==========================================
  // UPDATE MARKETING STATUS
  // ==========================================
  updateMarketingStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      marketingStatus: marketingStatusEnum,
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        marketing_status: input.marketingStatus,
        updated_by: user?.id,
      }

      if (input.marketingStatus === 'active') {
        updateData.marketing_started_at = new Date().toISOString()
      }

      if (input.notes) {
        updateData.marketing_notes = input.notes
      }

      const { data, error } = await adminClient
        .from('contact_bench_data')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .select('*, contact:contacts!contact_id(id, first_name, last_name)')
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Log activity
      await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: 'contact',
          entity_id: data.contact_id,
          activity_type: 'status_change',
          subject: 'Marketing Status Updated',
          description: `Marketing status changed to ${input.marketingStatus}`,
          created_by: user?.id,
        })

      return transformBenchData(data)
    }),

  // ==========================================
  // STATS
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      benchSalesRepId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_bench_data')
        .select('id, bench_type, bench_status, marketing_status, bill_rate, target_rate, visa_expiry_date')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.benchSalesRepId) {
        query = query.eq('bench_sales_rep_id', input.benchSalesRepId)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const items = data || []
      const now = new Date()
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)

      return {
        total: items.length,
        byStatus: {
          onboarding: items.filter(i => i.bench_status === 'onboarding').length,
          available: items.filter(i => i.bench_status === 'available').length,
          marketing: items.filter(i => i.bench_status === 'marketing').length,
          interviewing: items.filter(i => i.bench_status === 'interviewing').length,
          placed: items.filter(i => i.bench_status === 'placed').length,
          inactive: items.filter(i => i.bench_status === 'inactive').length,
        },
        byType: {
          w2_internal: items.filter(i => i.bench_type === 'w2_internal').length,
          w2_vendor: items.filter(i => i.bench_type === 'w2_vendor').length,
          '1099': items.filter(i => i.bench_type === '1099').length,
          c2c: items.filter(i => i.bench_type === 'c2c').length,
        },
        byMarketing: {
          draft: items.filter(i => i.marketing_status === 'draft').length,
          active: items.filter(i => i.marketing_status === 'active').length,
          paused: items.filter(i => i.marketing_status === 'paused').length,
          archived: items.filter(i => i.marketing_status === 'archived').length,
        },
        visasExpiringSoon: items.filter(i =>
          i.visa_expiry_date &&
          new Date(i.visa_expiry_date) >= now &&
          new Date(i.visa_expiry_date) <= thirtyDays
        ).length,
        avgTargetRate: items.length > 0
          ? items.reduce((sum, i) => sum + (i.target_rate || 0), 0) / items.filter(i => i.target_rate).length
          : 0,
      }
    }),

  // ==========================================
  // CONVERT TO BENCH - Convert candidate to bench consultant
  // ==========================================
  convertToBench: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      benchType: benchTypeEnum,
      benchStartDate: z.string(),
      visaType: z.string().optional(),
      visaExpiryDate: z.string().optional(),
      targetRate: z.number().min(0).optional(),
      benchSalesRepId: z.string().uuid().optional(),
      vendorId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify contact exists
      const { data: contact, error: contactError } = await adminClient
        .from('contacts')
        .select('id, first_name, last_name, subtype')
        .eq('id', input.contactId)
        .eq('org_id', orgId)
        .single()

      if (contactError || !contact) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' })
      }

      // Check if already a bench consultant
      const { data: existing } = await adminClient
        .from('contact_bench_data')
        .select('id')
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This contact is already a bench consultant',
        })
      }

      // Create bench data
      const { data, error } = await adminClient
        .from('contact_bench_data')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          bench_start_date: input.benchStartDate,
          bench_type: input.benchType,
          bench_status: 'onboarding',
          visa_type: input.visaType,
          visa_expiry_date: input.visaExpiryDate,
          target_rate: input.targetRate,
          marketing_status: 'draft',
          bench_sales_rep_id: input.benchSalesRepId,
          vendor_id: input.vendorId,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update contact subtype
      const newSubtype = input.benchType === 'w2_vendor' || input.benchType === 'c2c'
        ? 'person_bench_vendor'
        : 'person_bench_internal'

      await adminClient
        .from('contacts')
        .update({
          subtype: newSubtype,
          bench_type: input.benchType,
          bench_status: 'onboarding',
          bench_start_date: input.benchStartDate,
          updated_by: user?.id,
        })
        .eq('id', input.contactId)

      // Log activity
      await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: 'contact',
          entity_id: input.contactId,
          activity_type: 'status_change',
          subject: 'Converted to Bench Consultant',
          description: `${contact.first_name} ${contact.last_name} converted to ${input.benchType} bench consultant`,
          created_by: user?.id,
        })

      return transformBenchData(data)
    }),
})
