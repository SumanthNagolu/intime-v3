import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { orgProtectedProcedure } from '../trpc/middleware'
import { router } from '../trpc/init'


// ============================================
// SCHEMA DEFINITIONS
// ============================================

const CompanyCategory = z.enum(['client', 'vendor', 'partner', 'prospect'])
const CompanyStatus = z.enum(['draft', 'active', 'inactive', 'on_hold', 'churned', 'do_not_use', 'pending_approval'])
const CompanyTier = z.enum(['strategic', 'preferred', 'standard', 'transactional'])
const CompanySegment = z.enum(['enterprise', 'mid_market', 'smb', 'startup'])
const CompanyRelationshipType = z.enum([
  'direct_client', 'msp_client', 'prime_vendor', 'sub_vendor',
  'implementation_partner', 'referral_partner', 'competitor'
])
const CompanyVendorType = z.enum([
  'direct_client', 'prime_vendor', 'sub_vendor', 'msp',
  'vms_provider', 'talent_supplier', 'referral_source'
])

// ============================================
// COMPANIES ROUTER
// Unified router for all company types (accounts + vendors + partners)
// ============================================

export const companiesRouter = router({
  // ============================================
  // QUERY PROCEDURES
  // ============================================

  // List companies with category filtering
  list: orgProtectedProcedure
    .input(z.object({
      category: CompanyCategory.optional(),
      categories: z.array(CompanyCategory).optional(),
      status: CompanyStatus.optional(),
      statuses: z.array(CompanyStatus).optional(),
      excludeDraft: z.boolean().optional(), // Exclude draft status from results
      tier: CompanyTier.optional(),
      segment: CompanySegment.optional(),
      ownerId: z.string().uuid().optional(),
      accountManagerId: z.string().uuid().optional(),
      search: z.string().optional(),
      industry: z.string().optional(),
      sortBy: z.enum([
        'name', 'category', 'industry', 'status', 'tier', 'segment',
        'health_score', 'last_contacted_date', 'revenue_ytd', 'created_at'
      ]).default('name'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('companies')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url),
          account_manager:user_profiles!account_manager_id(id, full_name, avatar_url),
          client_details:company_client_details(*),
          vendor_details:company_vendor_details(*)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Category filtering
      if (input.category) {
        query = query.eq('category', input.category)
      } else if (input.categories && input.categories.length > 0) {
        query = query.in('category', input.categories)
      }

      // Status filtering
      if (input.status) {
        query = query.eq('status', input.status)
      } else if (input.statuses && input.statuses.length > 0) {
        query = query.in('status', input.statuses)
      }

      // Exclude draft status (for main list when drafts are shown separately)
      if (input.excludeDraft) {
        query = query.neq('status', 'draft')
      }

      // Other filters
      if (input.tier) query = query.eq('tier', input.tier)
      if (input.segment) query = query.eq('segment', input.segment)
      if (input.ownerId) query = query.eq('owner_id', input.ownerId)
      if (input.accountManagerId) query = query.eq('account_manager_id', input.accountManagerId)
      if (input.industry) query = query.eq('industry', input.industry)
      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,industry.ilike.%${input.search}%,headquarters_city.ilike.%${input.search}%`)
      }

      // Sorting and pagination
      query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(company => ({
          ...company,
          // Transform for consistent API
          location: company.headquarters_city && company.headquarters_state
            ? `${company.headquarters_city}, ${company.headquarters_state}`
            : company.headquarters_city || company.headquarters_state || null,
        })) || [],
        total: count || 0,
      }
    }),

  // Get single company by ID with full details
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: company, error } = await adminClient
        .from('companies')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url, email),
          account_manager:user_profiles!account_manager_id(id, full_name, avatar_url, email),
          client_details:company_client_details(*),
          vendor_details:company_vendor_details(*),
          partner_details:company_partner_details(*),
          team:company_team(*, user:user_profiles(id, full_name, avatar_url)),
          preferences:company_preferences(*),
          compliance:company_compliance_requirements(*)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' })
      }

      // Fetch addresses separately (polymorphic)
      const { data: addresses } = await adminClient
        .from('addresses')
        .select('*')
        .eq('entity_type', 'company')
        .eq('entity_id', input.id)
        .is('deleted_at', null)

      // Fetch recent health scores
      const { data: healthScores } = await adminClient
        .from('company_health_scores')
        .select('*')
        .eq('company_id', input.id)
        .order('score_date', { ascending: false })
        .limit(5)

      // Fetch contacts linked to this company
      const { data: contacts } = await adminClient
        .from('company_contacts')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone, title)
        `)
        .eq('company_id', input.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .limit(20)

      return {
        ...company,
        addresses: addresses || [],
        health_history: healthScores || [],
        contacts: contacts || [],
      }
    }),

  // Get lightweight company data (for navigation/headers)
  getByIdLite: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('companies')
        .select('id, name, category, industry, status, tier, website, phone, headquarters_city, headquarters_state')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' })
      }

      return data
    }),

  // Get stats aggregated by category, status, tier
  stats: orgProtectedProcedure
    .input(z.object({
      category: CompanyCategory.optional(),
      categories: z.array(CompanyCategory).optional(),
      excludeDraft: z.boolean().optional(), // Exclude draft status from stats
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('companies')
        .select('id, category, status, tier, segment, health_status, revenue_ytd')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply category filter if provided
      if (input.category) {
        query = query.eq('category', input.category)
      } else if (input.categories && input.categories.length > 0) {
        query = query.in('category', input.categories)
      }

      // Exclude draft status from stats
      if (input.excludeDraft) {
        query = query.neq('status', 'draft')
      }

      const { data: companies, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const companyList = companies || []

      return {
        total: companyList.length,
        byCategory: {
          clients: companyList.filter(c => c.category === 'client').length,
          vendors: companyList.filter(c => c.category === 'vendor').length,
          partners: companyList.filter(c => c.category === 'partner').length,
          prospects: companyList.filter(c => c.category === 'prospect').length,
        },
        byStatus: {
          active: companyList.filter(c => c.status === 'active').length,
          inactive: companyList.filter(c => c.status === 'inactive').length,
          onHold: companyList.filter(c => c.status === 'on_hold').length,
          churned: companyList.filter(c => c.status === 'churned').length,
          pendingApproval: companyList.filter(c => c.status === 'pending_approval').length,
        },
        byTier: {
          strategic: companyList.filter(c => c.tier === 'strategic').length,
          preferred: companyList.filter(c => c.tier === 'preferred').length,
          standard: companyList.filter(c => c.tier === 'standard').length,
          transactional: companyList.filter(c => c.tier === 'transactional').length,
        },
        bySegment: {
          enterprise: companyList.filter(c => c.segment === 'enterprise').length,
          midMarket: companyList.filter(c => c.segment === 'mid_market').length,
          smb: companyList.filter(c => c.segment === 'smb').length,
          startup: companyList.filter(c => c.segment === 'startup').length,
        },
        byHealth: {
          healthy: companyList.filter(c => c.health_status === 'healthy').length,
          attention: companyList.filter(c => c.health_status === 'attention').length,
          atRisk: companyList.filter(c => c.health_status === 'at_risk').length,
        },
        totalRevenueYtd: companyList.reduce((sum, c) => sum + (Number(c.revenue_ytd) || 0), 0),
      }
    }),

  // Get health scores with calculation (matches existing accounts algorithm)
  getHealth: orgProtectedProcedure
    .input(z.object({
      ownerId: z.string().uuid().optional(),
      category: CompanyCategory.optional(),
      categories: z.array(CompanyCategory).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const ownerId = input.ownerId || user?.id

      let query = adminClient
        .from('companies')
        .select(`
          id, name, industry, status, category, tier,
          last_contacted_date, nps_score, health_score,
          jobs:jobs!company_id(id, status),
          placements:placements!company_id(id, billing_rate, hours_billed)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (ownerId) {
        query = query.eq('owner_id', ownerId)
      }

      if (input.category) {
        query = query.eq('category', input.category)
      } else if (input.categories && input.categories.length > 0) {
        query = query.in('category', input.categories)
      }

      query = query.order('name')
      query = query.limit(input.limit)

      const { data: companies, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Calculate health scores (same algorithm as accounts router in crm.ts)
      const now = new Date()
      interface CompanyData {
        id: string
        name: string | null
        industry: string | null
        status: string | null
        category: string | null
        tier: string | null
        last_contacted_date: string | null
        nps_score: number | null
        health_score: number | null
        jobs: Array<{ id: string; status: string }> | null
        placements: Array<{ id: string; billing_rate: number | null; hours_billed: number | null }> | null
      }

      const results = (companies as CompanyData[] || []).map(company => {
        // Days since last contact
        const lastContact = company.last_contacted_date
          ? new Date(company.last_contacted_date)
          : null
        const daysSinceContact = lastContact
          ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
          : 999

        // Active jobs count
        const jobs = company.jobs || []
        const activeJobs = jobs.filter(j => j.status === 'active').length

        // YTD revenue calculation
        const placements = company.placements || []
        const ytdRevenue = placements.reduce((sum, p) =>
          sum + ((p.billing_rate || 0) * (p.hours_billed || 0)), 0
        )

        // Health score calculation (same as crm.ts accounts.getHealth)
        let healthScore = 100
        if (daysSinceContact > 14) healthScore -= 30
        else if (daysSinceContact > 7) healthScore -= 15
        if (activeJobs === 0) healthScore -= 20
        if (!company.nps_score || company.nps_score < 7) healthScore -= 20
        if (ytdRevenue === 0) healthScore -= 10

        const calculatedHealthScore = Math.max(0, healthScore)
        const healthStatus = calculatedHealthScore >= 70 ? 'healthy'
          : calculatedHealthScore >= 40 ? 'attention'
          : 'at_risk'

        return {
          id: company.id,
          name: company.name,
          industry: company.industry,
          status: company.status,
          category: company.category,
          tier: company.tier,
          healthScore: calculatedHealthScore,
          healthStatus,
          activeJobs,
          ytdRevenue,
          npsScore: company.nps_score,
          daysSinceContact,
          lastContactDate: company.last_contacted_date,
        }
      })

      // Sort by health score (worst first)
      results.sort((a, b) => a.healthScore - b.healthScore)

      const summary = {
        total: results.length,
        healthy: results.filter(r => r.healthStatus === 'healthy').length,
        needsAttention: results.filter(r => r.healthStatus === 'attention').length,
        atRisk: results.filter(r => r.healthStatus === 'at_risk').length,
      }

      return { companies: results, summary }
    }),

  // Get my companies (for workspace/dashboard)
  getMy: orgProtectedProcedure
    .input(z.object({
      category: CompanyCategory.optional(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('companies')
        .select(`
          id, name, category, industry, status, tier,
          last_contacted_date, nps_score, health_score, health_status,
          jobs:jobs!company_id(id, status)
        `)
        .eq('org_id', orgId)
        .eq('owner_id', user?.id)
        .is('deleted_at', null)
        .order('last_contacted_date', { ascending: false, nullsFirst: false })

      if (input.category) {
        query = query.eq('category', input.category)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      interface MyCompanyData {
        id: string
        name: string | null
        category: string | null
        industry: string | null
        status: string | null
        tier: string | null
        last_contacted_date: string | null
        nps_score: number | null
        health_score: number | null
        health_status: string | null
        jobs: Array<{ id: string; status: string }> | null
      }

      return (data as MyCompanyData[] || []).map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        industry: c.industry,
        status: c.status,
        tier: c.tier,
        lastContactDate: c.last_contacted_date,
        npsScore: c.nps_score,
        healthScore: c.health_score,
        healthStatus: c.health_status,
        activeJobs: (c.jobs || []).filter(j => j.status === 'active').length,
      }))
    }),

  // Get recent companies (for navigation dropdowns)
  getRecent: orgProtectedProcedure
    .input(z.object({
      category: CompanyCategory.optional(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('companies')
        .select('id, name, category, industry, status')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (input.category) {
        query = query.eq('category', input.category)
      }

      query = query.limit(input.limit)

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // ============================================
  // MUTATION PROCEDURES
  // ============================================

  // Create new company
  create: orgProtectedProcedure
    .input(z.object({
      // Required
      category: CompanyCategory,
      name: z.string().min(1).max(255),
      // Classification
      relationshipType: CompanyRelationshipType.optional(),
      segment: CompanySegment.optional(),
      tier: CompanyTier.optional(),
      status: CompanyStatus.optional(),
      // Basic info
      legalName: z.string().optional(),
      dbaName: z.string().optional(),
      industry: z.string().optional(),
      subIndustry: z.string().optional(),
      website: z.string().url().optional().or(z.literal('')),
      phone: z.string().optional(),
      linkedinUrl: z.string().url().optional().or(z.literal('')),
      // Location
      headquartersCity: z.string().optional(),
      headquartersState: z.string().optional(),
      headquartersCountry: z.string().optional(),
      timezone: z.string().optional(),
      // Firmographics
      employeeCount: z.number().optional(),
      annualRevenue: z.number().optional(),
      foundedYear: z.number().optional(),
      // Financial defaults
      defaultPaymentTerms: z.string().optional(),
      defaultMarkupPercentage: z.number().optional(),
      // Client-specific
      billingEmail: z.string().email().optional().or(z.literal('')),
      billingEntityName: z.string().optional(),
      poRequired: z.boolean().optional(),
      // Vendor-specific
      vendorType: CompanyVendorType.optional(),
      industryFocus: z.array(z.string()).optional(),
      geographicFocus: z.array(z.string()).optional(),
      // Primary contact (optional)
      primaryContactName: z.string().optional(),
      primaryContactEmail: z.string().email().optional(),
      primaryContactPhone: z.string().optional(),
      primaryContactTitle: z.string().optional(),
      // Tags
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Determine default relationship type based on category
      const defaultRelationshipType = {
        client: 'direct_client',
        vendor: 'prime_vendor',
        partner: 'referral_partner',
        prospect: 'direct_client',
      }[input.category] as typeof input.relationshipType

      // Create company
      const { data: company, error } = await adminClient
        .from('companies')
        .insert({
          org_id: orgId,
          category: input.category,
          relationship_type: input.relationshipType || defaultRelationshipType,
          segment: input.segment || null,
          tier: input.tier || 'standard',
          status: input.status || 'active',
          name: input.name,
          legal_name: input.legalName || null,
          dba_name: input.dbaName || null,
          industry: input.industry || null,
          sub_industry: input.subIndustry || null,
          website: input.website || null,
          phone: input.phone || null,
          linkedin_url: input.linkedinUrl || null,
          headquarters_city: input.headquartersCity || null,
          headquarters_state: input.headquartersState || null,
          headquarters_country: input.headquartersCountry || 'USA',
          timezone: input.timezone || 'America/New_York',
          employee_count: input.employeeCount || null,
          annual_revenue: input.annualRevenue || null,
          founded_year: input.foundedYear || null,
          default_payment_terms: input.defaultPaymentTerms || 'Net 30',
          default_markup_percentage: input.defaultMarkupPercentage || null,
          requires_po: input.poRequired || false,
          tags: input.tags || [],
          owner_id: user?.id,
          account_manager_id: user?.id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Create extension table record based on category
      if (input.category === 'client' || input.category === 'prospect') {
        const { error: clientError } = await adminClient
          .from('company_client_details')
          .insert({
            company_id: company.id,
            org_id: orgId,
            billing_email: input.billingEmail || null,
            billing_entity_name: input.billingEntityName || null,
            po_required: input.poRequired || false,
          })

        if (clientError) {
          console.error('Error creating client details:', clientError)
        }
      }

      if (input.category === 'vendor') {
        const { error: vendorError } = await adminClient
          .from('company_vendor_details')
          .insert({
            company_id: company.id,
            org_id: orgId,
            vendor_type: input.vendorType || 'prime_vendor',
            industry_focus: input.industryFocus || [],
            geographic_focus: input.geographicFocus || [],
          })

        if (vendorError) {
          console.error('Error creating vendor details:', vendorError)
        }
      }

      // Create primary contact if provided
      if (input.primaryContactEmail && input.primaryContactName) {
        const nameParts = input.primaryContactName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const subtypeMap = {
          client: 'person_client_contact',
          vendor: 'person_vendor_contact',
          partner: 'person_partner_contact',
          prospect: 'person_prospect',
        }

        const { data: contact, error: contactError } = await adminClient
          .from('contacts')
          .insert({
            org_id: orgId,
            subtype: subtypeMap[input.category],
            first_name: firstName,
            last_name: lastName,
            email: input.primaryContactEmail,
            phone: input.primaryContactPhone || null,
            title: input.primaryContactTitle || null,
            status: 'active',
            created_by: user?.id,
          })
          .select('id')
          .single()

        if (contactError) {
          console.error('Error creating primary contact:', contactError)
        } else if (contact) {
          // Link contact to company
          await adminClient
            .from('company_contacts')
            .insert({
              org_id: orgId,
              company_id: company.id,
              contact_id: contact.id,
              job_title: input.primaryContactTitle || null,
              is_primary: true,
              is_active: true,
              created_by: user?.id,
            })

          // Update company's primary_contact_id
          await adminClient
            .from('companies')
            .update({ primary_contact_id: contact.id })
            .eq('id', company.id)
        }
      }

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'company',
        entity_id: company.id,
        activity_type: 'note',
        subject: `${input.category} created`,
        description: `New ${input.category} "${input.name}" was created.`,
        status: 'completed',
        created_by: user?.id,
      })

      return company
    }),

  // Update company
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      // Classification (category cannot be changed after creation)
      relationshipType: CompanyRelationshipType.optional(),
      segment: CompanySegment.optional(),
      tier: CompanyTier.optional(),
      status: CompanyStatus.optional(),
      // Basic info
      name: z.string().min(1).max(255).optional(),
      legalName: z.string().optional(),
      dbaName: z.string().optional(),
      industry: z.string().optional(),
      subIndustry: z.string().optional(),
      website: z.string().url().optional().or(z.literal('')).nullable(),
      phone: z.string().optional().nullable(),
      linkedinUrl: z.string().url().optional().or(z.literal('')).nullable(),
      // Location
      headquartersCity: z.string().optional().nullable(),
      headquartersState: z.string().optional().nullable(),
      headquartersCountry: z.string().optional(),
      timezone: z.string().optional(),
      // Firmographics
      employeeCount: z.number().optional().nullable(),
      annualRevenue: z.number().optional().nullable(),
      foundedYear: z.number().optional().nullable(),
      // Assignment
      ownerId: z.string().uuid().optional().nullable(),
      accountManagerId: z.string().uuid().optional().nullable(),
      primaryContactId: z.string().uuid().optional().nullable(),
      // Financial defaults
      defaultPaymentTerms: z.string().optional(),
      defaultMarkupPercentage: z.number().optional().nullable(),
      defaultFeePercentage: z.number().optional().nullable(),
      creditLimit: z.number().optional().nullable(),
      creditStatus: z.string().optional(),
      // Health
      healthScore: z.number().min(0).max(100).optional(),
      healthStatus: z.string().optional(),
      npsScore: z.number().min(-100).max(100).optional().nullable(),
      // Activity tracking
      lastContactedDate: z.string().datetime().optional().nullable(),
      nextScheduledContact: z.string().optional().nullable(),
      // Flags
      isStrategic: z.boolean().optional(),
      requiresPo: z.boolean().optional(),
      requiresApprovalForSubmission: z.boolean().optional(),
      allowsRemoteWork: z.boolean().optional(),
      // MSP/VMS
      isMspProgram: z.boolean().optional(),
      mspProviderId: z.string().uuid().optional().nullable(),
      ourMspTier: z.number().min(1).max(5).optional().nullable(),
      vmsPlatform: z.string().optional().nullable(),
      vmsVendorId: z.string().optional().nullable(),
      // Communication
      preferredContactMethod: z.string().optional(),
      submissionMethod: z.string().optional(),
      invoiceDeliveryMethod: z.string().optional(),
      meetingCadence: z.string().optional(),
      // Tags
      tags: z.array(z.string()).optional(),
      customFields: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateFields } = input

      // Build update data, converting camelCase to snake_case
      const updateData: Record<string, unknown> = {
        updated_by: user?.id,
      }

      // Map fields
      const fieldMap: Record<string, string> = {
        relationshipType: 'relationship_type',
        segment: 'segment',
        tier: 'tier',
        status: 'status',
        name: 'name',
        legalName: 'legal_name',
        dbaName: 'dba_name',
        industry: 'industry',
        subIndustry: 'sub_industry',
        website: 'website',
        phone: 'phone',
        linkedinUrl: 'linkedin_url',
        headquartersCity: 'headquarters_city',
        headquartersState: 'headquarters_state',
        headquartersCountry: 'headquarters_country',
        timezone: 'timezone',
        employeeCount: 'employee_count',
        annualRevenue: 'annual_revenue',
        foundedYear: 'founded_year',
        ownerId: 'owner_id',
        accountManagerId: 'account_manager_id',
        primaryContactId: 'primary_contact_id',
        defaultPaymentTerms: 'default_payment_terms',
        defaultMarkupPercentage: 'default_markup_percentage',
        defaultFeePercentage: 'default_fee_percentage',
        creditLimit: 'credit_limit',
        creditStatus: 'credit_status',
        healthScore: 'health_score',
        healthStatus: 'health_status',
        npsScore: 'nps_score',
        lastContactedDate: 'last_contacted_date',
        nextScheduledContact: 'next_scheduled_contact',
        isStrategic: 'is_strategic',
        requiresPo: 'requires_po',
        requiresApprovalForSubmission: 'requires_approval_for_submission',
        allowsRemoteWork: 'allows_remote_work',
        isMspProgram: 'is_msp_program',
        mspProviderId: 'msp_provider_id',
        ourMspTier: 'our_msp_tier',
        vmsPlatform: 'vms_platform',
        vmsVendorId: 'vms_vendor_id',
        preferredContactMethod: 'preferred_contact_method',
        submissionMethod: 'submission_method',
        invoiceDeliveryMethod: 'invoice_delivery_method',
        meetingCadence: 'meeting_cadence',
        tags: 'tags',
        customFields: 'custom_fields',
      }

      for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (camelKey in updateFields && updateFields[camelKey as keyof typeof updateFields] !== undefined) {
          updateData[snakeKey] = updateFields[camelKey as keyof typeof updateFields]
        }
      }

      const { data, error } = await adminClient
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Soft delete company
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('companies')
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

  // ============================================
  // EXTENSION TABLE PROCEDURES
  // ============================================

  // Update client details
  updateClientDetails: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      billingEntityName: z.string().optional().nullable(),
      billingEmail: z.string().email().optional().nullable(),
      billingPhone: z.string().optional().nullable(),
      poRequired: z.boolean().optional(),
      currentPoNumber: z.string().optional().nullable(),
      poExpirationDate: z.string().optional().nullable(),
      invoiceFormat: z.string().optional(),
      invoiceConsolidation: z.string().optional(),
      // Billing address
      billingAddressLine1: z.string().optional().nullable(),
      billingAddressLine2: z.string().optional().nullable(),
      billingCity: z.string().optional().nullable(),
      billingState: z.string().optional().nullable(),
      billingPostalCode: z.string().optional().nullable(),
      billingCountry: z.string().optional(),
      // QBR
      qbrFrequency: z.string().optional().nullable(),
      nextQbrDate: z.string().optional().nullable(),
      // Exclusivity
      exclusiveSupplier: z.boolean().optional(),
      walletSharePercentage: z.number().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { companyId, ...updateFields } = input

      // Build update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      const fieldMap: Record<string, string> = {
        billingEntityName: 'billing_entity_name',
        billingEmail: 'billing_email',
        billingPhone: 'billing_phone',
        poRequired: 'po_required',
        currentPoNumber: 'current_po_number',
        poExpirationDate: 'po_expiration_date',
        invoiceFormat: 'invoice_format',
        invoiceConsolidation: 'invoice_consolidation',
        billingAddressLine1: 'billing_address_line_1',
        billingAddressLine2: 'billing_address_line_2',
        billingCity: 'billing_city',
        billingState: 'billing_state',
        billingPostalCode: 'billing_postal_code',
        billingCountry: 'billing_country',
        qbrFrequency: 'qbr_frequency',
        nextQbrDate: 'next_qbr_date',
        exclusiveSupplier: 'exclusive_supplier',
        walletSharePercentage: 'wallet_share_percentage',
      }

      for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (camelKey in updateFields && updateFields[camelKey as keyof typeof updateFields] !== undefined) {
          updateData[snakeKey] = updateFields[camelKey as keyof typeof updateFields]
        }
      }

      // Upsert client details
      const { data, error } = await adminClient
        .from('company_client_details')
        .upsert({
          company_id: companyId,
          org_id: orgId,
          ...updateData,
        }, { onConflict: 'company_id' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update vendor details
  updateVendorDetails: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      vendorType: CompanyVendorType.optional(),
      industryFocus: z.array(z.string()).optional(),
      geographicFocus: z.array(z.string()).optional(),
      skillFocus: z.array(z.string()).optional(),
      vendorManagerId: z.string().uuid().optional().nullable(),
      paymentTermsToUs: z.string().optional(),
      typicalMarkupToClient: z.number().optional().nullable(),
      ourTypicalMargin: z.number().optional().nullable(),
      acceptsCorpToCorp: z.boolean().optional(),
      accepts1099: z.boolean().optional(),
      requiresRightToRepresent: z.boolean().optional(),
      rtrValidityHours: z.number().optional().nullable(),
      isBlacklisted: z.boolean().optional(),
      blacklistReason: z.string().optional().nullable(),
      suppliesTalent: z.boolean().optional(),
      talentCategories: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { companyId, ...updateFields } = input

      // Build update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      const fieldMap: Record<string, string> = {
        vendorType: 'vendor_type',
        industryFocus: 'industry_focus',
        geographicFocus: 'geographic_focus',
        skillFocus: 'skill_focus',
        vendorManagerId: 'vendor_manager_id',
        paymentTermsToUs: 'payment_terms_to_us',
        typicalMarkupToClient: 'typical_markup_to_client',
        ourTypicalMargin: 'our_typical_margin',
        acceptsCorpToCorp: 'accepts_corp_to_corp',
        accepts1099: 'accepts_1099',
        requiresRightToRepresent: 'requires_right_to_represent',
        rtrValidityHours: 'rtr_validity_hours',
        isBlacklisted: 'is_blacklisted',
        blacklistReason: 'blacklist_reason',
        suppliesTalent: 'supplies_talent',
        talentCategories: 'talent_categories',
      }

      for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (camelKey in updateFields && updateFields[camelKey as keyof typeof updateFields] !== undefined) {
          updateData[snakeKey] = updateFields[camelKey as keyof typeof updateFields]
        }
      }

      // Set blacklist date if being blacklisted
      if (input.isBlacklisted === true) {
        updateData.blacklist_date = new Date().toISOString().split('T')[0]
      }

      // Upsert vendor details
      const { data, error } = await adminClient
        .from('company_vendor_details')
        .upsert({
          company_id: companyId,
          org_id: orgId,
          ...updateData,
        }, { onConflict: 'company_id' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // TEAM MANAGEMENT
  // ============================================

  // Add team member to company
  addTeamMember: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.enum(['owner', 'account_manager', 'recruiter', 'sales', 'coordinator', 'executive_sponsor', 'viewer']),
      isPrimary: z.boolean().optional(),
      region: z.string().optional(),
      jobCategories: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // If setting as primary, unset other primaries with same role
      if (input.isPrimary) {
        await adminClient
          .from('company_team')
          .update({ is_primary: false })
          .eq('company_id', input.companyId)
          .eq('role', input.role)
          .is('removed_at', null)
      }

      const { data, error } = await adminClient
        .from('company_team')
        .insert({
          org_id: orgId,
          company_id: input.companyId,
          user_id: input.userId,
          role: input.role,
          is_primary: input.isPrimary || false,
          region: input.region || null,
          job_categories: input.jobCategories || [],
          assigned_by: user?.id,
        })
        .select(`
          *,
          user:user_profiles(id, full_name, avatar_url)
        `)
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'User already has this role on this company' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Remove team member from company
  removeTeamMember: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      teamMemberId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('company_team')
        .update({
          removed_at: new Date().toISOString(),
          removed_by: user?.id,
        })
        .eq('id', input.teamMemberId)
        .eq('company_id', input.companyId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Get team members for a company
  getTeam: orgProtectedProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('company_team')
        .select(`
          *,
          user:user_profiles(id, full_name, avatar_url, email)
        `)
        .eq('company_id', input.companyId)
        .is('removed_at', null)
        .order('is_primary', { ascending: false })
        .order('role')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // ============================================
  // NOTES
  // ============================================

  // Add note to company
  addNote: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      noteType: z.enum(['general', 'meeting', 'call', 'strategy', 'warning', 'opportunity', 'competitive_intel']).optional(),
      title: z.string().optional(),
      content: z.string().min(1),
      isPinned: z.boolean().optional(),
      isPrivate: z.boolean().optional(),
      relatedContactId: z.string().uuid().optional(),
      relatedJobId: z.string().uuid().optional(),
      relatedDealId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('company_notes')
        .insert({
          org_id: orgId,
          company_id: input.companyId,
          note_type: input.noteType || 'general',
          title: input.title || null,
          content: input.content,
          is_pinned: input.isPinned || false,
          is_private: input.isPrivate || false,
          related_contact_id: input.relatedContactId || null,
          related_job_id: input.relatedJobId || null,
          related_deal_id: input.relatedDealId || null,
          created_by: user?.id,
        })
        .select(`
          *,
          creator:user_profiles!created_by(id, full_name, avatar_url)
        `)
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Get notes for company
  getNotes: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      noteType: z.enum(['general', 'meeting', 'call', 'strategy', 'warning', 'opportunity', 'competitive_intel']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      let query = adminClient
        .from('company_notes')
        .select(`
          *,
          creator:user_profiles!created_by(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('company_id', input.companyId)
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (input.noteType) {
        query = query.eq('note_type', input.noteType)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { items: data || [], total: count || 0 }
    }),

  // Delete note
  deleteNote: orgProtectedProcedure
    .input(z.object({ noteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('company_notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.noteId)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============================================
  // CONTACTS LINKAGE
  // ============================================

  // Link contact to company
  linkContact: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      contactId: z.string().uuid(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      decisionAuthority: z.enum([
        'decision_maker', 'influencer', 'champion', 'gatekeeper',
        'end_user', 'budget_holder', 'technical_evaluator', 'procurement'
      ]).optional(),
      influenceLevel: z.number().min(1).max(5).optional(),
      isPrimary: z.boolean().optional(),
      relationshipStrength: z.number().min(1).max(5).optional(),
      preferredContactMethod: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth_id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // If setting as primary, unset other primaries
      if (input.isPrimary) {
        await adminClient
          .from('company_contacts')
          .update({ is_primary: false })
          .eq('company_id', input.companyId)
          .eq('is_active', true)
      }

      const { data, error } = await adminClient
        .from('company_contacts')
        .insert({
          org_id: orgId,
          company_id: input.companyId,
          contact_id: input.contactId,
          job_title: input.jobTitle || null,
          department: input.department || null,
          decision_authority: input.decisionAuthority || null,
          influence_level: input.influenceLevel || null,
          is_primary: input.isPrimary || false,
          is_active: true,
          relationship_strength: input.relationshipStrength || null,
          preferred_contact_method: input.preferredContactMethod || null,
          created_by: userProfileId,
        })
        .select('*')
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Contact already linked to this company' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Update company's primary_contact_id if this is primary
      if (input.isPrimary) {
        await adminClient
          .from('companies')
          .update({ primary_contact_id: input.contactId })
          .eq('id', input.companyId)
      }

      return data
    }),

  // Unlink contact from company
  unlinkContact: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      contactId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('company_contacts')
        .update({ is_active: false })
        .eq('company_id', input.companyId)
        .eq('contact_id', input.contactId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Get contacts for company
  getContacts: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      includeInactive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      let query = adminClient
        .from('company_contacts')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone, title, status)
        `)
        .eq('company_id', input.companyId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (!input.includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),
})
