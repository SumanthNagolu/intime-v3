import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { historyService } from '@/lib/services'


// ============================================
// CONTACT CATEGORIES
// ============================================
export const ContactCategory = z.enum(['person', 'company'])
export type ContactCategory = z.infer<typeof ContactCategory>

// ============================================
// CONTACT SUBTYPES - Enterprise-Grade (22 types)
// ============================================
// Person subtypes (13)
export const PersonSubtype = z.enum([
  'person_prospect',
  'person_lead',
  'person_candidate',
  'person_bench_internal',
  'person_bench_vendor',
  'person_placed',
  'person_client_contact',
  'person_hiring_manager',
  'person_hr_contact',
  'person_vendor_contact',
  'person_employee',
  'person_referral_source',
  'person_alumni'
])
export type PersonSubtype = z.infer<typeof PersonSubtype>

// Company subtypes (9)
export const CompanySubtype = z.enum([
  'company_prospect',
  'company_lead',
  'company_client',
  'company_vendor',
  'company_msp',
  'company_vms',
  'company_end_client',
  'company_agency',
  'company_institution'
])
export type CompanySubtype = z.infer<typeof CompanySubtype>

// All subtypes combined
export const ContactSubtype = z.enum([
  // Person subtypes
  'person_prospect',
  'person_lead',
  'person_candidate',
  'person_bench_internal',
  'person_bench_vendor',
  'person_placed',
  'person_client_contact',
  'person_hiring_manager',
  'person_hr_contact',
  'person_vendor_contact',
  'person_employee',
  'person_referral_source',
  'person_alumni',
  // Company subtypes
  'company_prospect',
  'company_lead',
  'company_client',
  'company_vendor',
  'company_msp',
  'company_vms',
  'company_end_client',
  'company_agency',
  'company_institution'
])
export type ContactSubtype = z.infer<typeof ContactSubtype>

// Helper to get category from subtype
export function getCategoryFromSubtype(subtype: ContactSubtype): ContactCategory {
  return subtype.startsWith('person_') ? 'person' : 'company'
}

// ============================================
// STATS CALCULATION HELPERS
// ============================================
type ContactForStats = {
  id: string
  category: string | null
  subtype: string | null
  status: string | null
  contact_status: string | null
  candidate_status: string | null
  lead_status: string | null
  lead_score: number | null
  candidate_is_on_hotlist: boolean | null
  client_status: string | null
  client_tier: string | null
  vendor_status: string | null
  last_contacted_at: string | null
  decision_authority: string | null
  // Note: is_decision_maker is derived from decision_authority, not a DB column
}

function calculateContactStats(contacts: ContactForStats[]) {
  const total = contacts.length
  const active = contacts.filter(c => c.status === 'active' || c.contact_status === 'active').length
  // decision_authority = 'decision_maker' means they are a decision maker
  const decisionMakers = contacts.filter(c => c.decision_authority === 'decision_maker').length

  // Category counts
  const byCategory = {
    person: contacts.filter(c => c.category === 'person').length,
    company: contacts.filter(c => c.category === 'company').length,
  }

  // Person subtype counts
  const personSubtypes = {
    person_prospect: contacts.filter(c => c.subtype === 'person_prospect').length,
    person_lead: contacts.filter(c => c.subtype === 'person_lead').length,
    person_candidate: contacts.filter(c => c.subtype === 'person_candidate').length,
    person_bench_internal: contacts.filter(c => c.subtype === 'person_bench_internal').length,
    person_bench_vendor: contacts.filter(c => c.subtype === 'person_bench_vendor').length,
    person_placed: contacts.filter(c => c.subtype === 'person_placed').length,
    person_client_contact: contacts.filter(c => c.subtype === 'person_client_contact').length,
    person_hiring_manager: contacts.filter(c => c.subtype === 'person_hiring_manager').length,
    person_hr_contact: contacts.filter(c => c.subtype === 'person_hr_contact').length,
    person_vendor_contact: contacts.filter(c => c.subtype === 'person_vendor_contact').length,
    person_employee: contacts.filter(c => c.subtype === 'person_employee').length,
    person_referral_source: contacts.filter(c => c.subtype === 'person_referral_source').length,
    person_alumni: contacts.filter(c => c.subtype === 'person_alumni').length,
  }

  // Company subtype counts
  const companySubtypes = {
    company_prospect: contacts.filter(c => c.subtype === 'company_prospect').length,
    company_lead: contacts.filter(c => c.subtype === 'company_lead').length,
    company_client: contacts.filter(c => c.subtype === 'company_client').length,
    company_vendor: contacts.filter(c => c.subtype === 'company_vendor').length,
    company_msp: contacts.filter(c => c.subtype === 'company_msp').length,
    company_vms: contacts.filter(c => c.subtype === 'company_vms').length,
    company_end_client: contacts.filter(c => c.subtype === 'company_end_client').length,
    company_agency: contacts.filter(c => c.subtype === 'company_agency').length,
    company_institution: contacts.filter(c => c.subtype === 'company_institution').length,
  }

  // Candidate-specific stats
  const candidateContacts = contacts.filter(c => c.subtype === 'person_candidate')
  const candidateStats = {
    total: candidateContacts.length,
    active: candidateContacts.filter(c => c.candidate_status === 'active').length,
    bench: candidateContacts.filter(c => c.candidate_status === 'bench').length,
    placed: candidateContacts.filter(c => c.candidate_status === 'placed').length,
    onHotlist: candidateContacts.filter(c => c.candidate_is_on_hotlist).length,
  }

  // Lead-specific stats
  const leadContacts = contacts.filter(c => c.subtype === 'person_lead' || c.subtype === 'company_lead')
  const leadStats = {
    total: leadContacts.length,
    personLeads: contacts.filter(c => c.subtype === 'person_lead').length,
    companyLeads: contacts.filter(c => c.subtype === 'company_lead').length,
    new: leadContacts.filter(c => c.lead_status === 'new').length,
    qualified: leadContacts.filter(c => c.lead_status === 'qualified').length,
    converted: leadContacts.filter(c => c.lead_status === 'converted').length,
    hot: leadContacts.filter(c => (c.lead_score ?? 0) >= 70).length,
  }

  // Client stats
  const clientContacts = contacts.filter(c => c.subtype === 'company_client')
  const clientStats = {
    total: clientContacts.length,
    active: clientContacts.filter(c => c.client_status === 'active').length,
    dormant: clientContacts.filter(c => c.client_status === 'dormant').length,
    enterprise: clientContacts.filter(c => c.client_tier === 'enterprise').length,
    strategic: clientContacts.filter(c => c.client_tier === 'strategic').length,
  }

  // Vendor stats
  const vendorContacts = contacts.filter(c => c.subtype === 'company_vendor')
  const vendorStats = {
    total: vendorContacts.length,
    approved: vendorContacts.filter(c => c.vendor_status === 'approved').length,
    preferred: vendorContacts.filter(c => c.vendor_status === 'preferred').length,
    pending: vendorContacts.filter(c => c.vendor_status === 'pending').length,
  }

  // Recently contacted (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentlyContacted = contacts.filter(c =>
    c.last_contacted_at && new Date(c.last_contacted_at) >= thirtyDaysAgo
  ).length

  return {
    total,
    active,
    decisionMakers,
    recentlyContacted,
    byCategory,
    personSubtypes,
    companySubtypes,
    candidateStats,
    leadStats,
    clientStats,
    vendorStats,
  }
}

