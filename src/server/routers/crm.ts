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
// CRM ROUTER - Accounts, Leads, Deals, Contacts
// ============================================

export const crmRouter = router({
  // ============================================
  // ACCOUNTS
  // ============================================
  accounts: router({
    // List accounts with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['active', 'inactive', 'prospect', 'all']).default('all'),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('accounts')
          .select('*, owner:user_profiles!owner_id(id, full_name)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('name')

        if (input.search) {
          query = query.or(`name.ilike.%${input.search}%,industry.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }

        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(a => ({
            id: a.id,
            name: a.name,
            industry: a.industry,
            status: a.status,
            website: a.website,
            phone: a.phone,
            address: a.address,
            city: a.city,
            state: a.state,
            country: a.country,
            owner: a.owner,
            lastContactDate: a.last_contact_date,
            createdAt: a.created_at,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // Get account by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('accounts')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), contacts(*), jobs:jobs!account_id(id, title, status)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' })
        }

        return data
      }),

    // Get account health scores
    getHealth: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.ownerId || user?.id

        const { data: accounts } = await adminClient
          .from('accounts')
          .select(`
            id, name, industry, status, last_contact_date, nps_score,
            jobs(id, status),
            placements(id, billing_rate, hours_billed)
          `)
          .eq('org_id', orgId)
          .eq('owner_id', ownerId)
          .is('deleted_at', null)
          .order('name')

        const now = new Date()
        const results = accounts?.map(account => {
          // Calculate health score
          const lastContact = account.last_contact_date ? new Date(account.last_contact_date) : null
          const daysSinceContact = lastContact
            ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
            : 999

          const jobs = account.jobs as Array<{ id: string; status: string }> | null
          const activeJobs = jobs?.filter(j => j.status === 'active').length ?? 0

          const placements = account.placements as Array<{ id: string; billing_rate: number; hours_billed: number }> | null
          const ytdRevenue = placements?.reduce((sum, p) => sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0) ?? 0

          // Health score calculation
          let healthScore = 100
          if (daysSinceContact > 14) healthScore -= 30
          else if (daysSinceContact > 7) healthScore -= 15
          if (activeJobs === 0) healthScore -= 20
          if (!account.nps_score || account.nps_score < 7) healthScore -= 20
          if (ytdRevenue === 0) healthScore -= 10

          return {
            id: account.id,
            name: account.name,
            industry: account.industry,
            status: account.status,
            healthScore: Math.max(0, healthScore),
            healthStatus: healthScore >= 70 ? 'healthy' : healthScore >= 40 ? 'attention' : 'at_risk',
            activeJobs,
            ytdRevenue,
            npsScore: account.nps_score,
            daysSinceContact,
            lastContactDate: account.last_contact_date,
          }
        }) ?? []

        // Sort by health score (worst first)
        results.sort((a, b) => a.healthScore - b.healthScore)

        const summary = {
          total: results.length,
          healthy: results.filter(r => r.healthStatus === 'healthy').length,
          needsAttention: results.filter(r => r.healthStatus === 'attention').length,
          atRisk: results.filter(r => r.healthStatus === 'at_risk').length,
        }

        return { accounts: results, summary }
      }),

    // Get my accounts (for recruiter)
    getMy: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('accounts')
          .select(`
            id, name, industry, status, last_contact_date, nps_score,
            jobs(id, status)
          `)
          .eq('org_id', orgId)
          .eq('owner_id', user?.id)
          .is('deleted_at', null)
          .order('last_contact_date', { ascending: false, nullsFirst: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(a => ({
          id: a.id,
          name: a.name,
          industry: a.industry,
          status: a.status,
          lastContactDate: a.last_contact_date,
          npsScore: a.nps_score,
          activeJobs: (a.jobs as Array<{ status: string }> | null)?.filter(j => j.status === 'active').length ?? 0,
        })) ?? []
      }),

    // Create new account
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(2).max(200),
        industry: z.string().optional(),
        companyType: z.enum(['direct_client', 'implementation_partner', 'staffing_vendor']).default('direct_client'),
        status: z.enum(['prospect', 'active', 'inactive']).default('prospect'),
        tier: z.enum(['preferred', 'strategic', 'exclusive']).optional(),
        website: z.string().url().optional().or(z.literal('')),
        phone: z.string().optional(),
        headquartersLocation: z.string().optional(),
        description: z.string().optional(),
        annualRevenueTarget: z.number().optional(),
        // Billing info
        billingEntityName: z.string().optional(),
        billingEmail: z.string().email().optional().or(z.literal('')),
        billingPhone: z.string().optional(),
        billingAddress: z.string().optional(),
        billingCity: z.string().optional(),
        billingState: z.string().optional(),
        billingPostalCode: z.string().optional(),
        billingCountry: z.string().optional(),
        billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
        poRequired: z.boolean().optional(),
        paymentTermsDays: z.number().optional(),
        // Communication
        preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).optional(),
        meetingCadence: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
        // Company details
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        employeeCount: z.number().optional(),
        fundingStage: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        foundedYear: z.number().optional(),
        // Primary contact (optional)
        primaryContactName: z.string().optional(),
        primaryContactEmail: z.string().email().optional(),
        primaryContactTitle: z.string().optional(),
        primaryContactPhone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Create account
        const { data: account, error } = await adminClient
          .from('accounts')
          .insert({
            org_id: orgId,
            name: input.name,
            industry: input.industry,
            company_type: input.companyType,
            status: input.status,
            tier: input.tier,
            website: input.website || null,
            phone: input.phone,
            headquarters_location: input.headquartersLocation,
            description: input.description,
            annual_revenue_target: input.annualRevenueTarget,
            // Billing
            billing_entity_name: input.billingEntityName,
            billing_email: input.billingEmail || null,
            billing_phone: input.billingPhone,
            billing_address: input.billingAddress,
            billing_city: input.billingCity,
            billing_state: input.billingState,
            billing_postal_code: input.billingPostalCode,
            billing_country: input.billingCountry || 'USA',
            billing_frequency: input.billingFrequency,
            po_required: input.poRequired,
            payment_terms_days: input.paymentTermsDays || 30,
            // Communication
            preferred_contact_method: input.preferredContactMethod,
            meeting_cadence: input.meetingCadence,
            // Company
            legal_name: input.legalName,
            tax_id: input.taxId,
            employee_count: input.employeeCount,
            funding_stage: input.fundingStage,
            linkedin_url: input.linkedinUrl || null,
            founded_year: input.foundedYear,
            // Ownership
            owner_id: user?.id,
            account_manager_id: user?.id,
            onboarding_status: 'pending',
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create primary contact if provided
        if (input.primaryContactEmail && input.primaryContactName) {
          const [firstName, ...lastNameParts] = input.primaryContactName.split(' ')
          await adminClient
            .from('contacts')
            .insert({
              org_id: orgId,
              company_id: account.id,
              first_name: firstName,
              last_name: lastNameParts.join(' ') || '',
              email: input.primaryContactEmail,
              phone: input.primaryContactPhone,
              title: input.primaryContactTitle,
              contact_type: 'client_poc',
              is_primary: true,
              created_by: user?.id,
            })
        }

        return account
      }),

    // Update account
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(200).optional(),
        industry: z.string().optional(),
        companyType: z.enum(['direct_client', 'implementation_partner', 'staffing_vendor']).optional(),
        status: z.enum(['prospect', 'active', 'inactive']).optional(),
        tier: z.enum(['preferred', 'strategic', 'exclusive']).nullish(),
        website: z.string().url().optional().or(z.literal('')),
        phone: z.string().optional(),
        headquartersLocation: z.string().optional(),
        description: z.string().optional(),
        annualRevenueTarget: z.number().optional(),
        // Billing
        billingEntityName: z.string().optional(),
        billingEmail: z.string().email().optional().or(z.literal('')),
        billingPhone: z.string().optional(),
        billingAddress: z.string().optional(),
        billingCity: z.string().optional(),
        billingState: z.string().optional(),
        billingPostalCode: z.string().optional(),
        billingCountry: z.string().optional(),
        billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
        poRequired: z.boolean().optional(),
        paymentTermsDays: z.number().optional(),
        // Communication
        preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).optional(),
        meetingCadence: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
        // Company
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        employeeCount: z.number().optional(),
        fundingStage: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        foundedYear: z.number().optional(),
        // Onboarding
        onboardingStatus: z.enum(['pending', 'in_progress', 'completed']).optional(),
        // Health
        npsScore: z.number().min(0).max(10).optional(),
        relationshipHealth: z.enum(['healthy', 'attention', 'at_risk']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_by: user?.id,
        }

        // Map input to database columns
        if (input.name !== undefined) updateData.name = input.name
        if (input.industry !== undefined) updateData.industry = input.industry
        if (input.companyType !== undefined) updateData.company_type = input.companyType
        if (input.status !== undefined) updateData.status = input.status
        if (input.tier !== undefined) updateData.tier = input.tier
        if (input.website !== undefined) updateData.website = input.website || null
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.headquartersLocation !== undefined) updateData.headquarters_location = input.headquartersLocation
        if (input.description !== undefined) updateData.description = input.description
        if (input.annualRevenueTarget !== undefined) updateData.annual_revenue_target = input.annualRevenueTarget
        // Billing
        if (input.billingEntityName !== undefined) updateData.billing_entity_name = input.billingEntityName
        if (input.billingEmail !== undefined) updateData.billing_email = input.billingEmail || null
        if (input.billingPhone !== undefined) updateData.billing_phone = input.billingPhone
        if (input.billingAddress !== undefined) updateData.billing_address = input.billingAddress
        if (input.billingCity !== undefined) updateData.billing_city = input.billingCity
        if (input.billingState !== undefined) updateData.billing_state = input.billingState
        if (input.billingPostalCode !== undefined) updateData.billing_postal_code = input.billingPostalCode
        if (input.billingCountry !== undefined) updateData.billing_country = input.billingCountry
        if (input.billingFrequency !== undefined) updateData.billing_frequency = input.billingFrequency
        if (input.poRequired !== undefined) updateData.po_required = input.poRequired
        if (input.paymentTermsDays !== undefined) updateData.payment_terms_days = input.paymentTermsDays
        // Communication
        if (input.preferredContactMethod !== undefined) updateData.preferred_contact_method = input.preferredContactMethod
        if (input.meetingCadence !== undefined) updateData.meeting_cadence = input.meetingCadence
        // Company
        if (input.legalName !== undefined) updateData.legal_name = input.legalName
        if (input.taxId !== undefined) updateData.tax_id = input.taxId
        if (input.employeeCount !== undefined) updateData.employee_count = input.employeeCount
        if (input.fundingStage !== undefined) updateData.funding_stage = input.fundingStage
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl || null
        if (input.foundedYear !== undefined) updateData.founded_year = input.foundedYear
        // Onboarding
        if (input.onboardingStatus !== undefined) {
          updateData.onboarding_status = input.onboardingStatus
          if (input.onboardingStatus === 'completed') {
            updateData.onboarding_completed_at = new Date().toISOString()
            updateData.onboarding_completed_by = user?.id
          }
        }
        // Health
        if (input.npsScore !== undefined) updateData.nps_score = input.npsScore
        if (input.relationshipHealth !== undefined) updateData.relationship_health = input.relationshipHealth

        const { data, error } = await adminClient
          .from('accounts')
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

    // Update account status
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['prospect', 'active', 'inactive']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('accounts')
          .update({
            status: input.status,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Complete onboarding wizard
    completeOnboarding: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        // Step 1: Company Profile
        legalName: z.string().optional(),
        dba: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.enum(['1-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        taxId: z.string().optional(),
        fundingStage: z.string().optional(),
        // Step 2: Contract Setup
        contractType: z.enum(['msa', 'sow', 'staffing_agreement', 'vendor_agreement']).optional(),
        contractStartDate: z.string().optional(),
        contractEndDate: z.string().optional(),
        isEvergreen: z.boolean().optional(),
        specialTerms: z.string().optional(),
        // Step 3: Billing Setup
        paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']).optional(),
        billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
        billingContactName: z.string().optional(),
        billingContactEmail: z.string().email().optional().or(z.literal('')),
        poRequired: z.boolean().optional(),
        poFormat: z.string().optional(),
        // Step 4: Communication Preferences
        preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).optional(),
        meetingCadence: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
        // Step 5: Job Categories
        jobCategories: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        workAuthRequirements: z.array(z.string()).optional(),
        experienceLevels: z.array(z.string()).optional(),
        // Step 6: Kickoff Call
        kickoffScheduled: z.boolean().optional(),
        kickoffDate: z.string().optional(),
        sendWelcomePackage: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Build the update data
        const updateData: Record<string, unknown> = {
          onboarding_status: 'completed',
          onboarding_completed_at: new Date().toISOString(),
          onboarding_completed_by: user?.id,
          updated_by: user?.id,
        }

        // Map onboarding data to account fields
        if (input.legalName) updateData.legal_name = input.legalName
        if (input.industry) updateData.industry = input.industry
        if (input.taxId) updateData.tax_id = input.taxId
        if (input.fundingStage) updateData.funding_stage = input.fundingStage
        if (input.streetAddress) updateData.billing_address = input.streetAddress
        if (input.city) updateData.billing_city = input.city
        if (input.state) updateData.billing_state = input.state
        if (input.zipCode) updateData.billing_postal_code = input.zipCode
        if (input.paymentTerms) {
          const terms = { net_15: 15, net_30: 30, net_45: 45, net_60: 60 }
          updateData.payment_terms_days = terms[input.paymentTerms]
        }
        if (input.billingFrequency) updateData.billing_frequency = input.billingFrequency
        if (input.billingContactName) updateData.billing_entity_name = input.billingContactName
        if (input.billingContactEmail) updateData.billing_email = input.billingContactEmail || null
        if (input.poRequired !== undefined) updateData.po_required = input.poRequired
        if (input.preferredContactMethod) updateData.preferred_contact_method = input.preferredContactMethod
        if (input.meetingCadence) updateData.meeting_cadence = input.meetingCadence

        // Store extended onboarding data as metadata
        const onboardingData: Record<string, unknown> = {}
        if (input.dba) onboardingData.dba = input.dba
        if (input.companySize) onboardingData.company_size = input.companySize
        if (input.contractType) onboardingData.contract_type = input.contractType
        if (input.contractStartDate) onboardingData.contract_start_date = input.contractStartDate
        if (input.contractEndDate) onboardingData.contract_end_date = input.contractEndDate
        if (input.isEvergreen !== undefined) onboardingData.is_evergreen = input.isEvergreen
        if (input.specialTerms) onboardingData.special_terms = input.specialTerms
        if (input.poFormat) onboardingData.po_format = input.poFormat
        if (input.jobCategories?.length) onboardingData.job_categories = input.jobCategories
        if (input.techStack?.length) onboardingData.tech_stack = input.techStack
        if (input.workAuthRequirements?.length) onboardingData.work_auth_requirements = input.workAuthRequirements
        if (input.experienceLevels?.length) onboardingData.experience_levels = input.experienceLevels
        if (input.kickoffScheduled !== undefined) onboardingData.kickoff_scheduled = input.kickoffScheduled
        if (input.kickoffDate) onboardingData.kickoff_date = input.kickoffDate
        if (input.sendWelcomePackage !== undefined) onboardingData.send_welcome_package = input.sendWelcomePackage

        if (Object.keys(onboardingData).length > 0) {
          updateData.onboarding_data = onboardingData
        }

        // Update the account
        const { data, error } = await adminClient
          .from('accounts')
          .update(updateData)
          .eq('id', input.accountId)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create activity log for onboarding completion
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'account',
            entity_id: input.accountId,
            activity_type: 'status_change',
            activity_subtype: 'onboarding_completed',
            title: 'Onboarding Completed',
            description: 'Account onboarding wizard has been completed.',
            created_by: user?.id,
          })

        return data
      }),
  }),

  // ============================================
  // LEADS (B01/B02 - Prospect & Qualify)
  // ============================================
  leads: router({
    // List leads with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'nurture', 'converted', 'all']).default('all'),
        source: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        minScore: z.number().min(0).max(100).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['created_at', 'bant_total_score', 'company_name', 'last_contacted_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('leads')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`company_name.ilike.%${input.search}%,first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.source) {
          query = query.eq('source', input.source)
        }
        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }
        if (input.minScore !== undefined) {
          query = query.gte('bant_total_score', input.minScore)
        }

        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get lead by ID with related data
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leads')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url, email),
            qualified_by_user:user_profiles!qualified_by(id, full_name),
            converted_deal:deals!converted_to_deal_id(id, name, stage, value)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' })
        }

        // Get lead tasks
        const { data: tasks } = await adminClient
          .from('lead_tasks')
          .select('*')
          .eq('lead_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('due_date', { ascending: true })
          .limit(10)

        // Get lead activities
        const { data: activities } = await adminClient
          .from('crm_activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('entity_type', 'lead')
          .eq('entity_id', input.id)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(10)

        return {
          ...data,
          tasks: tasks ?? [],
          activities: activities ?? [],
        }
      }),

    // Create new lead (B01)
    create: orgProtectedProcedure
      .input(z.object({
        // Lead type
        leadType: z.enum(['company', 'individual']).default('company'),
        // Company info
        companyName: z.string().min(1).max(200).optional(),
        industry: z.string().optional(),
        companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
        website: z.string().url().optional().or(z.literal('')),
        // Contact info
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        // Source
        source: z.enum(['linkedin', 'referral', 'cold_outreach', 'inbound', 'event', 'website', 'other']),
        sourceDetails: z.string().optional(),
        referralName: z.string().optional(),
        // Initial assessment
        estimatedValue: z.number().min(0).optional(),
        hiringNeeds: z.string().optional(),
        positionsCount: z.number().min(1).max(100).optional(),
        skillsNeeded: z.array(z.string()).optional(),
        // Notes
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Validate company or contact name is provided
        if (input.leadType === 'company' && !input.companyName) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Company name is required for company leads' })
        }
        if (input.leadType === 'individual' && !input.firstName) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'First name is required for individual leads' })
        }

        // Check for duplicate by email
        if (input.email) {
          const { data: existing } = await adminClient
            .from('leads')
            .select('id, company_name, status')
            .eq('org_id', orgId)
            .eq('email', input.email)
            .is('deleted_at', null)
            .single()

          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `A lead with this email already exists: ${existing.company_name || 'Unknown'} (${existing.status})`,
            })
          }
        }

        const { data, error } = await adminClient
          .from('leads')
          .insert({
            org_id: orgId,
            lead_type: input.leadType,
            company_name: input.companyName,
            industry: input.industry,
            company_size: input.companySize,
            first_name: input.firstName,
            last_name: input.lastName,
            title: input.title,
            email: input.email || null,
            phone: input.phone,
            linkedin_url: input.linkedinUrl || null,
            source: input.source,
            estimated_value: input.estimatedValue,
            business_need: input.hiringNeeds,
            positions_count: input.positionsCount || 1,
            skills_needed: input.skillsNeeded,
            status: 'new',
            owner_id: user?.id,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Lead Created',
            description: `New lead created from ${input.source}${input.sourceDetails ? `: ${input.sourceDetails}` : ''}`,
            created_by: user?.id,
          })

        // Create initial follow-up task
        const followUpDate = new Date()
        followUpDate.setDate(followUpDate.getDate() + 1) // Tomorrow

        await adminClient
          .from('lead_tasks')
          .insert({
            org_id: orgId,
            lead_id: data.id,
            title: 'Initial outreach',
            description: 'Make initial contact with the lead',
            due_date: followUpDate.toISOString().split('T')[0],
            priority: 'high',
            assigned_to: user?.id,
            created_by: user?.id,
          })

        return data
      }),

    // Update lead
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        companyName: z.string().min(1).max(200).optional(),
        industry: z.string().optional(),
        companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
        website: z.string().url().optional().or(z.literal('')),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'nurture', 'converted']).optional(),
        estimatedValue: z.number().min(0).optional(),
        hiringNeeds: z.string().optional(),
        positionsCount: z.number().min(1).max(100).optional(),
        skillsNeeded: z.array(z.string()).optional(),
        ownerId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {}
        if (input.companyName !== undefined) updateData.company_name = input.companyName
        if (input.industry !== undefined) updateData.industry = input.industry
        if (input.companySize !== undefined) updateData.company_size = input.companySize
        if (input.website !== undefined) updateData.website = input.website || null
        if (input.firstName !== undefined) updateData.first_name = input.firstName
        if (input.lastName !== undefined) updateData.last_name = input.lastName
        if (input.title !== undefined) updateData.title = input.title
        if (input.email !== undefined) updateData.email = input.email || null
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl || null
        if (input.status !== undefined) updateData.status = input.status
        if (input.estimatedValue !== undefined) updateData.estimated_value = input.estimatedValue
        if (input.hiringNeeds !== undefined) updateData.business_need = input.hiringNeeds
        if (input.positionsCount !== undefined) updateData.positions_count = input.positionsCount
        if (input.skillsNeeded !== undefined) updateData.skills_needed = input.skillsNeeded
        if (input.ownerId !== undefined) updateData.owner_id = input.ownerId

        const { data, error } = await adminClient
          .from('leads')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Qualify lead (B02) - Update BANT scores
    qualify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        // BANT Scores (0-25 each)
        bantBudget: z.number().min(0).max(25),
        bantAuthority: z.number().min(0).max(25),
        bantNeed: z.number().min(0).max(25),
        bantTimeline: z.number().min(0).max(25),
        // BANT Notes
        bantBudgetNotes: z.string().optional(),
        bantAuthorityNotes: z.string().optional(),
        bantNeedNotes: z.string().optional(),
        bantTimelineNotes: z.string().optional(),
        // Additional qualification data
        budgetStatus: z.enum(['confirmed', 'likely', 'unclear', 'no_budget']).optional(),
        estimatedMonthlySpend: z.number().optional(),
        authorityLevel: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'no_authority']).optional(),
        urgency: z.enum(['immediate', 'high', 'medium', 'low']).optional(),
        targetStartDate: z.string().optional(),
        positionsCount: z.number().min(1).max(100).optional(),
        skillsNeeded: z.array(z.string()).optional(),
        contractTypes: z.array(z.enum(['contract', 'contract_to_hire', 'direct_hire', 'rpo'])).optional(),
        // Qualification result
        qualificationResult: z.enum(['qualified_convert', 'qualified_nurture', 'not_qualified']),
        qualificationNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Determine new status based on qualification result
        let newStatus: string
        switch (input.qualificationResult) {
          case 'qualified_convert':
            newStatus = 'qualified'
            break
          case 'qualified_nurture':
            newStatus = 'nurture'
            break
          case 'not_qualified':
            newStatus = 'unqualified'
            break
        }

        const { data, error } = await adminClient
          .from('leads')
          .update({
            bant_budget: input.bantBudget,
            bant_authority: input.bantAuthority,
            bant_need: input.bantNeed,
            bant_timeline: input.bantTimeline,
            bant_budget_notes: input.bantBudgetNotes,
            bant_authority_notes: input.bantAuthorityNotes,
            bant_need_notes: input.bantNeedNotes,
            bant_timeline_notes: input.bantTimelineNotes,
            budget_status: input.budgetStatus,
            estimated_monthly_spend: input.estimatedMonthlySpend,
            authority_level: input.authorityLevel,
            urgency: input.urgency,
            target_start_date: input.targetStartDate,
            positions_count: input.positionsCount,
            skills_needed: input.skillsNeeded,
            contract_types: input.contractTypes,
            qualification_result: input.qualificationResult,
            qualification_notes: input.qualificationNotes,
            qualified_at: new Date().toISOString(),
            qualified_by: user?.id,
            status: newStatus,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log qualification activity
        const totalScore = input.bantBudget + input.bantAuthority + input.bantNeed + input.bantTimeline
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Lead Qualified',
            description: `Lead qualification completed with BANT score ${totalScore}/100. Result: ${input.qualificationResult}`,
            created_by: user?.id,
          })

        return data
      }),

    // Convert lead to deal (B02 -> B03 transition)
    convertToDeal: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        // Deal creation data
        dealName: z.string().min(1).max(200),
        dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']).default('new_business'),
        dealValue: z.number().min(0),
        valueBasis: z.enum(['one_time', 'annual', 'monthly']).default('one_time'),
        winProbability: z.number().min(0).max(100).default(20),
        expectedCloseDate: z.string(),
        // Optional deal data
        estimatedPlacements: z.number().optional(),
        avgBillRate: z.number().optional(),
        contractLengthMonths: z.number().optional(),
        hiringNeeds: z.string().optional(),
        rolesBreakdown: z.array(z.object({
          title: z.string(),
          quantity: z.number(),
          minRate: z.number().optional(),
          maxRate: z.number().optional(),
          priority: z.enum(['high', 'medium', 'low']).optional(),
        })).optional(),
        servicesRequired: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
        competitiveAdvantage: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get lead data
        const { data: lead, error: leadError } = await adminClient
          .from('leads')
          .select('*')
          .eq('id', input.leadId)
          .eq('org_id', orgId)
          .single()

        if (leadError || !lead) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' })
        }

        // Check if lead is already converted
        if (lead.converted_to_deal_id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This lead has already been converted to a deal',
          })
        }

        // Create the deal
        const { data: deal, error: dealError } = await adminClient
          .from('deals')
          .insert({
            org_id: orgId,
            lead_id: input.leadId,
            name: input.dealName,
            title: input.dealName, // For compatibility
            deal_type: input.dealType,
            value: input.dealValue,
            value_basis: input.valueBasis,
            probability: input.winProbability,
            stage: 'discovery',
            expected_close_date: input.expectedCloseDate,
            estimated_placements: input.estimatedPlacements,
            avg_bill_rate: input.avgBillRate,
            contract_length_months: input.contractLengthMonths,
            hiring_needs: input.hiringNeeds || lead.business_need,
            roles_breakdown: input.rolesBreakdown,
            services_required: input.servicesRequired,
            competitors: input.competitors,
            competitive_advantage: input.competitiveAdvantage,
            next_action: input.nextAction,
            next_action_date: input.nextActionDate,
            notes: input.notes,
            owner_id: lead.owner_id || user?.id,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name)')
          .single()

        if (dealError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dealError.message })
        }

        // Update lead status to converted
        await adminClient
          .from('leads')
          .update({
            status: 'converted',
            converted_to_deal_id: deal.id,
            converted_at: new Date().toISOString(),
          })
          .eq('id', input.leadId)
          .eq('org_id', orgId)

        // Log activity on lead
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: input.leadId,
            activity_type: 'note',
            subject: 'Lead Converted to Deal',
            description: `Lead converted to deal: ${input.dealName} ($${input.dealValue.toLocaleString()})`,
            related_deal_id: deal.id,
            created_by: user?.id,
          })

        // Log activity on deal
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: deal.id,
            activity_type: 'note',
            subject: 'Deal Created',
            description: `Deal created from lead: ${lead.company_name || lead.full_name}`,
            created_by: user?.id,
          })

        // Initialize deal stage history
        await adminClient
          .from('deal_stages_history')
          .insert({
            deal_id: deal.id,
            stage: 'discovery',
            entered_at: new Date().toISOString(),
            changed_by: user?.id,
          })

        // Create next action task if provided
        if (input.nextAction && input.nextActionDate) {
          await adminClient
            .from('tasks')
            .insert({
              org_id: orgId,
              title: input.nextAction,
              description: `Deal action for ${input.dealName}`,
              task_type: 'follow_up',
              status: 'pending',
              priority: 'high',
              due_date: input.nextActionDate,
              assignee_id: lead.owner_id || user?.id,
              entity_type: 'deal',
              entity_id: deal.id,
              created_by: user?.id,
            })
        }

        return deal
      }),

    // Disqualify lead (mark as not qualified)
    disqualify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.enum(['no_budget', 'no_authority', 'no_need', 'bad_timing', 'competitor', 'not_responsive', 'other']),
        notes: z.string().optional(),
        reengageDate: z.string().optional(), // Optional future follow-up
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leads')
          .update({
            status: 'unqualified',
            lost_reason: input.reason,
            qualification_result: 'not_qualified',
            qualification_notes: input.notes,
            qualified_at: new Date().toISOString(),
            qualified_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Lead Disqualified',
            description: `Lead disqualified. Reason: ${input.reason}${input.notes ? `. ${input.notes}` : ''}`,
            created_by: user?.id,
          })

        // Create re-engagement task if date provided
        if (input.reengageDate) {
          await adminClient
            .from('lead_tasks')
            .insert({
              org_id: orgId,
              lead_id: input.id,
              title: 'Re-engage lead',
              description: `Follow up with disqualified lead. Original reason: ${input.reason}`,
              due_date: input.reengageDate,
              priority: 'low',
              assigned_to: data.owner_id || user?.id,
              created_by: user?.id,
            })
        }

        return data
      }),

    // Log activity/touchpoint on lead
    logActivity: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'linkedin_message', 'meeting', 'note']),
        subject: z.string().optional(),
        description: z.string().optional(),
        outcome: z.enum(['positive', 'neutral', 'negative', 'no_response', 'left_voicemail', 'connected']).optional(),
        direction: z.enum(['inbound', 'outbound']).optional(),
        durationMinutes: z.number().optional(),
        nextSteps: z.string().optional(),
        nextFollowUpDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data: activity, error } = await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: input.leadId,
            activity_type: input.activityType,
            subject: input.subject,
            description: input.description,
            outcome: input.outcome,
            direction: input.direction,
            duration_minutes: input.durationMinutes,
            next_steps: input.nextSteps,
            next_follow_up_date: input.nextFollowUpDate,
            completed_at: new Date().toISOString(),
            status: 'completed',
            created_by: user?.id,
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update lead last contacted date
        await adminClient
          .from('leads')
          .update({
            last_contacted_at: new Date().toISOString(),
            status: 'contacted',
          })
          .eq('id', input.leadId)
          .eq('org_id', orgId)
          .eq('status', 'new') // Only update if currently 'new'

        // Create follow-up task if date provided
        if (input.nextFollowUpDate) {
          await adminClient
            .from('lead_tasks')
            .insert({
              org_id: orgId,
              lead_id: input.leadId,
              title: input.nextSteps || 'Follow up',
              due_date: input.nextFollowUpDate,
              priority: 'medium',
              assigned_to: user?.id,
              created_by: user?.id,
            })
        }

        return activity
      }),

    // Get lead statistics for dashboard
    getStats: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
        period: z.enum(['today', 'week', 'month', 'quarter']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.ownerId || user?.id

        // Calculate date range
        const now = new Date()
        let startDate: Date
        switch (input.period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
            break
          case 'month':
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }

        // Get lead counts by status
        const { data: leads } = await adminClient
          .from('leads')
          .select('id, status, bant_total_score, created_at, converted_at')
          .eq('org_id', orgId)
          .eq('owner_id', ownerId)
          .is('deleted_at', null)

        const stats = {
          total: leads?.length ?? 0,
          byStatus: {
            new: 0,
            contacted: 0,
            qualified: 0,
            unqualified: 0,
            nurture: 0,
            converted: 0,
          },
          newThisPeriod: 0,
          convertedThisPeriod: 0,
          avgBantScore: 0,
          conversionRate: 0,
        }

        if (leads) {
          let totalBant = 0
          let bantCount = 0

          for (const lead of leads) {
            // Count by status
            if (lead.status in stats.byStatus) {
              stats.byStatus[lead.status as keyof typeof stats.byStatus]++
            }

            // Count new this period
            if (new Date(lead.created_at) >= startDate) {
              stats.newThisPeriod++
            }

            // Count converted this period
            if (lead.converted_at && new Date(lead.converted_at) >= startDate) {
              stats.convertedThisPeriod++
            }

            // Calculate average BANT score
            if (lead.bant_total_score) {
              totalBant += lead.bant_total_score
              bantCount++
            }
          }

          stats.avgBantScore = bantCount > 0 ? Math.round(totalBant / bantCount) : 0
          stats.conversionRate = stats.total > 0 ? Math.round((stats.byStatus.converted / stats.total) * 100) : 0
        }

        return stats
      }),

    // Delete lead (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('leads')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // DEALS (B03/B04/B05 - Create, Pipeline, Close)
  // ============================================
  deals: router({
    // List deals with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        stage: z.string().optional(),
        stages: z.array(z.string()).optional(),
        healthStatus: z.enum(['on_track', 'slow', 'stale', 'urgent', 'at_risk', 'all']).optional(),
        ownerId: z.string().uuid().optional(),
        accountId: z.string().uuid().optional(),
        excludeClosed: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['created_at', 'expected_close_date', 'value', 'last_activity_at']).default('expected_close_date'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('deals')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            account:accounts(id, name, industry),
            lead:leads(id, company_name, first_name, last_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`name.ilike.%${input.search}%,title.ilike.%${input.search}%`)
        }
        if (input.stage) {
          query = query.eq('stage', input.stage)
        }
        if (input.stages && input.stages.length > 0) {
          query = query.in('stage', input.stages)
        }
        if (input.healthStatus && input.healthStatus !== 'all') {
          query = query.eq('health_status', input.healthStatus)
        }
        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }
        if (input.accountId) {
          query = query.eq('account_id', input.accountId)
        }
        if (input.excludeClosed) {
          query = query.not('stage', 'in', '(closed_won,closed_lost)')
        }

        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get pipeline view (grouped by stage) - B04
    pipeline: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
        showAll: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.showAll ? undefined : (input.ownerId || user?.id)

        let query = adminClient
          .from('deals')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            account:accounts(id, name),
            lead:leads(id, company_name)
          `)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .not('stage', 'in', '(closed_won,closed_lost)')
          .order('expected_close_date', { ascending: true })

        if (ownerId) {
          query = query.eq('owner_id', ownerId)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Define stages with metadata
        const stageConfig = [
          { key: 'discovery', label: 'Discovery', probability: 20, color: 'slate' },
          { key: 'qualification', label: 'Qualification', probability: 40, color: 'blue' },
          { key: 'proposal', label: 'Proposal', probability: 60, color: 'amber' },
          { key: 'negotiation', label: 'Negotiation', probability: 70, color: 'orange' },
          { key: 'verbal_commit', label: 'Verbal Commit', probability: 90, color: 'green' },
        ]

        // Group deals by stage
        const pipeline = stageConfig.map(stage => {
          const stageDeals = data?.filter(d => d.stage === stage.key) ?? []
          const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
          const weightedValue = stageDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || stage.probability) / 100), 0)

          return {
            ...stage,
            deals: stageDeals,
            count: stageDeals.length,
            totalValue,
            weightedValue,
          }
        })

        // Summary stats
        const summary = {
          totalDeals: data?.length ?? 0,
          totalValue: data?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0,
          weightedValue: data?.reduce((sum, d) => {
            const stageProbability = stageConfig.find(s => s.key === d.stage)?.probability ?? 50
            return sum + ((d.value || 0) * (d.probability || stageProbability) / 100)
          }, 0) ?? 0,
          atRisk: data?.filter(d => d.health_status === 'at_risk' || d.health_status === 'stale').length ?? 0,
          urgent: data?.filter(d => d.health_status === 'urgent').length ?? 0,
        }

        return { pipeline, summary }
      }),

    // Get deal by ID with full details
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('deals')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url, email),
            secondary_owner:user_profiles!secondary_owner_id(id, full_name),
            pod_manager:user_profiles!pod_manager_id(id, full_name),
            account:accounts(id, name, industry, website),
            lead:leads(id, company_name, first_name, last_name, email, phone),
            created_account:accounts!created_account_id(id, name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        // Get stage history
        const { data: stageHistory } = await adminClient
          .from('deal_stages_history')
          .select('*, changed_by_user:user_profiles!changed_by(id, full_name)')
          .eq('deal_id', input.id)
          .order('entered_at', { ascending: true })

        // Get stakeholders
        const { data: stakeholders } = await adminClient
          .from('deal_stakeholders')
          .select('*, contact:crm_contacts(id, first_name, last_name, email)')
          .eq('deal_id', input.id)
          .eq('is_active', true)

        // Get activities
        const { data: activities } = await adminClient
          .from('crm_activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('entity_type', 'deal')
          .eq('entity_id', input.id)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(20)

        // Get tasks
        const { data: tasks } = await adminClient
          .from('tasks')
          .select('*, assignee:user_profiles!assignee_id(id, full_name)')
          .eq('entity_type', 'deal')
          .eq('entity_id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('due_date', { ascending: true })
          .limit(10)

        return {
          ...data,
          stageHistory: stageHistory ?? [],
          stakeholders: stakeholders ?? [],
          activities: activities ?? [],
          tasks: tasks ?? [],
        }
      }),

    // Create deal (B03)
    create: orgProtectedProcedure
      .input(z.object({
        // Basic info
        name: z.string().min(1).max(200),
        dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']).default('new_business'),
        // Value
        value: z.number().min(0),
        valueBasis: z.enum(['one_time', 'annual', 'monthly']).default('one_time'),
        probability: z.number().min(0).max(100).default(20),
        expectedCloseDate: z.string(),
        // Optional: Link to account or lead
        accountId: z.string().uuid().optional(),
        leadId: z.string().uuid().optional(),
        // Deal details
        estimatedPlacements: z.number().optional(),
        avgBillRate: z.number().optional(),
        contractLengthMonths: z.number().optional(),
        hiringNeeds: z.string().optional(),
        rolesBreakdown: z.array(z.object({
          title: z.string(),
          quantity: z.number(),
          minRate: z.number().optional(),
          maxRate: z.number().optional(),
          priority: z.enum(['high', 'medium', 'low']).optional(),
        })).optional(),
        servicesRequired: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
        competitiveAdvantage: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
        // Assignment
        ownerId: z.string().uuid().optional(),
        secondaryOwnerId: z.string().uuid().optional(),
        podManagerId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('deals')
          .insert({
            org_id: orgId,
            name: input.name,
            title: input.name,
            deal_type: input.dealType,
            value: input.value,
            value_basis: input.valueBasis,
            probability: input.probability,
            stage: 'discovery',
            expected_close_date: input.expectedCloseDate,
            account_id: input.accountId,
            lead_id: input.leadId,
            estimated_placements: input.estimatedPlacements,
            avg_bill_rate: input.avgBillRate,
            contract_length_months: input.contractLengthMonths,
            hiring_needs: input.hiringNeeds,
            roles_breakdown: input.rolesBreakdown,
            services_required: input.servicesRequired,
            competitors: input.competitors,
            competitive_advantage: input.competitiveAdvantage,
            next_action: input.nextAction,
            next_action_date: input.nextActionDate,
            notes: input.notes,
            owner_id: input.ownerId || user?.id,
            secondary_owner_id: input.secondaryOwnerId,
            pod_manager_id: input.podManagerId,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Initialize stage history
        await adminClient
          .from('deal_stages_history')
          .insert({
            deal_id: data.id,
            stage: 'discovery',
            entered_at: new Date().toISOString(),
            changed_by: user?.id,
          })

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Deal Created',
            description: `New deal created: ${input.name} ($${input.value.toLocaleString()})`,
            created_by: user?.id,
          })

        return data
      }),

    // Update deal
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']).optional(),
        value: z.number().min(0).optional(),
        valueBasis: z.enum(['one_time', 'annual', 'monthly']).optional(),
        probability: z.number().min(0).max(100).optional(),
        expectedCloseDate: z.string().optional(),
        accountId: z.string().uuid().optional(),
        estimatedPlacements: z.number().optional(),
        avgBillRate: z.number().optional(),
        contractLengthMonths: z.number().optional(),
        hiringNeeds: z.string().optional(),
        rolesBreakdown: z.array(z.object({
          title: z.string(),
          quantity: z.number(),
          minRate: z.number().optional(),
          maxRate: z.number().optional(),
          priority: z.enum(['high', 'medium', 'low']).optional(),
        })).optional(),
        servicesRequired: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
        competitiveAdvantage: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        secondaryOwnerId: z.string().uuid().optional(),
        podManagerId: z.string().uuid().optional(),
        healthStatus: z.enum(['on_track', 'slow', 'stale', 'urgent', 'at_risk']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_by: user?.id,
          last_activity_at: new Date().toISOString(),
        }
        if (input.name !== undefined) {
          updateData.name = input.name
          updateData.title = input.name
        }
        if (input.dealType !== undefined) updateData.deal_type = input.dealType
        if (input.value !== undefined) updateData.value = input.value
        if (input.valueBasis !== undefined) updateData.value_basis = input.valueBasis
        if (input.probability !== undefined) updateData.probability = input.probability
        if (input.expectedCloseDate !== undefined) updateData.expected_close_date = input.expectedCloseDate
        if (input.accountId !== undefined) updateData.account_id = input.accountId
        if (input.estimatedPlacements !== undefined) updateData.estimated_placements = input.estimatedPlacements
        if (input.avgBillRate !== undefined) updateData.avg_bill_rate = input.avgBillRate
        if (input.contractLengthMonths !== undefined) updateData.contract_length_months = input.contractLengthMonths
        if (input.hiringNeeds !== undefined) updateData.hiring_needs = input.hiringNeeds
        if (input.rolesBreakdown !== undefined) updateData.roles_breakdown = input.rolesBreakdown
        if (input.servicesRequired !== undefined) updateData.services_required = input.servicesRequired
        if (input.competitors !== undefined) updateData.competitors = input.competitors
        if (input.competitiveAdvantage !== undefined) updateData.competitive_advantage = input.competitiveAdvantage
        if (input.nextAction !== undefined) updateData.next_action = input.nextAction
        if (input.nextActionDate !== undefined) updateData.next_action_date = input.nextActionDate
        if (input.notes !== undefined) updateData.notes = input.notes
        if (input.ownerId !== undefined) updateData.owner_id = input.ownerId
        if (input.secondaryOwnerId !== undefined) updateData.secondary_owner_id = input.secondaryOwnerId
        if (input.podManagerId !== undefined) updateData.pod_manager_id = input.podManagerId
        if (input.healthStatus !== undefined) updateData.health_status = input.healthStatus

        const { data, error } = await adminClient
          .from('deals')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Update deal stage (B04)
    updateStage: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        stage: z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'verbal_commit', 'closed_won', 'closed_lost']),
        probability: z.number().min(0).max(100).optional(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get current deal
        const { data: currentDeal } = await adminClient
          .from('deals')
          .select('stage, name')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (!currentDeal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        // Default probabilities by stage
        const defaultProbabilities: Record<string, number> = {
          discovery: 20,
          qualification: 40,
          proposal: 60,
          negotiation: 70,
          verbal_commit: 90,
          closed_won: 100,
          closed_lost: 0,
        }

        const newProbability = input.probability ?? defaultProbabilities[input.stage]

        const { data, error } = await adminClient
          .from('deals')
          .update({
            stage: input.stage,
            probability: newProbability,
            updated_by: user?.id,
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Stage Changed',
            description: `Deal moved from ${currentDeal.stage} to ${input.stage}${input.notes ? `. ${input.notes}` : ''}`,
            created_by: user?.id,
          })

        return data
      }),

    // Close deal as won (B05)
    closeWon: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        // Contract details
        finalValue: z.number().min(0),
        contractSignedDate: z.string(),
        contractStartDate: z.string(),
        contractDurationMonths: z.number().min(1).max(120),
        contractType: z.enum(['msa', 'sow', 'po', 'email']),
        paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']),
        billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
        // Billing contact
        billingContactName: z.string().optional(),
        billingContactEmail: z.string().email().optional(),
        billingContactPhone: z.string().optional(),
        // Confirmed roles
        confirmedRoles: z.array(z.object({
          title: z.string(),
          quantity: z.number(),
          billRate: z.number(),
          startDate: z.string().optional(),
        })).optional(),
        // Win details
        winReason: z.enum(['price_value', 'expertise_speed', 'relationship_trust', 'candidate_quality', 'response_time', 'other']),
        winDetails: z.string().optional(),
        competitorsBeat: z.array(z.string()).optional(),
        // Account creation (if new)
        createAccount: z.boolean().default(false),
        accountName: z.string().optional(),
        accountIndustry: z.string().optional(),
        // Commission settings
        marginPercentage: z.number().min(0).max(100).default(20),
        commissionPercentage: z.number().min(0).max(100).default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get current deal
        const { data: deal } = await adminClient
          .from('deals')
          .select('*, lead:leads(company_name, first_name, last_name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (!deal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        let createdAccountId = deal.account_id

        // Create new account if requested
        if (input.createAccount && !createdAccountId) {
          const accountName = input.accountName || deal.lead?.company_name || deal.name
          const { data: newAccount } = await adminClient
            .from('accounts')
            .insert({
              org_id: orgId,
              name: accountName,
              industry: input.accountIndustry,
              status: 'active',
              company_type: 'direct_client',
              billing_frequency: input.billingFrequency,
              payment_terms_days: parseInt(input.paymentTerms.replace('net_', '')),
              owner_id: deal.owner_id || user?.id,
              account_manager_id: deal.owner_id || user?.id,
              created_by: user?.id,
            })
            .select()
            .single()

          if (newAccount) {
            createdAccountId = newAccount.id
          }
        }

        // Update deal to closed won
        const { data, error } = await adminClient
          .from('deals')
          .update({
            stage: 'closed_won',
            probability: 100,
            value: input.finalValue,
            contract_signed_date: input.contractSignedDate,
            contract_start_date: input.contractStartDate,
            contract_duration_months: input.contractDurationMonths,
            contract_type: input.contractType,
            payment_terms: input.paymentTerms,
            billing_frequency: input.billingFrequency,
            billing_contact: input.billingContactName ? {
              name: input.billingContactName,
              email: input.billingContactEmail,
              phone: input.billingContactPhone,
            } : null,
            confirmed_roles: input.confirmedRoles,
            win_reason: input.winReason,
            win_details: input.winDetails,
            competitors_beat: input.competitorsBeat,
            closed_at: new Date().toISOString(),
            closed_by: user?.id,
            created_account_id: createdAccountId,
            account_id: createdAccountId || deal.account_id,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create commission record
        const grossMargin = input.finalValue * (input.marginPercentage / 100)
        const projectedCommission = grossMargin * (input.commissionPercentage / 100)

        await adminClient
          .from('commissions')
          .insert({
            org_id: orgId,
            deal_id: input.id,
            user_id: deal.owner_id || user?.id,
            deal_value: input.finalValue,
            gross_margin: grossMargin,
            margin_percentage: input.marginPercentage,
            commission_percentage: input.commissionPercentage,
            projected_commission: projectedCommission,
            commission_type: 'deal_close',
            status: 'pending',
            payment_schedule: 'monthly',
            payment_period_start: input.contractStartDate,
            created_by: user?.id,
          })

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Deal Closed Won!',
            description: `Deal closed for $${input.finalValue.toLocaleString()}. Win reason: ${input.winReason}`,
            created_by: user?.id,
          })

        return data
      }),

    // Close deal as lost (B05)
    closeLost: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        lossReasonCategory: z.enum(['competitor', 'no_budget', 'project_cancelled', 'hired_internally', 'went_dark', 'price_too_high', 'requirements_changed', 'other']),
        lossDetails: z.string().optional(),
        competitorWon: z.string().optional(),
        competitorPrice: z.number().optional(),
        futurePotential: z.enum(['yes', 'maybe', 'no']),
        reengagementDate: z.string().optional(),
        lessonsLearned: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('deals')
          .update({
            stage: 'closed_lost',
            probability: 0,
            loss_reason_category: input.lossReasonCategory,
            loss_details: input.lossDetails,
            competitor_won: input.competitorWon,
            competitor_price: input.competitorPrice,
            future_potential: input.futurePotential,
            reengagement_date: input.reengagementDate,
            lessons_learned: input.lessonsLearned,
            closed_at: new Date().toISOString(),
            closed_by: user?.id,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Deal Closed Lost',
            description: `Deal lost. Reason: ${input.lossReasonCategory}${input.competitorWon ? `. Won by: ${input.competitorWon}` : ''}`,
            created_by: user?.id,
          })

        // Create re-engagement task if date provided
        if (input.reengagementDate && input.futurePotential !== 'no') {
          await adminClient
            .from('tasks')
            .insert({
              org_id: orgId,
              title: 'Re-engage lost deal',
              description: `Follow up on lost deal. Original loss reason: ${input.lossReasonCategory}`,
              task_type: 'follow_up',
              status: 'pending',
              priority: input.futurePotential === 'yes' ? 'high' : 'medium',
              due_date: input.reengagementDate,
              assignee_id: data.owner_id || user?.id,
              entity_type: 'deal',
              entity_id: input.id,
              created_by: user?.id,
            })
        }

        return data
      }),

    // Log activity on deal
    logActivity: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'proposal_sent', 'contract_sent']),
        subject: z.string().optional(),
        description: z.string().optional(),
        outcome: z.enum(['positive', 'neutral', 'negative', 'no_response', 'scheduled', 'completed']).optional(),
        durationMinutes: z.number().optional(),
        nextSteps: z.string().optional(),
        nextFollowUpDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: input.dealId,
            activity_type: input.activityType,
            subject: input.subject,
            description: input.description,
            outcome: input.outcome,
            duration_minutes: input.durationMinutes,
            next_steps: input.nextSteps,
            next_follow_up_date: input.nextFollowUpDate,
            completed_at: new Date().toISOString(),
            status: 'completed',
            created_by: user?.id,
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update deal last activity
        await adminClient
          .from('deals')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', input.dealId)
          .eq('org_id', orgId)

        // Create follow-up task if date provided
        if (input.nextFollowUpDate) {
          await adminClient
            .from('tasks')
            .insert({
              org_id: orgId,
              title: input.nextSteps || 'Follow up',
              due_date: input.nextFollowUpDate,
              priority: 'medium',
              assignee_id: user?.id,
              entity_type: 'deal',
              entity_id: input.dealId,
              created_by: user?.id,
            })
        }

        return data
      }),

    // Get deal statistics for dashboard
    getStats: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
        period: z.enum(['month', 'quarter', 'year']).default('quarter'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.ownerId || user?.id

        // Calculate date range
        const now = new Date()
        let startDate: Date
        switch (input.period) {
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'quarter':
          default:
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        }

        // Get all deals for this owner
        const { data: deals } = await adminClient
          .from('deals')
          .select('id, stage, value, probability, created_at, closed_at, health_status')
          .eq('org_id', orgId)
          .eq('owner_id', ownerId)
          .is('deleted_at', null)

        // Define stage probabilities
        const stageProbabilities: Record<string, number> = {
          discovery: 20,
          qualification: 40,
          proposal: 60,
          negotiation: 70,
          verbal_commit: 90,
          closed_won: 100,
          closed_lost: 0,
        }

        const stats = {
          activePipeline: {
            count: 0,
            totalValue: 0,
            weightedValue: 0,
          },
          closedWon: {
            count: 0,
            totalValue: 0,
          },
          closedLost: {
            count: 0,
            totalValue: 0,
          },
          byStage: {} as Record<string, { count: number; value: number }>,
          healthBreakdown: {
            on_track: 0,
            slow: 0,
            stale: 0,
            urgent: 0,
            at_risk: 0,
          },
          winRate: 0,
          avgDealSize: 0,
          createdThisPeriod: 0,
          closedThisPeriod: 0,
        }

        if (deals) {
          let closedTotal = 0
          let dealSizeSum = 0

          for (const deal of deals) {
            const isActive = !['closed_won', 'closed_lost'].includes(deal.stage)
            const value = deal.value || 0

            // Active pipeline
            if (isActive) {
              stats.activePipeline.count++
              stats.activePipeline.totalValue += value
              const prob = deal.probability || stageProbabilities[deal.stage] || 50
              stats.activePipeline.weightedValue += value * (prob / 100)

              // Health breakdown
              if (deal.health_status && deal.health_status in stats.healthBreakdown) {
                stats.healthBreakdown[deal.health_status as keyof typeof stats.healthBreakdown]++
              }
            }

            // Closed deals
            if (deal.stage === 'closed_won') {
              stats.closedWon.count++
              stats.closedWon.totalValue += value
              closedTotal++
              dealSizeSum += value
            }
            if (deal.stage === 'closed_lost') {
              stats.closedLost.count++
              stats.closedLost.totalValue += value
              closedTotal++
            }

            // By stage
            if (!stats.byStage[deal.stage]) {
              stats.byStage[deal.stage] = { count: 0, value: 0 }
            }
            stats.byStage[deal.stage].count++
            stats.byStage[deal.stage].value += value

            // Created this period
            if (new Date(deal.created_at) >= startDate) {
              stats.createdThisPeriod++
            }

            // Closed this period
            if (deal.closed_at && new Date(deal.closed_at) >= startDate) {
              stats.closedThisPeriod++
            }
          }

          // Calculate rates
          stats.winRate = closedTotal > 0
            ? Math.round((stats.closedWon.count / closedTotal) * 100)
            : 0
          stats.avgDealSize = stats.closedWon.count > 0
            ? Math.round(dealSizeSum / stats.closedWon.count)
            : 0
        }

        return stats
      }),

    // Delete deal (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('deals')
          .update({ deleted_at: new Date().toISOString(), updated_by: user?.id })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Get revenue forecast (B04)
    getForecast: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
        months: z.number().int().min(1).max(12).default(3),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const ownerId = input.ownerId || user?.id

        // Get active deals with expected close dates
        const { data: deals } = await adminClient
          .from('deals')
          .select('id, name, value, probability, expected_close_date, stage')
          .eq('org_id', orgId)
          .eq('owner_id', ownerId)
          .not('stage', 'in', '("closed_won","closed_lost")')
          .is('deleted_at', null)
          .not('expected_close_date', 'is', null)
          .order('expected_close_date', { ascending: true })

        if (!deals || deals.length === 0) {
          return {
            months: [],
            totals: {
              commit: 0,
              upside: 0,
              pipeline: 0,
            },
          }
        }

        // Group deals by expected close month
        const monthlyData: Record<string, {
          month: string,
          commit: number,
          upside: number,
          pipeline: number,
          deals: typeof deals,
        }> = {}

        const now = new Date()
        const endDate = new Date(now.getFullYear(), now.getMonth() + input.months, 0)

        for (const deal of deals) {
          if (!deal.expected_close_date) continue

          const closeDate = new Date(deal.expected_close_date)
          if (closeDate > endDate) continue

          const monthKey = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}`
          const monthLabel = closeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthLabel,
              commit: 0,
              upside: 0,
              pipeline: 0,
              deals: [],
            }
          }

          const value = deal.value || 0
          const probability = deal.probability || 50

          // Categorize based on probability and stage
          if (probability >= 80 || deal.stage === 'verbal_commit') {
            monthlyData[monthKey].commit += value
          } else if (probability >= 50 || deal.stage === 'negotiation') {
            monthlyData[monthKey].upside += value
          } else {
            monthlyData[monthKey].pipeline += value
          }

          monthlyData[monthKey].deals.push(deal)
        }

        // Sort months and calculate totals
        const sortedMonths = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, data]) => data)

        const totals = {
          commit: sortedMonths.reduce((sum, m) => sum + m.commit, 0),
          upside: sortedMonths.reduce((sum, m) => sum + m.upside, 0),
          pipeline: sortedMonths.reduce((sum, m) => sum + m.pipeline, 0),
        }

        return {
          months: sortedMonths.map(({ deals, ...rest }) => rest),
          totals,
        }
      }),

    // Add stakeholder to deal (B04)
    addStakeholder: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        name: z.string().min(1).max(200),
        title: z.string().max(200).optional(),
        email: z.string().email().optional(),
        phone: z.string().max(50).optional(),
        role: z.enum(['champion', 'economic_buyer', 'technical_buyer', 'end_user', 'blocker', 'influencer']),
        isPrimary: z.boolean().default(false),
        notes: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify deal exists and belongs to org
        const { data: deal } = await adminClient
          .from('deals')
          .select('id')
          .eq('id', input.dealId)
          .eq('org_id', orgId)
          .single()

        if (!deal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        // If setting as primary, unset existing primary
        if (input.isPrimary) {
          await adminClient
            .from('deal_stakeholders')
            .update({ is_primary: false })
            .eq('deal_id', input.dealId)
            .eq('is_primary', true)
        }

        // Insert stakeholder
        const { data, error } = await adminClient
          .from('deal_stakeholders')
          .insert({
            deal_id: input.dealId,
            name: input.name,
            title: input.title,
            email: input.email,
            phone: input.phone,
            role: input.role,
            is_primary: input.isPrimary,
            notes: input.notes,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Remove stakeholder from deal
    removeStakeholder: orgProtectedProcedure
      .input(z.object({
        stakeholderId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify stakeholder belongs to a deal in this org
        const { data: stakeholder } = await adminClient
          .from('deal_stakeholders')
          .select('id, deal:deals!inner(org_id)')
          .eq('id', input.stakeholderId)
          .single()

        if (!stakeholder || (stakeholder.deal as { org_id: string }).org_id !== orgId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Stakeholder not found' })
        }

        const { error } = await adminClient
          .from('deal_stakeholders')
          .delete()
          .eq('id', input.stakeholderId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // CONTACTS (Point of Contacts)
  // ============================================
  contacts: router({
    // Search contacts
    search: orgProtectedProcedure
      .input(z.object({
        query: z.string(),
        accountId: z.string().uuid().optional(),
        limit: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select('id, first_name, last_name, title, email, phone, account:accounts!company_id(id, name)')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .limit(input.limit)

        if (input.query) {
          query = query.or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%`)
        }

        if (input.accountId) {
          query = query.eq('company_id', input.accountId)
        }

        const { data, error } = await query

        if (error) {
          return []
        }

        return data?.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          title: c.title,
          email: c.email,
          phone: c.phone,
          account: c.account,
        })) ?? []
      }),

    // List contacts by account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .select('*')
          .eq('org_id', orgId)
          .eq('company_id', input.accountId)
          .is('deleted_at', null)
          .order('is_primary', { ascending: false })
          .order('first_name')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Create contact
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        title: z.string().optional(),
        department: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        preferredContactMethod: z.enum(['email', 'phone', 'linkedin', 'text', 'video_call']).optional(),
        bestTimeToContact: z.string().optional(),
        timezone: z.string().optional(),
        decisionAuthority: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion']).optional(),
        isPrimary: z.boolean().default(false),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // If this contact is primary, reset other primary contacts
        if (input.isPrimary) {
          await adminClient
            .from('contacts')
            .update({ is_primary: false })
            .eq('org_id', orgId)
            .eq('company_id', input.accountId)
        }

        const { data, error } = await adminClient
          .from('contacts')
          .insert({
            org_id: orgId,
            company_id: input.accountId,
            first_name: input.firstName,
            last_name: input.lastName || '',
            email: input.email || null,
            phone: input.phone,
            mobile: input.mobile,
            title: input.title,
            department: input.department,
            linkedin_url: input.linkedinUrl || null,
            preferred_contact_method: input.preferredContactMethod || 'email',
            best_time_to_contact: input.bestTimeToContact,
            timezone: input.timezone || 'America/New_York',
            decision_authority: input.decisionAuthority,
            is_primary: input.isPrimary,
            notes: input.notes,
            contact_type: 'client_poc',
            status: 'active',
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
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        title: z.string().optional(),
        department: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        preferredContactMethod: z.enum(['email', 'phone', 'linkedin', 'text', 'video_call']).optional(),
        bestTimeToContact: z.string().optional(),
        timezone: z.string().optional(),
        decisionAuthority: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion']).nullish(),
        isPrimary: z.boolean().optional(),
        status: z.enum(['active', 'inactive', 'do_not_contact']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get contact to know the account
        const { data: contact } = await adminClient
          .from('contacts')
          .select('company_id')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        // If this contact is becoming primary, reset other primary contacts
        if (input.isPrimary && contact?.company_id) {
          await adminClient
            .from('contacts')
            .update({ is_primary: false })
            .eq('org_id', orgId)
            .eq('company_id', contact.company_id)
            .neq('id', input.id)
        }

        const updateData: Record<string, unknown> = { updated_by: user?.id }
        if (input.firstName !== undefined) updateData.first_name = input.firstName
        if (input.lastName !== undefined) updateData.last_name = input.lastName
        if (input.email !== undefined) updateData.email = input.email || null
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.mobile !== undefined) updateData.mobile = input.mobile
        if (input.title !== undefined) updateData.title = input.title
        if (input.department !== undefined) updateData.department = input.department
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl || null
        if (input.preferredContactMethod !== undefined) updateData.preferred_contact_method = input.preferredContactMethod
        if (input.bestTimeToContact !== undefined) updateData.best_time_to_contact = input.bestTimeToContact
        if (input.timezone !== undefined) updateData.timezone = input.timezone
        if (input.decisionAuthority !== undefined) updateData.decision_authority = input.decisionAuthority
        if (input.isPrimary !== undefined) updateData.is_primary = input.isPrimary
        if (input.status !== undefined) updateData.status = input.status
        if (input.notes !== undefined) updateData.notes = input.notes

        const { data, error } = await adminClient
          .from('contacts')
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

    // Delete contact (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('contacts')
          .update({ deleted_at: new Date().toISOString(), updated_by: user?.id })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // ACCOUNT NOTES
  // ============================================
  notes: router({
    // List notes for account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('account_notes')
          .select('*, author:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('account_id', input.accountId)
          .is('deleted_at', null)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Create note
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        title: z.string().optional(),
        content: z.string().min(1),
        noteType: z.enum(['general', 'internal', 'important', 'reminder']).default('general'),
        isPinned: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('account_notes')
          .insert({
            org_id: orgId,
            account_id: input.accountId,
            title: input.title,
            content: input.content,
            note_type: input.noteType,
            is_pinned: input.isPinned,
            created_by: user?.id,
          })
          .select('*, author:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Update note
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        content: z.string().min(1).optional(),
        noteType: z.enum(['general', 'internal', 'important', 'reminder']).optional(),
        isPinned: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_by: user?.id }
        if (input.title !== undefined) updateData.title = input.title
        if (input.content !== undefined) updateData.content = input.content
        if (input.noteType !== undefined) updateData.note_type = input.noteType
        if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned

        const { data, error } = await adminClient
          .from('account_notes')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, author:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Delete note
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('account_notes')
          .update({ deleted_at: new Date().toISOString(), updated_by: user?.id })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // MEETING NOTES
  // ============================================
  meetingNotes: router({
    // List meeting notes for account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('meeting_notes')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('account_id', input.accountId)
          .is('deleted_at', null)
          .order('scheduled_at', { ascending: false, nullsFirst: true })
          .limit(input.limit)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get meeting by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('meeting_notes')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url), account:accounts(id, name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
        }

        return data
      }),

    // Create meeting
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        meetingType: z.enum(['kickoff', 'check_in', 'qbr', 'intake', 'escalation', 'other']).default('check_in'),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledAt: z.string().datetime().optional(),
        durationMinutes: z.number().optional(),
        locationType: z.enum(['video', 'phone', 'in_person']).default('video'),
        locationDetails: z.string().optional(),
        agenda: z.string().optional(),
        contactIds: z.array(z.string().uuid()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('meeting_notes')
          .insert({
            org_id: orgId,
            account_id: input.accountId,
            meeting_type: input.meetingType,
            title: input.title,
            description: input.description,
            scheduled_at: input.scheduledAt,
            duration_minutes: input.durationMinutes,
            location_type: input.locationType,
            location_details: input.locationDetails,
            agenda: input.agenda,
            contact_ids: input.contactIds,
            status: input.scheduledAt ? 'scheduled' : 'completed',
            created_by: user?.id,
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Update meeting
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        meetingType: z.enum(['kickoff', 'check_in', 'qbr', 'intake', 'escalation', 'other']).optional(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        scheduledAt: z.string().datetime().optional(),
        startedAt: z.string().datetime().optional(),
        endedAt: z.string().datetime().optional(),
        durationMinutes: z.number().optional(),
        locationType: z.enum(['video', 'phone', 'in_person']).optional(),
        locationDetails: z.string().optional(),
        status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
        agenda: z.string().optional(),
        discussionNotes: z.string().optional(),
        keyTakeaways: z.array(z.string()).optional(),
        actionItems: z.array(z.object({
          description: z.string(),
          assigneeId: z.string().uuid().optional(),
          dueDate: z.string().datetime().optional(),
          completed: z.boolean().default(false),
        })).optional(),
        nextMeetingScheduled: z.string().datetime().optional(),
        followUpNotes: z.string().optional(),
        clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
        clientFeedback: z.string().optional(),
        contactIds: z.array(z.string().uuid()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_by: user?.id }
        if (input.meetingType !== undefined) updateData.meeting_type = input.meetingType
        if (input.title !== undefined) updateData.title = input.title
        if (input.description !== undefined) updateData.description = input.description
        if (input.scheduledAt !== undefined) updateData.scheduled_at = input.scheduledAt
        if (input.startedAt !== undefined) updateData.started_at = input.startedAt
        if (input.endedAt !== undefined) updateData.ended_at = input.endedAt
        if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes
        if (input.locationType !== undefined) updateData.location_type = input.locationType
        if (input.locationDetails !== undefined) updateData.location_details = input.locationDetails
        if (input.status !== undefined) updateData.status = input.status
        if (input.agenda !== undefined) updateData.agenda = input.agenda
        if (input.discussionNotes !== undefined) updateData.discussion_notes = input.discussionNotes
        if (input.keyTakeaways !== undefined) updateData.key_takeaways = input.keyTakeaways
        if (input.actionItems !== undefined) updateData.action_items = input.actionItems
        if (input.nextMeetingScheduled !== undefined) updateData.next_meeting_scheduled = input.nextMeetingScheduled
        if (input.followUpNotes !== undefined) updateData.follow_up_notes = input.followUpNotes
        if (input.clientSatisfaction !== undefined) updateData.client_satisfaction = input.clientSatisfaction
        if (input.clientFeedback !== undefined) updateData.client_feedback = input.clientFeedback
        if (input.contactIds !== undefined) updateData.contact_ids = input.contactIds

        const { data, error } = await adminClient
          .from('meeting_notes')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Complete meeting
    complete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        discussionNotes: z.string(),
        keyTakeaways: z.array(z.string()).optional(),
        actionItems: z.array(z.object({
          description: z.string(),
          assigneeId: z.string().uuid().optional(),
          dueDate: z.string().datetime().optional(),
          completed: z.boolean().default(false),
        })).optional(),
        clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
        clientFeedback: z.string().optional(),
        nextMeetingScheduled: z.string().datetime().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const now = new Date().toISOString()

        const { data, error } = await adminClient
          .from('meeting_notes')
          .update({
            status: 'completed',
            ended_at: now,
            discussion_notes: input.discussionNotes,
            key_takeaways: input.keyTakeaways,
            action_items: input.actionItems,
            client_satisfaction: input.clientSatisfaction,
            client_feedback: input.clientFeedback,
            next_meeting_scheduled: input.nextMeetingScheduled,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update account last_contact_date
        if (data?.account_id) {
          await adminClient
            .from('accounts')
            .update({ last_contact_date: now })
            .eq('id', data.account_id)
            .eq('org_id', orgId)
        }

        // Create tasks from action items (C05 requirement)
        if (input.actionItems && input.actionItems.length > 0) {
          const tasksToCreate = input.actionItems
            .filter(item => !item.completed) // Only create tasks for incomplete items
            .map(item => ({
              org_id: orgId,
              title: item.description,
              description: `Action item from meeting: ${data.title}`,
              task_type: 'follow_up',
              status: 'pending',
              priority: 'normal',
              due_date: item.dueDate || null,
              assignee_id: item.assigneeId || user?.id,
              entity_type: 'meeting',
              entity_id: data.id,
              related_account_id: data.account_id,
              source: 'meeting_action_item',
              created_by: user?.id,
            }))

          if (tasksToCreate.length > 0) {
            await adminClient
              .from('tasks')
              .insert(tasksToCreate)
          }

          // Create activity log for task creation
          if (tasksToCreate.length > 0) {
            await adminClient
              .from('activities')
              .insert({
                org_id: orgId,
                entity_type: 'meeting',
                entity_id: data.id,
                activity_type: 'task',
                activity_subtype: 'action_items_created',
                title: `${tasksToCreate.length} task(s) created from meeting`,
                description: `Created ${tasksToCreate.length} follow-up task(s) from meeting action items.`,
                created_by: user?.id,
              })
          }
        }

        return data
      }),
  }),

  // ============================================
  // ESCALATIONS
  // ============================================
  escalations: router({
    // List escalations for account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('escalations')
          .select('*, creator:user_profiles!created_by(id, full_name), assignee:user_profiles!assigned_to(id, full_name)')
          .eq('org_id', orgId)
          .eq('account_id', input.accountId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // List my escalations
    listMy: orgProtectedProcedure
      .input(z.object({
        status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('escalations')
          .select('*, account:accounts(id, name), creator:user_profiles!created_by(id, full_name), assignee:user_profiles!assigned_to(id, full_name)')
          .eq('org_id', orgId)
          .or(`created_by.eq.${user?.id},assigned_to.eq.${user?.id}`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get escalation by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: escalation, error } = await adminClient
          .from('escalations')
          .select(`
            *,
            account:accounts(id, name),
            creator:user_profiles!created_by(id, full_name, avatar_url),
            assignee:user_profiles!assigned_to(id, full_name, avatar_url),
            resolver:user_profiles!resolved_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Escalation not found' })
        }

        // Get updates
        const { data: updates } = await adminClient
          .from('escalation_updates')
          .select('*, author:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('escalation_id', input.id)
          .order('created_at', { ascending: true })

        return { ...escalation, updates: updates ?? [] }
      }),

    // Create escalation
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        escalationType: z.enum(['quality_concern', 'candidate_issue', 'billing_dispute', 'sla_violation', 'contract_dispute', 'communication', 'compliance', 'relationship', 'other']),
        severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        issueSummary: z.string().min(10).max(500),
        detailedDescription: z.string().min(20),
        relatedEntities: z.array(z.object({
          type: z.string(),
          id: z.string().uuid(),
          title: z.string().optional(),
        })).optional(),
        clientImpact: z.array(z.string()).optional(),
        immediateActions: z.string().optional(),
        assignedTo: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Calculate SLA due dates based on severity
        const now = new Date()
        let slaResponseDue: Date
        let slaResolutionDue: Date

        switch (input.severity) {
          case 'critical':
            slaResponseDue = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
            slaResolutionDue = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
            break
          case 'high':
            slaResponseDue = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
            slaResolutionDue = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours
            break
          case 'medium':
            slaResponseDue = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
            slaResolutionDue = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days
            break
          case 'low':
          default:
            slaResponseDue = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
            slaResolutionDue = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days
        }

        const { data, error } = await adminClient
          .from('escalations')
          .insert({
            org_id: orgId,
            account_id: input.accountId,
            escalation_type: input.escalationType,
            severity: input.severity,
            issue_summary: input.issueSummary,
            detailed_description: input.detailedDescription,
            related_entities: input.relatedEntities || [],
            client_impact: input.clientImpact,
            immediate_actions: input.immediateActions,
            status: 'open',
            sla_response_due: slaResponseDue.toISOString(),
            sla_resolution_due: slaResolutionDue.toISOString(),
            created_by: user?.id,
            assigned_to: input.assignedTo || user?.id,
          })
          .select('*, creator:user_profiles!created_by(id, full_name), assignee:user_profiles!assigned_to(id, full_name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create initial update
        await adminClient
          .from('escalation_updates')
          .insert({
            escalation_id: data.id,
            update_type: 'note',
            content: 'Escalation created',
            new_status: 'open',
            created_by: user?.id,
          })

        // Notify managers for high/critical escalations
        if (input.severity === 'high' || input.severity === 'critical') {
          // Get the account to find the account manager
          const { data: account } = await adminClient
            .from('accounts')
            .select('name, account_manager_id')
            .eq('id', input.accountId)
            .single()

          if (account?.account_manager_id) {
            // Get the account manager's manager (reports_to)
            const { data: accountManager } = await adminClient
              .from('user_profiles')
              .select('reports_to, full_name')
              .eq('id', account.account_manager_id)
              .single()

            if (accountManager?.reports_to) {
              // Create notification for the manager
              await adminClient
                .from('notifications')
                .insert({
                  org_id: orgId,
                  user_id: accountManager.reports_to,
                  title: `${input.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ HIGH'} Escalation: ${account.name}`,
                  body: `A ${input.severity} severity escalation has been created for ${account.name}: ${input.issueSummary}`,
                  category: 'escalation',
                  priority: input.severity === 'critical' ? 'urgent' : 'high',
                  action_url: `/employee/recruiting/accounts/${input.accountId}?tab=escalations`,
                  action_label: 'View Escalation',
                  entity_type: 'escalation',
                  entity_id: data.id,
                })
            }
          }

          // Also notify the creator's manager if different from account manager's manager
          if (user?.id) {
            const { data: creator } = await adminClient
              .from('user_profiles')
              .select('reports_to')
              .eq('id', user.id)
              .single()

            if (creator?.reports_to) {
              // Check if we already notified this manager
              const { data: existingNotification } = await adminClient
                .from('notifications')
                .select('id')
                .eq('entity_id', data.id)
                .eq('user_id', creator.reports_to)
                .single()

              if (!existingNotification) {
                const { data: account } = await adminClient
                  .from('accounts')
                  .select('name')
                  .eq('id', input.accountId)
                  .single()

                await adminClient
                  .from('notifications')
                  .insert({
                    org_id: orgId,
                    user_id: creator.reports_to,
                    title: `${input.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ HIGH'} Escalation: ${account?.name || 'Account'}`,
                    body: `A ${input.severity} severity escalation has been created: ${input.issueSummary}`,
                    category: 'escalation',
                    priority: input.severity === 'critical' ? 'urgent' : 'high',
                    action_url: `/employee/recruiting/accounts/${input.accountId}?tab=escalations`,
                    action_label: 'View Escalation',
                    entity_type: 'escalation',
                    entity_id: data.id,
                  })
              }
            }
          }
        }

        return data
      }),

    // Update escalation
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        status: z.enum(['open', 'in_progress', 'resolved', 'escalated', 'closed']).optional(),
        assignedTo: z.string().uuid().optional(),
        resolutionPlan: z.string().optional(),
        rootCause: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get current escalation for comparison
        const { data: current } = await adminClient
          .from('escalations')
          .select('status, assigned_to')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        const updateData: Record<string, unknown> = {}
        if (input.severity !== undefined) updateData.severity = input.severity
        if (input.status !== undefined) updateData.status = input.status
        if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo
        if (input.resolutionPlan !== undefined) updateData.resolution_plan = input.resolutionPlan
        if (input.rootCause !== undefined) updateData.root_cause = input.rootCause

        const { data, error } = await adminClient
          .from('escalations')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, creator:user_profiles!created_by(id, full_name), assignee:user_profiles!assigned_to(id, full_name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create update records for changes
        if (input.status && input.status !== current?.status) {
          await adminClient
            .from('escalation_updates')
            .insert({
              escalation_id: input.id,
              update_type: 'status_change',
              content: `Status changed from ${current?.status} to ${input.status}`,
              old_status: current?.status,
              new_status: input.status,
              created_by: user?.id,
            })
        }

        if (input.assignedTo && input.assignedTo !== current?.assigned_to) {
          await adminClient
            .from('escalation_updates')
            .insert({
              escalation_id: input.id,
              update_type: 'assignment_change',
              content: 'Assignee changed',
              old_assignee_id: current?.assigned_to,
              new_assignee_id: input.assignedTo,
              created_by: user?.id,
            })
        }

        return data
      }),

    // Add update/note to escalation
    addUpdate: orgProtectedProcedure
      .input(z.object({
        escalationId: z.string().uuid(),
        content: z.string().min(1),
        updateType: z.enum(['note', 'resolution_update', 'customer_response']).default('note'),
        isInternal: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('escalation_updates')
          .insert({
            escalation_id: input.escalationId,
            update_type: input.updateType,
            content: input.content,
            is_internal: input.isInternal,
            created_by: user?.id,
          })
          .select('*, author:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Resolve escalation
    resolve: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        resolutionSummary: z.string().min(10),
        resolutionActions: z.string().optional(),
        clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
        lessonsLearned: z.string().optional(),
        preventiveMeasures: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get escalation for time tracking
        const { data: escalation } = await adminClient
          .from('escalations')
          .select('created_at, sla_resolution_due, status')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        const now = new Date()
        const createdAt = new Date(escalation?.created_at || now)
        const timeToResolve = now.getTime() - createdAt.getTime()
        const slaResolutionMet = escalation?.sla_resolution_due
          ? now <= new Date(escalation.sla_resolution_due)
          : true

        const { data, error } = await adminClient
          .from('escalations')
          .update({
            status: 'resolved',
            resolved_by: user?.id,
            resolved_at: now.toISOString(),
            resolution_summary: input.resolutionSummary,
            resolution_actions: input.resolutionActions,
            client_satisfaction: input.clientSatisfaction,
            lessons_learned: input.lessonsLearned,
            preventive_measures: input.preventiveMeasures,
            time_to_resolve: `${Math.floor(timeToResolve / 1000)} seconds`,
            sla_resolution_met: slaResolutionMet,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, creator:user_profiles!created_by(id, full_name), resolver:user_profiles!resolved_by(id, full_name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Add resolution update
        await adminClient
          .from('escalation_updates')
          .insert({
            escalation_id: input.id,
            update_type: 'resolution_update',
            content: input.resolutionSummary,
            old_status: escalation?.status,
            new_status: 'resolved',
            created_by: user?.id,
          })

        return data
      }),
  }),

  // ============================================
  // ACTIVITIES (CRM Activities)
  // ============================================
  activities: router({
    // List activities for account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('crm_activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('entity_type', 'account')
          .eq('entity_id', input.accountId)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.activityType !== 'all') {
          query = query.eq('activity_type', input.activityType)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Log activity
    log: orgProtectedProcedure
      .input(z.object({
        entityType: z.string().default('account'),
        entityId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'linkedin_message']),
        subject: z.string().optional(),
        description: z.string().optional(),
        outcome: z.enum(['positive', 'neutral', 'negative', 'no_response', 'left_voicemail', 'busy', 'connected']).optional(),
        direction: z.enum(['inbound', 'outbound']).optional(),
        durationMinutes: z.number().optional(),
        scheduledAt: z.string().datetime().optional(),
        completedAt: z.string().datetime().optional(),
        nextSteps: z.string().optional(),
        nextFollowUpDate: z.string().datetime().optional(),
        relatedContactId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            activity_type: input.activityType,
            subject: input.subject,
            description: input.description,
            outcome: input.outcome,
            direction: input.direction,
            duration_minutes: input.durationMinutes,
            scheduled_at: input.scheduledAt,
            completed_at: input.completedAt || new Date().toISOString(),
            next_steps: input.nextSteps,
            next_follow_up_date: input.nextFollowUpDate,
            related_contact_id: input.relatedContactId,
            status: 'completed',
            created_by: user?.id,
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update account last_contact_date
        if (input.entityType === 'account') {
          await adminClient
            .from('accounts')
            .update({ last_contact_date: new Date().toISOString() })
            .eq('id', input.entityId)
            .eq('org_id', orgId)
        }

        return data
      }),
  }),

  // ============================================
  // CAMPAIGNS (A01-A04: Campaigns & Lead Gen)
  // ============================================
  campaigns: router({
    // List campaigns with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'all']).default('all'),
        type: z.enum(['lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing', 'all']).default('all'),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['created_at', 'start_date', 'name', 'leads_generated']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('campaigns')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`name.ilike.%${input.search}%,description.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.type && input.type !== 'all') {
          query = query.eq('campaign_type', input.type)
        }
        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }

        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(c => ({
            id: c.id,
            name: c.name,
            campaignType: c.campaign_type,
            goal: c.goal,
            status: c.status,
            startDate: c.start_date,
            endDate: c.end_date,
            channels: c.channels,
            audienceSize: c.audience_size,
            prospectsContacted: c.prospects_contacted,
            prospectsResponded: c.prospects_responded,
            leadsGenerated: c.leads_generated,
            meetingsBooked: c.meetings_booked,
            targetLeads: c.target_leads,
            targetMeetings: c.target_meetings,
            budgetTotal: c.budget_total,
            budgetSpent: c.budget_spent,
            owner: c.owner,
            createdAt: c.created_at,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // Get campaign by ID with full details
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: campaign, error } = await adminClient
          .from('campaigns')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url, email),
            approved_by_user:user_profiles!approved_by(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
        }

        // Get funnel metrics
        const { data: funnel } = await adminClient.rpc('get_campaign_funnel', { p_campaign_id: input.id })

        // Get channel performance
        const { data: channelPerformance } = await adminClient.rpc('get_campaign_channel_performance', { p_campaign_id: input.id })

        // Get recent prospects with responses
        const { data: recentResponses } = await adminClient
          .from('campaign_prospects')
          .select('*')
          .eq('campaign_id', input.id)
          .not('responded_at', 'is', null)
          .order('responded_at', { ascending: false })
          .limit(10)

        return {
          ...campaign,
          targetCriteria: campaign.target_criteria,
          sequences: campaign.sequences,
          complianceSettings: campaign.compliance_settings,
          abTestConfig: campaign.ab_test_config,
          funnel: funnel?.[0] ?? null,
          channelPerformance: channelPerformance ?? [],
          recentResponses: recentResponses ?? [],
        }
      }),

    // Create new campaign (A01)
    create: orgProtectedProcedure
      .input(z.object({
        // Step 1: Campaign Setup
        name: z.string().min(3).max(100),
        campaignType: z.enum(['lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing']),
        goal: z.enum(['generate_qualified_leads', 'book_discovery_meetings', 'drive_event_registrations', 'build_brand_awareness', 'expand_candidate_pool']),
        description: z.string().optional(),
        // Step 2: Target Audience
        targetCriteria: z.object({
          audienceSource: z.enum(['new_prospects', 'existing_leads', 'dormant_accounts', 'import_list']),
          industries: z.array(z.string()).optional(),
          companySizes: z.array(z.string()).optional(),
          regions: z.array(z.string()).optional(),
          fundingStages: z.array(z.string()).optional(),
          targetTitles: z.array(z.string()).optional(),
          exclusions: z.object({
            excludeExistingClients: z.boolean().default(true),
            excludeRecentlyContacted: z.number().default(90),
            excludeCompetitors: z.boolean().default(true),
          }).optional(),
        }),
        // Step 3: Channels
        channels: z.array(z.enum(['linkedin', 'email', 'phone', 'event', 'direct_mail'])),
        sequences: z.record(z.object({
          steps: z.array(z.object({
            stepNumber: z.number(),
            dayOffset: z.number(),
            subject: z.string().optional(),
            templateId: z.string().optional(),
            templateName: z.string().optional(),
          })),
          stopConditions: z.array(z.string()).optional(),
          sendTime: z.string().optional(),
          respectTimezone: z.boolean().optional(),
          dailyLimit: z.number().optional(),
        })).optional(),
        // Step 4: Schedule & Budget
        startDate: z.string(),
        endDate: z.string(),
        launchImmediately: z.boolean().default(true),
        budgetTotal: z.number().min(0).default(0),
        budgetCurrency: z.string().default('USD'),
        targetLeads: z.number().min(0).default(0),
        targetMeetings: z.number().min(0).default(0),
        targetRevenue: z.number().min(0).default(0),
        // Step 5: Compliance
        complianceSettings: z.object({
          gdpr: z.boolean().default(true),
          canSpam: z.boolean().default(true),
          casl: z.boolean().default(true),
          includeUnsubscribe: z.boolean().default(true),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Determine initial status
        const status = input.launchImmediately ? 'active' : 'scheduled'

        // Create campaign
        const { data, error } = await adminClient
          .from('campaigns')
          .insert({
            org_id: orgId,
            name: input.name,
            campaign_type: input.campaignType,
            goal: input.goal,
            description: input.description,
            target_criteria: input.targetCriteria,
            channels: input.channels,
            sequences: input.sequences ?? {},
            start_date: input.startDate,
            end_date: input.endDate,
            status,
            budget_total: input.budgetTotal,
            budget_currency: input.budgetCurrency,
            target_leads: input.targetLeads,
            target_meetings: input.targetMeetings,
            target_revenue: input.targetRevenue,
            compliance_settings: input.complianceSettings ?? { gdpr: true, canSpam: true, casl: true, includeUnsubscribe: true },
            owner_id: user?.id,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Campaign Created',
            description: `Campaign "${input.name}" created with ${input.channels.length} channels`,
            created_by: user?.id,
          })

        return data
      }),

    // Update campaign
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(100).optional(),
        description: z.string().optional(),
        targetCriteria: z.record(z.unknown()).optional(),
        channels: z.array(z.string()).optional(),
        sequences: z.record(z.unknown()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budgetTotal: z.number().min(0).optional(),
        targetLeads: z.number().min(0).optional(),
        targetMeetings: z.number().min(0).optional(),
        targetRevenue: z.number().min(0).optional(),
        complianceSettings: z.record(z.boolean()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_by: user?.id }
        if (input.name !== undefined) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.targetCriteria !== undefined) updateData.target_criteria = input.targetCriteria
        if (input.channels !== undefined) updateData.channels = input.channels
        if (input.sequences !== undefined) updateData.sequences = input.sequences
        if (input.startDate !== undefined) updateData.start_date = input.startDate
        if (input.endDate !== undefined) updateData.end_date = input.endDate
        if (input.budgetTotal !== undefined) updateData.budget_total = input.budgetTotal
        if (input.targetLeads !== undefined) updateData.target_leads = input.targetLeads
        if (input.targetMeetings !== undefined) updateData.target_meetings = input.targetMeetings
        if (input.targetRevenue !== undefined) updateData.target_revenue = input.targetRevenue
        if (input.complianceSettings !== undefined) updateData.compliance_settings = input.complianceSettings

        const { data, error } = await adminClient
          .from('campaigns')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Update campaign status (pause, resume, complete)
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['active', 'paused', 'completed']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('campaigns')
          .update({
            status: input.status,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: input.id,
            activity_type: 'note',
            subject: `Campaign ${input.status === 'active' ? 'Resumed' : input.status === 'paused' ? 'Paused' : 'Completed'}`,
            description: `Campaign status changed to ${input.status}`,
            created_by: user?.id,
          })

        return data
      }),

    // Get campaign metrics (A02)
    getMetrics: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        dateRange: z.enum(['7d', '14d', '30d', 'all']).default('all'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get funnel metrics
        const { data: funnel } = await adminClient.rpc('get_campaign_funnel', { p_campaign_id: input.id })

        // Get channel performance
        const { data: channelPerformance } = await adminClient.rpc('get_campaign_channel_performance', { p_campaign_id: input.id })

        // Get daily trends
        const { data: dailyTrends } = await adminClient
          .from('campaign_sequence_logs')
          .select('action_at, action_type')
          .eq('campaign_id', input.id)
          .gte('action_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('action_at', { ascending: true })

        // Get campaign budget info
        const { data: campaign } = await adminClient
          .from('campaigns')
          .select('budget_total, budget_spent, target_leads, target_meetings, target_revenue, leads_generated, meetings_booked, revenue_generated')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        // Calculate cost metrics
        const leadsGenerated = funnel?.[0]?.leads ?? 0
        const meetingsBooked = funnel?.[0]?.meetings ?? 0
        const budgetSpent = campaign?.budget_spent ?? 0
        const costPerLead = leadsGenerated > 0 ? budgetSpent / leadsGenerated : 0
        const costPerMeeting = meetingsBooked > 0 ? budgetSpent / meetingsBooked : 0

        return {
          funnel: funnel?.[0] ?? {
            total_prospects: 0,
            contacted: 0,
            opened: 0,
            clicked: 0,
            responded: 0,
            leads: 0,
            meetings: 0,
            open_rate: 0,
            response_rate: 0,
            conversion_rate: 0,
          },
          channelPerformance: channelPerformance ?? [],
          dailyTrends: dailyTrends ?? [],
          budget: {
            total: campaign?.budget_total ?? 0,
            spent: budgetSpent,
            remaining: (campaign?.budget_total ?? 0) - budgetSpent,
          },
          targets: {
            leads: { target: campaign?.target_leads ?? 0, actual: leadsGenerated },
            meetings: { target: campaign?.target_meetings ?? 0, actual: meetingsBooked },
            revenue: { target: campaign?.target_revenue ?? 0, actual: campaign?.revenue_generated ?? 0 },
          },
          costs: {
            perLead: costPerLead,
            perMeeting: costPerMeeting,
          },
        }
      }),

    // Get prospects for a campaign
    getProspects: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        status: z.enum(['enrolled', 'contacted', 'engaged', 'responded', 'converted', 'unsubscribed', 'bounced', 'all']).default('all'),
        responseType: z.enum(['positive', 'neutral', 'negative', 'all']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('campaign_prospects')
          .select('*, converted_lead:leads!converted_lead_id(*)', { count: 'exact' })
          .eq('campaign_id', input.campaignId)
          .eq('org_id', orgId)

        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.responseType && input.responseType !== 'all') {
          query = query.eq('response_type', input.responseType)
        }

        query = query.order('updated_at', { ascending: false })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Add prospects to campaign
    addProspects: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        prospects: z.array(z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email(),
          phone: z.string().optional(),
          linkedinUrl: z.string().optional(),
          companyName: z.string().optional(),
          companyIndustry: z.string().optional(),
          companySize: z.string().optional(),
          title: z.string().optional(),
          location: z.string().optional(),
          timezone: z.string().optional(),
        })),
        channel: z.enum(['email', 'linkedin', 'phone']).default('email'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const prospectsToInsert = input.prospects.map(p => ({
          org_id: orgId,
          campaign_id: input.campaignId,
          first_name: p.firstName,
          last_name: p.lastName,
          email: p.email,
          phone: p.phone,
          linkedin_url: p.linkedinUrl,
          company_name: p.companyName,
          company_industry: p.companyIndustry,
          company_size: p.companySize,
          title: p.title,
          location: p.location,
          timezone: p.timezone,
          primary_channel: input.channel,
          status: 'enrolled',
        }))

        const { data, error } = await adminClient
          .from('campaign_prospects')
          .upsert(prospectsToInsert, {
            onConflict: 'campaign_id,email',
            ignoreDuplicates: true,
          })
          .select()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { added: data?.length ?? 0 }
      }),

    // Convert prospect to lead (A03)
    convertProspectToLead: orgProtectedProcedure
      .input(z.object({
        prospectId: z.string().uuid(),
        // Lead data
        leadScore: z.number().min(0).max(100).optional(),
        interestLevel: z.enum(['hot', 'warm', 'cold']),
        // BANT
        budgetStatus: z.enum(['unknown', 'limited', 'defined', 'approved']).optional(),
        budgetNotes: z.string().optional(),
        authorityStatus: z.enum(['unknown', 'influencer', 'decision_maker', 'champion']).optional(),
        authorityNotes: z.string().optional(),
        needStatus: z.enum(['unknown', 'identified', 'defined', 'urgent']).optional(),
        needNotes: z.string().optional(),
        timelineStatus: z.enum(['unknown', 'long', 'medium', 'short']).optional(),
        timelineNotes: z.string().optional(),
        // Hiring details
        hiringNeeds: z.string().optional(),
        urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        painPoints: z.string().optional(),
        // Next steps
        nextAction: z.string().optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
        // Notifications
        notifyPodManager: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get prospect data
        const { data: prospect, error: prospectError } = await adminClient
          .from('campaign_prospects')
          .select('*, campaign:campaigns!campaign_id(id, name)')
          .eq('id', input.prospectId)
          .eq('org_id', orgId)
          .single()

        if (prospectError || !prospect) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Prospect not found' })
        }

        // Check if already converted
        if (prospect.converted_lead_id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Prospect already converted to lead' })
        }

        // Create lead
        const { data: lead, error: leadError } = await adminClient
          .from('leads')
          .insert({
            org_id: orgId,
            lead_type: 'company',
            company_name: prospect.company_name,
            industry: prospect.company_industry,
            company_size: prospect.company_size,
            first_name: prospect.first_name,
            last_name: prospect.last_name,
            title: prospect.title,
            email: prospect.email,
            phone: prospect.phone,
            linkedin_url: prospect.linkedin_url,
            source: 'campaign',
            campaign_id: prospect.campaign_id,
            campaign_prospect_id: prospect.id,
            status: 'qualified',
            lead_score: input.leadScore,
            interest_level: input.interestLevel,
            budget_status: input.budgetStatus,
            budget_notes: input.budgetNotes,
            authority_status: input.authorityStatus,
            authority_notes: input.authorityNotes,
            need_status: input.needStatus,
            need_notes: input.needNotes,
            timeline_status: input.timelineStatus,
            timeline_notes: input.timelineNotes,
            hiring_needs: input.hiringNeeds,
            urgency: input.urgency,
            pain_points: input.painPoints,
            next_action: input.nextAction,
            next_action_date: input.nextActionDate,
            owner_id: user?.id,
            created_by: user?.id,
          })
          .select('*')
          .single()

        if (leadError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: leadError.message })
        }

        // Update prospect as converted
        await adminClient
          .from('campaign_prospects')
          .update({
            converted_to_lead_at: new Date().toISOString(),
            converted_lead_id: lead.id,
            status: 'converted',
          })
          .eq('id', input.prospectId)

        // Create follow-up task if next action specified
        if (input.nextAction && input.nextActionDate) {
          await adminClient
            .from('lead_tasks')
            .insert({
              org_id: orgId,
              lead_id: lead.id,
              title: input.nextAction,
              description: input.notes,
              due_date: input.nextActionDate,
              priority: input.urgency === 'urgent' ? 'critical' : input.urgency === 'high' ? 'high' : 'normal',
              assigned_to: user?.id,
              created_by: user?.id,
            })
        }

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: lead.id,
            activity_type: 'note',
            subject: 'Lead Created from Campaign',
            description: `Lead created from campaign "${(prospect.campaign as { name: string })?.name || 'Unknown'}". Interest level: ${input.interestLevel}`,
            created_by: user?.id,
          })

        return lead
      }),

    // Delete campaign
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('campaigns')
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Duplicate campaign
    duplicate: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().min(3).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get source campaign
        const { data: source, error: sourceError } = await adminClient
          .from('campaigns')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (sourceError || !source) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
        }

        // Create duplicate
        const { data, error } = await adminClient
          .from('campaigns')
          .insert({
            org_id: orgId,
            name: input.newName,
            campaign_type: source.campaign_type,
            goal: source.goal,
            description: source.description,
            target_criteria: source.target_criteria,
            channels: source.channels,
            sequences: source.sequences,
            budget_total: source.budget_total,
            budget_currency: source.budget_currency,
            target_leads: source.target_leads,
            target_meetings: source.target_meetings,
            target_revenue: source.target_revenue,
            compliance_settings: source.compliance_settings,
            status: 'draft',
            owner_id: user?.id,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // ============================================
  // CROSS-PILLAR LEADS (A04: Create Lead)
  // ============================================
  crossPillarLeads: router({
    // Create cross-pillar lead
    create: orgProtectedProcedure
      .input(z.object({
        // Lead type
        leadType: z.enum(['ta_lead', 'bench_lead', 'sales_lead', 'academy_lead']),
        // Company info
        companyName: z.string().min(2).max(200),
        // Contact info
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        // Opportunity
        description: z.string().min(10).max(500),
        source: z.enum(['candidate_call', 'client_call', 'job_discussion', 'placement_followup', 'referral', 'networking', 'research', 'other']),
        sourceDetails: z.string().optional(),
        // Priority
        urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        estimatedValue: z.number().min(0).optional(),
        valueCurrency: z.string().default('USD'),
        // Assignment
        assignTo: z.string().uuid().optional(),
        handoffNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Map lead type to target pillar
        const pillarMap: Record<string, string> = {
          ta_lead: 'ta',
          bench_lead: 'bench_sales',
          sales_lead: 'sales',
          academy_lead: 'academy',
        }
        const targetPillar = pillarMap[input.leadType]

        // Determine owner - use specified or auto-assign
        let ownerId = input.assignTo
        if (!ownerId) {
          // Auto-assign via round-robin (simplified - just get first user in target dept)
          const { data: teamMembers } = await adminClient
            .from('employee_metadata')
            .select('user_id')
            .eq('org_id', orgId)
            .eq('department', targetPillar)
            .eq('status', 'active')
            .limit(1)

          ownerId = teamMembers?.[0]?.user_id || user?.id
        }

        // Create lead
        const notes = input.handoffNotes
          ? `${input.description}\n\n---\nHandoff Notes: ${input.handoffNotes}`
          : input.description

        const { data: lead, error: leadError } = await adminClient
          .from('leads')
          .insert({
            org_id: orgId,
            lead_type: 'company',
            company_name: input.companyName,
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email || null,
            phone: input.phone,
            source: input.source,
            business_need: notes,
            estimated_value: input.estimatedValue,
            cross_pillar_type: input.leadType,
            target_pillar: targetPillar,
            urgency: input.urgency,
            handoff_notes: input.handoffNotes,
            status: 'new',
            owner_id: ownerId,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name)')
          .single()

        if (leadError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: leadError.message })
        }

        // Create lead sourcing credit
        await adminClient
          .from('lead_sourcing_credits')
          .insert({
            org_id: orgId,
            lead_id: lead.id,
            sourced_by: user?.id,
            source_pillar: 'recruiting', // Assuming current user is recruiter
            target_pillar: targetPillar,
            assigned_to: ownerId,
            credit_points: 10,
            status: 'pending',
          })

        // Create follow-up task based on urgency
        const dueDate = new Date()
        switch (input.urgency) {
          case 'urgent':
            dueDate.setDate(dueDate.getDate() + 1) // 24 hours
            break
          case 'high':
            dueDate.setDate(dueDate.getDate() + 2)
            break
          case 'normal':
            dueDate.setDate(dueDate.getDate() + 7)
            break
          case 'low':
            dueDate.setDate(dueDate.getDate() + 14)
            break
        }

        await adminClient
          .from('lead_tasks')
          .insert({
            org_id: orgId,
            lead_id: lead.id,
            title: `Follow up on ${input.companyName}`,
            description: `Cross-pillar lead from recruiting. ${input.description}`,
            due_date: dueDate.toISOString().split('T')[0],
            priority: input.urgency === 'urgent' ? 'critical' : input.urgency === 'high' ? 'high' : 'normal',
            assigned_to: ownerId,
            created_by: user?.id,
          })

        // Log activity
        await adminClient
          .from('crm_activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: lead.id,
            activity_type: 'note',
            subject: 'Cross-Pillar Lead Created',
            description: `${input.leadType.replace('_', ' ').toUpperCase()} created by recruiting team. Source: ${input.source}`,
            created_by: user?.id,
          })

        return lead
      }),

    // Get leaderboard for cross-pillar leads
    getLeaderboard: orgProtectedProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Calculate date range
        const now = new Date()
        let startDate: Date
        switch (input.period) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1))
            break
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3))
            break
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1))
            break
        }

        const { data: credits } = await adminClient
          .from('lead_sourcing_credits')
          .select(`
            sourced_by,
            credit_points,
            bonus_points,
            status,
            user:user_profiles!sourced_by(id, full_name, avatar_url)
          `)
          .eq('org_id', orgId)
          .gte('created_at', startDate.toISOString())

        // Aggregate by user
        const leaderboard = new Map<string, {
          userId: string
          name: string
          avatarUrl: string | null
          totalLeads: number
          totalPoints: number
          converted: number
        }>()

        credits?.forEach(c => {
          const userId = c.sourced_by
          const existing = leaderboard.get(userId) || {
            userId,
            name: (c.user as { full_name: string })?.full_name || 'Unknown',
            avatarUrl: (c.user as { avatar_url: string | null })?.avatar_url || null,
            totalLeads: 0,
            totalPoints: 0,
            converted: 0,
          }
          existing.totalLeads += 1
          existing.totalPoints += (c.credit_points || 0) + (c.bonus_points || 0)
          if (c.status === 'converted') existing.converted += 1
          leaderboard.set(userId, existing)
        })

        // Sort by total points
        const sorted = Array.from(leaderboard.values())
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, 10)

        return sorted
      }),
  }),
})
