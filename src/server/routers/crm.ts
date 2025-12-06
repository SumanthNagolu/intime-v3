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
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), contacts(*), jobs(id, title, status)')
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
  }),

  // ============================================
  // LEADS
  // ============================================
  leads: router({
    // List leads with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost', 'all']).default('all'),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('leads')
          .select('*, owner:user_profiles!owner_id(id, full_name)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.search) {
          query = query.or(`company_name.ilike.%${input.search}%,contact_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
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
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get lead by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leads')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' })
        }

        return data
      }),
  }),

  // ============================================
  // DEALS
  // ============================================
  deals: router({
    // List deals with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        stage: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('deals')
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (input.search) {
          query = query.ilike('name', `%${input.search}%`)
        }
        if (input.stage) {
          query = query.eq('stage', input.stage)
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
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Get deal by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('deals')
          .select('*, owner:user_profiles!owner_id(id, full_name), account:accounts(id, name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        return data
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
          .select('id, first_name, last_name, title, email, phone, account:accounts(id, name)')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .limit(input.limit)

        if (input.query) {
          query = query.or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%`)
        }

        if (input.accountId) {
          query = query.eq('account_id', input.accountId)
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
          .eq('account_id', input.accountId)
          .is('deleted_at', null)
          .order('is_primary', { ascending: false })
          .order('first_name')

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),
  }),
})