function getEmptyStats() {
  return {
    total: 0,
    active: 0,
    decisionMakers: 0,
    recentlyContacted: 0,
    byCategory: { person: 0, company: 0 },
    personSubtypes: {
      person_prospect: 0, person_lead: 0, person_candidate: 0,
      person_bench_internal: 0, person_bench_vendor: 0, person_placed: 0,
      person_client_contact: 0, person_hiring_manager: 0, person_hr_contact: 0,
      person_vendor_contact: 0, person_employee: 0, person_referral_source: 0, person_alumni: 0,
    },
    companySubtypes: {
      company_prospect: 0, company_lead: 0, company_client: 0, company_vendor: 0,
      company_msp: 0, company_vms: 0, company_end_client: 0, company_agency: 0, company_institution: 0,
    },
    candidateStats: { total: 0, active: 0, bench: 0, placed: 0, onHotlist: 0 },
    leadStats: { total: 0, personLeads: 0, companyLeads: 0, new: 0, qualified: 0, converted: 0, hot: 0 },
    clientStats: { total: 0, active: 0, dormant: 0, enterprise: 0, strategic: 0 },
    vendorStats: { total: 0, approved: 0, preferred: 0, pending: 0 },
  }
}

// ============================================
// CANDIDATE STATUS
// ============================================
export const CandidateStatus = z.enum([
  'active',
  'passive', 
  'placed',
  'bench',
  'inactive',
  'blacklisted'
])

// ============================================
// LEAD STATUS
// ============================================
export const LeadStatus = z.enum([
  'new',
  'contacted',
  'warm',
  'hot',
  'cold',
  'qualified',
  'unqualified',
  'converted',
  'lost',
  'nurture'
])

