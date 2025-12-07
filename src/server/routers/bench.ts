import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// VENDORS SUB-ROUTER
// ============================================

const vendorsRouter = router({
  // List vendors with filtering
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.enum(['direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms', 'all']).default('all'),
      tier: z.enum(['preferred', 'standard', 'new', 'all']).default('all'),
      status: z.enum(['active', 'inactive', 'all']).default('active'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('vendors')
        .select('*, primary_contact:vendor_contacts!vendor_id(id, name, email, phone, is_primary)', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('name')

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%`)
      }
      if (input.type !== 'all') {
        query = query.eq('type', input.type)
      }
      if (input.tier !== 'all') {
        query = query.eq('tier', input.tier)
      }
      if (input.status !== 'all') {
        query = query.eq('status', input.status)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { items: data || [], total: count || 0 }
    }),

  // Get vendor by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('vendors')
        .select(`
          *,
          contacts:vendor_contacts(*),
          terms:vendor_terms(*),
          performance:vendor_performance(*)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      return data
    }),

  // Create vendor
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(200),
      type: z.enum(['direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms']),
      tier: z.enum(['preferred', 'standard', 'new']).optional(),
      website: z.string().url().optional().or(z.literal('')),
      industryFocus: z.array(z.string()).optional(),
      geographicFocus: z.array(z.string()).optional(),
      notes: z.string().optional(),
      // Primary contact
      primaryContactName: z.string().optional(),
      primaryContactEmail: z.string().email().optional(),
      primaryContactPhone: z.string().optional(),
      primaryContactTitle: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: vendor, error } = await adminClient
        .from('vendors')
        .insert({
          org_id: orgId,
          name: input.name,
          type: input.type,
          tier: input.tier || 'standard',
          status: 'active',
          website: input.website || null,
          industry_focus: input.industryFocus || [],
          geographic_focus: input.geographicFocus || [],
          notes: input.notes || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create primary contact if provided
      if (input.primaryContactEmail && input.primaryContactName) {
        await adminClient
          .from('vendor_contacts')
          .insert({
            vendor_id: vendor.id,
            name: input.primaryContactName,
            email: input.primaryContactEmail,
            phone: input.primaryContactPhone || null,
            title: input.primaryContactTitle || null,
            is_primary: true,
            created_by: user?.id,
          })
      }

      return vendor
    }),

  // Update vendor
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(200).optional(),
      type: z.enum(['direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms']).optional(),
      tier: z.enum(['preferred', 'standard', 'new']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      website: z.string().url().optional().or(z.literal('')),
      industryFocus: z.array(z.string()).optional(),
      geographicFocus: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.type !== undefined) updateData.type = input.type
      if (input.tier !== undefined) updateData.tier = input.tier
      if (input.status !== undefined) updateData.status = input.status
      if (input.website !== undefined) updateData.website = input.website || null
      if (input.industryFocus !== undefined) updateData.industry_focus = input.industryFocus
      if (input.geographicFocus !== undefined) updateData.geographic_focus = input.geographicFocus
      if (input.notes !== undefined) updateData.notes = input.notes

      const { data, error } = await adminClient
        .from('vendors')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete vendor (soft delete)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('vendors')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add contact to vendor
  addContact: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      department: z.string().optional(),
      isPrimary: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      // If setting as primary, unset other primaries
      if (input.isPrimary) {
        await adminClient
          .from('vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', input.vendorId)
      }

      const { data, error } = await adminClient
        .from('vendor_contacts')
        .insert({
          vendor_id: input.vendorId,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          title: input.title || null,
          department: input.department || null,
          is_primary: input.isPrimary,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update contact
  updateContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      vendorId: z.string().uuid(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      department: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // If setting as primary, unset other primaries
      if (input.isPrimary) {
        await adminClient
          .from('vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', input.vendorId)
      }

      const updateData: Record<string, unknown> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.email !== undefined) updateData.email = input.email
      if (input.phone !== undefined) updateData.phone = input.phone
      if (input.title !== undefined) updateData.title = input.title
      if (input.department !== undefined) updateData.department = input.department
      if (input.isPrimary !== undefined) updateData.is_primary = input.isPrimary

      const { data, error } = await adminClient
        .from('vendor_contacts')
        .update(updateData)
        .eq('id', input.contactId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete contact
  deleteContact: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('vendor_contacts')
        .delete()
        .eq('id', input.contactId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Update vendor terms
  updateTerms: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
      paymentTermsDays: z.number().min(0).max(180).optional(),
      markupMinPercent: z.number().min(0).max(100).optional(),
      markupMaxPercent: z.number().min(0).max(100).optional(),
      preferredRateRangeMin: z.number().optional(),
      preferredRateRangeMax: z.number().optional(),
      contractType: z.string().optional(),
      contractExpiry: z.string().optional(),
      msaOnFile: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('vendor_terms')
        .upsert({
          vendor_id: input.vendorId,
          payment_terms_days: input.paymentTermsDays,
          markup_min_percent: input.markupMinPercent,
          markup_max_percent: input.markupMaxPercent,
          preferred_rate_range_min: input.preferredRateRangeMin,
          preferred_rate_range_max: input.preferredRateRangeMax,
          contract_type: input.contractType,
          contract_expiry: input.contractExpiry,
          msa_on_file: input.msaOnFile,
        }, { onConflict: 'vendor_id' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Get vendor performance
  getPerformance: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      let query = adminClient
        .from('vendor_performance')
        .select('*')
        .eq('vendor_id', input.vendorId)
        .order('period', { ascending: false })

      if (input.periodStart) {
        query = query.gte('period', input.periodStart)
      }
      if (input.periodEnd) {
        query = query.lte('period', input.periodEnd)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // Get job orders for vendor
  getJobOrders: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
      status: z.enum(['new', 'working', 'filled', 'closed', 'on_hold', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      let query = adminClient
        .from('job_orders')
        .select(`
          *,
          submissions:job_order_submissions(count)
        `)
        .eq('vendor_id', input.vendorId)
        .is('deleted_at', null)
        .order('received_at', { ascending: false })

      if (input.status !== 'all') {
        query = query.eq('status', input.status)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),
})

// ============================================
// TALENT (BENCH CONSULTANTS) SUB-ROUTER
// ============================================

const talentRouter = router({
  // List bench consultants
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive', 'all']).default('all'),
      visaType: z.string().optional(),
      marketingStatus: z.enum(['draft', 'active', 'paused', 'archived', 'all']).default('all'),
      benchSalesRepId: z.string().uuid().optional(),
      willingRelocate: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('bench_consultants')
        .select(`
          *,
          candidate:user_profiles!candidate_id(id, full_name, email, phone, avatar_url, location),
          bench_sales_rep:user_profiles!bench_sales_rep_id(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('bench_start_date', { ascending: false })

      if (input.search) {
        // We'll do a simpler search approach
        query = query.textSearch('candidate.full_name', input.search, { type: 'plain' })
      }
      if (input.status !== 'all') {
        query = query.eq('status', input.status)
      }
      if (input.visaType) {
        query = query.eq('visa_type', input.visaType)
      }
      if (input.marketingStatus !== 'all') {
        query = query.eq('marketing_status', input.marketingStatus)
      }
      if (input.benchSalesRepId) {
        query = query.eq('bench_sales_rep_id', input.benchSalesRepId)
      }
      if (input.willingRelocate !== undefined) {
        query = query.eq('willing_relocate', input.willingRelocate)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { items: data || [], total: count || 0 }
    }),

  // Get talent by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('bench_consultants')
        .select(`
          *,
          candidate:user_profiles!candidate_id(id, full_name, email, phone, avatar_url, location),
          bench_sales_rep:user_profiles!bench_sales_rep_id(id, full_name, avatar_url),
          skills:consultant_skills_matrix(*),
          submissions:job_order_submissions(*, job_order:job_orders(*))
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Talent not found' })
      }

      return data
    }),

  // Create bench consultant (onboard talent)
  create: orgProtectedProcedure
    .input(z.object({
      candidateId: z.string().uuid(),
      benchStartDate: z.string(),
      visaType: z.string().optional(),
      visaExpiryDate: z.string().optional(),
      workAuthStatus: z.string().optional(),
      minAcceptableRate: z.number().optional(),
      targetRate: z.number().optional(),
      currency: z.string().default('USD'),
      willingRelocate: z.boolean().default(false),
      preferredLocations: z.array(z.string()).optional(),
      benchSalesRepId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('bench_consultants')
        .insert({
          org_id: orgId,
          candidate_id: input.candidateId,
          status: 'onboarding',
          bench_start_date: input.benchStartDate,
          visa_type: input.visaType || null,
          visa_expiry_date: input.visaExpiryDate || null,
          work_auth_status: input.workAuthStatus || null,
          min_acceptable_rate: input.minAcceptableRate || null,
          target_rate: input.targetRate || null,
          currency: input.currency,
          willing_relocate: input.willingRelocate,
          preferred_locations: input.preferredLocations || [],
          bench_sales_rep_id: input.benchSalesRepId || user?.id,
          marketing_status: 'draft',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'This candidate is already on bench' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update talent
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive']).optional(),
      visaType: z.string().optional(),
      visaExpiryDate: z.string().optional(),
      workAuthStatus: z.string().optional(),
      minAcceptableRate: z.number().optional(),
      targetRate: z.number().optional(),
      willingRelocate: z.boolean().optional(),
      preferredLocations: z.array(z.string()).optional(),
      marketingStatus: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
      benchSalesRepId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {}
      if (input.status !== undefined) updateData.status = input.status
      if (input.visaType !== undefined) updateData.visa_type = input.visaType
      if (input.visaExpiryDate !== undefined) updateData.visa_expiry_date = input.visaExpiryDate
      if (input.workAuthStatus !== undefined) updateData.work_auth_status = input.workAuthStatus
      if (input.minAcceptableRate !== undefined) updateData.min_acceptable_rate = input.minAcceptableRate
      if (input.targetRate !== undefined) updateData.target_rate = input.targetRate
      if (input.willingRelocate !== undefined) updateData.willing_relocate = input.willingRelocate
      if (input.preferredLocations !== undefined) updateData.preferred_locations = input.preferredLocations
      if (input.marketingStatus !== undefined) updateData.marketing_status = input.marketingStatus
      if (input.benchSalesRepId !== undefined) updateData.bench_sales_rep_id = input.benchSalesRepId

      const { data, error } = await adminClient
        .from('bench_consultants')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete talent (soft delete)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('bench_consultants')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add skill to consultant
  addSkill: orgProtectedProcedure
    .input(z.object({
      consultantId: z.string().uuid(),
      skillName: z.string(),
      proficiencyLevel: z.number().min(1).max(5),
      yearsExperience: z.number().min(0).optional(),
      lastUsedDate: z.string().optional(),
      isCertified: z.boolean().default(false),
      certificationName: z.string().optional(),
      certificationExpiry: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('consultant_skills_matrix')
        .insert({
          consultant_id: input.consultantId,
          skill_name: input.skillName,
          proficiency_level: input.proficiencyLevel,
          years_experience: input.yearsExperience,
          last_used_date: input.lastUsedDate,
          is_certified: input.isCertified,
          certification_name: input.certificationName,
          certification_expiry: input.certificationExpiry,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update skill
  updateSkill: orgProtectedProcedure
    .input(z.object({
      skillId: z.string().uuid(),
      skillName: z.string().optional(),
      proficiencyLevel: z.number().min(1).max(5).optional(),
      yearsExperience: z.number().min(0).optional(),
      lastUsedDate: z.string().optional(),
      isCertified: z.boolean().optional(),
      certificationName: z.string().optional(),
      certificationExpiry: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {}
      if (input.skillName !== undefined) updateData.skill_name = input.skillName
      if (input.proficiencyLevel !== undefined) updateData.proficiency_level = input.proficiencyLevel
      if (input.yearsExperience !== undefined) updateData.years_experience = input.yearsExperience
      if (input.lastUsedDate !== undefined) updateData.last_used_date = input.lastUsedDate
      if (input.isCertified !== undefined) updateData.is_certified = input.isCertified
      if (input.certificationName !== undefined) updateData.certification_name = input.certificationName
      if (input.certificationExpiry !== undefined) updateData.certification_expiry = input.certificationExpiry

      const { data, error } = await adminClient
        .from('consultant_skills_matrix')
        .update(updateData)
        .eq('id', input.skillId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Remove skill
  removeSkill: orgProtectedProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('consultant_skills_matrix')
        .delete()
        .eq('id', input.skillId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Get expiring visas
  getExpiringVisas: orgProtectedProcedure
    .input(z.object({
      daysAhead: z.number().default(90),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      const { data, error } = await adminClient
        .from('bench_consultants')
        .select(`
          id,
          visa_type,
          visa_expiry_date,
          candidate:user_profiles!candidate_id(id, full_name, email)
        `)
        .eq('org_id', orgId)
        .not('visa_expiry_date', 'is', null)
        .lte('visa_expiry_date', futureDate.toISOString())
        .order('visa_expiry_date')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),
})

// ============================================
// JOB ORDERS SUB-ROUTER
// ============================================

const jobOrdersRouter = router({
  // List job orders
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      vendorId: z.string().uuid().optional(),
      status: z.enum(['new', 'working', 'filled', 'closed', 'on_hold', 'all']).default('all'),
      priority: z.enum(['low', 'medium', 'high', 'urgent', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('job_orders')
        .select(`
          *,
          vendor:vendors!vendor_id(id, name, type, tier),
          submissions:job_order_submissions(count)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('received_at', { ascending: false })

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,client_name.ilike.%${input.search}%`)
      }
      if (input.vendorId) {
        query = query.eq('vendor_id', input.vendorId)
      }
      if (input.status !== 'all') {
        query = query.eq('status', input.status)
      }
      if (input.priority !== 'all') {
        query = query.eq('priority', input.priority)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { items: data || [], total: count || 0 }
    }),

  // Get job order by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_orders')
        .select(`
          *,
          vendor:vendors!vendor_id(*),
          requirements:job_order_requirements(*),
          skills:job_order_skills(*),
          submissions:job_order_submissions(
            *,
            consultant:bench_consultants(
              *,
              candidate:user_profiles!candidate_id(id, full_name, email, avatar_url)
            )
          ),
          notes:job_order_notes(*)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job order not found' })
      }

      return data
    }),

  // Create job order
  create: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid().optional(),
      clientName: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      location: z.string().optional(),
      workMode: z.enum(['onsite', 'remote', 'hybrid']).optional(),
      rateType: z.enum(['hourly', 'daily', 'monthly', 'annual']).default('hourly'),
      billRate: z.number().optional(),
      durationMonths: z.number().optional(),
      positions: z.number().default(1),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      source: z.enum(['email', 'portal', 'call', 'referral']).default('email'),
      responseDueAt: z.string().optional(),
      originalSourceUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_orders')
        .insert({
          org_id: orgId,
          vendor_id: input.vendorId || null,
          client_name: input.clientName || null,
          title: input.title,
          description: input.description || null,
          location: input.location || null,
          work_mode: input.workMode || null,
          rate_type: input.rateType,
          bill_rate: input.billRate || null,
          duration_months: input.durationMonths || null,
          positions: input.positions,
          status: 'new',
          priority: input.priority,
          source: input.source,
          response_due_at: input.responseDueAt || null,
          original_source_url: input.originalSourceUrl || null,
          received_at: new Date().toISOString(),
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update job order
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      workMode: z.enum(['onsite', 'remote', 'hybrid']).optional(),
      billRate: z.number().optional(),
      durationMonths: z.number().optional(),
      positions: z.number().optional(),
      status: z.enum(['new', 'working', 'filled', 'closed', 'on_hold']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {}
      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined) updateData.description = input.description
      if (input.location !== undefined) updateData.location = input.location
      if (input.workMode !== undefined) updateData.work_mode = input.workMode
      if (input.billRate !== undefined) updateData.bill_rate = input.billRate
      if (input.durationMonths !== undefined) updateData.duration_months = input.durationMonths
      if (input.positions !== undefined) updateData.positions = input.positions
      if (input.status !== undefined) updateData.status = input.status
      if (input.priority !== undefined) updateData.priority = input.priority

      const { data, error } = await adminClient
        .from('job_orders')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete job order (soft delete)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('job_orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add requirement to job order
  addRequirement: orgProtectedProcedure
    .input(z.object({
      jobOrderId: z.string().uuid(),
      requirement: z.string(),
      type: z.string().optional(),
      priority: z.enum(['must_have', 'nice_to_have']).default('must_have'),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_requirements')
        .insert({
          order_id: input.jobOrderId,
          requirement: input.requirement,
          type: input.type,
          priority: input.priority,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete requirement
  deleteRequirement: orgProtectedProcedure
    .input(z.object({ requirementId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('job_order_requirements')
        .delete()
        .eq('id', input.requirementId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add skill requirement
  addSkillRequirement: orgProtectedProcedure
    .input(z.object({
      jobOrderId: z.string().uuid(),
      skillName: z.string(),
      yearsRequired: z.number().min(0).optional(),
      proficiencyRequired: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_skills')
        .insert({
          order_id: input.jobOrderId,
          skill_name: input.skillName,
          years_required: input.yearsRequired,
          proficiency_required: input.proficiencyRequired,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete skill requirement
  deleteSkillRequirement: orgProtectedProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('job_order_skills')
        .delete()
        .eq('id', input.skillId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add note to job order
  addNote: orgProtectedProcedure
    .input(z.object({
      jobOrderId: z.string().uuid(),
      note: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_notes')
        .insert({
          order_id: input.jobOrderId,
          note: input.note,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),
})

// ============================================
// SUBMISSIONS SUB-ROUTER
// ============================================

const submissionsRouter = router({
  // Submit talent to job order
  submitToJobOrder: orgProtectedProcedure
    .input(z.object({
      jobOrderId: z.string().uuid(),
      consultantId: z.string().uuid(),
      submittedRate: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_submissions')
        .insert({
          order_id: input.jobOrderId,
          consultant_id: input.consultantId,
          status: 'submitted',
          submitted_rate: input.submittedRate || null,
          notes: input.notes || null,
          submitted_at: new Date().toISOString(),
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'This talent is already submitted to this job order' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update consultant status to 'marketing' if currently 'available'
      await adminClient
        .from('bench_consultants')
        .update({ status: 'marketing' })
        .eq('id', input.consultantId)
        .eq('status', 'available')

      return data
    }),

  // Update submission status
  updateStatus: orgProtectedProcedure
    .input(z.object({
      submissionId: z.string().uuid(),
      status: z.enum(['submitted', 'shortlisted', 'interview_requested', 'interviewing', 'rejected', 'offered', 'accepted', 'placed']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        status: input.status,
      }

      if (input.notes) {
        updateData.notes = input.notes
      }

      // Track response time for certain statuses
      if (['shortlisted', 'rejected', 'interview_requested'].includes(input.status)) {
        updateData.client_response_at = new Date().toISOString()
      }

      const { data, error } = await adminClient
        .from('job_order_submissions')
        .update(updateData)
        .eq('id', input.submissionId)
        .select(`
          *,
          consultant:bench_consultants(id, status)
        `)
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update consultant status based on submission status
      if (data?.consultant?.id) {
        let consultantStatus: string | null = null
        if (input.status === 'interviewing' || input.status === 'interview_requested') {
          consultantStatus = 'interviewing'
        } else if (input.status === 'placed') {
          consultantStatus = 'placed'
        } else if (input.status === 'rejected') {
          // Check if they have other active submissions
          const { count } = await adminClient
            .from('job_order_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('consultant_id', data.consultant.id)
            .not('status', 'in', '(rejected,placed)')

          if (count === 0) {
            consultantStatus = 'available'
          }
        }

        if (consultantStatus) {
          await adminClient
            .from('bench_consultants')
            .update({ status: consultantStatus })
            .eq('id', data.consultant.id)
        }
      }

      return data
    }),

  // Get submission by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_submissions')
        .select(`
          *,
          job_order:job_orders(*, vendor:vendors(id, name)),
          consultant:bench_consultants(
            *,
            candidate:user_profiles!candidate_id(id, full_name, email, avatar_url)
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' })
      }

      return data
    }),

  // List submissions by job order
  listByJobOrder: orgProtectedProcedure
    .input(z.object({ jobOrderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_submissions')
        .select(`
          *,
          consultant:bench_consultants(
            *,
            candidate:user_profiles!candidate_id(id, full_name, email, avatar_url)
          )
        `)
        .eq('order_id', input.jobOrderId)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // List submissions by consultant
  listByConsultant: orgProtectedProcedure
    .input(z.object({ consultantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_order_submissions')
        .select(`
          *,
          job_order:job_orders(*, vendor:vendors(id, name))
        `)
        .eq('consultant_id', input.consultantId)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // Withdraw submission
  withdraw: orgProtectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('job_order_submissions')
        .delete()
        .eq('id', input.submissionId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Cross-workflow: Submit bench talent to client job (ATS)
  submitToClientJob: orgProtectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      consultantId: z.string().uuid(),
      submittedRate: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get the consultant's candidate_id to create the submission
      const { data: consultant, error: consultantError } = await adminClient
        .from('bench_consultants')
        .select('candidate_id')
        .eq('id', input.consultantId)
        .eq('org_id', orgId)
        .single()

      if (consultantError || !consultant?.candidate_id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Consultant not found or has no candidate profile' })
      }

      // Create submission in the ATS submissions table
      const { data, error } = await adminClient
        .from('submissions')
        .insert({
          org_id: orgId,
          job_id: input.jobId,
          candidate_id: consultant.candidate_id,
          status: 'submitted',
          submitted_rate: input.submittedRate || null,
          notes: input.notes || null,
          source: 'bench_sales',
          submitted_at: new Date().toISOString(),
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'This talent is already submitted to this job' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update consultant status to 'marketing' if currently 'available'
      await adminClient
        .from('bench_consultants')
        .update({ status: 'marketing' })
        .eq('id', input.consultantId)
        .eq('status', 'available')

      return data
    }),

  // Get available jobs for cross-workflow submission
  getAvailableJobs: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('jobs')
        .select(`
          id,
          title,
          status,
          location,
          work_mode,
          bill_rate,
          account:accounts(id, name)
        `)
        .eq('org_id', orgId)
        .in('status', ['open', 'sourcing', 'interviewing'])
        .order('created_at', { ascending: false })

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%`)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),
})

// ============================================
// HOTLISTS SUB-ROUTER
// ============================================

const hotlistsRouter = router({
  // List hotlists
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('hotlists')
        .select(`
          *,
          consultants:hotlist_consultants(count),
          created_by_user:user_profiles!created_by(id, full_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (input.search) {
        query = query.ilike('name', `%${input.search}%`)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // Get hotlist by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('hotlists')
        .select(`
          *,
          consultants:hotlist_consultants(
            *,
            consultant:bench_consultants(
              *,
              candidate:user_profiles!candidate_id(id, full_name, email, avatar_url)
            )
          )
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hotlist not found' })
      }

      return data
    }),

  // Create hotlist
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      purpose: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('hotlists')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description || null,
          purpose: input.purpose || 'general',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update hotlist
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      purpose: z.string().optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.purpose !== undefined) updateData.purpose = input.purpose
      if (input.status !== undefined) updateData.status = input.status

      const { data, error } = await adminClient
        .from('hotlists')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Delete hotlist
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('hotlists')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add consultant to hotlist
  addConsultant: orgProtectedProcedure
    .input(z.object({
      hotlistId: z.string().uuid(),
      consultantId: z.string().uuid(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      // Get current max position
      const { data: existing } = await adminClient
        .from('hotlist_consultants')
        .select('position_order')
        .eq('hotlist_id', input.hotlistId)
        .order('position_order', { ascending: false })
        .limit(1)

      const nextPosition = (existing?.[0]?.position_order || 0) + 1

      const { data, error } = await adminClient
        .from('hotlist_consultants')
        .insert({
          hotlist_id: input.hotlistId,
          consultant_id: input.consultantId,
          position_order: nextPosition,
          notes: input.notes || null,
          added_at: new Date().toISOString(),
          added_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Consultant already in hotlist' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Remove consultant from hotlist
  removeConsultant: orgProtectedProcedure
    .input(z.object({
      hotlistId: z.string().uuid(),
      consultantId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('hotlist_consultants')
        .delete()
        .eq('hotlist_id', input.hotlistId)
        .eq('consultant_id', input.consultantId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Reorder consultants in hotlist
  reorderConsultants: orgProtectedProcedure
    .input(z.object({
      hotlistId: z.string().uuid(),
      consultantIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      // Update positions based on array order
      const updates = input.consultantIds.map((consultantId, index) =>
        adminClient
          .from('hotlist_consultants')
          .update({ position_order: index + 1 })
          .eq('hotlist_id', input.hotlistId)
          .eq('consultant_id', consultantId)
      )

      await Promise.all(updates)

      return { success: true }
    }),
})

// ============================================
// MARKETING SUB-ROUTER
// ============================================

const marketingRouter = router({
  // Get marketing profile for consultant
  getProfile: orgProtectedProcedure
    .input(z.object({ consultantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('marketing_profiles')
        .select(`
          *,
          formats:marketing_formats(*)
        `)
        .eq('consultant_id', input.consultantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || null
    }),

  // Create or update marketing profile
  upsertProfile: orgProtectedProcedure
    .input(z.object({
      consultantId: z.string().uuid(),
      headline: z.string().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      status: z.enum(['draft', 'pending_approval', 'approved', 'published']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      // Check if profile exists
      const { data: existing } = await adminClient
        .from('marketing_profiles')
        .select('id')
        .eq('consultant_id', input.consultantId)
        .maybeSingle()

      if (existing) {
        // Update
        const { data, error } = await adminClient
          .from('marketing_profiles')
          .update({
            headline: input.headline,
            summary: input.summary,
            highlights: input.highlights,
            status: input.status || 'draft',
            updated_by: user?.id,
          })
          .eq('consultant_id', input.consultantId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      } else {
        // Insert
        const { data, error } = await adminClient
          .from('marketing_profiles')
          .insert({
            consultant_id: input.consultantId,
            headline: input.headline,
            summary: input.summary,
            highlights: input.highlights,
            status: input.status || 'draft',
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }
    }),

  // Update profile status
  updateProfileStatus: orgProtectedProcedure
    .input(z.object({
      consultantId: z.string().uuid(),
      status: z.enum(['draft', 'pending_approval', 'approved', 'published']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        status: input.status,
        updated_by: user?.id,
      }

      if (input.status === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { data, error } = await adminClient
        .from('marketing_profiles')
        .update(updateData)
        .eq('consultant_id', input.consultantId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),
})

// ============================================
// IMMIGRATION SUB-ROUTER
// ============================================

const immigrationRouter = router({
  // List immigration cases for a consultant
  listCases: orgProtectedProcedure
    .input(z.object({ consultantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('immigration_cases')
        .select(`
          *,
          attorney:immigration_attorneys(*),
          documents:immigration_documents(*),
          timelines:immigration_timelines(*)
        `)
        .eq('consultant_id', input.consultantId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // Get single immigration case
  getCase: orgProtectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('immigration_cases')
        .select(`
          *,
          attorney:immigration_attorneys(*),
          documents:immigration_documents(*),
          timelines:immigration_timelines(*)
        `)
        .eq('id', input.caseId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Immigration case not found' })
      }

      return data
    }),

  // Create immigration case
  createCase: orgProtectedProcedure
    .input(z.object({
      consultantId: z.string().uuid(),
      caseType: z.string(),
      status: z.string().default('pending'),
      attorneyId: z.string().uuid().optional(),
      filingDate: z.string().optional(),
      priorityDate: z.string().optional(),
      receiptNumber: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('immigration_cases')
        .insert({
          consultant_id: input.consultantId,
          case_type: input.caseType,
          status: input.status,
          attorney_id: input.attorneyId || null,
          filing_date: input.filingDate || null,
          priority_date: input.priorityDate || null,
          receipt_number: input.receiptNumber || null,
          notes: input.notes || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update immigration case
  updateCase: orgProtectedProcedure
    .input(z.object({
      caseId: z.string().uuid(),
      status: z.string().optional(),
      attorneyId: z.string().uuid().optional(),
      filingDate: z.string().optional(),
      priorityDate: z.string().optional(),
      receiptNumber: z.string().optional(),
      approvalDate: z.string().optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = { updated_by: user?.id }
      if (input.status !== undefined) updateData.status = input.status
      if (input.attorneyId !== undefined) updateData.attorney_id = input.attorneyId
      if (input.filingDate !== undefined) updateData.filing_date = input.filingDate
      if (input.priorityDate !== undefined) updateData.priority_date = input.priorityDate
      if (input.receiptNumber !== undefined) updateData.receipt_number = input.receiptNumber
      if (input.approvalDate !== undefined) updateData.approval_date = input.approvalDate
      if (input.expiryDate !== undefined) updateData.expiry_date = input.expiryDate
      if (input.notes !== undefined) updateData.notes = input.notes

      const { data, error } = await adminClient
        .from('immigration_cases')
        .update(updateData)
        .eq('id', input.caseId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Add timeline event to case
  addTimelineEvent: orgProtectedProcedure
    .input(z.object({
      caseId: z.string().uuid(),
      eventType: z.string(),
      eventDate: z.string(),
      description: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('immigration_timelines')
        .insert({
          case_id: input.caseId,
          event_type: input.eventType,
          event_date: input.eventDate,
          description: input.description || null,
          notes: input.notes || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Get expiring visas across all consultants
  getExpiringVisas: orgProtectedProcedure
    .input(z.object({
      daysAhead: z.number().default(90),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      const { data, error } = await adminClient
        .from('bench_consultants')
        .select(`
          id,
          visa_type,
          visa_expiry_date,
          candidate:user_profiles!candidate_id(id, full_name, email)
        `)
        .eq('org_id', orgId)
        .not('visa_expiry_date', 'is', null)
        .lte('visa_expiry_date', futureDate.toISOString())
        .gte('visa_expiry_date', new Date().toISOString())
        .order('visa_expiry_date')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // List attorneys
  listAttorneys: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('immigration_attorneys')
        .select('*')
        .eq('org_id', orgId)
        .order('name')

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,firm_name.ilike.%${input.search}%`)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),
})

// ============================================
// MAIN BENCH ROUTER
// ============================================

export const benchRouter = router({
  vendors: vendorsRouter,
  talent: talentRouter,
  jobOrders: jobOrdersRouter,
  submissions: submissionsRouter,
  hotlists: hotlistsRouter,
  marketing: marketingRouter,
  immigration: immigrationRouter,
})