// ============================================
// UNIFIED CONTACTS ROUTER
// ============================================
export const unifiedContactsRouter = router({
  // ============================================
  // CORE CONTACT OPERATIONS
  // ============================================

  // List contacts with category and subtype filtering
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      category: ContactCategory.optional(), // Filter by person or company
      subtype: ContactSubtype.optional(),
      subtypes: z.array(ContactSubtype).optional(), // Filter by multiple subtypes
      accountId: z.string().uuid().optional(),
      vendorId: z.string().uuid().optional(),
      status: z.string().optional(),
      contactStatus: z.string().optional(), // New contact_status field
      ownerId: z.string().uuid().optional(),
      currentCompanyId: z.string().uuid().optional(), // Filter by current company
      // Candidate-specific filters
      candidateStatus: CandidateStatus.optional(),
      candidateSkills: z.array(z.string()).optional(),
      candidateOnHotlist: z.boolean().optional(),
      // Lead-specific filters
      leadStatus: LeadStatus.optional(),
      leadMinScore: z.number().min(0).max(100).optional(),
      // Company-specific filters
      clientStatus: z.string().optional(),
      clientTier: z.string().optional(),
      vendorStatus: z.string().optional(),
      vendorTier: z.string().optional(),
      // Pagination and sorting
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().default(0),
      sortBy: z.enum([
        'name', 'first_name', 'last_name', 'title', 'company_name',
        'status', 'subtype', 'category', 'email', 'created_at', 'updated_at',
        'candidate_status', 'lead_status', 'lead_score', 'engagement_score',
        'client_status', 'client_tier', 'vendor_status'
      ]).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Note: company_name is stored directly on contacts, but we also join for account relationship
      // linked_company_id references companies table (the primary FK for account relationship)
      let query = adminClient
        .from('contacts')
        .select(`
          *,
          owner:user_profiles!contacts_owner_id_fkey(id, full_name, avatar_url),
          account:companies!contacts_linked_company_id_fkey(id, name),
          createdByUser:user_profiles!contacts_created_by_fkey(id, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Search across name and email
      if (input.search) {
        query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%,company_name.ilike.%${input.search}%`)
      }

      // Filter by category (person or company)
      if (input.category) {
        query = query.eq('category', input.category)
      }

      // Filter by single subtype
      if (input.subtype) {
        query = query.eq('subtype', input.subtype)
      }

      // Filter by multiple subtypes
      if (input.subtypes && input.subtypes.length > 0) {
        query = query.in('subtype', input.subtypes)
      }

      // Filter by account
      if (input.accountId) {
        query = query.eq('account_id', input.accountId)
      }

      // Filter by vendor
      if (input.vendorId) {
        query = query.eq('vendor_id', input.vendorId)
      }

      // Filter by status (legacy)
      if (input.status) {
        query = query.eq('status', input.status)
      }

      // Filter by contact_status (new enterprise field)
      if (input.contactStatus) {
        query = query.eq('contact_status', input.contactStatus)
      }

      // Filter by owner
      if (input.ownerId) {
        query = query.eq('owner_id', input.ownerId)
      }

      // Filter by current company (for person contacts)
      if (input.currentCompanyId) {
        query = query.eq('current_company_id', input.currentCompanyId)
      }

      // Candidate-specific filters (person_candidate)
      if (input.candidateStatus) {
        query = query.eq('candidate_status', input.candidateStatus)
      }

      if (input.candidateSkills && input.candidateSkills.length > 0) {
        query = query.contains('candidate_skills', input.candidateSkills)
      }

      if (input.candidateOnHotlist === true) {
        query = query.eq('candidate_is_on_hotlist', true)
      }

      // Lead-specific filters (person_lead, company_lead)
      if (input.leadStatus) {
        query = query.eq('lead_status', input.leadStatus)
      }

      if (input.leadMinScore !== undefined) {
        query = query.gte('lead_score', input.leadMinScore)
      }

      // Company client filters (company_client)
      if (input.clientStatus) {
        query = query.eq('client_status', input.clientStatus)
      }

      if (input.clientTier) {
        query = query.eq('client_tier', input.clientTier)
      }

      // Company vendor filters (company_vendor)
      if (input.vendorStatus) {
        query = query.eq('vendor_status', input.vendorStatus)
      }

      if (input.vendorTier) {
        query = query.eq('vendor_tier', input.vendorTier)
      }

      // Handle sorting
      const sortColumn = input.sortBy === 'name' ? 'first_name' : input.sortBy
      query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' })
      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Transform data to match config expectations
      let items = data?.map(c => ({
        ...c,
        // Map snake_case to camelCase for config compatibility
        createdAt: c.created_at,
        lastContactDate: c.last_contact_date,
        type: c.subtype,
        // Pass decision_authority string for display (not boolean)
        decision_authority: c.decision_authority,
      })) ?? []

      // Handle legacy data: if account is null but company_id exists, look up the company
      const contactsNeedingAccountLookup = items.filter(c => !c.account && c.company_id)
      if (contactsNeedingAccountLookup.length > 0) {
        const companyIds = [...new Set(contactsNeedingAccountLookup.map(c => c.company_id))]
        const { data: companies } = await adminClient
          .from('companies')
          .select('id, name')
          .in('id', companyIds)

        if (companies) {
          const companyMap = new Map(companies.map(co => [co.id, co]))
          items = items.map(c => {
            if (!c.account && c.company_id && companyMap.has(c.company_id)) {
              return { ...c, account: companyMap.get(c.company_id) }
            }
            return c
          })
        }
      }

      // Handle legacy data: if owner is null but createdByUser exists, use creator as owner fallback
      items = items.map(c => {
        if (!c.owner && c.createdByUser) {
          return { ...c, owner: c.createdByUser }
        }
        return c
      })

      // Calculate stats from a lightweight query (all contacts, minimal fields)
      // This runs as part of the same API call, just a separate DB query for efficiency
      // Note: is_decision_maker is derived from decision_authority (no column exists)
      const statsQuery = adminClient
        .from('contacts')
        .select('id, category, subtype, status, contact_status, candidate_status, lead_status, lead_score, candidate_is_on_hotlist, client_status, client_tier, vendor_status, last_contacted_at, decision_authority')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply same category/subtype filters to stats
      let filteredStatsQuery = statsQuery
      if (input.category) {
        filteredStatsQuery = filteredStatsQuery.eq('category', input.category)
      }
      if (input.subtype) {
        filteredStatsQuery = filteredStatsQuery.eq('subtype', input.subtype)
      }
      if (input.subtypes && input.subtypes.length > 0) {
        filteredStatsQuery = filteredStatsQuery.in('subtype', input.subtypes)
      }

      const { data: allContacts, error: statsError } = await filteredStatsQuery

      // Calculate stats from all contacts (not just paginated)
      const statsData = allContacts ? calculateContactStats(allContacts) : getEmptyStats()

      if (statsError) {
        console.error('[unifiedContacts.list] Stats calculation error:', statsError.message)
      }

      return {
        items,
        total: count ?? 0,
        stats: statsData,
      }
    }),

  // Get contact by ID with full details
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Note: company_name is stored directly on contacts
      // contacts.company_id references accounts table (legacy), not companies
      const { data, error } = await adminClient
        .from('contacts')
        .select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' })
      }

      return data
    }),

  // Get contact stats by category and subtype
  stats: orgProtectedProcedure
    .input(z.object({
      category: ContactCategory.optional(),
      subtype: ContactSubtype.optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const baseQuery = adminClient
        .from('contacts')
        .select('id, category, subtype, status, contact_status, candidate_status, lead_status, lead_score, candidate_is_on_hotlist, client_status, client_tier, vendor_status, last_contacted_at, decision_authority, is_decision_maker')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      let query = baseQuery
      if (input?.category) {
        query = query.eq('category', input.category)
      }
      if (input?.subtype) {
        query = query.eq('subtype', input.subtype)
      }

      const { data: contacts, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const total = contacts?.length ?? 0
      const active = contacts?.filter(c => c.status === 'active' || c.contact_status === 'active').length ?? 0
      // Decision makers count (check both is_decision_maker boolean and decision_authority enum)
      const decisionMakers = contacts?.filter(c =>
        c.is_decision_maker === true || c.decision_authority === 'decision_maker'
      ).length ?? 0

      // Category counts
      const byCategory = {
        person: contacts?.filter(c => c.category === 'person').length ?? 0,
        company: contacts?.filter(c => c.category === 'company').length ?? 0,
      }

      // Person subtype counts
      const personSubtypes = {
        person_prospect: contacts?.filter(c => c.subtype === 'person_prospect').length ?? 0,
        person_lead: contacts?.filter(c => c.subtype === 'person_lead').length ?? 0,
        person_candidate: contacts?.filter(c => c.subtype === 'person_candidate').length ?? 0,
        person_bench_internal: contacts?.filter(c => c.subtype === 'person_bench_internal').length ?? 0,
        person_bench_vendor: contacts?.filter(c => c.subtype === 'person_bench_vendor').length ?? 0,
        person_placed: contacts?.filter(c => c.subtype === 'person_placed').length ?? 0,
        person_client_contact: contacts?.filter(c => c.subtype === 'person_client_contact').length ?? 0,
        person_hiring_manager: contacts?.filter(c => c.subtype === 'person_hiring_manager').length ?? 0,
        person_hr_contact: contacts?.filter(c => c.subtype === 'person_hr_contact').length ?? 0,
        person_vendor_contact: contacts?.filter(c => c.subtype === 'person_vendor_contact').length ?? 0,
        person_employee: contacts?.filter(c => c.subtype === 'person_employee').length ?? 0,
        person_referral_source: contacts?.filter(c => c.subtype === 'person_referral_source').length ?? 0,
        person_alumni: contacts?.filter(c => c.subtype === 'person_alumni').length ?? 0,
      }

      // Company subtype counts
      const companySubtypes = {
        company_prospect: contacts?.filter(c => c.subtype === 'company_prospect').length ?? 0,
        company_lead: contacts?.filter(c => c.subtype === 'company_lead').length ?? 0,
        company_client: contacts?.filter(c => c.subtype === 'company_client').length ?? 0,
        company_vendor: contacts?.filter(c => c.subtype === 'company_vendor').length ?? 0,
        company_msp: contacts?.filter(c => c.subtype === 'company_msp').length ?? 0,
        company_vms: contacts?.filter(c => c.subtype === 'company_vms').length ?? 0,
        company_end_client: contacts?.filter(c => c.subtype === 'company_end_client').length ?? 0,
        company_agency: contacts?.filter(c => c.subtype === 'company_agency').length ?? 0,
        company_institution: contacts?.filter(c => c.subtype === 'company_institution').length ?? 0,
      }

      // Candidate-specific stats (person_candidate)
      const candidateContacts = contacts?.filter(c => c.subtype === 'person_candidate') ?? []
      const candidateStats = {
        total: candidateContacts.length,
        active: candidateContacts.filter(c => c.candidate_status === 'active').length,
        bench: candidateContacts.filter(c => c.candidate_status === 'bench').length,
        placed: candidateContacts.filter(c => c.candidate_status === 'placed').length,
        onHotlist: candidateContacts.filter(c => c.candidate_is_on_hotlist).length,
      }

      // Lead-specific stats (person_lead + company_lead)
      const leadContacts = contacts?.filter(c => c.subtype === 'person_lead' || c.subtype === 'company_lead') ?? []
      const leadStats = {
        total: leadContacts.length,
        personLeads: contacts?.filter(c => c.subtype === 'person_lead').length ?? 0,
        companyLeads: contacts?.filter(c => c.subtype === 'company_lead').length ?? 0,
        new: leadContacts.filter(c => c.lead_status === 'new').length,
        qualified: leadContacts.filter(c => c.lead_status === 'qualified').length,
        converted: leadContacts.filter(c => c.lead_status === 'converted').length,
        hot: leadContacts.filter(c => (c.lead_score ?? 0) >= 70).length,
      }

      // Client stats (company_client)
      const clientContacts = contacts?.filter(c => c.subtype === 'company_client') ?? []
      const clientStats = {
        total: clientContacts.length,
        active: clientContacts.filter(c => c.client_status === 'active').length,
        dormant: clientContacts.filter(c => c.client_status === 'dormant').length,
        enterprise: clientContacts.filter(c => c.client_tier === 'enterprise').length,
        strategic: clientContacts.filter(c => c.client_tier === 'strategic').length,
      }

      // Vendor stats (company_vendor)
      const vendorContacts = contacts?.filter(c => c.subtype === 'company_vendor') ?? []
      const vendorStats = {
        total: vendorContacts.length,
        approved: vendorContacts.filter(c => c.vendor_status === 'approved').length,
        preferred: vendorContacts.filter(c => c.vendor_status === 'preferred').length,
        pending: vendorContacts.filter(c => c.vendor_status === 'pending').length,
      }

      // Recently contacted (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentlyContacted = contacts?.filter(c =>
        c.last_contacted_at && new Date(c.last_contacted_at) >= thirtyDaysAgo
      ).length ?? 0

      return {
        total,
        active,
        decisionMakers,
        recentlyContacted,
        byCategory,
        personSubtypes,
        companySubtypes,
        candidateStats,
        leadStats,
        clientStats,
        vendorStats,
      }
    }),

  // ============================================
  // CREATE CONTACT (Category and Subtype-aware)
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      // Core fields (required for all subtypes)
      subtype: ContactSubtype,
      // firstName required for persons, companyName required for companies
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      middleName: z.string().optional(),
      suffix: z.string().optional(),
      preferredName: z.string().optional(),
      pronouns: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      title: z.string().optional(),
      linkedinUrl: z.string().url().optional().or(z.literal('')),
      companyName: z.string().optional(), // For persons: current company name, For companies: the company name

      // Company-specific core fields
      companyNameLegal: z.string().optional(),
      companyDbaName: z.string().optional(),
      companyType: z.enum(['corporation', 'llc', 'partnership', 'sole_prop', 'nonprofit']).optional(),
      companyStructure: z.enum(['public', 'private', 'subsidiary', 'franchise']).optional(),
      websiteUrl: z.string().url().optional().or(z.literal('')),
      logoUrl: z.string().url().optional().or(z.literal('')),
      companyDescription: z.string().optional(),
      employeeCount: z.number().optional(),
      annualRevenue: z.number().optional(),
      foundedYear: z.number().optional(),

      // Relationships
      accountId: z.string().uuid().optional(),
      vendorId: z.string().uuid().optional(),
      ownerId: z.string().uuid().optional(),
      currentCompanyId: z.string().uuid().optional(), // For person contacts - links to company contact
      parentCompanyId: z.string().uuid().optional(), // For company contacts - parent company

      // Common fields
      timezone: z.string().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'linkedin', 'text', 'video_call']).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      contactStatus: z.string().optional(), // New enterprise status field

      // Candidate-specific fields (person_candidate)
      candidateStatus: CandidateStatus.optional(),
      candidateSkills: z.array(z.string()).optional(),
      candidateExperienceYears: z.number().optional(),
      candidateCurrentVisa: z.string().optional(),
      candidateHourlyRate: z.number().optional(),
      candidateAvailability: z.enum(['immediate', '2_weeks', '1_month', '2_months', '3_months', 'not_available']).optional(),
      candidateWillingToRelocate: z.boolean().optional(),
      candidateResumeUrl: z.string().optional(),
      candidateRemotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),

      // Lead-specific fields (person_lead, company_lead)
      leadStatus: LeadStatus.optional(),
      leadScore: z.number().min(0).max(100).optional(),
      leadSource: z.string().optional(),
      leadEstimatedValue: z.number().optional(),
      leadBantBudget: z.number().min(0).max(25).optional(),
      leadBantAuthority: z.number().min(0).max(25).optional(),
      leadBantNeed: z.number().min(0).max(25).optional(),
      leadBantTimeline: z.number().min(0).max(25).optional(),

      // Client contact fields (person_client_contact, person_hiring_manager, person_hr_contact)
      clientContactCompanyId: z.string().uuid().optional(),
      clientContactRole: z.string().optional(),
      clientContactDecisionAuthority: z.boolean().optional(),
      clientContactBudgetAuthority: z.boolean().optional(),

      // Vendor contact fields (person_vendor_contact)
      vendorContactCompanyId: z.string().uuid().optional(),
      vendorContactRole: z.string().optional(),

      // Client company fields (company_client)
      clientStatus: z.enum(['active', 'dormant', 'former', 'blacklisted']).optional(),
      clientTier: z.enum(['enterprise', 'strategic', 'growth', 'standard', 'startup']).optional(),
      clientPaymentTerms: z.number().optional(),
      clientDefaultMarkup: z.number().optional(),

      // Vendor company fields (company_vendor)
      vendorStatus: z.enum(['pending', 'approved', 'preferred', 'suspended', 'blacklisted']).optional(),
      vendorTier: z.enum(['preferred', 'approved', 'probationary', 'new']).optional(),
      vendorPaymentTerms: z.number().optional(),
      vendorSpecialtyAreas: z.array(z.string()).optional(),

      // Bench fields (person_bench_internal, person_bench_vendor)
      benchType: z.enum(['w2_internal', 'w2_vendor', '1099', 'c2c']).optional(),
      benchStatus: z.string().optional(),
      benchVendorId: z.string().uuid().optional(),
      benchBillRate: z.number().optional(),
      benchPayRate: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Derive category from subtype
      const category = getCategoryFromSubtype(input.subtype)

      // Validate required fields based on category
      if (category === 'person' && !input.firstName) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'firstName is required for person contacts' })
      }
      if (category === 'company' && !input.companyName && !input.companyNameLegal) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'companyName or companyNameLegal is required for company contacts' })
      }

      // Get the user_profile.id for the current user (needed for FK constraints)
      // The auth user.id is from auth.users, but owner_id references user_profiles.id
      let userProfileId: string | null = null
      if (user?.id && !input.ownerId) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Build insert data based on category and subtype
      const insertData: Record<string, unknown> = {
        org_id: orgId,
        category,
        subtype: input.subtype,
        email: input.email || null,
        phone: input.phone,
        mobile: input.mobile,
        linkedin_url: input.linkedinUrl || null,
        linked_company_id: input.accountId,
        vendor_id: input.vendorId,
        owner_id: input.ownerId || userProfileId,
        timezone: input.timezone || 'America/New_York',
        preferred_contact_method: input.preferredContactMethod || 'email',
        notes: input.notes,
        tags: input.tags,
        status: 'active',
        contact_status: input.contactStatus || 'active',
        created_by: user?.id,
      }

      // Person-specific core fields
      if (category === 'person') {
        insertData.first_name = input.firstName
        insertData.last_name = input.lastName || ''
        insertData.middle_name = input.middleName
        insertData.suffix = input.suffix
        insertData.preferred_name = input.preferredName
        insertData.pronouns = input.pronouns
        insertData.title = input.title
        insertData.company_name = input.companyName
        insertData.current_company_id = input.currentCompanyId
      }

      // Company-specific core fields
      if (category === 'company') {
        // For companies, use company_name as the primary identifier
        insertData.company_name = input.companyName || input.companyNameLegal
        insertData.company_name_legal = input.companyNameLegal
        insertData.company_dba_name = input.companyDbaName
        insertData.company_type = input.companyType
        insertData.company_structure = input.companyStructure
        insertData.website_url = input.websiteUrl || null
        insertData.logo_url = input.logoUrl || null
        insertData.company_description = input.companyDescription
        insertData.employee_count = input.employeeCount
        insertData.annual_revenue = input.annualRevenue
        insertData.founded_year = input.foundedYear
        insertData.parent_company_id = input.parentCompanyId
      }

      // Candidate-specific fields (person_candidate)
      if (input.subtype === 'person_candidate') {
        insertData.candidate_status = input.candidateStatus || 'active'
        insertData.candidate_skills = input.candidateSkills
        insertData.candidate_experience_years = input.candidateExperienceYears
        insertData.candidate_current_visa = input.candidateCurrentVisa
        insertData.candidate_hourly_rate = input.candidateHourlyRate
        insertData.candidate_availability = input.candidateAvailability
        insertData.candidate_willing_to_relocate = input.candidateWillingToRelocate
        insertData.candidate_resume_url = input.candidateResumeUrl
        insertData.candidate_remote_preference = input.candidateRemotePreference
      }

      // Lead-specific fields (person_lead, company_lead)
      if (input.subtype === 'person_lead' || input.subtype === 'company_lead') {
        insertData.lead_status = input.leadStatus || 'new'
        insertData.lead_score = input.leadScore
        insertData.lead_source = input.leadSource
        insertData.lead_estimated_value = input.leadEstimatedValue
        insertData.lead_bant_budget = input.leadBantBudget
        insertData.lead_bant_authority = input.leadBantAuthority
        insertData.lead_bant_need = input.leadBantNeed
        insertData.lead_bant_timeline = input.leadBantTimeline
      }

      // Client contact fields (person_client_contact, person_hiring_manager, person_hr_contact)
      if (['person_client_contact', 'person_hiring_manager', 'person_hr_contact'].includes(input.subtype)) {
        insertData.client_contact_company_id = input.clientContactCompanyId
        insertData.client_contact_role = input.clientContactRole
        insertData.client_contact_decision_authority = input.clientContactDecisionAuthority
        insertData.client_contact_budget_authority = input.clientContactBudgetAuthority
      }

      // Vendor contact fields (person_vendor_contact)
      if (input.subtype === 'person_vendor_contact') {
        insertData.vendor_contact_company_id = input.vendorContactCompanyId
        insertData.vendor_contact_role = input.vendorContactRole
      }

      // Client company fields (company_client)
      if (input.subtype === 'company_client') {
        insertData.client_status = input.clientStatus || 'active'
        insertData.client_tier = input.clientTier
        insertData.client_payment_terms = input.clientPaymentTerms
        insertData.client_default_markup = input.clientDefaultMarkup
      }

      // Vendor company fields (company_vendor)
      if (input.subtype === 'company_vendor') {
        insertData.vendor_status = input.vendorStatus || 'pending'
        insertData.vendor_tier = input.vendorTier
        insertData.vendor_payment_terms = input.vendorPaymentTerms
        insertData.vendor_specialty_areas = input.vendorSpecialtyAreas
      }

      // Bench fields (person_bench_internal, person_bench_vendor)
      if (input.subtype === 'person_bench_internal' || input.subtype === 'person_bench_vendor') {
        insertData.bench_type = input.benchType
        insertData.bench_status = input.benchStatus || 'available'
        insertData.bench_vendor_id = input.benchVendorId
        insertData.bench_bill_rate = input.benchBillRate
        insertData.bench_pay_rate = input.benchPayRate
      }

      const { data, error } = await adminClient
        .from('contacts')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // HISTORY: Record contact added to account (if linked to an account)
      if (input.accountId && data) {
        const contactName = category === 'person'
          ? [input.firstName, input.lastName].filter(Boolean).join(' ')
          : input.companyName || 'Contact'

        void historyService.recordRelatedObjectAdded(
          'account',
          input.accountId,
          { type: 'contact', id: data.id, label: contactName },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record contact added:', err))
      }

      return data
    }),

  // ============================================
  // UPDATE CONTACT (Subtype-aware)
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      // Core fields
      firstName: z.string().min(1).optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      title: z.string().optional(),
      linkedinUrl: z.string().url().optional().or(z.literal('')),
      companyName: z.string().optional(),
      status: z.enum(['active', 'inactive', 'do_not_contact']).optional(),
      ownerId: z.string().uuid().nullish(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
      
      // Candidate-specific fields
      candidateStatus: CandidateStatus.optional(),
      candidateSkills: z.array(z.string()).optional(),
      candidateExperienceYears: z.number().optional(),
      candidateCurrentVisa: z.string().optional(),
      candidateHourlyRate: z.number().optional(),
      candidateAvailability: z.enum(['immediate', '2_weeks', '1_month', '2_months', '3_months', 'not_available']).optional(),
      candidateWillingToRelocate: z.boolean().optional(),
      candidateResumeUrl: z.string().optional(),
      candidateIsOnHotlist: z.boolean().optional(),

      // Lead-specific fields
      leadStatus: LeadStatus.optional(),
      leadScore: z.number().min(0).max(100).optional(),
      leadSource: z.string().optional(),
      leadEstimatedValue: z.number().optional(),
      leadBantBudget: z.number().min(0).max(25).optional(),
      leadBantAuthority: z.number().min(0).max(25).optional(),
      leadBantNeed: z.number().min(0).max(25).optional(),
      leadBantTimeline: z.number().min(0).max(25).optional(),
      leadQualificationResult: z.enum(['qualified_convert', 'qualified_nurture', 'not_qualified']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Build update data
      const updateData: Record<string, unknown> = { 
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }

      // Core fields
      if (input.firstName !== undefined) updateData.first_name = input.firstName
      if (input.lastName !== undefined) updateData.last_name = input.lastName
      if (input.email !== undefined) updateData.email = input.email || null
      if (input.phone !== undefined) updateData.phone = input.phone
      if (input.mobile !== undefined) updateData.mobile = input.mobile
      if (input.title !== undefined) updateData.title = input.title
      if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl || null
      if (input.companyName !== undefined) updateData.company_name = input.companyName
      if (input.status !== undefined) updateData.status = input.status
      if (input.ownerId !== undefined) updateData.owner_id = input.ownerId
      if (input.tags !== undefined) updateData.tags = input.tags
      if (input.notes !== undefined) updateData.notes = input.notes

      // Candidate-specific fields
      if (input.candidateStatus !== undefined) updateData.candidate_status = input.candidateStatus
      if (input.candidateSkills !== undefined) updateData.candidate_skills = input.candidateSkills
      if (input.candidateExperienceYears !== undefined) updateData.candidate_experience_years = input.candidateExperienceYears
      if (input.candidateCurrentVisa !== undefined) updateData.candidate_current_visa = input.candidateCurrentVisa
      if (input.candidateHourlyRate !== undefined) updateData.candidate_hourly_rate = input.candidateHourlyRate
      if (input.candidateAvailability !== undefined) updateData.candidate_availability = input.candidateAvailability
      if (input.candidateWillingToRelocate !== undefined) updateData.candidate_willing_to_relocate = input.candidateWillingToRelocate
      if (input.candidateResumeUrl !== undefined) updateData.candidate_resume_url = input.candidateResumeUrl
      if (input.candidateIsOnHotlist !== undefined) {
        updateData.candidate_is_on_hotlist = input.candidateIsOnHotlist
        if (input.candidateIsOnHotlist) {
          updateData.candidate_hotlist_added_at = new Date().toISOString()
        }
      }

      // Lead-specific fields
      if (input.leadStatus !== undefined) updateData.lead_status = input.leadStatus
      if (input.leadScore !== undefined) updateData.lead_score = input.leadScore
      if (input.leadSource !== undefined) updateData.lead_source = input.leadSource
      if (input.leadEstimatedValue !== undefined) updateData.lead_estimated_value = input.leadEstimatedValue
      if (input.leadBantBudget !== undefined) updateData.lead_bant_budget = input.leadBantBudget
      if (input.leadBantAuthority !== undefined) updateData.lead_bant_authority = input.leadBantAuthority
      if (input.leadBantNeed !== undefined) updateData.lead_bant_need = input.leadBantNeed
      if (input.leadBantTimeline !== undefined) updateData.lead_bant_timeline = input.leadBantTimeline
      if (input.leadQualificationResult !== undefined) {
        updateData.lead_qualification_result = input.leadQualificationResult
        updateData.lead_qualified_at = new Date().toISOString()
        updateData.lead_qualified_by = user?.id
      }

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

  // ============================================
  // CONVERT SUBTYPE (e.g., Prospect -> Lead)
  // ============================================
  convertSubtype: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      toSubtype: ContactSubtype,
      // Additional data for the new subtype
      leadStatus: LeadStatus.optional(),
      leadScore: z.number().min(0).max(100).optional(),
      leadSource: z.string().optional(),
      candidateStatus: CandidateStatus.optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current contact
      const { data: contact, error: fetchError } = await adminClient
        .from('contacts')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !contact) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' })
      }

      const updateData: Record<string, unknown> = {
        subtype: input.toSubtype,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }

      // Set conversion tracking
      if (contact.subtype === 'person_prospect' && input.toSubtype === 'person_lead') {
        updateData.prospect_converted_to_lead_at = new Date().toISOString()
        updateData.lead_status = input.leadStatus || 'new'
        updateData.lead_score = input.leadScore
        updateData.lead_source = input.leadSource || contact.source
      }

      if (input.toSubtype === 'person_lead') {
        updateData.lead_status = input.leadStatus || 'new'
      }

      if (input.toSubtype === 'person_candidate') {
        updateData.candidate_status = input.candidateStatus || 'active'
      }

      if (input.notes) {
        updateData.notes = contact.notes 
          ? `${contact.notes}\n\n---\nConverted from ${contact.subtype} to ${input.toSubtype}: ${input.notes}`
          : `Converted from ${contact.subtype} to ${input.toSubtype}: ${input.notes}`
      }

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

      // Log activity for conversion
      await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: 'contact',
          entity_id: input.id,
          activity_type: 'status_change',
          subject: `Converted to ${input.toSubtype}`,
          description: `Contact converted from ${contact.subtype} to ${input.toSubtype}`,
          created_by: user?.id,
        })

      return data
    }),

  // ============================================
  // CANDIDATE-SPECIFIC OPERATIONS
  // ============================================
  candidates: router({
    // List candidates (shortcut for list with subtype=candidate)
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: CandidateStatus.optional(),
        skills: z.array(z.string()).optional(),
        onHotlist: z.boolean().optional(),
        availability: z.enum(['immediate', '2_weeks', '1_month', '2_months', '3_months', 'not_available']).optional(),
        minExperience: z.number().optional(),
        maxExperience: z.number().optional(),
        visaType: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        sortBy: z.enum(['name', 'candidate_status', 'candidate_experience_years', 'candidate_hourly_rate', 'created_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('subtype', 'person_candidate')
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
        }

        if (input.status) {
          query = query.eq('candidate_status', input.status)
        }

        if (input.skills && input.skills.length > 0) {
          query = query.contains('candidate_skills', input.skills)
        }

        if (input.onHotlist === true) {
          query = query.eq('candidate_is_on_hotlist', true)
        }

        if (input.availability) {
          query = query.eq('candidate_availability', input.availability)
        }

        if (input.minExperience !== undefined) {
          query = query.gte('candidate_experience_years', input.minExperience)
        }

        if (input.maxExperience !== undefined) {
          query = query.lte('candidate_experience_years', input.maxExperience)
        }

        if (input.visaType) {
          query = query.eq('candidate_current_visa', input.visaType)
        }

        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }

        const sortColumn = input.sortBy === 'name' ? 'first_name' : input.sortBy
        query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' })
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

    // Add to hotlist
    addToHotlist: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .update({
            candidate_is_on_hotlist: true,
            candidate_hotlist_added_at: new Date().toISOString(),
            candidate_hotlist_notes: input.notes,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_candidate')
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Remove from hotlist
    removeFromHotlist: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .update({
            candidate_is_on_hotlist: false,
            candidate_hotlist_added_at: null,
            candidate_hotlist_notes: null,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_candidate')
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Stats for candidates
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: candidates, error } = await adminClient
          .from('contacts')
          .select('id, candidate_status, candidate_is_on_hotlist, candidate_availability')
          .eq('org_id', orgId)
          .eq('subtype', 'person_candidate')
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          total: candidates?.length ?? 0,
          active: candidates?.filter(c => c.candidate_status === 'active').length ?? 0,
          passive: candidates?.filter(c => c.candidate_status === 'passive').length ?? 0,
          bench: candidates?.filter(c => c.candidate_status === 'bench').length ?? 0,
          placed: candidates?.filter(c => c.candidate_status === 'placed').length ?? 0,
          onHotlist: candidates?.filter(c => c.candidate_is_on_hotlist).length ?? 0,
          availableNow: candidates?.filter(c => c.candidate_availability === 'immediate').length ?? 0,
        }
      }),
  }),

  // ============================================
  // LEAD-SPECIFIC OPERATIONS
  // ============================================
  leads: router({
    // List leads
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: LeadStatus.optional(),
        minScore: z.number().min(0).max(100).optional(),
        accountId: z.string().uuid().optional(),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        sortBy: z.enum(['name', 'lead_status', 'lead_score', 'lead_estimated_value', 'created_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Note: company_name is stored directly on contacts, no join needed
        // The company_id FK references accounts table, not companies
        let query = adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%,company_name.ilike.%${input.search}%`)
        }

        if (input.status) {
          query = query.eq('lead_status', input.status)
        }

        if (input.minScore !== undefined) {
          query = query.gte('lead_score', input.minScore)
        }

        if (input.accountId) {
          query = query.eq('account_id', input.accountId)
        }

        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }

        const sortColumn = input.sortBy === 'name' ? 'first_name' : input.sortBy
        query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' })
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

    // Qualify lead
    qualify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        result: z.enum(['qualified_convert', 'qualified_nurture', 'not_qualified']),
        notes: z.string().optional(),
        dealId: z.string().uuid().optional(), // If converting to deal
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          lead_qualification_result: input.result,
          lead_qualification_notes: input.notes,
          lead_qualified_at: new Date().toISOString(),
          lead_qualified_by: user?.id,
          updated_by: user?.id,
        }

        if (input.result === 'qualified_convert') {
          updateData.lead_status = 'converted'
          if (input.dealId) {
            updateData.lead_converted_to_deal_id = input.dealId
            updateData.lead_converted_at = new Date().toISOString()
          }
        } else if (input.result === 'qualified_nurture') {
          updateData.lead_status = 'nurture'
        } else {
          updateData.lead_status = 'unqualified'
        }

        const { data, error } = await adminClient
          .from('contacts')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Stats for leads
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: leads, error } = await adminClient
          .from('contacts')
          .select('id, lead_status, lead_score, lead_estimated_value, created_at')
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const total = leads?.length ?? 0
        const totalValue = leads?.reduce((sum, l) => sum + (l.lead_estimated_value ?? 0), 0) ?? 0
        const converted = leads?.filter(l => l.lead_status === 'converted').length ?? 0
        const qualified = leads?.filter(l => l.lead_status === 'qualified').length ?? 0

        // Calculate new this week (created in last 7 days)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const newThisWeek = leads?.filter(l =>
          l.created_at && new Date(l.created_at) >= oneWeekAgo
        ).length ?? 0

        // Calculate conversion rate (converted / total that could convert)
        const conversionRate = total > 0 ? (converted / total) * 100 : 0

        return {
          total,
          new: newThisWeek, // Now means "new this week" for UI display
          contacted: leads?.filter(l => l.lead_status === 'contacted').length ?? 0,
          qualified,
          converted,
          conversionRate,
          hot: leads?.filter(l => (l.lead_score ?? 0) >= 70).length ?? 0,
          warm: leads?.filter(l => (l.lead_score ?? 0) >= 40 && (l.lead_score ?? 0) < 70).length ?? 0,
          cold: leads?.filter(l => (l.lead_score ?? 0) < 40).length ?? 0,
          totalPipelineValue: totalValue,
        }
      }),

    // Link leads to a campaign
    linkToCampaign: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        leadIds: z.array(z.string().uuid()).min(1).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify the campaign exists and belongs to the org
        const { data: campaign, error: campaignError } = await adminClient
          .from('campaigns')
          .select('id, name')
          .eq('id', input.campaignId)
          .eq('org_id', orgId)
          .single()

        if (campaignError || !campaign) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
        }

        // Update leads to link them to the campaign via source_campaign_id
        const { data, error } = await adminClient
          .from('contacts')
          .update({
            source_campaign_id: input.campaignId,
            updated_by: user?.id,
          })
          .in('id', input.leadIds)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .is('deleted_at', null)
          .select('id, first_name, last_name, email, company_name')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const linkedCount = data?.length || 0

        // Log activity for the campaign
        if (linkedCount > 0) {
          await adminClient
            .from('activities')
            .insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: input.campaignId,
              activity_type: 'note',
              subject: 'Leads Linked',
              description: `${linkedCount} ${linkedCount === 1 ? 'lead' : 'leads'} linked to campaign`,
              created_by: user?.id,
            })
        }

        return { linked: linkedCount, leads: data }
      }),

    // List leads available for linking (not already linked to a campaign)
    listAvailableForCampaign: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select('id, first_name, last_name, email, company_name, lead_status, lead_score, created_at')
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .is('source_campaign_id', null)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.search) {
          query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%,company_name.ilike.%${input.search}%`)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data || []
      }),

    // List leads by campaign
    listByCampaign: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        status: LeadStatus.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .eq('source_campaign_id', input.campaignId)
          .is('deleted_at', null)

        if (input.status) {
          query = query.eq('lead_status', input.status)
        }

        query = query
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Convert lead to deal
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
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get lead contact data
        const { data: lead, error: leadError } = await adminClient
          .from('contacts')
          .select('*')
          .eq('id', input.leadId)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .single()

        if (leadError || !lead) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' })
        }

        // Check if lead is already converted
        if (lead.lead_converted_to_deal_id) {
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
            contact_id: input.leadId, // Link deal to contact
            name: input.dealName,
            title: input.dealName,
            deal_type: input.dealType,
            value: input.dealValue,
            value_basis: input.valueBasis,
            probability: input.winProbability,
            stage: 'discovery',
            expected_close_date: input.expectedCloseDate,
            estimated_placements: input.estimatedPlacements,
            avg_bill_rate: input.avgBillRate,
            contract_length_months: input.contractLengthMonths,
            hiring_needs: input.hiringNeeds,
            notes: input.notes,
            owner_id: lead.owner_id || user?.id,
            created_by: user?.id,
          })
          .select('*, owner:user_profiles!owner_id(id, full_name)')
          .single()

        if (dealError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dealError.message })
        }

        // Update lead contact status to converted
        await adminClient
          .from('contacts')
          .update({
            lead_status: 'converted',
            lead_converted_to_deal_id: deal.id,
            lead_converted_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', input.leadId)
          .eq('org_id', orgId)

        // Log activity on lead
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'contact',
            entity_id: input.leadId,
            activity_type: 'status_change',
            subject: 'Lead Converted to Deal',
            description: `Lead converted to deal: ${input.dealName} ($${input.dealValue.toLocaleString()})`,
            created_by: user?.id,
          })

        // Log activity on deal
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: deal.id,
            activity_type: 'note',
            subject: 'Deal Created',
            description: `Deal created from lead: ${lead.first_name} ${lead.last_name}`,
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

        return deal
      }),

    // Disqualify lead
    disqualify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.enum(['no_budget', 'no_authority', 'no_need', 'bad_timing', 'competitor', 'not_responsive', 'other']),
        notes: z.string().optional(),
        reengageDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .update({
            lead_status: 'unqualified',
            lead_lost_reason: input.reason,
            lead_qualification_result: 'not_qualified',
            lead_qualification_notes: input.notes,
            lead_qualified_at: new Date().toISOString(),
            lead_qualified_by: user?.id,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .select('*, owner:user_profiles!owner_id(id, full_name)')
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
            entity_id: input.id,
            activity_type: 'status_change',
            subject: 'Lead Disqualified',
            description: `Lead disqualified. Reason: ${input.reason}${input.notes ? `. ${input.notes}` : ''}`,
            created_by: user?.id,
          })

        // Create re-engagement task if date provided
        if (input.reengageDate) {
          await adminClient
            .from('tasks')
            .insert({
              org_id: orgId,
              title: 'Re-engage lead',
              description: `Follow up with disqualified lead. Original reason: ${input.reason}`,
              task_type: 'follow_up',
              status: 'pending',
              priority: 'low',
              due_date: input.reengageDate,
              assignee_id: data.owner_id || user?.id,
              entity_type: 'contact',
              entity_id: input.id,
              created_by: user?.id,
            })
        }

        return data
      }),

    // Get lead by ID with related data
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Note: company_name is stored directly on contacts
        // contacts.company_id references accounts table (legacy), not companies
        const { data, error } = await adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url, email)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' })
        }

        // Get lead activities
        const { data: activities } = await adminClient
          .from('activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('entity_type', 'contact')
          .eq('entity_id', input.id)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(10)

        return {
          ...data,
          activities: activities ?? [],
        }
      }),

    // Create new lead
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
        source: z.enum(['linkedin', 'referral', 'cold_outreach', 'inbound', 'event', 'website', 'campaign', 'other']),
        sourceDetails: z.string().optional(),
        // Campaign association
        campaignId: z.string().uuid().optional(),
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
            .from('contacts')
            .select('id, company_name, lead_status')
            .eq('org_id', orgId)
            .eq('email', input.email)
            .eq('subtype', 'person_lead')
            .is('deleted_at', null)
            .single()

          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `A lead with this email already exists: ${existing.company_name || 'Unknown'} (${existing.lead_status})`,
            })
          }
        }

        const { data, error } = await adminClient
          .from('contacts')
          .insert({
            org_id: orgId,
            category: 'person',
            subtype: input.leadType === 'company' ? 'company_lead' : 'person_lead',
            company_name: input.companyName,
            industry: input.industry,
            first_name: input.firstName,
            last_name: input.lastName,
            title: input.title,
            email: input.email || null,
            phone: input.phone,
            linkedin_url: input.linkedinUrl || null,
            website: input.website || null,
            // Lead-specific fields
            lead_status: 'new',
            lead_source: input.source,
            lead_estimated_value: input.estimatedValue,
            source_campaign_id: input.campaignId || null,
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
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'contact',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Lead Created',
            description: `New lead created from ${input.source}${input.sourceDetails ? `: ${input.sourceDetails}` : ''}`,
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
        ownerId: z.string().uuid().optional(),
        campaignId: z.string().uuid().nullable().optional(),
        // BANT fields
        bantBudget: z.number().min(0).max(25).optional(),
        bantAuthority: z.number().min(0).max(25).optional(),
        bantNeed: z.number().min(0).max(25).optional(),
        bantTimeline: z.number().min(0).max(25).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_by: user?.id,
        }

        if (input.companyName !== undefined) updateData.company_name = input.companyName
        if (input.industry !== undefined) updateData.industry = input.industry
        if (input.website !== undefined) updateData.website = input.website || null
        if (input.firstName !== undefined) updateData.first_name = input.firstName
        if (input.lastName !== undefined) updateData.last_name = input.lastName
        if (input.title !== undefined) updateData.title = input.title
        if (input.email !== undefined) updateData.email = input.email || null
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl || null
        if (input.status !== undefined) updateData.lead_status = input.status
        if (input.estimatedValue !== undefined) updateData.lead_estimated_value = input.estimatedValue
        if (input.ownerId !== undefined) updateData.owner_id = input.ownerId
        if (input.campaignId !== undefined) updateData.source_campaign_id = input.campaignId
        // BANT fields
        if (input.bantBudget !== undefined) updateData.lead_bant_budget = input.bantBudget
        if (input.bantAuthority !== undefined) updateData.lead_bant_authority = input.bantAuthority
        if (input.bantNeed !== undefined) updateData.lead_bant_need = input.bantNeed
        if (input.bantTimeline !== undefined) updateData.lead_bant_timeline = input.bantTimeline
        // Calculate total score if any BANT field updated
        if (input.bantBudget !== undefined || input.bantAuthority !== undefined ||
            input.bantNeed !== undefined || input.bantTimeline !== undefined) {
          // Get current values first
          const { data: current } = await adminClient
            .from('contacts')
            .select('lead_bant_budget, lead_bant_authority, lead_bant_need, lead_bant_timeline')
            .eq('id', input.id)
            .single()

          const budget = input.bantBudget ?? current?.lead_bant_budget ?? 0
          const authority = input.bantAuthority ?? current?.lead_bant_authority ?? 0
          const need = input.bantNeed ?? current?.lead_bant_need ?? 0
          const timeline = input.bantTimeline ?? current?.lead_bant_timeline ?? 0
          updateData.lead_bant_total_score = budget + authority + need + timeline
        }

        const { data, error } = await adminClient
          .from('contacts')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .eq('subtype', 'person_lead')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),
  }),

  // ============================================
  // BENCH CONSULTANTS SUB-ROUTER
  // Uses contacts with subtype 'person_bench_internal' or 'person_bench_vendor'
  // ============================================
  bench: router({
    // List bench consultants
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        benchType: z.enum(['w2_internal', 'w2_vendor', '1099', 'c2c', 'all']).default('all'),
        benchStatus: z.enum(['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive', 'all']).default('all'),
        vendorId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        sortBy: z.enum(['bench_start_date', 'bench_status', 'bench_bill_rate', 'created_at']).default('bench_start_date'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            vendor:companies!bench_vendor_id(id, name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .in('subtype', ['person_bench_internal', 'person_bench_vendor'])
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
        }

        if (input.benchType !== 'all') {
          query = query.eq('bench_type', input.benchType)
        }

        if (input.benchStatus !== 'all') {
          query = query.eq('bench_status', input.benchStatus)
        }

        if (input.vendorId) {
          query = query.eq('bench_vendor_id', input.vendorId)
        }

        query = query
          .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get bench consultant by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url),
            vendor:companies!bench_vendor_id(id, name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('subtype', ['person_bench_internal', 'person_bench_vendor'])
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bench consultant not found' })
        }

        return data
      }),

    // Update bench consultant status
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .update({
            bench_status: input.status,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('subtype', ['person_bench_internal', 'person_bench_vendor'])
          .select()
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
            entity_id: input.id,
            activity_type: 'status_change',
            subject: 'Bench Status Updated',
            description: `Status changed to ${input.status}`,
            created_by: user?.id,
          })

        return data
      }),

    // Update bench rates
    updateRates: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        billRate: z.number().min(0).optional(),
        payRate: z.number().min(0).optional(),
        markupPercentage: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_by: user?.id,
        }

        if (input.billRate !== undefined) updateData.bench_bill_rate = input.billRate
        if (input.payRate !== undefined) updateData.bench_pay_rate = input.payRate
        if (input.markupPercentage !== undefined) updateData.bench_markup_percentage = input.markupPercentage

        const { data, error } = await adminClient
          .from('contacts')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('subtype', ['person_bench_internal', 'person_bench_vendor'])
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Stats for bench consultants
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: consultants, error } = await adminClient
          .from('contacts')
          .select('id, bench_status, bench_type, bench_bill_rate')
          .eq('org_id', orgId)
          .in('subtype', ['person_bench_internal', 'person_bench_vendor'])
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const total = consultants?.length ?? 0
        const available = consultants?.filter(c => c.bench_status === 'available').length ?? 0
        const placed = consultants?.filter(c => c.bench_status === 'placed').length ?? 0
        const utilization = total > 0 ? Math.round((placed / total) * 100) : 0

        const byType = consultants?.reduce((acc, c) => {
          const type = c.bench_type || 'unspecified'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        const avgBillRate = consultants?.length
          ? Math.round(
              consultants.reduce((sum, c) => sum + (c.bench_bill_rate || 0), 0) /
              consultants.filter(c => c.bench_bill_rate).length || 1
            )
          : 0

        return {
          total,
          available,
          placed,
          marketing: consultants?.filter(c => c.bench_status === 'marketing').length ?? 0,
          interviewing: consultants?.filter(c => c.bench_status === 'interviewing').length ?? 0,
          utilization,
          byType,
          avgBillRate,
        }
      }),

    // Create bench consultant from contact
    createFromContact: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        benchType: z.enum(['w2_internal', 'w2_vendor', '1099', 'c2c']),
        vendorId: z.string().uuid().optional(),
        billRate: z.number().min(0).optional(),
        payRate: z.number().min(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Determine subtype based on bench type
        const subtype = input.benchType === 'w2_internal' ? 'person_bench_internal' : 'person_bench_vendor'

        const { data, error } = await adminClient
          .from('contacts')
          .update({
            subtype,
            bench_type: input.benchType,
            bench_status: 'onboarding',
            bench_vendor_id: input.vendorId || null,
            bench_bill_rate: input.billRate || null,
            bench_pay_rate: input.payRate || null,
            bench_start_date: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', input.contactId)
          .eq('org_id', orgId)
          .select()
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
            entity_id: input.contactId,
            activity_type: 'note',
            subject: 'Added to Bench',
            description: `Contact added to bench as ${input.benchType}`,
            created_by: user?.id,
          })

        return data
      }),
  }),

  // ============================================
  // SOFT DELETE
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contacts')
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
})










